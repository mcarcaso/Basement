import * as THREE from "three";

// Furnace room: x=0 to 75, z=159 to 232
// Standard residential furnace: ~28"W x 30"D x 60"H
// Hot water tank: ~22" diameter x 50"H

const matBody = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6, metalness: 0.3 });
const matDark = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.4 });
const matDuct = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.4, metalness: 0.5 });
const matTank = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4, metalness: 0.2 });

export function buildFurnace() {
  const group = new THREE.Group();

  // Furnace — against west wall, centered-ish in the room
  const fW = 28, fD = 30, fH = 60;
  const fx = fD / 2 + 2; // offset from west wall
  const fz = 159 + 38; // ~38" from north wall

  // Body
  const bodyGeo = new THREE.BoxGeometry(fD, fH, fW);
  const body = new THREE.Mesh(bodyGeo, matBody);
  body.position.set(fx, fH / 2, fz);
  group.add(body);

  // Front panel
  const panelGeo = new THREE.BoxGeometry(1, fH - 4, fW - 4);
  const panel = new THREE.Mesh(panelGeo, matDark);
  panel.position.set(fx + fD / 2 + 0.5, fH / 2, fz);
  group.add(panel);

  // Duct going up from top
  const ductGeo = new THREE.CylinderGeometry(5, 5, 36, 12);
  const duct = new THREE.Mesh(ductGeo, matDuct);
  duct.position.set(fx, fH + 18, fz);
  group.add(duct);

  // Hot water tank — to the right of furnace
  const tankR = 11, tankH = 50;
  const tx = fx;
  const tz = fz + fW / 2 + tankR + 6;

  const tankGeo = new THREE.CylinderGeometry(tankR, tankR, tankH, 20);
  const tank = new THREE.Mesh(tankGeo, matTank);
  tank.position.set(tx, tankH / 2, tz);
  group.add(tank);

  // Tank pipes going up
  for (const xOff of [-4, 4]) {
    const pipeGeo = new THREE.CylinderGeometry(1, 1, 20, 8);
    const pipe = new THREE.Mesh(pipeGeo, matDuct);
    pipe.position.set(tx + xOff, tankH + 10, tz);
    group.add(pipe);
  }

  return group;
}
