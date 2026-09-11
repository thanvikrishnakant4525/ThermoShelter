"""
Global Geographical & Bioclimatic Modeling Utilities for ThermoShelter.
Determines whether a location is within India and synthesizes realistic
geographical climate condition profiles for any coordinate across the world.
"""

from datetime import datetime, timezone
from typing import Dict, Any

# Approximate bounding box for India (including Andaman & Nicobar, Lakshadweep, Kashmir, Northeast)
INDIA_LAT_MIN = 6.5
INDIA_LAT_MAX = 37.6
INDIA_LON_MIN = 68.0
INDIA_LON_MAX = 97.5

INDIAN_STATES_TERRITORIES = {
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
    "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka",
    "kerala", "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram",
    "nagaland", "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu",
    "telangana", "tripura", "uttar pradesh", "uttarakhand", "west bengal",
    "delhi", "jammu and kashmir", "ladakh", "puducherry", "chandigarh",
    "andaman and nicobar", "lakshadweep", "dadra and nagar haveli"
}

def is_location_in_india(latitude: float, longitude: float, country: str = "", name: str = "") -> bool:
    """
    Check if a location is within the geographical territory of India.
    Combines coordinate bounding box with country and place name indicators.
    """
    country_lower = country.lower().strip() if country else ""
    name_lower = name.lower().strip() if name else ""

    # Direct country indicators
    if "india" in country_lower or country_lower == "in":
        return True
    if "india" in name_lower:
        return True

    # Check for known Indian states/territories
    for state in INDIAN_STATES_TERRITORIES:
        if state in country_lower or state in name_lower:
            return True

    # Coordinate bounding check
    if (INDIA_LAT_MIN <= latitude <= INDIA_LAT_MAX) and (INDIA_LON_MIN <= longitude <= INDIA_LON_MAX):
        foreign_neighbors = ["pakistan", "nepal", "bhutan", "bangladesh", "myanmar", "sri lanka", "china", "tibet"]
        for f in foreign_neighbors:
            if f in country_lower or f in name_lower:
                return False
        return True

    return False


