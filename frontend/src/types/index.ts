export interface LocationInfo {
  name: string;
  country: string;
  state?: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  is_in_india?: boolean;
}

export interface EnvironmentalData {
  temperature_c: number;
  apparent_temperature_c: number;
  relative_humidity_pct: number;
  wind_speed_ms: number;
  wind_direction_deg: number;
  solar_radiation_w_m2: number;
  direct_radiation_w_m2?: number;
  diffuse_radiation_w_m2?: number;
  current_measured_solar_w_m2?: number;
  precipitation_mm: number;
  cloud_cover_pct: number;
  source_type: string;
  is_live?: boolean;
  observation_time: string;
}

export interface SiteIndicators {
  solar_exposure: string;
  heat_stress: string;
  ventilation_potential: string;
  rain_protection: string;
  shading_requirement: string;
  thermal_mass_need: string;
}

export interface ClimateCharacter {
  category: "Hot-Dry" | "Hot-Humid" | "Composite" | "Temperate" | "Cold" | "Very Cold" | string;
  explanation: string;
  indicators: SiteIndicators;
}

export interface SolarPosition {
  altitude_deg: number;
  zenith_deg: number;
  azimuth_deg: number;
  is_daylight: boolean;
  recommended_overhang_angle_deg: number;
  peak_noon_altitude_deg?: number;
  true_solar_time?: string;
}

export interface ClimateAnalysisResponse {
  location: LocationInfo;
  environmental_data: EnvironmentalData;
  climate_character: ClimateCharacter;
  solar_position: SolarPosition;
  geographical_condition?: {
    zone_id: string;
    zone_name: string;
    description: string;
  };
}

export interface Component3DData {
  id: string;
  name: string;
  material: string;
  material_id: string;
  color: string;
  thermal_role: string;
  engineering_reason: string;
  dimensions: Record<string, any>;
  position: [number, number, number];
}

export interface BOQItem {
  component: string;
  description: string;
  quantity: number;
  unit: string;
  unit_rate_inr: number;
  total_cost_inr: number;
}

export interface CostBreakdown {
  material_subtotal_inr: number;
  labor_estimate_inr: number;
  grand_total_inr: number;
  formatted_grand_total: string;
  itemized_boq: BOQItem[];
  cost_disclaimer: string;
}

export interface ShelterOption {
  id: "option_a" | "option_b" | "option_c" | string;
  label: string;
  title: string;
  overall_score: number;
  thermal_comfort_score: number;
  utci_c: number;
  tmrt_c: number;
  internal_wind_speed_ms: number;
  utci_reduction_vs_baseline: number;
  stress_category: string;
  stress_code: string;
  estimated_cost_inr: number;
  formatted_cost: string;
  dimensions: {
    length_m: number;
    width_m: number;
    height_m: number;
    floor_area_m2: number;
  };
  has_walls?: boolean;
  wall_material?: string | null;
  shelter_purpose?: string;
  seating_style?: string;
  capacity?: number;
  roof: {
    type: string;
    material: string;
    material_id: string;
    overhang_m: number;
    u_value: number;
    sri: number;
  };
  orientation_deg: number;
  openings_ratio: number;
  ventilation_strategy: string;
  shading_strategy: string;
  main_materials: {
    roof: string;
    structure: string;
    shading: string;
    floor: string;
    seating: string;
  };
  cost_breakdown: CostBreakdown;
  reasoning: string[];
  components_3d: Component3DData[];
}

export interface BaselineShelter {
  name: string;
  roof_type: string;
  overhang_m: number;
  orientation_deg: number;
  mean_radiant_temp_c: number;
  wind_speed_ms: number;
  utci_c: number;
  stress_category: string;
  stress_code: string;
  stress_description: string;
  comfort_score: number;
  utci_reduction_vs_ambient: number;
  cost_inr: number;
  formatted_cost: string;
}

export interface ShelterGenerationResponse {
  recommended_id: string;
  climate_character: ClimateCharacter;
  baseline_shelter: BaselineShelter;
  options: {
    option_a: ShelterOption;
    option_b: ShelterOption;
    option_c: ShelterOption;
  };
  options_list: ShelterOption[];
}

export interface MaterialItem {
  id: string;
  category: string;
  name: string;
  short_name: string;
  thermal_conductivity?: number;
  u_value?: number;
  sri?: number;
  solar_absorptance?: number;
  emissivity?: number;
  density_kg_m3?: number;
  specific_heat_j_kg_k?: number;
  durability_years: number;
  unit_cost_inr_m2?: number;
  unit_cost_inr_m?: number;
  unit_cost_inr_m2_floor?: number;
  cost_category: string;
  sustainability_notes: string;
  best_climates: string[];
  thermal_role: string;
  engineering_reason: string;
}
