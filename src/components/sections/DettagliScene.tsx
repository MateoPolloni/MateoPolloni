'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type * as ThreeNS from 'three';

/* ─── types ─── */
interface CalloutDef {
  id: string;
  worldPos: [number, number, number];
  camPos:   [number, number, number];
  camLook:  [number, number, number];
  lox: number; // px offset X from projected point → label anchor
  loy: number; // px offset Y
  title: string; tag: string; body: string; accent: string;
}

/* ─── ordered top→bottom so lines don't cross ─── */
const CALLOUTS: CalloutDef[] = [
  {
    id: 'glass',
    worldPos: [0.55, 1.06, 0.6],  camPos: [1.0, 1.95, 2.6],  camLook: [0.3, 0.96, 0.5],
    lox: 74, loy: -90,
    title: 'Glass Treatment', tag: 'Hydrophobic · Anti-UV',
    body:  'Water sheets off at 50 mph. UV fully blocked. Every pane clarity-polished before nano-ceramic is applied — inside and out. Visibility redefined.',
    accent: '#6EA4BC',
  },
  {
    id: 'hood',
    worldPos: [0.55, 0.90, 1.35], camPos: [1.2, 2.2, 3.6],   camLook: [0.4, 0.82, 1.0],
    lox: 84, loy: -56,
    title: 'Ceramic Coating', tag: '9H Hardness · 5-Year Bond',
    body:  'A molecular bond that becomes part of your paint. Total resistance to UV, chemicals, and micro-scratches — with a depth of gloss no wax can approach.',
    accent: '#C8A44A',
  },
  {
    id: 'interior',
    worldPos: [0.0, 0.78, 0.15],  camPos: [0.6, 3.4, -0.1],  camLook: [0.0, 0.52, 0.0],
    lox: 102, loy: 4,
    title: 'Interior Detail', tag: 'Full Cabin · Every Surface',
    body:  'Alcantara, leather, carbon — each treated by its own protocol. Sanitised, conditioned, UV-protected from seat to headliner.',
    accent: '#9080C0',
  },
  {
    id: 'body',
    worldPos: [0.88, 0.74, -0.35], camPos: [2.8, 1.5, -2.4], camLook: [0.4, 0.62, -0.5],
    lox: 82, loy: 30,
    title: 'Paint Correction', tag: 'Single to Multi-Stage',
    body:  'Swirl marks, water etch, oxidation — removed at the molecular level. The surface becomes what it was the day it left the factory.',
    accent: '#B08A38',
  },
  {
    id: 'wheel',
    worldPos: [1.02, 0.27, 1.35], camPos: [2.8, 0.68, 2.9],  camLook: [0.9, 0.26, 1.3],
    lox: 62, loy: 72,
    title: 'Tire Dressing', tag: 'Iron Fallout · Caliper Seal',
    body:  'Brake dust and iron fallout chemically dissolved. Calipers colour-sealed. Tires dressed to a deep rich matte — not the synthetic shine that wears off overnight.',
    accent: '#5C92A8',
  },
];

/* lx:2.8 — camera aimed well right of car so car sits in center of Dettagli half */
const DEFAULT_CAM = { px: 5.5, py: 1.42, pz: -5.5, lx: 2.8, ly: 0.55, lz: 0 };
const EASE = [0.16, 1, 0.3, 1] as const;

/* Slow cinematic spring — no jump, pure glide */
const SK = 0.022, SD = 0.74;
function sp(v: number, vel: number, t: number): [number, number] {
  const nv = (vel + (t - v) * SK) * SD;
  return [v + nv, nv];
}

