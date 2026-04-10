import * as THREE from "three";

// Living room: x=135 to 272 (137" wide), z=123 to 389 (266" deep)
// North = z=123 (glass wall), South = z=389, West = x=135, East = x=272

const matTableTop = new THREE.MeshStandardMaterial({ color: 0x9e7e5e, roughness: 0.5 });
const matTableLeg = new THREE.MeshStandardMaterial({ color: 0x8b6b4a, roughness: 0.6 });
const matChair = new THREE.MeshStandardMaterial({ color: 0x7a6040, roughness: 0.6 });
const matCouchBase = new THREE.MeshStandardMaterial({ color: 0x5a6a7a, roughness: 0.8 });
const matCushion = new THREE.MeshStandardMaterial({ color: 0x6a7a8a, roughness: 0.9 });
const matTV = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
const matTVScreen = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.1, metalness: 0.3 });
const matTVStand = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5 });

// Dining table: 60"L x 36"W x 30"H with 4 chairs
function makeDiningTable() {
  const group = new THREE.Group();
  const TW = 36, TL = 60, TH = 30;

  // Tabletop
  const topGeo = new THREE.BoxGeometry(TW, 2, TL);
  const top = new THREE.Mesh(topGeo, matTableTop);
  top.position.set(0, TH, 0);
  group.add(top);

  // Legs
  for (const x of [-TW / 2 + 2, TW / 2 - 2]) {
    for (const z of [-TL / 2 + 2, TL / 2 - 2]) {
      const legGeo = new THREE.BoxGeometry(2, TH, 2);
      const leg = new THREE.Mesh(legGeo, matTableLeg);
      leg.position.set(x, TH / 2, z);
      group.add(leg);
    }
  }

  // 4 chairs
  const chairPositions = [
    { x: -TW / 2 - 10, z: -TL / 4, ry: Math.PI / 2 },
    { x: -TW / 2 - 10, z: TL / 4, ry: Math.PI / 2 },
    { x: TW / 2 + 10, z: -TL / 4, ry: -Math.PI / 2 },
    { x: TW / 2 + 10, z: TL / 4, ry: -Math.PI / 2 },
  ];
  for (const pos of chairPositions) {
    const chair = makeChair();
    chair.position.set(pos.x, 0, pos.z);
    chair.rotation.y = pos.ry;
    group.add(chair);
  }

  return group;
}

function makeChair() {
  const group = new THREE.Group();
  // Seat: 16x16x1 at 18" high
  const seatGeo = new THREE.BoxGeometry(16, 1, 16);
  const seat = new THREE.Mesh(seatGeo, matChair);
  seat.position.set(0, 18, 0);
  group.add(seat);

  // Legs
  for (const x of [-6, 6]) {
    for (const z of [-6, 6]) {
      const legGeo = new THREE.BoxGeometry(1.5, 18, 1.5);
      const leg = new THREE.Mesh(legGeo, matChair);
      leg.position.set(x, 9, z);
      group.add(leg);
    }
  }

  // Back
  const backGeo = new THREE.BoxGeometry(16, 18, 1.5);
  const back = new THREE.Mesh(backGeo, matChair);
  back.position.set(0, 27, -7);
  group.add(back);

  return group;
}

// Couch: 84"W x 36"D x 34"H (3-seater)
function makeCouch() {
  const group = new THREE.Group();
  const W = 84, D = 36, seatH = 18, backH = 16, armW = 6;

  // Base/seat
  const seatGeo = new THREE.BoxGeometry(W, seatH, D);
  const seat = new THREE.Mesh(seatGeo, matCouchBase);
  seat.position.set(0, seatH / 2, 0);
  group.add(seat);

  // Seat cushions
  const cushGeo = new THREE.BoxGeometry(W - armW * 2 - 2, 4, D - 8);
  const cush = new THREE.Mesh(cushGeo, matCushion);
  cush.position.set(0, seatH + 2, 2);
  group.add(cush);

  // Back
  const backGeo = new THREE.BoxGeometry(W - armW * 2, backH, 6);
  const back = new THREE.Mesh(backGeo, matCushion);
  back.position.set(0, seatH + backH / 2, -D / 2 + 3);
  group.add(back);

  // Arms
  for (const xOff of [-W / 2 + armW / 2, W / 2 - armW / 2]) {
    const armGeo = new THREE.BoxGeometry(armW, seatH + 8, D);
    const arm = new THREE.Mesh(armGeo, matCouchBase);
    arm.position.set(xOff, (seatH + 8) / 2, 0);
    group.add(arm);
  }

  return group;
}

