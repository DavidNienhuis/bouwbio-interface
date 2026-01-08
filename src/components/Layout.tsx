import { ReactNode } from 'react';
import { useEmbedded } from '@/contexts/EmbeddedContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { ValidationFooter } from '@/components/ValidationFooter';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
}

export function Layout({ children, showNavbar = true, showFooter = true }: LayoutProps) {
  const { isEmbedded } = useEmbedded();
  const { user } = useAuth();

  // Authenticated users get sidebar navigation
  if (user) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full embedded-with-sidebar">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-10 flex items-center bg-muted/50 border-b border-border/30 px-3 sticky top-0 z-40">
              <SidebarTrigger />
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Non-authenticated users: minimal layout (embedded mode)
  return (
    <div className={`min-h-screen flex flex-col bg-background ${isEmbedded ? 'embedded-mode' : ''}`}>
      {!isEmbedded && showNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isEmbedded && showFooter && <ValidationFooter />}
    </div>
  );
}
