"""
Solar physics and geometry calculations for ThermoShelter.
Implements standard solar positioning algorithms (Spencer / Michalsky) to calculate
solar zenith, azimuth, and sun altitude angle for any geographical coordinate and timestamp.
"""

import math
from datetime import datetime
from typing import Dict, Any

def calculate_solar_position(lat_deg: float, lon_deg: float, dt: datetime = None) -> Dict[str, Any]:
    """
    Calculate solar azimuth and altitude (elevation) in degrees.
    Azimuth: 0° = North, 90° = East, 180° = South, 270° = West.
    Altitude: 0° = Horizon, 90° = Zenith.
    """
    if dt is None:
        dt = datetime.now()

    # Day of year
    day_of_year = dt.timetuple().tm_yday
    hour = dt.hour + dt.minute / 60.0 + dt.second / 3600.0

    # Solar declination angle delta (approximate Spencer formula)
    b = 2 * math.pi * (day_of_year - 1) / 365.0
    declination_rad = (
        0.006918 - 0.399912 * math.cos(b) + 0.070257 * math.sin(b)
        - 0.006758 * math.cos(2 * b) + 0.000907 * math.sin(2 * b)
        - 0.002697 * math.cos(3 * b) + 0.00148 * math.sin(3 * b)
    )

    # Equation of time (minutes)
    eot_min = 229.18 * (
        0.000075 + 0.001868 * math.cos(b) - 0.032077 * math.sin(b)
        - 0.014615 * math.cos(2 * b) - 0.040849 * math.sin(2 * b)
    )

    # Solar time calculation (Standard meridian for India is 82.5°E, but general formula uses longitude offset)
    time_offset = eot_min + 4.0 * (lon_deg - 82.5) # Assuming IST offset of +5:30
    true_solar_time = hour * 60.0 + time_offset
    hour_angle_deg = (true_solar_time / 4.0) - 180.0
    hour_angle_rad = math.radians(hour_angle_deg)

    lat_rad = math.radians(lat_deg)

    # Solar zenith angle
    cos_zenith = (
        math.sin(lat_rad) * math.sin(declination_rad)
        + math.cos(lat_rad) * math.cos(declination_rad) * math.cos(hour_angle_rad)
    )
    cos_zenith = max(-1.0, min(1.0, cos_zenith))
    zenith_rad = math.acos(cos_zenith)
    altitude_deg = max(0.0, 90.0 - math.degrees(zenith_rad))

    # Solar azimuth angle
    if math.sin(zenith_rad) != 0:
        cos_azimuth = (
            math.sin(declination_rad) * math.cos(lat_rad)
            - math.cos(declination_rad) * math.sin(lat_rad) * math.cos(hour_angle_rad)
        ) / math.sin(zenith_rad)
        cos_azimuth = max(-1.0, min(1.0, cos_azimuth))
        azimuth_rad = math.acos(cos_azimuth)
        azimuth_deg = math.degrees(azimuth_rad)
        if hour_angle_deg > 0:
            azimuth_deg = 360.0 - azimuth_deg
    else:
        azimuth_deg = 180.0

    # Shading profile cut-off recommendation based on peak altitude
    recommended_overhang_angle_deg = max(35.0, min(65.0, 90.0 - altitude_deg + 15.0))

    return {
        "altitude_deg": round(altitude_deg, 1),
        "zenith_deg": round(math.degrees(zenith_rad), 1),
        "azimuth_deg": round(azimuth_deg, 1),
        "is_daylight": altitude_deg > 0.0,
        "recommended_overhang_angle_deg": round(recommended_overhang_angle_deg, 1)
    }
