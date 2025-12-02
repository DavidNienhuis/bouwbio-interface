import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck, User, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ValidationFooter } from '@/components/ValidationFooter';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(180 14% 97%)' }}>
      <Navbar />

      <div className="flex-1 py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Welcome Header */}
          <div className="mb-12">
            <h1 className="font-heading font-medium text-4xl mb-2" style={{ color: 'hsl(190 16% 12%)' }}>
              Welkom terug
            </h1>
            <p className="text-lg" style={{ color: 'hsl(218 19% 27%)' }}>
              {user?.email}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card 
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

          {/* Info Section */}
          <Card style={{ border: '1px solid hsl(218 14% 85%)' }}>
            <CardHeader>
              <CardTitle className="font-heading">Aan de slag</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-heading font-medium mb-2" style={{ color: 'hsl(190 16% 12%)' }}>
                  Validatie Proces
                </h4>
                <p className="text-sm" style={{ color: 'hsl(218 19% 27%)' }}>
                  1. Selecteer BREEAM HEA02 certificering<br />
                  2. Kies je producttype<br />
                  3. Upload je PDF documenten<br />
                  4. Ontvang gedetailleerd validatierapport
                </p>
              </div>
              <div className="pt-4">
                <Button onClick={() => navigate('/validatie')}>
                  Start Nieuwe Validatie
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ValidationFooter />
    </div>
  );
}
