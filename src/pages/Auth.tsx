import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { ValidationFooter } from '@/components/ValidationFooter';

const loginSchema = z.object({
  email: z.string().email('Ongeldig emailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 karakters zijn'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Naam moet minimaal 2 karakters zijn'),
  email: z.string().email('Ongeldig emailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 karakters zijn'),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  );
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    try {
      loginSchema.parse(data);
      setLoading(true);
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast.error(error.message || 'Login mislukt');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    try {
      signupSchema.parse(data);
      setLoading(true);
      const { error } = await signUp(data.email, data.password, data.fullName);
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Dit emailadres is al geregistreerd');
        } else {
          toast.error(error.message || 'Registratie mislukt');
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(180 14% 97%)' }}>
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center py-16 px-6">
        <Card className="w-full max-w-md" style={{ border: '1px solid hsl(218 14% 85%)' }}>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              {mode === 'login' ? 'Inloggen' : 'Account Aanmaken'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? 'Log in om verder te gaan met validaties' 
                : 'Maak een gratis account aan om te beginnen'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="naam@bedrijf.nl" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Wachtwoord</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="••••••" 
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Bezig...' : 'Inloggen'}
                </Button>
                <p className="text-sm text-center text-muted">
                  Nog geen account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="font-medium underline"
                    style={{ color: 'hsl(142 64% 62%)' }}
                  >
                    Registreer hier
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Volledige Naam</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    type="text" 
                    placeholder="Jan Jansen" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="naam@bedrijf.nl" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Wachtwoord</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="Minimaal 6 karakters" 
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Bezig...' : 'Account Aanmaken'}
                </Button>
                <p className="text-sm text-center text-muted">
                  Al een account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-medium underline"
                    style={{ color: 'hsl(142 64% 62%)' }}
                  >
                    Log hier in
                  </button>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <ValidationFooter />
    </div>
  );
}
