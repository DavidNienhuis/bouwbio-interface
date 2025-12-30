import { Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function CreditsIndicator() {
  const { user, credits, loading } = useAuth();

  // Don't show for guests or while loading
  if (!user || loading) return null;

  const hasCredits = credits > 0;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border transition-all ${
        hasCredits 
          ? 'bg-background border-border' 
          : 'bg-destructive/10 border-destructive'
      }`}
    >
      <Coins className={`w-4 h-4 ${hasCredits ? 'text-primary' : 'text-destructive'}`} />
      <span className={`text-sm font-medium ${hasCredits ? 'text-foreground' : 'text-destructive'}`}>
        {credits} credit{credits !== 1 ? 's' : ''}
      </span>
      {!hasCredits && (
        <span className="text-xs text-destructive ml-1">
          - Koop meer
        </span>
      )}
    </div>
  );
}
