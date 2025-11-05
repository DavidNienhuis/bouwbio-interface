import { useState, useRef } from "react";
import { Upload, Loader2, FileText } from "lucide-react";

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
        className={`upload-area transition-all duration-200 ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        style={{
          border: isDragging 
            ? `2px solid hsl(var(--accent))` 
            : `2px dashed hsl(var(--line))`,
          borderRadius: 'var(--radius)',
          padding: '4rem 3rem',
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          background: isDragging 
            ? 'linear-gradient(135deg, hsla(var(--accent), 0.05), hsla(var(--accent), 0.1))' 
            : 'linear-gradient(135deg, hsla(var(--panel), 0.4), hsla(var(--panel), 0.6))',
          boxShadow: isDragging 
            ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 40px hsla(var(--accent), 0.1)' 
            : '0 2px 16px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Pattern */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, hsl(var(--line)) 35px, hsl(var(--line)) 36px)`,
            pointerEvents: 'none'
          }}
        />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="h-16 w-16 mx-auto animate-spin" style={{ color: 'hsl(var(--accent))' }} />
              <p className="mono" style={{ color: 'hsl(var(--accent))' }}>
                Analyseren...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div 
                className="inline-flex items-center justify-center rounded-full mx-auto"
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, hsla(var(--accent), 0.15), hsla(var(--accent), 0.05))',
                  border: '2px solid hsla(var(--accent), 0.2)'
                }}
              >
                <Upload className="h-8 w-8" style={{ color: 'hsl(var(--accent))' }} />
              </div>
              
              <div className="space-y-3">
                <p className="text-xl font-medium" style={{ color: 'hsl(var(--ink))', fontFamily: 'IBM Plex Mono' }}>
                  Sleep SDS of productblad hier
                </p>
                <p className="mono text-sm" style={{ color: 'hsl(var(--muted))' }}>
                  Of klik om bestanden te selecteren
                </p>
              </div>
              
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md"
                style={{
                  background: 'hsla(var(--panel), 0.6)',
                  border: '1px solid hsl(var(--line))'
                }}
              >
                <FileText className="h-4 w-4" style={{ color: 'hsl(var(--muted))' }} />
                <span className="mono text-xs" style={{ color: 'hsl(var(--muted))' }}>
                  Alleen PDF-bestanden
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
          background: 'hsla(var(--warning), 0.05)',
          border: '1px solid hsla(var(--warning), 0.2)'
        }}
      >
        <p className="mono text-sm" style={{ color: 'hsl(var(--muted))', lineHeight: '1.6' }}>
          ⚠️ Bestanden worden naar de webhook gestuurd voor analyse – geen automatisch contact met leveranciers
        </p>
      </div>
    </section>
  );
};
