const WEBHOOK_URL = 'https://n8n-zztf.onrender.com/webhook/2ac96ace-b5fc-4633-91d9-368f5f0d3023';
const SEND_WEBHOOK_URL = 'https://n8n-zztf.onrender.com/webhook/f4baeea1-2ab9-4141-bfdf-791b6b5877b7';

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

export interface BouwbiologischAdviesData {
  product: {
    identificatie: {
      naam: string | null;
      productgroep: string | null;
      norm: string | null;
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
          bron?: string;
        }>;
        gevonden_waarden?: Array<{
          component?: string;
          waarde?: number;
          eenheid?: string;
          bron?: string;
        }>;
        conclusie: string;
        toelichting: string;
      };
    };
    toxicologie: {
      tox_status: 'banned' | 'priority' | 'watch' | 'clean' | 'onbekend';
      samenvatting?: string;
      conclusie?: string;
      gecheckte_stoffen?: Array<{
        cas: string;
        naam: string;
        lijst: string;
        status: string;
      }>;
    };
    certificaten: {
      status: 'erkend' | 'niet_erkend' | 'geen_certificaten';
      conclusie?: string;
      gevonden_certificaten: Array<{
        naam: string;
        status_gn22_general?: string;
        bewijs_uit_pdf?: string;
        toelichting_norm?: string;
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
  
  // Als het een array is, pak het eerste element
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

export const uploadPDFToWebhook = async (
  files: File[], 
  sessionId: string,
  certification: string,
  productType: { id: string; name: string; description: string }
): Promise<void> => {
  const formData = new FormData();
  
  // Voeg session ID toe als tekst veld
  formData.append('sessionId', sessionId);
  formData.append('certification', certification);
  formData.append('productTypeId', productType.id);
  formData.append('productTypeName', productType.name);
  formData.append('productTypeDescription', productType.description);
  
  // Use 'file' as field name for each file (n8n webhook expects this)
  files.forEach((file) => {
    formData.append('file', file);
    console.log('Appending file:', file.name, 'Size:', file.size, 'Type:', file.type);
  });
  
  console.log('Session ID:', sessionId);
  console.log('Sending request to:', WEBHOOK_URL);
  console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
    key,
    valueType: value instanceof File ? 'File' : typeof value,
    fileName: value instanceof File ? value.name : undefined,
    fileSize: value instanceof File ? value.size : undefined,
    value: typeof value === 'string' ? value : undefined
  })));
  
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it automatically with boundary
  });
  
  console.log('Response status:', response.status, response.statusText);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Upload failed:', errorText);
    throw new Error(`Upload failed: ${response.statusText}`);
  }
  
  // Check content-type voordat we JSON parsen
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    const result = await response.json();
    console.log('Upload successful, response:', result);
  } else {
    // Geen JSON response - dat is OK voor upload webhook
    console.log('Upload successful (no JSON response)');
  }
};

export const sendValidationRequest = async (
  sessionId: string,
  certification: string,
  productType: { id: string; name: string; description: string }
): Promise<ValidationResponse> => {
  console.log('🚀 [DEBUG] Sending validation request with session ID:', sessionId);
  console.log('🚀 [DEBUG] Sending request to:', SEND_WEBHOOK_URL);
  
  const response = await fetch(SEND_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      sessionId,
      certification,
      productType: {
        id: productType.id,
        name: productType.name,
        description: productType.description
      }
    }),
  });
  
  console.log('📡 [DEBUG] Response status:', response.status, response.statusText);
  console.log('📡 [DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [DEBUG] Send failed with status', response.status, ':', errorText);
    throw new Error(`Send failed: ${response.statusText} - ${errorText}`);
  }
  
  // Lees response text eerst om te kunnen loggen
  const responseText = await response.text();
  console.log('📦 [DEBUG] Raw response text:', responseText);
  console.log('📦 [DEBUG] Response text length:', responseText.length);
  
  // Parse JSON
  let rawResult;
  try {
    rawResult = JSON.parse(responseText);
    console.log('✅ [DEBUG] Parsed JSON successfully');
    console.log('📋 [DEBUG] Raw validation response:', JSON.stringify(rawResult, null, 2));
  } catch (parseError) {
    console.error('❌ [DEBUG] JSON parse error:', parseError);
    console.error('❌ [DEBUG] Failed to parse text:', responseText.substring(0, 500));
    throw new Error(`Invalid JSON response from n8n: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
  }
  
  // Gebruik de helper functie om validation data te extraheren
  try {
    const result = extractValidationData(rawResult);
    console.log('✅ [DEBUG] Extracted validation data successfully:', result.type);
    console.log('📊 [DEBUG] Validation data:', JSON.stringify(result, null, 2));
    return result;
  } catch (extractError) {
    console.error('❌ [DEBUG] Failed to extract validation data:', extractError);
    console.error('❌ [DEBUG] Raw data that failed extraction:', JSON.stringify(rawResult, null, 2));
    throw extractError;
  }
};
