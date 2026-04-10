// All measurements in inches. Origin is top-left of the floor plan.
// In Three.js: x = floor plan x, z = floor plan y (depth into screen), y = up.

export const WALL_HEIGHT = 84; // 7 feet
export const WALL_THICKNESS = 4;

export const rooms = [
  {
    name: "Kitchen",
    x: 0, z: 0,
    width: 135, depth: 159,
    color: 0x8bc48b,
  },
  {
    name: "Furnace",
    x: 0, z: 159,
    width: 75, depth: 73,
    color: 0xd4a574,
  },
  {
    name: "Hall",
    x: 75, z: 159,
    width: 60, depth: 73,
    color: 0xe8dcc0,
  },
  {
    name: "Empty",
    x: 0, z: 232,
    width: 16, depth: 50,
    color: 0xbbbbbb,
  },
  {
    name: "Bath",
    x: 16, z: 232,
    width: 119, depth: 50,
    color: 0x7eb8d0,
  },
  {
    name: "Garage",
    x: 0, z: 282,
    width: 135, depth: 107,
    color: 0xaaaaaa,
  },
  {
    name: "Bedroom",
    x: 135, z: 0,
    width: 137, depth: 123,
    color: 0xb8a9d4,
  },
  {
    name: "Living Room",
    x: 135, z: 123,
    width: 137, depth: 266,
    color: 0x9494d4,
  },
];

// Wall segments: each is a line from (x1,z1) to (x2,z2)
// with optional door gaps: { start: offset from (x1,z1), size: 34 }
// Walls are either horizontal (same z) or vertical (same x).

export const walls = [
  // === EXTERIOR ===
  // Top wall (north) with door opening in kitchen (x=60 to x=90, 30" door)
  { x1: 0, z1: 0, x2: 60, z2: 0 },
  { x1: 90, z1: 0, x2: 272, z2: 0 },
  // Left wall (west) full height
  { x1: 0, z1: 0, x2: 0, z2: 389 },
  // Right wall (east)
  { x1: 272, z1: 0, x2: 272, z2: 389 },
  // Bottom-left wall (garage south)
  { x1: 0, z1: 389, x2: 135, z2: 389 },
  // Bottom-right wall (main room south) with entry door
  // 16" of wall, then 30" door, then rest
  { x1: 135, z1: 389, x2: 151, z2: 389 },
  // door gap: 151 to 181
  { x1: 181, z1: 389, x2: 272, z2: 389 },

  // === INTERIOR ===
  // Kitchen bottom / furnace top (only across furnace, hall top is open)
  { x1: 0, z1: 159, x2: 75, z2: 159 },

  // Furnace right wall with 34" door (centered: wall is 73" tall)
  // 19.5" wall, 34" door, 19.5" wall
  { x1: 75, z1: 159, x2: 75, z2: 178.5 },
  // door gap: 178.5 to 212.5
  { x1: 75, z1: 212.5, x2: 75, z2: 232 },

  // Furnace bottom wall
  { x1: 0, z1: 232, x2: 75, z2: 232 },

  // Hall bottom / bath top wall with 34" door (centered in hall width 75-135)
  // Hall bottom runs from x=75 to x=135 (60" wide)
  // Center door: 13" wall, 34" door, 13" wall → x=88 to x=122
  { x1: 75, z1: 232, x2: 88, z2: 232 },
  // door gap: 88 to 122
  { x1: 122, z1: 232, x2: 135, z2: 232 },

  // Empty/Bath divider
  { x1: 16, z1: 232, x2: 16, z2: 282 },

  // Bath bottom / Garage top
  { x1: 0, z1: 282, x2: 135, z2: 282 },

  // Shared wall (left side / main room divider) at x=135
  // Solid from z=0 to z=162 (kitchen height + 3")
  { x1: 135, z1: 0, x2: 135, z2: 162 },
  // 34" door gap: z=162 to z=196
  // Solid from z=196 to z=389
  { x1: 135, z1: 196, x2: 135, z2: 389 },

  // Bedroom glass wall at z=123, from x=135 to x=272
  // 60" sliding door centered: (137-60)/2 = 38.5" each side
  { x1: 135, z1: 123, x2: 173.5, z2: 123, glass: true },
  // door gap: x=173.5 to x=233.5
  { x1: 233.5, z1: 123, x2: 272, z2: 123, glass: true },
];
