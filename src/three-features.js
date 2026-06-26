// three-features.js
// SCENE 2: Premium Features section background — Holographic Data Pipeline
// High-end glassmorphic floating nodes and data streams

export async function initFeaturesScene() {
  const wrap = document.getElementById('features-canvas-wrap'); if (!wrap) return; wrap.innerHTML = ''; const canvas = document.createElement('canvas'); canvas.style.width = '100%'; canvas.style.height = '100%'; wrap.appendChild(canvas);
  
  let THREE;
  try { THREE = await import('three'); } catch { return; }

  if (!canvas.getContext('webgl') && !canvas.getContext('webgl2')) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  
  const scene = new THREE.Scene();
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const d = 20;
  const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
  camera.position.set(30, 20, 30);
  camera.lookAt(0, -2, 0);

  const C_GOLD = new THREE.Color('#FFC801');
  const C_TEAL = new THREE.Color('#114C5A');
  const C_MINT = new THREE.Color('#D9E8E2');
  const C_ORANGE = new THREE.Color('#FF9932');

  const group = new THREE.Group();
  scene.add(group);

  // Lighting for Glass
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight.position.set(20, 40, 20);
  scene.add(dirLight);

  // ── 1. Floating Data Nodes (Premium Glass) ────────────────
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.95,
    ior: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transparent: true
  });

  const nodeGeo = new THREE.CylinderGeometry(2, 2, 0.8, 32);
  const coreGeo = new THREE.CylinderGeometry(1, 1, 1.2, 32);
  
  const coreMaterials = [
    new THREE.MeshStandardMaterial({ color: C_GOLD, emissive: C_GOLD, emissiveIntensity: 0.5 }),
    new THREE.MeshStandardMaterial({ color: C_MINT, emissive: C_MINT, emissiveIntensity: 0.5 }),
    new THREE.MeshStandardMaterial({ color: C_ORANGE, emissive: C_ORANGE, emissiveIntensity: 0.5 })
  ];

  const nodes = [];
  const pipelinePositions = [
    [-12, 0, -12], [-6, 0, -4], [0, 0, 4], [8, 0, 8], [14, 0, -4]
  ];

  pipelinePositions.forEach((p, index) => {
    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(p[0], p[1], p[2]);
    
    const glassDisc = new THREE.Mesh(nodeGeo, glassMat);
    nodeGroup.add(glassDisc);

    const core = new THREE.Mesh(coreGeo, coreMaterials[index % 3]);
    nodeGroup.add(core);

    group.add(nodeGroup);
    nodes.push({ group: nodeGroup, base: p, phase: Math.random() * Math.PI * 2 });
  });

  // ── 2. Flowing Data Streams ────────────────────────────────
  const streamGeo = new THREE.BufferGeometry();
  const streamPoints = [];
  
  // Curve through nodes
  const curve = new THREE.CatmullRomCurve3(pipelinePositions.map(p => new THREE.Vector3(...p)));
  const curvePoints = curve.getPoints(100);
  streamGeo.setFromPoints(curvePoints);
  
  const streamMat = new THREE.LineBasicMaterial({
    color: C_MINT,
    transparent: true,
    opacity: 0.4,
    linewidth: 2
  });
  const streamLine = new THREE.Line(streamGeo, streamMat);
  group.add(streamLine);

  // Data Particles on Stream
  const P_COUNT = 40;
  const pGeo = new THREE.SphereGeometry(0.3, 8, 8);
  const pMat = new THREE.MeshBasicMaterial({ color: C_GOLD });
  const dataParticles = [];

  for(let i=0; i<P_COUNT; i++) {
    const pMesh = new THREE.Mesh(pGeo, pMat);
    group.add(pMesh);
    dataParticles.push({ mesh: pMesh, progress: Math.random() });
  }

  // ── Resize & Loop ────────────────────────────────────────
  const resize = () => {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    const asp = w / h;
    camera.left = -d * asp;
    camera.right = d * asp;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);
  resize();

  let raf, destroyed = false;
  const clock = new THREE.Clock();

  const animate = () => {
    if (destroyed) return;
    raf = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Float nodes
    nodes.forEach((n) => {
      n.group.position.y = Math.sin(time * 1.5 + n.phase) * 1.2;
      n.group.rotation.y = time * 0.5 + n.phase;
    });

    // Move data particles along curve
    dataParticles.forEach(dp => {
      dp.progress += 0.003;
      if(dp.progress > 1) dp.progress = 0;
      const pos = curve.getPointAt(dp.progress);
      dp.mesh.position.copy(pos);
      // add float effect
      dp.mesh.position.y += Math.sin(time * 5 + dp.progress * 10) * 0.5;
    });

    // Slow rotation of entire group for parallax effect
    group.rotation.y = Math.sin(time * 0.2) * 0.05;

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
