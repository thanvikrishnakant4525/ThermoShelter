import React, { useState } from 'react';
import { X, Database, ShieldCheck, Thermometer, Layers, Search } from 'lucide-react';
import { MaterialItem } from '../types';

interface MaterialExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: MaterialItem[];
}

export const MaterialExplorerModal: React.FC<MaterialExplorerModalProps> = ({
  isOpen,
  onClose,
  materials
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterQuery, setFilterQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Materials' },
    { id: 'roof', label: 'Roof Envelope' },
    { id: 'structure', label: 'Structural Posts' },
    { id: 'shading', label: 'Shading & Screens' },
    { id: 'floor', label: 'Plinth & Flooring' },
    { id: 'seating', label: 'Seating Benches' }
  ];

  const filteredMaterials = materials.filter(m => {
    const matchesCategory = activeCategory === 'all' || m.category === activeCategory;
    const matchesSearch = m.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
                          m.thermal_role.toLowerCase().includes(filterQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0">
              <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Scientific Building Materials Catalog</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate max-w-[220px] xs:max-w-[320px] sm:max-w-none">
                Verified thermal properties derived from ASHRAE & NBC 2016 standards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
          <div className="flex overflow-x-auto gap-1 w-full pb-1 sm:pb-0 sm:flex-wrap">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeCategory === c.id
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter materials..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Material Items List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 divide-y divide-slate-100">
          {filteredMaterials.map(mat => (
            <div key={mat.id} className="pt-4 first:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {mat.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{mat.name}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Cost: {mat.cost_category}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {mat.durability_years} yr lifespan
                  </span>
                </div>
              </div>

              {/* Physical Properties Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 mb-2">
                {mat.thermal_conductivity !== undefined && (
                  <div>
                    <span className="text-[10px] text-slate-500 block">Thermal Conductivity (k)</span>
                    <span className="font-mono font-bold text-slate-800">{mat.thermal_conductivity} W/m·K</span>
                  </div>
                )}
                {mat.u_value !== undefined && (
                  <div>
                    <span className="text-[10px] text-slate-500 block">U-Value (Thermal Transmittance)</span>
                    <span className="font-mono font-bold text-slate-800">{mat.u_value} W/m²·K</span>
                  </div>
                )}
                {mat.sri !== undefined && (
                  <div>
                    <span className="text-[10px] text-slate-500 block">Solar Reflectance Index (SRI)</span>
                    <span className="font-mono font-bold text-slate-800">{mat.sri} / 100</span>
                  </div>
                )}
                {mat.solar_absorptance !== undefined && (
                  <div>
                    <span className="text-[10px] text-slate-500 block">Solar Absorptance (α)</span>
                    <span className="font-mono font-bold text-slate-800">{mat.solar_absorptance}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-1">
                <span className="font-semibold text-slate-800">Thermal Role: </span>
                {mat.thermal_role}
              </p>
              <p className="text-xs text-slate-500 italic">
                <span className="font-semibold not-italic text-slate-700">Rationale: </span>
                {mat.engineering_reason}
              </p>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
