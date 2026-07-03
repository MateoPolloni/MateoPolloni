'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/* ═══════════════════════════════════════════════════
   AUDIO — synthesised piano tone, no audio files
═══════════════════════════════════════════════════ */
let _audioCtx: AudioContext | null = null;
const getCtx = () => {
  if (!_audioCtx) _audioCtx = new AudioContext();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
};
// Pentatonic — always consonant
const SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
function playTone(freq: number) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Fundamental + 3 harmonics → piano-like timbre
  ([
    [freq,     0.12],
    [freq * 2, 0.055],
    [freq * 3, 0.025],
    [freq * 4, 0.010],
  ] as [number, number][]).forEach(([f, amp]) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(amp, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
    osc.start(now);
    osc.stop(now + 2.6);
  });
}

/* ═══════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════ */
interface Particle { x:number; y:number; vx:number; vy:number; r:number; a:number; c:string }
interface Note     { x:number; y:number; vx:number; vy:number; rot:number; rotV:number; size:number; alpha:number; glyph:string; dying:boolean; age:number }
interface Spark    { x:number; y:number; vx:number; vy:number; alpha:number; size:number; life:number }

const PURPLES = ['#7c3aed','#9d5af5','#c084fc','#6d28d9','#a78bfa','#e2d9f3'];
const GLYPHS  = ['♩','♪','♫','♬'];

/* ═══════════════════════════════════════════════════
   SOUNDBUY CANVAS
   Particles + drifting musical notes + click-to-burst
═══════════════════════════════════════════════════ */
function SoundBuyCanvas({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let W = 0, H = 0, t = 0;
    let particles: Particle[] = [];
    let notes: Note[]         = [];
    let sparks: Spark[]       = [];

    /* ── init ── */
    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = el.offsetWidth; H = el.offsetHeight;
      el.width  = W * dpr; el.height = H * dpr;
      el.style.width  = W + 'px';
      el.style.height = H + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      particles = Array.from({ length: 55 }, () => ({
        x: Math.random() * W,  y: Math.random() * H,
        vx: (Math.random() - .5) * .38,
        vy: -(Math.random() * .26 + .04),
        r: Math.random() * 1.65 + .35,
        a: Math.random() * .45 + .06,
        c: PURPLES[Math.floor(Math.random() * PURPLES.length)],
      }));

      if (notes.length === 0)
        notes = Array.from({ length: 5 }, spawnNote);
    };

    const spawnNote = (): Note => ({
      x: Math.random() * W * .82 + W * .04,
      y: Math.random() * H * .72 + H * .08,
      vx: (Math.random() - .5) * .16,
      vy: -(Math.random() * .10 + .025),
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - .5) * .007,
      size: Math.random() * 15 + 22,
      alpha: 0,
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      dying: false, age: 0,
    });

    const burstNote = (note: Note) => {
      for (let i = 0; i < 26; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = Math.random() * 2.4 + .5;
        sparks.push({ x: note.x, y: note.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - .4, alpha: 1, size: Math.random() * 2.4 + .5, life: 1 });
      }
      playTone(SCALE[Math.floor(Math.random() * SCALE.length)]);
      note.dying = true;
      setTimeout(() => {
        notes = notes.filter(n => n !== note);
        setTimeout(() => { notes.push(spawnNote()); }, 2800);
      }, 900);
    };

    /* ── interaction ── */
    const onClick = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      if (cx > W * .58) return; // ignore right (Dettagli) side
      for (const note of notes) {
        if (note.dying) continue;
        const dx = note.x - cx, dy = note.y - cy;
        if (Math.sqrt(dx * dx + dy * dy) < note.size * .9) { burstNote(note); break; }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      if (cx > W * .58) { el.style.cursor = 'default'; return; }
      let onNote = false;
      for (const n of notes) {
        if (n.dying) continue;
        const dx = n.x - cx, dy = n.y - cy;
        if (Math.sqrt(dx * dx + dy * dy) < n.size * .9) { onNote = true; break; }
      }
      el.style.cursor = onNote ? 'pointer' : 'default';
    };

    el.addEventListener('click', onClick);
    el.addEventListener('mousemove', onMouseMove);

    /* ── frame ── */
    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      t += .016;

      // Ambient purple glow
      const g = ctx.createRadialGradient(W * .34, H * .52, 0, W * .34, H * .52, W * .8);
      g.addColorStop(0, 'rgba(109,40,217,.12)');
      g.addColorStop(.55, 'rgba(124,58,237,.04)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      const mx = mouseRef.current.x * W;
      const my = mouseRef.current.y * H;

      // Particles
      particles.forEach(p => {
        const dx = p.x - mx, dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110 && dist > 0) { const f = (110 - dist) / 110; p.vx += (dx / dist) * f * .11; p.vy += (dy / dist) * f * .08; }
        p.vx *= .978; p.vy *= .978;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x += W; if (p.x > W) p.x -= W;
        if (p.y < 0) p.y += H; if (p.y > H) p.y -= H;
        ctx.globalAlpha = p.a;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c; ctx.fill();
      });

      // Notes
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      notes.forEach(n => {
        n.age += .016; n.x += n.vx; n.y += n.vy; n.rot += n.rotV;
        // Drift away from cursor
        const ndx = n.x - mx, ndy = n.y - my;
        const nd = Math.sqrt(ndx * ndx + ndy * ndy);
        if (nd < 90 && nd > 0) { n.vx += (ndx / nd) * .035; n.vy += (ndy / nd) * .028; }
        n.vx *= .992; n.vy *= .992;
        // Wrap
        if (n.x < -60) n.x = W + 60; if (n.x > W + 60) n.x = -60;
        if (n.y < -60) n.y = H + 60; if (n.y > H + 60) n.y = -60;
        // Alpha — fade in, breathe, fade out on dying
        const target = n.dying ? 0 : Math.min(.55, n.age * .6) * (.85 + Math.sin(n.age * .5) * .15);
        n.alpha += (target - n.alpha) * .06;

        ctx.save();
        ctx.translate(n.x, n.y); ctx.rotate(n.rot);
        ctx.globalAlpha = n.alpha;
        ctx.font = `${n.size}px serif`;
        ctx.shadowColor = '#c084fc'; ctx.shadowBlur = 14;
        ctx.fillStyle = '#ddc8ff';
        ctx.fillText(n.glyph, 0, 0);
        ctx.shadowBlur = 0;
        ctx.restore();
      });

      // Sparks
      sparks = sparks.filter(s => s.alpha > .01);
      sparks.forEach(s => {
        s.x += s.vx; s.y += s.vy;
        s.vy += .045;
        s.vx *= .96; s.vy *= .96;
        s.life -= .022;
        s.alpha = Math.max(0, s.life * s.life);
        ctx.globalAlpha = s.alpha;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = PURPLES[Math.floor(Math.random() * 3)]; ctx.fill();
      });

      ctx.globalAlpha = 1;

      // Equalizer bars
      const bars = 30, step = W / bars;
      for (let i = 0; i < bars; i++) {
        const bh = (Math.sin(t * 1.85 + i * .48) * .5 + .5) * H * .1 + 3;
        const bx = i * step + step * .2;
        const al = .08 + (Math.sin(t * 1.25 + i * .32) * .5 + .5) * .09;
        const bg = ctx.createLinearGradient(0, H - bh, 0, H);
        bg.addColorStop(0, `rgba(192,132,252,${(al * 2.4).toFixed(3)})`);
        bg.addColorStop(1, 'rgba(124,58,237,0)');
        ctx.fillStyle = bg; ctx.fillRect(bx, H - bh, step * .5, bh);
      }
    };

    const loop = () => { if (!document.hidden) frame(); raf = requestAnimationFrame(loop); };
    const ro   = new ResizeObserver(init);
    init(); loop(); ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('click', onClick);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, [mouseRef]);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

