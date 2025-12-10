const WEBHOOK_URL = 'https://n8n-zztf.onrender.com/webhook/c7bf5b26-e985-41f6-98e6-f271b1bd8719';

// BronReference type voor geciteerde bronnen met pagina en citaat
export interface BronReference {
  bestand: string;
  pagina?: number;
  citaat?: string;
}

// Bron kan string of object zijn (backward compatible)
export type Bron = string | BronReference;

export interface CriteriaData {
  criterium: string;
  status: string;
  evidence: string;
  norm: string;
  waarde: string | null;
}

export interface ClassificationData {
  classification: string;
  confidence: number;
  reasoning: string;
  evidence_quotes: string[];
  recommended_action: string;
}

export interface HEA02VerdictData {
  product: {
    inhoudstoffen: Array<{
      type: string;
      waarde: string;
      bron: string;
    }>;
    certificaten: Array<{
      type: string;
      waarde: string;
      bron: string;
    }>;
    emissiewaardes: Array<{
      type: string;
      waarde: string;
      bron: string;
    }>;
  };
  hea02_verdict: {
    status: string;
    reden: string;
    audit_proof: Array<{
      type: string;
      waarde: string;
      bron: string;
    }>;
  };
}

export interface ExtendedHEA02VerdictData {
  product: {
    inhoudstoffen_cas: Array<{
      type: string;
      waarde: string;
      bron: string;
    }>;
    bedrijfsclaims: Array<{
      claim_type: string;
      waarde: string;
      bron: string;
    }>;
    certificaten: Array<{
      type: string;
      waarde: string;
      erkend_door_lightrag: string;
      niveau: string;
      bron: string;
    }>;
    emissiewaardes: Array<{
      type: string;
      waarde: string;
      testmethode?: string;
      bron: string;
    }>;
  };
  verificatie_audit: {
    status: string;
    reden: string;
    advies_opmerkingen?: string[];
    audit_proof: string[];
  };
}

export interface Hea02Result {
  samenvatting: {
    status: 'voldoet' | 'voldoet_niet' | 'onduidelijk' | 'risico_bij_hoeveelheid';
    reden: string;
    opmerkingen?: string[];
  };
  certificaten?: Array<{
    schema: string;
    status: string;
    bewijs: string;
    bron: string;
  }>;
  emissies?: Array<{
    component: string;
    waarde: number | null;
    grens: number;
    status: string;
    bron: string;
  }>;
  stoffen?: Array<{
    naam: string;
    cas: string;
    functie: string;
    bron: string;
  }>;
}

export interface DetailedProductAnalysis {
  norm: string;
  productnaam: string;
  productgroep: string;
  fabrikant: string;
  product: {
    inhoudsstoffen: Array<{
      naam: string;
      cas_nummer: string;
      concentratie: string;
      h_zinnen: string[];
      clp_classificatie: string;
    }>;
    vos_gehalte?: {
      waarde: number;
      eenheid: string;
      grenswaarde: number;
      voldoet: boolean;
    };
    clp_classificatie: string;
    certificaten: string[];
    claims: string[];
  };
  emissies: {
    methode: string;
    testrapport_aanwezig: boolean;
    parameters: any[];
  };
  beoordeling: {
    route: string;
    compliance_status: string;
    reden: string;
  };
  lightrag_vragen?: {
    certificaten: string[];
    emissienormen: string[];
  };
}

export interface VerificatieAuditData {
  lightrag_vragen?: {
    certificaten?: string[];
    emissienormen?: string[];
  };
  product: {
    identificatie: {
      naam: string;
      productgroep: string;
      norm: string;
    };
    inhoudstoffen_cas: Array<{
      type: string;
      waarde: string;
      naam?: string;
      stofnaam?: string;
      concentratie?: string;
      bron: string;
      red_list_check: 'clean' | 'hit_banned' | 'hit_priority' | 'hit_watch';
      opmerking?: string;
      red_list_groep?: string;
    }>;
    certificaten: Array<{
      naam: string;
      status: string;
      bron: string;
    }>;
    emissiewaardes: Array<{
      component: string;
      waarde: number | null;
      eenheid: string;
      status: string;
      bron: string;
    }>;
    normatieve_grenswaarden: Array<{
      component: string;
      waarde?: number;
      limiet?: number;
      eenheid: string;
      norm?: string;
      bron: string;
    }>;
  };
  verificatie_audit: {
    status: 'conform' | 'niet_conform' | 'waarschuwing' | 'onduidelijk';
    route: string;
    reden: string;
    advies_opmerkingen: string[];
    audit_proof: string[];
  };
}

