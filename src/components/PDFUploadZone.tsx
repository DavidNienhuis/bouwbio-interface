import { useState, useRef } from "react";
import { Upload, Loader2, FileText, Zap } from "lucide-react";

interface PDFUploadZoneProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
}

export const PDFUploadZone = ({ onUpload, isUploading }: PDFUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (files.length > 0) onUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <section className="upload-zone">
      <div
        className={`upload-area transition-all duration-300 ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        style={{
          border: isDragging 
            ? `2px solid hsl(var(--accent))` 
            : `2px dashed hsla(var(--line), 0.6)`,
          borderRadius: 'var(--radius)',
          padding: '4rem 3rem',
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          background: isDragging 
            ? 'radial-gradient(circle at center, hsla(var(--accent), 0.15), hsla(var(--accent), 0.05))' 
            : 'linear-gradient(135deg, hsla(var(--panel), 0.6), hsla(var(--panel), 0.8))',
          boxShadow: isDragging 
            ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 60px hsla(var(--accent), 0.15), 0 0 40px hsla(var(--accent), 0.2)' 
            : '0 4px 24px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Tech Grid Background */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.04,
            backgroundImage: `
              linear-gradient(hsla(var(--accent), 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsla(var(--accent), 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            pointerEvents: 'none'
          }}
        />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          {isUploading ? (
            <div className="space-y-4">
              <div className="relative">
                <Loader2 className="h-16 w-16 mx-auto animate-spin" style={{ color: 'hsl(var(--accent))' }} />
                <div 
                  className="absolute inset-0 blur-xl"
                  style={{
                    background: 'radial-gradient(circle, hsla(var(--accent), 0.3), transparent)',
                  }}
                />
              </div>
              <p className="mono font-medium text-base" style={{ color: 'hsl(var(--accent))' }}>
                AI ANALYSE LOPEND...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div 
                className="inline-flex items-center justify-center rounded-lg mx-auto relative"
                style={{
                  width: '96px',
                  height: '96px',
                  background: 'linear-gradient(135deg, hsla(var(--accent), 0.2), hsla(var(--secondary), 0.15))',
                  border: '2px solid hsla(var(--accent), 0.3)',
                  boxShadow: '0 0 30px hsla(var(--accent), 0.2)'
                }}
              >
                <Upload className="h-10 w-10" style={{ color: 'hsl(var(--accent))' }} />
                <Zap 
                  className="h-4 w-4 absolute top-2 right-2" 
                  style={{ color: 'hsl(var(--secondary))' }} 
                />
              </div>
              
              <div className="space-y-3">
                <p 
                  className="text-2xl font-medium" 
                  style={{ 
                    color: 'hsl(var(--ink))', 
                    fontFamily: 'IBM Plex Mono',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Sleep documenten hier
                </p>
                <p className="mono text-sm" style={{ color: 'hsl(var(--muted))' }}>
                  SDS · EPD · Productbladen
                </p>
              </div>
              
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md"
                style={{
                  background: 'hsla(var(--accent), 0.08)',
                  border: '1px solid hsla(var(--accent), 0.2)'
                }}
              >
                <FileText className="h-4 w-4" style={{ color: 'hsl(var(--accent))' }} />
                <span className="mono text-xs font-medium" style={{ color: 'hsl(var(--accent))' }}>
                  PDF FORMAT
                </span>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={isUploading}
          />
        </div>
      </div>
      
      <div 
        className="mt-4 p-4 rounded-md"
        style={{
          background: 'hsla(var(--warning), 0.08)',
          border: '1px solid hsla(var(--warning), 0.25)'
        }}
      >
        <p className="mono text-sm leading-relaxed" style={{ color: 'hsl(var(--ink))' }}>
          <span style={{ color: 'hsl(var(--warning))', fontWeight: 600 }}>⚡ AI-GEDREVEN VALIDATIE</span> · Gegevens worden via beveiligde webhook verwerkt · Geen direct contact met leveranciers
        </p>
      </div>
    </section>
  );
};
