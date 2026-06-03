import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';

// ---------------------------------------------------------------------------
// Базовая сцена
// ---------------------------------------------------------------------------
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05060a, 0.06);

const sizes = { w: innerWidth, h: innerHeight };

const camera = new THREE.PerspectiveCamera(60, sizes.w / sizes.h, 0.1, 100);
camera.position.set(0, 0, 7);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

// ---------------------------------------------------------------------------
// Частицы: 80k точек в одном буфере, движение целиком в вершинном шейдере
// ---------------------------------------------------------------------------
const COUNT = 80000;
const positions = new Float32Array(COUNT * 3);
const seeds = new Float32Array(COUNT); // случайная фаза на частицу

for (let i = 0; i < COUNT; i++) {
  // сфероподобное облако
  const r = 3.5 + Math.random() * 2.5;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = r * Math.cos(phi);
  seeds[i] = Math.random();
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

const material = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color(0x9ecbff) },
    uColorB: { value: new THREE.Color(0xff7bd5) },
  },
  vertexShader: /* glsl */ `
    uniform float uTime;
    attribute float aSeed;
    varying float vMix;
    void main() {
      vec3 p = position;
      float t = uTime * 0.4 + aSeed * 6.2831;
      // мягкая турбулентность
      p.x += sin(t + p.y * 0.5) * 0.25;
      p.y += cos(t + p.z * 0.5) * 0.25;
      p.z += sin(t + p.x * 0.5) * 0.25;
      vMix = aSeed;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = (8.0 / -mv.z) * (0.5 + aSeed);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying float vMix;
    void main() {
      // круглая мягкая точка
      vec2 c = gl_PointCoord - 0.5;
      float d = smoothstep(0.5, 0.0, length(c));
      vec3 col = mix(uColorA, uColorB, vMix);
      gl_FragColor = vec4(col, d);
    }`,
});

const points = new THREE.Points(geometry, material);
scene.add(points);

// ---------------------------------------------------------------------------
// Постобработка: bloom для «свечения»
// ---------------------------------------------------------------------------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(sizes.w, sizes.h),
  0.9,  // strength
  0.6,  // radius
  0.85  // threshold
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------------------------------------------------------------------------
// Инерционный скролл (Lenis) + влияние на камеру
// ---------------------------------------------------------------------------
const lenis = new Lenis({ smoothWheel: true, lerp: 0.08 });
let scrollProgress = 0;
lenis.on('scroll', ({ progress }) => { scrollProgress = progress || 0; });

// ---------------------------------------------------------------------------
// Плавное следование за мышью (lerp = инерция)
// ---------------------------------------------------------------------------
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('mousemove', (e) => {
  mouse.tx = (e.clientX / sizes.w - 0.5) * 2;
  mouse.ty = -(e.clientY / sizes.h - 0.5) * 2;
});

// ---------------------------------------------------------------------------
// Цикл рендера
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();
function tick(time) {
  lenis.raf(time);
  const t = clock.getElapsedTime();
  material.uniforms.uTime.value = t;

  // инерция мыши
  mouse.x += (mouse.tx - mouse.x) * 0.05;
  mouse.y += (mouse.ty - mouse.y) * 0.05;

  // камера реагирует на мышь и скролл
  camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.05;
  camera.position.y += (mouse.y * 1.5 - camera.position.y) * 0.05;
  camera.position.z = 7 - scrollProgress * 3; // приближение на скролле
  camera.lookAt(0, 0, 0);

  points.rotation.y = t * 0.03;

  composer.render();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---------------------------------------------------------------------------
// Resize
// ---------------------------------------------------------------------------
addEventListener('resize', () => {
  sizes.w = innerWidth;
  sizes.h = innerHeight;
  camera.aspect = sizes.w / sizes.h;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.w, sizes.h);
  composer.setSize(sizes.w, sizes.h);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});

// ---------------------------------------------------------------------------
// Intro: убираем loader и проявляем заголовок через GSAP
// ---------------------------------------------------------------------------
window.addEventListener('load', () => {
  document.querySelector('#loader')?.classList.add('hidden');
  gsap.from('.hero .kicker, .hero .title, .hero .sub', {
    y: 40,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    stagger: 0.15,
    delay: 0.2,
  });
});
