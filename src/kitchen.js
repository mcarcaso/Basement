import * as THREE from "three";

const COUNTER_DEPTH = 25;
const COUNTER_HEIGHT = 36;
const CABINET_HEIGHT = 34; // base cabinets under counter
const COUNTER_TOP_THICKNESS = 2;

// Stackable washer/dryer: 27" x 30.38" x 74.38" total
const WASHER_DRYER_WIDTH = 27;
const WASHER_DRYER_DEPTH = 30.38;
const WASHER_HEIGHT = 37.19;
const DRYER_HEIGHT = 37.19;

const materials = {
  counter: new THREE.MeshStandardMaterial({ color: 0xc4a882, roughness: 0.6 }),
  counterTop: new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.3 }),
  stove: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4 }),
  stoveTop: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3 }),
  dishwasher: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.5 }),
  sink: new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.2, metalness: 0.6 }),
  sinkBasin: new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.2, metalness: 0.4 }),
  burner: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 }),
  washer: new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.3, metalness: 0.3 }),
  washerDoor: new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.1, metalness: 0.5 }),
  rangeHood: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.5 }),
};

// All items along west wall (x=0), extending in +x direction (depth=25")
// Wall runs from z=0 to z=159
const fixtures = [
  { name: "Counter", start: 0, length: 24, type: "counter" },
  { name: "Stove", start: 24, length: 30, type: "stove" },
  { name: "Counter", start: 54, length: 15, type: "counter" },
  { name: "Dishwasher", start: 69, length: 18, type: "dishwasher" },
  { name: "Sink", start: 87, length: 33, type: "sink" },
  { name: "Counter", start: 120, length: 39, type: "counter" },
];

function makeCounter(start, length) {
  const group = new THREE.Group();

  // Base cabinet
  const cabinetGeo = new THREE.BoxGeometry(COUNTER_DEPTH, CABINET_HEIGHT, length);
  const cabinet = new THREE.Mesh(cabinetGeo, materials.counter);
  cabinet.position.set(COUNTER_DEPTH / 2, CABINET_HEIGHT / 2, start + length / 2);
  group.add(cabinet);

  // Countertop
  const topGeo = new THREE.BoxGeometry(COUNTER_DEPTH, COUNTER_TOP_THICKNESS, length);
  const top = new THREE.Mesh(topGeo, materials.counterTop);
  top.position.set(COUNTER_DEPTH / 2, CABINET_HEIGHT + COUNTER_TOP_THICKNESS / 2, start + length / 2);
  group.add(top);

  return group;
}

function makeStove(start, length) {
  const group = new THREE.Group();

  // Stove body
  const bodyGeo = new THREE.BoxGeometry(COUNTER_DEPTH, COUNTER_HEIGHT, length);
  const body = new THREE.Mesh(bodyGeo, materials.stove);
  body.position.set(COUNTER_DEPTH / 2, COUNTER_HEIGHT / 2, start + length / 2);
  group.add(body);

  // Stovetop surface
  const topGeo = new THREE.BoxGeometry(COUNTER_DEPTH - 2, 1, length - 2);
  const top = new THREE.Mesh(topGeo, materials.stoveTop);
  top.position.set(COUNTER_DEPTH / 2, COUNTER_HEIGHT + 0.5, start + length / 2);
  group.add(top);

  // Burners (4)
  const burnerPositions = [
    { x: COUNTER_DEPTH * 0.35, z: start + length * 0.3 },
    { x: COUNTER_DEPTH * 0.65, z: start + length * 0.3 },
    { x: COUNTER_DEPTH * 0.35, z: start + length * 0.7 },
    { x: COUNTER_DEPTH * 0.65, z: start + length * 0.7 },
  ];
  for (const pos of burnerPositions) {
    const burnerGeo = new THREE.CylinderGeometry(3, 3, 0.5, 16);
    const burner = new THREE.Mesh(burnerGeo, materials.burner);
    burner.position.set(pos.x, COUNTER_HEIGHT + 1, pos.z);
    group.add(burner);
  }

  return group;
}

