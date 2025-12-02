import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

const resetSchema = z.object({
  email: z.string().email('Ongeldig emailadres'),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  );
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword, user } = useAuth();
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message || 'Google login mislukt');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(180 14% 97%)' }}>
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center py-16 px-6">
        <Card className="w-full max-w-md" style={{ border: '1px solid hsl(218 14% 85%)' }}>
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
            {/* Google Login Button */}
            {mode !== 'forgot' && (
              <>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full gap-2" 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Doorgaan met Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      of met email
                    </span>
                  </div>
                </div>
              </>
            )}

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
                      className="text-xs underline"
                      style={{ color: 'hsl(142 64% 62%)' }}
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
                    className="font-medium underline"
                    style={{ color: 'hsl(142 64% 62%)' }}
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
                    className="font-medium underline"
                    style={{ color: 'hsl(142 64% 62%)' }}
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
                    className="font-medium underline"
                    style={{ color: 'hsl(142 64% 62%)' }}
                  >
                    Terug naar login
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
