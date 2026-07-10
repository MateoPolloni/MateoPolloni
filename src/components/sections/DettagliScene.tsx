'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type * as ThreeNS from 'three';

/* ═══════════════════════════════════════════════════════════
   HOTSPOT DEFINITIONS
═══════════════════════════════════════════════════════════ */
interface HotspotDef {
  id: string;
  worldPos: [number, number, number];
  camPos:   [number, number, number];
  camLook:  [number, number, number];
  title:    string;
  tag:      string;
  body:     string;
  accent:   string;
  glyph:    string;
  openDoor?: boolean;
}

const HOTSPOTS: HotspotDef[] = [
  {
    id: 'hood',
    worldPos: [0,    0.92,  1.5 ],
    camPos:   [0.4,  2.1,   3.8 ],
    camLook:  [0,    0.82,  1.1 ],
    title: 'Ceramic Coating',
    tag:   '9H Hardness · 5-Year Bond',
    body:  'A molecular bond that becomes part of your paint. Total resistance to UV, chemicals, and micro-scratches — with a depth of gloss no wax can approach.',
    accent: '#D8C480',
    glyph:  '◈',
  },
  {
    id: 'door',
    worldPos: [-1.05, 0.68,  0.1 ],
    camPos:   [-3.2,  1.1,   0.4 ],
    camLook:  [-0.7,  0.55,  0   ],
    title: 'Interior Detail',
    tag:   'Full Cabin · Every Surface',
    body:  'Alcantara, leather, carbon — each treated by its own protocol. Sanitised, conditioned, and UV-protected from seat to headliner. You notice it the moment the door opens.',
    accent: '#C8B8E4',
    glyph:  '◉',
    openDoor: true,
  },
  {
    id: 'wheel',
    worldPos: [0.98,  0.32,  1.45],
    camPos:   [2.5,   0.65,  2.8 ],
    camLook:  [0.8,   0.28,  1.3 ],
    title: 'Wheel & Tire',
    tag:   'Iron Fallout · Caliper Seal',
    body:  'Brake dust and iron fallout chemically dissolved. Calipers colour-sealed. Tires conditioned to a deep, rich matte — not the synthetic shine that wears off overnight.',
    accent: '#B8D4E4',
    glyph:  '◎',
  },
  {
    id: 'body',
    worldPos: [-0.1,  0.84, -1.6 ],
    camPos:   [-0.8,  1.4,  -3.9 ],
    camLook:  [0,     0.65, -1.1 ],
    title: 'Paint Correction',
    tag:   'Single to Multi-Stage',
    body:  'Swirl marks, water etch, oxidation — removed at the molecular level with machine polishing. The surface becomes what it was the day it left the factory.',
    accent: '#E8C878',
    glyph:  '✦',
  },
  {
    id: 'glass',
    worldPos: [0,     1.08,  0.65],
    camPos:   [0.6,   1.95,  2.5 ],
    camLook:  [0,     0.98,  0.45],
    title: 'Glass Treatment',
    tag:   'Hydrophobic · Anti-UV',
    body:  'Water sheets off at 50mph. UV blocked. Every pane clarity-polished before a nano-ceramic coating is applied — inside and out. Visibility redefined.',
    accent: '#C0DDE8',
    glyph:  '◇',
  },
];

const DEFAULT_CAM = { px: 4.25, py: 0.95, pz: -4.5, lx: 1.8, ly: 0.5, lz: 0 };
const ease = [0.16, 1, 0.3, 1] as const;

