'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type * as ThreeNS from 'three';

/* ═══════════════════════════════════════════════════════════
   CALLOUT DEFINITIONS
   worldPos: on the visible right-side of the car (right-50% clip)
   lx:87 stacks all labels in the right edge — no headline overlap
═══════════════════════════════════════════════════════════ */
interface CalloutDef {
  id: string;
  worldPos: [number, number, number];
  camPos:   [number, number, number];
  camLook:  [number, number, number];
  lx: number; ly: number;
  title: string; tag: string; body: string; accent: string;
  openDoor?: boolean;
}

const CALLOUTS: CalloutDef[] = [
  {
    id: 'hood',
    worldPos: [ 0.6,  0.94,  1.4 ], camPos: [ 1.2, 2.2, 3.6 ], camLook: [ 0.4, 0.82, 1.0 ],
    lx: 87, ly: 13,
    title: 'Ceramic Coating', tag: '9H Hardness · 5-Year Bond',
    body:  'A molecular bond that becomes part of your paint. Total resistance to UV, chemicals, and micro-scratches — with a depth of gloss no wax can approach.',
    accent: '#C8A44A',
  },
  {
    id: 'glass',
    worldPos: [ 0.6,  1.06,  0.7 ], camPos: [ 1.0, 1.95, 2.6 ], camLook: [ 0.3, 0.96, 0.5 ],
    lx: 87, ly: 27,
    title: 'Glass Treatment', tag: 'Hydrophobic · Anti-UV Nano',
    body:  'Water sheets off at 50 mph. UV fully blocked. Every pane clarity-polished before nano-ceramic is applied — inside and out. Visibility redefined.',
    accent: '#6EA4BC',
  },
  {
    id: 'interior',
    worldPos: [ 0.0,  0.80,  0.2 ], camPos: [ 0.6, 3.4, -0.1 ], camLook: [ 0.0, 0.52, 0.0 ],
    lx: 87, ly: 41,
    title: 'Interior Detail', tag: 'Full Cabin · Every Surface',
    body:  'Alcantara, leather, carbon — each treated by its own protocol. Sanitised, conditioned, UV-protected from seat to headliner.',
    accent: '#9080C0',
  },
  {
    id: 'wheel',
    worldPos: [ 1.05, 0.28,  1.4 ], camPos: [ 2.8, 0.68, 2.9 ], camLook: [ 0.9, 0.26, 1.3 ],
    lx: 87, ly: 55,
    title: 'Tire Dressing', tag: 'Iron Fallout · Caliper Seal',
    body:  'Brake dust and iron fallout chemically dissolved. Calipers colour-sealed. Tires dressed to a deep rich matte — not the synthetic shine that wears off overnight.',
    accent: '#5C92A8',
  },
  {
    id: 'body',
    worldPos: [ 0.9,  0.76, -0.4 ], camPos: [ 2.8, 1.5, -2.4 ], camLook: [ 0.4, 0.62, -0.5 ],
    lx: 87, ly: 69,
    title: 'Paint Correction', tag: 'Single to Multi-Stage',
    body:  'Swirl marks, water etch, oxidation — removed at the molecular level with machine polishing. The surface becomes what it was the day it left the factory.',
    accent: '#B08A38',
  },
];

const DEFAULT_CAM = { px: 4.5, py: 1.05, pz: -4.2, lx: 0.8, ly: 0.52, lz: 0 };
const EASE = [0.16, 1, 0.3, 1] as const;

/* Spring: ease-in/ease-out without overshoot */
const SK = 0.050, SD = 0.76;
function sp(val: number, vel: number, tgt: number): [number, number] {
  const nv = (vel + (tgt - val) * SK) * SD;
  return [val + nv, nv];
}

