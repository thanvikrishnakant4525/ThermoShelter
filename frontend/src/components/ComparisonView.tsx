import React from 'react';
import { ArrowLeft, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { ShelterGenerationResponse, ShelterOption } from '../types';
import { OptionCard } from './OptionCard';

interface ComparisonViewProps {
  generationData: ShelterGenerationResponse;
  selectedOption: ShelterOption;
  onSelectOption: (opt: ShelterOption) => void;
  onView3D: (opt: ShelterOption) => void;
  onProceedTo3D: () => void;
  onBack: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  generationData,
  selectedOption,
  onSelectOption,
  onView3D,
  onProceedTo3D,
  onBack
}) => {
  const { options_list, baseline_shelter, recommended_id } = generationData;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Title */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Step 4: Compare Recommended Shelter Options
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Review the generated designs below. Each option has genuinely different roof profiles, overhangs, orientation, and materials suited to your location.
        </p>
      </div>

      {/* 3 Option Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
        {options_list.map((opt) => (
          <OptionCard
            key={opt.id}
            option={opt}
            isRecommended={opt.id === recommended_id}
            onSelect={onSelectOption}
            onView3D={onView3D}
          />
        ))}
      </div>

      {/* Plain Language Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mb-6 sm:mb-8">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Technical Comparison Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparing recommended options directly against a standard uninsulated tin-roof baseline
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            Thermal Index Comparison
          </span>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="block sm:hidden px-3.5 py-1.5 bg-blue-50/70 border-b border-blue-100 text-[11px] text-blue-800 font-medium">
          👉 Swipe left/right to compare all 8 technical metrics
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[640px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-3.5 sm:px-4">Design Option</th>
                <th className="py-3 px-3.5 sm:px-4">Roof Material</th>
                <th className="py-3 px-3.5 sm:px-4">Overhang</th>
                <th className="py-3 px-3.5 sm:px-4">Orientation</th>
                <th className="py-3 px-3.5 sm:px-4">Ceiling Heat</th>
                <th className="py-3 px-3.5 sm:px-4">Inside Feel Temp</th>
                <th className="py-3 px-3.5 sm:px-4">Comfort Rating</th>
                <th className="py-3 px-3.5 sm:px-4">Estimated Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Baseline Row */}
              <tr className="bg-slate-50 text-slate-600">
                <td className="py-3.5 px-3.5 sm:px-4 font-semibold text-slate-700">
                  Standard Baseline (Bare Tin Roof)
                </td>
                <td className="py-3.5 px-3.5 sm:px-4">Uninsulated Corrugated Tin</td>
                <td className="py-3.5 px-3.5 sm:px-4">0.3m (Minimal)</td>
                <td className="py-3.5 px-3.5 sm:px-4">0° (Standard)</td>
                <td className="py-3.5 px-3.5 sm:px-4 font-mono text-rose-700 font-bold">{baseline_shelter.mean_radiant_temp_c}°C</td>
                <td className="py-3.5 px-3.5 sm:px-4 font-mono font-bold text-rose-700">{baseline_shelter.utci_c}°C</td>
                <td className="py-3.5 px-3.5 sm:px-4 font-bold text-rose-700">{baseline_shelter.comfort_score}/100</td>
                <td className="py-3.5 px-3.5 sm:px-4 font-mono">{baseline_shelter.formatted_cost}</td>
              </tr>

              {/* Option Rows */}
              {options_list.map((opt) => {
                const isSelected = opt.id === selectedOption.id;
                return (
                  <tr
                    key={opt.id}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/80 font-semibold' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => onSelectOption(opt)}
                  >
                    <td className="py-3.5 px-3.5 sm:px-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-700 shrink-0"></span>
                      <span className="text-slate-900 font-bold">{opt.title}</span>
                    </td>
                    <td className="py-3.5 px-3.5 sm:px-4">{opt.roof.material}</td>
                    <td className="py-3.5 px-3.5 sm:px-4">{opt.roof.overhang_m}m</td>
                    <td className="py-3.5 px-3.5 sm:px-4">{opt.orientation_deg}°</td>
                    <td className="py-3.5 px-3.5 sm:px-4 font-mono text-blue-900">{opt.tmrt_c}°C</td>
                    <td className="py-3.5 px-3.5 sm:px-4 font-mono font-bold text-emerald-700">{opt.utci_c}°C</td>
                    <td className="py-3.5 px-3.5 sm:px-4 font-bold text-blue-900">{opt.thermal_comfort_score}/100</td>
                    <td className="py-3.5 px-3.5 sm:px-4 font-mono font-bold">{opt.formatted_cost}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Why do these options differ? Explanation Box */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-blue-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Why do these designs differ for this location?
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs text-slate-600">
          <div className="p-3 sm:p-3.5 bg-white rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Option A — Thermal Comfort</span>
            Provides maximum heat protection with deep 1.3m roof overhangs and insulated panels, keeping the ceiling cool and blocking direct midday sun.
          </div>
          <div className="p-3 sm:p-3.5 bg-white rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Option B — Balanced</span>
            The practical middle ground: durable galvanized frame, reflective cool-roof coating, and built-in rainwater gutters at a reasonable cost.
          </div>
          <div className="p-3 sm:p-3.5 bg-white rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Option C — Economy</span>
            The lowest-cost practical build using simple pitched roofing and locally sourced materials while maintaining basic shade coverage.
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requirements</span>
        </button>

        <button
          onClick={onProceedTo3D}
          className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <span>Inspect Selected Design in 3D ({selectedOption.title})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
