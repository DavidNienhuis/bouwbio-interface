import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const COOKIE_CONSENT_KEY = "cookie_consent";

type ConsentStatus = "accepted" | "declined" | "pending";

export const CookieConsent = () => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>("pending");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent === "accepted" || savedConsent === "declined") {
      setConsentStatus(savedConsent);
      setIsVisible(false);
    } else {
      // Small delay before showing banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setConsentStatus("accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setConsentStatus("declined");
    setIsVisible(false);
  };

  if (!isVisible || consentStatus !== "pending") {
    return null;
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500"
      style={{ background: 'hsl(186 100% 10%)' }}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 pr-4">
            <h3 
              className="font-heading font-semibold text-lg mb-2"
              style={{ color: '#FFFFFF' }}
            >
              Wij gebruiken cookies
            </h3>
            <p 
              className="text-sm leading-relaxed"
              style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              Wij gebruiken cookies om uw ervaring te verbeteren en onze diensten te analyseren. 
              Door op "Accepteren" te klikken, gaat u akkoord met ons gebruik van cookies. 
              Lees meer in ons{' '}
              <a 
                href="/privacy" 
                className="underline transition-colors"
                style={{ color: 'hsl(142 64% 62%)' }}
              >
                Privacybeleid
              </a>.
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="font-heading uppercase text-sm tracking-wide border-2 rounded-none px-6"
              style={{ 
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                background: 'transparent'
              }}
            >
              Weigeren
            </Button>
            <Button
              onClick={handleAccept}
              className="font-heading uppercase text-sm tracking-wide rounded-none px-6"
              style={{ 
                background: 'hsl(142 64% 62%)',
                color: 'hsl(186 100% 10%)'
              }}
            >
              Accepteren
            </Button>
            <button
              onClick={handleDecline}
              className="p-2 transition-colors md:hidden"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              aria-label="Sluiten"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
