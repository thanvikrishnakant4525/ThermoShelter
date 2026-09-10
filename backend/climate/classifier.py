"""
Bioclimatic Classification & Site Stress Assessment for ThermoShelter.
Implements National Building Code of India (NBC 2016) & Bansal-Minke bioclimatic rules.
Provides transparent, data-driven reasoning for climate category assignment.
"""

from typing import Dict, Any

def classify_climate(temp_c: float, rh_pct: float, rainfall_mm: float, solar_w_m2: float, elevation_m: float = 0.0) -> Dict[str, Any]:
    """
    Classify location into a verified bioclimatic category:
    - Hot-Dry: Mean summer temp > 30°C, RH < 55%, low rainfall, intense solar radiation.
    - Hot-Humid: Mean temp > 28°C, RH > 65%, heavy rainfall/coastal proximity.
    - Composite: Severe seasonal swings, high summer temps with moderate to high humidity.
    - Temperate: Mean temp 18°C - 27°C, RH 45% - 70%, moderate solar radiation.
    - Cold: Mean temp < 15°C, high elevation or northern latitudes.
    - Very Cold: Mean temp < 0°C, extreme high altitude/alpine.
    """
    reasons = []

    if temp_c < 0.0 or (elevation_m > 2500 and temp_c < 5.0):
        category = "Very Cold"
        reasons.append(f"Sub-zero or near-freezing temperature ({temp_c:.1f}°C) and high elevation ({elevation_m:.0f}m) create severe cold stress.")
    elif temp_c < 18.0 or elevation_m > 1800:
        category = "Cold"
        reasons.append(f"Low ambient temperature ({temp_c:.1f}°C) combined with high altitude ({elevation_m:.0f}m) requires thermal retention and wind protection.")
    elif temp_c >= 30.0 and rh_pct < 45.0:
        category = "Hot-Dry"
        reasons.append(f"High ambient temperature ({temp_c:.1f}°C) combined with dry air (relative humidity {rh_pct:.1f}%) and strong solar irradiance ({solar_w_m2:.0f} W/m²).")
        reasons.append("Evaporative potential is high, but direct solar heat gain is the dominant thermal discomfort driver.")
    elif temp_c >= 27.0 and rh_pct >= 65.0:
        category = "Hot-Humid"
        reasons.append(f"Warm temperature ({temp_c:.1f}°C) combined with high relative humidity ({rh_pct:.1f}%) severely impairs human evaporative sweating.")
        if rainfall_mm > 5.0:
            reasons.append(f"Active precipitation ({rainfall_mm:.1f} mm) requires continuous overhang and gutter water shedding.")
    elif temp_c >= 28.0 and 45.0 <= rh_pct < 65.0:
        category = "Composite"
        reasons.append(f"Temperature ({temp_c:.1f}°C) and intermediate humidity ({rh_pct:.1f}%) exhibit composite behavior with both dry heat and latent humidity phases.")
    elif 18.0 <= temp_c < 28.0 and 40.0 <= rh_pct <= 75.0:
        category = "Temperate"
        reasons.append(f"Mild ambient temperature ({temp_c:.1f}°C) and balanced humidity ({rh_pct:.1f}%) place the site within a moderate bioclimatic band.")
    else:
        # Fallback based on temperature predominance
        if temp_c >= 28.0:
            category = "Composite"
            reasons.append(f"Elevated temperature ({temp_c:.1f}°C) creates heat stress requiring solar protection and ventilation.")
        else:
            category = "Temperate"
            reasons.append(f"Moderate conditions ({temp_c:.1f}°C, {rh_pct:.1f}% RH).")

    # Site Assessment Indicators
    # 1. Solar Exposure
    if solar_w_m2 >= 750:
        solar_exposure = "High"
    elif solar_w_m2 >= 450:
        solar_exposure = "Moderate"
    else:
        solar_exposure = "Low"

    # 2. Heat Stress
    if temp_c >= 38.0 or (temp_c >= 33.0 and rh_pct > 70):
        heat_stress = "Severe"
    elif temp_c >= 32.0:
        heat_stress = "High"
    elif temp_c >= 25.0:
        heat_stress = "Moderate"
    else:
        heat_stress = "Low (Cold Dominated)"

    # 3. Ventilation Potential
    # In hot-humid climates, ventilation is critical. In hot-dry, closed daytime mass with night flushing is better.
    if category == "Hot-Humid":
        ventilation_potential = "High (Critical for Comfort)"
    elif category == "Hot-Dry":
        ventilation_potential = "Moderate (Requires Solar Shielding)"
    elif category in ["Cold", "Very Cold"]:
        ventilation_potential = "Low (Need Wind Buffer)"
    else:
        ventilation_potential = "High (Natural Cross-Breeze)"

    # 4. Rain Protection Requirement
    if rainfall_mm > 10.0 or (category == "Hot-Humid" and rainfall_mm > 2.0):
        rain_protection = "High"
    elif rainfall_mm > 1.0:
        rain_protection = "Medium"
    else:
        rain_protection = "Low"

    # 5. Shading Requirement
    if solar_w_m2 >= 650 or temp_c >= 32.0:
        shading_req = "High"
    elif solar_w_m2 >= 400 or temp_c >= 24.0:
        shading_req = "Medium"
    else:
        shading_req = "Low (Solar Gain Desirable)"

    # 6. Thermal Mass Need
    if category == "Hot-Dry":
        thermal_mass_need = "High (Attenuates Diurnal Heat Wave)"
    elif category == "Hot-Humid":
        thermal_mass_need = "Low (Avoid Heat Trapping)"
    elif category in ["Cold", "Composite"]:
        thermal_mass_need = "Moderate"
    else:
        thermal_mass_need = "Low"

    return {
        "category": category,
        "explanation": " ".join(reasons),
        "indicators": {
            "solar_exposure": solar_exposure,
            "heat_stress": heat_stress,
            "ventilation_potential": ventilation_potential,
            "rain_protection": rain_protection,
            "shading_requirement": shading_req,
            "thermal_mass_need": thermal_mass_need
        }
    }
