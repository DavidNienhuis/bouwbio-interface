import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface KnowledgeBankEntry {
  id: string;
  ean_code: string;
  product_name: string | null;
  certification: string;
  product_type: any;
  validation_count: number;
  last_validated_at: string;
  first_validated_at: string;
  advies_niveau: string | null;
  advies_kleur: string | null;
  advies_label: string | null;
  emissie_score: number | null;
  toxicologie_score: number | null;
  certificaten_score: number | null;
  overall_score: number | null;
  latest_result: any;
}

export function useKnowledgeBank(eanCode: string | null, certification: string | null) {
  const [entry, setEntry] = useState<KnowledgeBankEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKnowledgeBank() {
      if (!eanCode || !certification) {
        setEntry(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('knowledge_bank')
          .select('*')
          .eq('ean_code', eanCode)
          .eq('certification', certification)
          .maybeSingle();

        if (fetchError) throw fetchError;
        setEntry(data as KnowledgeBankEntry | null);
      } catch (err) {
        console.error('Knowledge bank fetch error:', err);
        setError(err instanceof Error ? err.message : 'Fout bij ophalen kennisbank');
        setEntry(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchKnowledgeBank();
  }, [eanCode, certification]);

  return { entry, isLoading, error };
}

export async function updateKnowledgeBank(
  eanCode: string,
  productName: string | null,
  certification: string,
  productType: any,
  result: any
): Promise<void> {
  try {
    const { error } = await supabase.rpc('update_knowledge_bank', {
      p_ean_code: eanCode,
      p_product_name: productName,
      p_certification: certification,
      p_product_type: productType,
      p_result: result,
    });

    if (error) throw error;
    console.log('✅ Knowledge bank updated for EAN:', eanCode);
  } catch (err) {
    console.error('Failed to update knowledge bank:', err);
  }
}
