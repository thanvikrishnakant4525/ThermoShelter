"""
Climate Data Service for ThermoShelter.
Interfaces with Open-Meteo free API for real-time live meteorological data across India
and synthesizes authentic geographical condition demo models for international locations.
Maintains rigorous labeling of Live vs Geographical Demo vs Fallback data.
"""

import math
import requests
from urllib3.util import Retry
from requests.adapters import HTTPAdapter
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from .demo_data import SAMPLE_LOCATIONS
from .classifier import classify_climate
from .solar import calculate_solar_position
from .geo_utils import is_location_in_india, get_global_geographical_condition

OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast"
GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search"

# Standard headers required by Open-Meteo TOS to prevent 403 Forbidden / 429 throttling
API_HEADERS = {
    "User-Agent": "ThermoShelter/1.0 (https://thermoshelter.in; contact@thermoshelter.in)",
    "Accept": "application/json"
}

def create_resilient_session() -> requests.Session:
    """Create a persistent HTTP session with connection pooling and retry strategy."""
    session = requests.Session()
    retries = Retry(
        total=2,
        backoff_factor=0.3,
        status_forcelist=[429, 500, 502, 503, 504],
        raise_on_status=False
    )
    adapter = HTTPAdapter(max_retries=retries, pool_connections=10, pool_maxsize=10)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update(API_HEADERS)
    return session

_session = create_resilient_session()

