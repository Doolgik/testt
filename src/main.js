import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';

// ---------------------------------------------------------------------------
// Renderer — ключ к «RTX»-картинке: ACES tone mapping + sRGB вывод
// ---------------------------------------------------------------------------
const canvas = document.querySelector('#webgl');
const sizes = { w: innerWidth, h: innerHeight };

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05060a, 0.05);

const camera = new THREE.PerspectiveCamera(50, sizes.w / sizes.h, 0.1, 100);
camera.position.set(0, 0, 4.2);

// ---------------------------------------------------------------------------
// Image-based lighting: процедурное HDR-окружение (без внешних ассетов).
// Именно отражения окружения убирают эффект «пластика/пластилина».
// ---------------------------------------------------------------------------
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = envTex;

// Доп. свет для драматичных бликов поверх IBL
const key = new THREE.DirectionalLight(0xffffff, 2.5);
key.position.set(3, 4, 5);
scene.add(key);
const rim = new THREE.DirectionalLight(0x88bbff, 2.0);
rim.position.set(-4, -1, -3);
scene.add(rim);

// ---------------------------------------------------------------------------
// Фон: облако частиц-«звёзд» далеко позади модели
// ---------------------------------------------------------------------------
const COUNT = 35000;
const positions = new Float32Array(COUNT * 3);
const seeds = new Float32Array(COUNT);
for (let i = 0; i < COUNT; i++) {
  const r = 9 + Math.random() * 16;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = r * Math.cos(phi);
  seeds[i] = Math.random();
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
pGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
const pMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0 } },
  vertexShader: /* glsl */ `
    uniform float uTime; attribute float aSeed; varying float vS;
    void main(){
      vec3 p = position;
      float t = uTime * 0.15 + aSeed * 6.2831;
      p += vec3(sin(t), cos(t*1.1), sin(t*0.7)) * 0.15;
      vS = aSeed;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = (6.0 / -mv.z) * (0.4 + aSeed);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    varying float vS;
    void main(){
      vec2 c = gl_PointCoord - 0.5;
      float d = smoothstep(0.5, 0.0, length(c));
      vec3 col = mix(vec3(0.5,0.7,1.0), vec3(1.0,0.6,0.85), vS);
      gl_FragColor = vec4(col, d * 0.8);
    }`,
});
const stars = new THREE.Points(pGeo, pMat);
scene.add(stars);

// ---------------------------------------------------------------------------
// 3D-модель: DamagedHelmet (эталонный PBR-ассет — металл/стекло/износ)
// ---------------------------------------------------------------------------
const modelGroup = new THREE.Group();
scene.add(modelGroup);

let model = null;
const loader = new GLTFLoader();
loader.load(
  import.meta.env.BASE_URL + 'models/DamagedHelmet.glb',
  (gltf) => {
    model = gltf.scene;

    // центрируем и нормализуем размер
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.sub(center);
    const scale = 1.7 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);

    // повышаем чёткость материалов (анизотропия текстур)
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    model.traverse((o) => {
      if (o.isMesh && o.material) {
        for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap']) {
          if (o.material[key]) o.material[key].anisotropy = maxAniso;
        }
        o.material.envMapIntensity = 1.2;
      }
    });

    modelGroup.add(model);

    // intro: появление с масштабом и лёгким разворотом
    modelGroup.scale.setScalar(0.001);
    gsap.to(modelGroup.scale, { x: 1, y: 1, z: 1, duration: 1.6, ease: 'power3.out', delay: 0.1 });
    gsap.from(modelGroup.rotation, { y: -Math.PI, duration: 2.0, ease: 'power3.out' });

    document.querySelector('#loader')?.classList.add('hidden');
  },
  undefined,
  (err) => {
    console.error('Не удалось загрузить модель', err);
    document.querySelector('#loader')?.classList.add('hidden');
  }
);

// ---------------------------------------------------------------------------
// Постобработка: лёгкий bloom (только блики, модель остаётся чёткой)
// ---------------------------------------------------------------------------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(sizes.w, sizes.h), 0.35, 0.5, 0.9);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------------------------------------------------------------------------
// Инерционный скролл + вращение модели по прогрессу
// ---------------------------------------------------------------------------
const lenis = new Lenis({ smoothWheel: true, lerp: 0.08 });
let scrollProgress = 0;
lenis.on('scroll', ({ progress }) => { scrollProgress = progress || 0; });

// плавное следование за мышью (наклон модели)
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('mousemove', (e) => {
  mouse.tx = (e.clientX / sizes.w - 0.5) * 2;
  mouse.ty = -(e.clientY / sizes.h - 0.5) * 2;
});
// на телефоне — наклон по гироскопу/тачу
addEventListener('touchmove', (e) => {
  if (!e.touches[0]) return;
  mouse.tx = (e.touches[0].clientX / sizes.w - 0.5) * 2;
  mouse.ty = -(e.touches[0].clientY / sizes.h - 0.5) * 2;
}, { passive: true });

// ---------------------------------------------------------------------------
// Цикл рендера
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();
function tick(time) {
  lenis.raf(time);
  const t = clock.getElapsedTime();
  pMat.uniforms.uTime.value = t;

  mouse.x += (mouse.tx - mouse.x) * 0.05;
  mouse.y += (mouse.ty - mouse.y) * 0.05;

  if (model) {
    // полный оборот по Y привязан к скроллу + медленное автовращение
    modelGroup.rotation.y = scrollProgress * Math.PI * 2 + t * 0.15;
    // наклон за курсором + лёгкое «дыхание»
    modelGroup.rotation.x = mouse.y * 0.4 + Math.sin(t * 0.6) * 0.05;
    modelGroup.rotation.z = -mouse.x * 0.15;
    modelGroup.position.y = Math.sin(t * 0.8) * 0.05;
  }

  stars.rotation.y = t * 0.01;

  // лёгкий параллакс камеры
  camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.04;
  camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.04;
  camera.lookAt(0, 0, 0);

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

// fallback: если модель долго грузится — заголовок всё равно проявим
window.addEventListener('load', () => {
  gsap.from('.hero .kicker, .hero .title, .hero .sub', {
    y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.15, delay: 0.2,
  });
});
