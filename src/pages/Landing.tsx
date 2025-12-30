import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, FileCheck, ArrowRight, Beaker, CheckCircle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import aiValidationHero from '@/assets/ai-validation-hero.png';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-24 px-6 bg-card">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading font-normal text-5xl leading-tight mb-6 text-foreground">
                Valideer uw bouwmaterialen met AI
              </h1>
              <p className="text-lg mb-8 leading-relaxed text-muted-foreground">
                Automatische BREEAM HEA02 validatie, toxicologie checks en certificaat verificatie. 
                Upload PDF's en ontvang binnen minuten een compleet rapport.
              </p>
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth?mode=signup')}
                  className="text-base"
                >
                  Start Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="border-border text-muted-foreground hover:text-primary hover:border-primary"
                >
                  Login
                </Button>
              </div>
            </div>
            <div className="hidden md:block overflow-hidden rounded-lg">
              <img 
                src={aiValidationHero} 
                alt="AI-gedreven materiaal validatie" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading font-normal text-4xl mb-4 text-foreground">
              Wat Bouwbioloog doet
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
              Een compleet platform voor duurzame materiaal validatie
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 flex items-center justify-center mb-4 bg-primary text-primary-foreground">
                  <Award className="w-6 h-6" />
                </div>
                <CardTitle className="font-heading">BREEAM HEA02 Validatie</CardTitle>
                <CardDescription>
                  Automatische controle op BREEAM HEA02 compliance voor bouwmaterialen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Certificaat verificatie
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Emissiewaarden controle
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Normatieve grenswaarden
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 flex items-center justify-center mb-4 bg-primary text-primary-foreground">
                  <Beaker className="w-6 h-6" />
                </div>
                <CardTitle className="font-heading">Toxicologie Check</CardTitle>
                <CardDescription>
                  Red List verificatie voor gevaarlijke stoffen en chemicaliën
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Banned substances detectie
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Priority chemicals
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Watch list monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 flex items-center justify-center mb-4 bg-primary text-primary-foreground">
                  <FileCheck className="w-6 h-6" />
                </div>
                <CardTitle className="font-heading">Snelle Rapporten</CardTitle>
                <CardDescription>
                  Complete validatie rapporten binnen enkele minuten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Multi-PDF upload
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Gestructureerde output
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Export mogelijkheden
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-card">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading font-normal text-4xl mb-4 text-foreground">
              Hoe het werkt
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
              In drie simpele stappen naar een volledig validatierapport
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 flex items-center justify-center text-2xl font-heading font-bold mx-auto mb-6 bg-primary text-primary-foreground">
                1
              </div>
              <h3 className="font-heading text-xl mb-3 text-foreground">
                Upload PDF's
              </h3>
              <p className="text-muted-foreground">
                Sleep uw materiaal documenten naar het uploadgebied. Meerdere bestanden tegelijk mogelijk.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 flex items-center justify-center text-2xl font-heading font-bold mx-auto mb-6 bg-primary text-primary-foreground">
                2
              </div>
              <h3 className="font-heading text-xl mb-3 text-foreground">
                AI Analyse
              </h3>
              <p className="text-muted-foreground">
                Onze AI analyseert certificaten, emissies en toxicologie volgens BREEAM HEA02 normen.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 flex items-center justify-center text-2xl font-heading font-bold mx-auto mb-6 bg-primary text-primary-foreground">
                3
              </div>
              <h3 className="font-heading text-xl mb-3 text-foreground">
                Ontvang Rapport
              </h3>
              <p className="text-muted-foreground">
                Krijg direct een gedetailleerd rapport met alle resultaten en aanbevelingen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-heading font-normal text-4xl mb-6 text-primary-foreground">
            Klaar om te beginnen?
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/80">
            Maak vandaag nog een gratis account aan en start met valideren
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth?mode=signup')}
            className="text-base bg-card text-foreground hover:bg-card/90"
          >
            Gratis Account Aanmaken
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </Layout>
  );
}
