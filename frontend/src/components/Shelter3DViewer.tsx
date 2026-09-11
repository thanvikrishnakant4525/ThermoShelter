import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Sun,
  Wind,
  RotateCcw,
  Sliders,
  Layers,
  Compass
} from 'lucide-react';
import { ShelterOption, ClimateAnalysisResponse, Component3DData } from '../types';

interface Shelter3DViewerProps {
  option: ShelterOption;
  climate: ClimateAnalysisResponse;
  activeComponent: Component3DData | null;
  onHoverComponent: (comp: Component3DData | null) => void;
  onSelectComponent: (comp: Component3DData) => void;
}

// ============================================================================
// PROCEDURAL ARCHITECTURAL TEXTURE FACTORY (Zero External Dependencies)
// ============================================================================

const textureCache: Record<string, THREE.Texture> = {};

function getStoneWallTexture(): { map: THREE.Texture; bump: THREE.Texture } {
  const key = 'stone_wall';
  if (textureCache[key + '_map'] && textureCache[key + '_bump']) {
    return { map: textureCache[key + '_map'], bump: textureCache[key + '_bump'] };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d')!;

  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 0, 512, 512);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 512, 512);

  const rows = 12;
  const rowHeight = 512 / rows;
  const stoneColors = ['#475569', '#52525b', '#64748b', '#71717a', '#78716c', '#57534e'];

  for (let r = 0; r < rows; r++) {
    const y = r * rowHeight;
    const cols = 5 + (r % 2);
    const colWidth = 512 / cols;
    const xOffset = (r % 2) * (colWidth / 2);

    for (let c = -1; c <= cols; c++) {
      const x = c * colWidth + xOffset;
      const w = colWidth - 4;
      const h = rowHeight - 4;

      const baseColor = stoneColors[(r * 3 + c + 10) % stoneColors.length];
      ctx.fillStyle = baseColor;
      ctx.fillRect(x + 2, y + 2, w, h);

      for (let n = 0; n < 35; n++) {
        const nx = x + 4 + Math.random() * (w - 8);
        const ny = y + 4 + Math.random() * (h - 8);
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
        ctx.fillRect(nx, ny, 3 + Math.random() * 4, 3 + Math.random() * 4);
      }

      bCtx.fillStyle = '#202020';
      bCtx.fillRect(x, y, colWidth, 4);
      bCtx.fillRect(x, y, 4, rowHeight);
      bCtx.fillStyle = '#c0c0c0';
      bCtx.fillRect(x + 4, y + 4, w - 4, h - 4);
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(2, 2);

  textureCache[key + '_map'] = map;
  textureCache[key + '_bump'] = bump;
  return { map, bump };
}

function getTerracottaTileTexture(): { map: THREE.Texture; bump: THREE.Texture } {
  const key = 'terracotta_tile';
  if (textureCache[key + '_map'] && textureCache[key + '_bump']) {
    return { map: textureCache[key + '_map'], bump: textureCache[key + '_bump'] };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d')!;

  ctx.fillStyle = '#c2410c';
  ctx.fillRect(0, 0, 512, 512);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 512, 512);

  const courses = 16;
  const courseHeight = 512 / courses;

  for (let i = 0; i < courses; i++) {
    const y = i * courseHeight;
    const grad = ctx.createLinearGradient(0, y, 0, y + courseHeight);
    grad.addColorStop(0, '#9a3412');
    grad.addColorStop(0.2, '#ea580c');
    grad.addColorStop(0.7, '#c2410c');
    grad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, 512, courseHeight - 2);

    const bGrad = bCtx.createLinearGradient(0, y, 0, y + courseHeight);
    bGrad.addColorStop(0, '#303030');
    bGrad.addColorStop(0.4, '#ffffff');
    bGrad.addColorStop(1, '#101010');
    bCtx.fillStyle = bGrad;
    bCtx.fillRect(0, y, 512, courseHeight);

    for (let c = 0; c < 16; c++) {
      const cx = c * 32 + ((i % 2) * 16);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(cx, y, 2, courseHeight);
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(3, 3);

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(3, 3);

  textureCache[key + '_map'] = map;
  textureCache[key + '_bump'] = bump;
  return { map, bump };
}

function getMetalRibTexture(colorHex: string = '#94a3b8'): { map: THREE.Texture; bump: THREE.Texture } {
  const key = `metal_rib_${colorHex}`;
  if (textureCache[key + '_map'] && textureCache[key + '_bump']) {
    return { map: textureCache[key + '_map'], bump: textureCache[key + '_bump'] };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 256;
  bumpCanvas.height = 256;
  const bCtx = bumpCanvas.getContext('2d')!;

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, 256, 256);

  const ribs = 8;
  const ribDist = 256 / ribs;

  for (let i = 0; i < ribs; i++) {
    const x = i * ribDist;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(x, 0, 4, 256);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, 0, 4, 256);

    bCtx.fillStyle = '#ffffff';
    bCtx.fillRect(x, 0, 6, 256);
    bCtx.fillStyle = '#404040';
    bCtx.fillRect(x + 6, 0, ribDist - 6, 256);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 4);

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(4, 4);

  textureCache[key + '_map'] = map;
  textureCache[key + '_bump'] = bump;
  return { map, bump };
}

function getWoodPlankTexture(tint: string = '#b45309'): { map: THREE.Texture; bump: THREE.Texture } {
  const key = `wood_plank_${tint}`;
  if (textureCache[key + '_map'] && textureCache[key + '_bump']) {
    return { map: textureCache[key + '_map'], bump: textureCache[key + '_bump'] };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d')!;

  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, 512, 512);

  const planks = 8;
  const plankH = 512 / planks;

  for (let p = 0; p < planks; p++) {
    const y = p * plankH;
    ctx.fillStyle = p % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, y, 512, plankH);

    for (let g = 0; g < 14; g++) {
      const gy = y + Math.random() * plankH;
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(170, gy + (Math.random() - 0.5) * 6, 340, gy + (Math.random() - 0.5) * 6, 512, gy);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, y + plankH - 3, 512, 3);

    bCtx.fillStyle = '#ffffff';
    bCtx.fillRect(0, y, 512, plankH - 3);
    bCtx.fillStyle = '#000000';
    bCtx.fillRect(0, y + plankH - 3, 512, 3);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(2, 2);

  textureCache[key + '_map'] = map;
  textureCache[key + '_bump'] = bump;
  return { map, bump };
}

function getTerracottaJaliTexture(): { map: THREE.Texture; alpha: THREE.Texture } {
  const key = 'terracotta_jali';
  if (textureCache[key + '_map'] && textureCache[key + '_alpha']) {
    return { map: textureCache[key + '_map'], alpha: textureCache[key + '_alpha'] };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const alphaCanvas = document.createElement('canvas');
  alphaCanvas.width = 256;
  alphaCanvas.height = 256;
  const aCtx = alphaCanvas.getContext('2d')!;

  ctx.fillStyle = '#c2410c';
  ctx.fillRect(0, 0, 256, 256);

  aCtx.fillStyle = '#ffffff';
  aCtx.fillRect(0, 0, 256, 256);

  const cellSize = 32;
  for (let x = 0; x < 256; x += cellSize) {
    for (let y = 0; y < 256; y += cellSize) {
      const cx = x + cellSize / 2;
      const cy = y + cellSize / 2;
      const r = cellSize * 0.35;

      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      aCtx.fillStyle = '#000000';
      aCtx.beginPath();
      aCtx.arc(cx, cy, r, 0, Math.PI * 2);
      aCtx.fill();
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 2);

  const alpha = new THREE.CanvasTexture(alphaCanvas);
  alpha.wrapS = THREE.RepeatWrapping;
  alpha.wrapT = THREE.RepeatWrapping;
  alpha.repeat.set(4, 2);

  textureCache[key + '_map'] = map;
  textureCache[key + '_alpha'] = alpha;
  return { map, alpha };
}

function getTransitBoardTexture(): THREE.Texture {
  const key = 'transit_board';
  if (textureCache[key]) return textureCache[key];

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 0, 512, 64);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('CITY BUS TRANSIT ROUTE & SCHEDULE', 20, 42);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 64, 512, 256);

  const colors = ['#2563eb', '#16a34a', '#ea580c'];
  const routes = ['Line 1: Central Station ⇄ Market', 'Line 4: Tech Park ⇄ City Hospital', 'Line 7: University ⇄ Ring Road'];
  colors.forEach((c, idx) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(30, 110 + idx * 50);
    ctx.lineTo(480, 110 + idx * 50);
    ctx.stroke();

    for (let s = 0; s < 5; s++) {
      const sx = 60 + s * 95;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, 110 + idx * 50, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(routes[idx], 32, 98 + idx * 50);
  });

  ctx.fillStyle = '#64748b';
  ctx.font = '12px sans-serif';
  ctx.fillText('• Solar Night Lighting • Emergency Call Box Available', 24, 292);

  const tex = new THREE.CanvasTexture(canvas);
  textureCache[key] = tex;
  return tex;
}

function getCommunityBoardTexture(): THREE.Texture {
  const key = 'community_board';
  if (textureCache[key]) return textureCache[key];

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, 0, 512, 54);
  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('COMMUNITY NOTICE & WEATHER BOARD', 20, 36);

  ctx.fillStyle = '#d97706';
  ctx.fillRect(0, 54, 512, 266);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(25, 75, 210, 100);
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('VILLAGE PANCHAYAT', 35, 95);
  ctx.font = '11px sans-serif';
  ctx.fillText('Weekly assembly: Friday 4:00 PM', 35, 115);
  ctx.fillText('Monsoon flood relief registry open', 35, 132);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(270, 75, 215, 100);
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('HEALTH & WEATHER ALERT', 280, 95);
  ctx.font = '11px sans-serif';
  ctx.fillText('Local PHC Mobile Clinic: Tuesday', 280, 115);
  ctx.fillText('Heavy rainfall advisory in effect', 280, 132);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(25, 195, 460, 90);
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('EMERGENCY CIVIC CONTACTS', 35, 215);
  ctx.font = '11px sans-serif';
  ctx.fillText('Ambulance: 108  |  Disaster Management: 1077  |  Women Helpline: 1091', 35, 235);
  ctx.fillText('Clean water percolation recharge pit installed beneath shelter deck.', 35, 255);

  const tex = new THREE.CanvasTexture(canvas);
  textureCache[key] = tex;
  return tex;
}

