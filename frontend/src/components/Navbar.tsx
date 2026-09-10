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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => onNavigateStep('home')}
        >
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            <Compass className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 tracking-tight">ThermoShelter</span>
              <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                Design Tool
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Area-Specific Thermal Comfort Shelter Design</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMaterials}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
            title="Browse verified building envelope materials database"
          >
            <Database className="w-3.5 h-3.5 text-slate-600" />
            <span>Materials Catalog</span>
          </button>

          <button
            onClick={onQuickDemo}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-all"
            title="Run complete Jodhpur demonstration scenario"
          >
            <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Try Demo (Jodhpur)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
