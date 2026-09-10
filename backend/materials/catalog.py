"""
Scientific Materials Catalog for ThermoShelter.
Contains validated physical and thermal properties of building envelope materials
derived from ASHRAE Fundamentals, National Building Code of India, and experimental literature.
"""

from typing import Dict, Any, List

MATERIALS_DB: Dict[str, Dict[str, Any]] = {
    # ROOF MATERIALS
    "roof_puf_sandwich": {
        "id": "roof_puf_sandwich",
        "category": "roof",
        "name": "Polyurethane Foam (PUF) Insulated Sandwich Panel",
        "short_name": "PUF Sandwich Panel",
        "thermal_conductivity": 0.024,  # W/m·K
        "thickness_m": 0.05,            # 50mm core
        "u_value": 0.45,                # W/m²·K
        "sri": 88,                      # Solar Reflectance Index
        "solar_absorptance": 0.22,
        "emissivity": 0.88,
        "density_kg_m3": 40.0,
        "specific_heat_j_kg_k": 1450,
        "durability_years": 25,
        "unit_cost_inr_m2": 1650,
        "cost_category": "Medium-High",
        "sustainability_notes": "High operational thermal savings; CFC/HCFC-free blowing agent.",
        "best_climates": ["Hot-Dry", "Composite", "Cold", "Very Cold"],
        "thermal_role": "Eliminates solar radiative heat transfer through high thermal resistance and reflective exterior skin.",
        "engineering_reason": "High solar exposure causes severe overhead heat stress; 50mm PUF provides U-value 0.45 W/m²·K, reducing ceiling underside temperature by up to 12°C relative to bare sheet."
    },
    "roof_double_skin_terracotta": {
        "id": "roof_double_skin_terracotta",
        "category": "roof",
        "name": "Ventilated Double-Skin Terracotta Tile System",
        "short_name": "Double-Skin Terracotta",
        "thermal_conductivity": 0.70,   # W/m·K (tile)
        "thickness_m": 0.12,            # 120mm assembly with 60mm ventilated air cavity
        "u_value": 1.20,
        "sri": 62,
        "solar_absorptance": 0.45,
        "emissivity": 0.90,
        "density_kg_m3": 1900,
        "specific_heat_j_kg_k": 840,
        "durability_years": 40,
        "unit_cost_inr_m2": 1400,
        "cost_category": "Medium",
        "sustainability_notes": "Locally sourced natural clay, 100% recyclable, zero VOCs, low embodied energy.",
        "best_climates": ["Hot-Dry", "Hot-Humid", "Composite"],
        "thermal_role": "Upper tile intercepts primary solar flux; ventilated air cavity dissipates heat via buoyant stack effect before reaching occupant zone.",
        "engineering_reason": "Natural stack-effect cavity ventilation exhausts intercepted solar radiation while terracotta thermal mass moderates afternoon peak heat flux."
    },
    "roof_reflective_galvalume": {
        "id": "roof_reflective_galvalume",
        "category": "roof",
        "name": "High-Albedo Coated Galvalume Corrugated Sheet",
        "short_name": "Cool Galvalume Sheet",
        "thermal_conductivity": 45.0,   # W/m·K
        "thickness_m": 0.0006,          # 0.6mm sheet
        "u_value": 4.80,                # High conductive transfer, relies on SRI
        "sri": 98,                      # Cool-roof reflective coat
        "solar_absorptance": 0.18,
        "emissivity": 0.85,
        "density_kg_m3": 7850,
        "specific_heat_j_kg_k": 480,
        "durability_years": 20,
        "unit_cost_inr_m2": 780,
        "cost_category": "Economy",
        "sustainability_notes": "Fully recyclable steel core with anti-corrosive zinc-aluminum coating.",
        "best_climates": ["Hot-Humid", "Composite", "Temperate"],
        "thermal_role": "High solar reflectance rejects 82% of incident solar radiation at low material weight.",
        "engineering_reason": "Cost-effective solution with 98 SRI coating preventing acute solar absorption, ideal for high humidity where rapid night cooling is desired."
    },
    "roof_bamboo_thatch_composite": {
        "id": "roof_bamboo_thatch_composite",
        "category": "roof",
        "name": "Treated Bamboo Shingle & High-Mass Underlay",
        "short_name": "Treated Bamboo Shingle",
        "thermal_conductivity": 0.14,
        "thickness_m": 0.035,
        "u_value": 1.65,
        "sri": 55,
        "solar_absorptance": 0.50,
        "emissivity": 0.92,
        "density_kg_m3": 650,
        "specific_heat_j_kg_k": 1600,
        "durability_years": 15,
        "unit_cost_inr_m2": 650,
        "cost_category": "Economy",
        "sustainability_notes": "Rapidly renewable carbon-negative material, locally fabricated with borax-boric treatment.",
        "best_climates": ["Hot-Humid", "Temperate", "Rural Community"],
        "thermal_role": "Low thermal diffusivity prevents rapid heat transfer to underside during sunlit hours.",
        "engineering_reason": "Naturally breathable organic cellular structure provides passive insulation at minimal cost and carbon footprint."
    },
    "roof_uninsulated_gi_sheet": {
        "id": "roof_uninsulated_gi_sheet",
        "category": "roof",
        "name": "Standard Uncoated Galvanized Iron (GI) Sheet",
        "short_name": "Uninsulated GI Sheet (Baseline)",
        "thermal_conductivity": 50.0,
        "thickness_m": 0.0005,
        "u_value": 5.8,
        "sri": 28,  # Weathered GI sheet absorbs heavy radiation
        "solar_absorptance": 0.72,
        "emissivity": 0.25,
        "density_kg_m3": 7850,
        "specific_heat_j_kg_k": 460,
        "durability_years": 12,
        "unit_cost_inr_m2": 520,
        "cost_category": "Baseline",
        "sustainability_notes": "Conventional low-cost benchmark.",
        "best_climates": ["None - Baseline Only"],
        "thermal_role": "Baseline comparison material with high heat transfer and re-radiation into occupied zone.",
        "engineering_reason": "Acts as standard benchmark demonstrating thermal penalty of unshaded, uninsulated metallic roofing."
    },

    # STRUCTURAL FRAME
    "struct_galv_steel": {
        "id": "struct_galv_steel",
        "category": "structure",
        "name": "Hot-Dip Galvanized Hollow Structural Steel (SHS/RHS)",
        "short_name": "Galvanized Steel Frame",
        "thermal_conductivity": 50.0,
        "density_kg_m3": 7850,
        "durability_years": 50,
        "unit_cost_inr_m2_floor": 1800,
        "cost_category": "Medium",
        "sustainability_notes": "Long lifespan, 100% recyclable, minimal maintenance requirements.",
        "best_climates": ["All"],
        "thermal_role": "Slender structural footprint maximizes unhindered natural cross-ventilation.",
        "engineering_reason": "High strength-to-weight ratio allows slender columns (90x90mm) maximizing clear open ventilation area."
    },
    "struct_engineered_bamboo": {
        "id": "struct_engineered_bamboo",
        "category": "structure",
        "name": "Pressure-Treated Structural Bamboo Poles (Dendrocalamus strictus)",
        "short_name": "Treated Structural Bamboo",
        "thermal_conductivity": 0.15,
        "density_kg_m3": 700,
        "durability_years": 25,
        "unit_cost_inr_m2_floor": 1100,
        "cost_category": "Economy",
        "sustainability_notes": "High carbon sequestration, locally sourced, biodegradable at end of life.",
        "best_climates": ["Hot-Humid", "Temperate", "Composite"],
        "thermal_role": "Very low thermal conductivity prevents thermal bridging through structural posts.",
        "engineering_reason": "Structural frame remains cool to touch even under ambient heat; low cost and excellent environmental profile."
    },

    # ENCLOSURE WALLS (COLD & ARID ZONES)
    "wall_thick_stone_masonry": {
        "id": "wall_thick_stone_masonry",
        "category": "wall",
        "name": "300mm Insulated Mountain Stone Masonry Wall",
        "short_name": "Insulated Stone Wall (300mm)",
        "thermal_conductivity": 1.25,
        "thickness_m": 0.30,
        "u_value": 0.52,
        "density_kg_m3": 2300,
        "specific_heat_j_kg_k": 920,
        "durability_years": 80,
        "unit_cost_inr_m2": 1950,
        "cost_category": "Medium-High",
        "sustainability_notes": "Locally dressed field stone with internal recycled wool / PUF insulation layer.",
        "best_climates": ["Cold", "Very Cold", "Mountain"],
        "thermal_role": "High thermal mass (R-value > 1.9 m²K/W) blocks freezing external wind chill and stores internal solar warmth.",
        "engineering_reason": "Thick wall enclosure on North, West, and East perimeter shields occupants from sub-zero drafts and wind-chill."
    },
    "wall_timber_insulated_panel": {
        "id": "wall_timber_insulated_panel",
        "category": "wall",
        "name": "Double-Skin Insulated Timber Wall with PUF Core",
        "short_name": "Insulated Timber Wall",
        "thermal_conductivity": 0.038,
        "thickness_m": 0.12,
        "u_value": 0.42,
        "density_kg_m3": 450,
        "specific_heat_j_kg_k": 1550,
        "durability_years": 35,
        "unit_cost_inr_m2": 1600,
        "cost_category": "Medium",
        "sustainability_notes": "Responsibly harvested Himalayan pine/deodar with airtight non-toxic vapor barrier.",
        "best_climates": ["Cold", "Very Cold", "Temperate"],
        "thermal_role": "Lightweight high-resistance thermal envelope preventing heat dissipation in cold climates.",
        "engineering_reason": "Allows rapid modular construction on mountain slopes while providing exceptional insulation against freezing conditions."
    },
    "wall_terracotta_jali_masonry": {
        "id": "wall_terracotta_jali_masonry",
        "category": "wall",
        "name": "Full-Height Perforated Terracotta Jali Screen Wall",
        "short_name": "Terracotta Jali Wall",
        "thermal_conductivity": 0.85,
        "thickness_m": 0.15,
        "u_value": 2.2,
        "density_kg_m3": 1750,
        "specific_heat_j_kg_k": 850,
        "durability_years": 50,
        "unit_cost_inr_m2": 1350,
        "cost_category": "Medium",
        "sustainability_notes": "Zero-energy fired clay modules, 100% natural, provides dust filtration.",
        "best_climates": ["Hot-Dry", "Composite"],
        "thermal_role": "Compresses incoming air currents through micro-apertures (Venturi effect), cooling the breeze while stopping solar glare.",
        "engineering_reason": "Blocks harsh desert sun angles and drifting sand while maintaining uninterrupted continuous cross-ventilation."
    },
    "window_low_e_double_glazed": {
        "id": "window_low_e_double_glazed",
        "category": "glazing",
        "name": "Argon-Filled Double Glazed Low-E Vision Window",
        "short_name": "Low-E Double Glazing",
        "thermal_conductivity": 0.018,
        "thickness_m": 0.024,
        "u_value": 1.60,
        "durability_years": 30,
        "unit_cost_inr_m2": 2400,
        "cost_category": "High",
        "sustainability_notes": "Hermetically sealed insulated glazing unit preventing conductive cold bridging.",
        "best_climates": ["Cold", "Very Cold"],
        "thermal_role": "Transmits shortwave daylight and solar heat inwards while reflecting longwave radiant heat back into the shelter.",
        "engineering_reason": "Enables passive solar heating during cold daylight hours while maintaining airtight draft exclusion."
    },
    "roof_monitor_ridge_vent": {
        "id": "roof_monitor_ridge_vent",
        "category": "ventilation",
        "name": "Aerodynamic Raised Ridge Monitor Air Exhaust",
        "short_name": "Ridge Monitor Exhaust",
        "durability_years": 35,
        "unit_cost_inr_m": 850,
        "cost_category": "Medium",
        "sustainability_notes": "Passive stack ventilation chimney with zero moving parts and zero energy use.",
        "best_climates": ["Hot-Humid", "Composite"],
        "thermal_role": "Continuously evacuates buoyant hot, humid air accumulated beneath the ceiling ridge via thermal stack effect.",
        "engineering_reason": "Essential in hot-humid zones to draw fresh air across floor level as rising moisture and body heat escape above."
    },
    "water_cooler_hydration_alcove": {
        "id": "water_cooler_hydration_alcove",
        "category": "facility",
        "name": "Shaded Drinking Water & Hydration Station",
        "short_name": "Hydration Station",
        "durability_years": 20,
        "unit_cost_inr": 6500,
        "cost_category": "Essential",
        "sustainability_notes": "Evaporatively cooled terracotta matka / insulated water station.",
        "best_climates": ["Hot-Dry", "Worker rest shelter", "All"],
        "thermal_role": "Critical heat-stress mitigation providing immediate physiological cooling and hydration for workers.",
        "engineering_reason": "Directly combats occupational heat exhaustion in outdoor and industrial rest shelters."
    },
    "transit_schedule_display": {
        "id": "transit_schedule_display",
        "category": "facility",
        "name": "Weatherproof Passenger Transit Display & Timetable Board",
        "short_name": "Transit Route Board",
        "durability_years": 25,
        "unit_cost_inr": 4500,
        "cost_category": "Essential",
        "sustainability_notes": "Anti-glare tempered enclosure with solar LED backlight.",
        "best_climates": ["Public waiting shelter", "Bus stop", "All"],
        "thermal_role": "Integrated on rear windward bay to act as a solid wind-break while providing passenger wayfinding.",
        "engineering_reason": "Shields waiting passengers from road splash and backdraft while displaying route information."
    },

    # SHADING & LOUVERS / SCREENS
    "shade_aerodynamic_louvers": {
        "id": "shade_aerodynamic_louvers",
        "category": "shading",
        "name": "Powder-Coated Aluminum Aerofoil Louver System",
        "short_name": "Aerodynamic Louvers",
        "thermal_conductivity": 200.0,
        "sri": 75,
        "durability_years": 30,
        "unit_cost_inr_m2": 1500,
        "cost_category": "Medium",
        "sustainability_notes": "Durable, weather-resistant, zero warping.",
        "best_climates": ["Hot-Dry", "Hot-Humid", "Composite"],
        "thermal_role": "Cuts direct beam solar radiation while accelerating incoming airflow via Venturi effect.",
        "engineering_reason": "Angled at 45° to block high summer solar zenith while permitting unhindered prevailing breezes."
    },
    "shade_terracotta_jali": {
        "id": "shade_terracotta_jali",
        "category": "shading",
        "name": "Perforated Terracotta Jali Screen (40% Free Area)",
        "short_name": "Terracotta Jali Screen",
        "thermal_conductivity": 0.80,
        "sri": 60,
        "durability_years": 40,
        "unit_cost_inr_m2": 1100,
        "cost_category": "Medium-Economy",
        "sustainability_notes": "Traditional vernacular passive cooling element; zero carbon operational footprint.",
        "best_climates": ["Hot-Dry", "Composite"],
        "thermal_role": "Provides diffused shade, induces air velocity increase through micro-apertures, and absorbs nighttime cool air.",
        "engineering_reason": "Blocks harsh dust and direct solar glare in arid climates while maintaining necessary ventilation."
    },
    "shade_timber_slat": {
        "id": "shade_timber_slat",
        "category": "shading",
        "name": "Seasoned Hardwood Horizontal Sun-Slat Screen",
        "short_name": "Timber Sun-Slat",
        "thermal_conductivity": 0.13,
        "sri": 48,
        "durability_years": 20,
        "unit_cost_inr_m2": 950,
        "cost_category": "Economy",
        "sustainability_notes": "Responsibly harvested FSC certified timber with organic linseed oil finish.",
        "best_climates": ["Temperate", "Hot-Humid", "Cold"],
        "thermal_role": "Warm tactile surface with no radiant re-emission to seated occupants.",
        "engineering_reason": "Low surface temperature prevents radiant discomfort in the occupant microclimate."
    },

    # FLOORING & PLATFORM
    "floor_cseb_pavers": {
        "id": "floor_cseb_pavers",
        "category": "floor",
        "name": "Compressed Stabilized Earth Block (CSEB) Paving on Sand Bed",
        "short_name": "CSEB Earth Pavers",
        "thermal_conductivity": 0.85,
        "density_kg_m3": 1850,
        "specific_heat_j_kg_k": 920,
        "durability_years": 35,
        "unit_cost_inr_m2": 620,
        "cost_category": "Economy",
        "sustainability_notes": "Low embodied energy (80% less than concrete pavers), permeable bedding promotes groundwater recharge.",
        "best_climates": ["Hot-Dry", "Composite", "Temperate"],
        "thermal_role": "Acts as a thermal sink during the day and remains cool through nocturnal radiative dissipation.",
        "engineering_reason": "Thermal mass stabilizes floor surface temperature, preventing radiant heat reflection from the ground."
    },
    "floor_kota_stone": {
        "id": "floor_kota_stone",
        "category": "floor",
        "name": "Polished Kota Limestone Paving Slab (30mm)",
        "short_name": "Kota Stone Slab",
        "thermal_conductivity": 1.80,
        "density_kg_m3": 2500,
        "specific_heat_j_kg_k": 880,
        "durability_years": 50,
        "unit_cost_inr_m2": 950,
        "cost_category": "Medium",
        "sustainability_notes": "Natural regional stone with indefinite service lifespan.",
        "best_climates": ["Hot-Dry", "Composite"],
        "thermal_role": "High effusivity provides an immediate cool touch sensation and absorbs ambient thermal surges.",
        "engineering_reason": "Heavy stone floor stays cool when shaded by deep overhangs, lowering radiant temperature near occupant feet."
    },
    "floor_raised_bamboo_deck": {
        "id": "floor_raised_bamboo_deck",
        "category": "floor",
        "name": "Raised Slotted Bamboo Deck with Sub-Floor Air Cavity",
        "short_name": "Raised Ventilated Deck",
        "thermal_conductivity": 0.16,
        "density_kg_m3": 680,
        "specific_heat_j_kg_k": 1500,
        "durability_years": 20,
        "unit_cost_inr_m2": 820,
        "cost_category": "Economy",
        "sustainability_notes": "Raised structure avoids ground waterlogging, fully permeable.",
        "best_climates": ["Hot-Humid", "High-Rainfall"],
        "thermal_role": "Sub-floor cavity allows ground breezes to ventilate beneath occupants while avoiding ground moisture absorption.",
        "engineering_reason": "Essential for hot-humid and high-rainfall zones to prevent damp heat accumulation and water pooling."
    },

    # SEATING
    "seat_timber_slat": {
        "id": "seat_timber_slat",
        "category": "seating",
        "name": "Ergonomic Ventilated Hardwood Slat Bench",
        "short_name": "Ventilated Hardwood Bench",
        "thermal_conductivity": 0.12,
        "durability_years": 25,
        "unit_cost_inr_m": 1200,
        "cost_category": "Medium",
        "sustainability_notes": "Natural wood with non-toxic protective seal.",
        "best_climates": ["All"],
        "thermal_role": "Slats allow continuous airflow across occupant back and thigh contact zones, preventing sweat buildup.",
        "engineering_reason": "Low thermal conductivity prevents heat buildup; slotted spacing enhances convective cooling for seated occupants."
    },
    "seat_stone_masonry": {
        "id": "seat_stone_masonry",
        "category": "seating",
        "name": "Thermal Mass Sandstone Bench with Polished Top",
        "short_name": "Shaded Stone Bench",
        "thermal_conductivity": 1.6,
        "durability_years": 60,
        "unit_cost_inr_m": 1500,
        "cost_category": "Medium",
        "sustainability_notes": "Locally quarried sandstone, zero maintenance.",
        "best_climates": ["Hot-Dry"],
        "thermal_role": "Under deep roof shade, high thermal inertia maintains bench surface at lowest nocturnal temperature.",
        "engineering_reason": "Provides conductive cooling for seated occupants in hot-dry environments when protected from direct sun."
    },

    # ANCILLARY / SUSTAINABLE COMPONENTS
    "pv_monocrystalline": {
        "id": "pv_monocrystalline",
        "category": "energy",
        "name": "Roof-Integrated Monocrystalline Solar PV Array (350W)",
        "short_name": "Roof Solar PV Array",
        "efficiency": 0.21,
        "durability_years": 25,
        "unit_cost_inr": 18000,
        "cost_category": "Optional Green",
        "sustainability_notes": "Generates clean zero-carbon electricity for evening LED shelter lighting and mobile phone charging.",
        "best_climates": ["Hot-Dry", "Composite", "Temperate"],
        "thermal_role": "Mounting PV panels with a 100mm standoff above the roof creates an active shading parasol, absorbing solar flux before it hits the roof envelope.",
        "engineering_reason": "Serves dual function: renewable power generation and parasitic thermal shielding for the main roof."
    },
    "gutter_rainwater": {
        "id": "gutter_rainwater",
        "category": "drainage",
        "name": "Extruded Aluminum Rainwater Gutter & Downspout System",
        "short_name": "Rainwater Gutter & Downspout",
        "durability_years": 30,
        "unit_cost_inr_m": 450,
        "cost_category": "Essential",
        "sustainability_notes": "Directs clean roof runoff to percolation pit or recharge well.",
        "best_climates": ["Hot-Humid", "High-Rainfall", "Composite"],
        "thermal_role": "Prevents roof runoff splashback onto occupants and eliminates perimeter puddling that causes humid microclimates.",
        "engineering_reason": "Essential for monsoon protection and roof perimeter splash prevention."
    },
    "community_notice_board": {
        "id": "community_notice_board",
        "category": "fixture",
        "name": "Weatherproof Community Bulletin & Information Board",
        "short_name": "Community Bulletin Board",
        "durability_years": 20,
        "unit_cost_inr": 3500,
        "cost_category": "Standard",
        "sustainability_notes": "Recycled composite cork and timber framing.",
        "best_climates": ["All", "Rural Community"],
        "thermal_role": "Provides secondary wind baffle while facilitating community announcements and disaster warnings.",
        "engineering_reason": "Central fixture for rural community gathering and civic resilience communications."
    },
    "emergency_supply_kit": {
        "id": "emergency_supply_kit",
        "category": "fixture",
        "name": "Heavy-Duty Weatherproof Emergency First-Aid & Safety Supply Chest",
        "short_name": "Emergency Supply Locker",
        "durability_years": 25,
        "unit_cost_inr": 5500,
        "cost_category": "Standard",
        "sustainability_notes": "Rotomolded UV-stabilized polymer cabinet with sealed gasket.",
        "best_climates": ["All", "Disaster Relief"],
        "thermal_role": "Insulated storage preventing pharmaceutical degradation during extreme ambient temperatures.",
        "engineering_reason": "Essential for rapid first-aid response and disaster relief shelters."
    },
    "tourist_info_kiosk": {
        "id": "tourist_info_kiosk",
        "category": "fixture",
        "name": "Regional Topographic Trail Map & Solar Info Kiosk",
        "short_name": "Tourist Map Kiosk",
        "durability_years": 20,
        "unit_cost_inr": 4800,
        "cost_category": "Standard",
        "sustainability_notes": "Anodized aluminum display with tempered polycarbonate front.",
        "best_climates": ["All", "Mountain", "Coastal"],
        "thermal_role": "Integrated solar-shaded kiosk providing orientation and visitor shelter.",
        "engineering_reason": "Equips tourist rest points with wayfinding and emergency coordinates."
    }
}

def get_all_materials() -> List[Dict[str, Any]]:
    """Return all catalog materials as a list."""
    return list(MATERIALS_DB.values())

def get_material_by_id(mat_id: str) -> Dict[str, Any]:
    """Retrieve material by unique identifier or fallback to baseline."""
    return MATERIALS_DB.get(mat_id, MATERIALS_DB["roof_uninsulated_gi_sheet"])