/* ═══════════════════════════════════════════════════════════
   INFO PANEL
═══════════════════════════════════════════════════════════ */
function InfoPanel({ c, onClose }: { c: CalloutDef | null; onClose: () => void }) {
  return (
    <AnimatePresence mode="wait">
      {c && (
        <motion.div
          key={c.id}
          className="absolute pointer-events-auto"
          style={{ bottom: 60, left: '52%', transform: 'translateX(-50%)', width: 'clamp(240px, 38%, 310px)', zIndex: 22 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <motion.div
            style={{ height: 1, background: c.accent, transformOrigin: 'left' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.46, ease: EASE }}
          />
          <div style={{
            background: 'rgba(6, 5, 4, 0.90)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderTop: 'none',
            padding: '16px 20px 20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
              <h3 style={{
                fontFamily: "var(--font-cormorant,'Cormorant',serif)",
                fontSize: 22,
                fontWeight: 400,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#EDE8DE',
                lineHeight: 1,
              }}>
                {c.title}
              </h3>
              <button
                onClick={onClose}
                style={{ color: 'rgba(220,215,204,0.28)', fontSize: 10, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', lineHeight: 1, flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(220,215,204,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(220,215,204,0.28)')}
              >
                ✕
              </button>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 13 }} />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, lineHeight: 1.95, color: 'rgba(220,215,204,0.44)' }}>
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

  const pathRefs = useRef<(SVGPathElement | null)[]>(CALLOUTS.map(() => null));
  const dotRefs  = useRef<(SVGCircleElement | null)[]>(CALLOUTS.map(() => null));

  const camCurRef = useRef({ ...DEFAULT_CAM });
  const camVelRef = useRef({ px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0 });
  const camTgtRef = useRef({ ...DEFAULT_CAM });
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
      renderer.toneMappingExposure = 0.95;
      cleanups.push(() => renderer.dispose());

      /* ── SCENE + FOG ───────────────────────────────────── */
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#080706');
      // Fog: environment recedes into darkness, car stays lit
      scene.fog = new THREE.Fog('#080706', 5, 18);

      const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 80);
      camera.position.set(DEFAULT_CAM.px, DEFAULT_CAM.py, DEFAULT_CAM.pz);
      camera.lookAt(DEFAULT_CAM.lx, DEFAULT_CAM.ly, DEFAULT_CAM.lz);

      /* ── DARK EPOXY FLOOR ──────────────────────────────── */
      // Very dark navy-charcoal — premium automotive epoxy, specular only
      const floorMat = new THREE.MeshPhysicalMaterial({
        color: '#0D0C14',
        roughness: 0.06,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        reflectivity: 0.88,
        envMapIntensity: 0.5,
      });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);
      cleanups.push(() => floorMat.dispose());

      // Subtle floor zone marking — thin painted lines (like car-positioning marks in a studio)
      const lineMat = new THREE.MeshStandardMaterial({ color: '#1A1830', roughness: 0.5 });
      [[0, 2.6], [0, -2.6]].forEach(([x, z]) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 0.04), lineMat);
        m.rotation.x = -Math.PI / 2; m.position.set(x, 0.002, z); scene.add(m);
      });
      [[-2.6, 0], [2.6, 0]].forEach(([x, z]) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 5.4), lineMat);
        m.rotation.x = -Math.PI / 2; m.position.set(x, 0.002, z); scene.add(m);
      });
      cleanups.push(() => lineMat.dispose());

      /* ── STUDIO WALLS ──────────────────────────────────── */
      // Two-tone: dark dado base panel, slightly less dark upper wall
      const upperWallMat = new THREE.MeshStandardMaterial({ color: '#141210', roughness: 0.95 });
      const dadoMat      = new THREE.MeshStandardMaterial({ color: '#0E0C0A', roughness: 0.98 });
      const ceilMat      = new THREE.MeshStandardMaterial({ color: '#080706', roughness: 0.99 });

      // Back wall
      const bkUp = new THREE.Mesh(new THREE.PlaneGeometry(26, 7.5), upperWallMat);
      bkUp.position.set(0, 6, -9.5); bkUp.receiveShadow = true; scene.add(bkUp);
      const bkDado = new THREE.Mesh(new THREE.PlaneGeometry(26, 1.4), dadoMat);
      bkDado.position.set(0, 0.7, -9.48); bkDado.receiveShadow = true; scene.add(bkDado);

      // Left wall
      const lWUp = new THREE.Mesh(new THREE.PlaneGeometry(20, 7.5), upperWallMat);
      lWUp.position.set(-8.5, 6, -1); lWUp.rotation.y = Math.PI / 2; lWUp.receiveShadow = true; scene.add(lWUp);
      const lWDado = new THREE.Mesh(new THREE.PlaneGeometry(20, 1.4), dadoMat);
      lWDado.position.set(-8.48, 0.7, -1); lWDado.rotation.y = Math.PI / 2; lWDado.receiveShadow = true; scene.add(lWDado);

      // Right wall (partially visible from camera angle)
      const rWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), upperWallMat);
      rWall.position.set(8.5, 4.5, -1); rWall.rotation.y = -Math.PI / 2; scene.add(rWall);

      // Ceiling
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(26, 22), ceilMat);
      ceil.position.set(0, 8.5, -1); ceil.rotation.x = Math.PI / 2; scene.add(ceil);
      cleanups.push(() => { upperWallMat.dispose(); dadoMat.dispose(); ceilMat.dispose(); });

      /* ── DADO RAIL STRIP ─────────────────────────────── */
      // A thin polished strip at dado height — premium detail
      const railMat = new THREE.MeshPhysicalMaterial({ color: '#242220', roughness: 0.35, metalness: 0.75, clearcoat: 0.8 });
      const railBack = new THREE.Mesh(new THREE.BoxGeometry(26, 0.04, 0.04), railMat);
      railBack.position.set(0, 1.38, -9.44); scene.add(railBack);
      const railLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 20), railMat);
      railLeft.position.set(-8.44, 1.38, -1); scene.add(railLeft);
      cleanups.push(() => railMat.dispose());

      /* ── CEILING LIGHTING TRACK ────────────────────────── */
      const trackMat = new THREE.MeshPhysicalMaterial({ color: '#1C1A18', roughness: 0.45, metalness: 0.88 });
      const trackGeo = new THREE.BoxGeometry(9.5, 0.06, 0.1);
      [0, -2.2].forEach(z => {
        const t = new THREE.Mesh(trackGeo, trackMat);
        t.position.set(-0.5, 8.26, z); scene.add(t);
      });
      // Track spot heads
      const headMat = new THREE.MeshPhysicalMaterial({ color: '#252320', roughness: 0.38, metalness: 0.82, emissive: new THREE.Color('#FFF8E4'), emissiveIntensity: 0.15 });
      const headGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.22, 8);
      [[-3, 0], [-1, 0], [1, 0], [3, 0], [-2, -2.2], [0, -2.2], [2, -2.2]].forEach(([x, z]) => {
        const h = new THREE.Mesh(headGeo, headMat);
        h.position.set(x, 8.14, z); scene.add(h);
      });
      cleanups.push(() => { trackMat.dispose(); headMat.dispose(); trackGeo.dispose(); headGeo.dispose(); });

      /* ── LED STRIP (ceiling perimeter) ──────────────────── */
      const ledMat = new THREE.MeshStandardMaterial({
        color: '#FFFFF2', emissive: new THREE.Color('#FFFFF2'), emissiveIntensity: 0.4, roughness: 0.05,
      });
      const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(20, 0.02, 0.03), ledMat);
      ledStrip.position.set(-0.5, 8.3, -9.4); scene.add(ledStrip);
      const ledStripL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 20), ledMat);
      ledStripL.position.set(-8.4, 8.3, -1); scene.add(ledStripL);
      cleanups.push(() => ledMat.dispose());

      /* ── PRODUCT SHELVING (left wall, dark recessed) ────── */
      const cabinetMat = new THREE.MeshPhysicalMaterial({ color: '#181614', roughness: 0.6, metalness: 0.22 });
      const shelfMat   = new THREE.MeshStandardMaterial({ color: '#1A1816', roughness: 0.65 });
      const bottleMat  = new THREE.MeshPhysicalMaterial({ color: '#0E0E18', roughness: 0.2, metalness: 0.05, clearcoat: 0.7 });
      const bottleCapMat = new THREE.MeshPhysicalMaterial({ color: '#282828', roughness: 0.3, metalness: 0.6 });
      const labelTex = (() => {
        const lc = document.createElement('canvas'); lc.width = 64; lc.height = 128;
        const lx = lc.getContext('2d')!;
        lx.fillStyle = '#D8D4CC'; lx.fillRect(6, 20, 52, 88);
        lx.fillStyle = '#888882'; lx.fillRect(12, 26, 40, 2);
        lx.fillStyle = '#AAAAA4'; lx.fillRect(12, 34, 32, 1);
        return new THREE.CanvasTexture(lc);
      })();
      const lblTex2Mat = new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.8, transparent: false });
      const bottleGeo    = new THREE.CylinderGeometry(0.042, 0.048, 0.22, 12);
      const bottleCapGeo = new THREE.CylinderGeometry(0.036, 0.042, 0.04, 10);
      const boardGeo     = new THREE.BoxGeometry(0.04, 0.04, 2.6);

      const SX = -7.5;
      // Cabinet back panel
      const cabinetBack = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.0), cabinetMat);
      cabinetBack.position.set(SX, 2.5, -1.7); cabinetBack.rotation.y = Math.PI / 2; scene.add(cabinetBack);
      // Top/bottom/side panels
      [[SX, 4.02, -1.7, 2.8, 0.06, 2.8], [SX, 0.98, -1.7, 2.8, 0.06, 2.8], [SX, 2.5, -3.12, 0.06, 3.1, 2.8], [SX, 2.5, -0.28, 0.06, 3.1, 2.8]].forEach(([cx, cy, cz, gx, gy, gz]) => {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(gx, gy, gz), cabinetMat);
        panel.position.set(cx, cy, cz); scene.add(panel);
      });
      // Shelf boards inside cabinet
      [1.65, 2.35, 3.05, 3.75].forEach(y => {
        const b = new THREE.Mesh(boardGeo, shelfMat); b.position.set(SX, y, -1.7); scene.add(b);
      });
      // Bottles + caps on shelves
      [1.80, 2.50, 3.20, 3.90].forEach(y => {
        [-2.8, -2.35, -1.9, -1.45, -1.0, -0.55].forEach((z, bi) => {
          const bt = new THREE.Mesh(bottleGeo, bi % 3 === 0 ? bottleMat : (bi % 3 === 1 ? new THREE.MeshPhysicalMaterial({ color: '#141428', roughness: 0.2, metalness: 0.04, clearcoat: 0.65 }) : new THREE.MeshPhysicalMaterial({ color: '#1A0A0A', roughness: 0.22, metalness: 0.04, clearcoat: 0.6 })));
          bt.position.set(SX - 0.02, y, z); scene.add(bt);
          const cap = new THREE.Mesh(bottleCapGeo, bottleCapMat);
          cap.position.set(SX - 0.02, y + 0.13, z); scene.add(cap);
          const lbl = new THREE.Mesh(new THREE.PlaneGeometry(0.065, 0.10), lblTex2Mat);
          lbl.position.set(SX + 0.05, y, z); lbl.rotation.y = -Math.PI / 2; scene.add(lbl);
        });
      });
      cleanups.push(() => { cabinetMat.dispose(); shelfMat.dispose(); bottleMat.dispose(); bottleCapMat.dispose(); lblTex2Mat.dispose(); labelTex.dispose(); bottleGeo.dispose(); bottleCapGeo.dispose(); boardGeo.dispose(); });

      /* ── PROFESSIONAL TOOL CART (right side) ────────────── */
      const cartBodyMat = new THREE.MeshPhysicalMaterial({ color: '#181820', roughness: 0.3, metalness: 0.82, clearcoat: 0.4 });
      const drawerFaceMat = new THREE.MeshPhysicalMaterial({ color: '#1C1C28', roughness: 0.25, metalness: 0.85, clearcoat: 0.3 });
      const handleBarMat  = new THREE.MeshPhysicalMaterial({ color: '#303038', roughness: 0.2, metalness: 0.92 });
      const wheelMat      = new THREE.MeshStandardMaterial({ color: '#0A0A0A', roughness: 0.92 });

      const cartX = 4.2, cartZ = -1.5, cartBase = 0.55;
      // Main body
      const cartBody = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.06, 0.44), cartBodyMat);
      cartBody.position.set(cartX, cartBase + 0.53, cartZ); scene.add(cartBody);
      // Drawers (5 drawers)
      [0.18, 0.38, 0.58, 0.78, 0.98].forEach((yOff) => {
        const dr = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.17, 0.02), drawerFaceMat);
        dr.position.set(cartX, cartBase + yOff, cartZ - 0.22); scene.add(dr);
        const hb = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.025, 0.025), handleBarMat);
        hb.position.set(cartX, cartBase + yOff, cartZ - 0.24); scene.add(hb);
      });
      // Side handle
      const sideHandle = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.62, 0.025), handleBarMat);
      sideHandle.position.set(cartX - 0.31, cartBase + 0.78, cartZ - 0.01); scene.add(sideHandle);
      // Top surface (work area)
      const cartTop = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.04, 0.46), cartBodyMat);
      cartTop.position.set(cartX, cartBase + 1.08, cartZ); scene.add(cartTop);
      // Casters (wheels)
      [[-0.24, -0.21], [-0.24, 0.21], [0.24, -0.21], [0.24, 0.21]].forEach(([dx, dz]) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 8), wheelMat);
        w.rotation.x = Math.PI / 2; w.position.set(cartX + dx, 0.055, cartZ + dz); scene.add(w);
      });
      cleanups.push(() => { cartBodyMat.dispose(); drawerFaceMat.dispose(); handleBarMat.dispose(); wheelMat.dispose(); });

      /* ── POLISHING MACHINE on floor ─────────────────────── */
      const polMat  = new THREE.MeshPhysicalMaterial({ color: '#181818', roughness: 0.35, metalness: 0.7 });
      const padMat  = new THREE.MeshStandardMaterial({ color: '#0C0C10', roughness: 0.85 });
      const polBody = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.32, 12), polMat);
      polBody.position.set(3.6, 0.16, 1.4); scene.add(polBody);
      const polPad  = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12), padMat);
      polPad.position.set(3.6, 0.02, 1.4); scene.add(polPad);
      const polHnd  = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.014, 0.55, 8), polMat);
      polHnd.position.set(3.6, 0.46, 1.4); polHnd.rotation.z = 0.4; scene.add(polHnd);
      cleanups.push(() => { polMat.dispose(); padMat.dispose(); });

      /* ── LIGHTING ──────────────────────────────────────────
         Goal: crisp spots on the car, dark floor except for
         specular reflections, separated silhouette from bg.
      ──────────────────────────────────────────────────────── */
      scene.add(new THREE.AmbientLight('#C8C0B0', 0.025));

      // Primary key: tight overhead spot → dramatic top-down highlights
      const key = new THREE.SpotLight('#FFF6E8', 3.6, 16, 0.28, 0.55, 1.4);
      key.position.set(0.5, 8.0, 0.5);
      key.target.position.set(0.3, 0.5, 0.2);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      key.shadow.bias   = -0.00010;
      key.shadow.radius = 7;
      scene.add(key, key.target);

      // Secondary key: offset slightly to fill windshield/side
      const key2 = new THREE.SpotLight('#FFF2E0', 1.4, 14, 0.35, 0.68, 1.5);
      key2.position.set(-2.5, 7.2, 1.5);
      key2.target.position.set(0, 0.7, 0.3);
      key2.castShadow = false;
      scene.add(key2, key2.target);

      // Rim from rear-right: cool, creates bright edge on car silhouette
      const rim1 = new THREE.SpotLight('#D4E8FF', 1.1, 18, 0.34, 0.62, 1.3);
      rim1.position.set(4.0, 4.5, -8.5);
      rim1.target.position.set(0.6, 0.6, 0);
      scene.add(rim1, rim1.target);

      // Rim from rear-left: slightly less cool
      const rim2 = new THREE.SpotLight('#C8DCFF', 0.7, 16, 0.38, 0.68, 1.4);
      rim2.position.set(-3.5, 3.8, -7.5);
      rim2.target.position.set(-0.2, 0.5, 0);
      scene.add(rim2, rim2.target);

      // Low front fill (very soft, doesn't hit the floor)
      const fill = new THREE.SpotLight('#FFF4E8', 0.55, 10, 0.55, 0.85, 1.8);
      fill.position.set(-1.5, 2.2, 5.5);
      fill.target.position.set(0, 0.9, 0.5);
      scene.add(fill, fill.target);

      // Shelf accent light
      const shelfLight = new THREE.SpotLight('#FFE8C0', 0.32, 7, 0.7, 0.9);
      shelfLight.position.set(-4.5, 5.5, -1.5);
      shelfLight.target.position.set(-7.5, 2.5, -1.7);
      scene.add(shelfLight, shelfLight.target);

      const { RectAreaLightUniformsLib } = await import('three/examples/jsm/lights/RectAreaLightUniformsLib.js');
      if (disposed) return;
      RectAreaLightUniformsLib.init();

      // Overhead area light (wide softbox, supplements spots)
      const area = new THREE.RectAreaLight('#FFF4EC', 0.95, 8.0, 2.0);
      area.position.set(-0.3, 7.6, -0.4); area.lookAt(0, 0, 0); scene.add(area);

      /* ── ENV MAP ───────────────────────────────────────── */
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed) return;
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.005).texture;
      pmrem.dispose();

      /* ── HOTSPOT VECTORS ──────────────────────────────── */
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

        const ct = camTgtRef.current;
        let r: [number, number];
        r = sp(camCur.px, camVel.px, ct.px); camCur.px = r[0]; camVel.px = r[1];
        r = sp(camCur.py, camVel.py, ct.py); camCur.py = r[0]; camVel.py = r[1];
        r = sp(camCur.pz, camVel.pz, ct.pz); camCur.pz = r[0]; camVel.pz = r[1];
        r = sp(camCur.lx, camVel.lx, ct.lx); camCur.lx = r[0]; camVel.lx = r[1];
        r = sp(camCur.ly, camVel.ly, ct.ly); camCur.ly = r[0]; camVel.ly = r[1];
        r = sp(camCur.lz, camVel.lz, ct.lz); camCur.lz = r[0]; camVel.lz = r[1];

        const pF = paralaxRef.current ? 1.0 : 0.05;
        const bF = paralaxRef.current ? 1.0 : 0.14;
        const mx = mouseRef.current.x - 0.5;
        const my = mouseRef.current.y - 0.5;
        camera.position.set(
          camCur.px + mx * 0.14 * pF + Math.sin(bt * 0.24) * 0.044 * bF,
          camCur.py + my * -0.033 * pF + Math.sin(bt * 0.16) * 0.014 * bF,
          camCur.pz,
        );
        camera.lookAt(camCur.lx, camCur.ly, camCur.lz);

        r = sp(doorCurRef.current, doorVelRef.current, doorTgtRef.current);
        doorCurRef.current = r[0]; doorVelRef.current = r[1];
        if (doorMeshRef.current) doorMeshRef.current.rotation.y = doorCurRef.current;

        // Project hotspots → screen, update SVG bezier paths
        const CW = container.offsetWidth, CH = container.offsetHeight;
        CALLOUTS.forEach((c, i) => {
          hsProjected[i].copy(hsWorld[i]).project(camera);
          const behind = hsProjected[i].z >= 1;
          const px = (hsProjected[i].x *  0.5 + 0.5) * CW;
          const py = (hsProjected[i].y * -0.5 + 0.5) * CH;

          // Line ends at label dot (button left edge at lx%-64px, dot ~4px in)
          const lxPx = (c.lx / 100) * CW - 60;
          const lyPx = (c.ly / 100) * CH;
          const cp1x = px + (lxPx - px) * 0.70;
          const cp2x = lxPx - 38;
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
      ro.observe(el); cleanups.push(() => ro.disconnect());

      /* ── LOAD CAR ──────────────────────────────────────── */
      try {
        const [
          { GLTFLoader }, { DRACOLoader },
          { EffectComposer: EC }, { RenderPass: RP },
          { UnrealBloomPass: UBP }, { SMAAPass: SP }, { OutputPass: OP },
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

        const draco = new DRACOLoader(); draco.setDecoderPath('/draco/'); draco.preload();
        const loader = new GLTFLoader(); loader.setDRACOLoader(draco);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gltf: any = await new Promise((resolve, reject) => loader.load('/models/ferrari.glb', resolve, undefined, reject));
        if (disposed) return;

        const model = gltf.scene as ThreeNS.Object3D;

        // Gloss black paint — catches dramatic specular from focused spots
        const bodyPaint = new THREE.MeshPhysicalMaterial({
          color: '#030303', metalness: 0.94, roughness: 0.05,
          clearcoat: 1.0, clearcoatRoughness: 0.03,
          envMapIntensity: 0.80, specularIntensity: 0.75,
          specularColor: new THREE.Color('#E0D8CC'),
        });
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: '#08101A', roughness: 0.02, transmission: 0.92,
          transparent: true, opacity: 0.26, ior: 1.52, envMapIntensity: 0.65,
        });
        const detailMat    = new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.60, metalness: 0.12 });
        const rimMat       = new THREE.MeshPhysicalMaterial({ color: '#0A0A12', metalness: 0.97, roughness: 0.07, envMapIntensity: 0.9 });
        const tireMat      = new THREE.MeshStandardMaterial({ color: '#070707', roughness: 0.97 });
        const tailMat      = new THREE.MeshPhysicalMaterial({ color: '#1E0000', emissive: new THREE.Color('#FF1200'), emissiveIntensity: 1.6, roughness: 0.04, transparent: true, opacity: 0.85 });
        const headlightMat = new THREE.MeshPhysicalMaterial({ color: '#060A10', emissive: new THREE.Color('#6888FF'), emissiveIntensity: 0.45, roughness: 0.04 });

        model.traverse((child: ThreeNS.Object3D) => {
          const mesh = child as ThreeNS.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true; mesh.receiveShadow = true;
          const n = mesh.name.toLowerCase();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if      (n.includes('glass') || n.includes('window') || (mesh.material as any)?.transparent) mesh.material = glassMat;
          else if (n.includes('tire') || n.includes('tyre'))   mesh.material = tireMat;
          else if (n.includes('rim')  || n.includes('wheel'))  mesh.material = rimMat;
          else if (n.includes('interior') || n.includes('seat') || n.includes('steer') || n.includes('dash')) mesh.material = detailMat;
          else if ((n.includes('light') || n.includes('lamp')) && (n.includes('tail') || n.includes('_b') || n.includes('rear') || n.includes('back'))) mesh.material = tailMat;
          else if (n.includes('head') || (n.includes('light') && (n.includes('_f') || n.includes('front')))) mesh.material = headlightMat;
          else    mesh.material = bodyPaint;

          if (!doorMeshRef.current && n.includes('door') && (n.includes('_l') || n.includes('.l') || n.includes('left') || n.includes('driver')))
            doorMeshRef.current = mesh;
        });
        if (!doorMeshRef.current) {
          model.traverse((child: ThreeNS.Object3D) => { if (!doorMeshRef.current && child.name.toLowerCase().includes('door')) doorMeshRef.current = child; });
        }
        model.position.set(0, 0.08, 0);
        scene.add(model);
        draco.dispose();
        setReady(true);

        if (!disposed) {
          const cw = el.offsetWidth, ch = el.offsetHeight;
          const target = new THREE.WebGLRenderTarget(cw, ch, { samples: 8, type: THREE.HalfFloatType });
          const comp = new EC(renderer, target);
          comp.addPass(new RP(scene, camera));
          // Bloom: tail/head lamps glow + a hint on the specular peak
          comp.addPass(new UBP(new THREE.Vector2(cw, ch), 0.055, 0.46, 0.92));
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

      {/* Readability gradient: darkens the left ~40% of the Dettagli scene
          (where the centered headline subparagraph appears) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '44%', height: '100%',
          background: 'linear-gradient(to right, rgba(8,7,6,0.62) 0%, rgba(8,7,6,0.0) 100%)',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {/* SVG callout lines — cubic bezier, updated imperatively each frame */}
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', overflow: 'visible',
          opacity: ready ? 1 : 0,
          transition: 'opacity 1.6s ease',
          zIndex: 10,
        }}
      >
        {CALLOUTS.map((c, i) => (
          <g key={c.id}>
            {/* Bezier callout line */}
            <path
              ref={el => { pathRefs.current[i] = el; }}
              fill="none"
              stroke={activeId === c.id ? c.accent : 'rgba(255,255,255,0.42)'}
              strokeWidth={activeId === c.id ? '1.2' : '0.75'}
              style={{ transition: 'stroke 0.55s ease, stroke-width 0.55s ease' }}
            />
            {/* Anchor dot at car point */}
            <circle
              ref={el => { dotRefs.current[i] = el; }}
              r={activeId === c.id ? 4 : 2.5}
              fill={activeId === c.id ? c.accent : 'rgba(255,255,255,0.55)'}
              style={{ transition: 'fill 0.55s ease, r 0.55s ease' }}
            />
          </g>
        ))}
      </svg>

      {/* Callout labels — right-side vertical column */}
      {CALLOUTS.map((c, i) => {
        const isActive = activeId === c.id;
        return (
          <button
            key={c.id}
            onClick={() => handleSelect(c.id)}
            aria-label={c.title}
            style={{
              position: 'absolute',
              left: `calc(${c.lx}% - 64px)`,
              top: `${c.ly}%`,
              transform: 'translate(0, -50%)',
              pointerEvents: 'auto',
              background: 'none',
              border: 'none',
              padding: '8px 4px',
              cursor: 'pointer',
              zIndex: 14,
              textAlign: 'left',
              opacity: ready ? (isActive ? 1 : 0.55) : 0,
              transition: `opacity 0.5s ease ${i * 0.12}s`,
            }}
          >
            {/* Label row: accent dot + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <div style={{
                width:  isActive ? 7 : 4,
                height: isActive ? 7 : 4,
                borderRadius: '50%',
                background: c.accent,
                flexShrink: 0,
                boxShadow: isActive ? `0 0 12px ${c.accent}90` : 'none',
                transition: 'all 0.48s cubic-bezier(0.16,1,0.3,1)',
              }} />
              <span style={{
                fontFamily: "var(--font-cormorant,'Cormorant',serif)",
                fontSize: 'clamp(10.5px, 0.9vw, 13px)',
                fontWeight: 400,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: isActive ? '#EDE8DE' : 'rgba(200,195,185,0.80)',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                transition: 'color 0.45s ease',
              }}>
                {c.title}
              </span>
            </div>
            {/* Tag line */}
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(6px, 0.53vw, 7.5px)',
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: c.accent,
              opacity: isActive ? 0.85 : 0.42,
              paddingLeft: 12,
              transition: 'opacity 0.45s ease',
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
