import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-white font-semibold text-sm mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Scientific Foundation</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Thermal comfort modeling implements the European COST Action 730 Universal Thermal Climate Index (UTCI) formulation. Climate zoning follows standard bioclimatic rules (NBC 2016 / Bansal & Minke).
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-white font-semibold text-sm mb-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Engineering Notice</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              ThermoShelter provides computational decision support for architectural and urban planning. Final structural sizing, wind load calculations, foundation design, and construction permits must be approved by qualified civil engineers.
            </p>
          </div>

          <div>
            <div className="text-white font-semibold text-sm mb-2">
              Data Sources & Verification
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded">
                Open-Meteo Weather API
              </span>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded">
                UTCI Thermal Index
              </span>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded">
                CPWD Rate Schedules
              </span>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded">
                OpenStreetMap GIS
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <div>ThermoShelter • Area-Specific Shelter Design for Thermal Comfort Maintenance</div>
          <div className="mt-2 sm:mt-0">Open Engineering Decision-Support Architecture</div>
        </div>
      </div>
    </footer>
  );
};
