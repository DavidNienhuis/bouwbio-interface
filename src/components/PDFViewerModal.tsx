import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X, AlertTriangle, Quote, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSignedUrl, StoredFile } from "@/lib/storageClient";
import { toast } from "sonner";
import { highlightCitationInPDF, type HighlightResult } from "@/lib/pdf/highlight";

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
  const [highlightResult, setHighlightResult] = useState<HighlightResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Load PDF URL when modal opens
  useEffect(() => {
    if (isOpen && storedFile) {
      setIsLoading(true);
      setLoadError(null);
      setHighlightResult(null);

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

  // Apply robust highlighting after page renders
  // Uses MutationObserver + RAF for reliable timing, fuzzy matching for robustness
  useEffect(() => {
    if (!isLoading && citaat && pageContainerRef.current) {
      // Run highlight asynchronously
      highlightCitationInPDF(pageContainerRef.current, citaat, 'pdf-highlight')
        .then((result) => {
          setHighlightResult(result);

          // Show toast feedback based on match type
          if (result.success) {
            if (result.matchType === 'fuzzy') {
              toast.info(
                `Citaat gevonden met ${Math.round((result.confidence || 0) * 100)}% zekerheid`,
                { duration: 3000 }
              );
            }
          } else {
            toast.warning(result.message || 'Citaat niet gevonden, pagina geopend', {
              duration: 4000
            });
          }

          // Debug logging
          if (!result.success) {
            console.warn('[PDF Highlight] Match failed:', result.message);
            console.debug('[PDF Highlight] Citation:', citaat.substring(0, 200));
          } else {
            console.log(
              `[PDF Highlight] ${result.matchType} match, confidence: ${result.confidence?.toFixed(2)}`
            );
          }
        })
        .catch((error) => {
          console.error('[PDF Highlight] Error:', error);
          setHighlightResult({
            success: false,
            highlightedElements: [],
            message: 'Highlight fout opgetreden'
          });
        });
    }

    // Cleanup highlights when page changes
    return () => {
      const highlights = document.querySelectorAll('.pdf-highlight');
      highlights.forEach(el => el.classList.remove('pdf-highlight'));
    };
  }, [isLoading, currentPage, citaat]);

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
            <div ref={pageContainerRef} className="py-4">
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
          {/* Citaat display with match feedback */}
          {citaat && (
            <div className={`p-3 border-b ${
              highlightResult?.success
                ? 'bg-green-50 dark:bg-green-950/20'
                : highlightResult === null
                ? 'bg-blue-50 dark:bg-blue-950/20'
                : 'bg-amber-50 dark:bg-amber-950/20'
            }`}>
              <div className="flex items-start gap-2">
                {highlightResult?.success ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                ) : (
                  <Quote className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Gezochte tekst:
                    {highlightResult?.success && highlightResult.matchType === 'fuzzy' && (
                      <span className="ml-2 text-xs text-green-700 dark:text-green-400">
                        (fuzzy match, {Math.round((highlightResult.confidence || 0) * 100)}%)
                      </span>
                    )}
                    {highlightResult?.success && highlightResult.matchType === 'exact' && (
                      <span className="ml-2 text-xs text-green-700 dark:text-green-400">
                        (exact match)
                      </span>
                    )}
                  </p>
                  <p className="text-sm italic line-clamp-2">{citaat}</p>
                </div>
                {highlightResult?.success === false && (
                  <Alert variant="default" className="py-1 px-2 bg-transparent border-0">
                    <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                      Niet gevonden
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
      
      {/* Audit-grade professional highlighting - subtle, no infinite animations */}
      <style>{`
        .pdf-highlight {
          background-color: rgba(226, 232, 240, 0.7) !important;
          border-bottom: 2px solid rgba(100, 116, 139, 0.5);
          border-radius: 2px;
          padding: 1px 0;
          animation: highlight-attention-once 0.8s ease-out;
        }

        /* Single attention pulse on load, then stays static */
        @keyframes highlight-attention-once {
          0% {
            background-color: rgba(226, 232, 240, 1);
            box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.3);
          }
          100% {
            background-color: rgba(226, 232, 240, 0.7);
            box-shadow: none;
          }
        }

        /* Dark mode support */
        .dark .pdf-highlight {
          background-color: rgba(51, 65, 85, 0.6) !important;
          border-bottom: 2px solid rgba(148, 163, 184, 0.5);
        }

        @keyframes highlight-attention-once {
          0% {
            background-color: rgba(51, 65, 85, 1);
            box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.3);
          }
          100% {
            background-color: rgba(51, 65, 85, 0.6);
            box-shadow: none;
          }
        }
      `}</style>
    </Dialog>
  );
};
