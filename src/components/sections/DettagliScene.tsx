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
}

const SERVICES: ServiceDef[] = [
  {
    id: 'ceramic',
    title: 'Ceramic Coating',
    tag: '9H Hardness · 5-Year Bond',
    body: 'A molecular bond that becomes part of your paint. Total resistance to UV, chemicals, and micro-scratches — with a depth of gloss no wax can approach.',
    camPos: [1.2, 2.2, 3.6], camLook: [0.4, 0.82, 1.0],
    accent: '#C8A44A',
  },
  {
    id: 'tires',
    title: 'Tire Dressing',
    tag: 'Iron Fallout · Caliper Seal',
    body: 'Brake dust and iron fallout chemically dissolved. Calipers colour-sealed. Tires dressed to a deep rich matte — not the synthetic shine that wears off overnight.',
    camPos: [2.8, 0.68, 2.9], camLook: [0.9, 0.26, 1.3],
    accent: '#5C92A8',
  },
  {
    id: 'interior',
    title: 'Interior Detailing',
    tag: 'Full Cabin · Every Surface',
    body: 'Alcantara, leather, carbon — each treated by its own protocol. Sanitised, conditioned, UV-protected from seat to headliner.',
    camPos: [0.6, 3.4, -0.1], camLook: [0.0, 0.52, 0.0],
    accent: '#9080C0',
  },
  {
    id: 'paint',
    title: 'Paint Correction',
    tag: 'Single to Multi-Stage',
    body: 'Swirl marks, water etch, oxidation — removed at the molecular level. The surface becomes what it was the day it left the factory.',
    camPos: [2.8, 1.5, -2.4], camLook: [0.4, 0.62, -0.5],
    accent: '#B08A38',
  },
  {
    id: 'glass',
    title: 'Glass Treatment',
    tag: 'Hydrophobic · Anti-UV',
    body: 'Water sheets off at 50 mph. UV fully blocked. Every pane clarity-polished before nano-ceramic is applied — inside and out. Visibility redefined.',
    camPos: [1.0, 1.95, 2.6], camLook: [0.3, 0.96, 0.5],
    accent: '#6EA4BC',
  },
];

/*
 * Camera sits outside the garage entrance (z=-5.5), looking through it.
 * Original garage orientation (no rotation): entrance at z=-4.53, back wall at z=+4.53,
 * left wall at x=-3.33. Camera right vector ≈ (-0.96, 0, -0.25), so the left-side wall
 * corner appears at canvas ~78–94% — right edge of the Dettagli panel.
 */
const DEFAULT_CAM = { px: 3.0, py: 1.6, pz: -5.5, lx: 0.5, ly: 0.55, lz: 4.0 };
const EASE = [0.16, 1, 0.3, 1] as const;

const SK = 0.022, SD = 0.74;
function sp(v: number, vel: number, t: number): [number, number] {
  const nv = (vel + (t - v) * SK) * SD;
  return [v + nv, nv];
}

