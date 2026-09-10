import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Thermometer,
  Wind,
  Layers,
  Sparkles,
  Accessibility
} from 'lucide-react';
import { ShelterOption, ClimateAnalysisResponse, BaselineShelter } from '../types';
import { downloadReportPdf } from '../services/api';

interface FinalReportViewProps {
  option: ShelterOption;
  climate: ClimateAnalysisResponse;
  baseline: BaselineShelter;
  onBackTo3D: () => void;
  onRestart: () => void;
}

export const FinalReportView: React.FC<FinalReportViewProps> = ({
  option,
  climate,
  baseline,
  onBackTo3D,
  onRestart
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);

  const loc = climate.location;
  const env = climate.environmental_data;
  const char = climate.climate_character;
  const dims = option.dimensions;
  const roof = option.roof;
  const cost = option.cost_breakdown;

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    setPdfSuccess(false);
    try {
      const payload = {
        location: loc,
        environmental_data: env,
        climate_character: char,
        selected_option: option,
        baseline_shelter: baseline
      };
      const blob = await downloadReportPdf(payload);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ThermoShelter_Design_Report_${loc.name.split(',')[0].replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setPdfSuccess(true);
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Design Specification Finalized</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            ThermoShelter Technical Engineering Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Area-Specific Decision-Support Specification for <span className="font-semibold text-slate-800">{loc.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Download Official PDF Report'}</span>
          </button>
        </div>
      </div>

      {pdfSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Technical PDF report generated and downloaded successfully!</span>
        </div>
      )}

      {/* Main Report Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-8">
        {/* Section 1: Executive Site Summary */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>1. Site & Microclimate Profile</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Location</span>
              <span className="font-bold text-slate-900">{loc.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Coordinates</span>
              <span className="font-mono text-slate-800">{loc.latitude.toFixed(4)}°N, {loc.longitude.toFixed(4)}°E</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Climate Category</span>
              <span className="font-bold text-blue-900">{char.category} Zone</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Ambient Dry-Bulb</span>
              <span className="font-bold text-slate-900">{env.temperature_c}°C ({env.relative_humidity_pct}% RH)</span>
            </div>
          </div>
        </div>

        {/* Section 2: Thermal Comfort Performance Table */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>2. Thermal Performance & UTCI Comparison</span>
          </h2>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="p-3">Scenario</th>
                  <th className="p-3">Mean Radiant Temp (Tmrt)</th>
                  <th className="p-3">UTCI (°C)</th>
                  <th className="p-3">Thermal Stress Category</th>
                  <th className="p-3">Comfort Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="text-slate-600">
                  <td className="p-3 font-medium">Outdoor Ambient (Unshaded Direct Sun)</td>
                  <td className="p-3 font-mono">{round(env.temperature_c + (env.solar_radiation_w_m2 / 100) * 3.2, 1)}°C</td>
                  <td className="p-3 font-mono text-rose-700 font-bold">{round(env.temperature_c + 11.5, 1)}°C</td>
                  <td className="p-3 text-rose-700 font-semibold">Severe / Extreme Heat</td>
                  <td className="p-3">22 / 100</td>
                </tr>
                <tr className="text-slate-600 bg-slate-50/50">
                  <td className="p-3 font-medium">Conventional Baseline (Uninsulated GI Sheet)</td>
                  <td className="p-3 font-mono">{baseline.mean_radiant_temp_c}°C</td>
                  <td className="p-3 font-mono text-rose-600 font-bold">{baseline.utci_c}°C</td>
                  <td className="p-3 text-rose-600">{baseline.stress_category}</td>
                  <td className="p-3">{baseline.comfort_score} / 100</td>
                </tr>
                <tr className="bg-blue-50/80 font-semibold text-slate-900">
                  <td className="p-3 text-blue-900 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    <span>Selected: {option.title}</span>
                  </td>
                  <td className="p-3 font-mono text-blue-950">{option.tmrt_c}°C</td>
                  <td className="p-3 font-mono text-emerald-700 font-bold text-sm">{option.utci_c}°C</td>
                  <td className="p-3 text-emerald-800 font-bold">{option.stress_category}</td>
                  <td className="p-3 text-blue-900 font-bold">{option.thermal_comfort_score} / 100</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
            <span className="font-semibold text-emerald-700">Net Comfort Relief:</span>
            <span>Achieves a <b>{option.utci_reduction_vs_baseline}°C UTCI reduction</b> relative to conventional unshaded shelters.</span>
          </div>
        </div>

        {/* Section 3: Architectural Dimensions & Materials */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>3. Architectural Envelope & Material Specifications</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div>
                <span className="text-slate-500 font-medium">Footprint Geometry:</span>
                <div className="font-bold text-slate-900">{dims.length_m}m (L) × {dims.width_m}m (W) × {dims.height_m}m (H) — {dims.floor_area_m2} m²</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Orientation Azimuth:</span>
                <div className="font-bold text-slate-900">{option.orientation_deg}° calibrated to summer sun and wind</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Roof Overhang:</span>
                <div className="font-bold text-slate-900">{roof.overhang_m} meters continuous perimeter projection</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div>
                <span className="text-slate-500 font-medium">Roof Envelope:</span>
                <div className="font-bold text-slate-900">{option.main_materials.roof}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Structural Support:</span>
                <div className="font-bold text-slate-900">{option.main_materials.structure}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Shading & Foundation:</span>
                <div className="font-bold text-slate-900">{option.main_materials.shading} / {option.main_materials.floor}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Itemized Bill of Quantities (BOQ) */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>4. Preliminary Itemized Bill of Quantities (BOQ)</span>
          </h2>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="p-3">Component</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Unit Rate</th>
                  <th className="p-3 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {cost.itemized_boq.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-semibold text-slate-900">{item.component}</td>
                    <td className="p-3 text-slate-600">{item.description}</td>
                    <td className="p-3">{item.quantity} {item.unit}</td>
                    <td className="p-3 font-mono">₹{item.unit_rate_inr.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-semibold">₹{item.total_cost_inr.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-medium">
                  <td className="p-3" colSpan={4}>Materials Subtotal</td>
                  <td className="p-3 text-right font-mono font-bold">₹{cost.material_subtotal_inr.toLocaleString()}</td>
                </tr>
                <tr className="bg-slate-50 font-medium">
                  <td className="p-3" colSpan={4}>Labor & Assembly Installation (28%)</td>
                  <td className="p-3 text-right font-mono font-bold">₹{cost.labor_estimate_inr.toLocaleString()}</td>
                </tr>
                <tr className="bg-blue-50 font-bold text-sm text-blue-900">
                  <td className="p-3" colSpan={4}>PRELIMINARY GRAND TOTAL</td>
                  <td className="p-3 text-right font-mono text-base">{cost.formatted_grand_total}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 italic">{cost.cost_disclaimer}</p>
        </div>

        {/* Section 5: Accessibility & Usability Assessment */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-blue-700" />
            <span>5. Universal Accessibility & Liveability Assessment</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Step-Free Entry Access</span>
              Plinth height (0.25m) incorporates flush tapered ramps at entrance clearways for barrier-free wheelchair access.
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Safe Clear Circulation</span>
              Continuous 1.5m minimum clear turning radius provided between structural posts and bench edges.
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Splash & Rain Drainage</span>
              Perimeter gutter directs rainwater safely away to eliminate ground pooling and slippery plinth edges.
            </div>
          </div>
        </div>

        {/* Section 6: Engineering Reasoning Summary */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>6. Deterministic Engineering Rationale</span>
          </h2>
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
            {option.reasoning.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-bold text-blue-700 shrink-0">[{i + 1}]</span>
                <p className="leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed">
          <span className="font-bold block mb-0.5">Statutory & Engineering Validation Disclaimer:</span>
          This prototype is a computational design research model developed for the Smart India Hackathon. Microclimate and thermal comfort predictions are based on peer-reviewed COST Action 730 equations and CPWD preliminary schedules. Real-world construction requires site-specific geotechnical investigations, wind structural calculations, and municipal safety clearances.
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={onBackTo3D}
          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to 3D Inspection</span>
        </button>

        <button
          onClick={onRestart}
          className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start New Location Design</span>
        </button>
      </div>
    </div>
  );
};

function round(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}