def get_location_by_preset(preset_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve pre-configured benchmark location."""
    key = preset_id.lower().strip()
    return SAMPLE_LOCATIONS.get(key)

def geocode_place_name(place_name: str) -> Optional[Dict[str, Any]]:
    """Search place coordinates via Open-Meteo geocoding or fallback to known presets."""
    place_clean = place_name.lower().strip()

    # Check preset shortcuts first (Indian presets)
    for key, loc in SAMPLE_LOCATIONS.items():
        if key in place_clean or place_clean in loc["name"].lower():
            return {
                "name": loc["name"],
                "country": loc.get("country", "India"),
                "state": loc.get("state", ""),
                "latitude": loc["latitude"],
                "longitude": loc["longitude"],
                "elevation_m": loc.get("elevation_m", 0),
                "is_preset": True,
                "is_in_india": True
            }

    try:
        response = _session.get(
            GEOCODING_BASE_URL,
            params={"name": place_name, "count": 1, "language": "en", "format": "json"},
            timeout=6.0
        )
        if response.status_code == 200:
            data = response.json()
            results = data.get("results")
            if results and len(results) > 0:
                item = results[0]
                lat = item.get("latitude")
                lon = item.get("longitude")
                country = item.get("country", "")
                name = item.get("name", place_name)
                in_india = is_location_in_india(lat, lon, country=country, name=name)
                return {
                    "name": f"{name}, {country}" if country and country.lower() not in name.lower() else name,
                    "country": country,
                    "state": item.get("admin1", ""),
                    "latitude": lat,
                    "longitude": lon,
                    "elevation_m": item.get("elevation", 0),
                    "is_preset": False,
                    "is_in_india": in_india
                }
    except Exception:
        pass

    # Unresolved fallback
    fallback = SAMPLE_LOCATIONS["jodhpur"]
    return {
        "name": f"{place_name} (Using Jodhpur reference)",
        "country": fallback["country"],
        "state": fallback["state"],
        "latitude": fallback["latitude"],
        "longitude": fallback["longitude"],
        "elevation_m": fallback["elevation_m"],
        "is_preset": True,
        "is_in_india": True
    }

def fetch_climate_data(
    latitude: float,
    longitude: float,
    location_name: str = "Selected Location",
    elevation: float = 0.0,
    country: str = ""
) -> Dict[str, Any]:
    """
    Fetch climate parameters for coordinates.
    - Locations in India: Always fetch actual, live real-time meteorological data from Open-Meteo.
    - Locations outside India: Provide demo data calibrated to that location's geographical conditions.
    """
    now = datetime.now(timezone.utc)
    in_india = is_location_in_india(latitude, longitude, country=country, name=location_name)

    # =========================================================================
    # CASE 1: ALL LOCATIONS IN INDIA -> REAL-TIME LIVE METEOROLOGICAL DATA
    # =========================================================================
    if in_india:
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
                "wind_speed_unit": "ms", # Ensures m/s unit
                "timezone": "auto"
            }
            resp = _session.get(
                OPEN_METEO_BASE_URL,
                params=params,
                timeout=7.5
            )

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
                dni = curr.get("direct_normal_irradiance", 0.0)
                diffuse = curr.get("diffuse_radiation", 0.0)
                solar_measured = max(0.0, dni + diffuse)

                # Real-time astronomical solar position
                solar_pos = calculate_solar_position(latitude, longitude, now)

                # Daytime design solar radiation:
                # Shelters primarily defend against daytime solar heat. If accessed at night,
                # compute peak daytime design irradiance for this coordinate to ensure proper shading sizing.
                peak_alt = solar_pos.get("peak_noon_altitude_deg", 65.0)
                cloud_factor = max(0.25, 1.0 - (cloud / 100.0) * 0.65)
                estimated_peak_solar = round(920.0 * math.sin(math.radians(max(20.0, peak_alt))) * cloud_factor, 1)

                # If daytime and sun is up, use measured irradiance; otherwise use design daytime peak
                if solar_measured >= 50.0:
                    solar_total = solar_measured
                else:
                    solar_total = estimated_peak_solar

                classification = classify_climate(temp_c, rh_pct, precip, solar_total, elev)

                return {
                    "location": {
                        "name": location_name,
                        "latitude": round(latitude, 4),
                        "longitude": round(longitude, 4),
                        "elevation_m": round(elev, 1),
                        "country": "India",
                        "is_in_india": True
                    },
                    "environmental_data": {
                        "temperature_c": round(temp_c, 1),
                        "apparent_temperature_c": round(app_temp_c, 1),
                        "relative_humidity_pct": round(rh_pct, 1),
                        "wind_speed_ms": round(wind_speed, 1),
                        "wind_direction_deg": int(wind_dir),
                        "solar_radiation_w_m2": round(solar_total, 1),
                        "direct_radiation_w_m2": round(dni if solar_measured >= 50.0 else round(solar_total * 0.75, 1), 1),
                        "diffuse_radiation_w_m2": round(diffuse if solar_measured >= 50.0 else round(solar_total * 0.25, 1), 1),
                        "current_measured_solar_w_m2": round(solar_measured, 1),
                        "precipitation_mm": round(precip, 1),
                        "cloud_cover_pct": round(cloud, 1),
                        "source_type": "Live Data (Open-Meteo Real-Time)",
                        "is_live": True,
                        "observation_time": curr.get("time", now.isoformat())
                    },
                    "climate_character": classification,
                    "solar_position": solar_pos
                }
        except Exception:
            pass

        # Offline Emergency Fallback for India (network completely offline)
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
                "elevation_m": best_sample["elevation_m"],
                "country": "India",
                "is_in_india": True
            },
            "environmental_data": {
                **sample_env,
                "source_type": f"Offline Backup (Indian Regional Baseline: {best_sample['name']})",
                "is_live": False,
                "observation_time": now.isoformat()
            },
            "climate_character": classification,
            "solar_position": solar_pos
        }

    # =========================================================================
    # CASE 2: WORLD OTHER THAN INDIA -> GEOGRAPHICAL CONDITION DEMO DATA
    # =========================================================================
    geo_model = get_global_geographical_condition(
        latitude=latitude,
        longitude=longitude,
        elevation_m=elevation,
        location_name=location_name,
        country=country
    )
    geo_env = geo_model["environmental_data"]
    solar_pos = calculate_solar_position(latitude, longitude, now)

    classification = classify_climate(
        temp_c=geo_env["temperature_c"],
        rh_pct=geo_env["relative_humidity_pct"],
        rainfall_mm=geo_env["precipitation_mm"],
        solar_w_m2=geo_env["solar_radiation_w_m2"],
        elevation_m=elevation
    )

    return {
        "location": {
            "name": location_name,
            "latitude": round(latitude, 4),
            "longitude": round(longitude, 4),
            "elevation_m": round(elevation, 1),
            "country": country or "International",
            "is_in_india": False
        },
        "environmental_data": {
            **geo_env,
            "is_live": False
        },
        "climate_character": classification,
        "solar_position": solar_pos,
        "geographical_condition": {
            "zone_id": geo_model["zone_id"],
            "zone_name": geo_model["zone_name"],
            "description": geo_model["description"]
        }
    }
