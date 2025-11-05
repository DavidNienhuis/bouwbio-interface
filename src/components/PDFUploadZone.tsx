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
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      style={{
        border: isDragging ? '2px solid #333' : '1px solid #ddd',
        borderRadius: '8px',
        padding: '32px 24px',
        textAlign: 'center',
        cursor: isUploading ? 'not-allowed' : 'pointer',
        background: '#ffffff',
        transition: 'all 0.2s'
      }}
    >
      {isUploading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#333' }} />
          <span style={{ fontSize: '14px', color: '#666' }}>Uploaden...</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Upload className="h-8 w-8" style={{ color: '#333' }} />
          <div>
            <p style={{ fontSize: '14px', color: '#333', marginBottom: '4px' }}>PDF uploaden</p>
            <p style={{ fontSize: '12px', color: '#999' }}>Klik of sleep bestand(en)</p>
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
  );
};