/* ─── INFO PANEL ─── */
function InfoPanel({ c, onClose }: { c: CalloutDef | null; onClose: () => void }) {
  return (
    <AnimatePresence mode="wait">
      {c && (
        <motion.div
          key={c.id}
          className="absolute pointer-events-auto"
          style={{ bottom: 56, left: '52%', transform: 'translateX(-50%)', width: 'clamp(240px, 36%, 300px)', zIndex: 22 }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.52, ease: EASE }}
        >
          <motion.div
            style={{ height: 1, background: c.accent, transformOrigin: 'left' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.44, ease: EASE }}
          />
          <div style={{ background: 'rgba(5,4,3,0.92)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', padding: '15px 19px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontFamily: "var(--font-cormorant,'Cormorant',serif)", fontSize: 21, fontWeight: 400, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#EDE8DE', lineHeight: 1 }}>
                {c.title}
              </h3>
              <button onClick={onClose} style={{ color: 'rgba(220,215,204,0.26)', fontSize: 9, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', lineHeight: 1 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(220,215,204,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(220,215,204,0.26)')}>✕</button>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: 2.0, color: 'rgba(215,210,200,0.42)' }}>{c.body}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── MAIN ─── */
export default function DettagliScene({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady]       = useState(false);

  const pathRefs  = useRef<(SVGPathElement | null)[]>(CALLOUTS.map(() => null));
  const dotRefs   = useRef<(SVGCircleElement | null)[]>(CALLOUTS.map(() => null));
  const labelRefs = useRef<(HTMLButtonElement | null)[]>(CALLOUTS.map(() => null));

  const camCurRef = useRef({ ...DEFAULT_CAM });
  const camVelRef = useRef({ px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0 });
  const camTgtRef = useRef({ ...DEFAULT_CAM });
  const doorCurRef  = useRef(0);
  const doorVelRef  = useRef(0);
  const doorTgtRef  = useRef(0);
  const doorMeshRef = useRef<ThreeNS.Object3D | null>(null);
  const parallaxRef = useRef(true);
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  const handleSelect = useCallback((id: string) => {
    const next = activeIdRef.current === id ? null : id;
    setActiveId(next);
    if (!next) { camTgtRef.current = { ...DEFAULT_CAM }; doorTgtRef.current = 0; parallaxRef.current = true; }
    else {
      const c = CALLOUTS.find(h => h.id === next)!;
      camTgtRef.current  = { px: c.camPos[0], py: c.camPos[1], pz: c.camPos[2], lx: c.camLook[0], ly: c.camLook[1], lz: c.camLook[2] };
      doorTgtRef.current = 0;
      parallaxRef.current = false;
    }
  }, []);

  const handleClose = useCallback(() => {
    setActiveId(null); camTgtRef.current = { ...DEFAULT_CAM }; doorTgtRef.current = 0; parallaxRef.current = true;
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
      renderer.toneMappingExposure = 0.88;
      cleanups.push(() => renderer.dispose());

      /* SCENE */
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#07080A');
      scene.fog = new THREE.Fog('#07080A', 7, 24);

      const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 80);
      camera.position.set(DEFAULT_CAM.px, DEFAULT_CAM.py, DEFAULT_CAM.pz);
      camera.lookAt(DEFAULT_CAM.lx, DEFAULT_CAM.ly, DEFAULT_CAM.lz);

      /* SHADOW RECEIVER FLOOR — invisible plane, only receives shadows from car */
      const shadowFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.ShadowMaterial({ opacity: 0.35 }),
      );
      shadowFloor.rotation.x = -Math.PI / 2;
      shadowFloor.position.y = 0.001;
      shadowFloor.receiveShadow = true;
      scene.add(shadowFloor);

      /* LIGHTING */
      scene.add(new THREE.AmbientLight('#C4BCB0', 0.028));

      // Primary key from directly above — tight cone, pool of light on car
      const key = new THREE.SpotLight('#FFF6E8', 2.8, 18, 0.24, 0.50, 1.4);
      key.position.set(0.5, 9.2, 0.8); key.target.position.set(0.2, 0.52, 0.3);
      key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.00008; key.shadow.radius = 7;
      scene.add(key, key.target);

      // Secondary fill from upper-left
      const key2 = new THREE.SpotLight('#FFF0D8', 1.2, 16, 0.38, 0.7, 1.6);
      key2.position.set(-2.8, 7.0, 1.5); key2.target.position.set(0, 0.7, 0.2);
      scene.add(key2, key2.target);

      // Rim 1 — rear right, cool, creates bright separation edge
      const rim1 = new THREE.SpotLight('#C8DCFF', 1.2, 20, 0.32, 0.58, 1.2);
      rim1.position.set(3.5, 4.5, 9.5); rim1.target.position.set(0.5, 0.65, 0);
      scene.add(rim1, rim1.target);

      // Rim 2 — rear left
      const rim2 = new THREE.SpotLight('#D0E4FF', 0.7, 18, 0.36, 0.65, 1.4);
      rim2.position.set(-4.5, 3.8, 8.5); rim2.target.position.set(-0.2, 0.55, 0.2);
      scene.add(rim2, rim2.target);

      // Soft front fill (doesn't hit floor strongly)
      const fill = new THREE.SpotLight('#FFF4EC', 0.45, 12, 0.6, 0.9, 2.0);
      fill.position.set(-1.5, 2.8, -3.5); fill.target.position.set(0, 1.0, 0.5);
      scene.add(fill, fill.target);

      const { RectAreaLightUniformsLib } = await import('three/examples/jsm/lights/RectAreaLightUniformsLib.js');
      if (disposed) return;
      RectAreaLightUniformsLib.init();
      const area = new THREE.RectAreaLight('#FFF4EC', 0.85, 7.5, 1.8);
      area.position.set(-0.2, 8.0, 0.2); area.lookAt(0, 0, 0); scene.add(area);

      /* ENV MAP */
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed) return;
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.004).texture;
      pmrem.dispose();

      /* HOTSPOT VECTORS */
      const hsWorld     = CALLOUTS.map(c => new THREE.Vector3(...c.worldPos));
      const hsProjected = CALLOUTS.map(() => new THREE.Vector3());

      /* RAF */
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

        r = sp(doorCurRef.current, doorVelRef.current, doorTgtRef.current);
        doorCurRef.current = r[0]; doorVelRef.current = r[1];
        if (doorMeshRef.current) doorMeshRef.current.rotation.y = doorCurRef.current;

        const CW = container.offsetWidth, CH = container.offsetHeight;

        CALLOUTS.forEach((c, i) => {
          hsProjected[i].copy(hsWorld[i]).project(camera);
          const behind = hsProjected[i].z >= 1;
          const px = (hsProjected[i].x *  0.5 + 0.5) * CW;
          const py = (hsProjected[i].y * -0.5 + 0.5) * CH;

          /* label anchor = projected car point + fixed pixel offset */
          const lxPx = px + c.lox;
          const lyPx = py + c.loy;

          /* SHORT straight line from dot → label anchor */
          const d = `M ${f(px)} ${f(py)} L ${f(lxPx - 3)} ${f(lyPx)}`;
          const path = pathRefs.current[i];
          if (path) { path.setAttribute('d', d); path.style.opacity = behind ? '0' : '1'; }
          const dot = dotRefs.current[i];
          if (dot) { dot.setAttribute('cx', f(px)); dot.setAttribute('cy', f(py)); dot.style.opacity = behind ? '0' : '1'; }

          /* update label DOM position imperatively */
          const lbl = labelRefs.current[i];
          if (lbl) {
            lbl.style.left = `${lxPx}px`;
            lbl.style.top  = `${lyPx}px`;
            lbl.style.visibility = behind ? 'hidden' : 'visible';
          }
        });

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

        /* Load car + garage in parallel */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [gltf, garageGltf] = await Promise.all<any>([
          new Promise((res, rej) => loader.load('/models/ferrari.glb', res, undefined, rej)),
          new Promise((res, rej) => loader.load('/models/garage.glb',  res, undefined, rej)),
        ]);
        if (disposed) return;

        /* ── GARAGE ── */
        const garageModel = garageGltf.scene as ThreeNS.Object3D;
        // Garage floor in model space is at y≈-0.84 — lift so it sits at world y=0
        garageModel.position.set(0, 0.84, 0);
        garageModel.traverse((child: ThreeNS.Object3D) => {
          const mesh = child as ThreeNS.Mesh;
          if (mesh.isMesh) {
            mesh.receiveShadow = true;
            mesh.castShadow    = false;
          }
        });
        scene.add(garageModel);

        /* ── CAR ── */
        const model = gltf.scene as ThreeNS.Object3D;
        const bodyPaint = new THREE.MeshPhysicalMaterial({
          color: '#030303', metalness: 0.94, roughness: 0.04,
          clearcoat: 1.0, clearcoatRoughness: 0.03,
          envMapIntensity: 0.75, specularIntensity: 0.80,
          specularColor: new THREE.Color('#E8DFD0'),
        });
        const glassMat  = new THREE.MeshPhysicalMaterial({ color: '#081018', roughness: 0.02, transmission: 0.92, transparent: true, opacity: 0.24, ior: 1.52, envMapIntensity: 0.62 });
        const detailMat = new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.62, metalness: 0.12 });
        const rimMat    = new THREE.MeshPhysicalMaterial({ color: '#0A0A12', metalness: 0.97, roughness: 0.06, envMapIntensity: 0.88 });
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
          comp.addPass(new UBP(new THREE.Vector2(cw, ch), 0.048, 0.44, 0.94));
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

  const activeCallout = CALLOUTS.find(c => c.id === activeId) ?? null;

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none', pointerEvents: 'none' }} />

      {/* Left-edge gradient: protects centered subparagraph text readability */}
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '42%', height: '100%', background: 'linear-gradient(to right, rgba(7,6,5,0.58) 0%, rgba(7,6,5,0) 100%)', pointerEvents: 'none', zIndex: 3 }} />

      {/* SVG overlay — ONLY circles + short lines; labels positioned by JS */}
      <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible', opacity: ready ? 1 : 0, transition: 'opacity 1.8s ease', zIndex: 10 }}>
        {CALLOUTS.map((c, i) => (
          <g key={c.id}>
            <path
              ref={el => { pathRefs.current[i] = el; }}
              fill="none"
              stroke={activeId === c.id ? c.accent : 'rgba(255,255,255,0.38)'}
              strokeWidth={activeId === c.id ? '1.1' : '0.72'}
              style={{ transition: 'stroke 0.5s ease, stroke-width 0.5s ease' }}
            />
            <circle
              ref={el => { dotRefs.current[i] = el; }}
              r={activeId === c.id ? 4.0 : 2.5}
              fill={activeId === c.id ? c.accent : 'rgba(255,255,255,0.52)'}
              style={{ transition: 'fill 0.5s ease' }}
            />
          </g>
        ))}
      </svg>

      {/* Labels — positioned imperatively in RAF loop, float near each car point */}
      {CALLOUTS.map((c, i) => {
        const isActive = activeId === c.id;
        return (
          <button
            key={c.id}
            ref={el => { labelRefs.current[i] = el; }}
            onClick={() => handleSelect(c.id)}
            aria-label={c.title}
            style={{
              position: 'absolute',
              left: 0, top: 0,                   // overridden by JS each frame
              transform: 'translate(0, -50%)',
              pointerEvents: 'auto',
              background: 'none', border: 'none',
              padding: '6px 4px',
              cursor: 'pointer', zIndex: 14,
              textAlign: 'left',
              opacity: ready ? (isActive ? 1 : 0.52) : 0,
              transition: `opacity 0.5s ease ${i * 0.11}s`,
            }}
          >
            {/* Dot + title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <div style={{ width: isActive ? 6 : 3.5, height: isActive ? 6 : 3.5, borderRadius: '50%', background: c.accent, flexShrink: 0, boxShadow: isActive ? `0 0 10px ${c.accent}88` : 'none', transition: 'all 0.46s cubic-bezier(0.16,1,0.3,1)' }} />
              <span style={{ fontFamily: "var(--font-cormorant,'Cormorant',serif)", fontSize: 'clamp(10px,0.88vw,12.5px)', fontWeight: 400, letterSpacing: '0.17em', textTransform: 'uppercase', color: isActive ? '#EDE8DE' : 'rgba(196,190,180,0.78)', lineHeight: 1, whiteSpace: 'nowrap', transition: 'color 0.44s ease' }}>
                {c.title}
              </span>
            </div>
            {/* Tag */}
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(5.5px,0.50vw,7px)', letterSpacing: '0.25em', textTransform: 'uppercase', color: c.accent, opacity: isActive ? 0.82 : 0.38, paddingLeft: 11, transition: 'opacity 0.44s ease' }}>
              {c.tag}
            </div>
          </button>
        );
      })}

      {/* CC Attribution — "Garage" by ROY (Sketchfab, CC BY 4.0) */}
      <div aria-hidden="true" style={{ position: 'absolute', bottom: 10, right: 14, fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.1em', color: 'rgba(180,175,165,0.22)', pointerEvents: 'none', zIndex: 5 }}>
        Garage model · ROY · CC BY 4.0
      </div>

      <InfoPanel c={activeCallout} onClose={handleClose} />
    </div>
  );
}
