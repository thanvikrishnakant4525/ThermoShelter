"""
Microclimate Thermal Modeling & Mean Radiant Temperature (Tmrt) Engine for ThermoShelter.
Simulates radiant heat flux exchange between solar rays, roof underside, ground, and occupant zone.
Calculates UTCI and comfort scores for baseline vs candidate shelters.
"""

import math
from typing import Dict, Any
from .utci import calculate_utci, get_utci_stress_category, calculate_comfort_score

def estimate_ambient_tmrt(temp_c: float, solar_radiation_w_m2: float) -> float:
    """
    Estimate outdoor ambient Mean Radiant Temperature (Tmrt) in open sun.
    Under direct sunlight, Tmrt is elevated substantially above air temperature.
    Approximation based on standard ASHRAE / biometeorological radiation balance:
    Tmrt ≈ Ta + (I_solar / 100) * 3.2
    """
    delta_rad = (solar_radiation_w_m2 / 100.0) * 3.2
    return round(temp_c + delta_rad, 1)

def calculate_shelter_microclimate(
    temp_c: float,
    rh_pct: float,
    wind_speed_ms: float,
    wind_direction_deg: int,
    solar_radiation_w_m2: float,
    roof_material_id: str,
    roof_type: str,
    overhang_depth_m: float,
    shelter_orientation_deg: int,
    openings_ratio: float,
    has_side_shading: bool = False
) -> Dict[str, Any]:
    """
    Evaluate shelter microclimate:
    1. Mean Radiant Temperature (Tmrt):
       - Overhead solar radiation blocked by roof envelope.
       - Roof underside surface temperature depends on material conductivity, insulation, and cavity ventilation.
       - Uninsulated metal roof underside reaches Ta + 20-30°C in peak sun.
       - PUF insulated roof underside remains within Ta + 1-2°C.
       - Ventilated double-skin terracotta underside remains within Ta + 2-3°C.
       - Side overhangs and louvers cut horizontal diffuse and ground-reflected radiation.
    2. Effective Air Velocity in Occupied Zone (va):
       - Evaluated by aerodynamic angle of incidence between wind direction and shelter orientation.
       - Multiplied by opening ratio and louvers.
    """
    # 1. Roof underside temperature increment
    if roof_material_id == "roof_uninsulated_gi_sheet":
        # Heavy heat penetration and underside re-radiation
        underside_temp_elev = (solar_radiation_w_m2 / 800.0) * 18.0
    elif roof_material_id == "roof_puf_sandwich":
        # Outstanding thermal resistance (U-value 0.45)
        underside_temp_elev = (solar_radiation_w_m2 / 800.0) * 1.5
    elif roof_material_id == "roof_double_skin_terracotta":
        # Ventilated stack effect exhausts heat
        underside_temp_elev = (solar_radiation_w_m2 / 800.0) * 2.8
    elif roof_material_id == "roof_reflective_galvalume":
        # High albedo coat reflects initial beam, thin sheet conducts remaining
        underside_temp_elev = (solar_radiation_w_m2 / 800.0) * 6.5
    elif roof_material_id == "roof_bamboo_thatch_composite":
        underside_temp_elev = (solar_radiation_w_m2 / 800.0) * 3.5
    else:
        underside_temp_elev = (solar_radiation_w_m2 / 800.0) * 8.0

    # Overhang factor (reduces perimeter solar penetration)
    # Standard 0.3m overhang provides 0.70 shade factor; 1.2m provides 0.95 shade factor
    shading_factor = min(0.96, 0.65 + (overhang_depth_m / 1.5) * 0.30)
    if has_side_shading:
        shading_factor = min(0.98, shading_factor + 0.05)

    # Effective Tmrt inside shelter
    # Tmrt = Ta + roof_underside_radiation_contribution * (1 - shading_factor_benefit)
    roof_radiant_weight = 0.45  # Solid angle subtended by roof overhead
    ground_radiant_weight = 0.55

    overhead_temp = temp_c + underside_temp_elev
    # Shaded floor stays cooler than sunlit ground
    floor_temp = temp_c + (1.0 - shading_factor) * (solar_radiation_w_m2 / 100.0) * 1.5

    shelter_tmrt = overhead_temp * roof_radiant_weight + floor_temp * ground_radiant_weight
    shelter_tmrt = round(shelter_tmrt, 1)

    # 2. Wind penetration into shelter
    # Angle difference between wind direction and shelter main opening axis
    rel_angle = abs((wind_direction_deg - shelter_orientation_deg) % 180)
    # Perpendicular or 45° flow enters best; parallel flow skims
    incidence_factor = max(0.40, math.cos(math.radians(rel_angle)))

    # Shelter internal wind speed (occupant level 1.1m)
    # Wind at 1.1m is typically 0.6 of 10m wind in open terrain
    # Passing through shelter openings:
    base_va = wind_speed_ms * 0.62
    shelter_va = base_va * openings_ratio * (0.5 + 0.5 * incidence_factor)
    shelter_va = max(0.4, min(15.0, shelter_va))

    # 3. Calculate UTCI inside shelter
    shelter_utci = calculate_utci(temp_c, rh_pct, shelter_va, shelter_tmrt)
    stress_cat, stress_code, stress_desc = get_utci_stress_category(shelter_utci)
    comfort_score = calculate_comfort_score(shelter_utci, is_cold_climate=(temp_c < 18.0))

    return {
        "shelter_tmrt_c": shelter_tmrt,
        "shelter_wind_speed_ms": round(shelter_va, 2),
        "shelter_utci_c": shelter_utci,
        "stress_category": stress_cat,
        "stress_code": stress_code,
        "stress_description": stress_desc,
        "comfort_score": comfort_score,
        "shading_factor": round(shading_factor, 2)
    }

