import { useEffect, useState } from "react";

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
  estimatedTime?: number; // in seconden
}

export const LoadingModal = ({ 
  isOpen, 
  message = "Bezig met verwerken...", 
  estimatedTime = 15 
}: LoadingModalProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    // Reset progress wanneer modal opent
    setProgress(0);

    // Bereken increment per tick (elke 100ms)
    const tickInterval = 100; // ms
    const totalTicks = (estimatedTime * 1000) / tickInterval;
    const increment = 100 / totalTicks;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        return next >= 100 ? 100 : next;
      });
    }, tickInterval);

    return () => clearInterval(interval);
  }, [isOpen, estimatedTime]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="relative"
        style={{
          background: 'hsl(var(--panel))',
          border: '1px solid hsla(var(--line), 0.3)',
          borderRadius: '0.75rem',
          padding: '2.5rem 2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minWidth: '360px',
          maxWidth: '90vw'
        }}
      >
        {/* Simple spinner */}
        <div className="flex justify-center mb-5">
          <div 
            className="relative"
            style={{ width: '48px', height: '48px' }}
          >
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                border: '3px solid hsla(var(--line), 0.2)',
                borderTopColor: 'hsl(var(--muted))',
                animation: 'spin 1s linear infinite'
              }}
            />
          </div>
        </div>

        {/* Message */}
        <div className="text-center mb-5">
          <h3 
            style={{ 
              fontFamily: 'IBM Plex Mono',
              fontSize: '1rem',
              fontWeight: 500,
              color: 'hsl(var(--ink))',
              marginBottom: '0.5rem'
            }}
          >
            {message}
          </h3>
          <p 
            className="mono"
            style={{ 
              fontSize: '0.8rem',
              color: 'hsla(var(--ink), 0.65)'
            }}
          >
            Dit duurt ongeveer {estimatedTime} seconden
          </p>
        </div>

        {/* Progress bar */}
        <div 
          style={{
            width: '100%',
            height: '4px',
            background: 'hsla(var(--line), 0.2)',
            borderRadius: '999px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progress}%`,
              background: 'hsl(var(--muted))',
              borderRadius: '999px',
              transition: 'width 0.1s linear'
            }}
          />
        </div>

        {/* Progress percentage */}
        <div 
          className="text-center mt-2 mono"
          style={{ 
            fontSize: '0.7rem',
            color: 'hsla(var(--ink), 0.75)',
            fontWeight: 500
          }}
        >
          {Math.round(progress)}%
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