export interface RedListInfo {
  cas_rn: string;
  ec_number: string;
  substance_name: string;
  red_list_chemical_group: string;
  date_modified: string;
  supabase_node: string;
}

export interface CASResultItem {
  cas: string;
  naam: string;
  percentage: string;
  redlist: RedListInfo | null;
  priority: RedListInfo | null;
  watch: RedListInfo | null;
}

export interface BouwbiologischAdviesData {
  product: {
    identificatie: {
      naam: string | null;
      productgroep: string | null;
      norm: string | null;
      bron?: Bron;
    };
  };
  scores: {
    emissies: {
      status: 'voldoet' | 'voldoet_niet' | 'risico' | 'risico_bij_grote_hoeveelheden' | 'missende_informatie';
      details: {
        gevonden_waarnemingen?: Array<{
          component?: string;
          waarde?: number;
          eenheid?: string;
          bron?: Bron;
        }>;
        gevonden_waarden?: Array<{
          component?: string;
          waarde?: number;
          eenheid?: string;
          bron?: Bron;
        }>;
        conclusie?: string;
        toelichting?: string;
      } | Array<{
        stof: string;
        gemeten_waarde: string;
        grenswaarde?: string;
        oordeel: string;
        bron?: Bron;
      }>;
    };
    toxicologie: {
      tox_status: 'banned' | 'priority' | 'watch' | 'clean' | 'onbekend';
      samenvatting?: string;
      conclusie?: string;
      gecheckte_stoffen?: Array<{
        cas: string;
        naam?: string;
        lijst: string | null;
        status: string;
        bron?: Bron;
      }>;
    };
    certificaten: {
      status: 'erkend' | 'niet_erkend' | 'geen_certificaten';
      conclusie?: string;
      gevonden_certificaten: Array<{
        // Legacy format
        naam?: string;
        status_gn22_general?: string;
        bewijs_uit_pdf?: string;
        toelichting_norm?: string;
        // New format
        gevonden_term?: string;
        type_claim?: string;
        status_gn22?: string;
        reden?: string;
        bron?: Bron;
      }>;
    };
    informatie_dekking: 'voldoende' | 'onvoldoende';
  };
  advies: {
    niveau: number;
    kleur: 'rood' | 'oranje' | 'geel' | 'groen';
    label: string;
    route: string;
    bouwbioloog_toelichting: string;
  };
}

export type ValidationResponse = 
  | { type: 'cas_results'; data: CASResultItem[] }
  | { type: 'table'; criteria: CriteriaData[] }
  | { type: 'classification'; data: ClassificationData }
  | { type: 'hea02_verdict'; data: HEA02VerdictData }
  | { type: 'extended_hea02_verdict'; data: ExtendedHEA02VerdictData }
  | { type: 'hea02_result'; data: Hea02Result }
  | { type: 'detailed_product_analysis'; data: DetailedProductAnalysis }
  | { type: 'verificatie_audit'; data: VerificatieAuditData }
  | { type: 'bouwbiologisch_advies'; data: BouwbiologischAdviesData };

// Helper functie om markdown code block markers te verwijderen
const stripMarkdownCodeBlock = (text: string): string => {
  // Verwijder ```json of ``` aan het begin en einde
  return text
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();
};