def analyze_thermal_environment(
    temp_c: float,
    rh_pct: float,
    wind_speed_ms: float,
    wind_direction_deg: int,
    solar_radiation_w_m2: float
) -> Dict[str, Any]:
    """
    Perform full thermal baseline vs outdoor environment calculation.
    """
    ambient_tmrt = estimate_ambient_tmrt(temp_c, solar_radiation_w_m2)
    ambient_utci = calculate_utci(temp_c, rh_pct, wind_speed_ms, ambient_tmrt)
    amb_cat, amb_code, amb_desc = get_utci_stress_category(ambient_utci)
    amb_score = calculate_comfort_score(ambient_utci, is_cold_climate=(temp_c < 18.0))

    # Baseline Shelter performance (Flat uninsulated GI sheet, 0.3m overhang, orientation 0, 40% opening)
    baseline_sim = calculate_shelter_microclimate(
        temp_c=temp_c,
        rh_pct=rh_pct,
        wind_speed_ms=wind_speed_ms,
        wind_direction_deg=wind_direction_deg,
        solar_radiation_w_m2=solar_radiation_w_m2,
        roof_material_id="roof_uninsulated_gi_sheet",
        roof_type="flat",
        overhang_depth_m=0.3,
        shelter_orientation_deg=0,
        openings_ratio=0.40,
        has_side_shading=False
    )

    return {
        "ambient": {
            "air_temperature_c": temp_c,
            "relative_humidity_pct": rh_pct,
            "solar_radiation_w_m2": solar_radiation_w_m2,
            "mean_radiant_temp_c": ambient_tmrt,
            "wind_speed_ms": wind_speed_ms,
            "utci_c": ambient_utci,
            "stress_category": amb_cat,
            "stress_code": amb_code,
            "stress_description": amb_desc,
            "comfort_score": amb_score
        },
        "baseline_shelter": {
            "name": "Conventional Baseline Shelter (Uninsulated GI Sheet)",
            "roof_type": "Flat uninsulated GI sheet",
            "overhang_m": 0.3,
            "orientation_deg": 0,
            "mean_radiant_temp_c": baseline_sim["shelter_tmrt_c"],
            "wind_speed_ms": baseline_sim["shelter_wind_speed_ms"],
            "utci_c": baseline_sim["shelter_utci_c"],
            "stress_category": baseline_sim["stress_category"],
            "stress_code": baseline_sim["stress_code"],
            "stress_description": baseline_sim["stress_description"],
            "comfort_score": baseline_sim["comfort_score"],
            "utci_reduction_vs_ambient": round(ambient_utci - baseline_sim["shelter_utci_c"], 1)
        }
    }
