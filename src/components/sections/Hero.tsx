'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type * as ThreeNS from 'three';

/* ═══════════════════════════════════════════════
   AUDIO — synthesised piano, no files
═══════════════════════════════════════════════ */
let _ctx: AudioContext | null = null;
const getAudio = () => { if (!_ctx) _ctx = new AudioContext(); if (_ctx.state === 'suspended') _ctx.resume(); return _ctx; };
const SCALE   = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
function playTone(freq: number) {
  const ctx = getAudio(), now = ctx.currentTime;
  [[freq,0.11],[freq*2,0.05],[freq*3,0.022],[freq*4,0.009]].forEach(([f,a]) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(a, now+0.018);
    g.gain.exponentialRampToValueAtTime(0.0001, now+2.6);
    o.start(now); o.stop(now+2.6);
  });
}

/* ═══════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════ */
interface Particle { x:number; y:number; vx:number; vy:number; r:number; a:number; c:string }
interface NoteItem  { id:string; xPct:number; yPct:number; glyph:string; size:number; freq:number; alive:boolean }
interface BurstItem { id:string; x:number; y:number }

const PURPLES = ['#7c3aed','#9d5af5','#c084fc','#6d28d9','#a78bfa'];
const INIT_NOTES: Omit<NoteItem,'alive'>[] = [
  { id:'n1', xPct:14, yPct:17, glyph:'♫', size:70, freq:440 },
  { id:'n2', xPct:40, yPct:26, glyph:'♩', size:54, freq:329 },
  { id:'n3', xPct:20, yPct:55, glyph:'♪', size:80, freq:392 },
  { id:'n4', xPct: 8, yPct:73, glyph:'♬', size:62, freq:523 },
  { id:'n5', xPct:36, yPct:67, glyph:'♫', size:46, freq:294 },
];

/* ═══════════════════════════════════════════════
   SOUNDBUY CANVAS — particles + equalizer only
═══════════════════════════════════════════════ */
function SoundBuyCanvas({ mouseRef }: { mouseRef: React.MutableRefObject<{x:number;y:number}> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ctx = el.getContext('2d'); if (!ctx) return;
    let raf:number, W=0, H=0, t=0, ps:Particle[]=[];
    const init = () => {
      const dpr = Math.min(window.devicePixelRatio||1,2);
      W=el.offsetWidth; H=el.offsetHeight;
      el.width=W*dpr; el.height=H*dpr; el.style.width=W+'px'; el.style.height=H+'px';
      ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr,dpr);
      ps=Array.from({length:55},()=>({ x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.38, vy:-(Math.random()*.26+.04), r:Math.random()*1.65+.35, a:Math.random()*.44+.06, c:PURPLES[Math.floor(Math.random()*PURPLES.length)] }));
    };
    const frame = () => {
      ctx.clearRect(0,0,W,H); t+=.016;
      const g=ctx.createRadialGradient(W*.34,H*.52,0,W*.34,H*.52,W*.8);
      g.addColorStop(0,'rgba(109,40,217,.12)'); g.addColorStop(.55,'rgba(124,58,237,.04)'); g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      const mx=mouseRef.current.x*W, my=mouseRef.current.y*H;
      ps.forEach(p => {
        const dx=p.x-mx,dy=p.y-my,d=Math.sqrt(dx*dx+dy*dy);
        if(d<110&&d>0){const f=(110-d)/110; p.vx+=(dx/d)*f*.11; p.vy+=(dy/d)*f*.08;}
        p.vx*=.978; p.vy*=.978; p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x+=W; if(p.x>W)p.x-=W; if(p.y<0)p.y+=H; if(p.y>H)p.y-=H;
        ctx.globalAlpha=p.a; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=p.c; ctx.fill();
      });
      ctx.globalAlpha=1;
      const bars=30, step=W/bars;
      for(let i=0;i<bars;i++){
        const bh=(Math.sin(t*1.85+i*.48)*.5+.5)*H*.1+3, bx=i*step+step*.2, al=.08+(Math.sin(t*1.25+i*.32)*.5+.5)*.09;
        const bg=ctx.createLinearGradient(0,H-bh,0,H);
        bg.addColorStop(0,`rgba(192,132,252,${(al*2.4).toFixed(3)})`); bg.addColorStop(1,'rgba(124,58,237,0)');
        ctx.fillStyle=bg; ctx.fillRect(bx,H-bh,step*.5,bh);
      }
    };
    const loop=()=>{ if(!document.hidden)frame(); raf=requestAnimationFrame(loop); };
    const ro=new ResizeObserver(init);
    init(); loop(); ro.observe(el);
    return ()=>{ cancelAnimationFrame(raf); ro.disconnect(); };
  }, [mouseRef]);
  return <canvas ref={ref} className="absolute inset-0" style={{width:'100%',height:'100%',display:'block'}} />;
}

