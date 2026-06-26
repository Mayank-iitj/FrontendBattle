// hero-canvas.js
// Three.js particle network visualization — lazy-loaded after first paint.
// Falls back to a static SVG diagram if Three.js fails or WebGL is unavailable.
// Does NOT block TTI: dynamically imported in main.js after DOMContentLoaded.

export async function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  // Dynamic import — not in the critical path
  let THREE;
  try {
    THREE = await import('three');
  } catch {
    showFallback(canvas);
    return;
  }

  // Check WebGL support
  const testCanvas = document.createElement('canvas');
  const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
  if (!gl) {
    showFallback(canvas);
    return;
  }

  // Scene setup
  const W = canvas.clientWidth || 500;
  const H = canvas.clientHeight || 500;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
  camera.position.z = 5;

  // Particle geometry — data flow visualization
  const PARTICLE_COUNT = 1200;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const phases = new Float32Array(PARTICLE_COUNT);

  // Color palette: strictly from colorPallet.pdf
  const palette = [
    new THREE.Color('#FFC801'),  // Forsythia (primary)
    new THREE.Color('#FF9932'),  // Deep Saffron (accent)
    new THREE.Color('#D9E8E2'),  // Mystic Mint
    new THREE.Color('#114C5A'),  // Nocturnal Expedition
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    // Distribute in a disk/sphere shape
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 2.5 + Math.random() * 1.5;
    positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i3]     = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;

    phases[i] = Math.random() * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // Central core — wireframe icosahedron in Forsythia
  const coreGeo = new THREE.IcosahedronGeometry(0.6, 1);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xFFC801,  // Forsythia
    wireframe: true,
    transparent: true,
    opacity: 0.5,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  // Ring in Deep Saffron
  const ringGeo = new THREE.TorusGeometry(1.4, 0.01, 2, 80);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xFF9932, transparent: true, opacity: 0.3 }); // Deep Saffron
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 4;
  scene.add(ring);

  // Animation loop — RAF, not setInterval
  let raf;
  let t = 0;
  let destroyed = false;

  function animate() {
    if (destroyed) return;
    raf = requestAnimationFrame(animate);
    t += 0.005;

    particles.rotation.y = t * 0.12;
    particles.rotation.x = t * 0.04;
    core.rotation.y = t * 0.3;
    core.rotation.z = t * 0.15;
    ring.rotation.z = t * 0.08;

    // Breathe opacity
    mat.opacity = 0.6 + Math.sin(t) * 0.2;

    renderer.render(scene, camera);
  }

  animate();

  // Resize observer
  const ro = new ResizeObserver(() => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(canvas);

  // Cleanup when canvas leaves viewport (IntersectionObserver)
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting && !destroyed) {
        cancelAnimationFrame(raf);
      } else if (e.isIntersecting && !destroyed) {
        animate();
      }
    }
  });
  io.observe(canvas);
}

function showFallback(canvas) {
  canvas.style.display = 'none';
  const fb = canvas.nextElementSibling;
  if (fb && fb.classList.contains('hero-canvas-fallback')) {
    fb.style.display = 'flex';
  }
}