/* ═══════════════════════════════════════════════════════════
   CONTENT PANEL
═══════════════════════════════════════════════════════════ */
function HotspotPanel({ hs, onClose }: { hs: HotspotDef | null; onClose: () => void }) {
  return (
    <AnimatePresence mode="wait">
      {hs && (
        <motion.div
          key={hs.id}
          className="absolute bottom-20 pointer-events-auto select-none"
          style={{ left: '5%', width: 'clamp(220px, 36%, 290px)', zIndex: 20 }}
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
          transition={{ duration: 0.5, ease }}
        >
          {/* Top accent line */}
          <motion.div
            className="h-px w-full origin-left mb-0"
            style={{ backgroundColor: hs.accent }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.55, ease }}
          />
          {/* Card */}
          <div
            style={{
              background: 'rgba(6, 6, 8, 0.88)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              borderLeft:   '1px solid rgba(255,255,255,0.05)',
              borderRight:  '1px solid rgba(255,255,255,0.04)',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              padding: '18px 20px 20px',
            }}
          >
            {/* Header row */}
            <div className="flex items-start justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <span style={{ color: hs.accent, fontSize: '12px', lineHeight: 1, flexShrink: 0 }}>
                  {hs.glyph}
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-cormorant, 'Cormorant', serif)",
                    fontSize: '19px',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.1,
                    color: '#F0EDE8',
                  }}
                >
                  {hs.title}
                </h3>
              </div>
              <button
                onClick={onClose}
                style={{
                  color: 'rgba(240,237,232,0.28)',
                  fontSize: '11px',
                  lineHeight: 1,
                  padding: '3px 6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(240,237,232,0.7)')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(240,237,232,0.28)')}
              >
                ✕
              </button>
            </div>

            {/* Tag */}
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '7.5px',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: hs.accent,
                opacity: 0.65,
                marginBottom: '12px',
              }}
            >
              {hs.tag}
            </p>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '12px' }} />

            {/* Body */}
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                lineHeight: 1.85,
                color: 'rgba(240,237,232,0.48)',
              }}
            >
              {hs.body}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOTSPOT BUTTON