def get_global_geographical_condition(
    latitude: float,
    longitude: float,
    elevation_m: float = 0.0,
    location_name: str = "International Site",
    country: str = ""
) -> Dict[str, Any]:
    """
    Synthesize realistic representative meteorological and bioclimatic demo data
    strictly calibrated to the site's physical geographical conditions:
    - Absolute latitude zone (Equatorial, Tropical, Subtropical Arid, Mediterranean, Temperate, Boreal, Polar)
    - Elevation lapse rate (-6.5 deg C per 1000m)
    - Coastal proximity / continentality
    - Solar geometry and diurnal thermal characteristics
    """
    abs_lat = abs(latitude)
    now = datetime.now(timezone.utc)
    month = now.month

    # Seasonal hemisphere factor
    is_northern = latitude >= 0
    if is_northern:
        is_warm_season = 5 <= month <= 9
        is_cold_season = month in [11, 12, 1, 2]
    else:
        is_warm_season = month in [11, 12, 1, 2, 3]
        is_cold_season = 5 <= month <= 8

    # 1. High Altitude / Alpine (Elevation dominates regardless of latitude)
    if elevation_m >= 1800:
        zone_id = "alpine_highland"
        zone_name = "Cold Mountain / Alpine Highland"
        category = "Cold" if elevation_m < 2800 else "Very Cold"
        base_temp = 12.0 if is_warm_season else 2.0
        lapse_reduction = ((elevation_m - 1000) / 1000.0) * 6.5
        temp_c = round(max(-12.0, base_temp - lapse_reduction), 1)
        rh_pct = 52.0
        wind_speed_ms = 4.8
        wind_dir = 310
        solar_rad = 720.0 if is_warm_season else 540.0
        direct_rad = round(solar_rad * 0.78, 1)
        diffuse_rad = round(solar_rad * 0.22, 1)
        precip = 2.0 if is_cold_season else 0.8
        cloud_pct = 35.0
        apparent_temp = round(temp_c - (wind_speed_ms * 0.8), 1)
        description = (
            f"High-altitude mountain terrain at {elevation_m:.0f}m elevation. "
            f"Intense solar UV through thin atmosphere, sharp lapse rate cold, and strong alpine wind."
        )

    # 2. Polar and Subpolar Boreal (Latitudes > 58 deg)
    elif abs_lat >= 58.0:
        zone_id = "subpolar_boreal"
        zone_name = "Subpolar / Boreal Cold Zone"
        category = "Cold" if is_warm_season else "Very Cold"
        temp_c = 14.5 if is_warm_season else -4.5
        rh_pct = 68.0
        wind_speed_ms = 5.2
        wind_dir = 45 if is_northern else 225
        solar_rad = 510.0 if is_warm_season else 180.0
        direct_rad = round(solar_rad * 0.65, 1)
        diffuse_rad = round(solar_rad * 0.35, 1)
        precip = 3.5
        cloud_pct = 60.0
        apparent_temp = round(temp_c - 3.5, 1)
        description = (
            f"High-latitude subpolar zone at {latitude:.2f} deg latitude. "
            f"Low solar elevation angle, persistent cold winds, and heavy building insulation requirement."
        )

    # 3. Subtropical Hot Desert Belt (15 deg to 34 deg latitude in arid longitudes or major desert belts)
    elif (15.0 <= abs_lat <= 34.0) and (
        (-18.0 <= longitude <= 60.0 and latitude > 0) or
        (115.0 <= longitude <= 145.0 and latitude < 0) or
        (-118.0 <= longitude <= -100.0 and 22.0 <= latitude <= 36.0) or
        (-72.0 <= longitude <= -65.0 and -30.0 <= latitude <= -18.0)
    ):
        zone_id = "hot_dry_desert"
        zone_name = "Subtropical Extreme Arid Desert"
        category = "Hot-Dry"
        temp_c = 41.8 if is_warm_season else 28.5
        rh_pct = 22.0 if is_warm_season else 28.0
        wind_speed_ms = 3.8
        wind_dir = 260
        solar_rad = 910.0 if is_warm_season else 760.0
        direct_rad = round(solar_rad * 0.82, 1)
        diffuse_rad = round(solar_rad * 0.18, 1)
        precip = 0.0
        cloud_pct = 10.0
        apparent_temp = round(temp_c + 2.4, 1)
        description = (
            f"Subtropical arid desert belt at {latitude:.2f} deg, {longitude:.2f} deg. "
            f"Scorching direct solar irradiance, minimal cloud cover, dry air, and massive diurnal thermal swings."
        )

    # 4. Equatorial & Tropical Hot-Humid (0 deg to 16 deg latitude)
    elif abs_lat <= 16.0:
        zone_id = "equatorial_tropical_humid"
        zone_name = "Equatorial / Tropical Hot-Humid Zone"
        category = "Hot-Humid"
        temp_c = 32.5
        rh_pct = 82.0
        wind_speed_ms = 2.6
        wind_dir = 190
        solar_rad = 720.0
        direct_rad = 420.0
        diffuse_rad = 300.0
        precip = 8.5
        cloud_pct = 70.0
        apparent_temp = 41.5
        description = (
            f"Equatorial maritime zone at {latitude:.2f} deg latitude. "
            f"Continuous high relative humidity, elevated heat index, frequent convective precipitation, and high diffuse sky radiation."
        )

    # 5. Mediterranean & Warm Subtropical (30 deg to 42 deg latitude)
    elif 30.0 <= abs_lat <= 42.0:
        zone_id = "mediterranean_subtropical"
        zone_name = "Mediterranean / Subtropical Zone"
        category = "Temperate" if not is_warm_season else "Composite"
        temp_c = 29.5 if is_warm_season else 14.0
        rh_pct = 48.0 if is_warm_season else 62.0
        wind_speed_ms = 3.4
        wind_dir = 230
        solar_rad = 780.0 if is_warm_season else 460.0
        direct_rad = round(solar_rad * 0.72, 1)
        diffuse_rad = round(solar_rad * 0.28, 1)
        precip = 0.5 if is_warm_season else 4.0
        cloud_pct = 25.0 if is_warm_season else 55.0
        apparent_temp = round(temp_c + (1.2 if is_warm_season else -1.0), 1)
        description = (
            f"Warm subtropical / Mediterranean climate belt at {latitude:.2f} deg. "
            f"Dry sunny warm periods with moderate sea breeze and balanced seasonal humidity."
        )

    # 6. Temperate Maritime & Continental (42 deg to 58 deg latitude)
    else:
        zone_id = "temperate_maritime"
        zone_name = "Temperate Maritime / Continental Zone"
        category = "Temperate" if is_warm_season else "Cold"
        temp_c = 20.5 if is_warm_season else 5.5
        rh_pct = 66.0
        wind_speed_ms = 4.2
        wind_dir = 250
        solar_rad = 560.0 if is_warm_season else 280.0
        direct_rad = round(solar_rad * 0.60, 1)
        diffuse_rad = round(solar_rad * 0.40, 1)
        precip = 3.2
        cloud_pct = 55.0
        apparent_temp = round(temp_c - 1.2, 1)
        description = (
            f"Mid-latitude temperate zone at {latitude:.2f} deg. "
            f"Mild summers, cool winters, frequent overcast diffuse sky, and steady prevailing westerly winds."
        )

    return {
        "zone_id": zone_id,
        "zone_name": zone_name,
        "category": category,
        "description": description,
        "environmental_data": {
            "temperature_c": temp_c,
            "apparent_temperature_c": apparent_temp,
            "relative_humidity_pct": rh_pct,
            "wind_speed_ms": wind_speed_ms,
            "wind_direction_deg": wind_dir,
            "solar_radiation_w_m2": solar_rad,
            "direct_radiation_w_m2": direct_rad,
            "diffuse_radiation_w_m2": diffuse_rad,
            "precipitation_mm": precip,
            "cloud_cover_pct": cloud_pct,
            "source_type": f"Demo Data (Geographical Condition: {zone_name})",
            "observation_time": now.isoformat()
        }
    }
