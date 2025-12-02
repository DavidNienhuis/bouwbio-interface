import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TourStep {
  target: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  userId: string;
  onComplete: () => void;
  steps: TourStep[];
}

export function GuidedTour({ userId, onComplete, steps }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const updateTargetPosition = useCallback(() => {
    const step = steps[currentStep];
    if (!step) return;

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    updateTargetPosition();
    
    const handleResize = () => updateTargetPosition();
    const handleScroll = () => updateTargetPosition();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [updateTargetPosition]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await supabase
        .from('profiles')
        .update({ tour_completed: true })
        .eq('id', userId);
    } catch (error) {
      console.error('Error completing tour:', error);
    }
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible || steps.length === 0) return null;

  const step = steps[currentStep];
  const placement = step.placement || 'bottom';

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 180;

    switch (placement) {
      case 'top':
        return {
          top: `${targetRect.top - tooltipHeight - padding}px`,
          left: `${targetRect.left + targetRect.width / 2 - tooltipWidth / 2}px`,
        };
      case 'bottom':
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left + targetRect.width / 2 - tooltipWidth / 2}px`,
        };
      case 'left':
        return {
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: `${targetRect.left - tooltipWidth - padding}px`,
        };
      case 'right':
        return {
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: `${targetRect.right + padding}px`,
        };
      default:
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left + targetRect.width / 2 - tooltipWidth / 2}px`,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay with spotlight */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          ...(targetRect && {
            clipPath: `polygon(
              0% 0%, 
              0% 100%, 
              ${targetRect.left - 8}px 100%, 
              ${targetRect.left - 8}px ${targetRect.top - 8}px, 
              ${targetRect.right + 8}px ${targetRect.top - 8}px, 
              ${targetRect.right + 8}px ${targetRect.bottom + 8}px, 
              ${targetRect.left - 8}px ${targetRect.bottom + 8}px, 
              ${targetRect.left - 8}px 100%, 
              100% 100%, 
              100% 0%
            )`,
          }),
        }}
        onClick={handleSkip}
      />

      {/* Highlight border around target */}
      {targetRect && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            border: '2px solid hsl(142 64% 62%)',
            borderRadius: '8px',
            boxShadow: '0 0 0 4px rgba(94, 220, 137, 0.3)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute w-80 p-4 rounded-lg shadow-xl"
        style={{
          background: 'hsl(0 0% 100%)',
          border: '1px solid hsl(218 14% 85%)',
          ...getTooltipPosition(),
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-2 right-2 p-1 rounded hover:bg-muted transition-colors"
          style={{ color: 'hsl(218 19% 27%)' }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress */}
        <div className="flex gap-1 mb-3">
          {steps.map((_, index) => (
            <div
              key={index}
              className="h-1 flex-1 rounded-full"
              style={{
                background: index <= currentStep ? 'hsl(142 64% 62%)' : 'hsl(218 14% 85%)',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <h3 className="font-heading font-medium text-lg mb-2" style={{ color: 'hsl(190 16% 12%)' }}>
          {step.title}
        </h3>
        <p className="text-sm mb-4" style={{ color: 'hsl(218 19% 27%)' }}>
          {step.description}
        </p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Overslaan
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrev}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" onClick={handleNext} className="gap-1">
              {currentStep < steps.length - 1 ? (
                <>
                  Volgende
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                'Voltooien'
              )}
            </Button>
          </div>
        </div>

        {/* Step counter */}
        <p className="text-center text-xs mt-3" style={{ color: 'hsl(218 19% 27%)' }}>
          {currentStep + 1} van {steps.length}
        </p>
      </div>
    </div>
  );
}
