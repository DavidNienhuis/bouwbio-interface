import { useState, useEffect, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X, AlertTriangle, Quote } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSignedUrl, StoredFile } from "@/lib/storageClient";
import { toast } from "sonner";

// PDF.js worker configuratie
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Import CSS for react-pdf
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storedFile: StoredFile | null;
  initialPage?: number;
  citaat?: string;
}

export const PDFViewerModal = ({
  isOpen,
  onClose,
  storedFile,
  initialPage = 1,
  citaat
}: PDFViewerModalProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [citaatFound, setCitaatFound] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

  // Load PDF URL when modal opens
  useEffect(() => {
    if (isOpen && storedFile) {
      setIsLoading(true);
      setLoadError(null);
      setCitaatFound(null);
      
      getSignedUrl(storedFile.storage_path)
        .then((url) => {
          setPdfUrl(url);
        })
        .catch((error) => {
          console.error("Error loading PDF URL:", error);
          setLoadError("Kon PDF niet laden");
          setIsLoading(false);
        });
    } else {
      setPdfUrl(null);
    }
  }, [isOpen, storedFile]);

  // Reset page when initialPage changes
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Highlight citaat text in the PDF
  const highlightCitaat = useCallback(() => {
    if (!citaat || !textLayerRef.current) return;
    
    // Remove existing highlights
    const existingHighlights = document.querySelectorAll('.pdf-highlight');
    existingHighlights.forEach(el => el.classList.remove('pdf-highlight'));
    
    // Find and highlight the citaat text
    const textLayer = textLayerRef.current.querySelector('.react-pdf__Page__textContent');
    if (!textLayer) return;
    
    const textSpans = textLayer.querySelectorAll('span');
    let found = false;
    
    // Normalize search text
    const searchText = citaat.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Build full text with proper position mapping between normalized and original text
    let fullText = '';
    let normalizedText = '';
    const charMap: number[] = []; // Maps normalized position -> original position
    
    textSpans.forEach((span) => {
      const text = span.textContent || '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const normalizedChar = char.toLowerCase();
        
        // For whitespace: collapse multiple spaces in normalized version
        if (/\s/.test(char)) {
          if (!normalizedText.endsWith(' ') && normalizedText.length > 0) {
            charMap.push(fullText.length);
            normalizedText += ' ';
          }
          fullText += char;
        } else {
          charMap.push(fullText.length);
          normalizedText += normalizedChar;
          fullText += char;
        }
      }
    });
    
    // Find citaat in normalized text
    const citaatIndex = normalizedText.indexOf(searchText);
    
    if (citaatIndex !== -1) {
      // Map normalized positions back to original positions
      const originalStart = charMap[citaatIndex] ?? 0;
      const citaatEndIndex = Math.min(citaatIndex + searchText.length - 1, charMap.length - 1);
      const originalEnd = (charMap[citaatEndIndex] ?? fullText.length - 1) + 1;
      
      // Track current position in original text and highlight matching spans
      let currentPos = 0;
      let firstHighlighted = false;
      
      textSpans.forEach((span) => {
        const spanText = span.textContent || '';
        const spanStart = currentPos;
        const spanEnd = currentPos + spanText.length;
        
        // Check if this span overlaps with the citaat in original text
        if (spanStart < originalEnd && spanEnd > originalStart) {
          (span as HTMLElement).classList.add('pdf-highlight');
          found = true;
          
          // Scroll to first highlighted element
          if (!firstHighlighted) {
            firstHighlighted = true;
            setTimeout(() => {
              (span as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }
        }
        
        currentPos = spanEnd;
      });
    }
    
    setCitaatFound(found);
    
    if (!found && citaat) {
      console.warn('Citaat niet gevonden in PDF tekst:', citaat);
      console.debug('Gezocht (normalized):', searchText);
      console.debug('Beschikbare tekst (eerste 300 chars):', normalizedText.substring(0, 300));
    }
  }, [citaat]);

  // Apply highlighting after page renders
  useEffect(() => {
    if (!isLoading && citaat) {
      // Wait for text layer to render
      const timer = setTimeout(() => {
        highlightCitaat();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, currentPage, citaat, highlightCitaat]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setLoadError("PDF kon niet worden geladen");
    setIsLoading(false);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const handleFallbackOpen = () => {
    if (pdfUrl) {
      const url = initialPage > 1 ? `${pdfUrl}#page=${initialPage}` : pdfUrl;
      window.open(url, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base truncate">
              📄 {storedFile?.original_name || 'PDF Viewer'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <Button variant="outline" size="icon" onClick={zoomOut} disabled={scale <= 0.5}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm min-w-[4rem] text-center">{Math.round(scale * 100)}%</span>
              <Button variant="outline" size="icon" onClick={zoomIn} disabled={scale >= 3}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              {/* Download */}
              <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              
              {/* Close */}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        {/* PDF Content */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto bg-muted/30 flex justify-center"
        >
          {loadError ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <p className="text-destructive">{loadError}</p>
              <Button onClick={handleFallbackOpen} variant="outline">
                Open in nieuw tabblad
              </Button>
            </div>
          ) : isLoading && !pdfUrl ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pdfUrl ? (
            <div ref={textLayerRef} className="py-4">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  loading={
                    <div className="flex items-center justify-center h-96">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  }
                />
              </Document>
            </div>
          ) : null}
        </div>

        {/* Footer with navigation and citaat */}
        <div className="border-t flex-shrink-0">
          {/* Citaat display */}
          {citaat && (
            <div className={`p-3 border-b ${citaatFound === false ? 'bg-yellow-50 dark:bg-yellow-950/20' : 'bg-blue-50 dark:bg-blue-950/20'}`}>
              <div className="flex items-start gap-2">
                <Quote className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Gezochte tekst:</p>
                  <p className="text-sm italic truncate">{citaat}</p>
                </div>
                {citaatFound === false && (
                  <Alert variant="default" className="py-1 px-2 bg-transparent border-0">
                    <AlertDescription className="text-xs text-yellow-700 dark:text-yellow-300">
                      Tekst niet gevonden op deze pagina
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
          
          {/* Page navigation */}
          <div className="p-3 flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={goToPrevPage} 
              disabled={currentPage <= 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Vorige
            </Button>
            
            <span className="text-sm">
              Pagina <strong>{currentPage}</strong> van <strong>{numPages || '...'}</strong>
            </span>
            
            <Button 
              variant="outline" 
              onClick={goToNextPage} 
              disabled={currentPage >= numPages}
              className="gap-1"
            >
              Volgende
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
      
      {/* CSS for highlighting */}
      <style>{`
        .pdf-highlight {
          background-color: #fef08a !important;
          border-radius: 2px;
          box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.4);
          animation: highlight-pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes highlight-pulse {
          0%, 100% { background-color: #fef08a; }
          50% { background-color: #fde047; }
        }
      `}</style>
    </Dialog>
  );
};
