import {
  ClimateAnalysisResponse,
  ShelterGenerationResponse,
  MaterialItem,
  LocationInfo
} from '../types';

declare const process: { env?: Record<string, string | undefined> } | undefined;

const getApiBase = (): string => {
  let envUrl = '';
  try {
    if (typeof process !== 'undefined' && process?.env && process.env.NEXT_PUBLIC_API_URL) {
      envUrl = process.env.NEXT_PUBLIC_API_URL;
    }
  } catch (e) {}

  if (!envUrl && typeof import.meta !== 'undefined' && (import.meta as any).env) {
    envUrl = (import.meta as any).env.NEXT_PUBLIC_API_URL || (import.meta as any).env.VITE_API_URL || '';
  }

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  return '/api';
};

const API_BASE = getApiBase();

export async function fetchPresets(): Promise<LocationInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/location/presets`);
    if (!res.ok) throw new Error('Failed to fetch presets');
    return await res.json();
  } catch (err) {
    console.warn('Backend presets unreachable, using fallback list', err);
    return [
      { name: 'Jodhpur, Rajasthan', country: 'India', state: 'Rajasthan', latitude: 26.2389, longitude: 73.0243, elevation_m: 231 },
      { name: 'Jaisalmer, Rajasthan', country: 'India', state: 'Rajasthan', latitude: 26.9157, longitude: 70.9083, elevation_m: 225 },
      { name: 'Delhi, NCR', country: 'India', state: 'Delhi', latitude: 28.6139, longitude: 77.2090, elevation_m: 216 },
      { name: 'Mumbai, Maharashtra', country: 'India', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, elevation_m: 14 },
      { name: 'Chennai, Tamil Nadu', country: 'India', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, elevation_m: 7 },
      { name: 'Shimla, Himachal Pradesh', country: 'India', state: 'Himachal Pradesh', latitude: 31.1048, longitude: 77.1734, elevation_m: 2206 }
    ];
  }
}

export async function searchLocation(query: string): Promise<LocationInfo> {
  const res = await fetch(`${API_BASE}/location/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Failed to search location');
  return await res.json();
}

export async function analyzeClimate(
  latitude: number,
  longitude: number,
  locationName: string,
  elevationM: number = 0,
  country: string = ''
): Promise<ClimateAnalysisResponse> {
  const res = await fetch(`${API_BASE}/climate/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude,
      longitude,
      location_name: locationName,
      elevation_m: elevationM,
      country
    }),
  });
  if (!res.ok) throw new Error('Failed to analyze climate');
  return await res.json();
}

export async function generateShelterOptions(payload: {
  climate_info: ClimateAnalysisResponse;
  capacity: number;
  budget_inr: number;
  shelter_purpose: string;
  priority: string;
  user_length?: number;
  user_width?: number;
}): Promise<ShelterGenerationResponse> {
  const res = await fetch(`${API_BASE}/design/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to generate designs');
  return await res.json();
}

export async function fetchMaterials(): Promise<MaterialItem[]> {
  const res = await fetch(`${API_BASE}/materials`);
  if (!res.ok) throw new Error('Failed to fetch materials');
  return await res.json();
}

export async function parseNaturalLanguage(text: string): Promise<any> {
  const res = await fetch(`${API_BASE}/nl/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to parse text');
  return await res.json();
}

export async function downloadReportPdf(projectData: any): Promise<Blob> {
  const res = await fetch(`${API_BASE}/report/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_data: projectData }),
  });
  if (!res.ok) throw new Error('Failed to generate PDF report');
  return await res.blob();
}
