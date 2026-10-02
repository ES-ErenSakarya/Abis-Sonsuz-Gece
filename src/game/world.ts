export type Box = { minX: number; maxX: number; minZ: number; maxZ: number };
export type Circle = { x: number; z: number; r: number };

export const WORLD = 150;
export const PLAYER_R = 0.42;
export const SPAWN = { x: 0, z: 10 };
export const PLAZA_R = 16.7;

export function onPlaza(x: number, z: number) {
  return Math.hypot(x, z) < PLAZA_R;
}

function box(cx: number, cz: number, w: number, d: number): Box {
  return { minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 };
}

export function faceYaw(x: number, z: number) {
  const len = Math.hypot(x, z) || 1;
  return Math.atan2(-x / len, -z / len);
}

function rotatedBox(x: number, z: number, w: number, d: number, yaw: number): Box {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const lx of [-w / 2, w / 2]) {
    for (const lz of [-d / 2, d / 2]) {
      const wx = x + lx * c + lz * s;
      const wz = z - lx * s + lz * c;
      minX = Math.min(minX, wx);
      maxX = Math.max(maxX, wx);
      minZ = Math.min(minZ, wz);
      maxZ = Math.max(maxZ, wz);
    }
  }
  return { minX, maxX, minZ, maxZ };
}

export const HOUSES = [
  { id: "hall", x: 0, z: -29, w: 34, d: 6.4, h: 3.45, rh: 1.9, door: "pz" as const, yaw: faceYaw(0, -29) },
  { id: "west", x: -26, z: 0, w: 6.4, d: 5.2, h: 2.95, rh: 1.5, door: "pz" as const, yaw: faceYaw(-26, 0) },
  { id: "east", x: 26, z: 0, w: 6.2, d: 5.0, h: 2.85, rh: 1.45, door: "pz" as const, yaw: faceYaw(26, 0) },
  { id: "forge", x: -16.5, z: 22.5, w: 12.6, d: 5.6, h: 2.9, rh: 1.45, door: "pz" as const, yaw: faceYaw(-16.5, 22.5) },
  { id: "barn", x: 22, z: 22, w: 7.4, d: 5.4, h: 3.1, rh: 1.6, door: "pz" as const, yaw: faceYaw(22, 22) },
  { id: "depot", x: 14, z: 30, w: 7.2, d: 5.2, h: 2.85, rh: 1.4, door: "pz" as const, yaw: faceYaw(14, 30) },
];

export const CHIMNEYS = [
  { x: -6, z: -29, y: 5.4 },
  { x: -26, z: 0, y: 4.7 },
  { x: 26, z: 0, y: 4.55 },
  { x: -16.5, z: 22.5, y: 4.5 },
];

export const TREES = [
  { x: -30, z: -28, s: 1.1, seed: 1 },
  { x: 32, z: -26, s: 1.15, seed: 2 },
  { x: -34, z: 22, s: 1.05, seed: 3 },
  { x: 34, z: 16, s: 1.2, seed: 4 },
  { x: -14, z: 36, s: 1.0, seed: 5 },
  { x: 12, z: -38, s: 1.12, seed: 6 },
  { x: 40, z: -6, s: 0.95, seed: 7 },
  { x: -40, z: 6, s: 1.08, seed: 8 },
];

export const BOXES: Box[] = HOUSES.map((h) => rotatedBox(h.x, h.z, h.w + 0.85, h.d + 0.85, h.yaw));

const FISHER = { x: 33, z: 56 };
const FISHER_R = Math.hypot(FISHER.x, FISHER.z) || 1;
const FISHER_IN = { x: -FISHER.x / FISHER_R, z: -FISHER.z / FISHER_R };
const FISHER_SIDE = { x: -FISHER_IN.z, z: FISHER_IN.x };
function fisherAt(inward: number, side = 0) {
  return {
    x: FISHER.x + FISHER_IN.x * inward + FISHER_SIDE.x * side,
    z: FISHER.z + FISHER_IN.z * inward + FISHER_SIDE.z * side,
  };
}
export const FISHER_YAW = Math.atan2(FISHER_IN.x, FISHER_IN.z);
const fisherHutAt = fisherAt(-4.6, 0);
export const FISHER_HUT = { x: fisherHutAt.x, z: fisherHutAt.z, w: 4.4, d: 3.5, yaw: FISHER_YAW };
const pierLand = fisherAt(-1.3, 0);
const pierTip = fisherAt(14.2, 0);
export const PIER = { x0: pierLand.x, z0: pierLand.z, x1: pierTip.x, z1: pierTip.z, half: 1.12 };
export const PIER_TOP = 0.48;
BOXES.push(rotatedBox(FISHER_HUT.x, FISHER_HUT.z, FISHER_HUT.w, FISHER_HUT.d, FISHER_HUT.yaw));

