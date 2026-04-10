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
import { buildDoors } from "./doors.js";
import { buildEntrance } from "./entrance.js";

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
camera.rotation.order = "YXZ"; // yaw then pitch (FPS style)

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
const EYE_HEIGHT = 60;
const MOVE_SPEED = 900; // inches per second
const TURN_SPEED = 2.5; // radians per second

let mode = "orbit"; // "orbit" or "fps"
const keys = {};
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let prevTime = performance.now();

// Touch device detection
const isTouchDevice = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;

// Touch input state
const touchInput = {
  moveX: 0, // -1 to 1 (strafe)
  moveY: 0, // -1 to 1 (forward/back)
  lookDX: 0, // look yaw delta (consumed per frame)
  lookDY: 0, // look pitch delta (consumed per frame)
};

// HUD
const hud = document.createElement("div");
hud.style.cssText =
  "position:fixed;top:16px;left:50%;transform:translateX(-50%);color:#fff;font:14px monospace;background:rgba(0,0,0,0.6);padding:8px 16px;border-radius:6px;z-index:10;pointer-events:none;text-align:center;";
hud.textContent = isTouchDevice
  ? "Orbit Mode — tap FPS button to walk through"
  : "Orbit Mode — Press F to enter FPS walkthrough";
document.body.appendChild(hud);

// Enter FPS button (visible always, works on mobile and desktop)
const fpsButton = document.createElement("button");
fpsButton.textContent = "Enter FPS";
fpsButton.style.cssText =
  "position:fixed;bottom:16px;left:16px;padding:12px 20px;font:14px monospace;background:#444;color:#fff;border:1px solid #666;border-radius:6px;cursor:pointer;z-index:11;touch-action:manipulation;";
fpsButton.addEventListener("click", () => {
  if (mode === "orbit") enterFPS();
  else exitFPS();
});
document.body.appendChild(fpsButton);

// Crosshair (FPS only)
const crosshair = document.createElement("div");
crosshair.style.cssText =
  "position:fixed;top:50%;left:50%;width:20px;height:20px;transform:translate(-50%,-50%);z-index:10;pointer-events:none;display:none;";
crosshair.innerHTML =
  '<svg width="20" height="20"><circle cx="10" cy="10" r="3" fill="none" stroke="white" stroke-width="1"/><line x1="10" y1="2" x2="10" y2="7" stroke="white" stroke-width="1"/><line x1="10" y1="13" x2="10" y2="18" stroke="white" stroke-width="1"/><line x1="2" y1="10" x2="7" y2="10" stroke="white" stroke-width="1"/><line x1="13" y1="10" x2="18" y2="10" stroke="white" stroke-width="1"/></svg>';
document.body.appendChild(crosshair);

// === Touch UI: virtual joystick + look area ===
const touchUI = document.createElement("div");
touchUI.style.cssText =
  "position:fixed;inset:0;z-index:9;display:none;pointer-events:none;";
document.body.appendChild(touchUI);

// Joystick base (bottom left)
const joyBase = document.createElement("div");
joyBase.style.cssText =
  "position:absolute;left:30px;bottom:30px;width:120px;height:120px;border-radius:60px;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.4);pointer-events:auto;touch-action:none;";
touchUI.appendChild(joyBase);

const joyKnob = document.createElement("div");
joyKnob.style.cssText =
  "position:absolute;left:30px;top:30px;width:60px;height:60px;border-radius:30px;background:rgba(255,255,255,0.5);pointer-events:none;";
joyBase.appendChild(joyKnob);

// Right side: look / tap area (transparent overlay)
const lookArea = document.createElement("div");
lookArea.style.cssText =
  "position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:auto;touch-action:none;";
touchUI.appendChild(lookArea);
// Layer joystick above lookArea
joyBase.style.zIndex = "2";
lookArea.style.zIndex = "1";

// Joystick state
let joyActive = false;
let joyPointerId = null;
const JOY_RADIUS = 50;

function setJoyKnob(dx, dy) {
  joyKnob.style.left = `${30 + dx}px`;
  joyKnob.style.top = `${30 + dy}px`;
}

joyBase.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  joyActive = true;
  joyPointerId = e.pointerId;
  joyBase.setPointerCapture(e.pointerId);
});

