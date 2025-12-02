import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { ValidationFooter } from '@/components/ValidationFooter';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
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
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(180 14% 97%)' }}>
      <Navbar />

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
            <h1 className="font-heading font-medium text-4xl" style={{ color: 'hsl(190 16% 12%)' }}>
              Mijn Profiel
            </h1>
            <p className="text-lg mt-2" style={{ color: 'hsl(218 19% 27%)' }}>
              Beheer je account gegevens
            </p>
          </div>

          <div className="space-y-6">
            <Card style={{ border: '1px solid hsl(218 14% 85%)' }}>
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
                    <p className="text-xs" style={{ color: 'hsl(218 19% 27%)' }}>
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

            <Card style={{ border: '1px solid hsl(218 14% 85%)' }}>
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
                  style={{ borderColor: 'hsl(0 84% 60%)', color: 'hsl(0 84% 60%)' }}
                >
                  Uitloggen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ValidationFooter />
    </div>
  );
}
