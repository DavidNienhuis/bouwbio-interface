import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck, User, ArrowRight, Clock, Calendar, Trash2, FolderOpen } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ValidationFooter } from '@/components/ValidationFooter';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { GuidedTour } from '@/components/GuidedTour';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { toast } from 'sonner';

interface Validation {
  id: string;
  session_id: string;
  certification: string;
  product_type: { id: string; name: string; description: string };
  file_names: string[];
  status: string;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  company_name: string | null;
  onboarding_completed: boolean | null;
  tour_completed: boolean | null;
}

const dashboardTourSteps = [
  {
    target: '[data-tour="projects"]',
    title: 'Projecten',
    description: 'Beheer hier je projecten en producten. Organiseer validaties per product met EAN codes.',
    placement: 'bottom' as const,
  },
  {
    target: '[data-tour="new-validation"]',
    title: 'Nieuwe Validatie',
    description: 'Klik hier om een nieuwe BREEAM HEA02 validatie te starten. Upload je PDF documenten en ontvang direct een analyse.',
    placement: 'bottom' as const,
  },
  {
    target: '[data-tour="profile"]',
    title: 'Mijn Profiel',
    description: 'Beheer hier je account instellingen, wijzig je naam en bedrijfsinformatie.',
    placement: 'bottom' as const,
  },
  {
    target: '[data-tour="history"]',
    title: 'Validatie Geschiedenis',
    description: 'Hier vind je al je eerdere validaties terug. Je kunt ze bekijken of verwijderen.',
    placement: 'top' as const,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [validations, setValidations] = useState<Validation[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (user) {
      fetchValidations();
      fetchProfile();
    }
  }, [user]);

  // Listen for tour start event from onboarding wizard
  useEffect(() => {
    const handleStartTour = () => {
      setShowTour(true);
    };

    window.addEventListener('start-guided-tour', handleStartTour);
    return () => window.removeEventListener('start-guided-tour', handleStartTour);
  }, []);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, company_name, onboarding_completed, tour_completed')
      .eq('id', user?.id)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
      // Show onboarding if not completed
      if (!data.onboarding_completed) {
        setShowOnboarding(true);
      }
    }
  };

  const fetchValidations = async () => {
    const { data, error } = await supabase
      .from('validations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching validations:', error);
    } else {
      setValidations((data as unknown as Validation[]) || []);
    }
    setLoading(false);
  };

  const deleteValidation = async (id: string) => {
    const { error } = await supabase
      .from('validations')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Verwijderen mislukt');
    } else {
      toast.success('Validatie verwijderd');
      setValidations(prev => prev.filter(v => v.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'hsl(142 64% 62%)';
      case 'pending':
        return 'hsl(45 93% 47%)';
      default:
        return 'hsl(218 14% 85%)';
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchProfile(); // Refresh profile to get updated state
  };

  const handleTourComplete = () => {
    setShowTour(false);
    fetchProfile();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(180 14% 97%)' }}>
      <Navbar />

      {/* Onboarding Wizard */}
      {user && showOnboarding && (
        <OnboardingWizard
          open={showOnboarding}
          onComplete={handleOnboardingComplete}
          userId={user.id}
          initialName={profile?.full_name || ''}
          initialCompany={profile?.company_name || ''}
        />
      )}

      {/* Guided Tour */}
      {user && showTour && (
        <GuidedTour
          userId={user.id}
          onComplete={handleTourComplete}
          steps={dashboardTourSteps}
        />
      )}

      <div className="flex-1 py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Welcome Header */}
          <div className="mb-12">
            <h1 className="font-heading font-medium text-4xl mb-2" style={{ color: 'hsl(190 16% 12%)' }}>
              Welkom terug{profile?.full_name ? `, ${profile.full_name}` : ''}
            </h1>
            <p className="text-lg" style={{ color: 'hsl(218 19% 27%)' }}>
              {user?.email}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card 
              data-tour="projects"
              className="cursor-pointer transition-all hover:shadow-lg"
              style={{ border: '1px solid hsl(218 14% 85%)' }}
              onClick={() => navigate('/projecten')}
            >
              <CardHeader>
                <div 
                  className="w-12 h-12 flex items-center justify-center mb-4"
                  style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
                >
                  <FolderOpen className="w-6 h-6" />
                </div>
                <CardTitle className="font-heading flex items-center justify-between">
                  Projecten
                  <ArrowRight className="w-5 h-5" style={{ color: 'hsl(142 64% 62%)' }} />
                </CardTitle>
                <CardDescription>
                  Beheer je projecten en producten met EAN codes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              data-tour="new-validation"
              className="cursor-pointer transition-all hover:shadow-lg"
              style={{ border: '1px solid hsl(218 14% 85%)' }}
              onClick={() => navigate('/validatie')}
            >
              <CardHeader>
                <div 
                  className="w-12 h-12 flex items-center justify-center mb-4"
                  style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
                >
                  <FileCheck className="w-6 h-6" />
                </div>
                <CardTitle className="font-heading flex items-center justify-between">
                  Nieuwe Validatie
                  <ArrowRight className="w-5 h-5" style={{ color: 'hsl(142 64% 62%)' }} />
                </CardTitle>
                <CardDescription>
                  Start een nieuwe BREEAM HEA02 validatie met PDF upload
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              data-tour="profile"
              className="cursor-pointer transition-all hover:shadow-lg"
              style={{ border: '1px solid hsl(218 14% 85%)' }}
              onClick={() => navigate('/profiel')}
            >
              <CardHeader>
                <div 
                  className="w-12 h-12 flex items-center justify-center mb-4"
                  style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
                >
                  <User className="w-6 h-6" />
                </div>
                <CardTitle className="font-heading flex items-center justify-between">
                  Mijn Profiel
                  <ArrowRight className="w-5 h-5" style={{ color: 'hsl(142 64% 62%)' }} />
                </CardTitle>
                <CardDescription>
                  Beheer je account instellingen en profiel informatie
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Validation History */}
          <Card data-tour="history" style={{ border: '1px solid hsl(218 14% 85%)' }}>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recente Validaties
              </CardTitle>
              <CardDescription>
                Je laatste {validations.length} validaties
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Laden...</div>
              ) : validations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Nog geen validaties uitgevoerd</p>
                  <Button onClick={() => navigate('/validatie')}>
                    Start je eerste validatie
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {validations.map((validation) => (
                    <div 
                      key={validation.id}
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{ background: 'hsl(180 14% 97%)', border: '1px solid hsl(218 14% 85%)' }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="w-2 h-2 rounded-full"
                            style={{ background: getStatusColor(validation.status) }}
                          />
                          <span className="font-medium font-heading">
                            {validation.product_type?.name || 'Onbekend product'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm" style={{ color: 'hsl(218 19% 27%)' }}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(validation.created_at), 'dd MMM yyyy, HH:mm', { locale: nl })}
                          </span>
                          <span>
                            {validation.file_names?.length || 0} bestand(en)
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteValidation(validation.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ValidationFooter />
    </div>
  );
}
