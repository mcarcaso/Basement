import * as THREE from "three";
import { WALL_HEIGHT, WALL_THICKNESS } from "./rooms.js";

const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0xf5f0e8,
  roughness: 0.9,
  side: THREE.DoubleSide,
});

const glassMaterial = new THREE.MeshStandardMaterial({
  color: 0xccddee,
  roughness: 0.05,
  metalness: 0.1,
  transparent: true,
  opacity: 0.25,
  side: THREE.DoubleSide,
});

export function buildWall(wallDef) {
  const { x1, z1, x2, z2 } = wallDef;
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);

  const mat = wallDef.glass ? glassMaterial : wallMaterial;
  const geo = new THREE.BoxGeometry(length, WALL_HEIGHT, WALL_THICKNESS);
  const mesh = new THREE.Mesh(geo, mat);

  // Position at midpoint, half wall height up
  mesh.position.set(
    (x1 + x2) / 2,
    WALL_HEIGHT / 2,
    (z1 + z2) / 2
  );
  mesh.rotation.y = -angle;

  return mesh;
}

export function buildAllWalls(wallDefs) {
  const group = new THREE.Group();
  for (const def of wallDefs) {
    group.add(buildWall(def));
  }
  return group;
}
