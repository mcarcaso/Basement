import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { rooms, walls } from "./rooms.js";
import { buildAllWalls } from "./walls.js";
import { buildKitchen } from "./kitchen.js";
import { buildFurnace } from "./furnace.js";
import { buildBathroom } from "./bathroom.js";
import { buildBedroom } from "./bedroom.js";
import { buildLivingRoom } from "./livingroom.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// Camera
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  1,
  5000
);
camera.position.set(136, 400, 500);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// ========== CONTROLS ==========

// Orbit mode (default)
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.target.set(136, 0, 194);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.1;
orbitControls.update();

// FPS mode
const fpsControls = new PointerLockControls(camera, renderer.domElement);
const EYE_HEIGHT = 66; // 5'6" eye level
const MOVE_SPEED = 300; // inches per second
const SPRINT_MULTIPLIER = 3;

let mode = "orbit"; // "orbit" or "fps"
const keys = {};
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let prevTime = performance.now();

// HUD
const hud = document.createElement("div");
hud.style.cssText =
  "position:fixed;top:16px;left:50%;transform:translateX(-50%);color:#fff;font:14px monospace;background:rgba(0,0,0,0.6);padding:8px 16px;border-radius:6px;z-index:10;pointer-events:none;text-align:center;";
hud.textContent = "Orbit Mode — Press F to enter FPS walkthrough";
document.body.appendChild(hud);

// Crosshair (FPS only)
const crosshair = document.createElement("div");
crosshair.style.cssText =
  "position:fixed;top:50%;left:50%;width:20px;height:20px;transform:translate(-50%,-50%);z-index:10;pointer-events:none;display:none;";
crosshair.innerHTML =
  '<svg width="20" height="20"><circle cx="10" cy="10" r="3" fill="none" stroke="white" stroke-width="1"/><line x1="10" y1="2" x2="10" y2="7" stroke="white" stroke-width="1"/><line x1="10" y1="13" x2="10" y2="18" stroke="white" stroke-width="1"/><line x1="2" y1="10" x2="7" y2="10" stroke="white" stroke-width="1"/><line x1="13" y1="10" x2="18" y2="10" stroke="white" stroke-width="1"/></svg>';
document.body.appendChild(crosshair);

function enterFPS() {
  mode = "fps";
  orbitControls.enabled = false;

  // Place camera at eye height in the kitchen
  camera.position.set(68, EYE_HEIGHT, 80);
  camera.rotation.set(0, 0, 0);

  fpsControls.lock();
  crosshair.style.display = "block";
  hud.textContent = "FPS Mode — WASD to move, Shift to sprint, Esc to exit";
}

function exitFPS() {
  mode = "orbit";
  orbitControls.enabled = true;
  fpsControls.unlock();
  crosshair.style.display = "none";
  hud.textContent = "Orbit Mode — Press F to enter FPS walkthrough";

  // Reset orbit to look at center from above
  camera.position.set(136, 400, 500);
  orbitControls.target.set(136, 0, 194);
  orbitControls.update();
}

// Key handling
document.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (e.code === "KeyF" && mode === "orbit") {
    enterFPS();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

// Exit FPS when pointer lock is released
fpsControls.addEventListener("unlock", () => {
  if (mode === "fps") {
    exitFPS();
  }
});

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(200, 300, -100);
dirLight.castShadow = true;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-200, 200, 300);
scene.add(fillLight);

// Build floors
for (const room of rooms) {
  const geo = new THREE.PlaneGeometry(room.width, room.depth);
  const mat = new THREE.MeshStandardMaterial({
    color: room.color,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(
    room.x + room.width / 2,
    0.1,
    room.z + room.depth / 2
  );
  mesh.receiveShadow = true;
  scene.add(mesh);

  // Room label
  if (room.name !== "Empty") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 512;
    canvas.height = 128;
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, 512, 128);
    ctx.font = "bold 48px Arial";
    ctx.fillStyle = "#333333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(room.name, 256, 50);
    ctx.font = "28px Arial";
    ctx.fillStyle = "#666666";
    ctx.fillText(`${room.width}" × ${room.depth}"`, 256, 95);

    const texture = new THREE.CanvasTexture(canvas);
    const labelGeo = new THREE.PlaneGeometry(
      Math.min(room.width * 0.8, 100),
      Math.min(room.width * 0.8, 100) * 0.25
    );
    const labelMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.rotation.x = -Math.PI / 2;
    labelMesh.position.set(
      room.x + room.width / 2,
      0.2,
      room.z + room.depth / 2
    );
    scene.add(labelMesh);
  }
}

// Build walls
const wallGroup = buildAllWalls(walls);
scene.add(wallGroup);

// Build kitchen fixtures
const kitchen = buildKitchen();
scene.add(kitchen);

// Build furnace room
const furnace = buildFurnace();
scene.add(furnace);

// Build bathroom
const bathroom = buildBathroom();
scene.add(bathroom);

// Build bedroom
const bedroom = buildBedroom();
scene.add(bedroom);

// Build living room
const livingRoom = buildLivingRoom();
scene.add(livingRoom);

// Ceiling removed for birds-eye visibility

// Ground plane
const groundGeo = new THREE.PlaneGeometry(600, 600);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x222233,
  roughness: 1,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;
scene.add(ground);

// Export button
const exportBtn = document.createElement("button");
exportBtn.textContent = "Export GLB";
exportBtn.style.cssText =
  "position:fixed;bottom:16px;right:16px;padding:10px 20px;font:14px monospace;background:#444;color:#fff;border:1px solid #666;border-radius:6px;cursor:pointer;z-index:10;";
exportBtn.addEventListener("click", () => {
  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (result) => {
      const blob = new Blob([result], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "basement.glb";
      a.click();
      URL.revokeObjectURL(url);
    },
    (error) => console.error("Export failed:", error),
    { binary: true }
  );
});
document.body.appendChild(exportBtn);

// Handle resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate
function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();
  const delta = (time - prevTime) / 1000;
  prevTime = time;

  if (mode === "fps" && fpsControls.isLocked) {
    const speed = keys["ShiftLeft"] || keys["ShiftRight"]
      ? MOVE_SPEED * SPRINT_MULTIPLIER
      : MOVE_SPEED;

    // Deceleration
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    // Input
    direction.z = (keys["KeyW"] ? 1 : 0) - (keys["KeyS"] ? 1 : 0);
    direction.x = (keys["KeyD"] ? 1 : 0) - (keys["KeyA"] ? 1 : 0);
    direction.normalize();

    if (keys["KeyW"] || keys["KeyS"]) velocity.z -= direction.z * speed * delta;
    if (keys["KeyA"] || keys["KeyD"]) velocity.x -= direction.x * speed * delta;

    fpsControls.moveRight(-velocity.x * delta);
    fpsControls.moveForward(-velocity.z * delta);

    // Lock Y to eye height
    camera.position.y = EYE_HEIGHT;
  }

  if (mode === "orbit") {
    orbitControls.update();
  }

  renderer.render(scene, camera);
}
animate();
