// three-hero.js
// Advanced Hero Scene — Refractive Glass Core & Interconnected Energy Web

export async function initHeroScene() {
  const wrap = document.getElementById('hero-canvas-wrap'); if (!wrap) return; wrap.innerHTML = ''; const canvas = document.createElement('canvas'); canvas.style.width = '100%'; canvas.style.height = '100%'; wrap.appendChild(canvas);

  let THREE;
  try { THREE = await import('three'); } catch { return; }

  if (!canvas.getContext('webgl') && !canvas.getContext('webgl2')) {
    const fallback = document.querySelector('.hero-canvas-fallback');
    if (fallback) fallback.style.display = 'flex';
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 12;

  // Colors
  const C_GOLD = 0xFFC801;    // Forsythia
  const C_ORANGE = 0xFF9932;  // Deep Saffron
  const C_MINT = 0xD9E8E2;    // Mystic Mint
  const C_TEAL = 0x114C5A;    // Nocturnal Expedition

  // Environment Light for Glass Reflection
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const group = new THREE.Group();
  scene.add(group);

  // ── 1. Refractive Glass Core ─────────────────────────────
  const coreGeo = new THREE.IcosahedronGeometry(2.0, 4);
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.95, // glass-like
    ior: 1.5,
    thickness: 1.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transparent: true
  });
  const brainCore = new THREE.Mesh(coreGeo, glassMaterial);
  group.add(brainCore);

  const innerCoreGeo = new THREE.IcosahedronGeometry(0.9, 2);
  const innerCoreMat = new THREE.MeshStandardMaterial({
    color: C_ORANGE,
    emissive: C_ORANGE,
    emissiveIntensity: 1.2,
    roughness: 0.4
  });
  const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
  group.add(innerCore);

  // ── 2. Interconnected Energy Web ─────────────────────────
  const NODE_COUNT = 100;
  const nodesGeo = new THREE.BufferGeometry();
  const nodePositions = new Float32Array(NODE_COUNT * 3);
  const nodeVectors = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    const v = new THREE.Vector3(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 8
    );
    if (v.length() < 3.0) v.setLength(3.0 + Math.random() * 2);
    nodePositions[i * 3]     = v.x;
    nodePositions[i * 3 + 1] = v.y;
    nodePositions[i * 3 + 2] = v.z;
    nodeVectors.push(v);
  }
  nodesGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

  const nodesMat = new THREE.PointsMaterial({
    color: C_MINT,
    size: 0.12,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  });
  const nodesMesh = new THREE.Points(nodesGeo, nodesMat);
  group.add(nodesMesh);

  // Dynamic synapses
  const lineMat = new THREE.LineBasicMaterial({
    color: C_GOLD,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending
  });
  
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = new Float32Array(NODE_COUNT * NODE_COUNT * 6);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
  group.add(linesMesh);

  // ── 3. Fluid Cursor Simulation ───────────────────────────
  const mouse = new THREE.Vector2();
  const targetMouse = new THREE.Vector2();
  
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
      targetMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
  });

  const resize = () => {
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
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

    brainCore.rotation.y = time * 0.2;
    brainCore.rotation.x = time * 0.15;
    innerCore.rotation.y = -time * 0.5;

    // Pulse nodes
    const scales = nodesMesh.geometry.attributes.position.array;
    for(let i=0; i<NODE_COUNT; i++) {
        nodeVectors[i].y += Math.sin(time + i) * 0.005;
        scales[i*3+1] = nodeVectors[i].y;
    }
    nodesMesh.geometry.attributes.position.needsUpdate = true;

    // Update lines dynamically
    let lineIdx = 0;
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (nodeVectors[i].distanceTo(nodeVectors[j]) < 4.0) {
          linePositions[lineIdx++] = nodeVectors[i].x;
          linePositions[lineIdx++] = nodeVectors[i].y;
          linePositions[lineIdx++] = nodeVectors[i].z;
          linePositions[lineIdx++] = nodeVectors[j].x;
          linePositions[lineIdx++] = nodeVectors[j].y;
          linePositions[lineIdx++] = nodeVectors[j].z;
        }
      }
    }
    lineGeo.setDrawRange(0, lineIdx / 3);
    lineGeo.attributes.position.needsUpdate = true;

    // Mouse Parallax
    mouse.lerp(targetMouse, 0.05);
    group.rotation.x = -mouse.y * 0.15;
    group.rotation.y = mouse.x * 0.15;

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
  observer.observe(canvas);
}