export function onPier(x: number, z: number) {
  const ax = PIER.x1 - PIER.x0;
  const az = PIER.z1 - PIER.z0;
  const len2 = ax * ax + az * az || 1;
  const t = ((x - PIER.x0) * ax + (z - PIER.z0) * az) / len2;
  if (t < 0 || t > 1) return false;
  const px = PIER.x0 + ax * t;
  const pz = PIER.z0 + az * t;
  const dx = x - px;
  const dz = z - pz;
  return dx * dx + dz * dz <= PIER.half * PIER.half;
}

export const CIRCLES: Circle[] = [
  { x: 0, z: 0, r: 1.05 },
  ...TREES.map((t) => ({ x: t.x, z: t.z, r: 0.42 * t.s })),
];

export const WALL_R = 46.2;
const WALL_HALF = 0.72;
export const DECK_HALF = 2.62;
export const RAIL_T = 0.2;
export const RAIL_IN = DECK_HALF - RAIL_T;
export const DECK_TOP = 0.5;
export const WALK_HALF = 1.45;
export const SPAN_IN = 40.4;
export const SPAN_OUT = 70.2;
export const MOAT_IN = 46.55;
export const MOAT_OUT = 64.9;
export const RISE_IN = MOAT_IN - 1.1;
export const RISE_OUT = MOAT_OUT + 1.1;
export const GATE_VIS = Math.asin(Math.min(0.2, (DECK_HALF + 0.08) / WALL_R));

function angDist(a: number, b: number) {
  let d = Math.abs(a - b);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d;
}

export function gateOpen(x: number, z: number, half = 0.11) {
  const a = Math.atan2(x, z);
  return angDist(a, 0) < half || angDist(a, Math.PI) < half || angDist(a, Math.PI / 2) < half || angDist(a, -Math.PI / 2) < half;
}

function spanOf(x: number, z: number, half: number, inner: number, outer: number) {
  if (Math.abs(x) <= half && z >= inner && z <= outer) return { across: x, along: z };
  if (Math.abs(x) <= half && z <= -inner && z >= -outer) return { across: x, along: z };
  if (Math.abs(z) <= half && x >= inner && x <= outer) return { across: z, along: x };
  if (Math.abs(z) <= half && x <= -inner && x >= -outer) return { across: z, along: x };
  return null;
}

export function bridgeSpan(x: number, z: number) {
  return spanOf(x, z, DECK_HALF, SPAN_IN, SPAN_OUT);
}

export function onBridge(x: number, z: number) {
  const span = bridgeSpan(x, z);
  return !!span && Math.abs(span.across) <= WALK_HALF;
}

function deckBlocks(x: number, z: number, radius: number) {
  const span = spanOf(x, z, DECK_HALF + radius, SPAN_IN, SPAN_OUT);
  if (!span) return false;
  return Math.abs(span.across) + radius > WALK_HALF;
}

export function bridgeDeckY(along: number) {
  const a = Math.abs(along);
  const lo = 0.02;
  const hi = DECK_TOP;
  if (a <= SPAN_IN || a >= SPAN_OUT) return lo;
  if (a < RISE_IN) return lo + ((hi - lo) * (a - SPAN_IN)) / (RISE_IN - SPAN_IN);
  if (a <= RISE_OUT) return hi;
  return lo + ((hi - lo) * (SPAN_OUT - a)) / (SPAN_OUT - RISE_OUT);
}

export function groundY(x: number, z: number) {
  if (onPier(x, z)) return PIER_TOP;
  const span = bridgeSpan(x, z);
  if (!span || Math.abs(span.across) > WALK_HALF) return 0;
  return bridgeDeckY(span.along) + 0.04;
}

export function inWater(x: number, z: number, radius = 0) {
  const r = Math.hypot(x, z);
  if (r + radius < MOAT_IN || r - radius > MOAT_OUT) return false;
  return !onBridge(x, z) && !onPier(x, z);
}

export function bridgeName(x: number, z: number) {
  if (!onBridge(x, z)) return "";
  const a = Math.atan2(x, z);
  if (angDist(a, 0) < 0.2) return "Güney köprüsü";
  if (angDist(a, Math.PI) < 0.2) return "Kuzey köprüsü";
  if (angDist(a, Math.PI / 2) < 0.2) return "Doğu köprüsü";
  return "Batı köprüsü";
}

const scratch = { x: 0, z: 0 };