function getEmergencyLockerTexture(): THREE.Texture {
  const key = 'emergency_locker';
  if (textureCache[key]) return textureCache[key];

  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#dc2626';
  ctx.fillRect(0, 0, 320, 320);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(130, 40, 60, 180);
  ctx.fillRect(70, 100, 180, 60);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FIRST AID & RELIEF', 160, 260);
  ctx.font = '13px sans-serif';
  ctx.fillText('EMERGENCY PROTOCOL', 160, 285);

  const tex = new THREE.CanvasTexture(canvas);
  textureCache[key] = tex;
  return tex;
}

function getTouristMapTexture(): THREE.Texture {
  const key = 'tourist_map';
  if (textureCache[key]) return textureCache[key];

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f766e';
  ctx.fillRect(0, 0, 512, 54);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('REGIONAL SCENIC TRAIL & LANDMARKS', 20, 36);

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 54, 512, 266);

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(256, 180, 40 + i * 28, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(50, 240);
  ctx.bezierCurveTo(150, 130, 320, 260, 460, 110);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('★ You Are Here: Shaded Rest Point (Elev. +850m)', 40, 90);
  ctx.fillText('▲ Mountain Summit Trail (4.2 km)', 260, 130);
  ctx.fillText('● Freshwater Spring (0.8 km)', 80, 270);

  const tex = new THREE.CanvasTexture(canvas);
  textureCache[key] = tex;
  return tex;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const Shelter3DViewer: React.FC<Shelter3DViewerProps> = ({
  option,
  climate,
  activeComponent,
  onHoverComponent,
  onSelectComponent
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const explodedGroupsRef = useRef<{
    roof?: THREE.Group;
    floor?: THREE.Group;
    wallBack?: THREE.Group;
    wallWest?: THREE.Group;
    wallEast?: THREE.Group;
    wallFront?: THREE.Group;
    interior?: THREE.Group;
  }>({});
  const hoveredMeshRef = useRef<THREE.Mesh | null>(null);
  const windParticlesRef = useRef<THREE.Points | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const showAirflowRef = useRef<boolean>(true);

  const [explodedFactor, setExplodedFactor] = useState<number>(0);
  const [showAirflow, setShowAirflow] = useState<boolean>(true);
  const [showSolarShadows, setShowSolarShadows] = useState<boolean>(true);

  const [tooltipData, setTooltipData] = useState<{
    comp: Component3DData;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    showAirflowRef.current = showAirflow;
  }, [showAirflow]);

  // 1. Initialize Three.js Scene, Camera, Lighting & OrbitControls
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 750;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    scene.fog = new THREE.FogExp2(0xf1f5f9, 0.016);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 120);
    camera.position.set(11, 7.5, 13);
    camera.lookAt(0, 1.5, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 3.5;
    controls.maxDistance = 45;
    controls.target.set(0, 1.4, 0);
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    controlsRef.current = controls;

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x475569, 0.95);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    const d = 11.0;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.02;

    const solarAltRad = THREE.MathUtils.degToRad(climate.solar_position.altitude_deg || 50);
    const solarAzRad = THREE.MathUtils.degToRad(climate.solar_position.azimuth_deg || 180);
    const sunDist = 22;
    const sunX = sunDist * Math.cos(solarAltRad) * Math.sin(solarAzRad);
    const sunY = Math.max(6.0, sunDist * Math.sin(solarAltRad));
    const sunZ = sunDist * Math.cos(solarAltRad) * Math.cos(solarAzRad);
    sunLight.position.set(sunX, sunY, sunZ);
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.45);
    fillLight.position.set(-sunX * 0.5, 6, -sunZ * 0.5);
    scene.add(fillLight);

    // Compass Ground Disk
    const groundGeo = new THREE.CylinderGeometry(20, 20, 0.08, 48);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9, metalness: 0.05 });
    const groundDisk = new THREE.Mesh(groundGeo, groundMat);
    groundDisk.position.y = -0.04;
    groundDisk.receiveShadow = true;
    scene.add(groundDisk);

    const grid = new THREE.GridHelper(30, 30, 0x94a3b8, 0xcbd5e1);
    grid.position.y = 0.01;
    scene.add(grid);

    const ringGeo = new THREE.RingGeometry(9.2, 9.4, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);

    // North Compass Arrow: points at -Z (0 deg North)
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 1.0);
    arrowShape.lineTo(0.38, 0);
    arrowShape.lineTo(-0.38, 0);
    arrowShape.closePath();
    const arrowGeo = new THREE.ShapeGeometry(arrowShape);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xd97706, side: THREE.DoubleSide });
    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
    arrowMesh.rotation.x = -Math.PI / 2;
    arrowMesh.position.set(0, 0.025, -9.6);
    scene.add(arrowMesh);

    // North Label indicator
    const nBarGeo1 = new THREE.BoxGeometry(0.08, 0.02, 0.6);
    const nBarGeo2 = new THREE.BoxGeometry(0.08, 0.02, 0.6);
    const nBarGeo3 = new THREE.BoxGeometry(0.08, 0.02, 0.6);
    const nMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
    const n1 = new THREE.Mesh(nBarGeo1, nMat);
    n1.position.set(-0.2, 0.03, -10.5);
    scene.add(n1);
    const n2 = new THREE.Mesh(nBarGeo2, nMat);
    n2.position.set(0.2, 0.03, -10.5);
    scene.add(n2);
    const n3 = new THREE.Mesh(nBarGeo3, nMat);
    n3.position.set(0, 0.03, -10.5);
    n3.rotation.y = -0.55;
    scene.add(n3);

    // Animated Wind Streamlines
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    const windRad = THREE.MathUtils.degToRad(climate.environmental_data.wind_direction_deg || 240);
    const windDirX = -Math.sin(windRad);
    const windDirZ = -Math.cos(windRad);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18 - windDirX * 8;
      positions[i * 3 + 1] = 0.3 + Math.random() * 3.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18 - windDirZ * 8;

      velocities[i * 3] = windDirX * (0.045 + Math.random() * 0.035);
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 2] = windDirZ * (0.045 + Math.random() * 0.035);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const windParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(windParticles);
    windParticlesRef.current = windParticles;

    const domElem = renderer.domElement;

    const onPointerMove = (e: MouseEvent) => {
      const rect = domElem.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      if (groupRef.current) {
        const intersects = raycaster.intersectObjects(groupRef.current.children, true);
        if (intersects.length > 0) {
          let hitMesh: THREE.Mesh | null = null;
          let compData: Component3DData | null = null;

          for (const hit of intersects) {
            const obj = hit.object as THREE.Mesh;
            if (obj.userData && obj.userData.component) {
              hitMesh = obj;
              compData = obj.userData.component;
              break;
            }
          }

          if (hitMesh && compData) {
            if (hoveredMeshRef.current && hoveredMeshRef.current !== hitMesh) {
              const origMat = (hoveredMeshRef.current as any).__originalMaterial;
              if (origMat) hoveredMeshRef.current.material = origMat;
            }

            if (!(hitMesh as any).__originalMaterial) {
              (hitMesh as any).__originalMaterial = hitMesh.material;
            }

            if (hitMesh.material && (hitMesh.material as THREE.MeshStandardMaterial).emissive) {
              const hoverMat = ((hitMesh as any).__originalMaterial as THREE.MeshStandardMaterial).clone();
              hoverMat.emissive.setHex(0x1d4ed8);
              hoverMat.emissiveIntensity = 0.6;
              hitMesh.material = hoverMat;
            }

            hoveredMeshRef.current = hitMesh;
            onHoverComponent(compData);
            setTooltipData({
              comp: compData,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            });
            domElem.style.cursor = 'pointer';
            return;
          }
        }
      }

      if (hoveredMeshRef.current) {
        const origMat = (hoveredMeshRef.current as any).__originalMaterial;
        if (origMat) hoveredMeshRef.current.material = origMat;
        hoveredMeshRef.current = null;
      }
      onHoverComponent(null);
      setTooltipData(null);
      domElem.style.cursor = 'grab';
    };

    const onPointerClick = () => {
      if (tooltipData) {
        onSelectComponent(tooltipData.comp);
      }
    };

    domElem.addEventListener('mousemove', onPointerMove);
    domElem.addEventListener('click', onPointerClick);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      if (windParticlesRef.current && showAirflowRef.current) {
        const posAttr = windParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          posArray[i * 3] += velocities[i * 3];
          posArray[i * 3 + 1] += velocities[i * 3 + 1];
          posArray[i * 3 + 2] += velocities[i * 3 + 2];

          if (Math.abs(posArray[i * 3]) > 16 || Math.abs(posArray[i * 3 + 2]) > 16) {
            posArray[i * 3] = (Math.random() - 0.5) * 18 - windDirX * 8;
            posArray[i * 3 + 1] = 0.3 + Math.random() * 3.2;
            posArray[i * 3 + 2] = (Math.random() - 0.5) * 18 - windDirZ * 8;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      domElem.removeEventListener('mousemove', onPointerMove);
      domElem.removeEventListener('click', onPointerClick);
      controls.dispose();
      if (container.contains(domElem)) {
        container.removeChild(domElem);
      }
      renderer.dispose();
    };
  }, [climate]);

  useEffect(() => {
    if (sunLightRef.current) {
      sunLightRef.current.castShadow = showSolarShadows;
    }
  }, [showSolarShadows]);

  // ==========================================================================
  // 2. PROCEDURAL ARCHITECTURAL SHELTER GEOMETRY SYNTHESIS
  // ==========================================================================
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (groupRef.current) {
      scene.remove(groupRef.current);
    }

    const shelterGroup = new THREE.Group();

    // Architectural Sub-Groups for High-Performance Exploded View Disassembly
    const floorGroup = new THREE.Group();
    const frameGroup = new THREE.Group();
    const wallBackGroup = new THREE.Group();
    const wallWestGroup = new THREE.Group();
    const wallEastGroup = new THREE.Group();
    const wallFrontGroup = new THREE.Group();
    const roofGroup = new THREE.Group();
    const interiorGroup = new THREE.Group();

    shelterGroup.add(floorGroup);
    shelterGroup.add(frameGroup);
    shelterGroup.add(wallBackGroup);
    shelterGroup.add(wallWestGroup);
    shelterGroup.add(wallEastGroup);
    shelterGroup.add(wallFrontGroup);
    shelterGroup.add(roofGroup);
    shelterGroup.add(interiorGroup);

    explodedGroupsRef.current = {
      roof: roofGroup,
      floor: floorGroup,
      wallBack: wallBackGroup,
      wallWest: wallWestGroup,
      wallEast: wallEastGroup,
      wallFront: wallFrontGroup,
      interior: interiorGroup,
    };

    // Apply active explodedFactor immediately on initial scene build
    roofGroup.position.y = explodedFactor * 2.8;
    floorGroup.position.y = -explodedFactor * 1.5;
    wallBackGroup.position.z = -explodedFactor * 1.8;
    wallFrontGroup.position.z = explodedFactor * 1.8;
    wallWestGroup.position.x = -explodedFactor * 1.8;
    wallEastGroup.position.x = explodedFactor * 1.8;
    interiorGroup.position.y = -explodedFactor * 0.4;

    const dims = option.dimensions;
    const L = dims.length_m;
    const W = dims.width_m;
    const H = dims.height_m;
    const overhang = option.roof.overhang_m;
    const roofL = L + 2 * overhang;
    const roofW = W + 2 * overhang;

    // Physical Compass Orientation:
    // Shelter front opening is natively at +Z (South = 180 deg).
    // Heading angle = option.orientation_deg.
    // Therefore rotation = degToRad(option.orientation_deg - 180).
    const headingDeg = option.orientation_deg || 180;
    const orientRad = THREE.MathUtils.degToRad(headingDeg - 180);
    shelterGroup.rotation.y = orientRad;

    const compMap: Record<string, Component3DData> = {};
    option.components_3d.forEach(c => { compMap[c.id] = c; });

    const setupMesh = (mesh: THREE.Mesh, compId: string) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (compMap[compId]) {
        mesh.userData = { component: compMap[compId] };
      }
    };

    const category = climate.climate_character.category;
    const isCold = category === 'Cold' || category === 'Very Cold' || Boolean(option.has_walls);
    const isHotDry = category === 'Hot-Dry';
    const isHotHumid = category === 'Hot-Humid';

    // ------------------------------------------------------------------------
    // DYNAMIC COLUMN GRID (Adapts seamlessly to size and occupancy)
    // ------------------------------------------------------------------------
    // Standard structural bay spacing is 2.5m - 3.2m
    const numBaysX = Math.max(2, Math.round(L / 2.7));
    const numColsX = numBaysX + 1;
    const colXs: number[] = [];
    for (let i = 0; i < numColsX; i++) {
      colXs.push(-L / 2 + 0.25 + (i / (numColsX - 1)) * (L - 0.5));
    }
    const rearZ = -W / 2 + 0.25;
    const frontZ = W / 2 - 0.25;
    const colZs = [rearZ, frontZ];

    // ------------------------------------------------------------------------
    // 1. FOUNDATION PLINTH (Raised Stilt vs Solid Paver Slab)
    // ------------------------------------------------------------------------
    let floorBaseY = 0.22;
    if (isHotHumid) {
      floorBaseY = 0.50;
      const stiltGeo = new THREE.CylinderGeometry(0.08, 0.08, floorBaseY, 12);
      const stiltMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.7 });

      // Stilts align exactly with structural columns
      colXs.forEach(sx => {
        colZs.forEach(sz => {
          const stilt = new THREE.Mesh(stiltGeo, stiltMat);
          stilt.position.set(sx, floorBaseY / 2, sz);
          setupMesh(stilt, 'floor_platform');
          floorGroup.add(stilt);
        });
      });

      const { map: woodMap, bump: woodBump } = getWoodPlankTexture('#b45309');
      const deckGeo = new THREE.BoxGeometry(L + 0.6, 0.08, W + 0.6);
      const deckMat = new THREE.MeshStandardMaterial({ map: woodMap, bumpMap: woodBump, bumpScale: 0.04, roughness: 0.75 });
      const deckMesh = new THREE.Mesh(deckGeo, deckMat);
      deckMesh.position.set(0, floorBaseY - 0.04, 0);
      setupMesh(deckMesh, 'floor_platform');
      floorGroup.add(deckMesh);

      // Access steps centered at the entrance
      const stepMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
      for (let s = 0; s < 3; s++) {
        const stepGeo = new THREE.BoxGeometry(1.8, 0.12, 0.35);
        const stepMesh = new THREE.Mesh(stepGeo, stepMat);
        stepMesh.position.set(0, 0.06 + s * 0.14, W / 2 + 0.45 + (2 - s) * 0.32);
        setupMesh(stepMesh, 'floor_platform');
        floorGroup.add(stepMesh);
      }
    } else {
      const isKota = option.main_materials.floor.toLowerCase().includes('kota');
      const floorMat = new THREE.MeshStandardMaterial({
        color: isKota ? 0x64748b : 0x78716c,
        roughness: isKota ? 0.45 : 0.85,
        metalness: 0.08
      });
      const floorGeo = new THREE.BoxGeometry(L + 0.6, floorBaseY, W + 0.6);
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.set(0, floorBaseY / 2, 0);
      setupMesh(floorMesh, 'floor_platform');
      floorGroup.add(floorMesh);

      const rampGeo = new THREE.BoxGeometry(2.0, 0.08, 0.85);
      const rampMesh = new THREE.Mesh(rampGeo, floorMat);
      rampMesh.position.set(0, 0.04, W / 2 + 0.68);
      rampMesh.rotation.x = 0.12;
      setupMesh(rampMesh, 'floor_platform');
      floorGroup.add(rampMesh);
    }

    // ------------------------------------------------------------------------
    // 2. STRUCTURAL FRAMEWORK (Columns, Longitudinal Beams & Transverse Ties)
    // ------------------------------------------------------------------------
    const colWidth = 0.12;
    const colGeo = new THREE.BoxGeometry(colWidth, H, colWidth);
    const colColor = option.main_materials.structure.toLowerCase().includes('steel') ? 0x1e293b : 0x92400e;
    const colMat = new THREE.MeshStandardMaterial({ color: colColor, roughness: 0.35, metalness: 0.8 });

    // Columns
    colXs.forEach(x => {
      colZs.forEach(z => {
        const col = new THREE.Mesh(colGeo, colMat);
        col.position.set(x, floorBaseY + H / 2, z);
        setupMesh(col, 'columns');
        frameGroup.add(col);

        const bpGeo = new THREE.BoxGeometry(0.24, 0.03, 0.24);
        const bp = new THREE.Mesh(bpGeo, colMat);
        bp.position.set(x, floorBaseY + 0.015, z);
        setupMesh(bp, 'columns');
        frameGroup.add(bp);
      });
    });

    // Longitudinal Ring Beams along X
    const beamGeoL = new THREE.BoxGeometry(L, 0.12, 0.08);
    colZs.forEach(z => {
      const beam = new THREE.Mesh(beamGeoL, colMat);
      beam.position.set(0, floorBaseY + H - 0.06, z);
      setupMesh(beam, 'columns');
      frameGroup.add(beam);
    });

    // Transverse Tie Beams connecting every front-and-rear column pair
    const tieGeoW = new THREE.BoxGeometry(0.08, 0.12, W - 0.5);
    colXs.forEach(x => {
      const tie = new THREE.Mesh(tieGeoW, colMat);
      tie.position.set(x, floorBaseY + H - 0.06, 0);
      setupMesh(tie, 'columns');
      frameGroup.add(tie);
    });

    // ------------------------------------------------------------------------
    // 3. WALLS & ENCLOSURES: THICK COLD WALLS vs HOT PERFORATED JALI / LOUVERS
    // ------------------------------------------------------------------------
    if (isCold) {
      const wallThickness = 0.30;
      const { map: stoneMap, bump: stoneBump } = getStoneWallTexture();
      const wallMat = new THREE.MeshStandardMaterial({
        map: stoneMap,
        bumpMap: stoneBump,
        bumpScale: 0.06,
        roughness: 0.88,
        metalness: 0.05
      });

      const wallY = floorBaseY + H / 2;

      // North Solid Back Wall (blocks cold northerly winds)
      const backWallGeo = new THREE.BoxGeometry(L, H, wallThickness);
      const backWall = new THREE.Mesh(backWallGeo, wallMat);
      backWall.position.set(0, wallY, -W / 2 + wallThickness / 2);
      setupMesh(backWall, 'insulated_walls');
      wallBackGroup.add(backWall);

      // West Side Wall
      const westWallGeo = new THREE.BoxGeometry(wallThickness, H, W - wallThickness);
      const westWall = new THREE.Mesh(westWallGeo, wallMat);
      westWall.position.set(-L / 2 + wallThickness / 2, wallY, 0);
      setupMesh(westWall, 'insulated_walls');
      wallWestGroup.add(westWall);

      // East Side Wall
      const eastWallGeo = new THREE.BoxGeometry(wallThickness, H, W - wallThickness);
      const eastWall = new THREE.Mesh(eastWallGeo, wallMat);
      eastWall.position.set(L / 2 - wallThickness / 2, wallY, 0);
      setupMesh(eastWall, 'insulated_walls');
      wallEastGroup.add(eastWall);

      // Windbreak Baffle / Vestibule Entrance Return (breaks chilling entry draft)
      const baffleGeo = new THREE.BoxGeometry(wallThickness, H, W * 0.35);
      const baffleMesh = new THREE.Mesh(baffleGeo, wallMat);
      baffleMesh.position.set(L * 0.15, wallY, W / 2 - (W * 0.35) / 2);
      setupMesh(baffleMesh, 'insulated_walls');
      wallFrontGroup.add(baffleMesh);

      // South-facing Low-E Double Glazed Passive Solar Window
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x93c5fd,
        transmission: 0.85,
        opacity: 0.65,
        transparent: true,
        roughness: 0.1,
        ior: 1.5,
        metalness: 0.1
      });
      const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });

      const winW = L * 0.42;
      const winH = 1.25;
      const winGeo = new THREE.BoxGeometry(winW, winH, 0.04);
      const winMesh = new THREE.Mesh(winGeo, glassMat);
      winMesh.position.set(-L * 0.22, floorBaseY + H * 0.55, W / 2 - 0.02);
      setupMesh(winMesh, 'solar_windows');
      wallFrontGroup.add(winMesh);

      const frameGeo = new THREE.BoxGeometry(winW + 0.08, winH + 0.08, 0.06);
      const frameMesh = new THREE.Mesh(frameGeo, windowFrameMat);
      frameMesh.position.set(-L * 0.22, floorBaseY + H * 0.55, W / 2 - 0.02);
      setupMesh(frameMesh, 'solar_windows');
      wallFrontGroup.add(frameMesh);
    } else if (isHotDry) {
      const { map: jaliMap, alpha: jaliAlpha } = getTerracottaJaliTexture();
      const jaliMat = new THREE.MeshStandardMaterial({
        map: jaliMap,
        alphaMap: jaliAlpha,
        alphaTest: 0.45,
        transparent: true,
        color: 0xc2410c,
        roughness: 0.8,
        metalness: 0.05,
        side: THREE.DoubleSide
      });

      // Rear Terracotta Jali Screen Wall
      const jaliGeoRear = new THREE.BoxGeometry(L * 0.9, H * 0.65, 0.06);
      const jaliMeshRear = new THREE.Mesh(jaliGeoRear, jaliMat);
      jaliMeshRear.position.set(0, floorBaseY + H * 0.55, -W / 2 + 0.15);
      setupMesh(jaliMeshRear, 'shading_louvers');
      wallBackGroup.add(jaliMeshRear);

      // Side West Jali Screen for low afternoon sun protection
      const jaliGeoSide = new THREE.BoxGeometry(0.06, H * 0.65, W * 0.75);
      const jaliMeshSide = new THREE.Mesh(jaliGeoSide, jaliMat);
      jaliMeshSide.position.set(-L / 2 + 0.15, floorBaseY + H * 0.55, 0);
      setupMesh(jaliMeshSide, 'shading_louvers');
      wallWestGroup.add(jaliMeshSide);

      const bracketMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 });
      colXs.forEach(bx => {
        const bracketGeo = new THREE.BoxGeometry(0.04, 0.5, 0.8);
        const bracketMesh = new THREE.Mesh(bracketGeo, bracketMat);
        bracketMesh.position.set(bx, floorBaseY + H - 0.25, W / 2 + 0.15);
        bracketMesh.rotation.x = 0.45;
        setupMesh(bracketMesh, 'columns');
        frameGroup.add(bracketMesh);
      });
    } else {
      // Hot-Humid / Composite Aerodynamic Louvers
      const louverCount = 8;
      const louverGeo = new THREE.BoxGeometry(L * 0.88, 0.03, 0.22);
      const louverColor = option.main_materials.shading.toLowerCase().includes('jali') ? 0xea580c : 0x0284c7;
      const louverMat = new THREE.MeshStandardMaterial({ color: louverColor, roughness: 0.45, metalness: 0.35 });

      for (let i = 0; i < louverCount; i++) {
        const slat = new THREE.Mesh(louverGeo, louverMat);
        slat.rotation.x = THREE.MathUtils.degToRad(42);
        slat.position.set(0, floorBaseY + H * 0.35 + i * 0.16, W / 2 - 0.05);
        setupMesh(slat, 'shading_louvers');
        wallFrontGroup.add(slat);
      }
    }

    // ------------------------------------------------------------------------
    // 4. ROOF ENVELOPE: ACCURATE STRUCTURAL ALIGNMENT & GEOMETRY
    // ------------------------------------------------------------------------
    // Top beam surface height is floorBaseY + H.
    const roofBaseY = floorBaseY + H;
    const roofType = option.roof.type;

    if (isCold) {
      // ======================================================================
      // A. COLD / MOUNTAIN: 35° Steep Sloped Gable Roof + Structural Trusses
      // ======================================================================
      const ridgeHeight = 1.15;
      const { map: galvMap, bump: galvBump } = getMetalRibTexture('#64748b');
      const coldRoofMat = new THREE.MeshStandardMaterial({
        map: galvMap,
        bumpMap: galvBump,
        bumpScale: 0.05,
        color: 0x475569,
        roughness: 0.3,
        metalness: 0.7
      });

      // Gable roof profile: slopes from central ridge at z=0 down to z=-roofW/2 and z=+roofW/2
      const halfW = roofW / 2;
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-halfW, 0);
      roofShape.lineTo(0, ridgeHeight);
      roofShape.lineTo(halfW, 0);
      roofShape.lineTo(halfW, -0.10);
      roofShape.lineTo(0, ridgeHeight - 0.10);
      roofShape.lineTo(-halfW, -0.10);
      roofShape.closePath();

      const extrudeSettings = { depth: roofL, bevelEnabled: false };
      const gableGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      const gableRoof = new THREE.Mesh(gableGeo, coldRoofMat);
      gableRoof.rotation.y = Math.PI / 2;
      gableRoof.position.set(-roofL / 2, roofBaseY, 0);
      setupMesh(gableRoof, 'roof');
      roofGroup.add(gableRoof);

      // Structural Gable End Walls (Pitched Infill Triangles matching stone wall)
      const { map: stoneMap, bump: stoneBump } = getStoneWallTexture();
      const pedimentMat = new THREE.MeshStandardMaterial({
        map: stoneMap,
        bumpMap: stoneBump,
        bumpScale: 0.06,
        roughness: 0.88
      });
      const endWallW = W / 2;
      const pedShape = new THREE.Shape();
      pedShape.moveTo(-endWallW, 0);
      pedShape.lineTo(0, ridgeHeight * (endWallW / halfW));
      pedShape.lineTo(endWallW, 0);
      pedShape.closePath();

      const pedGeo = new THREE.ExtrudeGeometry(pedShape, { depth: 0.28, bevelEnabled: false });
      [-L / 2 + 0.14, L / 2 - 0.42].forEach(px => {
        const ped = new THREE.Mesh(pedGeo, pedimentMat);
        ped.rotation.y = Math.PI / 2;
        ped.position.set(px, roofBaseY - 0.02, 0);
        setupMesh(ped, 'insulated_walls');
        roofGroup.add(ped);
      });

      // Structural A-Frame Roof Trusses over internal column lines
      const trussMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
      colXs.forEach(cx => {
        const kingGeo = new THREE.CylinderGeometry(0.03, 0.03, ridgeHeight * 0.85, 8);
        const king = new THREE.Mesh(kingGeo, trussMat);
        king.position.set(cx, roofBaseY + ridgeHeight * 0.42, 0);
        setupMesh(king, 'columns');
        roofGroup.add(king);

        // Diagonal rafter struts
        [-1, 1].forEach(dir => {
          const strutGeo = new THREE.BoxGeometry(0.05, 0.05, halfW * 0.95);
          const strut = new THREE.Mesh(strutGeo, trussMat);
          strut.position.set(cx, roofBaseY + ridgeHeight * 0.45, dir * halfW * 0.45);
          strut.rotation.x = -dir * Math.atan2(ridgeHeight, halfW);
          setupMesh(strut, 'columns');
          roofGroup.add(strut);
        });
      });

      // Snow-Retention Rails along roof eaves
      const snowRailGeo = new THREE.CylinderGeometry(0.025, 0.025, roofL, 12);
      const snowRailMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
      [-roofW / 2 + 0.25, roofW / 2 - 0.25].forEach(rz => {
        const rail = new THREE.Mesh(snowRailGeo, snowRailMat);
        rail.rotation.z = Math.PI / 2;
        rail.position.set(0, roofBaseY + 0.12, rz);
        setupMesh(rail, 'roof');
        roofGroup.add(rail);
      });
    } else if (isHotDry || roofType.includes('double_layer')) {
      // ======================================================================
      // B. HOT-DRY / COMPOSITE: Double-Layer Ventilated Roof + Convection Cavity
      // ======================================================================
      const { map: tileMap, bump: tileBump } = getTerracottaTileTexture();
      const topMat = option.roof.material_id.includes('terracotta')
        ? new THREE.MeshStandardMaterial({ map: tileMap, bumpMap: tileBump, bumpScale: 0.05, roughness: 0.7 })
        : new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.15 });

      // Bottom Ceiling Soffit Plate resting securely on beams
      const btmPlateGeo = new THREE.BoxGeometry(roofL * 0.96, 0.05, roofW * 0.96);
      const btmMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
      const btmPlate = new THREE.Mesh(btmPlateGeo, btmMat);
      btmPlate.position.set(0, roofBaseY + 0.025, 0);
      setupMesh(btmPlate, 'roof');
      roofGroup.add(btmPlate);

      // Convection cavity steel standoff spacers sitting exactly over column nodes
      const spacerGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8);
      colXs.forEach(sx => {
        colZs.forEach(sz => {
          const sp = new THREE.Mesh(spacerGeo, colMat);
          sp.position.set(sx, roofBaseY + 0.125, sz);
          setupMesh(sp, 'roof_cavity');
          roofGroup.add(sp);
        });
      });

      // Top Solar Shielding Plate resting atop spacers with 150mm gap
      const topPlateGeo = new THREE.BoxGeometry(roofL, 0.06, roofW);
      const topPlate = new THREE.Mesh(topPlateGeo, topMat);
      topPlate.position.set(0, roofBaseY + 0.23, 0);
      setupMesh(topPlate, 'roof');
      roofGroup.add(topPlate);
    } else if (isHotHumid || roofType.includes('curved') || option.components_3d.some(c => c.id === 'roof_monitor')) {
      // ======================================================================
      // C. HOT-HUMID: Vaulted Aerodynamic Roof + Ridge Monitor Stack Chimney
      // ======================================================================
      const halfW = roofW / 2;
      const arcRise = 0.55;
      const arcShape = new THREE.Shape();
      arcShape.moveTo(-halfW, 0);
      arcShape.quadraticCurveTo(0, arcRise, halfW, 0);
      arcShape.lineTo(halfW, 0.06);
      arcShape.quadraticCurveTo(0, arcRise + 0.06, -halfW, 0.06);
      arcShape.closePath();

      const curvedGeo = new THREE.ExtrudeGeometry(arcShape, { depth: roofL, bevelEnabled: false });
      const curvedMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.65 });
      const curvedMesh = new THREE.Mesh(curvedGeo, curvedMat);
      curvedMesh.rotation.y = Math.PI / 2;
      curvedMesh.position.set(-roofL / 2, roofBaseY, 0);
      setupMesh(curvedMesh, 'roof');
      roofGroup.add(curvedMesh);

      // Arched structural truss ribs over every column line connecting beams to vault
      const archTrussMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
      colXs.forEach(cx => {
        const postGeo = new THREE.CylinderGeometry(0.03, 0.03, arcRise * 0.85, 8);
        const post = new THREE.Mesh(postGeo, archTrussMat);
        post.position.set(cx, roofBaseY + arcRise * 0.42, 0);
        setupMesh(post, 'columns');
        roofGroup.add(post);
      });

      // Central Aerodynamic Ridge Monitor Stack Chimney
      const monitorGeo = new THREE.BoxGeometry(roofL * 0.80, 0.30, 0.65);
      const monitorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.5 });
      const monitorMesh = new THREE.Mesh(monitorGeo, monitorMat);
      monitorMesh.position.set(0, roofBaseY + arcRise + 0.15, 0);
      setupMesh(monitorMesh, 'roof_monitor');
      roofGroup.add(monitorMesh);

      const capGeo = new THREE.BoxGeometry(roofL * 0.82, 0.04, 0.80);
      const capMesh = new THREE.Mesh(capGeo, curvedMat);
      capMesh.position.set(0, roofBaseY + arcRise + 0.32, 0);
      setupMesh(capMesh, 'roof_monitor');
      roofGroup.add(capMesh);
    } else {
      // ======================================================================
      // D. ECONOMY / MONO-SLOPE: Front-to-Rear Water Shedding Pitch
      // ======================================================================
      // Single slope: slopes from front (high) to rear (low) along Z axis
      const pitchRise = 0.28;
      const pitchAngle = Math.atan2(pitchRise, W);

      // Structural inclined rafters over each column pair
      const rafterGeo = new THREE.BoxGeometry(0.08, 0.10, W + overhang);
      const rafterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
      colXs.forEach(cx => {
        const rafter = new THREE.Mesh(rafterGeo, rafterMat);
        rafter.position.set(cx, roofBaseY + pitchRise / 2, 0);
        rafter.rotation.x = pitchAngle;
        setupMesh(rafter, 'columns');
        roofGroup.add(rafter);
      });

      // Roof deck sitting flush on rafters
      const roofGeo = new THREE.BoxGeometry(roofL, 0.06, roofW);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.6 });
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.set(0, roofBaseY + pitchRise / 2 + 0.08, 0);
      roofMesh.rotation.x = pitchAngle;
      setupMesh(roofMesh, 'roof');
      roofGroup.add(roofMesh);
    }

    // ------------------------------------------------------------------------
    // 5. ERGONOMIC SEATING BENCHES (Dynamically scaled to capacity and purpose)
    // ------------------------------------------------------------------------
    const seatingStyle = option.seating_style || 'standard_linear';
    const isStoneSeat = option.main_materials.seating.toLowerCase().includes('stone');
    const { map: woodSeatMap, bump: woodSeatBump } = getWoodPlankTexture('#92400e');
    const seatWoodMat = new THREE.MeshStandardMaterial({
      map: woodSeatMap,
      bumpMap: woodSeatBump,
      bumpScale: 0.04,
      roughness: 0.65
    });
    const seatStoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.5, metalness: 0.1 });
    const benchMat = isStoneSeat ? seatStoneMat : seatWoodMat;

    const benchY = floorBaseY + 0.45;
    const benchZ = -W / 4;

    if (seatingStyle === 'communal_u_shape') {
      // Rural Community Shelter: U-Shaped Communal Gathering Layout
      const backBenchLen = L * 0.75;
      const backSeatGeo = new THREE.BoxGeometry(backBenchLen, 0.06, 0.45);
      const backSeat = new THREE.Mesh(backSeatGeo, benchMat);
      backSeat.position.set(0, benchY, -W / 3);
      setupMesh(backSeat, 'seating_bench');
      interiorGroup.add(backSeat);

      const sideBenchLen = W * 0.55;
      const sideSeatGeo = new THREE.BoxGeometry(0.45, 0.06, sideBenchLen);
      [-L / 3, L / 3].forEach(sx => {
        const sideSeat = new THREE.Mesh(sideSeatGeo, benchMat);
        sideSeat.position.set(sx, benchY, -W / 12);
        setupMesh(sideSeat, 'seating_bench');
        interiorGroup.add(sideSeat);
      });

      // Central communal round table / gathering focal point
      const tableGeo = new THREE.CylinderGeometry(0.60, 0.60, 0.42, 24);
      const tableMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
      const tableMesh = new THREE.Mesh(tableGeo, tableMat);
      tableMesh.position.set(0, floorBaseY + 0.21, -W / 12);
      setupMesh(tableMesh, 'seating_bench');
      interiorGroup.add(tableMesh);

      // Central Solar Lantern Fixture (hangs from roof structure)
      const lanternGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.28, 12);
      const lanternMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.6 });
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(0, floorBaseY + H - 0.4, -W / 12);
      setupMesh(lantern, 'columns');
      roofGroup.add(lantern);
    } else if (seatingStyle === 'wide_rest_couch') {
      // Worker Rest Shelter: Deep reclined rest bench (0.65m depth)
      const benchLen = Math.min(L * 0.78, 5.0);
      const couchDepth = 0.65;
      const couchGeo = new THREE.BoxGeometry(benchLen, 0.08, couchDepth);
      const couchMesh = new THREE.Mesh(couchGeo, benchMat);
      couchMesh.position.set(0, benchY, benchZ);
      setupMesh(couchMesh, 'seating_bench');
      interiorGroup.add(couchMesh);

      const couchBackGeo = new THREE.BoxGeometry(benchLen, 0.42, 0.06);
      const couchBack = new THREE.Mesh(couchBackGeo, benchMat);
      couchBack.position.set(0, benchY + 0.24, benchZ - couchDepth / 2);
      couchBack.rotation.x = 0.12;
      setupMesh(couchBack, 'seating_bench');
      interiorGroup.add(couchBack);

      const legGeo = new THREE.BoxGeometry(0.08, 0.45, couchDepth - 0.05);
      [-benchLen / 2 + 0.35, benchLen / 2 - 0.35].forEach(lx => {
        const leg = new THREE.Mesh(legGeo, colMat);
        leg.position.set(lx, floorBaseY + 0.225, benchZ);
        setupMesh(leg, 'seating_bench');
        interiorGroup.add(leg);
      });
    } else {
      // Standard Linear Benches (Multi-bench scaling for high capacity)
      const benchLen = Math.min(L * 0.75, 4.2);
      const benchSeatGeo = new THREE.BoxGeometry(benchLen, 0.06, 0.45);
      const benchSeat = new THREE.Mesh(benchSeatGeo, benchMat);
      benchSeat.position.set(0, benchY, benchZ);
      setupMesh(benchSeat, 'seating_bench');
      interiorGroup.add(benchSeat);

      const benchBackGeo = new THREE.BoxGeometry(benchLen, 0.35, 0.05);
      const benchBack = new THREE.Mesh(benchBackGeo, benchMat);
      benchBack.position.set(0, benchY + 0.22, benchZ - 0.20);
      setupMesh(benchBack, 'seating_bench');
      interiorGroup.add(benchBack);

      const legGeo = new THREE.BoxGeometry(0.06, 0.45, 0.42);
      [-benchLen / 2 + 0.3, benchLen / 2 - 0.3].forEach(lx => {
        const leg = new THREE.Mesh(legGeo, colMat);
        leg.position.set(lx, floorBaseY + 0.225, benchZ);
        setupMesh(leg, 'seating_bench');
        interiorGroup.add(leg);
      });
    }

    // ------------------------------------------------------------------------
    // 6. FACILITY & PURPOSE FIXTURES
    // ------------------------------------------------------------------------

    // A. Passenger Transit Route & Schedule Board
    if (option.components_3d.some(c => c.id === 'transit_display')) {
      const boardTex = getTransitBoardTexture();
      const boardMat = new THREE.MeshBasicMaterial({ map: boardTex });
      const boardGeo = new THREE.PlaneGeometry(1.6, 1.0);
      const boardMesh = new THREE.Mesh(boardGeo, boardMat);
      boardMesh.position.set(-L * 0.25, floorBaseY + 1.4, -W / 2 + 0.08);
      setupMesh(boardMesh, 'transit_display');
      wallBackGroup.add(boardMesh);

      const boardBackGeo = new THREE.BoxGeometry(1.64, 1.04, 0.04);
      const boardBackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
      const boardBack = new THREE.Mesh(boardBackGeo, boardBackMat);
      boardBack.position.set(-L * 0.25, floorBaseY + 1.4, -W / 2 + 0.06);
      setupMesh(boardBack, 'transit_display');
      wallBackGroup.add(boardBack);
    }

    // B. Worker Hydration Alcove / Clay Pot (Matka)
    if (option.components_3d.some(c => c.id === 'hydration_station')) {
      const potGeo = new THREE.SphereGeometry(0.24, 18, 18);
      const potMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.9 });
      const potMesh = new THREE.Mesh(potGeo, potMat);
      potMesh.position.set(L / 2 - 0.6, floorBaseY + 0.68, -W / 4);
      setupMesh(potMesh, 'hydration_station');
      interiorGroup.add(potMesh);

      const potLidGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16);
      const potLidMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.8 });
      const potLid = new THREE.Mesh(potLidGeo, potLidMat);
      potLid.position.set(L / 2 - 0.6, floorBaseY + 0.90, -W / 4);
      setupMesh(potLid, 'hydration_station');
      interiorGroup.add(potLid);

      const tableGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.45, 16);
      const tableMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
      const tableMesh = new THREE.Mesh(tableGeo, tableMat);
      tableMesh.position.set(L / 2 - 0.6, floorBaseY + 0.225, -W / 4);
      setupMesh(tableMesh, 'hydration_station');
      interiorGroup.add(tableMesh);
    }

    // C. Rural Community Bulletin Board
    if (option.components_3d.some(c => c.id === 'community_board')) {
      const comTex = getCommunityBoardTexture();
      const comMat = new THREE.MeshBasicMaterial({ map: comTex });
      const comGeo = new THREE.PlaneGeometry(1.6, 1.0);
      const comMesh = new THREE.Mesh(comGeo, comMat);
      comMesh.position.set(-L * 0.25, floorBaseY + 1.4, -W / 2 + 0.08);
      setupMesh(comMesh, 'community_board');
      wallBackGroup.add(comMesh);

      const comBackGeo = new THREE.BoxGeometry(1.66, 1.06, 0.04);
      const comBackMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
      const comBack = new THREE.Mesh(comBackGeo, comBackMat);
      comBack.position.set(-L * 0.25, floorBaseY + 1.4, -W / 2 + 0.06);
      setupMesh(comBack, 'community_board');
      wallBackGroup.add(comBack);
    }

    // D. Emergency Supply & First-Aid Chest
    if (option.components_3d.some(c => c.id === 'emergency_kit')) {
      const lockerTex = getEmergencyLockerTexture();
      const lockerMat = new THREE.MeshStandardMaterial({ map: lockerTex, roughness: 0.3, metalness: 0.2 });
      const lockerGeo = new THREE.BoxGeometry(0.8, 0.55, 0.45);
      const lockerMesh = new THREE.Mesh(lockerGeo, lockerMat);
      lockerMesh.position.set(L / 2 - 0.6, floorBaseY + 0.28, -W / 4);
      setupMesh(lockerMesh, 'emergency_kit');
      interiorGroup.add(lockerMesh);

      const handleGeo = new THREE.BoxGeometry(0.12, 0.03, 0.04);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.set(L / 2 - 0.6, floorBaseY + 0.35, -W / 4 + 0.24);
      setupMesh(handle, 'emergency_kit');
      interiorGroup.add(handle);
    }

    // E. Tourist Map & Wayfinding Kiosk
    if (option.components_3d.some(c => c.id === 'tourist_kiosk')) {
      const tourTex = getTouristMapTexture();
      const tourMat = new THREE.MeshBasicMaterial({ map: tourTex });
      const tourGeo = new THREE.PlaneGeometry(1.5, 0.95);
      const tourMesh = new THREE.Mesh(tourGeo, tourMat);
      tourMesh.position.set(-L * 0.25, floorBaseY + 1.4, -W / 2 + 0.08);
      setupMesh(tourMesh, 'tourist_kiosk');
      wallBackGroup.add(tourMesh);

      const frameGeo = new THREE.BoxGeometry(1.56, 1.01, 0.05);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.4 });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.set(-L * 0.25, floorBaseY + 1.4, -W / 2 + 0.06);
      setupMesh(frame, 'tourist_kiosk');
      wallBackGroup.add(frame);
    }

    // F. Rooftop Solar PV Canopy (Option A)
    if (option.components_3d.some(c => c.id === 'solar_pv')) {
      const pvGeo = new THREE.BoxGeometry(2.4, 0.04, 1.2);
      const pvMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.15, metalness: 0.85 });
      const pvMesh = new THREE.Mesh(pvGeo, pvMat);
      pvMesh.position.set(0, roofBaseY + 0.32, 0);
      setupMesh(pvMesh, 'solar_pv');
      roofGroup.add(pvMesh);

      const bracketGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.18, 8);
      [-0.9, 0.9].forEach(bx => {
        [-0.4, 0.4].forEach(bz => {
          const br = new THREE.Mesh(bracketGeo, colMat);
          br.position.set(bx, roofBaseY + 0.21, bz);
          setupMesh(br, 'solar_pv');
          roofGroup.add(br);
        });
      });
    }

    // G. Rainwater Gutter & Downspout System
    if (option.components_3d.some(c => c.id === 'drainage_gutter')) {
      const gutGeo = new THREE.BoxGeometry(roofL, 0.08, 0.08);
      const gutMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.7 });
      const gutMesh = new THREE.Mesh(gutGeo, gutMat);
      gutMesh.position.set(0, roofBaseY - 0.02, roofW / 2 + 0.02);
      setupMesh(gutMesh, 'drainage_gutter');
      roofGroup.add(gutMesh);

      const downpipeGeo = new THREE.CylinderGeometry(0.03, 0.03, H, 12);
      const downpipe = new THREE.Mesh(downpipeGeo, gutMat);
      downpipe.position.set(roofL / 2 - 0.1, floorBaseY + H / 2, roofW / 2 + 0.02);
      setupMesh(downpipe, 'drainage_gutter');
      roofGroup.add(downpipe);
    }

    scene.add(shelterGroup);
    groupRef.current = shelterGroup;

    // Automatic Camera Framing: View looking at FRONT opening
    const bbox = new THREE.Box3().setFromObject(shelterGroup);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const camDist = Math.max(maxDim * 1.55, 9.0);

    const frontRad = THREE.MathUtils.degToRad(headingDeg);
    const camAngle = frontRad + 0.42;

    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(
        center.x + camDist * Math.sin(camAngle),
        center.y + camDist * 0.48,
        center.z + camDist * Math.cos(camAngle)
      );
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  }, [option.id, climate]);

  // Handle Exploded View updates independently at 60 FPS without resetting camera
  useEffect(() => {
    const groups = explodedGroupsRef.current;
    if (!groups.roof || !groups.floor) return;

    // 1. Roof envelope lifts cleanly upwards (+Y)
    groups.roof.position.y = explodedFactor * 2.8;

    // 2. Foundation plinth & steps sink cleanly downwards (-Y)
    groups.floor.position.y = -explodedFactor * 1.5;

    // 3. Walls & screens translate outward along their respective face normals
    if (groups.wallBack) groups.wallBack.position.z = -explodedFactor * 1.8;
    if (groups.wallFront) groups.wallFront.position.z = explodedFactor * 1.8;
    if (groups.wallWest) groups.wallWest.position.x = -explodedFactor * 1.8;
    if (groups.wallEast) groups.wallEast.position.x = explodedFactor * 1.8;

    // 4. Interior furniture separates slightly downward to stay readable
    if (groups.interior) groups.interior.position.y = -explodedFactor * 0.4;
  }, [explodedFactor]);

  // ==========================================================================
  // 3. ACTIVE COMPONENT INTERACTIVE HIGHLIGHTING
  // ==========================================================================
  useEffect(() => {
    if (!groupRef.current) return;
    const activeId = activeComponent?.id;

    groupRef.current.traverse((child) => {
      if ((child as any).isMesh) {
        const mesh = child as THREE.Mesh;
        const comp = mesh.userData?.component as Component3DData | undefined;

        if (comp && comp.id === activeId) {
          if (!(mesh as any).__originalMaterial) {
            (mesh as any).__originalMaterial = mesh.material;
          }
          const orig = (mesh as any).__originalMaterial as THREE.Material;
          if ((orig as THREE.MeshStandardMaterial).emissive) {
            const highlightMat = (orig as THREE.MeshStandardMaterial).clone();
            highlightMat.emissive.setHex(0x2563eb);
            highlightMat.emissiveIntensity = 0.85;
            mesh.material = highlightMat;
          }
        } else if ((mesh as any).__originalMaterial) {
          mesh.material = (mesh as any).__originalMaterial;
        }
      }
    });
  }, [activeComponent]);

  const handleResetView = () => {
    if (cameraRef.current && controlsRef.current && groupRef.current) {
      const bbox = new THREE.Box3().setFromObject(groupRef.current);
      const center = bbox.getCenter(new THREE.Vector3());
      const size = bbox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const camDist = Math.max(maxDim * 1.55, 9.0);

      const headingDeg = option.orientation_deg || 180;
      const frontRad = THREE.MathUtils.degToRad(headingDeg);
      const camAngle = frontRad + 0.42;

      cameraRef.current.position.set(
        center.x + camDist * Math.sin(camAngle),
        center.y + camDist * 0.48,
        center.z + camDist * Math.cos(camAngle)
      );
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[460px] md:h-[520px] lg:h-[560px] bg-slate-100 rounded-xl overflow-hidden border border-slate-300 shadow-inner select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {tooltipData && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipData.x + 14}px`,
            top: `${tooltipData.y + 14}px`,
            pointerEvents: 'none',
          }}
          className="z-30 bg-slate-900/95 text-white border border-slate-700 p-3 rounded-lg shadow-xl max-w-xs text-xs animate-in fade-in duration-100"
        >
          <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase text-[10px] tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>{tooltipData.comp.name}</span>
          </div>
          <div className="text-white font-bold text-xs mb-1">
            {tooltipData.comp.material}
          </div>
          <div className="text-slate-300 text-[11px] leading-snug">
            {tooltipData.comp.thermal_role}
          </div>
          <div className="text-slate-400 text-[10px] mt-1.5 pt-1.5 border-t border-slate-800 italic">
            Tap to pin and inspect engineering specs
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-20 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 border border-slate-300 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 sm:gap-2">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-700 shrink-0"></span>
          <span className="text-xs font-bold text-slate-900 truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">{option.title}</span>
          <span className="hidden xs:inline text-[10px] sm:text-[11px] text-slate-500 font-mono">({option.orientation_deg}°)</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 bg-white/95 border border-slate-300 p-0.5 sm:p-1 rounded-lg shadow-xs text-xs">
          <button
            onClick={() => setShowAirflow(!showAirflow)}
            className={`px-2 sm:px-2.5 py-1 rounded flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer ${
              showAirflow ? 'bg-sky-100 text-sky-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Toggle animated wind streamlines"
          >
            <Wind className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Airflow</span>
          </button>

          <button
            onClick={() => setShowSolarShadows(!showSolarShadows)}
            className={`px-2 sm:px-2.5 py-1 rounded flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer ${
              showSolarShadows ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Toggle solar shadows"
          >
            <Sun className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Sun</span>
          </button>

          <button
            onClick={handleResetView}
            className="p-1 text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Reset Camera Framing to Front Entrance"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 border border-slate-300 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg shadow-xs flex items-center justify-between sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <Sliders className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 whitespace-nowrap">Exploded:</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial">
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={explodedFactor}
              onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
              className="w-full sm:w-32 accent-blue-700 h-1.5 bg-slate-200 rounded cursor-pointer"
            />
            <span className="text-[11px] sm:text-xs font-mono text-slate-600 w-7 sm:w-8 shrink-0">{Math.round(explodedFactor * 100)}%</span>
          </div>
          {explodedFactor > 0 ? (
            <button
              onClick={() => setExplodedFactor(0)}
              className="text-[10px] sm:text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors shrink-0"
              title="Reset to assembled view (0%)"
            >
              Assemble
            </button>
          ) : (
            <button
              onClick={() => setExplodedFactor(0.75)}
              className="text-[10px] sm:text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded cursor-pointer transition-colors shrink-0"
              title="Quick Explode to 75%"
            >
              Disassemble
            </button>
          )}
        </div>

        <div className="hidden sm:flex pointer-events-auto bg-slate-900/85 text-white px-3 py-1.5 rounded-lg shadow-xs text-[10px] sm:text-[11px] items-center gap-1.5 self-center">
          <Compass className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Drag to rotate • Pinch/scroll to zoom • Tap mesh to pin specs</span>
        </div>
      </div>
    </div>
  );
};
