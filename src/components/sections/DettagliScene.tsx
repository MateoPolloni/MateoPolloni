'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type * as ThreeNS from 'three';

/* ═══════════════════════════════════════════════════════════
   CALLOUT DEFINITIONS
   All labels on right side (lx: 83) stacked vertically — no
   overlap with the centered headline. worldPos targets the
   visible right-side of the car given DEFAULT_CAM angle.
═══════════════════════════════════════════════════════════ */
interface CalloutDef {
  id:       string;
  worldPos: [number, number, number];
  camPos:   [number, number, number];
  camLook:  [number, number, number];
  lx: number; ly: number;   // label position as % of full container
  title: string;
  tag:   string;
  body:  string;
  accent: string;
  openDoor?: boolean;
}

const CALLOUTS: CalloutDef[] = [
  {
    id: 'hood',
    worldPos: [ 0.6,  0.92,  1.4 ],
    camPos:   [ 1.2,  2.2,   3.6 ],
    camLook:  [ 0.4,  0.82,  1.0 ],
    lx: 83, ly: 16,
    title: 'Ceramic Coating',
    tag:   '9H Hardness · 5-Year Bond',
    body:  'A molecular bond that becomes part of your paint. Total resistance to UV, chemicals, and micro-scratches — with a depth of gloss no wax can approach.',
    accent: '#C8A44A',
  },
  {
    id: 'glass',
    worldPos: [ 0.6,  1.06,  0.7 ],
    camPos:   [ 1.0,  1.95,  2.6 ],
    camLook:  [ 0.3,  0.96,  0.5 ],
    lx: 83, ly: 30,
    title: 'Glass Treatment',
    tag:   'Hydrophobic · Anti-UV Nano',
    body:  'Water sheets off at 50 mph. UV fully blocked. Every pane clarity-polished before nano-ceramic is applied — inside and out. Visibility redefined.',
    accent: '#6EA4BC',
  },
  {
    id: 'interior',
    worldPos: [ 0.0,  0.80,  0.2 ],
    camPos:   [ 0.6,  3.4,  -0.1 ],
    camLook:  [ 0.0,  0.52,  0.0 ],
    lx: 83, ly: 44,
    title: 'Interior Detail',
    tag:   'Full Cabin · Every Surface',
    body:  'Alcantara, leather, carbon — each treated by its own protocol. Sanitised, conditioned, UV-protected from seat to headliner. Craftsmanship you feel before you sit.',
    accent: '#9080C0',
  },
  {
    id: 'wheel',
    worldPos: [ 1.05, 0.28,  1.4 ],
    camPos:   [ 2.8,  0.68,  2.9 ],
    camLook:  [ 0.9,  0.26,  1.3 ],
    lx: 83, ly: 58,
    title: 'Tire Dressing',
    tag:   'Iron Fallout · Caliper Seal',
    body:  'Brake dust and iron fallout chemically dissolved. Calipers colour-sealed. Tires dressed to a deep, rich matte — not the synthetic shine that wears off overnight.',
    accent: '#5C92A8',
  },
  {
    id: 'body',
    worldPos: [ 0.9,  0.76, -0.4 ],
    camPos:   [ 2.8,  1.5,  -2.4 ],
    camLook:  [ 0.4,  0.62, -0.5 ],
    lx: 83, ly: 72,
    title: 'Paint Correction',
    tag:   'Single to Multi-Stage',
    body:  'Swirl marks, water etch, oxidation — removed at the molecular level with machine polishing. The surface becomes what it was the day it left the factory.',
    accent: '#B08A38',
  },
];

// Camera sits right-front of car; all worldPos targets are on the visible right side
const DEFAULT_CAM = { px: 4.5, py: 1.05, pz: -4.2, lx: 0.8, ly: 0.52, lz: 0 };
const EASE = [0.16, 1, 0.3, 1] as const;

/* ─── Spring: ease-in/ease-out feel (no sudden snapping) ─── */
const SK = 0.052;  // stiffness — how quickly velocity builds
const SD = 0.76;   // damping — how quickly it settles
function sp(val: number, vel: number, tgt: number): [number, number] {
  const nv = (vel + (tgt - val) * SK) * SD;
  return [val + nv, nv];
}