export function blocked(x: number, z: number, radius: number) {
  for (let i = 0; i < BOXES.length; i++) {
    const b = BOXES[i]!;
    const cx = Math.max(b.minX, Math.min(x, b.maxX));
    const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
    const dx = x - cx;
    const dz = z - cz;
    if (dx * dx + dz * dz < radius * radius) return true;
  }
  for (let i = 0; i < CIRCLES.length; i++) {
    const c = CIRCLES[i]!;
    const dx = x - c.x;
    const dz = z - c.z;
    const rr = radius + c.r;
    if (dx * dx + dz * dz < rr * rr) return true;
  }
  if (inWater(x, z, radius)) return true;
  if (deckBlocks(x, z, radius)) return true;
  if (x < -158 || x > 158 || z < -158 || z > 158) return true;
  return false;
}

export function occluded(x: number, z: number, radius: number, y = 4) {
  for (const h of HOUSES) {
    const dx = x - h.x;
    const dz = z - h.z;
    const c = Math.cos(h.yaw);
    const s = Math.sin(h.yaw);
    const lx = dx * c - dz * s;
    const lz = dx * s + dz * c;
    const hw = h.w / 2 + 0.55 + radius;
    const hd = h.d / 2 + 0.5 + radius;
    if (Math.abs(lx) < hw && Math.abs(lz) < hd && y < h.h + h.rh + 0.55) return true;
  }
  return false;
}

const DRY = [
  [0, 28],
  [0, 40],
  [0, -28],
  [22, 8],
  [-18, 8],
  [0, 54],
  [0, -54],
  [54, 0],
  [-54, 0],
];

export function dryLand(x: number, z: number, radius: number) {
  if (!inWater(x, z, 0)) return null;
  let bestX = 0;
  let bestZ = 20;
  let bestD = Infinity;
  for (const [sx, sz] of DRY) {
    if (blocked(sx!, sz!, radius)) continue;
    const d = (sx! - x) * (sx! - x) + (sz! - z) * (sz! - z);
    if (d < bestD) {
      bestD = d;
      bestX = sx!;
      bestZ = sz!;
    }
  }
  if (bestD === Infinity) return null;
  return { x: bestX, z: bestZ };
}

export function slide(x: number, z: number, nx: number, nz: number, radius: number) {
  if (!blocked(nx, nz, radius)) {
    scratch.x = nx;
    scratch.z = nz;
    return scratch;
  }
  if (!blocked(nx, z, radius)) {
    scratch.x = nx;
    scratch.z = z;
    return scratch;
  }
  if (!blocked(x, nz, radius)) {
    scratch.x = x;
    scratch.z = nz;
    return scratch;
  }
  scratch.x = x;
  scratch.z = z;
  return scratch;
}

export const MAP_MARKS = [
  { name: "Köy Muhafızı", x: 2.2, z: 2.5 },
  { name: "Kuyu", x: 0, z: 0 },
  { name: "Zırhçı", x: -20.4, z: 0.4 },
  { name: "Silahçı", x: 20.4, z: -0.2 },
  { name: "Satıcı", x: -12.9, z: 19.9 },
  { name: "Depo", x: 11.2, z: 24.2 },
  { name: "Seyis", x: 16.6, z: 16.4 },
  { name: "Demirci", x: -15.1, z: 18.3 },
  { name: "Balıkçı", x: 33, z: 56 },
  { name: "Madenci", x: 70, z: 10 },
];

export const VEINS = [
  { x: 68, z: 6 },
  { x: 74, z: 14 },
  { x: -70, z: 12 },
  { x: 62, z: -20 },
  { x: -66, z: -16 },
  { x: 80, z: -8 },
];

export function zoneName(x: number, z: number) {
  const named = bridgeName(x, z);
  if (named) return named;
  const spots = [
    { n: "Köy Merkezi", x: 0, z: 0, r: 16.6 },
    { n: "Demirci ve satıcı", x: -16, z: 20, r: 8 },
    { n: "Ahır", x: 22, z: 22, r: 6 },
    { n: "Usta salonu", x: 0, z: -29, r: 18 },
    { n: "Zırhçı", x: -26, z: 0, r: 6 },
    { n: "Silahçı", x: 26, z: 0, r: 6 },
    { n: "Pazar", x: -14, z: 18, r: 5 },
    { n: "Depo", x: 14, z: 30, r: 6 },
    { n: "Köy", x: 0, z: 0, r: 47 },
    { n: "Dış arazi", x: 0, z: 0, r: 170 },
  ];
  for (let i = 0; i < spots.length; i++) {
    const s = spots[i]!;
    const dx = x - s.x;
    const dz = z - s.z;
    if (dx * dx + dz * dz < s.r * s.r) return s.n;
  }
  return "Demirköy";
}
