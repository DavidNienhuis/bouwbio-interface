# Claude Code Instructions

This document provides guidelines for Claude Code when working in the Bouwbio Interface codebase.

## Development Workflow

### Branch Management
- **Always use a new branch per task**
- Branch naming convention: `claude/<task-description>`
- Examples: `claude/fix-validation-bug`, `claude/add-export-feature`
- Never commit directly to `main`

### Code Changes
- **Keep diffs small and focused**
  - One feature or fix per branch
  - Avoid combining refactoring with feature work
  - If a task grows, split into multiple branches
- **Never touch secrets or commit .env files**
  - `.env` should remain in `.gitignore`
  - Never commit Supabase keys, webhook URLs, or credentials
  - If configuration changes are needed, document them in commit messages

### Repository Hygiene
- **Add `.claude/` to `.gitignore`**
  - Claude's working directory should not be committed
  - Keep repository clean of tool artifacts

## Architecture-Specific Guidelines

### Before Proposing Refactors

Before suggesting architectural changes or refactors, **always map the impact** on these critical files:

1. **`src/pages/Validatie.tsx`** - Main validation flow
   - Multi-step wizard (Steps 1-5)
   - Form state management
   - Validation execution logic
   - Results rendering

2. **`src/lib/storageClient.ts`** - File storage layer
   - PDF upload to Supabase
   - Knowledge bank storage
   - File metadata handling

3. **`src/lib/webhookClient.ts`** - AI validation integration
   - Webhook request formatting
   - Response type detection
   - Retry logic

**Impact mapping checklist:**
- [ ] Will this change affect the validation workflow?
- [ ] Does it modify how PDFs are stored or retrieved?
- [ ] Will it break existing webhook integrations?
- [ ] Are there data format changes that affect Supabase schema?
- [ ] Will existing validations/results still render correctly?

### Preferred Work Order

When starting work on the codebase, prefer this order:

1. **Documentation improvements**
   - Update or create missing documentation
   - Add code comments for complex logic
   - Document API contracts and data flows

2. **Safe cleanup**
   - Remove unused imports
   - Fix linting warnings
   - Standardize formatting
   - Remove dead code (with verification)

3. **Low-risk enhancements**
   - UI polish (styling, copy improvements)
   - Add error messages or loading states
   - Improve user feedback

4. **Feature work**
   - New functionality
   - Behavioral changes

5. **Refactoring** (last resort)
   - Only when absolutely necessary
   - Must be justified by clear benefits
   - Requires thorough impact analysis

## Key Data Flows to Preserve

### Validation Flow Integrity
The validation flow in `Validatie.tsx` is mission-critical:
- Steps 1-4: User input collection
- Step 5: Results display with multiple format support

Any changes must preserve:
- Multi-step wizard navigation
- File upload handling
- Knowledge bank optimization (EAN-based caching)
- Source file linking for citations
- Multiple result format rendering

### Storage Client Contracts
The `storageClient.ts` provides two upload paths:
- Regular: `{userId}/{validationId}/{file}`
- Knowledge bank: `knowledge_bank/{ean}/{certification}/{file}`

Preserve:
- File metadata structure (`StoredFile` interface)
- Public URL generation
- File name sanitization

### Webhook Response Handling
The `webhookClient.ts` supports 9+ response types:
- `bouwbiologisch_advies`
- `verificatie_audit`
- `hea02_result`
- `cas_results`
- And more...

Any webhook changes must:
- Maintain backward compatibility
- Support all existing response formats
- Preserve retry logic and error handling

## Testing Considerations

Before committing changes:
1. Test the full validation flow (Steps 1-5)
2. Verify PDF uploads to Supabase
3. Check that results render correctly for all response types
4. Ensure source file links open PDFViewerModal correctly
5. Test both authenticated and guest flows
6. Verify knowledge bank caching works

## Common Pitfalls to Avoid

1. **Breaking the source citation system**
   - SourceLink components depend on exact file name matching
   - Don't change `StoredFile` structure without updating all consumers

2. **Webhook response format changes**
   - The AI returns multiple response formats
   - Don't assume a single format - always check `response.type`

3. **State management in Validatie.tsx**
   - Complex interdependencies between wizard steps
   - Don't introduce new state without understanding existing flow

4. **Supabase schema changes**
   - Database changes require migration scripts
   - Coordinate with backend/Supabase configuration

## Documentation

### Key Documentation Files
- `docs/VALIDATION_FLOW.md` - End-to-end validation flow diagram
- `README.md` - Project setup and overview
- This file (`CLAUDE.md`) - Claude-specific guidelines

### When Adding Features
Document:
- New API endpoints or webhook changes
- Database schema additions
- New response types from AI
- New UI components in the validation flow

## Questions?

If uncertain about a change:
1. Map the impact on Validatie.tsx, storageClient, and webhookClient
2. Document the current behavior first
3. Propose the change with clear before/after comparison
4. Highlight any breaking changes or migration needs

Remember: **Documentation and understanding first, code changes second.**
