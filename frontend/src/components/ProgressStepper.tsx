import React from 'react';
import { MapPin, Sun, Sliders, LayoutGrid, Box, FileText, Check } from 'lucide-react';

interface ProgressStepperProps {
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
  maxAccessibleStep: number;
}

const STEPS = [
  { label: 'Location', icon: MapPin },
  { label: 'Climate & Site', icon: Sun },
  { label: 'Requirements', icon: Sliders },
  { label: 'Compare Options', icon: LayoutGrid },
  { label: '3D Architecture', icon: Box },
  { label: 'Final Report', icon: FileText },
];

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  currentStep,
  onStepClick,
  maxAccessibleStep
}) => {
  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isAccessible = idx <= maxAccessibleStep;

          return (
            <React.Fragment key={step.label}>
              <div
                onClick={() => isAccessible && onStepClick(idx)}
                className={`flex items-center gap-2 select-none ${
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-45'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-blue-700 text-white ring-4 ring-blue-100'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 border border-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                </div>
                <div className="hidden sm:block text-left">
                  <div className={`text-xs font-semibold ${isCurrent ? 'text-blue-900' : isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                    {step.label}
                  </div>
                </div>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`hidden md:block flex-1 h-0.5 mx-3 transition-colors ${
                    idx < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