═══════════════════════════════════════════════════════════ */
function HotspotButton({
  hs,
  active,
  btnRef,
  onClick,
}: {
  hs: HotspotDef;
  active: boolean;
  btnRef: (el: HTMLButtonElement | null) => void;
  onClick: () => void;
}) {
  return (
    <button
      ref={btnRef}
      onClick={onClick}
      aria-label={hs.title}
      style={{
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: 0,
        zIndex: 10,
        width: 28,
        height: 28,
      }}
    >
      {/* Outer ring (always visible) */}
      <span
        style={{
          position: 'absolute',
          inset: 2,
          borderRadius: '50%',
          border: `1px solid ${hs.accent}`,
          opacity: active ? 0.9 : 0.55,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      />
      {/* Animated pulse ring (only when inactive) */}
      {!active && (
        <span
          style={{
            position: 'absolute',
            inset: 2,
            borderRadius: '50%',
            border: `1px solid ${hs.accent}`,
            animation: 'hotspot-pulse 2.8s ease-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Center dot */}
      <span
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: active ? 8 : 5,
          height: active ? 8 : 5,
          borderRadius: '50%',
          background: hs.accent,
          boxShadow: `0 0 ${active ? 14 : 6}px ${hs.accent}90`,
          transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
          pointerEvents: 'none',
        }}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN SCENE COMPONENT
═══════════════════════════════════════════════════════════ */
export default function DettagliScene({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const btnRefs    = useRef<(HTMLButtonElement | null)[]>(HOTSPOTS.map(() => null));

  // Refs shared with the RAF loop — no re-renders
  const camTgtRef  = useRef({ ...DEFAULT_CAM });
  const camCurRef  = useRef({ ...DEFAULT_CAM });
  const doorTgtRef = useRef(0);
  const doorCurRef = useRef(0);
  const doorMeshRef  = useRef<ThreeNS.Object3D | null>(null);
  const paralaxRef   = useRef(true);
  const activeIdRef  = useRef<string | null>(null);
  activeIdRef.current = activeId;

  /* ── Select / close ── */
  const handleSelect = useCallback((id: string) => {
    const next = activeIdRef.current === id ? null : id;
    setActiveId(next);
    if (!next) {
      camTgtRef.current  = { ...DEFAULT_CAM };
      doorTgtRef.current = 0;
      paralaxRef.current = true;
    } else {
      const hs = HOTSPOTS.find(h => h.id === next)!;
      camTgtRef.current  = { px: hs.camPos[0], py: hs.camPos[1], pz: hs.camPos[2], lx: hs.camLook[0], ly: hs.camLook[1], lz: hs.camLook[2] };
      doorTgtRef.current = hs.openDoor ? Math.PI * 0.72 : 0;
      paralaxRef.current = false;
    }
  }, []);

  const handleClose = useCallback(() => {
    setActiveId(null);
    camTgtRef.current  = { ...DEFAULT_CAM };
    doorTgtRef.current = 0;
    paralaxRef.current = true;
  }, []);

  /* ── Three.js effect ── */
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    (async () => {
      const THREE = await import('three');
      if (disposed) return;

      /* ── RENDERER ─────────────────────────────────── */
      const W = el.offsetWidth, H = el.offsetHeight;
      const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.28;
      cleanups.push(() => renderer.dispose());

      /* ── SCENE ─────────────────────────────────────── */
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#ECEAE4');

      const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 80);
      camera.position.set(DEFAULT_CAM.px, DEFAULT_CAM.py, DEFAULT_CAM.pz);
      camera.lookAt(DEFAULT_CAM.lx, DEFAULT_CAM.ly, DEFAULT_CAM.lz);

      /* ── FLOOR ─────────────────────────────────────── */
      // Polished ceramic
      const floorMat = new THREE.MeshPhysicalMaterial({
        color: '#D6D4CE',
        roughness: 0.05,
        metalness: 0.0,
        clearcoat: 0.85,
        clearcoatRoughness: 0.08,
        reflectivity: 0.55,
      });
      const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.receiveShadow = true;
      scene.add(floorMesh);
      cleanups.push(() => floorMat.dispose());

      // Tile texture overlay (subtle grout lines)
      const tc = document.createElement('canvas');
      tc.width = 256; tc.height = 256;
      const tCtx = tc.getContext('2d')!;
      tCtx.fillStyle = '#D6D4CE';
      tCtx.fillRect(0, 0, 256, 256);
      tCtx.strokeStyle = 'rgba(160,158,152,0.35)';
      tCtx.lineWidth = 1;
      for (let i = 0; i <= 256; i += 64) {
        tCtx.beginPath(); tCtx.moveTo(i, 0); tCtx.lineTo(i, 256); tCtx.stroke();
        tCtx.beginPath(); tCtx.moveTo(0, i); tCtx.lineTo(256, i); tCtx.stroke();
      }
      const tileTex = new THREE.CanvasTexture(tc);
      tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
      tileTex.repeat.set(7, 7);
      const tileMat = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.09, metalness: 0 });
      const tileMesh = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), tileMat);
      tileMesh.rotation.x = -Math.PI / 2;
      tileMesh.position.y = 0.001;
      tileMesh.receiveShadow = true;
      scene.add(tileMesh);
      cleanups.push(() => { tileTex.dispose(); tileMat.dispose(); });

      /* ── WALLS + CEILING ────────────────────────────── */
      const wallMat = new THREE.MeshStandardMaterial({ color: '#E8E6E0', roughness: 0.88 });
      const ceilMat = new THREE.MeshStandardMaterial({ color: '#F2F0EC', roughness: 0.95 });

      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(26, 12), wallMat);
      backWall.position.set(0, 5.5, -8); backWall.receiveShadow = true; scene.add(backWall);

      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 12), wallMat);
      leftWall.position.set(-8, 5.5, -2); leftWall.rotation.y = Math.PI / 2; leftWall.receiveShadow = true; scene.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 12), wallMat);
      rightWall.position.set(8, 5.5, -2); rightWall.rotation.y = -Math.PI / 2; rightWall.receiveShadow = true; scene.add(rightWall);

      const ceilingMesh = new THREE.Mesh(new THREE.PlaneGeometry(26, 20), ceilMat);
      ceilingMesh.position.set(0, 8, -1); ceilingMesh.rotation.x = Math.PI / 2; scene.add(ceilingMesh);
      cleanups.push(() => { wallMat.dispose(); ceilMat.dispose(); });

      /* ── OVERHEAD LIGHT FIXTURES ────────────────────── */
      const fixMat = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        emissive: new THREE.Color('#FFFFF4'),
        emissiveIntensity: 3.0,
        roughness: 0.08,
      });
      const fixGeo = new THREE.BoxGeometry(7.5, 0.06, 0.28);
      [0, -2.2].forEach(z => {
        const f = new THREE.Mesh(fixGeo, fixMat);
        f.position.set(-0.5, 7.7, z); scene.add(f);
      });
      cleanups.push(() => { fixMat.dispose(); fixGeo.dispose(); });

      /* ── SHELVING + PRODUCTS ─────────────────────────── */
      const shelfMat  = new THREE.MeshStandardMaterial({ color: '#ECEAE4', roughness: 0.6 });
      const bottleMat = new THREE.MeshPhysicalMaterial({ color: '#1C1C24', roughness: 0.12, metalness: 0.08, clearcoat: 0.9 });
      const labelMat  = new THREE.MeshStandardMaterial({ color: '#F0EDE8', roughness: 0.7 });

      const shelfGeo  = new THREE.BoxGeometry(0.05, 2.8, 0.38);
      const boardGeo  = new THREE.BoxGeometry(0.05, 0.04, 2.6);
      const bottleGeo = new THREE.CylinderGeometry(0.042, 0.048, 0.22, 12);
      const labelGeo  = new THREE.BoxGeometry(0.003, 0.10, 0.08);

      // Shelf unit on left wall
      const shelfX = -7.6;
      // Vertical shelf sides
      [-3.0, -0.4].forEach(z => {
        const p = new THREE.Mesh(shelfGeo, shelfMat);
        p.position.set(shelfX, 2.4, z); scene.add(p);
      });
      // Shelf boards
      [1.8, 2.8, 3.8].forEach(y => {
        const b = new THREE.Mesh(boardGeo, shelfMat);
        b.position.set(shelfX, y, -1.7); scene.add(b);
      });
      // Bottle rows
      [1.95, 2.95, 3.95].forEach(y => {
        [-2.8, -2.4, -2.0, -1.6, -1.2, -0.8].forEach(z => {
          const bottle = new THREE.Mesh(bottleGeo, bottleMat);
          bottle.position.set(shelfX - 0.03, y, z); scene.add(bottle);
          const label = new THREE.Mesh(labelGeo, labelMat);
          label.position.set(shelfX + 0.045, y, z); scene.add(label);
        });
      });
      cleanups.push(() => {
        shelfMat.dispose(); bottleMat.dispose(); labelMat.dispose();
        shelfGeo.dispose(); boardGeo.dispose(); bottleGeo.dispose(); labelGeo.dispose();
      });

      /* ── LIGHTING ────────────────────────────────────── */
      scene.add(new THREE.AmbientLight('#EEE8E0', 0.20));

      // Shadow caster (angled, slightly off-center)
      const shadowSpot = new THREE.SpotLight('#FFF8F0', 1.1, 24, 0.44, 0.75);
      shadowSpot.position.set(-2, 7.5, 2.5);
      shadowSpot.castShadow = true;
      shadowSpot.shadow.mapSize.set(2048, 2048);
      shadowSpot.shadow.bias   = -0.00015;
      shadowSpot.shadow.radius = 4.5;
      scene.add(shadowSpot, shadowSpot.target);

      // RectAreaLights — loaded async
      const { RectAreaLightUniformsLib } = await import('three/examples/jsm/lights/RectAreaLightUniformsLib.js');
      if (disposed) return;
      RectAreaLightUniformsLib.init();

      // Primary overhead softbox
      const keyBox = new THREE.RectAreaLight('#FFF8F0', 4.2, 11, 2.8);
      keyBox.position.set(-0.5, 7.2, -0.8); keyBox.lookAt(0, 0, 0); scene.add(keyBox);

      // Front fill box (slightly warmer)
      const frontBox = new THREE.RectAreaLight('#FFF4EC', 2.2, 7, 2.0);
      frontBox.position.set(0, 5.5, 4.5); frontBox.lookAt(0, 0.3, 0); scene.add(frontBox);

      // Left wall bounce (warm white)
      const leftStrip = new THREE.RectAreaLight('#F8F4EE', 1.6, 1.0, 6);
      leftStrip.position.set(-7.5, 3.2, 0); leftStrip.lookAt(0, 0.8, 0); scene.add(leftStrip);

      // Right accent (slightly cool — adds tonal depth to the dark paint)
      const rightStrip = new THREE.RectAreaLight('#ECF0FF', 1.2, 0.7, 4.5);
      rightStrip.position.set(7.5, 2.8, -1.5); rightStrip.lookAt(0, 0.8, 0); scene.add(rightStrip);

      // Rim light from rear — separates car silhouette from back wall
      const rimSpot = new THREE.SpotLight('#FFFFFF', 0.65, 22, 0.5, 0.72);
      rimSpot.position.set(0, 4.5, -7);
      rimSpot.target.position.set(0, 0.5, 0);
      rimSpot.castShadow = false; scene.add(rimSpot, rimSpot.target);

      /* ── ENVIRONMENT MAP ─────────────────────────────── */
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed) return;
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.015).texture;
      pmrem.dispose();

      /* ── PRE-ALLOCATE 3D VECTORS FOR HOTSPOT PROJECTION ─ */
      const hsWorld    = HOTSPOTS.map(hs => new THREE.Vector3(...hs.worldPos));
      const hsProjected = HOTSPOTS.map(() => new THREE.Vector3());

      /* ── RAF STATE ───────────────────────────────────── */
      let composer: ReturnType<typeof setTimeout> | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let composerObj: any = null;
      let bt = 0, raf: number;

      const camCur = camCurRef.current;
      const lp = (a: number, b: number, t: number) => a + (b - a) * t;
      const K  = 0.038;

      /* ── RAF LOOP ────────────────────────────────────── */
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (document.hidden || disposed) return;
        bt += 0.016;

        // Camera lerp
        const ct = camTgtRef.current;
        camCur.px = lp(camCur.px, ct.px, K);
        camCur.py = lp(camCur.py, ct.py, K);
        camCur.pz = lp(camCur.pz, ct.pz, K);
        camCur.lx = lp(camCur.lx, ct.lx, K);
        camCur.ly = lp(camCur.ly, ct.ly, K);
        camCur.lz = lp(camCur.lz, ct.lz, K);

        // Parallax + breathe (reduced when zoomed into hotspot)
        const pF = paralaxRef.current ? 1.0 : 0.1;
        const bF = paralaxRef.current ? 1.0 : 0.25;
        const mx = mouseRef.current.x - 0.5;
        const my = mouseRef.current.y - 0.5;

        camera.position.set(
          camCur.px + mx * 0.22 * pF + Math.sin(bt * 0.35) * 0.07 * bF,
          camCur.py + my * -0.05 * pF + Math.sin(bt * 0.22) * 0.025 * bF,
          camCur.pz,
        );
        camera.lookAt(camCur.lx, camCur.ly, camCur.lz);

        // Door animation
        doorCurRef.current = lp(doorCurRef.current, doorTgtRef.current, K * 0.8);
        if (doorMeshRef.current) {
          doorMeshRef.current.rotation.y = doorCurRef.current;
        }

        // Project hotspot world positions → 2D screen
        const W2 = el.offsetWidth, H2 = el.offsetHeight;
        HOTSPOTS.forEach((_hs, i) => {
          const btn = btnRefs.current[i];
          if (!btn) return;
          hsProjected[i].copy(hsWorld[i]).project(camera);
          if (hsProjected[i].z >= 1) { btn.style.opacity = '0'; btn.style.pointerEvents = 'none'; return; }
          btn.style.opacity = '1'; btn.style.pointerEvents = 'auto';
          btn.style.left = `${(hsProjected[i].x * 0.5 + 0.5) * W2}px`;
          btn.style.top  = `${(hsProjected[i].y * -0.5 + 0.5) * H2}px`;
        });

        composerObj ? composerObj.render() : renderer.render(scene, camera);
      };
      loop();
      cleanups.push(() => cancelAnimationFrame(raf));

      /* ── RESIZE ──────────────────────────────────────── */
      const ro = new ResizeObserver(() => {
        if (disposed) return;
        const w = el.offsetWidth, h = el.offsetHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
        if (composerObj) composerObj.setSize(w, h);
      });
      ro.observe(el); cleanups.push(() => ro.disconnect());

      /* ── LOAD CAR ────────────────────────────────────── */
      try {
        const [
          { GLTFLoader },
          { DRACOLoader },
          { EffectComposer: EC },
          { RenderPass: RP },
          { UnrealBloomPass: UBP },
          { SMAAPass: SP },
          { OutputPass: OP },
        ] = await Promise.all([
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/loaders/DRACOLoader.js'),
          import('three/examples/jsm/postprocessing/EffectComposer.js'),
          import('three/examples/jsm/postprocessing/RenderPass.js'),
          import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
          import('three/examples/jsm/postprocessing/SMAAPass.js'),
          import('three/examples/jsm/postprocessing/OutputPass.js'),
        ]);
        if (disposed) return;

        const draco = new DRACOLoader();
        draco.setDecoderPath('/draco/');
        draco.preload();
        const loader = new GLTFLoader();
        loader.setDRACOLoader(draco);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gltf: any = await new Promise((resolve, reject) =>
          loader.load('/models/ferrari.glb', resolve, undefined, reject)
        );
        if (disposed) return;

        const model = gltf.scene as ThreeNS.Object3D;

        /* ── STUDIO MATERIALS ──────────────────────────── */
        // Deep black paint reflects the bright studio lights dramatically
        const bodyPaint = new THREE.MeshPhysicalMaterial({
          color: '#080808',
          metalness: 0.84,
          roughness: 0.10,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          envMapIntensity: 1.2,
          specularIntensity: 0.9,
          specularColor: new THREE.Color('#F0EEE8'),
        });
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: '#0A1220', roughness: 0.04, transmission: 0.88,
          transparent: true, opacity: 0.35, ior: 1.52, envMapIntensity: 0.9,
        });
        const detailMat = new THREE.MeshStandardMaterial({
          color: '#0A0A10', roughness: 0.52, metalness: 0.22,
        });
        const rimMat = new THREE.MeshPhysicalMaterial({
          color: '#141418', metalness: 0.97, roughness: 0.12, envMapIntensity: 1.4,
        });
        const tireMat = new THREE.MeshStandardMaterial({
          color: '#0C0C0C', roughness: 0.93,
        });
        const tailMat = new THREE.MeshPhysicalMaterial({
          color: '#2a0000', emissive: new THREE.Color('#ff1800'), emissiveIntensity: 2.5,
          roughness: 0.06, transparent: true, opacity: 0.90,
        });
        const headMat = new THREE.MeshPhysicalMaterial({
          color: '#080c10', emissive: new THREE.Color('#88B0FF'), emissiveIntensity: 0.7, roughness: 0.05,
        });

        // Find door mesh for animation
        model.traverse((child: ThreeNS.Object3D) => {
          const mesh = child as ThreeNS.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true; mesh.receiveShadow = true;
          const n = mesh.name.toLowerCase();

          if (n.includes('glass') || n.includes('window') || (mesh.material as ThreeNS.Material & { transparent?: boolean })?.transparent) {
            mesh.material = glassMat;
          } else if (n.includes('tire') || n.includes('tyre')) {
            mesh.material = tireMat;
          } else if (n.includes('rim') || n.includes('wheel')) {
            mesh.material = rimMat;
          } else if (n.includes('interior') || n.includes('seat') || n.includes('steer') || n.includes('dash')) {
            mesh.material = detailMat;
          } else if ((n.includes('light') || n.includes('lamp')) && (n.includes('tail') || n.includes('_b') || n.includes('rear') || n.includes('back'))) {
            mesh.material = tailMat;
          } else if (n.includes('head') || (n.includes('light') && (n.includes('_f') || n.includes('front')))) {
            mesh.material = headMat;
          } else {
            mesh.material = bodyPaint;
          }

          // Capture door for animation — prefer "door" + ("l" or "left")
          if (!doorMeshRef.current && n.includes('door') &&
              (n.includes('_l') || n.includes('.l') || n.includes('left') || n.includes('driver'))) {
            doorMeshRef.current = mesh;
          }
        });

        // Fallback: any mesh with "door" in its name
        if (!doorMeshRef.current) {
          model.traverse((child: ThreeNS.Object3D) => {
            if (doorMeshRef.current) return;
            if (child.name.toLowerCase().includes('door')) doorMeshRef.current = child;
          });
        }

        model.position.set(0, 0.08, 0);
        scene.add(model);
        draco.dispose();

        /* ── POST-PROCESSING ──────────────────────────── */
        if (!disposed) {
          const cw = el.offsetWidth, ch = el.offsetHeight;
          const msaaTarget = new THREE.WebGLRenderTarget(cw, ch, {
            samples: 8, type: THREE.HalfFloatType,
          });
          const comp = new EC(renderer, msaaTarget);
          comp.addPass(new RP(scene, camera));
          // Very subtle bloom — adds a slight halo to the overhead fixtures and tail lights
          comp.addPass(new UBP(new THREE.Vector2(cw, ch), 0.06, 0.55, 0.85));
          comp.addPass(new SP());
          comp.addPass(new OP());
          composerObj = comp;
          void composer;
        }
      } catch (err) {
        console.error('DettagliScene car load failed:', err);
      }
    })();

    return () => { disposed = true; cleanups.forEach(fn => fn()); };
  }, [mouseRef]);

  const activeHotspot = HOTSPOTS.find(h => h.id === activeId) ?? null;

  return (
    <div className="absolute inset-0">
      {/* Three.js canvas — pointer events off; hotspot buttons intercept clicks */}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none', pointerEvents: 'none' }}
      />

      {/* Hotspot markers — positioned imperatively in RAF loop */}
      {HOTSPOTS.map((hs, i) => (
        <HotspotButton
          key={hs.id}
          hs={hs}
          active={activeId === hs.id}
          btnRef={el => { btnRefs.current[i] = el; }}
          onClick={() => handleSelect(hs.id)}
        />
      ))}

      {/* Service detail panel */}
      <HotspotPanel hs={activeHotspot} onClose={handleClose} />

      {/* Pulse ring animation */}
      <style>{`
        @keyframes hotspot-pulse {
          0%   { transform: scale(1);   opacity: 0.65; }
          75%  { transform: scale(2.6); opacity: 0; }
          100% { transform: scale(2.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
