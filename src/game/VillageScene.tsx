import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { adoptDummy, createBeast, createMentor, createTownsman, createVendor, hitBeast, hitDummy, mitigate, mobBite, SPECIES, stickGear, syncBow, syncGear, tickBeast, tickDummy, tickVendor, type Beast, type Dummy, type Mentor, type Vendor } from "@/game/actors";
import { createCombat, type ShotTarget } from "@/game/combat";
import { chatBubbles } from "@/game/chat";
import { amHost, emitHit, fieldLoot, fieldMobs, placeLoot, pushMobState, sendReward, setLootHint, shareXp, takeLoot, takePendingDrops, takeRemoteHits } from "@/game/field";
import { useHud } from "@/game/hudStore";
import { axes, held, input, sim } from "@/game/input";
import { MENTORS, takeCast, useRpg, weaponStyleOf, type NearKind, type WeaponStyle } from "@/game/rpg";
import { autoQuality, loadGfx, readGfx, subscribeGfx } from "@/game/settings";
import { buildVillage, composeGround, createWeather, disposeScenery, tickGrass, tickSmoke, type SmokePuff } from "@/game/scenery";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";
import { advanceSwing, captureRest, createSwingFx, poseFighter, punchArc, punchExtend, type RestPose, type SwingFx } from "@/game/warrior";
import { presence, remotes, type RemoteBody } from "@/game/online";
import { readTarget, sendDuelHit, setSelection, takePick, type Sel } from "@/game/target";
import { blocked, bridgeName, dryLand, faceYaw, groundY, inWater, occluded, onPier, PIER_TOP, PLAYER_R, slide, VEINS, zoneName } from "@/game/world";

const WALK_REF = 1.67;
const _look = new THREE.Vector3();
const _aim = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _cam = new THREE.Vector3(8, 7, 16);
const _plate = new THREE.Vector3();
const _ndc = new THREE.Vector2();
const _picker = new THREE.Raycaster();

function cylinderT(ray: THREE.Ray, cx: number, cz: number, radius: number, y0: number, y1: number) {
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
    if (far < 0.08) return null;
    return near > 0.08 ? near : far;
  }
  const b = 2 * (ox * dx + oz * dz);
  const c = ox * ox + oz * oz - radius * radius;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const s = Math.sqrt(disc);
  const inv = 1 / (2 * a);
  const ta = (-b - s) * inv;
  const tb = (-b + s) * inv;
  const inside = (t: number) => {
    if (t < 0.08) return false;
    const y = ray.origin.y + ray.direction.y * t;
    return y >= y0 && y <= y1;
  };
  if (inside(ta)) return ta;
  if (inside(tb)) return tb;
  return null;
}

type RemoteAvatar = {
  root: THREE.Group;
  model: THREE.Object3D;
  rest: RestPose;
  tag: THREE.Sprite;
  label: string;
  gear: string;
  phase: number;
  prevX: number;
  prevZ: number;
  face: number;
};

function remoteLabel(text: string) {
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
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false }));
  sprite.scale.set(1.35, 0.34, 1);
  sprite.position.y = 2.08;
  sprite.userData.canvas = canvas;
  return sprite;
}

function paintLabel(sprite: THREE.Sprite, text: string) {
  const canvas = sprite.userData.canvas as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  const mat = sprite.material as THREE.SpriteMaterial;
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

function spawnRemote(template: THREE.Object3D) {
  const model = cloneSkeleton(template);
  model.rotation.y = Math.PI;
  model.traverse((obj: THREE.Object3D) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
    if (mesh.isMesh) mesh.castShadow = false;
    }
  });
  const root = new THREE.Group();
  root.add(model);
  model.updateMatrixWorld(true);
  const rest = captureRest(model);
  const tag = remoteLabel("");
  root.add(tag);
  return { root, model, rest, tag, label: "", gear: "", phase: 0, prevX: 0, prevZ: 0, face: Math.PI } satisfies RemoteAvatar;
}

function alignRemote(av: RemoteAvatar, dx: number, dz: number) {
  if (dx * dx + dz * dz < 1e-6) {
    av.model.rotation.y = av.face;
    return;
  }
  const score = (extra: number) => {
    av.model.rotation.y = Math.PI + extra;
    av.model.updateMatrixWorld(true);
    const e = av.model.matrixWorld.elements;
    return e[8]! * dx + e[10]! * dz;
  };
  const keep = score(0);
  const flip = score(Math.PI);
  av.face = Math.PI + (flip > keep ? Math.PI : 0);
  av.model.rotation.y = av.face;
}

function syncRemoteGear(model: THREE.Object3D, body: RemoteBody) {
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
    belt: null,
  });
}

function plant(clip: THREE.AnimationClip) {
  const next = clip.clone();
  for (const track of next.tracks) {
    if (!track.name.endsWith("Hips.position")) continue;
    const values = track.values;
    const x0 = values[0] ?? 0;
    const z0 = values[2] ?? 0;
    for (let i = 0; i < values.length; i += 3) {
      values[i] = x0;
      values[i + 2] = z0;
    }
  }
  return next;
}

const TANK = "#d9d1c3";
const TANK_DIRT = "#b7ad9c";
const SKIN = "#c48b6a";
const SCAR = "#9a4d45";
const SHORTS = "#1a1c18";
const BOOT = "#4e382c";
const WRAP = "#6d5344";

function dominantBone(geo: THREE.BufferGeometry, bones: THREE.Bone[], index: number) {
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

function dress(model: THREE.Object3D) {
  const mesh = model.getObjectByProperty("isMesh", true) as THREE.SkinnedMesh | undefined;
  const material = mesh?.material as THREE.MeshStandardMaterial | undefined;
  const map = material?.map;
  const image = map?.image as CanvasImageSource | undefined;
  const geo = mesh?.geometry;
  const bones = mesh?.skeleton?.bones;
  if (!mesh || !material || !map || !image || !geo?.index || !geo.attributes.uv || !bones) return;

  const width = (image as HTMLImageElement).width || (image as ImageBitmap).width;
  const height = (image as HTMLImageElement).height || (image as ImageBitmap).height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx || !width || !height) return;
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const uv = geo.attributes.uv;
  const pos = geo.attributes.position;

  const sample = (vertex: number) => {
    const x = Math.min(width - 1, Math.max(0, Math.floor(uv.getX(vertex) * (width - 1))));
    const y = Math.min(height - 1, Math.max(0, Math.floor(uv.getY(vertex) * (height - 1))));
    const offset = (y * width + x) * 4;
    return [pixels[offset] ?? 0, pixels[offset + 1] ?? 0, pixels[offset + 2] ?? 0];
  };
  const isSkin = (vertex: number) => {
    const [r, g, b] = sample(vertex);
    return r > 135 && r > g + 18 && r > b + 18;
  };

  const kind = new Uint8Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const name = dominantBone(geo, bones, i);
    const y = pos.getY(i);
    if (/Foot|Toe/.test(name)) kind[i] = 4;
    else if (name === "LeftLeg" || name === "RightLeg") kind[i] = 5;
    else if ((name === "LeftUpLeg" || name === "RightUpLeg") && y < 0.78) kind[i] = 5;
    else if (/Hips|UpLeg/.test(name)) kind[i] = 2;
    else if (/ForeArm/.test(name) && !isSkin(i)) kind[i] = 6;
    else if ((name === "LeftArm" || name === "RightArm") && !isSkin(i)) kind[i] = 3;
    else if (/Spine|Shoulder/.test(name)) kind[i] = 1;
  }

  const paint = (color: string, a: number, b: number, c: number) => {
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
    const votes = [kind[a], kind[b], kind[c]];
    const majority = (id: number) => votes.filter((item) => item === id).length >= 2;
    if (!votes.some((item) => item > 0)) continue;
    if (majority(1) || majority(3) || majority(4) || majority(5) || majority(6)) paint(SKIN, a, b, c);
    else if (majority(2)) paint(SHORTS, a, b, c);
  }

  const next = new THREE.CanvasTexture(canvas);
  next.flipY = map.flipY;
  next.colorSpace = THREE.SRGBColorSpace;
  next.anisotropy = 2;
  next.wrapS = map.wrapS;
  next.wrapT = map.wrapT;
  next.needsUpdate = true;
  mesh.material = new THREE.MeshLambertMaterial({ map: next });
}

