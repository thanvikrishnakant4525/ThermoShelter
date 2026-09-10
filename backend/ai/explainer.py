"""
Deterministic Explanation & Question Answering Engine for ThermoShelter.
Answers questions about generated designs and explains trade-offs purely grounded in physics calculations.
"""

from typing import Dict, Any

def generate_design_explanation(option: Dict[str, Any], climate_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate deep technical synthesis of the selected option.
    """
    env = climate_info["environmental_data"]
    climate_char = climate_info["climate_character"]
    dims = option["dimensions"]
    roof = option["roof"]
    mats = option["main_materials"]

    summary = (
        f"For {climate_info['location']['name']} ({climate_char['category']} climate), "
        f"{option['title']} was synthesized with a {dims['floor_area_m2']} m² footprint ({dims['length_m']}m × {dims['width_m']}m). "
        f"The primary heat mitigation strategy utilizes a {roof['material']} roof with an extended {roof['overhang_m']}m overhang, "
        f"lowering internal Mean Radiant Temperature to {option['tmrt_c']}°C. "
        f"By orienting the main opening at {option['orientation_deg']}°, the design captures prevailing wind ({env['wind_speed_ms']} m/s) "
        f"to achieve an occupant-level air speed of {option['internal_wind_speed_ms']} m/s, yielding a UTCI of {option['utci_c']}°C "
        f"({option['stress_category']})."
    )

    tradeoffs = [
        f"Comfort: Delivers a comfort score of {option['thermal_comfort_score']}/100 and reduces UTCI by {option['utci_reduction_vs_baseline']}°C compared to conventional GI sheet baseline.",
        f"Economics: Total estimated investment is {option['formatted_cost']}, representing a balanced engineering compromise between life-cycle durability and initial capital outlay.",
        f"Durability: Constructed using {mats['structure']} with {mats['floor']} and {mats['seating']} for high vandal resistance and minimal maintenance in public settings."
    ]

    return {
        "design_title": option["title"],
        "executive_summary": summary,
        "key_tradeoffs": tradeoffs,
        "scientific_integrity_note": "This reasoning is deterministically derived from calculated thermodynamic heat balances, not statistical text generation."
    }
