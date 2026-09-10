import React from 'react';
import { Thermometer, Wind, Box, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { ShelterOption } from '../types';

interface OptionCardProps {
  option: ShelterOption;
  isRecommended: boolean;
  onSelect: (option: ShelterOption) => void;
  onView3D: (option: ShelterOption) => void;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  option,
  isRecommended,
  onSelect,
  onView3D
}) => {
  return (
    <div className={`bg-white rounded-xl border transition-all flex flex-col justify-between shadow-xs ${
      isRecommended ? 'border-blue-700 ring-2 ring-blue-700/20' : 'border-slate-200 hover:border-slate-300'
    }`}>
      <div>
        {/* Card Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
              {option.label}
            </span>
            {isRecommended && (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Best Match</span>
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900">{option.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dimensions: {option.dimensions.length_m}m × {option.dimensions.width_m}m ({option.dimensions.floor_area_m2} m² area)
          </p>
        </div>

        {/* Primary Metrics in Plain Language */}
        <div className="p-5 bg-slate-50/70 border-b border-slate-100 grid grid-cols-2 gap-3">
          {/* Comfort Score & Interior Feel */}
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] font-medium text-slate-500">Thermal Comfort</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {option.thermal_comfort_score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-emerald-600" />
              <span>Feels {option.utci_reduction_vs_baseline}°C Cooler</span>
            </div>
          </div>

          {/* Construction Cost */}
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] font-medium text-slate-500">Estimated Cost</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {option.formatted_cost}
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1">
              Overall Score: {option.overall_score}/100
            </div>
          </div>
        </div>

        {/* Practical Features */}
        <div className="p-5 space-y-2.5 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Roof Construction:</span>
            <div className="font-semibold text-slate-800 mt-0.5">
              {option.roof.material} ({option.roof.overhang_m}m overhang)
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-medium">Airflow & Orientation:</span>
            <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-teal-600" />
              <span>{option.orientation_deg}° orientation • {option.ventilation_strategy}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-medium">Sun Protection:</span>
            <div className="font-semibold text-slate-800 mt-0.5">
              {option.shading_strategy}
            </div>
          </div>

          {/* Key Benefit Banner */}
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-medium flex items-center gap-1.5 mt-3">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Thermal condition: <b>{option.stress_category}</b></span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onView3D(option)}
          className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Box className="w-3.5 h-3.5" />
          <span>View in 3D</span>
        </button>

        <button
          onClick={() => onSelect(option)}
          className="py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>Select Design</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
