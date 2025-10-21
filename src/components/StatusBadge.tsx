import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: "running" | "done" | "failed";
  result?: string;
}

export const StatusBadge = ({ status, result }: StatusBadgeProps) => {
  const getStatusConfig = () => {
    if (status === "running") {
      return {
        icon: Loader2,
        label: "Aan het valideren...",
        variant: "secondary" as const,
        className: "animate-pulse",
        iconClassName: "animate-spin"
      };
    }
    
    if (status === "failed") {
      return {
        icon: XCircle,
        label: "Validatie mislukt",
        variant: "destructive" as const,
        className: "",
        iconClassName: ""
      };
    }

    // status === "done", check result for specific status
    if (result) {
      const lowerResult = result.toLowerCase();
      
      if (lowerResult.includes("voldoet") && !lowerResult.includes("niet voldoet") || 
          lowerResult.includes("red list-vrij")) {
        return {
          icon: CheckCircle2,
          label: "Voldoet",
          variant: "default" as const,
          className: "bg-success text-success-foreground hover:bg-success/90",
          iconClassName: ""
        };
      }
      
      if (lowerResult.includes("onvoldoende gegevens")) {
        return {
          icon: AlertCircle,
          label: "Onvoldoende gegevens",
          variant: "default" as const,
          className: "bg-warning text-warning-foreground hover:bg-warning/90",
          iconClassName: ""
        };
      }
      
      if (lowerResult.includes("niet voldoet") || lowerResult.includes("red list")) {
        return {
          icon: XCircle,
          label: "Niet voldoet",
          variant: "destructive" as const,
          className: "",
          iconClassName: ""
        };
      }
    }

    return {
      icon: CheckCircle2,
      label: "Voltooid",
      variant: "default" as const,
      className: "bg-primary text-primary-foreground",
      iconClassName: ""
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1.5 ${config.className}`}>
      <Icon className={`h-3.5 w-3.5 ${config.iconClassName}`} />
      {config.label}
    </Badge>
  );
};
