import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Users, DollarSign, Layout, Sliders, Check } from 'lucide-react';

interface RequirementsFormProps {
  initialCapacity?: number;
  initialBudget?: number;
  initialPurpose?: string;
  initialPriority?: string;
  onGenerate: (data: {
    capacity: number;
    budget_inr: number;
    shelter_purpose: string;
    priority: string;
    user_length?: number;
    user_width?: number;
  }) => void;
  onBack: () => void;
  isLoading: boolean;
}

const PURPOSES = [
  'Public waiting shelter',
  'Bus stop',
  'Worker rest shelter',
  'Emergency shelter',
  'Rural community shelter',
  'Tourist shelter',
  'General outdoor shelter'
];

const PRIORITIES = [
  { id: 'Balanced', label: 'Balanced Design', desc: 'Best compromise between thermal comfort, durable construction, and budget.' },
  { id: 'Thermal comfort', label: 'Maximum Comfort Priority', desc: 'Prioritizes maximum insulation, deepest roof overhangs, and lowest interior heat.' },
  { id: 'Low cost', label: 'Economy / Low Cost', desc: 'Uses locally available, low-cost materials while still meeting basic shade requirements.' },
];

export const RequirementsForm: React.FC<RequirementsFormProps> = ({
  initialCapacity = 20,
  initialBudget = 120000,
  initialPurpose = 'Public waiting shelter',
  initialPriority = 'Balanced',
  onGenerate,
  onBack,
  isLoading
}) => {
  const [capacity, setCapacity] = useState<number>(initialCapacity);
  const [budget, setBudget] = useState<number>(initialBudget);
  const [purpose, setPurpose] = useState<string>(initialPurpose);
  const [priority, setPriority] = useState<string>(initialPriority);

  // Custom dimensions override
  const [hasCustomDims, setHasCustomDims] = useState<boolean>(false);
  const [customLength, setCustomLength] = useState<number>(6.0);
  const [customWidth, setCustomWidth] = useState<number>(3.0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      capacity,
      budget_inr: budget,
      shelter_purpose: purpose,
      priority,
      user_length: hasCustomDims ? customLength : 0.0,
      user_width: hasCustomDims ? customWidth : 0.0,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Title */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Step 3: Define Capacity & Budget Requirements
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Specify occupant capacity, spending limit, and design priority. The system will synthesize 3 viable options matching these constraints.
        </p>
      </div>

      {/* Main Parameters Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-8 shadow-xs space-y-5 sm:space-y-6">
        {/* Purpose Confirmation */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Layout className="w-4 h-4 text-slate-600" />
            <span>Shelter Purpose</span>
          </label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-700 cursor-pointer"
          >
            {PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1">Determines seating ratio, circulation area, and entrance clearances.</p>
        </div>

        {/* Capacity Slider + Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              <span>Occupant Capacity</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="5"
                max="80"
                value={capacity}
                onChange={(e) => setCapacity(Math.max(5, parseInt(e.target.value) || 5))}
                className="w-16 px-2 py-1 text-xs font-bold text-center border border-slate-300 rounded-md bg-slate-50 focus:bg-white"
              />
              <span className="text-xs text-slate-500 font-medium">Persons</span>
            </div>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="1"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value))}
            className="w-full accent-blue-700 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-500 mt-1">
            <span>5 (Small kiosk)</span>
            <span>20 (Standard shelter)</span>
            <span>60 (Transit hub)</span>
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-600" />
            <span>Target Budget Limit (INR)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-xs">₹</span>
            <input
              type="number"
              step="5000"
              min="30000"
              max="500000"
              value={budget}
              onChange={(e) => setBudget(Math.max(30000, parseFloat(e.target.value) || 30000))}
              className="w-full pl-8 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-700"
            />
          </div>
          {/* Quick budget chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
            <span className="text-[10px] sm:text-[11px] text-slate-500">Quick set:</span>
            {[80000, 100000, 120000, 150000, 200000].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBudget(b)}
                className={`px-2 py-0.5 text-[10px] sm:text-[11px] rounded border transition-colors cursor-pointer ${
                  budget === b ? 'bg-blue-50 text-blue-900 border-blue-400 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ₹{(b/100000).toFixed(1)}L
              </button>
            ))}
          </div>
        </div>

        {/* Priority Selection Cards */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            Design Priority
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {PRIORITIES.map((p) => {
              const isSelected = priority === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`p-3 sm:p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-700 bg-blue-50/70 ring-1 ring-blue-700'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {p.label}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-700" />}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optional Custom Dimensions Toggle */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Specify Length × Width Manually</span>
            <button
              type="button"
              onClick={() => setHasCustomDims(!hasCustomDims)}
              className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
            >
              {hasCustomDims ? 'Reset to Auto Proportions' : '+ Set Dimensions'}
            </button>
          </div>

          {hasCustomDims && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[11px] font-medium text-slate-500">Length (m)</span>
                <input
                  type="number"
                  step="0.5"
                  min="3"
                  max="20"
                  value={customLength}
                  onChange={(e) => setCustomLength(parseFloat(e.target.value) || 6)}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500">Width (m)</span>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="10"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 3)}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Climate</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <span>{isLoading ? 'Calculating Shelter Options...' : 'Generate 2–3 Shelter Options'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
