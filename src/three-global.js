// three-global.js
// Advanced Global Background Scene — Flowing Oceanic Particles & Deep Glass Effect
// Optimized but significantly more premium visually

export async function initGlobalScene() {
  const wrap = document.getElementById('global-canvas-wrap'); if (!wrap) return; wrap.innerHTML = ''; const canvas = document.createElement('canvas'); canvas.style.width = '100%'; canvas.style.height = '100%'; wrap.appendChild(canvas);

  let THREE;
  try { THREE = await import('three'); } catch { return; }

  if (!canvas.getContext('webgl') && !canvas.getContext('webgl2')) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x172B36, 0.012); // Oceanic Noir fog, slightly lighter

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 150);
  camera.position.set(0, 10, 30);
  camera.lookAt(0, 0, 0);

  // Colors from Palette + Enhancements
  const C_MINT   = new THREE.Color('#D9E8E2'); 
  const C_TEAL   = new THREE.Color('#114C5A'); 
  const C_GOLD   = new THREE.Color('#FFC801');

  // ── 1. Advanced Particle Flow Field ──────────────────────
  const PARTICLE_COUNT = 800; // Increased for density
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const scales = new Float32Array(PARTICLE_COUNT);
  const phases = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;

    const useGold = Math.random() > 0.95;
    const col = useGold ? C_GOLD : C_MINT;
    
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    scales[i] = Math.random() * 2;
    phases[i] = Math.random() * Math.PI * 2;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

  // Custom Shader Material for glowing, pulsing particles
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pixelRatio: { value: renderer.getPixelRatio() }
    },
    vertexShader: `
      uniform float time;
      uniform float pixelRatio;
      attribute float scale;
      attribute float phase;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec3 pos = position;
        // Flowing motion
        pos.y += sin(time * 0.5 + phase) * 2.0;
        pos.x += cos(time * 0.3 + phase) * 1.5;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        float size = scale * (2.0 + sin(time * 2.0 + phase)) * 15.0;
        gl_PointSize = size * (10.0 / -mvPosition.z) * pixelRatio;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float strength = (0.5 - dist) * 2.0;
        gl_FragColor = vec4(vColor, strength * 0.6);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  });

  const points = new THREE.Points(geometry, particleMaterial);
  scene.add(points);

  // ── 2. Subtle Geometric Grid / Waves ─────────────────────
  const gridHelper = new THREE.GridHelper(120, 40, C_TEAL, C_TEAL);
  gridHelper.position.y = -8;
  gridHelper.material.opacity = 0.2;
  gridHelper.material.transparent = true;
  gridHelper.material.blending = THREE.AdditiveBlending;
  scene.add(gridHelper);

  // ── Scroll Parallax ──────────────────────────────────────
  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  // ── Animation Loop ───────────────────────────────────────
  let raf, destroyed = false;
  const clock = new THREE.Clock();

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    particleMaterial.uniforms.pixelRatio.value = renderer.getPixelRatio();
  }
  window.addEventListener('resize', resize);
  resize();

  function animate() {
    if (destroyed) return;
    raf = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    particleMaterial.uniforms.time.value = time;

    // Parallax logic
    const targetY = - (scrollY * 0.012);
    camera.position.y += (targetY + 10 - camera.position.y) * 0.05;

    // Subtle grid undulation
    gridHelper.position.z = (time * 1.5) % 3;

    renderer.render(scene, camera);
  }

  animate();
}
