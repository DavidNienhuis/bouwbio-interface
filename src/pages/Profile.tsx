import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  tour_completed: boolean | null;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, company_name, tour_completed')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data as Profile);
      setFullName(data.full_name || '');
      setCompanyName(data.company_name || '');
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Kon profiel niet laden');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          company_name: companyName,
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast.success('Profiel bijgewerkt!');
      loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Kon profiel niet bijwerken');
    } finally {
      setLoading(false);
    }
  };

  const handleRestartTour = async () => {
    try {
      await supabase
        .from('profiles')
        .update({ tour_completed: false })
        .eq('id', user?.id);

      toast.success('Rondleiding wordt gestart op het Dashboard');
      navigate('/dashboard');
      
      // Trigger tour after navigation
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('start-guided-tour'));
      }, 500);
    } catch (error) {
      console.error('Error resetting tour:', error);
      toast.error('Kon rondleiding niet herstarten');
    }
  };

  return (
    <Layout>
      <div className="flex-1 py-12 px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar Dashboard
            </Button>
            <h1 className="font-heading font-normal text-4xl text-foreground">
              Mijn Profiel
            </h1>
            <p className="text-lg mt-2 text-muted-foreground">
              Beheer je account gegevens
            </p>
          </div>

          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading">Profiel Informatie</CardTitle>
                <CardDescription>
                  Update je naam en bedrijfsinformatie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user?.email || ''} 
                      disabled 
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email kan niet worden gewijzigd
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Volledige Naam</Label>
                    <Input 
                      id="fullName" 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jan Jansen"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName">Bedrijfsnaam (optioneel)</Label>
                    <Input 
                      id="companyName" 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Bouwbedrijf BV"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="gap-2">
                    <Save className="w-4 h-4" />
                    {loading ? 'Opslaan...' : 'Profiel Opslaan'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Tour Section */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading">Rondleiding</CardTitle>
                <CardDescription>
                  Bekijk de rondleiding opnieuw om de applicatie te leren kennen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={handleRestartTour}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Start Rondleiding Opnieuw
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading">Account Acties</CardTitle>
                <CardDescription>
                  Beheer je account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={() => signOut()}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Uitloggen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
