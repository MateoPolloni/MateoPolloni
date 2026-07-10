'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type * as ThreeNS from 'three';

/* ═══════════════════════════════════════════════════════════
   CALLOUT DEFINITIONS
   lx/ly = label position as % of container (right-half safe zone)
═══════════════════════════════════════════════════════════ */
interface CalloutDef {
  id:       string;
  worldPos: [number, number, number];
  camPos:   [number, number, number];
  camLook:  [number, number, number];
  lx: number; ly: number;
  title:  string;
  tag:    string;
  body:   string;
  accent: string;
  openDoor?: boolean;
}

const CALLOUTS: CalloutDef[] = [
  {
    id: 'hood',
    worldPos: [0,     0.92,  1.5 ],
    camPos:   [0.4,   2.1,   3.8 ],
    camLook:  [0,     0.82,  1.1 ],
    lx: 56, ly: 9,
    title: 'Ceramic Coating',
    tag:   '9H Hardness · 5-Year Bond',
    body:  'A molecular bond that becomes part of your paint. Total resistance to UV, chemicals, and micro-scratches — with a depth of gloss no wax can approach.',
    accent: '#C4A044',
  },
  {
    id: 'glass',
    worldPos: [0.2,   1.08,  0.65],
    camPos:   [0.6,   1.95,  2.5 ],
    camLook:  [0,     0.98,  0.45],
    lx: 80, ly: 16,
    title: 'Glass Treatment',
    tag:   'Hydrophobic · Anti-UV Nano',
    body:  'Water sheets off at 50 mph. UV blocked. Every pane clarity-polished before nano-ceramic is applied — inside and out. Visibility redefined.',
    accent: '#72A8C0',
  },
  {
    id: 'door',
    worldPos: [-1.05, 0.68,  0.1 ],
    camPos:   [-3.2,  1.1,   0.4 ],
    camLook:  [-0.7,  0.55,  0   ],
    lx: 86, ly: 44,
    title: 'Interior Detail',
    tag:   'Full Cabin · Every Surface',
    body:  'Alcantara, leather, carbon — each treated by its own protocol. Sanitised, conditioned, UV-protected from seat to headliner. You notice it the moment the door opens.',
    accent: '#9080C0',
    openDoor: true,
  },
  {
    id: 'wheel',
    worldPos: [0.98,  0.32,  1.45],
    camPos:   [2.5,   0.65,  2.8 ],
    camLook:  [0.8,   0.28,  1.3 ],
    lx: 56, ly: 83,
    title: 'Tire Dressing',
    tag:   'Iron Fallout · Caliper Seal',
    body:  'Brake dust and iron fallout chemically dissolved. Calipers colour-sealed. Tires dressed to a deep matte — not the synthetic shine that wears off overnight.',
    accent: '#7096B0',
  },
  {
    id: 'body',
    worldPos: [-0.1,  0.84, -1.6 ],
    camPos:   [-0.8,  1.4,  -3.9 ],
    camLook:  [0,     0.65, -1.1 ],
    lx: 82, ly: 74,
    title: 'Paint Correction',
    tag:   'Single to Multi-Stage',
    body:  'Swirl marks, water etch, oxidation — removed at the molecular level with machine polishing. The surface becomes what it was the day it left the factory.',
    accent: '#B8903C',
  },
];

const DEFAULT_CAM = { px: 4.25, py: 0.95, pz: -4.5, lx: 1.8, ly: 0.5, lz: 0 };
const EASE = [0.16, 1, 0.3, 1] as const;

