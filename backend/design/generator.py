"""
Area-Specific Shelter Design Generator for ThermoShelter.
Synthesizes site climate data, solar geometry, human capacity, and budget constraints
into 3 distinct, practical, fully-parameterized shelter options + baseline comparison.
"""

from typing import Dict, Any, List
import math
try:
    from ..thermal.comfort import calculate_shelter_microclimate, analyze_thermal_environment
    from ..cost.estimator import calculate_preliminary_cost
    from ..materials.catalog import get_material_by_id
except (ImportError, ValueError):
    from thermal.comfort import calculate_shelter_microclimate, analyze_thermal_environment
    from cost.estimator import calculate_preliminary_cost
    from materials.catalog import get_material_by_id


def calculate_dimensions_for_capacity(capacity: int, shelter_purpose: str = "Public waiting shelter", user_length: float = 0.0, user_width: float = 0.0) -> Dict[str, float]:
    """
    Calculate safe floor footprint and dimensions based on human occupancy and facility purpose.
    - Rural community: 1.5 m²/person, aspect ratio ~1.45 (pavilion for central gathering)
    - Emergency shelter: 1.6 m²/person, aspect ratio ~1.8 (clear bay for relief cots)
    - Worker rest: 1.35 m²/person, aspect ratio ~2.0 (depth for reclined rest couches)
    - Tourist shelter: 1.3 m²/person, aspect ratio ~1.6 (panoramic scenic rest space)
    - Bus stop / Public waiting: 1.15 m²/person, aspect ratio ~2.6 (linear roadside shelter)
    """
    if user_length > 0.0 and user_width > 0.0:
        return {
            "length_m": round(user_length, 2),
            "width_m": round(user_width, 2),
            "height_m": 2.9,
            "floor_area_m2": round(user_length * user_width, 2)
        }

    if shelter_purpose == "Rural community shelter":
        area_per_person = 1.5
        aspect_ratio = 1.45
    elif shelter_purpose == "Emergency shelter":
        area_per_person = 1.6
        aspect_ratio = 1.8
    elif shelter_purpose == "Worker rest shelter":
        area_per_person = 1.35
        aspect_ratio = 2.0
    elif shelter_purpose == "Tourist shelter":
        area_per_person = 1.3
        aspect_ratio = 1.6
    else:
        area_per_person = 1.15
        aspect_ratio = 2.6

    target_area = max(9.0, capacity * area_per_person)
    width_m = max(2.4, round(math.sqrt(target_area / aspect_ratio), 1))
    length_m = round(target_area / width_m, 1)
    height_m = 3.0 if target_area <= 35 else 3.2

    return {
        "length_m": length_m,
        "width_m": width_m,
        "height_m": height_m,
        "floor_area_m2": round(length_m * width_m, 1)
    }

