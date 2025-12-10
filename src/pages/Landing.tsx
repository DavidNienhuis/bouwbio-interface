import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, TestTube, FileCheck, ArrowRight, Beaker, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ValidationFooter } from '@/components/ValidationFooter';
import aiValidationHero from '@/assets/ai-validation-hero.png';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(180 14% 97%)' }}>
      <Navbar />

      {/* Hero Section */}
      <section 
        className="py-24 px-6"
        style={{ background: 'hsl(186 100% 10%)' }}
      >
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 
                className="font-heading font-medium text-5xl leading-tight mb-6"
                style={{ color: '#FFFFFF', letterSpacing: '0.02em' }}
              >
                Valideer uw bouwmaterialen met AI
              </h1>
              <p 
                className="text-lg mb-8 leading-relaxed"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
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
                  style={{ 
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}
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
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading font-medium text-4xl mb-4" style={{ color: 'hsl(190 16% 12%)' }}>
              Wat Bouwbioloog doet
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'hsl(218 19% 27%)' }}>
              Een compleet platform voor duurzame materiaal validatie
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card style={{ border: '1px solid hsl(218 14% 85%)' }}>
              <CardHeader>
                <div 
                  className="w-12 h-12 flex items-center justify-center mb-4"
                  style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
                >
                  <Award className="w-6 h-6" />
                </div>
                <CardTitle className="font-heading">BREEAM HEA02 Validatie</CardTitle>
                <CardDescription>
                  Automatische controle op BREEAM HEA02 compliance voor bouwmaterialen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm" style={{ color: 'hsl(218 19% 27%)' }}>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'hsl(142 64% 62%)' }} />
                    Certificaat verificatie
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'hsl(142 64% 62%)' }} />
                    Emissiewaarden controle
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'hsl(142 64% 62%)' }} />
                    Normatieve grenswaarden
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card style={{ border: '1px solid hsl(218 14% 85%)' }}>
              <CardHeader>
                <div 
                  className="w-12 h-12 flex items-center justify-center mb-4"
                  style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
                >
                  <Beaker className="w-6 h-6" />
                </div>
                <CardTitle className="font-heading">Toxicologie Check</CardTitle>
                <CardDescription>
                  Red List verificatie voor gevaarlijke stoffen en chemicaliën
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm" style={{ color: 'hsl(218 19% 27%)' }}>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'hsl(142 64% 62%)' }} />
                    Banned substances detectie
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'hsl(142 64% 62%)' }} />
                    Priority chemicals
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'hsl(142 64% 62%)' }} />
                    Watch list monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card style={{ border: '1px solid hsl(218 14% 85%)' }}>
              <CardHeader>
                <div 
                  className="w-12 h-12 flex items-center justify-center mb-4"
                  style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
                >
                  <FileCheck className="w-6 h-6" />
                </div>
                <CardTitle className="font-heading">Snelle Rapporten</CardTitle>
                <CardDescription>
                  Complete validatie rapporten binnen enkele minuten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm" style={{ color: 'hsl(218 19% 27%)' }}>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'hsl(142 64% 62%)' }} />
                    Multi-PDF upload
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'hsl(142 64% 62%)' }} />
                    Gestructureerde output
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'hsl(142 64% 62%)' }} />
                    Export mogelijkheden
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6" style={{ background: 'hsl(0 0% 100%)' }}>
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading font-medium text-4xl mb-4" style={{ color: 'hsl(190 16% 12%)' }}>
              Hoe het werkt
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'hsl(218 19% 27%)' }}>
              In drie simpele stappen naar een volledig validatierapport
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div 
                className="w-16 h-16 flex items-center justify-center text-2xl font-heading font-bold mx-auto mb-6"
                style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
              >
                1
              </div>
              <h3 className="font-heading text-xl mb-3" style={{ color: 'hsl(190 16% 12%)' }}>
                Upload PDF's
              </h3>
              <p style={{ color: 'hsl(218 19% 27%)' }}>
                Sleep uw materiaal documenten naar het uploadgebied. Meerdere bestanden tegelijk mogelijk.
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 flex items-center justify-center text-2xl font-heading font-bold mx-auto mb-6"
                style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
              >
                2
              </div>
              <h3 className="font-heading text-xl mb-3" style={{ color: 'hsl(190 16% 12%)' }}>
                AI Analyse
              </h3>
              <p style={{ color: 'hsl(218 19% 27%)' }}>
                Onze AI analyseert certificaten, emissies en toxicologie volgens BREEAM HEA02 normen.
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 flex items-center justify-center text-2xl font-heading font-bold mx-auto mb-6"
                style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
              >
                3
              </div>
              <h3 className="font-heading text-xl mb-3" style={{ color: 'hsl(190 16% 12%)' }}>
                Ontvang Rapport
              </h3>
              <p style={{ color: 'hsl(218 19% 27%)' }}>
                Krijg direct een gedetailleerd rapport met alle resultaten en aanbevelingen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 px-6"
        style={{ background: 'hsl(186 100% 10%)' }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 
            className="font-heading font-medium text-4xl mb-6"
            style={{ color: '#FFFFFF' }}
          >
            Klaar om te beginnen?
          </h2>
          <p 
            className="text-lg mb-8"
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            Maak vandaag nog een gratis account aan en start met valideren
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth?mode=signup')}
            className="text-base"
          >
            Gratis Account Aanmaken
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      <ValidationFooter />
    </div>
  );
}