/* ─── Spring physics ─────────────────────────────────────
   Returns [nextVal, nextVel]. STIFFNESS ≈ "acceleration",
   DAMPING ≈ "friction". Tune for cinematic ease-in/out feel.
──────────────────────────────────────────────────────── */
const SPRING_K = 0.058;
const SPRING_D = 0.74;
function sp(val: number, vel: number, tgt: number): [number, number] {
  const nv = (vel + (tgt - val) * SPRING_K) * SPRING_D;
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
          style={{
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(240px, 38%, 310px)',
            zIndex: 20,
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.48, ease: EASE }}
        >
          <motion.div
            style={{ height: 1, background: c.accent, transformOrigin: 'left' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.42, ease: EASE }}
          />
          <div
            style={{
              background: 'rgba(10, 9, 8, 0.84)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderLeft:   '1px solid rgba(255,255,255,0.05)',
              borderRight:  '1px solid rgba(255,255,255,0.04)',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              padding: '16px 18px 20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 9 }}>
              <h3 style={{
                fontFamily: "var(--font-cormorant, 'Cormorant', serif)",
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: '#F0EDE8',
                lineHeight: 1.1,
              }}>
                {c.title}
              </h3>
              <button
                onClick={onClose}
                style={{
                  color: 'rgba(240,237,232,0.28)',
                  fontSize: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '3px 5px',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.72)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.28)')}
              >
                ✕
              </button>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              lineHeight: 1.9,
              color: 'rgba(240,237,232,0.46)',
            }}>
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

  // SVG refs — updated imperatively in RAF, zero React re-renders per frame
  const lineRefs = useRef<(SVGLineElement | null)[]>(CALLOUTS.map(() => null));
  const dotRefs  = useRef<(SVGCircleElement | null)[]>(CALLOUTS.map(() => null));

  // Camera spring state
  const camCurRef = useRef({ ...DEFAULT_CAM });
  const camVelRef = useRef({ px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0 });
  const camTgtRef = useRef({ ...DEFAULT_CAM });

  // Door spring state
  const doorCurRef = useRef(0);
  const doorVelRef = useRef(0);
  const doorTgtRef = useRef(0);
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
      doorTgtRef.current = c.openDoor ? Math.PI * 0.68 : 0;
      paralaxRef.current = false;
    }
  }, []);

  const handleClose = useCallback(() => {
    setActiveId(null);
    camTgtRef.current  = { ...DEFAULT_CAM };
    doorTgtRef.current = 0;
    paralaxRef.current = true;
  }, []);

  /* ── Three.js effect ───────────────────────────────────── */
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
      renderer.toneMappingExposure = 0.70;
      cleanups.push(() => renderer.dispose());

      /* ── SCENE ─────────────────────────────────────────── */
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#CDCAC4');

      const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 80);
      camera.position.set(DEFAULT_CAM.px, DEFAULT_CAM.py, DEFAULT_CAM.pz);
      camera.lookAt(DEFAULT_CAM.lx, DEFAULT_CAM.ly, DEFAULT_CAM.lz);

      /* ── FLOOR ─────────────────────────────────────────── */
      const floorMat = new THREE.MeshPhysicalMaterial({
        color: '#C0BEB8',
        roughness: 0.07,
        metalness: 0.0,
        clearcoat: 0.88,
        clearcoatRoughness: 0.07,
        reflectivity: 0.42,
      });
      const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.receiveShadow = true;
      scene.add(floorMesh);
      cleanups.push(() => floorMat.dispose());

      // Subtle tile grid
      const tc = document.createElement('canvas');
      tc.width = 256; tc.height = 256;
      const tCtx = tc.getContext('2d')!;
      tCtx.fillStyle = '#C0BEB8';
      tCtx.fillRect(0, 0, 256, 256);
      tCtx.strokeStyle = 'rgba(140,138,132,0.24)';
      tCtx.lineWidth = 0.7;
      for (let i = 0; i <= 256; i += 64) {
        tCtx.beginPath(); tCtx.moveTo(i, 0); tCtx.lineTo(i, 256); tCtx.stroke();
        tCtx.beginPath(); tCtx.moveTo(0, i); tCtx.lineTo(256, i); tCtx.stroke();
      }
      const tileTex = new THREE.CanvasTexture(tc);
      tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
      tileTex.repeat.set(6, 6);
      const tileMat = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.14, metalness: 0 });
      const tileMesh = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), tileMat);
      tileMesh.rotation.x = -Math.PI / 2;
      tileMesh.position.y = 0.001;
      tileMesh.receiveShadow = true;
      scene.add(tileMesh);
      cleanups.push(() => { tileTex.dispose(); tileMat.dispose(); });

      /* ── WALLS + CEILING ───────────────────────────────── */
      const wallMat = new THREE.MeshStandardMaterial({ color: '#D0CEC8', roughness: 0.93 });
      const ceilMat = new THREE.MeshStandardMaterial({ color: '#D8D6D0', roughness: 0.97 });
      [
        { geo: [24, 10], pos: [0, 4.5, -8], ry: 0 },
        { geo: [16, 10], pos: [-8, 4.5, -2], ry: Math.PI / 2 },
        { geo: [16, 10], pos: [8,  4.5, -2], ry: -Math.PI / 2 },
      ].forEach(({ geo, pos, ry }) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(geo[0], geo[1]), wallMat);
        m.position.set(pos[0], pos[1], pos[2]);
        m.rotation.y = ry;
        m.receiveShadow = true;
        scene.add(m);
      });
      const ceilMesh = new THREE.Mesh(new THREE.PlaneGeometry(24, 18), ceilMat);
      ceilMesh.position.set(0, 7.5, -1); ceilMesh.rotation.x = Math.PI / 2; scene.add(ceilMesh);
      cleanups.push(() => { wallMat.dispose(); ceilMat.dispose(); });

      /* ── OVERHEAD LIGHT FIXTURES (subtle emissive strips) ── */
      const fixMat = new THREE.MeshStandardMaterial({
        color: '#F2F2F0',
        emissive: new THREE.Color('#FFFEF8'),
        emissiveIntensity: 0.65,
        roughness: 0.05,
      });
      const fixGeo = new THREE.BoxGeometry(6.0, 0.04, 0.2);
      [0, -2.0].forEach(z => {
        const f = new THREE.Mesh(fixGeo, fixMat);
        f.position.set(-0.5, 7.1, z);
        scene.add(f);
      });
      cleanups.push(() => { fixMat.dispose(); fixGeo.dispose(); });

      /* ── SHELVING ──────────────────────────────────────── */
      const shelfMat  = new THREE.MeshStandardMaterial({ color: '#C8C6C0', roughness: 0.68 });
      const bottleMat = new THREE.MeshPhysicalMaterial({ color: '#181820', roughness: 0.15, metalness: 0.05, clearcoat: 0.8 });
      const lblMat    = new THREE.MeshStandardMaterial({ color: '#E8E6E0', roughness: 0.75 });

      const postGeo   = new THREE.BoxGeometry(0.04, 2.5, 0.34);
      const boardGeo  = new THREE.BoxGeometry(0.04, 0.04, 2.2);
      const bottleGeo = new THREE.CylinderGeometry(0.038, 0.044, 0.19, 10);
      const lblGeo    = new THREE.BoxGeometry(0.003, 0.088, 0.072);

      const SX = -7.5;
      [-2.8, -0.6].forEach(z => {
        const p = new THREE.Mesh(postGeo, shelfMat);
        p.position.set(SX, 2.25, z); scene.add(p);
      });
      [1.6, 2.5, 3.4].forEach(y => {
        const b = new THREE.Mesh(boardGeo, shelfMat);
        b.position.set(SX, y, -1.7); scene.add(b);
      });
      [1.75, 2.65, 3.55].forEach(y => {
        [-2.6, -2.2, -1.8, -1.4, -1.0, -0.8].forEach(z => {
          const bt = new THREE.Mesh(bottleGeo, bottleMat);
          bt.position.set(SX - 0.02, y, z); scene.add(bt);
          const lb = new THREE.Mesh(lblGeo, lblMat);
          lb.position.set(SX + 0.04, y, z); scene.add(lb);
        });
      });
      cleanups.push(() => {
        shelfMat.dispose(); bottleMat.dispose(); lblMat.dispose();
        postGeo.dispose(); boardGeo.dispose(); bottleGeo.dispose(); lblGeo.dispose();
      });

      /* ── LIGHTING ──────────────────────────────────────── */
      // Very low ambient — most light comes from area lights for soft, controlled shadows
      scene.add(new THREE.AmbientLight('#E8E2D8', 0.06));

      // Shadow-casting spot: off-center for dramatic depth
      const shadowSpot = new THREE.SpotLight('#FFF6EC', 0.48, 20, 0.40, 0.80);
      shadowSpot.position.set(-1.5, 6.8, 2.0);
      shadowSpot.castShadow = true;
      shadowSpot.shadow.mapSize.set(2048, 2048);
      shadowSpot.shadow.bias   = -0.00012;
      shadowSpot.shadow.radius = 5.5;
      scene.add(shadowSpot, shadowSpot.target);

      const { RectAreaLightUniformsLib } = await import('three/examples/jsm/lights/RectAreaLightUniformsLib.js');
      if (disposed) return;
      RectAreaLightUniformsLib.init();

      // Key — large overhead softbox, kept intentionally dim
      const keyBox = new THREE.RectAreaLight('#FFF8EE', 1.45, 9.0, 2.2);
      keyBox.position.set(-0.4, 6.8, -0.5); keyBox.lookAt(0, 0, 0); scene.add(keyBox);

      // Front fill — wraps light around the nose
      const frontBox = new THREE.RectAreaLight('#FFF2E8', 0.62, 5.5, 1.6);
      frontBox.position.set(0, 4.8, 4.5); frontBox.lookAt(0, 0.3, 0); scene.add(frontBox);

      // Left wall bounce — warm
      const leftStrip = new THREE.RectAreaLight('#F8F0E8', 0.48, 0.8, 5.0);
      leftStrip.position.set(-7.3, 2.8, 0); leftStrip.lookAt(0, 0.6, 0); scene.add(leftStrip);

      // Right accent — slightly cool, adds tonal separation to the dark paint
      const rightStrip = new THREE.RectAreaLight('#E4EEFF', 0.38, 0.6, 4.0);
      rightStrip.position.set(7.3, 2.5, -1.0); rightStrip.lookAt(0, 0.6, 0); scene.add(rightStrip);

      // Rim — separates rear silhouette from back wall
      const rimSpot = new THREE.SpotLight('#FFFFFF', 0.28, 18, 0.46, 0.78);
      rimSpot.position.set(0, 4.0, -7.0);
      rimSpot.target.position.set(0, 0.4, 0);
      scene.add(rimSpot, rimSpot.target);

      /* ── ENV MAP ───────────────────────────────────────── */
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed) return;
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.008).texture;
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

      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (document.hidden || disposed) return;
        bt += 0.016;

        // Spring camera position + look-at
        const ct = camTgtRef.current;
        let r: [number, number];
        r = sp(camCur.px, camVel.px, ct.px); camCur.px = r[0]; camVel.px = r[1];
        r = sp(camCur.py, camVel.py, ct.py); camCur.py = r[0]; camVel.py = r[1];
        r = sp(camCur.pz, camVel.pz, ct.pz); camCur.pz = r[0]; camVel.pz = r[1];
        r = sp(camCur.lx, camVel.lx, ct.lx); camCur.lx = r[0]; camVel.lx = r[1];
        r = sp(camCur.ly, camVel.ly, ct.ly); camCur.ly = r[0]; camVel.ly = r[1];
        r = sp(camCur.lz, camVel.lz, ct.lz); camCur.lz = r[0]; camVel.lz = r[1];

        // Parallax + breathe (suppressed when zoomed)
        const pF = paralaxRef.current ? 1.0 : 0.06;
        const bF = paralaxRef.current ? 1.0 : 0.18;
        const mx = mouseRef.current.x - 0.5;
        const my = mouseRef.current.y - 0.5;
        camera.position.set(
          camCur.px + mx * 0.17 * pF + Math.sin(bt * 0.27) * 0.052 * bF,
          camCur.py + my * -0.04 * pF + Math.sin(bt * 0.18) * 0.018 * bF,
          camCur.pz,
        );
        camera.lookAt(camCur.lx, camCur.ly, camCur.lz);

        // Spring door
        r = sp(doorCurRef.current, doorVelRef.current, doorTgtRef.current);
        doorCurRef.current = r[0]; doorVelRef.current = r[1];
        if (doorMeshRef.current) doorMeshRef.current.rotation.y = doorCurRef.current;

        // Project hotspot world → screen; update SVG lines imperatively
        const CW = container.offsetWidth, CH = container.offsetHeight;
        CALLOUTS.forEach((c, i) => {
          hsProjected[i].copy(hsWorld[i]).project(camera);
          const behind = hsProjected[i].z >= 1;
          const px = (hsProjected[i].x *  0.5 + 0.5) * CW;
          const py = (hsProjected[i].y * -0.5 + 0.5) * CH;
          const lx = (c.lx / 100) * CW;
          const ly = (c.ly / 100) * CH;

          const line = lineRefs.current[i];
          if (line) {
            line.setAttribute('x1', String(px));
            line.setAttribute('y1', String(py));
            line.setAttribute('x2', String(lx));
            line.setAttribute('y2', String(ly));
            line.style.opacity = behind ? '0' : '1';
          }
          const dot = dotRefs.current[i];
          if (dot) {
            dot.setAttribute('cx', String(px));
            dot.setAttribute('cy', String(py));
            dot.style.opacity = behind ? '0' : '1';
          }
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

        const bodyPaint = new THREE.MeshPhysicalMaterial({
          color: '#050505',
          metalness: 0.90,
          roughness: 0.07,
          clearcoat: 1.0,
          clearcoatRoughness: 0.04,
          envMapIntensity: 0.95,
          specularIntensity: 0.80,
          specularColor: new THREE.Color('#EAE4DC'),
        });
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: '#0A1420', roughness: 0.03,
          transmission: 0.88, transparent: true, opacity: 0.30,
          ior: 1.52, envMapIntensity: 0.75,
        });
        const detailMat = new THREE.MeshStandardMaterial({ color: '#080808', roughness: 0.56, metalness: 0.16 });
        const rimMat = new THREE.MeshPhysicalMaterial({ color: '#0E0E16', metalness: 0.96, roughness: 0.09, envMapIntensity: 1.1 });
        const tireMat = new THREE.MeshStandardMaterial({ color: '#090909', roughness: 0.95 });
        const tailMat = new THREE.MeshPhysicalMaterial({
          color: '#260000', emissive: new THREE.Color('#FF1600'), emissiveIntensity: 2.0,
          roughness: 0.04, transparent: true, opacity: 0.87,
        });
        const headMat = new THREE.MeshPhysicalMaterial({
          color: '#080C10', emissive: new THREE.Color('#80A0FF'), emissiveIntensity: 0.55, roughness: 0.04,
        });

        model.traverse((child: ThreeNS.Object3D) => {
          const mesh = child as ThreeNS.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true; mesh.receiveShadow = true;
          const n = mesh.name.toLowerCase();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (n.includes('glass') || n.includes('window') || (mesh.material as any)?.transparent)
            mesh.material = glassMat;
          else if (n.includes('tire') || n.includes('tyre'))
            mesh.material = tireMat;
          else if (n.includes('rim') || n.includes('wheel'))
            mesh.material = rimMat;
          else if (n.includes('interior') || n.includes('seat') || n.includes('steer') || n.includes('dash'))
            mesh.material = detailMat;
          else if ((n.includes('light') || n.includes('lamp')) && (n.includes('tail') || n.includes('_b') || n.includes('rear') || n.includes('back')))
            mesh.material = tailMat;
          else if (n.includes('head') || (n.includes('light') && (n.includes('_f') || n.includes('front'))))
            mesh.material = headMat;
          else
            mesh.material = bodyPaint;

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
          // Very subtle bloom: only the tail/head lights glow slightly
          comp.addPass(new UBP(new THREE.Vector2(cw, ch), 0.035, 0.50, 0.90));
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

      {/* SVG callout lines — positions updated imperatively each frame */}
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', overflow: 'visible',
          opacity: ready ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}
      >
        {CALLOUTS.map((c, i) => (
          <g key={c.id}>
            {/* Line from label to car anchor */}
            <line
              ref={el => { lineRefs.current[i] = el; }}
              stroke={activeId === c.id ? c.accent : 'rgba(90,85,78,0.38)'}
              strokeWidth={activeId === c.id ? '1.1' : '0.75'}
              strokeDasharray={activeId === c.id ? 'none' : '3 4'}
              style={{ transition: 'stroke 0.5s ease, stroke-width 0.5s ease, stroke-dasharray 0.5s ease' }}
            />
            {/* Dot at car anchor point */}
            <circle
              ref={el => { dotRefs.current[i] = el; }}
              r={activeId === c.id ? 3 : 2}
              fill={activeId === c.id ? c.accent : 'rgba(90,85,78,0.55)'}
              style={{ transition: 'fill 0.5s ease, r 0.5s ease' }}
            />
          </g>
        ))}
      </svg>

      {/* Callout labels — always visible, clickable */}
      {CALLOUTS.map(c => {
        const isActive = activeId === c.id;
        return (
          <button
            key={c.id}
            onClick={() => handleSelect(c.id)}
            aria-label={c.title}
            style={{
              position: 'absolute',
              left:  `${c.lx}%`,
              top:   `${c.ly}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              background: 'none',
              border: 'none',
              padding: '6px 2px',
              cursor: 'pointer',
              zIndex: 12,
              textAlign: 'left',
              opacity: ready ? (isActive ? 1 : 0.52) : 0,
              transition: 'opacity 0.4s ease',
            }}
          >
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              {/* Accent dot */}
              <div style={{
                width:  isActive ? 7 : 4,
                height: isActive ? 7 : 4,
                borderRadius: '50%',
                background: c.accent,
                boxShadow: isActive ? `0 0 9px ${c.accent}88` : 'none',
                flexShrink: 0,
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
              }} />
              <span style={{
                fontFamily: "var(--font-cormorant, 'Cormorant', serif)",
                fontSize: 'clamp(10px, 1.05vw, 13px)',
                fontWeight: 500,
                letterSpacing: '0.02em',
                color: isActive ? '#0A0906' : '#2C2A26',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                transition: 'color 0.38s ease',
              }}>
                {c.title}
              </span>
            </div>
            {/* Tag line */}
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(6px, 0.56vw, 7.5px)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: c.accent,
              opacity: isActive ? 0.88 : 0.5,
              paddingLeft: 11,
              transition: 'opacity 0.38s ease',
            }}>
              {c.tag}
            </div>
          </button>
        );
      })}

      {/* Info panel — slides in on click */}
      <InfoPanel c={activeCallout} onClose={handleClose} />
    </div>
  );
}