// Helper functie om validation data uit verschillende response formaten te halen
const extractValidationData = (data: any): ValidationResponse => {
  let workingData = data;
  
  // Detecteer CAS Results array format EERST (voordat we array unpacking doen!)
  if (Array.isArray(workingData) && workingData.length > 0 && 
      workingData[0]?.cas && workingData[0]?.naam && 
      ('redlist' in workingData[0] || 'priority' in workingData[0] || 'watch' in workingData[0])) {
    console.log('✅ Detected CAS Results format');
    return {
      type: 'cas_results',
      data: workingData as CASResultItem[]
    };
  }
  
  // Als het een array is, pak het eerste element (voor andere formaten)
  if (Array.isArray(workingData)) {
    console.log('Response is array, taking first element');
    workingData = workingData[0];
  }
  
  // Als er een "output" key is, pak die
  if (workingData?.output) {
    console.log('Found "output" key, extracting');
    workingData = workingData.output;
    
    // Parse als het een string is
    if (typeof workingData === 'string') {
      console.log('Output is string, stripping markdown and parsing JSON');
      // Strip markdown code block markers voordat we parsen
      const cleanedData = stripMarkdownCodeBlock(workingData);
      workingData = JSON.parse(cleanedData);
    }
  }

  // Detecteer BouwbiologischAdviesData format (hoogste prioriteit - nieuwe format met advies)
  if (workingData?.scores && workingData?.advies && workingData?.product?.identificatie) {
    console.log('✅ Detected BouwbiologischAdviesData format');
    return {
      type: 'bouwbiologisch_advies',
      data: workingData as BouwbiologischAdviesData
    };
  }

  // Detecteer VerificatieAuditData format (met red list checking)
  if (workingData?.verificatie_audit && workingData?.product?.identificatie && workingData?.product?.inhoudstoffen_cas) {
    console.log('✅ Detected VerificatieAuditData format');
    return {
      type: 'verificatie_audit',
      data: workingData as VerificatieAuditData
    };
  }

  // Detecteer Detailed Product Analysis format
  if (workingData?.norm && workingData?.productnaam && workingData?.beoordeling) {
    console.log('✅ Detected DetailedProductAnalysis format');
    return {
      type: 'detailed_product_analysis',
      data: workingData as DetailedProductAnalysis
    };
  }

  // Detecteer nieuwe Hea02Result format
  // Data komt binnen als array met 1 element
  if (Array.isArray(workingData) && workingData.length > 0) {
    const firstItem = workingData[0];
    if (
      firstItem?.samenvatting?.status && 
      firstItem?.samenvatting?.reden &&
      (firstItem.certificaten || firstItem.emissies || firstItem.stoffen)
    ) {
      console.log('✅ Detected Hea02Result format (array structure)');
      return {
        type: 'hea02_result',
        data: {
          samenvatting: firstItem.samenvatting,
          certificaten: firstItem.certificaten || [],
          emissies: firstItem.emissies || [],
          stoffen: firstItem.stoffen || []
        } as Hea02Result
      };
    }
  }
  
  // Fallback: check if workingData itself has the structure (with required fields only)
  if (
    workingData?.samenvatting?.status && 
    workingData?.samenvatting?.reden &&
    (workingData.certificaten || workingData.emissies || workingData.stoffen)
  ) {
    console.log('✅ Detected Hea02Result format');
    console.log('🔍 Debug - samenvatting:', workingData.samenvatting);
    console.log('🔍 Debug - certificaten:', workingData.certificaten);
    console.log('🔍 Debug - emissies:', workingData.emissies);
    console.log('🔍 Debug - stoffen:', workingData.stoffen);
    return {
      type: 'hea02_result',
      data: {
        samenvatting: workingData.samenvatting,
        certificaten: workingData.certificaten || [],
        emissies: workingData.emissies || [],
        stoffen: workingData.stoffen || []
      } as Hea02Result
    };
  }
  
  // Detecteer extended format (tweede prioriteit)
  if (workingData?.product && workingData?.verificatie_audit) {
    console.log('Found extended HEA02 verification audit format');
    return {
      type: 'extended_hea02_verdict',
      data: workingData as ExtendedHEA02VerdictData
    };
  }
  
  // Detecteer format: HEA02 Verdict format
  if (workingData?.product && workingData?.hea02_verdict) {
    console.log('Found HEA02 verdict format');
    return {
      type: 'hea02_verdict',
      data: workingData as HEA02VerdictData
    };
  }
  
  // Detecteer format: Classification format
  if (workingData?.classification && workingData?.reasoning) {
    console.log('Found classification format');
    return {
      type: 'classification',
      data: {
        classification: workingData.classification,
        confidence: workingData.confidence || 0,
        reasoning: workingData.reasoning,
        evidence_quotes: workingData.evidence_quotes || [],
        recommended_action: workingData.recommended_action || ''
      }
    };
  }
  
  // Detecteer format: Table format
  if (workingData?.criteria && Array.isArray(workingData.criteria)) {
    console.log('Found criteria array with', workingData.criteria.length, 'items');
    return { 
      type: 'table',
      criteria: workingData.criteria 
    };
  }
  
  // Als we hier komen, is het formaat onbekend
  console.error('Could not extract validation data from response:', data);
  throw new Error('Invalid response format: no criteria array or classification found');
};

