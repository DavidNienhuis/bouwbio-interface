# Validation Flow - End-to-End

## Overview

The Bouwbio validation system processes building product PDFs through AI analysis to verify BREEAM HEA02 compliance. This document traces the complete flow from user input to result display.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE (Validatie.tsx)                │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    ┌────▼────┐          ┌────▼────┐         ┌────▼────┐
    │ Step 1  │          │ Step 2  │         │ Step 3  │
    │  Cert   │──────────▶ Product │─────────▶ Product │
    │  Type   │          │  Type   │         │  Info   │
    └─────────┘          └─────────┘         └─────────┘
                                                   │
                                              ┌────▼────┐
                                              │ Step 4  │
                                              │ Upload  │
                                              │  PDFs   │
                                              └────┬────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │  handleStartAnalysis()       │
                                    │  - Check auth & credits      │
                                    │  - Create project & product  │
                                    └──────────────┬──────────────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │   executeValidation()        │
                                    └──────────────┬──────────────┘
                                                   │
                    ┌──────────────┬───────────────┼───────────────┬─────────────┐
                    │              │               │               │             │
         ┌──────────▼─────────┐    │    ┌──────────▼─────────┐    │   ┌─────────▼────────┐
         │ Upload to Storage  │    │    │  Knowledge Bank    │    │   │  Webhook Request │
         │ (storageClient.ts) │    │    │  Check & Upload    │    │   │ (webhookClient.ts)│
         └──────────┬─────────┘    │    └──────────┬─────────┘    │   └─────────┬────────┘
                    │              │               │               │             │
            ┌───────▼───────┐      │      ┌────────▼────────┐     │     ┌───────▼────────┐
            │ Supabase      │      │      │  Supabase       │     │     │   n8n Webhook  │
            │ Bronnen/      │      │      │  Bronnen/       │     │     │   AI Analysis  │
            │ {userId}/     │      │      │  knowledge_bank/│     │     │                │
            │ {session}/    │      │      │  {ean}/{cert}/  │     │     │  POST FormData │
            │ {files}       │      │      │  {files}        │     │     │  - sessionId   │
            └───────┬───────┘      │      └────────┬────────┘     │     │  - cert type   │
                    │              │               │               │     │  - product info│
                    └──────────────┴───────────────┴───────────────┘     │  - PDFs        │
                                                   │                     └───────┬────────┘
                                                   │                             │
                                                   │                  ┌──────────▼────────┐
                                                   │                  │ AI Response JSON  │
                                                   │                  │  - type detection │
                                                   │                  │  - parse data     │
                                                   │                  └──────────┬────────┘
                                                   │                             │
                    ┌──────────────┬───────────────┼─────────────────────────────┘
                    │              │               │
         ┌──────────▼─────────┐    │    ┌──────────▼──────────┐
         │  Deduct Credit     │    │    │  Save to Supabase   │
         └────────────────────┘    │    │  - validations      │
                                   │    │  - knowledge_bank   │
                                   │    └──────────┬──────────┘
                                   │               │
                                   └───────────────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │   setValidationData()        │
                                    │   setCurrentStep(5)          │
                                    └──────────────┬──────────────┘
                                                   │
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                           STEP 5: RESULTS DISPLAY                                     │
│                         (SourceFilesProvider context)                                 │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                                   │
                    ┌──────────────┬───────────────┼───────────────┬─────────────┐
                    │              │               │               │             │
         ┌──────────▼─────────┐    │    ┌──────────▼─────────┐    │   ┌─────────▼────────┐
         │ ValidationReport   │    │    │  CASResultsDisplay │    │   │ Hea02ResultDisplay│
         │ (bouwbiologisch)   │    │    │  (CAS analysis)    │    │   │ (structured HEA02)│
         └──────────┬─────────┘    │    └──────────┬─────────┘    │   └─────────┬────────┘
                    │              │               │               │             │
         ┌──────────▼─────────┐    │    ┌──────────▼─────────┐    │             │
         │VerificatieAudit    │    │    │   ResultsTable     │    │             │
         │ (audit + redlist)  │    │    │   (generic table)  │    │             │
         └────────────────────┘    │    └────────────────────┘    │             │
                                   │                               │             │
                                   └───────────────┬───────────────┘             │
                                                   │                             │
                                        ┌──────────▼─────────┐                   │
                                        │    SourceLink      │◄──────────────────┘
                                        │  - Parse citations │
                                        │  - Find PDF file   │
                                        │  - Open modal      │
                                        └──────────┬─────────┘
                                                   │
                                        ┌──────────▼─────────┐
                                        │  PDFViewerModal    │
                                        │  - Show page       │
                                        │  - Highlight text  │
                                        └────────────────────┘
