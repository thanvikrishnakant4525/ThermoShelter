# ThermoShelter: Production Deployment Guide (Vercel + Render Free Tier)

This guide walks you through deploying **ThermoShelter** at **Rs. 0 / 100% free** using:
- **Render (Free Tier)**: Python FastAPI computational engine & ReportLab PDF generator.
- **Vercel (Hobby Tier)**: React + Vite + Three.js 3D visualization frontend.

---

## Architecture Overview

```
                        HTTPS / Web
  [ User Browser ] ---------------------> [ Vercel Frontend ]
         |                                  (React + Vite + Three.js)
         |                                  NEXT_PUBLIC_API_URL
         |
         v HTTPS REST API (/api/*)
  [ Render Backend ] <----------------------- CORS: FRONTEND_URL
    (FastAPI + ML Surrogate + ReportLab)
```

---

## 1. GitHub Repository Setup

1. Initialize Git in the project directory (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Prepare ThermoShelter for Vercel and Render deployment"
   ```

2. Create a new repository on [GitHub](https://github.com/new) (e.g. `ThermoShelter`).

3. Link and push to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/ThermoShelter.git
   git branch -M main
   git push -u origin main
   ```

> **Note**: `.gitignore` is pre-configured to ensure no virtual environments, node_modules, build outputs, or private secrets are committed.

---

## 2. Deploying the Backend on Render (Free Tier)

### Step 2.1: Create Web Service on Render
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repository (`ThermoShelter`).

### Step 2.2: Configure Web Service Settings
Configure the following fields:

| Field | Value |
| :--- | :--- |
| **Name** | `thermoshelter-api` (or your preferred name) |
| **Region** | Singapore / Frankfurt / Oregon (nearest to you) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | **Free** ($0 / month) |

### Step 2.3: Environment Variables on Render
Under the **Environment Variables** section, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.11.9` (or `3.12.0`) | Ensures a stable Python runtime |
| `FRONTEND_URL` | `*` (or your Vercel URL once deployed) | Configures CORS to permit API calls from Vercel |

4. Click **Create Web Service**.
5. Wait for the build and deployment logs to display:
   ```text
   Application startup complete.
   Uvicorn running on http://0.0.0.0:10000
   ```
6. Copy your Render service URL (e.g., `https://thermoshelter-api.onrender.com`).

### Step 2.4: Verify Backend Health
Open your browser or run:
```bash
curl https://thermoshelter-api.onrender.com/health
```
Expected response:
```json
{
  "status": "online",
  "system": "ThermoShelter Computational Design Engine",
  "version": "1.0.0",
  "ml_surrogate_trained": true,
  "ml_surrogate_r2": 0.972
}
```

---

## 3. Deploying the Frontend on Vercel (Hobby Tier)

### Step 3.1: Import Project on Vercel
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`ThermoShelter`).

### Step 3.2: Configure Project Settings
In the configuration screen:

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | `Vite` |
| **Root Directory** | Click **Edit** and choose `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Step 3.3: Configure Environment Variables
Under the **Environment Variables** section, add:

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://thermoshelter-api.onrender.com` |

*(Replace with your actual Render service URL from Step 2)*.

4. Click **Deploy**.
5. Once deployment completes, Vercel gives you your production URL (e.g., `https://thermoshelter.vercel.app`).

### Step 3.4: Lock Down CORS on Render (Optional Security Step)
Go back to Render Dashboard -> `thermoshelter-api` -> **Environment**:
Update `FRONTEND_URL` from `*` to:
```text
https://thermoshelter.vercel.app
```
*(Render will automatically redeploy in ~30 seconds).*

---

## 4. Environment Variables Summary

### Backend (Render)
- `PORT`: Automatically provided by Render's runtime container.
- `FRONTEND_URL`: `https://your-app.vercel.app` (or `*` for initial setup). Allows cross-origin requests.

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL`: The full URL to your Render API (e.g. `https://thermoshelter-api.onrender.com`).
  - Handled seamlessly by `api.ts` whether supplied with or without a trailing `/api`.
  - In local development, leaving it empty automatically routes requests to `/api` via Vite's proxy.

---

## 5. End-to-End Verification of Deployed App

Perform this complete verification flow on your live Vercel URL:

1. **Step 1 — Location Selection**:
   - Select preset benchmark **Jodhpur** or search for any Indian city (**Shimla**, **Mumbai**, **Delhi**).
   - Verify latitude, longitude, and elevation are resolved.
2. **Step 2 — Climate Analysis**:
   - Verify temperature, humidity, solar radiation, wind speed, and UTCI comfort category are displayed.
   - Check the data source tag (**Live Data** or **Demo Data**).
3. **Step 3 — Parametric Design Options**:
   - Select occupant capacity (e.g., 20 users) and operational purpose (e.g., Bus Stop or Worker Rest).
   - Review the 3 generated options: Option A (Thermal Comfort Maximized), Option B (Balanced), Option C (Economy).
4. **Step 4 — Interactive 3D Digital Twin**:
   - Inspect the real-time 3D model with realistic procedural textures.
   - Drag the **Exploded View** slider or click **Disassemble** to inspect structural layers (roof, frame, plinth, interior fixtures).
   - Click individual components to pin specifications.
5. **Step 5 — Bill of Quantities & Report**:
   - Verify CPWD cost breakdown and material schedule.
   - Click **Download Engineering Report (PDF)**. Verify the browser downloads a valid, professional PDF specification sheet.

---

## 6. Common Deployment Errors & Fixes

### Error 1: Render Free Tier Cold Starts (App takes 30-50s to load on first visit)
- **Cause**: Free tier instances on Render spin down after 15 minutes of inactivity.
- **Solution**: The frontend automatically displays a friendly loading indicator while the server awakens. To keep it awake during Hackathon evaluations, use a free uptime monitor (e.g., [UptimeRobot](https://uptimerobot.com/)) hitting `https://<your-render-url>/health` every 10 minutes.

### Error 2: CORS policy: No Access-Control-Allow-Origin header
- **Cause**: `FRONTEND_URL` on Render does not match your Vercel URL or protocol.
- **Solution**: Set `FRONTEND_URL` on Render to `*` (or your exact Vercel URL `https://your-project.vercel.app`). The backend code in `backend/main.py` is configured with wildcard and regex support (`r"https://.*\.vercel\.app"`).

### Error 3: Mixed Content (Blocked loading mixed active content)
- **Cause**: Requesting an insecure `http://` backend URL from an `https://` Vercel site.
- **Solution**: Always use `https://` for `NEXT_PUBLIC_API_URL` on Render. Render automatically issues free SSL certificates.

### Error 4: Vercel 404 on Page Refresh
- **Cause**: Client-side routing not redirected to `index.html`.
- **Solution**: Pre-configured in `frontend/vercel.json` with rewrite rule `{"source": "/(.*)", "destination": "/index.html"}`.

### Error 5: Backend Out of Memory (OOM) on Render Free
- **Cause**: Render Free provides 512MB RAM. Heavy AI models exceed this limit.
- **Solution**: ThermoShelter is architected with a 100% lightweight mathematical surrogate engine and ReportLab, consuming only **~58MB RAM** (well below the 512MB threshold).

---

## 7. Local Testing Commands

To run the full stack locally:

### Start Backend (Port 8001):
```bash
cd backend
python run.py
```
*Health Check: http://127.0.0.1:8001/health*
*Swagger Docs: http://127.0.0.1:8001/docs*

### Start Frontend (Port 5173):
```bash
cd frontend
npm run dev
```
*Open http://localhost:5173/*

### Run Automated Master Verification Suite:
```bash
python scratch/master_prototype_test.py
```
