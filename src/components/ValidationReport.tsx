import { forwardRef } from "react";
import { SourceLink } from "@/components/SourceLink";
import { useSourceFiles } from "@/components/SourceFilesContext";
import type { BouwbiologischAdviesData, Bron } from "@/lib/webhookClient";

interface ValidationReportProps {
  data: BouwbiologischAdviesData;
  reportId?: string;
}

const generateReportId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const week = Math.ceil((now.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VAL-${year}-W${week.toString().padStart(2, '0')}-${random}`;
};

const formatDate = () => {
  return new Date().toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Compact source text for PDF (not clickable)
const getCompactSourceText = (bron: Bron): string => {
  if (typeof bron === 'object' && bron !== null) {
    const filename = bron.bestand?.split('/').pop() || bron.bestand || '';
    const shortName = filename.length > 25 ? filename.substring(0, 22) + '...' : filename;
    return bron.pagina ? `[${shortName} p.${bron.pagina}]` : `[${shortName}]`;
  }
  const str = String(bron);
  return str.length > 25 ? `[${str.substring(0, 22)}...]` : `[${str}]`;
};

const getStatusBadgeClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'voldoet':
    case 'erkend':
    case 'clean':
    case 'ok':
      return 'conform';
    case 'voldoet_niet':
    case 'niet_erkend':
    case 'banned':
    case 'priority':
      return 'non-conform';
    case 'watch':
    case 'risico':
    case 'risico_bij_grote_hoeveelheden':
      return 'attention';
    default:
      return 'missing';
  }
};

const getStatusText = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'voldoet': return 'CONFORM';
    case 'voldoet_niet': return 'NON-CONFORM';
    case 'erkend': return 'GELDIG';
    case 'niet_erkend': return 'AFGEWEZEN';
    case 'clean': return 'CLEAN';
    case 'watch': return 'AANDACHT';
    case 'priority': return 'PRIORITEIT';
    case 'banned': return 'VERBODEN';
    case 'risico': return 'RISICO';
    case 'risico_bij_grote_hoeveelheden': return 'RISICO';
    case 'missende_informatie': return 'MISSENDE DATA';
    default: return status.toUpperCase();
  }
};

const getConclusionBadgeClass = (niveau: string | number): string => {
  const numNiveau = typeof niveau === 'string' ? parseInt(niveau) : niveau;
  if (numNiveau === 1) return 'approved';
  if (numNiveau >= 3) return 'rejected';
  return 'review';
};

const getConclusionText = (niveau: string | number, kleur: string): string => {
  const numNiveau = typeof niveau === 'string' ? parseInt(niveau) : niveau;
  if (numNiveau === 1 || kleur === 'groen') return 'GOEDGEKEURD';
  if (numNiveau >= 3 || kleur === 'rood') return 'NIET GOEDGEKEURD';
  return 'NADER ONDERZOEK';
};

// Source reference component - renders both versions, CSS controls visibility
const SourceRef = ({ bron, sourceFiles }: { bron: Bron; sourceFiles: any[] }) => {
  return (
    <>
      <div className="source-ref">
        <SourceLink bron={bron} sourceFiles={sourceFiles} variant="text" />
      </div>
      <span className="source-ref-print">{getCompactSourceText(bron)}</span>
    </>
  );
};

export const ValidationReport = forwardRef<HTMLDivElement, ValidationReportProps>(
  ({ data, reportId }, ref) => {
    const { sourceFiles } = useSourceFiles();
    const id = reportId || generateReportId();

    // Safety check: ensure data exists
    if (!data) {
      return (
        <div ref={ref} className="report-sheet">
          <div className="section-block">
            <p style={{ color: 'hsl(0 84% 60%)', fontWeight: 'bold' }}>
              Fout: Geen validatie data beschikbaar
            </p>
          </div>
        </div>
      );
    }

    // Safety checks for required data structure
    const product = data.product || {};
    const scores = data.scores || {};
    const advies = data.advies || {};

    return (
      <div ref={ref} className="report-sheet">
        {/* Header */}
        <header className="report-header">
          <div>
            <h1>Validatierapport</h1>
            <div className="sub-title">Conformiteitsbeoordeling Bouwmaterialen</div>
          </div>
          <div className="report-meta">
            RAPPORT ID: {id}<br />
            DATUM: {formatDate()}<br />
            REF: BREEAM-NL HEA 02
          </div>
        </header>

        {/* Section 1: Product Identification */}
        <section className="section-block">
          <div className="section-title">1. Productidentificatie</div>
          <table className="tech-table">
            <tbody>
              <tr>
                <td style={{ width: '25%', fontWeight: 500 }}>Handelsnaam</td>
                <td style={{ fontWeight: 'bold' }}>
                  {product.identificatie?.naam || 'Niet gespecificeerd'}
                  {product.identificatie?.bron && (
                    <SourceRef bron={product.identificatie.bron} sourceFiles={sourceFiles} />
                  )}
                </td>
              </tr>
              <tr>
                <td>Productgroep</td>
                <td>{product.identificatie?.productgroep || 'Niet gespecificeerd'}</td>
              </tr>
              {product.identificatie?.norm && (
                <tr>
                  <td>Referentienorm</td>
                  <td className="data-mono">{product.identificatie.norm}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Section 2: Toxicology */}
        <section className="section-block">
          <div className="section-title">2. Toxicologische Screening</div>
          {scores.toxicologie?.gecheckte_stoffen && scores.toxicologie.gecheckte_stoffen.length > 0 ? (
            <table className="tech-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>CAS-Nr</th>
                  <th style={{ width: '40%' }}>Benaming</th>
                  <th style={{ width: '20%' }}>Classificatie</th>
                  <th style={{ width: '25%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {scores.toxicologie.gecheckte_stoffen.map((stof, idx) => (
                  <tr key={idx}>
                    <td className="data-mono">{stof.cas}</td>
                    <td>
                      {stof.naam || `Stof ${idx + 1}`}
                      {stof.bron && <SourceRef bron={stof.bron} sourceFiles={sourceFiles} />}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(stof.lijst || 'clean')}`}>
                        {stof.lijst?.toUpperCase() || 'CLEAN'}
                      </span>
                    </td>
                    <td>
                      {stof.status === 'HIT' ? (
                        <span className="status-badge non-conform">GEDETECTEERD</span>
                      ) : (
                        <span style={{ color: 'hsl(218 19% 50%)' }}>Geen hit</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="summary-box">
              Geen stoffen geïdentificeerd in documentatie.
            </div>
          )}
        </section>

        {/* Section 3: Emissions */}
        <section className="section-block">
          <div className="section-title">3. Emissiekarakteristieken (VOS)</div>
          {Array.isArray(scores.emissies?.details) && scores.emissies.details.length > 0 ? (
            <table className="tech-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Gemeten</th>
                  <th>Grenswaarde</th>
                  <th>Resultaat</th>
                </tr>
              </thead>
              <tbody>
                {scores.emissies.details.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      {item.stof}
                      {item.bron && <SourceRef bron={item.bron} sourceFiles={sourceFiles} />}
                    </td>
                    <td className="data-mono">{item.gemeten_waarde || '--'}</td>
                    <td className="data-mono">{item.grenswaarde || 'N.v.t.'}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(item.oordeel)}`}>
                        {getStatusText(item.oordeel)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="summary-box">
              {!Array.isArray(scores.emissies?.details) && scores.emissies?.details?.toelichting
                ? scores.emissies.details.toelichting
                : 'Geen emissiewaarden beschikbaar.'}
            </div>
          )}
        </section>

        {/* Section 4: Certificates */}
        <section className="section-block">
          <div className="section-title">4. Certificaten & Claims</div>
          {scores.certificaten?.gevonden_certificaten && scores.certificaten.gevonden_certificaten.length > 0 ? (
            <table className="tech-table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Document</th>
                  <th style={{ width: '50%' }}>Beoordeling GN22</th>
                  <th style={{ width: '20%' }}>Validatie</th>
                </tr>
              </thead>
              <tbody>
                {scores.certificaten.gevonden_certificaten.map((cert, idx) => (
                  <tr key={idx}>
                    <td>
                      {cert.gevonden_term || cert.naam || `Certificaat ${idx + 1}`}
                      {cert.bron && <SourceRef bron={cert.bron} sourceFiles={sourceFiles} />}
                    </td>
                    <td>{cert.reden || cert.type_claim || cert.toelichting_norm || 'Beoordeeld volgens GN22.'}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(cert.status_gn22 || cert.status_gn22_general || 'onbekend')}`}>
                        {getStatusText(cert.status_gn22 || cert.status_gn22_general || 'onbekend')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="summary-box">
              Geen certificaten aangetroffen.
            </div>
          )}
        </section>

        {/* Conclusion - compact in print mode */}
        <section className="section-block conclusion-box">
          <div>
            <h3 style={{ fontFamily: 'Georgia, serif', margin: 0, fontSize: '16px' }} className="conclusion-title">
              EINDCONCLUSIE: NIVEAU {advies.niveau || 'N/A'}
            </h3>
            <p style={{ fontSize: '12px', marginTop: '4px', color: 'hsl(218 19% 40%)' }}>
              {advies.label || 'Geen advies beschikbaar'}
            </p>
          </div>
          <div>
            <span className={`conclusion-badge ${getConclusionBadgeClass(advies.niveau || 0)}`}>
              {getConclusionText(advies.niveau || 0, advies.kleur || '')}
            </span>
          </div>
        </section>

        {/* Footer */}
        <footer className="report-footer">
          <div>BouwBio Validatie v1.0</div>
          <div>Interne rapportage, geen officieel certificaat.</div>
        </footer>
      </div>
    );
  }
);

ValidationReport.displayName = 'ValidationReport';

export default ValidationReport;
