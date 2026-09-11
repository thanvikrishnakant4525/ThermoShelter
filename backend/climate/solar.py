"""
Solar physics and geometry calculations for ThermoShelter.
Implements standard solar positioning algorithms (Spencer / Michalsky / NOAA) to calculate
solar zenith, azimuth, real-time sun altitude, solar noon peak, and overhang cut-off angles
for any geographical coordinate on Earth.
"""

import math
from datetime import datetime, timezone
from typing import Dict, Any, Optional

def calculate_solar_position(lat_deg: float, lon_deg: float, dt: Optional[datetime] = None) -> Dict[str, Any]:
    """
    Calculate universal solar azimuth, real-time altitude, and peak daytime solar geometry.
    Azimuth: 0° = North, 90° = East, 180° = South, 270° = West.
    Altitude: 0° = Horizon, 90° = Zenith.
    Works universally across both Northern and Southern hemispheres using UTC.
    """
    if dt is None:
        dt = datetime.now(timezone.utc)
    elif dt.tzinfo is None:
        # If naive, assume UTC
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)

    # Day of year (1-366)
    day_of_year = dt.timetuple().tm_yday
    utc_hour_float = dt.hour + dt.minute / 60.0 + dt.second / 3600.0

    # Solar fractional year in radians (Spencer formula)
    gamma = 2.0 * math.pi * (day_of_year - 1) / 365.0

    # Solar declination angle delta (Spencer formula in radians)
    declination_rad = (
        0.006918
        - 0.399912 * math.cos(gamma)
        + 0.070257 * math.sin(gamma)
        - 0.006758 * math.cos(2.0 * gamma)
        + 0.000907 * math.sin(2.0 * gamma)
        - 0.002697 * math.cos(3.0 * gamma)
        + 0.001480 * math.sin(3.0 * gamma)
    )
    declination_deg = math.degrees(declination_rad)

    # Equation of Time (EoT in minutes)
    eot_min = 229.18 * (
        0.000075
        + 0.001868 * math.cos(gamma)
        - 0.032077 * math.sin(gamma)
        - 0.014615 * math.cos(2.0 * gamma)
        - 0.040849 * math.sin(2.0 * gamma)
    )

    # Universal True Solar Time (TST in minutes from midnight)
    # TST = UTC minutes + 4 minutes per degree longitude + Equation of Time
    true_solar_time_min = (utc_hour_float * 60.0) + (4.0 * lon_deg) + eot_min
    true_solar_time_min = true_solar_time_min % 1440.0
    if true_solar_time_min < 0:
        true_solar_time_min += 1440.0

    # Solar hour angle (deg): 0° at solar noon, negative in morning, positive in afternoon
    hour_angle_deg = (true_solar_time_min / 4.0) - 180.0
    hour_angle_rad = math.radians(hour_angle_deg)

    lat_rad = math.radians(lat_deg)

    # Solar zenith angle
    cos_zenith = (
        math.sin(lat_rad) * math.sin(declination_rad)
        + math.cos(lat_rad) * math.cos(declination_rad) * math.cos(hour_angle_rad)
    )
    cos_zenith = max(-1.0, min(1.0, cos_zenith))
    zenith_rad = math.acos(cos_zenith)
    zenith_deg = math.degrees(zenith_rad)

    # Real-time altitude (elevation above horizon)
    altitude_deg = max(0.0, 90.0 - zenith_deg)
    is_daylight = zenith_deg < 90.0

    # Solar azimuth angle (0° = North, 90° = East, 180° = South, 270° = West)
    if math.sin(zenith_rad) > 1e-4:
        cos_azimuth = (
            math.sin(declination_rad) * math.cos(lat_rad)
            - math.cos(declination_rad) * math.sin(lat_rad) * math.cos(hour_angle_rad)
        ) / math.sin(zenith_rad)
        cos_azimuth = max(-1.0, min(1.0, cos_azimuth))
        azimuth_deg = math.degrees(math.acos(cos_azimuth))
        if hour_angle_deg > 0:
            azimuth_deg = 360.0 - azimuth_deg
    else:
        azimuth_deg = 180.0 if lat_deg >= 0 else 0.0

    # Peak solar altitude at solar noon for today (hour_angle = 0)
    # Noon solar altitude = 90° - |latitude - declination|
    peak_noon_altitude_deg = max(0.0, min(90.0, 90.0 - abs(lat_deg - declination_deg)))

    # Overhang cut-off angle recommendation based on daytime peak solar elevation
    # Optimal shading angle blocks the high burning sun while allowing natural daylight
    design_altitude = max(altitude_deg, peak_noon_altitude_deg)
    recommended_overhang_angle_deg = max(35.0, min(65.0, 90.0 - design_altitude + 15.0))

    return {
        "altitude_deg": round(altitude_deg, 1),
        "zenith_deg": round(zenith_deg, 1),
        "azimuth_deg": round(azimuth_deg, 1),
        "peak_noon_altitude_deg": round(peak_noon_altitude_deg, 1),
        "is_daylight": is_daylight,
        "recommended_overhang_angle_deg": round(recommended_overhang_angle_deg, 1),
        "true_solar_time": f"{int(true_solar_time_min // 60):02d}:{int(true_solar_time_min % 60):02d}",
        "declination_deg": round(declination_deg, 1)
    }