/* ═══════════════════════════════════════════════
   GLASS SPHERE NOTE
═══════════════════════════════════════════════ */
function GlassNote({ note, onBurst }: { note:NoteItem; onBurst:(id:string,x:number,y:number)=>void }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleClick = () => {
    if (!note.alive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    onBurst(note.id, rect.left + rect.width/2, rect.top + rect.height/2);
  };
  return (
    <motion.div
      ref={ref}
      onClick={handleClick}
      style={{
        width:  note.size,
        height: note.size,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, rgba(220,180,255,0.14), rgba(140,80,230,0.06) 60%, rgba(80,20,160,0.04))',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: '1px solid rgba(192,132,252,0.22)',
        boxShadow: '0 0 22px rgba(124,58,237,0.14), 0 0 60px rgba(124,58,237,0.06), inset 0 1px 0 rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 5,
      }}
      initial={{ opacity:0, scale:0.4 }}
      animate={note.alive ? { opacity:1, scale:1 } : { opacity:0, scale:0.2 }}
      exit={{ opacity:0, scale:0 }}
      transition={{ duration: note.alive ? 0.8 : 0.4, ease:[0.16,1,0.3,1] }}
      // continuous float
      whileHover={{ scale:1.08, boxShadow:'0 0 32px rgba(124,58,237,0.28), inset 0 1px 0 rgba(255,255,255,0.15)' }}
    >
      {/* inner glow highlight */}
      <div style={{ position:'absolute', top:'12%', left:'18%', width:'28%', height:'22%', borderRadius:'50%', background:'rgba(255,255,255,0.09)', filter:'blur(3px)' }} />
      <span style={{ fontSize: note.size * 0.36, lineHeight:1, color:'#e2ceff', textShadow:'0 0 12px rgba(192,132,252,0.9), 0 0 28px rgba(124,58,237,0.5)', position:'relative', zIndex:1 }}>
        {note.glyph}
      </span>
    </motion.div>
  );
}

