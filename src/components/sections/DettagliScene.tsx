'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type * as ThreeNS from 'three';

/* ─── types ─── */
interface ServiceDef {
  id: string;
  title: string;
  tag: string;
  body: string;
  camPos: [number, number, number];
  camLook: [number, number, number];
  accent: string;
  carTarget: [number, number]; // fraction of FULL canvas [x, y]
}

const SERVICES: ServiceDef[] = [
  {
    id: 'ceramic',
    title: 'Ceramic Coating',
    tag: '9H Hardness · 5-Year Bond',
    body: 'A molecular bond that becomes part of your paint. Total resistance to UV, chemicals, and micro-scratches — with a depth of gloss no wax can approach.',
    // Right-side 3/4 view of the car's door/side panel
    camPos: [2.5, 1.4, -0.2], camLook: [0.1, 0.79, 1.5],
    accent: '#C8A44A',
    carTarget: [0.63, 0.47],
  },
  {
    id: 'tires',
    title: 'Tire Dressing',
    tag: 'Iron Fallout · Caliper Seal',
    body: 'Brake dust and iron fallout chemically dissolved. Calipers colour-sealed. Tires dressed to a deep rich matte — not the synthetic shine that wears off overnight.',
    // Right side, low, at front of car — looks along right side toward front-right wheel; wheel at canvas ~75%
    // Verified: camera-right ≈ (-0.98, 0, -0.20); wheel Δx=-1.65, Δz=-1.2 → canvas ~75%
    camPos: [2.5, 0.55, 0.5], camLook: [1.8, 0.55, 4.0],
    accent: '#5C92A8',
    carTarget: [0.75, 0.53],
  },
  {
    id: 'interior',
    title: 'Interior Detailing',
    tag: 'Full Cabin · Every Surface',
    body: 'Alcantara, leather, carbon — each treated by its own protocol. Sanitised, conditioned, UV-protected from seat to headliner.',
    // Left-rear, elevated above roofline — camera BEHIND car (z=3.5) looking forward into open cabin
    // Transitions to/from right-side cameras cross x=0 at y≥1.77, clearing the roofline (~y=1.32)
    camPos: [-1.5, 2.5, 3.5], camLook: [-1.0, 0.75, 0.8],
    accent: '#9080C0',
    carTarget: [0.72, 0.50],
  },
  {
    id: 'paint',
    title: 'Paint Correction',
    tag: 'Single to Multi-Stage',
    body: 'Swirl marks, water etch, oxidation — removed at the molecular level. The surface becomes what it was the day it left the factory.',
    // Right-rear, just past car's rear — showcases right rear quarter panel
    camPos: [2.5, 1.4, 3.8], camLook: [0.5, 0.72, 2.5],
    accent: '#B08A38',
    carTarget: [0.61, 0.48],
  },
  {
    id: 'glass',
    title: 'Glass Treatment',
    tag: 'Hydrophobic · Anti-UV',
    body: 'Water sheets off at 50 mph. UV fully blocked. Every pane clarity-polished before nano-ceramic is applied — inside and out. Visibility redefined.',
    // Further in front (z=-2.5); lookAt at right A-pillar area makes windshield glass land at canvas ~76%
    camPos: [2.5, 1.3, -2.5], camLook: [0.75, 1.05, 0.8],
    accent: '#6EA4BC',
    carTarget: [0.76, 0.38],
  },
];

/*
 * Camera at px=2.0 inside the garage near the entrance (pz=-4.0; entrance is at z=-4.53).
 * Camera right vector ≈ (-0.97, 0, -0.18): car center lands at canvas ~74%.
 */
const DEFAULT_CAM = { px: 2.0, py: 1.8, pz: -4.0, lx: 0.5, ly: 0.77, lz: 4.0 };
const EASE = [0.16, 1, 0.3, 1] as const;

const SK = 0.022, SD = 0.74;
function sp(v: number, vel: number, t: number): [number, number] {
  const nv = (vel + (t - v) * SK) * SD;
  return [v + nv, nv];
}

