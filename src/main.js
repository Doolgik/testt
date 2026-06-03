import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';

const TG = 'https://t.me/whooopa';

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
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, c0); g.addColorStop(0.5, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 512);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
scene.background = gradientTexture('#1a2138', '#141a2c', '#0a0c14');

const camera = new THREE.PerspectiveCamera(45, sizes.w / sizes.h, 0.1, 100);
camera.position.set(0, 0, 10);           // отведена дальше → сцена мельче
camera.lookAt(0, 0, 0);

// HDR-окружение → отражения/преломления на стекле
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// цветные источники подкрашивают блики
const l1 = new THREE.PointLight(0x5b8bff, 60, 50); l1.position.set(-5, 4, 4); scene.add(l1);
const l2 = new THREE.PointLight(0xff77cc, 50, 50); l2.position.set(5, -3, 3); scene.add(l2);
const l3 = new THREE.PointLight(0x66ffe0, 40, 50); l3.position.set(0, 0, -6); scene.add(l3);
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

// ---------------------------------------------------------------------------
// «Позвоночник» + матовые стеклянные карточки
// ---------------------------------------------------------------------------
const spine = new THREE.Group();
scene.add(spine);

const N = 8;             // карточек
const STEP = 1.7;        // больший интервал между карточками
const R = 2.7;           // радиус спирали
const ANG = 0.7;         // шаг закрутки
const topY = (N - 1) * STEP * 0.5;
const totalSpan = (N - 1) * STEP;

// --- matte liquid glass
const glass = new THREE.MeshPhysicalMaterial({
  transmission: 1.0,
  thickness: 1.2,
  roughness: 0.55,
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

// --- скруглённая толстая карточка
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
const cardGeo = new THREE.ExtrudeGeometry(roundedRect(1.6, 2.15, 0.24), {
  depth: 0.14, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 5, curveSegments: 24,
});
cardGeo.center();

// --- текст-метка (твой тег) на карточке
function makeLabel() {
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 256;
  const ctx = cv.getContext('2d');
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '600 30px Helvetica, Arial, sans-serif';
  ctx.fillText('T E L E G R A M', 256, 96);
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.font = '700 64px Helvetica, Arial, sans-serif';
  ctx.fillText('@whooopa', 256, 156);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}
const labelTex = makeLabel();
const labelGeo = new THREE.PlaneGeometry(1.4, 0.7);

// --- центральный хребет (длинный, всегда пересекает центр экрана)
const rodLen = totalSpan + 5;
const rodMat = new THREE.MeshPhysicalMaterial({ color: 0xcfd6e6, metalness: 1.0, roughness: 0.25, envMapIntensity: 1.2 });
spine.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, rodLen, 24), rodMat));
const core = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, rodLen, 16), new THREE.MeshBasicMaterial({ color: 0x7fd4ff }));
spine.add(core);

const vertMat = new THREE.MeshPhysicalMaterial({ color: 0xe8edff, metalness: 0.9, roughness: 0.2, envMapIntensity: 1.2 });
const up = new THREE.Vector3(0, 1, 0);
const cards = [];

for (let i = 0; i < N; i++) {
  const y = topY - i * STEP;
  const a = i * ANG;
  const px = Math.sin(a) * R;
  const pz = Math.cos(a) * R;

  // позвонок
  const vert = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.075, 16, 32), vertMat);
  vert.position.set(0, y, 0); vert.rotation.x = Math.PI / 2;
  spine.add(vert);

  // отросток к карточке
  const dir = new THREE.Vector3(px, 0, pz);
  const conn = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, dir.length(), 12), vertMat);
  conn.position.set(px / 2, y, pz / 2);
  conn.quaternion.setFromUnitVectors(up, dir.clone().normalize());
  spine.add(conn);

  // holder задаёт место и разворот на спирали; карточку внутри анимируем свободно
  const holder = new THREE.Group();
  holder.position.set(px, y, pz);
  holder.rotation.y = a;            // лицом наружу
  spine.add(holder);

  // карточка — со своей копией материала (чтобы светилась индивидуально)
  const mat = glass.clone();
  mat.emissive = new THREE.Color(0x3a6bff);
  mat.emissiveIntensity = 0;
  const card = new THREE.Mesh(cardGeo, mat);
  card.userData.phase = i * 0.6;
  holder.add(card);
  cards.push(card);

  // тег на карточке (двигается/крутится вместе с ней)
  const label = new THREE.Mesh(
    labelGeo,
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, depthWrite: false })
  );
  label.position.set(0, 0, 0.14);     // на лицевой грани
  label.renderOrder = 2;
  card.add(label);
}