/* ═══════════════════════════════════════════════════
   DETTAGLI SCENE — Three.js premium alloy wheel
   Torus + 10 spokes + hub + ground reflection
   Mouse-reactive yaw, gentle float + auto-spin
═══════════════════════════════════════════════════ */
function DettagliScene({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let disposed = false;
    const cleanups: (() => void)[] = [];

    (async () => {
      const THREE = await import('three');
      if (disposed) return;

      /* scene */
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#0a0a0c');
      scene.fog = new THREE.FogExp2('#0a0a0c', 0.09);

      /* camera */
      const W = el.offsetWidth, H = el.offsetHeight;
      const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 50);
      camera.position.set(0, 0.28, 4.4);
      camera.lookAt(0, 0, 0);

      /* renderer */
      const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.75;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      cleanups.push(() => renderer.dispose());

      /* materials */
      const metalMat = new THREE.MeshStandardMaterial({ color: '#d4d4e4', metalness: 1.0, roughness: 0.032 });
      const darkMat  = new THREE.MeshStandardMaterial({ color: '#0a0a12', metalness: 0.98, roughness: 0.038 });
      const tireMat  = new THREE.MeshStandardMaterial({ color: '#060608', metalness: 0.04, roughness: 0.88  });

      /* ── wheel group ── */
      const wheel = new THREE.Group();
      scene.add(wheel);

      // Tyre
      wheel.add(new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.265, 16, 96), tireMat));

      // Outer rim ring (front face)
      wheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.735, 0.04, 12, 96), metalMat));
      // Outer rim ring (back lip)
      const backRim = new THREE.Mesh(new THREE.TorusGeometry(0.735, 0.028, 10, 96), metalMat);
      backRim.position.z = -0.09;
      wheel.add(backRim);

      // Inner hub ring
      wheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.152, 0.03, 8, 48), metalMat));

      // 10 spokes
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.062, 0.534, 0.048),
          metalMat,
        );
        spoke.position.set(Math.sin(angle) * 0.443, Math.cos(angle) * 0.443, 0);
        spoke.rotation.z = -angle;
        wheel.add(spoke);
      }

      // Hub cylinder (faces camera)
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.128, 0.128, 0.13, 28), metalMat);
      hub.rotation.x = Math.PI / 2;
      wheel.add(hub);

      // Centre cap (slightly recessed)
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.055, 32), darkMat);
      cap.rotation.x = Math.PI / 2;
      cap.position.z = 0.038;
      wheel.add(cap);

      /* ── lights ── */
      scene.add(new THREE.AmbientLight('#ffffff', 0.06));

      // Key light — warm, upper left, casts shadows
      const key = new THREE.SpotLight('#fff5e0', 5.8, 24, 0.44, 0.5);
      key.position.set(-3.2, 4.5, 2.8);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      scene.add(key, key.target);

      // Rim light — cold blue, from behind right
      const rim = new THREE.SpotLight('#8aa4ff', 3.2, 20, 0.38, 0.55);
      rim.position.set(3.8, 2.8, -3.8);
      scene.add(rim, rim.target);

      // Front fill — very soft, keeps front readable
      const fill = new THREE.PointLight('#ffe8d0', 0.48, 12);
      fill.position.set(0, -.5, 4.5);
      scene.add(fill);

      // Cold overhead
      const overhead = new THREE.DirectionalLight('#c0d0ff', 0.32);
      overhead.position.set(0, 6, 0);
      scene.add(overhead);

      /* ── ground (reflective showroom floor) ── */
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshStandardMaterial({ color: '#050508', metalness: 0.98, roughness: 0.018 }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -1.3;
      ground.receiveShadow = true;
      scene.add(ground);

      /* ── animation ── */
      let autoRot   = 0;
      let mouseRotY = 0, targetMouseRotY = 0;
      let mouseRotX = 0, targetMouseRotX = 0;

      let raf: number;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (document.hidden || disposed) return;

        autoRot += 0.0055; // slow spin

        targetMouseRotY = (mouseRef.current.x - 0.5) * 0.75;
        targetMouseRotX = (mouseRef.current.y - 0.5) * -0.32;
        mouseRotY += (targetMouseRotY - mouseRotY) * 0.026;
        mouseRotX += (targetMouseRotX - mouseRotX) * 0.026;

        wheel.rotation.z = autoRot;            // spin on natural torus axis
        wheel.rotation.y = mouseRotY;          // reveal depth from mouse X
        wheel.rotation.x = mouseRotX * 0.22;  // gentle nod from mouse Y
        wheel.position.y = Math.sin(autoRot * 0.55) * 0.072; // float

        // Subtle key-light drift with mouse — suggests reflections changing
        key.position.x = -3.2 + mouseRef.current.x * 1.2 - 0.6;
        key.position.y =  4.5 + mouseRef.current.y * -0.6 + 0.3;

        renderer.render(scene, camera);
      };
      loop();
      cleanups.push(() => cancelAnimationFrame(raf));

      /* ── resize ── */
      const ro = new ResizeObserver(() => {
        if (disposed) return;
        const w = el.offsetWidth, h = el.offsetHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
      ro.observe(el);
      cleanups.push(() => ro.disconnect());
    })();

    return () => {
      disposed = true;
      cleanups.forEach(fn => fn());
    };
  }, [mouseRef]);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

