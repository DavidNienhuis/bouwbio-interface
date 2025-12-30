import { ReactNode } from 'react';
import { useEmbedded } from '@/contexts/EmbeddedContext';
import { Navbar } from '@/components/Navbar';
import { ValidationFooter } from '@/components/ValidationFooter';

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
}

export function Layout({ children, showNavbar = true, showFooter = true }: LayoutProps) {
  const { isEmbedded } = useEmbedded();

  return (
    <div className={`min-h-screen flex flex-col bg-background ${isEmbedded ? 'embedded-mode' : ''}`}>
      {!isEmbedded && showNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isEmbedded && showFooter && <ValidationFooter />}
    </div>
  );
}