// Loveseat: 58"W x 36"D x 34"H (2-seater)
function makeLoveseat() {
  const group = new THREE.Group();
  const W = 58, D = 36, seatH = 18, backH = 16, armW = 6;

  const seatGeo = new THREE.BoxGeometry(W, seatH, D);
  const seat = new THREE.Mesh(seatGeo, matCouchBase);
  seat.position.set(0, seatH / 2, 0);
  group.add(seat);

  const cushGeo = new THREE.BoxGeometry(W - armW * 2 - 2, 4, D - 8);
  const cush = new THREE.Mesh(cushGeo, matCushion);
  cush.position.set(0, seatH + 2, 2);
  group.add(cush);

  const backGeo = new THREE.BoxGeometry(W - armW * 2, backH, 6);
  const back = new THREE.Mesh(backGeo, matCushion);
  back.position.set(0, seatH + backH / 2, -D / 2 + 3);
  group.add(back);

  for (const xOff of [-W / 2 + armW / 2, W / 2 - armW / 2]) {
    const armGeo = new THREE.BoxGeometry(armW, seatH + 8, D);
    const arm = new THREE.Mesh(armGeo, matCouchBase);
    arm.position.set(xOff, (seatH + 8) / 2, 0);
    group.add(arm);
  }

  return group;
}

// TV: 55" diagonal ≈ 48"W x 27"H, on stand
function makeTV() {
  const group = new THREE.Group();

  // TV Stand/console: 48"W x 16"D x 24"H
  const standGeo = new THREE.BoxGeometry(16, 24, 48);
  const stand = new THREE.Mesh(standGeo, matTVStand);
  stand.position.set(0, 12, 0);
  group.add(stand);

  // TV screen
  const tvGeo = new THREE.BoxGeometry(2, 27, 48);
  const tv = new THREE.Mesh(tvGeo, matTV);
  tv.position.set(0, 24 + 27 / 2 + 2, 0);
  group.add(tv);

  // Screen face
  const screenGeo = new THREE.BoxGeometry(0.5, 25, 46);
  const screen = new THREE.Mesh(screenGeo, matTVScreen);
  screen.position.set(1.5, 24 + 27 / 2 + 2, 0);
  group.add(screen);

  return group;
}

export function buildLivingRoom() {
  const group = new THREE.Group();

  // Room bounds: x=135-272, z=123-389
  // Room center x = 203.5

  // Dining table: north side, centered
  const table = makeDiningTable();
  table.position.set(203.5, 0, 123 + 60);
  group.add(table);

  // Couch: against east wall (x=272), toward south but moved up
  // Rotated so back faces east wall, front faces west (toward TV)
  const couch = makeCouch();
  couch.rotation.y = -Math.PI / 2;
  couch.position.set(272 - 36 / 2 - 2, 0, 389 - 84 / 2 - 50);
  group.add(couch);

  // Loveseat: against south wall (z=389), closer to right (east)
  // Back faces south wall, front faces north (toward TV)
  const loveseat = makeLoveseat();
  loveseat.rotation.y = Math.PI;
  loveseat.position.set(272 - 58 / 2 - 20, 0, 389 - 36 / 2 - 2);
  group.add(loveseat);

  // TV: against west wall (x=135), toward south
  // Faces east into the room
  const tv = makeTV();
  tv.position.set(135 + 16 / 2 + 2, 0, 389 - 60);
  group.add(tv);

  return group;
}