// intro
spine.scale.setScalar(0.001);
gsap.to(spine.scale, { x: 1, y: 1, z: 1, duration: 1.6, ease: 'power3.out', delay: 0.2 });

// ---------------------------------------------------------------------------
// Постобработка
// ---------------------------------------------------------------------------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(sizes.w, sizes.h), 0.45, 0.7, 0.85));
composer.addPass(new OutputPass());

// ---------------------------------------------------------------------------
// Скролл
// ---------------------------------------------------------------------------
const lenis = new Lenis({ smoothWheel: true, lerp: 0.08 });
let targetProg = 0;
lenis.on('scroll', ({ progress }) => { targetProg = progress || 0; });

// --- клик/наведение по карточкам → Telegram
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerActive = false, hovered = null;
const downPt = { x: 0, y: 0 };

function setPointer(e) {
  pointer.x = (e.clientX / sizes.w) * 2 - 1;
  pointer.y = -(e.clientY / sizes.h) * 2 + 1;
  pointerActive = true;
}
function hoverIn(card) {
  gsap.to(card.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.5, ease: 'back.out(2.5)' });
  gsap.to(card.position, { z: 0.35, duration: 0.5, ease: 'power2.out' });        // выезжает к зрителю
  gsap.to(card.material, { emissiveIntensity: 0.55, duration: 0.4 });            // свечение
}
function hoverOut(card) {
  gsap.to(card.scale, { x: 1, y: 1, z: 1, duration: 0.45, ease: 'power2.out' });
  gsap.to(card.position, { z: 0, duration: 0.45, ease: 'power2.out' });
  gsap.to(card.material, { emissiveIntensity: 0, duration: 0.4 });
}
function setHover(obj) {
  if (hovered === obj) return;
  if (hovered) hoverOut(hovered);
  hovered = obj;
  if (hovered) hoverIn(hovered);
  canvas.style.cursor = hovered ? 'pointer' : 'default';
}
// клик: переворот на 360° + «пульс», затем переход
function clickCard(card) {
  gsap.to(card.rotation, { y: card.rotation.y + Math.PI * 2, duration: 0.8, ease: 'power3.inOut' });
  gsap.timeline()
    .to(card.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.15, ease: 'power2.out' })
    .to(card.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  gsap.fromTo(card.material, { emissiveIntensity: 1.0 }, { emissiveIntensity: 0.55, duration: 0.6 });
}

canvas.addEventListener('pointermove', setPointer);
canvas.addEventListener('pointerdown', (e) => { downPt.x = e.clientX; downPt.y = e.clientY; });
canvas.addEventListener('pointerup', (e) => {
  if (Math.hypot(e.clientX - downPt.x, e.clientY - downPt.y) > 8) return;  // это скролл, не клик
  setPointer(e);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(cards, false)[0];
  if (hit) {
    clickCard(hit.object);
    window.open(TG, '_blank', 'noopener');
  }
});

// ---------------------------------------------------------------------------
// Цикл
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();
let prog = 0;
function tick(time) {
  lenis.raf(time);
  const t = clock.getElapsedTime();
  prog += (targetProg - prog) * 0.08;

  // поворот и вертикальный сдвиг синхронизированы так,
  // что каждая карточка по очереди проходит точно через центр экрана
  spine.rotation.y = -prog * (N - 1) * ANG;
  spine.position.y = -topY + prog * totalSpan;

  // «жидкое» покачивание
  for (const c of cards) {
    c.rotation.z = Math.sin(t * 0.8 + c.userData.phase) * 0.04;
  }

  if (pointerActive) {
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(cards, false)[0];
    setHover(hit ? hit.object : null);
  }

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