joyBase.addEventListener("pointermove", (e) => {
  if (!joyActive || e.pointerId !== joyPointerId) return;
  const rect = joyBase.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let dx = e.clientX - cx;
  let dy = e.clientY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > JOY_RADIUS) {
    dx = (dx / dist) * JOY_RADIUS;
    dy = (dy / dist) * JOY_RADIUS;
  }
  setJoyKnob(dx, dy);
  touchInput.moveX = dx / JOY_RADIUS;
  touchInput.moveY = dy / JOY_RADIUS;
});

function resetJoy() {
  joyActive = false;
  joyPointerId = null;
  setJoyKnob(0, 0);
  touchInput.moveX = 0;
  touchInput.moveY = 0;
}

joyBase.addEventListener("pointerup", resetJoy);
joyBase.addEventListener("pointercancel", resetJoy);

// Look/tap area state
let lookPointerId = null;
let lookLastX = 0;
let lookLastY = 0;
let lookStartX = 0;
let lookStartY = 0;
let lookStartTime = 0;
let lookMoved = false;
const TAP_MOVE_THRESHOLD = 10; // pixels
const TAP_TIME_THRESHOLD = 300; // ms
const LOOK_SENSITIVITY = 0.004;

lookArea.addEventListener("pointerdown", (e) => {
  if (lookPointerId !== null) return;
  lookPointerId = e.pointerId;
  lookLastX = e.clientX;
  lookLastY = e.clientY;
  lookStartX = e.clientX;
  lookStartY = e.clientY;
  lookStartTime = performance.now();
  lookMoved = false;
  lookArea.setPointerCapture(e.pointerId);
});

lookArea.addEventListener("pointermove", (e) => {
  if (e.pointerId !== lookPointerId) return;
  const dx = e.clientX - lookLastX;
  const dy = e.clientY - lookLastY;
  lookLastX = e.clientX;
  lookLastY = e.clientY;
  touchInput.lookDX += dx;
  touchInput.lookDY += dy;
  const totalDX = Math.abs(e.clientX - lookStartX);
  const totalDY = Math.abs(e.clientY - lookStartY);
  if (totalDX + totalDY > TAP_MOVE_THRESHOLD) lookMoved = true;
});

lookArea.addEventListener("pointerup", (e) => {
  if (e.pointerId !== lookPointerId) return;
  const elapsed = performance.now() - lookStartTime;
  if (!lookMoved && elapsed < TAP_TIME_THRESHOLD) {
    // Treat as tap: toggle door under crosshair
    tryToggleDoor();
  }
  lookPointerId = null;
});

lookArea.addEventListener("pointercancel", () => {
  lookPointerId = null;
});

function enterFPS() {
  mode = "fps";
  orbitControls.enabled = false;
  ceiling.visible = true;

  // Place camera at eye height in the kitchen
  camera.position.set(68, EYE_HEIGHT, 80);
  camera.rotation.set(0, 0, 0);

  if (isTouchDevice) {
    touchUI.style.display = "block";
    hud.textContent = "FPS — joystick to move, drag to look, tap door to open";
  } else {
    fpsControls.lock();
    hud.textContent = "FPS — WASD/Arrows to move, ←/→ to turn, Space = door, Esc to exit";
  }
  crosshair.style.display = "block";
  fpsButton.textContent = "Exit FPS";
}

function exitFPS() {
  mode = "orbit";
  orbitControls.enabled = true;
  ceiling.visible = false;
  if (isTouchDevice) {
    touchUI.style.display = "none";
  } else {
    fpsControls.unlock();
  }
  crosshair.style.display = "none";
  hud.textContent = isTouchDevice
    ? "Orbit Mode — tap FPS button to walk through"
    : "Orbit Mode — Press F to enter FPS walkthrough";
  fpsButton.textContent = "Enter FPS";

  // Reset orbit to look at center from above
  camera.position.set(136, 400, 500);
  orbitControls.target.set(136, 0, 194);
  orbitControls.update();
}

// Raycaster for door interaction
const raycaster = new THREE.Raycaster();
const centerScreen = new THREE.Vector2(0, 0);
const MAX_INTERACT_DISTANCE = 80; // inches

