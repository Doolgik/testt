import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------
const canvas = document.querySelector('#webgl');
const sizes = { w: innerWidth, h: innerHeight };

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();

// фон-градиент (его и преломляет стекло)
function gradientTexture(c0, c1, c2) {
  const cv = document.createElement('canvas');
  cv.width = 4; cv.height = 512;
  const g = cv.getContext('2d').createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, c0); g.addColorStop(0.5, c1); g.addColorStop(1, c2);
  const ctx = cv.getContext('2d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 512);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
scene.background = gradientTexture('#1a2138', '#141a2c', '#0a0c14');

const camera = new THREE.PerspectiveCamera(45, sizes.w / sizes.h, 0.1, 100);
camera.position.set(0, 5, 7.5);

// HDR-окружение → отражения/преломления на стекле
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// цветные источники подкрашивают блики стекла
const l1 = new THREE.PointLight(0x5b8bff, 60, 40); l1.position.set(-5, 4, 4); scene.add(l1);
const l2 = new THREE.PointLight(0xff77cc, 50, 40); l2.position.set(5, -3, 3); scene.add(l2);
const l3 = new THREE.PointLight(0x66ffe0, 40, 40); l3.position.set(0, 0, -6); scene.add(l3);
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

// ---------------------------------------------------------------------------
// «Позвоночник» + карточки liquid glass на спирали
// ---------------------------------------------------------------------------
const spine = new THREE.Group();
scene.add(spine);

const N = 13;            // позвонков/карточек
const STEP = 0.95;       // расстояние между уровнями
const R = 2.7;           // радиус спирали
const ANG = 0.62;        // шаг закрутки спирали (рад)
const topY = (N - 1) * STEP * 0.5;

// --- материал matte liquid glass (фростед: мутное преломление)
const glass = new THREE.MeshPhysicalMaterial({
  transmission: 1.0,
  thickness: 1.2,
  roughness: 0.55,          // ← высокая шероховатость = матовое, «молочное» стекло
  ior: 1.42,
  metalness: 0.0,
  clearcoat: 0.4,
  clearcoatRoughness: 0.45,
  iridescence: 0.35,
  iridescenceIOR: 1.3,
  specularIntensity: 0.8,
  envMapIntensity: 1.1,
  attenuationColor: new THREE.Color(0x9ec2ff),
  attenuationDistance: 2.2,
  transparent: true,
});

// --- геометрия карточки: скруглённый прямоугольник с фаской (толстое стекло)
function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
const cardGeo = new THREE.ExtrudeGeometry(roundedRect(1.5, 2.05, 0.22), {
  depth: 0.14, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 5, curveSegments: 24,
});
cardGeo.center();

// --- центральный хребет: матовый стержень + светящийся «спинной мозг»
const rodMat = new THREE.MeshPhysicalMaterial({ color: 0xcfd6e6, metalness: 1.0, roughness: 0.25, envMapIntensity: 1.2 });
const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, N * STEP + 1.2, 24), rodMat);
spine.add(rod);
const coreMat = new THREE.MeshBasicMaterial({ color: 0x7fd4ff });
const core = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, N * STEP + 1.2, 16), coreMat);
spine.add(core);

const vertMat = new THREE.MeshPhysicalMaterial({ color: 0xe8edff, metalness: 0.9, roughness: 0.2, envMapIntensity: 1.2 });
const up = new THREE.Vector3(0, 1, 0);
const cards = [];

for (let i = 0; i < N; i++) {
  const y = topY - i * STEP;
  const a = i * ANG;
  const px = Math.sin(a) * R;
  const pz = Math.cos(a) * R;

  // позвонок — кольцо вокруг стержня
  const vert = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.075, 16, 32), vertMat);
  vert.position.set(0, y, 0);
  vert.rotation.x = Math.PI / 2;
  spine.add(vert);

  // «отросток» от хребта к карточке
  const dir = new THREE.Vector3(px, 0, pz);
  const len = dir.length();
  const conn = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 12), vertMat);
  conn.position.set(px / 2, y, pz / 2);
  conn.quaternion.setFromUnitVectors(up, dir.clone().normalize());
  spine.add(conn);

  // карточка liquid glass, лицом наружу
  const card = new THREE.Mesh(cardGeo, glass);
  card.position.set(px, y, pz);
  card.rotation.y = a;        // смотрит наружу по касательной к спирали
  card.rotation.x = -0.05;
  card.userData.phase = i * 0.5;
  spine.add(card);
  cards.push(card);
}

