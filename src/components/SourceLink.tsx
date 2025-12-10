import { useState } from "react";
import { FileText, ExternalLink, Loader2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findStoredFileByName, StoredFile } from "@/lib/storageClient";
import { PDFViewerModal } from "@/components/PDFViewerModal";
import type { Bron, BronReference } from "@/lib/webhookClient";

interface SourceLinkProps {
  /** De bron tekst (string) of object met bestand, pagina en citaat */
  bron: Bron;
  /** Array van opgeslagen bestanden van deze validatie */
  sourceFiles?: StoredFile[];
  /** Optionele className voor styling */
  className?: string;
  /** Weergave variant */
  variant?: "link" | "badge" | "text";
}

// Helper om bron te parsen naar unified format
const parseBron = (bron: Bron): { filename: string; page?: number; citaat?: string } => {
  // Object format (nieuw)
  if (typeof bron === 'object' && bron !== null) {
    return {
      filename: bron.bestand,
      page: bron.pagina,
      citaat: bron.citaat
    };
  }
  
  // String format (legacy) - parse "filename, pagina X" of "filename (pagina X)"
  const bronText = String(bron);
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

// Helper om display tekst te maken
const getDisplayText = (filename: string, page?: number, citaat?: string): string => {
  let text = `Bron: ${filename}`;
  if (page) {
    text += `, pagina ${page}`;
  }
  return text;
};

export const SourceLink = ({ 
  bron, 
  sourceFiles = [], 
  className = "",
  variant = "text"
}: SourceLinkProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { filename, page, citaat } = parseBron(bron);
  const storedFile = findStoredFileByName(sourceFiles, filename);
  const isClickable = !!storedFile;
  const displayText = getDisplayText(filename, page, citaat);
  
  const handleClick = () => {
    if (!storedFile) {
      return;
    }
    setIsModalOpen(true);
  };
  
  // Text variant (inline)
  if (variant === "text") {
    if (!isClickable) {
      return (
        <span className={`text-xs text-muted-foreground ${className}`}>
          {displayText}
        </span>
      );
    }
    
    return (
      <>
        <button
          onClick={handleClick}
          className={`text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer ${className}`}
        >
          <FileText className="w-3 h-3" />
          {displayText}
          {citaat && <Quote className="w-3 h-3 text-muted-foreground" />}
          <ExternalLink className="w-3 h-3" />
        </button>
        
        <PDFViewerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          storedFile={storedFile}
          initialPage={page || 1}
          citaat={citaat}
        />
      </>
    );
  }
  
  // Badge variant
  if (variant === "badge") {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={!isClickable}
          className={`h-6 text-xs gap-1 ${className}`}
        >
          <FileText className="w-3 h-3" />
          {filename}
          {page && <span className="text-muted-foreground">(p.{page})</span>}
          {citaat && <Quote className="w-3 h-3 text-muted-foreground" />}
          {isClickable && <ExternalLink className="w-3 h-3" />}
        </Button>
        
        {isClickable && (
          <PDFViewerModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            storedFile={storedFile}
            initialPage={page || 1}
            citaat={citaat}
          />
        )}
      </>
    );
  }
  
  // Link variant
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={!isClickable}
        className={`p-0 h-auto font-normal text-primary hover:underline ${className}`}
      >
        <FileText className="w-3 h-3 mr-1" />
        {typeof bron === 'string' ? bron : `${filename}${page ? `, pagina ${page}` : ''}`}
        {citaat && <Quote className="w-3 h-3 ml-1 text-muted-foreground" />}
        {isClickable && <ExternalLink className="w-3 h-3 ml-1" />}
      </Button>
      
      {isClickable && (
        <PDFViewerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          storedFile={storedFile}
          initialPage={page || 1}
          citaat={citaat}
        />
      )}
    </>
  );
};
