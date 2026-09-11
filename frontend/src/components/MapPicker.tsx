import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Navigation, ArrowRight, CheckCircle2, Globe, Building2, Users } from 'lucide-react';
import L from 'leaflet';
import { LocationInfo } from '../types';
import { searchLocation } from '../services/api';

interface MapPickerProps {
  location: LocationInfo;
  selectedPurpose: string;
  onLocationChange: (newLocation: LocationInfo) => void;
  onPurposeChange: (purpose: string) => void;
  onConfirmLocation: () => void;
  isLoading: boolean;
}

const SHELTER_PURPOSES = [
  {
    id: 'Public waiting shelter',
    title: 'Public Waiting Shelter / Bus Stop',
    description: 'Transit stop for passengers; priorities are quick shade relief, durable seating, and open street visibility.'
  },
  {
    id: 'Worker rest shelter',
    title: 'Worker Rest Shelter',
    description: 'Break station for outdoor, construction, or farm workers; priorities are heavy heat shielding and airflow.'
  },
  {
    id: 'Rural community shelter',
    title: 'Rural Community Gathering Shelter',
    description: 'Village chopal or public meeting shade; priorities are wide shaded area and natural local materials.'
  },
  {
    id: 'Emergency shelter',
    title: 'Emergency Relief Shelter',
    description: 'Disaster response or temporary medical rest shade; priorities are quick assembly and rain/wind defense.'
  },
  {
    id: 'Tourist shelter',
    title: 'Tourist & Park Rest Shelter',
    description: 'Scenic public viewpoints or garden rest points; priorities are open sightlines and solar night lighting.'
  },
  {
    id: 'General outdoor shelter',
    title: 'General Outdoor Canopy Shelter',
    description: 'Multi-purpose weather protection for public grounds, campuses, or civic facilities.'
  }
];

const PRESET_EXAMPLES: { label: string; location: LocationInfo; tag: string }[] = [
  {
    label: 'Jodhpur, Rajasthan',
    tag: 'Hot & Dry Desert',
    location: { name: 'Jodhpur, Rajasthan', country: 'India', state: 'Rajasthan', latitude: 26.2389, longitude: 73.0243, elevation_m: 231 }
  },
  {
    label: 'Jaisalmer, Rajasthan',
    tag: 'Thar Desert Extreme',
    location: { name: 'Jaisalmer, Rajasthan', country: 'India', state: 'Rajasthan', latitude: 26.9157, longitude: 70.9083, elevation_m: 225 }
  },
  {
    label: 'Delhi, NCR',
    tag: 'Mixed / Extreme Seasons',
    location: { name: 'Delhi, NCR', country: 'India', state: 'Delhi', latitude: 28.6139, longitude: 77.2090, elevation_m: 216 }
  },
  {
    label: 'Mumbai, Maharashtra',
    tag: 'Hot & Humid Coastal',
    location: { name: 'Mumbai, Maharashtra', country: 'India', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, elevation_m: 14 }
  },
  {
    label: 'Chennai, Tamil Nadu',
    tag: 'Coastal Maritime Heat',
    location: { name: 'Chennai, Tamil Nadu', country: 'India', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, elevation_m: 7 }
  },
  {
    label: 'Shimla, Himachal Pradesh',
    tag: 'Cold Mountain Highland',
    location: { name: 'Shimla, Himachal Pradesh', country: 'India', state: 'Himachal Pradesh', latitude: 31.1048, longitude: 77.1734, elevation_m: 2206 }
  }
];

