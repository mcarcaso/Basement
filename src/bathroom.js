import * as THREE from "three";

// Bath room: x=16 to 135, z=232 to 282 (119" wide x 50" deep)
// Bottom = south wall (z=282), left = west (x=16), right = east (x=135)
// Layout along south wall, left to right: toilet, vanity, shower

const matPorcelain = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.3 });
const matSeat = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.4 });
const matChrome = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.1, metalness: 0.8 });
const matVanity = new THREE.MeshStandardMaterial({ color: 0xc4a882, roughness: 0.6 });
const matCounter = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.3 });
const matMirror = new THREE.MeshStandardMaterial({ color: 0xccddee, roughness: 0.05, metalness: 0.9 });
const matShowerWall = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4 });
const matGlass = new THREE.MeshStandardMaterial({ color: 0xccddee, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.3 });
const matShowerFloor = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, roughness: 0.6 });

// Standard sizes
const TOILET_W = 18, TOILET_D = 28;
const VANITY_W = 36, VANITY_D = 21, VANITY_H = 34;
const SHOWER_W = 32, SHOWER_D = 32, SHOWER_H = 80;

// All placed against south wall (z=282), from left (x=16) to right
const BATH_LEFT = 16;
const BATH_SOUTH = 282;

function makeToilet(x) {
  const group = new THREE.Group();
  const cx = x + TOILET_W / 2;
  const cz = BATH_SOUTH - TOILET_D / 2 - 2; // 2" off wall

  // Tank
  const tankGeo = new THREE.BoxGeometry(TOILET_W - 2, 18, 8);
  const tank = new THREE.Mesh(tankGeo, matPorcelain);
  tank.position.set(cx, 14, BATH_SOUTH - 5);
  group.add(tank);

  // Bowl
  const bowlGeo = new THREE.CylinderGeometry(7, 8, 14, 16);
  const bowl = new THREE.Mesh(bowlGeo, matPorcelain);
  bowl.position.set(cx, 7, cz);
  group.add(bowl);

  // Seat
  const seatGeo = new THREE.CylinderGeometry(8, 8, 1, 16);
  const seat = new THREE.Mesh(seatGeo, matSeat);
  seat.position.set(cx, 15, cz);
  group.add(seat);

  return group;
}

function makeVanity(x) {
  const group = new THREE.Group();
  const cx = x + VANITY_W / 2;

  // Cabinet
  const cabinetGeo = new THREE.BoxGeometry(VANITY_W, VANITY_H, VANITY_D);
  const cabinet = new THREE.Mesh(cabinetGeo, matVanity);
  cabinet.position.set(cx, VANITY_H / 2, BATH_SOUTH - VANITY_D / 2 - 1);
  group.add(cabinet);

  // Countertop
  const topGeo = new THREE.BoxGeometry(VANITY_W, 2, VANITY_D);
  const top = new THREE.Mesh(topGeo, matCounter);
  top.position.set(cx, VANITY_H + 1, BATH_SOUTH - VANITY_D / 2 - 1);
  group.add(top);

  // Sink basin
  const basinGeo = new THREE.CylinderGeometry(6, 5, 3, 16);
  const basin = new THREE.Mesh(basinGeo, matChrome);
  basin.position.set(cx, VANITY_H + 1, BATH_SOUTH - VANITY_D / 2 - 1);
  group.add(basin);

  // Faucet
  const faucetGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
  const faucet = new THREE.Mesh(faucetGeo, matChrome);
  faucet.position.set(cx, VANITY_H + 6, BATH_SOUTH - 3);
  group.add(faucet);

  // Mirror on wall
  const mirrorGeo = new THREE.BoxGeometry(VANITY_W - 4, 28, 1);
  const mirror = new THREE.Mesh(mirrorGeo, matMirror);
  mirror.position.set(cx, 60, BATH_SOUTH - 1);
  group.add(mirror);

  return group;
}

function makeShower(x) {
  const group = new THREE.Group();
  const cx = x + SHOWER_W / 2;
  const cz = BATH_SOUTH - SHOWER_D / 2;

  // Floor/base
  const baseGeo = new THREE.BoxGeometry(SHOWER_W, 2, SHOWER_D);
  const base = new THREE.Mesh(baseGeo, matShowerFloor);
  base.position.set(cx, 1, cz);
  group.add(base);

  // Glass door/panel (front, north side)
  const glassGeo = new THREE.BoxGeometry(SHOWER_W, SHOWER_H, 1);
  const glass = new THREE.Mesh(glassGeo, matGlass);
  glass.position.set(cx, SHOWER_H / 2, BATH_SOUTH - SHOWER_D);
  group.add(glass);

  // Glass side wall (left/west side)
  const sideGlassGeo = new THREE.BoxGeometry(1, SHOWER_H, SHOWER_D);
  const sideGlass = new THREE.Mesh(sideGlassGeo, matGlass);
  sideGlass.position.set(x, SHOWER_H / 2, cz);
  group.add(sideGlass);

  // Shower head (on south wall)
  const headGeo = new THREE.CylinderGeometry(3, 3, 1, 12);
  const head = new THREE.Mesh(headGeo, matChrome);
  head.position.set(cx, SHOWER_H - 6, BATH_SOUTH - 4);
  group.add(head);

  // Shower arm
  const armGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
  const arm = new THREE.Mesh(armGeo, matChrome);
  arm.rotation.x = Math.PI / 2;
  arm.position.set(cx, SHOWER_H - 6, BATH_SOUTH - 4);
  group.add(arm);

  return group;
}

export function buildBathroom() {
  const group = new THREE.Group();

  // Toilet in bottom-left, vanity centered between toilet and shower, shower in bottom-right
  const toiletX = BATH_LEFT + 4;
  const showerX = 135 - SHOWER_W;
  const toiletEnd = toiletX + TOILET_W;
  const vanityX = toiletEnd + (showerX - toiletEnd - VANITY_W) / 2;
  group.add(makeToilet(toiletX));
  group.add(makeVanity(vanityX));
  group.add(makeShower(showerX));

  return group;
}
