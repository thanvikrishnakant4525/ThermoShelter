import React from 'react';
import { ArrowRight, PlayCircle, ShieldCheck, Thermometer, Compass, Sun, Wind, Umbrella } from 'lucide-react';

interface HomeScreenProps {
  onStartDesign: () => void;
  onTryExample: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartDesign,
  onTryExample
}) => {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-[11px] sm:text-xs font-semibold mb-4 sm:mb-5">
          <Compass className="w-3.5 h-3.5 text-blue-700" />
          <span>Area-Specific Environmental Engineering</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          ThermoShelter
        </h1>

        <p className="text-base sm:text-xl font-semibold text-slate-700 mt-2">
          Area-Specific Shelter Design for Thermal Comfort
        </p>

        <p className="text-xs sm:text-base text-slate-600 mt-3 sm:mt-4 max-w-2xl mx-auto leading-relaxed">
          Analyze real geographical environmental conditions and generate practical shelter designs adapted to the selected location, keeping people cool in scorching heat and sheltered in harsh climates.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 mt-6 sm:mt-8 max-w-md sm:max-w-none mx-auto">
          <button
            onClick={onStartDesign}
            className="w-full sm:w-auto px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>Start Design</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onTryExample}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-blue-700" />
            <span>Try Example (Jodhpur)</span>
          </button>
        </div>
      </div>

      {/* Problem & Solution Technical Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-16">
        {/* Problem */}
        <div className="bg-white p-5 sm:p-8 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold mb-3">
            <Thermometer className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-2">The Problem</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            A shelter suitable for one location often performs poorly in another because climate, solar exposure, humidity, wind, rainfall, and seasonal conditions differ. Standard tin-roofed shelters in desert regions can heat up to 65°C under the sun, turning the interior into an oven, while unventilated shelters in humid areas trap sticky air and moisture.
          </p>
        </div>

        {/* Solution */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-2">The Solution</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            ThermoShelter analyzes the selected location and recommends shelter configurations adapted to local environmental conditions. It calculates the actual thermal comfort requirements and generates 2–3 viable options with proper roof insulation, shading, orientation, and natural ventilation.
          </p>
        </div>
      </div>

      {/* Area-Specific Comparison Overview */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 mb-12 shadow-xs">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            How Design Changes with Location
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Different Climate → Different Thermal Requirements → Different Shelter Architecture
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>Hot & Dry (e.g. Jodhpur)</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mb-2">Shade & Heat Reflection</div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Extended 1.2m+ roof overhangs</li>
              <li>Insulated or double-layer ventilated roof</li>
              <li>Terracotta jali screens to cut intense glare</li>
              <li>Cool stone flooring to absorb nocturnal cool</li>
            </ul>
          </div>

          <div className="p-5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
              <Wind className="w-4 h-4 text-teal-600" />
              <span>Hot & Humid (e.g. Mumbai)</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mb-2">Maximum Air Movement</div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Wide openings facing the sea breeze</li>
              <li>Angled louvers allowing breeze but blocking rain</li>
              <li>Continuous drainage gutters for monsoon runoff</li>
              <li>Lightweight roof that does not trap humidity</li>
            </ul>
          </div>

          <div className="p-5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
              <Umbrella className="w-4 h-4 text-blue-600" />
              <span>Cold Mountain (e.g. Shimla)</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mb-2">Wind Protection & Warmth</div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Enclosed windbreak side walls</li>
              <li>South-facing openings for warm sunlight</li>
              <li>Insulated roof panels to retain warmth</li>
              <li>Sturdy weather-tight structure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
