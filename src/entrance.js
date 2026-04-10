import * as THREE from "three";

// Basement entrance on north wall of kitchen.
// Door opening: x=60 to x=90 at z=0
// Outside the wall, a landing (with drain) then steps up to ground level (y=60)
//
// Layout (world coords, outside = negative z):
//   Landing: x=60 to 90, z=-36 to 0, y=0 (floor level)
//   Steps: x=60 to 90, z=-116 to -36 (8 steps × 10" deep = 80")
//     Step 1 at z=-46, top at y=7.5
//     Step 8 at z=-116, top at y=60

const matConcrete = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
const matConcreteDark = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });
const matDrain = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6, metalness: 0.5 });
const matDoor = new THREE.MeshStandardMaterial({ color: 0xd4c0a0, roughness: 0.6 });
const matKnob = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.7, roughness: 0.2 });

const PIT_WIDTH = 30;     // x span
const LANDING_DEPTH = 36; // z span of landing
const STEP_COUNT = 8;
const STEP_RUN = 10;      // each step depth
const STEP_RISE = 7.5;    // each step height
const TOTAL_RISE = STEP_COUNT * STEP_RISE; // 60"
const TOTAL_RUN = STEP_COUNT * STEP_RUN;   // 80"

const DOOR_X_MIN = 60;
const DOOR_X_MAX = 90;

export function buildEntrance() {
  const group = new THREE.Group();

  const xMin = DOOR_X_MIN;
  const xMax = DOOR_X_MAX;
  const cx = (xMin + xMax) / 2;

  // Landing floor (with recessed drain)
  const landingGeo = new THREE.BoxGeometry(PIT_WIDTH, 2, LANDING_DEPTH);
  const landing = new THREE.Mesh(landingGeo, matConcrete);
  landing.position.set(cx, -1, -LANDING_DEPTH / 2);
  group.add(landing);

  // Drain grate (centered in landing)
  const drainGeo = new THREE.BoxGeometry(6, 0.5, 6);
  const drain = new THREE.Mesh(drainGeo, matDrain);
  drain.position.set(cx, 0.01, -LANDING_DEPTH / 2);
  group.add(drain);

  // Drain grate bars (thin strips on top for visual)
  for (let i = -2; i <= 2; i++) {
    const barGeo = new THREE.BoxGeometry(5, 0.3, 0.4);
    const bar = new THREE.Mesh(barGeo, matDrain);
    bar.position.set(cx, 0.15, -LANDING_DEPTH / 2 + i * 1.2);
    group.add(bar);
  }

  // Steps (going up from landing, north direction)
  for (let i = 0; i < STEP_COUNT; i++) {
    const stepH = (i + 1) * STEP_RISE;
    const stepZ = -LANDING_DEPTH - i * STEP_RUN - STEP_RUN / 2;
    const stepGeo = new THREE.BoxGeometry(PIT_WIDTH, stepH, STEP_RUN);
    const step = new THREE.Mesh(stepGeo, matConcrete);
    step.position.set(cx, stepH / 2, stepZ);
    group.add(step);
  }

  // Retaining walls on sides of the pit (east and west walls)
  const pitTotalDepth = LANDING_DEPTH + TOTAL_RUN; // 36 + 80 = 116
  const wallH = TOTAL_RISE + 4;
  for (const side of [-1, 1]) {
    const sideGeo = new THREE.BoxGeometry(2, wallH, pitTotalDepth);
    const wall = new THREE.Mesh(sideGeo, matConcreteDark);
    const wx = side === -1 ? xMin - 1 : xMax + 1;
    wall.position.set(wx, wallH / 2 - 2, -pitTotalDepth / 2);
    group.add(wall);
  }

  // Exterior door (at z=0, hinged at x=60, swings inward into kitchen)
  const doorWidth = PIT_WIDTH;
  const doorHeight = 80;
  const doorThick = 1.5;
  const doorGroup = new THREE.Group();

  const panelGeo = new THREE.BoxGeometry(doorWidth, doorHeight, doorThick);
  const panel = new THREE.Mesh(panelGeo, matDoor);
  panel.position.set(doorWidth / 2, doorHeight / 2, 0);
  panel.userData.isDoorPanel = true;
  doorGroup.add(panel);

  const knobGeo = new THREE.SphereGeometry(1, 12, 8);
  const knob1 = new THREE.Mesh(knobGeo, matKnob);
  knob1.position.set(doorWidth - 3, 36, doorThick / 2 + 0.5);
  knob1.userData.isDoorPanel = true;
  doorGroup.add(knob1);
  const knob2 = new THREE.Mesh(knobGeo, matKnob);
  knob2.position.set(doorWidth - 3, 36, -doorThick / 2 - 0.5);
  knob2.userData.isDoorPanel = true;
  doorGroup.add(knob2);

  // Swing inward (into kitchen, +z direction). Hinge at (xMin, 0, 0).
  const closedRotation = 0;
  const openRotation = -Math.PI / 3;
  doorGroup.rotation.y = openRotation;
  doorGroup.position.set(xMin, 0, 0);

  doorGroup.userData.isDoor = true;
  doorGroup.userData.closedRotation = closedRotation;
  doorGroup.userData.openRotation = openRotation;
  doorGroup.userData.targetRotation = openRotation;
  doorGroup.userData.isOpen = true;
  doorGroup.children.forEach((c) => (c.userData.doorGroup = doorGroup));

  group.add(doorGroup);
  group.userData.entranceDoor = doorGroup;

  return group;
}
