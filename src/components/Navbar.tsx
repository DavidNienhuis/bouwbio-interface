import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="border-b border-border sticky top-0 z-50 bg-card">
      <div className="container mx-auto px-6 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Bouwbioloog logo" 
              className="h-10 w-auto"
            />
            <span className="font-heading font-medium text-lg uppercase tracking-wider text-foreground">
              Bouwbioloog
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="font-heading text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/projecten" 
                  className="font-heading text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                >
                  Projecten
                </Link>
                <Link 
                  to="/validatie" 
                  className="font-heading text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                >
                  Validatie
                </Link>
                <Link 
                  to="/profiel" 
                  className="font-heading text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                >
                  Profiel
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => signOut()}
                  className="gap-2 border-border text-muted-foreground hover:text-primary hover:border-primary"
                >
                  <LogOut className="w-4 h-4" />
                  Uitloggen
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/#features" 
                  className="font-heading text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="border-border text-muted-foreground hover:text-primary hover:border-primary"
                >
                  Login
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  Gratis Proberen
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
