import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";

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
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed hsl(var(--line))`,
          borderRadius: 'var(--radius)',
          padding: '3rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'hsl(var(--panel))' : 'transparent',
          transition: 'background 0.2s'
        }}
      >
        {isUploading ? (
          <Loader2 className="h-12 w-12 mx-auto animate-spin" style={{ color: 'hsl(var(--accent))' }} />
        ) : (
          <>
            <Upload className="h-12 w-12 mx-auto mb-4" style={{ color: 'hsl(var(--muted))' }} />
            <p className="text-lg" style={{ color: 'hsl(var(--ink))' }}>
              Sleep hier je SDS of productblad
            </p>
            <p className="mono mt-2" style={{ color: 'hsl(var(--muted))' }}>
              Of klik om bestanden te kiezen • Alleen PDF
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
      
      <p className="mono mt-4" style={{ color: 'hsl(var(--muted))', fontSize: '0.85rem' }}>
        ⚠️ Bestanden worden naar de webhook gestuurd voor analyse – geen automatisch contact met leveranciers
      </p>
    </section>
  );
};
