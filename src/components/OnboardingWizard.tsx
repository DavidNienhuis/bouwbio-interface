import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, FileCheck, User, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
  initialName?: string;
  initialCompany?: string;
}

export function OnboardingWizard({ 
  open, 
  onComplete, 
  userId,
  initialName = '',
  initialCompany = ''
}: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(initialName);
  const [companyName, setCompanyName] = useState(initialCompany);
  const [saving, setSaving] = useState(false);

  const totalSteps = 3;

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName || null,
          company_name: companyName || null,
        })
        .eq('id', userId);

      if (error) throw error;
      setStep(3);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Kon profiel niet opslaan');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (startTour: boolean) => {
    try {
      await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          tour_completed: !startTour 
        })
        .eq('id', userId);

      onComplete();
      
      if (startTour) {
        // Tour will be started by Dashboard
        window.dispatchEvent(new CustomEvent('start-guided-tour'));
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      onComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" style={{ background: 'hsl(0 0% 100%)' }}>
        {/* Progress Indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className="h-1 flex-1 rounded-full transition-all"
              style={{ 
                background: s <= step ? 'hsl(142 64% 62%)' : 'hsl(218 14% 85%)'
              }}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <>
            <DialogHeader>
              <div 
                className="w-16 h-16 flex items-center justify-center mx-auto mb-4"
                style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
              >
                <Sparkles className="w-8 h-8" />
              </div>
              <DialogTitle className="text-center font-heading text-2xl">
                Welkom bij BouwBio Validator!
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                Jouw tool voor snelle en betrouwbare BREEAM HEA02 validaties van bouwproducten.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-6">
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'hsl(180 14% 97%)' }}>
                <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: 'hsl(142 64% 62%)' }} />
                <div>
                  <p className="font-medium">PDF Analyse</p>
                  <p className="text-sm" style={{ color: 'hsl(218 19% 27%)' }}>
                    Upload productdocumentatie en ontvang automatische analyse
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'hsl(180 14% 97%)' }}>
                <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: 'hsl(142 64% 62%)' }} />
                <div>
                  <p className="font-medium">Certificaat Verificatie</p>
                  <p className="text-sm" style={{ color: 'hsl(218 19% 27%)' }}>
                    Controle op BREEAM HEA02 compliance en emissie-eisen
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'hsl(180 14% 97%)' }}>
                <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: 'hsl(142 64% 62%)' }} />
                <div>
                  <p className="font-medium">Toxicologie Check</p>
                  <p className="text-sm" style={{ color: 'hsl(218 19% 27%)' }}>
                    Automatische controle tegen Red List stoffen database
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={() => setStep(2)} className="w-full gap-2">
              Aan de slag
              <ArrowRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Step 2: Profile */}
        {step === 2 && (
          <>
            <DialogHeader>
              <div 
                className="w-16 h-16 flex items-center justify-center mx-auto mb-4"
                style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
              >
                <User className="w-8 h-8" />
              </div>
              <DialogTitle className="text-center font-heading text-2xl">
                Vertel ons iets over jezelf
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                Deze informatie helpt ons je ervaring te personaliseren.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-6">
              <div className="space-y-2">
                <Label htmlFor="onboard-name">Volledige Naam</Label>
                <Input
                  id="onboard-name"
                  placeholder="Jan Jansen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="onboard-company">Bedrijfsnaam (optioneel)</Label>
                <Input
                  id="onboard-company"
                  placeholder="Bouwbedrijf BV"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Terug
              </Button>
              <Button 
                onClick={handleSaveProfile} 
                className="flex-1 gap-2"
                disabled={saving}
              >
                {saving ? 'Opslaan...' : 'Volgende'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {/* Step 3: First Steps */}
        {step === 3 && (
          <>
            <DialogHeader>
              <div 
                className="w-16 h-16 flex items-center justify-center mx-auto mb-4"
                style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
              >
                <FileCheck className="w-8 h-8" />
              </div>
              <DialogTitle className="text-center font-heading text-2xl">
                Je bent klaar om te starten!
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                Wil je een korte rondleiding door de applicatie?
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 rounded-lg my-6" style={{ background: 'hsl(180 14% 97%)', border: '1px solid hsl(218 14% 85%)' }}>
              <h4 className="font-medium mb-2">Zo werkt het:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm" style={{ color: 'hsl(218 19% 27%)' }}>
                <li>Selecteer het certificeringssysteem (BREEAM HEA02)</li>
                <li>Kies de productgroep die je wilt valideren</li>
                <li>Upload je PDF documentatie</li>
                <li>Ontvang een uitgebreide analyse en advies</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleComplete(false)}
                className="flex-1"
              >
                Overslaan
              </Button>
              <Button 
                onClick={() => handleComplete(true)}
                className="flex-1 gap-2"
              >
                Start Rondleiding
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {/* Step indicator */}
        <p className="text-center text-sm mt-4" style={{ color: 'hsl(218 19% 27%)' }}>
          Stap {step} van {totalSteps}
        </p>
      </DialogContent>
    </Dialog>
  );
}
