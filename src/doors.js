import * as THREE from "three";

// Interior door: standard 1.5" thick, 80" tall (6'8")
const DOOR_THICKNESS = 1.5;
const DOOR_HEIGHT = 80;

const matDoor = new THREE.MeshStandardMaterial({ color: 0xd4c0a0, roughness: 0.6 });
const matKnob = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.7, roughness: 0.2 });

// Collects door groups that should be toggleable by the FPS interaction system.
// Each entry is a THREE.Group whose userData contains:
//   isDoor: true
//   closedRotation: Y rotation when closed
//   openRotation: Y rotation when fully open
//   targetRotation: current target
function makeDoorPanel(width) {
  const group = new THREE.Group();

  const panelGeo = new THREE.BoxGeometry(width, DOOR_HEIGHT, DOOR_THICKNESS);
  const panel = new THREE.Mesh(panelGeo, matDoor);
  panel.position.set(width / 2, DOOR_HEIGHT / 2, 0);
  panel.userData.isDoorPanel = true;
  group.add(panel);

  // Knobs on both sides
  const knobGeo = new THREE.SphereGeometry(1, 12, 8);
  const k1 = new THREE.Mesh(knobGeo, matKnob);
  k1.position.set(width - 3, 36, DOOR_THICKNESS / 2 + 0.5);
  k1.userData.isDoorPanel = true;
  group.add(k1);
  const k2 = new THREE.Mesh(knobGeo, matKnob);
  k2.position.set(width - 3, 36, -DOOR_THICKNESS / 2 - 0.5);
  k2.userData.isDoorPanel = true;
  group.add(k2);

  return group;
}

function placeDoor({ hingeX, hingeZ, width, closedRotation, openRotation, startOpen = true }) {
  const group = makeDoorPanel(width);
  const initial = startOpen ? openRotation : closedRotation;
  group.rotation.y = initial;
  group.position.set(hingeX, 0, hingeZ);

  group.userData.isDoor = true;
  group.userData.closedRotation = closedRotation;
  group.userData.openRotation = openRotation;
  group.userData.targetRotation = initial;
  group.userData.isOpen = startOpen;

  // Also tag children so raycaster can walk up to find the door group
  group.children.forEach((c) => (c.userData.doorGroup = group));

  return group;
}

export function buildDoors() {
  const group = new THREE.Group();
  const toggleableDoors = [];

  // Hall ↔ bath door
  const bathDoor = placeDoor({
    hingeX: 122,
    hingeZ: 232,
    width: 34,
    closedRotation: Math.PI,
    openRotation: Math.PI - Math.PI / 3,
  });
  group.add(bathDoor);
  toggleableDoors.push(bathDoor);

  // Hall ↔ furnace door
  const furnaceDoor = placeDoor({
    hingeX: 75,
    hingeZ: 178.5,
    width: 34,
    closedRotation: -Math.PI / 2,
    openRotation: -Math.PI / 2 + Math.PI / 3,
  });
  group.add(furnaceDoor);
  toggleableDoors.push(furnaceDoor);

  // Entry door
  const entryDoor = placeDoor({
    hingeX: 151,
    hingeZ: 389,
    width: 30,
    closedRotation: 0,
    openRotation: Math.PI / 3,
  });
  group.add(entryDoor);
  toggleableDoors.push(entryDoor);

  group.userData.toggleableDoors = toggleableDoors;
  return group;
}