export const MapPicker: React.FC<MapPickerProps> = ({
  location,
  selectedPurpose,
  onLocationChange,
  onPurposeChange,
  onConfirmLocation,
  isLoading
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Manual input state
  const [manualLat, setManualLat] = useState(location.latitude.toString());
  const [manualLon, setManualLon] = useState(location.longitude.toString());

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Map instance
    const map = L.map(mapContainerRef.current, {
      center: [location.latitude, location.longitude],
      zoom: 6,
      zoomControl: true,
    });

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Custom Marker Pin
    const pinIcon = L.divIcon({
      className: 'custom-pin',
      html: `
        <div style="
          width: 30px; height: 30px; 
          background: #1e3a8a; 
          border: 3px solid #ffffff; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg); 
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
          display: flex; align-items: center; justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    // Create Marker
    const marker = L.marker([location.latitude, location.longitude], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map);

    // Handle Map Click
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const roundedLat = parseFloat(lat.toFixed(4));
      const roundedLng = parseFloat(lng.toFixed(4));

      marker.setLatLng([roundedLat, roundedLng]);
      setManualLat(roundedLat.toString());
      setManualLon(roundedLng.toString());

      onLocationChange({
        name: `Selected Site (${roundedLat}°N, ${roundedLng}°E)`,
        country: 'India',
        latitude: roundedLat,
        longitude: roundedLng,
        elevation_m: 150,
      });
    });

    // Handle Marker Drag
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const roundedLat = parseFloat(pos.lat.toFixed(4));
      const roundedLng = parseFloat(pos.lng.toFixed(4));

      setManualLat(roundedLat.toString());
      setManualLon(roundedLng.toString());

      onLocationChange({
        name: `Selected Site (${roundedLat}°N, ${roundedLng}°E)`,
        country: 'India',
        latitude: roundedLat,
        longitude: roundedLng,
        elevation_m: 150,
      });
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Invalidate map size after mount and window resize
    const handleResize = () => {
      map.invalidateSize();
    };
    setTimeout(handleResize, 200);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map view when location changes externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([location.latitude, location.longitude], 8, { animate: true });
      markerRef.current.setLatLng([location.latitude, location.longitude]);
      setManualLat(location.latitude.toString());
      setManualLon(location.longitude.toString());
    }
  }, [location.latitude, location.longitude]);

  // Handle Search Submission
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await searchLocation(searchQuery.trim());
      onLocationChange(res);
      setSearchQuery('');
    } catch (err) {
      setSearchError('Location not found. Try searching a major city or clicking directly on the map.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Manual Lat/Lon apply
  const handleApplyCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (isNaN(lat) || isNaN(lon)) return;

    onLocationChange({
      name: `Custom Location (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`,
      country: 'India',
      latitude: lat,
      longitude: lon,
      elevation_m: location.elevation_m || 100,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Title */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Step 1: Select Location & Shelter Functionality
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Choose where the shelter will be constructed and what primary purpose it serves. The recommendation engine will adapt the structure directly to this site and function.
        </p>
        <div className="mt-3 flex items-center gap-2 text-[11px] sm:text-xs text-emerald-900 bg-emerald-50/90 border border-emerald-200 rounded-lg px-3 py-1.5 w-fit shadow-xs">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span><strong>All India Locations:</strong> Using actual live meteorological data. <strong>International:</strong> Adapted via geographical condition models.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column (5 cols): Search, Presets, and Functionality */}
        <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5">
          {/* Search Box */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Search City / Place
            </label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Jodhpur, Nagpur, Jaipur..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-700"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-3.5 sm:px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
            {searchError && (
              <p className="text-xs text-rose-600 mt-2 font-medium">{searchError}</p>
            )}
          </div>

          {/* Quick Examples */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Try Sample Locations
              </label>
              <span className="text-[11px] text-slate-500">6 Indian Climates</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {PRESET_EXAMPLES.map((ex) => {
                const isSelected = location.name.includes(ex.location.name.split(',')[0]);
                return (
                  <button
                    key={ex.label}
                    onClick={() => onLocationChange(ex.location)}
                    className={`text-left p-2 sm:p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-700 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-[11px] truncate">{ex.label.split(',')[0]}</div>
                    <div className="text-[10px] text-slate-500 font-normal truncate">{ex.tag}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shelter Functionality Selector */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-700" />
              <span>Shelter Functionality</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              Select what this shelter will be used for before generating the design:
            </p>

            <div className="space-y-2 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
              {SHELTER_PURPOSES.map((purpose) => {
                const isSelected = selectedPurpose === purpose.id;
                return (
                  <div
                    key={purpose.id}
                    onClick={() => onPurposeChange(purpose.id)}
                    className={`p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-700 bg-blue-50/70 ring-1 ring-blue-700'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {purpose.title}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {purpose.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Map Canvas & Confirmation */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative bg-slate-100 rounded-xl overflow-hidden border border-slate-300 h-[280px] sm:h-[350px] lg:h-[400px] shadow-xs">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 bg-white/95 backdrop-blur-xs border border-slate-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md shadow-xs text-[10px] sm:text-[11px] text-slate-700 flex items-center gap-1.5">
              <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-700" />
              <span>Tap or drag pin to choose site</span>
            </div>
          </div>

          {/* Coordinates Details Card */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
              </div>
              <div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Selected Location</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">{location.name}</div>
                <div className="text-[11px] font-mono text-slate-500">
                  {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E • Elevation: {location.elevation_m}m
                </div>
              </div>
            </div>

            {/* Manual Lat/Lon adjustment toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <input
                type="number"
                step="0.001"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                className="w-16 sm:w-20 px-2 py-1 text-xs border border-slate-300 rounded bg-slate-50 text-slate-700 font-mono"
                title="Latitude"
              />
              <input
                type="number"
                step="0.001"
                value={manualLon}
                onChange={(e) => setManualLon(e.target.value)}
                className="w-16 sm:w-20 px-2 py-1 text-xs border border-slate-300 rounded bg-slate-50 text-slate-700 font-mono"
                title="Longitude"
              />
              <button
                onClick={handleApplyCoordinates}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-700 transition-colors cursor-pointer"
              >
                Set
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="p-3.5 sm:p-4 bg-slate-900 rounded-xl text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-sm">
            <div>
              <div className="text-[11px] text-slate-300 font-medium">Ready to Analyze</div>
              <div className="text-xs sm:text-sm font-bold truncate">
                {location.name.split(',')[0]} • {selectedPurpose}
              </div>
            </div>

            <button
              onClick={onConfirmLocation}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <span>{isLoading ? 'Analyzing Weather Data...' : 'Analyze Climate Conditions'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
