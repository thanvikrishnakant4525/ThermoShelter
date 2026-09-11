"""
ThermoShelter FastAPI Server.
Provides RESTful APIs for Location GIS, Bioclimatic Classification, UTCI Thermal Comfort,
Parametric Shelter Generation, 3D Architectural Coordinates, BOQ Cost Estimation, and PDF Export.
"""

from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import os
import uvicorn

from climate.service import fetch_climate_data, geocode_place_name, get_location_by_preset
from climate.demo_data import SAMPLE_LOCATIONS
from thermal.comfort import analyze_thermal_environment
from design.generator import generate_shelter_options
from materials.catalog import get_all_materials, get_material_by_id
from ml.surrogate import surrogate_engine
from ai.nl_parser import parse_natural_language_requirements
from ai.explainer import generate_design_explanation
from report.pdf_generator import generate_pdf_report

app = FastAPI(
    title="ThermoShelter API",
    description="Area-Specific Shelter Design for Thermal Comfort Maintenance",
    version="1.0.0"
)

# CORS configuration supporting deployed Vercel frontend via FRONTEND_URL
frontend_env = os.environ.get("FRONTEND_URL", "").strip()
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

if frontend_env:
    for url in frontend_env.split(","):
        cleaned = url.strip().rstrip("/")
        if cleaned and cleaned not in allowed_origins:
            allowed_origins.append(cleaned)
else:
    allowed_origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in allowed_origins else allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app" if "*" not in allowed_origins else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Request Models -----------------

class LocationSearchRequest(BaseModel):
    query: str

class ClimateAnalyzeRequest(BaseModel):
    latitude: float
    longitude: float
    location_name: Optional[str] = "Selected Location"
    elevation_m: Optional[float] = 0.0
    country: Optional[str] = ""

class ThermalAnalyzeRequest(BaseModel):
    temperature_c: float
    relative_humidity_pct: float
    wind_speed_ms: float
    wind_direction_deg: int
    solar_radiation_w_m2: float

class ShelterGenerateRequest(BaseModel):
    climate_info: Dict[str, Any]
    capacity: Optional[int] = 20
    budget_inr: Optional[float] = 120000.0
    shelter_purpose: Optional[str] = "Public waiting shelter"
    priority: Optional[str] = "Balanced"
    user_length: Optional[float] = 0.0
    user_width: Optional[float] = 0.0

class NaturalLanguageRequest(BaseModel):
    text: str

class SurrogatePredictRequest(BaseModel):
    temp_c: float
    rh_pct: float
    wind_speed_ms: float
    solar_radiation_w_m2: float
    roof_u_value: float
    overhang_m: float
    openings_ratio: float

class ExplainRequest(BaseModel):
    option: Dict[str, Any]
    climate_info: Dict[str, Any]

class ReportRequest(BaseModel):
    project_data: Dict[str, Any]

# ----------------- API Endpoints -----------------

@app.get("/")
def root():
    return {
        "service": "ThermoShelter API",
        "status": "online",
        "health_url": "/health",
        "docs_url": "/docs"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "system": "ThermoShelter Computational Design Engine",
        "version": "1.0.0",
        "ml_surrogate_trained": surrogate_engine.is_trained,
        "ml_surrogate_r2": surrogate_engine.r2_score
    }

@app.get("/api/location/presets")
def get_presets():
    """Return configured benchmark locations across India."""
    return list(SAMPLE_LOCATIONS.values())

@app.post("/api/location/search")
def search_location(req: LocationSearchRequest):
    """Geocode search query to coordinates with automatic fallback."""
    result = geocode_place_name(req.query)
    if not result:
        raise HTTPException(status_code=404, detail="Location could not be geocoded")
    return result

@app.post("/api/climate/analyze")
def analyze_climate(req: ClimateAnalyzeRequest):
    """Fetch live or benchmark climate data, solar angles, and bioclimatic character."""
    data = fetch_climate_data(
        latitude=req.latitude,
        longitude=req.longitude,
        location_name=req.location_name or "Selected Location",
        elevation=req.elevation_m or 0.0,
        country=req.country or ""
    )
    return data

@app.post("/api/thermal/analyze")
def analyze_thermal(req: ThermalAnalyzeRequest):
    """Compute outdoor ambient vs baseline shelter UTCI and thermal stress."""
    return analyze_thermal_environment(
        temp_c=req.temperature_c,
        rh_pct=req.relative_humidity_pct,
        wind_speed_ms=req.wind_speed_ms,
        wind_direction_deg=req.wind_direction_deg,
        solar_radiation_w_m2=req.solar_radiation_w_m2
    )

@app.post("/api/design/generate")
def generate_designs(req: ShelterGenerateRequest):
    """Generate 3 area-specific shelter candidates + baseline and 3D specifications."""
    return generate_shelter_options(
        climate_info=req.climate_info,
        capacity=req.capacity or 20,
        budget_inr=req.budget_inr or 120000.0,
        shelter_purpose=req.shelter_purpose or "Public waiting shelter",
        priority=req.priority or "Balanced",
        user_length=req.user_length or 0.0,
        user_width=req.user_width or 0.0
    )

@app.post("/api/design/optimize")
def optimize_design(req: SurrogatePredictRequest):
    """Rapid ML surrogate evaluation of thermal performance."""
    return surrogate_engine.predict_performance(
        temp_c=req.temp_c,
        rh_pct=req.rh_pct,
        wind_speed_ms=req.wind_speed_ms,
        solar_radiation_w_m2=req.solar_radiation_w_m2,
        roof_u_value=req.roof_u_value,
        overhang_m=req.overhang_m,
        openings_ratio=req.openings_ratio
    )

@app.get("/api/materials")
def list_materials():
    """Retrieve verified scientific catalog of envelope materials."""
    return get_all_materials()

@app.get("/api/materials/{mat_id}")
def get_material(mat_id: str):
    """Retrieve detailed material properties by ID."""
    return get_material_by_id(mat_id)

@app.post("/api/ai/explain")
def explain_design(req: ExplainRequest):
    """Generate deterministic engineering reasoning and trade-off synthesis."""
    return generate_design_explanation(req.option, req.climate_info)

@app.post("/api/nl/parse")
def parse_nlp(req: NaturalLanguageRequest):
    """Parse natural language requirements string into structured variables."""
    return parse_natural_language_requirements(req.text)

@app.post("/api/report/generate")
def create_report(req: ReportRequest):
    """Generate and return technical PDF specification document."""
    try:
        pdf_bytes = generate_pdf_report(req.project_data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=ThermoShelter_Design_Report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=False)
