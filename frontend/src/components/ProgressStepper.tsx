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
  const activeStep = STEPS[currentStep] || STEPS[0];
  const ActiveIcon = activeStep.icon;

  return (
    <div className="bg-white border-b border-slate-200 py-2.5 sm:py-3 px-3 sm:px-8">
      {/* Mobile View: Step Title Badge + 6 Segmented Progress Bars */}
      <div className="sm:hidden max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] font-bold">
              {currentStep + 1}
            </span>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
              <ActiveIcon className="w-3.5 h-3.5 text-blue-700" />
              <span>{activeStep.label}</span>
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>

        {/* 6 Interactive Segments */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            const isAccessible = idx <= maxAccessibleStep;

            return (
              <button
                key={step.label}
                type="button"
                onClick={() => isAccessible && onStepClick(idx)}
                disabled={!isAccessible}
                className={`flex-1 h-1.5 rounded-full transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-700 ring-2 ring-blue-200'
                    : isCompleted
                    ? 'bg-emerald-600'
                    : isAccessible
                    ? 'bg-slate-300'
                    : 'bg-slate-200 opacity-60 cursor-not-allowed'
                }`}
                title={`${step.label} (Step ${idx + 1})`}
              />
            );
          })}
        </div>
      </div>

      {/* Tablet & Desktop View: Traditional Connected Stepper */}
      <div className="hidden sm:flex max-w-6xl mx-auto items-center justify-between">
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
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-blue-700 text-white ring-4 ring-blue-100'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 border border-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" /> : idx + 1}
                </div>
                <div className="text-left">
                  <div className={`text-xs font-semibold ${isCurrent ? 'text-blue-900' : isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                    {step.label}
                  </div>
                </div>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-3 transition-colors ${
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
