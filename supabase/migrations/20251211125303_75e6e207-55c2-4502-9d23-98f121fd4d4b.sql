INSERT INTO knowledge_bank (
  ean_code,
  product_name,
  certification,
  product_type,
  advies_niveau,
  advies_kleur,
  advies_label,
  emissie_score,
  toxicologie_score,
  certificaten_score,
  validation_count,
  latest_result
) VALUES (
  '346346465646',
  'Houtvezelplaat',
  'BREEAM_HEA02',
  '{"id": "2", "name": "Houtachtige plaatmaterialen", "description": "Houtachtige plaatmaterialen, inclusief spaanplaat, houtvezelplaat, MDF, OSB, etc."}'::jsonb,
  '4',
  'groen',
  'Geschikt voor HEA 02',
  85,
  90,
  80,
  3,
  '{
    "product": {
      "identificatie": {
        "naam": "Houtvezelplaat",
        "productgroep": "Houtachtige plaatmaterialen",
        "norm": "BREEAM HEA 02"
      }
    },
    "scores": {
      "emissies": {
        "status": "voldoet",
        "details": []
      },
      "toxicologie": {
        "tox_status": "clean",
        "gecheckte_stoffen": []
      },
      "certificaten": {
        "status": "erkend",
        "gevonden_certificaten": []
      }
    },
    "advies": {
      "niveau": 4,
      "kleur": "groen",
      "label": "Geschikt voor HEA 02",
      "route": "direct_toepasbaar",
      "bouwbioloog_toelichting": "Product voldoet aan alle BREEAM HEA 02 eisen."
    }
  }'::jsonb
);