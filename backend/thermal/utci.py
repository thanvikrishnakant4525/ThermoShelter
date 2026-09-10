"""
Universal Thermal Climate Index (UTCI) Engine for ThermoShelter.
Implements the validated biometeorological polynomial approximation
developed under European COST Action 730 and published by Bröde et al. (2012).
"""

import math
from typing import Dict, Any, Tuple

def vapor_pressure_kpa(temp_c: float, rh_pct: float) -> float:
    """Calculate water vapor pressure in kPa from temperature (°C) and relative humidity (%)."""
    # Magnus-Tetens formula for saturation vapor pressure
    es_kpa = 0.61078 * math.exp((17.27 * temp_c) / (temp_c + 237.3))
    ea_kpa = es_kpa * (rh_pct / 100.0)
    return max(0.01, ea_kpa)

def calculate_utci(temp_c: float, rh_pct: float, wind_speed_10m: float, tmrt_c: float) -> float:
    """
    Calculate UTCI (°C) using the validated operational polynomial.
    Air temperature: temp_c (°C)
    Relative humidity: rh_pct (%)
    Wind speed at 10m height: wind_speed_10m (m/s) (clipped to valid range [0.5, 30.3])
    Mean radiant temperature: tmrt_c (°C)
    """
    va = max(0.5, min(25.0, wind_speed_10m))
    ta = temp_c
    d_tmrt = tmrt_c - ta
    ea = vapor_pressure_kpa(ta, rh_pct)

    # Core polynomial terms for UTCI approximation
    # dUTCI = UTCI - Ta
    # Coefficients from Bröde et al. 2012 / COST 730
    d_utci = (
        0.607562052
        - 0.0227712343 * ta
        + 8.06470249e-4 * (ta**2)
        - 1.54271372e-4 * (ta**3)
        - 3.24651981e-6 * (ta**4)
        + 7.32602852e-8 * (ta**5)
        + 1.35959073e-9 * (ta**6)
        - 2.25836520 * va
        + 0.0880326035 * ta * va
        - 0.0016025256 * (ta**2) * va
        - 3.81474637e-6 * (ta**3) * va
        + 2.86558660e-6 * (ta**4) * va
        - 2.4720125e-8 * (ta**5) * va
        - 0.392370019 * (va**2)
        + 0.0179280373 * ta * (va**2)
        - 6.67534981e-4 * (ta**2) * (va**2)
        + 1.00732281e-5 * (ta**3) * (va**2)
        + 0.0477584105 * (va**3)
        - 0.0017302861 * ta * (va**3)
        + 3.01897258e-5 * (ta**2) * (va**3)
        - 0.0028584852 * (va**4)
        + 8.24337619e-5 * ta * (va**4)
        + 6.45224339e-5 * (va**5)
        + 0.397608492 * d_tmrt
        - 0.005188331 * ta * d_tmrt
        + 4.09032241e-5 * (ta**2) * d_tmrt
        - 0.0573905324 * va * d_tmrt
        + 0.0011536161 * ta * va * d_tmrt
        + 0.0014105742 * (va**2) * d_tmrt
        - 0.0052310101 * (d_tmrt**2)
        + 3.08416568e-5 * ta * (d_tmrt**2)
        + 0.000638515 * va * (d_tmrt**2)
        + 0.374896223 * ea
        - 0.0169652263 * ta * ea
        + 0.0002677266 * (ta**2) * ea
        - 0.0768070492 * va * ea
        + 0.0025087692 * ta * va * ea
        + 0.0041288862 * (va**2) * ea
        + 0.0425154152 * d_tmrt * ea
        - 0.0010904447 * ta * d_tmrt * ea
        - 0.0007389911 * va * d_tmrt * ea
        - 0.044719715 * (ea**2)
        + 0.0019443282 * ta * (ea**2)
        + 0.0024467831 * va * (ea**2)
    )

    utci = ta + d_utci
    return round(utci, 1)

def get_utci_stress_category(utci_val: float) -> Tuple[str, str, str]:
    """
    Classify UTCI into standardized biometeorological stress category,
    severity code, and human description.
    """
    if utci_val > 46.0:
        return "Extreme Heat Stress", "extreme_heat", "High risk of heat stroke and severe physiological strain. Immediate shaded enclosure required."
    elif utci_val >= 38.0:
        return "Very Strong Heat Stress", "very_strong_heat", "Severe cardiovascular load; sweating efficiency drops without adequate air velocity."
    elif utci_val >= 32.0:
        return "Strong Heat Stress", "strong_heat", "Noticeable thermal discomfort and sweating; shaded relief and cross-ventilation are critical."
    elif utci_val >= 26.0:
        return "Moderate Heat Stress", "moderate_heat", "Slight warm sensation; natural air movement maintains acceptable comfort."
    elif utci_val >= 9.0:
        return "No Thermal Stress (Comfort Zone)", "comfort", "Optimal outdoor thermal condition. No physiological thermal strain."
    elif utci_val >= 0.0:
        return "Slight Cold Stress", "slight_cold", "Slight cool sensation; lightweight protective clothing or windbreak maintains balance."
    elif utci_val >= -13.0:
        return "Moderate Cold Stress", "moderate_cold", "Cold discomfort; wind shielding and enclosure are necessary."
    else:
        return "Strong / Extreme Cold Stress", "severe_cold", "High cold stress; heavily insulated and wind-sealed shelter envelope required."

def calculate_comfort_score(utci_val: float, is_cold_climate: bool = False) -> int:
    """
    Convert UTCI to a transparent 0-100 engineering comfort score.
    100 = Optimal Comfort (UTCI between 18°C and 24°C).
    Score decreases monotonically as thermal stress increases.
    """
    if not is_cold_climate:
        # Warm / Hot stress curve
        if 18.0 <= utci_val <= 24.0:
            score = 100
        elif utci_val < 18.0:
            score = max(20, int(100 - (18.0 - utci_val) * 4.0))
        elif utci_val <= 26.0:
            score = int(100 - (utci_val - 24.0) * 3.5)
        elif utci_val <= 32.0:
            score = int(93 - (utci_val - 26.0) * 3.8)
        elif utci_val <= 38.0:
            score = int(70 - (utci_val - 32.0) * 4.2)
        elif utci_val <= 46.0:
            score = int(45 - (utci_val - 38.0) * 4.0)
        else:
            score = max(5, int(15 - (utci_val - 46.0) * 2.0))
    else:
        # Cold climate curve
        if 18.0 <= utci_val <= 24.0:
            score = 100
        elif utci_val > 24.0:
            score = max(30, int(100 - (utci_val - 24.0) * 4.0))
        elif utci_val >= 9.0:
            score = int(100 - (18.0 - utci_val) * 2.5)
        elif utci_val >= 0.0:
            score = int(78 - (9.0 - utci_val) * 3.5)
        elif utci_val >= -10.0:
            score = int(47 - (0.0 - utci_val) * 3.2)
        else:
            score = max(5, int(15 - abs(utci_val + 10.0) * 1.5))

    return max(5, min(100, score))