/* Float animation wrapper — separate so AnimatePresence controls entry/exit */
function FloatingNote({ note, onBurst }: { note:NoteItem; onBurst:(id:string,x:number,y:number)=>void }) {
  return (
    <motion.div
      style={{ position:'absolute', left:`${note.xPct}%`, top:`${note.yPct}%` }}
      animate={{
        y: [0, -18, 0, 10, 0],
        rotate: [-4, 4, -3, 3, -4],
      }}
      transition={{
        duration: 5 + (parseInt(note.id.slice(1)) * 0.7),
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <GlassNote note={note} onBurst={onBurst} />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   BURST EFFECT
═══════════════════════════════════════════════ */
function BurstEffect({ x, y }: { x:number; y:number }) {
  return (
    <div style={{ position:'fixed', left:x, top:y, pointerEvents:'none', zIndex:100 }}>
      {Array.from({length:22},(_,i)=>{
        const angle = (i/22)*Math.PI*2;
        const dist  = 30 + Math.random()*55;
        return (
          <motion.div
            key={i}
            style={{ position:'absolute', width: 3+Math.random()*4, height: 3+Math.random()*4, borderRadius:'50%', background:PURPLES[i%PURPLES.length], transform:'translate(-50%,-50%)' }}
            initial={{ x:0, y:0, opacity:1, scale:1 }}
            animate={{ x:Math.cos(angle)*dist, y:Math.sin(angle)*dist - 20, opacity:0, scale:0.3 }}
            transition={{ duration:0.9+Math.random()*0.4, ease:'easeOut' }}
          />
        );
      })}
      {/* Central flash */}
      <motion.div
        style={{ position:'absolute', width:50, height:50, borderRadius:'50%', background:'rgba(192,132,252,0.5)', transform:'translate(-50%,-50%)', filter:'blur(8px)' }}
        initial={{ scale:0.3, opacity:1 }}
        animate={{ scale:2.5, opacity:0 }}
        transition={{ duration:0.55, ease:'easeOut' }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SOUNDBUY INFO LABELS
═══════════════════════════════════════════════ */
function SoundBuyLabels() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none select-none"
      initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.4, duration:1.2 }}
    >
      {/* NOW PLAYING — top left */}
      <div style={{ position:'absolute', top:'14%', left:'5%' }}>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:'7px', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(192,132,252,0.45)', marginBottom:6 }}>Now Playing</p>
        <p style={{ fontFamily:'var(--font-display)', fontSize:'14px', color:'rgba(225,210,255,0.75)', letterSpacing:'0.04em' }}>Midnight Bloom</p>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:'9px', color:'rgba(160,120,220,0.4)', letterSpacing:'0.1em', marginTop:3 }}>SoundBuy Originals</p>
      </div>

      {/* BPM — middle left */}
      <div style={{ position:'absolute', top:'46%', left:'5%' }}>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:'7px', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(192,132,252,0.4)', marginBottom:6 }}>BPM</p>
        <p style={{ fontFamily:'var(--font-display)', fontSize:'22px', color:'rgba(225,210,255,0.7)', letterSpacing:'-0.02em', lineHeight:1 }}>128</p>
        {/* Mini waveform */}
        <svg width="70" height="16" viewBox="0 0 70 16" style={{ marginTop:8, opacity:0.45 }}>
          {[3,5,8,4,11,7,9,5,13,8,6,4,9,12,7,5,3,8,6,4].map((h,i)=>(
            <rect key={i} x={i*3.5} y={(16-h)/2} width="2" height={h} rx="1" fill="#c084fc" />
          ))}
        </svg>
      </div>

      {/* KEY — lower left */}
      <div style={{ position:'absolute', top:'70%', left:'5%' }}>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:'7px', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(192,132,252,0.4)', marginBottom:6 }}>Key</p>
        <p style={{ fontFamily:'var(--font-display)', fontSize:'18px', color:'rgba(225,210,255,0.65)', letterSpacing:'0.02em' }}>Am</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   DETTAGLI INFO LABELS
═══════════════════════════════════════════════ */
function DettagliLabels() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none select-none"
      initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.6, duration:1.2 }}
    >
      {/* DETAILING — top right */}
      <div style={{ position:'absolute', top:'14%', right:'4%', textAlign:'right' }}>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:'7px', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(242,241,237,0.3)', marginBottom:6 }}>Detailing</p>
        <p style={{ fontFamily:'var(--font-cormorant)', fontSize:'17px', fontWeight:500, color:'rgba(242,241,237,0.65)', letterSpacing:'0.06em' }}>Perfection</p>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:'9px', color:'rgba(200,200,200,0.3)', letterSpacing:'0.1em', marginTop:3 }}>In Every Detail</p>
      </div>

      {/* FINISH — middle right */}
      <div style={{ position:'absolute', top:'46%', right:'4%', textAlign:'right' }}>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:'7px', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(242,241,237,0.3)', marginBottom:6 }}>Finish</p>
        <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'flex-end' }}>
          <p style={{ fontFamily:'var(--font-cormorant)', fontSize:'16px', fontWeight:500, color:'rgba(242,241,237,0.6)', letterSpacing:'0.06em' }}>Obsidian Black</p>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#0a0a0e', border:'1px solid rgba(242,241,237,0.25)', boxShadow:'0 0 6px rgba(242,241,237,0.1)' }} />
        </div>
      </div>

      {/* PROCESS — lower right */}
      <div style={{ position:'absolute', top:'68%', right:'4%', textAlign:'right' }}>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:'7px', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(242,241,237,0.3)', marginBottom:8 }}>Process</p>
        {['Precision','Passion','Purpose'].map(w=>(
          <p key={w} style={{ fontFamily:'var(--font-cormorant)', fontSize:'14px', fontWeight:500, color:'rgba(242,241,237,0.48)', letterSpacing:'0.06em', lineHeight:1.55 }}>{w}</p>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   DETTAGLI SCENE — Three.js sports car
═══════════════════════════════════════════════ */
function buildCar(THREE: typeof import('three')) {
  const g = new THREE.Group();

  // Automotive clearcoat paint — visible even on dark colors
  const body = new THREE.MeshPhysicalMaterial({
    color: '#0d0d1a',        // dark midnight-blue black
    metalness: 0.88,
    roughness: 0.08,
    clearcoat: 1.0,          // lacquer layer catches light dramatically
    clearcoatRoughness: 0.04,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#1a1a30', metalness:0.05, roughness:0.03,
    transparent:true, opacity:0.55, transmission:0.2,
  });
  const chrome = new THREE.MeshStandardMaterial({ color:'#d8d8e8', metalness:1.00, roughness:0.022 });
  const tire   = new THREE.MeshStandardMaterial({ color:'#080809', metalness:0.02, roughness:0.90 });
  const brakeL = new THREE.MeshStandardMaterial({ color:'#ff2200', emissive:'#ff0500', emissiveIntensity:5, roughness:0.25 });
  const carbon = new THREE.MeshStandardMaterial({ color:'#111114', metalness:0.3,  roughness:0.55 }); // diffuser/splitter

  const add = (geo:ThreeNS.BufferGeometry, mat:ThreeNS.Material, x=0,y=0,z=0,rx=0,ry=0,rz=0) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x,y,z); mesh.rotation.set(rx,ry,rz); mesh.castShadow=true;
    g.add(mesh); return mesh;
  };

  // ── BODY ──────────────────────────────────────────
  add(new THREE.BoxGeometry(4.0,0.42,2.10),  body, 0,0.08);          // main slab
  add(new THREE.BoxGeometry(3.8,0.08,2.24),  body, 0,-0.20);         // lower sill
  // Front
  add(new THREE.BoxGeometry(1.42,0.20,2.02), body,-1.62,0.24, 0, 0.14); // hood slope
  add(new THREE.BoxGeometry(0.28,0.28,2.06), body,-2.12,-0.06);      // front bumper
  add(new THREE.BoxGeometry(0.50,0.04,2.15), carbon,-2.04,-0.26);    // front splitter
  // Front intake vents
  [-0.60,0.60].forEach(z=> add(new THREE.BoxGeometry(0.20,0.10,0.42), carbon,-2.10,-0.12,z));
  // Cabin — low roof for exotic silhouette
  add(new THREE.BoxGeometry(1.58,0.40,1.62), body, 0.05,0.46);
  // Windshield (steep rake)
  add(new THREE.BoxGeometry(0.58,0.38,1.58), glass,-0.76,0.48, 0,-0.44);
  // Rear glass
  add(new THREE.BoxGeometry(0.52,0.34,1.56), glass, 0.88,0.46, 0, 0.42);
  // Rear haunches — wide fender flares
  add(new THREE.BoxGeometry(0.90,0.44,2.20), body, 1.56,0.24, 0,-0.05);
  // Rear fascia
  add(new THREE.BoxGeometry(0.24,0.48,2.12), body, 2.02,0.04);
  // Diffuser fins (lower rear)
  for(let i=-3;i<=3;i++) add(new THREE.BoxGeometry(0.28,0.12,0.04), carbon, 1.88,-0.26,i*0.26);
  // Side skirts
  [-1.10,1.10].forEach(z=> add(new THREE.BoxGeometry(3.2,0.06,0.10), body, 0,-0.22,z));
  // Side air intakes (mid-body)
  [-1.05,1.05].forEach(z=> add(new THREE.BoxGeometry(0.55,0.14,0.06), carbon, 0.6,0.0,z));

  // ── SPOILER ───────────────────────────────────────
  add(new THREE.BoxGeometry(1.80,0.06,0.30),  body, 1.90,0.62);      // blade
  add(new THREE.BoxGeometry(0.06,0.30,0.06), body, 1.90,0.44,-0.62);
  add(new THREE.BoxGeometry(0.06,0.30,0.06), body, 1.90,0.44, 0.62);

  // ── BRAKE LIGHTS — the hero visual ───────────────
  add(new THREE.BoxGeometry(0.045,0.055,1.80), brakeL, 2.04,0.15);   // full-width strip
  [-1.0,1.0].forEach(z=> add(new THREE.BoxGeometry(0.14,0.22,0.28), brakeL, 2.00,0.13,z)); // corner blocks
  const rearGlow = new THREE.PointLight('#ff0500', 5.0, 6);
  rearGlow.position.set(2.2, 0.12, 0); g.add(rearGlow);
  // Floor red bleed
  const floorRed = new THREE.PointLight('#ff1100', 1.5, 3);
  floorRed.position.set(2.0,-0.5,0); g.add(floorRed);

  // ── WHEELS ────────────────────────────────────────
  ([[-1.40,-0.30,1.12],[-1.40,-0.30,-1.12],[1.42,-0.30,1.12],[1.42,-0.30,-1.12]] as [number,number,number][]).forEach(([x,y,z])=>{
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.46,0.14,14,56), tire);
    t.position.set(x,y,z); t.rotation.x=Math.PI/2; t.castShadow=true; g.add(t);
    const side = z>0 ? 0.12 : -0.12;
    // Rim disc
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,0.065,12), chrome);
    r.position.set(x,y,z+side); r.rotation.x=Math.PI/2; g.add(r);
    // 10-spoke Y-spoke pattern
    for(let i=0;i<10;i++){
      const a=(i/10)*Math.PI*2;
      const s=new THREE.Mesh(new THREE.BoxGeometry(0.032,0.30,0.032),chrome);
      s.position.set(x+Math.sin(a)*0.18,y+Math.cos(a)*0.18,z+side); g.add(s);
    }
    // Hub
    const h=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.08,18),chrome);
    h.position.set(x,y,z+side); h.rotation.x=Math.PI/2; g.add(h);
    // Brake caliper (red, behind wheel)
    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.12,0.18,0.08),
      new THREE.MeshStandardMaterial({ color:'#cc0000', emissive:'#880000', emissiveIntensity:0.5, roughness:0.6 }));
    caliper.position.set(x,y,z+(z>0 ? 0.04 : -0.04)); g.add(caliper);
  });

  return g;
}