// intro
spine.scale.setScalar(0.001);
gsap.to(spine.scale, { x: 1, y: 1, z: 1, duration: 1.6, ease: 'power3.out', delay: 0.2 });
window.addEventListener('load', () => {
  document.querySelector('#loader')?.classList.add('hidden');
  gsap.from('.flyer', { opacity: 0, x: -30, duration: 1.1, ease: 'power2.out', delay: 0.5 });
});

// ---------------------------------------------------------------------------
// Постобработка: bloom для свечения хребта и бликов стекла
// ---------------------------------------------------------------------------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(sizes.w, sizes.h), 0.5, 0.7, 0.85));
composer.addPass(new OutputPass());

// ---------------------------------------------------------------------------
// Скролл → вращение оси + спуск камеры вдоль позвоночника
// ---------------------------------------------------------------------------
const lenis = new Lenis({ smoothWheel: true, lerp: 0.08 });
let targetProg = 0;
lenis.on('scroll', ({ progress }) => { targetProg = progress || 0; });

const flyer = document.querySelector('#flyer');
const bottomY = -topY;

// --- клик/наведение по карточкам → Telegram
const TG = 'https://t.me/whooopa';
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerActive = false;
let hovered = null;
const down = { x: 0, y: 0 };

function setPointer(e) {
  pointer.x = (e.clientX / sizes.w) * 2 - 1;
  pointer.y = -(e.clientY / sizes.h) * 2 + 1;
  pointerActive = true;
}
function setHover(obj) {
  if (hovered === obj) return;
  if (hovered) gsap.to(hovered.scale, { x: 1, y: 1, z: 1, duration: 0.35, ease: 'power2.out' });
  hovered = obj;
  if (hovered) gsap.to(hovered.scale, { x: 1.12, y: 1.12, z: 1.12, duration: 0.35, ease: 'power2.out' });
  canvas.style.cursor = hovered ? 'pointer' : 'default';
}

canvas.addEventListener('pointermove', setPointer);
canvas.addEventListener('pointerdown', (e) => { down.x = e.clientX; down.y = e.clientY; });
canvas.addEventListener('pointerup', (e) => {
  // отличаем клик от скролл-перетаскивания
  if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;
  setPointer(e);
  raycaster.setFromCamera(pointer, camera);
  if (raycaster.intersectObjects(cards, false)[0]) {
    window.open(TG, '_blank', 'noopener');
  }
});

const clock = new THREE.Clock();
let prog = 0;
function tick(time) {
  lenis.raf(time);
  const t = clock.getElapsedTime();
  prog += (targetProg - prog) * 0.08;     // плавность

  // вся ось вращается вокруг Y (+ лёгкое холостое вращение)
  spine.rotation.y = prog * Math.PI * 2 * 1.5 + t * 0.04;

  // камера спускается вдоль хребта сверху вниз
  camera.position.y = THREE.MathUtils.lerp(topY + 1.0, bottomY - 1.0, prog);
  camera.position.x = Math.sin(t * 0.2) * 0.3;   // едва заметное дыхание
  camera.lookAt(0, camera.position.y, 0);

  // «жидкое» покачивание карточек
  for (const c of cards) {
    c.position.y += Math.sin(t * 1.2 + c.userData.phase) * 0.0012;
    c.rotation.z = Math.sin(t * 0.8 + c.userData.phase) * 0.04;
  }

  // наведение на карточки (подсветка масштабом)
  if (pointerActive) {
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(cards, false)[0];
    setHover(hit ? hit.object : null);
  }

  // текст слегка уезжает и затухает к концу
  flyer.style.opacity = String(1 - prog * 0.85);
  flyer.style.transform = `translateY(calc(-50% + ${prog * -60}px))`;

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
