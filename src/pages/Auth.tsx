import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';

const loginSchema = z.object({
  email: z.string().email('Ongeldig emailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 karakters zijn'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Naam moet minimaal 2 karakters zijn'),
  email: z.string().email('Ongeldig emailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 karakters zijn'),
});

const resetSchema = z.object({
  email: z.string().email('Ongeldig emailadres'),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  );
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword, user } = useAuth();
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
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Onjuist emailadres of wachtwoord');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Bevestig eerst je email via de link die we hebben gestuurd');
        } else {
          toast.error(error.message || 'Login mislukt');
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else if (err instanceof Error && err.message.includes('fetch')) {
        toast.error('Netwerkfout: controleer je internetverbinding');
      } else {
        toast.error('Er is een onverwachte fout opgetreden');
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
          toast.error('Dit emailadres is al geregistreerd. Probeer in te loggen.');
        } else if (error.message.includes('Password should be')) {
          toast.error('Wachtwoord moet minimaal 6 karakters bevatten');
        } else if (error.message.includes('valid email')) {
          toast.error('Voer een geldig emailadres in');
        } else {
          toast.error(error.message || 'Registratie mislukt');
        }
      } else {
        toast.success('Account aangemaakt! Je kunt nu inloggen.');
        setMode('login');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else if (err instanceof Error && err.message.includes('fetch')) {
        toast.error('Netwerkfout: controleer je internetverbinding');
      } else {
        toast.error('Er is een onverwachte fout opgetreden');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
    };

    try {
      resetSchema.parse(data);
      setLoading(true);
      const { error } = await resetPassword(data.email);
      if (error) {
        toast.error(error.message || 'Reset mislukt');
      } else {
        setMode('login');
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
    <Layout>
      <div className="flex-1 flex items-center justify-center py-16 px-6">
        <Card className="w-full max-w-md border-border">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              {mode === 'login' && 'Inloggen'}
              {mode === 'signup' && 'Account Aanmaken'}
              {mode === 'forgot' && 'Wachtwoord Vergeten'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' && 'Log in om verder te gaan met validaties'}
              {mode === 'signup' && 'Maak een gratis account aan om te beginnen'}
              {mode === 'forgot' && 'Ontvang een link om je wachtwoord te resetten'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Login Form */}
            {mode === 'login' && (
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
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Wachtwoord</Label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs underline text-primary"
                    >
                      Wachtwoord vergeten?
                    </button>
                  </div>
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
                <p className="text-sm text-center text-muted-foreground">
                  Nog geen account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="font-medium underline text-primary"
                  >
                    Registreer hier
                  </button>
                </p>
              </form>
            )}

            {/* Signup Form */}
            {mode === 'signup' && (
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
                <p className="text-sm text-center text-muted-foreground">
                  Al een account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-medium underline text-primary"
                  >
                    Log hier in
                  </button>
                </p>
              </form>
            )}

            {/* Forgot Password Form */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Bezig...' : 'Verstuur Reset Link'}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Wachtwoord herinnerd?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-medium underline text-primary"
                  >
                    Terug naar login
                  </button>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