/* ─── CONNECTOR LINE ─── */
function ConnectorLine({ active, cW, cH }: { active: ServiceDef | null; cW: number; cH: number }) {
  if (!active || cW === 0 || cH === 0) return null;

  // InfoPanel anchor: top-center of panel (bottom: 56px, panel height ~155px, centered at 75% of canvas width)
  const ax = cW * 0.75;
  const ay = cH - 56 - 155;

  const tx = active.carTarget[0] * cW;
  const ty = active.carTarget[1] * cH;

  // Gentle quadratic bezier — control point bows slightly toward the target
  const cx1 = ax + (tx - ax) * 0.30;
  const cy1 = ay + (ty - ay) * 0.15;
  const d = `M ${ax} ${ay} Q ${cx1} ${cy1} ${tx} ${ty}`;

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 16 }}
      viewBox={`0 0 ${cW} ${cH}`}
    >
      {/*
        Using AnimatePresence without mode="wait" (default "sync"):
        exit and enter run concurrently, so switching services never leaves
        an empty gap. mode="wait" was the bug — it required the 1s exit to
        complete before the new line could appear.
      */}
      <AnimatePresence>
        <motion.g key={active.id}>
          {/* Connector path — delayed so the description panel appears first */}
          <motion.path
            d={d}
            fill="none"
            stroke={active.accent}
            strokeWidth={0.7}
            strokeOpacity={0.45}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{ pathLength: { duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.3, delay: 0.55 } }}
          />
          {/* Panel anchor tick */}
          <motion.line
            x1={ax - 7} y1={ay} x2={ax + 7} y2={ay}
            stroke={active.accent}
            strokeWidth={0.7}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.55 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ delay: 0.55, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Car target dot */}
          <motion.circle
            cx={tx} cy={ty} r={2.5}
            fill={active.accent}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ delay: 1.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Pulse ring — explicit exit transition prevents repeat from blocking AnimatePresence */}
          <motion.circle
            cx={tx} cy={ty} r={2}
            fill="none"
            stroke={active.accent}
            strokeWidth={0.5}
            animate={{ r: [2, 14], opacity: [0.55, 0] }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ delay: 1.3, duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}

