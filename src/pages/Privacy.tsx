import { Navbar } from "@/components/Navbar";
import { ValidationFooter } from "@/components/ValidationFooter";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(180 20% 97%)' }}>
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
        <h1 
          className="font-heading text-3xl md:text-4xl font-semibold mb-8"
          style={{ color: 'hsl(186 100% 10%)' }}
        >
          Privacybeleid
        </h1>
        
        <div className="prose prose-lg max-w-none" style={{ color: 'hsl(192 12% 12%)' }}>
          <p className="text-muted-foreground mb-6">
            Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              1. Inleiding
            </h2>
            <p className="mb-4 leading-relaxed">
              Bouwbioloog GWK ("wij", "ons", "onze") respecteert uw privacy en zet zich in voor de bescherming van uw persoonsgegevens. 
              Dit privacybeleid informeert u over hoe wij omgaan met uw persoonsgegevens wanneer u onze website bezoekt en 
              gebruik maakt van onze diensten, en vertelt u over uw privacyrechten en hoe de wet u beschermt.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              2. Welke gegevens verzamelen wij?
            </h2>
            <p className="mb-4 leading-relaxed">Wij kunnen de volgende categorieën persoonsgegevens verzamelen:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Identiteitsgegevens:</strong> naam, bedrijfsnaam</li>
              <li><strong>Contactgegevens:</strong> e-mailadres</li>
              <li><strong>Technische gegevens:</strong> IP-adres, browsertype, tijdzone, besturingssysteem</li>
              <li><strong>Gebruiksgegevens:</strong> informatie over hoe u onze website en diensten gebruikt</li>
              <li><strong>Validatiegegevens:</strong> geüploade documenten en validatieresultaten</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              3. Hoe gebruiken wij uw gegevens?
            </h2>
            <p className="mb-4 leading-relaxed">Wij gebruiken uw persoonsgegevens voor de volgende doeleinden:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Het leveren en beheren van onze diensten</li>
              <li>Het verwerken en voltooien van validaties</li>
              <li>Het communiceren met u over uw account en onze diensten</li>
              <li>Het verbeteren van onze website en diensten</li>
              <li>Het voldoen aan wettelijke verplichtingen</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              4. Cookies
            </h2>
            <p className="mb-4 leading-relaxed">
              Onze website maakt gebruik van cookies om uw ervaring te verbeteren. Cookies zijn kleine tekstbestanden die op uw 
              apparaat worden geplaatst. Wij gebruiken:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Noodzakelijke cookies:</strong> essentieel voor het functioneren van de website</li>
              <li><strong>Analytische cookies:</strong> helpen ons te begrijpen hoe bezoekers de website gebruiken</li>
              <li><strong>Functionele cookies:</strong> onthouden uw voorkeuren</li>
            </ul>
            <p className="leading-relaxed">
              U kunt uw cookievoorkeuren beheren via de cookie-instellingen banner of via uw browserinstellingen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              5. Gegevensbeveiliging
            </h2>
            <p className="mb-4 leading-relaxed">
              Wij hebben passende beveiligingsmaatregelen getroffen om te voorkomen dat uw persoonsgegevens per ongeluk 
              verloren gaan, worden gebruikt of toegankelijk zijn op een ongeoorloofde manier, worden gewijzigd of openbaar 
              worden gemaakt. Wij beperken de toegang tot uw persoonsgegevens tot die werknemers en derden die een zakelijke 
              noodzaak hebben om te weten.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              6. Uw rechten
            </h2>
            <p className="mb-4 leading-relaxed">Onder de AVG heeft u de volgende rechten:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Recht op inzage:</strong> u kunt opvragen welke gegevens wij van u hebben</li>
              <li><strong>Recht op rectificatie:</strong> u kunt onjuiste gegevens laten corrigeren</li>
              <li><strong>Recht op verwijdering:</strong> u kunt verzoeken om verwijdering van uw gegevens</li>
              <li><strong>Recht op beperking:</strong> u kunt verzoeken om beperking van de verwerking</li>
              <li><strong>Recht op overdraagbaarheid:</strong> u kunt uw gegevens in een gangbaar formaat ontvangen</li>
              <li><strong>Recht van bezwaar:</strong> u kunt bezwaar maken tegen de verwerking</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              7. Bewaartermijn
            </h2>
            <p className="mb-4 leading-relaxed">
              Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk voor de doeleinden waarvoor ze zijn verzameld. 
              De specifieke bewaartermijnen zijn afhankelijk van het type gegevens en het doel van de verwerking.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              8. Contact
            </h2>
            <p className="mb-4 leading-relaxed">
              Als u vragen heeft over dit privacybeleid of over hoe wij omgaan met uw persoonsgegevens, neem dan contact 
              met ons op via:
            </p>
            <p className="leading-relaxed">
              <strong>E-mail:</strong> privacy@bouwbioloog.nl<br />
              <strong>Adres:</strong> Bouwbioloog GWK, Nederland
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              9. Wijzigingen
            </h2>
            <p className="leading-relaxed">
              Wij kunnen dit privacybeleid van tijd tot tijd bijwerken. De meest recente versie is altijd beschikbaar op 
              onze website. Wij raden u aan dit beleid regelmatig te raadplegen.
            </p>
          </section>
        </div>
      </main>
      
      <ValidationFooter />
    </div>
  );
};

export default Privacy;
