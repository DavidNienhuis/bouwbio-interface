import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = onStepClick && currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center font-bold text-sm transition-all duration-200",
                    isCompleted && "bg-[hsl(142_64%_62%)] text-[hsl(186_100%_10%)] cursor-pointer hover:scale-105",
                    isCurrent && "bg-[hsl(186_100%_10%)] text-white",
                    !isCompleted && !isCurrent && "bg-[hsl(218_14%_85%)] text-[hsl(218_19%_27%)]",
                    isClickable && "cursor-pointer"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                </button>
                <span 
                  className={cn(
                    "mt-2 text-xs font-medium text-center max-w-[80px]",
                    isCurrent && "text-[hsl(186_100%_10%)]",
                    !isCurrent && "text-[hsl(218_19%_27%)]"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "flex-1 h-1 mx-2 transition-colors duration-200",
                    currentStep > step.id ? "bg-[hsl(142_64%_62%)]" : "bg-[hsl(218_14%_85%)]"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
