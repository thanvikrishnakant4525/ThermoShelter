# ThermoShelter: Area-Specific Shelter Design for Thermal Comfort Maintenance

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r162-black.svg)](https://threejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Software Based Model Development for Design of Area Specific Shelter for Thermal Comfort Maintenance**

ThermoShelter is an engineering and computational design decision-support tool. It replaces generic, one-size-fits-all shelter models with an area-specific computational pipeline:

```text
GEOGRAPHICAL LOCATION (GIS/Map)
              ↓
LOCAL CLIMATE & SOLAR ANALYSIS (Open-Meteo + IMD Benchmarks)
              ↓
BIOCLIMATIC ZONING (NBC 2016 / Bansal-Minke)
              ↓
THERMAL COMFORT CALCULATION (COST Action 730 UTCI Polynomial)
              ↓
PARAMETRIC DESIGN GENERATION (Options A, B, C vs Baseline)
              ↓
INTERACTIVE 3D VISUALIZATION (Three.js with Raycast Component Hover)
              ↓
SOLAR SHADOW & AIRFLOW PARTICLE SIMULATION
              ↓
BILL OF QUANTITIES & REPORTLAB PDF EXPORT
```

---

## Key Features

1. **Geographical Location Picker**:
   - Leaflet + OpenStreetMap integration with place search, click-to-pin, and manual latitude/longitude input.
   - Preset Indian bioclimatic benchmarks: **Jodhpur** (Hot-Dry Arid), **Jaisalmer** (Thar Desert), **Delhi** (Composite), **Mumbai** (Hot-Humid Coastal), **Chennai** (Maritime), and **Shimla** (Cold Highland).
2. **Climate & Site Diagnostics**:
   - Open-Meteo free API integration (temperature, relative humidity, wind speed & compass direction, solar radiation DNI/DHI, precipitation).
   - Bioclimatic classification (Hot-Dry, Hot-Humid, Composite, Temperate, Cold, Very Cold) with documented physical thresholds and transparent human reasoning.
   - Site design stress indicators: Solar Exposure, Heat Stress, Ventilation Potential, Rain Protection, Shading Requirement, and Thermal Mass Need.
3. **Validated Thermal Comfort Engine**:
   - Implements the European **COST Action 730 Universal Thermal Climate Index (UTCI)** 6th-order polynomial formulation.
   - Mean Radiant Temperature ($T_{mrt}$) modeling evaluating ceiling underside radiation, roof cavity ventilation, and ground shading.
   - Evaluates Conventional Baseline Shelter (uninsulated GI sheet, minimal overhang, arbitrary orientation) vs Optimized candidate designs.
4. **Parametric Shelter Design Generator**:
   - **Option A (Thermal Comfort Maximized)**: 1.2m+ overhangs, PUF sandwich / double-skin ventilated roof, terracotta jali / aerofoil louvers, oriented to capture prevailing breezes while deflecting solar zenith.
   - **Option B (Balanced)**: 0.85m overhang, modular galvanized frame, durable reflective cool roof, integrated rainwater gutter.
   - **Option C (Economy)**: Local materials, simple pitched cool roof, minimal capital expenditure while meeting baseline thermal comfort.
5. **Interactive 3D Architectural Visualizer (Three.js)**:
   - Parametric 3D shelter mesh with realistic materials (reflective panels, terracotta tiles, timber slats, stone plinth, solar panels, gutter).
   - **Raycasting Hover Interaction**: Hovering highlights any component (Roof, Columns, Louvers, Floor, Benches, Solar PV) and shows an instant floating tooltip with thermal role and site-driven engineering reasoning.
   - **Exploded View Mode (0-100%)**: Smoothly elevates roof, offsets louvers, and lowers floor platform to inspect internal layers.
   - **Dynamic Sun & Shadow Simulation**: Positions directional sunlight according to the site's solar altitude and azimuth.
   - **Conceptual Airflow Visualization**: Animated particle stream showing cross-ventilation flow through openings.
6. **Preliminary Cost Estimation & Bill of Quantities**:
   - Itemized schedule of quantities based on standard CPWD unit rates.
7. **ReportLab PDF Export**:
   - One-click technical engineering report download with site diagnostics, thermal comparison table, architectural specs, BOQ, and professional disclaimer.

---

## Project Structure

```text
ThermoAI/
├── backend/
│   ├── climate/
│   │   ├── classifier.py      # NBC 2016 bioclimatic classification & site stress indicators
│   │   ├── demo_data.py       # IMD benchmark climate normals for offline demonstration
│   │   ├── service.py         # Open-Meteo free API client with caching & fallback
│   │   └── solar.py           # Solar position algorithms (azimuth, elevation, overhang angle)
│   ├── thermal/
│   │   ├── comfort.py         # Microclimate Tmrt & shelter heat balance modeling
│   │   └── utci.py            # COST Action 730 UTCI 6th-order polynomial formulation
│   ├── design/
│   │   └── generator.py       # Area-specific parametric generator for Options A, B, C & Baseline
│   ├── materials/
│   │   └── catalog.py         # Scientific database of k-values, SRI, U-values, durability & cost
│   ├── cost/
│   │   └── estimator.py       # Preliminary BOQ cost calculator based on CPWD schedules
│   ├── ml/
│   │   └── surrogate.py       # Fast surrogate regression model (R²=0.97) for rapid iteration
│   ├── ai/
│   │   ├── explainer.py       # Deterministic physics-grounded explanation engine
│   │   └── nl_parser.py       # Natural language requirement entity extractor
│   ├── report/
│   │   └── pdf_generator.py   # ReportLab PDF report generation
│   ├── main.py                # FastAPI application router & endpoints
│   └── run.py                 # Backend entrypoint runner
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Header navigation with Quick Demo
│   │   │   ├── Footer.tsx             # Disclaimer & methodology citations
│   │   │   ├── ProgressStepper.tsx    # Step indicator (Location → Report)
│   │   │   ├── HomeScreen.tsx         # Problem statement & bioclimatic overview
│   │   │   ├── MapPicker.tsx          # Leaflet map with geocoding & presets
│   │   │   ├── ClimateSummary.tsx     # Environmental gauges & stress indicators
│   │   │   ├── RequirementsForm.tsx   # Capacity, budget, purpose, & NL parser
│   │   │   ├── OptionCard.tsx         # Option A/B/C performance cards
│   │   │   ├── ComparisonView.tsx     # Full matrix vs Baseline benchmark
│   │   │   ├── Shelter3DViewer.tsx    # Three.js 3D model with raycast hover
│   │   │   ├── ComponentInspector.tsx # Component thermal role & reason panel
│   │   │   ├── MaterialExplorerModal.tsx # Scientific materials catalog
│   │   │   └── FinalReportView.tsx    # Technical specification sheet & PDF export
│   │   ├── services/api.ts    # Frontend REST client
│   │   └── types/index.ts     # TypeScript interface schemas
│   └── package.json
├── tests/
│   ├── test_climate.py        # Climate classification & solar angle tests
│   ├── test_thermal.py        # UTCI calculation & shading benefit tests
│   ├── test_design.py         # Area-specific design differentiation tests
│   └── test_report.py         # PDF byte stream generation test
├── start.bat                  # One-click dual-server launcher
└── README.md
```

---

## Running the Application

### Option A: One-Click Windows Launcher
Double-click `start.bat` in the project root:
```cmd
start.bat
```
This automatically launches both the FastAPI backend on `http://127.0.0.1:8001` and the Vite frontend on `http://localhost:5173`.

### Option B: Manual Execution

#### 1. Start Backend:
```bash
cd backend
python run.py
```
*Backend runs on `http://127.0.0.1:8001` (API documentation at `http://127.0.0.1:8001/docs`)*.

#### 2. Start Frontend:
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`*.

---

## Running Automated Tests

Execute the unit test suite:
```bash
python tests/test_climate.py
python tests/test_thermal.py
python tests/test_design.py
python tests/test_report.py
```

---

## Demonstration Script

1. Open `http://localhost:5173` in any browser.
2. Click **"Try Example (Jodhpur)"** or click **"Start Design"** to pick a custom location on the Leaflet map.
3. Observe the **Bioclimatic & Environmental Diagnostics**:
   - Extreme summer temperature (41.5°C), low humidity (28%), high solar irradiance (880 W/m²).
   - Bioclimatic classification: **Hot-Dry** zone.
   - Site indicators highlight **Severe Heat Stress** and **High Shading Requirement**.
4. Configure requirements:
   - Capacity: **20 people**, Budget: **₹1,00,000**, Purpose: **Public waiting shelter**.
5. View the **Generated Shelter Candidates**:
   - Compare **Option A** (Thermal Comfort: PUF sandwich, 1.3m overhang), **Option B** (Balanced: double-skin terracotta, 0.9m overhang), and **Option C** (Economy).
   - Observe the **UTCI reduction of 5.5°C+** vs the conventional uninsulated tin roof baseline.
6. Open the **3D Architecture Visualizer**:
   - Hover over the **Roof**: observe the specified material and how the insulated core prevents underside radiation.
   - Hover over the **Shading Louvers**: observe the 45° solar cutoff angle.
   - Hover over the **Ergonomic Benches** and **Columns**.
   - Drag the **Exploded View slider** to inspect internal assembly layers.
   - Toggle **Sun Shadows** and **Conceptual Airflow Particles**.
7. Click **"Finalize Design & View Report"**:
   - Review the complete technical specification and Itemized Bill of Quantities (BOQ).
   - Click **"Download Official PDF Report"** to export the publication-ready engineering sheet.

---

## Engineering Methodology & Standards

- **Thermal Comfort**: European COST Action 730 Universal Thermal Climate Index (UTCI) 6th-order operational polynomial (Bröde et al., 2012).
- **Climate Classification**: National Building Code of India (NBC 2016) & Bansal-Minke criteria.
- **Solar Geometry**: Spencer / Michalsky solar declination and zenith equations.
- **Cost Estimation**: Central Public Works Department (CPWD) Schedule of Rates.