function tryToggleDoor() {
  raycaster.setFromCamera(centerScreen, camera);
  const panels = allDoors.flatMap((d) => d.children);
  const hits = raycaster.intersectObjects(panels, false);
  for (const hit of hits) {
    if (hit.distance > MAX_INTERACT_DISTANCE) break;
    const doorGroup = hit.object.userData.doorGroup;
    if (doorGroup && doorGroup.userData.isDoor) {
      doorGroup.userData.isOpen = !doorGroup.userData.isOpen;
      doorGroup.userData.targetRotation = doorGroup.userData.isOpen
        ? doorGroup.userData.openRotation
        : doorGroup.userData.closedRotation;
      return;
    }
  }
}

// Key handling
document.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (e.code === "KeyF" && mode === "orbit") {
    enterFPS();
  }

  if (e.code === "Space" && mode === "fps" && fpsControls.isLocked) {
    e.preventDefault();
    tryToggleDoor();
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

// Build doors
const doors = buildDoors();
scene.add(doors);

// Build basement entrance (stairs/pit on north side of kitchen)
const entrance = buildEntrance();
scene.add(entrance);

// Collect all toggleable doors
const allDoors = [
  ...doors.userData.toggleableDoors,
  entrance.userData.entranceDoor,
];

// Ceiling (visible only in FPS mode)
const ceilingGeo = new THREE.PlaneGeometry(600, 600);
const ceilingMat = new THREE.MeshStandardMaterial({
  color: 0xeeeeee,
  roughness: 1,
  side: THREE.DoubleSide,
});
const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
ceiling.rotation.x = -Math.PI / 2;
ceiling.position.set(136, 84, 194); // 7ft ceiling
ceiling.visible = false;
scene.add(ceiling);

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

  const fpsActive = mode === "fps" && (isTouchDevice || fpsControls.isLocked);
  if (fpsActive) {
    // Deceleration
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    // Keyboard movement (W/S or arrows; A/D strafe)
    let forward = (keys["KeyW"] || keys["ArrowUp"] ? 1 : 0) - (keys["KeyS"] || keys["ArrowDown"] ? 1 : 0);
    let strafe = (keys["KeyD"] ? 1 : 0) - (keys["KeyA"] ? 1 : 0);

    // Touch joystick input (overrides keyboard on touch devices)
    if (isTouchDevice) {
      forward = -touchInput.moveY; // up on joystick = forward
      strafe = touchInput.moveX;
    }

    direction.z = forward;
    direction.x = strafe;
    direction.normalize();

    if (forward !== 0) velocity.z -= direction.z * MOVE_SPEED * delta;
    if (strafe !== 0) velocity.x -= direction.x * MOVE_SPEED * delta;

    fpsControls.moveRight(-velocity.x * delta);
    fpsControls.moveForward(-velocity.z * delta);

    // Turn with arrow left/right (desktop) or touch drag (mobile)
    const turn = (keys["ArrowLeft"] ? 1 : 0) - (keys["ArrowRight"] ? 1 : 0);
    if (turn !== 0) {
      camera.rotation.y += turn * TURN_SPEED * delta;
    }
    if (isTouchDevice && (touchInput.lookDX !== 0 || touchInput.lookDY !== 0)) {
      camera.rotation.y -= touchInput.lookDX * LOOK_SENSITIVITY;
      // Optional pitch (clamped)
      const newPitch = camera.rotation.x - touchInput.lookDY * LOOK_SENSITIVITY;
      camera.rotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, newPitch));
      touchInput.lookDX = 0;
      touchInput.lookDY = 0;
    }

    // Lock Y to eye height
    camera.position.y = EYE_HEIGHT;
  }

  // Animate doors toward target rotation
  const DOOR_SPEED = 6; // radians per second
  for (const d of allDoors) {
    const current = d.rotation.y;
    const target = d.userData.targetRotation;
    const diff = target - current;
    if (Math.abs(diff) > 0.001) {
      const step = Math.sign(diff) * Math.min(Math.abs(diff), DOOR_SPEED * delta);
      d.rotation.y = current + step;
    }
  }

  if (mode === "orbit") {
    orbitControls.update();
  }

  renderer.render(scene, camera);
}
animate();