function equip(model: THREE.Object3D) {
  const cloth = new THREE.MeshStandardMaterial({
    color: "#7c2430",
    roughness: 0.82,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const hair = new THREE.MeshStandardMaterial({ color: "#241c18", roughness: 0.9, metalness: 0 });

  const spine = model.getObjectByName("Spine2");
  if (spine) {
    const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 1.05, 3, 5), cloth);
    const p = cape.geometry.attributes.position;
    if (p) {
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i);
        const y = p.getY(i);
        p.setZ(i, Math.abs(x) * 0.22 - y * 0.04);
      }
      cape.geometry.computeVertexNormals();
    }
    cape.position.set(0, -0.15, -0.08);
    cape.castShadow = true;
    spine.add(cape);
  }

  const head = model.getObjectByName("Head");
  if (head) {
    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), hair);
    beard.scale.set(0.85, 0.55, 0.5);
    beard.position.set(0, -0.045, 0.07);
    head.add(beard);
  }
}

type Pose = {
  hips: THREE.Bone;
  spine: THREE.Bone;
  lUp: THREE.Bone;
  rUp: THREE.Bone;
  lLeg: THREE.Bone;
  rLeg: THREE.Bone;
  lArm: THREE.Bone;
  rArm: THREE.Bone;
  lFore: THREE.Bone;
  rFore: THREE.Bone;
};

function tone(x: number, y: number, z: number): [number, number, number] {
  if (y < -0.36) return [0.32, 0.2, 0.14];
  if (y < -0.22 && Math.abs(x) < 0.2) return [0.68, 0.45, 0.34];
  if (y < -0.05 && Math.abs(x) < 0.18) return [0.1, 0.11, 0.09];
  if (z < -0.03 && y > -0.25 && Math.abs(x) < 0.32) return [0.42, 0.1, 0.13];
  if (y > 0.34) return z > 0.015 ? [0.7, 0.46, 0.36] : [0.1, 0.08, 0.07];
  if (Math.abs(x) > 0.16 && y > -0.02 && y < 0.34) return y < 0.1 ? [0.38, 0.28, 0.22] : [0.7, 0.46, 0.36];
  if (y > 0.0 && y < 0.34 && Math.abs(x) < 0.16 && z > -0.08) return [0.86, 0.82, 0.74];
  return [0.7, 0.46, 0.36];
}

function paintColors(geo: THREE.BufferGeometry) {
  const pos = geo.getAttribute("position");
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const [r, g, b] = tone(pos.getX(i), pos.getY(i), pos.getZ(i));
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

function takeSword(source: THREE.BufferGeometry) {
  const geo = source.clone();
  const pos = geo.getAttribute("position");
  const gripAt: [number, number, number] = [0.186, 0.05, 0.055];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (x > 0.292 && y < 0.2 && y > -0.46 && z < 0.05) {
      pos.setXYZ(i, gripAt[0], gripAt[1] - 0.02, gripAt[2]);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  paintColors(geo);

  const leather = new THREE.MeshStandardMaterial({ color: "#5a3d2c", roughness: 0.72, metalness: 0.05 });
  const metal = new THREE.MeshStandardMaterial({ color: "#c5c8cc", roughness: 0.28, metalness: 0.85 });
  const grip = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.016, 0.12, 7), leather);
  handle.position.y = -0.03;
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.014, 0.022), metal);
  guard.position.y = -0.09;
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.5, 0.008), metal);
  blade.position.y = -0.35;
  grip.add(handle, guard, blade);
  grip.position.set(gripAt[0], gripAt[1], gripAt[2]);
  grip.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) mesh.castShadow = true;
  });
  return { bodyGeo: geo, grip };
}