// Helper functie voor retry mechanisme met exponential backoff
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  baseDelayMs: number = 2000
): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Poging ${attempt}/${maxRetries}...`);
      const response = await fetch(url, options);
      
      if (attempt > 1) {
        console.log(`✅ Request succesvol na ${attempt} pogingen`);
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`⚠️ Poging ${attempt} mislukt:`, lastError.message);
      
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`⏳ Wacht ${delay}ms voordat opnieuw geprobeerd wordt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Request mislukt na ${maxRetries} pogingen: ${lastError?.message}`);
};

export const sendValidationRequest = async (
  sessionId: string,
  certification: string,
  productType: { id: string; name: string; description: string },
  files: File[]
): Promise<ValidationResponse> => {
  console.log('🚀 Sending validation request with', files.length, 'files');
  console.log('🚀 Certification:', certification);
  console.log('🚀 Product Type:', productType);
  console.log('🚀 Sending request to:', WEBHOOK_URL);
  
  const formData = new FormData();
  formData.append('sessionId', sessionId);
  formData.append('certification', certification);
  formData.append('productTypeId', productType.id);
  formData.append('productTypeName', productType.name);
  formData.append('productTypeDescription', productType.description);
  
  // PDF files toevoegen
  files.forEach((file) => {
    formData.append('file', file);
    console.log('📎 Appending file:', file.name);
  });
  
  const response = await fetchWithRetry(WEBHOOK_URL, {
    method: 'POST',
    body: formData,
  }, 3, 2000); // 3 pogingen, 2 seconden start delay
  
  console.log('📡 Response status:', response.status, response.statusText);
  console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Send failed with status', response.status, ':', errorText);
    throw new Error(`Send failed: ${response.statusText} - ${errorText}`);
  }
  
  // Lees response text eerst om te kunnen loggen
  const responseText = await response.text();
  console.log('📦 Raw response text:', responseText);
  console.log('📦 Response text length:', responseText.length);
  
  // Parse JSON
  let rawResult;
  try {
    rawResult = JSON.parse(responseText);
    console.log('✅ Parsed JSON successfully');
    console.log('📋 Raw validation response:', JSON.stringify(rawResult, null, 2));
  } catch (parseError) {
    console.error('❌ JSON parse error:', parseError);
    console.error('❌ Failed to parse text:', responseText.substring(0, 500));
    throw new Error(`Invalid JSON response from webhook: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
  }
  
  // Gebruik de helper functie om validation data te extraheren
  try {
    const result = extractValidationData(rawResult);
    console.log('✅ Extracted validation data successfully:', result.type);
    console.log('📊 Validation data:', JSON.stringify(result, null, 2));
    return result;
  } catch (extractError) {
    console.error('❌ Failed to extract validation data:', extractError);
    console.error('❌ Raw data that failed extraction:', JSON.stringify(rawResult, null, 2));
    throw extractError;
  }
};

