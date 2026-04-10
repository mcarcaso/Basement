import * as THREE from "three";

// Bedroom: x=135 to 272, z=0 to 123
// Double bed: 54"W x 75"L x 25"H (frame+mattress)
// Dresser: 60"W x 18"D x 34"H

const matFrame = new THREE.MeshStandardMaterial({ color: 0x8b6b4a, roughness: 0.7 });
const matMattress = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.8 });
const matPillow = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.9 });
const matDresser = new THREE.MeshStandardMaterial({ color: 0x9e7e5e, roughness: 0.6 });
const matDresserTop = new THREE.MeshStandardMaterial({ color: 0xb08e6e, roughness: 0.5 });
const matHandle = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6 });
const matWardrobe = new THREE.MeshStandardMaterial({ color: 0x7a6040, roughness: 0.6 });
const matWardrobeDoor = new THREE.MeshStandardMaterial({ color: 0x8b7050, roughness: 0.5 });

function makeBed() {
  const group = new THREE.Group();
  const W = 54, L = 75, frameH = 8, mattH = 10;

  // Frame
  const frameGeo = new THREE.BoxGeometry(W, frameH, L);
  const frame = new THREE.Mesh(frameGeo, matFrame);
  frame.position.set(0, frameH / 2, 0);
  group.add(frame);

  // Headboard (against north wall)
  const hbGeo = new THREE.BoxGeometry(W, 30, 3);
  const hb = new THREE.Mesh(hbGeo, matFrame);
  hb.position.set(0, 15, -L / 2 + 1.5);
  group.add(hb);

  // Mattress
  const mattGeo = new THREE.BoxGeometry(W - 2, mattH, L - 4);
  const matt = new THREE.Mesh(mattGeo, matMattress);
  matt.position.set(0, frameH + mattH / 2, 1);
  group.add(matt);

  // Pillows
  for (const xOff of [-14, 14]) {
    const pillowGeo = new THREE.BoxGeometry(18, 4, 12);
    const pillow = new THREE.Mesh(pillowGeo, matPillow);
    pillow.position.set(xOff, frameH + mattH + 2, -L / 2 + 12);
    group.add(pillow);
  }

  return group;
}

function makeDresser() {
  const group = new THREE.Group();
  const W = 60, D = 18, H = 34;

  // Body
  const bodyGeo = new THREE.BoxGeometry(W, H, D);
  const body = new THREE.Mesh(bodyGeo, matDresser);
  body.position.set(0, H / 2, 0);
  group.add(body);

  // Top
  const topGeo = new THREE.BoxGeometry(W + 1, 1.5, D + 1);
  const top = new THREE.Mesh(topGeo, matDresserTop);
  top.position.set(0, H + 0.75, 0);
  group.add(top);

  // Drawer handles (3 rows x 2 columns)
  for (let row = 0; row < 3; row++) {
    for (const xOff of [-12, 12]) {
      const hGeo = new THREE.BoxGeometry(6, 1, 1);
      const handle = new THREE.Mesh(hGeo, matHandle);
      handle.position.set(xOff, 6 + row * 10, -D / 2 - 0.5);
      group.add(handle);
    }
  }

  return group;
}

function makeWardrobe() {
  const group = new THREE.Group();
  const W = 40, D = 24, H = 72;

  // Body
  const bodyGeo = new THREE.BoxGeometry(W, H, D);
  const body = new THREE.Mesh(bodyGeo, matWardrobe);
  body.position.set(0, H / 2, 0);
  group.add(body);

  // Door fronts (two doors)
  for (const xOff of [-W / 4, W / 4]) {
    const doorGeo = new THREE.BoxGeometry(W / 2 - 1, H - 4, 1);
    const door = new THREE.Mesh(doorGeo, matWardrobeDoor);
    door.position.set(xOff, H / 2, -D / 2 - 0.5);
    group.add(door);
  }

  // Handles
  for (const xOff of [-2, 2]) {
    const hGeo = new THREE.BoxGeometry(1, 8, 1);
    const handle = new THREE.Mesh(hGeo, matHandle);
    handle.position.set(xOff, H / 2, -D / 2 - 1);
    group.add(handle);
  }

  return group;
}

export function buildBedroom() {
  const group = new THREE.Group();

  // Murphy bed: centered on north wall, folds down south
  // Room center x = 135 + 137/2 = 203.5
  const bed = makeBed();
  bed.position.set(203.5, 0, 75 / 2 + 4);
  group.add(bed);

  // Dresser: against west wall (x=135), rotated to face east
  const dresser = makeDresser();
  dresser.rotation.y = Math.PI / 2;
  dresser.position.set(135 + 18 / 2 + 2, 0, 123 / 2);
  group.add(dresser);

  // Wardrobe: against east wall (x=272), north end, facing west
  const wardrobe = makeWardrobe();
  wardrobe.rotation.y = -Math.PI / 2;
  wardrobe.position.set(272 - 24 / 2 - 2, 0, 40 / 2 + 4);
  group.add(wardrobe);

  return group;
}