function DettagliScene({ mouseRef }: { mouseRef: React.MutableRefObject<{x:number;y:number}> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current; if(!el) return;
    let disposed = false;
    const cleanups: (()=>void)[] = [];

    (async()=>{
      const THREE = await import('three');
      if(disposed) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#07070d');
      scene.fog = new THREE.FogExp2('#07070d', 0.055);

      const W=el.offsetWidth, H=el.offsetHeight;
      const camera = new THREE.PerspectiveCamera(40, W/H, 0.1, 60);
      camera.position.set(-1.0, 1.0, 4.8);  // closer, lower — more dramatic
      camera.lookAt(-0.1, 0.05, 0);

      const renderer = new THREE.WebGLRenderer({ canvas:el, antialias:true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 2.4;    // brighter overall exposure
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      cleanups.push(()=>renderer.dispose());

      // Car
      const car = buildCar(THREE);
      car.rotation.y = 0.35;
      scene.add(car);

      // Platform rings
      const goldMat = new THREE.MeshStandardMaterial({ color:'#c09a32', emissive:'#8a6820', emissiveIntensity:0.9, metalness:0.88, roughness:0.10 });
      [2.6, 3.2, 4.0].forEach(r=>{
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r,0.012,8,80), goldMat);
        ring.rotation.x = -Math.PI/2; ring.position.y = -0.83; scene.add(ring);
      });
      const platGlow = new THREE.PointLight('#e0a840', 2.0, 9);
      platGlow.position.y = -0.82; scene.add(platGlow);

      // Ground — mirror-like showroom floor
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(60,60),
        new THREE.MeshStandardMaterial({ color:'#040408', metalness:0.99, roughness:0.008 })
      );
      ground.rotation.x = -Math.PI/2; ground.position.y = -0.83;
      ground.receiveShadow = true; scene.add(ground);

      // ── LIGHTS ────────────────────────────────────
      scene.add(new THREE.AmbientLight('#ffffff', 0.06));

      // KEY — strong warm from upper-front-left (creates the big highlight on bodywork)
      const key = new THREE.SpotLight('#fff0d8', 22, 35, 0.42, 0.40);
      key.position.set(-5, 6, 4); key.castShadow = true;
      key.shadow.mapSize.set(2048,2048); scene.add(key, key.target);

      // RIM — cold blue-white from upper-rear-right (outlines the car silhouette)
      const rim = new THREE.SpotLight('#b8d0ff', 16, 28, 0.38, 0.50);
      rim.position.set(5, 4.5, -5); scene.add(rim, rim.target);

      // COUNTER-RIM — subtle from rear-left (prevents full black on that side)
      const rimL = new THREE.SpotLight('#8090d0', 6, 22, 0.45, 0.65);
      rimL.position.set(-4, 2.5, -4); scene.add(rimL, rimL.target);

      // FILL — very soft front
      const fill = new THREE.PointLight('#c8d8ff', 1.2, 20);
      fill.position.set(0, 0.5, 6); scene.add(fill);

      // OVERHEAD — roof highlight
      const over = new THREE.DirectionalLight('#d0e0ff', 0.55);
      over.position.set(0, 10, 0); scene.add(over);

      // Underfloor show-car glow (blue-purple)
      const under = new THREE.PointLight('#4030aa', 2.5, 4);
      under.position.set(0, -0.7, 0); scene.add(under);

      // SWEEP — moving spotlight for upper-area light streak
      const sweep = new THREE.SpotLight('#ffffff', 3.0, 40, 0.06, 0.85);
      sweep.position.set(6, 9, 2); scene.add(sweep, sweep.target);

      let autoRot = 0.35, mrY=0,tmrY=0,mrX=0,tmrX=0, sweepT=0;
      let raf: number;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if(document.hidden||disposed) return;
        autoRot += 0.0022; sweepT += 0.008;

        tmrY = (mouseRef.current.x-0.5)*0.65;
        tmrX = (mouseRef.current.y-0.5)*-0.28;
        mrY += (tmrY-mrY)*0.025; mrX += (tmrX-mrX)*0.025;

        car.rotation.y = autoRot + mrY;
        car.rotation.x = mrX * 0.14;
        car.position.y = Math.sin(autoRot*0.75)*0.055;

        // Key light drifts — creates dynamic body reflections
        key.position.x = -4 + mouseRef.current.x*1.8;
        key.position.z = 3.5 - mouseRef.current.y*1.0;

        // Animated sweep light (the upper-right light streak effect)
        sweep.position.x = 5 + Math.sin(sweepT)*3;
        sweep.position.z = 2 + Math.cos(sweepT*0.7)*2;

        renderer.render(scene, camera);
      };
      loop();
      cleanups.push(()=>cancelAnimationFrame(raf));

      const ro = new ResizeObserver(()=>{
        if(disposed) return;
        const w=el.offsetWidth,h=el.offsetHeight;
        camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h);
      });
      ro.observe(el);
      cleanups.push(()=>ro.disconnect());
    })();

    return ()=>{ disposed=true; cleanups.forEach(fn=>fn()); };
  }, [mouseRef]);

  return <canvas ref={ref} className="absolute inset-0" style={{width:'100%',height:'100%',display:'block'}} />;
}

