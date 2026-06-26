// src/three-liquid-bg.js
import * as THREE from 'three';

export async function initLiquidBg() {
  const container = document.getElementById('global-canvas-wrap');
  if (!container) return;
  container.innerHTML = '';
  
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '0'; // Bottom most layer
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // ShaderMaterial for liquid distortion
  const uniforms = {
    time: { value: 0 },
    resolution: { value: new THREE.Vector2() }
  };

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec2 resolution;
      varying vec2 vUv;
      
      // Simple noise function
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        p.x *= resolution.x / resolution.y;
        
        // Distortion waves
        float n = sin(p.x * 3.0 + time) * cos(p.y * 3.0 + time * 0.8) * 0.1;
        p += n;
        
        // Fluid color gradient
        vec3 color1 = vec3(0.0, 0.2, 0.4); // Deep blue
        vec3 color2 = vec3(0.0, 0.8, 0.6); // Cyan/Mint
        
        float mixVal = smoothstep(-1.0, 1.0, p.y + n * 5.0);
        vec3 finalColor = mix(color1, color2, mixVal);
        
        // Subtle energy pulses
        float pulse = max(0.0, sin(time * 2.0 - length(p) * 5.0)) * 0.2;
        finalColor += vec3(pulse);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    depthWrite: false,
    depthTest: false
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    uniforms.resolution.value.set(w, h);
  };
  window.addEventListener('resize', resize);
  resize();

  let raf;
  const clock = new THREE.Clock();

  const animate = () => {
    raf = requestAnimationFrame(animate);
    uniforms.time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  };

  animate();
}
