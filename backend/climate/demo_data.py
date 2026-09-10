"""
Validated Demo & Offline Benchmark Climate Dataset for ThermoShelter.
Based on standard Indian Meteorological Department (IMD) normals and NBC 2016 climate definitions.
"""

from typing import Dict, Any

SAMPLE_LOCATIONS: Dict[str, Dict[str, Any]] = {
    "jodhpur": {
        "id": "jodhpur",
        "name": "Jodhpur, Rajasthan",
        "country": "India",
        "state": "Rajasthan",
        "latitude": 26.2389,
        "longitude": 73.0243,
        "elevation_m": 231,
        "climate_zone": "Hot-Dry",
        "environmental_data": {
            "temperature_c": 41.5,
            "apparent_temperature_c": 43.2,
            "relative_humidity_pct": 28.0,
            "wind_speed_ms": 3.6,
            "wind_direction_deg": 245,  # WSW prevailing summer wind
            "solar_radiation_w_m2": 880.0,
            "direct_radiation_w_m2": 720.0,
            "diffuse_radiation_w_m2": 160.0,
            "precipitation_mm": 0.0,
            "cloud_cover_pct": 10.0,
            "uv_index": 10.5,
            "source_type": "Demo Data (IMD Summer Benchmark)",
            "observation_time": "2026-05-15T14:00:00Z"
        }
    },
    "jaisalmer": {
        "id": "jaisalmer",
        "name": "Jaisalmer, Rajasthan",
        "country": "India",
        "state": "Rajasthan",
        "latitude": 26.9157,
        "longitude": 70.9083,
        "elevation_m": 225,
        "climate_zone": "Hot-Dry",
        "environmental_data": {
            "temperature_c": 43.8,
            "apparent_temperature_c": 45.1,
            "relative_humidity_pct": 22.0,
            "wind_speed_ms": 4.2,
            "wind_direction_deg": 260,
            "solar_radiation_w_m2": 920.0,
            "direct_radiation_w_m2": 780.0,
            "diffuse_radiation_w_m2": 140.0,
            "precipitation_mm": 0.0,
            "cloud_cover_pct": 5.0,
            "uv_index": 11.0,
            "source_type": "Demo Data (Thar Desert Peak Summer)",
            "observation_time": "2026-05-20T14:30:00Z"
        }
    },
    "delhi": {
        "id": "delhi",
        "name": "Delhi, NCR",
        "country": "India",
        "state": "Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "elevation_m": 216,
        "climate_zone": "Composite",
        "environmental_data": {
            "temperature_c": 39.2,
            "apparent_temperature_c": 44.0,
            "relative_humidity_pct": 52.0,
            "wind_speed_ms": 2.8,
            "wind_direction_deg": 290,  # NW
            "solar_radiation_w_m2": 810.0,
            "direct_radiation_w_m2": 620.0,
            "diffuse_radiation_w_m2": 190.0,
            "precipitation_mm": 2.5,
            "cloud_cover_pct": 35.0,
            "uv_index": 9.2,
            "source_type": "Demo Data (Composite Pre-Monsoon)",
            "observation_time": "2026-06-10T14:00:00Z"
        }
    },
    "mumbai": {
        "id": "mumbai",
        "name": "Mumbai, Maharashtra",
        "country": "India",
        "state": "Maharashtra",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "elevation_m": 14,
        "climate_zone": "Hot-Humid",
        "environmental_data": {
            "temperature_c": 33.4,
            "apparent_temperature_c": 42.8,
            "relative_humidity_pct": 82.0,
            "wind_speed_ms": 4.8,
            "wind_direction_deg": 250,  # WSW sea breeze
            "solar_radiation_w_m2": 710.0,
            "direct_radiation_w_m2": 480.0,
            "diffuse_radiation_w_m2": 230.0,
            "precipitation_mm": 18.0,
            "cloud_cover_pct": 65.0,
            "uv_index": 8.0,
            "source_type": "Demo Data (Coastal Monsoon Baseline)",
            "observation_time": "2026-07-05T13:30:00Z"
        }
    },
    "chennai": {
        "id": "chennai",
        "name": "Chennai, Tamil Nadu",
        "country": "India",
        "state": "Tamil Nadu",
        "latitude": 13.0827,
        "longitude": 80.2707,
        "elevation_m": 7,
        "climate_zone": "Hot-Humid",
        "environmental_data": {
            "temperature_c": 35.6,
            "apparent_temperature_c": 44.5,
            "relative_humidity_pct": 76.0,
            "wind_speed_ms": 4.1,
            "wind_direction_deg": 120,  # SE maritime breeze
            "solar_radiation_w_m2": 790.0,
            "direct_radiation_w_m2": 560.0,
            "diffuse_radiation_w_m2": 230.0,
            "precipitation_mm": 4.0,
            "cloud_cover_pct": 40.0,
            "uv_index": 9.8,
            "source_type": "Demo Data (Coromandel Summer Baseline)",
            "observation_time": "2026-05-28T14:00:00Z"
        }
    },
    "shimla": {
        "id": "shimla",
        "name": "Shimla, Himachal Pradesh",
        "country": "India",
        "state": "Himachal Pradesh",
        "latitude": 31.1048,
        "longitude": 77.1734,
        "elevation_m": 2206,
        "climate_zone": "Cold",
        "environmental_data": {
            "temperature_c": 8.5,
            "apparent_temperature_c": 6.2,
            "relative_humidity_pct": 58.0,
            "wind_speed_ms": 3.2,
            "wind_direction_deg": 310,  # NW valley breeze
            "solar_radiation_w_m2": 610.0,
            "direct_radiation_w_m2": 490.0,
            "diffuse_radiation_w_m2": 120.0,
            "precipitation_mm": 1.2,
            "cloud_cover_pct": 30.0,
            "uv_index": 6.5,
            "source_type": "Demo Data (Himalayan Cold Season)",
            "observation_time": "2026-01-15T12:30:00Z"
        }
    }
}
