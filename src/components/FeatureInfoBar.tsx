import { Cpu, FileText, Zap, Gift } from "lucide-react";

interface FeatureInfoBarProps {
  onDismiss?: () => void;
}

const features = [
  {
    icon: Cpu,
    title: "AI-Analyse",
    description: "Automatische compliance check",
  },
  {
    icon: FileText,
    title: "PDF Upload",
    description: "Upload je productbladen",
  },
  {
    icon: Zap,
    title: "Snel Resultaat",
    description: "Binnen 60 seconden klaar",
  },
  {
    icon: Gift,
    title: "Gratis Proberen",
    description: "Start zonder account",
  },
];

export function FeatureInfoBar({ onDismiss }: FeatureInfoBarProps) {
  return (
    <div className="w-full bg-muted/50 border-b border-border py-3 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-6 min-w-0">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-2 min-w-fit"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground whitespace-nowrap">
                    {feature.title}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground text-sm flex-shrink-0"
              aria-label="Sluiten"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
