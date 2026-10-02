import { o as __toESM } from "../_runtime.mjs";
import { C as Group, Ct as Sprite, D as InstancedMesh, Dt as TorusGeometry, Et as TextureLoader, G as Matrix4, J as MeshLambertMaterial, K as Mesh, Nt as require_jsx_runtime, Ot as Vector2, Pt as require_react, W as MathUtils, X as MeshStandardMaterial, _ as ConeGeometry, _t as ShaderMaterial, b as DodecahedronGeometry, c as BoxGeometry, ct as Points, d as CanvasTexture, dt as Quaternion, f as CapsuleGeometry, gt as SRGBColorSpace, h as Color, ht as RingGeometry, i as PMREMGenerator, kt as Vector3, l as BufferAttribute, lt as PointsMaterial, mt as RepeatWrapping, n as useFrame, nt as Object3D, ot as PlaneGeometry, p as CircleGeometry, pt as Raycaster, q as MeshBasicMaterial, r as useThree, rt as OctahedronGeometry, s as Box3, st as PointLight, t as Canvas, u as BufferGeometry, v as CylinderGeometry, w as IcosahedronGeometry, wt as SpriteMaterial, x as Euler, xt as SphereGeometry } from "../_libs/@react-three/fiber+[...].mjs";
import { B as inWater, C as TREES, G as onPier, I as dryLand, L as faceYaw, M as bridgeName, O as axes, Q as sim, R as groundY, V as input, W as occluded, _ as PLAYER_R, a as DECK_HALF, at as useHud, b as SPAN_IN, c as FISHER_HUT, ct as weaponStyleOf, f as MENTORS, g as PIER_TOP, h as PIER, it as takeCast, j as blocked, l as FISHER_YAW, lt as zoneName, m as MOAT_OUT, n as CHIMNEYS, nt as slide, o as DECK_TOP, ot as useRpg, p as MOAT_IN, u as HOUSES, v as RAIL_T, w as VEINS, x as SPAN_OUT, z as held } from "./middleware-SMghQq71.mjs";
import { C as presence, S as takeRemoteHits, _ as sendReward, a as subscribeGfx, b as takeLoot, c as sendDuelHit, d as amHost, f as emitHit, g as pushMobState, h as placeLoot, i as readGfx, l as setSelection, m as fieldMobs, n as autoQuality, o as chatBubbles, p as fieldLoot, r as loadGfx, s as readTarget, u as takePick, v as setLootHint, w as remotes, x as takePendingDrops, y as shareXp } from "./routes-DLbGz1vi.mjs";
import { n as clone, t as GLTFLoader } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/VillageScene-DFcguDUF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function std(color, _rough = .6, _metal = .05) {
	return new MeshLambertMaterial({ color });
}
function bar() {
	const g = new Group();
	const bg = new Mesh(new PlaneGeometry(.9, .08), new MeshBasicMaterial({
		color: "#1c1916",
		depthTest: false
	}));
	const fill = new Mesh(new PlaneGeometry(.86, .05), new MeshBasicMaterial({
		color: "#b5443c",
		depthTest: false
	}));
	fill.position.z = .01;
	g.add(bg, fill);
	g.userData.fill = fill;
	return g;
}
function setBar(g, _ratio, _cam) {
	g.visible = false;
}
function label(text) {
	const canvas = document.createElement("canvas");
	canvas.width = 256;
	canvas.height = 64;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.fillStyle = "rgba(28,25,22,0.72)";
		ctx.fillRect(16, 8, 224, 48);
		ctx.fillStyle = "#f3efe8";
		ctx.font = "28px sans-serif";
		ctx.textAlign = "center";
		ctx.fillText(text, 128, 42);
	}
	const map = new CanvasTexture(canvas);
	map.colorSpace = SRGBColorSpace;
	const sprite = new Sprite(new SpriteMaterial({
		map,
		transparent: true,
		depthWrite: false
	}));
	sprite.scale.set(1.4, .35, 1);
	return sprite;
}
function adoptDummy(root) {
	const body = root.userData.body ?? root;
	const hpBar = bar();
	hpBar.position.y = 2.2;
	root.add(hpBar);
	return {
		root,
		body,
		bar: hpBar,
		hp: 220,
		hpMax: 220,
		alive: true,
		shake: 0,
		respawn: 0
	};
}
function hitDummy(d, dmg) {
	if (!d.alive) return;
	d.hp = Math.max(0, d.hp - dmg);
	d.shake = .38;
	if (d.hp <= 0) {
		d.alive = false;
		d.respawn = 5;
	}
}
function tickDummy(d, dt, cam) {
	if (d.shake > 0) {
		d.shake -= dt;
		d.body.rotation.z = Math.sin(d.shake * 48) * d.shake * .7;
		d.body.position.x = Math.sin(d.shake * 54) * d.shake * .2;
	} else if (d.alive) {
		d.body.rotation.z = 0;
		d.body.position.x = 0;
	}
	if (!d.alive) {
		d.body.rotation.x = Math.min(1.2, d.body.rotation.x + dt * 2);
		d.respawn -= dt;
		if (d.respawn <= 0) {
			d.hp = d.hpMax;
			d.alive = true;
			d.body.rotation.set(0, 0, 0);
			d.body.position.set(0, 0, 0);
		}
	}
	setBar(d.bar, d.alive ? d.hp / d.hpMax : 0, cam);
}
function person(cloth, skin, hair) {
	const hips = new Group();
	hips.position.y = .96;
	const tunic = std(cloth, .78);
	const flesh = std(skin, .58);
	const dark = std("#2a241e", .75);
	const pelvis = new Mesh(new SphereGeometry(.14, 14, 12), tunic);
	pelvis.scale.set(1.25, .72, .95);
	pelvis.castShadow = true;
	const torso = new Mesh(new CapsuleGeometry(.17, .28, 6, 12), tunic);
	torso.position.y = .3;
	torso.castShadow = true;
	const chest = new Mesh(new SphereGeometry(.16, 14, 12), tunic);
	chest.position.y = .44;
	chest.scale.set(1.28, .78, .82);
	chest.castShadow = true;
	const shoulderPad = (side) => {
		const pad = new Mesh(new SphereGeometry(.075, 10, 8), tunic);
		pad.position.set(side * .2, .46, 0);
		pad.scale.set(1.15, .75, .9);
		pad.castShadow = true;
		return pad;
	};
	const neck = new Mesh(new CylinderGeometry(.05, .058, .09, 10), flesh);
	neck.position.y = .62;
	const head = new Mesh(new SphereGeometry(.118, 18, 14), flesh);
	head.position.y = .77;
	head.scale.set(.92, 1.08, .96);
	head.castShadow = true;
	const hairCap = new Mesh(new SphereGeometry(.124, 16, 12, 0, Math.PI * 2, 0, Math.PI * .55), std(hair, .85));
	hairCap.position.y = .8;
	const eyeGeo = new SphereGeometry(.014, 8, 6);
	const eyeMat = std("#1a1412", .35);
	const eyeL = new Mesh(eyeGeo, eyeMat);
	eyeL.position.set(-.04, .79, .1);
	const eyeR = eyeL.clone();
	eyeR.position.x = .04;
	const nose = new Mesh(new SphereGeometry(.016, 8, 6), flesh);
	nose.position.set(0, .75, .112);
	nose.scale.set(.7, 1.15, .8);
	const mouth = new Mesh(new BoxGeometry(.045, .008, .012), std("#8d5348", .6));
	mouth.position.set(0, .71, .108);
	const brow = new Mesh(new BoxGeometry(.1, .012, .016), std(hair, .8));
	brow.position.set(0, .83, .09);
	const ear = (side) => {
		const e = new Mesh(new SphereGeometry(.026, 8, 6), flesh);
		e.position.set(side * .108, .76, 0);
		e.scale.set(.42, 1, .65);
		return e;
	};
	const arm = (side) => {
		const g = new Group();
		g.position.set(side * .24, .44, 0);
		const upper = new Mesh(new CapsuleGeometry(.055, .16, 4, 8), flesh);
		upper.position.y = -.16;
		upper.castShadow = true;
		const fore = new Mesh(new CapsuleGeometry(.044, .15, 4, 8), flesh);
		fore.position.y = -.36;
		fore.castShadow = true;
		const hand = new Mesh(new BoxGeometry(.07, .045, .08), flesh);
		hand.position.set(0, -.48, .01);
		const sleeve = new Mesh(new CylinderGeometry(.068, .074, .12, 8), tunic);
		sleeve.position.y = -.05;
		g.add(upper, fore, hand, sleeve);
		return g;
	};
	const leg = (side) => {
		const g = new Group();
		g.position.set(side * .09, -.02, 0);
		const thigh = new Mesh(new CapsuleGeometry(.075, .2, 4, 8), tunic);
		thigh.position.y = -.18;
		thigh.castShadow = true;
		const shin = new Mesh(new CapsuleGeometry(.052, .2, 4, 8), dark);
		shin.position.y = -.46;
		shin.castShadow = true;
		const foot = new Mesh(new BoxGeometry(.1, .05, .2), std("#241c18", .7));
		foot.position.set(0, -.62, .04);
		foot.castShadow = true;
		g.add(thigh, shin, foot);
		return g;
	};
	const belt = new Mesh(new BoxGeometry(.3, .05, .18), std("#8a7040", .45, .35));
	belt.position.y = .08;
	const armR = arm(-1);
	const armL = arm(1);
	hips.add(pelvis, torso, chest, shoulderPad(-1), shoulderPad(1), neck, head, hairCap, eyeL, eyeR, nose, mouth, brow, ear(-1), ear(1), belt, armL, armR, leg(-1), leg(1));
	return {
		hips,
		armR,
		head
	};
}
function createVendor(kind, x, z, yaw) {
	const root = new Group();
	root.position.set(x, 0, z);
	root.rotation.y = yaw;
	const made = kind === "smith" ? person("#5a3030", "#c4a07a", "#2a211c") : person("#2f4a3c", "#d2b090", "#1e2428");
	if (kind === "smith") {
		const apron = new Mesh(new BoxGeometry(.22, .28, .04), std("#6a4a32", .85));
		apron.position.set(0, .22, .12);
		made.hips.add(apron);
		const beard = new Mesh(new ConeGeometry(.04, .1, 6), std("#3a2e28", .9));
		beard.position.set(0, .58, .09);
		made.hips.add(beard);
	} else {
		const hood = new Mesh(new SphereGeometry(.13, 12, 8, 0, Math.PI * 2, 0, Math.PI * .5), std("#24362e", .75));
		hood.position.y = .76;
		made.hips.add(hood);
		const crate = new Mesh(new BoxGeometry(.42, .28, .34), std("#6a4a2c", .86));
		crate.position.set(.55, .16, .2);
		crate.castShadow = true;
		root.add(crate);
	}
	root.add(made.hips);
	let hammer = null;
	if (kind === "smith") {
		hammer = new Mesh(new BoxGeometry(.08, .22, .08), std("#9aa0a6", .35, .75));
		const handle = new Mesh(new CylinderGeometry(.015, .015, .28, 6), std("#5a3d22", .8));
		handle.position.y = -.18;
		hammer.add(handle);
		hammer.position.set(0, -.5, .06);
		made.armR.add(hammer);
	}
	const tag = label(kind === "smith" ? "Demirci" : "Gece Satıcısı");
	tag.position.y = 1.95;
	root.add(tag);
	const stand = weaponStand();
	stand.position.set(kind === "smith" ? .95 : -.95, 0, .15);
	root.add(stand);
	return {
		root,
		hips: made.hips,
		armR: made.armR,
		hammer,
		kind
	};
}
var CLASS_CLOTH = {
	savasci: "#6a3030",
	okcu: "#3d5a32",
	ninja: "#2c2c3c",
	buyucu: "#3a3058"
};
function createMentor(name, x, z, yaw, cls) {
	const root = new Group();
	root.position.set(x, 0, z);
	root.rotation.y = yaw;
	const made = person(CLASS_CLOTH[cls] ?? "#3a3430", "#d2b090", "#1c1916");
	root.add(made.hips);
	const tag = label(name);
	tag.position.y = 1.95;
	root.add(tag);
	return {
		root,
		hips: made.hips,
		name
	};
}
function createTownsman(name, x, z, yaw, cloth, spear = false) {
	const root = new Group();
	root.position.set(x, 0, z);
	root.rotation.y = yaw;
	const made = person(cloth, "#d2b090", "#1c1916");
	root.add(made.hips);
	if (spear) {
		const pole = new Mesh(new CylinderGeometry(.015, .018, 1.35, 6), std("#6a5340", .7));
		pole.position.set(.16, .7, .08);
		const tip = new Mesh(new ConeGeometry(.04, .16, 6), std("#d5dbe3", .3, .7));
		tip.position.y = .74;
		pole.add(tip);
		made.hips.add(pole);
	}
	const tag = label(name);
	tag.position.y = 1.95;
	root.add(tag);
	return {
		root,
		hips: made.hips,
		name
	};
}
function tickVendor(v, t) {
	if (v.kind === "smith") {
		const swing = (Math.sin(t * 6.5) + 1) * .5;
		v.hips.rotation.x = Math.sin(t * 6.5) * .05;
		v.armR.rotation.x = -.15 - swing * 1.15;
	} else {
		v.hips.rotation.y = Math.sin(t * .7) * .08;
		v.armR.rotation.x = Math.sin(t * .6) * .06;
	}
}
var SPECIES = [
	{
		id: "rat",
		name: "Tarla Faresi",
		level: 1,
		hp: 36,
		tint: "#6d5644",
		belly: "#d7c4a4",
		scale: .42,
		form: "quad",
		speed: 1.7
	},
	{
		id: "hare",
		name: "Bozkır Tavşanı",
		level: 3,
		hp: 48,
		tint: "#c4b39a",
		belly: "#f2ead8",
		scale: .5,
		form: "quad",
		speed: 2.1
	},
	{
		id: "wolf",
		name: "Gece Kurdu",
		level: 5,
		hp: 70,
		tint: "#2a2430",
		belly: "#4a3a40",
		scale: .92,
		form: "quad",
		speed: 2.05
	},
	{
		id: "frog",
		name: "Bataklık Kurbağası",
		level: 8,
		hp: 90,
		tint: "#3d6a3a",
		belly: "#d7d2a4",
		scale: .7,
		form: "bulky",
		speed: 1.3
	},
	{
		id: "jackal",
		name: "Çakal",
		level: 11,
		hp: 110,
		tint: "#8a6a3e",
		belly: "#e6d2a4",
		scale: .82,
		form: "quad",
		speed: 2.2
	},
	{
		id: "boar",
		name: "Yaban Domuzu",
		level: 14,
		hp: 160,
		tint: "#5a4034",
		belly: "#c4a080",
		scale: 1.05,
		form: "bulky",
		speed: 1.7
	},
	{
		id: "spider",
		name: "Mağara Örümceği",
		level: 17,
		hp: 140,
		tint: "#2c2420",
		belly: "#6a3030",
		scale: .85,
		form: "spider",
		speed: 1.85
	},
	{
		id: "scorp",
		name: "Bozkır Akrebi",
		level: 20,
		hp: 170,
		tint: "#6a4a28",
		belly: "#c4a060",
		scale: .9,
		form: "scorpion",
		speed: 1.55
	},
	{
		id: "bear",
		name: "Orman Ayısı",
		level: 24,
		hp: 240,
		tint: "#3a2a22",
		belly: "#6a5344",
		scale: 1.25,
		form: "bulky",
		speed: 1.45
	},
	{
		id: "skel",
		name: "İskelet Asker",
		level: 28,
		hp: 200,
		tint: "#d9d3c4",
		belly: "#b7b0a2",
		scale: 1,
		form: "biped",
		speed: 1.6
	},
	{
		id: "snake",
		name: "Bataklık Yılanı",
		level: 32,
		hp: 190,
		tint: "#2f5a3a",
		belly: "#d8d2a0",
		scale: 1,
		form: "snake",
		speed: 1.7
	},
	{
		id: "goat",
		name: "Dağ Tekesi",
		level: 36,
		hp: 230,
		tint: "#8a8274",
		belly: "#efe6d4",
		scale: 1.05,
		form: "quad",
		speed: 1.8
	},
	{
		id: "bandit",
		name: "Harabe Haydutu",
		level: 40,
		hp: 250,
		tint: "#4a3428",
		belly: "#c4a07a",
		scale: 1,
		form: "biped",
		speed: 1.7
	},
	{
		id: "golem",
		name: "Taş Golem",
		level: 44,
		hp: 340,
		tint: "#7a756c",
		belly: "#9a9488",
		scale: 1.35,
		form: "golem",
		speed: 1.15
	},
	{
		id: "bat",
		name: "Gece Yarasa",
		level: 48,
		hp: 210,
		tint: "#241820",
		belly: "#5a3040",
		scale: .85,
		form: "bat",
		speed: 2.3
	},
	{
		id: "wraith",
		name: "Buz Ruhu",
		level: 52,
		hp: 240,
		tint: "#9fd0e0",
		belly: "#e8f4f8",
		scale: 1.05,
		form: "wraith",
		speed: 1.65
	},
	{
		id: "ifrit",
		name: "Ateş İfriti",
		level: 56,
		hp: 280,
		tint: "#8a3018",
		belly: "#f0a050",
		scale: 1.1,
		form: "biped",
		speed: 1.7
	},
	{
		id: "knight",
		name: "Gölge Şövalye",
		level: 62,
		hp: 340,
		tint: "#2a3140",
		belly: "#8a7040",
		scale: 1.15,
		form: "biped",
		speed: 1.55
	},
	{
		id: "drake",
		name: "Kemik Ejderi",
		level: 70,
		hp: 420,
		tint: "#cfc6b4",
		belly: "#8a4030",
		scale: 1.35,
		form: "drake",
		speed: 1.6
	},
	{
		id: "night",
		name: "Sonsuz Gece",
		level: 80,
		hp: 560,
		tint: "#120814",
		belly: "#3a1848",
		scale: 1.5,
		form: "drake",
		speed: 1.7
	}
];
function mesh(geo, mat) {
	const m = new Mesh(geo, mat);
	m.castShadow = true;
	return m;
}
function buildCreature(spec) {
	const hide = std(spec.tint, .62, spec.form === "wraith" ? .25 : .08);
	const soft = std(spec.belly, .75);
	const bone = std("#efe6d4", .4);
	const eyeMat = new MeshStandardMaterial({
		color: "#ffb45a",
		emissive: "#ff6a12",
		emissiveIntensity: .8
	});
	const body = new Group();
	const head = new Group();
	const legs = [];
	const jaw = new Object3D();
	const leg = (x, z, len = .55) => {
		const g = new Group();
		g.position.set(x, .62, z);
		g.add(mesh(new CapsuleGeometry(.06, len, 4, 6), hide));
		const paw = mesh(new SphereGeometry(.07, 8, 6), std("#1a1410", .8));
		paw.position.y = -len * .62;
		g.add(paw);
		legs.push(g);
		return g;
	};
	if (spec.form === "spider") {
		const belly = mesh(new SphereGeometry(.38, 16, 12), hide);
		belly.position.y = .55;
		belly.scale.set(1.15, .75, 1.3);
		const abdomen = mesh(new SphereGeometry(.32, 14, 10), soft);
		abdomen.position.set(-.42, .48, 0);
		head.position.set(.42, .5, 0);
		head.add(mesh(new SphereGeometry(.16, 12, 10), hide));
		for (const z of [-.08, .08]) {
			const eye = mesh(new SphereGeometry(.03, 6, 6), eyeMat);
			eye.position.set(.12, .04, z);
			head.add(eye);
		}
		body.add(belly, abdomen, head);
		for (let i = 0; i < 8; i++) {
			const side = i < 4 ? 1 : -1;
			const along = i % 4 - 1.5;
			body.add(leg(along * .12, side * .28, .48));
		}
	} else if (spec.form === "scorpion") {
		const shell = mesh(new CapsuleGeometry(.22, .7, 5, 8), hide);
		shell.rotation.z = Math.PI / 2;
		shell.position.y = .42;
		head.position.set(.48, .42, 0);
		const claw = (z) => {
			const c = mesh(new BoxGeometry(.16, .06, .1), bone);
			c.position.set(.18, 0, z);
			return c;
		};
		head.add(mesh(new SphereGeometry(.12, 10, 8), hide), claw(.12), claw(-.12));
		const tail = mesh(new CapsuleGeometry(.05, .7, 4, 6), hide);
		tail.position.set(-.45, .85, 0);
		tail.rotation.z = 1.1;
		const sting = mesh(new ConeGeometry(.04, .16, 5), bone);
		sting.position.set(-.78, 1.15, 0);
		body.add(shell, head, tail, sting, leg(.2, .2, .32), leg(.2, -.2, .32), leg(-.15, .2, .32), leg(-.15, -.2, .32));
	} else if (spec.form === "snake") {
		for (let i = 0; i < 6; i++) {
			const seg = mesh(new SphereGeometry(.16 - i * .012, 10, 8), i % 2 ? soft : hide);
			seg.position.set(-i * .22, .18, Math.sin(i) * .05);
			seg.scale.set(1.3, .7, .7);
			body.add(seg);
		}
		head.position.set(.28, .22, 0);
		const skull = mesh(new SphereGeometry(.14, 12, 10), hide);
		skull.scale.set(1.4, .7, .8);
		jaw.position.set(.08, -.04, 0);
		head.add(skull, jaw);
		const eye = mesh(new SphereGeometry(.025, 6, 6), eyeMat);
		eye.position.set(.1, .04, .07);
		head.add(eye, eye.clone().translateZ(-.14));
		body.add(head);
	} else if (spec.form === "biped") {
		const torso = mesh(new CapsuleGeometry(.22, .45, 5, 8), hide);
		torso.position.y = 1.05;
		head.position.set(0, 1.55, 0);
		const skull = mesh(new SphereGeometry(.16, 12, 10), spec.id === "skel" ? bone : hide);
		jaw.position.set(0, -.08, .04);
		head.add(skull, jaw);
		const eye = mesh(new SphereGeometry(.025, 6, 6), eyeMat);
		eye.position.set(.08, .02, .1);
		head.add(eye);
		const arm = (x) => {
			const g = new Group();
			g.position.set(x, 1.25, 0);
			g.add(mesh(new CapsuleGeometry(.05, .4, 4, 6), hide));
			legs.push(g);
			return g;
		};
		body.add(torso, head, arm(.28), arm(-.28), leg(.1, 0, .7), leg(-.1, 0, .7));
	} else if (spec.form === "bat") {
		const torso = mesh(new SphereGeometry(.22, 12, 10), hide);
		torso.position.y = .7;
		head.position.set(.18, .82, 0);
		head.add(mesh(new SphereGeometry(.12, 10, 8), hide));
		const wing = (z) => {
			const w = mesh(new CircleGeometry(.45, 3), hide);
			w.position.set(-.05, .75, z);
			w.rotation.y = z > 0 ? .6 : -.6;
			return w;
		};
		body.add(torso, head, wing(.15), wing(-.15), leg(.05, .08, .28), leg(.05, -.08, .28));
	} else if (spec.form === "golem") {
		const torso = mesh(new DodecahedronGeometry(.42, 0), hide);
		torso.position.y = .95;
		torso.scale.set(1.1, 1.25, .8);
		head.position.set(0, 1.55, 0);
		head.add(mesh(new BoxGeometry(.28, .24, .24), soft));
		const eye = mesh(new SphereGeometry(.04, 6, 6), eyeMat);
		eye.position.set(.08, 0, .1);
		head.add(eye, eye.clone().translateZ(-.2));
		body.add(torso, head, leg(.18, 0, .7), leg(-.18, 0, .7));
	} else if (spec.form === "wraith") {
		const cloak = mesh(new ConeGeometry(.38, 1.3, 10), hide);
		cloak.position.y = .7;
		head.position.set(0, 1.35, 0);
		head.add(mesh(new SphereGeometry(.14, 12, 10), soft));
		const eye = mesh(new SphereGeometry(.03, 6, 6), eyeMat);
		eye.position.set(.06, 0, .1);
		head.add(eye);
		body.add(cloak, head);
	} else if (spec.form === "drake") {
		const torso = mesh(new CapsuleGeometry(.28, 1.1, 6, 10), hide);
		torso.rotation.z = Math.PI / 2;
		torso.position.y = .85;
		head.position.set(.85, 1.05, 0);
		const skull = mesh(new SphereGeometry(.2, 12, 10), hide);
		skull.scale.set(1.3, .8, .75);
		const snout = mesh(new ConeGeometry(.08, .28, 6), hide);
		snout.rotation.z = -Math.PI / 2;
		snout.position.set(.28, 0, 0);
		jaw.position.set(.1, -.08, 0);
		head.add(skull, snout, jaw);
		const wing = (z) => {
			const w = mesh(new ConeGeometry(.08, .7, 4), soft);
			w.position.set(-.1, 1.15, z);
			w.rotation.z = z > 0 ? -.8 : .8;
			w.rotation.y = z > 0 ? .4 : -.4;
			return w;
		};
		const tail = mesh(new CapsuleGeometry(.06, .8, 4, 6), hide);
		tail.position.set(-.9, .7, 0);
		tail.rotation.z = .5;
		body.add(torso, head, wing(.2), wing(-.2), tail, leg(.35, .18, .5), leg(.35, -.18, .5), leg(-.3, .16, .45), leg(-.3, -.16, .45));
	} else {
		const girth = spec.form === "bulky" ? .42 : .28;
		const torso = mesh(new CapsuleGeometry(girth, spec.form === "bulky" ? .85 : .7, 6, 10), hide);
		torso.rotation.z = Math.PI / 2;
		torso.position.y = spec.form === "bulky" ? .78 : .7;
		const chest = mesh(new SphereGeometry(girth * .95, 12, 10), hide);
		chest.position.set(.28, torso.position.y, 0);
		const gut = mesh(new SphereGeometry(.16, 10, 8), soft);
		gut.position.set(0, torso.position.y - .22, 0);
		gut.scale.set(1.4, .5, .8);
		head.position.set(.62, torso.position.y + .08, 0);
		const skull = mesh(new SphereGeometry(.16, 12, 10), hide);
		skull.scale.set(1.15, .85, .8);
		const snout = mesh(new CapsuleGeometry(.05, .14, 3, 6), hide);
		snout.rotation.z = Math.PI / 2;
		snout.position.set(.16, -.02, 0);
		jaw.position.set(.1, -.08, 0);
		head.add(skull, snout, jaw);
		const eye = mesh(new SphereGeometry(.028, 6, 6), eyeMat);
		eye.position.set(.08, .04, .08);
		head.add(eye, eye.clone().translateZ(-.16));
		if (spec.id === "goat" || spec.id === "boar") {
			const horn = mesh(new ConeGeometry(.04, .22, 5), bone);
			horn.position.set(-.02, .16, .08);
			horn.rotation.z = -.5;
			const horn2 = horn.clone();
			horn2.position.z = -.08;
			head.add(horn, horn2);
		}
		if (spec.id === "hare") {
			const ear = mesh(new CapsuleGeometry(.03, .22, 3, 5), hide);
			ear.position.set(-.04, .22, .06);
			head.add(ear, ear.clone().translateZ(-.12));
		}
		const tail = mesh(new CapsuleGeometry(.04, .28, 3, 5), hide);
		tail.position.set(-.55, torso.position.y, 0);
		tail.rotation.z = .6;
		body.add(torso, chest, gut, head, tail, leg(.22, .16), leg(.22, -.16), leg(-.22, .16), leg(-.22, -.16));
	}
	body.scale.setScalar(spec.scale);
	return {
		body,
		head,
		jaw,
		legs
	};
}
function mobHpFor(level, weight = 1) {
	const hit = 30 + Math.max(0, level - 1) * 1.3;
	const hits = 4 + level * .15;
	return Math.max(48, Math.round(hit * hits * weight));
}
function mitigate(mobLevel, playerLevel, dmg) {
	const gap = mobLevel - playerLevel;
	let mult = 1;
	if (gap > 0) mult = Math.max(.08, 1 - gap * .028);
	else if (gap < 0) mult = Math.min(2.2, 1 + -gap * .035);
	return Math.max(1, Math.round(dmg * mult));
}
function mobBite(mobLevel, playerLevel, playerHp) {
	const gap = mobLevel - playerLevel;
	let ratio = .13;
	if (gap > 0) ratio = Math.min(1.65, .13 * Math.pow(1.05, gap));
	else if (gap < 0) ratio = Math.max(.015, .13 * Math.pow(.9, -gap));
	const jitter = .92 + Math.random() * .16;
	return Math.max(1, Math.round(Math.max(1, playerHp) * ratio * jitter));
}
function createBeast(x, z, id = "beast", pack = 0, spec = SPECIES[2]) {
	const root = new Group();
	root.position.set(x, 0, z);
	const made = buildCreature(spec);
	const hpBar = bar();
	hpBar.position.y = 1.55 * spec.scale + .35;
	const tag = label(`${spec.name} · Sv.${spec.level}`);
	tag.position.y = hpBar.position.y + .28;
	tag.visible = false;
	hpBar.visible = false;
	root.add(made.body, hpBar, tag);
	const weight = .8 + Math.min(.55, (spec.hp || 40) / 1200);
	const hp = mobHpFor(spec.level, weight);
	return {
		id,
		pack,
		name: spec.name,
		level: spec.level,
		speed: spec.speed,
		root,
		bar: hpBar,
		hp,
		hpMax: hp,
		alive: true,
		anger: false,
		homeX: x,
		homeZ: z,
		yaw: Math.random() * Math.PI * 2,
		phase: Math.random() * 4,
		shake: 0,
		cool: 0,
		respawn: 0,
		slow: 0,
		poison: 0,
		poisonDps: 0,
		legs: made.legs,
		head: made.head,
		jaw: made.jaw,
		body: made.body
	};
}
function damp(cur, target, lambda, dt) {
	return cur + Math.atan2(Math.sin(target - cur), Math.cos(target - cur)) * (1 - Math.exp(-lambda * dt));
}
var VILLAGE_EDGE = 67;
function stepOutside(b, nx, nz) {
	if (Math.hypot(nx, nz) >= VILLAGE_EDGE) {
		b.root.position.x = nx;
		b.root.position.z = nz;
		return;
	}
	if (Math.hypot(b.root.position.x, b.root.position.z) >= VILLAGE_EDGE) return;
	const push = Math.hypot(nx, nz) || 1;
	b.root.position.x = nx / push * VILLAGE_EDGE;
	b.root.position.z = nz / push * VILLAGE_EDGE;
}
function tickBeast(b, dt, px, pz, cam, puppet = false) {
	setBar(b.bar, b.alive ? b.hp / b.hpMax : 0, cam);
	if (!b.alive) {
		b.root.rotation.x = Math.min(1.25, b.root.rotation.x + dt * 1.5);
		return false;
	}
	if (puppet) {
		b.phase += dt * (b.anger ? 1 : .35);
		if (b.anger) {
			const face = Math.atan2(px - b.root.position.x, pz - b.root.position.z);
			b.yaw = damp(b.yaw, face, 3.2, dt);
			b.root.rotation.y = b.yaw - Math.PI / 2;
			const step = Math.sin(b.phase * 8);
			b.legs.forEach((leg, i) => {
				const sign = i % 2 === 0 ? 1 : -1;
				const pair = i < 2 ? 1 : -1;
				leg.rotation.z = step * sign * pair * .4;
			});
		}
		return false;
	}
	const dx = px - b.root.position.x;
	const dz = pz - b.root.position.z;
	const dist = Math.hypot(dx, dz);
	b.phase += dt * (b.anger && dist < 11 ? 1 : .35);
	b.slow = Math.max(0, b.slow - dt);
	const pace = b.speed * (b.slow > 0 ? .45 : 1);
	if (b.shake > 0) {
		b.shake -= dt;
		b.body.position.y = Math.sin(b.shake * 40) * .05;
	} else b.body.position.y = 0;
	if (!b.anger) {
		const tx = b.homeX + Math.cos(b.phase * .37) * 2.3;
		const tz = b.homeZ + Math.sin(b.phase * .29) * 2.3;
		const mx = tx - b.root.position.x;
		const mz = tz - b.root.position.z;
		const dist = Math.hypot(mx, mz) || .001;
		const face = Math.atan2(mx, mz);
		b.yaw = damp(b.yaw, face, 2.4, dt);
		b.root.rotation.y = b.yaw - Math.PI / 2;
		const step = Math.min(dist, pace * .72 * dt);
		const nx = b.root.position.x + mx / dist * step;
		const nz = b.root.position.z + mz / dist * step;
		if (Math.hypot(nx - b.homeX, nz - b.homeZ) <= 2.55) stepOutside(b, nx, nz);
		const stride = Math.sin(b.phase * 7);
		b.legs.forEach((leg, i) => {
			const sign = i % 2 === 0 ? 1 : -1;
			const pair = i < 2 ? 1 : -1;
			leg.rotation.z = stride * sign * pair * .38;
		});
		b.head.rotation.z *= .85;
		b.jaw.rotation.z *= .8;
		return false;
	}
	const face = Math.atan2(dx, dz);
	b.cool = Math.max(0, b.cool - dt);
	const chasing = dist < 8 && dist > 1.55;
	if (chasing) {
		b.yaw = damp(b.yaw, face, 3.4, dt);
		b.root.rotation.y = b.yaw - Math.PI / 2;
		const sp = pace;
		stepOutside(b, b.root.position.x + Math.sin(b.yaw) * sp * dt, b.root.position.z + Math.cos(b.yaw) * sp * dt);
	} else if (b.alive) b.root.rotation.y = b.yaw - Math.PI / 2;
	const step = chasing ? Math.sin(b.phase * 8) : Math.sin(b.phase * 1.4) * .25;
	b.legs.forEach((leg, i) => {
		const sign = i % 2 === 0 ? 1 : -1;
		const pair = i < 2 ? 1 : -1;
		leg.rotation.z = step * sign * pair * .55;
	});
	if (dist < 1.75) {
		b.yaw = damp(b.yaw, face, 6, dt);
		b.root.rotation.y = b.yaw - Math.PI / 2;
		const lunge = Math.max(0, Math.sin(b.phase * 8));
		b.head.rotation.z = -lunge * .45;
		b.jaw.rotation.z = lunge * .55;
		if (b.cool <= 0) {
			b.cool = 1.15;
			return true;
		}
	} else {
		b.head.rotation.z *= .85;
		b.jaw.rotation.z *= .85;
	}
	return false;
}
function hitBeast(b, dmg) {
	if (!b.alive) return;
	b.hp = Math.max(0, b.hp - dmg);
	b.shake = .28;
	if (b.hp <= 0) {
		b.alive = false;
		b.respawn = 7;
	}
}
function itemId(value) {
	if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id;
	return value ? "gece-weapon" : "";
}
function weaponMesh(style) {
	const g = new Group();
	if (style === "bow") {
		const wood = std("#6b4423", .62, .08);
		const upper = new Mesh(new CylinderGeometry(.01, .014, .52, 6), wood);
		upper.position.set(0, .3, -.04);
		upper.rotation.x = .42;
		const lower = new Mesh(new CylinderGeometry(.014, .01, .52, 6), wood);
		lower.position.set(0, -.3, -.04);
		lower.rotation.x = -.42;
		const grip = new Mesh(new CylinderGeometry(.02, .02, .16, 8), std("#2a1c12", .7));
		const string = new Mesh(new BoxGeometry(.008, .92, .008), std("#efe6d4", .4));
		string.name = "bow-string";
		string.position.set(0, 0, .1);
		const nock = new Group();
		nock.name = "nocked";
		const shaft = new Mesh(new CylinderGeometry(.007, .007, .55, 5), std("#6b4a2a", .7));
		shaft.rotation.x = Math.PI / 2;
		const tip = new Mesh(new ConeGeometry(.016, .08, 6), std("#d5dbe3", .3, .6));
		tip.rotation.x = Math.PI / 2;
		tip.position.z = -.3;
		nock.add(shaft, tip);
		nock.position.set(0, .02, .1);
		g.add(upper, lower, grip, string, nock);
		g.position.set(.02, .04, .02);
		g.rotation.z = .08;
	} else if (style === "staff") {
		const shaft = new Mesh(new CylinderGeometry(.018, .022, 1.05, 8), std("#4a3424", .72));
		shaft.position.y = .22;
		const gem = new Mesh(new OctahedronGeometry(.045, 0), std("#7eb6ff", .25, .35));
		gem.position.y = .78;
		const collar = new Mesh(new CylinderGeometry(.028, .028, .04, 8), std(GOLD, .35, .6));
		collar.position.y = .68;
		const butt = new Mesh(new SphereGeometry(.026, 8, 6), std(GOLD, .35, .55));
		butt.position.y = -.32;
		g.add(shaft, gem, collar, butt);
		g.position.set(.015, -.02, .02);
		g.rotation.x = .15;
	} else if (style === "dagger") {
		const blade = new Mesh(new BoxGeometry(.022, .22, .008), std("#d5dbe3", .22, .86));
		blade.position.y = .16;
		const guard = new Mesh(new BoxGeometry(.07, .012, .02), std(GOLD, .35, .6));
		guard.position.y = .045;
		const grip = new Mesh(new CylinderGeometry(.012, .014, .08, 8), std("#2c2118", .7));
		g.add(blade, guard, grip);
		g.position.set(0, .07, .015);
		g.rotation.x = -.35;
	} else if (style === "pala") {
		const blade = new Mesh(new BoxGeometry(.07, 1.15, .02), std("#c5ccd4", .25, .8));
		blade.position.y = -.42;
		const edge = new Mesh(new BoxGeometry(.012, 1.05, .006), std("#f4f7fb", .18, .9));
		edge.position.set(.03, -.42, 0);
		const guard = new Mesh(new BoxGeometry(.16, .02, .04), std(GOLD, .35, .6));
		guard.position.y = .12;
		const grip = new Mesh(new CylinderGeometry(.018, .02, .22, 8), std("#3a2a1a", .75));
		grip.position.y = .22;
		const pommel = new Mesh(new SphereGeometry(.026, 8, 6), std(GOLD, .35, .55));
		pommel.position.y = .36;
		g.add(blade, edge, guard, grip, pommel);
		g.position.set(.02, -.02, .03);
	} else {
		const blade = new Mesh(new BoxGeometry(.035, .52, .01), std("#d5dbe3", .28, .82));
		blade.position.y = .36;
		const edge = new Mesh(new BoxGeometry(.008, .46, .004), std("#f4f7fb", .2, .9));
		edge.position.set(.014, .36, 0);
		const guard = new Mesh(new BoxGeometry(.12, .014, .028), std(GOLD, .35, .65));
		guard.position.y = .08;
		const grip = new Mesh(new CylinderGeometry(.014, .016, .1, 8), std("#3a2a1a", .75));
		const pommel = new Mesh(new SphereGeometry(.02, 8, 6), std(GOLD, .35, .6));
		pommel.position.y = -.07;
		g.add(blade, edge, guard, grip, pommel);
		g.position.set(0, .08, .01);
		g.rotation.x = -.2;
	}
	return g;
}
function weaponStand() {
	const rack = new Group();
	const post = new Mesh(new BoxGeometry(.08, .92, .08), std("#5a3d22", .8));
	post.position.y = .46;
	const shelf = new Mesh(new BoxGeometry(1.05, .045, .18), std("#6a4428", .75));
	shelf.position.y = .9;
	rack.add(post, shelf);
	[
		"sword",
		"bow",
		"staff",
		"dagger"
	].forEach((style, i) => {
		const w = weaponMesh(style);
		w.scale.setScalar(style === "staff" ? .62 : .78);
		w.position.set(-.36 + i * .24, 1.02, 0);
		rack.add(w);
	});
	const off = weaponMesh("dagger");
	off.scale.setScalar(.78);
	off.position.set(.38, 1.02, .06);
	rack.add(off);
	return rack;
}
function syncBow(model, extend) {
	const bow = model.userData.gear?.weapon;
	if (!bow || bow.userData.kind !== "bow") return;
	const string = bow.getObjectByName("bow-string");
	const nock = bow.getObjectByName("nocked");
	const z = .1 + Math.max(0, Math.min(1, extend)) * .22;
	if (string) string.position.z = z;
	if (nock) nock.position.z = z;
}
var NIGHT = "#2a2e38";
var GOLD = "#8a7a40";
function syncGear(model, equipped) {
	const store = model.userData.gear ??= {};
	const weaponId = itemId(equipped.weapon);
	const style = weaponStyleOf(weaponId);
	const parentOf = (slot) => {
		if (slot === "weapon") return model.getObjectByName(style === "bow" ? "LeftHand" : "RightHand");
		if (slot === "gloves") return model.getObjectByName("RightHand");
		if (slot === "helmet") return model.getObjectByName("Head");
		if (slot === "boots") return model;
		if (slot === "belt") return model.getObjectByName("Hips");
		return model.getObjectByName("Spine2") ?? model.getObjectByName("Spine1");
	};
	const held = store.weapon;
	if (held && held.userData.kind !== style) {
		held.parent?.remove(held);
		delete store.weapon;
	}
	if (style === "dagger") {
		if (!store.offhand) {
			const left = weaponMesh("dagger");
			left.userData.kind = "offhand";
			model.getObjectByName("LeftHand")?.add(left);
			store.offhand = left;
		}
	} else if (store.offhand) {
		store.offhand.parent?.remove(store.offhand);
		delete store.offhand;
	}
	const make = (slot) => {
		if (slot === "weapon") {
			const g = weaponMesh(style);
			g.userData.kind = style;
			return g;
		}
		const g = new Group();
		if (slot === "helmet") {
			const shell = new Mesh(new SphereGeometry(.14, 18, 14, 0, Math.PI * 2, 0, Math.PI * .58), std(NIGHT, .42, .5));
			shell.position.set(0, .045, .01);
			const rim = new Mesh(new TorusGeometry(.118, .016, 8, 20), std(GOLD, .4, .55));
			rim.rotation.x = Math.PI / 2;
			rim.position.set(0, -.01, .015);
			const nasal = new Mesh(new BoxGeometry(.03, .08, .02), std(NIGHT, .4, .4));
			nasal.position.set(0, -.02, .12);
			const cheek = new Mesh(new BoxGeometry(.05, .07, .03), std(NIGHT, .45, .4));
			cheek.position.set(.1, -.02, .06);
			const cheekR = cheek.clone();
			cheekR.position.x = -.1;
			g.add(shell, rim, nasal, cheek, cheekR);
		} else if (slot === "armor") {
			const plate = new Mesh(new BoxGeometry(.36, .26, .06), std(NIGHT, .45, .42));
			plate.position.set(0, .04, .13);
			const belly = new Mesh(new BoxGeometry(.3, .14, .05), std("#343844", .55, .32));
			belly.position.set(0, -.16, .12);
			const trim = new Mesh(new BoxGeometry(.37, .02, .065), std(GOLD, .4, .55));
			trim.position.set(0, .16, .13);
			const pauldron = (x) => {
				const p = new Mesh(new SphereGeometry(.07, 10, 8), std(NIGHT, .4, .45));
				p.scale.set(1.35, .55, 1);
				p.position.set(x, .14, .05);
				return p;
			};
			g.add(plate, belly, trim, pauldron(-.2), pauldron(.2));
			const pant = () => {
				const leg = new Group();
				const thigh = new Mesh(new CapsuleGeometry(.075, .22, 4, 8), std(NIGHT, .5, .35));
				const shin = new Mesh(new CapsuleGeometry(.055, .18, 4, 8), std("#232833", .55, .3));
				shin.position.y = -.28;
				const knee = new Mesh(new SphereGeometry(.05, 8, 6), std(GOLD, .4, .4));
				knee.position.y = -.12;
				leg.add(thigh, shin, knee);
				return leg;
			};
			const pantsL = pant();
			const pantsR = pant();
			g.add(pantsL, pantsR);
			g.userData.pantsL = pantsL;
			g.userData.pantsR = pantsR;
		} else if (slot === "necklace") {
			const n = new Mesh(new TorusGeometry(.07, .008, 6, 14), std(GOLD, .35, .7));
			n.rotation.x = Math.PI / 2;
			n.position.set(0, .08, .08);
			g.add(n);
		} else if (slot === "belt") {
			const b = new Mesh(new BoxGeometry(.26, .045, .15), std(GOLD, .4, .55));
			b.position.set(0, -.02, .02);
			g.add(b);
		} else if (slot === "boots") {
			const shoe = () => {
				const s = new Group();
				const sole = new Mesh(new BoxGeometry(.11, .04, .24), std("#14161c", .65, .2));
				sole.position.y = .02;
				const upper = new Mesh(new BoxGeometry(.1, .07, .16), std(NIGHT, .5, .28));
				upper.position.set(0, .065, -.02);
				const cuff = new Mesh(new BoxGeometry(.11, .04, .1), std(GOLD, .4, .45));
				cuff.position.set(0, .09, -.05);
				s.add(sole, upper, cuff);
				return s;
			};
			const L = shoe();
			const R = shoe();
			g.add(L, R);
			g.userData.L = L;
			g.userData.R = R;
		} else if (slot === "gloves") {
			const wrap = new Mesh(new BoxGeometry(.07, .05, .08), std(NIGHT, .55, .25));
			wrap.position.set(0, .04, .02);
			g.add(wrap);
			const other = wrap.clone();
			g.userData.extra = other;
			model.getObjectByName("LeftHand")?.add(other);
		} else {
			const p = new Mesh(new SphereGeometry(.02, 8, 8), std(GOLD, .3, .7));
			p.position.set(.08, .08, .06);
			g.add(p);
		}
		return g;
	};
	Object.keys(equipped).forEach((slot) => {
		const on = Boolean(equipped[slot]);
		if (on && !store[slot]) {
			const piece = make(slot);
			store[slot] = piece;
			parentOf(slot)?.add(piece);
		}
		const piece = store[slot];
		if (piece) {
			piece.visible = on && !(slot === "weapon" && style === "fist");
			const extra = piece.userData.extra;
			if (extra) extra.visible = on;
		}
	});
	if (store.offhand) store.offhand.visible = style === "dagger" && Boolean(equipped.weapon);
}
var _pin = new Vector3();
var _face = new Vector3();
function stickGear(model) {
	const gear = model.userData.gear;
	if (!gear) return;
	const boots = gear.boots;
	if (boots?.visible) {
		const L = boots.userData.L;
		const R = boots.userData.R;
		if (L && R) {
			const place = (mesh, boneName) => {
				const bone = model.getObjectByName(boneName);
				if (!bone) return;
				bone.getWorldPosition(_pin);
				model.getWorldDirection(_face);
				_pin.addScaledVector(_face, .07);
				_pin.y = .02;
				model.worldToLocal(_pin);
				mesh.position.copy(_pin);
				mesh.quaternion.identity();
			};
			place(L, "LeftFoot");
			place(R, "RightFoot");
		}
	}
	const armor = gear.armor;
	const pantsL = armor?.userData.pantsL;
	const pantsR = armor?.userData.pantsR;
	if (armor?.visible && pantsL && pantsR) {
		const pinLeg = (mesh, boneName, side) => {
			const bone = model.getObjectByName(boneName);
			if (!bone) return;
			if (mesh.parent !== model) model.add(mesh);
			bone.getWorldPosition(_pin);
			_pin.y -= .16;
			model.worldToLocal(_pin);
			mesh.position.copy(_pin);
			mesh.quaternion.identity();
			mesh.position.x += side * .02;
		};
		pinLeg(pantsL, "LeftUpLeg", -1);
		pinLeg(pantsR, "RightUpLeg", 1);
	}
}
var _up$1 = new Vector3(0, 1, 0);
var _dir = new Vector3();
function arrowMesh() {
	const g = new Group();
	const shaft = new Mesh(new CylinderGeometry(.008, .008, .62, 5), new MeshLambertMaterial({ color: "#6b4a2a" }));
	const tip = new Mesh(new ConeGeometry(.02, .1, 6), new MeshLambertMaterial({ color: "#d5dbe3" }));
	tip.position.y = .36;
	const fletch = new Mesh(new BoxGeometry(.05, .08, .004), new MeshLambertMaterial({ color: "#f2efe6" }));
	fletch.position.y = -.26;
	g.add(shaft, tip, fletch);
	g.visible = false;
	return g;
}
function boltMesh() {
	const g = new Group();
	const core = new Mesh(new SphereGeometry(.09, 8, 6), new MeshBasicMaterial({
		color: "#9fd0ff",
		transparent: true,
		opacity: .95
	}));
	const glow = new Mesh(new SphereGeometry(.18, 8, 6), new MeshBasicMaterial({
		color: "#3d6cb0",
		transparent: true,
		opacity: .35,
		depthWrite: false
	}));
	g.add(core, glow);
	g.visible = false;
	return g;
}
function boomMesh() {
	const mesh = new Group();
	const light = new MeshBasicMaterial({
		color: "#ffb15a",
		transparent: true,
		opacity: 0,
		depthWrite: false
	});
	const ringMat = new MeshBasicMaterial({
		color: "#7eb6ff",
		transparent: true,
		opacity: 0,
		depthWrite: false,
		side: 2
	});
	const core = new Mesh(new SphereGeometry(.28, 8, 6), light);
	const ring = new Mesh(new RingGeometry(.15, .32, 16), ringMat);
	ring.rotation.x = -Math.PI / 2;
	mesh.add(core, ring);
	mesh.visible = false;
	return {
		mesh,
		life: 1,
		light,
		ring: ringMat
	};
}
function createCombat(scene) {
	const root = new Group();
	const arrows = Array.from({ length: 8 }, () => {
		const mesh = arrowMesh();
		root.add(mesh);
		return {
			mesh,
			x: 0,
			y: 0,
			z: 0,
			vx: 0,
			vy: 0,
			vz: 0,
			life: 0,
			max: 1.25,
			live: false,
			kind: "arrow",
			dmg: 0,
			crit: false,
			home: ""
		};
	});
	const bolts = Array.from({ length: 5 }, () => {
		const mesh = boltMesh();
		root.add(mesh);
		return {
			mesh,
			x: 0,
			y: 0,
			z: 0,
			vx: 0,
			vy: 0,
			vz: 0,
			life: 0,
			max: .9,
			live: false,
			kind: "bolt",
			dmg: 0,
			crit: false,
			home: ""
		};
	});
	const booms = Array.from({ length: 5 }, () => {
		const boom = boomMesh();
		root.add(boom.mesh);
		return boom;
	});
	scene.add(root);
	const take = (pool) => pool.find((s) => !s.live) ?? pool[0];
	const launch = (pool, origin, dir, speed, dmg, crit, home = "") => {
		const shot = take(pool);
		const n = _dir.copy(dir);
		if (n.lengthSq() < 1e-6) n.set(0, 0, -1);
		n.normalize();
		shot.x = origin.x + n.x * .35;
		shot.y = origin.y + n.y * .15;
		shot.z = origin.z + n.z * .35;
		shot.vx = n.x * speed;
		shot.vy = n.y * speed;
		shot.vz = n.z * speed;
		shot.life = 0;
		shot.live = true;
		shot.dmg = dmg;
		shot.crit = crit;
		shot.home = home;
		shot.mesh.visible = true;
		shot.mesh.position.set(shot.x, shot.y, shot.z);
	};
	const explode = (x, y, z) => {
		const boom = booms.find((b) => b.life >= 1) ?? booms[0];
		boom.life = 0;
		boom.mesh.visible = true;
		boom.mesh.position.set(x, y, z);
		boom.mesh.scale.setScalar(.2);
		boom.light.opacity = .9;
		boom.ring.opacity = .7;
	};
	return {
		explode(x, y, z) {
			explode(x, y, z);
		},
		slash(x, y, z, yaw, mag) {
			const boom = booms.find((b) => b.life >= 1) ?? booms[0];
			boom.life = 0;
			boom.mesh.visible = true;
			const fx = -Math.sin(yaw);
			const fz = -Math.cos(yaw);
			boom.mesh.position.set(x + fx * .9, y, z + fz * .9);
			boom.mesh.scale.setScalar(.2);
			boom.light.color.set(mag ? "#9fd0ff" : "#ffb15a");
			boom.light.opacity = .9;
			boom.ring.opacity = .7;
		},
		fireArrow(origin, dir, dmg, crit, home = "") {
			launch(arrows, origin, dir, 26, dmg, crit, home);
		},
		fireBolt(origin, dir, dmg, crit, home = "") {
			launch(bolts, origin, dir, 16, dmg, crit, home);
		},
		tick(dt, targets, onHit) {
			const step = (shot) => {
				if (!shot.live) return;
				if (shot.home) {
					const target = targets.find((row) => row.id === shot.home && row.alive);
					if (target) {
						const dx = target.x - shot.x;
						const dy = target.y - shot.y;
						const dz = target.z - shot.z;
						const len = Math.hypot(dx, dy, dz) || 1;
						const speed = Math.hypot(shot.vx, shot.vy, shot.vz) || 26;
						const steer = 1 - Math.exp(-18 * dt);
						shot.vx += (dx / len * speed - shot.vx) * steer;
						shot.vy += (dy / len * speed - shot.vy) * steer;
						shot.vz += (dz / len * speed - shot.vz) * steer;
					}
				}
				shot.life += dt;
				shot.x += shot.vx * dt;
				shot.y += shot.vy * dt;
				shot.z += shot.vz * dt;
				shot.mesh.position.set(shot.x, shot.y, shot.z);
				if (shot.kind === "arrow") {
					_dir.set(shot.vx, shot.vy, shot.vz).normalize();
					shot.mesh.quaternion.setFromUnitVectors(_up$1, _dir);
				}
				for (const target of targets) {
					if (!shot.live || !target.alive) continue;
					if (shot.home && target.id !== shot.home) continue;
					const dx = shot.x - target.x;
					const dy = shot.y - target.y;
					const dz = shot.z - target.z;
					if (dx * dx + dy * dy + dz * dz > .75) continue;
					shot.live = false;
					shot.mesh.visible = false;
					onHit(target.id, shot.dmg, shot.crit, shot.x, shot.y, shot.z);
					if (shot.kind === "bolt") explode(shot.x, shot.y, shot.z);
					return;
				}
				if (shot.life < shot.max) return;
				if (shot.kind === "bolt") explode(shot.x, shot.y, shot.z);
				shot.live = false;
				shot.mesh.visible = false;
			};
			for (const shot of arrows) step(shot);
			for (const shot of bolts) step(shot);
			for (const boom of booms) {
				if (boom.life >= 1) continue;
				boom.life += dt / .36;
				const k = Math.min(1, boom.life);
				boom.mesh.scale.setScalar(.25 + k * 1.7);
				boom.light.opacity = (1 - k) * .9;
				boom.ring.opacity = (1 - k) * .65;
				if (boom.life >= 1) boom.mesh.visible = false;
			}
		},
		dispose() {
			scene.remove(root);
		}
	};
}
var bin = [];
function keep(item) {
	bin.push(item);
	return item;
}
function disposeScenery() {
	while (bin.length) bin.pop()?.dispose();
}
function repeatTex(base, rx, ry) {
	const tex = base.clone();
	tex.wrapS = tex.wrapT = RepeatWrapping;
	tex.repeat.set(rx, ry);
	tex.colorSpace = SRGBColorSpace;
	tex.anisotropy = 2;
	tex.needsUpdate = true;
	keep(tex);
	return tex;
}
function mat(tex, _rough = .92) {
	return keep(new MeshLambertMaterial({ map: tex }));
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
	const geo = new BufferGeometry();
	geo.setAttribute("position", new BufferAttribute(pos, 3));
	geo.setAttribute("uv", new BufferAttribute(uv, 2));
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
async function composeGround() {
	const [grass] = await Promise.all([loadImage("/textures/grass.jpg")]);
	const S = 1024;
	const canvas = document.createElement("canvas");
	canvas.width = S;
	canvas.height = S;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("canvas");
	const tile = Math.round(3.1 * (S / 110));
	for (let y = 0; y < S; y += tile) for (let x = 0; x < S; x += tile) ctx.drawImage(grass, x, y, 59, 59);
	const tex = new CanvasTexture(canvas);
	tex.colorSpace = SRGBColorSpace;
	tex.anisotropy = 2;
	tex.needsUpdate = true;
	return keep(tex);
}
function smokeTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 64;
	canvas.height = 64;
	const g = canvas.getContext("2d");
	if (!g) return keep(new CanvasTexture(canvas));
	const grd = g.createRadialGradient(32, 32, 2, 32, 32, 30);
	grd.addColorStop(0, "rgba(206,206,204,0.45)");
	grd.addColorStop(1, "rgba(206,206,204,0)");
	g.fillStyle = grd;
	g.fillRect(0, 0, 64, 64);
	const tex = new CanvasTexture(canvas);
	tex.colorSpace = SRGBColorSpace;
	return keep(tex);
}
function buildVillage(textures) {
	const root = new Group();
	for (const tex of [
		textures.stone,
		textures.wood,
		textures.thatch,
		textures.ground
	]) {
		tex.colorSpace = SRGBColorSpace;
		tex.anisotropy = 2;
	}
	textures.stone.wrapS = textures.stone.wrapT = RepeatWrapping;
	textures.wood.wrapS = textures.wood.wrapT = RepeatWrapping;
	textures.thatch.wrapS = textures.thatch.wrapT = RepeatWrapping;
	textures.ground.wrapS = textures.ground.wrapT = RepeatWrapping;
	textures.ground.repeat.set(8, 8);
	const ground = new Mesh(keep(new PlaneGeometry(2400, 2400)), keep(new MeshLambertMaterial({ map: textures.ground })));
	ground.rotation.x = -Math.PI / 2;
	ground.position.y = -.02;
	ground.receiveShadow = true;
	ground.name = "season-ground";
	root.add(ground);
	const snowCanvas = document.createElement("canvas");
	snowCanvas.width = 128;
	snowCanvas.height = 128;
	const snowTex = keep(new CanvasTexture(snowCanvas));
	const blanket = new Mesh(keep(new PlaneGeometry(2400, 2400)), keep(new MeshLambertMaterial({
		color: "#f7fbff",
		transparent: true,
		opacity: .9,
		alphaMap: snowTex,
		depthWrite: false
	})));
	blanket.rotation.x = -Math.PI / 2;
	blanket.position.y = .03;
	blanket.name = "snow-blanket";
	blanket.visible = false;
	blanket.userData.canvas = snowCanvas;
	blanket.userData.tex = snowTex;
	blanket.receiveShadow = true;
	root.add(blanket);
	const stoneMat = (rx, ry) => mat(repeatTex(textures.stone, rx, ry), .9);
	const woodMat = (rx, ry) => mat(repeatTex(textures.wood, rx, ry), .78);
	const thatchMat = (rx, ry) => mat(repeatTex(textures.thatch, rx, ry), .95);
	const dark = keep(new MeshStandardMaterial({
		color: "#1a1613",
		roughness: .9
	}));
	const glow = keep(new MeshStandardMaterial({
		color: "#ffb27a",
		emissive: "#ff9a4a",
		emissiveIntensity: .7,
		roughness: .6
	}));
	for (const h of HOUSES) {
		const g = new Group();
		g.position.set(h.x, 0, h.z);
		g.rotation.y = h.yaw;
		const walls = new Mesh(keep(new BoxGeometry(h.w, h.h, h.d)), stoneMat(h.w / 2.4, h.h / 1.8));
		walls.position.y = h.h / 2;
		walls.castShadow = true;
		walls.receiveShadow = true;
		g.add(walls);
		const roof = new Mesh(roofGeometry(h.w, h.d, h.rh), thatchMat(h.w / 2.2, 1.4));
		roof.position.y = h.h;
		roof.castShadow = true;
		roof.receiveShadow = true;
		roof.name = "season-roof";
		const cap = new Mesh(roofGeometry(h.w * .98, h.d * .98, h.rh * .72), keep(new MeshLambertMaterial({ color: "#f7fbff" })));
		cap.position.y = h.rh * .28;
		cap.scale.set(1, 1.15, 1);
		cap.name = "snow-cap";
		cap.visible = false;
		roof.add(cap);
		g.add(roof);
		const chimney = new Mesh(keep(new BoxGeometry(.55, 1.15, .55)), stoneMat(1, 2));
		chimney.position.set(h.w * .22, h.h + h.rh * .35, 0);
		chimney.castShadow = true;
		g.add(chimney);
		const doorW = Math.min(1.15, h.w * .28);
		const doorH = Math.min(2.05, h.h * .72);
		const door = new Mesh(keep(new BoxGeometry(doorW, doorH, .08)), woodMat(1, 2));
		door.castShadow = true;
		const winMat = glow;
		const win = new Mesh(keep(new BoxGeometry(.42, .5, .06)), winMat);
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
			const mouth = new Mesh(keep(new BoxGeometry(1.3, .7, .12)), dark);
			place(mouth, h.door, .7, 1.35);
			if (h.door === "px" || h.door === "nx") mouth.rotation.y = Math.PI / 2;
			const coal = new Mesh(keep(new BoxGeometry(.7, .12, .45)), keep(new MeshStandardMaterial({
				color: "#ff6a2a",
				emissive: "#ff4d12",
				emissiveIntensity: 1.4,
				roughness: .5
			})));
			coal.position.set(-.2, .45, -h.d / 2 - .7);
			const anvil = new Mesh(keep(new BoxGeometry(.45, .22, .22)), keep(new MeshStandardMaterial({
				color: "#2c3033",
				metalness: .8,
				roughness: .35
			})));
			anvil.position.set(1.55, .72, h.d / 2 + 1.15);
			anvil.castShadow = true;
			const stump = new Mesh(keep(new CylinderGeometry(.22, .26, .62, 10)), woodMat(1, 1));
			stump.position.set(1.55, .31, h.d / 2 + 1.15);
			stump.castShadow = true;
			g.add(mouth, coal, anvil, stump);
		}
		root.add(g);
	}
	const bed = new Mesh(keep(new RingGeometry(MOAT_IN - 1.4, MOAT_OUT + 1.5, 128, 1)), keep(new MeshBasicMaterial({
		color: "#071416",
		side: 2
	})));
	bed.rotation.x = -Math.PI / 2;
	bed.position.y = .045;
	bed.renderOrder = 2;
	bed.receiveShadow = true;
	root.add(bed);
	const waterMat = keep(new MeshStandardMaterial({
		color: "#0c4550",
		roughness: .16,
		metalness: .42,
		emissive: "#06262c",
		emissiveIntensity: .45,
		side: 2
	}));
	const lakeTime = { value: 0 };
	waterMat.userData.uTime = lakeTime;
	waterMat.onBeforeCompile = (shader) => {
		shader.uniforms.uTime = lakeTime;
		shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform float uTime;\nvarying vec3 vLake;").replace("#include <beginnormal_vertex>", `#include <beginnormal_vertex>
				float waveMix = smoothstep(0.4, 0.6, 0.5 + 0.5 * sin(uTime * 0.15));
				float currentMix = 1.0 - waveMix;
				objectNormal.x += cos(position.x * 0.46 + uTime * 1.45) * 0.9 * waveMix;
				objectNormal.y += sin(position.y * 0.4 - uTime * 1.15) * 0.8 * waveMix;
				objectNormal.y += cos(position.x * 0.18 - uTime * 0.85) * 0.28 * currentMix;
			`).replace("#include <begin_vertex>", `#include <begin_vertex>
				float waveMix = smoothstep(0.4, 0.6, 0.5 + 0.5 * sin(uTime * 0.15));
				float currentMix = 1.0 - waveMix;
				float rip = sin(position.x * 0.52 + position.y * 0.16 + uTime * 1.55);
				rip += sin(length(position.xy) * 0.58 - uTime * 1.25) * 0.7;
				transformed.z += rip * 0.12 * waveMix;
				float flow = uTime * 0.9;
				transformed.x += sin(position.y * 0.34 + flow) * 0.08 * currentMix;
				transformed.z += sin(position.x * 0.22 - flow * 0.7) * 0.03 * currentMix;
				vLake = position;
			`);
		shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nuniform float uTime;\nvarying vec3 vLake;").replace("#include <color_fragment>", `#include <color_fragment>
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
	const moat = new Mesh(keep(new RingGeometry(MOAT_IN - .15, MOAT_OUT + .2, 160, 28)), waterMat);
	moat.rotation.x = -Math.PI / 2;
	moat.position.y = .14;
	moat.renderOrder = 3;
	moat.name = "moat";
	moat.receiveShadow = true;
	root.add(moat);
	const plank = keep(new BoxGeometry(1, 1, 1));
	const plankMat = woodMat(2, 1);
	const arch = (axis, sign) => {
		const deck = new Mesh(plank, plankMat);
		const railMat = woodMat(1, 1);
		const span = SPAN_OUT - SPAN_IN;
		const mid = (SPAN_IN + SPAN_OUT) / 2;
		const wide = DECK_HALF * 2;
		const deckH = DECK_TOP - .02;
		const deckY = .02 + deckH / 2;
		if (axis === "z") {
			deck.position.set(0, deckY, sign * mid);
			deck.scale.set(wide, deckH, span);
		} else {
			deck.position.set(sign * mid, deckY, 0);
			deck.scale.set(span, deckH, wide);
		}
		deck.receiveShadow = true;
		deck.castShadow = true;
		root.add(deck);
		const railAcross = DECK_HALF - RAIL_T / 2;
		const railH = 1.15;
		const railY = DECK_TOP + railH / 2;
		for (const side of [-railAcross, railAcross]) {
			const rail = new Mesh(plank, railMat);
			if (axis === "z") {
				rail.position.set(side, railY, sign * mid);
				rail.scale.set(RAIL_T, railH, span - .2);
			} else {
				rail.position.set(sign * mid, railY, side);
				rail.scale.set(span - .2, railH, RAIL_T);
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
	const hut = new Group();
	hut.position.set(FISHER_HUT.x, 0, FISHER_HUT.z);
	hut.rotation.y = FISHER_YAW;
	const hutWall = (w, h, d, x, y, z) => {
		const mesh = new Mesh(keep(new BoxGeometry(w, h, d)), hutWood);
		mesh.position.set(x, y, z);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		hut.add(mesh);
	};
	hutWall(4.5, .16, 3.6, 0, .08, 0);
	hutWall(.16, 2.2, 3.6, -2.15, 1.22, 0);
	hutWall(.16, 2.2, 3.6, 2.15, 1.22, 0);
	hutWall(4.5, 2.2, .16, 0, 1.22, -1.7);
	hutWall(1.35, 2.2, .16, -1.5, 1.22, 1.7);
	hutWall(1.35, 2.2, .16, 1.5, 1.22, 1.7);
	const hutRoof = new Mesh(roofGeometry(4.1, 3.2, 1.05), thatchMat(2, 1));
	hutRoof.position.y = 2.25;
	hutRoof.castShadow = true;
	hut.add(hutRoof);
	const lamp = new Mesh(keep(new BoxGeometry(.16, .22, .16)), keep(new MeshStandardMaterial({
		color: "#ffb15a",
		emissive: "#ff8a2a",
		emissiveIntensity: .8
	})));
	lamp.position.set(.7, 1.7, 1.85);
	hut.add(lamp);
	const barrel = new Mesh(keep(new CylinderGeometry(.28, .32, .55, 8)), hutWood);
	barrel.position.set(-1.85, .4, 2.15);
	barrel.castShadow = true;
	hut.add(barrel);
	const rack = new Mesh(keep(new BoxGeometry(1.4, .06, .06)), hutWood);
	rack.position.set(1.7, 1.35, 2.25);
	hut.add(rack);
	const fishMat = keep(new MeshLambertMaterial({ color: "#8a93a0" }));
	for (const x of [
		-.4,
		0,
		.4
	]) {
		const fish = new Mesh(keep(new CapsuleGeometry(.05, .22, 3, 5)), fishMat);
		fish.position.set(1.7 + x, 1.05, 2.25);
		fish.rotation.z = .4;
		hut.add(fish);
	}
	root.add(hut);
	const pierLen = Math.hypot(PIER.x1 - PIER.x0, PIER.z1 - PIER.z0);
	const pier = new Group();
	pier.position.set((PIER.x0 + PIER.x1) / 2, 0, (PIER.z0 + PIER.z1) / 2);
	pier.rotation.y = FISHER_YAW;
	const pierDeck = new Mesh(plank, plankMat);
	pierDeck.scale.set(PIER.half * 2, .2, pierLen);
	pierDeck.position.y = .38;
	pierDeck.castShadow = true;
	pierDeck.receiveShadow = true;
	pier.add(pierDeck);
	for (let i = 0; i < 5; i++) {
		const z = -pierLen / 2 + (i + .5) * (pierLen / 5);
		for (const x of [-PIER.half + .08, PIER.half - .08]) {
			const post = new Mesh(keep(new CylinderGeometry(.07, .09, 1.15, 6)), hutWood);
			post.position.set(x, .05, z);
			post.castShadow = true;
			pier.add(post);
		}
	}
	for (const x of [-PIER.half, PIER.half]) {
		const rail = new Mesh(plank, woodMat(1, 1));
		rail.scale.set(.08, .22, pierLen - .4);
		rail.position.set(x, .78, 0);
		pier.add(rail);
	}
	const boat = new Group();
	boat.position.set(PIER.half + .85, .18, pierLen * .28);
	const hull = new Mesh(keep(new BoxGeometry(.62, .2, 1.7)), hutWood);
	hull.castShadow = true;
	const bow = new Mesh(keep(new ConeGeometry(.32, .45, 4)), hutWood);
	bow.rotation.x = Math.PI / 2;
	bow.position.z = .95;
	boat.add(hull, bow);
	pier.add(boat);
	root.add(pier);
	const trunkGeo = keep(new CylinderGeometry(.18, .28, 1, 8));
	const trunkMat = woodMat(1, 2);
	const leafGeo = keep(new IcosahedronGeometry(1, 0));
	const leafColors = new Float32Array(leafGeo.attributes.position.count * 3);
	for (let i = 0; i < leafGeo.attributes.position.count; i++) {
		const n = Math.sin(i * 12.989) * 43758.5453 % 1;
		const f = n < 0 ? n + 1 : n;
		leafColors[i * 3] = .18 + f * .08;
		leafColors[i * 3 + 1] = .28 + f * .1;
		leafColors[i * 3 + 2] = .12 + f * .04;
	}
	leafGeo.setAttribute("color", new BufferAttribute(leafColors, 3));
	const leafMat = keep(new MeshLambertMaterial({ vertexColors: true }));
	for (const t of TREES) {
		const tree = new Group();
		tree.position.set(t.x, 0, t.z);
		const trunk = new Mesh(trunkGeo, trunkMat);
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
			const leaf = new Mesh(geo, leafMat);
			const a = i / clumps * Math.PI * 2;
			leaf.position.set(Math.cos(a) * .35 * t.s, (2.5 + i % 2 * .45) * t.s, Math.sin(a) * .35 * t.s);
			leaf.scale.setScalar((1.15 + i % 3 * .18) * t.s);
			leaf.castShadow = false;
			tree.add(leaf);
		}
		const snowTop = new Mesh(keep(new IcosahedronGeometry(.85, 0)), keep(new MeshLambertMaterial({ color: "#f4f8fc" })));
		snowTop.position.y = 3.15 * t.s;
		snowTop.scale.setScalar(1.65 * t.s);
		snowTop.name = "snow-cap";
		snowTop.visible = false;
		tree.add(snowTop);
		root.add(tree);
	}
	const well = new Group();
	const outer = new Mesh(keep(new CylinderGeometry(1.08, 1.18, 1.02, 28, 1, true)), stoneMat(3, 1));
	outer.position.y = .51;
	outer.castShadow = true;
	outer.receiveShadow = true;
	const innerMat = stoneMat(2.2, 1);
	innerMat.side = 1;
	const inner = new Mesh(keep(new CylinderGeometry(.84, .92, .98, 28, 1, true)), innerMat);
	inner.position.y = .52;
	const floor = new Mesh(keep(new CircleGeometry(.92, 28)), stoneMat(1.2, 1));
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = .08;
	const water = new Mesh(keep(new CircleGeometry(.78, 32)), keep(new ShaderMaterial({
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
	water.position.y = .28;
	const lip = new Mesh(keep(new TorusGeometry(1.02, .09, 10, 28)), stoneMat(2, 1));
	lip.rotation.x = Math.PI / 2;
	lip.position.y = 1.02;
	const postGeo = keep(new CylinderGeometry(.08, .09, 1.85, 10));
	const postMat = woodMat(1, 2);
	const postL = new Mesh(postGeo, postMat);
	postL.position.set(-.78, 1.7, 0);
	const postR = postL.clone();
	postR.position.x = .78;
	const beam = new Mesh(keep(new CylinderGeometry(.065, .065, 1.75, 8)), postMat);
	beam.rotation.z = Math.PI / 2;
	beam.position.y = 2.55;
	const littleRoof = new Mesh(roofGeometry(2.05, 1.15, .5), thatchMat(1.2, 1));
	littleRoof.position.y = 2.42;
	postL.castShadow = postR.castShadow = beam.castShadow = true;
	well.add(outer, inner, floor, water, lip, postL, postR, beam, littleRoof);
	root.add(well);
	const oreMat = keep(new MeshStandardMaterial({
		color: "#6e624c",
		roughness: .9
	}));
	for (const vein of VEINS) {
		const rock = new Mesh(keep(new DodecahedronGeometry(.55, 0)), oreMat);
		rock.position.set(vein.x, .35, vein.z);
		rock.castShadow = true;
		root.add(rock);
	}
	const plazaMat = keep(new MeshStandardMaterial({
		map: repeatTex(textures.stone, 2.4, 2.4),
		roughness: .78,
		metalness: .04,
		color: "#d9d3c8"
	}));
	const plaza = new Mesh(keep(new CircleGeometry(16.5, 96)), plazaMat);
	plaza.rotation.x = -Math.PI / 2;
	plaza.position.y = .018;
	plaza.receiveShadow = true;
	const curb = new Mesh(keep(new RingGeometry(16.15, 16.62, 96)), stoneMat(3, .4));
	curb.rotation.x = -Math.PI / 2;
	curb.position.y = .028;
	root.add(plaza, curb);
	const puffs = [];
	const puffTex = smokeTexture();
	for (const cny of CHIMNEYS) for (let i = 0; i < 5; i++) {
		const material = keep(new SpriteMaterial({
			map: puffTex,
			transparent: true,
			depthWrite: false,
			opacity: .2
		}));
		const sprite = new Sprite(material);
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
	const forgeLight = new PointLight("#ff6a2a", 6, 8, 2);
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
function makeGrass() {
	const geo = new PlaneGeometry(.07, .32, 1, 3);
	geo.translate(0, .11, 0);
	const mat = new MeshLambertMaterial({
		color: "#3f6b32",
		side: 2
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
	const mesh = new InstancedMesh(geo, mat, count);
	mesh.castShadow = false;
	mesh.receiveShadow = false;
	const dummy = new Object3D();
	const color = new Color();
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
function tickGrass(dt) {
	grassTime.value += dt;
}
function tickSmoke(puffs, dt) {
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
function createWeather(scene) {
	const root = new Group();
	const puffMat = new MeshLambertMaterial({ color: "#f4f1ea" });
	const clouds = [];
	for (let i = 0; i < 14; i++) {
		const cloud = new Group();
		const n = 4;
		for (let k = 0; k < n; k++) {
			const blob = new Mesh(new SphereGeometry(3.4, 6, 4), puffMat);
			blob.position.set((k - 1.5) * 3.6, 0, k % 2 * 1.4);
			blob.scale.y = .42;
			cloud.add(blob);
		}
		cloud.userData.base = i * 28;
		cloud.userData.speed = 1.1 + i % 4 * .35;
		cloud.userData.z = (i - 7) * 16;
		cloud.userData.y = 16 + i % 5 * 3.2;
		root.add(cloud);
		clouds.push(cloud);
	}
	const sun = new Mesh(new SphereGeometry(1.7, 18, 14), new MeshBasicMaterial({ color: "#ffe7b0" }));
	const glow = new Mesh(new SphereGeometry(3.4, 16, 12), new MeshBasicMaterial({
		color: "#ffd27a",
		transparent: true,
		opacity: .28,
		depthWrite: false
	}));
	root.add(sun, glow);
	const count = 2600;
	const rainSpan = 360;
	const rainPos = new Float32Array(count * 3);
	for (let i = 0; i < count; i++) {
		rainPos[i * 3] = (Math.random() - .5) * rainSpan;
		rainPos[i * 3 + 1] = Math.random() * 22;
		rainPos[i * 3 + 2] = (Math.random() - .5) * rainSpan;
	}
	const rainGeo = new BufferGeometry();
	rainGeo.setAttribute("position", new BufferAttribute(rainPos, 3));
	const rain = new Points(rainGeo, new PointsMaterial({
		color: "#d5e2ee",
		size: .16,
		transparent: true,
		opacity: .72,
		depthWrite: false
	}));
	rain.visible = false;
	root.add(rain);
	const flash = new PointLight("#e7f1ff", 0, 240, 1.4);
	flash.name = "storm-flash";
	flash.position.set(0, 24, 0);
	root.add(flash);
	const leafGeo = new PlaneGeometry(.16, .09);
	const leafMat = new MeshLambertMaterial({
		color: "#d86a22",
		side: 2
	});
	const leaves = new InstancedMesh(leafGeo, leafMat, 280);
	const flowerMat = new MeshLambertMaterial({ color: "#f2d2e6" });
	const flowers = new InstancedMesh(new SphereGeometry(.06, 5, 4), flowerMat, 220);
	const dummy = new Object3D();
	const tint = new Color();
	const leafSpots = [];
	const flowerSpots = [];
	for (let i = 0; i < 280; i++) {
		const a = Math.random() * Math.PI * 2;
		const r = 18 + Math.random() * 138;
		const spot = {
			x: Math.cos(a) * r,
			z: Math.sin(a) * r,
			ry: Math.random() * Math.PI,
			s: .8 + Math.random() * 1.1
		};
		leafSpots.push(spot);
		dummy.position.set(spot.x, -4, spot.z);
		dummy.rotation.set(-Math.PI / 2, 0, spot.ry);
		dummy.scale.setScalar(0);
		dummy.updateMatrix();
		leaves.setMatrixAt(i, dummy.matrix);
		tint.setHSL(.07 + Math.random() * .06, .7, .38 + Math.random() * .12);
		leaves.setColorAt(i, tint);
	}
	for (let i = 0; i < 220; i++) {
		const a = Math.random() * Math.PI * 2;
		const r = 18 + Math.random() * 138;
		const spot = {
			x: Math.cos(a) * r,
			z: Math.sin(a) * r,
			ry: Math.random() * Math.PI,
			s: .7 + Math.random() * 1
		};
		flowerSpots.push(spot);
		dummy.position.set(spot.x, -4, spot.z);
		dummy.rotation.set(0, spot.ry, 0);
		dummy.scale.setScalar(0);
		dummy.updateMatrix();
		flowers.setMatrixAt(i, dummy.matrix);
		const hue = Math.random() < .5 ? .95 : Math.random() < .5 ? .14 : .55;
		tint.setHSL(hue, .55, .62);
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
		snowPos[i * 3] = (Math.random() - .5) * snowSpan;
		snowPos[i * 3 + 1] = Math.random() * 22;
		snowPos[i * 3 + 2] = (Math.random() - .5) * snowSpan;
	}
	const snowGeo = new BufferGeometry();
	snowGeo.setAttribute("position", new BufferAttribute(snowPos, 3));
	const snow = new Points(snowGeo, new PointsMaterial({
		color: "#f7fbff",
		size: .28,
		transparent: true,
		opacity: .95,
		depthWrite: false
	}));
	snow.visible = false;
	root.add(leaves, flowers, snow);
	scene.add(root);
	let snowCaps = null;
	const seasonColor = new Color();
	const nextColor = new Color();
	let painted = -1;
	return {
		update(dt, t, x, z) {
			const season = Math.floor(Date.now() / 36e5) % 4;
			const frac = Date.now() % 36e5 / 36e5;
			const gmat = scene.getObjectByName("season-ground")?.material;
			if (gmat) {
				const palette = [
					"#8fbf62",
					"#d7e2b8",
					"#c9843a",
					"#b7c3a8"
				];
				seasonColor.set(palette[season] ?? "#8fbf62");
				nextColor.set(palette[(season + 1) % 4] ?? "#8fbf62");
				gmat.color.copy(seasonColor.lerp(nextColor, frac * .35));
			}
			const blanket = scene.getObjectByName("snow-blanket");
			if (blanket && painted !== season) {
				painted = season;
				const canvas = blanket.userData.canvas;
				const tex = blanket.userData.tex;
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
			const moat = scene.getObjectByName("moat");
			const lakeClock = moat?.material && moat.material.userData?.uTime;
			if (lakeClock) lakeClock.value += dt;
			const wellMat = scene.getObjectByName("well-water")?.material;
			if (wellMat?.uniforms?.uTime) wellMat.uniforms.uTime.value += dt;
			if (!snowCaps || snowCaps.length === 0) {
				snowCaps = [];
				scene.traverse((obj) => {
					if (obj.name === "snow-cap") snowCaps.push(obj);
				});
			}
			for (const cap of snowCaps) cap.visible = season === 3;
			const grassMat = scene.getObjectByName("season-grass")?.material;
			if (grassMat) grassMat.color.set([
				"#7dba62",
				"#d2c56a",
				"#d07a32",
				"#c5d0dc"
			][season] ?? "#7dba62");
			const paintSpread = (mesh, spots, _salt, y, flat, onSeason) => {
				mesh.visible = onSeason;
				for (let i = 0; i < spots.length; i++) {
					const spot = spots[i];
					const on = onSeason && Math.hypot(spot.x, spot.z) > 17;
					dummy.position.set(spot.x, on ? y : -6, spot.z);
					dummy.rotation.set(flat ? -Math.PI / 2 : 0, flat ? 0 : spot.ry, flat ? spot.ry : 0);
					dummy.scale.setScalar(on ? spot.s : .001);
					dummy.updateMatrix();
					mesh.setMatrixAt(i, dummy.matrix);
				}
				mesh.instanceMatrix.needsUpdate = true;
			};
			paintSpread(leaves, leafSpots, 2, .03, true, season === 2);
			paintSpread(flowers, flowerSpots, season === 1 ? 1 : 0, .05, false, season === 0 || season === 1);
			for (const cloud of clouds) {
				const span = 260;
				const wrapped = ((cloud.userData.base + t * cloud.userData.speed) % span + span) % span - span / 2;
				cloud.position.set(x + wrapped, cloud.userData.y, z + cloud.userData.z);
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
				const arr = rainGeo.attributes.position;
				const storm = Math.sin(t * .7) > .12;
				const fall = storm ? 26 : 14;
				for (let i = 0; i < count; i++) {
					let px = arr.getX(i);
					let py = arr.getY(i) - dt * fall;
					let pz = arr.getZ(i) + dt * (storm ? 6 : 2.2);
					if (py < .15 || Math.abs(px) > rainSpan * .5 || Math.abs(pz) > rainSpan * .5) {
						px = (Math.random() - .5) * rainSpan;
						pz = (Math.random() - .5) * rainSpan;
						py = 8 + Math.random() * 16;
					}
					arr.setXYZ(i, px, py, pz);
				}
				arr.needsUpdate = true;
				if (storm && Math.random() < dt * .55) {
					flash.intensity = 14 + Math.random() * 12;
					flash.position.set(x + (Math.random() - .5) * 160, 28, z + (Math.random() - .5) * 160);
				}
			}
			if (flash.intensity > 0) flash.intensity = Math.max(0, flash.intensity - dt * 42);
			const fog = scene.fog;
			if (fog) {
				fog.color.set(season === 3 ? "#c5d0d8" : season === 2 ? "#b7c4c8" : "#b9c3bc");
				fog.near = 55;
				fog.far = 280;
			}
			if (season === 3) {
				const arr = snowGeo.attributes.position;
				for (let i = 0; i < snowCount; i++) {
					let px = arr.getX(i);
					let py = arr.getY(i) - dt * 3.2;
					let pz = arr.getZ(i);
					if (py < .2 || Math.abs(px) > snowSpan * .5 || Math.abs(pz) > snowSpan * .5) {
						px = (Math.random() - .5) * snowSpan;
						pz = (Math.random() - .5) * snowSpan;
						py = 6 + Math.random() * 16;
					}
					arr.setXYZ(i, px, py, pz);
				}
				arr.needsUpdate = true;
			}
		},
		dispose() {
			scene.remove(root);
		}
	};
}
function createSwingFx() {
	const root = new Group();
	const arcGeo = new TorusGeometry(.18, .01, 5, 12, Math.PI * .55);
	return {
		root,
		swing: 0,
		side: 1,
		spawned: false,
		arcs: Array.from({ length: 4 }, () => {
			const mesh = new Mesh(arcGeo, new MeshBasicMaterial({
				color: "#ffe6cc",
				transparent: true,
				opacity: 0,
				blending: 2,
				depthWrite: false,
				side: 2
			}));
			mesh.visible = false;
			mesh.frustumCulled = false;
			root.add(mesh);
			return {
				mesh,
				life: 1
			};
		})
	};
}
var FIST = {
	LeftHandIndex1: 1.15,
	LeftHandMiddle1: 1.2,
	LeftHandRing1: 1.15,
	LeftHandPinky1: 1,
	LeftHandIndex2: .9,
	LeftHandMiddle2: .95,
	LeftHandRing2: .9,
	LeftHandPinky2: .75,
	LeftHandThumb1: .45,
	RightHandIndex1: 1.15,
	RightHandMiddle1: 1.2,
	RightHandRing1: 1.15,
	RightHandPinky1: 1,
	RightHandIndex2: .9,
	RightHandMiddle2: .95,
	RightHandRing2: .9,
	RightHandPinky2: .75,
	RightHandThumb1: .45
};
function captureRest(model) {
	const quat = {};
	const pos = {};
	model.traverse((obj) => {
		const bone = obj;
		if (!bone.isBone) return;
		quat[bone.name] = bone.quaternion.clone();
		pos[bone.name] = bone.position.clone();
	});
	model.updateMatrixWorld(true);
	const len = (a, b) => {
		const A = model.getObjectByName(a);
		const B = model.getObjectByName(b);
		return A.getWorldPosition(new Vector3()).distanceTo(B.getWorldPosition(new Vector3()));
	};
	const footY = (name) => model.getObjectByName(name).getWorldPosition(new Vector3()).y;
	return {
		quat,
		pos,
		groundY: model.position.y,
		footClear: Math.min(footY("LeftFoot"), footY("RightFoot")),
		l1: len("LeftArm", "LeftForeArm"),
		l2: len("LeftForeArm", "LeftHand"),
		r1: len("RightArm", "RightForeArm"),
		r2: len("RightForeArm", "RightHand")
	};
}
var _q = new Quaternion();
var _e = new Euler();
var _m = new Matrix4();
var _inv = new Quaternion();
var _x = new Vector3();
var _y = new Vector3();
var _z = new Vector3();
var _p = new Vector3();
var _a = new Vector3();
var _b = new Vector3();
var _c = new Vector3();
var _fwd = new Vector3();
var _left = new Vector3();
var _up = new Vector3(0, 1, 0);
var _down = new Vector3(0, -1, 0);
var _lt = new Vector3();
var _rt = new Vector3();
var _poleL = new Vector3();
var _poleR = new Vector3();
var _jab = new Vector3();
var _in = new Vector3();
var _elbow = new Vector3();
var _finger = new Vector3();
var _palm = new Vector3();
function pointHand(model, name, finger, palm) {
	const hand = bone(model, name);
	if (!hand || finger.lengthSq() < 1e-6) return;
	_finger.copy(finger).normalize();
	_palm.copy(palm);
	_palm.addScaledVector(_finger, -_palm.dot(_finger));
	if (_palm.lengthSq() < 1e-6) _palm.set(0, -1, 0);
	_palm.normalize();
	hand.updateMatrixWorld(true);
	const origin = hand.getWorldPosition(_p);
	_a.copy(origin).add(_finger);
	aimY(hand, _a, _palm);
}
function punchExtend(t) {
	if (t < .16) return 0;
	if (t < .38) return (t - .16) / .22;
	if (t < .58) return 1;
	return Math.max(0, 1 - (t - .58) / .42);
}
function bone(model, name) {
	return model.getObjectByName(name);
}
function resetPose(model, rest) {
	for (const [name, q] of Object.entries(rest.quat)) {
		const part = bone(model, name);
		if (!part) continue;
		part.quaternion.copy(q);
		const p = rest.pos[name];
		if (p) part.position.copy(p);
	}
}
function twist(model, rest, name, x, y, z) {
	const part = bone(model, name);
	const q = rest.quat[name];
	if (!part || !q || Math.abs(x) + Math.abs(y) + Math.abs(z) < 1e-4) return;
	part.quaternion.copy(q).multiply(_q.setFromEuler(_e.set(x, y, z)));
}
function aimY(part, target, pole) {
	part.updateMatrixWorld(true);
	const origin = part.getWorldPosition(_p);
	_y.copy(target).sub(origin);
	if (_y.lengthSq() < 1e-8) return;
	_y.normalize();
	_z.copy(pole);
	if (_z.lengthSq() < 1e-8) _z.copy(_down);
	_z.normalize();
	_x.crossVectors(_y, _z);
	if (_x.lengthSq() < 1e-6) {
		_z.set(1, 0, 0);
		_x.crossVectors(_y, _z);
	}
	_x.normalize();
	_z.crossVectors(_x, _y).normalize();
	_m.makeBasis(_x, _y, _z);
	_q.setFromRotationMatrix(_m);
	const parent = part.parent;
	if (!parent) return;
	parent.getWorldQuaternion(_inv);
	part.quaternion.copy(_inv.invert()).multiply(_q);
}
function elbowAt(shoulder, hand, l1, l2, pole, out) {
	_a.copy(hand).sub(shoulder);
	const raw = _a.length() || .001;
	const max = l1 + l2 * .98;
	const min = Math.abs(l1 - l2) + .02;
	const dist = Math.min(max, Math.max(min, raw));
	_a.multiplyScalar(1 / raw);
	const cosA = MathUtils.clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1);
	const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
	_b.copy(pole);
	_b.addScaledVector(_a, -_b.dot(_a));
	if (_b.lengthSq() < 1e-6) _b.copy(_down);
	_b.normalize();
	out.copy(shoulder).addScaledVector(_a, cosA * l1).addScaledVector(_b, sinA * l1);
}
function solveArm(model, armName, foreName, l1, l2, target, pole, twistAmt = .05) {
	const arm = bone(model, armName);
	const fore = bone(model, foreName);
	if (!arm || !fore) return;
	arm.updateMatrixWorld(true);
	elbowAt(arm.getWorldPosition(_c), target, l1, l2, pole, _elbow);
	aimY(arm, _elbow, pole);
	arm.updateMatrixWorld(true);
	aimY(fore, target, pole);
	fore.quaternion.multiply(_q.setFromAxisAngle(_y.set(0, 1, 0), armName.startsWith("Left") ? twistAmt : -twistAmt));
}
function advanceSwing(fx, attacking, dt, dur) {
	if (attacking && fx.swing <= 0) {
		fx.swing = .001;
		fx.spawned = false;
	}
	if (fx.swing > 0) {
		fx.swing += dt / Math.max(.22, dur);
		if (fx.swing >= 1) {
			fx.swing = attacking ? .001 : 0;
			fx.spawned = false;
			if (attacking) fx.side *= -1;
		}
	}
}
function punchArc(fx, origin, dt) {
	const t = fx.swing > 0 ? Math.min(fx.swing, .999) : 0;
	if ((t > 0 ? punchExtend(t) : 0) > .92 && !fx.spawned) {
		fx.spawned = true;
		const arc = fx.arcs.find((item) => item.life >= 1) ?? fx.arcs[0];
		arc.mesh.position.copy(origin);
		arc.mesh.rotation.set(.2, fx.side * .2, fx.side * -.4);
		arc.mesh.scale.setScalar(1);
		arc.mesh.visible = true;
		arc.life = 0;
	}
	for (const arc of fx.arcs) {
		if (arc.life >= 1) continue;
		arc.life += dt / .14;
		const k = Math.min(1, arc.life);
		arc.mesh.material.opacity = (1 - k) * .65;
		arc.mesh.scale.setScalar(1 + k * .35);
		if (arc.life >= 1) arc.mesh.visible = false;
	}
}
function poseFighter(model, rest, opts) {
	const { moving, run, cycle, time, swing, side, armed = false } = opts;
	const style = opts.style ?? (armed ? "sword" : "fist");
	resetPose(model, rest);
	const stride = Math.sin(cycle);
	const passing = Math.cos(cycle);
	const gait = moving ? 1 : 0;
	const thigh = (.28 + run * .2) * gait;
	twist(model, rest, "LeftUpLeg", gait ? stride * thigh : 0, 0, 0);
	twist(model, rest, "RightUpLeg", gait ? -stride * thigh : 0, 0, 0);
	const kneeL = gait ? -.06 - Math.max(0, passing) * (.36 + run * .2) : 0;
	const kneeR = gait ? -.06 - Math.max(0, -passing) * (.36 + run * .2) : 0;
	twist(model, rest, "LeftLeg", kneeL, 0, 0);
	twist(model, rest, "RightLeg", kneeR, 0, 0);
	twist(model, rest, "LeftFoot", gait ? .02 - stride * .12 : 0, 0, 0);
	twist(model, rest, "RightFoot", gait ? .02 + stride * .12 : 0, 0, 0);
	const extend = swing > 0 ? punchExtend(swing) : 0;
	const leadRight = style !== "fist" || side > 0;
	const sway = Math.sin(cycle * 2) * .03 * gait * (1 - run * .35);
	const lean = extend * (leadRight ? -.08 : .08);
	const sprint = moving && run > .45 ? 1 : 0;
	twist(model, rest, "Hips", sprint * .1, -sway, 0);
	twist(model, rest, "Spine", sprint * .12, sway * .2, 0);
	twist(model, rest, "Spine1", sprint * .05 + extend * .03, sway * .3 + lean, 0);
	twist(model, rest, "Spine2", 0, sway * .15, 0);
	const pulse = Math.sin(time * (1.3 + run * 2.2));
	const chest = model.getObjectByName("Spine2");
	if (chest) chest.scale.set(1 + pulse * .012, 1, 1 + pulse * .008);
	model.updateMatrixWorld(true);
	const fwd = model.getWorldDirection(_fwd);
	const left = _left.set(1, 0, 0).applyQuaternion(model.getWorldQuaternion(_q));
	const reach = (out, armName, fwdMul, upMul, sideMul) => {
		const shoulder = bone(model, armName).getWorldPosition(_p);
		out.copy(shoulder).addScaledVector(fwd, fwdMul).addScaledVector(_up, upMul).addScaledVector(left, sideMul);
	};
	const swingArm = (out, armName, sign, outward) => {
		const shoulder = bone(model, armName).getWorldPosition(_p);
		out.copy(shoulder).addScaledVector(_up, -.32 + run * .02).addScaledVector(fwd, sign * stride * (.26 + run * .08)).addScaledVector(left, outward);
	};
	const lT = _lt;
	const rT = _rt;
	const punchRight = leadRight;
	const outward = punchRight ? -1 : 1;
	if (style === "fist") {
		if (moving && swing <= 0 && run > .45) {
			reach(lT, "LeftArm", .22, -.06, .14);
			reach(rT, "RightArm", .22, -.06, -.14);
		} else if (moving && swing <= 0) {
			swingArm(lT, "LeftArm", -1, .1);
			swingArm(rT, "RightArm", 1, -.1);
		} else if (swing <= 0) {
			reach(lT, "LeftArm", .02, -.46, .16);
			reach(rT, "RightArm", .02, -.46, -.16);
		}
		if (swing > 0) {
			const shoulder = bone(model, punchRight ? "RightArm" : "LeftArm").getWorldPosition(_jab);
			const chamber = _a.copy(shoulder).addScaledVector(_up, .16).addScaledVector(fwd, .08).addScaledVector(left, outward * .14);
			const strike = _c.copy(shoulder).addScaledVector(fwd, .55).addScaledVector(_up, .08).addScaledVector(left, outward * .02);
			(punchRight ? rT : lT).copy(chamber).lerp(strike, extend);
		}
	} else if (style === "bow") {
		const pull = swing > 0 ? extend : 0;
		reach(lT, "LeftArm", .36, -.04, .14);
		reach(rT, "RightArm", .2 - pull * .24, -.02, -.04);
	} else if (style === "staff") {
		reach(lT, "LeftArm", .34, -.12, .1);
		reach(rT, "RightArm", .26, .18, -.06);
		if (swing > 0) {
			lT.addScaledVector(fwd, extend * .16);
			rT.addScaledVector(fwd, extend * .22).addScaledVector(_up, extend * .04);
		}
	} else if (style === "dagger") {
		const hitRight = side > 0;
		if (moving && swing <= 0 && run > .55) {
			swingArm(lT, "LeftArm", -1, .08);
			swingArm(rT, "RightArm", 1, -.08);
		} else {
			reach(lT, "LeftArm", .22, -.08, .14);
			reach(rT, "RightArm", .22, -.08, -.14);
		}
		if (swing > 0) {
			const shoulder = bone(model, hitRight ? "RightArm" : "LeftArm").getWorldPosition(_jab);
			const outward = hitRight ? -1 : 1;
			const cocked = _a.copy(shoulder).addScaledVector(_up, .05).addScaledVector(fwd, .08).addScaledVector(left, outward * .14);
			const cut = _c.copy(shoulder).addScaledVector(fwd, .5).addScaledVector(left, outward * .02).addScaledVector(_up, .02);
			(hitRight ? rT : lT).copy(cocked).lerp(cut, extend);
		}
	} else if (style === "pala") {
		reach(rT, "RightArm", .04, -.5, -.2);
		reach(lT, "LeftArm", .1, -.32, -.02);
		if (swing > 0) {
			const shoulder = bone(model, "RightArm").getWorldPosition(_jab);
			const cocked = _a.copy(shoulder).addScaledVector(_up, .02).addScaledVector(left, -.28).addScaledVector(fwd, -.05);
			const cut = _c.copy(shoulder).addScaledVector(fwd, .42).addScaledVector(left, -.05).addScaledVector(_up, -.05);
			rT.copy(cocked).lerp(cut, extend);
			lT.addScaledVector(fwd, extend * .28).addScaledVector(left, -extend * .12);
		}
	} else {
		const len = .5;
		if (moving && swing <= 0) swingArm(lT, "LeftArm", -1, .1);
		else reach(lT, "LeftArm", .06, -.42, .16);
		if (swing > 0) {
			const shoulder = bone(model, "RightArm").getWorldPosition(_jab);
			const cocked = _a.copy(shoulder).addScaledVector(_up, .1).addScaledVector(fwd, -.02).addScaledVector(left, -.2);
			const cut = _c.copy(shoulder).addScaledVector(fwd, len).addScaledVector(left, .12).addScaledVector(_up, .02);
			rT.copy(cocked).lerp(cut, extend);
		} else reach(rT, "RightArm", .1, -.16, -.16);
	}
	if (moving && swing <= 0) {
		_poleL.copy(fwd).multiplyScalar(-.9).addScaledVector(left, .4).addScaledVector(_down, .2);
		_poleR.copy(fwd).multiplyScalar(-.9).addScaledVector(left, -.4).addScaledVector(_down, .2);
	} else {
		_poleL.copy(_down).addScaledVector(left, .4).addScaledVector(fwd, -.45);
		_poleR.copy(_down).addScaledVector(left, -.4).addScaledVector(fwd, -.45);
	}
	solveArm(model, "LeftArm", "LeftForeArm", rest.l1, rest.l2, lT, _poleL, 0);
	solveArm(model, "RightArm", "RightForeArm", rest.r1, rest.r2, rT, _poleR, 0);
	const fingersFwd = _b.copy(fwd).addScaledVector(_up, .18);
	if (style === "fist") {
		if (swing > 0) {
			_in.copy(left);
			if (!punchRight) _in.negate();
			_in.addScaledVector(_down, .35);
			_jab.copy(fwd).addScaledVector(_up, .12);
			pointHand(model, punchRight ? "RightHand" : "LeftHand", _jab, _in);
			pointHand(model, punchRight ? "LeftHand" : "RightHand", fingersFwd, _down);
		} else {
			pointHand(model, "LeftHand", fingersFwd, _down);
			pointHand(model, "RightHand", fingersFwd, _down);
		}
	} else if (style === "bow") {
		const pull = swing > 0 ? extend : 0;
		pointHand(model, "LeftHand", _up, _jab.copy(fwd).negate());
		_in.copy(fwd).multiplyScalar(pull > .2 ? -.85 : -.25).addScaledVector(_up, .08);
		pointHand(model, "RightHand", _in, _down);
	} else if (style === "staff") {
		_jab.copy(_up).addScaledVector(fwd, .35);
		pointHand(model, "LeftHand", _jab, left);
		pointHand(model, "RightHand", _up, left);
	} else if (style === "dagger") {
		_jab.copy(fwd).addScaledVector(_up, .1);
		pointHand(model, "RightHand", _jab, left);
		pointHand(model, "LeftHand", _jab, _in.copy(left).negate());
	} else if (style === "pala") {
		_jab.copy(_down).addScaledVector(fwd, .15);
		pointHand(model, "RightHand", _jab, left);
		pointHand(model, "LeftHand", _jab, left);
	} else {
		pointHand(model, "LeftHand", fingersFwd, _down);
		_jab.copy(_up).multiplyScalar(.82).addScaledVector(fwd, swing > 0 ? .15 + extend * .9 : .2);
		pointHand(model, "RightHand", _jab, left);
	}
	const curl = style === "fist" ? 1.35 : 1.15;
	for (const [name, ang] of Object.entries(FIST)) {
		const part = bone(model, name);
		const q = rest.quat[name];
		if (!part || !q) continue;
		const thumb = name.includes("Thumb");
		const sideSign = name.startsWith("Left") ? 1 : -1;
		part.quaternion.copy(q).multiply(_q.setFromEuler(_e.set(ang * curl, thumb ? .15 * sideSign : 0, thumb ? .2 * sideSign : 0)));
	}
	model.position.y = rest.groundY;
	model.updateMatrixWorld(true);
	const fy = Math.min(bone(model, "LeftFoot").getWorldPosition(_p).y, bone(model, "RightFoot").getWorldPosition(_a).y);
	model.position.y -= fy - rest.footClear;
	if (run > .2 && moving) model.position.y += Math.abs(Math.sin(cycle * 2)) ** 2 * .02 * run;
}
var _look = new Vector3();
var _aim = new Vector3();
var _desired = new Vector3();
var _cam = new Vector3(8, 7, 16);
var _plate = new Vector3();
var _ndc = new Vector2();
var _picker = new Raycaster();
function cylinderT(ray, cx, cz, radius, y0, y1) {
	const ox = ray.origin.x - cx;
	const oz = ray.origin.z - cz;
	const dx = ray.direction.x;
	const dz = ray.direction.z;
	const a = dx * dx + dz * dz;
	if (a < 1e-6) {
		if (ox * ox + oz * oz > radius * radius) return null;
		const dy = ray.direction.y;
		if (Math.abs(dy) < 1e-6) return null;
		const ta = (y0 - ray.origin.y) / dy;
		const tb = (y1 - ray.origin.y) / dy;
		const near = Math.min(ta, tb);
		const far = Math.max(ta, tb);
		if (far < .08) return null;
		return near > .08 ? near : far;
	}
	const b = 2 * (ox * dx + oz * dz);
	const c = ox * ox + oz * oz - radius * radius;
	const disc = b * b - 4 * a * c;
	if (disc < 0) return null;
	const s = Math.sqrt(disc);
	const inv = 1 / (2 * a);
	const ta = (-b - s) * inv;
	const tb = (-b + s) * inv;
	const inside = (t) => {
		if (t < .08) return false;
		const y = ray.origin.y + ray.direction.y * t;
		return y >= y0 && y <= y1;
	};
	if (inside(ta)) return ta;
	if (inside(tb)) return tb;
	return null;
}
function remoteLabel(text) {
	const canvas = document.createElement("canvas");
	canvas.width = 256;
	canvas.height = 64;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.fillStyle = "rgba(28,25,22,0.75)";
		ctx.fillRect(24, 8, 208, 48);
		ctx.fillStyle = "#f3efe8";
		ctx.font = "24px sans-serif";
		ctx.textAlign = "center";
		ctx.fillText(text, 128, 40);
	}
	const map = new CanvasTexture(canvas);
	map.colorSpace = SRGBColorSpace;
	const sprite = new Sprite(new SpriteMaterial({
		map,
		transparent: true,
		depthWrite: false
	}));
	sprite.scale.set(1.35, .34, 1);
	sprite.position.y = 2.08;
	sprite.userData.canvas = canvas;
	return sprite;
}
function paintLabel(sprite, text) {
	const canvas = sprite.userData.canvas;
	const ctx = canvas.getContext("2d");
	const mat = sprite.material;
	if (!ctx || !mat.map) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "rgba(28,25,22,0.75)";
	ctx.fillRect(24, 8, 208, 48);
	ctx.fillStyle = "#f3efe8";
	ctx.font = "24px sans-serif";
	ctx.textAlign = "center";
	ctx.fillText(text, 128, 40);
	mat.map.needsUpdate = true;
}
function spawnRemote(template) {
	const model = clone(template);
	model.rotation.y = Math.PI;
	model.traverse((obj) => {
		const mesh = obj;
		if (mesh.isMesh) {
			if (mesh.isMesh) mesh.castShadow = false;
		}
	});
	const root = new Group();
	root.add(model);
	model.updateMatrixWorld(true);
	const rest = captureRest(model);
	const tag = remoteLabel("");
	root.add(tag);
	return {
		root,
		model,
		rest,
		tag,
		label: "",
		gear: "",
		phase: 0,
		prevX: 0,
		prevZ: 0,
		face: Math.PI
	};
}
function alignRemote(av, dx, dz) {
	if (dx * dx + dz * dz < 1e-6) {
		av.model.rotation.y = av.face;
		return;
	}
	const score = (extra) => {
		av.model.rotation.y = Math.PI + extra;
		av.model.updateMatrixWorld(true);
		const e = av.model.matrixWorld.elements;
		return e[8] * dx + e[10] * dz;
	};
	const keep = score(0);
	const flip = score(Math.PI);
	av.face = Math.PI + (flip > keep ? Math.PI : 0);
	av.model.rotation.y = av.face;
}
function syncRemoteGear(model, body) {
	const style = body.style || "sword";
	syncGear(model, {
		weapon: body.weapon ? { id: style === "fist" ? "" : `starter-${style === "sword" ? "sword" : style}` } : null,
		helmet: body.helmet ? 1 : null,
		armor: body.armor ? 1 : null,
		boots: body.boots ? 1 : null,
		earring: null,
		necklace: null,
		bracelet: null,
		ring: null,
		gloves: null,
		belt: null
	});
}
var SKIN = "#c48b6a";
var SHORTS = "#1a1c18";
function dominantBone(geo, bones, index) {
	const skinIndex = geo.attributes.skinIndex;
	const skinWeight = geo.attributes.skinWeight;
	if (!skinIndex || !skinWeight) return "";
	let best = 0;
	let bone = 0;
	for (let k = 0; k < 4; k++) {
		const weight = skinWeight.getComponent(index, k);
		if (weight > best) {
			best = weight;
			bone = skinIndex.getComponent(index, k);
		}
	}
	return bones[bone]?.name ?? "";
}
function dress(model) {
	const mesh = model.getObjectByProperty("isMesh", true);
	const material = mesh?.material;
	const map = material?.map;
	const image = map?.image;
	const geo = mesh?.geometry;
	const bones = mesh?.skeleton?.bones;
	if (!mesh || !material || !map || !image || !geo?.index || !geo.attributes.uv || !bones) return;
	const width = image.width || image.width;
	const height = image.height || image.height;
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx || !width || !height) return;
	ctx.drawImage(image, 0, 0);
	const pixels = ctx.getImageData(0, 0, width, height).data;
	const uv = geo.attributes.uv;
	const pos = geo.attributes.position;
	const sample = (vertex) => {
		const x = Math.min(width - 1, Math.max(0, Math.floor(uv.getX(vertex) * (width - 1))));
		const offset = (Math.min(height - 1, Math.max(0, Math.floor(uv.getY(vertex) * (height - 1)))) * width + x) * 4;
		return [
			pixels[offset] ?? 0,
			pixels[offset + 1] ?? 0,
			pixels[offset + 2] ?? 0
		];
	};
	const isSkin = (vertex) => {
		const [r, g, b] = sample(vertex);
		return r > 135 && r > g + 18 && r > b + 18;
	};
	const kind = new Uint8Array(pos.count);
	for (let i = 0; i < pos.count; i++) {
		const name = dominantBone(geo, bones, i);
		const y = pos.getY(i);
		if (/Foot|Toe/.test(name)) kind[i] = 4;
		else if (name === "LeftLeg" || name === "RightLeg") kind[i] = 5;
		else if ((name === "LeftUpLeg" || name === "RightUpLeg") && y < .78) kind[i] = 5;
		else if (/Hips|UpLeg/.test(name)) kind[i] = 2;
		else if (/ForeArm/.test(name) && !isSkin(i)) kind[i] = 6;
		else if ((name === "LeftArm" || name === "RightArm") && !isSkin(i)) kind[i] = 3;
		else if (/Spine|Shoulder/.test(name)) kind[i] = 1;
	}
	const paint = (color, a, b, c) => {
		ctx.fillStyle = color;
		ctx.strokeStyle = color;
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(uv.getX(a) * (width - 1), uv.getY(a) * (height - 1));
		ctx.lineTo(uv.getX(b) * (width - 1), uv.getY(b) * (height - 1));
		ctx.lineTo(uv.getX(c) * (width - 1), uv.getY(c) * (height - 1));
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	};
	const src = geo.index;
	for (let t = 0; t < src.count; t += 3) {
		const a = src.getX(t);
		const b = src.getX(t + 1);
		const c = src.getX(t + 2);
		const votes = [
			kind[a],
			kind[b],
			kind[c]
		];
		const majority = (id) => votes.filter((item) => item === id).length >= 2;
		if (!votes.some((item) => item > 0)) continue;
		if (majority(1) || majority(3) || majority(4) || majority(5) || majority(6)) paint(SKIN, a, b, c);
		else if (majority(2)) paint(SHORTS, a, b, c);
	}
	const next = new CanvasTexture(canvas);
	next.flipY = map.flipY;
	next.colorSpace = SRGBColorSpace;
	next.anisotropy = 2;
	next.wrapS = map.wrapS;
	next.wrapT = map.wrapT;
	next.needsUpdate = true;
	mesh.material = new MeshLambertMaterial({ map: next });
}
var _mob = new Vector3();
function paintMob(camera, id, title, hp, hpMax, x, y, z, show) {
	const host = document.getElementById("mob-bars");
	if (!host) return;
	let el = document.getElementById(id);
	if (!el) {
		el = document.createElement("div");
		el.id = id;
		el.style.cssText = "position:absolute;transform:translate(-50%,-120%);width:11rem;pointer-events:none;background:rgba(20,17,14,0.88);border:1px solid #3f3830;border-radius:8px;padding:4px 8px 5px";
		el.innerHTML = "<p style=\"margin:0 0 3px;text-align:center;font-size:13px;color:#c9a15b;text-shadow:0 1px 2px #1c1916\"></p><div style=\"height:10px;border:1px solid #3f3830;background:#1c1916;border-radius:3px;overflow:hidden\"><span style=\"display:block;height:100%;background:#b5443c;width:100%\"></span></div><p style=\"margin:3px 0 0;text-align:center;font-size:12px;color:#f3efe8\"></p>";
		host.appendChild(el);
	}
	if (!show) {
		el.style.display = "none";
		return;
	}
	_mob.set(x, y, z).project(camera);
	if (_mob.z > 1) {
		el.style.display = "none";
		return;
	}
	el.style.display = "block";
	el.style.left = `${(_mob.x * .5 + .5) * 100}%`;
	el.style.top = `${(-_mob.y * .5 + .5) * 100}%`;
	const name = el.children[0];
	const fill = el.querySelector("span");
	const num = el.children[2];
	if (name.textContent !== title) name.textContent = title;
	const ratio = Math.max(0, Math.min(1, hp / Math.max(1, hpMax)));
	fill.style.width = `${ratio * 100}%`;
	const label = `${Math.ceil(Math.max(0, hp))} / ${Math.ceil(hpMax)}`;
	if (num.textContent !== label) num.textContent = label;
}
function dampAngle(current, target, lambda, dt) {
	return current + Math.atan2(Math.sin(target - current), Math.cos(target - current)) * (1 - Math.exp(-lambda * dt));
}
function makeSelectRing() {
	const ring = new Group();
	ring.name = "select-ring";
	const band = new Mesh(new RingGeometry(.62, .7, 48), new MeshBasicMaterial({
		color: "#e23b3b",
		transparent: true,
		opacity: .92,
		side: 2,
		depthWrite: false,
		polygonOffset: true,
		polygonOffsetFactor: -2
	}));
	band.rotation.x = -Math.PI / 2;
	band.position.y = .02;
	ring.add(band);
	ring.position.y = .03;
	return ring;
}
function mobCamps() {
	return SPECIES.flatMap((spec, index) => {
		const copies = spec.level <= 20 ? 4 : 3;
		return Array.from({ length: copies }, (_, n) => {
			let x = 0;
			let z = 0;
			for (let attempt = 0; attempt < 12; attempt++) {
				const a = index * .62 + n * 2.05 + attempt * .47;
				const band = Math.min(142, 74 + spec.level * .42 + n * 5 + attempt % 4 * 3.5);
				x = Math.cos(a) * band;
				z = Math.sin(a) * band;
				if (!blocked(x, z, .85) && !inWater(x, z, .7) && Math.hypot(x, z) > 68) break;
			}
			if (Math.hypot(x, z) < 68) {
				const a = index * .7 + n * 1.4;
				x = Math.cos(a) * 80;
				z = Math.sin(a) * 80;
			}
			return {
				spec,
				x,
				z,
				id: `${spec.id}-${n}`,
				pack: index
			};
		});
	});
}
function angerPack(list, pack) {
	for (const beast of list) if (beast.pack === pack) beast.anger = true;
}
function World() {
	const { camera, gl, scene } = useThree();
	(0, import_react.useEffect)(() => {
		loadGfx();
		const apply = () => {
			const g = readGfx();
			const q = g.auto ? autoQuality() : g.quality;
			const fps = g.fps <= 30 ? .75 : g.fps >= 120 ? 1.15 : 1;
			gl.setPixelRatio(Math.min(1.6, window.devicePixelRatio * q * fps));
		};
		apply();
		const unsub = subscribeGfx(apply);
		return () => {
			unsub();
		};
	}, [gl]);
	const lightRef = (0, import_react.useRef)(null);
	const rigRef = (0, import_react.useRef)(null);
	const mixerRef = (0, import_react.useRef)(null);
	const actRef = (0, import_react.useRef)({});
	(0, import_react.useRef)("idle");
	(0, import_react.useRef)("walk");
	const puffsRef = (0, import_react.useRef)([]);
	const wasPlaying = (0, import_react.useRef)(false);
	const dustRef = (0, import_react.useRef)([]);
	const dummyRef = (0, import_react.useRef)(null);
	const beastsRef = (0, import_react.useRef)([]);
	const mentorsRef = (0, import_react.useRef)([]);
	const lootRoot = (0, import_react.useRef)(null);
	const lootMeshes = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const packLeft = (0, import_react.useRef)(Array.from({ length: 24 }, () => 0));
	const mobClock = (0, import_react.useRef)(0);
	const landRef = (0, import_react.useRef)(() => void 0);
	const wellRef = (0, import_react.useRef)(null);
	const smithRef = (0, import_react.useRef)(null);
	const townsRef = (0, import_react.useRef)([]);
	const gearRev = (0, import_react.useRef)(-1);
	const hitLatch = (0, import_react.useRef)(false);
	const fist = (0, import_react.useRef)(new Vector3());
	const stepRef = (0, import_react.useRef)(0);
	const footRef = (0, import_react.useRef)(1);
	const fighterRef = (0, import_react.useRef)(null);
	const armRef = (0, import_react.useRef)(null);
	const restRef = (0, import_react.useRef)(null);
	const modelRef = (0, import_react.useRef)(null);
	const templateRef = (0, import_react.useRef)(null);
	const remoteRootRef = (0, import_react.useRef)(null);
	const remoteAvatars = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	(0, import_react.useRef)(1);
	const runBlend = (0, import_react.useRef)(0);
	const lifeRef = (0, import_react.useRef)(0);
	const weatherRef = (0, import_react.useRef)(null);
	const combatRef = (0, import_react.useRef)(null);
	const shotLatch = (0, import_react.useRef)(false);
	const ringRef = (0, import_react.useRef)(null);
	(0, import_react.useLayoutEffect)(() => {
		let dead = false;
		const group = new Group();
		scene.add(group);
		weatherRef.current = createWeather(scene);
		combatRef.current = createCombat(scene);
		const ring = makeSelectRing();
		ring.visible = false;
		group.add(ring);
		ringRef.current = ring;
		const holder = new Group();
		holder.position.set(sim.x, 0, sim.z);
		group.add(holder);
		rigRef.current = holder;
		const remoteRoot = new Group();
		group.add(remoteRoot);
		remoteRootRef.current = remoteRoot;
		const smithNpc = createVendor("smith", -15.05, 18.35, Math.atan2(15.05, 8 - 18.35));
		const beasts = [];
		for (const spot of mobCamps()) {
			const beast = createBeast(spot.x, spot.z, spot.id, spot.pack, spot.spec);
			beasts.push(beast);
			group.add(beast.root);
		}
		const mentors = MENTORS.map((row) => {
			const mentor = createMentor(row.name, row.x, row.z, faceYaw(row.x, row.z), row.cls);
			const arrow = new Mesh(new ConeGeometry(.14, .38, 8), new MeshBasicMaterial({ color: "#e6c36a" }));
			arrow.rotation.x = Math.PI;
			arrow.position.y = 2.35;
			arrow.name = "skill-arrow";
			arrow.visible = false;
			mentor.root.add(arrow);
			group.add(mentor.root);
			const pad = new Mesh(new CylinderGeometry(1.05, 1.15, .07, 20), new MeshStandardMaterial({
				color: "#9a9286",
				roughness: .86
			}));
			pad.position.set(row.x, .04, row.z);
			const ring = new Mesh(new TorusGeometry(1.08, .06, 6, 20), new MeshStandardMaterial({
				color: "#6e675e",
				roughness: .8
			}));
			ring.rotation.x = Math.PI / 2;
			ring.position.set(row.x, .09, row.z);
			group.add(pad, ring);
			return mentor;
		});
		const lootHost = new Group();
		group.add(lootHost);
		lootRoot.current = lootHost;
		const townDefs = [
			{
				role: "guard",
				name: "Köy Muhafızı",
				x: 2.2,
				z: 2.5,
				cloth: "#3a4634",
				spear: true,
				yaw: Math.atan2(-2.2, 51.5)
			},
			{
				role: "armor",
				name: "Zırhçı",
				x: -20.4,
				z: .4,
				cloth: "#4a4036"
			},
			{
				role: "weapon",
				name: "Silahçı",
				x: 20.4,
				z: -.2,
				cloth: "#4a3434"
			},
			{
				role: "market",
				name: "Satıcı",
				x: -12.95,
				z: 19.85,
				cloth: "#314438"
			},
			{
				role: "depot",
				name: "Depo",
				x: 11.2,
				z: 24.2,
				cloth: "#343844"
			},
			{
				role: "stable",
				name: "Seyis",
				x: 16.6,
				z: 16.4,
				cloth: "#5a4630"
			},
			{
				role: "fisher",
				name: "Balıkçı",
				x: 33,
				z: 56,
				cloth: "#2c4550"
			},
			{
				role: "miner",
				name: "Madenci",
				x: 70,
				z: 10,
				cloth: "#4a4034"
			}
		];
		const padGeo = new CylinderGeometry(1.15, 1.25, .07, 22);
		const ringGeo = new TorusGeometry(1.18, .07, 6, 22);
		const padMat = new MeshStandardMaterial({
			color: "#9a9286",
			roughness: .86
		});
		const ringMat = new MeshStandardMaterial({
			color: "#6e675e",
			roughness: .8
		});
		const dropPad = (x, z) => {
			const pad = new Mesh(padGeo, padMat);
			pad.position.set(x, .04, z);
			const ring = new Mesh(ringGeo, ringMat);
			ring.rotation.x = Math.PI / 2;
			ring.position.set(x, .09, z);
			group.add(pad, ring);
		};
		townsRef.current = townDefs.map((row) => {
			const npc = createTownsman(row.name, row.x, row.z, row.yaw ?? faceYaw(row.x, row.z), row.cloth, Boolean(row.spear));
			if (row.role === "fisher") npc.root.position.y = PIER_TOP;
			else dropPad(row.x, row.z);
			group.add(npc.root);
			return {
				root: npc.root,
				hips: npc.hips,
				role: row.role
			};
		});
		dropPad(smithNpc.root.position.x, smithNpc.root.position.z);
		group.add(smithNpc.root);
		wellRef.current = null;
		smithRef.current = smithNpc;
		beastsRef.current = beasts;
		mentorsRef.current = mentors;
		const dustCanvas = document.createElement("canvas");
		dustCanvas.width = 64;
		dustCanvas.height = 64;
		const dustCtx = dustCanvas.getContext("2d");
		if (dustCtx) {
			const grd = dustCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
			grd.addColorStop(0, "rgba(214,204,186,0.95)");
			grd.addColorStop(1, "rgba(170,150,120,0)");
			dustCtx.fillStyle = grd;
			dustCtx.fillRect(0, 0, 64, 64);
		}
		const dustMap = new CanvasTexture(dustCanvas);
		dustMap.colorSpace = SRGBColorSpace;
		dustRef.current = Array.from({ length: 14 }, () => {
			const sprite = new Sprite(new SpriteMaterial({
				map: dustMap,
				transparent: true,
				depthWrite: false,
				opacity: 0
			}));
			sprite.visible = false;
			sprite.scale.set(.3, .3, .3);
			group.add(sprite);
			return {
				sprite,
				life: 1,
				vy: .4
			};
		});
		const fx = createSwingFx();
		group.add(fx.root);
		fighterRef.current = fx;
		const gltfLoader = new GLTFLoader();
		(async () => {
			try {
				const body = await gltfLoader.loadAsync("/models/man.glb");
				if (dead) return;
				const model = body.scene;
				dress(model);
				model.traverse((obj) => {
					const mesh = obj;
					if (!mesh.isMesh) return;
					mesh.castShadow = false;
					mesh.frustumCulled = true;
				});
				model.rotation.y = Math.PI;
				const bounds = new Box3().setFromObject(model);
				model.position.y = -bounds.min.y;
				model.updateMatrixWorld(true);
				restRef.current = captureRest(model);
				templateRef.current = clone(model);
				holder.add(model);
				modelRef.current = model;
				const pick = (name) => model.getObjectByName(name);
				const need = (name) => {
					const bone = pick(name);
					if (!bone) throw new Error(`missing bone ${name}`);
					return bone;
				};
				armRef.current = {
					left: need("LeftArm"),
					right: need("RightArm"),
					lFore: need("LeftForeArm"),
					rFore: need("RightForeArm"),
					lHand: pick("LeftHand") ?? null,
					rHand: pick("RightHand") ?? null,
					lShoulder: pick("LeftShoulder") ?? null,
					rShoulder: pick("RightShoulder") ?? null,
					spine: pick("Spine") ?? pick("Spine1") ?? null
				};
			} catch (error) {
				console.error(error);
			}
		})();
		const temp = new Mesh(new CircleGeometry(28, 24), new MeshStandardMaterial({
			color: "#4d5a3e",
			roughness: 1
		}));
		temp.rotation.x = -Math.PI / 2;
		temp.receiveShadow = true;
		group.add(temp);
		const light = lightRef.current;
		if (light) scene.add(light.target);
		const loader = new TextureLoader();
		const load = (url) => new Promise((resolve, reject) => {
			loader.load(url, resolve, void 0, reject);
		});
		let sky = null;
		(async () => {
			try {
				const [stone, wood, thatch, skyTex] = await Promise.all([
					load("/textures/stone.jpg"),
					load("/textures/wood.jpg"),
					load("/textures/thatch.jpg"),
					load("/textures/sky.jpg")
				]);
				if (dead) return;
				const ground = await composeGround();
				if (dead) return;
				group.remove(temp);
				temp.geometry.dispose();
				temp.material.dispose();
				const built = buildVillage({
					stone,
					wood,
					thatch,
					ground
				});
				group.add(built.root);
				puffsRef.current = built.puffs;
				if (built.dummy) dummyRef.current = adoptDummy(built.dummy);
				skyTex.colorSpace = SRGBColorSpace;
				sky = new Mesh(new SphereGeometry(520, 28, 16, 0, Math.PI * 2, 0, Math.PI * .52), new MeshBasicMaterial({
					map: skyTex,
					side: 1,
					fog: false,
					depthWrite: false
				}));
				sky.position.y = -18;
				scene.add(sky);
				const pmrem = new PMREMGenerator(gl);
				const envSrc = skyTex.clone();
				envSrc.mapping = 303;
				envSrc.needsUpdate = true;
				scene.environment = pmrem.fromEquirectangular(envSrc).texture;
				scene.environmentIntensity = .4;
				pmrem.dispose();
				useHud.getState().setReady(true);
			} catch (error) {
				console.error(error);
			}
		})();
		return () => {
			dead = true;
			weatherRef.current?.dispose();
			weatherRef.current = null;
			combatRef.current?.dispose();
			combatRef.current = null;
			const ring = ringRef.current;
			if (ring) {
				ring.parent?.remove(ring);
				ring.traverse((obj) => {
					const mesh = obj;
					if (!mesh.isMesh) return;
					mesh.geometry.dispose();
					const mat = mesh.material;
					if (Array.isArray(mat)) mat.forEach((item) => item.dispose());
					else mat.dispose();
				});
			}
			ringRef.current = null;
			scene.remove(group);
			if (sky) scene.remove(sky);
			if (light) scene.remove(light.target);
			disposeScenery();
			mixerRef.current?.stopAllAction();
			mixerRef.current = null;
			actRef.current = {};
			rigRef.current = null;
			puffsRef.current = [];
			dustRef.current = [];
			fighterRef.current = null;
			restRef.current = null;
			modelRef.current = null;
			templateRef.current = null;
			remoteRootRef.current = null;
			remoteAvatars.current.clear();
			dummyRef.current = null;
			beastsRef.current = [];
			mentorsRef.current = [];
			townsRef.current = [];
			lootMeshes.current.clear();
			lootRoot.current = null;
			wellRef.current = null;
			smithRef.current = null;
		};
	}, [gl, scene]);
	const floatAt = (x, y, z, text, crit) => {
		const host = document.getElementById("combat-floats");
		if (!host) return;
		const el = document.createElement("div");
		el.textContent = text;
		el.className = crit ? "pointer-events-none absolute text-lg font-semibold text-gold" : "pointer-events-none absolute text-base font-semibold text-fg";
		host.appendChild(el);
		const v = _look.set(x, y, z).project(camera);
		el.style.left = `${(v.x * .5 + .5) * 100}%`;
		el.style.top = `${(-v.y * .5 + .5) * 100}%`;
		const born = performance.now();
		const step = () => {
			const k = (performance.now() - born) / 800;
			el.style.opacity = String(Math.max(0, 1 - k));
			el.style.transform = `translate(-50%, ${-k * 36}px)`;
			if (k < 1) requestAnimationFrame(step);
			else el.remove();
		};
		requestAnimationFrame(step);
	};
	const resolveHits = () => {
		const fx = fighterRef.current;
		const arms = armRef.current;
		if (!fx || !arms || fx.swing < .28 || fx.swing > .74) {
			if (!fx || fx.swing < .08) hitLatch.current = false;
			return;
		}
		if (hitLatch.current) return;
		const style = weaponStyleOf(useRpg.getState().equipped.weapon?.id);
		if (style === "bow" || style === "staff") {
			if (fx.swing < .5) {
				if (fx.swing < .12) hitLatch.current = false;
				return;
			}
			if (hitLatch.current) return;
			const reach = style === "bow" ? 22 : 16;
			const sel = readTarget().sel;
			const { duel } = readTarget();
			if (duel.phase === "live") {
				const foe = remotes.get(duel.id);
				const dist = foe ? Math.hypot(foe.x - sim.x, foe.z - sim.z) : 99;
				if (!foe || dist >= reach) {
					hitLatch.current = true;
					useRpg.setState({ toast: "Düello hedefi menzil dışında" });
					return;
				}
				hitLatch.current = true;
				const hit = useRpg.getState().punch();
				sendDuelHit(hit.dmg, hit.crit);
				floatAt(foe.x, 1.6, foe.z, `${hit.crit ? "KRİT " : ""}${hit.dmg}`, hit.crit);
				return;
			}
			const picked = sel?.kind === "mob" && sel.id !== "dummy" ? beastsRef.current.find((beast) => beast.id === sel.id && beast.alive) : null;
			const dummy = dummyRef.current;
			const dummyHit = Boolean(sel?.kind === "mob" && sel.id === "dummy" && dummy?.alive);
			if (!picked && !dummyHit) {
				hitLatch.current = true;
				useRpg.setState({ toast: "Önce bir hedef seç" });
				return;
			}
			const tx = picked ? picked.root.position.x : dummy.root.position.x;
			const tz = picked ? picked.root.position.z : dummy.root.position.z;
			if (Math.hypot(tx - sim.x, tz - sim.z) >= reach) {
				hitLatch.current = true;
				useRpg.setState({ toast: "Hedef menzil dışında" });
				return;
			}
			hitLatch.current = true;
			const hit = useRpg.getState().punch();
			if (dummyHit && dummy) {
				hitDummy(dummy, hit.dmg);
				floatAt(dummy.root.position.x, 1.7, dummy.root.position.z, `${hit.crit ? "KRİT " : ""}${hit.dmg}`, hit.crit);
				if (!dummy.alive) useRpg.setState({ toast: "Kukla yıkıldı" });
			}
			if (picked) landRef.current(picked, hit.dmg, hit.crit);
			return;
		}
		const hand = fx.side > 0 ? arms.rHand : arms.lHand;
		if (!hand) return;
		hand.getWorldPosition(fist.current);
		const reachDist = style === "dagger" ? 1.7 : style === "sword" ? 2.05 : 1.55;
		const reach = (tx, tz, h) => {
			const hand = fist.current.distanceTo(_desired.set(tx, h, tz));
			const body = Math.hypot(sim.x - tx, sim.z - tz);
			return hand < reachDist || body < reachDist + .35;
		};
		const aim = (tx, tz) => {
			const dx = tx - sim.x;
			const dz = tz - sim.z;
			const len = Math.hypot(dx, dz) || 1;
			const fx = -Math.sin(sim.yaw);
			const fz = -Math.cos(sim.yaw);
			return dx / len * fx + dz / len * fz;
		};
		const { duel } = readTarget();
		const leash = style === "dagger" ? 3.3 : 3.6;
		if (duel.phase === "live") {
			const foe = remotes.get(duel.id);
			if (foe && Math.hypot(foe.x - sim.x, foe.z - sim.z) < leash) {
				hitLatch.current = true;
				const hit = useRpg.getState().punch();
				sendDuelHit(hit.dmg, hit.crit);
				floatAt(foe.x, 1.6, foe.z, `${hit.crit ? "KRİT " : ""}${hit.dmg}`, hit.crit);
				return;
			}
		}
		const selNow = readTarget().sel;
		const herd = beastsRef.current;
		const dummy = dummyRef.current;
		const aoe = style === "sword" || style === "dagger";
		const lockedMelee = selNow?.kind === "mob" && selNow.id !== "dummy" ? herd.find((beast) => beast.id === selNow.id && beast.alive && Math.hypot(beast.root.position.x - sim.x, beast.root.position.z - sim.z) < leash) : null;
		const beasts = herd.filter((beast) => beast.alive && reach(beast.root.position.x, beast.root.position.z, 1.05) && aim(beast.root.position.x, beast.root.position.z) > .2);
		const cut = lockedMelee ? [lockedMelee] : aoe ? beasts : beasts.slice(0, 1);
		const dummyHit = Boolean(dummy?.alive && reach(dummy.root.position.x, dummy.root.position.z, 1.25) && aim(dummy.root.position.x, dummy.root.position.z) > .15);
		if (!cut.length && !dummyHit) return;
		hitLatch.current = true;
		const hit = useRpg.getState().punch();
		if (dummyHit && dummy) {
			hitDummy(dummy, hit.dmg);
			floatAt(dummy.root.position.x, 1.7, dummy.root.position.z, `${hit.crit ? "KRİT " : ""}${hit.dmg}`, hit.crit);
			if (!dummy.alive) useRpg.setState({ toast: "Kukla yıkıldı" });
		}
		for (const beast of cut) landRef.current(beast, hit.dmg, hit.crit);
	};
	useFrame((_, delta) => {
		const dt = Math.min(delta, .05);
		const playing = useHud.getState().playing;
		const click = takePick();
		if (click && playing) {
			const rect = gl.domElement.getBoundingClientRect();
			if (rect.width > 2 && rect.height > 2) {
				_ndc.set((click.x - rect.left) / rect.width * 2 - 1, -((click.y - rect.top) / rect.height) * 2 + 1);
				_picker.setFromCamera(_ndc, camera);
				let bestT = 40;
				const hit = {
					best: null,
					talk: null
				};
				const consider = (t, next, npc) => {
					if (t != null && t < bestT) {
						bestT = t;
						hit.best = next;
						hit.talk = npc ?? null;
					}
				};
				const dummyHit = dummyRef.current;
				if (dummyHit?.alive) consider(cylinderT(_picker.ray, dummyHit.root.position.x, dummyHit.root.position.z, .72, 0, 2.5), {
					kind: "mob",
					id: "dummy",
					name: "Talim Kuklası"
				});
				for (const beast of beastsRef.current) {
					if (!beast.alive) continue;
					consider(cylinderT(_picker.ray, beast.root.position.x, beast.root.position.z, .85, 0, 1.9), {
						kind: "mob",
						id: beast.id,
						name: beast.name
					});
				}
				for (const [id, body] of remotes) consider(cylinderT(_picker.ray, body.x, body.z, .58, 0, 2.05), {
					kind: "player",
					id,
					nick: body.nick,
					level: body.level
				});
				for (const town of townsRef.current) consider(cylinderT(_picker.ray, town.root.position.x, town.root.position.z, .55, 0, 2.05), null, {
					role: town.role,
					mentor: null
				});
				for (const mentor of mentorsRef.current) {
					const row = MENTORS.find((item) => item.name === mentor.name);
					consider(cylinderT(_picker.ray, mentor.root.position.x, mentor.root.position.z, .55, 0, 2.05), null, {
						role: "mentor",
						mentor: row?.id ?? null
					});
				}
				const smith = smithRef.current;
				if (smith) consider(cylinderT(_picker.ray, smith.root.position.x, smith.root.position.z, .6, 0, 2.1), null, {
					role: "smith",
					mentor: null
				});
				consider(cylinderT(_picker.ray, 0, 0, .7, 0, 1.3), null, {
					role: "well",
					mentor: null
				});
				for (const vein of VEINS) consider(cylinderT(_picker.ray, vein.x, vein.z, .7, 0, 1.2), null, {
					role: "vein",
					mentor: null
				});
				if (hit.talk) {
					useRpg.getState().setNear(hit.talk.role, hit.talk.mentor);
					useRpg.getState().interact();
				} else if (hit.best) setSelection(hit.best);
				else {
					let dropId = "";
					let dropT = 12;
					for (const row of fieldLoot()) {
						const t = cylinderT(_picker.ray, row.x, row.z, .55, 0, .7);
						if (t != null && t < dropT && Math.hypot(row.x - sim.x, row.z - sim.z) < 2.4) {
							dropT = t;
							dropId = row.id;
						}
					}
					const found = dropId ? takeLoot(dropId) : null;
					if (found) {
						const bag = useRpg.getState().bag.slice();
						const hole = bag.findIndex((slot) => slot == null);
						if (hole < 0) {
							placeLoot(found, sim.x, sim.z);
							useRpg.setState({ toast: "Çanta dolu" });
						} else {
							bag[hole] = found;
							useRpg.setState({
								bag,
								toast: `${found.name} alındı`
							});
						}
					} else if (useRpg.getState().near === "fish") useRpg.getState().interact();
					else setSelection(null);
				}
			}
		}
		const snap = playing && !wasPlaying.current;
		wasPlaying.current = playing;
		if (!playing) {
			sim.speed = 0;
			sim.menuAngle += dt * .07;
		} else {
			const { fwd, str } = axes();
			const camYaw = input.orbit;
			sim.cameraYaw = camYaw;
			const picked = readTarget().sel;
			const locked = picked?.kind === "mob" ? beastsRef.current.find((beast) => beast.id === picked.id && beast.alive) ?? null : null;
			const fx = -Math.sin(camYaw);
			const fz = -Math.cos(camYaw);
			const rx = Math.cos(camYaw);
			const rz = -Math.sin(camYaw);
			const mx = fx * fwd + rx * str;
			const mz = fz * fwd + rz * str;
			const len = Math.hypot(mx, mz);
			const movingNow = len > .08;
			const sprintHeld = held("ShiftLeft") || held("ShiftRight") || input.sprint || input.joyY > .82;
			const sprinting = movingNow && sprintHeld && useRpg.getState().sta > 4;
			const pace = useRpg.getState().moveSpeed(sprinting);
			const target = movingNow ? pace * Math.min(1, len) : 0;
			const rate = movingNow ? 22 : 30;
			sim.speed += (target - sim.speed) * (1 - Math.exp(-rate * dt));
			if (!movingNow && sim.speed < .04) sim.speed = 0;
			if (movingNow) {
				const tx = mx / len;
				const tz = mz / len;
				const turn = 1 - Math.exp(-16 * dt);
				sim.wishX += (tx - sim.wishX) * turn;
				sim.wishZ += (tz - sim.wishZ) * turn;
			} else {
				const fade = Math.exp(-14 * dt);
				sim.wishX *= fade;
				sim.wishZ *= fade;
			}
			const wlen = Math.hypot(sim.wishX, sim.wishZ);
			let moveX = 0;
			let moveZ = 0;
			if (wlen > .05) {
				moveX = sim.wishX / wlen;
				moveZ = sim.wishZ / wlen;
				const nx = sim.x + moveX * sim.speed * dt;
				const nz = sim.z + moveZ * sim.speed * dt;
				const next = slide(sim.x, sim.z, nx, nz, PLAYER_R);
				sim.x = next.x;
				sim.z = next.z;
				sim.phase += dt * (sprinting ? 10.4 : 6.6);
			} else sim.phase += dt * 1.3;
			if (inWater(sim.x, sim.z, 0)) {
				const dry = dryLand(sim.x, sim.z, PLAYER_R);
				if (dry) {
					sim.x = dry.x;
					sim.z = dry.z;
				}
			}
			if (wlen > .05) {
				const face = Math.atan2(-moveX, -moveZ);
				sim.yaw = dampAngle(sim.yaw, face, 14, dt);
			} else if (locked) {
				const face = Math.atan2(-(locked.root.position.x - sim.x), -(locked.root.position.z - sim.z));
				sim.yaw = dampAngle(sim.yaw, face, 12, dt);
			}
			const zone = zoneName(sim.x, sim.z);
			if (zone !== useHud.getState().zone) useHud.getState().setZone(zone);
			const span = bridgeName(sim.x, sim.z);
			if (span) useRpg.getState().notePlace(span);
		}
		const rig = rigRef.current;
		if (rig) {
			rig.position.set(sim.x, groundY(sim.x, sim.z), sim.z);
			rig.rotation.y = sim.yaw;
		}
		const moving = playing && sim.speed > .2;
		lifeRef.current += dt;
		const rpg = useRpg.getState();
		const attacking = playing && held("Space");
		const sprintingNow = playing && moving && (held("ShiftLeft") || held("ShiftRight") || input.sprint);
		runBlend.current += ((sprintingNow ? 1 : 0) - runBlend.current) * (1 - Math.exp(-6 * dt));
		const fx = fighterRef.current;
		if (fx) advanceSwing(fx, attacking, dt, rpg.attackGap());
		const style = weaponStyleOf(rpg.equipped.weapon?.id);
		const armed = style !== "fist";
		if (fx && (style === "sword" || style === "staff" || style === "pala")) fx.side = 1;
		if (modelRef.current && restRef.current) try {
			poseFighter(modelRef.current, restRef.current, {
				moving,
				run: runBlend.current,
				cycle: sim.phase,
				time: lifeRef.current,
				swing: fx?.swing ?? 0,
				side: style === "dagger" || !armed ? fx?.side ?? 1 : 1,
				armed,
				style
			});
			syncBow(modelRef.current, style === "bow" ? punchExtend(fx?.swing ?? 0) : 0);
		} catch (error) {
			console.error(error);
		}
		if (fx) {
			const hand = style === "bow" ? armRef.current?.lHand : fx.side > 0 ? armRef.current?.rHand : armRef.current?.lHand;
			if (hand) hand.getWorldPosition(fist.current);
			punchArc(fx, fist.current, dt);
			if (fx.swing < .12) shotLatch.current = false;
			if ((style === "bow" ? fx.swing > .58 && fx.swing < .76 : style === "staff" && fx.swing > .42 && fx.swing < .62) && !shotLatch.current && modelRef.current) {
				shotLatch.current = true;
				const origin = _aim.copy(fist.current);
				if (origin.y < .6) origin.set(sim.x, 1.25, sim.z);
				const sel = readTarget().sel;
				const mark = sel?.kind === "mob" && sel.id !== "dummy" ? beastsRef.current.find((beast) => beast.id === sel.id && beast.alive) : sel?.kind === "mob" && dummyRef.current?.alive ? dummyRef.current : null;
				const home = mark && "id" in mark && typeof mark.id === "string" ? mark.id : mark ? "dummy" : "";
				if (!mark) shotLatch.current = true;
				else {
					const p = mark.root.position;
					_look.set(p.x - origin.x, 1.05 - origin.y, p.z - origin.z);
					if (style === "bow") combatRef.current?.fireArrow(origin, _look, 0, false, home);
					else combatRef.current?.fireBolt(origin, _look, 0, false, home);
				}
			}
		}
		if (playing) {
			useRpg.getState().tick(dt, sprintingNow);
			const model = modelRef.current;
			if (model && useRpg.getState().gearRev !== gearRev.current) {
				gearRev.current = useRpg.getState().gearRev;
				syncGear(model, useRpg.getState().equipped);
			}
			if (model) stickGear(model);
			const host = amHost();
			landRef.current = (beast, dmg, crit) => {
				if (!beast.alive) return;
				const dealt = mitigate(beast.level, useRpg.getState().level, dmg);
				angerPack(beastsRef.current, beast.pack);
				if (host) {
					hitBeast(beast, dealt);
					floatAt(beast.root.position.x, 1.55, beast.root.position.z, `${crit ? "KRİT " : ""}${dealt}`, crit);
					if (!beast.alive) {
						shareXp(3 + Math.round(beast.level * .45));
						useRpg.getState().addGold(4 + beast.level);
						useRpg.getState().noteKill();
						useRpg.setState({ toast: `${beast.name} düştü` });
					}
				} else {
					emitHit(beast.id, dealt);
					hitBeast(beast, dealt);
					floatAt(beast.root.position.x, 1.55, beast.root.position.z, `${crit ? "KRİT " : ""}${dealt}`, crit);
					if (!beast.alive) useRpg.getState().noteKill();
				}
			};
			const cast = takeCast();
			if (cast) {
				const classId = useRpg.getState().classId;
				const reach = classId === "okcu" ? 22 : classId === "buyucu" ? 16 : classId === "ninja" ? 3.3 : 3.6;
				const melee = classId === "savasci" || classId === "ninja";
				const { duel } = readTarget();
				const foe = duel.phase === "live" ? remotes.get(duel.id) : void 0;
				const foeDist = foe ? Math.hypot(foe.x - sim.x, foe.z - sim.z) : 99;
				const sel = readTarget().sel;
				const beast = sel?.kind === "mob" ? beastsRef.current.find((row) => row.id === sel.id && row.alive) ?? null : null;
				const dist = beast ? Math.hypot(beast.root.position.x - sim.x, beast.root.position.z - sim.z) : 99;
				const critRoll = cast.crit && Math.random() < .42;
				const dmg = critRoll ? Math.round(cast.dmg * 1.65) : cast.dmg;
				const stamp = (target) => {
					const dealt = mitigate(target.level, useRpg.getState().level, dmg);
					if (cast.slow) target.slow = 4;
					if (cast.dot) {
						target.poison = 5;
						target.poisonDps = Math.max(1, Math.round(dealt * .22));
					}
				};
				if (!cast.aoe && classId !== "savasci" && classId !== "ninja" && !beast && !foe) useRpg.setState({ toast: "Önce bir hedef seç" });
				else if (foe && foeDist < reach) {
					for (let n = 0; n < cast.hits; n++) sendDuelHit(n === 0 ? dmg : Math.max(1, Math.round(dmg * .7)), critRoll);
					floatAt(foe.x, 1.7, foe.z, `${critRoll ? "KRİT " : ""}${dmg}`, critRoll);
					if (melee) combatRef.current?.slash(sim.x, 1.15, sim.z, sim.yaw, false);
				} else if (cast.aoe) {
					const limit = melee ? 3.2 : 5.2;
					let any = false;
					for (const row of beastsRef.current) {
						if (!row.alive) continue;
						if (Math.hypot(row.root.position.x - sim.x, row.root.position.z - sim.z) >= limit) continue;
						any = true;
						stamp(row);
						landRef.current(row, dmg, critRoll);
					}
					if (melee) combatRef.current?.slash(sim.x, 1.15, sim.z, sim.yaw, false);
					if (!any) useRpg.setState({ toast: "Etrafta hedef yok" });
				} else if (beast && dist < reach) {
					stamp(beast);
					for (let n = 0; n < cast.hits; n++) landRef.current(beast, n === 0 ? dmg : Math.max(1, Math.round(dmg * .7)), critRoll && n === 0);
					if (melee) combatRef.current?.slash(sim.x, 1.15, sim.z, sim.yaw, false);
					else {
						const origin = _aim.set(sim.x, 1.35, sim.z);
						_look.set(beast.root.position.x - origin.x, 1.05 - origin.y, beast.root.position.z - origin.z);
						if (classId === "okcu") combatRef.current?.fireArrow(origin, _look, 0, false, beast.id);
						else combatRef.current?.fireBolt(origin, _look, 0, false, beast.id);
					}
				} else useRpg.setState({ toast: beast || foe ? "Hedef menzil dışında" : "Önce bir hedef seç" });
			}
			if (host) for (const hit of takeRemoteHits()) {
				const beast = beastsRef.current.find((row) => row.id === hit.id && row.alive);
				if (!beast) continue;
				angerPack(beastsRef.current, beast.pack);
				hitBeast(beast, hit.dmg);
				floatAt(beast.root.position.x, 1.55, beast.root.position.z, `${hit.dmg}`, false);
				if (!beast.alive) sendReward(hit.from, 55, 22);
			}
			else takeRemoteHits();
			resolveHits();
			const dummy = dummyRef.current;
			const beasts = beastsRef.current;
			const well = wellRef.current;
			const smith = smithRef.current;
			if (dummy) tickDummy(dummy, dt, camera);
			if (well) tickVendor(well, lifeRef.current);
			if (smith) tickVendor(smith, lifeRef.current);
			for (const mentor of mentorsRef.current) mentor.hips.rotation.y = Math.sin(lifeRef.current * .7 + mentor.root.position.x) * .06;
			const rpgNow = useRpg.getState();
			const learned = Boolean(rpgNow.chosenTree) || Object.values(rpgNow.skills ?? {}).some((rank) => Number(rank) > 0);
			const skillQuest = rpgNow.quests.find((quest) => quest.id === "q-skills");
			const showSkillMarks = rpgNow.level >= 5 && !learned && !(skillQuest && (skillQuest.done || skillQuest.claimed));
			for (const mentor of mentorsRef.current) {
				const arrow = mentor.root.getObjectByName("skill-arrow");
				if (!arrow) continue;
				const row = MENTORS.find((item) => item.name === mentor.name);
				arrow.visible = Boolean(showSkillMarks && row && row.cls === rpgNow.classId);
				if (arrow.visible) arrow.position.y = 2.28 + Math.sin(lifeRef.current * 4 + mentor.root.position.x) * .14;
			}
			if (host) {
				const hotPacks = new Set(beasts.filter((beast) => beast.alive && beast.anger).map((beast) => beast.pack));
				for (const beast of beasts) if (beast.alive && hotPacks.has(beast.pack)) beast.anger = true;
				for (const beast of beasts) {
					if (!beast.alive || !beast.anger) continue;
					for (const other of beasts) {
						if (other === beast || !other.alive) continue;
						const dx = beast.root.position.x - other.root.position.x;
						const dz = beast.root.position.z - other.root.position.z;
						const dist = Math.hypot(dx, dz) || .001;
						if (dist < 1.35) {
							beast.root.position.x += dx / dist * (1.35 - dist) * .45;
							beast.root.position.z += dz / dist * (1.35 - dist) * .45;
						}
					}
				}
				for (const beast of beasts) {
					if (beast.alive && beast.poison > 0) {
						beast.poison = Math.max(0, beast.poison - dt);
						beast.hp = Math.max(0, beast.hp - beast.poisonDps * dt);
						if (beast.hp <= 0) {
							beast.alive = false;
							beast.respawn = 8;
							shareXp(3 + Math.round(beast.level * .45));
							useRpg.getState().addGold(4 + beast.level);
							useRpg.getState().noteKill();
							useRpg.setState({ toast: `${beast.name} düştü` });
						}
					}
					if (tickBeast(beast, dt, sim.x, sim.z, camera, false)) {
						const bite = Math.atan2(-(sim.x - beast.root.position.x), -(sim.z - beast.root.position.z));
						combatRef.current?.slash(beast.root.position.x, .85, beast.root.position.z, bite, false);
						const me = useRpg.getState();
						const dmg = mobBite(beast.level, me.level, me.hpMax);
						const dead = me.hurtPlayer(dmg);
						floatAt(sim.x, 1.5, sim.z, `-${dmg}`, false);
						if (dead) {
							useRpg.setState({
								hp: useRpg.getState().hpMax * .45,
								toast: "Yendin. Meydanda toparlandın"
							});
							sim.x = 0;
							sim.z = 10;
						}
					}
					beast.root.position.y = groundY(beast.root.position.x, beast.root.position.z);
				}
				for (let pack = 0; pack < 24; pack++) {
					const members = beasts.filter((beast) => beast.pack === pack);
					if (members.length && members.every((beast) => !beast.alive)) {
						packLeft.current[pack] = (packLeft.current[pack] || 8) - dt;
						if (packLeft.current[pack] <= 0) {
							for (const beast of members) {
								beast.alive = true;
								beast.hp = beast.hpMax;
								beast.anger = false;
								beast.poison = 0;
								beast.slow = 0;
								beast.root.rotation.x = 0;
								beast.root.position.set(beast.homeX, 0, beast.homeZ);
							}
							packLeft.current[pack] = 0;
						}
					} else packLeft.current[pack] = 0;
				}
				mobClock.current += dt;
				if (mobClock.current > .15) {
					mobClock.current = 0;
					pushMobState(beasts.map((beast) => ({
						id: beast.id,
						hp: beast.hp,
						alive: beast.alive,
						anger: beast.anger,
						x: beast.root.position.x,
						z: beast.root.position.z
					})));
				}
			} else {
				const snaps = fieldMobs();
				const glide = 1 - Math.exp(-8 * dt);
				for (const snap of snaps) {
					const beast = beasts.find((row) => row.id === snap.id);
					if (!beast) continue;
					beast.hp = snap.hp;
					beast.alive = snap.alive;
					beast.anger = snap.anger;
					beast.root.position.x += (snap.x - beast.root.position.x) * glide;
					beast.root.position.z += (snap.z - beast.root.position.z) * glide;
					if (!snap.alive) beast.root.rotation.x = Math.min(1.2, beast.root.rotation.x + dt);
					else beast.root.rotation.x = 0;
					beast.root.position.y = groundY(beast.root.position.x, beast.root.position.z);
				}
				for (const beast of beasts) tickBeast(beast, dt, sim.x, sim.z, camera, true);
			}
			let near = null;
			let mentorId = null;
			for (const mentor of mentorsRef.current) if (Math.hypot(sim.x - mentor.root.position.x, sim.z - mentor.root.position.z) < 1.8) {
				near = "mentor";
				mentorId = MENTORS.find((row) => row.name === mentor.name)?.id ?? null;
				break;
			}
			if (!near) {
				for (const town of townsRef.current) if (Math.hypot(sim.x - town.root.position.x, sim.z - town.root.position.z) < 2.15) {
					near = town.role;
					break;
				}
			}
			if (!near && smith && Math.hypot(sim.x - smith.root.position.x, sim.z - smith.root.position.z) < 2.6) near = "smith";
			if (!near && Math.hypot(sim.x, sim.z) < 1.55) near = "well";
			if (!near) {
				const r = Math.hypot(sim.x, sim.z);
				if ((r > 45.5 && r < 47.6 || r > 61 && r < 63.4 || onPier(sim.x, sim.z)) && !bridgeName(sim.x, sim.z)) near = "fish";
			}
			if (!near) {
				for (const vein of VEINS) if (Math.hypot(sim.x - vein.x, sim.z - vein.z) < 1.8) {
					near = "vein";
					break;
				}
			}
			for (const town of townsRef.current) town.hips.rotation.y = Math.sin(lifeRef.current * .6 + town.root.position.x) * .05;
			useRpg.getState().setNear(near, mentorId);
			const { sel, duel } = readTarget();
			paintMob(camera, "mob-dummy", "", 0, 1, 0, 0, 0, false);
			paintMob(camera, "mob-beast", "", 0, 1, 0, 0, 0, false);
			let focus = false;
			if (sel?.kind === "mob" && sel.id === "dummy" && dummy?.alive) {
				paintMob(camera, "mob-focus", "Talim Kuklası", dummy.hp, dummy.hpMax, dummy.root.position.x, 2.55, dummy.root.position.z, true);
				focus = true;
			} else if (sel?.kind === "mob") {
				const picked = beasts.find((beast) => beast.id === sel.id && beast.alive);
				if (picked) {
					paintMob(camera, "mob-focus", `${picked.name} · Sv.${picked.level}`, picked.hp, picked.hpMax, picked.root.position.x, 2.05, picked.root.position.z, true);
					focus = true;
				}
			} else if (duel.phase === "live" && sel?.kind === "player" && sel.id === duel.id) {
				const foe = remotes.get(sel.id);
				if (foe) {
					paintMob(camera, "mob-focus", `${foe.nick}`, foe.hp, foe.hpMax, foe.x, 2.15, foe.z, true);
					focus = true;
				}
			}
			if (!focus) paintMob(camera, "mob-focus", "", 0, 1, 0, 0, 0, false);
			const targets = [];
			if (dummy?.alive) targets.push({
				id: "dummy",
				x: dummy.root.position.x,
				y: 1.25,
				z: dummy.root.position.z,
				alive: true
			});
			for (const beast of beasts) if (beast.alive) targets.push({
				id: beast.id,
				x: beast.root.position.x,
				y: 1.05,
				z: beast.root.position.z,
				alive: true
			});
			if (duel.phase === "live") {
				const foe = remotes.get(duel.id);
				if (foe) targets.push({
					id: "duel",
					x: foe.x,
					y: 1.2,
					z: foe.z,
					alive: true
				});
			}
			combatRef.current?.tick(dt, targets, (id, dmg, crit, x, y, z) => {
				if (dmg <= 0) return;
				if (id === "duel") {
					sendDuelHit(dmg, crit);
					floatAt(x, y, z, `${crit ? "KRİT " : ""}${dmg}`, crit);
					return;
				}
				if (id === "dummy" && dummy?.alive) {
					hitDummy(dummy, dmg);
					floatAt(x, y, z, `${crit ? "KRİT " : ""}${dmg}`, crit);
					if (!dummy.alive) useRpg.setState({ toast: "Kukla yıkıldı" });
					return;
				}
				const beast = beasts.find((row) => row.id === id && row.alive);
				if (!beast) return;
				landRef.current(beast, dmg, crit);
			});
			for (const item of takePendingDrops()) placeLoot(item, sim.x + .35, sim.z + .15);
			const bagHost = lootRoot.current;
			if (bagHost) {
				const rows = fieldLoot();
				const ids = new Set(rows.map((row) => row.id));
				for (const [id, mesh] of lootMeshes.current) if (!ids.has(id)) {
					bagHost.remove(mesh);
					lootMeshes.current.delete(id);
				}
				for (const row of rows) {
					let mesh = lootMeshes.current.get(row.id);
					if (!mesh) {
						mesh = new Mesh(new BoxGeometry(.26, .16, .26), new MeshStandardMaterial({
							color: "#c9a15b",
							roughness: .42,
							metalness: .35
						}));
						mesh.castShadow = true;
						bagHost.add(mesh);
						lootMeshes.current.set(row.id, mesh);
					}
					mesh.position.set(row.x, .1, row.z);
					mesh.rotation.y += dt * 1.4;
				}
				const touching = rows.find((row) => Math.hypot(row.x - sim.x, row.z - sim.z) < 1.35);
				setLootHint(touching ? `E — ${touching.item.name} al` : "");
			}
		} else {
			setLootHint("");
			paintMob(camera, "mob-dummy", "", 0, 1, 0, 0, 0, false);
			paintMob(camera, "mob-beast", "", 0, 1, 0, 0, 0, false);
			paintMob(camera, "mob-focus", "", 0, 1, 0, 0, 0, false);
		}
		tickGrass(dt);
		if (moving) {
			stepRef.current += sim.speed * dt;
			if (stepRef.current > (runBlend.current > .45 ? .38 : .58)) {
				stepRef.current = 0;
				const pool = dustRef.current;
				const puff = pool.find((item) => item.life >= 1) ?? pool[0];
				if (puff) {
					const side = footRef.current;
					footRef.current = -side;
					const yaw = sim.yaw;
					puff.sprite.visible = true;
					puff.sprite.position.set(sim.x + Math.cos(yaw) * side * .16 + Math.sin(yaw) * .08, .05, sim.z - Math.sin(yaw) * side * .16 + Math.cos(yaw) * .08);
					puff.life = 0;
					puff.vy = .32 + Math.random() * .2;
				}
			}
		}
		for (const puff of dustRef.current) {
			if (puff.life >= 1) continue;
			puff.life += dt * 1.7;
			puff.sprite.position.y += puff.vy * dt;
			const mat = puff.sprite.material;
			mat.opacity = Math.max(0, .42 * (1 - puff.life));
			const size = .2 + puff.life * .42;
			puff.sprite.scale.set(size, size, size);
			if (puff.life >= 1) puff.sprite.visible = false;
		}
		tickSmoke(puffsRef.current, dt);
		weatherRef.current?.update(dt, lifeRef.current, playing ? sim.x : 0, playing ? sim.z : 0);
		const persp = camera;
		if (!playing) {
			const dist = 18;
			const pitch = .5;
			const ang = sim.menuAngle;
			_look.set(0, 1.4, -1.5);
			_desired.set(Math.sin(ang) * Math.cos(pitch) * dist, 1.4 + Math.sin(pitch) * dist * .72, Math.cos(ang) * Math.cos(pitch) * dist);
		} else {
			const camYaw = input.orbit;
			const pitch = input.pitch;
			const dist = input.dist;
			const backX = Math.sin(camYaw);
			const backZ = Math.cos(camYaw);
			_look.set(sim.x, 1.42, sim.z);
			let pull = 1;
			const spanX = backX * Math.cos(pitch) * dist;
			const spanZ = backZ * Math.cos(pitch) * dist;
			for (let i = 0; i < 8; i++) {
				const cy = 1.42 + Math.sin(pitch) * dist * Math.max(.42, pull);
				if (!occluded(sim.x + spanX * pull, sim.z + spanZ * pull, .45, cy)) break;
				pull *= .62;
			}
			_desired.set(sim.x + spanX * pull, 1.42 + Math.sin(pitch) * dist * Math.max(.42, pull), sim.z + spanZ * pull);
		}
		const followK = !playing ? 1.6 : input.look ? 22 : 12;
		if (snap) _cam.copy(_desired);
		else _cam.lerp(_desired, 1 - Math.exp(-followK * dt));
		persp.position.copy(_cam);
		persp.lookAt(_look);
		const light = lightRef.current;
		if (light) {
			const focusX = playing ? sim.x : 0;
			const focusZ = playing ? sim.z : 0;
			light.position.set(focusX + 8, 12, focusZ + 5);
			light.target.position.set(focusX, 0, focusZ);
			light.target.updateMatrixWorld();
		}
		const who = useRpg.getState();
		presence.nick = who.nick;
		presence.level = who.level;
		presence.x = sim.x;
		presence.z = sim.z;
		presence.yaw = sim.yaw;
		presence.moving = moving;
		presence.run = runBlend.current;
		presence.swing = fx?.swing ?? 0;
		presence.weapon = Boolean(who.equipped.weapon);
		presence.style = weaponStyleOf(who.equipped.weapon?.id);
		presence.helmet = Boolean(who.equipped.helmet);
		presence.armor = Boolean(who.equipped.armor);
		presence.boots = Boolean(who.equipped.boots);
		presence.hp = who.hp;
		presence.hpMax = who.hpMax;
		presence.side = fx?.side ?? 1;
		const host = remoteRootRef.current;
		if (host) host.visible = playing;
		const template = templateRef.current;
		if (host && template && playing) {
			const avatars = remoteAvatars.current;
			for (const [id, av] of avatars) if (!remotes.has(id)) {
				host.remove(av.root);
				avatars.delete(id);
			}
			for (const [id, body] of remotes) {
				let av = avatars.get(id);
				if (!av) {
					av = spawnRemote(template);
					avatars.set(id, av);
					host.add(av.root);
				}
				const k = 1 - Math.exp(-8 * dt);
				body.x += (body.tx - body.x) * k;
				body.z += (body.tz - body.z) * k;
				body.yaw += Math.atan2(Math.sin(body.tyaw - body.yaw), Math.cos(body.tyaw - body.yaw)) * k;
				const dx = body.x - av.prevX;
				const dz = body.z - av.prevZ;
				av.root.position.set(body.x, groundY(body.x, body.z), body.z);
				av.root.rotation.y = body.yaw;
				if (body.moving) alignRemote(av, dx, dz);
				else av.model.rotation.y = av.face;
				av.prevX = body.x;
				av.prevZ = body.z;
				av.phase += dt * (body.moving ? body.run > .45 ? 10.2 : 6.4 : 1.2);
				const text = `${body.nick} · Sv.${body.level}`;
				if (av.label !== text) {
					av.label = text;
					paintLabel(av.tag, text);
				}
				const gear = `${body.style}${Number(body.weapon)}${Number(body.helmet)}${Number(body.armor)}${Number(body.boots)}`;
				if (av.gear !== gear) {
					av.gear = gear;
					syncRemoteGear(av.model, body);
				}
				try {
					poseFighter(av.model, av.rest, {
						moving: body.moving,
						run: body.run,
						cycle: av.phase,
						time: lifeRef.current,
						swing: body.swing,
						side: body.side || 1,
						armed: body.weapon,
						style: body.style || (body.weapon ? "sword" : "fist")
					});
					stickGear(av.model);
				} catch (error) {
					console.error(error);
				}
			}
		}
		const plate = document.getElementById("nameplate");
		const head = playing ? modelRef.current?.getObjectByName("Head") : null;
		if (plate && head) {
			head.getWorldPosition(_plate);
			_plate.y += .36;
			_plate.project(camera);
			if (_plate.z > 1) plate.style.display = "none";
			else {
				plate.style.display = "block";
				plate.style.left = `${(_plate.x * .5 + .5) * 100}%`;
				plate.style.top = `${(-_plate.y * .5 + .5) * 100}%`;
				const who = useRpg.getState();
				const text = `${who.nick} · Sv.${who.level}`;
				if (plate.textContent !== text) plate.textContent = text;
			}
		} else if (plate) plate.style.display = "none";
		const bubbleHost = document.getElementById("chat-bubbles");
		if (bubbleHost) {
			const now = performance.now();
			const bubbles = chatBubbles(now);
			const seen = /* @__PURE__ */ new Set();
			for (const bubble of bubbles) {
				seen.add(bubble.key);
				let bx = 0;
				let by = 2.35;
				let bz = 0;
				let ok = false;
				if (bubble.key === "me" && playing) {
					bx = sim.x;
					bz = sim.z;
					const head = modelRef.current?.getObjectByName("Head");
					if (head) {
						head.getWorldPosition(_plate);
						bx = _plate.x;
						by = _plate.y + .42;
						bz = _plate.z;
					}
					ok = true;
				} else {
					const body = remotes.get(bubble.key);
					if (body) {
						bx = body.x;
						by = 2.35;
						bz = body.z;
						ok = true;
					}
				}
				let el = document.getElementById(`bubble-${bubble.key}`);
				if (!el) {
					el = document.createElement("div");
					el.id = `bubble-${bubble.key}`;
					el.style.cssText = "position:absolute;transform:translate(-50%,-140%);max-width:14rem;pointer-events:none;background:rgba(20,17,14,0.9);border:1px solid #3f3830;border-radius:8px;padding:3px 8px;color:#f3efe8;font-size:13px;text-align:center";
					bubbleHost.appendChild(el);
				}
				if (!ok || !playing) {
					el.style.display = "none";
					continue;
				}
				_plate.set(bx, by, bz).project(camera);
				if (_plate.z > 1) {
					el.style.display = "none";
					continue;
				}
				el.style.display = "block";
				el.style.left = `${(_plate.x * .5 + .5) * 100}%`;
				el.style.top = `${(-_plate.y * .5 + .5) * 100}%`;
				if (el.textContent !== bubble.text) el.textContent = bubble.text;
			}
			for (const child of [...bubbleHost.children]) {
				const id = child.id.replace("bubble-", "");
				if (!seen.has(id)) child.remove();
			}
		}
		const ring = ringRef.current ?? makeSelectRing();
		if (!ringRef.current) {
			scene.add(ring);
			ringRef.current = ring;
		}
		const live = ringRef.current;
		const { sel, duel } = readTarget();
		let x = 0;
		let z = 0;
		let scale = 1;
		let show = false;
		if (playing && sel?.kind === "mob") {
			const mob = sel.id === "dummy" ? dummyRef.current : beastsRef.current.find((beast) => beast.id === sel.id) ?? null;
			if (mob?.alive) {
				x = mob.root.position.x;
				z = mob.root.position.z;
				scale = sel.id === "dummy" ? 1.05 : 1.25;
				show = true;
			} else setSelection(null);
		} else if (playing && sel?.kind === "player") {
			const body = remotes.get(sel.id);
			if (body) {
				x = body.x;
				z = body.z;
				scale = .95;
				show = true;
			} else if (duel.phase === "idle") setSelection(null);
		}
		live.visible = show;
		if (show) {
			const dist = Math.max(4, camera.position.distanceTo(live.position));
			const pulse = .45 + .55 * (.5 + .5 * Math.sin(lifeRef.current * 7.5));
			live.position.set(x, groundY(x, z) + .04, z);
			live.rotation.set(0, 0, 0);
			live.scale.setScalar(scale * pulse * Math.min(2.6, dist / 7));
			const fill = duel.phase === "live" && sel?.kind === "player" && sel.id === duel.id ? 16731450 : 16722474;
			const mat = live.children[0]?.material;
			if (mat) {
				mat.color.setHex(fill);
				mat.opacity = .35 + pulse * .65;
			}
		}
		const probe = globalThis;
		probe.__selRing = {
			visible: live.visible,
			x: live.position.x,
			z: live.position.z
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
			attach: "fog",
			args: [
				"#b9c3bc",
				55,
				280
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
			"#d5e0e8",
			"#3a342c",
			.62
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			ref: lightRef,
			position: [
				8,
				12,
				5
			],
			intensity: 1.7,
			color: "#fff1dc"
		})
	] });
}
function VillageScene() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {
			shadows: false,
			dpr: 1,
			performance: { min: .5 },
			flat: true,
			camera: {
				fov: 42,
				near: .08,
				far: 280,
				position: [
					8,
					7,
					16
				]
			},
			gl: {
				antialias: false,
				alpha: false,
				stencil: false,
				powerPreference: "high-performance"
			},
			onCreated: ({ gl }) => {
				gl.setPixelRatio(1);
				gl.shadowMap.enabled = false;
				gl.setClearColor("#9aa8ab");
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(World, {})
		})
	});
}
//#endregion
export { VillageScene };
