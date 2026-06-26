// three-social.js
// SCENE 4: Social / Testimonials section — Abstract Oceanic Ripples

export async function initSocialScene() {
  const wrap = document.getElementById('social-canvas-wrap'); if (!wrap) return; wrap.innerHTML = ''; const canvas = document.createElement('canvas'); canvas.style.width = '100%'; canvas.style.height = '100%'; wrap.appendChild(canvas);
  
  let THREE;
  try { THREE = await import('three'); } catch { return; }

  if (!canvas.getContext('webgl') && !canvas.getContext('webgl2')) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 15, 20);
  camera.lookAt(0, 0, 0);

  const C_MINT = new THREE.Color('#D9E8E2');
  const C_TEAL = new THREE.Color('#114C5A');

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  // ── 1. Glass Ripple Plane ────────────────────────────────
  const planeGeo = new THREE.PlaneGeometry(60, 60, 64, 64);
  const planeMat = new THREE.MeshPhysicalMaterial({
    color: C_TEAL,
    metalness: 0.1,
    roughness: 0.2,
    transmission: 0.8,
    ior: 1.5,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide
  });

  const planeMesh = new THREE.Mesh(planeGeo, planeMat);
  planeMesh.rotation.x = -Math.PI / 2;
  scene.add(planeMesh);

  // ── Resize & Loop ────────────────────────────────────────
  const resize = () => {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);
  resize();

  let raf, destroyed = false;
  const clock = new THREE.Clock();

  // Store original vertices for waves
  const positions = planeGeo.attributes.position.array;
  const originalZ = [];
  for (let i = 0; i < positions.length; i += 3) {
    originalZ.push(positions[i + 2]);
  }

  const animate = () => {
    if (destroyed) return;
    raf = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Animate plane vertices
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const dist = Math.sqrt(x*x + y*y);
      positions[i + 2] = originalZ[i/3] + Math.sin(dist * 0.5 - time * 2) * 2.0;
    }
    planeGeo.attributes.position.needsUpdate = true;
    planeGeo.computeVertexNormals();

    // Slow rotation
    planeMesh.rotation.z = time * 0.05;

    renderer.render(scene, camera);
  };

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!raf) animate();
    } else {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }, { threshold: 0.1 });
  observer.observe(canvas.parentElement);
}
