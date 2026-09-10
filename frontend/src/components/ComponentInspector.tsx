import React from 'react';
import { Layers, ShieldCheck, HelpCircle, Check, Info, Sparkles } from 'lucide-react';
import { Component3DData } from '../types';

interface ComponentInspectorProps {
  activeComponent: Component3DData | null;
  onSelectComponent: (comp: Component3DData) => void;
  allComponents: Component3DData[];
}

const COMP_SHORT_NAMES: Record<string, string> = {
  roof: 'Roof Envelope',
  columns: 'Columns & Frame',
  insulated_walls: 'Thick Walls',
  solar_windows: 'Solar Windows',
  shading_louvers: 'Shading Screens',
  roof_cavity: 'Ventilated Cavity',
  roof_monitor: 'Ridge Monitor',
  floor_platform: 'Floor Plinth',
  seating_bench: 'Benches',
  transit_display: 'Transit Board',
  hydration_station: 'Hydration Pot',
  community_board: 'Community Board',
  emergency_kit: 'Emergency Chest',
  tourist_kiosk: 'Tourist Kiosk',
  solar_pv: 'Solar Panels',
  drainage_gutter: 'Rain Gutter'
};

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({
  activeComponent,
  onSelectComponent,
  allComponents
}) => {
  if (!activeComponent && allComponents.length > 0) {
    activeComponent = allComponents[0];
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Component & Material Inspector
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            Hover or click 3D model
          </span>
        </div>

        {/* Component Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {allComponents.map((comp) => {
            const isSelected = activeComponent?.id === comp.id;
            const shortName = COMP_SHORT_NAMES[comp.id] || comp.name.split(' ').slice(0, 2).join(' ');
            return (
              <button
                key={comp.id}
                onClick={() => onSelectComponent(comp)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
                  isSelected
                    ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>

        {/* Active Component Details */}
        {activeComponent ? (
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Component</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">{activeComponent.name}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Specified Material</div>
              <div className="text-sm font-bold text-blue-900 mt-0.5">{activeComponent.material}</div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Thermal & Functional Role</span>
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                {activeComponent.thermal_role}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Site-Driven Engineering Rationale</span>
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                {activeComponent.engineering_reason}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 text-center py-8">
            Hover over any component in the 3D canvas to inspect its thermal function.
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Parameters respond dynamically to the selected geographic climate zone.</span>
      </div>
    </div>
  );
};
