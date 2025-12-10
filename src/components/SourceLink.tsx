import { useState } from "react";
import { FileText, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSignedUrl, findStoredFileByName, StoredFile } from "@/lib/storageClient";
import { toast } from "sonner";

interface SourceLinkProps {
  /** De bron tekst (bijv. "Productblad.pdf" of "Productblad.pdf, pagina 3") */
  bron: string;
  /** Array van opgeslagen bestanden van deze validatie */
  sourceFiles?: StoredFile[];
  /** Optionele className voor styling */
  className?: string;
  /** Weergave variant */
  variant?: "link" | "badge" | "text";
}

export const SourceLink = ({ 
  bron, 
  sourceFiles = [], 
  className = "",
  variant = "text"
}: SourceLinkProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Parse de bron tekst om filename en eventueel paginanummer te extraheren
  const parseBron = (bronText: string): { filename: string; page?: number } => {
    // Check voor "filename, pagina X" of "filename (pagina X)" formaat
    const pageMatch = bronText.match(/(.+?)(?:,?\s*pagina\s*(\d+)|(?:\s*\(pagina\s*(\d+)\)))?$/i);
    
    if (pageMatch) {
      const filename = pageMatch[1].trim();
      const page = pageMatch[2] || pageMatch[3];
      return {
        filename,
        page: page ? parseInt(page, 10) : undefined
      };
    }
    
    return { filename: bronText.trim() };
  };
  
  const { filename, page } = parseBron(bron);
  const storedFile = findStoredFileByName(sourceFiles, filename);
  const isClickable = !!storedFile;
  
  const handleClick = async () => {
    if (!storedFile) {
      toast.error("Bronbestand niet gevonden in opslag");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Verkrijg een signed URL (geldig voor 1 uur)
      const signedUrl = await getSignedUrl(storedFile.storage_path);
      
      // Open de PDF in een nieuw tabblad
      // Als er een paginanummer is, voeg dat toe aan de URL (PDF viewers ondersteunen #page=X)
      const finalUrl = page ? `${signedUrl}#page=${page}` : signedUrl;
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Error opening PDF:', error);
      toast.error("Kon PDF niet openen");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Text variant (inline)
  if (variant === "text") {
    if (!isClickable) {
      return (
        <span className={`text-xs text-muted-foreground ${className}`}>
          Bron: {bron}
        </span>
      );
    }
    
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <FileText className="w-3 h-3" />
        )}
        Bron: {bron}
        <ExternalLink className="w-3 h-3" />
      </button>
    );
  }
  
  // Badge variant
  if (variant === "badge") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={!isClickable || isLoading}
        className={`h-6 text-xs gap-1 ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <FileText className="w-3 h-3" />
        )}
        {filename}
        {page && <span className="text-muted-foreground">(p.{page})</span>}
        {isClickable && <ExternalLink className="w-3 h-3" />}
      </Button>
    );
  }
  
  // Link variant
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={!isClickable || isLoading}
      className={`p-0 h-auto font-normal text-primary hover:underline ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin mr-1" />
      ) : (
        <FileText className="w-3 h-3 mr-1" />
      )}
      {bron}
      {isClickable && <ExternalLink className="w-3 h-3 ml-1" />}
    </Button>
  );
};
