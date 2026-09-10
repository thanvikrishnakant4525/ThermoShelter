"""
Climate Data Service for ThermoShelter.
Interfaces with Open-Meteo free API with robust offline caching and benchmark fallback.
Maintains clear labeling of Live vs Demo vs Calculated data.
"""

import requests
from typing import Dict, Any, Optional
from datetime import datetime

from .demo_data import SAMPLE_LOCATIONS
from .classifier import classify_climate
from .solar import calculate_solar_position

OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast"
GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search"

def get_location_by_preset(preset_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve pre-configured benchmark location."""
    key = preset_id.lower().strip()
    return SAMPLE_LOCATIONS.get(key)

def geocode_place_name(place_name: str) -> Optional[Dict[str, Any]]:
    """Search place coordinates via Open-Meteo geocoding or fallback to sample list."""
    place_clean = place_name.lower().strip()

    # Check preset shortcuts first
    for key, loc in SAMPLE_LOCATIONS.items():
        if key in place_clean or place_clean in loc["name"].lower():
            return {
                "name": loc["name"],
                "country": loc["country"],
                "state": loc.get("state", ""),
                "latitude": loc["latitude"],
                "longitude": loc["longitude"],
                "elevation_m": loc.get("elevation_m", 0),
                "is_preset": True
            }

    try:
        response = requests.get(
            GEOCODING_BASE_URL,
            params={"name": place_name, "count": 1, "language": "en", "format": "json"},
            timeout=3.5
        )
        if response.status_code == 200:
            data = response.json()
            results = data.get("results")
            if results and len(results) > 0:
                item = results[0]
                return {
                    "name": item.get("name", place_name),
                    "country": item.get("country", ""),
                    "state": item.get("admin1", ""),
                    "latitude": item.get("latitude"),
                    "longitude": item.get("longitude"),
                    "elevation_m": item.get("elevation", 0),
                    "is_preset": False
                }
    except Exception:
        pass

    # Default fallback to Jodhpur if unresolved
    fallback = SAMPLE_LOCATIONS["jodhpur"]
    return {
        "name": f"{place_name} (Using Jodhpur benchmark)",
        "country": fallback["country"],
        "state": fallback["state"],
        "latitude": fallback["latitude"],
        "longitude": fallback["longitude"],
        "elevation_m": fallback["elevation_m"],
        "is_preset": True
    }

def fetch_climate_data(latitude: float, longitude: float, location_name: str = "Selected Location", elevation: float = 0.0) -> Dict[str, Any]:
    """
    Fetch live climate parameters for coordinates.
    Falls back gracefully to the closest demo benchmark if network is unavailable.
    """
    now = datetime.now()
    source_label = "Demo Data (Fallback)"

    # Try live Open-Meteo API
    try:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "precipitation",
                "wind_speed_10m",
                "wind_direction_10m",
                "direct_normal_irradiance",
                "diffuse_radiation",
                "cloud_cover"
            ],
            "timezone": "auto"
        }
        resp = requests.get(OPEN_METEO_BASE_URL, params=params, timeout=4.0)
        if resp.status_code == 200:
            res_data = resp.json()
            curr = res_data.get("current", {})
            elev = res_data.get("elevation", elevation)

            temp_c = curr.get("temperature_2m", 32.0)
            app_temp_c = curr.get("apparent_temperature", temp_c)
            rh_pct = curr.get("relative_humidity_2m", 50.0)
            wind_speed = curr.get("wind_speed_10m", 3.0)
            wind_dir = curr.get("wind_direction_10m", 180)
            precip = curr.get("precipitation", 0.0)
            cloud = curr.get("cloud_cover", 20.0)
            dni = curr.get("direct_normal_irradiance", 600.0)
            diffuse = curr.get("diffuse_radiation", 150.0)
            solar_total = dni + diffuse

            source_label = "Live Data (Open-Meteo Free API)"

            classification = classify_climate(temp_c, rh_pct, precip, solar_total, elev)
            solar_pos = calculate_solar_position(latitude, longitude, now)

            return {
                "location": {
                    "name": location_name,
                    "latitude": round(latitude, 4),
                    "longitude": round(longitude, 4),
                    "elevation_m": round(elev, 1)
                },
                "environmental_data": {
                    "temperature_c": round(temp_c, 1),
                    "apparent_temperature_c": round(app_temp_c, 1),
                    "relative_humidity_pct": round(rh_pct, 1),
                    "wind_speed_ms": round(wind_speed, 1),
                    "wind_direction_deg": int(wind_dir),
                    "solar_radiation_w_m2": round(solar_total, 1),
                    "direct_radiation_w_m2": round(dni, 1),
                    "diffuse_radiation_w_m2": round(diffuse, 1),
                    "precipitation_mm": round(precip, 1),
                    "cloud_cover_pct": round(cloud, 1),
                    "source_type": source_label,
                    "observation_time": curr.get("time", now.isoformat())
                },
                "climate_character": classification,
                "solar_position": solar_pos
            }
    except Exception as e:
        # Fallback to nearest benchmark
        pass

    # Offline Fallback Logic: match by distance to known sample locations
    best_dist = float("inf")
    best_sample = SAMPLE_LOCATIONS["jodhpur"]
    for sample in SAMPLE_LOCATIONS.values():
        d = (sample["latitude"] - latitude)**2 + (sample["longitude"] - longitude)**2
        if d < best_dist:
            best_dist = d
            best_sample = sample

    sample_env = best_sample["environmental_data"]
    classification = classify_climate(
        sample_env["temperature_c"],
        sample_env["relative_humidity_pct"],
        sample_env["precipitation_mm"],
        sample_env["solar_radiation_w_m2"],
        best_sample["elevation_m"]
    )
    solar_pos = calculate_solar_position(latitude, longitude, now)

    return {
        "location": {
            "name": location_name if location_name != "Selected Location" else best_sample["name"],
            "latitude": round(latitude, 4),
            "longitude": round(longitude, 4),
            "elevation_m": best_sample["elevation_m"]
        },
        "environmental_data": {
            **sample_env,
            "source_type": f"Demo Data (Configured Benchmark for {best_sample['name']})",
            "observation_time": now.isoformat()
        },
        "climate_character": classification,
        "solar_position": solar_pos
    }