/* ═══════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════ */
export default function Hero() {
  const { t, lang } = useLanguage();

  /* shared mouse position — normalized 0–1 */
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      mouseRef.current = { x, y };
      mx.set(x); my.set(y);
    };
    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0]; if (!touch) return;
      const x = touch.clientX / window.innerWidth;
      const y = touch.clientY / window.innerHeight;
      mouseRef.current = { x, y };
      mx.set(x); my.set(y);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, [mx, my]);

  /* spring-driven divider — mouse maps [0,1] → [43%,57%] */
  const rawDivider = useTransform(mx, [0, 1], [43, 57]);
  const divider    = useSpring(rawDivider, { stiffness: 38, damping: 19, mass: 1.2 });

  const leftClip   = useTransform(divider, v => `polygon(0 0, ${v}% 0, ${v}% 100%, 0 100%)`);
  const rightClip  = useTransform(divider, v => `polygon(${v}% 0, 100% 0, 100% 100%, ${v}% 100%)`);
  const dividerPos = useTransform(divider, v => `${v}%`);

  /* headline parallax — opposite to cursor */
  const textX = useTransform(mx, [0, 1], [7, -7]);
  const textY = useTransform(my, [0, 1], [3.5, -3.5]);

  return (
    <motion.section
      className="relative w-full overflow-hidden"
      style={{ height: 'calc(100dvh - 4rem)', minHeight: '560px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
    >
      {/* ── SoundBuy world ── */}
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: leftClip, background: '#06060a' }}
      >
        <SoundBuyCanvas mouseRef={mouseRef} />
      </motion.div>

      {/* ── Dettagli world — pointer-events:none so clicks fall through ── */}
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: rightClip, pointerEvents: 'none' }}
      >
        <DettagliScene mouseRef={mouseRef} />
      </motion.div>

      {/* ── Divider line ── */}
      <motion.div
        className="absolute top-0 bottom-0 w-px pointer-events-none"
        style={{
          left: dividerPos,
          background: 'linear-gradient(to bottom, transparent 4%, rgba(255,255,255,.08) 26%, rgba(255,255,255,.2) 50%, rgba(255,255,255,.08) 74%, transparent 96%)',
          boxShadow: '0 0 10px rgba(255,255,255,.04), 0 0 28px rgba(255,255,255,.02)',
        }}
      />

      {/* ── Central headline ── */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-8">
        <motion.div
          className="text-center"
          style={{ x: textX, y: textY }}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.25, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'clamp(36px, 5.6vw, 90px)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#F0EDE8',
            }}
          >
            {lang === 'en' ? (
              <>
                I design websites<br />
                that{' '}
                <em style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300, letterSpacing: '0.01em' }}>
                  feel
                </em>
                {' '}like something.
              </>
            ) : (
              <>
                Diseño sitios web<br />
                que{' '}
                <em style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300, letterSpacing: '0.01em' }}>
                  transmiten
                </em>
                {' '}algo.
              </>
            )}
          </h1>
          <p
            style={{
              margin: '1.4rem auto 0',
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(12px, 1.05vw, 15px)',
              lineHeight: 1.75,
              letterSpacing: '0.01em',
              color: '#60608a',
              maxWidth: '360px',
            }}
          >
            {t.hero.sub}
          </p>
        </motion.div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-10 md:px-14 pb-9 pointer-events-none">

        {/* SoundBuy label */}
        <motion.div
          className="flex flex-col gap-2.5 pointer-events-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2">
            <svg width="18" height="13" viewBox="0 0 18 13" fill="none" aria-hidden="true">
              {([[3,4],[6,8],[9,13],[12,8],[15,4]] as [number,number][]).map(([x, h], i) => (
                <rect key={i} x={x - 1} y={(13 - h) / 2} width="2" height={h} rx="1" fill="rgba(192,132,252,.6)" />
              ))}
            </svg>
            <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:'13px', letterSpacing:'0.15em', background:'linear-gradient(135deg,#eeeeff 0%,#c084fc 45%,#7c3aed 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              SOUNDBUY
            </span>
          </div>
          <a href="https://soundbuy-ten.vercel.app/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors duration-300"
            style={{ fontFamily:'var(--font-sans)', fontSize:'8.5px', letterSpacing:'0.28em', textTransform:'uppercase', color:'#5050a0' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c084fc')}
            onMouseLeave={e => (e.currentTarget.style.color = '#5050a0')}
          >
            Explore Project
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 8.5 8.5 1.5M8.5 1.5H3M8.5 1.5V7" />
            </svg>
          </a>
        </motion.div>

        {/* Scroll + cursor hint */}
        <motion.div
          className="flex flex-col items-center gap-2 pb-0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <span style={{ fontFamily:'var(--font-sans)', fontSize:'7px', letterSpacing:'0.32em', textTransform:'uppercase', color:'rgba(240,237,232,.18)' }}>
            SCROLL
          </span>
          <div className="w-px h-7" style={{ background:'linear-gradient(to bottom, rgba(240,237,232,.2), transparent)' }} />
        </motion.div>

        {/* Dettagli label */}
        <motion.div
          className="flex flex-col gap-2.5 items-end pointer-events-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <span style={{ fontFamily:"'Cormorant',serif", fontWeight:500, fontSize:'16px', letterSpacing:'0.15em', color:'#f2f1ed', textTransform:'uppercase' }}>
            DETTAGLI
          </span>
          <a href="https://dettagli-six.vercel.app/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors duration-300"
            style={{ fontFamily:'var(--font-sans)', fontSize:'8.5px', letterSpacing:'0.28em', textTransform:'uppercase', color:'#606068' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f2f1ed')}
            onMouseLeave={e => (e.currentTarget.style.color = '#606068')}
          >
            Explore Project
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 8.5 8.5 1.5M8.5 1.5H3M8.5 1.5V7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
}
