// src/three-can-showcase.js
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

gsap.registerPlugin(ScrollTrigger);

export async function initCanShowcase() {
  const container = document.getElementById('hero-canvas-wrap');
  if (!container) return;
  container.innerHTML = '';
  
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '10'; // Above background, but below UI
  canvas.style.pointerEvents = 'none'; // Initially none, will enable for raycasting later if needed
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 15);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0xaaccff, 1);
  fillLight.position.set(-5, 0, 5);
  scene.add(fillLight);

  // Group to hold the can and allow GSAP to animate it globally
  const canGroup = new THREE.Group();
  scene.add(canGroup);

  // Create Procedural Can Geometry
  // Body
  const bodyGeo = new THREE.CylinderGeometry(1.2, 1.2, 5, 32);
  const canMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x222222, // Dark metallic base
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });
  const canBody = new THREE.Mesh(bodyGeo, canMaterial);
  canGroup.add(canBody);

  // Top/Bottom Rim
  const rimGeo = new THREE.TorusGeometry(1.15, 0.1, 16, 32);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 1.0,
    roughness: 0.3
  });
  const topRim = new THREE.Mesh(rimGeo, rimMat);
  topRim.position.y = 2.5;
  topRim.rotation.x = Math.PI / 2;
  canGroup.add(topRim);

  const bottomRim = new THREE.Mesh(rimGeo, rimMat);
  bottomRim.position.y = -2.5;
  bottomRim.rotation.x = Math.PI / 2;
  canGroup.add(bottomRim);

  // Top Cap
  const capGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.1, 32);
  const topCap = new THREE.Mesh(capGeo, rimMat);
  topCap.position.y = 2.45;
  canGroup.add(topCap);
  
  // Tab
  const tabGeo = new THREE.BoxGeometry(0.3, 0.05, 0.6);
  const tab = new THREE.Mesh(tabGeo, rimMat);
  tab.position.set(0, 2.55, 0.3);
  canGroup.add(tab);

  // Floating Particles (InstancedMesh)
  const particleCount = 100;
  const pGeo = new THREE.SphereGeometry(0.05, 8, 8);
  const pMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.6 });
  const instancedMesh = new THREE.InstancedMesh(pGeo, pMat, particleCount);
  const dummy = new THREE.Object3D();
  const particleData = [];

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 10;
    const y = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    dummy.position.set(x, y, z);
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);
    particleData.push({
      x, y, z,
      speed: 0.01 + Math.random() * 0.02,
      phase: Math.random() * Math.PI * 2
    });
  }
  scene.add(instancedMesh);

  // GSAP ScrollTrigger Animations
  // We pin the can and move it as user scrolls
  canGroup.rotation.y = -Math.PI / 4;
  canGroup.rotation.z = 0.2;

  gsap.to(canGroup.rotation, {
    y: Math.PI * 2,
    z: 0,
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1
    }
  });

  gsap.to(canGroup.position, {
    y: -5,
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1
    }
  });

  // Post-Processing
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = 0.2;
  bloomPass.strength = 1.2; // Glowing energy highlights
  bloomPass.radius = 0.5;

  const composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);

  // Raycaster for hover
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  let raf;
  const clock = new THREE.Clock();

  const animate = () => {
    raf = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Animate particles
    for (let i = 0; i < particleCount; i++) {
      const data = particleData[i];
      data.y += data.speed;
      if (data.y > 5) data.y = -5;
      dummy.position.set(
        data.x + Math.sin(time + data.phase) * 0.5,
        data.y,
        data.z + Math.cos(time + data.phase) * 0.5
      );
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    instancedMesh.instanceMatrix.needsUpdate = true;

    // Raycast check
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(canBody);
    if (intersects.length > 0) {
      document.body.style.cursor = 'pointer';
      // Subtle pulse on hover
      canMaterial.emissive = new THREE.Color(0x003322);
    } else {
      document.body.style.cursor = 'default';
      canMaterial.emissive = new THREE.Color(0x000000);
    }

    // render with composer instead of standard renderer
    composer.render();
  };

  animate();
}