/* ─── INFO PANEL ─── */
function InfoPanel({ s, onClose }: { s: ServiceDef | null; onClose: () => void }) {
  return (
    <AnimatePresence mode="wait">
      {s && (
        <motion.div
          key={s.id}
          className="absolute pointer-events-auto"
          style={{ bottom: 56, left: '52%', transform: 'translateX(-50%)', width: 'clamp(240px, 36%, 300px)', zIndex: 22 }}
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
          <div style={{ background: 'rgba(5,4,3,0.92)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', padding: '15px 19px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontFamily: "var(--font-cormorant,'Cormorant',serif)", fontSize: 21, fontWeight: 400, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#EDE8DE', lineHeight: 1 }}>
                {s.title}
              </h3>
              <button
                onClick={onClose}
                style={{ color: 'rgba(220,215,204,0.26)', fontSize: 9, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', lineHeight: 1 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(220,215,204,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(220,215,204,0.26)')}
              >✕</button>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: 2.0, color: 'rgba(215,210,200,0.42)' }}>{s.body}</p>
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
      renderer.toneMappingExposure = 0.50;
      cleanups.push(() => renderer.dispose());

      /* SCENE */
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#07080A');
      scene.fog = new THREE.Fog('#07080A', 6, 18);

      const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 80);
      camera.position.set(DEFAULT_CAM.px, DEFAULT_CAM.py, DEFAULT_CAM.pz);
      camera.lookAt(DEFAULT_CAM.lx, DEFAULT_CAM.ly, DEFAULT_CAM.lz);

      /* LIGHTING — controlled showroom levels */
      scene.add(new THREE.AmbientLight('#C4BCB0', 0.012));

      const key = new THREE.SpotLight('#FFF6E8', 1.1, 18, 0.20, 0.55, 1.5);
      key.position.set(0.5, 9.2, 0.8); key.target.position.set(0.2, 0.52, 0.3);
      key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.00008; key.shadow.radius = 7;
      scene.add(key, key.target);

      const key2 = new THREE.SpotLight('#FFF0D8', 0.45, 16, 0.38, 0.7, 1.8);
      key2.position.set(-2.8, 7.0, 1.5); key2.target.position.set(0, 0.7, 0.2);
      scene.add(key2, key2.target);

      const rim1 = new THREE.SpotLight('#C8DCFF', 0.42, 20, 0.32, 0.60, 1.4);
      rim1.position.set(3.5, 4.5, 9.5); rim1.target.position.set(0.5, 0.65, 0);
      scene.add(rim1, rim1.target);

      const rim2 = new THREE.SpotLight('#D0E4FF', 0.22, 18, 0.36, 0.65, 1.5);
      rim2.position.set(-4.5, 3.8, 8.5); rim2.target.position.set(-0.2, 0.55, 0.2);
      scene.add(rim2, rim2.target);

      const fill = new THREE.SpotLight('#FFF4EC', 0.16, 12, 0.6, 0.9, 2.2);
      fill.position.set(-1.5, 2.8, -3.5); fill.target.position.set(0, 1.0, 0.5);
      scene.add(fill, fill.target);

      const wallAcc = new THREE.SpotLight('#FFE8D0', 0.22, 20, 0.65, 0.95);
      wallAcc.position.set(-1.5, 5.5, 7.5); wallAcc.target.position.set(-1.5, 0.5, 5.0);
      scene.add(wallAcc, wallAcc.target);

      const { RectAreaLightUniformsLib } = await import('three/examples/jsm/lights/RectAreaLightUniformsLib.js');
      if (disposed) return;
      RectAreaLightUniformsLib.init();
      const area = new THREE.RectAreaLight('#FFF4EC', 0.32, 7.5, 1.8);
      area.position.set(-0.2, 8.0, 0.2); area.lookAt(0, 0, 0); scene.add(area);

      /* STUDIO EXTENSION PLANES — fill geometry gaps at FOV edges */
      const studioMat = new THREE.MeshStandardMaterial({ color: '#0C0B09', roughness: 0.97, side: THREE.DoubleSide });
      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), studioMat);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.position.set(-6.0, 4.0, 1.5);
      scene.add(leftWall);
      const ceilCap = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), studioMat);
      ceilCap.rotation.x = Math.PI / 2;
      ceilCap.position.set(-1.5, 4.2, 1.5);
      scene.add(ceilCap);
      cleanups.push(() => studioMat.dispose());

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

        /*
         * GARAGE — original orientation, NO rotation.
         * Interior-facing normals point inward naturally; DoubleSide added as a safety net
         * so walls remain visible from all service camera angles.
         * Floor at model y=-0.84 → lift +0.84 so it aligns with world y=0.
         */
        const garageModel = garageGltf.scene as ThreeNS.Object3D;
        garageModel.position.set(0, 0.84, 0);
        garageModel.traverse((child: ThreeNS.Object3D) => {
          const mesh = child as ThreeNS.Mesh;
          if (mesh.isMesh) {
            mesh.receiveShadow = true;
            mesh.castShadow    = false;
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach(m => { (m as ThreeNS.Material).side = THREE.DoubleSide; });
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
        });
        model.position.set(0, 0.15, 0);
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

  const activeService = SERVICES.find(s => s.id === activeId) ?? null;

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none', pointerEvents: 'none' }} />

      {/* Left-edge gradient: shields typography from light bleed */}
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '58%', height: '100%', background: 'linear-gradient(to right, rgba(5,4,3,0.82) 0%, rgba(5,4,3,0.18) 70%, rgba(5,4,3,0) 100%)', pointerEvents: 'none', zIndex: 3 }} />

      {/* Vertical service menu — far right edge of Dettagli panel */}
      <nav
        aria-label="Dettagli services"
        style={{
          position: 'absolute',
          right: 18,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          zIndex: 20,
          pointerEvents: ready ? 'auto' : 'none',
          opacity: ready ? 1 : 0,
          transition: 'opacity 1.4s ease',
        }}
      >
        {SERVICES.map((s, i) => {
          const isActive = activeId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '9px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                opacity: isActive ? 1 : 0.30,
                transition: `opacity 0.45s ease ${i * 0.06}s`,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.opacity = '0.65'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.opacity = '0.30'; }}
            >
              <span style={{
                fontFamily: "var(--font-cormorant,'Cormorant',serif)",
                fontSize: 11,
                fontWeight: 400,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: isActive ? '#EDE8DE' : 'rgba(196,190,180,0.9)',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                transition: 'color 0.44s ease',
              }}>
                {s.title}
              </span>
              {/* Accent line — grows in when service is active */}
              <div style={{
                width: isActive ? 14 : 0,
                height: 1,
                background: s.accent,
                flexShrink: 0,
                transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
              }} />
            </button>
          );
        })}
      </nav>

      {/* CC Attribution — "Garage" by ROY (Sketchfab, CC BY 4.0) */}
      <div aria-hidden="true" style={{ position: 'absolute', bottom: 10, right: 14, fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.1em', color: 'rgba(180,175,165,0.22)', pointerEvents: 'none', zIndex: 5 }}>
        Garage model · ROY · CC BY 4.0
      </div>

      <InfoPanel s={activeService} onClose={handleClose} />
    </div>
  );
}