```

---

## Detailed Flow

### 1. UI Input (Validatie.tsx)

**Step 1 - Certification Selection** (`src/pages/Validatie.tsx:528-566`)
- User selects BREEAM HEA02 (only active option)
- State: `selectedCertification`

**Step 2 - Product Type Selection** (`src/pages/Validatie.tsx:569-621`)
- Choose from 5 categories:
  - Binnenverf en vernissen
  - Houtachtige plaatmaterialen
  - Vloerafwerking
  - Verlaagde plafonds en tussenwanden
  - Lijmen en kitten
- State: `selectedProductType`

**Step 3 - Product Information** (`src/pages/Validatie.tsx:624-679`)
- Enter product name (required)
- Enter EAN code (optional - enables knowledge bank)
- States: `productName`, `eanCode`

**Step 4 - PDF Upload** (`src/pages/Validatie.tsx:682-728`)
- Drag-and-drop or click to upload
- Multiple PDFs accepted
- Component: `PDFUploadZone.tsx:13-67`
- State: `uploadedFiles`

**Submission Trigger** (`src/pages/Validatie.tsx:238-286`)
- "Start Analyse" button → `handleStartAnalysis()`
- Checks authentication and credits
- Creates project and product records
- Calls `executeValidation()`

---

### 2. PDF Upload to Supabase Storage

**Regular Storage Upload** (`src/lib/storageClient.ts:18-62`)
```typescript
uploadPDFsToStorage(files, userId, validationId)
├─ Bucket: "Bronnen"
├─ Path: {userId}/{validationId}/{timestamp}_{sanitizedName}
├─ Returns: StoredFile[] with publicUrl, name, size, type
└─ Called at: src/pages/Validatie.tsx:160
```

**Knowledge Bank Upload** (`src/lib/storageClient.ts:72-119`)
```typescript
uploadPDFsToKnowledgeBank(files, eanCode, certification)
├─ Only on FIRST validation for EAN+cert combo
├─ Check: checkKnowledgeBankExists() at src/pages/Validatie.tsx:166
├─ Path: knowledge_bank/{eanCode}/{certification}/{timestamp}_{file}
└─ Called at: src/pages/Validatie.tsx:170
```

**Storage Details:**
- Public URLs generated for all files
- Cache-Control: 3600 seconds
- Upsert: false (no overwrites)

---

### 3. Webhook Call - AI Validation

**Endpoint** (`src/lib/webhookClient.ts:1`)
```
https://n8n-zztf.onrender.com/webhook/c7bf5b26-e985-41f6-98e6-f271b1bd8719
```

**Request** (`src/lib/webhookClient.ts:510-588`)
```typescript
sendValidationRequest(FormData {
  sessionId: "user_{userId}" or "guest_{timestamp}"
  certification: "BREEAM_HEA02"
  productTypeId: "1" to "5"
  productTypeName: "Binnenverf en vernissen"
  productTypeDescription: Full description
  eanCode: Optional EAN
  productName: Product name
  file: Multiple PDF files
})
```

**Retry Logic** (`src/lib/webhookClient.ts:477-508`)
- Max retries: 3
- Exponential backoff: 2s, 4s, 8s
- Network failure handling

**Response Parsing** (`src/lib/webhookClient.ts:324-474`)

Detects and extracts multiple response formats:
- `bouwbiologisch_advies` - Full advisor report
- `verificatie_audit` - Audit with red list checking
- `hea02_result` - Structured HEA02 result
- `cas_results` - CAS number analysis
- `detailed_product_analysis` - Detailed analysis
- `classification` - Classification format
- `table` - Generic table format

---

### 4. Database Storage (Supabase)

**Save Validation Record** (`src/pages/Validatie.tsx:198-210`)
```typescript
Table: validations
Insert: {
  user_id: UUID
  session_id: Session identifier
  certification: "BREEAM_HEA02"
  product_type: Product type object (Json)
  file_names: Array of filenames
  source_files: StoredFile[] metadata (Json)
  result: Full AI response (Json)
  status: "completed"
  product_id: Associated product UUID
}
```

**Update Knowledge Bank** (`src/hooks/useKnowledgeBank.ts:70-93`)
```typescript
RPC: update_knowledge_bank({
  p_ean_code: EAN code
  p_product_name: Product name
  p_certification: Certification type
  p_product_type: Product type
  p_result: Validation result
  p_source_files: StoredFile[] or null
})