function rigWarrior(source: THREE.BufferGeometry, material: THREE.Material) {
  const geo = source.clone();
  geo.computeBoundingBox();
  const box = geo.boundingBox;
  if (!box) return null;
  const y0 = box.min.y;
  const h = Math.max(0.01, box.max.y - y0);
  const hip = y0 + h * 0.52;
  const knee = y0 + h * 0.28;
  const ankle = y0 + h * 0.05;
  const chest = y0 + h * 0.7;
  const shoulder = y0 + h * 0.78;
  const neck = y0 + h * 0.86;
  const crown = y0 + h * 0.96;
  const legX = h * 0.09;
  const armX = h * 0.17;
  const elbow = shoulder - h * 0.15;
  const wrist = shoulder - h * 0.3;

  const made: { bone: THREE.Bone; x: number; y: number; z: number }[] = [];
  const add = (name: string, parent: number, x: number, y: number, z: number) => {
    const bone = new THREE.Bone();
    bone.name = name;
    const index = made.length;
    if (parent >= 0) {
      const p = made[parent]!;
      p.bone.add(bone);
      bone.position.set(x - p.x, y - p.y, z - p.z);
    } else bone.position.set(x, y, z);
    made.push({ bone, x, y, z });
    return index;
  };

  const iHips = add("Hips", -1, 0, hip, 0);
  const iSpine = add("Spine", iHips, 0, hip + (chest - hip) * 0.48, 0);
  const iChest = add("Chest", iSpine, 0, chest, 0);
  const iNeck = add("Neck", iChest, 0, neck, 0);
  add("Head", iNeck, 0, crown, 0);
  const iLU = add("LeftUpLeg", iHips, -legX, hip, 0);
  const iLL = add("LeftLeg", iLU, -legX, knee, 0);
  add("LeftFoot", iLL, -legX, ankle, 0);
  const iRU = add("RightUpLeg", iHips, legX, hip, 0);
  const iRL = add("RightLeg", iRU, legX, knee, 0);
  add("RightFoot", iRL, legX, ankle, 0);
  const iLA = add("LeftArm", iChest, -armX, shoulder, 0);
  const iLF = add("LeftForeArm", iLA, -armX * 1.08, elbow, 0.02);
  add("LeftHand", iLF, -armX * 1.12, wrist, 0.05);
  const iRA = add("RightArm", iChest, armX, shoulder, 0);
  const iRF = add("RightForeArm", iRA, armX * 1.08, elbow, 0.02);
  add("RightHand", iRF, armX * 1.12, wrist, 0.05);

  const segments = made.map((node, index) => {
    const child = made.find((item) => item.bone.parent === node.bone);
    return {
      index,
      name: node.bone.name,
      ax: node.x,
      ay: node.y,
      az: node.z,
      bx: child?.x ?? node.x,
      by: child?.y ?? node.y - h * 0.04,
      bz: child?.z ?? node.z,
    };
  });

  const pos = geo.attributes.position;
  if (!pos) return null;
  const indexAttr = new Uint16Array(pos.count * 4);
  const weightAttr = new Float32Array(pos.count * 4);
  for (let v = 0; v < pos.count; v++) {
    const x = pos.getX(v);
    const y = pos.getY(v);
    const z = pos.getZ(v);
    let best = 0;
    let bestD = Infinity;
    for (let s = 0; s < segments.length; s++) {
      const seg = segments[s]!;
      if (!/Leg|Foot/.test(seg.name)) continue;
      const abx = seg.bx - seg.ax;
      const aby = seg.by - seg.ay;
      const abz = seg.bz - seg.az;
      const ab2 = abx * abx + aby * aby + abz * abz || 1e-6;
      let t = ((x - seg.ax) * abx + (y - seg.ay) * aby + (z - seg.az) * abz) / ab2;
      t = Math.max(0, Math.min(1, t));
      const dx = x - (seg.ax + abx * t);
      const dy = y - (seg.ay + aby * t);
      const dz = z - (seg.az + abz * t);
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bestD) {
        best = s;
        bestD = d;
      }
    }
    const lateral = Math.abs(x);
    const nearLeg = bestD < h * h * 0.012 && y < hip + h * 0.02 && lateral < h * 0.2;
    const o = v * 4;
    if (!nearLeg) {
      indexAttr[o] = iHips;
      weightAttr[o] = 1;
    } else {
      const w0 = 1 / (bestD + 0.0004);
      const wHip = 1 / ((y - hip) * (y - hip) + 0.004);
      const sum = w0 + wHip;
      indexAttr[o] = best;
      indexAttr[o + 1] = iHips;
      weightAttr[o] = w0 / sum;
      weightAttr[o + 1] = wHip / sum;
    }
  }
  geo.computeVertexNormals();
  geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(indexAttr, 4));
  geo.setAttribute("skinWeight", new THREE.Float32BufferAttribute(weightAttr, 4));

  const bones = made.map((item) => item.bone);
  const mesh = new THREE.SkinnedMesh(geo, material);
  mesh.add(bones[0]!);
  mesh.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(bones));
  mesh.frustumCulled = false;
  const pose: Pose = {
    hips: made[iHips]!.bone,
    spine: made[iSpine]!.bone,
    lUp: made[iLU]!.bone,
    rUp: made[iRU]!.bone,
    lLeg: made[iLL]!.bone,
    rLeg: made[iRL]!.bone,
    lArm: made[iLA]!.bone,
    rArm: made[iRA]!.bone,
    lFore: made[iLF]!.bone,
    rFore: made[iRF]!.bone,
  };
  return { mesh, pose };
}

function stepPose(pose: Pose, phase: number, moving: boolean) {
  const swing = Math.sin(phase * 3.4);
  const amp = moving ? 0.42 : 0.04;
  pose.lUp.rotation.x = swing * amp;
  pose.rUp.rotation.x = -swing * amp;
  pose.lLeg.rotation.x = Math.max(0, -swing) * (moving ? 0.7 : 0.04);
  pose.rLeg.rotation.x = Math.max(0, swing) * (moving ? 0.7 : 0.04);
  pose.lArm.rotation.x = 0;
  pose.rArm.rotation.x = 0;
  pose.lFore.rotation.x = 0;
  pose.rFore.rotation.x = 0;
  pose.spine.rotation.x = (moving ? 0.08 : 0) + Math.sin(phase * 1.4) * 0.03;
  pose.hips.position.y = pose.hips.userData.baseY + (moving ? Math.abs(Math.cos(phase * 3.4)) * 0.012 : 0);
}

const _mob = new THREE.Vector3();
function paintMob(
  camera: THREE.Camera,
  id: string,
  title: string,
  hp: number,
  hpMax: number,
  x: number,
  y: number,
  z: number,
  show: boolean,
) {
  const host = document.getElementById("mob-bars");
  if (!host) return;
  let el = document.getElementById(id) as HTMLDivElement | null;
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.style.cssText = "position:absolute;transform:translate(-50%,-120%);width:11rem;pointer-events:none;background:rgba(20,17,14,0.88);border:1px solid #3f3830;border-radius:8px;padding:4px 8px 5px";
    el.innerHTML =
      '<p style="margin:0 0 3px;text-align:center;font-size:13px;color:#c9a15b;text-shadow:0 1px 2px #1c1916"></p><div style="height:10px;border:1px solid #3f3830;background:#1c1916;border-radius:3px;overflow:hidden"><span style="display:block;height:100%;background:#b5443c;width:100%"></span></div><p style="margin:3px 0 0;text-align:center;font-size:12px;color:#f3efe8"></p>';
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
  el.style.left = `${(_mob.x * 0.5 + 0.5) * 100}%`;
  el.style.top = `${(-_mob.y * 0.5 + 0.5) * 100}%`;
  const name = el.children[0] as HTMLElement;
  const fill = el.querySelector("span") as HTMLElement;
  const num = el.children[2] as HTMLElement;
  if (name.textContent !== title) name.textContent = title;
  const ratio = Math.max(0, Math.min(1, hp / Math.max(1, hpMax)));
  fill.style.width = `${ratio * 100}%`;
  const label = `${Math.ceil(Math.max(0, hp))} / ${Math.ceil(hpMax)}`;
  if (num.textContent !== label) num.textContent = label;
}

function dampAngle(current: number, target: number, lambda: number, dt: number) {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + diff * (1 - Math.exp(-lambda * dt));
}

