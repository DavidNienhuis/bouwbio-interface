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
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div 
        className="relative animate-scale-in"
        style={{
          background: 'linear-gradient(135deg, hsla(var(--panel), 0.95), hsla(var(--panel), 0.85))',
          backdropFilter: 'blur(20px)',
          border: '1px solid hsla(var(--accent), 0.3)',
          borderRadius: '1rem',
          padding: '3rem 2.5rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 80px hsla(var(--accent), 0.15)',
          minWidth: '400px',
          maxWidth: '90vw'
        }}
      >
        {/* Spinning loader */}
        <div className="flex justify-center mb-6">
          <div 
            className="relative"
            style={{ width: '80px', height: '80px' }}
          >
            {/* Outer ring */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                border: '3px solid hsla(var(--accent), 0.2)',
                animation: 'spin 2s linear infinite'
              }}
            />
            {/* Gradient spinner */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(
                  from 0deg,
                  transparent 0deg,
                  hsl(var(--accent)) 90deg,
                  hsl(var(--secondary)) 180deg,
                  transparent 270deg
                )`,
                mask: 'radial-gradient(circle, transparent 65%, black 66%)',
                WebkitMask: 'radial-gradient(circle, transparent 65%, black 66%)',
                animation: 'spin 1.5s linear infinite'
              }}
            />
            {/* Center dot */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  background: 'hsl(var(--accent))',
                  boxShadow: '0 0 20px hsla(var(--accent), 0.6)',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center mb-6">
          <h3 
            style={{ 
              fontFamily: 'IBM Plex Mono',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'hsl(var(--ink))',
              marginBottom: '0.5rem'
            }}
          >
            {message}
          </h3>
          <p 
            className="mono"
            style={{ 
              fontSize: '0.875rem',
              color: 'hsl(var(--muted))'
            }}
          >
            Dit duurt ongeveer {estimatedTime} seconden
          </p>
        </div>

        {/* Progress bar */}
        <div 
          style={{
            width: '100%',
            height: '6px',
            background: 'hsla(var(--line), 0.3)',
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
              background: `linear-gradient(90deg, 
                hsl(var(--accent)), 
                hsl(var(--secondary))
              )`,
              borderRadius: '999px',
              transition: 'width 0.1s linear',
              boxShadow: `0 0 20px hsla(var(--accent), 0.5)`
            }}
          />
        </div>

        {/* Progress percentage */}
        <div 
          className="text-center mt-3 mono"
          style={{ 
            fontSize: '0.75rem',
            color: 'hsl(var(--muted))',
            fontWeight: 600
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
