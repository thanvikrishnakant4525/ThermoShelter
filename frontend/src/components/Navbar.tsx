import React from 'react';
import { Compass, Database, PlayCircle } from 'lucide-react';

interface NavbarProps {
  onQuickDemo: () => void;
  onOpenMaterials: () => void;
  currentStep?: number | string;
  onNavigateStep: (step?: string | number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onQuickDemo,
  onOpenMaterials,
  onNavigateStep
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none shrink-0"
          onClick={() => onNavigateStep('home')}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-xs shrink-0">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">ThermoShelter</span>
              <span className="hidden xs:inline-block text-[10px] sm:text-[11px] font-semibold bg-slate-100 text-slate-700 px-1.5 sm:px-2 py-0.5 rounded border border-slate-300">
                Design Tool
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-500 font-medium">Area-Specific Thermal Comfort Shelter Design</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onOpenMaterials}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
            title="Browse verified building envelope materials database"
          >
            <Database className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="hidden sm:inline">Materials Catalog</span>
            <span className="sm:hidden">Materials</span>
          </button>

          <button
            onClick={onQuickDemo}
            className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-all shrink-0"
            title="Run complete Jodhpur demonstration scenario"
          >
            <PlayCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="hidden sm:inline">Try Demo (Jodhpur)</span>
            <span className="sm:hidden">Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