/* ─── INFO PANEL ─── */
function InfoPanel({ s, onClose }: { s: ServiceDef | null; onClose: () => void }) {
  return (
    <AnimatePresence mode="wait">
      {s && (
        <motion.div
          key={s.id}
          className="pointer-events-auto"
          style={{
            position: 'absolute',
            bottom: 56,
            left: '75%',
            transform: 'translateX(-50%)',
            width: 'clamp(220px, 28%, 290px)',
            zIndex: 22,
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.52, ease: EASE }}
        >
          <motion.div
            style={{ height: 1, background: s.accent, transformOrigin: 'left' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.44, ease: EASE }}
          />
          <div style={{
            background: 'rgba(5,4,3,0.94)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderTop: 'none',
            padding: '14px 18px 17px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 9 }}>
              <h3 style={{
                fontFamily: "var(--font-cormorant,'Cormorant',serif)",
                fontSize: 19,
                fontWeight: 400,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: '#EDE8DE',
                lineHeight: 1,
              }}>
                {s.title}
              </h3>
              <button
                onClick={onClose}
                style={{ color: 'rgba(220,215,204,0.24)', fontSize: 9, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', lineHeight: 1, marginLeft: 10, flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(220,215,204,0.72)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(220,215,204,0.24)')}
              >✕</button>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 11 }} />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, lineHeight: 2.0, color: 'rgba(215,210,200,0.42)' }}>{s.body}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── SERVICE NAV — right-side vertical, redesigned for clarity and presence ─── */
function ServiceNav({
  activeId,
  onSelect,
  ready,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
  ready: boolean;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  return (
    <nav
      aria-label="Dettagli services"
      style={{
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 200,
        zIndex: 20,
        pointerEvents: ready ? 'auto' : 'none',
        opacity: ready ? 1 : 0,
        transition: 'opacity 1.6s ease',
        background: 'rgba(5,4,3,0.76)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

      {SERVICES.map((s, i) => {
        const isActive = activeId === s.id;
        const isHover = hoverId === s.id && !isActive;

        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            onMouseEnter={() => setHoverId(s.id)}
            onMouseLeave={() => setHoverId(null)}
            aria-pressed={isActive}
            style={{
              display: 'block',
              width: '100%',
              background: isActive
                ? `linear-gradient(to left, ${s.accent}12 0%, transparent 72%)`
                : isHover
                  ? 'rgba(255,255,255,0.025)'
                  : 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.055)',
              borderLeft: 'none',
              cursor: 'pointer',
              padding: '15px 20px 15px 0',
              textAlign: 'right',
              position: 'relative',
              transition: 'background 0.45s ease',
            }}
          >
            {/* Left accent strip */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: isActive ? 2 : 1,
              background: isActive ? s.accent : 'rgba(255,255,255,0.06)',
              boxShadow: isActive ? `0 0 10px 1px ${s.accent}55` : 'none',
              transition: 'background 0.45s ease, width 0.3s ease, box-shadow 0.45s ease',
            }} />

            {/* Number */}
            <div style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 7.5,
              letterSpacing: '0.24em',
              color: isActive ? s.accent : 'rgba(255,255,255,0.20)',
              marginBottom: 7,
              transition: 'color 0.4s ease',
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>

            {/* Title */}
            <motion.div
              animate={{ x: isHover ? -3 : 0 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: "var(--font-cormorant,'Cormorant',serif)",
                fontSize: 14.5,
                fontWeight: 400,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isActive ? '#F2ECE0' : isHover ? 'rgba(210,204,193,0.66)' : 'rgba(200,195,185,0.36)',
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
                marginBottom: 6,
                transition: 'color 0.4s ease',
              }}
            >
              {s.title}
            </motion.div>

            {/* Tag — always present; opacity communicates interactivity */}
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 7,
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: isActive ? s.accent : isHover ? 'rgba(200,190,175,0.40)' : 'rgba(200,190,175,0.22)',
              transition: 'color 0.45s ease',
            }}>
              {s.tag}
            </div>
          </button>
        );
      })}

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.055)' }} />
    </nav>
  );
}