function makeSink(start, length) {
  const group = new THREE.Group();

  // Base cabinet
  const cabinetGeo = new THREE.BoxGeometry(COUNTER_DEPTH, CABINET_HEIGHT, length);
  const cabinet = new THREE.Mesh(cabinetGeo, materials.counter);
  cabinet.position.set(COUNTER_DEPTH / 2, CABINET_HEIGHT / 2, start + length / 2);
  group.add(cabinet);

  // Countertop
  const topGeo = new THREE.BoxGeometry(COUNTER_DEPTH, COUNTER_TOP_THICKNESS, length);
  const top = new THREE.Mesh(topGeo, materials.counterTop);
  top.position.set(COUNTER_DEPTH / 2, CABINET_HEIGHT + COUNTER_TOP_THICKNESS / 2, start + length / 2);
  group.add(top);

  // Sink basin (recessed)
  const basinGeo = new THREE.BoxGeometry(COUNTER_DEPTH - 6, COUNTER_TOP_THICKNESS + 1, length - 6);
  const basin = new THREE.Mesh(basinGeo, materials.sinkBasin);
  basin.position.set(COUNTER_DEPTH / 2, CABINET_HEIGHT + 0.5, start + length / 2);
  group.add(basin);

  // Faucet
  const faucetBaseGeo = new THREE.CylinderGeometry(1, 1, 8, 8);
  const faucetBase = new THREE.Mesh(faucetBaseGeo, materials.sink);
  faucetBase.position.set(COUNTER_DEPTH / 2, COUNTER_HEIGHT + 4, start + 4);
  group.add(faucetBase);

  const faucetArmGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
  const faucetArm = new THREE.Mesh(faucetArmGeo, materials.sink);
  faucetArm.rotation.z = Math.PI / 2;
  faucetArm.position.set(COUNTER_DEPTH / 2, COUNTER_HEIGHT + 8, start + 8);
  group.add(faucetArm);

  return group;
}

function makeDishwasher(start, length) {
  const group = new THREE.Group();

  // Dishwasher body
  const bodyGeo = new THREE.BoxGeometry(COUNTER_DEPTH, CABINET_HEIGHT, length);
  const body = new THREE.Mesh(bodyGeo, materials.dishwasher);
  body.position.set(COUNTER_DEPTH / 2, CABINET_HEIGHT / 2, start + length / 2);
  group.add(body);

  // Countertop above
  const topGeo = new THREE.BoxGeometry(COUNTER_DEPTH, COUNTER_TOP_THICKNESS, length);
  const top = new THREE.Mesh(topGeo, materials.counterTop);
  top.position.set(COUNTER_DEPTH / 2, CABINET_HEIGHT + COUNTER_TOP_THICKNESS / 2, start + length / 2);
  group.add(top);

  // Handle
  const handleGeo = new THREE.BoxGeometry(1, 2, length - 4);
  const handle = new THREE.Mesh(handleGeo, materials.sink);
  handle.position.set(1, CABINET_HEIGHT * 0.75, start + length / 2);
  group.add(handle);

  return group;
}

function makeWasherDryer() {
  const group = new THREE.Group();

  // Washer (bottom)
  const washerGeo = new THREE.BoxGeometry(WASHER_DRYER_WIDTH, WASHER_HEIGHT, WASHER_DRYER_DEPTH);
  const washer = new THREE.Mesh(washerGeo, materials.washer);
  washer.position.set(0, WASHER_HEIGHT / 2, 0);
  group.add(washer);

  // Washer door (circle on front)
  const washerDoorGeo = new THREE.CylinderGeometry(10, 10, 1, 24);
  const washerDoor = new THREE.Mesh(washerDoorGeo, materials.washerDoor);
  washerDoor.rotation.x = Math.PI / 2;
  washerDoor.position.set(0, WASHER_HEIGHT / 2, -WASHER_DRYER_DEPTH / 2 + 0.5);
  group.add(washerDoor);

  // Dryer (top)
  const dryerGeo = new THREE.BoxGeometry(WASHER_DRYER_WIDTH, DRYER_HEIGHT, WASHER_DRYER_DEPTH);
  const dryer = new THREE.Mesh(dryerGeo, materials.washer);
  dryer.position.set(0, WASHER_HEIGHT + DRYER_HEIGHT / 2, 0);
  group.add(dryer);

  // Dryer door
  const dryerDoorGeo = new THREE.CylinderGeometry(10, 10, 1, 24);
  const dryerDoor = new THREE.Mesh(dryerDoorGeo, materials.washerDoor);
  dryerDoor.rotation.x = Math.PI / 2;
  dryerDoor.position.set(0, WASHER_HEIGHT + DRYER_HEIGHT / 2, -WASHER_DRYER_DEPTH / 2 + 0.5);
  group.add(dryerDoor);

  return group;
}

// === West wall upper cabinets (x=0, depth 12", mounted 54"-84" high) ===
function makeWestUpperCabinet(startZ, lengthZ) {
  const group = new THREE.Group();
  const D = 12, bottom = 54, H = 30;
  const geo = new THREE.BoxGeometry(D, H, lengthZ);
  const mesh = new THREE.Mesh(geo, materials.counter);
  mesh.position.set(D / 2, bottom + H / 2, startZ + lengthZ / 2);
  group.add(mesh);
  return group;
}

