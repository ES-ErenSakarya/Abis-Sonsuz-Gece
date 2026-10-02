// @ts-nocheck
import * as THREE from "three";
import { bridgeDeckY, CHIMNEYS, DECK_HALF, DECK_TOP, FISHER_HUT, FISHER_YAW, HOUSES, MOAT_IN, MOAT_OUT, PIER, RAIL_T, RISE_IN, RISE_OUT, SPAN_IN, SPAN_OUT, TREES, VEINS } from "@/game/world";

export type SmokePuff = { sprite: THREE.Sprite; base: number; life: number; speed: number };

var bin = [];
function keep(item) {
	bin.push(item);
	return item;
}
export function disposeScenery() {
	while (bin.length) bin.pop()?.dispose();
}
function repeatTex(base, rx, ry) {
	const tex = base.clone();
	tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
	tex.repeat.set(rx, ry);
	tex.colorSpace = THREE.SRGBColorSpace;
	tex.anisotropy = 2;
	tex.needsUpdate = true;
	keep(tex);
	return tex;
}
function mat(tex, _rough = .92) {
	return keep(new THREE.MeshLambertMaterial({
		map: tex
	}));
}
function roofGeometry(w, d, rh) {
	const hw = w / 2 + .42;
	const hd = d / 2 + .38;
	const verts = [
		[
			-hw,
			0,
			-hd
		],
		[
			-hw,
			0,
			hd
		],
		[
			0,
			rh,
			hd
		],
		[
			-hw,
			0,
			-hd
		],
		[
			0,
			rh,
			hd
		],
		[
			0,
			rh,
			-hd
		],
		[
			hw,
			0,
			hd
		],
		[
			hw,
			0,
			-hd
		],
		[
			0,
			rh,
			-hd
		],
		[
			hw,
			0,
			hd
		],
		[
			0,
			rh,
			-hd
		],
		[
			0,
			rh,
			hd
		],
		[
			-hw,
			0,
			-hd
		],
		[
			0,
			rh,
			-hd
		],
		[
			hw,
			0,
			-hd
		],
		[
			hw,
			0,
			hd
		],
		[
			0,
			rh,
			hd
		],
		[
			-hw,
			0,
			hd
		]
	];
	const pos = new Float32Array(verts.length * 3);
	const uv = new Float32Array(verts.length * 2);
	for (let i = 0; i < verts.length; i++) {
		const v = verts[i];
		pos[i * 3] = v[0];
		pos[i * 3 + 1] = v[1];
		pos[i * 3 + 2] = v[2];
		uv[i * 2] = (v[0] + hw) / (hw * 2);
		uv[i * 2 + 1] = (v[2] + hd) / (hd * 2);
	}
	const geo = new THREE.BufferGeometry();
	geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
	geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
	geo.computeVertexNormals();
	return keep(geo);
}
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(src));
		img.src = src;
	});
}
export async function composeGround() {
	const [grass] = await Promise.all([loadImage("/textures/grass.jpg")]);
	const S = 1024;
	const canvas = document.createElement("canvas");
	canvas.width = S;
	canvas.height = S;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("canvas");
	const ppm = S / 110;
	const tile = Math.round(3.1 * ppm);
	for (let y = 0; y < S; y += tile) for (let x = 0; x < S; x += tile) ctx.drawImage(grass, x, y, 59, 59);
	const tex = new THREE.CanvasTexture(canvas);
	tex.colorSpace = THREE.SRGBColorSpace;
	tex.anisotropy = 2;
	tex.needsUpdate = true;
	return keep(tex);
}
function smokeTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 64;
	canvas.height = 64;
	const g = canvas.getContext("2d");
	if (!g) return keep(new THREE.CanvasTexture(canvas));
	const grd = g.createRadialGradient(32, 32, 2, 32, 32, 30);
	grd.addColorStop(0, "rgba(206,206,204,0.45)");
	grd.addColorStop(1, "rgba(206,206,204,0)");
	g.fillStyle = grd;
	g.fillRect(0, 0, 64, 64);
	const tex = new THREE.CanvasTexture(canvas);
	tex.colorSpace = THREE.SRGBColorSpace;
	return keep(tex);
}
export function buildVillage(textures) {
	const root = new THREE.Group();
	for (const tex of [
		textures.stone,
		textures.wood,
		textures.thatch,
		textures.ground
	]) {
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.anisotropy = 2;
	}
	textures.stone.wrapS = textures.stone.wrapT = THREE.RepeatWrapping;
	textures.wood.wrapS = textures.wood.wrapT = THREE.RepeatWrapping;
	textures.thatch.wrapS = textures.thatch.wrapT = THREE.RepeatWrapping;
	textures.ground.wrapS = textures.ground.wrapT = THREE.RepeatWrapping;
	textures.ground.repeat.set(8, 8);
	const ground = new THREE.Mesh(keep(new THREE.PlaneGeometry(2400, 2400)), keep(new THREE.MeshLambertMaterial({
		map: textures.ground
	})));
	ground.rotation.x = -Math.PI / 2;
	ground.position.y = -.02;
	ground.receiveShadow = true;
	ground.name = "season-ground";
	root.add(ground);
	const snowCanvas = document.createElement("canvas");
	snowCanvas.width = 128;
	snowCanvas.height = 128;
	const snowTex = keep(new THREE.CanvasTexture(snowCanvas));
	const blanket = new THREE.Mesh(keep(new THREE.PlaneGeometry(2400, 2400)), keep(new THREE.MeshLambertMaterial({
		color: "#f7fbff",
		transparent: true,
		opacity: 0.9,
		alphaMap: snowTex,
		depthWrite: false
	})));
	blanket.rotation.x = -Math.PI / 2;
	blanket.position.y = 0.03;
	blanket.name = "snow-blanket";
	blanket.visible = false;
	blanket.userData.canvas = snowCanvas;
	blanket.userData.tex = snowTex;
	blanket.receiveShadow = true;
	root.add(blanket);
	const stoneMat = (rx, ry) => mat(repeatTex(textures.stone, rx, ry), .9);
	const woodMat = (rx, ry) => mat(repeatTex(textures.wood, rx, ry), .78);
	const thatchMat = (rx, ry) => mat(repeatTex(textures.thatch, rx, ry), .95);
	const dark = keep(new THREE.MeshStandardMaterial({
		color: "#1a1613",
		roughness: .9
	}));
	const glow = keep(new THREE.MeshStandardMaterial({
		color: "#ffb27a",
		emissive: "#ff9a4a",
		emissiveIntensity: .7,
		roughness: .6
	}));
	for (const h of HOUSES) {
		const g = new THREE.Group();
		g.position.set(h.x, 0, h.z);
		g.rotation.y = h.yaw;
		const walls = new THREE.Mesh(keep(new THREE.BoxGeometry(h.w, h.h, h.d)), stoneMat(h.w / 2.4, h.h / 1.8));
		walls.position.y = h.h / 2;
		walls.castShadow = true;
		walls.receiveShadow = true;
		g.add(walls);
		const roof = new THREE.Mesh(roofGeometry(h.w, h.d, h.rh), thatchMat(h.w / 2.2, 1.4));
		roof.position.y = h.h;
		roof.castShadow = true;
		roof.receiveShadow = true;
		roof.name = "season-roof";
		const cap = new THREE.Mesh(roofGeometry(h.w * 0.98, h.d * 0.98, h.rh * 0.72), keep(new THREE.MeshLambertMaterial({ color: "#f7fbff" })));
		cap.position.y = h.rh * 0.28;
		cap.scale.set(1, 1.15, 1);
		cap.name = "snow-cap";
		cap.visible = false;
		roof.add(cap);
		g.add(roof);
		const chimney = new THREE.Mesh(keep(new THREE.BoxGeometry(.55, 1.15, .55)), stoneMat(1, 2));
		chimney.position.set(h.w * .22, h.h + h.rh * .35, 0);
		chimney.castShadow = true;
		g.add(chimney);
		const doorW = Math.min(1.15, h.w * .28);
		const doorH = Math.min(2.05, h.h * .72);
		const door = new THREE.Mesh(keep(new THREE.BoxGeometry(doorW, doorH, .08)), woodMat(1, 2));
		door.castShadow = true;
		const winMat = glow;
		const win = new THREE.Mesh(keep(new THREE.BoxGeometry(.42, .5, .06)), winMat);
		const place = (obj, face, y, along) => {
			if (face === "pz") obj.position.set(along, y, h.d / 2 + .03);
			if (face === "nz") obj.position.set(along, y, -h.d / 2 - .03);
			if (face === "px") obj.position.set(h.w / 2 + .03, y, along);
			if (face === "nx") obj.position.set(-h.w / 2 - .03, y, along);
		};
		place(door, h.door, doorH / 2, 0);
		if (h.door === "px" || h.door === "nx") door.rotation.y = Math.PI / 2;
		g.add(door);
		const w1 = win.clone();
		const w2 = win.clone();
		place(w1, h.door, h.h * .62, doorW * .95);
		place(w2, h.door, h.h * .62, -doorW * .95);
		if (h.door === "px" || h.door === "nx") {
			w1.rotation.y = Math.PI / 2;
			w2.rotation.y = Math.PI / 2;
		}
		g.add(w1, w2);
		if (h.id === "forge") {
			const mouth = new THREE.Mesh(keep(new THREE.BoxGeometry(1.3, .7, .12)), dark);
			place(mouth, h.door, .7, 1.35);
			if (h.door === "px" || h.door === "nx") mouth.rotation.y = Math.PI / 2;
			const coal = new THREE.Mesh(keep(new THREE.BoxGeometry(.7, .12, .45)), keep(new THREE.MeshStandardMaterial({
				color: "#ff6a2a",
				emissive: "#ff4d12",
				emissiveIntensity: 1.4,
				roughness: .5
			})));
			coal.position.set(-.2, .45, -h.d / 2 - .7);
			const anvil = new THREE.Mesh(keep(new THREE.BoxGeometry(.45, .22, .22)), keep(new THREE.MeshStandardMaterial({
				color: "#2c3033",
				metalness: .8,
				roughness: .35
			})));
			anvil.position.set(1.55, .72, h.d / 2 + 1.15);
			anvil.castShadow = true;
			const stump = new THREE.Mesh(keep(new THREE.CylinderGeometry(.22, .26, .62, 10)), woodMat(1, 1));
			stump.position.set(1.55, .31, h.d / 2 + 1.15);
			stump.castShadow = true;
			g.add(mouth, coal, anvil, stump);
		}
		root.add(g);
	}
	const bed = new THREE.Mesh(
		keep(new THREE.RingGeometry(MOAT_IN - 1.4, MOAT_OUT + 1.5, 128, 1)),
		keep(new THREE.MeshBasicMaterial({ color: "#071416", side: THREE.DoubleSide })),
	);
	bed.rotation.x = -Math.PI / 2;
	bed.position.y = 0.045;
	bed.renderOrder = 2;
	bed.receiveShadow = true;
	root.add(bed);
	const waterMat = keep(new THREE.MeshStandardMaterial({
		color: "#0c4550",
		roughness: 0.16,
		metalness: 0.42,
		emissive: "#06262c",
		emissiveIntensity: 0.45,
		side: THREE.DoubleSide,
	}));
	const lakeTime = { value: 0 };
	waterMat.userData.uTime = lakeTime;
	waterMat.onBeforeCompile = (shader) => {
		shader.uniforms.uTime = lakeTime;
		shader.vertexShader = shader.vertexShader
			.replace("#include <common>", "#include <common>\nuniform float uTime;\nvarying vec3 vLake;")
			.replace("#include <beginnormal_vertex>", `#include <beginnormal_vertex>
				float waveMix = smoothstep(0.4, 0.6, 0.5 + 0.5 * sin(uTime * 0.15));
				float currentMix = 1.0 - waveMix;
				objectNormal.x += cos(position.x * 0.46 + uTime * 1.45) * 0.9 * waveMix;
				objectNormal.y += sin(position.y * 0.4 - uTime * 1.15) * 0.8 * waveMix;
				objectNormal.y += cos(position.x * 0.18 - uTime * 0.85) * 0.28 * currentMix;
			`)
			.replace("#include <begin_vertex>", `#include <begin_vertex>
				float waveMix = smoothstep(0.4, 0.6, 0.5 + 0.5 * sin(uTime * 0.15));
				float currentMix = 1.0 - waveMix;
				float rip = sin(position.x * 0.52 + position.y * 0.16 + uTime * 1.55);
				rip += sin(length(position.xy) * 0.58 - uTime * 1.25) * 0.7;
				transformed.z += rip * 0.12 * waveMix;
				float flow = uTime * 0.9;
				transformed.x += sin(position.y * 0.34 + flow) * 0.08 * currentMix;
				transformed.z += sin(position.x * 0.22 - flow * 0.7) * 0.03 * currentMix;
				float ax = abs(position.x);
				float ay = abs(position.y);
				float under = 0.0;
				if (ax < ${DECK_HALF + 0.35} && ay > ${SPAN_IN + 0.2} && ay < ${SPAN_OUT - 0.2}) under = 1.0;
				if (ay < ${DECK_HALF + 0.35} && ax > ${SPAN_IN + 0.2} && ax < ${SPAN_OUT - 0.2}) under = 1.0;
				transformed.z -= under * 1.15;
				vLake = position;
			`);
		shader.fragmentShader = shader.fragmentShader
			.replace("#include <common>", "#include <common>\nuniform float uTime;\nvarying vec3 vLake;")
			.replace("#include <color_fragment>", `#include <color_fragment>
				float waveMix = smoothstep(0.4, 0.6, 0.5 + 0.5 * sin(uTime * 0.15));
				float currentMix = 1.0 - waveMix;
				float crest = sin(vLake.x * 0.52 + vLake.y * 0.16 + uTime * 1.55) * 0.5 + 0.5;
				float ring = sin(length(vLake.xy) * 0.66 - uTime * 1.4) * 0.5 + 0.5;
				diffuseColor.rgb += vec3(0.16, 0.42, 0.46) * crest * ring * waveMix;
				float streak = sin(vLake.y * 0.42 - uTime * 1.35) * 0.65 + sin(vLake.x * 0.1 + uTime * 0.35) * 0.35;
				streak = smoothstep(0.2, 0.82, streak * 0.5 + 0.5);
				diffuseColor.rgb += vec3(0.04, 0.2, 0.24) * streak * currentMix;
				diffuseColor.rgb += vec3(0.1, 0.24, 0.28) * currentMix * (0.35 + 0.65 * sin(vLake.y * 0.2 - uTime * 0.8));
			`);
	};
	const moat = new THREE.Mesh(keep(new THREE.RingGeometry(MOAT_IN - 0.15, MOAT_OUT + 0.2, 160, 28)), waterMat);
	moat.rotation.x = -Math.PI / 2;
	moat.position.y = 0.14;
	moat.renderOrder = 3;
	moat.name = "moat";
	moat.receiveShadow = true;
	root.add(moat);
	const plank = keep(new THREE.BoxGeometry(1, 1, 1));
	const plankMat = woodMat(2, 1);
	const arch = (axis, sign) => {
		const railMat = woodMat(1, 1);
		const wide = 3.15;
		const thick = 0.06;
		const slab = (along0, along1, top) => {
			const len = Math.max(0.15, Math.abs(along1 - along0));
			const mid = (along0 + along1) / 2;
			const mesh = new THREE.Mesh(plank, plankMat);
			mesh.scale.set(axis === "z" ? wide : len, thick, axis === "z" ? len : wide);
			mesh.position.set(axis === "z" ? 0 : sign * mid, top - thick / 2, axis === "z" ? sign * mid : 0);
			mesh.receiveShadow = true;
			mesh.castShadow = true;
			root.add(mesh);
		};
		const steps = 6;
		const riseLen = RISE_IN - SPAN_IN;
		for (let i = 0; i < steps; i++) {
			const a0 = SPAN_IN + (riseLen * i) / steps;
			const a1 = SPAN_IN + (riseLen * (i + 1)) / steps;
			slab(a0, a1, bridgeDeckY((a0 + a1) / 2));
			const b1 = SPAN_OUT - (riseLen * i) / steps;
			const b0 = SPAN_OUT - (riseLen * (i + 1)) / steps;
			slab(b0, b1, bridgeDeckY((b0 + b1) / 2));
		}
		slab(RISE_IN, RISE_OUT, DECK_TOP);
		const railAcross = wide / 2 - RAIL_T / 2;
		const railH = 0.95;
		const railY = DECK_TOP + railH / 2;
		const railSpan = RISE_OUT - RISE_IN - 0.3;
		const railMid = (RISE_IN + RISE_OUT) / 2;
		for (const side of [-railAcross, railAcross]) {
			const rail = new THREE.Mesh(plank, railMat);
			if (axis === "z") {
				rail.position.set(side, railY, sign * railMid);
				rail.scale.set(RAIL_T, railH, railSpan);
			} else {
				rail.position.set(sign * railMid, railY, side);
				rail.scale.set(railSpan, railH, RAIL_T);
			}
			rail.castShadow = true;
			root.add(rail);
		}
	};
	arch("z", 1);
	arch("z", -1);
	arch("x", 1);
	arch("x", -1);
	const hutWood = woodMat(1, 1);
	const hut = new THREE.Group();
	hut.position.set(FISHER_HUT.x, 0, FISHER_HUT.z);
	hut.rotation.y = FISHER_YAW;
	const hutWall = (w, h, d, x, y, z) => {
		const mesh = new THREE.Mesh(keep(new THREE.BoxGeometry(w, h, d)), hutWood);
		mesh.position.set(x, y, z);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		hut.add(mesh);
	};
	hutWall(4.5, 0.16, 3.6, 0, 0.08, 0);
	hutWall(0.16, 2.2, 3.6, -2.15, 1.22, 0);
	hutWall(0.16, 2.2, 3.6, 2.15, 1.22, 0);
	hutWall(4.5, 2.2, 0.16, 0, 1.22, -1.7);
	hutWall(1.35, 2.2, 0.16, -1.5, 1.22, 1.7);
	hutWall(1.35, 2.2, 0.16, 1.5, 1.22, 1.7);
	const hutRoof = new THREE.Mesh(roofGeometry(4.1, 3.2, 1.05), thatchMat(2, 1));
	hutRoof.position.y = 2.25;
	hutRoof.castShadow = true;
	hut.add(hutRoof);
	const lamp = new THREE.Mesh(keep(new THREE.BoxGeometry(0.16, 0.22, 0.16)), keep(new THREE.MeshStandardMaterial({
		color: "#ffb15a",
		emissive: "#ff8a2a",
		emissiveIntensity: 0.8
	})));
	lamp.position.set(0.7, 1.7, 1.85);
	hut.add(lamp);
	const barrel = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.28, 0.32, 0.55, 8)), hutWood);
	barrel.position.set(-1.85, 0.4, 2.15);
	barrel.castShadow = true;
	hut.add(barrel);
	const rack = new THREE.Mesh(keep(new THREE.BoxGeometry(1.4, 0.06, 0.06)), hutWood);
	rack.position.set(1.7, 1.35, 2.25);
	hut.add(rack);
	const fishMat = keep(new THREE.MeshLambertMaterial({ color: "#8a93a0" }));
	for (const x of [-0.4, 0, 0.4]) {
		const fish = new THREE.Mesh(keep(new THREE.CapsuleGeometry(0.05, 0.22, 3, 5)), fishMat);
		fish.position.set(1.7 + x, 1.05, 2.25);
		fish.rotation.z = 0.4;
		hut.add(fish);
	}
	root.add(hut);
	const pierLen = Math.hypot(PIER.x1 - PIER.x0, PIER.z1 - PIER.z0);
	const pier = new THREE.Group();
	pier.position.set((PIER.x0 + PIER.x1) / 2, 0, (PIER.z0 + PIER.z1) / 2);
	pier.rotation.y = FISHER_YAW;
	const pierDeck = new THREE.Mesh(plank, plankMat);
	pierDeck.scale.set(PIER.half * 2, 0.2, pierLen);
	pierDeck.position.y = 0.38;
	pierDeck.castShadow = true;
	pierDeck.receiveShadow = true;
	pier.add(pierDeck);
	for (let i = 0; i < 5; i++) {
		const z = -pierLen / 2 + (i + 0.5) * (pierLen / 5);
		for (const x of [-PIER.half + 0.08, PIER.half - 0.08]) {
			const post = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.07, 0.09, 1.15, 6)), hutWood);
			post.position.set(x, 0.05, z);
			post.castShadow = true;
			pier.add(post);
		}
	}
	for (const x of [-PIER.half, PIER.half]) {
		const rail = new THREE.Mesh(plank, woodMat(1, 1));
		rail.scale.set(0.08, 0.22, pierLen - 0.4);
		rail.position.set(x, 0.78, 0);
		pier.add(rail);
	}
	const boat = new THREE.Group();
	boat.position.set(PIER.half + 0.85, 0.18, pierLen * 0.28);
	const hull = new THREE.Mesh(keep(new THREE.BoxGeometry(0.62, 0.2, 1.7)), hutWood);
	hull.castShadow = true;
	const bow = new THREE.Mesh(keep(new THREE.ConeGeometry(0.32, 0.45, 4)), hutWood);
	bow.rotation.x = Math.PI / 2;
	bow.position.z = 0.95;
	boat.add(hull, bow);
	pier.add(boat);
	root.add(pier);
	const trunkGeo = keep(new THREE.CylinderGeometry(.18, .28, 1, 8));
	const trunkMat = woodMat(1, 2);
	const leafGeo = keep(new THREE.IcosahedronGeometry(1, 0));
	const leafColors = new Float32Array(leafGeo.attributes.position.count * 3);
	for (let i = 0; i < leafGeo.attributes.position.count; i++) {
		const n = Math.sin(i * 12.989) * 43758.5453 % 1;
		const f = n < 0 ? n + 1 : n;
		leafColors[i * 3] = .18 + f * .08;
		leafColors[i * 3 + 1] = .28 + f * .1;
		leafColors[i * 3 + 2] = .12 + f * .04;
	}
	leafGeo.setAttribute("color", new THREE.BufferAttribute(leafColors, 3));
	const leafMat = keep(new THREE.MeshLambertMaterial({
		vertexColors: true
	}));
	for (const t of TREES) {
		const tree = new THREE.Group();
		tree.position.set(t.x, 0, t.z);
		const trunk = new THREE.Mesh(trunkGeo, trunkMat);
		trunk.position.y = 1.15 * t.s;
		trunk.scale.set(t.s, 2.3 * t.s, t.s);
		trunk.castShadow = true;
		tree.add(trunk);
		const clumps = 4;
		for (let i = 0; i < clumps; i++) {
			const geo = leafGeo.clone();
			keep(geo);
			const pos = geo.attributes.position;
			for (let v = 0; v < pos.count; v++) {
				const jx = Math.sin(t.seed * 13 + v * 3.1 + i) * .12;
				const jy = Math.cos(t.seed * 7 + v * 1.7 + i) * .1;
				pos.setXYZ(v, pos.getX(v) + jx, pos.getY(v) * .82 + jy, pos.getZ(v) + jx * .6);
			}
			geo.computeVertexNormals();
			const leaf = new THREE.Mesh(geo, leafMat);
			const a = i / clumps * Math.PI * 2;
			leaf.position.set(Math.cos(a) * .35 * t.s, (2.5 + i % 2 * .45) * t.s, Math.sin(a) * .35 * t.s);
			leaf.scale.setScalar((1.15 + i % 3 * .18) * t.s);
			leaf.castShadow = false;
			tree.add(leaf);
		}
		const snowTop = new THREE.Mesh(keep(new THREE.IcosahedronGeometry(0.85, 0)), keep(new THREE.MeshLambertMaterial({ color: "#f4f8fc" })));
		snowTop.position.y = 3.15 * t.s;
		snowTop.scale.setScalar(1.65 * t.s);
		snowTop.name = "snow-cap";
		snowTop.visible = false;
		tree.add(snowTop);
		root.add(tree);
	}
	const well = new THREE.Group();
	const outer = new THREE.Mesh(keep(new THREE.CylinderGeometry(1.08, 1.18, 1.02, 28, 1, true)), stoneMat(3, 1));
	outer.position.y = 0.51;
	outer.castShadow = true;
	outer.receiveShadow = true;
	const innerMat = stoneMat(2.2, 1);
	innerMat.side = THREE.BackSide;
	const inner = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.84, 0.92, 0.98, 28, 1, true)), innerMat);
	inner.position.y = 0.52;
	const floor = new THREE.Mesh(keep(new THREE.CircleGeometry(0.92, 28)), stoneMat(1.2, 1));
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = 0.08;
	const water = new THREE.Mesh(keep(new THREE.CircleGeometry(0.78, 32)), keep(new THREE.ShaderMaterial({
		uniforms: { uTime: { value: 0 } },
		vertexShader: `
			uniform float uTime;
			varying vec2 vUv;
			void main() {
				vUv = uv;
				vec3 p = position;
				p.z += sin(p.x * 6.0 + uTime * 2.2) * 0.035 + cos(p.y * 7.0 - uTime * 1.6) * 0.025;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
			}
		`,
		fragmentShader: `
			uniform float uTime;
			varying vec2 vUv;
			void main() {
				float ripple = sin(vUv.x * 40.0 + uTime * 2.4) * 0.5 + 0.5;
				float cross = cos(vUv.y * 28.0 - uTime * 1.7) * 0.5 + 0.5;
				vec3 deep = vec3(0.04, 0.16, 0.18);
				vec3 shine = vec3(0.45, 0.72, 0.74);
				gl_FragColor = vec4(mix(deep, shine, ripple * 0.45 + cross * 0.2), 1.0);
			}
		`
	})));
	water.name = "well-water";
	water.rotation.x = -Math.PI / 2;
	water.position.y = 0.28;
	const lip = new THREE.Mesh(keep(new THREE.TorusGeometry(1.02, 0.09, 10, 28)), stoneMat(2, 1));
	lip.rotation.x = Math.PI / 2;
	lip.position.y = 1.02;
	const postGeo = keep(new THREE.CylinderGeometry(.08, .09, 1.85, 10));
	const postMat = woodMat(1, 2);
	const postL = new THREE.Mesh(postGeo, postMat);
	postL.position.set(-.78, 1.7, 0);
	const postR = postL.clone();
	postR.position.x = .78;
	const beam = new THREE.Mesh(keep(new THREE.CylinderGeometry(.065, .065, 1.75, 8)), postMat);
	beam.rotation.z = Math.PI / 2;
	beam.position.y = 2.55;
	const littleRoof = new THREE.Mesh(roofGeometry(2.05, 1.15, .5), thatchMat(1.2, 1));
	littleRoof.position.y = 2.42;
	postL.castShadow = postR.castShadow = beam.castShadow = true;
	well.add(outer, inner, floor, water, lip, postL, postR, beam, littleRoof);
	root.add(well);
	const oreMat = keep(new THREE.MeshStandardMaterial({ color: "#6e624c", roughness: 0.9 }));
	for (const vein of VEINS) {
		const rock = new THREE.Mesh(keep(new THREE.DodecahedronGeometry(0.55, 0)), oreMat);
		rock.position.set(vein.x, 0.35, vein.z);
		rock.castShadow = true;
		root.add(rock);
	}
	const plazaMat = keep(new THREE.MeshStandardMaterial({
		map: repeatTex(textures.stone, 2.4, 2.4),
		roughness: 0.78,
		metalness: 0.04,
		color: "#d9d3c8"
	}));
	const plaza = new THREE.Mesh(keep(new THREE.CircleGeometry(16.5, 96)), plazaMat);
	plaza.rotation.x = -Math.PI / 2;
	plaza.position.y = 0.018;
	plaza.receiveShadow = true;
	const curb = new THREE.Mesh(keep(new THREE.RingGeometry(16.15, 16.62, 96)), stoneMat(3, 0.4));
	curb.rotation.x = -Math.PI / 2;
	curb.position.y = 0.028;
	root.add(plaza, curb);

	const puffs = [];
	const puffTex = smokeTexture();
	for (const cny of CHIMNEYS) for (let i = 0; i < 5; i++) {
		const material = keep(new THREE.SpriteMaterial({
			map: puffTex,
			transparent: true,
			depthWrite: false,
			opacity: .2
		}));
		const sprite = new THREE.Sprite(material);
		const life = i / 5;
		sprite.position.set(cny.x, cny.y + life * 2.1, cny.z);
		root.add(sprite);
		puffs.push({
			sprite,
			base: cny.y,
			life,
			speed: .12 + i % 3 * .02
		});
	}
	const forgeLight = new THREE.PointLight("#ff6a2a", 6, 8, 2);
	forgeLight.position.set(-14.2, 1.2, 17.2);
	root.add(forgeLight);
	root.add(makeGrass());
	return {
		root,
		puffs,
		forgeLight,
		dummy: null
	};
}
var grassTime = { value: 0 };
function makeDummy() {
	const root = new THREE.Group();
	root.position.set(4.2, 0, 12.4);
	root.rotation.y = Math.PI * .15;
	const wood = keep(new THREE.MeshStandardMaterial({
		color: "#6b4a2e",
		roughness: .86
	}));
	const sack = keep(new THREE.MeshStandardMaterial({
		color: "#c2a36a",
		roughness: .92
	}));
	const rope = keep(new THREE.MeshStandardMaterial({
		color: "#8a6a3c",
		roughness: .95
	}));
	const straw = keep(new THREE.MeshStandardMaterial({
		color: "#d2b15a",
		roughness: 1
	}));
	const paint = keep(new THREE.MeshStandardMaterial({
		color: "#9a1c1c",
		roughness: .7
	}));
	const ring = keep(new THREE.MeshStandardMaterial({
		color: "#b9b4aa",
		roughness: .35,
		metalness: .6
	}));
	const post = new THREE.Mesh(keep(new THREE.CylinderGeometry(.09, .11, 1.15, 8)), wood);
	post.position.y = .55;
	post.castShadow = true;
	const beam = new THREE.Mesh(keep(new THREE.CylinderGeometry(.045, .045, 1.35, 6)), wood);
	beam.rotation.z = Math.PI / 2;
	beam.position.y = 1.28;
	beam.castShadow = true;
	const body = new THREE.Mesh(keep(new THREE.CylinderGeometry(.28, .34, .72, 10)), sack);
	body.position.y = 1.22;
	body.castShadow = true;
	const head = new THREE.Mesh(keep(new THREE.SphereGeometry(.2, 12, 10)), sack);
	head.position.y = 1.78;
	head.castShadow = true;
	const band = new THREE.Mesh(keep(new THREE.TorusGeometry(.16, .018, 6, 16)), ring);
	band.rotation.x = Math.PI / 2;
	band.position.y = 1.86;
	const armGeo = keep(new THREE.CylinderGeometry(.07, .08, .42, 7));
	const armL = new THREE.Mesh(armGeo, sack);
	armL.rotation.z = Math.PI / 2;
	armL.position.set(-.48, 1.32, 0);
	const armR = armL.clone();
	armR.position.x = .48;
	armL.castShadow = armR.castShadow = true;
	const tuftGeo = keep(new THREE.ConeGeometry(.05, .16, 5));
	const tufts = [];
	for (const side of [-1, 1]) for (let i = 0; i < 5; i++) {
		const tuft = new THREE.Mesh(tuftGeo, straw);
		tuft.position.set(side * (.66 + i % 2 * .04), 1.32 + (i - 2) * .035, (i - 2) * .02);
		tuft.rotation.z = side * 1.2;
		tufts.push(tuft);
	}
	const ropeBand = new THREE.Mesh(keep(new THREE.TorusGeometry(.3, .018, 5, 14)), rope);
	ropeBand.rotation.x = Math.PI / 2;
	ropeBand.position.y = 1.05;
	const target = new THREE.Mesh(keep(new THREE.CircleGeometry(.16, 16)), paint);
	target.position.set(0, 1.24, .33);
	const inner = new THREE.Mesh(keep(new THREE.RingGeometry(.05, .09, 16)), keep(new THREE.MeshStandardMaterial({
		color: "#f2efe6",
		roughness: .6
	})));
	inner.position.set(0, 1.24, .335);
	const sackBody = body;
	const sackGroup = new THREE.Group();
	sackGroup.add(sackBody, head, band, armL, armR, ropeBand, target, inner, ...tufts);
	root.add(post, beam, sackGroup);
	root.userData.body = sackGroup;
	return root;
}
function makeGrass() {
	const geo = new THREE.PlaneGeometry(.07, .32, 1, 3);
	geo.translate(0, .11, 0);
	const mat = new THREE.MeshLambertMaterial({
		color: "#3f6b32",
		side: THREE.DoubleSide
	});
	mat.onBeforeCompile = (shader) => {
		shader.uniforms.uTime = grassTime;
		shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform float uTime;").replace("#include <begin_vertex>", `#include <begin_vertex>
        vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
        float h = clamp(position.y * 4.2, 0.0, 1.0);
        float gust = sin(uTime * 1.15 + ip.x * 0.55 + ip.z * 0.41);
        transformed.x += gust * 0.035 * h * h;
        transformed.z += cos(uTime * 0.9 + ip.z * 0.48) * 0.02 * h * h;`);
	};
	const count = 1500;
	const mesh = new THREE.InstancedMesh(geo, mat, count);
	mesh.castShadow = false;
	mesh.receiveShadow = false;
	const dummy = new THREE.Object3D();
	const color = new THREE.Color();
	let placed = 0;
	const cluster = (cx, cz, n, spread) => {
		for (let k = 0; k < n && placed < count; k++) {
			const a = Math.random() * Math.PI * 2;
			const r = Math.sqrt(Math.random()) * spread;
			const x = cx + Math.cos(a) * r;
			const z = cz + Math.sin(a) * r;
			const rr = Math.hypot(x, z);
			if (rr > 43 && rr < 68) continue;
			if (Math.hypot(x, z) < 16.8) continue;
			dummy.position.set(x, 0, z);
			dummy.rotation.y = Math.random() * Math.PI;
			dummy.rotation.z = (Math.random() - .5) * .18;
			const s = .65 + Math.random() * .55;
			dummy.scale.set(s * (.7 + Math.random() * .5), .55 + Math.random() * .7, 1);
			dummy.updateMatrix();
			mesh.setMatrixAt(placed, dummy.matrix);
			color.setHSL(.28 + Math.random() * .06, .42 + Math.random() * .22, .16 + Math.random() * .1);
			mesh.setColorAt(placed, color);
			placed++;
		}
	};
	for (let i = 0; i < 90 && placed < count; i++) {
		const ring = 18 + Math.random() * 140;
		const a = Math.random() * Math.PI * 2;
		cluster(Math.cos(a) * ring, Math.sin(a) * ring, 18 + Math.floor(Math.random() * 24), 2.4 + Math.random() * 3.2);
	}
	while (placed < count) {
		const ring = 18 + Math.random() * 140;
		const a = Math.random() * Math.PI * 2;
		cluster(Math.cos(a) * ring, Math.sin(a) * ring, 1, 0);
	}
	mesh.instanceMatrix.needsUpdate = true;
	if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
	mesh.count = placed;
	mesh.name = "season-grass";
	return mesh;
}
export function tickGrass(dt) {
	grassTime.value += dt;
}
export function tickSmoke(puffs, dt) {
	for (let i = 0; i < puffs.length; i++) {
		const p = puffs[i];
		p.life += dt * p.speed;
		if (p.life > 1) p.life -= 1;
		p.sprite.position.y = p.base + p.life * 2.3;
		p.sprite.position.x += Math.sin(p.life * 6 + i) * dt * .05;
		const mat = p.sprite.material;
		mat.opacity = Math.sin(p.life * Math.PI) * .28;
		const s = .45 + p.life * 1.15;
		p.sprite.scale.set(s, s, s);
	}
}

export function createWeather(scene: THREE.Scene) {
	const root = new THREE.Group();
	const puffMat = new THREE.MeshLambertMaterial({
		color: "#f4f1ea",
	});
	const clouds: THREE.Group[] = [];
	for (let i = 0; i < 14; i++) {
		const cloud = new THREE.Group();
		const n = 4;
		for (let k = 0; k < n; k++) {
			const blob = new THREE.Mesh(new THREE.SphereGeometry(3.4, 6, 4), puffMat);
			blob.position.set((k - 1.5) * 3.6, 0, (k % 2) * 1.4);
			blob.scale.y = 0.42;
			cloud.add(blob);
		}
		cloud.userData.base = i * 28;
		cloud.userData.speed = 1.1 + (i % 4) * 0.35;
		cloud.userData.z = (i - 7) * 16;
		cloud.userData.y = 16 + (i % 5) * 3.2;
		root.add(cloud);
		clouds.push(cloud);
	}
	const sun = new THREE.Mesh(
		new THREE.SphereGeometry(1.7, 18, 14),
		new THREE.MeshBasicMaterial({ color: "#ffe7b0" }),
	);
	const glow = new THREE.Mesh(
		new THREE.SphereGeometry(3.4, 16, 12),
		new THREE.MeshBasicMaterial({ color: "#ffd27a", transparent: true, opacity: 0.28, depthWrite: false }),
	);
	root.add(sun, glow);
	const count = 2600;
	const rainSpan = 360;
	const rainPos = new Float32Array(count * 3);
	for (let i = 0; i < count; i++) {
		rainPos[i * 3] = (Math.random() - 0.5) * rainSpan;
		rainPos[i * 3 + 1] = Math.random() * 22;
		rainPos[i * 3 + 2] = (Math.random() - 0.5) * rainSpan;
	}
	const rainGeo = new THREE.BufferGeometry();
	rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
	const rain = new THREE.Points(
		rainGeo,
		new THREE.PointsMaterial({ color: "#d5e2ee", size: 0.16, transparent: true, opacity: 0.72, depthWrite: false }),
	);
	rain.visible = false;
	root.add(rain);
	const flash = new THREE.PointLight("#e7f1ff", 0, 240, 1.4);
	flash.name = "storm-flash";
	flash.position.set(0, 24, 0);
	root.add(flash);
	const leafGeo = new THREE.PlaneGeometry(0.16, 0.09);
	const leafMat = new THREE.MeshLambertMaterial({ color: "#d86a22", side: THREE.DoubleSide });
	const leaves = new THREE.InstancedMesh(leafGeo, leafMat, 280);
	const flowerMat = new THREE.MeshLambertMaterial({ color: "#f2d2e6" });
	const flowers = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 5, 4), flowerMat, 220);
	const dummy = new THREE.Object3D();
	const tint = new THREE.Color();
	const leafSpots: { x: number; z: number; ry: number; s: number }[] = [];
	const flowerSpots: { x: number; z: number; ry: number; s: number }[] = [];
	for (let i = 0; i < 280; i++) {
		const a = Math.random() * Math.PI * 2;
		const r = 18 + Math.random() * 138;
		const spot = { x: Math.cos(a) * r, z: Math.sin(a) * r, ry: Math.random() * Math.PI, s: 0.8 + Math.random() * 1.1 };
		leafSpots.push(spot);
		dummy.position.set(spot.x, -4, spot.z);
		dummy.rotation.set(-Math.PI / 2, 0, spot.ry);
		dummy.scale.setScalar(0);
		dummy.updateMatrix();
		leaves.setMatrixAt(i, dummy.matrix);
		tint.setHSL(0.07 + Math.random() * 0.06, 0.7, 0.38 + Math.random() * 0.12);
		leaves.setColorAt(i, tint);
	}
	for (let i = 0; i < 220; i++) {
		const a = Math.random() * Math.PI * 2;
		const r = 18 + Math.random() * 138;
		const spot = { x: Math.cos(a) * r, z: Math.sin(a) * r, ry: Math.random() * Math.PI, s: 0.7 + Math.random() * 1 };
		flowerSpots.push(spot);
		dummy.position.set(spot.x, -4, spot.z);
		dummy.rotation.set(0, spot.ry, 0);
		dummy.scale.setScalar(0);
		dummy.updateMatrix();
		flowers.setMatrixAt(i, dummy.matrix);
		const hue = Math.random() < 0.5 ? 0.95 : Math.random() < 0.5 ? 0.14 : 0.55;
		tint.setHSL(hue, 0.55, 0.62);
		flowers.setColorAt(i, tint);
	}
	leaves.instanceMatrix.needsUpdate = true;
	flowers.instanceMatrix.needsUpdate = true;
	if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
	if (flowers.instanceColor) flowers.instanceColor.needsUpdate = true;
	leaves.visible = false;
	flowers.visible = false;
	const snowCount = 3200;
	const snowSpan = 400;
	const snowPos = new Float32Array(snowCount * 3);
	for (let i = 0; i < snowCount; i++) {
		snowPos[i * 3] = (Math.random() - 0.5) * snowSpan;
		snowPos[i * 3 + 1] = Math.random() * 22;
		snowPos[i * 3 + 2] = (Math.random() - 0.5) * snowSpan;
	}
	const snowGeo = new THREE.BufferGeometry();
	snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
	const snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: "#f7fbff", size: 0.28, transparent: true, opacity: 0.95, depthWrite: false }));
	snow.visible = false;
	root.add(leaves, flowers, snow);
	scene.add(root);
	let snowCaps: THREE.Object3D[] | null = null;
	const seasonColor = new THREE.Color();
	const nextColor = new THREE.Color();
	let painted = -1;
	return {
		update(dt: number, t: number, x: number, z: number) {
			const season = Math.floor(Date.now() / 3600000) % 4;
			const frac = (Date.now() % 3600000) / 3600000;
			const ground = scene.getObjectByName("season-ground") as THREE.Mesh | undefined;
			const gmat = ground?.material as THREE.MeshLambertMaterial | undefined;
			if (gmat) {
				const palette = ["#8fbf62", "#d7e2b8", "#c9843a", "#b7c3a8"];
				seasonColor.set(palette[season] ?? "#8fbf62");
				nextColor.set(palette[(season + 1) % 4] ?? "#8fbf62");
				gmat.color.copy(seasonColor.lerp(nextColor, frac * 0.35));
			}
			const blanket = scene.getObjectByName("snow-blanket") as THREE.Mesh | undefined;
			if (blanket && painted !== season) {
				painted = season;
				const canvas = blanket.userData.canvas as HTMLCanvasElement | undefined;
				const tex = blanket.userData.tex as THREE.Texture | undefined;
				const ctx = canvas?.getContext("2d");
				if (canvas && ctx && tex) {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					if (season === 3) {
						ctx.fillStyle = "rgba(255,255,255,0.9)";
						ctx.fillRect(0, 0, canvas.width, canvas.height);
					}
					tex.needsUpdate = true;
				}
				blanket.visible = season === 3;
			}
			const moat = scene.getObjectByName("moat") as THREE.Mesh | undefined;
			const lakeClock = moat?.material && (moat.material as THREE.Material).userData?.uTime as { value: number } | undefined;
			if (lakeClock) lakeClock.value += dt;
			const wellWater = scene.getObjectByName("well-water") as THREE.Mesh | undefined;
			const wellMat = wellWater?.material as THREE.ShaderMaterial | undefined;
			if (wellMat?.uniforms?.uTime) wellMat.uniforms.uTime.value += dt;
			if (!snowCaps || snowCaps.length === 0) {
				snowCaps = [];
				scene.traverse((obj) => {
					if (obj.name === "snow-cap") snowCaps!.push(obj);
				});
			}
			for (const cap of snowCaps) cap.visible = season === 3;
			const grass = scene.getObjectByName("season-grass") as THREE.Mesh | undefined;
			const grassMat = grass?.material as THREE.MeshLambertMaterial | undefined;
			if (grassMat) {
				const grassTone = ["#7dba62", "#d2c56a", "#d07a32", "#c5d0dc"];
				grassMat.color.set(grassTone[season] ?? "#7dba62");
			}
			const paintSpread = (mesh: THREE.InstancedMesh, spots: { x: number; z: number; ry: number; s: number }[], _salt: number, y: number, flat: boolean, onSeason: boolean) => {
				mesh.visible = onSeason;
				for (let i = 0; i < spots.length; i++) {
					const spot = spots[i]!;
					const on = onSeason && Math.hypot(spot.x, spot.z) > 17;
					dummy.position.set(spot.x, on ? y : -6, spot.z);
					dummy.rotation.set(flat ? -Math.PI / 2 : 0, flat ? 0 : spot.ry, flat ? spot.ry : 0);
					dummy.scale.setScalar(on ? spot.s : 0.001);
					dummy.updateMatrix();
					mesh.setMatrixAt(i, dummy.matrix);
				}
				mesh.instanceMatrix.needsUpdate = true;
			};
			paintSpread(leaves, leafSpots, 2, 0.03, true, season === 2);
			paintSpread(flowers, flowerSpots, season === 1 ? 1 : 0, 0.05, false, season === 0 || season === 1);
			for (const cloud of clouds) {
				const span = 260;
				const drift = (cloud.userData.base as number) + t * (cloud.userData.speed as number);
				const wrapped = ((drift % span) + span) % span - span / 2;
				cloud.position.set(x + wrapped, cloud.userData.y as number, z + (cloud.userData.z as number));
			}
			sun.position.set(x + (season === 1 ? 10 : 16), season === 1 ? 22 : 14, z - 18);
			glow.position.copy(sun.position);
			sun.visible = season === 1 || season === 0;
			glow.visible = sun.visible;
			rain.visible = season === 2;
			snow.visible = season === 3;
			rain.position.set(x, 0, z);
			snow.position.set(x, 0, z);
			if (season === 2) {
				const arr = rainGeo.attributes.position as THREE.BufferAttribute;
				const storm = Math.sin(t * 0.7) > 0.12;
				const fall = storm ? 26 : 14;
				for (let i = 0; i < count; i++) {
					let px = arr.getX(i);
					let py = arr.getY(i) - dt * fall;
					let pz = arr.getZ(i) + dt * (storm ? 6 : 2.2);
					if (py < 0.15 || Math.abs(px) > rainSpan * 0.5 || Math.abs(pz) > rainSpan * 0.5) {
						px = (Math.random() - 0.5) * rainSpan;
						pz = (Math.random() - 0.5) * rainSpan;
						py = 8 + Math.random() * 16;
					}
					arr.setXYZ(i, px, py, pz);
				}
				arr.needsUpdate = true;
				if (storm && Math.random() < dt * 0.55) {
					flash.intensity = 14 + Math.random() * 12;
					flash.position.set(x + (Math.random() - 0.5) * 160, 28, z + (Math.random() - 0.5) * 160);
				}
			}
			if (flash.intensity > 0) flash.intensity = Math.max(0, flash.intensity - dt * 42);
			const fog = scene.fog as THREE.Fog | null;
			if (fog) {
				fog.color.set(season === 3 ? "#c5d0d8" : season === 2 ? "#b7c4c8" : "#b9c3bc");
				fog.near = 55;
				fog.far = 280;
			}
			if (season === 3) {
				const arr = snowGeo.attributes.position as THREE.BufferAttribute;
				for (let i = 0; i < snowCount; i++) {
					let px = arr.getX(i);
					let py = arr.getY(i) - dt * 3.2;
					let pz = arr.getZ(i);
					if (py < 0.2 || Math.abs(px) > snowSpan * 0.5 || Math.abs(pz) > snowSpan * 0.5) {
						px = (Math.random() - 0.5) * snowSpan;
						pz = (Math.random() - 0.5) * snowSpan;
						py = 6 + Math.random() * 16;
					}
					arr.setXYZ(i, px, py, pz);
				}
				arr.needsUpdate = true;
			}
		},
		dispose() {
			scene.remove(root);
		},
	};
}