/* ═══════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════ */
export default function Hero() {
  const { t, lang } = useLanguage();

  const mouseRef = useRef({ x:0.5, y:0.5 });
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  useEffect(()=>{
    const onMove = (e:MouseEvent)=>{ const x=e.clientX/window.innerWidth,y=e.clientY/window.innerHeight; mouseRef.current={x,y}; mx.set(x); my.set(y); };
    const onTouch= (e:TouchEvent)=>{ const t=e.touches[0]; if(!t)return; const x=t.clientX/window.innerWidth,y=t.clientY/window.innerHeight; mouseRef.current={x,y}; mx.set(x); my.set(y); };
    window.addEventListener('mousemove',onMove,{passive:true});
    window.addEventListener('touchmove',onTouch,{passive:true});
    return ()=>{ window.removeEventListener('mousemove',onMove); window.removeEventListener('touchmove',onTouch); };
  },[mx,my]);

  // Spring divider
  const rawDiv = useTransform(mx,[0,1],[43,57]);
  const divider = useSpring(rawDiv,{stiffness:38,damping:19,mass:1.2});
  const leftClip  = useTransform(divider,v=>`polygon(0 0, ${v}% 0, ${v}% 100%, 0 100%)`);
  const rightClip = useTransform(divider,v=>`polygon(${v}% 0, 100% 0, 100% 100%, ${v}% 100%)`);
  const divPos    = useTransform(divider,v=>`${v}%`);
  const textX = useTransform(mx,[0,1],[7,-7]);
  const textY = useTransform(my,[0,1],[3.5,-3.5]);

  // Glass notes state
  const [notes, setNotes] = useState<NoteItem[]>(INIT_NOTES.map(n=>({...n,alive:true})));
  const [bursts, setBursts] = useState<BurstItem[]>([]);

  const handleBurst = useCallback((id:string, x:number, y:number) => {
    setNotes(prev=>prev.map(n=>n.id===id?{...n,alive:false}:n));
    setBursts(prev=>[...prev,{id:`${id}-${Date.now()}`,x,y}]);
    playTone(INIT_NOTES.find(n=>n.id===id)?.freq??440);
    // Remove burst after animation
    setTimeout(()=>setBursts(prev=>prev.filter(b=>!b.id.startsWith(id))),1200);
    // Respawn note after delay
    setTimeout(()=>setNotes(prev=>prev.map(n=>n.id===id?{...n,alive:true,xPct:8+Math.random()*32,yPct:10+Math.random()*70}:n)),3500);
  },[]);

  return (
    <motion.section
      className="relative w-full overflow-hidden"
      style={{height:'calc(100dvh - 4rem)',minHeight:'560px'}}
      initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1.1,ease:'easeOut'}}
    >
      {/* SoundBuy world */}
      <motion.div className="absolute inset-0" style={{clipPath:leftClip,background:'#06060a'}}>
        <SoundBuyCanvas mouseRef={mouseRef} />
        <SoundBuyLabels />
        <AnimatePresence>
          {notes.map(note=>(
            <FloatingNote key={note.id} note={note} onBurst={handleBurst} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Dettagli world — pointer-events:none, clicks fall through */}
      <motion.div className="absolute inset-0" style={{clipPath:rightClip,pointerEvents:'none'}}>
        <DettagliScene mouseRef={mouseRef} />
        <DettagliLabels />
      </motion.div>

      {/* Burst particles (fixed, above everything) */}
      <AnimatePresence>
        {bursts.map(b=><BurstEffect key={b.id} x={b.x} y={b.y} />)}
      </AnimatePresence>

      {/* Divider */}
      <motion.div
        className="absolute top-0 bottom-0 w-px pointer-events-none"
        style={{
          left:divPos,
          background:'linear-gradient(to bottom, transparent 4%, rgba(255,255,255,.08) 26%, rgba(255,255,255,.2) 50%, rgba(255,255,255,.08) 74%, transparent 96%)',
          boxShadow:'0 0 10px rgba(255,255,255,.04), 0 0 28px rgba(255,255,255,.02)',
        }}
      />

      {/* Headline */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-8">
        <motion.div
          className="text-center"
          style={{x:textX,y:textY}}
          initial={{opacity:0,y:22}} animate={{opacity:1,y:0}}
          transition={{duration:1.25,delay:0.35,ease:[0.16,1,0.3,1]}}
        >
          <h1 style={{fontFamily:'var(--font-display)',fontWeight:600,fontSize:'clamp(36px, 5.6vw, 90px)',lineHeight:1.1,letterSpacing:'-0.03em',color:'#F0EDE8'}}>
            {lang==='en'?(
              <>I design websites<br/>that{' '}<em style={{fontFamily:'var(--font-cormorant)',fontStyle:'italic',fontWeight:300,letterSpacing:'0.01em'}}>feel</em>{' '}like something.</>
            ):(
              <>Diseño sitios web<br/>que{' '}<em style={{fontFamily:'var(--font-cormorant)',fontStyle:'italic',fontWeight:300,letterSpacing:'0.01em'}}>transmiten</em>{' '}algo.</>
            )}
          </h1>
          <p style={{margin:'1.4rem auto 0',fontFamily:'var(--font-sans)',fontSize:'clamp(12px, 1.05vw, 15px)',lineHeight:1.75,letterSpacing:'0.01em',color:'#60608a',maxWidth:'360px'}}>
            {t.hero.sub}
          </p>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-10 md:px-14 pb-9 pointer-events-none">

        {/* SoundBuy label */}
        <motion.div className="flex flex-col gap-2.5 pointer-events-auto" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.9,delay:.85,ease:[.16,1,.3,1]}}>
          <div className="flex items-center gap-2">
            <svg width="18" height="13" viewBox="0 0 18 13" fill="none" aria-hidden="true">
              {([[3,4],[6,8],[9,13],[12,8],[15,4]] as [number,number][]).map(([x,h],i)=>(
                <rect key={i} x={x-1} y={(13-h)/2} width="2" height={h} rx="1" fill="rgba(192,132,252,.6)"/>
              ))}
            </svg>
            <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:'13px',letterSpacing:'0.15em',background:'linear-gradient(135deg,#eeeeff 0%,#c084fc 45%,#7c3aed 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
              SOUNDBUY
            </span>
          </div>
          <a href="https://soundbuy-ten.vercel.app/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors duration-300"
            style={{fontFamily:'var(--font-sans)',fontSize:'8.5px',letterSpacing:'0.28em',textTransform:'uppercase',color:'#5050a0'}}
            onMouseEnter={e=>(e.currentTarget.style.color='#c084fc')}
            onMouseLeave={e=>(e.currentTarget.style.color='#5050a0')}
          >
            Explore Project
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 8.5 8.5 1.5M8.5 1.5H3M8.5 1.5V7"/></svg>
          </a>
        </motion.div>

        {/* Center hint */}
        <motion.div className="flex flex-col items-center gap-2.5 pb-0.5" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1,delay:1.3}}>
          <span style={{fontFamily:'var(--font-sans)',fontSize:'6.5px',letterSpacing:'0.32em',textTransform:'uppercase',color:'rgba(240,237,232,.22)',textAlign:'center',lineHeight:1.8}}>
            MOVE THE CURSOR<br/>EXPLORE BOTH WORLDS
          </span>
          <div className="w-px h-6" style={{background:'linear-gradient(to bottom,rgba(240,237,232,.2),transparent)'}}/>
        </motion.div>

        {/* Dettagli label */}
        <motion.div className="flex flex-col gap-2.5 items-end pointer-events-auto" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.9,delay:1.0,ease:[.16,1,.3,1]}}>
          <span style={{fontFamily:"'Cormorant',serif",fontWeight:500,fontSize:'16px',letterSpacing:'0.15em',color:'#f2f1ed',textTransform:'uppercase'}}>
            DETTAGLI
          </span>
          <a href="https://dettagli-six.vercel.app/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors duration-300"
            style={{fontFamily:'var(--font-sans)',fontSize:'8.5px',letterSpacing:'0.28em',textTransform:'uppercase',color:'#606068'}}
            onMouseEnter={e=>(e.currentTarget.style.color='#f2f1ed')}
            onMouseLeave={e=>(e.currentTarget.style.color='#606068')}
          >
            Explore Project
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 8.5 8.5 1.5M8.5 1.5H3M8.5 1.5V7"/></svg>
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
}