function makeRangeHood(startZ, lengthZ) {
  const group = new THREE.Group();
  const D = 20, H = 8, bottom = 54;

  // Hood body (tapered look using wider bottom, narrower top)
  const hoodGeo = new THREE.BoxGeometry(D, H, lengthZ);
  const hood = new THREE.Mesh(hoodGeo, materials.rangeHood);
  hood.position.set(D / 2, bottom + H / 2, startZ + lengthZ / 2);
  group.add(hood);

  // Chimney/vent going up to ceiling
  const ventGeo = new THREE.BoxGeometry(10, 30, 14);
  const vent = new THREE.Mesh(ventGeo, materials.rangeHood);
  vent.position.set(6, bottom + H + 15, startZ + lengthZ / 2);
  group.add(vent);

  return group;
}

// === East wall fixtures (x=135, extending in -x, running z=0 to z=159) ===

function makeFridge(startZ) {
  const group = new THREE.Group();
  const W = 30, D = 24, H = 70;
  const cz = startZ + W / 2;

  // Body
  const bodyGeo = new THREE.BoxGeometry(D, H, W);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.4 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(135 - D / 2, H / 2, cz);
  group.add(body);

  // Door split line
  const lineGeo = new THREE.BoxGeometry(1, H - 4, 0.5);
  const lineMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const line = new THREE.Mesh(lineGeo, lineMat);
  line.position.set(135 - D + 0.5, H / 2, cz);
  group.add(line);

  // Handles
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6 });
  for (const zOff of [-4, 4]) {
    const hGeo = new THREE.BoxGeometry(1.5, 10, 1);
    const handle = new THREE.Mesh(hGeo, handleMat);
    handle.position.set(135 - D + 1, H * 0.55, cz + zOff);
    group.add(handle);
  }

  return group;
}

function makeEastWallCabinets(startZ, lengthZ) {
  const group = new THREE.Group();
  const D = COUNTER_DEPTH;

  // Base cabinet
  const baseGeo = new THREE.BoxGeometry(D, CABINET_HEIGHT, lengthZ);
  const base = new THREE.Mesh(baseGeo, materials.counter);
  base.position.set(135 - D / 2, CABINET_HEIGHT / 2, startZ + lengthZ / 2);
  group.add(base);

  // Countertop
  const topGeo = new THREE.BoxGeometry(D, COUNTER_TOP_THICKNESS, lengthZ);
  const top = new THREE.Mesh(topGeo, materials.counterTop);
  top.position.set(135 - D / 2, CABINET_HEIGHT + COUNTER_TOP_THICKNESS / 2, startZ + lengthZ / 2);
  group.add(top);

  // Upper cabinets (12" deep, from 54" to 84" high)
  const upperD = 12, upperBottom = 54, upperH = 30;
  const upperGeo = new THREE.BoxGeometry(upperD, upperH, lengthZ);
  const upper = new THREE.Mesh(upperGeo, materials.counter);
  upper.position.set(135 - upperD / 2, upperBottom + upperH / 2, startZ + lengthZ / 2);
  group.add(upper);

  return group;
}

export function buildKitchen() {
  const group = new THREE.Group();

  for (const f of fixtures) {
    let mesh;
    switch (f.type) {
      case "counter":
        mesh = makeCounter(f.start, f.length);
        break;
      case "stove":
        mesh = makeStove(f.start, f.length);
        break;
      case "sink":
        mesh = makeSink(f.start, f.length);
        break;
      case "dishwasher":
        mesh = makeDishwasher(f.start, f.length);
        break;
    }
    if (mesh) group.add(mesh);
  }

  // Stackable washer/dryer on south wall of kitchen
  // South wall is at z=159, placed against the wall, offset from west wall
  const wd = makeWasherDryer();
  // Position: centered on its x, against south wall, a bit away from the west wall corner
  // Against south wall (z=159), as far right as possible while staying over furnace (x=0 to 75)
  wd.position.set(75 - WASHER_DRYER_WIDTH / 2 - 2, 0, 159 - WASHER_DRYER_DEPTH / 2);
  group.add(wd);

  // West wall upper cabinets (skip stove area z=24-54, get range hood instead)
  group.add(makeWestUpperCabinet(0, 24));    // above counter z=0-24
  group.add(makeRangeHood(24, 30));          // above stove z=24-54
  group.add(makeWestUpperCabinet(54, 15));   // above counter z=54-69
  group.add(makeWestUpperCabinet(69, 51));   // above dishwasher+sink z=69-120
  group.add(makeWestUpperCabinet(120, 39));  // above counter z=120-159

  // East wall: leave ~36" open near south end (entrance), then cabinets + fridge + cabinets
  // Fridge (30" wide) centered in remaining space: z=0 to z=123, leave z=123-159 open
  group.add(makeEastWallCabinets(0, 46));   // z=0 to z=46
  group.add(makeFridge(46));                 // z=46 to z=76
  group.add(makeEastWallCabinets(76, 47));  // z=76 to z=123
  // z=123 to z=159 open for entrance clearance

  return group;
}
