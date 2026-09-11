import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProgressStepper } from './components/ProgressStepper';
import { HomeScreen } from './components/HomeScreen';
import { MapPicker } from './components/MapPicker';
import { ClimateSummary } from './components/ClimateSummary';
import { RequirementsForm } from './components/RequirementsForm';
import { ComparisonView } from './components/ComparisonView';
import { Shelter3DViewer } from './components/Shelter3DViewer';
import { ComponentInspector } from './components/ComponentInspector';
import { FinalReportView } from './components/FinalReportView';
import { MaterialExplorerModal } from './components/MaterialExplorerModal';

import {
  LocationInfo,
  ClimateAnalysisResponse,
  ShelterGenerationResponse,
  ShelterOption,
  Component3DData,
  MaterialItem
} from './types';
import { analyzeClimate, generateShelterOptions, fetchMaterials } from './services/api';
import { ArrowLeft, ArrowRight, Box, FileText, LayoutGrid } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation State
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<number>(0);

  // Application Data States
  const [location, setLocation] = useState<LocationInfo>({
    name: 'Jodhpur, Rajasthan',
    country: 'India',
    state: 'Rajasthan',
    latitude: 26.2389,
    longitude: 73.0243,
    elevation_m: 231
  });

  const [selectedPurpose, setSelectedPurpose] = useState<string>('Public waiting shelter');
  const [climateData, setClimateData] = useState<ClimateAnalysisResponse | null>(null);
  const [generationData, setGenerationData] = useState<ShelterGenerationResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<ShelterOption | null>(null);
  const [activeComponent3D, setActiveComponent3D] = useState<Component3DData | null>(null);

  // Modals & UI Loading
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState<boolean>(false);
  const [materialsList, setMaterialsList] = useState<MaterialItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initial Data Fetch
  useEffect(() => {
    fetchMaterials().then(setMaterialsList).catch(console.error);
  }, []);

  // Step 1 -> Step 2: Analyze Climate for Selected Location
  const handleAnalyzeClimate = async () => {
    setIsLoading(true);
    try {
      const res = await analyzeClimate(
        location.latitude,
        location.longitude,
        location.name,
        location.elevation_m
      );
      setClimateData(res);
      setCurrentStep(2); // Step 2: Climate & Site Diagnostics
      setMaxAccessibleStep(Math.max(maxAccessibleStep, 2));
    } catch (err) {
      console.error(err);
      alert('Could not fetch climate data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3 -> Step 4: Generate 3 Area-Specific Options
  const handleGenerateDesigns = async (reqs: {
    capacity: number;
    budget_inr: number;
    shelter_purpose: string;
    priority: string;
    user_length?: number;
    user_width?: number;
  }) => {
    if (!climateData) return;
    setIsLoading(true);
    try {
      const res = await generateShelterOptions({
        climate_info: climateData,
        ...reqs
      });
      setGenerationData(res);
      const initialSelected = res.options[res.recommended_id as keyof typeof res.options] || res.options_list[0];
      setSelectedOption(initialSelected);
      if (initialSelected.components_3d.length > 0) {
        setActiveComponent3D(initialSelected.components_3d[0]);
      }
      setCurrentStep(4); // Step 4: Compare Options
      setMaxAccessibleStep(Math.max(maxAccessibleStep, 4));
    } catch (err) {
      console.error(err);
      alert('Design synthesis failed. Please verify parameters.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Trigger
  const handleQuickDemo = async () => {
    setIsLoading(true);
    const jodhpurLoc: LocationInfo = {
      name: 'Jodhpur, Rajasthan',
      country: 'India',
      state: 'Rajasthan',
      latitude: 26.2389,
      longitude: 73.0243,
      elevation_m: 231
    };
    setLocation(jodhpurLoc);
    setSelectedPurpose('Public waiting shelter');

    try {
      const clim = await analyzeClimate(jodhpurLoc.latitude, jodhpurLoc.longitude, jodhpurLoc.name, jodhpurLoc.elevation_m);
      setClimateData(clim);

      const gen = await generateShelterOptions({
        climate_info: clim,
        capacity: 20,
        budget_inr: 100000,
        shelter_purpose: 'Public waiting shelter',
        priority: 'Balanced'
      });
      setGenerationData(gen);
      const rec = gen.options[gen.recommended_id as keyof typeof gen.options] || gen.options_list[1];
      setSelectedOption(rec);
      if (rec.components_3d.length > 0) {
        setActiveComponent3D(rec.components_3d[0]);
      }

      setCurrentStep(5); // Jump straight to 3D Architecture viewer!
      setMaxAccessibleStep(6);
    } catch (err) {
      console.error(err);
      alert('Quick demo failed to load. Check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle direct navigation via stepper
  const handleNavigateStep = (stepIdx: number) => {
    // 0: Location (if step 0 or from home)
    // 1: Climate
    // 2: Requirements
    // 3: Compare Options
    // 4: 3D Architecture
    // 5: Final Report
    setCurrentStep(stepIdx);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header Navigation */}
      <Navbar
        onQuickDemo={handleQuickDemo}
        onOpenMaterials={() => setIsMaterialsModalOpen(true)}
        currentStep={currentStep}
        onNavigateStep={() => setCurrentStep(0)}
      />

      {/* Progress Stepper (Visible when not on Home) */}
      {currentStep > 0 && (
        <ProgressStepper
          currentStep={currentStep - 1} // Offset because index 0 is Home
          onStepClick={(s) => setCurrentStep(s + 1)}
          maxAccessibleStep={maxAccessibleStep > 0 ? maxAccessibleStep - 1 : 0}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Screen 0: Home Landing */}
        {currentStep === 0 && (
          <HomeScreen
            onStartDesign={() => {
              setCurrentStep(1);
              setMaxAccessibleStep(Math.max(maxAccessibleStep, 1));
            }}
            onTryExample={handleQuickDemo}
          />
        )}

        {/* Screen 1: Location Picker (Step 1) */}
        {currentStep === 1 && (
          <MapPicker
            location={location}
            selectedPurpose={selectedPurpose}
            onLocationChange={setLocation}
            onPurposeChange={setSelectedPurpose}
            onConfirmLocation={handleAnalyzeClimate}
            isLoading={isLoading}
          />
        )}

        {/* Screen 2: Climate & Site Diagnostics (Step 2) */}
        {currentStep === 2 && climateData && (
          <ClimateSummary
            climate={climateData}
            selectedPurpose={selectedPurpose}
            onProceed={() => {
              setCurrentStep(3);
              setMaxAccessibleStep(Math.max(maxAccessibleStep, 3));
            }}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {/* Screen 3: Requirements Form (Step 3) */}
        {currentStep === 3 && (
          <RequirementsForm
            initialPurpose={selectedPurpose}
            onGenerate={handleGenerateDesigns}
            onBack={() => setCurrentStep(2)}
            isLoading={isLoading}
          />
        )}

        {/* Screen 4: Compare Options (Step 4) */}
        {currentStep === 4 && generationData && selectedOption && (
          <ComparisonView
            generationData={generationData}
            selectedOption={selectedOption}
            onSelectOption={setSelectedOption}
            onView3D={(opt) => {
              setSelectedOption(opt);
              if (opt.components_3d.length > 0) setActiveComponent3D(opt.components_3d[0]);
              setCurrentStep(5);
              setMaxAccessibleStep(Math.max(maxAccessibleStep, 5));
            }}
            onProceedTo3D={() => {
              setCurrentStep(5);
              setMaxAccessibleStep(Math.max(maxAccessibleStep, 5));
            }}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {/* Screen 5: 3D Architectural Model View (Step 5) */}
        {currentStep === 5 && selectedOption && climateData && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] sm:text-xs font-semibold mb-1 sm:mb-1.5">
                  <Box className="w-3.5 h-3.5" />
                  <span>Step 5: Interactive 3D Model & Raycasting</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Detailed 3D Architecture Visualizer
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Tap or hover over roof, louvers, structure, or benches to inspect physical thermal roles and engineering rationale.
                </p>
              </div>

              {/* Option Switcher Buttons */}
              {generationData && (
                <div className="flex items-center gap-1 sm:gap-1.5 bg-white border border-slate-200 p-1 rounded-lg shadow-2xs self-start sm:self-auto overflow-x-auto max-w-full">
                  {generationData.options_list.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSelectedOption(opt);
                        if (opt.components_3d.length > 0) setActiveComponent3D(opt.components_3d[0]);
                      }}
                      className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                        selectedOption.id === opt.id
                          ? 'bg-blue-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3D Visualizer & Inspector Layout (8 cols + 4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-6 sm:mb-8">
              <div className="lg:col-span-8">
                <Shelter3DViewer
                  option={selectedOption}
                  climate={climateData}
                  activeComponent={activeComponent3D}
                  onHoverComponent={setActiveComponent3D}
                  onSelectComponent={setActiveComponent3D}
                />
              </div>

              <div className="lg:col-span-4">
                <ComponentInspector
                  activeComponent={activeComponent3D}
                  onSelectComponent={setActiveComponent3D}
                  allComponents={selectedOption.components_3d}
                />
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                onClick={() => setCurrentStep(4)}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Options Comparison</span>
              </button>

              <button
                onClick={() => {
                  setCurrentStep(6);
                  setMaxAccessibleStep(Math.max(maxAccessibleStep, 6));
                }}
                className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Finalize Design & View Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 6: Final Technical Report & Export (Step 6) */}
        {currentStep === 6 && selectedOption && climateData && generationData && (
          <FinalReportView
            option={selectedOption}
            climate={climateData}
            baseline={generationData.baseline_shelter}
            onBackTo3D={() => setCurrentStep(5)}
            onRestart={() => {
              setCurrentStep(0);
              setMaxAccessibleStep(0);
            }}
          />
        )}
      </main>

      {/* Materials Catalog Explorer Modal */}
      <MaterialExplorerModal
        isOpen={isMaterialsModalOpen}
        onClose={() => setIsMaterialsModalOpen(false)}
        materials={materialsList}
      />

      {/* Global Engineering Footer */}
      <Footer />
    </div>
  );
};
