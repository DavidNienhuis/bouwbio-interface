import { forwardRef } from "react";
import { SourceLink } from "@/components/SourceLink";
import { useSourceFiles } from "@/components/SourceFilesContext";
import type { BouwbiologischAdviesData } from "@/lib/webhookClient";

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

export const ValidationReport = forwardRef<HTMLDivElement, ValidationReportProps>(
  ({ data, reportId }, ref) => {
    const { sourceFiles } = useSourceFiles();
    const id = reportId || generateReportId();
    
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
                  {data.product.identificatie.naam || 'Niet gespecificeerd'}
                  {data.product.identificatie.bron && (
                    <div className="source-ref">
                      <SourceLink bron={data.product.identificatie.bron} sourceFiles={sourceFiles} variant="text" />
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td>Productgroep</td>
                <td>{data.product.identificatie.productgroep || 'Niet gespecificeerd'}</td>
              </tr>
              {data.product.identificatie.norm && (
                <tr>
                  <td>Referentienorm</td>
                  <td className="data-mono">{data.product.identificatie.norm}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Section 2: Toxicology */}
        <section className="section-block">
          <div className="section-title">2. Toxicologische Screening & Prioriteitsstoffen</div>
          {data.scores.toxicologie.gecheckte_stoffen && data.scores.toxicologie.gecheckte_stoffen.length > 0 ? (
            <table className="tech-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>CAS-Nummer</th>
                  <th style={{ width: '40%' }}>Chemische Benaming</th>
                  <th style={{ width: '25%' }}>Classificatie</th>
                  <th style={{ width: '20%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.scores.toxicologie.gecheckte_stoffen.map((stof, idx) => (
                  <tr key={idx}>
                    <td className="data-mono">{stof.cas}</td>
                    <td>
                      {stof.naam || `Stof ${idx + 1}`}
                      {stof.bron && (
                        <div className="source-ref">
                          <SourceLink bron={stof.bron} sourceFiles={sourceFiles} variant="text" />
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(stof.lijst || 'clean')}`}>
                        {stof.lijst?.toUpperCase() || 'CLEAN'}
                      </span>
                    </td>
                    <td>
                      {stof.status === 'HIT' ? (
                        <span className="status-badge non-conform">🚨 GEDETECTEERD</span>
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
              <strong>Geen stoffen gevonden:</strong> Er zijn geen chemische stoffen geïdentificeerd in de aangeleverde documentatie.
            </div>
          )}
          {data.scores.toxicologie.samenvatting && (
            <div className="summary-box" style={{ marginTop: '15px' }}>
              <strong>Samenvatting:</strong> {data.scores.toxicologie.samenvatting}
            </div>
          )}
        </section>

        {/* Section 3: Emissions */}
        <section className="section-block">
          <div className="section-title">3. Emissiekarakteristieken (VOS)</div>
          {Array.isArray(data.scores.emissies.details) && data.scores.emissies.details.length > 0 ? (
            <table className="tech-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Gemeten Waarde</th>
                  <th>Grenswaarde</th>
                  <th>Resultaat</th>
                </tr>
              </thead>
              <tbody>
                {data.scores.emissies.details.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      {item.stof}
                      {item.bron && (
                        <div className="source-ref">
                          <SourceLink bron={item.bron} sourceFiles={sourceFiles} variant="text" />
                        </div>
                      )}
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
              <strong>Emissiegegevens:</strong> {
                !Array.isArray(data.scores.emissies.details) && data.scores.emissies.details?.toelichting
                  ? data.scores.emissies.details.toelichting
                  : 'Geen emissiewaarden beschikbaar in de aangeleverde documentatie.'
              }
            </div>
          )}
        </section>

        {/* Section 4: Certificates */}
        <section className="section-block">
          <div className="section-title">4. Validatie Certificaten & Claims</div>
          {data.scores.certificaten.gevonden_certificaten && data.scores.certificaten.gevonden_certificaten.length > 0 ? (
            <table className="tech-table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Document / Certificaat</th>
                  <th style={{ width: '50%' }}>Beoordeling conform GN22</th>
                  <th style={{ width: '20%' }}>Validatie</th>
                </tr>
              </thead>
              <tbody>
                {data.scores.certificaten.gevonden_certificaten.map((cert, idx) => (
                  <tr key={idx}>
                    <td>
                      {cert.gevonden_term || cert.naam || `Certificaat ${idx + 1}`}
                      {cert.bron && (
                        <div className="source-ref">
                          <SourceLink bron={cert.bron} sourceFiles={sourceFiles} variant="text" />
                        </div>
                      )}
                    </td>
                    <td>
                      {cert.reden || cert.type_claim || cert.toelichting_norm || 'Beoordeeld volgens BREEAM-NL GN22 criteria.'}
                    </td>
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
              <strong>Geen certificaten:</strong> Er zijn geen geldige certificaten of claims aangetroffen in de documentatie.
            </div>
          )}
        </section>

        {/* Conclusion */}
        <section className="section-block conclusion-box">
          <div>
            <h3 style={{ fontFamily: 'Georgia, serif', margin: 0, fontSize: '16px' }}>
              EINDCONCLUSIE: NIVEAU {data.advies.niveau}
            </h3>
            <p style={{ fontSize: '12px', marginTop: '5px', color: 'hsl(218 19% 40%)' }}>
              Status: "{data.advies.label}"
            </p>
            {data.advies.bouwbioloog_toelichting && (
              <p style={{ fontSize: '11px', marginTop: '10px', maxWidth: '500px', lineHeight: '1.5' }}>
                {data.advies.bouwbioloog_toelichting}
              </p>
            )}
          </div>
          <div>
            <span className={`conclusion-badge ${getConclusionBadgeClass(data.advies.niveau)}`}>
              {getConclusionText(data.advies.niveau, data.advies.kleur)}
            </span>
          </div>
        </section>

        {/* Footer */}
        <footer className="report-footer">
          <div>Gegenereerd door BouwBio Validatie Systeem v1.0</div>
          <div>Dit document dient als interne rapportage en is geen officieel certificaat.</div>
        </footer>
      </div>
    );
  }
);

ValidationReport.displayName = 'ValidationReport';

export default ValidationReport;
