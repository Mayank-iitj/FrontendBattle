// three-pricing.js
// SCENE 3: Pricing section — Premium Glass Globe & Orbiting Data Crystals

export async function initPricingScene() {
  const wrap = document.getElementById('pricing-canvas-wrap'); if (!wrap) return; wrap.innerHTML = ''; const canvas = document.createElement('canvas'); canvas.style.width = '100%'; canvas.style.height = '100%'; wrap.appendChild(canvas);
  
  let THREE;
  try { THREE = await import('three'); } catch { return; }

  if (!canvas.getContext('webgl') && !canvas.getContext('webgl2')) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 18;

  const C_GOLD = new THREE.Color('#FFC801');
  const C_ORANGE = new THREE.Color('#FF9932');
  const C_TEAL = new THREE.Color('#114C5A');

  const group = new THREE.Group();
  scene.add(group);

  // Lighting for premium materials
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // ── 1. Glass Globe ───────────────────────────────────────
  const globeGeo = new THREE.IcosahedronGeometry(4.5, 4);
  const globeMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.95,
    ior: 1.5,
    clearcoat: 1.0,
    transparent: true,
    wireframe: true // Keep wireframe but make it glass!
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  group.add(globe);

  // Glowing Core
  const coreGeo = new THREE.IcosahedronGeometry(4.3, 3);
  const coreMat = new THREE.MeshStandardMaterial({
    color: C_TEAL,
    emissive: C_TEAL,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.8
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // ── 2. Orbiting Data Crystals ────────────────────────────
  const crystalGeo = new THREE.OctahedronGeometry(0.3, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: C_GOLD,
    emissive: C_ORANGE,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2
  });

  const crystals = [];
  for (let i = 0; i < 30; i++) {
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    group.add(crystal);
    crystals.push({
      mesh: crystal,
      radius: 6 + Math.random() * 3,
      speed: 0.005 + Math.random() * 0.01,
      angle: Math.random() * Math.PI * 2,
      axisY: (Math.random() - 0.5) * 5,
      yOffset: Math.random() * Math.PI * 2
    });
  }

  // ── 3. Atmospheric Glow ──────────────────────────────────
  const glowGeo = new THREE.PlaneGeometry(30, 30);
  const glowMat = new THREE.ShaderMaterial({
    uniforms: {
      color1: { value: C_GOLD },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      varying vec2 vUv;
      void main() {
        float d = distance(vUv, vec2(0.5));
        float alpha = smoothstep(0.5, 0.0, d) * 0.2;
        gl_FragColor = vec4(color1, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.position.z = -5;
  scene.add(glowMesh);

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

  const animate = () => {
    if (destroyed) return;
    raf = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    group.rotation.y = time * 0.1;
    group.rotation.x = Math.sin(time * 0.2) * 0.2;

    crystals.forEach(c => {
      c.angle += c.speed;
      c.mesh.position.x = Math.cos(c.angle) * c.radius;
      c.mesh.position.z = Math.sin(c.angle) * c.radius;
      c.mesh.position.y = c.axisY + Math.sin(time * 2 + c.yOffset) * 0.5;
      
      c.mesh.rotation.x += 0.02;
      c.mesh.rotation.y += 0.02;
    });

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
