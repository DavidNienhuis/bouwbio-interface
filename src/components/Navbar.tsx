import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav 
      className="border-b sticky top-0 z-50"
      style={{ 
        background: 'hsl(186 100% 10%)',
        borderColor: 'hsl(186 100% 15%)'
      }}
    >
      <div className="container mx-auto px-6 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Bouwbioloog logo" 
              className="h-10 w-auto"
            />
            <span 
              className="font-heading font-medium text-lg uppercase tracking-wider"
              style={{ color: '#FFFFFF' }}
            >
              Bouwbioloog
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="font-heading text-sm uppercase tracking-wider transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(142 64% 62%)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/projecten" 
                  className="font-heading text-sm uppercase tracking-wider transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(142 64% 62%)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
                >
                  Projecten
                </Link>
                <Link 
                  to="/validatie" 
                  className="font-heading text-sm uppercase tracking-wider transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(142 64% 62%)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
                >
                  Validatie
                </Link>
                <Link 
                  to="/profiel" 
                  className="font-heading text-sm uppercase tracking-wider transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(142 64% 62%)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
                >
                  Profiel
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => signOut()}
                  className="gap-2"
                  style={{ 
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Uitloggen
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/#features" 
                  className="font-heading text-sm uppercase tracking-wider transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(142 64% 62%)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
                >
                  Features
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/auth')}
                  style={{ 
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}
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
