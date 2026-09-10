"""
Preliminary Cost Estimation Engine for ThermoShelter.
Calculates transparent Bill of Quantities (BOQ) with material and labor rates
based on standard Central Public Works Department (CPWD) schedule of rates.
"""

from typing import Dict, Any, List
try:
    from ..materials.catalog import get_material_by_id
except (ImportError, ValueError):
    from materials.catalog import get_material_by_id

def calculate_preliminary_cost(
    length_m: float,
    width_m: float,
    height_m: float,
    overhang_m: float,
    roof_material_id: str,
    structure_material_id: str,
    shading_material_id: str,
    floor_material_id: str,
    seating_material_id: str,
    seating_length_m: float,
    has_solar_pv: bool = False,
    has_gutter: bool = True,
    has_walls: bool = False,
    wall_material_id: str = "",
    has_roof_monitor: bool = False,
    has_hydration: bool = False,
    has_transit_display: bool = False,
    has_community_board: bool = False,
    has_emergency_kit: bool = False,
    has_tourist_kiosk: bool = False
) -> Dict[str, Any]:
    """
    Compute itemized preliminary cost for shelter prototype.
    """
    items: List[Dict[str, Any]] = []

    # 1. Roof Assembly
    roof_mat = get_material_by_id(roof_material_id)
    # Area including overhangs on all 4 sides
    roof_length = length_m + 2.0 * overhang_m
    roof_width = width_m + 2.0 * overhang_m
    roof_area = round(roof_length * roof_width * 1.05, 2) # 1.05 slope factor
    roof_cost = round(roof_area * roof_mat.get("unit_cost_inr_m2", 1000))
    items.append({
        "component": "Roof Envelope",
        "description": f"{roof_mat['name']} ({roof_area:.1f} m² incl. {overhang_m}m overhangs)",
        "quantity": roof_area,
        "unit": "m²",
        "unit_rate_inr": roof_mat.get("unit_cost_inr_m2", 1000),
        "total_cost_inr": roof_cost
    })

    # 2. Structural Frame & Posts
    struct_mat = get_material_by_id(structure_material_id)
    floor_area = round(length_m * width_m, 2)
    struct_cost = round(floor_area * struct_mat.get("unit_cost_inr_m2_floor", 1500))
    items.append({
        "component": "Structural Frame & Posts",
        "description": f"{struct_mat['name']} (Columns, trusses, purlins for {floor_area:.1f} m² footprint)",
        "quantity": floor_area,
        "unit": "m² footprint",
        "unit_rate_inr": struct_mat.get("unit_cost_inr_m2_floor", 1500),
        "total_cost_inr": struct_cost
    })

    # 3. Floor Platform & Pavers
    floor_mat = get_material_by_id(floor_material_id)
    floor_cost = round(floor_area * floor_mat.get("unit_cost_inr_m2", 700))
    items.append({
        "component": "Floor & Foundation Platform",
        "description": f"{floor_mat['name']} ({floor_area:.1f} m² plinth)",
        "quantity": floor_area,
        "unit": "m²",
        "unit_rate_inr": floor_mat.get("unit_cost_inr_m2", 700),
        "total_cost_inr": floor_cost
    })

    # 4. Shading Screens / Louvers
    shade_mat = get_material_by_id(shading_material_id)
    # Shading along length on solar-facing side
    shade_area = round(length_m * (height_m * 0.45), 2)
    shade_cost = round(shade_area * shade_mat.get("unit_cost_inr_m2", 1200))
    items.append({
        "component": "Solar Shading & Louvers",
        "description": f"{shade_mat['name']} ({shade_area:.1f} m² screen area)",
        "quantity": shade_area,
        "unit": "m²",
        "unit_rate_inr": shade_mat.get("unit_cost_inr_m2", 1200),
        "total_cost_inr": shade_cost
    })

    # 5. Ergonomic Seating
    seat_mat = get_material_by_id(seating_material_id)
    seat_cost = round(seating_length_m * seat_mat.get("unit_cost_inr_m", 1200))
    items.append({
        "component": "Integrated Seating",
        "description": f"{seat_mat['name']} ({seating_length_m:.1f} linear meters)",
        "quantity": seating_length_m,
        "unit": "linear m",
        "unit_rate_inr": seat_mat.get("unit_cost_inr_m", 1200),
        "total_cost_inr": seat_cost
    })

    # 6. Drainage Gutter
    if has_gutter:
        gutter_mat = get_material_by_id("gutter_rainwater")
        gutter_length = round(roof_length, 1)
        gutter_cost = round(gutter_length * gutter_mat.get("unit_cost_inr_m", 450))
        items.append({
            "component": "Drainage System",
            "description": f"{gutter_mat['name']} ({gutter_length} m run)",
            "quantity": gutter_length,
            "unit": "linear m",
            "unit_rate_inr": gutter_mat.get("unit_cost_inr_m", 450),
            "total_cost_inr": gutter_cost
        })

    # 7. Optional Solar PV
    if has_solar_pv:
        pv_mat = get_material_by_id("pv_monocrystalline")
        pv_cost = pv_mat.get("unit_cost_inr", 18000)
        items.append({
            "component": "Solar PV & Night Lighting",
            "description": pv_mat['name'],
            "quantity": 1,
            "unit": "set",
            "unit_rate_inr": pv_cost,
            "total_cost_inr": pv_cost
        })

    # 8. Thick Insulated Enclosure Walls (Cold / Mountain Climates)
    if has_walls and wall_material_id:
        wall_mat = get_material_by_id(wall_material_id)
        # Perimeter walls covering 3 sides: (Length + 2 * Width) * Height, with 25% deductions for windows/doors
        gross_wall_perimeter = length_m + 2.0 * width_m
        net_wall_area = round(gross_wall_perimeter * height_m * 0.75, 2)
        wall_cost = round(net_wall_area * wall_mat.get("unit_cost_inr_m2", 1800))
        items.append({
            "component": "Thermal Enclosure Walls",
            "description": f"{wall_mat['name']} ({net_wall_area:.1f} m² 3-sided enclosure)",
            "quantity": net_wall_area,
            "unit": "m²",
            "unit_rate_inr": wall_mat.get("unit_cost_inr_m2", 1800),
            "total_cost_inr": wall_cost
        })

    # 9. Roof Ridge Monitor Air Vent (Hot-Humid Stack Ventilation)
    if has_roof_monitor:
        mon_mat = get_material_by_id("roof_monitor_ridge_vent")
        mon_length = round(length_m * 0.7, 1)
        mon_cost = round(mon_length * mon_mat.get("unit_cost_inr_m", 850))
        items.append({
            "component": "Ridge Monitor Ventilation",
            "description": f"{mon_mat['name']} ({mon_length} m continuous ridge)",
            "quantity": mon_length,
            "unit": "linear m",
            "unit_rate_inr": mon_mat.get("unit_cost_inr_m", 850),
            "total_cost_inr": mon_cost
        })

    # 10. Facility Features (Hydration Station or Transit Notice Display)
    if has_hydration:
        hyd_mat = get_material_by_id("water_cooler_hydration_alcove")
        hyd_cost = hyd_mat.get("unit_cost_inr", 6500)
        items.append({
            "component": "Worker Hydration Station",
            "description": hyd_mat['name'],
            "quantity": 1,
            "unit": "set",
            "unit_rate_inr": hyd_cost,
            "total_cost_inr": hyd_cost
        })

    if has_transit_display:
        dis_mat = get_material_by_id("transit_schedule_display")
        dis_cost = dis_mat.get("unit_cost_inr", 4500)
        items.append({
            "component": "Passenger Transit Display",
            "description": dis_mat['name'],
            "quantity": 1,
            "unit": "set",
            "unit_rate_inr": dis_cost,
            "total_cost_inr": dis_cost
        })

    if has_community_board:
        com_mat = get_material_by_id("community_notice_board")
        com_cost = com_mat.get("unit_cost_inr", 3500)
        items.append({
            "component": "Community Bulletin Board",
            "description": com_mat['name'],
            "quantity": 1,
            "unit": "set",
            "unit_rate_inr": com_cost,
            "total_cost_inr": com_cost
        })

    if has_emergency_kit:
        emg_mat = get_material_by_id("emergency_supply_kit")
        emg_cost = emg_mat.get("unit_cost_inr", 5500)
        items.append({
            "component": "Emergency First-Aid Chest",
            "description": emg_mat['name'],
            "quantity": 1,
            "unit": "set",
            "unit_rate_inr": emg_cost,
            "total_cost_inr": emg_cost
        })

    if has_tourist_kiosk:
        trk_mat = get_material_by_id("tourist_info_kiosk")
        trk_cost = trk_mat.get("unit_cost_inr", 4800)
        items.append({
            "component": "Tourist Information Kiosk",
            "description": trk_mat['name'],
            "quantity": 1,
            "unit": "set",
            "unit_rate_inr": trk_cost,
            "total_cost_inr": trk_cost
        })

    materials_subtotal = sum(it["total_cost_inr"] for it in items)
    # Labor estimate: standard 28% of material subtotal for pre-fabricated & on-site assembled shelters
    labor_estimate = round(materials_subtotal * 0.28)
    grand_total = materials_subtotal + labor_estimate

    return {
        "material_subtotal_inr": materials_subtotal,
        "labor_estimate_inr": labor_estimate,
        "grand_total_inr": grand_total,
        "formatted_grand_total": f"₹{grand_total:,}",
        "itemized_boq": items,
        "cost_disclaimer": "Preliminary Prototype Estimate based on CPWD schedule of rates. Actual tender prices may vary with local freight and soil conditions."
    }
