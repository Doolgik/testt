import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';

// ---------------------------------------------------------------------------
// Renderer + ACES tone mapping (фотореалистичный контраст)
// ---------------------------------------------------------------------------
const canvas = document.querySelector('#webgl');
const sizes = { w: innerWidth, h: innerHeight };
const BEIGE = 0xe7dcc4;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(BEIGE);

const camera = new THREE.PerspectiveCamera(45, sizes.w / sizes.h, 0.1, 100);
camera.position.set(0, 0, 6);

// HDR-окружение для реальных отражений на материалах
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// тёплый свет
const key = new THREE.DirectionalLight(0xfff2dd, 2.4);
key.position.set(3, 5, 4);
scene.add(key);
const fill = new THREE.DirectionalLight(0xcfe0ff, 1.0);
fill.position.set(-4, -2, -3);
scene.add(fill);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// ---------------------------------------------------------------------------
// Процедурный кофейный стаканчик (бумага + крафт-держатель + кофе + пар)
// ---------------------------------------------------------------------------
const cup = new THREE.Group();          // внешний — двигаем по кривой
const cupInner = new THREE.Group();     // внутренний — центрируем для вращения
cup.add(cupInner);
scene.add(cup);

// --- профиль стенки стакана (x = радиус, y = высота) с реальной толщиной
const P = (x, y) => new THREE.Vector2(x, y);
const profile = [
  P(0.00, 0.04), P(0.50, 0.04),   // внутреннее дно
  P(0.66, 1.66),                  // внутренняя стенка вверх
  P(0.70, 1.72), P(0.745, 1.72),  // закатанный ободок
  P(0.72, 1.64),
  P(0.70, 1.40),
  P(0.62, 0.10),                  // внешняя стенка вниз
  P(0.55, 0.00), P(0.00, 0.00),   // внешнее дно (закрывает низ)
];
const paperMat = new THREE.MeshStandardMaterial({
  color: 0xf2ebdc, roughness: 0.82, metalness: 0.0,
  side: THREE.DoubleSide, envMapIntensity: 1.0,
});
const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 80), paperMat);
cupInner.add(body);

// --- крафт-держатель (рукав)
const sleeveMat = new THREE.MeshStandardMaterial({
  color: 0xb07d4f, roughness: 0.92, metalness: 0.0, envMapIntensity: 0.8,
});
const sleeve = new THREE.Mesh(
  new THREE.CylinderGeometry(0.665, 0.60, 0.62, 80, 1, true),
  sleeveMat
);
sleeve.position.y = 0.78;
cupInner.add(sleeve);

// --- поверхность кофе (тёмная, глянцевая — ловит отражения окружения)
const coffeeMat = new THREE.MeshStandardMaterial({
  color: 0x3c2414, roughness: 0.28, metalness: 0.0, envMapIntensity: 1.4,
});
const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.63, 64), coffeeMat);
coffee.rotation.x = -Math.PI / 2;
coffee.position.y = 1.55;
cupInner.add(coffee);

// --- пар над кофе (мягкие частицы, поднимаются и тают)
const STEAM = 120;
const sPos = new Float32Array(STEAM * 3);
const sSeed = new Float32Array(STEAM);
for (let i = 0; i < STEAM; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = Math.random() * 0.4;
  sPos[i * 3 + 0] = Math.cos(a) * r;
  sPos[i * 3 + 1] = 1.6;
  sPos[i * 3 + 2] = Math.sin(a) * r;
  sSeed[i] = Math.random();
}
const steamGeo = new THREE.BufferGeometry();
steamGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
steamGeo.setAttribute('aSeed', new THREE.BufferAttribute(sSeed, 1));
const steamMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.NormalBlending,
  uniforms: { uTime: { value: 0 } },
  vertexShader: /* glsl */ `
    uniform float uTime; attribute float aSeed; varying float vA;
    void main(){
      float life = fract(uTime * 0.13 + aSeed);
      vec3 p = position;
      p.y += life * 1.6;
      p.x += sin(uTime * 0.8 + aSeed * 6.28) * 0.12 * life;
      p.z += cos(uTime * 0.6 + aSeed * 6.28) * 0.12 * life;
      vA = sin(life * 3.1415) * 0.22;       // плавное появление/исчезание
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = (40.0 / -mv.z) * (0.5 + life);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    varying float vA;
    void main(){
      vec2 c = gl_PointCoord - 0.5;
      float d = smoothstep(0.5, 0.0, length(c));
      gl_FragColor = vec4(vec3(1.0), d * vA);
    }`,
});
const steam = new THREE.Points(steamGeo, steamMat);
cupInner.add(steam);

// центрируем стакан по высоте, чтобы он вращался вокруг центра
cupInner.position.y = -0.86;
cup.scale.setScalar(1.15);

// intro
cup.scale.setScalar(0.001);
gsap.to(cup.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 1.4, ease: 'power3.out', delay: 0.2 });
window.addEventListener('load', () => {
  document.querySelector('#loader')?.classList.add('hidden');
  gsap.from('.flyer', { opacity: 0, duration: 1.2, ease: 'power2.out', delay: 0.4 });
});

// ---------------------------------------------------------------------------
// Постобработка: очень лёгкий bloom (мягкие блики/пар)
// ---------------------------------------------------------------------------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(sizes.w, sizes.h), 0.18, 0.6, 0.95));
composer.addPass(new OutputPass());

// ---------------------------------------------------------------------------
// Кривая Безье (нормализованная): слева внизу → дуга вверх → справа внизу
// ---------------------------------------------------------------------------
const curve = new THREE.CubicBezierCurve3(
  new THREE.Vector3(-1.0, -0.18, 0),
  new THREE.Vector3(-0.5, 1.05, 0),
  new THREE.Vector3(0.5, 1.05, 0),
  new THREE.Vector3(1.0, -0.18, 0)
);

const flyer = document.querySelector('#flyer');

// инерционный скролл
const lenis = new Lenis({ smoothWheel: true, lerp: 0.08 });
let targetProg = 0;
lenis.on('scroll', ({ progress }) => { targetProg = progress || 0; });

// видимые мировые размеры на глубине z=0
function worldExtents() {
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.position.length();
  return { halfH, halfW: halfH * camera.aspect };
}

// ---------------------------------------------------------------------------
// Цикл
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();
let prog = 0;
function tick(time) {
  lenis.raf(time);
  const t = clock.getElapsedTime();
  steamMat.uniforms.uTime.value = t;

  // доп. сглаживание прогресса → «плавно»
  prog += (targetProg - prog) * 0.08;

  const { halfW, halfH } = worldExtents();

  // --- стаканчик летит по кривой Безье (слева направо)
  const p = curve.getPoint(prog);
  cup.position.x = p.x * halfW * 0.78;
  cup.position.y = p.y * halfH * 0.62;
  cupInner.rotation.y = prog * Math.PI * 4 + t * 0.25;       // вращение
  cup.rotation.z = Math.sin(prog * Math.PI) * -0.28;          // наклон в полёте

  // --- описание летит навстречу (справа налево, дуга вниз)
  const tx = (0.5 - prog) * sizes.w * 0.8;
  const ty = Math.sin(prog * Math.PI) * sizes.h * 0.16;
  flyer.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
  flyer.style.opacity = String(0.25 + 0.75 * Math.sin(prog * Math.PI)); // мягкое затухание у краёв

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
