import * as THREE from "./vendor/three.module.js";

const canvas = document.getElementById("three-scene");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 9);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: "high-performance",
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
renderer.setSize(window.innerWidth, window.innerHeight);
window.__threeRenderer = renderer;
window.__threeScene = scene;
window.__threeCamera = camera;

const root = new THREE.Group();
scene.add(root);

const cyan = new THREE.Color("#55e7ff");
const green = new THREE.Color("#48ff9b");
const pink = new THREE.Color("#ff4fd8");

const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.35, 3),
  new THREE.MeshBasicMaterial({ color: cyan, wireframe: true, transparent: true, opacity: 0.28 })
);
core.position.set(2.8, 0.4, -1.5);
root.add(core);

const glow = new THREE.Mesh(
  new THREE.SphereGeometry(1.1, 48, 48),
  new THREE.MeshBasicMaterial({
    color: green,
    transparent: true,
    opacity: 0.055,
    blending: THREE.AdditiveBlending,
  })
);
glow.position.copy(core.position);
root.add(glow);

const rings = [];
for (let i = 0; i < 4; i += 1) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.1 + i * 0.42, 0.006, 12, 150),
    new THREE.MeshBasicMaterial({
      color: cyan,
      transparent: true,
      opacity: 0.23 - i * 0.035,
      wireframe: true,
    })
  );
  ring.position.copy(core.position);
  ring.rotation.x = Math.PI / 2 + i * 0.33;
  ring.rotation.y = i * 0.44;
  rings.push(ring);
  root.add(ring);
}

const nodePositions = [
  new THREE.Vector3(-4.2, 2.0, -2.6),
  new THREE.Vector3(-2.4, -1.4, -1.8),
  new THREE.Vector3(0.2, 2.3, -2.1),
  new THREE.Vector3(3.9, -1.7, -2.2),
  new THREE.Vector3(5.0, 1.55, -3.0),
  new THREE.Vector3(-5.2, -2.15, -2.8),
];

const nodeGroup = new THREE.Group();
root.add(nodeGroup);

const nodeMaterials = [cyan, green, pink].map((color) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
  })
);

for (let i = 0; i < nodePositions.length; i += 1) {
  const node = new THREE.Mesh(new THREE.SphereGeometry(0.08, 18, 18), nodeMaterials[i % 3]);
  node.position.copy(nodePositions[i]);
  nodeGroup.add(node);
}

for (let i = 0; i < nodePositions.length; i += 1) {
  const geometry = new THREE.BufferGeometry().setFromPoints([nodePositions[i], core.position]);
  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color: "#55e7ff",
      transparent: true,
      opacity: 0.1 + (i % 3) * 0.035,
    })
  );
  root.add(line);
}

const particleCount = 850;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i += 1) {
  const radius = 4 + Math.random() * 7.5;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
  positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius * 0.58;
  positions[i * 3 + 2] = Math.cos(phi) * radius - 3;

  const color = i % 5 === 0 ? green : i % 7 === 0 ? pink : cyan;
  colors[i * 3] = color.r;
  colors[i * 3 + 1] = color.g;
  colors[i * 3 + 2] = color.b;
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const particles = new THREE.Points(
  particleGeometry,
  new THREE.PointsMaterial({
    size: 0.026,
    vertexColors: true,
    transparent: true,
    opacity: 0.68,
    blending: THREE.AdditiveBlending,
  })
);
root.add(particles);

let mouseX = 0;
let mouseY = 0;

window.addEventListener("pointermove", (event) => {
  mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate(time = 0) {
  const t = time * 0.001;
  root.rotation.y += (mouseX * 0.12 - root.rotation.y) * 0.02;
  root.rotation.x += (-mouseY * 0.08 - root.rotation.x) * 0.02;

  core.rotation.x = t * 0.28;
  core.rotation.y = t * 0.42;
  glow.scale.setScalar(1 + Math.sin(t * 2) * 0.06);

  for (let i = 0; i < rings.length; i += 1) {
    rings[i].rotation.z = t * (0.18 + i * 0.035);
    rings[i].rotation.y += 0.0015 + i * 0.0006;
  }

  nodeGroup.children.forEach((node, index) => {
    node.position.y = nodePositions[index].y + Math.sin(t * 1.4 + index) * 0.12;
    node.scale.setScalar(1 + Math.sin(t * 2.4 + index) * 0.18);
  });

  particles.rotation.y = t * 0.025;
  particles.rotation.x = Math.sin(t * 0.18) * 0.08;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
window.__threeSceneReady = true;
