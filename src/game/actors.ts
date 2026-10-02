// @ts-nocheck
import * as THREE from "three";
import { weaponStyleOf } from "@/game/rpg";

function std(color, _rough = .6, _metal = .05) {
	return new THREE.MeshLambertMaterial({ color });
}
function bar() {
	const g = new THREE.Group();
	const bg = new THREE.Mesh(new THREE.PlaneGeometry(.9, .08), new THREE.MeshBasicMaterial({
		color: "#1c1916",
		depthTest: false
	}));
	const fill = new THREE.Mesh(new THREE.PlaneGeometry(.86, .05), new THREE.MeshBasicMaterial({
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
	const map = new THREE.CanvasTexture(canvas);
	map.colorSpace = THREE.SRGBColorSpace;
	const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
		map,
		transparent: true,
		depthWrite: false
	}));
	sprite.scale.set(1.4, .35, 1);
	return sprite;
}
export function adoptDummy(root) {
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
export function hitDummy(d, dmg) {
	if (!d.alive) return;
	d.hp = Math.max(0, d.hp - dmg);
	d.shake = .38;
	if (d.hp <= 0) {
		d.alive = false;
		d.respawn = 5;
	}
}
export function tickDummy(d, dt, cam) {
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
	const hips = new THREE.Group();
	hips.position.y = .96;
	const tunic = std(cloth, .78);
	const flesh = std(skin, .58);
	const dark = std("#2a241e", .75);
	const pelvis = new THREE.Mesh(new THREE.SphereGeometry(.14, 14, 12), tunic);
	pelvis.scale.set(1.25, .72, .95);
	pelvis.castShadow = true;
	const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.17, .28, 6, 12), tunic);
	torso.position.y = .3;
	torso.castShadow = true;
	const chest = new THREE.Mesh(new THREE.SphereGeometry(.16, 14, 12), tunic);
	chest.position.y = .44;
	chest.scale.set(1.28, .78, .82);
	chest.castShadow = true;
	const shoulderPad = (side) => {
		const pad = new THREE.Mesh(new THREE.SphereGeometry(.075, 10, 8), tunic);
		pad.position.set(side * .2, .46, 0);
		pad.scale.set(1.15, .75, .9);
		pad.castShadow = true;
		return pad;
	};
	const neck = new THREE.Mesh(new THREE.CylinderGeometry(.05, .058, .09, 10), flesh);
	neck.position.y = .62;
	const head = new THREE.Mesh(new THREE.SphereGeometry(.118, 18, 14), flesh);
	head.position.y = .77;
	head.scale.set(.92, 1.08, .96);
	head.castShadow = true;
	const hairCap = new THREE.Mesh(new THREE.SphereGeometry(.124, 16, 12, 0, Math.PI * 2, 0, Math.PI * .55), std(hair, .85));
	hairCap.position.y = .8;
	const eyeGeo = new THREE.SphereGeometry(.014, 8, 6);
	const eyeMat = std("#1a1412", .35);
	const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
	eyeL.position.set(-.04, .79, .1);
	const eyeR = eyeL.clone();
	eyeR.position.x = .04;
	const nose = new THREE.Mesh(new THREE.SphereGeometry(.016, 8, 6), flesh);
	nose.position.set(0, .75, .112);
	nose.scale.set(.7, 1.15, .8);
	const mouth = new THREE.Mesh(new THREE.BoxGeometry(.045, .008, .012), std("#8d5348", .6));
	mouth.position.set(0, .71, .108);
	const brow = new THREE.Mesh(new THREE.BoxGeometry(.1, .012, .016), std(hair, .8));
	brow.position.set(0, .83, .09);
	const ear = (side) => {
		const e = new THREE.Mesh(new THREE.SphereGeometry(.026, 8, 6), flesh);
		e.position.set(side * .108, .76, 0);
		e.scale.set(.42, 1, .65);
		return e;
	};
	const arm = (side) => {
		const g = new THREE.Group();
		g.position.set(side * .24, .44, 0);
		const upper = new THREE.Mesh(new THREE.CapsuleGeometry(.055, .16, 4, 8), flesh);
		upper.position.y = -.16;
		upper.castShadow = true;
		const fore = new THREE.Mesh(new THREE.CapsuleGeometry(.044, .15, 4, 8), flesh);
		fore.position.y = -.36;
		fore.castShadow = true;
		const hand = new THREE.Mesh(new THREE.BoxGeometry(.07, .045, .08), flesh);
		hand.position.set(0, -.48, .01);
		const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(.068, .074, .12, 8), tunic);
		sleeve.position.y = -.05;
		g.add(upper, fore, hand, sleeve);
		return g;
	};
	const leg = (side) => {
		const g = new THREE.Group();
		g.position.set(side * .09, -.02, 0);
		const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(.075, .2, 4, 8), tunic);
		thigh.position.y = -.18;
		thigh.castShadow = true;
		const shin = new THREE.Mesh(new THREE.CapsuleGeometry(.052, .2, 4, 8), dark);
		shin.position.y = -.46;
		shin.castShadow = true;
		const foot = new THREE.Mesh(new THREE.BoxGeometry(.1, .05, .2), std("#241c18", .7));
		foot.position.set(0, -.62, .04);
		foot.castShadow = true;
		g.add(thigh, shin, foot);
		return g;
	};
	const belt = new THREE.Mesh(new THREE.BoxGeometry(.3, .05, .18), std("#8a7040", .45, .35));
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
export function createVendor(kind, x, z, yaw) {
	const root = new THREE.Group();
	root.position.set(x, 0, z);
	root.rotation.y = yaw;
	const made = kind === "smith" ? person("#5a3030", "#c4a07a", "#2a211c") : person("#2f4a3c", "#d2b090", "#1e2428");
	if (kind === "smith") {
		const apron = new THREE.Mesh(new THREE.BoxGeometry(.22, .28, .04), std("#6a4a32", .85));
		apron.position.set(0, .22, .12);
		made.hips.add(apron);
		const beard = new THREE.Mesh(new THREE.ConeGeometry(.04, .1, 6), std("#3a2e28", .9));
		beard.position.set(0, .58, .09);
		made.hips.add(beard);
	} else {
		const hood = new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 8, 0, Math.PI * 2, 0, Math.PI * .5), std("#24362e", .75));
		hood.position.y = .76;
		made.hips.add(hood);
		const crate = new THREE.Mesh(new THREE.BoxGeometry(.42, .28, .34), std("#6a4a2c", .86));
		crate.position.set(.55, .16, .2);
		crate.castShadow = true;
		root.add(crate);
	}
	root.add(made.hips);
	let hammer = null;
	if (kind === "smith") {
		hammer = new THREE.Mesh(new THREE.BoxGeometry(.08, .22, .08), std("#9aa0a6", .35, .75));
		const handle = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .28, 6), std("#5a3d22", .8));
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
export function createMentor(name, x, z, yaw, cls) {
	const root = new THREE.Group();
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
export function createTownsman(name, x, z, yaw, cloth, spear = false) {
	const root = new THREE.Group();
	root.position.set(x, 0, z);
	root.rotation.y = yaw;
	const made = person(cloth, "#d2b090", "#1c1916");
	root.add(made.hips);
	if (spear) {
		const pole = new THREE.Mesh(new THREE.CylinderGeometry(.015, .018, 1.35, 6), std("#6a5340", .7));
		pole.position.set(.16, .7, .08);
		const tip = new THREE.Mesh(new THREE.ConeGeometry(.04, .16, 6), std("#d5dbe3", .3, .7));
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
export function tickVendor(v, t) {
	if (v.kind === "smith") {
		const swing = (Math.sin(t * 6.5) + 1) * .5;
		v.hips.rotation.x = Math.sin(t * 6.5) * .05;
		v.armR.rotation.x = -.15 - swing * 1.15;
	} else {
		v.hips.rotation.y = Math.sin(t * .7) * .08;
		v.armR.rotation.x = Math.sin(t * .6) * .06;
	}
}
export const SPECIES = [
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
	const m = new THREE.Mesh(geo, mat);
	m.castShadow = true;
	return m;
}
function buildCreature(spec) {
	const hide = std(spec.tint, .62, spec.form === "wraith" ? .25 : .08);
	const soft = std(spec.belly, .75);
	const bone = std("#efe6d4", .4);
	const eyeMat = new THREE.MeshStandardMaterial({
		color: "#ffb45a",
		emissive: "#ff6a12",
		emissiveIntensity: .8
	});
	const body = new THREE.Group();
	const head = new THREE.Group();
	const legs = [];
	const jaw = new THREE.Object3D();
	const leg = (x, z, len = .55) => {
		const g = new THREE.Group();
		g.position.set(x, .62, z);
		g.add(mesh(new THREE.CapsuleGeometry(.06, len, 4, 6), hide));
		const paw = mesh(new THREE.SphereGeometry(.07, 8, 6), std("#1a1410", .8));
		paw.position.y = -len * .62;
		g.add(paw);
		legs.push(g);
		return g;
	};
	if (spec.form === "spider") {
		const belly = mesh(new THREE.SphereGeometry(.38, 16, 12), hide);
		belly.position.y = .55;
		belly.scale.set(1.15, .75, 1.3);
		const abdomen = mesh(new THREE.SphereGeometry(.32, 14, 10), soft);
		abdomen.position.set(-.42, .48, 0);
		head.position.set(.42, .5, 0);
		head.add(mesh(new THREE.SphereGeometry(.16, 12, 10), hide));
		for (const z of [-.08, .08]) {
			const eye = mesh(new THREE.SphereGeometry(.03, 6, 6), eyeMat);
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
		const shell = mesh(new THREE.CapsuleGeometry(.22, .7, 5, 8), hide);
		shell.rotation.z = Math.PI / 2;
		shell.position.y = .42;
		head.position.set(.48, .42, 0);
		const claw = (z) => {
			const c = mesh(new THREE.BoxGeometry(.16, .06, .1), bone);
			c.position.set(.18, 0, z);
			return c;
		};
		head.add(mesh(new THREE.SphereGeometry(.12, 10, 8), hide), claw(.12), claw(-.12));
		const tail = mesh(new THREE.CapsuleGeometry(.05, .7, 4, 6), hide);
		tail.position.set(-.45, .85, 0);
		tail.rotation.z = 1.1;
		const sting = mesh(new THREE.ConeGeometry(.04, .16, 5), bone);
		sting.position.set(-.78, 1.15, 0);
		body.add(shell, head, tail, sting, leg(.2, .2, .32), leg(.2, -.2, .32), leg(-.15, .2, .32), leg(-.15, -.2, .32));
	} else if (spec.form === "snake") {
		for (let i = 0; i < 6; i++) {
			const seg = mesh(new THREE.SphereGeometry(.16 - i * .012, 10, 8), i % 2 ? soft : hide);
			seg.position.set(-i * .22, .18, Math.sin(i) * .05);
			seg.scale.set(1.3, .7, .7);
			body.add(seg);
		}
		head.position.set(.28, .22, 0);
		const skull = mesh(new THREE.SphereGeometry(.14, 12, 10), hide);
		skull.scale.set(1.4, .7, .8);
		jaw.position.set(.08, -.04, 0);
		head.add(skull, jaw);
		const eye = mesh(new THREE.SphereGeometry(.025, 6, 6), eyeMat);
		eye.position.set(.1, .04, .07);
		head.add(eye, eye.clone().translateZ(-.14));
		body.add(head);
	} else if (spec.form === "biped") {
		const torso = mesh(new THREE.CapsuleGeometry(.22, .45, 5, 8), hide);
		torso.position.y = 1.05;
		head.position.set(0, 1.55, 0);
		const skull = mesh(new THREE.SphereGeometry(.16, 12, 10), spec.id === "skel" ? bone : hide);
		jaw.position.set(0, -.08, .04);
		head.add(skull, jaw);
		const eye = mesh(new THREE.SphereGeometry(.025, 6, 6), eyeMat);
		eye.position.set(.08, .02, .1);
		head.add(eye);
		const arm = (x) => {
			const g = new THREE.Group();
			g.position.set(x, 1.25, 0);
			g.add(mesh(new THREE.CapsuleGeometry(.05, .4, 4, 6), hide));
			legs.push(g);
			return g;
		};
		body.add(torso, head, arm(.28), arm(-.28), leg(.1, 0, .7), leg(-.1, 0, .7));
	} else if (spec.form === "bat") {
		const torso = mesh(new THREE.SphereGeometry(.22, 12, 10), hide);
		torso.position.y = .7;
		head.position.set(.18, .82, 0);
		head.add(mesh(new THREE.SphereGeometry(.12, 10, 8), hide));
		const wing = (z) => {
			const w = mesh(new THREE.CircleGeometry(.45, 3), hide);
			w.position.set(-.05, .75, z);
			w.rotation.y = z > 0 ? .6 : -.6;
			return w;
		};
		body.add(torso, head, wing(.15), wing(-.15), leg(.05, .08, .28), leg(.05, -.08, .28));
	} else if (spec.form === "golem") {
		const torso = mesh(new THREE.DodecahedronGeometry(.42, 0), hide);
		torso.position.y = .95;
		torso.scale.set(1.1, 1.25, .8);
		head.position.set(0, 1.55, 0);
		head.add(mesh(new THREE.BoxGeometry(.28, .24, .24), soft));
		const eye = mesh(new THREE.SphereGeometry(.04, 6, 6), eyeMat);
		eye.position.set(.08, 0, .1);
		head.add(eye, eye.clone().translateZ(-.2));
		body.add(torso, head, leg(.18, 0, .7), leg(-.18, 0, .7));
	} else if (spec.form === "wraith") {
		const cloak = mesh(new THREE.ConeGeometry(.38, 1.3, 10), hide);
		cloak.position.y = .7;
		head.position.set(0, 1.35, 0);
		head.add(mesh(new THREE.SphereGeometry(.14, 12, 10), soft));
		const eye = mesh(new THREE.SphereGeometry(.03, 6, 6), eyeMat);
		eye.position.set(.06, 0, .1);
		head.add(eye);
		body.add(cloak, head);
	} else if (spec.form === "drake") {
		const torso = mesh(new THREE.CapsuleGeometry(.28, 1.1, 6, 10), hide);
		torso.rotation.z = Math.PI / 2;
		torso.position.y = .85;
		head.position.set(.85, 1.05, 0);
		const skull = mesh(new THREE.SphereGeometry(.2, 12, 10), hide);
		skull.scale.set(1.3, .8, .75);
		const snout = mesh(new THREE.ConeGeometry(.08, .28, 6), hide);
		snout.rotation.z = -Math.PI / 2;
		snout.position.set(.28, 0, 0);
		jaw.position.set(.1, -.08, 0);
		head.add(skull, snout, jaw);
		const wing = (z) => {
			const w = mesh(new THREE.ConeGeometry(.08, .7, 4), soft);
			w.position.set(-.1, 1.15, z);
			w.rotation.z = z > 0 ? -.8 : .8;
			w.rotation.y = z > 0 ? .4 : -.4;
			return w;
		};
		const tail = mesh(new THREE.CapsuleGeometry(.06, .8, 4, 6), hide);
		tail.position.set(-.9, .7, 0);
		tail.rotation.z = .5;
		body.add(torso, head, wing(.2), wing(-.2), tail, leg(.35, .18, .5), leg(.35, -.18, .5), leg(-.3, .16, .45), leg(-.3, -.16, .45));
	} else {
		const girth = spec.form === "bulky" ? .42 : .28;
		const torso = mesh(new THREE.CapsuleGeometry(girth, spec.form === "bulky" ? .85 : .7, 6, 10), hide);
		torso.rotation.z = Math.PI / 2;
		torso.position.y = spec.form === "bulky" ? .78 : .7;
		const chest = mesh(new THREE.SphereGeometry(girth * .95, 12, 10), hide);
		chest.position.set(.28, torso.position.y, 0);
		const gut = mesh(new THREE.SphereGeometry(.16, 10, 8), soft);
		gut.position.set(0, torso.position.y - .22, 0);
		gut.scale.set(1.4, .5, .8);
		head.position.set(.62, torso.position.y + .08, 0);
		const skull = mesh(new THREE.SphereGeometry(.16, 12, 10), hide);
		skull.scale.set(1.15, .85, .8);
		const snout = mesh(new THREE.CapsuleGeometry(.05, .14, 3, 6), hide);
		snout.rotation.z = Math.PI / 2;
		snout.position.set(.16, -.02, 0);
		jaw.position.set(.1, -.08, 0);
		head.add(skull, snout, jaw);
		const eye = mesh(new THREE.SphereGeometry(.028, 6, 6), eyeMat);
		eye.position.set(.08, .04, .08);
		head.add(eye, eye.clone().translateZ(-.16));
		if (spec.id === "goat" || spec.id === "boar") {
			const horn = mesh(new THREE.ConeGeometry(.04, .22, 5), bone);
			horn.position.set(-.02, .16, .08);
			horn.rotation.z = -.5;
			const horn2 = horn.clone();
			horn2.position.z = -.08;
			head.add(horn, horn2);
		}
		if (spec.id === "hare") {
			const ear = mesh(new THREE.CapsuleGeometry(.03, .22, 3, 5), hide);
			ear.position.set(-.04, .22, .06);
			head.add(ear, ear.clone().translateZ(-.12));
		}
		const tail = mesh(new THREE.CapsuleGeometry(.04, .28, 3, 5), hide);
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
export function mobHpFor(level, weight = 1) {
	const hit = 30 + Math.max(0, level - 1) * 1.3;
	const hits = 4 + level * 0.15;
	return Math.max(48, Math.round(hit * hits * weight));
}
export function mitigate(mobLevel, playerLevel, dmg) {
	const gap = mobLevel - playerLevel;
	let mult = 1;
	if (gap > 0) mult = Math.max(0.08, 1 - gap * 0.028);
	else if (gap < 0) mult = Math.min(2.2, 1 + -gap * 0.035);
	return Math.max(1, Math.round(dmg * mult));
}
export function mobBite(mobLevel, playerLevel, playerHp) {
	const gap = mobLevel - playerLevel;
	let ratio = 0.13;
	if (gap > 0) ratio = Math.min(1.65, 0.13 * Math.pow(1.05, gap));
	else if (gap < 0) ratio = Math.max(0.015, 0.13 * Math.pow(0.9, -gap));
	const jitter = 0.92 + Math.random() * 0.16;
	return Math.max(1, Math.round(Math.max(1, playerHp) * ratio * jitter));
}
export function createBeast(x, z, id = "beast", pack = 0, spec = SPECIES[2]) {
	const root = new THREE.Group();
	root.position.set(x, 0, z);
	const made = buildCreature(spec);
	const hpBar = bar();
	hpBar.position.y = 1.55 * spec.scale + .35;
	const tag = label(`${spec.name} · Sv.${spec.level}`);
	tag.position.y = hpBar.position.y + .28;
	tag.visible = false;
	hpBar.visible = false;
	root.add(made.body, hpBar, tag);
	const weight = 0.8 + Math.min(0.55, (spec.hp || 40) / 1200);
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

const VILLAGE_EDGE = 67;
function stepOutside(b, nx, nz) {
	if (Math.hypot(nx, nz) >= VILLAGE_EDGE) {
		b.root.position.x = nx;
		b.root.position.z = nz;
		return;
	}
	const r = Math.hypot(b.root.position.x, b.root.position.z);
	if (r >= VILLAGE_EDGE) return;
	const push = Math.hypot(nx, nz) || 1;
	b.root.position.x = nx / push * VILLAGE_EDGE;
	b.root.position.z = nz / push * VILLAGE_EDGE;
}
export function tickBeast(b, dt, px, pz, cam, puppet = false) {
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
export function hitBeast(b, dmg) {
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
	const g = new THREE.Group();
	if (style === "bow") {
		const wood = std("#6b4423", .62, .08);
		const upper = new THREE.Mesh(new THREE.CylinderGeometry(.01, .014, .52, 6), wood);
		upper.position.set(0, .3, -.04);
		upper.rotation.x = .42;
		const lower = new THREE.Mesh(new THREE.CylinderGeometry(.014, .01, .52, 6), wood);
		lower.position.set(0, -.3, -.04);
		lower.rotation.x = -.42;
		const grip = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .16, 8), std("#2a1c12", .7));
		const string = new THREE.Mesh(new THREE.BoxGeometry(.008, .92, .008), std("#efe6d4", .4));
		string.name = "bow-string";
		string.position.set(0, 0, .1);
		const nock = new THREE.Group();
		nock.name = "nocked";
		const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.007, .007, .55, 5), std("#6b4a2a", .7));
		shaft.rotation.x = Math.PI / 2;
		const tip = new THREE.Mesh(new THREE.ConeGeometry(.016, .08, 6), std("#d5dbe3", .3, .6));
		tip.rotation.x = Math.PI / 2;
		tip.position.z = -.3;
		nock.add(shaft, tip);
		nock.position.set(0, .02, .1);
		g.add(upper, lower, grip, string, nock);
		g.position.set(.02, .04, .02);
		g.rotation.z = .08;
	} else if (style === "staff") {
		const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.018, .022, 1.05, 8), std("#4a3424", .72));
		shaft.position.y = .22;
		const gem = new THREE.Mesh(new THREE.OctahedronGeometry(.045, 0), std("#7eb6ff", .25, .35));
		gem.position.y = .78;
		const collar = new THREE.Mesh(new THREE.CylinderGeometry(.028, .028, .04, 8), std(GOLD, .35, .6));
		collar.position.y = .68;
		const butt = new THREE.Mesh(new THREE.SphereGeometry(.026, 8, 6), std(GOLD, .35, .55));
		butt.position.y = -.32;
		g.add(shaft, gem, collar, butt);
		g.position.set(.015, -.02, .02);
		g.rotation.x = .15;
	} else if (style === "dagger") {
		const blade = new THREE.Mesh(new THREE.BoxGeometry(.022, .22, .008), std("#d5dbe3", .22, .86));
		blade.position.y = .16;
		const guard = new THREE.Mesh(new THREE.BoxGeometry(.07, .012, .02), std(GOLD, .35, .6));
		guard.position.y = .045;
		const grip = new THREE.Mesh(new THREE.CylinderGeometry(.012, .014, .08, 8), std("#2c2118", .7));
		g.add(blade, guard, grip);
		g.position.set(0, .07, .015);
		g.rotation.x = -.35;
	} else if (style === "pala") {
		const blade = new THREE.Mesh(new THREE.BoxGeometry(.07, 1.15, .02), std("#c5ccd4", .25, .8));
		blade.position.y = -.42;
		const edge = new THREE.Mesh(new THREE.BoxGeometry(.012, 1.05, .006), std("#f4f7fb", .18, .9));
		edge.position.set(.03, -.42, 0);
		const guard = new THREE.Mesh(new THREE.BoxGeometry(.16, .02, .04), std(GOLD, .35, .6));
		guard.position.y = .12;
		const grip = new THREE.Mesh(new THREE.CylinderGeometry(.018, .02, .22, 8), std("#3a2a1a", .75));
		grip.position.y = .22;
		const pommel = new THREE.Mesh(new THREE.SphereGeometry(.026, 8, 6), std(GOLD, .35, .55));
		pommel.position.y = .36;
		g.add(blade, edge, guard, grip, pommel);
		g.position.set(.02, -.02, .03);
	} else {
		const blade = new THREE.Mesh(new THREE.BoxGeometry(.035, .52, .01), std("#d5dbe3", .28, .82));
		blade.position.y = .36;
		const edge = new THREE.Mesh(new THREE.BoxGeometry(.008, .46, .004), std("#f4f7fb", .2, .9));
		edge.position.set(.014, .36, 0);
		const guard = new THREE.Mesh(new THREE.BoxGeometry(.12, .014, .028), std(GOLD, .35, .65));
		guard.position.y = .08;
		const grip = new THREE.Mesh(new THREE.CylinderGeometry(.014, .016, .1, 8), std("#3a2a1a", .75));
		const pommel = new THREE.Mesh(new THREE.SphereGeometry(.02, 8, 6), std(GOLD, .35, .6));
		pommel.position.y = -.07;
		g.add(blade, edge, guard, grip, pommel);
		g.position.set(0, .08, .01);
		g.rotation.x = -.2;
	}
	return g;
}
function weaponStand() {
	const rack = new THREE.Group();
	const post = new THREE.Mesh(new THREE.BoxGeometry(.08, .92, .08), std("#5a3d22", .8));
	post.position.y = .46;
	const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.05, .045, .18), std("#6a4428", .75));
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
export function syncBow(model, extend) {
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
export function syncGear(model, equipped) {
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
		const g = new THREE.Group();
		if (slot === "helmet") {
			const shell = new THREE.Mesh(new THREE.SphereGeometry(.14, 18, 14, 0, Math.PI * 2, 0, Math.PI * .58), std(NIGHT, .42, .5));
			shell.position.set(0, .045, .01);
			const rim = new THREE.Mesh(new THREE.TorusGeometry(.118, .016, 8, 20), std(GOLD, .4, .55));
			rim.rotation.x = Math.PI / 2;
			rim.position.set(0, -.01, .015);
			const nasal = new THREE.Mesh(new THREE.BoxGeometry(.03, .08, .02), std(NIGHT, .4, .4));
			nasal.position.set(0, -.02, .12);
			const cheek = new THREE.Mesh(new THREE.BoxGeometry(.05, .07, .03), std(NIGHT, .45, .4));
			cheek.position.set(.1, -.02, .06);
			const cheekR = cheek.clone();
			cheekR.position.x = -.1;
			g.add(shell, rim, nasal, cheek, cheekR);
		} else if (slot === "armor") {
			const plate = new THREE.Mesh(new THREE.BoxGeometry(.36, .26, .06), std(NIGHT, .45, .42));
			plate.position.set(0, .04, .13);
			const belly = new THREE.Mesh(new THREE.BoxGeometry(.3, .14, .05), std("#343844", .55, .32));
			belly.position.set(0, -.16, .12);
			const trim = new THREE.Mesh(new THREE.BoxGeometry(.37, .02, .065), std(GOLD, .4, .55));
			trim.position.set(0, .16, .13);
			const pauldron = (x) => {
				const p = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), std(NIGHT, .4, .45));
				p.scale.set(1.35, .55, 1);
				p.position.set(x, .14, .05);
				return p;
			};
			g.add(plate, belly, trim, pauldron(-.2), pauldron(.2));
			const pant = () => {
				const leg = new THREE.Group();
				const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(.075, .22, 4, 8), std(NIGHT, .5, .35));
				const shin = new THREE.Mesh(new THREE.CapsuleGeometry(.055, .18, 4, 8), std("#232833", .55, .3));
				shin.position.y = -.28;
				const knee = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), std(GOLD, .4, .4));
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
			const n = new THREE.Mesh(new THREE.TorusGeometry(.07, .008, 6, 14), std(GOLD, .35, .7));
			n.rotation.x = Math.PI / 2;
			n.position.set(0, .08, .08);
			g.add(n);
		} else if (slot === "belt") {
			const b = new THREE.Mesh(new THREE.BoxGeometry(.26, .045, .15), std(GOLD, .4, .55));
			b.position.set(0, -.02, .02);
			g.add(b);
		} else if (slot === "boots") {
			const shoe = () => {
				const s = new THREE.Group();
				const sole = new THREE.Mesh(new THREE.BoxGeometry(.11, .04, .24), std("#14161c", .65, .2));
				sole.position.y = .02;
				const upper = new THREE.Mesh(new THREE.BoxGeometry(.1, .07, .16), std(NIGHT, .5, .28));
				upper.position.set(0, .065, -.02);
				const cuff = new THREE.Mesh(new THREE.BoxGeometry(.11, .04, .1), std(GOLD, .4, .45));
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
			const wrap = new THREE.Mesh(new THREE.BoxGeometry(.07, .05, .08), std(NIGHT, .55, .25));
			wrap.position.set(0, .04, .02);
			g.add(wrap);
			const other = wrap.clone();
			g.userData.extra = other;
			model.getObjectByName("LeftHand")?.add(other);
		} else {
			const p = new THREE.Mesh(new THREE.SphereGeometry(.02, 8, 8), std(GOLD, .3, .7));
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
var _pin = new THREE.Vector3();
var _face = new THREE.Vector3();
export function stickGear(model) {
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
export type Dummy = ReturnType<typeof adoptDummy>;
export type Vendor = ReturnType<typeof createVendor>;
export type Mentor = ReturnType<typeof createMentor>;
export type Beast = ReturnType<typeof createBeast>;