Upserts knowledge_bank table:
├─ Increments validation_count
├─ Stores latest_result
├─ Extracts advies scores (niveau, kleur, label)
├─ Extracts component scores (emissie, toxicologie, certificaten)
└─ Updates timestamp
```

---

### 5. Result Rendering

**SourceFilesProvider Context** (`src/pages/Validatie.tsx:432`)
- Wraps all result components
- Provides `sourceFiles[]` for citation linking

**Conditional Component Rendering:**

**Type: `bouwbiologisch_advies`** → `src/components/ValidationReport.tsx:102-297`
- Report header with ID and date
- Product identification section
- Toxicology screening table
- Emissions characteristics
- Certificates & claims table
- Conclusion badge
- Interactive source links with page numbers

**Type: `cas_results`** → `src/components/CASResultsDisplay.tsx:48-198`
- Grid of CAS chemical cards
- Color coded: red (banned/priority), yellow (watch), green (clean)
- Click to view detail modal with:
  - CAS number
  - Chemical name
  - Red List status
  - Health hazards
  - Source citation

**Type: `verificatie_audit`** → `src/components/VerificatieAuditDisplay.tsx:71-383`
- Status card with verdict
- Accordion sections:
  - Inhoudsstoffen (ingredients with red list check)
  - Certificaten (certificates)
  - Emissiewaardes (emission values)
  - Normatieve grenswaarden (normative limits)
  - Advies & aanbevelingen (advice)
  - Audit proof

**Type: `hea02_result`** → `src/components/Hea02ResultDisplay.tsx:77-383`
- Summary card with pass/fail status
- Collapsible sections:
  - Certificaten table
  - Emissiewaarden table with visual bars
  - Stoffen cards with search functionality
- Detail modals for certificates

**Type: `table`** → `src/components/ResultsTable.tsx:13-225`
- Table format:
  - Columns: Criterium, Norm, Waarde, Bewijsmateriaal, Status
  - Status badges: Voldoet, Twijfelachtig, Voldoet Niet
  - Color coded rows

---

### 6. Source Citation System

**SourceLink Component** (`src/components/SourceLink.tsx:55-166`)

**Supported Citation Formats:**
```typescript
// Object format
{ bestand: "filename.pdf", pagina: 5, citaat: "quote text" }

// String formats
"filename.pdf, pagina 5"
"filename.pdf (pagina 5)"
```

**Display Variants:**
- `text`: Inline text with icon
- `badge`: Badge button style
- `link`: Ghost button style

**Click Behavior:**
1. Parse citation → extract filename and page
2. Find stored file: `findStoredFileByName()` (`src/lib/storageClient.ts:149-163`)
3. Open `PDFViewerModal` with specific page
4. Highlight citation text if provided

**File Matching:**
- Normalizes filenames (removes timestamps, sanitizes)
- Supports exact and partial matching
- Falls back to first available file

---

## Key Data Structures

### StoredFile
```typescript
interface StoredFile {
  publicUrl: string
  name: string
  size: number
  type: string
}
```

### ValidationResponse
```typescript
interface ValidationResponse {
  type: "bouwbiologisch_advies" | "cas_results" | ...
  data: {
    // Format varies by type
    toxicologie?: ToxicologieItem[]
    emissie?: EmissieData
    certificaten?: CertificatenData
    conclusie?: string
    // ... other fields based on type
  }
}
```

### Bron (Citation)
```typescript
interface Bron {
  bestand: string
  pagina?: number
  citaat?: string
}
```

---

## Critical Integration Points

### 1. Credit System
- Location: `src/pages/Validatie.tsx:195`
- Function: `deductCredit()`
- Deducts 1 credit per validation

### 2. Knowledge Bank Optimization
- First validation for EAN: uploads to `knowledge_bank/`
- Subsequent validations: reuses cached results
- Reduces redundant AI processing

### 3. Guest vs Authenticated Flow
- **Guest**: Session-based IDs (`guest_{timestamp}`)
- **Authenticated**: Persistent user records with UUID

### 4. Multi-format Response Handling
- Webhook returns 9+ different response types
- All parsed by `extractValidationData()`
- Enables flexible AI response evolution

### 5. PDF Source Linking
- Every result component links to PDF sources
- Specific page numbers preserved
- Citations highlighted in viewer
- Enables audit trail and verification

---

## Error Handling

### Upload Failures
- Retry logic in webhook client (3 attempts)
- User-friendly error messages
- Partial upload recovery

### Webhook Timeouts
- Exponential backoff: 2s, 4s, 8s
- Network failure detection
- User notification

### Missing Data
- Graceful degradation for optional fields
- Fallback display for unknown response types
- Default values for missing citations

---

## Performance Optimizations

### Knowledge Bank Caching
- Prevents duplicate AI processing
- Keyed by: EAN + Certification
- Tracks validation count and updates

### Lazy Loading
- PDF viewer loaded on demand
- Results components conditionally rendered
- Large data sets paginated

### Public URL Caching
- Supabase storage URLs cached (3600s)
- Reduces repeated storage API calls
- Improves source link performance

---

## Testing Checklist

Before deploying validation flow changes:

- [ ] Test full flow: Steps 1-5
- [ ] Verify PDF uploads to correct Supabase paths
- [ ] Check all response types render correctly
- [ ] Validate source links open correct PDF pages
- [ ] Test guest and authenticated flows
- [ ] Verify knowledge bank caching works
- [ ] Check credit deduction
- [ ] Test error handling (network failures, invalid PDFs)
- [ ] Verify mobile responsiveness
- [ ] Check dark mode compatibility

---

## Future Enhancements

### Potential Improvements
- Batch validation support (multiple products)
- Export validation reports (PDF, Excel)
- Version history for re-validated products
- Advanced search and filtering in dashboard
- Real-time validation progress updates
- Multi-language support

### Technical Debt
- Consider migrating webhook to direct backend API
- Optimize response type detection logic
- Standardize error message formats
- Add comprehensive TypeScript types for all response formats
- Consider GraphQL for more flexible data fetching

---

This flow represents the core validation pipeline that powers the Bouwbio Interface application. Changes to any component should be carefully considered to maintain data integrity and user experience.