/* ─── MAIN ─── */
export default function DettagliScene({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId]     = useState<string | null>(null);
  const [ready, setReady]           = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const camCurRef   = useRef({ ...DEFAULT_CAM });
  const camVelRef   = useRef({ px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0 });
  const camTgtRef   = useRef({ ...DEFAULT_CAM });
  const parallaxRef = useRef(true);
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  const handleSelect = useCallback((id: string) => {
    const next = activeIdRef.current === id ? null : id;
    setActiveId(next);
    if (!next) {
      camTgtRef.current = { ...DEFAULT_CAM };
      parallaxRef.current = true;
    } else {
      const s = SERVICES.find(h => h.id === next)!;
      camTgtRef.current = { px: s.camPos[0], py: s.camPos[1], pz: s.camPos[2], lx: s.camLook[0], ly: s.camLook[1], lz: s.camLook[2] };
      parallaxRef.current = false;
    }
  }, []);

  const handleClose = useCallback(() => {
    setActiveId(null);
    camTgtRef.current = { ...DEFAULT_CAM };
    parallaxRef.current = true;
  }, []);

  useEffect(() => {
    const el = canvasRef.current, container = containerRef.current;
    if (!el || !container) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    (async () => {
      const THREE = await import('three');
      if (disposed) return;

      /* RENDERER */
      const W = el.offsetWidth, H = el.offsetHeight;
      const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.38;
      cleanups.push(() => renderer.dispose());

      setCanvasSize({ w: W, h: H });

      /* SCENE */
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#07080A');
      scene.fog = new THREE.Fog('#07080A', 11, 26);

      const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 80);
      camera.position.set(DEFAULT_CAM.px, DEFAULT_CAM.py, DEFAULT_CAM.pz);
      camera.lookAt(DEFAULT_CAM.lx, DEFAULT_CAM.ly, DEFAULT_CAM.lz);

      /* LIGHTING — car at y=0.22; all spotlight targets shifted to match */
      scene.add(new THREE.AmbientLight('#C4BCB0', 0.008));

      const key = new THREE.SpotLight('#FFF6E8', 0.55, 18, 0.20, 0.55, 1.5);
      key.position.set(0.5, 9.2, 2.3); key.target.position.set(0.2, 0.59, 1.5);
      key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.00008; key.shadow.radius = 7;
      scene.add(key, key.target);

      const key2 = new THREE.SpotLight('#FFF0D8', 0.20, 16, 0.38, 0.7, 1.8);
      key2.position.set(-2.8, 7.0, 3.0); key2.target.position.set(0, 0.77, 1.5);
      scene.add(key2, key2.target);

      const rim1 = new THREE.SpotLight('#C8DCFF', 0.18, 20, 0.32, 0.60, 1.4);
      rim1.position.set(3.5, 4.5, 9.5); rim1.target.position.set(0.5, 0.72, 1.5);
      scene.add(rim1, rim1.target);

      const rim2 = new THREE.SpotLight('#D0E4FF', 0.09, 18, 0.36, 0.65, 1.5);
      rim2.position.set(-4.5, 3.8, 8.5); rim2.target.position.set(-0.2, 0.62, 1.5);
      scene.add(rim2, rim2.target);

      const fill = new THREE.SpotLight('#FFF4EC', 0.07, 12, 0.6, 0.9, 2.2);
      fill.position.set(-1.5, 2.8, -3.5); fill.target.position.set(0, 1.07, 1.5);
      scene.add(fill, fill.target);

      const wallFill = new THREE.SpotLight('#EEE4D0', 0.35, 28, 0.80, 0.85);
      wallFill.position.set(0.0, 4.8, 0.5); wallFill.target.position.set(0.0, 1.5, 4.6);
      scene.add(wallFill, wallFill.target);

      const sideWallFill = new THREE.SpotLight('#EEE4D0', 0.14, 20, 0.75, 0.90);
      sideWallFill.position.set(-1.5, 4.0, 1.0); sideWallFill.target.position.set(-3.5, 1.0, 1.0);
      scene.add(sideWallFill, sideWallFill.target);

      const { RectAreaLightUniformsLib } = await import('three/examples/jsm/lights/RectAreaLightUniformsLib.js');
      if (disposed) return;
      RectAreaLightUniformsLib.init();
      const area = new THREE.RectAreaLight('#FFF4EC', 0.12, 7.5, 1.8);
      area.position.set(-0.2, 8.0, 1.5); area.lookAt(0, 0.57, 1.5); scene.add(area);

      /* STUDIO ENCLOSURE */
      const studioMat = new THREE.MeshStandardMaterial({ color: '#0A0908', roughness: 0.97, side: THREE.DoubleSide });
      const wallMat   = new THREE.MeshStandardMaterial({ color: '#1E1B18', roughness: 0.94, metalness: 0.04, side: THREE.DoubleSide });

      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 5), wallMat);
      backWall.position.set(0, 1.5, 4.6);
      scene.add(backWall);

      const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 5), wallMat);
      frontWall.rotation.y = Math.PI;
      frontWall.position.set(0, 1.5, -4.7);
      scene.add(frontWall);

      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 5), wallMat);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.position.set(-3.5, 1.5, 0.0);
      scene.add(leftWall);

      const winBlocker = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), studioMat);
      winBlocker.rotation.y = -Math.PI / 2;
      winBlocker.position.set(4.18, 1.5, 0.2);
      scene.add(winBlocker);

      const ceilCap = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), studioMat);
      ceilCap.rotation.x = Math.PI / 2;
      ceilCap.position.set(-1.5, 4.2, 1.5);
      scene.add(ceilCap);

      cleanups.push(() => { studioMat.dispose(); wallMat.dispose(); });

      /* ENV MAP */
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed) return;
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.004).texture;
      pmrem.dispose();

      /* RAF */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let composerObj: any = null;
      let bt = 0, raf: number;
      const camCur = camCurRef.current;
      const camVel = camVelRef.current;

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

        const pF = parallaxRef.current ? 1.0 : 0.04;
        const bF = parallaxRef.current ? 1.0 : 0.12;
        const mx = mouseRef.current.x - 0.5;
        const my = mouseRef.current.y - 0.5;
        camera.position.set(
          camCur.px + mx * 0.12 * pF + Math.sin(bt * 0.22) * 0.04 * bF,
          camCur.py + my * -0.03 * pF + Math.sin(bt * 0.15) * 0.012 * bF,
          camCur.pz,
        );
        camera.lookAt(camCur.lx, camCur.ly, camCur.lz);

        composerObj ? composerObj.render() : renderer.render(scene, camera);
      };
      loop();
      cleanups.push(() => cancelAnimationFrame(raf));

      /* RESIZE */
      const ro = new ResizeObserver(() => {
        if (disposed) return;
        const w = el.offsetWidth, h = el.offsetHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        if (composerObj) composerObj.setSize(w, h);
        setCanvasSize({ w, h });
      });
      ro.observe(el); cleanups.push(() => ro.disconnect());

      /* LOAD ASSETS */
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
        const [gltf, garageGltf] = await Promise.all<any>([
          new Promise((res, rej) => loader.load('/models/ferrari.glb', res, undefined, rej)),
          new Promise((res, rej) => loader.load('/models/garage.glb',  res, undefined, rej)),
        ]);
        if (disposed) return;

        /* GARAGE */
        const garageModel = garageGltf.scene as ThreeNS.Object3D;
        garageModel.position.set(0, 0.84, 0);
        garageModel.traverse((child: ThreeNS.Object3D) => {
          const mesh = child as ThreeNS.Mesh;
          if (mesh.isMesh) {
            mesh.receiveShadow = true;
            mesh.castShadow    = false;
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach(m => {
              const mat = m as ThreeNS.MeshStandardMaterial;
              mat.side = THREE.DoubleSide;
              if (mat.transparent || mat.opacity < 0.95) {
                mat.color.set('#080808');
                mat.transparent = false;
                mat.opacity = 1.0;
                mat.roughness = 0.92;
                mat.metalness = 0.0;
                mat.needsUpdate = true;
              }
            });
          }
        });
        scene.add(garageModel);

        const garageClone = (garageGltf.scene as ThreeNS.Object3D).clone(true);
        garageClone.rotation.y = Math.PI;
        garageClone.position.set(0, 0.85, 0);
        scene.add(garageClone);

        /* CAR — y=0.22 grounds the tires naturally on the floor */
        const model = gltf.scene as ThreeNS.Object3D;
        const bodyPaint = new THREE.MeshPhysicalMaterial({
          color: '#030303', metalness: 0.94, roughness: 0.04,
          clearcoat: 1.0, clearcoatRoughness: 0.03,
          envMapIntensity: 0.40, specularIntensity: 0.65,
          specularColor: new THREE.Color('#E8DFD0'),
        });
        const glassMat  = new THREE.MeshPhysicalMaterial({ color: '#081018', roughness: 0.02, transmission: 0.92, transparent: true, opacity: 0.24, ior: 1.52, envMapIntensity: 0.32 });
        const detailMat = new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.62, metalness: 0.12 });
        const rimMat    = new THREE.MeshPhysicalMaterial({ color: '#0A0A12', metalness: 0.97, roughness: 0.06, envMapIntensity: 0.48 });
        const tireMat   = new THREE.MeshStandardMaterial({ color: '#070707', roughness: 0.97 });
        const tailMat   = new THREE.MeshPhysicalMaterial({ color: '#200000', emissive: new THREE.Color('#FF1400'), emissiveIntensity: 1.8, roughness: 0.04, transparent: true, opacity: 0.88 });
        const headMat   = new THREE.MeshPhysicalMaterial({ color: '#060A10', emissive: new THREE.Color('#6888FF'), emissiveIntensity: 0.42, roughness: 0.04 });

        model.traverse((child: ThreeNS.Object3D) => {
          const mesh = child as ThreeNS.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true; mesh.receiveShadow = true;
          const n = mesh.name.toLowerCase();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if      (n.includes('glass') || n.includes('window') || (mesh.material as any)?.transparent) mesh.material = glassMat;
          else if (n.includes('tire')  || n.includes('tyre'))  mesh.material = tireMat;
          else if (n.includes('rim')   || n.includes('wheel')) mesh.material = rimMat;
          else if (n.includes('interior') || n.includes('seat') || n.includes('steer') || n.includes('dash')) mesh.material = detailMat;
          else if ((n.includes('light') || n.includes('lamp')) && (n.includes('tail') || n.includes('_b') || n.includes('rear') || n.includes('back'))) mesh.material = tailMat;
          else if (n.includes('head')  || (n.includes('light') && (n.includes('_f') || n.includes('front')))) mesh.material = headMat;
          else mesh.material = bodyPaint;
        });
        model.position.set(0, 0.22, 1.5);
        scene.add(model);
        draco.dispose();
        setReady(true);

        if (!disposed) {
          const cw = el.offsetWidth, ch = el.offsetHeight;
          const target = new THREE.WebGLRenderTarget(cw, ch, { samples: 8, type: THREE.HalfFloatType });
          const comp = new EC(renderer, target);
          comp.addPass(new RP(scene, camera));
          comp.addPass(new UBP(new THREE.Vector2(cw, ch), 0.016, 0.36, 0.98));
          comp.addPass(new SP());
          comp.addPass(new OP());
          composerObj = comp;
        }
      } catch (err) {
        console.error('DettagliScene: load failed', err);
        setReady(true);
      }
    })();

    return () => { disposed = true; cleanups.forEach(fn => fn()); };
  }, [mouseRef]);

  const activeService = SERVICES.find(s => s.id === activeId) ?? null;

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none', pointerEvents: 'none' }}
      />

      {/* Left-edge gradient */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 0, left: 0, width: '58%', height: '100%',
          background: 'linear-gradient(to right, rgba(5,4,3,0.82) 0%, rgba(5,4,3,0.18) 70%, rgba(5,4,3,0) 100%)',
          pointerEvents: 'none', zIndex: 3,
        }}
      />
      {/* Right-edge vignette — reinforces the nav's dark backdrop against bright garage windows */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 0, right: 0, width: '22%', height: '100%',
          background: 'linear-gradient(to left, rgba(4,3,2,0.65) 0%, rgba(4,3,2,0.20) 55%, rgba(4,3,2,0) 100%)',
          pointerEvents: 'none', zIndex: 4,
        }}
      />

      {/* SVG connector line — only renders when canvas size is known */}
      <ConnectorLine active={activeService} cW={canvasSize.w} cH={canvasSize.h} />

      {/* Description panel */}
      <InfoPanel s={activeService} onClose={handleClose} />

      {/* Right-side service selector */}
      <ServiceNav activeId={activeId} onSelect={handleSelect} ready={ready} />

      {/* CC Attribution */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: 10, right: 14,
          fontFamily: 'var(--font-sans)', fontSize: 8, letterSpacing: '0.10em',
          color: 'rgba(180,175,165,0.16)', pointerEvents: 'none', zIndex: 5,
        }}
      >
        Garage · ROY · CC BY 4.0
      </div>
    </div>
  );
}
