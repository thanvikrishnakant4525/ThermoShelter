import React from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  Compass,
  ArrowRight,
  ArrowLeft,
  Info,
  ShieldAlert,
  Building2
} from 'lucide-react';
import { ClimateAnalysisResponse } from '../types';

interface ClimateSummaryProps {
  climate: ClimateAnalysisResponse;
  selectedPurpose: string;
  onProceed: () => void;
  onBack: () => void;
}

export const ClimateSummary: React.FC<ClimateSummaryProps> = ({
  climate,
  selectedPurpose,
  onProceed,
  onBack
}) => {
  const env = climate.environmental_data;
  const character = climate.climate_character;
  const solar = climate.solar_position;
  const indicators = character.indicators;

  // Simple wind direction conversion
  const getCompassDirection = (deg: number): string => {
    const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
    const idx = Math.round((deg % 360) / 45) % 8;
    return directions[idx];
  };

  // Simple humidity interpretation
  const getHumidityDescription = (rh: number): string => {
    if (rh < 35) return 'Dry Air (High evaporation)';
    if (rh <= 65) return 'Comfortable humidity';
    return 'Sticky / High moisture';
  };

  // Simple sun intensity interpretation
  const getSunIntensity = (solarW: number): string => {
    if (solarW > 750) return 'Intense direct burning sun';
    if (solarW > 500) return 'Strong sunny condition';
    return 'Moderate / Overcast sun';
  };

  // Simple climate name
  const getSimpleClimateName = (cat: string): string => {
    switch (cat) {
      case 'Hot-Dry': return 'Hot & Dry (Desert Climate)';
      case 'Hot-Humid': return 'Hot & Humid (Coastal Climate)';
      case 'Composite': return 'Mixed Seasons (Hot Summer / Cool Winter)';
      case 'Temperate': return 'Moderate & Pleasant';
      case 'Cold': return 'Cold Highland Climate';
      case 'Very Cold': return 'Sub-Zero Alpine Climate';
      default: return cat;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Step Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Step 2: Local Environmental & Climate Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Analyzing conditions for <span className="font-semibold text-slate-900">{climate.location.name}</span> for a <span className="font-semibold text-blue-800">{selectedPurpose}</span>
          </p>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
          env.source_type.toLowerCase().includes('demo')
            ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
            : 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
        }`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${
            env.source_type.toLowerCase().includes('demo') ? 'bg-amber-500' : 'bg-emerald-500'
          }`}></span>
          <span>
            <strong className="uppercase text-[10px] tracking-wider mr-1.5 px-1.5 py-0.5 rounded bg-white/70 font-bold">
              {env.source_type.toLowerCase().includes('demo') ? 'Demo Data' : 'Live Data'}
            </strong>
            {env.source_type}
          </span>
        </div>
      </div>

      {/* 6 Key Environmental Parameters (Plain Language) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {/* Air Temperature */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Thermometer className="w-4 h-4 text-rose-600" />
            <span>Air Temperature</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{env.temperature_c}°C</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Feels Like: {env.apparent_temperature_c}°C</div>
        </div>

        {/* Air Humidity */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Droplets className="w-4 h-4 text-cyan-600" />
            <span>Air Humidity</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{env.relative_humidity_pct}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{getHumidityDescription(env.relative_humidity_pct)}</div>
        </div>

        {/* Sun Heat Intensity */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Sun className="w-4 h-4 text-amber-600" />
            <span>Sunlight Heat</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{env.solar_radiation_w_m2} <span className="text-xs font-normal">W/m²</span></div>
          <div className="text-[11px] text-slate-500 mt-0.5">{getSunIntensity(env.solar_radiation_w_m2)}</div>
        </div>

        {/* Wind Speed & Direction */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Wind className="w-4 h-4 text-teal-600" />
            <span>Wind & Breeze</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{env.wind_speed_ms} <span className="text-xs font-normal">m/s</span></div>
          <div className="text-[11px] text-slate-500 mt-0.5">From {getCompassDirection(env.wind_direction_deg)} ({env.wind_direction_deg}°)</div>
        </div>

        {/* Rainfall */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <CloudRain className="w-4 h-4 text-blue-600" />
            <span>Rainfall</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{env.precipitation_mm} <span className="text-xs font-normal">mm</span></div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cloud Cover: {env.cloud_cover_pct}%</div>
        </div>

        {/* Sun Position */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Compass className="w-4 h-4 text-slate-700" />
            <span>Sun Position</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{solar.altitude_deg}°</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Azimuth: {solar.azimuth_deg}°</div>
        </div>
      </div>

      {/* Climate Character Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Assigned Climate Category
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {getSimpleClimateName(character.category)}
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 max-w-sm">
            Based on recorded temperature, humidity, rainfall, and solar radiation thresholds for this location.
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Why was this climate category assigned?
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {character.explanation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What the Shelter Needs in this Location */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>What this Location Requires from the Shelter Design</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Direct Sun Heat Protection</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{indicators.solar_exposure} Need</div>
            <p className="text-xs text-slate-600 mt-1">Requires wide eaves and overhangs to shade occupants from high-angle sun.</p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Heat Stress Level</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{indicators.heat_stress} Risk</div>
            <p className="text-xs text-slate-600 mt-1">Unshaded metal roofs will overheat severely; high thermal insulation is critical.</p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Natural Airflow Need</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{indicators.ventilation_potential}</div>
            <p className="text-xs text-slate-600 mt-1">Shelter orientation must align with the prevailing breeze to keep air moving.</p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rain & Splash Protection</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{indicators.rain_protection}</div>
            <p className="text-xs text-slate-600 mt-1">Requires continuous rainwater drainage gutters to prevent splashback.</p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Overhead Shading Need</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{indicators.shading_requirement}</div>
            <p className="text-xs text-slate-600 mt-1">Deep perimeter overhangs prevent midday glare from penetrating the seating area.</p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Floor Thermal Sinking</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{indicators.thermal_mass_need}</div>
            <p className="text-xs text-slate-600 mt-1">Heavy stone or earth pavers remain cool when shaded, absorbing ground heat surges.</p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Location</span>
        </button>

        <button
          onClick={onProceed}
          className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <span>Set Size & Budget Constraints</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
