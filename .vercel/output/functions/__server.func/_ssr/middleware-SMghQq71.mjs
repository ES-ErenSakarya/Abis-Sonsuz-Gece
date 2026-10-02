import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { n as createMiddleware } from "./ssr.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/middleware-SMghQq71.js
var middleware_SMghQq71_exports = /* @__PURE__ */ __exportAll({
	$: () => dryLand,
	A: () => input,
	B: () => MAP_MARKS,
	C: () => useRpg,
	D: () => beginPlay,
	E: () => axes,
	F: () => DECK_HALF,
	G: () => PLAYER_R,
	H: () => MOAT_OUT,
	I: () => DECK_TOP,
	J: () => SPAN_OUT,
	K: () => RAIL_T,
	L: () => FISHER_HUT,
	M: () => setWindVolume,
	N: () => sim,
	O: () => bindControlsTest,
	P: () => CHIMNEYS,
	Q: () => bridgeName,
	R: () => FISHER_YAW,
	S: () => takeCast,
	T: () => weaponStyleOf,
	U: () => PIER,
	V: () => MOAT_IN,
	W: () => PIER_TOP,
	X: () => VEINS,
	Y: () => TREES,
	Z: () => blocked,
	_: () => setCarry,
	a: () => ENHANCE,
	at: () => onPlaza,
	b: () => skillTier,
	c: () => STAT_LABEL,
	ct: () => hudStore_exports,
	d: () => captureSave,
	et: () => faceYaw,
	f: () => className,
	g: () => readCarry,
	h: () => openBagCount,
	i: () => CLASS_TREES,
	it: () => onPier,
	j: () => readSim,
	k: () => held,
	l: () => applySave,
	lt: () => useHud,
	m: () => itemStats,
	n: () => CATALOG,
	nt: () => inWater,
	o: () => MENTORS,
	ot: () => slide,
	p: () => displayName,
	q: () => SPAN_IN,
	r: () => CLASS_LIST,
	rt: () => occluded,
	s: () => SLOT_LABEL,
	st: () => zoneName,
	t: () => authMiddleware,
	tt: () => groundY,
	u: () => asClassId,
	v: () => skillCdLeft,
	w: () => weaponFits,
	x: () => sumStats,
	y: () => skillPreview,
	z: () => HOUSES
});
var hudStore_exports = /* @__PURE__ */ __exportAll$1({ useHud: () => useHud });
function createHud() {
	return create((set) => ({
		playing: false,
		ready: false,
		zone: "Demirköy",
		setPlaying: (playing) => set({ playing }),
		setReady: (ready) => set({ ready }),
		setZone: (zone) => set({ zone })
	}));
}
var scope = globalThis;
var useHud = scope.__demirHud ??= createHud();
var PLAYER_R = .42;
var SPAWN = {
	x: 0,
	z: 10
};
var PLAZA_R = 16.7;
function onPlaza(x, z) {
	return Math.hypot(x, z) < PLAZA_R;
}
function faceYaw(x, z) {
	const len = Math.hypot(x, z) || 1;
	return Math.atan2(-x / len, -z / len);
}
function rotatedBox(x, z, w, d, yaw) {
	const c = Math.cos(yaw);
	const s = Math.sin(yaw);
	let minX = Infinity;
	let maxX = -Infinity;
	let minZ = Infinity;
	let maxZ = -Infinity;
	for (const lx of [-w / 2, w / 2]) for (const lz of [-d / 2, d / 2]) {
		const wx = x + lx * c + lz * s;
		const wz = z - lx * s + lz * c;
		minX = Math.min(minX, wx);
		maxX = Math.max(maxX, wx);
		minZ = Math.min(minZ, wz);
		maxZ = Math.max(maxZ, wz);
	}
	return {
		minX,
		maxX,
		minZ,
		maxZ
	};
}
var HOUSES = [
	{
		id: "hall",
		x: 0,
		z: -29,
		w: 34,
		d: 6.4,
		h: 3.45,
		rh: 1.9,
		door: "pz",
		yaw: faceYaw(0, -29)
	},
	{
		id: "west",
		x: -26,
		z: 0,
		w: 6.4,
		d: 5.2,
		h: 2.95,
		rh: 1.5,
		door: "pz",
		yaw: faceYaw(-26, 0)
	},
	{
		id: "east",
		x: 26,
		z: 0,
		w: 6.2,
		d: 5,
		h: 2.85,
		rh: 1.45,
		door: "pz",
		yaw: faceYaw(26, 0)
	},
	{
		id: "forge",
		x: -16.5,
		z: 22.5,
		w: 12.6,
		d: 5.6,
		h: 2.9,
		rh: 1.45,
		door: "pz",
		yaw: faceYaw(-16.5, 22.5)
	},
	{
		id: "barn",
		x: 22,
		z: 22,
		w: 7.4,
		d: 5.4,
		h: 3.1,
		rh: 1.6,
		door: "pz",
		yaw: faceYaw(22, 22)
	},
	{
		id: "depot",
		x: 14,
		z: 30,
		w: 7.2,
		d: 5.2,
		h: 2.85,
		rh: 1.4,
		door: "pz",
		yaw: faceYaw(14, 30)
	}
];
var CHIMNEYS = [
	{
		x: -6,
		z: -29,
		y: 5.4
	},
	{
		x: -26,
		z: 0,
		y: 4.7
	},
	{
		x: 26,
		z: 0,
		y: 4.55
	},
	{
		x: -16.5,
		z: 22.5,
		y: 4.5
	}
];
var TREES = [
	{
		x: -30,
		z: -28,
		s: 1.1,
		seed: 1
	},
	{
		x: 32,
		z: -26,
		s: 1.15,
		seed: 2
	},
	{
		x: -34,
		z: 22,
		s: 1.05,
		seed: 3
	},
	{
		x: 34,
		z: 16,
		s: 1.2,
		seed: 4
	},
	{
		x: -14,
		z: 36,
		s: 1,
		seed: 5
	},
	{
		x: 12,
		z: -38,
		s: 1.12,
		seed: 6
	},
	{
		x: 40,
		z: -6,
		s: .95,
		seed: 7
	},
	{
		x: -40,
		z: 6,
		s: 1.08,
		seed: 8
	}
];
var BOXES = HOUSES.map((h) => rotatedBox(h.x, h.z, h.w + .85, h.d + .85, h.yaw));
var FISHER = {
	x: 33,
	z: 56
};
var FISHER_R = Math.hypot(FISHER.x, FISHER.z) || 1;
var FISHER_IN = {
	x: -FISHER.x / FISHER_R,
	z: -FISHER.z / FISHER_R
};
var FISHER_SIDE = {
	x: -FISHER_IN.z,
	z: FISHER_IN.x
};
function fisherAt(inward, side = 0) {
	return {
		x: FISHER.x + FISHER_IN.x * inward + FISHER_SIDE.x * side,
		z: FISHER.z + FISHER_IN.z * inward + FISHER_SIDE.z * side
	};
}
var FISHER_YAW = Math.atan2(FISHER_IN.x, FISHER_IN.z);
var fisherHutAt = fisherAt(-4.6, 0);
var FISHER_HUT = {
	x: fisherHutAt.x,
	z: fisherHutAt.z,
	w: 4.4,
	d: 3.5,
	yaw: FISHER_YAW
};
var pierLand = fisherAt(-1.3, 0);
var pierTip = fisherAt(14.2, 0);
var PIER = {
	x0: pierLand.x,
	z0: pierLand.z,
	x1: pierTip.x,
	z1: pierTip.z,
	half: 1.12
};
var PIER_TOP = .48;
BOXES.push(rotatedBox(FISHER_HUT.x, FISHER_HUT.z, FISHER_HUT.w, FISHER_HUT.d, FISHER_HUT.yaw));
function onPier(x, z) {
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
var CIRCLES = [{
	x: 0,
	z: 0,
	r: 1.05
}, ...TREES.map((t) => ({
	x: t.x,
	z: t.z,
	r: .42 * t.s
}))];
var WALL_R = 46.2;
var DECK_HALF = 2.62;
var RAIL_T = .2;
var DECK_TOP = .56;
var SPAN_IN = 43.6;
var SPAN_OUT = 65.8;
var MOAT_IN = 46.55;
var MOAT_OUT = 64.9;
Math.asin(Math.min(.2, 2.7 / WALL_R));
function angDist(a, b) {
	let d = Math.abs(a - b);
	if (d > Math.PI) d = Math.PI * 2 - d;
	return d;
}
function spanOf(x, z, half, inner, outer) {
	if (Math.abs(x) <= half && z >= inner && z <= outer) return {
		across: x,
		along: z
	};
	if (Math.abs(x) <= half && z <= -inner && z >= -outer) return {
		across: x,
		along: z
	};
	if (Math.abs(z) <= half && x >= inner && x <= outer) return {
		across: z,
		along: x
	};
	if (Math.abs(z) <= half && x <= -inner && x >= -outer) return {
		across: z,
		along: x
	};
	return null;
}
function bridgeSpan(x, z) {
	return spanOf(x, z, DECK_HALF, SPAN_IN, SPAN_OUT);
}
function onBridge(x, z) {
	const span = bridgeSpan(x, z);
	return !!span && Math.abs(span.across) <= 1.88;
}
function deckBlocks(x, z, radius) {
	const span = spanOf(x, z, DECK_HALF + radius, SPAN_IN, SPAN_OUT);
	if (!span) return false;
	return Math.abs(span.across) + radius > 2.38;
}
function groundY(x, z) {
	if (onPier(x, z)) return PIER_TOP;
	if (!onBridge(x, z)) return 0;
	return .64;
}
function inWater(x, z, radius = 0) {
	const r = Math.hypot(x, z);
	if (r + radius < 46.55 || r - radius > 64.9) return false;
	return !onBridge(x, z) && !onPier(x, z);
}
function bridgeName(x, z) {
	if (!onBridge(x, z)) return "";
	const a = Math.atan2(x, z);
	if (angDist(a, 0) < .2) return "Güney köprüsü";
	if (angDist(a, Math.PI) < .2) return "Kuzey köprüsü";
	if (angDist(a, Math.PI / 2) < .2) return "Doğu köprüsü";
	return "Batı köprüsü";
}
var scratch = {
	x: 0,
	z: 0
};
function blocked(x, z, radius) {
	for (let i = 0; i < BOXES.length; i++) {
		const b = BOXES[i];
		const cx = Math.max(b.minX, Math.min(x, b.maxX));
		const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
		const dx = x - cx;
		const dz = z - cz;
		if (dx * dx + dz * dz < radius * radius) return true;
	}
	for (let i = 0; i < CIRCLES.length; i++) {
		const c = CIRCLES[i];
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
function occluded(x, z, radius, y = 4) {
	for (const h of HOUSES) {
		const dx = x - h.x;
		const dz = z - h.z;
		const c = Math.cos(h.yaw);
		const s = Math.sin(h.yaw);
		const lx = dx * c - dz * s;
		const lz = dx * s + dz * c;
		const hw = h.w / 2 + .55 + radius;
		const hd = h.d / 2 + .5 + radius;
		if (Math.abs(lx) < hw && Math.abs(lz) < hd && y < h.h + h.rh + .55) return true;
	}
	return false;
}
var DRY = [
	[0, 28],
	[0, 40],
	[0, -28],
	[22, 8],
	[-18, 8],
	[0, 54],
	[0, -54],
	[54, 0],
	[-54, 0]
];
function dryLand(x, z, radius) {
	if (!inWater(x, z, 0)) return null;
	let bestX = 0;
	let bestZ = 20;
	let bestD = Infinity;
	for (const [sx, sz] of DRY) {
		if (blocked(sx, sz, radius)) continue;
		const d = (sx - x) * (sx - x) + (sz - z) * (sz - z);
		if (d < bestD) {
			bestD = d;
			bestX = sx;
			bestZ = sz;
		}
	}
	if (bestD === Infinity) return null;
	return {
		x: bestX,
		z: bestZ
	};
}
function slide(x, z, nx, nz, radius) {
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
var MAP_MARKS = [
	{
		name: "Köy Muhafızı",
		x: 2.2,
		z: 2.5
	},
	{
		name: "Kuyu",
		x: 0,
		z: 0
	},
	{
		name: "Zırhçı",
		x: -20.4,
		z: .4
	},
	{
		name: "Silahçı",
		x: 20.4,
		z: -.2
	},
	{
		name: "Satıcı",
		x: -12.9,
		z: 19.9
	},
	{
		name: "Depo",
		x: 11.2,
		z: 24.2
	},
	{
		name: "Seyis",
		x: 16.6,
		z: 16.4
	},
	{
		name: "Demirci",
		x: -15.1,
		z: 18.3
	},
	{
		name: "Balıkçı",
		x: 33,
		z: 56
	},
	{
		name: "Madenci",
		x: 70,
		z: 10
	}
];
var VEINS = [
	{
		x: 68,
		z: 6
	},
	{
		x: 74,
		z: 14
	},
	{
		x: -70,
		z: 12
	},
	{
		x: 62,
		z: -20
	},
	{
		x: -66,
		z: -16
	},
	{
		x: 80,
		z: -8
	}
];
function zoneName(x, z) {
	const named = bridgeName(x, z);
	if (named) return named;
	const spots = [
		{
			n: "Köy Merkezi",
			x: 0,
			z: 0,
			r: 16.6
		},
		{
			n: "Demirci ve satıcı",
			x: -16,
			z: 20,
			r: 8
		},
		{
			n: "Ahır",
			x: 22,
			z: 22,
			r: 6
		},
		{
			n: "Usta salonu",
			x: 0,
			z: -29,
			r: 18
		},
		{
			n: "Zırhçı",
			x: -26,
			z: 0,
			r: 6
		},
		{
			n: "Silahçı",
			x: 26,
			z: 0,
			r: 6
		},
		{
			n: "Pazar",
			x: -14,
			z: 18,
			r: 5
		},
		{
			n: "Depo",
			x: 14,
			z: 30,
			r: 6
		},
		{
			n: "Köy",
			x: 0,
			z: 0,
			r: 47
		},
		{
			n: "Dış arazi",
			x: 0,
			z: 0,
			r: 170
		}
	];
	for (let i = 0; i < spots.length; i++) {
		const s = spots[i];
		const dx = x - s.x;
		const dz = z - s.z;
		if (dx * dx + dz * dz < s.r * s.r) return s.n;
	}
	return "Demirköy";
}
function bag() {
	const scope = globalThis;
	if (!scope.__demirBag) scope.__demirBag = {
		keys: /* @__PURE__ */ new Set(),
		injected: null,
		joyX: 0,
		joyY: 0,
		orbit: 0,
		pitch: .46,
		dist: 4.7,
		look: false,
		sprint: false,
		x: SPAWN.x,
		z: SPAWN.z,
		yaw: 0,
		cameraYaw: 0,
		speed: 0,
		phase: 0,
		menuAngle: .85,
		wishX: 0,
		wishZ: 0
	};
	return scope.__demirBag;
}
var input = {
	get keys() {
		return bag().keys;
	},
	get injected() {
		return bag().injected;
	},
	set injected(value) {
		bag().injected = value;
	},
	get joyX() {
		return bag().joyX;
	},
	set joyX(value) {
		bag().joyX = value;
	},
	get joyY() {
		return bag().joyY;
	},
	set joyY(value) {
		bag().joyY = value;
	},
	get orbit() {
		return bag().orbit;
	},
	set orbit(value) {
		bag().orbit = value;
	},
	get pitch() {
		return bag().pitch;
	},
	set pitch(value) {
		bag().pitch = value;
	},
	get dist() {
		return bag().dist;
	},
	set dist(value) {
		bag().dist = value;
	},
	get look() {
		return bag().look;
	},
	set look(value) {
		bag().look = value;
	},
	get sprint() {
		return bag().sprint;
	},
	set sprint(value) {
		bag().sprint = value;
	}
};
var sim = {
	get x() {
		return bag().x;
	},
	set x(value) {
		bag().x = value;
	},
	get z() {
		return bag().z;
	},
	set z(value) {
		bag().z = value;
	},
	get yaw() {
		return bag().yaw;
	},
	set yaw(value) {
		bag().yaw = value;
	},
	get cameraYaw() {
		return bag().cameraYaw;
	},
	set cameraYaw(value) {
		bag().cameraYaw = value;
	},
	get speed() {
		return bag().speed;
	},
	set speed(value) {
		bag().speed = value;
	},
	get phase() {
		return bag().phase;
	},
	set phase(value) {
		bag().phase = value;
	},
	get menuAngle() {
		return bag().menuAngle;
	},
	set menuAngle(value) {
		bag().menuAngle = value;
	},
	get wishX() {
		return bag().wishX || 0;
	},
	set wishX(value) {
		bag().wishX = value;
	},
	get wishZ() {
		return bag().wishZ || 0;
	},
	set wishZ(value) {
		bag().wishZ = value;
	}
};
function readSim() {
	const row = globalThis.__demirBag;
	return {
		x: row?.x ?? 0,
		z: row?.z ?? 0,
		yaw: row?.yaw ?? 0
	};
}
function held(code) {
	if (input.injected) return input.injected.has(code);
	return input.keys.has(code);
}
function axes() {
	let fwd = 0;
	let str = 0;
	if (held("KeyW") || held("ArrowUp")) fwd += 1;
	if (held("KeyS") || held("ArrowDown")) fwd -= 1;
	if (held("KeyD") || held("ArrowRight")) str += 1;
	if (held("KeyA") || held("ArrowLeft")) str -= 1;
	fwd += input.joyY;
	str += input.joyX;
	return {
		fwd,
		str
	};
}
function bindControlsTest() {
	window.__controlsTest = {
		getYaw: () => bag().yaw,
		getSpeed: () => bag().speed,
		getX: () => bag().x,
		getZ: () => bag().z,
		getOrbit: () => bag().orbit,
		setKeys: (codes) => {
			bag().injected = new Set(codes);
		},
		setPos: (x, z) => {
			const state = bag();
			state.x = x;
			state.z = z;
			state.wishX = 0;
			state.wishZ = 0;
			state.speed = 0;
		}
	};
}
var wind = null;
var windGain = null;
function setWindVolume(volume) {
	if (windGain) windGain.gain.value = Math.max(0, Math.min(1, volume)) * .04;
}
function beginPlay(where) {
	const state = bag();
	const has = !!where && typeof where.x === "number" && typeof where.z === "number" && Number.isFinite(where.x) && Number.isFinite(where.z);
	let x = has ? where.x : SPAWN.x;
	let z = has ? where.z : SPAWN.z;
	if (blocked(x, z, .42) || inWater(x, z, .15)) {
		x = SPAWN.x;
		z = SPAWN.z;
	}
	state.x = x;
	state.z = z;
	state.yaw = 0;
	state.cameraYaw = 0;
	state.speed = 0;
	state.phase = 0;
	state.orbit = 0;
	state.pitch = .46;
	state.dist = 4.7;
	state.look = false;
	state.sprint = false;
	state.wishX = 0;
	state.wishZ = 0;
	state.injected = null;
	state.joyX = 0;
	state.joyY = 0;
	useHud.getState().setPlaying(true);
	if (wind) {
		wind.resume();
		return;
	}
	const ctx = new AudioContext();
	wind = ctx;
	const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
	const data = buffer.getChannelData(0);
	let last = 0;
	for (let i = 0; i < data.length; i++) {
		const white = Math.random() * 2 - 1;
		last = last * .98 + white * .02;
		data[i] = last * 4.5;
	}
	const src = ctx.createBufferSource();
	src.buffer = buffer;
	src.loop = true;
	const filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.value = 380;
	const gain = ctx.createGain();
	windGain = gain;
	gain.gain.value = .018;
	src.connect(filter);
	filter.connect(gain);
	gain.connect(ctx.destination);
	src.start();
	ctx.resume();
}
var SLOT_LABEL = {
	weapon: "Silah",
	helmet: "Kask",
	armor: "Zırh",
	earring: "Küpe",
	necklace: "Kolye",
	bracelet: "Bilezik",
	boots: "Ayakkabı",
	ring: "Yüzük",
	gloves: "Eldiven",
	belt: "Kemer"
};
var STAT_LABEL = {
	str: "Hasar (STR)",
	hp: "Can (HP)",
	ats: "Saldırı Hızı (ATS)",
	mvs: "Hareket Hızı (MVS)",
	ctp: "Kritik (CTP)",
	mag: "Büyü Hasarı (MAG)"
};
var CLASS_LIST = [
	{
		id: "savasci",
		name: "Savaşçı",
		arm: "Kılıç",
		line: "Yakın kesik"
	},
	{
		id: "okcu",
		name: "Okçu",
		arm: "Yay",
		line: "Gerip bırakır"
	},
	{
		id: "buyucu",
		name: "Büyücü",
		arm: "Asa",
		line: "Asa darbesi"
	},
	{
		id: "ninja",
		name: "Ninja",
		arm: "Hançer",
		line: "Kısa ve hızlı"
	}
];
function className(id) {
	return CLASS_LIST.find((row) => row.id === id)?.name ?? "Savaşçı";
}
var CLASS_TREES = {
	savasci: [{
		name: "Kesik",
		skills: [
			{
				id: "sv1",
				name: "Güçlü Kesik",
				desc: "Tek hedefe ağır kılıç.",
				kind: "strike",
				power: 32
			},
			{
				id: "sv2",
				name: "Dönüş",
				desc: "Etrafındaki herkese döner.",
				kind: "aoe",
				power: 18
			},
			{
				id: "sv3",
				name: "Kanatma",
				desc: "Hedefi kanatır, bir süre kanar.",
				kind: "dot",
				power: 20
			},
			{
				id: "sv7",
				name: "Yarma",
				desc: "Tek hedefe en ağır kesik.",
				kind: "strike",
				power: 48
			},
			{
				id: "sv8",
				name: "Savruluş",
				desc: "Geniş savurma, etraf hasarı.",
				kind: "aoe",
				power: 22
			}
		]
	}, {
		name: "Siper",
		skills: [
			{
				id: "sv4",
				name: "Siper",
				desc: "Canını toparlar. Hasar vermez.",
				kind: "buff",
				power: 0
			},
			{
				id: "sv5",
				name: "Dayanış",
				desc: "Bir süre daha az hasar alırsın.",
				kind: "buff",
				power: 0
			},
			{
				id: "sv6",
				name: "Hamle",
				desc: "Bir süre daha hızlı koşarsın.",
				kind: "buff",
				power: 0
			},
			{
				id: "sv9",
				name: "Kalkan",
				desc: "Kısa süre gelen hasarı keser.",
				kind: "buff",
				power: 0
			},
			{
				id: "sv10",
				name: "Direnç",
				desc: "Bir süre canın kendiliğinden dolar.",
				kind: "buff",
				power: 0
			}
		]
	}],
	okcu: [{
		name: "Nişan",
		skills: [
			{
				id: "ok1",
				name: "Hızlı Ok",
				desc: "Tek hedefe hızlı ok. Hedef şart.",
				kind: "strike",
				power: 22
			},
			{
				id: "ok2",
				name: "Çift Atış",
				desc: "Aynı hedefe iki ok.",
				kind: "strike",
				power: 14,
				hits: 2
			},
			{
				id: "ok3",
				name: "Delici",
				desc: "Zırhı delen tek ve sert ok.",
				kind: "strike",
				power: 36
			},
			{
				id: "ok7",
				name: "Sabit Nişan",
				desc: "Kilitli hedefe sert ok.",
				kind: "strike",
				power: 30
			},
			{
				id: "ok8",
				name: "Seri",
				desc: "Kısa beklemeli tek ok.",
				kind: "strike",
				power: 16
			}
		]
	}, {
		name: "İz",
		skills: [
			{
				id: "ok4",
				name: "Yavaşlatma",
				desc: "Hedefi yavaşlatır.",
				kind: "strike",
				power: 14,
				slow: true
			},
			{
				id: "ok5",
				name: "Zehir Oku",
				desc: "Oka zehir bulaşır, süre hasarı.",
				kind: "dot",
				power: 18
			},
			{
				id: "ok6",
				name: "Ok Yağmuru",
				desc: "Etrafına ok yağar.",
				kind: "aoe",
				power: 15
			},
			{
				id: "ok9",
				name: "İz Sürme",
				desc: "Seçili hedefe iz hasarı.",
				kind: "strike",
				power: 26
			},
			{
				id: "ok10",
				name: "Tuzak",
				desc: "Ayaklarının altında alan hasarı.",
				kind: "aoe",
				power: 20
			}
		]
	}],
	ninja: [{
		name: "Hançer",
		skills: [
			{
				id: "nj1",
				name: "Çift Kesik",
				desc: "Aynı hedefe iki bıçak.",
				kind: "strike",
				power: 15,
				hits: 2
			},
			{
				id: "nj2",
				name: "Boşluk",
				desc: "Etrafı keser.",
				kind: "aoe",
				power: 16
			},
			{
				id: "nj3",
				name: "Zehir",
				desc: "Hançere zehir bulaşır.",
				kind: "dot",
				power: 17
			},
			{
				id: "nj7",
				name: "Kesik",
				desc: "Hızlı tek hançer.",
				kind: "strike",
				power: 20
			},
			{
				id: "nj8",
				name: "Çengel",
				desc: "Kritik şanslı hançer.",
				kind: "strike",
				power: 24,
				crit: true
			}
		]
	}, {
		name: "Gölge",
		skills: [
			{
				id: "nj4",
				name: "Adım",
				desc: "Bir süre hızlanırsın. Hasar vermez.",
				kind: "buff",
				power: 0
			},
			{
				id: "nj5",
				name: "Sis",
				desc: "Sis: bir süre daha az hasar alırsın.",
				kind: "buff",
				power: 0
			},
			{
				id: "nj6",
				name: "Ölüm",
				desc: "Tek hedefe kritik ölüm vuruşu.",
				kind: "strike",
				power: 44,
				crit: true
			},
			{
				id: "nj9",
				name: "Giz",
				desc: "Gölgede bir süre daha az hasar.",
				kind: "buff",
				power: 0
			},
			{
				id: "nj10",
				name: "Son Vuruş",
				desc: "Tek hedefe bitirici hançer.",
				kind: "strike",
				power: 40
			}
		]
	}],
	buyucu: [{
		name: "Ateş",
		skills: [
			{
				id: "mg1",
				name: "Kıvılcım",
				desc: "Küçük ateş. Hedef şart.",
				kind: "strike",
				power: 18,
				mag: true
			},
			{
				id: "mg2",
				name: "Ateş Topu",
				desc: "Büyük tek ateş topu.",
				kind: "strike",
				power: 38,
				mag: true
			},
			{
				id: "mg3",
				name: "Patlama",
				desc: "Etrafı patlatır.",
				kind: "aoe",
				power: 18,
				mag: true
			},
			{
				id: "mg7",
				name: "Kor",
				desc: "Tek hedefe kor.",
				kind: "strike",
				power: 26,
				mag: true
			},
			{
				id: "mg8",
				name: "Duvar",
				desc: "Alev duvarı, alan hasarı.",
				kind: "aoe",
				power: 16,
				mag: true
			}
		]
	}, {
		name: "Buz",
		skills: [
			{
				id: "mg4",
				name: "Don",
				desc: "Hedefi dondurur ve yavaşlatır.",
				kind: "strike",
				power: 18,
				mag: true,
				slow: true
			},
			{
				id: "mg5",
				name: "Mızrak",
				desc: "Tek hedefe buz mızrağı.",
				kind: "strike",
				power: 36,
				mag: true
			},
			{
				id: "mg6",
				name: "Fırtına",
				desc: "Alan fırtınası.",
				kind: "aoe",
				power: 17,
				mag: true
			},
			{
				id: "mg9",
				name: "Kırağı",
				desc: "Tek hedefe buz.",
				kind: "strike",
				power: 24,
				mag: true
			},
			{
				id: "mg10",
				name: "Çığ",
				desc: "Alan çığı.",
				kind: "aoe",
				power: 21,
				mag: true
			}
		]
	}]
};
var MENTORS = [
	{
		id: "sv-a",
		cls: "savasci",
		tree: 0,
		name: "Kesik Ustası",
		x: -12.6,
		z: -21
	},
	{
		id: "sv-b",
		cls: "savasci",
		tree: 1,
		name: "Siper Ustası",
		x: -9,
		z: -21
	},
	{
		id: "ok-a",
		cls: "okcu",
		tree: 0,
		name: "Nişan Ustası",
		x: -5.4,
		z: -21
	},
	{
		id: "ok-b",
		cls: "okcu",
		tree: 1,
		name: "İz Ustası",
		x: -1.8,
		z: -21
	},
	{
		id: "nj-a",
		cls: "ninja",
		tree: 0,
		name: "Hançer Ustası",
		x: 1.8,
		z: -21
	},
	{
		id: "nj-b",
		cls: "ninja",
		tree: 1,
		name: "Gölge Ustası",
		x: 5.4,
		z: -21
	},
	{
		id: "mg-a",
		cls: "buyucu",
		tree: 0,
		name: "Ateş Ustası",
		x: 9,
		z: -21
	},
	{
		id: "mg-b",
		cls: "buyucu",
		tree: 1,
		name: "Buz Ustası",
		x: 12.6,
		z: -21
	}
];
function asClassId(id) {
	return CLASS_LIST.some((row) => row.id === id) ? id : "savasci";
}
function weaponStyleOf(id) {
	if (!id) return "fist";
	if (id.includes("bow")) return "bow";
	if (id.includes("staff")) return "staff";
	if (id.includes("dagger")) return "dagger";
	if (id.includes("pala")) return "pala";
	return "sword";
}
function skillTier(rank) {
	if (rank <= 0) return "0";
	if (rank <= 10) return String(rank);
	if (rank <= 20) return `P${rank - 10}`;
	if (rank === 21) return "P";
	if (rank <= 31) return `S${rank - 21}`;
	return "S+";
}
function skillMultiplier(rank) {
	if (rank <= 0) return 0;
	const ten = Math.pow(1.14, 9);
	const pure = ten * Math.pow(1.1, 10) * 1.12;
	const s10 = pure * Math.pow(1.08, 10);
	if (rank <= 10) return Math.pow(1.14, rank - 1);
	if (rank <= 20) return ten * Math.pow(1.1, rank - 10);
	if (rank === 21) return pure;
	if (rank <= 31) return pure * Math.pow(1.08, rank - 21);
	return s10 * 1.18;
}
function skillDamage(rank, power) {
	return Math.max(0, Math.round(power * skillMultiplier(rank)));
}
function skillWait(id, rank) {
	const sk = skillById(id);
	const quick = id === "ok1" || id === "ok8" || id === "nj7";
	const slow = sk?.kind === "aoe" ? 7.2 : quick ? 2.2 : 4.6;
	return Math.max(quick ? .7 : 1.15, slow - Math.min(rank, 22) * .05);
}
function skillById(id) {
	for (const trees of Object.values(CLASS_TREES)) for (const tree of trees) {
		const sk = tree.skills.find((row) => row.id === id);
		if (sk) return sk;
	}
}
function skillPreview(id, rank, totals) {
	const sk = skillById(id);
	if (!sk || sk.kind === "buff") return {
		dmg: 0,
		next: 0,
		buff: true,
		text: sk?.desc ?? ""
	};
	const stat = sk.mag ? totals.mag : totals.str;
	const power = sk.power + stat * (sk.mag ? .5 : .32);
	return {
		dmg: rank > 0 ? skillDamage(rank, power) : 0,
		next: skillDamage(Math.min(32, Math.max(1, rank + 1)), power),
		buff: false,
		text: sk.desc
	};
}
var skillReadyAt = {};
function skillCdLeft(id) {
	return Math.max(0, ((skillReadyAt[id] ?? 0) - Date.now()) / 1e3);
}
function weaponFits(classId, itemId) {
	const style = weaponStyleOf(itemId);
	if (style === "fist") return true;
	if (classId === "savasci") return style === "sword" || style === "pala";
	if (classId === "okcu") return style === "bow";
	if (classId === "buyucu") return style === "staff";
	return style === "dagger";
}
function openBagCount(stage) {
	return 24 + Math.max(0, Math.min(4, stage)) * 12;
}
var ENHANCE = [
	100,
	250,
	400,
	550,
	700,
	850,
	1e3,
	1250,
	1400,
	1550
];
var SHOP = [
	{
		id: "gece-weapon",
		name: "Gece Kılıcı",
		slot: "weapon",
		price: 40,
		str: 10,
		hp: 0,
		ats: 3,
		mvs: 0,
		ctp: 0,
		desc: "Savaşçı kılıcı. Seviye 1.",
		shop: "weapon"
	},
	{
		id: "gece-pala",
		name: "Gece Palası",
		slot: "weapon",
		price: 95,
		str: 18,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 2,
		desc: "Savaşçı palası. İki elle tutulur.",
		shop: "weapon"
	},
	{
		id: "gece-bow",
		name: "Gece Yayı",
		slot: "weapon",
		price: 40,
		str: 8,
		hp: 0,
		ats: 4,
		mvs: 0,
		ctp: 0,
		desc: "Okçu yayı.",
		shop: "weapon"
	},
	{
		id: "gece-staff",
		name: "Gece Asası",
		slot: "weapon",
		price: 40,
		str: 7,
		hp: 8,
		ats: 2,
		mvs: 0,
		ctp: 0,
		desc: "Büyücü asası.",
		shop: "weapon"
	},
	{
		id: "gece-dagger",
		name: "Gece Hançeri",
		slot: "weapon",
		price: 40,
		str: 8,
		hp: 0,
		ats: 5,
		mvs: 0,
		ctp: 3,
		desc: "Ninja hançeri.",
		shop: "weapon"
	},
	{
		id: "gece-helmet",
		name: "Gece Kask",
		slot: "helmet",
		price: 35,
		str: 1,
		hp: 12,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Zırhçı kaskı.",
		shop: "armor"
	},
	{
		id: "gece-armor",
		name: "Gece Zırh",
		slot: "armor",
		price: 55,
		str: 1,
		hp: 24,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Zırhçı gövdesi.",
		shop: "armor"
	},
	{
		id: "gece-earring",
		name: "Gece Küpe",
		slot: "earring",
		price: 25,
		str: 1,
		hp: 4,
		ats: 0,
		mvs: 0,
		ctp: 2,
		desc: "Küpe.",
		shop: "armor"
	},
	{
		id: "gece-necklace",
		name: "Gece Kolye",
		slot: "necklace",
		price: 30,
		str: 1,
		hp: 4,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Kolye.",
		shop: "armor"
	},
	{
		id: "gece-bracelet",
		name: "Gece Bilezik",
		slot: "bracelet",
		price: 25,
		str: 1,
		hp: 4,
		ats: 2,
		mvs: 0,
		ctp: 0,
		desc: "Bilezik.",
		shop: "armor"
	},
	{
		id: "gece-boots",
		name: "Gece Ayakkabı",
		slot: "boots",
		price: 30,
		str: 1,
		hp: 4,
		ats: 0,
		mvs: 4,
		ctp: 0,
		desc: "Ayakkabı.",
		shop: "armor"
	},
	{
		id: "gece-ring",
		name: "Gece Yüzük",
		slot: "ring",
		price: 25,
		str: 1,
		hp: 4,
		ats: 0,
		mvs: 0,
		ctp: 2,
		desc: "Yüzük.",
		shop: "armor"
	},
	{
		id: "gece-gloves",
		name: "Gece Eldiven",
		slot: "gloves",
		price: 28,
		str: 2,
		hp: 4,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Eldiven.",
		shop: "armor"
	},
	{
		id: "gece-belt",
		name: "Gece Kemer",
		slot: "belt",
		price: 28,
		str: 1,
		hp: 8,
		ats: 0,
		mvs: 1,
		ctp: 0,
		desc: "Kemer.",
		shop: "armor"
	},
	{
		id: "yol-boots",
		name: "Yol Çizmesi",
		slot: "boots",
		price: 48,
		str: 1,
		hp: 4,
		ats: 0,
		mvs: 8,
		ctp: 0,
		desc: "Uzun yol çizmesi.",
		shop: "armor"
	},
	{
		id: "pot-hp",
		name: "Can İksiri",
		slot: "belt",
		price: 18,
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Canın beşte ikisini doldurur. Yığın 200.",
		shop: "market",
		kind: "potion"
	},
	{
		id: "pot-mp",
		name: "Mana İksiri",
		slot: "belt",
		price: 18,
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Mananın beşte ikisini doldurur.",
		shop: "market",
		kind: "potion"
	},
	{
		id: "pot-mvs",
		name: "Hareket Hızı İksiri",
		slot: "belt",
		price: 26,
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Bir dakika daha hızlı yürürsün.",
		shop: "market",
		kind: "potion"
	},
	{
		id: "pot-ats",
		name: "Saldırı Hızı İksiri",
		slot: "belt",
		price: 26,
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Bir dakika daha sık vurursun.",
		shop: "market",
		kind: "potion"
	},
	{
		id: "bag-expand",
		name: "Envanter Genişletme",
		slot: "belt",
		price: 350,
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Envantere sürükle. Önce 2. pencere, o dolunca 3.",
		shop: "market",
		kind: "bag"
	},
	{
		id: "guc-tasi",
		name: "Güç Taşı",
		slot: "belt",
		price: 40,
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Demircide + basmak için. Yığın 200.",
		shop: "market",
		kind: "mat"
	},
	{
		id: "saman",
		name: "Saman",
		slot: "belt",
		price: 80,
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Bineği besler. At görevinde istenir.",
		shop: "stable",
		kind: "mat"
	},
	{
		id: "binek-tas",
		name: "Binek Seviye Arttırma Taşı+",
		slot: "belt",
		price: 220,
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Binek seviyesini yükseltir.",
		shop: "stable",
		kind: "mat"
	},
	{
		id: "binek-kitap",
		name: "Binek Beceri Arttırma Kitabı",
		slot: "belt",
		price: 260,
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Binek becerisini açar.",
		shop: "stable",
		kind: "mat"
	},
	{
		id: "olta",
		name: "Olta",
		slot: "weapon",
		price: 180,
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Göl kenarında balık tutar. Seviye 25.",
		shop: "fisher",
		kind: "tool",
		req: 25
	},
	{
		id: "yem",
		name: "Yem",
		slot: "belt",
		price: 8,
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Yemsiz olta suya inmez.",
		shop: "fisher",
		kind: "mat"
	},
	{
		id: "kazma",
		name: "Kazma",
		slot: "weapon",
		price: 240,
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Maden damarını kırar. Seviye 30.",
		shop: "miner",
		kind: "tool",
		req: 30
	}
];
var CATALOG = SHOP;
function xpForLevel(level) {
	return Math.floor(90 + level * 28);
}
function blankEquip() {
	return {
		weapon: null,
		helmet: null,
		armor: null,
		earring: null,
		necklace: null,
		bracelet: null,
		boots: null,
		ring: null,
		gloves: null,
		belt: null
	};
}
function itemStats(it) {
	const m = 1 + it.plus * .12;
	return {
		str: Math.round(it.str * m),
		hp: Math.round(it.hp * m),
		ats: Math.round(it.ats * m),
		mvs: Math.round(it.mvs * m),
		ctp: Math.round(it.ctp * m)
	};
}
function displayName(it) {
	return it.plus > 0 ? `${it.name} +${it.plus}` : it.name;
}
function starterChest() {
	return {
		uid: `chest-${Math.random().toString(36).slice(2, 8)}`,
		id: "starter-chest",
		name: "Başlangıç Sandığı",
		slot: "weapon",
		level: 1,
		plus: 0,
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		desc: "Açılınca sınıfının başlangıç silahını verir ve kaybolur."
	};
}
function starterWeapon(classId) {
	const id = asClassId(classId);
	const base = {
		uid: `start-${id}-${Math.random().toString(36).slice(2, 7)}`,
		slot: "weapon",
		level: 1,
		plus: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0
	};
	if (id === "okcu") return {
		...base,
		id: "starter-bow",
		name: "Yay",
		str: 7,
		ats: 2,
		desc: "Başlangıç yayı. Sol elde durur."
	};
	if (id === "buyucu") return {
		...base,
		id: "starter-staff",
		name: "Asa",
		str: 6,
		hp: 6,
		desc: "Başlangıç asası."
	};
	if (id === "ninja") return {
		...base,
		id: "starter-dagger",
		name: "Hançer",
		str: 7,
		ats: 4,
		ctp: 3,
		desc: "Başlangıç hançeri."
	};
	return {
		...base,
		id: "starter-sword",
		name: "Kılıç",
		str: 9,
		desc: "Başlangıç kılıcı."
	};
}
function levelQuest(level) {
	const need = 5;
	return {
		id: `q-lv-${level}`,
		title: `Seviye ${level} görevi`,
		detail: `${need} yaratık avla, sonra muhafıza dön. Ödül bir sonraki seviyeyi açar.`,
		need,
		have: 0,
		kind: "kill",
		done: false,
		claimed: false,
		seen: [],
		minLevel: level
	};
}
function ensureLevelQuest(level, quests) {
	const id = `q-lv-${level}`;
	if (quests.some((quest) => quest.id === id)) return quests;
	return [...quests, levelQuest(level)];
}
function blankHotbar() {
	return Array.from({ length: 8 }, () => null);
}
function blankDepot() {
	return Array.from({ length: 24 }, () => null);
}
function withSkillQuest(level, chosenTree, quests) {
	if (chosenTree) return quests.map((quest) => quest.id === "q-skills" && !quest.claimed ? {
		...quest,
		done: true,
		claimed: true,
		have: 1
	} : quest);
	if (level < 5 || quests.some((quest) => quest.id === "q-skills")) return quests;
	return [...quests, {
		id: "q-skills",
		title: "Becerilerini Kazan",
		detail: "Sınıfının iki ustasından birinin ağacını seç. Sarı oklar onları gösterir.",
		need: 1,
		have: 0,
		kind: "mentor",
		done: false,
		claimed: false,
		seen: [],
		minLevel: 5
	}];
}
function normalizeQuests(list) {
	return list.map((quest) => ({
		...quest,
		seen: quest.seen ?? [],
		claimed: quest.claimed ?? Boolean(quest.done),
		minLevel: quest.minLevel ?? 1,
		have: quest.have ?? 0
	}));
}
function bonusLive(until) {
	return until > Date.now();
}
function captureSave() {
	const s = useRpg.getState();
	const here = readSim();
	return {
		name: s.nick,
		classId: s.classId,
		level: s.level,
		xp: s.xp,
		vials: s.vials,
		unspent: s.unspent,
		gold: s.gold,
		hp: s.hp,
		invested: s.invested,
		bag: s.bag,
		equipped: s.equipped,
		skills: s.skills,
		skillPoints: s.skillPoints,
		chosenTree: s.chosenTree,
		hotbar: s.hotbar,
		quests: s.quests,
		depot: s.depot,
		blocked: s.blocked,
		bagStage: s.bagStage,
		wellAt: s.wellAt,
		bonusUntil: s.bonusUntil,
		x: here.x,
		z: here.z
	};
}
var carry = null;
function setCarry(next) {
	carry = next;
}
function readCarry() {
	return carry;
}
var staClock = 0;
var staRecover = 0;
var liveSta = -1;
var liveMana = -1;
var liveHp = -1;
var pendingCast = null;
var guardUntil = 0;
var guardCut = 0;
var stepUntil = 0;
var stepMul = 1;
var regenUntil = 0;
function takeCast() {
	const next = pendingCast;
	pendingCast = null;
	return next;
}
function payQuest(get, title, xp, gold) {
	get().grantXp(xp);
	get().addGold(gold);
	useRpg.setState({ toast: `${title} teslim edildi. +${xp} XP +${gold} altın` });
}
function bumpQuest(get, set, kind) {
	const s = get();
	let changed = false;
	let doneTitle = "";
	const quests = s.quests.map((quest) => {
		if (quest.claimed || quest.done || quest.kind !== kind) return quest;
		changed = true;
		const have = quest.have + 1;
		const done = have >= quest.need;
		if (done) doneTitle = quest.title;
		return {
			...quest,
			have,
			done
		};
	});
	if (!changed) return;
	set({
		quests,
		toast: doneTitle ? `${doneTitle} hazır. Ödül için muhafıza dön.` : s.toast
	});
}
function resetLiveVitals() {
	liveSta = -1;
	liveMana = -1;
	liveHp = -1;
}
function uid() {
	return Math.random().toString(36).slice(2, 9);
}
function cloneShop(def) {
	return {
		uid: uid(),
		id: def.id,
		name: def.name,
		slot: def.slot,
		level: 1,
		plus: 0,
		str: def.str,
		hp: def.hp,
		ats: def.ats,
		mvs: def.mvs,
		ctp: def.ctp,
		desc: def.desc,
		kind: def.kind ?? "gear",
		count: def.kind && def.kind !== "gear" ? 1 : void 0,
		req: def.req
	};
}
function applyVitals(s, fill) {
	const t = totalsOf(s);
	s.hpMax = 100 + t.hp;
	s.manaMax = 50 + s.level * 8;
	s.staMax = Math.round(90 + t.mvs * 1.2);
	if (fill) {
		s.hp = s.hpMax;
		s.mana = s.manaMax;
		s.sta = s.staMax;
	} else {
		s.hp = Math.min(s.hp, s.hpMax);
		s.mana = Math.min(s.mana, s.manaMax);
		s.sta = Math.min(s.sta, s.staMax);
	}
}
function totalsOf(s) {
	const g = {
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		mag: 0
	};
	for (const it of Object.values(s.equipped)) {
		if (!it) continue;
		const st = itemStats(it);
		g.str += st.str;
		g.hp += st.hp;
		g.ats += st.ats;
		g.mvs += st.mvs;
		g.ctp += st.ctp;
	}
	const inv = s.invested;
	return {
		str: s.base.str + (inv.str || 0) + g.str + (s.level - 1),
		hp: s.base.hp + (inv.hp || 0) * 6 + g.hp + (s.level - 1) * 8 + (s.skills?.sv4 ?? 0) * 8,
		ats: s.base.ats + (inv.ats || 0) + g.ats,
		mvs: s.base.mvs + (inv.mvs || 0) + g.mvs,
		ctp: Math.min(60, s.base.ctp + (inv.ctp || 0) + g.ctp),
		mag: s.base.mag + (inv.mag || 0) * 4 + (s.level - 1) * 2
	};
}
function sumStats(s) {
	return totalsOf(s);
}
function emptyBag() {
	return Array.from({ length: 72 }, () => null);
}
function withStarterChest(bag, classId, equipped) {
	if (Boolean(equipped.weapon) || bag.some((it) => it && (it.id === "starter-chest" || it.slot === "weapon"))) return bag;
	const next = bag.slice();
	const hole = next.findIndex((it) => it == null);
	if (hole >= 0) next[hole] = {
		...starterChest(),
		desc: `${classId} sandığı`
	};
	return next;
}
function inferTree(classId, skills) {
	const trees = CLASS_TREES[classId];
	for (let i = 0; i < trees.length; i++) if (trees[i].skills.some((sk) => (skills[sk.id] ?? 0) > 0)) return `${classId}:${i}`;
	return null;
}
function applySave(save) {
	resetLiveVitals();
	const s = useRpg.getState();
	const classId = asClassId(save.classId);
	const bag = withStarterChest(Array.from({ length: 72 }, (_, i) => save.bag[i] ?? null), classId, {
		...blankEquip(),
		...save.equipped
	});
	const next = {
		...s,
		classId,
		nick: save.name.slice(0, 16) || "Savaşçı",
		level: save.level,
		xp: save.xp,
		xpTo: xpForLevel(save.level),
		vials: save.vials,
		unspent: save.unspent,
		gold: save.gold,
		hp: save.hp,
		invested: {
			...s.invested,
			...save.invested
		},
		bag,
		equipped: {
			...s.equipped,
			...save.equipped
		},
		skills: { ...save.skills ?? {} },
		skillPoints: save.skillPoints ?? 0,
		chosenTree: save.chosenTree ?? inferTree(classId, save.skills ?? {}),
		hotbar: Array.from({ length: 8 }, (_, i) => save.hotbar?.[i] ?? null),
		quests: ensureLevelQuest(save.level, withSkillQuest(save.level, save.chosenTree ?? inferTree(classId, save.skills ?? {}), normalizeQuests(Array.isArray(save.quests) ? save.quests : []))),
		depot: Array.from({ length: 24 }, (_, i) => save.depot?.[i] ?? null),
		blocked: Array.isArray(save.blocked) ? save.blocked : [],
		bagStage: save.bagStage ?? 0,
		wellAt: save.wellAt ?? 0,
		bonusUntil: save.bonusUntil ?? 0,
		gearRev: s.gearRev + 1,
		toast: "",
		invOpen: false,
		charOpen: false,
		shop: null
	};
	applyVitals(next, false);
	next.hp = Math.min(next.hp, next.hpMax);
	if (next.level <= 1 && next.xp === 0 && next.gold === 400) next.gold = 0;
	useRpg.setState(next);
}
var useRpg = create((set, get) => ({
	classId: "savasci",
	level: 1,
	xp: 0,
	xpTo: xpForLevel(1),
	vials: 0,
	unspent: 0,
	gold: 0,
	hp: 120,
	hpMax: 120,
	mana: 58,
	manaMax: 58,
	sta: 102,
	staMax: 102,
	base: {
		str: 12,
		hp: 20,
		ats: 8,
		mvs: 10,
		ctp: 4,
		mag: 6
	},
	invested: {
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0,
		mag: 0
	},
	bag: emptyBag(),
	equipped: blankEquip(),
	gearRev: 0,
	skills: {},
	skillPoints: 0,
	chosenTree: null,
	hotbar: blankHotbar(),
	quests: [],
	depot: blankDepot(),
	blocked: [],
	bagStage: 0,
	wellAt: 0,
	bonusUntil: 0,
	swiftUntil: 0,
	hasteUntil: 0,
	smithItem: null,
	smithStone: null,
	invOpen: false,
	charOpen: false,
	shop: null,
	near: null,
	mentor: null,
	charTab: "stats",
	toast: "",
	nick: "Savaşçı",
	hurt: 0,
	toggleInv: () => set((s) => ({
		invOpen: !s.invOpen,
		charOpen: false,
		shop: null
	})),
	toggleChar: () => get().showChar("stats"),
	showChar: (tab) => set((s) => {
		if (s.charOpen && s.charTab === tab) return {
			charOpen: false,
			shop: null
		};
		return {
			charOpen: true,
			charTab: tab,
			invOpen: false,
			shop: null
		};
	}),
	closePanels: () => set({
		invOpen: false,
		charOpen: false,
		shop: null
	}),
	setNick: (nick) => {
		set({ nick: nick.trim().slice(0, 16) || "Savaşçı" });
	},
	setNear: (near, mentor = null) => {
		const s = get();
		if (s.near === near && s.mentor === (mentor ?? null)) return;
		set({
			near,
			mentor: mentor ?? null
		});
	},
	learnSkill: (id) => {
		const s = get();
		if (s.level < 5) {
			set({ toast: "Yetenek için 5. seviye gerekir" });
			return;
		}
		const trees = CLASS_TREES[s.classId];
		const treeIndex = trees.findIndex((tree) => tree.skills.some((sk) => sk.id === id));
		if (treeIndex < 0) {
			set({ toast: "Bu ağaç senin sınıfın değil" });
			return;
		}
		const key = `${s.classId}:${treeIndex}`;
		if (s.chosenTree && s.chosenTree !== key) {
			set({ toast: "Yalnız bir yetenek ağacı seçebilirsin" });
			return;
		}
		const rank = s.skills[id] ?? 0;
		if (rank >= 32) {
			set({ toast: "Bu yetenek S+ — son seviye" });
			return;
		}
		if (s.skillPoints <= 0) {
			set({ toast: "Yetenek puanın yok" });
			return;
		}
		const next = rank + 1;
		set({
			skills: {
				...s.skills,
				[id]: next
			},
			skillPoints: s.skillPoints - 1,
			chosenTree: s.chosenTree || key,
			quests: withSkillQuest(s.level, s.chosenTree || key, s.quests),
			toast: `${trees[treeIndex].skills.find((sk) => sk.id === id)?.name ?? "Yetenek"} ${skillTier(next)}`
		});
	},
	setHotbar: (index, id) => {
		if (index < 0 || index > 7) return;
		const hotbar = get().hotbar.slice();
		hotbar[index] = id;
		set({ hotbar });
	},
	castSkill: (id) => {
		const s = get();
		if (!id) return;
		const rank = s.skills[id] ?? 0;
		if (rank <= 0) {
			set({ toast: "Bu yetenek öğrenilmedi" });
			return;
		}
		const left = skillCdLeft(id);
		if (left > .05) {
			set({ toast: `Bekleme ${left.toFixed(1)} sn` });
			return;
		}
		const cost = 6 + Math.min(rank, 10) * 2;
		if (s.mana < cost) {
			set({ toast: "Yetersiz mana" });
			return;
		}
		const sk = skillById(id);
		const t = totalsOf(s);
		skillReadyAt[id] = Date.now() + skillWait(id, rank) * 1e3;
		const mana = s.mana - cost;
		liveMana = mana;
		if (!sk || sk.kind === "buff") {
			const now = Date.now();
			const cut = Math.min(.55, .16 + rank * .012);
			if (id === "sv4") {
				const hp = Math.min(s.hpMax, s.hp + Math.round(s.hpMax * (.16 + rank * .004)));
				liveHp = hp;
				set({
					mana,
					hp,
					toast: `${sk?.name ?? "Siper"} · can toparlandı`
				});
			} else if (id === "sv6" || id === "nj4") {
				stepUntil = now + 12e3;
				stepMul = 1.18 + rank * .008;
				set({
					mana,
					toast: `${sk?.name ?? "Hız"} · hızlandın`
				});
			} else if (id === "sv10") {
				regenUntil = now + 12e3;
				set({
					mana,
					toast: "Direnç · can yenileniyor"
				});
			} else {
				guardUntil = now + 12e3;
				guardCut = cut;
				set({
					mana,
					toast: `${sk?.name ?? "Siper"} · hasar kesildi`
				});
			}
			return;
		}
		const stat = sk.mag ? t.mag : t.str;
		const power = sk.power + stat * (sk.mag ? .5 : .32);
		pendingCast = {
			id,
			aoe: sk.kind === "aoe",
			dmg: skillDamage(rank, power),
			hits: sk.hits ?? 1,
			slow: Boolean(sk.slow),
			dot: sk.kind === "dot",
			crit: Boolean(sk.crit)
		};
		set({
			mana,
			toast: `${sk.name} · ${skillTier(rank)}`
		});
	},
	acceptQuests: () => {
		const s = get();
		const open = s.quests.filter((quest) => !quest.claimed);
		const ready = open.find((quest) => quest.done && quest.id.startsWith("q-lv-")) ?? open.find((quest) => quest.done);
		if (ready) {
			set({
				quests: s.quests.map((quest) => quest.id === ready.id ? {
					...quest,
					claimed: true
				} : quest),
				charOpen: true,
				charTab: "quests"
			});
			const xp = ready.id.startsWith("q-lv-") ? Math.max(1, get().xpTo - get().xp) : 40;
			const gold = ready.id.startsWith("q-lv-") ? 18 + s.level * 8 : 55;
			payQuest(get, ready.title, xp, gold);
			return;
		}
		const levelRow = open.find((quest) => quest.id === `q-lv-${s.level}`);
		if (levelRow) {
			set({
				charOpen: true,
				charTab: "quests",
				invOpen: false,
				shop: null,
				toast: `${levelRow.title}: ${Math.min(levelRow.have, levelRow.need)}/${levelRow.need}. Bitince muhafıza dön.`
			});
			return;
		}
		set({
			quests: ensureLevelQuest(s.level, s.quests),
			charOpen: true,
			charTab: "quests",
			invOpen: false,
			shop: null,
			toast: `Görev alındı: Seviye ${s.level} görevi`
		});
	},
	useBagItem: (index) => {
		const s = get();
		const it = s.bag[index];
		if (!it) return;
		const bag = s.bag.slice();
		const spend = () => {
			const left = (it.count ?? 1) - 1;
			bag[index] = left > 0 ? {
				...it,
				count: left
			} : null;
		};
		if (it.id === "bag-expand") {
			if (s.bagStage >= 4) {
				set({ toast: "Envanter sonuna kadar açık" });
				return;
			}
			spend();
			set({
				bag,
				bagStage: s.bagStage + 1,
				toast: s.bagStage % 2 === 0 ? "Pencerenin yarısı açıldı" : "Pencere tamamlandı"
			});
			return;
		}
		if (it.kind === "potion") {
			spend();
			const now = Date.now();
			if (it.id === "pot-hp") {
				const hp = Math.min(s.hpMax, s.hp + s.hpMax * .4);
				liveHp = hp;
				set({
					bag,
					hp,
					toast: "Can iksiri"
				});
			} else if (it.id === "pot-mp") {
				const mana = Math.min(s.manaMax, s.mana + s.manaMax * .4);
				liveMana = mana;
				set({
					bag,
					mana,
					toast: "Mana iksiri"
				});
			} else if (it.id === "pot-mvs") set({
				bag,
				swiftUntil: now + 6e4,
				toast: "Hareket hızlandı"
			});
			else if (it.id === "pot-ats") set({
				bag,
				hasteUntil: now + 6e4,
				toast: "Saldırı hızlandı"
			});
			else set({
				bag,
				toast: it.name
			});
			return;
		}
		if (it.kind === "tool") {
			set({ toast: it.id === "olta" ? "Göl kenarında E" : it.id === "kazma" ? "Maden damarında E" : it.desc });
			return;
		}
		set({ toast: it.desc || it.name });
	},
	setSmith: (which, index) => {
		if (which === "item") set({ smithItem: index });
		else set({ smithStone: index });
	},
	forge: () => {
		const s = get();
		const itemAt = s.smithItem;
		const stoneAt = s.smithStone;
		if (itemAt == null || stoneAt == null) {
			set({ toast: "İki slotu da doldur" });
			return;
		}
		const it = s.bag[itemAt];
		const stone = s.bag[stoneAt];
		if (!it || it.kind === "potion" || it.kind === "mat" || it.kind === "bag" || it.id === "starter-chest") {
			set({ toast: "Bu eşyaya + basılmaz" });
			return;
		}
		if (!stone || stone.id !== "guc-tasi") {
			set({ toast: "Sağ slota Güç Taşı koy" });
			return;
		}
		if (it.plus >= 10) {
			set({ toast: "Bu eşya +10" });
			return;
		}
		const need = it.plus + 1;
		const have = stone.count ?? 1;
		if (have < need) {
			set({ toast: `Güç Taşı ${need} gerekir` });
			return;
		}
		const cost = ENHANCE[it.plus] ?? 1550;
		if (s.gold < cost) {
			set({ toast: "Yetersiz altın" });
			return;
		}
		const bag = s.bag.slice();
		const nextItem = {
			...it,
			plus: it.plus + 1
		};
		bag[itemAt] = nextItem;
		const left = have - need;
		bag[stoneAt] = left > 0 ? {
			...stone,
			count: left
		} : null;
		const equipped = { ...s.equipped };
		for (const slot of Object.keys(equipped)) if (equipped[slot]?.uid === it.uid) equipped[slot] = nextItem;
		const next = {
			...s,
			bag,
			equipped,
			gold: s.gold - cost,
			gearRev: s.gearRev + 1,
			toast: `${displayName(nextItem)}`
		};
		applyVitals(next, false);
		set(next);
	},
	noteKill: () => bumpQuest(get, set, "kill"),
	notePlace: (place) => {
		if (!place) return;
		const s = get();
		let changed = false;
		let doneTitle = "";
		const quests = s.quests.map((quest) => {
			if (quest.claimed || quest.done || quest.kind !== "bridge") return quest;
			const seen = quest.seen ?? [];
			if (seen.includes(place)) return quest;
			changed = true;
			const have = seen.length + 1;
			const done = have >= quest.need;
			if (done) doneTitle = quest.title;
			return {
				...quest,
				seen: [...seen, place],
				have,
				done
			};
		});
		if (!changed) return;
		set({
			quests,
			toast: doneTitle ? `${doneTitle} hazır. Ödül için muhafıza dön.` : s.toast
		});
	},
	noteMentor: () => bumpQuest(get, set, "mentor"),
	deposit: (index) => {
		const s = get();
		const it = s.bag[index];
		if (!it || it.id === "starter-chest") return;
		const hole = s.depot.findIndex((slot) => slot == null);
		if (hole < 0) {
			set({ toast: "Depo dolu" });
			return;
		}
		const bag = s.bag.slice();
		const depot = s.depot.slice();
		bag[index] = null;
		depot[hole] = it;
		set({
			bag,
			depot,
			toast: `${it.name} depoya kondu`
		});
	},
	withdraw: (index) => {
		const s = get();
		const it = s.depot[index];
		if (!it) return;
		const hole = s.bag.findIndex((slot, i) => i < openBagCount(s.bagStage) && slot == null);
		if (hole < 0) {
			set({ toast: "Çanta dolu" });
			return;
		}
		const bag = s.bag.slice();
		const depot = s.depot.slice();
		depot[index] = null;
		bag[hole] = it;
		set({
			bag,
			depot,
			toast: `${it.name} çantaya alındı`
		});
	},
	interact: () => {
		const near = get().near;
		if (!near) return;
		if (near === "mentor") {
			const row = MENTORS.find((mentor) => mentor.id === get().mentor);
			if (!row || row.cls !== get().classId) {
				set({ toast: "Bu usta senin sınıfın değil" });
				return;
			}
			const key = `${get().classId}:${row.tree}`;
			if (get().chosenTree && get().chosenTree !== key) {
				set({ toast: "Başka bir yetenek ağacı seçtin" });
				return;
			}
			get().noteMentor();
			set({
				charOpen: true,
				charTab: "skills",
				invOpen: false,
				shop: null
			});
			return;
		}
		if (near === "guard") {
			get().acceptQuests();
			return;
		}
		if (near === "well") {
			const now = Date.now();
			if (now - get().wellAt < 72e6) {
				set({ toast: `Kuyu yarın tekrar verir. ${Math.ceil((72e6 - (now - get().wellAt)) / 6e4)} dk` });
				return;
			}
			set({
				wellAt: now,
				bonusUntil: now + 9e5,
				toast: "Kuyu 15 dakika %15 altın ve XP verdi"
			});
			return;
		}
		if (near === "fish") {
			const s = get();
			const rod = s.bag.find((item) => item?.id === "olta");
			if (!rod) {
				set({ toast: "Olta yok. Balıkçıdan alınır." });
				return;
			}
			if (s.level < (rod.req ?? 25)) {
				set({ toast: "Olta için 25. seviye gerekir" });
				return;
			}
			const baitAt = s.bag.findIndex((item) => item?.id === "yem" && (item.count ?? 1) > 0);
			if (baitAt < 0) {
				set({ toast: "Yem yok. Yemsiz tutulmaz." });
				return;
			}
			const bag = s.bag.slice();
			const bait = bag[baitAt];
			const left = (bait.count ?? 1) - 1;
			bag[baitAt] = left > 0 ? {
				...bait,
				count: left
			} : null;
			const fish = bag.findIndex((item, i) => i < openBagCount(s.bagStage) && item?.id === "gol-baligi" && (item.count ?? 1) < 200);
			if (fish >= 0) bag[fish] = {
				...bag[fish],
				count: (bag[fish].count ?? 1) + 1
			};
			else {
				const hole = bag.findIndex((item, i) => i < openBagCount(s.bagStage) && item == null);
				if (hole >= 0) bag[hole] = {
					uid: uid(),
					id: "gol-baligi",
					name: "Göl Balığı",
					slot: "belt",
					level: 1,
					plus: 0,
					str: 0,
					hp: 0,
					ats: 0,
					mvs: 0,
					ctp: 0,
					desc: "Gölden çıktı.",
					kind: "mat",
					count: 1
				};
			}
			set({
				bag,
				toast: "Bir balık geldi"
			});
			get().grantXp(12);
			return;
		}
		if (near === "vein") {
			const s = get();
			const pick = s.bag.find((item) => item?.id === "kazma");
			if (!pick) {
				set({ toast: "Kazma yok. Madenciden alınır." });
				return;
			}
			if (s.level < (pick.req ?? 30)) {
				set({ toast: "Kazma için 30. seviye gerekir" });
				return;
			}
			const ores = [
				{
					id: "demir-cevher",
					name: "Demir Cevheri"
				},
				{
					id: "bakir-cevher",
					name: "Bakır Cevheri"
				},
				{
					id: "gumus-cevher",
					name: "Gümüş Cevheri"
				}
			];
			const ore = ores[Math.floor(Math.random() * ores.length)];
			const bag = s.bag.slice();
			const limit = openBagCount(s.bagStage);
			const stack = bag.findIndex((item, i) => i < limit && item?.id === ore.id && (item.count ?? 1) < 200);
			if (stack >= 0) bag[stack] = {
				...bag[stack],
				count: (bag[stack].count ?? 1) + 1
			};
			else {
				const hole = bag.findIndex((item, i) => i < limit && item == null);
				if (hole < 0) {
					set({ toast: "Çanta dolu" });
					return;
				}
				bag[hole] = {
					uid: uid(),
					id: ore.id,
					name: ore.name,
					slot: "belt",
					level: 1,
					plus: 0,
					str: 0,
					hp: 0,
					ats: 0,
					mvs: 0,
					ctp: 0,
					desc: "Güç taşı eritmek için maden.",
					kind: "mat",
					count: 1
				};
			}
			set({
				bag,
				toast: `${ore.name} kırıldı`
			});
			return;
		}
		set((s) => ({
			shop: s.shop === near ? null : near,
			invOpen: false,
			charOpen: false
		}));
	},
	openBagChest: (index) => {
		const s = get();
		const it = s.bag[index];
		if (!it || it.id !== "starter-chest") return;
		const made = starterWeapon(s.classId);
		const bag = s.bag.slice();
		bag[index] = null;
		const hole = bag.findIndex((slot) => slot == null);
		if (hole < 0) bag[index] = made;
		else bag[hole] = made;
		set({
			bag,
			toast: `Sandık açıldı ve kayboldu. ${made.name} envantere geldi`
		});
	},
	equipFromBag: (index) => {
		const s = get();
		const it = s.bag[index];
		if (!it) return;
		if (it.id === "starter-chest") {
			get().openBagChest(index);
			return;
		}
		if (it.kind && it.kind !== "gear") {
			get().useBagItem(index);
			return;
		}
		if (it.slot === "weapon" && !weaponFits(s.classId, it.id)) {
			set({ toast: "Bu silah senin sınıfına ait değil" });
			return;
		}
		if ((it.req ?? 1) > s.level) {
			set({ toast: `Seviye ${it.req} gerekir` });
			return;
		}
		const prev = s.equipped[it.slot];
		if (prev?.uid === it.uid) return;
		const bag = s.bag.slice();
		bag[index] = null;
		if (prev && !bag.some((x) => x?.uid === prev.uid)) bag[index] = prev;
		const equipped = {
			...s.equipped,
			[it.slot]: it
		};
		const next = {
			...s,
			bag,
			equipped,
			gearRev: s.gearRev + 1,
			toast: `${displayName(it)} giyildi`
		};
		applyVitals(next, false);
		set(next);
	},
	unequip: (slot) => {
		const s = get();
		const it = s.equipped[slot];
		if (!it) return;
		const bag = s.bag.slice();
		if (bag.findIndex((x) => x?.uid === it.uid) < 0) {
			const empty = bag.findIndex((x) => x == null);
			if (empty < 0) {
				set({ toast: "Çanta dolu" });
				return;
			}
			bag[empty] = it;
		}
		const equipped = {
			...s.equipped,
			[slot]: null
		};
		const next = {
			...s,
			bag,
			equipped,
			gearRev: s.gearRev + 1,
			toast: `${displayName(it)} çıkarıldı`
		};
		applyVitals(next, false);
		set(next);
	},
	placeEquip: (slot, index) => {
		const s = get();
		const it = s.equipped[slot];
		if (!it || index < 0 || index >= s.bag.length) return;
		const bag = s.bag.slice();
		const other = bag[index] ?? null;
		const equipped = { ...s.equipped };
		if (!other) {
			bag[index] = it;
			equipped[slot] = null;
		} else if (other.id !== "starter-chest" && other.slot === slot) {
			bag[index] = it;
			equipped[slot] = other;
		} else {
			const empty = bag.findIndex((x) => x == null);
			if (empty < 0) {
				set({ toast: "Çanta dolu" });
				return;
			}
			bag[empty] = other;
			bag[index] = it;
			equipped[slot] = null;
		}
		const next = {
			...s,
			bag,
			equipped,
			gearRev: s.gearRev + 1,
			toast: `${displayName(it)} çantaya alındı`
		};
		applyVitals(next, false);
		set(next);
	},
	moveToPage: (from, page) => {
		const s = get();
		if (from < 0 || from >= s.bag.length) return;
		const item = s.bag[from];
		if (!item) return;
		const start = page * 24;
		if (from >= start && from < start + 24) return;
		const bag = s.bag.slice();
		let dest = -1;
		for (let i = 0; i < 24; i++) if (bag[start + i] == null) {
			dest = start + i;
			break;
		}
		if (dest < 0) {
			set({ toast: "Bu pencere dolu" });
			return;
		}
		bag[dest] = item;
		bag[from] = null;
		set({
			bag,
			toast: `${displayName(item)} pencere ${page + 1}`
		});
	},
	swapBag: (from, to) => {
		const bag = get().bag.slice();
		const tmp = bag[from];
		bag[from] = bag[to] ?? null;
		bag[to] = tmp ?? null;
		set({ bag });
	},
	buy: (id) => {
		const def = SHOP.find((x) => x.id === id);
		if (!def) return;
		const s = get();
		if (def.shop === "weapon" && def.kind !== "tool" && !weaponFits(s.classId, def.id)) {
			set({ toast: "Bu silah senin sınıfın değil" });
			return;
		}
		if (s.gold < def.price) {
			set({ toast: "Yetersiz altın" });
			return;
		}
		const bag = s.bag.slice();
		const limit = openBagCount(s.bagStage);
		if (def.kind && def.kind !== "gear") {
			const stack = bag.findIndex((item, i) => i < limit && item?.id === def.id && (item.count ?? 1) < 200);
			if (stack >= 0) {
				const pile = bag[stack];
				bag[stack] = {
					...pile,
					count: Math.min(200, (pile.count ?? 1) + 1)
				};
				set({
					bag,
					gold: s.gold - def.price,
					toast: `${def.name} alındı`
				});
				return;
			}
		}
		const empty = bag.findIndex((item, i) => i < limit && item == null);
		if (empty < 0) {
			set({ toast: "Çanta dolu" });
			return;
		}
		bag[empty] = cloneShop(def);
		set({
			bag,
			gold: s.gold - def.price,
			toast: `${def.name} alındı`
		});
	},
	enhance: (slot) => {
		const s = get();
		const it = s.equipped[slot];
		if (!it || it.plus >= 10) return;
		const cost = ENHANCE[it.plus] ?? 1550;
		if (s.gold < cost) {
			set({ toast: "Yetersiz altın" });
			return;
		}
		const nextItem = {
			...it,
			plus: it.plus + 1
		};
		const bag = s.bag.map((x) => x?.uid === it.uid ? nextItem : x);
		const equipped = {
			...s.equipped,
			[slot]: nextItem
		};
		const next = {
			...s,
			bag,
			equipped,
			gold: s.gold - cost,
			gearRev: s.gearRev + 1,
			toast: `${displayName(nextItem)} güçlendirildi`
		};
		applyVitals(next, false);
		set(next);
	},
	spend: (key) => {
		const s = get();
		if (s.unspent <= 0) return;
		const invested = {
			...s.invested,
			[key]: s.invested[key] + 1
		};
		const next = {
			...s,
			invested,
			unspent: s.unspent - 1,
			toast: `${STAT_LABEL[key]} +1`
		};
		applyVitals(next, false);
		if (key === "hp") next.hp = Math.min(next.hpMax, next.hp + 6);
		set(next);
	},
	grantXp: (amount) => {
		const boosted = bonusLive(get().bonusUntil) ? Math.round(amount * 1.15) : amount;
		const s = { ...get() };
		const notes = [];
		s.xp += boosted;
		while (s.xp >= s.xpTo) {
			s.xp -= s.xpTo;
			s.level += 1;
			s.xpTo = xpForLevel(s.level);
			while (s.vials < 4) {
				s.vials += 1;
				s.unspent += 1;
			}
			s.vials = 0;
			s.skillPoints += 1;
			notes.push(`Seviye ${s.level}. +1 yetenek puanı`);
		}
		const filled = Math.min(4, Math.floor(s.xp / s.xpTo * 4 + 1e-6));
		while (s.vials < filled) {
			s.vials += 1;
			s.unspent += 1;
			notes.push(`Tüp ${s.vials}/4 doldu. +1 puan`);
		}
		applyVitals(s, notes.some((n) => n.startsWith("Seviye")));
		s.quests = ensureLevelQuest(s.level, withSkillQuest(s.level, s.chosenTree, s.quests));
		s.toast = notes[0] ?? s.toast;
		set(s);
		return notes;
	},
	addGold: (n) => set((s) => ({ gold: s.gold + (bonusLive(s.bonusUntil) ? Math.round(n * 1.15) : n) })),
	hurtPlayer: (dmg) => {
		const dealt = Math.max(1, Math.round(dmg * (1 - Math.min(.6, guardUntil > Date.now() ? guardCut : 0))));
		const hp = Math.max(0, get().hp - dealt);
		set({
			hp,
			hurt: .35
		});
		liveHp = hp;
		return hp <= 0;
	},
	tick: (dt, sprinting) => {
		const s = get();
		if (liveSta < 0 || Math.abs(s.sta - liveSta) > 2.5) liveSta = s.sta;
		if (liveMana < 0 || Math.abs(s.mana - liveMana) > 2.5) liveMana = s.mana;
		if (liveHp < 0 || s.hp < liveHp - 1.5 || s.hp > liveHp + 1.5) liveHp = s.hp;
		const drain = 1.35 * (1 - Math.min(.45, (s.skills.sv6 ?? 0) * .12));
		if (staRecover > 0) {
			staRecover = Math.max(0, staRecover - dt);
			liveSta = Math.min(s.staMax, liveSta + s.staMax / 6 * dt);
			if (staRecover <= 0) liveSta = s.staMax;
		} else if (sprinting && liveSta > 0) {
			liveSta = Math.max(0, liveSta - drain * dt);
			if (liveSta <= .05) {
				liveSta = 0;
				staRecover = 6;
			}
		}
		staClock += dt;
		while (staClock >= 2) {
			staClock -= 2;
			if (staRecover <= 0 && !sprinting) liveSta = Math.min(s.staMax, liveSta + s.staMax * .04);
		}
		liveMana = Math.min(s.manaMax, liveMana + 5 * dt);
		if (liveHp < s.hpMax) liveHp = Math.min(s.hpMax, liveHp + (regenUntil > Date.now() ? 9 : 1.6) * dt);
		let hurt = s.hurt;
		if (hurt > 0) hurt = Math.max(0, hurt - dt);
		const shown = (n) => Math.ceil(n);
		if (shown(liveSta) !== shown(s.sta) || shown(liveMana) !== shown(s.mana) || shown(liveHp) !== shown(s.hp) || hurt !== s.hurt) set({
			sta: liveSta,
			mana: liveMana,
			hp: liveHp,
			hurt
		});
	},
	totals: () => totalsOf(get()),
	moveSpeed: (sprinting) => {
		const swift = get().swiftUntil > Date.now() ? 1.25 : 1;
		const burst = stepUntil > Date.now() ? stepMul : 1;
		const walk = (2.15 + totalsOf(get()).mvs * .03) * swift * burst;
		return sprinting ? walk * 1.62 : walk;
	},
	punch: () => {
		const state = get();
		const t = totalsOf(state);
		const weapon = state.equipped.weapon;
		const bonus = weapon ? itemStats(weapon).str * .45 : 0;
		const base = 8 + t.str * 1.15 + bonus;
		const crit = Math.random() * 100 < t.ctp;
		return {
			dmg: Math.round(base * (crit ? 1.7 : 1) * (.92 + Math.random() * .16)),
			crit
		};
	},
	attackGap: () => {
		const haste = get().hasteUntil > Date.now() ? .75 : 1;
		return Math.max(.22, (.5 - totalsOf(get()).ats * .01) * haste);
	}
}));
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-CVqXY6bk.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-Cm3PUzha.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
//#endregion
export { skillCdLeft as $, bindControlsTest as A, inWater as B, TREES as C, authMiddleware as D, asClassId as E, displayName as F, onPier as G, itemStats as H, dryLand as I, readCarry as J, onPlaza as K, faceYaw as L, bridgeName as M, captureSave as N, axes as O, className as P, sim as Q, groundY as R, STAT_LABEL as S, applySave as T, middleware_SMghQq71_exports as U, input as V, occluded as W, setCarry as X, readSim as Y, setWindVolume as Z, PLAYER_R as _, DECK_HALF as a, useHud as at, SPAN_IN as b, FISHER_HUT as c, weaponStyleOf as ct, MAP_MARKS as d, skillPreview as et, MENTORS as f, PIER_TOP as g, PIER as h, CLASS_TREES as i, takeCast as it, blocked as j, beginPlay as k, FISHER_YAW as l, zoneName as lt, MOAT_OUT as m, CHIMNEYS as n, slide as nt, DECK_TOP as o, useRpg as ot, MOAT_IN as p, openBagCount as q, CLASS_LIST as r, sumStats as rt, ENHANCE as s, weaponFits as st, CATALOG as t, skillTier as tt, HOUSES as u, RAIL_T as v, VEINS as w, SPAN_OUT as x, SLOT_LABEL as y, held as z };