/* ═══════════════════════════════════════════════════════════
   INFO PANEL — dark frosted glass, slides in from bottom
═══════════════════════════════════════════════════════════ */
function InfoPanel({ c, onClose }: { c: CalloutDef | null; onClose: () => void }) {
  return (
    <AnimatePresence mode="wait">
      {c && (
        <motion.div
          key={c.id}
          className="absolute pointer-events-auto"
          style={{ bottom: 56, left: '50%', transform: 'translateX(-50%)', width: 'clamp(230px, 36%, 300px)', zIndex: 22 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.52, ease: EASE }}
        >
          <motion.div
            style={{ height: 1, background: c.accent, transformOrigin: 'left' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.44, ease: EASE }}
          />
          <div style={{
            background: 'rgba(8, 7, 6, 0.88)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderTop: 'none',
            padding: '16px 18px 20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{
                fontFamily: "var(--font-cormorant, 'Cormorant', serif)",
                fontSize: 21,
                fontWeight: 400,
                letterSpacing: '0.01em',
                color: '#EDE8E0',
                lineHeight: 1,
              }}>
                {c.title}
              </h3>
              <button
                onClick={onClose}
                style={{ color: 'rgba(220,215,205,0.3)', fontSize: 10, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', lineHeight: 1, flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(220,215,205,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(220,215,205,0.3)')}
              >
                ✕
              </button>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 12 }} />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: 1.92, color: 'rgba(220,215,205,0.44)' }}>
              {c.body}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN SCENE
