"""Climate package."""
from .service import fetch_climate_data, geocode_place_name, get_location_by_preset
from .classifier import classify_climate
from .solar import calculate_solar_position
from .demo_data import SAMPLE_LOCATIONS