function makeSelectRing() {
  const ring = new THREE.Group();
  ring.name = "select-ring";
  const band = new THREE.Mesh(
    new THREE.RingGeometry(0.62, 0.7, 48),
    new THREE.MeshBasicMaterial({
      color: "#e23b3b",
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
  );
  band.rotation.x = -Math.PI / 2;
  band.position.y = 0.02;
  ring.add(band);
  ring.position.y = 0.03;
  return ring;
}

function mobCamps() {
  return SPECIES.flatMap((spec, index) => {
    const copies = spec.level <= 20 ? 4 : 3;
    return Array.from({ length: copies }, (_, n) => {
      let x = 0;
      let z = 0;
      for (let attempt = 0; attempt < 12; attempt++) {
        const a = index * 0.62 + n * 2.05 + attempt * 0.47;
        const band = Math.min(142, 74 + spec.level * 0.42 + n * 5 + (attempt % 4) * 3.5);
        x = Math.cos(a) * band;
        z = Math.sin(a) * band;
        if (!blocked(x, z, 0.85) && !inWater(x, z, 0.7) && Math.hypot(x, z) > 68) break;
      }
      if (Math.hypot(x, z) < 68) {
        const a = index * 0.7 + n * 1.4;
        x = Math.cos(a) * 80;
        z = Math.sin(a) * 80;
      }
      return { spec, x, z, id: `${spec.id}-${n}`, pack: index };
    });
  });
}

function angerPack(list: Beast[], pack: number) {
  for (const beast of list) if (beast.pack === pack) beast.anger = true;
}

type Gait = "idle" | "walk" | "back" | "left" | "right";

function World() {
  const { camera, gl, scene } = useThree();
  useEffect(() => {
    loadGfx();
    const apply = () => {
      const g = readGfx();
      const q = g.auto ? autoQuality() : g.quality;
      const fps = g.fps <= 30 ? 0.75 : g.fps >= 120 ? 1.15 : 1;
      gl.setPixelRatio(Math.min(1.6, window.devicePixelRatio * q * fps));
    };
    apply();
    const unsub = subscribeGfx(apply);
    return () => {
      unsub();
    };
  }, [gl]);
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const rigRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actRef = useRef<Partial<Record<Gait, THREE.AnimationAction>>>({});
  const modeRef = useRef<Gait>("idle");
  const gaitRef = useRef<Gait>("walk");
  const puffsRef = useRef<SmokePuff[]>([]);
  const wasPlaying = useRef(false);
  const dustRef = useRef<{ sprite: THREE.Sprite; life: number; vy: number }[]>([]);
  const dummyRef = useRef<Dummy | null>(null);
  const beastsRef = useRef<Beast[]>([]);
  const mentorsRef = useRef<Mentor[]>([]);
  const lootRoot = useRef<THREE.Group | null>(null);
  const lootMeshes = useRef<Map<string, THREE.Mesh>>(new Map());
  const packLeft = useRef(Array.from({ length: 24 }, () => 0));
  const mobClock = useRef(0);
  const landRef = useRef<(beast: Beast, dmg: number, crit: boolean) => void>(() => undefined);
  const wellRef = useRef<Vendor | null>(null);
  const smithRef = useRef<Vendor | null>(null);
  const townsRef = useRef<{ root: THREE.Group; hips: THREE.Object3D; role: NearKind }[]>([]);
  const gearRev = useRef(-1);
  const hitLatch = useRef(false);
  const fist = useRef(new THREE.Vector3());
  const stepRef = useRef(0);
  const footRef = useRef(1);
  const fighterRef = useRef<SwingFx | null>(null);
  const armRef = useRef<import("@/game/warrior").Arms | null>(null);
  const restRef = useRef<RestPose | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const templateRef = useRef<THREE.Object3D | null>(null);
  const remoteRootRef = useRef<THREE.Group | null>(null);
  const remoteAvatars = useRef<Map<string, RemoteAvatar>>(new Map());
  const armBlend = useRef(1);
  const runBlend = useRef(0);
  const lifeRef = useRef(0);
  const weatherRef = useRef<ReturnType<typeof createWeather> | null>(null);
  const combatRef = useRef<ReturnType<typeof createCombat> | null>(null);
  const shotLatch = useRef(false);
  const ringRef = useRef<THREE.Group | null>(null);

  useLayoutEffect(() => {
    let dead = false;
    const group = new THREE.Group();
    scene.add(group);
    weatherRef.current = createWeather(scene);
    combatRef.current = createCombat(scene);
    const ring = makeSelectRing();
    ring.visible = false;
    group.add(ring);
    ringRef.current = ring;
    const holder = new THREE.Group();
    holder.position.set(sim.x, 0, sim.z);
    group.add(holder);
    rigRef.current = holder;
    const remoteRoot = new THREE.Group();
    group.add(remoteRoot);
    remoteRootRef.current = remoteRoot;
    const smithNpc = createVendor("smith", -15.05, 18.35, Math.atan2(0 - -15.05, 8 - 18.35));
    const beasts: Beast[] = [];
    for (const spot of mobCamps()) {
      const beast = createBeast(spot.x, spot.z, spot.id, spot.pack, spot.spec);
      beasts.push(beast);
      group.add(beast.root);
    }
    const mentors = MENTORS.map((row) => {
      const mentor = createMentor(row.name, row.x, row.z, faceYaw(row.x, row.z), row.cls);
      const arrow = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.38, 8),
        new THREE.MeshBasicMaterial({ color: "#e6c36a" }),
      );
      arrow.rotation.x = Math.PI;
      arrow.position.y = 2.35;
      arrow.name = "skill-arrow";
      arrow.visible = false;
      mentor.root.add(arrow);
      group.add(mentor.root);
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.15, 0.07, 20), new THREE.MeshStandardMaterial({ color: "#9a9286", roughness: 0.86 }));
      pad.position.set(row.x, 0.04, row.z);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.06, 6, 20), new THREE.MeshStandardMaterial({ color: "#6e675e", roughness: 0.8 }));
      ring.rotation.x = Math.PI / 2;
      ring.position.set(row.x, 0.09, row.z);
      group.add(pad, ring);
      return mentor;
    });
    const lootHost = new THREE.Group();
    group.add(lootHost);
    lootRoot.current = lootHost;
    const townDefs: { role: NearKind; name: string; x: number; z: number; cloth: string; spear?: boolean; yaw?: number }[] = [
      { role: "guard", name: "Köy Muhafızı", x: 2.2, z: 2.5, cloth: "#3a4634", spear: true, yaw: Math.atan2(0 - 2.2, 54 - 2.5) },
      { role: "armor", name: "Zırhçı", x: -20.4, z: 0.4, cloth: "#4a4036" },
      { role: "weapon", name: "Silahçı", x: 20.4, z: -0.2, cloth: "#4a3434" },
      { role: "market", name: "Satıcı", x: -12.95, z: 19.85, cloth: "#314438" },
      { role: "depot", name: "Depo", x: 11.2, z: 24.2, cloth: "#343844" },
      { role: "stable", name: "Seyis", x: 16.6, z: 16.4, cloth: "#5a4630" },
      { role: "fisher", name: "Balıkçı", x: 33, z: 56, cloth: "#2c4550" },
      { role: "miner", name: "Madenci", x: 70, z: 10, cloth: "#4a4034" },
    ];
    const padGeo = new THREE.CylinderGeometry(1.15, 1.25, 0.07, 22);
    const ringGeo = new THREE.TorusGeometry(1.18, 0.07, 6, 22);
    const padMat = new THREE.MeshStandardMaterial({ color: "#9a9286", roughness: 0.86 });
    const ringMat = new THREE.MeshStandardMaterial({ color: "#6e675e", roughness: 0.8 });
    const dropPad = (x: number, z: number) => {
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(x, 0.04, z);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, 0.09, z);
      group.add(pad, ring);
    };
    townsRef.current = townDefs.map((row) => {
      const npc = createTownsman(row.name, row.x, row.z, row.yaw ?? faceYaw(row.x, row.z), row.cloth, Boolean(row.spear));
      if (row.role === "fisher") npc.root.position.y = PIER_TOP;
      else dropPad(row.x, row.z);
      group.add(npc.root);
      return { root: npc.root, hips: npc.hips, role: row.role };
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
    const dustMap = new THREE.CanvasTexture(dustCanvas);
    dustMap.colorSpace = THREE.SRGBColorSpace;
    dustRef.current = Array.from({ length: 14 }, () => {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: dustMap,
          transparent: true,
          depthWrite: false,
          opacity: 0,
        }),
      );
      sprite.visible = false;
      sprite.scale.set(0.3, 0.3, 0.3);
      group.add(sprite);
      return { sprite, life: 1, vy: 0.4 };
    });

    const fx = createSwingFx();
    group.add(fx.root);
    fighterRef.current = fx;
    const gltfLoader = new GLTFLoader();
    void (async () => {
      try {
        const body = await gltfLoader.loadAsync("/models/man.glb");
        if (dead) return;
        const model = body.scene;
        dress(model);
        model.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = false;
          mesh.frustumCulled = true;
        });
        model.rotation.y = Math.PI;
        const bounds = new THREE.Box3().setFromObject(model);
        model.position.y = -bounds.min.y;
        model.updateMatrixWorld(true);
        restRef.current = captureRest(model);
        templateRef.current = cloneSkeleton(model);
        holder.add(model);
        modelRef.current = model;
        const pick = (name: string) => model.getObjectByName(name) as THREE.Bone | undefined;
        const need = (name: string) => {
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
          spine: pick("Spine") ?? pick("Spine1") ?? null,
        };
      } catch (error) {
        console.error(error);
      }
    })();

    const temp = new THREE.Mesh(
      new THREE.CircleGeometry(28, 24),
      new THREE.MeshStandardMaterial({ color: "#4d5a3e", roughness: 1 }),
    );
    temp.rotation.x = -Math.PI / 2;
    temp.receiveShadow = true;
    group.add(temp);

    const light = lightRef.current;
    if (light) scene.add(light.target);

    const loader = new THREE.TextureLoader();
    const load = (url: string) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });

    let sky: THREE.Object3D | null = null;
    void (async () => {
      try {
        const [stone, wood, thatch, skyTex] = await Promise.all([
          load("/textures/stone.jpg"),
          load("/textures/wood.jpg"),
          load("/textures/thatch.jpg"),
          load("/textures/sky.jpg"),
        ]);
        if (dead) return;
        const ground = await composeGround();
        if (dead) return;
        group.remove(temp);
        temp.geometry.dispose();
        (temp.material as THREE.Material).dispose();
        const built = buildVillage({ stone, wood, thatch, ground });
        group.add(built.root);
        puffsRef.current = built.puffs;
        if (built.dummy) dummyRef.current = adoptDummy(built.dummy as THREE.Group);

        skyTex.colorSpace = THREE.SRGBColorSpace;
        sky = new THREE.Mesh(
          new THREE.SphereGeometry(520, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
          new THREE.MeshBasicMaterial({
            map: skyTex,
            side: THREE.BackSide,
            fog: false,
            depthWrite: false,
          }),
        );
        sky.position.y = -18;
        scene.add(sky);

        const pmrem = new THREE.PMREMGenerator(gl);
        const envSrc = skyTex.clone();
        envSrc.mapping = THREE.EquirectangularReflectionMapping;
        envSrc.needsUpdate = true;
        scene.environment = pmrem.fromEquirectangular(envSrc).texture;
        scene.environmentIntensity = 0.4;
        pmrem.dispose();
        useHud.getState().setReady(true);
      } catch (error) {
        console.error(error);
        if (!dead) useHud.getState().setReady(true);
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
          const mesh = obj as THREE.Mesh;
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

  const floatAt = (x: number, y: number, z: number, text: string, crit: boolean) => {
    const host = document.getElementById("combat-floats");
    if (!host) return;
    const el = document.createElement("div");
    el.textContent = text;
    el.className = crit
      ? "pointer-events-none absolute text-lg font-semibold text-gold"
      : "pointer-events-none absolute text-base font-semibold text-fg";
    host.appendChild(el);
    const v = _look.set(x, y, z).project(camera);
    el.style.left = `${(v.x * 0.5 + 0.5) * 100}%`;
    el.style.top = `${(-v.y * 0.5 + 0.5) * 100}%`;
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
    if (!fx || !arms || fx.swing < 0.28 || fx.swing > 0.74) {
      if (!fx || fx.swing < 0.08) hitLatch.current = false;
      return;
    }
    if (hitLatch.current) return;
    const style = weaponStyleOf(useRpg.getState().equipped.weapon?.id);
    if (style === "bow" || style === "staff") {
      if (fx.swing < 0.5) {
        if (fx.swing < 0.12) hitLatch.current = false;
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
      const tx = picked ? picked.root.position.x : dummy!.root.position.x;
      const tz = picked ? picked.root.position.z : dummy!.root.position.z;
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
    const handBone = fx.side > 0 ? arms.rHand : arms.lHand;
    const hand = handBone;
    if (!hand) return;
    hand.getWorldPosition(fist.current);
    const reachDist = style === "dagger" ? 1.7 : style === "sword" ? 2.05 : 1.55;
    const reach = (tx: number, tz: number, h: number) => {
      const hand = fist.current.distanceTo(_desired.set(tx, h, tz));
      const body = Math.hypot(sim.x - tx, sim.z - tz);
      return hand < reachDist || body < reachDist + 0.35;
    };
    const aim = (tx: number, tz: number) => {
      const dx = tx - sim.x;
      const dz = tz - sim.z;
      const len = Math.hypot(dx, dz) || 1;
      const fx = -Math.sin(sim.yaw);
      const fz = -Math.cos(sim.yaw);
      return (dx / len) * fx + (dz / len) * fz;
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
    const lockedMelee =
      selNow?.kind === "mob" && selNow.id !== "dummy"
        ? herd.find((beast) => beast.id === selNow.id && beast.alive && Math.hypot(beast.root.position.x - sim.x, beast.root.position.z - sim.z) < leash)
        : null;
    const beasts = herd.filter(
      (beast) => beast.alive && reach(beast.root.position.x, beast.root.position.z, 1.05) && aim(beast.root.position.x, beast.root.position.z) > 0.2,
    );
    const cut = lockedMelee ? [lockedMelee] : aoe ? beasts : beasts.slice(0, 1);
    const dummyHit = Boolean(dummy?.alive && reach(dummy.root.position.x, dummy.root.position.z, 1.25) && aim(dummy.root.position.x, dummy.root.position.z) > 0.15);
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
    const dt = Math.min(delta, 0.05);
    const playing = useHud.getState().playing;
    const click = takePick();
    if (click && playing) {
      const rect = gl.domElement.getBoundingClientRect();
      if (rect.width > 2 && rect.height > 2) {
        _ndc.set(((click.x - rect.left) / rect.width) * 2 - 1, -((click.y - rect.top) / rect.height) * 2 + 1);
        _picker.setFromCamera(_ndc, camera);
        let bestT = 40;
        const hit: { best: Sel | null; talk: { role: NearKind; mentor: string | null } | null } = { best: null, talk: null };
        const consider = (t: number | null, next: Sel | null, npc?: { role: NearKind; mentor: string | null }) => {
          if (t != null && t < bestT) {
            bestT = t;
            hit.best = next;
            hit.talk = npc ?? null;
          }
        };
        const dummyHit = dummyRef.current;
        if (dummyHit?.alive) {
          consider(cylinderT(_picker.ray, dummyHit.root.position.x, dummyHit.root.position.z, 0.72, 0, 2.5), {
            kind: "mob",
            id: "dummy",
            name: "Talim Kuklası",
          });
        }
        for (const beast of beastsRef.current) {
          if (!beast.alive) continue;
          consider(cylinderT(_picker.ray, beast.root.position.x, beast.root.position.z, 0.85, 0, 1.9), {
            kind: "mob",
            id: beast.id,
            name: beast.name,
          });
        }
        for (const [id, body] of remotes) {
          consider(cylinderT(_picker.ray, body.x, body.z, 0.58, 0, 2.05), {
            kind: "player",
            id,
            nick: body.nick,
            level: body.level,
          });
        }
        for (const town of townsRef.current) {
          consider(cylinderT(_picker.ray, town.root.position.x, town.root.position.z, 0.55, 0, 2.05), null, {
            role: town.role,
            mentor: null,
          });
        }
        for (const mentor of mentorsRef.current) {
          const row = MENTORS.find((item) => item.name === mentor.name);
          consider(cylinderT(_picker.ray, mentor.root.position.x, mentor.root.position.z, 0.55, 0, 2.05), null, {
            role: "mentor",
            mentor: row?.id ?? null,
          });
        }
        const smith = smithRef.current;
        if (smith) {
          consider(cylinderT(_picker.ray, smith.root.position.x, smith.root.position.z, 0.6, 0, 2.1), null, {
            role: "smith",
            mentor: null,
          });
        }
        consider(cylinderT(_picker.ray, 0, 0, 0.7, 0, 1.3), null, { role: "well", mentor: null });
        for (const vein of VEINS) {
          consider(cylinderT(_picker.ray, vein.x, vein.z, 0.7, 0, 1.2), null, { role: "vein", mentor: null });
        }
        if (hit.talk) {
          useRpg.getState().setNear(hit.talk.role, hit.talk.mentor);
          useRpg.getState().interact();
        } else if (hit.best) setSelection(hit.best);
        else {
          let dropId = "";
          let dropT = 12;
          for (const row of fieldLoot()) {
            const t = cylinderT(_picker.ray, row.x, row.z, 0.55, 0, 0.7);
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
              useRpg.setState({ bag, toast: `${found.name} alındı` });
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
      sim.menuAngle += dt * 0.07;
    } else {
      const { fwd, str } = axes();
      const camYaw = input.orbit;
      sim.cameraYaw = camYaw;
      const picked = readTarget().sel;
      const locked =
        picked?.kind === "mob" ? beastsRef.current.find((beast) => beast.id === picked.id && beast.alive) ?? null : null;
      const fx = -Math.sin(camYaw);
      const fz = -Math.cos(camYaw);
      const rx = Math.cos(camYaw);
      const rz = -Math.sin(camYaw);
      const mx = fx * fwd + rx * str;
      const mz = fz * fwd + rz * str;
      const len = Math.hypot(mx, mz);
      const movingNow = len > 0.08;
      const sprintHeld = held("ShiftLeft") || held("ShiftRight") || input.sprint || input.joyY > 0.82;
      const sprinting = movingNow && sprintHeld && useRpg.getState().sta > 4;
      const pace = useRpg.getState().moveSpeed(sprinting);
      const target = movingNow ? pace * Math.min(1, len) : 0;
      const rate = movingNow ? 22 : 30;
      sim.speed += (target - sim.speed) * (1 - Math.exp(-rate * dt));
      if (!movingNow && sim.speed < 0.04) sim.speed = 0;
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
      if (wlen > 0.05) {
        moveX = sim.wishX / wlen;
        moveZ = sim.wishZ / wlen;
        const nx = sim.x + moveX * sim.speed * dt;
        const nz = sim.z + moveZ * sim.speed * dt;
        const next = slide(sim.x, sim.z, nx, nz, PLAYER_R);
        sim.x = next.x;
        sim.z = next.z;
        sim.phase += dt * (sprinting ? 10.4 : 6.6);
      } else {
        sim.phase += dt * 1.3;
      }
      if (inWater(sim.x, sim.z, 0)) {
        const dry = dryLand(sim.x, sim.z, PLAYER_R);
        if (dry) {
          sim.x = dry.x;
          sim.z = dry.z;
        }
      }
      if (wlen > 0.05) {
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
    const moving = playing && sim.speed > 0.2;
    lifeRef.current += dt;
    const rpg = useRpg.getState();
    const attacking = playing && held("Space");
    const sprintingNow =
      playing &&
      moving &&
      (held("ShiftLeft") || held("ShiftRight") || input.sprint);
    const runTarget = sprintingNow ? 1 : 0;
    runBlend.current += (runTarget - runBlend.current) * (1 - Math.exp(-6 * dt));
    const fx = fighterRef.current;
    if (fx) advanceSwing(fx, attacking, dt, rpg.attackGap());
    const style: WeaponStyle = weaponStyleOf(rpg.equipped.weapon?.id);
    const armed = style !== "fist";
    if (fx && (style === "sword" || style === "staff" || style === "pala")) fx.side = 1;
    if (modelRef.current && restRef.current) {
      try {
        poseFighter(modelRef.current, restRef.current, {
          moving,
          run: runBlend.current,
          cycle: sim.phase,
          time: lifeRef.current,
          swing: fx?.swing ?? 0,
          side: style === "dagger" || !armed ? (fx?.side ?? 1) : 1,
          armed,
          style,
        });
        syncBow(modelRef.current, style === "bow" ? punchExtend(fx?.swing ?? 0) : 0);
      } catch (error) {
        console.error(error);
      }
    }
    if (fx) {
      const hand = style === "bow" ? armRef.current?.lHand : fx.side > 0 ? armRef.current?.rHand : armRef.current?.lHand;
      if (hand) hand.getWorldPosition(fist.current);
      punchArc(fx, fist.current, dt);
      if (fx.swing < 0.12) shotLatch.current = false;
      const release = style === "bow" ? fx.swing > 0.58 && fx.swing < 0.76 : style === "staff" && fx.swing > 0.42 && fx.swing < 0.62;
      if (release && !shotLatch.current && modelRef.current) {
        shotLatch.current = true;
        const origin = _aim.copy(fist.current);
        if (origin.y < 0.6) origin.set(sim.x, 1.25, sim.z);
        const sel = readTarget().sel;
        const mark =
          sel?.kind === "mob" && sel.id !== "dummy"
            ? beastsRef.current.find((beast) => beast.id === sel.id && beast.alive)
            : sel?.kind === "mob" && dummyRef.current?.alive
              ? dummyRef.current
              : null;
        const home = mark && "id" in mark && typeof mark.id === "string" ? mark.id : mark ? "dummy" : "";
        if (!mark) {
          shotLatch.current = true;
        } else {
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
            shareXp(3 + Math.round(beast.level * 0.45));
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
        const foe = duel.phase === "live" ? remotes.get(duel.id) : undefined;
        const foeDist = foe ? Math.hypot(foe.x - sim.x, foe.z - sim.z) : 99;
        const sel = readTarget().sel;
        const beast = sel?.kind === "mob" ? beastsRef.current.find((row) => row.id === sel.id && row.alive) ?? null : null;
        const dist = beast ? Math.hypot(beast.root.position.x - sim.x, beast.root.position.z - sim.z) : 99;
        const critRoll = cast.crit && Math.random() < 0.42;
        const dmg = critRoll ? Math.round(cast.dmg * 1.65) : cast.dmg;
        const stamp = (target: Beast) => {
          const dealt = mitigate(target.level, useRpg.getState().level, dmg);
          if (cast.slow) target.slow = 4;
          if (cast.dot) {
            target.poison = 5;
            target.poisonDps = Math.max(1, Math.round(dealt * 0.22));
          }
        };
        if (!cast.aoe && classId !== "savasci" && classId !== "ninja" && !beast && !foe) {
          useRpg.setState({ toast: "Önce bir hedef seç" });
        } else if (foe && foeDist < reach) {
          for (let n = 0; n < cast.hits; n++) sendDuelHit(n === 0 ? dmg : Math.max(1, Math.round(dmg * 0.7)), critRoll);
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
          for (let n = 0; n < cast.hits; n++) landRef.current(beast, n === 0 ? dmg : Math.max(1, Math.round(dmg * 0.7)), critRoll && n === 0);
          if (melee) combatRef.current?.slash(sim.x, 1.15, sim.z, sim.yaw, false);
          else {
            const origin = _aim.set(sim.x, 1.35, sim.z);
            _look.set(beast.root.position.x - origin.x, 1.05 - origin.y, beast.root.position.z - origin.z);
            if (classId === "okcu") combatRef.current?.fireArrow(origin, _look, 0, false, beast.id);
            else combatRef.current?.fireBolt(origin, _look, 0, false, beast.id);
          }
        } else useRpg.setState({ toast: beast || foe ? "Hedef menzil dışında" : "Önce bir hedef seç" });
      }
      if (host) {
        for (const hit of takeRemoteHits()) {
          const beast = beastsRef.current.find((row) => row.id === hit.id && row.alive);
          if (!beast) continue;
          angerPack(beastsRef.current, beast.pack);
          hitBeast(beast, hit.dmg);
          floatAt(beast.root.position.x, 1.55, beast.root.position.z, `${hit.dmg}`, false);
          if (!beast.alive) sendReward(hit.from, 55, 22);
        }
      } else takeRemoteHits();
      resolveHits();
      const dummy = dummyRef.current;
      const beasts = beastsRef.current;
      const well = wellRef.current;
      const smith = smithRef.current;
      if (dummy) tickDummy(dummy, dt, camera);
      if (well) tickVendor(well, lifeRef.current);
      if (smith) tickVendor(smith, lifeRef.current);
      for (const mentor of mentorsRef.current) mentor.hips.rotation.y = Math.sin(lifeRef.current * 0.7 + mentor.root.position.x) * 0.06;
      const rpgNow = useRpg.getState();
      const learned = Boolean(rpgNow.chosenTree) || Object.values(rpgNow.skills ?? {}).some((rank) => Number(rank) > 0);
      const skillQuest = rpgNow.quests.find((quest) => quest.id === "q-skills");
      const showSkillMarks = rpgNow.level >= 5 && !learned && !(skillQuest && (skillQuest.done || skillQuest.claimed));
      for (const mentor of mentorsRef.current) {
        const arrow = mentor.root.getObjectByName("skill-arrow");
        if (!arrow) continue;
        const row = MENTORS.find((item) => item.name === mentor.name);
        arrow.visible = Boolean(showSkillMarks && row && row.cls === rpgNow.classId);
        if (arrow.visible) arrow.position.y = 2.28 + Math.sin(lifeRef.current * 4 + mentor.root.position.x) * 0.14;
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
            const dist = Math.hypot(dx, dz) || 0.001;
            if (dist < 1.35) {
              beast.root.position.x += (dx / dist) * (1.35 - dist) * 0.45;
              beast.root.position.z += (dz / dist) * (1.35 - dist) * 0.45;
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
              shareXp(3 + Math.round(beast.level * 0.45));
              useRpg.getState().addGold(4 + beast.level);
              useRpg.getState().noteKill();
              useRpg.setState({ toast: `${beast.name} düştü` });
            }
          }
          const struck = tickBeast(beast, dt, sim.x, sim.z, camera, false);
          if (struck) {
            const bite = Math.atan2(-(sim.x - beast.root.position.x), -(sim.z - beast.root.position.z));
            combatRef.current?.slash(beast.root.position.x, 0.85, beast.root.position.z, bite, false);
            const me = useRpg.getState();
            const dmg = mobBite(beast.level, me.level, me.hpMax);
            const dead = me.hurtPlayer(dmg);
            floatAt(sim.x, 1.5, sim.z, `-${dmg}`, false);
            if (dead) {
              useRpg.setState({ hp: useRpg.getState().hpMax * 0.45, toast: "Yendin. Meydanda toparlandın" });
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
        if (mobClock.current > 0.15) {
          mobClock.current = 0;
          pushMobState(
            beasts.map((beast) => ({
              id: beast.id,
              hp: beast.hp,
              alive: beast.alive,
              anger: beast.anger,
              x: beast.root.position.x,
              z: beast.root.position.z,
            })),
          );
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
      let near: NearKind | null = null;
      let mentorId: string | null = null;
      for (const mentor of mentorsRef.current) {
        if (Math.hypot(sim.x - mentor.root.position.x, sim.z - mentor.root.position.z) < 1.8) {
          near = "mentor";
          mentorId = MENTORS.find((row) => row.name === mentor.name)?.id ?? null;
          break;
        }
      }
      if (!near) {
        for (const town of townsRef.current) {
          if (Math.hypot(sim.x - town.root.position.x, sim.z - town.root.position.z) < 2.15) {
            near = town.role;
            break;
          }
        }
      }
      if (!near && smith && Math.hypot(sim.x - smith.root.position.x, sim.z - smith.root.position.z) < 2.6) near = "smith";
      if (!near && Math.hypot(sim.x, sim.z) < 1.55) near = "well";
      if (!near) {
        const r = Math.hypot(sim.x, sim.z);
        const shore = (r > 45.5 && r < 47.6) || (r > 61 && r < 63.4) || onPier(sim.x, sim.z);
        if (shore && !bridgeName(sim.x, sim.z)) near = "fish";
      }
      if (!near) {
        for (const vein of VEINS) {
          if (Math.hypot(sim.x - vein.x, sim.z - vein.z) < 1.8) {
            near = "vein";
            break;
          }
        }
      }
      for (const town of townsRef.current) town.hips.rotation.y = Math.sin(lifeRef.current * 0.6 + town.root.position.x) * 0.05;
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
      const targets: ShotTarget[] = [];
      if (dummy?.alive) targets.push({ id: "dummy", x: dummy.root.position.x, y: 1.25, z: dummy.root.position.z, alive: true });
      for (const beast of beasts) {
        if (beast.alive) targets.push({ id: beast.id, x: beast.root.position.x, y: 1.05, z: beast.root.position.z, alive: true });
      }
      if (duel.phase === "live") {
        const foe = remotes.get(duel.id);
        if (foe) targets.push({ id: "duel", x: foe.x, y: 1.2, z: foe.z, alive: true });
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
      for (const item of takePendingDrops()) placeLoot(item, sim.x + 0.35, sim.z + 0.15);
      const bagHost = lootRoot.current;
      if (bagHost) {
        const rows = fieldLoot();
        const ids = new Set(rows.map((row) => row.id));
        for (const [id, mesh] of lootMeshes.current) {
          if (!ids.has(id)) {
            bagHost.remove(mesh);
            lootMeshes.current.delete(id);
          }
        }
        for (const row of rows) {
          let mesh = lootMeshes.current.get(row.id);
          if (!mesh) {
            mesh = new THREE.Mesh(
              new THREE.BoxGeometry(0.26, 0.16, 0.26),
              new THREE.MeshStandardMaterial({ color: "#c9a15b", roughness: 0.42, metalness: 0.35 }),
            );
            mesh.castShadow = true;
            bagHost.add(mesh);
            lootMeshes.current.set(row.id, mesh);
          }
          mesh.position.set(row.x, 0.1, row.z);
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
      if (stepRef.current > (runBlend.current > 0.45 ? 0.38 : 0.58)) {
        stepRef.current = 0;
        const pool = dustRef.current;
        const puff = pool.find((item) => item.life >= 1) ?? pool[0];
        if (puff) {
          const side = footRef.current;
          footRef.current = -side;
          const yaw = sim.yaw;
          puff.sprite.visible = true;
          puff.sprite.position.set(
            sim.x + Math.cos(yaw) * side * 0.16 + Math.sin(yaw) * 0.08,
            0.05,
            sim.z - Math.sin(yaw) * side * 0.16 + Math.cos(yaw) * 0.08,
          );
          puff.life = 0;
          puff.vy = 0.32 + Math.random() * 0.2;
        }
      }
    }
    for (const puff of dustRef.current) {
      if (puff.life >= 1) continue;
      puff.life += dt * 1.7;
      puff.sprite.position.y += puff.vy * dt;
      const mat = puff.sprite.material as THREE.SpriteMaterial;
      mat.opacity = Math.max(0, 0.42 * (1 - puff.life));
      const size = 0.2 + puff.life * 0.42;
      puff.sprite.scale.set(size, size, size);
      if (puff.life >= 1) puff.sprite.visible = false;
    }
    tickSmoke(puffsRef.current, dt);
    weatherRef.current?.update(dt, lifeRef.current, playing ? sim.x : 0, playing ? sim.z : 0);

    const persp = camera as THREE.PerspectiveCamera;
    if (!playing) {
      const dist = 18;
      const pitch = 0.5;
      const ang = sim.menuAngle;
      _look.set(0, 1.4, -1.5);
      _desired.set(
        Math.sin(ang) * Math.cos(pitch) * dist,
        1.4 + Math.sin(pitch) * dist * 0.72,
        Math.cos(ang) * Math.cos(pitch) * dist,
      );
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
        const cy = 1.42 + Math.sin(pitch) * dist * Math.max(0.42, pull);
        if (!occluded(sim.x + spanX * pull, sim.z + spanZ * pull, 0.45, cy)) break;
        pull *= 0.62;
      }
      _desired.set(sim.x + spanX * pull, 1.42 + Math.sin(pitch) * dist * Math.max(0.42, pull), sim.z + spanZ * pull);
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
      for (const [id, av] of avatars) {
        if (!remotes.has(id)) {
          host.remove(av.root);
          avatars.delete(id);
        }
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
        av.phase += dt * (body.moving ? (body.run > 0.45 ? 10.2 : 6.4) : 1.2);
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
            style: (body.style || (body.weapon ? "sword" : "fist")) as WeaponStyle,
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
      _plate.y += 0.36;
      _plate.project(camera);
      if (_plate.z > 1) plate.style.display = "none";
      else {
        plate.style.display = "block";
        plate.style.left = `${(_plate.x * 0.5 + 0.5) * 100}%`;
        plate.style.top = `${(-_plate.y * 0.5 + 0.5) * 100}%`;
        const who = useRpg.getState();
        const text = `${who.nick} · Sv.${who.level}`;
        if (plate.textContent !== text) plate.textContent = text;
      }
    } else if (plate) plate.style.display = "none";

    const bubbleHost = document.getElementById("chat-bubbles");
    if (bubbleHost) {
      const now = performance.now();
      const bubbles = chatBubbles(now);
      const seen = new Set<string>();
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
            by = _plate.y + 0.42;
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
        let el = document.getElementById(`bubble-${bubble.key}`) as HTMLDivElement | null;
        if (!el) {
          el = document.createElement("div");
          el.id = `bubble-${bubble.key}`;
          el.style.cssText =
            "position:absolute;transform:translate(-50%,-140%);max-width:14rem;pointer-events:none;background:rgba(20,17,14,0.9);border:1px solid #3f3830;border-radius:8px;padding:3px 8px;color:#f3efe8;font-size:13px;text-align:center";
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
        el.style.left = `${(_plate.x * 0.5 + 0.5) * 100}%`;
        el.style.top = `${(-_plate.y * 0.5 + 0.5) * 100}%`;
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
        scale = 0.95;
        show = true;
      } else if (duel.phase === "idle") setSelection(null);
    }
    live.visible = show;
    if (show) {
      const dist = Math.max(4, camera.position.distanceTo(live.position));
      const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(lifeRef.current * 7.5));
      live.position.set(x, groundY(x, z) + 0.04, z);
      live.rotation.set(0, 0, 0);
      live.scale.setScalar(scale * pulse * Math.min(2.6, dist / 7));
      const hot = duel.phase === "live" && sel?.kind === "player" && sel.id === duel.id;
      const fill = hot ? 0xff4d3a : 0xff2a2a;
      const mat = (live.children[0] as THREE.Mesh | undefined)?.material as THREE.MeshBasicMaterial | undefined;
      if (mat) {
        mat.color.setHex(fill);
        mat.opacity = 0.35 + pulse * 0.65;
      }
    }
    const probe = globalThis as typeof globalThis & { __selRing?: { visible: boolean; x: number; z: number } };
    probe.__selRing = { visible: live.visible, x: live.position.x, z: live.position.z };
  });

  return (
    <>
      <fog attach="fog" args={["#b9c3bc", 55, 280]} />
      <hemisphereLight args={["#d5e0e8", "#3a342c", 0.62]} />
      <directionalLight
        ref={lightRef}
        position={[8, 12, 5]}
        intensity={1.7}
        color="#fff1dc"
      />
    </>
  );
}

export function VillageScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows={false}
        dpr={1}
        performance={{ min: 0.5 }}
        flat
        camera={{ fov: 42, near: 0.08, far: 280, position: [8, 7, 16] }}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(1);
          gl.shadowMap.enabled = false;
          gl.setClearColor("#9aa8ab");
        }}
      >
        <World />
      </Canvas>
    </div>
  );
}
