// three-cta.js
// SCENE 5: CTA section — Data Tunnel Flythrough

export async function initCtaScene() {
  const wrap = document.getElementById('cta-canvas-wrap'); if (!wrap) return; wrap.innerHTML = ''; const canvas = document.createElement('canvas'); canvas.style.width = '100%'; canvas.style.height = '100%'; wrap.appendChild(canvas);
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  
  let THREE;
  try { THREE = await import('three'); } catch { return; }

  if (!canvas.getContext('webgl') && !canvas.getContext('webgl2')) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  
  const scene = new THREE.Scene();
  // Add dark fog for infinite tunnel effect
  scene.fog = new THREE.FogExp2(0x172B36, 0.05);

  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 5;

  const C_GOLD = new THREE.Color(0xFFC801);
  const C_MINT = new THREE.Color(0xD9E8E2);
  const C_TEAL = new THREE.Color(0x114C5A);

  const group = new THREE.Group();
  scene.add(group);

  // ── 1. Data Tunnel (TubeGeometry) ────────────────────────
  // Create a spline curve
  const points = [];
  for (let i = 0; i < 50; i++) {
    points.push(new THREE.Vector3(
      Math.sin(i * 0.2) * 5,
      Math.cos(i * 0.3) * 5,
      -i * 2
    ));
  }
  const curve = new THREE.CatmullRomCurve3(points);

  const tubeGeo = new THREE.TubeGeometry(curve, 100, 3, 12, false);
  
  // Custom wireframe/grid shader material
  const tubeMat = new THREE.MeshBasicMaterial({
    color: C_TEAL,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  
  const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
  group.add(tubeMesh);

  // ── 2. Traveling Particles ───────────────────────────────
  const PARTICLE_COUNT = 300;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(PARTICLE_COUNT * 3);
  const particleProgress = []; // stores progress 0..1 along the curve

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particleProgress.push(Math.random());
    particlePos[i*3] = 0;
    particlePos[i*3+1] = 0;
    particlePos[i*3+2] = 0;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

  const particleMat = new THREE.PointsMaterial({
    color: C_GOLD,
    size: 0.2,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particleMesh = new THREE.Points(particleGeo, particleMat);
  group.add(particleMesh);

  // ── Resize Handler ───────────────────────────────────────
  const resize = () => {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);
  resize();

  // ── Animation Loop ───────────────────────────────────────
  let raf, destroyed = false;
  let time = 0;

  // Pre-calculate tangent vectors for the camera
  const binormal = new THREE.Vector3();
  const normal = new THREE.Vector3();

  const animate = () => {
    if (destroyed) return;
    raf = requestAnimationFrame(animate);
    time += 0.001;
    
    const camProgress = (time % 1);
    
    // Move camera along curve
    const camPos = curve.getPointAt(camProgress);
    camera.position.copy(camPos);
    
    const camLookAt = curve.getPointAt((camProgress + 0.01) % 1);
    camera.lookAt(camLookAt);

    // Roll camera slightly for dramatic effect
    camera.rotation.z = Math.sin(time * 10) * 0.5;

    // Move particles
    const positions = particleGeo.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particleProgress[i] += 0.002;
      if (particleProgress[i] > 1) particleProgress[i] -= 1;
      
      const pt = curve.getPointAt(particleProgress[i]);
      // Add some random offset within the tube
      const offset = (i % 2 === 0) ? 1.5 : -1.5;
      
      positions[i*3] = pt.x + Math.sin(i + time*10) * 1.5;
      positions[i*3+1] = pt.y + Math.cos(i + time*10) * 1.5;
      positions[i*3+2] = pt.z;
    }
    particleGeo.attributes.position.needsUpdate = true;

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

