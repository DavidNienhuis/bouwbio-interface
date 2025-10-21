import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface ValidationInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

export const ValidationInput = ({ onSubmit, isLoading }: ValidationInputProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error("Voer een validatie opdracht in");
      return;
    }

    const lowerQuery = query.toLowerCase();
    if (!lowerQuery.startsWith("label:") && 
        !lowerQuery.startsWith("emissie:") && 
        !lowerQuery.startsWith("stof:")) {
      toast.error("Start je opdracht met 'label:', 'emissie:' of 'stof:'");
      return;
    }

    onSubmit(query);
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Typ je opdracht (label:, emissie:, of stof:)…"
          disabled={isLoading}
          className="flex-1 h-12 text-base bg-card border-border focus-visible:ring-primary"
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="h-12 px-6 bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Begin met <strong>label:</strong> (GN22), <strong>emissie:</strong> (BREEAM HEA 02), of <strong>stof:</strong> (Red List)
      </p>
    </form>
  );
};
