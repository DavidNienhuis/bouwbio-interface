import { Navbar } from "@/components/Navbar";
import { ValidationFooter } from "@/components/ValidationFooter";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(180 20% 97%)' }}>
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
        <h1 
          className="font-heading text-3xl md:text-4xl font-semibold mb-8"
          style={{ color: 'hsl(186 100% 10%)' }}
        >
          Algemene Voorwaarden
        </h1>
        
        <div className="prose prose-lg max-w-none" style={{ color: 'hsl(192 12% 12%)' }}>
          <p className="text-muted-foreground mb-6">
            Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              1. Definities
            </h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Dienst:</strong> de BREEAM HEA 02 validatietool aangeboden door Bouwbioloog GWK</li>
              <li><strong>Gebruiker:</strong> elke natuurlijke of rechtspersoon die gebruik maakt van de Dienst</li>
              <li><strong>Platform:</strong> de website en applicatie waarop de Dienst wordt aangeboden</li>
              <li><strong>Validatie:</strong> de analyse van geüploade documenten op basis van BREEAM HEA 02 criteria</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              2. Toepasselijkheid
            </h2>
            <p className="mb-4 leading-relaxed">
              Deze algemene voorwaarden zijn van toepassing op elk gebruik van de Dienst en op elke overeenkomst tussen 
              Bouwbioloog GWK en de Gebruiker. Door gebruik te maken van de Dienst accepteert de Gebruiker deze voorwaarden.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              3. Gebruik van de Dienst
            </h2>
            <p className="mb-4 leading-relaxed">De Gebruiker verklaart:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Alleen documenten te uploaden waarvoor zij de benodigde rechten hebben</li>
              <li>De Dienst niet te gebruiken voor illegale doeleinden</li>
              <li>Geen malware of schadelijke code te uploaden</li>
              <li>De Dienst niet te misbruiken of te overbelasten</li>
              <li>Correcte en actuele accountgegevens te verstrekken</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              4. Accountregistratie
            </h2>
            <p className="mb-4 leading-relaxed">
              Om gebruik te maken van de Dienst dient de Gebruiker een account aan te maken. De Gebruiker is verantwoordelijk 
              voor het geheimhouden van inloggegevens en voor alle activiteiten die plaatsvinden onder zijn account.
            </p>
            <p className="leading-relaxed">
              Bouwbioloog GWK behoudt zich het recht voor om accounts op te schorten of te beëindigen bij vermoeden van 
              misbruik of schending van deze voorwaarden.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              5. Validatieresultaten
            </h2>
            <p className="mb-4 leading-relaxed">
              De validatieresultaten zijn gebaseerd op AI-analyse en dienen als hulpmiddel bij de beoordeling van 
              bouwmaterialen. De resultaten:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Zijn niet bedoeld als vervanging voor professioneel advies</li>
              <li>Dienen altijd te worden geverifieerd door een gekwalificeerde professional</li>
              <li>Zijn gebaseerd op de aangeleverde documentatie</li>
              <li>Kunnen variëren afhankelijk van de kwaliteit van de input</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              6. Intellectueel Eigendom
            </h2>
            <p className="mb-4 leading-relaxed">
              Alle intellectuele eigendomsrechten met betrekking tot het Platform en de Dienst, inclusief maar niet beperkt 
              tot software, ontwerpen, teksten en merken, berusten bij Bouwbioloog GWK of haar licentiegevers.
            </p>
            <p className="leading-relaxed">
              De Gebruiker behoudt de eigendomsrechten op de door hem geüploade documenten. Door het uploaden van documenten 
              verleent de Gebruiker Bouwbioloog GWK een beperkte licentie om deze te verwerken voor het leveren van de Dienst.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              7. Aansprakelijkheid
            </h2>
            <p className="mb-4 leading-relaxed">
              Bouwbioloog GWK spant zich in om de Dienst naar behoren te laten functioneren, maar kan geen garantie geven 
              voor ononderbroken of foutloze werking.
            </p>
            <p className="mb-4 leading-relaxed">
              Bouwbioloog GWK is niet aansprakelijk voor:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Schade voortvloeiend uit het gebruik of de onmogelijkheid om de Dienst te gebruiken</li>
              <li>Beslissingen genomen op basis van validatieresultaten</li>
              <li>Verlies van data of bedrijfsonderbreking</li>
              <li>Indirecte of gevolgschade</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              8. Privacy
            </h2>
            <p className="leading-relaxed">
              De verwerking van persoonsgegevens geschiedt in overeenstemming met ons{' '}
              <a 
                href="/privacy" 
                className="underline transition-colors"
                style={{ color: 'hsl(142 64% 42%)' }}
              >
                Privacybeleid
              </a>
              . Door gebruik te maken van de Dienst stemt de Gebruiker in met deze verwerking.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              9. Wijzigingen
            </h2>
            <p className="leading-relaxed">
              Bouwbioloog GWK behoudt zich het recht voor deze voorwaarden te wijzigen. Bij substantiële wijzigingen 
              worden Gebruikers hiervan op de hoogte gesteld. Voortgezet gebruik van de Dienst na wijziging impliceert 
              acceptatie van de gewijzigde voorwaarden.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              10. Toepasselijk Recht
            </h2>
            <p className="leading-relaxed">
              Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde 
              rechter in Nederland.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-4" style={{ color: 'hsl(186 100% 10%)' }}>
              11. Contact
            </h2>
            <p className="leading-relaxed">
              Voor vragen over deze voorwaarden kunt u contact opnemen via:<br />
              <strong>E-mail:</strong> info@bouwbioloog.nl<br />
              <strong>Adres:</strong> Bouwbioloog GWK, Nederland
            </p>
          </section>
        </div>
      </main>
      
      <ValidationFooter />
    </div>
  );
};

export default Terms;