═══════════════════════════════════════════════════════════ */
export default function DettagliScene({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady]       = useState(false);

  // SVG updated imperatively each frame — zero React re-renders per frame
  const pathRefs = useRef<(SVGPathElement | null)[]>(CALLOUTS.map(() => null));
  const dotRefs  = useRef<(SVGCircleElement | null)[]>(CALLOUTS.map(() => null));

  // Camera spring
  const camCurRef = useRef({ ...DEFAULT_CAM });
  const camVelRef = useRef({ px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0 });
  const camTgtRef = useRef({ ...DEFAULT_CAM });

  // Door spring (unused for convertible interior, kept for compat)
  const doorCurRef  = useRef(0);
  const doorVelRef  = useRef(0);
  const doorTgtRef  = useRef(0);
  const doorMeshRef = useRef<ThreeNS.Object3D | null>(null);

  const paralaxRef  = useRef(true);
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  const handleSelect = useCallback((id: string) => {
    const next = activeIdRef.current === id ? null : id;
    setActiveId(next);
    if (!next) {
      camTgtRef.current  = { ...DEFAULT_CAM };
      doorTgtRef.current = 0;
      paralaxRef.current = true;
    } else {
      const c = CALLOUTS.find(h => h.id === next)!;
      camTgtRef.current  = { px: c.camPos[0], py: c.camPos[1], pz: c.camPos[2], lx: c.camLook[0], ly: c.camLook[1], lz: c.camLook[2] };
      doorTgtRef.current = c.openDoor ? Math.PI * 0.65 : 0;
      paralaxRef.current = false;
    }
  }, []);

  const handleClose = useCallback(() => {
    setActiveId(null);
    camTgtRef.current  = { ...DEFAULT_CAM };
    doorTgtRef.current = 0;
    paralaxRef.current = true;
  }, []);

  /* ── Three.js scene ──────────────────────────────────── */
  useEffect(() => {
    const el        = canvasRef.current;
    const container = containerRef.current;
    if (!el || !container) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    (async () => {
      const THREE = await import('three');
      if (disposed) return;

      /* ── RENDERER ──────────────────────────────────────── */
      const W = el.offsetWidth, H = el.offsetHeight;
      const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.92;
      cleanups.push(() => renderer.dispose());

      /* ── SCENE ─────────────────────────────────────────── */
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#141210');
      // Atmospheric fog — environment recedes into darkness, car is the focus
      scene.fog = new THREE.Fog('#141210', 9, 22);

      const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 80);
      camera.position.set(DEFAULT_CAM.px, DEFAULT_CAM.py, DEFAULT_CAM.pz);
      camera.lookAt(DEFAULT_CAM.lx, DEFAULT_CAM.ly, DEFAULT_CAM.lz);

      /* ── POLISHED CERAMIC FLOOR ────────────────────────── */
      // High clearcoat = crisp reflections of lights and car undercarriage
      const floorMat = new THREE.MeshPhysicalMaterial({
        color: '#C4C0B8',
        roughness: 0.04,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        reflectivity: 0.72,
        envMapIntensity: 0.6,
      });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);
      cleanups.push(() => floorMat.dispose());

      // Subtle tile grid baked into a CanvasTexture
      const tc = document.createElement('canvas'); tc.width = 512; tc.height = 512;
      const tx = tc.getContext('2d')!;
      tx.fillStyle = '#C4C0B8'; tx.fillRect(0, 0, 512, 512);
      tx.strokeStyle = 'rgba(120,118,112,0.18)'; tx.lineWidth = 0.6;
      for (let i = 0; i <= 512; i += 64) {
        tx.beginPath(); tx.moveTo(i, 0); tx.lineTo(i, 512); tx.stroke();
        tx.beginPath(); tx.moveTo(0, i); tx.lineTo(512, i); tx.stroke();
      }
      const tileTex = new THREE.CanvasTexture(tc);
      tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
      tileTex.repeat.set(7, 7);
      const tileMat = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.08, metalness: 0 });
      const tileFloor = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), tileMat);
      tileFloor.rotation.x = -Math.PI / 2;
      tileFloor.position.y = 0.0015;
      tileFloor.receiveShadow = true;
      scene.add(tileFloor);
      cleanups.push(() => { tileTex.dispose(); tileMat.dispose(); });

      /* ── DARK STUDIO WALLS ─────────────────────────────── */
      const wallMat = new THREE.MeshStandardMaterial({ color: '#1A1816', roughness: 0.96 });
      const dadoMat = new THREE.MeshStandardMaterial({ color: '#141210', roughness: 0.98 });

      // Back wall — dado (lower dark panel) + upper wall
      const backUpper = new THREE.Mesh(new THREE.PlaneGeometry(24, 6.5), wallMat);
      backUpper.position.set(0, 6.75, -9); backUpper.receiveShadow = true; scene.add(backUpper);
      const backDado = new THREE.Mesh(new THREE.PlaneGeometry(24, 1.2), dadoMat);
      backDado.position.set(0, 0.6, -8.98); backDado.receiveShadow = true; scene.add(backDado);

      // Left wall
      const leftUpper = new THREE.Mesh(new THREE.PlaneGeometry(18, 6.5), wallMat);
      leftUpper.position.set(-8.5, 6.75, -1); leftUpper.rotation.y = Math.PI / 2; leftUpper.receiveShadow = true; scene.add(leftUpper);
      const leftDado = new THREE.Mesh(new THREE.PlaneGeometry(18, 1.2), dadoMat);
      leftDado.position.set(-8.48, 0.6, -1); leftDado.rotation.y = Math.PI / 2; leftDado.receiveShadow = true; scene.add(leftDado);

      // Right wall (behind camera, subtle)
      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), wallMat);
      rightWall.position.set(8.5, 4, -1); rightWall.rotation.y = -Math.PI / 2; scene.add(rightWall);

      cleanups.push(() => { wallMat.dispose(); dadoMat.dispose(); });

      /* ── CEILING ──────────────────────────────────────── */
      const ceilMat = new THREE.MeshStandardMaterial({ color: '#0E0C0A', roughness: 0.98 });
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(24, 20), ceilMat);
      ceil.position.set(0, 8, -1); ceil.rotation.x = Math.PI / 2; scene.add(ceil);
      cleanups.push(() => ceilMat.dispose());

      /* ── OVERHEAD LIGHTING TRACKS ─────────────────────── */
      // Physical track fixture — two thin aluminium rails on ceiling
      const trackMat = new THREE.MeshStandardMaterial({ color: '#2C2A28', roughness: 0.55, metalness: 0.7 });
      const trackGeo = new THREE.BoxGeometry(8.0, 0.06, 0.12);
      [0.2, -1.8].forEach(z => {
        const t = new THREE.Mesh(trackGeo, trackMat);
        t.position.set(-0.5, 7.85, z); scene.add(t);
      });
      // Spot heads (small boxes, slightly emissive)
      const headMat = new THREE.MeshStandardMaterial({ color: '#3A3836', roughness: 0.4, metalness: 0.8, emissive: new THREE.Color('#FFF8E8'), emissiveIntensity: 0.12 });
      const headGeo = new THREE.BoxGeometry(0.18, 0.22, 0.18);
      [[-2, 0.2], [0, 0.2], [2, 0.2], [-1, -1.8], [1, -1.8]].forEach(([x, z]) => {
        const h = new THREE.Mesh(headGeo, headMat);
        h.position.set(x, 7.72, z); scene.add(h);
      });
      cleanups.push(() => { trackMat.dispose(); headMat.dispose(); trackGeo.dispose(); headGeo.dispose(); });

      /* ── LED FLOOR STRIP — premium touch ─────────────── */
      const ledMat = new THREE.MeshStandardMaterial({
        color: '#FFFFF0',
        emissive: new THREE.Color('#FFFFF0'),
        emissiveIntensity: 0.35,
        roughness: 0.1,
      });
      const ledGeo = new THREE.BoxGeometry(0.025, 0.025, 16);
      // Thin LED strip at base of back wall and left wall
      const ledBack = new THREE.Mesh(ledGeo, ledMat);
      ledBack.rotation.y = 0; ledBack.position.set(0, 0.012, -8.92); scene.add(ledBack);
      const ledLeft = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 16), ledMat);
      ledLeft.rotation.y = Math.PI / 2; ledLeft.position.set(-8.42, 0.012, -1); scene.add(ledLeft);
      cleanups.push(() => { ledMat.dispose(); ledGeo.dispose(); });

      /* ── SHELVING UNIT (left wall, dark recessed) ─────── */
      const shelfMat  = new THREE.MeshStandardMaterial({ color: '#1E1C1A', roughness: 0.72, metalness: 0.1 });
      const bottleMat = new THREE.MeshPhysicalMaterial({ color: '#141420', roughness: 0.18, metalness: 0.04, clearcoat: 0.75, envMapIntensity: 0.5 });
      const lblMat    = new THREE.MeshStandardMaterial({ color: '#D8D4CC', roughness: 0.78 });

      const postGeo   = new THREE.BoxGeometry(0.06, 2.8, 0.36);
      const boardGeo  = new THREE.BoxGeometry(0.06, 0.05, 2.4);
      const bottleGeo = new THREE.CylinderGeometry(0.040, 0.046, 0.20, 10);
      const lblGeo    = new THREE.BoxGeometry(0.004, 0.088, 0.072);
      const SX = -7.4;
      [-2.9, -0.5].forEach(z => { const p = new THREE.Mesh(postGeo, shelfMat); p.position.set(SX, 2.4, z); scene.add(p); });
      [1.7, 2.6, 3.5].forEach(y => { const b = new THREE.Mesh(boardGeo, shelfMat); b.position.set(SX, y, -1.7); scene.add(b); });
      [1.85, 2.75, 3.65].forEach(y => {
        [-2.65, -2.2, -1.78, -1.36, -0.94, -0.7].forEach(z => {
          const bt = new THREE.Mesh(bottleGeo, bottleMat); bt.position.set(SX - 0.02, y, z); scene.add(bt);
          const lb = new THREE.Mesh(lblGeo, lblMat);        lb.position.set(SX + 0.05, y, z); scene.add(lb);
        });
      });
      // Back panel of shelf unit
      const backPanel = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.8), shelfMat);
      backPanel.position.set(SX, 2.4, -1.7); backPanel.rotation.y = Math.PI / 2; scene.add(backPanel);
      cleanups.push(() => { shelfMat.dispose(); bottleMat.dispose(); lblMat.dispose(); postGeo.dispose(); boardGeo.dispose(); bottleGeo.dispose(); lblGeo.dispose(); });

      /* ── LIGHTING ──────────────────────────────────────── */
      // Near-zero ambient — all light is intentional
      scene.add(new THREE.AmbientLight('#D8CCB8', 0.04));

      // Primary key: focused overhead spot, warm and controlled
      const keySpot = new THREE.SpotLight('#FFF4E8', 3.8, 18, 0.38, 0.55, 1.2);
      keySpot.position.set(-0.3, 7.5, -0.2);
      keySpot.target.position.set(0.2, 0, 0.3);
      keySpot.castShadow = true;
      keySpot.shadow.mapSize.set(2048, 2048);
      keySpot.shadow.bias   = -0.00012;
      keySpot.shadow.radius = 6;
      scene.add(keySpot, keySpot.target);

      // Secondary fill spot — from front-left, softer
      const fillSpot = new THREE.SpotLight('#FFF0E0', 1.2, 16, 0.52, 0.72, 1.4);
      fillSpot.position.set(-2.5, 6.2, 4.2);
      fillSpot.target.position.set(0.2, 0.3, 0.5);
      fillSpot.castShadow = false;
      scene.add(fillSpot, fillSpot.target);

      // Cool rim light from rear-right — separates car from dark background
      const rimSpot = new THREE.SpotLight('#D8E8FF', 0.9, 20, 0.40, 0.65, 1.2);
      rimSpot.position.set(3.5, 4.5, -8.5);
      rimSpot.target.position.set(0.5, 0.5, 0);
      scene.add(rimSpot, rimSpot.target);

      // Left under-body accent (floor-level, reflects off polished floor)
      const underSpot = new THREE.SpotLight('#FFF8F0', 0.55, 12, 0.65, 0.9, 1.6);
      underSpot.position.set(-3.0, 0.4, 1.5);
      underSpot.target.position.set(0, 0, 0.5);
      scene.add(underSpot, underSpot.target);

      // Shelf accent (barely visible but adds depth)
      const shelfSpot = new THREE.SpotLight('#FFE8C8', 0.28, 8, 0.7, 0.85);
      shelfSpot.position.set(-4.5, 5.5, -1.5);
      shelfSpot.target.position.set(-7.4, 2, -1.7);
      scene.add(shelfSpot, shelfSpot.target);

      const { RectAreaLightUniformsLib } = await import('three/examples/jsm/lights/RectAreaLightUniformsLib.js');
      if (disposed) return;
      RectAreaLightUniformsLib.init();

      // Soft overhead area light — wraps light around the car panels
      const areaKey = new THREE.RectAreaLight('#FFF6EC', 1.1, 8.0, 2.0);
      areaKey.position.set(-0.4, 7.0, -0.5); areaKey.lookAt(0, 0, 0); scene.add(areaKey);

      /* ── ENV MAP ───────────────────────────────────────── */
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed) return;
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.006).texture;
      pmrem.dispose();

      /* ── PRE-ALLOCATE HOTSPOT VECTORS ─────────────────── */
      const hsWorld     = CALLOUTS.map(c => new THREE.Vector3(...c.worldPos));
      const hsProjected = CALLOUTS.map(() => new THREE.Vector3());

      /* ── RAF LOOP ──────────────────────────────────────── */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let composerObj: any = null;
      let bt = 0, raf: number;

      const camCur = camCurRef.current;
      const camVel = camVelRef.current;
      const f = (n: number) => n.toFixed(1);

      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (document.hidden || disposed) return;
        bt += 0.016;

        // Spring camera
        const ct = camTgtRef.current;
        let r: [number, number];
        r = sp(camCur.px, camVel.px, ct.px); camCur.px = r[0]; camVel.px = r[1];
        r = sp(camCur.py, camVel.py, ct.py); camCur.py = r[0]; camVel.py = r[1];
        r = sp(camCur.pz, camVel.pz, ct.pz); camCur.pz = r[0]; camVel.pz = r[1];
        r = sp(camCur.lx, camVel.lx, ct.lx); camCur.lx = r[0]; camVel.lx = r[1];
        r = sp(camCur.ly, camVel.ly, ct.ly); camCur.ly = r[0]; camVel.ly = r[1];
        r = sp(camCur.lz, camVel.lz, ct.lz); camCur.lz = r[0]; camVel.lz = r[1];

        const pF = paralaxRef.current ? 1.0 : 0.05;
        const bF = paralaxRef.current ? 1.0 : 0.15;
        const mx = mouseRef.current.x - 0.5;
        const my = mouseRef.current.y - 0.5;
        camera.position.set(
          camCur.px + mx * 0.16 * pF + Math.sin(bt * 0.25) * 0.048 * bF,
          camCur.py + my * -0.035 * pF + Math.sin(bt * 0.17) * 0.016 * bF,
          camCur.pz,
        );
        camera.lookAt(camCur.lx, camCur.ly, camCur.lz);

        // Door spring (kept for compatibility)
        r = sp(doorCurRef.current, doorVelRef.current, doorTgtRef.current);
        doorCurRef.current = r[0]; doorVelRef.current = r[1];
        if (doorMeshRef.current) doorMeshRef.current.rotation.y = doorCurRef.current;

        // Project hotspots → screen; update SVG bezier paths imperatively
        const CW = container.offsetWidth, CH = container.offsetHeight;

        CALLOUTS.forEach((c, i) => {
          hsProjected[i].copy(hsWorld[i]).project(camera);
          const behind = hsProjected[i].z >= 1;
          const px = (hsProjected[i].x *  0.5 + 0.5) * CW;
          const py = (hsProjected[i].y * -0.5 + 0.5) * CH;

          // Label dot pixel position: button left edge at calc(lx% - 68px), dot ~4px in
          const lxPx = (c.lx / 100) * CW - 64;
          const lyPx = (c.ly / 100) * CH;

          // Cubic bezier: from car → smooth curve → label dot
          // CP1 moves right at car height, CP2 arrives at label height from left
          const cp1x = px + (lxPx - px) * 0.72;
          const cp2x = lxPx - 42;
          const d = `M ${f(px)} ${f(py)} C ${f(cp1x)} ${f(py)} ${f(cp2x)} ${f(lyPx)} ${f(lxPx)} ${f(lyPx)}`;

          const path = pathRefs.current[i];
          if (path) { path.setAttribute('d', d); path.style.opacity = behind ? '0' : '1'; }

          const dot = dotRefs.current[i];
          if (dot) { dot.setAttribute('cx', f(px)); dot.setAttribute('cy', f(py)); dot.style.opacity = behind ? '0' : '1'; }
        });

        composerObj ? composerObj.render() : renderer.render(scene, camera);
      };
      loop();
      cleanups.push(() => cancelAnimationFrame(raf));

      /* ── RESIZE ────────────────────────────────────────── */
      const ro = new ResizeObserver(() => {
        if (disposed) return;
        const w = el.offsetWidth, h = el.offsetHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        if (composerObj) composerObj.setSize(w, h);
      });
      ro.observe(el);
      cleanups.push(() => ro.disconnect());

      /* ── LOAD CAR ──────────────────────────────────────── */
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

        // Deep gloss black paint — catches the studio spot lights dramatically
        const bodyPaint = new THREE.MeshPhysicalMaterial({
          color: '#040404',
          metalness: 0.92,
          roughness: 0.06,
          clearcoat: 1.0,
          clearcoatRoughness: 0.03,
          envMapIntensity: 0.85,
          specularIntensity: 0.78,
          specularColor: new THREE.Color('#E8E0D4'),
        });
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: '#0A1420', roughness: 0.02,
          transmission: 0.90, transparent: true, opacity: 0.28,
          ior: 1.52, envMapIntensity: 0.7,
        });
        const detailMat = new THREE.MeshStandardMaterial({ color: '#060606', roughness: 0.58, metalness: 0.14 });
        const rimMat    = new THREE.MeshPhysicalMaterial({ color: '#0C0C14', metalness: 0.97, roughness: 0.08, envMapIntensity: 1.0 });
        const tireMat   = new THREE.MeshStandardMaterial({ color: '#080808', roughness: 0.96 });
        const tailMat   = new THREE.MeshPhysicalMaterial({
          color: '#220000', emissive: new THREE.Color('#FF1400'), emissiveIntensity: 1.8,
          roughness: 0.04, transparent: true, opacity: 0.86,
        });
        const headlightMat = new THREE.MeshPhysicalMaterial({
          color: '#080C10', emissive: new THREE.Color('#7898FF'), emissiveIntensity: 0.5, roughness: 0.04,
        });

        model.traverse((child: ThreeNS.Object3D) => {
          const mesh = child as ThreeNS.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true; mesh.receiveShadow = true;
          const n = mesh.name.toLowerCase();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (n.includes('glass') || n.includes('window') || (mesh.material as any)?.transparent) mesh.material = glassMat;
          else if (n.includes('tire') || n.includes('tyre'))                   mesh.material = tireMat;
          else if (n.includes('rim') || n.includes('wheel'))                   mesh.material = rimMat;
          else if (n.includes('interior') || n.includes('seat') || n.includes('steer') || n.includes('dash')) mesh.material = detailMat;
          else if ((n.includes('light') || n.includes('lamp')) && (n.includes('tail') || n.includes('_b') || n.includes('rear') || n.includes('back'))) mesh.material = tailMat;
          else if (n.includes('head') || (n.includes('light') && (n.includes('_f') || n.includes('front')))) mesh.material = headlightMat;
          else mesh.material = bodyPaint;

          if (!doorMeshRef.current && n.includes('door') &&
              (n.includes('_l') || n.includes('.l') || n.includes('left') || n.includes('driver')))
            doorMeshRef.current = mesh;
        });

        if (!doorMeshRef.current) {
          model.traverse((child: ThreeNS.Object3D) => {
            if (doorMeshRef.current) return;
            if (child.name.toLowerCase().includes('door')) doorMeshRef.current = child;
          });
        }

        model.position.set(0, 0.08, 0);
        scene.add(model);
        draco.dispose();
        setReady(true);

        if (!disposed) {
          const cw = el.offsetWidth, ch = el.offsetHeight;
          const msaaTarget = new THREE.WebGLRenderTarget(cw, ch, { samples: 8, type: THREE.HalfFloatType });
          const comp = new EC(renderer, msaaTarget);
          comp.addPass(new RP(scene, camera));
          // Subtle bloom: only tail/head lights glow, no environment wash
          comp.addPass(new UBP(new THREE.Vector2(cw, ch), 0.032, 0.48, 0.92));
          comp.addPass(new SP());
          comp.addPass(new OP());
          composerObj = comp;
        }
      } catch (err) {
        console.error('DettagliScene: car load failed', err);
        setReady(true);
      }
    })();

    return () => { disposed = true; cleanups.forEach(fn => fn()); };
  }, [mouseRef]);

  const activeCallout = CALLOUTS.find(c => c.id === activeId) ?? null;

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none', pointerEvents: 'none' }}
      />

      {/* SVG overlay — bezier callout lines + car-anchor dots, updated imperatively */}
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', overflow: 'visible',
          opacity: ready ? 1 : 0,
          transition: 'opacity 1.4s ease',
        }}
      >
        {CALLOUTS.map((c, i) => (
          <g key={c.id}>
            <path
              ref={el => { pathRefs.current[i] = el; }}
              fill="none"
              stroke={activeId === c.id ? c.accent : 'rgba(200,196,188,0.28)'}
              strokeWidth={activeId === c.id ? '1.0' : '0.65'}
              strokeDasharray={activeId === c.id ? 'none' : '2.5 4'}
              style={{ transition: 'stroke 0.55s ease, stroke-width 0.55s ease, stroke-dasharray 0.55s ease' }}
            />
            {/* Dot at car anchor */}
            <circle
              ref={el => { dotRefs.current[i] = el; }}
              r={activeId === c.id ? 3.5 : 2.5}
              fill={activeId === c.id ? c.accent : 'rgba(200,196,188,0.5)'}
              style={{ transition: 'fill 0.55s ease, r 0.55s ease' }}
            />
          </g>
        ))}
      </svg>

      {/* Callout labels — right-side vertical column, always visible */}
      {CALLOUTS.map((c, i) => {
        const isActive = activeId === c.id;
        return (
          <button
            key={c.id}
            onClick={() => handleSelect(c.id)}
            aria-label={c.title}
            style={{
              position: 'absolute',
              // Left edge at (lx% - 68px) so the accent dot aligns with SVG line endpoint
              left: `calc(${c.lx}% - 68px)`,
              top: `${c.ly}%`,
              transform: 'translate(0, -50%)',
              pointerEvents: 'auto',
              background: 'none',
              border: 'none',
              padding: '7px 4px',
              cursor: 'pointer',
              zIndex: 14,
              textAlign: 'left',
              opacity: ready ? (isActive ? 1 : 0.46) : 0,
              transition: `opacity 0.5s ease ${i * 0.1}s`,
            }}
          >
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{
                width:  isActive ? 7 : 4,
                height: isActive ? 7 : 4,
                borderRadius: '50%',
                background: c.accent,
                flexShrink: 0,
                boxShadow: isActive ? `0 0 10px ${c.accent}80` : 'none',
                transition: 'all 0.45s cubic-bezier(0.16,1,0.3,1)',
              }} />
              <span style={{
                fontFamily: "var(--font-cormorant, 'Cormorant', serif)",
                fontSize: 'clamp(11px, 1.05vw, 14px)',
                fontWeight: 400,
                letterSpacing: '0.04em',
                color: isActive ? '#EDE8DF' : '#A8A49C',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                transition: 'color 0.42s ease',
              }}>
                {c.title}
              </span>
            </div>
            {/* Tag */}
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(6px, 0.55vw, 7.5px)',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: c.accent,
              opacity: isActive ? 0.82 : 0.38,
              paddingLeft: 12,
              transition: 'opacity 0.42s ease',
            }}>
              {c.tag}
            </div>
          </button>
        );
      })}

      {/* Info panel */}
      <InfoPanel c={activeCallout} onClose={handleClose} />
    </div>
  );
}