def generate_shelter_options(
    climate_info: Dict[str, Any],
    capacity: int = 20,
    budget_inr: float = 120000.0,
    shelter_purpose: str = "Public waiting shelter",
    priority: str = "Balanced",
    user_length: float = 0.0,
    user_width: float = 0.0
) -> Dict[str, Any]:
    """
    Generate 3 distinct shelter designs tailored specifically to the site's environmental inputs.
    """
    env = climate_info["environmental_data"]
    climate_zone = climate_info["climate_character"]["category"]
    solar_pos = climate_info.get("solar_position", {"azimuth_deg": 180, "altitude_deg": 50})

    temp_c = env["temperature_c"]
    rh_pct = env["relative_humidity_pct"]
    wind_speed = env["wind_speed_ms"]
    wind_dir = env["wind_direction_deg"]
    solar_rad = env["solar_radiation_w_m2"]
    precip = env["precipitation_mm"]

    dims = calculate_dimensions_for_capacity(capacity, shelter_purpose, user_length, user_width)
    L = dims["length_m"]
    W = dims["width_m"]
    H = dims["height_m"]

    # Seating length derived from capacity and purpose
    seat_len = round(min(L * 1.8 if shelter_purpose == "Rural community shelter" else L * 0.85, max(2.4, (capacity * 0.45) * 0.6)), 1)

    # 1. Orientation Strategy
    # In hot climates, align long axis East-West to minimize low-angle solar exposure on long walls.
    # Open sides should face prevailing breeze for maximum natural ventilation.
    if climate_zone in ["Hot-Dry", "Hot-Humid", "Composite"]:
        opt_orientation_comfort = (wind_dir + 15) % 360
        opt_orientation_balanced = wind_dir
        opt_orientation_econ = 90  # Simple East-West default
    elif climate_zone in ["Cold", "Very Cold"]:
        # Orient main opening toward South (solar gain) while blocking cold prevailing winds
        opt_orientation_comfort = 180 # South
        opt_orientation_balanced = 180
        opt_orientation_econ = 180
    else:
        opt_orientation_comfort = wind_dir
        opt_orientation_balanced = wind_dir
        opt_orientation_econ = 90

    # 2. Baseline Shelter Analysis
    baseline_env = analyze_thermal_environment(temp_c, rh_pct, wind_speed, wind_dir, solar_rad)
    base_info = baseline_env["baseline_shelter"]

    # Baseline Cost
    base_cost = calculate_preliminary_cost(
        length_m=L, width_m=W, height_m=H, overhang_m=0.3,
        roof_material_id="roof_uninsulated_gi_sheet",
        structure_material_id="struct_galv_steel",
        shading_material_id="shade_timber_slat",
        floor_material_id="floor_cseb_pavers",
        seating_material_id="seat_timber_slat",
        seating_length_m=seat_len,
        has_solar_pv=False,
        has_gutter=False
    )

    # Determine purpose-specific features
    has_worker_hydration = (shelter_purpose == "Worker rest shelter")
    has_transit_board = (shelter_purpose in ["Public waiting shelter", "Bus stop"])
    has_community_board = (shelter_purpose == "Rural community shelter")
    has_emergency_kit = (shelter_purpose == "Emergency shelter")
    has_tourist_kiosk = (shelter_purpose == "Tourist shelter")
    is_cold_climate = climate_zone in ["Cold", "Very Cold", "Mountain"]
    is_hot_dry = climate_zone == "Hot-Dry"
    is_hot_humid = climate_zone == "Hot-Humid"

    # ==========================================
    # OPTION A: THERMAL COMFORT PRIORITY
    # ==========================================
    if is_hot_dry:
        optA_roof_mat = "roof_puf_sandwich"
        optA_roof_type = "double_layer_ventilated"
        optA_overhang = 1.4
        optA_struct = "struct_galv_steel"
        optA_shade = "wall_terracotta_jali_masonry"
        optA_floor = "floor_kota_stone"
        optA_seat = "seat_stone_masonry"
        optA_pv = True
        optA_gutter = False
        optA_opening = 0.55
        optA_has_walls = False
        optA_wall_mat = ""
        optA_roof_cavity = True
        optA_roof_monitor = False
        optA_stilt = False
    elif is_hot_humid:
        optA_roof_mat = "roof_double_skin_terracotta"
        optA_roof_type = "ventilated_curved"
        optA_overhang = 1.4
        optA_struct = "struct_galv_steel"
        optA_shade = "shade_aerodynamic_louvers"
        optA_floor = "floor_raised_bamboo_deck"
        optA_seat = "seat_timber_slat"
        optA_pv = True
        optA_gutter = True
        optA_opening = 0.85
        optA_has_walls = False
        optA_wall_mat = ""
        optA_roof_cavity = False
        optA_roof_monitor = True
        optA_stilt = True
    elif is_cold_climate:
        optA_roof_mat = "roof_puf_sandwich"
        optA_roof_type = "steep_sloped_insulated"
        optA_overhang = 0.6
        optA_struct = "struct_galv_steel"
        optA_shade = "window_low_e_double_glazed"
        optA_floor = "floor_cseb_pavers"
        optA_seat = "seat_timber_slat"
        optA_pv = False
        optA_gutter = True
        optA_opening = 0.25
        optA_has_walls = True
        optA_wall_mat = "wall_thick_stone_masonry"
        optA_roof_cavity = False
        optA_roof_monitor = False
        optA_stilt = False
    else: # Composite / Temperate
        optA_roof_mat = "roof_puf_sandwich"
        optA_roof_type = "double_layer_ventilated"
        optA_overhang = 1.2
        optA_struct = "struct_galv_steel"
        optA_shade = "shade_aerodynamic_louvers"
        optA_floor = "floor_kota_stone"
        optA_seat = "seat_timber_slat"
        optA_pv = True
        optA_gutter = True
        optA_opening = 0.70
        optA_has_walls = False
        optA_wall_mat = ""
        optA_roof_cavity = True
        optA_roof_monitor = False
        optA_stilt = False

    sim_A = calculate_shelter_microclimate(
        temp_c=temp_c, rh_pct=rh_pct, wind_speed_ms=wind_speed, wind_direction_deg=wind_dir,
        solar_radiation_w_m2=solar_rad, roof_material_id=optA_roof_mat, roof_type=optA_roof_type,
        overhang_depth_m=optA_overhang, shelter_orientation_deg=opt_orientation_comfort,
        openings_ratio=optA_opening, has_side_shading=True
    )
    cost_A = calculate_preliminary_cost(
        length_m=L, width_m=W, height_m=H, overhang_m=optA_overhang,
        roof_material_id=optA_roof_mat, structure_material_id=optA_struct,
        shading_material_id=optA_shade, floor_material_id=optA_floor,
        seating_material_id=optA_seat, seating_length_m=seat_len,
        has_solar_pv=optA_pv, has_gutter=optA_gutter,
        has_walls=optA_has_walls, wall_material_id=optA_wall_mat,
        has_roof_monitor=optA_roof_monitor,
        has_hydration=has_worker_hydration,
        has_transit_display=has_transit_board,
        has_community_board=has_community_board,
        has_emergency_kit=has_emergency_kit,
        has_tourist_kiosk=has_tourist_kiosk
    )

    # ==========================================
    # OPTION B: BALANCED (COMFORT + PRACTICALITY + BUDGET)
    # ==========================================
    if is_hot_dry:
        optB_roof_mat = "roof_double_skin_terracotta"
        optB_roof_type = "ventilated_sloped"
        optB_overhang = 0.95
        optB_struct = "struct_galv_steel"
        optB_shade = "shade_terracotta_jali"
        optB_floor = "floor_cseb_pavers"
        optB_seat = "seat_timber_slat"
        optB_pv = False
        optB_gutter = False
        optB_opening = 0.60
        optB_has_walls = False
        optB_wall_mat = ""
        optB_roof_cavity = True
        optB_roof_monitor = False
        optB_stilt = False
    elif is_hot_humid:
        optB_roof_mat = "roof_reflective_galvalume"
        optB_roof_type = "pitched_ventilated"
        optB_overhang = 1.05
        optB_struct = "struct_galv_steel"
        optB_shade = "shade_aerodynamic_louvers"
        optB_floor = "floor_cseb_pavers"
        optB_seat = "seat_timber_slat"
        optB_pv = False
        optB_gutter = True
        optB_opening = 0.80
        optB_has_walls = False
        optB_wall_mat = ""
        optB_roof_cavity = False
        optB_roof_monitor = True
        optB_stilt = True
    elif is_cold_climate:
        optB_roof_mat = "roof_puf_sandwich"
        optB_roof_type = "steep_sloped_insulated"
        optB_overhang = 0.5
        optB_struct = "struct_engineered_bamboo"
        optB_shade = "window_low_e_double_glazed"
        optB_floor = "floor_cseb_pavers"
        optB_seat = "seat_timber_slat"
        optB_pv = False
        optB_gutter = True
        optB_opening = 0.30
        optB_has_walls = True
        optB_wall_mat = "wall_timber_insulated_panel"
        optB_roof_cavity = False
        optB_roof_monitor = False
        optB_stilt = False
    else: # Composite / Temperate
        optB_roof_mat = "roof_reflective_galvalume"
        optB_roof_type = "ventilated_sloped"
        optB_overhang = 0.85
        optB_struct = "struct_galv_steel"
        optB_shade = "shade_timber_slat"
        optB_floor = "floor_cseb_pavers"
        optB_seat = "seat_timber_slat"
        optB_pv = False
        optB_gutter = True
        optB_opening = 0.70
        optB_has_walls = False
        optB_wall_mat = ""
        optB_roof_cavity = True
        optB_roof_monitor = False
        optB_stilt = False

    sim_B = calculate_shelter_microclimate(
        temp_c=temp_c, rh_pct=rh_pct, wind_speed_ms=wind_speed, wind_direction_deg=wind_dir,
        solar_radiation_w_m2=solar_rad, roof_material_id=optB_roof_mat, roof_type=optB_roof_type,
        overhang_depth_m=optB_overhang, shelter_orientation_deg=opt_orientation_balanced,
        openings_ratio=optB_opening, has_side_shading=True
    )
    cost_B = calculate_preliminary_cost(
        length_m=L, width_m=W, height_m=H, overhang_m=optB_overhang,
        roof_material_id=optB_roof_mat, structure_material_id=optB_struct,
        shading_material_id=optB_shade, floor_material_id=optB_floor,
        seating_material_id=optB_seat, seating_length_m=seat_len,
        has_solar_pv=optB_pv, has_gutter=optB_gutter,
        has_walls=optB_has_walls, wall_material_id=optB_wall_mat,
        has_roof_monitor=optB_roof_monitor,
        has_hydration=has_worker_hydration,
        has_transit_display=has_transit_board,
        has_community_board=has_community_board,
        has_emergency_kit=has_emergency_kit,
        has_tourist_kiosk=has_tourist_kiosk
    )

    # ==========================================
    # OPTION C: ECONOMY (LOW-COST LOCAL MATERIALS)
    # ==========================================
    if is_cold_climate:
        optC_roof_mat = "roof_reflective_galvalume"
        optC_roof_type = "steep_sloped_insulated"
        optC_overhang = 0.5
        optC_struct = "struct_galv_steel"
        optC_shade = "shade_timber_slat"
        optC_floor = "floor_cseb_pavers"
        optC_seat = "seat_timber_slat"
        optC_pv = False
        optC_gutter = True
        optC_opening = 0.35
        optC_has_walls = True
        optC_wall_mat = "wall_timber_insulated_panel"
        optC_roof_cavity = False
        optC_roof_monitor = False
        optC_stilt = False
    elif is_hot_humid or climate_zone == "Temperate":
        optC_roof_mat = "roof_bamboo_thatch_composite"
        optC_roof_type = "pitched_simple"
        optC_overhang = 0.75
        optC_struct = "struct_engineered_bamboo"
        optC_shade = "shade_timber_slat"
        optC_floor = "floor_cseb_pavers"
        optC_seat = "seat_timber_slat"
        optC_pv = False
        optC_gutter = True
        optC_opening = 0.75
        optC_has_walls = False
        optC_wall_mat = ""
        optC_roof_cavity = False
        optC_roof_monitor = False
        optC_stilt = False
    else:
        optC_roof_mat = "roof_reflective_galvalume"
        optC_roof_type = "single_slope_pitched"
        optC_overhang = 0.6
        optC_struct = "struct_galv_steel"
        optC_shade = "shade_timber_slat"
        optC_floor = "floor_cseb_pavers"
        optC_seat = "seat_timber_slat"
        optC_pv = False
        optC_gutter = False
        optC_opening = 0.65
        optC_has_walls = False
        optC_wall_mat = ""
        optC_roof_cavity = False
        optC_roof_monitor = False
        optC_stilt = False

    sim_C = calculate_shelter_microclimate(
        temp_c=temp_c, rh_pct=rh_pct, wind_speed_ms=wind_speed, wind_direction_deg=wind_dir,
        solar_radiation_w_m2=solar_rad, roof_material_id=optC_roof_mat, roof_type=optC_roof_type,
        overhang_depth_m=optC_overhang, shelter_orientation_deg=opt_orientation_econ,
        openings_ratio=optC_opening, has_side_shading=False
    )
    cost_C = calculate_preliminary_cost(
        length_m=L, width_m=W, height_m=H, overhang_m=optC_overhang,
        roof_material_id=optC_roof_mat, structure_material_id=optC_struct,
        shading_material_id=optC_shade, floor_material_id=optC_floor,
        seating_material_id=optC_seat, seating_length_m=seat_len,
        has_solar_pv=optC_pv, has_gutter=optC_gutter,
        has_walls=optC_has_walls, wall_material_id=optC_wall_mat,
        has_roof_monitor=optC_roof_monitor,
        has_hydration=has_worker_hydration,
        has_transit_display=has_transit_board,
        has_community_board=has_community_board,
        has_emergency_kit=has_emergency_kit,
        has_tourist_kiosk=has_tourist_kiosk
    )

    # 3. Compile 3D Model Parameters & Technical Specifications
    def make_option_payload(opt_id: str, label: str, title: str, sim: Dict[str, Any], cost: Dict[str, Any],
                            roof_mat_id: str, struct_mat_id: str, shade_mat_id: str, floor_mat_id: str, seat_mat_id: str,
                            roof_type: str, overhang: float, orient: int, opening: float, has_pv: bool, has_gut: bool,
                            has_walls: bool = False, wall_mat_id: str = "", has_roof_cavity: bool = False,
                            has_roof_monitor: bool = False, has_stilt: bool = False) -> Dict[str, Any]:
        
        roof_m = get_material_by_id(roof_mat_id)
        struct_m = get_material_by_id(struct_mat_id)
        shade_m = get_material_by_id(shade_mat_id)
        floor_m = get_material_by_id(floor_mat_id)
        seat_m = get_material_by_id(seat_mat_id)
        wall_m = get_material_by_id(wall_mat_id) if (has_walls and wall_mat_id) else None

        # Scientific Reasoning Construction
        reasoning_points = [
            f"The selected location ({climate_zone} climate) experiences {'high' if solar_rad > 700 else 'moderate'} solar irradiance of {solar_rad:.0f} W/m² and ambient temperature of {temp_c:.1f}°C."
        ]

        if is_cold_climate:
            reasoning_points.append(f"In this cold climate, thick thermal enclosure walls ({wall_m['name'] if wall_m else 'Stone Masonry'}) wrap the North, East, and West perimeter to stop freezing convective drafts and retain internal passive solar heat.")
            reasoning_points.append("The steep pitched roof design accelerates snow and freezing rainwater shedding while preventing structural snow load accumulation.")
        else:
            reasoning_points.append(f"A deep {overhang}m roof overhang with {roof_m['name']} was selected because it intercepts direct solar radiation, keeping ceiling underside temperature within {sim['shelter_tmrt_c']:.1f}°C (vs {base_info['mean_radiant_temp_c']:.1f}°C in uninsulated baseline).")
            reasoning_points.append(f"Orientation of {orient}° channels natural breeze of {sim['shelter_wind_speed_ms']} m/s through {int(opening*100)}% perimeter openings.")

        if has_roof_cavity:
            reasoning_points.append("Continuous 150mm convection air cavity between double roof layers vents intercepted heat upwards before reaching the interior.")
        if has_roof_monitor:
            reasoning_points.append("Raised central roof monitor chimney continuously exhausts rising buoyant hot humid air via the stack effect.")
        if has_stilt:
            reasoning_points.append("Elevated stilt platform lifts occupants 0.5m above damp ground, providing continuous convective airflow under the floor.")
        if has_pv:
            reasoning_points.append("Rooftop solar PV serves as a double-skin shading canopy while generating clean energy for evening lighting.")
        if has_gut:
            reasoning_points.append(f"Gutter drainage mitigates waterlogging risks during precipitation events ({precip:.1f} mm observed).")
        if has_worker_hydration:
            reasoning_points.append("Integrated shaded hydration alcove provides essential drinking water for heat exhaustion recovery.")
        if has_transit_board:
            reasoning_points.append("Rear weather-resistant transit display board shields waiting passengers from vehicle splash and wind gusts.")
        if has_community_board:
            reasoning_points.append("Central community announcement board serves as a focal communication point for local village meetings and weather advisories.")
        if has_emergency_kit:
            reasoning_points.append("Integrated weatherproof emergency supply chest stores first-aid, blankets, and essential disaster survival rations.")
        if has_tourist_kiosk:
            reasoning_points.append("Integrated topographic wayfinding kiosk provides shaded route information, regional climate notices, and emergency contacts.")

        reasoning_points.append(f"The resulting shelter achieves a UTCI of {sim['shelter_utci_c']}°C ({sim['stress_category']}), delivering a {round(base_info['utci_c'] - sim['shelter_utci_c'], 1)}°C thermal improvement compared to conventional unshaded shelters.")

        # 3D Mesh procedural component coordinates & definitions
        components_3d = [
            {
                "id": "roof",
                "name": "Roof Envelope",
                "material": roof_m["name"],
                "material_id": roof_mat_id,
                "color": "#e0e7ff" if "puf" in roof_mat_id else ("#c2410c" if "terracotta" in roof_mat_id else ("#94a3b8" if "galvalume" in roof_mat_id else "#a16207")),
                "thermal_role": roof_m["thermal_role"],
                "engineering_reason": roof_m["engineering_reason"],
                "dimensions": {"length": L + 2 * overhang, "width": W + 2 * overhang, "thickness": 0.12},
                "position": [0, H, 0]
            },
            {
                "id": "columns",
                "name": "Structural Columns & Frame",
                "material": struct_m["name"],
                "material_id": struct_mat_id,
                "color": "#334155" if "steel" in struct_mat_id else "#ca8a04",
                "thermal_role": struct_m["thermal_role"],
                "engineering_reason": struct_m["engineering_reason"],
                "dimensions": {"count": 6, "width": 0.1, "height": H},
                "position": [0, H/2, 0]
            }
        ]

        # Cold climate thick walls vs Hot climate louvers
        if has_walls and wall_m:
            components_3d.append({
                "id": "insulated_walls",
                "name": "Thick Insulated Thermal Enclosure Walls",
                "material": wall_m["name"],
                "material_id": wall_mat_id,
                "color": "#64748b" if "stone" in wall_mat_id else "#78350f",
                "thermal_role": wall_m["thermal_role"],
                "engineering_reason": wall_m["engineering_reason"],
                "dimensions": {"length": L, "width": W, "thickness": 0.30 if "stone" in wall_mat_id else 0.15, "height": H},
                "position": [0, H/2, 0]
            })
            components_3d.append({
                "id": "solar_windows",
                "name": "Double-Glazed Passive Solar Windows & Protected Entry",
                "material": "Argon-Filled Double Glazed Low-E Vision Window",
                "material_id": "window_low_e_double_glazed",
                "color": "#93c5fd",
                "thermal_role": "Transmits daylight and passive solar heat into interior while stopping cold wind drafts.",
                "engineering_reason": "Air-sealed insulated glazing unit capturing low winter solar angles.",
                "dimensions": {"length": L * 0.45, "width": 0.04, "height": 1.1},
                "position": [0, H * 0.55, W/2]
            })
        else:
            components_3d.append({
                "id": "shading_louvers",
                "name": "Solar Shading Louvers / Jali Screens",
                "material": shade_m["name"],
                "material_id": shade_mat_id,
                "color": "#0284c7" if "louver" in shade_mat_id else ("#ea580c" if "jali" in shade_mat_id else "#b45309"),
                "thermal_role": shade_m["thermal_role"],
                "engineering_reason": shade_m["engineering_reason"],
                "dimensions": {"length": L * 0.9, "height": H * 0.45, "slat_angle_deg": 45},
                "position": [0, H * 0.65, W/2]
            })

        # Double roof convection cavity component
        if has_roof_cavity:
            components_3d.append({
                "id": "roof_cavity",
                "name": "Continuous Convection Airflow Cavity",
                "material": "Ventilated Air Cavity & Steel Convective Spacers",
                "material_id": "roof_cavity",
                "color": "#38bdf8",
                "thermal_role": "Allows trapped solar heat to vent freely out before conducting into the occupant ceiling.",
                "engineering_reason": "Lowers radiant ceiling temperature by 10°C to 14°C compared to single-skin uninsulated roofing.",
                "dimensions": {"length": L + 2 * overhang, "width": W + 2 * overhang, "thickness": 0.15},
                "position": [0, H + 0.08, 0]
            })

        # Roof monitor stack chimney for humid climates
        if has_roof_monitor:
            components_3d.append({
                "id": "roof_monitor",
                "name": "Central Ridge Monitor Air Exhaust Chimney",
                "material": "Aerodynamic Raised Ridge Monitor Air Exhaust",
                "material_id": "roof_monitor_ridge_vent",
                "color": "#0284c7",
                "thermal_role": "Continuously exhausts buoyant hot, humid air accumulated beneath the ceiling ridge via thermal stack effect.",
                "engineering_reason": "Draws in cooler outdoor breeze across occupant level as warm humid air discharges upwards.",
                "dimensions": {"length": L * 0.7, "width": 0.6, "height": 0.4},
                "position": [0, H + 0.35, 0]
            })

        # Floor & Foundation Plinth
        components_3d.append({
            "id": "floor_platform",
            "name": "Raised Stilt Foundation & Convective Deck" if has_stilt else "Floor & Foundation Plinth",
            "material": floor_m["name"],
            "material_id": floor_mat_id,
            "color": "#64748b" if "stone" in floor_mat_id else ("#78716c" if "cseb" in floor_mat_id else "#d97706"),
            "thermal_role": "Lifts the shelter 0.5m above damp ground, providing continuous under-floor airflow." if has_stilt else floor_m["thermal_role"],
            "engineering_reason": floor_m["engineering_reason"],
            "dimensions": {"length": L + 0.4, "width": W + 0.4, "height": 0.5 if has_stilt else 0.25},
            "position": [0, 0.25 if has_stilt else 0.125, 0]
        })

        # Seating bench
        components_3d.append({
            "id": "seating_bench",
            "name": "Ergonomic Seating Benches",
            "material": seat_m["name"],
            "material_id": seat_mat_id,
            "color": "#854d0e" if "timber" in seat_mat_id else "#d97706",
            "thermal_role": seat_m["thermal_role"],
            "engineering_reason": seat_m["engineering_reason"],
            "dimensions": {"length": seat_len, "width": 0.45, "height": 0.45},
            "position": [0, 0.45, -W/4]
        })

        # Facility Specialty Features
        if has_worker_hydration:
            components_3d.append({
                "id": "hydration_station",
                "name": "Shaded Drinking Water & Hydration Station",
                "material": "Evaporative Cooling Pot / Water Dispenser",
                "material_id": "water_cooler_hydration_alcove",
                "color": "#0284c7",
                "thermal_role": "Provides shaded, evaporatively cooled drinking water to prevent occupational heat stress.",
                "engineering_reason": "Directly combats occupational heat exhaustion in outdoor and industrial rest shelters.",
                "dimensions": {"length": 0.6, "width": 0.6, "height": 1.1},
                "position": [L / 2 - 0.4, 0.55, -W / 4]
            })

        if has_transit_board:
            components_3d.append({
                "id": "transit_display",
                "name": "Passenger Transit Display & Timetable Board",
                "material": "Weatherproof Passenger Transit Display & Timetable Board",
                "material_id": "transit_schedule_display",
                "color": "#1e293b",
                "thermal_role": "Rear-mounted transit board shielding passengers from road dust, splashback, and traffic noise.",
                "engineering_reason": "Shields waiting passengers from road splash and backdraft while displaying route information.",
                "dimensions": {"length": 1.4, "width": 0.08, "height": 1.6},
                "position": [-L / 3, H * 0.5, -W / 2 + 0.05]
            })

        if has_pv:
            components_3d.append({
                "id": "solar_pv",
                "name": "Rooftop Solar PV Array",
                "material": "Monocrystalline Solar Panel",
                "material_id": "pv_monocrystalline",
                "color": "#1e3a8a",
                "thermal_role": "Active shading parasol creating air gap above roof while harvesting solar energy.",
                "engineering_reason": "Reduces direct solar flux on the main roof envelope by 85% beneath panel area.",
                "dimensions": {"length": 2.2, "width": 1.2, "height": 0.05},
                "position": [0, H + 0.15, 0]
            })

        if has_gut:
            components_3d.append({
                "id": "drainage_gutter",
                "name": "Perimeter Rainwater Gutter",
                "material": "Extruded Aluminum Gutter",
                "material_id": "gutter_rainwater",
                "color": "#94a3b8",
                "thermal_role": "Directs runoff away to prevent humid splashback in the occupant breathing zone.",
                "engineering_reason": "Eliminates puddle evaporation microclimates and splashback during heavy rain.",
                "dimensions": {"length": L + 2 * overhang, "width": 0.12, "height": 0.10},
                "position": [0, H - 0.05, (W + 2 * overhang)/2]
            })

        if has_community_board:
            components_3d.append({
                "id": "community_board",
                "name": "Community Information & Notice Board",
                "material": "Weatherproof Community Bulletin & Information Board",
                "material_id": "community_notice_board",
                "color": "#78350f",
                "thermal_role": "Provides secondary wind baffle while facilitating community announcements and disaster warnings.",
                "engineering_reason": "Central focal point for rural village gathering and civic resilience communications.",
                "dimensions": {"length": 1.4, "width": 0.08, "height": 1.2},
                "position": [-L / 3, H * 0.5, -W / 2 + 0.05]
            })

        if has_emergency_kit:
            components_3d.append({
                "id": "emergency_kit",
                "name": "Emergency First-Aid & Safety Supply Chest",
                "material": "Heavy-Duty Weatherproof Emergency First-Aid & Safety Supply Chest",
                "material_id": "emergency_supply_kit",
                "color": "#dc2626",
                "thermal_role": "Thermal insulated storage preventing medicine and survival supply degradation in extreme heat.",
                "engineering_reason": "Equips the shelter for immediate disaster response and triage sheltering.",
                "dimensions": {"length": 0.8, "width": 0.5, "height": 0.6},
                "position": [L / 2 - 0.5, 0.4, -W / 3]
            })

        if has_tourist_kiosk:
            components_3d.append({
                "id": "tourist_kiosk",
                "name": "Tourist Information & Trail Map Kiosk",
                "material": "Regional Topographic Trail Map & Solar Info Kiosk",
                "material_id": "tourist_info_kiosk",
                "color": "#0d9488",
                "thermal_role": "Integrated solar-shaded kiosk providing orientation and visitor shelter.",
                "engineering_reason": "Equips visitor rest points with local wayfinding, trail safety rules, and emergency coordinates.",
                "dimensions": {"length": 1.2, "width": 0.08, "height": 1.5},
                "position": [-L / 3, H * 0.5, -W / 2 + 0.05]
            })

        # Overall composite score: weighted by thermal comfort (50%), cost affordability (30%), practicality (20%)
        budget_ratio = min(1.0, budget_inr / max(1.0, cost["grand_total_inr"]))
        cost_score = int(budget_ratio * 100)
        overall_score = int(0.50 * sim["comfort_score"] + 0.30 * cost_score + 0.20 * 88)

        return {
            "id": opt_id,
            "label": label,
            "title": title,
            "overall_score": overall_score,
            "thermal_comfort_score": sim["comfort_score"],
            "utci_c": sim["shelter_utci_c"],
            "tmrt_c": sim["shelter_tmrt_c"],
            "internal_wind_speed_ms": sim["shelter_wind_speed_ms"],
            "utci_reduction_vs_baseline": round(base_info["utci_c"] - sim["shelter_utci_c"], 1),
            "stress_category": sim["stress_category"],
            "stress_code": sim["stress_code"],
            "estimated_cost_inr": cost["grand_total_inr"],
            "formatted_cost": cost["formatted_grand_total"],
            "dimensions": dims,
            "capacity": capacity,
            "has_walls": has_walls,
            "wall_material": wall_m["name"] if wall_m else None,
            "shelter_purpose": shelter_purpose,
            "seating_style": "communal_u_shape" if has_community_board else ("wide_rest_couch" if has_worker_hydration else "standard_linear"),
            "roof": {
                "type": roof_type,
                "material": roof_m["name"],
                "material_id": roof_mat_id,
                "overhang_m": overhang,
                "u_value": roof_m.get("u_value", 1.5),
                "sri": roof_m.get("sri", 60)
            },
            "orientation_deg": orient,
            "openings_ratio": opening,
            "ventilation_strategy": ("Enclosed Insulated Perimeter with Controlled Air Exchange" if has_walls
                                    else ("Cross-ventilation + Roof Stack Gap" if opening >= 0.70 else "Controlled Louvered Airflow")),
            "shading_strategy": f"Insulated Walls + Low-E Glazing" if has_walls else f"Extended {overhang}m Overhang + {shade_m['short_name']}",
            "main_materials": {
                "roof": roof_m["name"],
                "structure": struct_m["name"],
                "shading": wall_m["name"] if wall_m else shade_m["name"],
                "floor": floor_m["name"],
                "seating": seat_m["name"]
            },
            "cost_breakdown": cost,
            "reasoning": reasoning_points,
            "components_3d": components_3d
        }

    option_A = make_option_payload("option_a", "Option A", "Thermal Comfort Maximized", sim_A, cost_A,
                                   optA_roof_mat, optA_struct, optA_shade, optA_floor, optA_seat,
                                   optA_roof_type, optA_overhang, opt_orientation_comfort, optA_opening, optA_pv, optA_gutter,
                                   has_walls=optA_has_walls, wall_mat_id=optA_wall_mat,
                                   has_roof_cavity=optA_roof_cavity, has_roof_monitor=optA_roof_monitor, has_stilt=optA_stilt)

    option_B = make_option_payload("option_b", "Option B", "Balanced (Comfort + Practicality + Cost)", sim_B, cost_B,
                                   optB_roof_mat, optB_struct, optB_shade, optB_floor, optB_seat,
                                   optB_roof_type, optB_overhang, opt_orientation_balanced, optB_opening, optB_pv, optB_gutter,
                                   has_walls=optB_has_walls, wall_mat_id=optB_wall_mat,
                                   has_roof_cavity=optB_roof_cavity, has_roof_monitor=optB_roof_monitor, has_stilt=optB_stilt)

    option_C = make_option_payload("option_c", "Option C", "Economy (Cost Optimized)", sim_C, cost_C,
                                   optC_roof_mat, optC_struct, optC_shade, optC_floor, optC_seat,
                                   optC_roof_type, optC_overhang, opt_orientation_econ, optC_opening, optC_pv, optC_gutter,
                                   has_walls=optC_has_walls, wall_mat_id=optC_wall_mat,
                                   has_roof_cavity=optC_roof_cavity, has_roof_monitor=optC_roof_monitor, has_stilt=optC_stilt)

    # Sort or rank according to user priority
    if priority == "Thermal comfort":
        recommended_id = "option_a"
    elif priority == "Low cost":
        recommended_id = "option_c"
    else:
        recommended_id = "option_b"

    return {
        "recommended_id": recommended_id,
        "climate_character": climate_info["climate_character"],
        "baseline_shelter": {
            **base_info,
            "cost_inr": base_cost["grand_total_inr"],
            "formatted_cost": base_cost["formatted_grand_total"]
        },
        "options": {
            "option_a": option_A,
            "option_b": option_B,
            "option_c": option_C
        },
        "options_list": [option_A, option_B, option_C]
    }
