import * as THREE from "three";

export type SwingFx = {
  root: THREE.Group;
  swing: number;
  side: number;
  spawned: boolean;
  arcs: { mesh: THREE.Mesh; life: number }[];
};

export function createSwingFx(): SwingFx {
  const root = new THREE.Group();
  const arcGeo = new THREE.TorusGeometry(0.18, 0.01, 5, 12, Math.PI * 0.55);
  const arcs = Array.from({ length: 4 }, () => {
    const mesh = new THREE.Mesh(
      arcGeo,
      new THREE.MeshBasicMaterial({
        color: "#ffe6cc",
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    mesh.visible = false;
    mesh.frustumCulled = false;
    root.add(mesh);
    return { mesh, life: 1 };
  });
  return { root, swing: 0, side: 1, spawned: false, arcs };
}

export type Arms = {
  left: THREE.Bone;
  right: THREE.Bone;
  lFore: THREE.Bone;
  rFore: THREE.Bone;
  lHand: THREE.Bone | null;
  rHand: THREE.Bone | null;
  lShoulder: THREE.Bone | null;
  rShoulder: THREE.Bone | null;
  spine: THREE.Bone | null;
};

const FIST: Record<string, number> = {
  LeftHandIndex1: 1.15,
  LeftHandMiddle1: 1.2,
  LeftHandRing1: 1.15,
  LeftHandPinky1: 1.0,
  LeftHandIndex2: 0.9,
  LeftHandMiddle2: 0.95,
  LeftHandRing2: 0.9,
  LeftHandPinky2: 0.75,
  LeftHandThumb1: 0.45,
  RightHandIndex1: 1.15,
  RightHandMiddle1: 1.2,
  RightHandRing1: 1.15,
  RightHandPinky1: 1.0,
  RightHandIndex2: 0.9,
  RightHandMiddle2: 0.95,
  RightHandRing2: 0.9,
  RightHandPinky2: 0.75,
  RightHandThumb1: 0.45,
};

export type RestPose = {
  quat: Record<string, THREE.Quaternion>;
  pos: Record<string, THREE.Vector3>;
  groundY: number;
  footClear: number;
  l1: number;
  l2: number;
  r1: number;
  r2: number;
};

export function captureRest(model: THREE.Object3D): RestPose {
  const quat: Record<string, THREE.Quaternion> = {};
  const pos: Record<string, THREE.Vector3> = {};
  model.traverse((obj) => {
    const bone = obj as THREE.Bone;
    if (!bone.isBone) return;
    quat[bone.name] = bone.quaternion.clone();
    pos[bone.name] = bone.position.clone();
  });
  model.updateMatrixWorld(true);
  const len = (a: string, b: string) => {
    const A = model.getObjectByName(a) as THREE.Bone;
    const B = model.getObjectByName(b) as THREE.Bone;
    return A.getWorldPosition(new THREE.Vector3()).distanceTo(B.getWorldPosition(new THREE.Vector3()));
  };
  const footY = (name: string) => (model.getObjectByName(name) as THREE.Bone).getWorldPosition(new THREE.Vector3()).y;
  return {
    quat,
    pos,
    groundY: model.position.y,
    footClear: Math.min(footY("LeftFoot"), footY("RightFoot")),
    l1: len("LeftArm", "LeftForeArm"),
    l2: len("LeftForeArm", "LeftHand"),
    r1: len("RightArm", "RightForeArm"),
    r2: len("RightForeArm", "RightHand"),
  };
}

const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _m = new THREE.Matrix4();
const _inv = new THREE.Quaternion();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _p = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _left = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _down = new THREE.Vector3(0, -1, 0);
const _lt = new THREE.Vector3();
const _rt = new THREE.Vector3();
const _poleL = new THREE.Vector3();
const _poleR = new THREE.Vector3();
const _jab = new THREE.Vector3();
const _in = new THREE.Vector3();
export type WeaponStyle = "fist" | "sword" | "bow" | "staff" | "dagger" | "pala";

const _elbow = new THREE.Vector3();
const _finger = new THREE.Vector3();
const _palm = new THREE.Vector3();

function pointHand(model: THREE.Object3D, name: string, finger: THREE.Vector3, palm: THREE.Vector3) {
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

export function punchExtend(t: number) {
  if (t < 0.16) return 0;
  if (t < 0.38) return (t - 0.16) / 0.22;
  if (t < 0.58) return 1;
  return Math.max(0, 1 - (t - 0.58) / 0.42);
}

function bone(model: THREE.Object3D, name: string) {
  return model.getObjectByName(name) as THREE.Bone | undefined;
}

function resetPose(model: THREE.Object3D, rest: RestPose) {
  for (const [name, q] of Object.entries(rest.quat)) {
    const part = bone(model, name);
    if (!part) continue;
    part.quaternion.copy(q);
    const p = rest.pos[name];
    if (p) part.position.copy(p);
  }
}

function twist(model: THREE.Object3D, rest: RestPose, name: string, x: number, y: number, z: number) {
  const part = bone(model, name);
  const q = rest.quat[name];
  if (!part || !q || (Math.abs(x) + Math.abs(y) + Math.abs(z) < 0.0001)) return;
  part.quaternion.copy(q).multiply(_q.setFromEuler(_e.set(x, y, z)));
}

function aimY(part: THREE.Bone, target: THREE.Vector3, pole: THREE.Vector3) {
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

function elbowAt(shoulder: THREE.Vector3, hand: THREE.Vector3, l1: number, l2: number, pole: THREE.Vector3, out: THREE.Vector3) {
  _a.copy(hand).sub(shoulder);
  const raw = _a.length() || 0.001;
  const max = l1 + l2 * 0.98;
  const min = Math.abs(l1 - l2) + 0.02;
  const dist = Math.min(max, Math.max(min, raw));
  _a.multiplyScalar(1 / raw);
  const cosA = THREE.MathUtils.clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  _b.copy(pole);
  _b.addScaledVector(_a, -_b.dot(_a));
  if (_b.lengthSq() < 1e-6) _b.copy(_down);
  _b.normalize();
  out.copy(shoulder).addScaledVector(_a, cosA * l1).addScaledVector(_b, sinA * l1);
}

function solveArm(
  model: THREE.Object3D,
  armName: string,
  foreName: string,
  l1: number,
  l2: number,
  target: THREE.Vector3,
  pole: THREE.Vector3,
  twistAmt = 0.05,
) {
  const arm = bone(model, armName);
  const fore = bone(model, foreName);
  if (!arm || !fore) return;
  arm.updateMatrixWorld(true);
  const shoulder = arm.getWorldPosition(_c);
  elbowAt(shoulder, target, l1, l2, pole, _elbow);
  aimY(arm, _elbow, pole);
  arm.updateMatrixWorld(true);
  aimY(fore, target, pole);
  fore.quaternion.multiply(_q.setFromAxisAngle(_y.set(0, 1, 0), armName.startsWith("Left") ? twistAmt : -twistAmt));
}

export function advanceSwing(fx: SwingFx, attacking: boolean, dt: number, dur: number) {
  if (attacking && fx.swing <= 0) {
    fx.swing = 0.001;
    fx.spawned = false;
  }
  if (fx.swing > 0) {
    fx.swing += dt / Math.max(0.22, dur);
    if (fx.swing >= 1) {
      fx.swing = attacking ? 0.001 : 0;
      fx.spawned = false;
      if (attacking) fx.side *= -1;
    }
  }
}

export function punchArc(fx: SwingFx, origin: THREE.Vector3, dt: number) {
  const t = fx.swing > 0 ? Math.min(fx.swing, 0.999) : 0;
  const extend = t > 0 ? punchExtend(t) : 0;
  if (extend > 0.92 && !fx.spawned) {
    fx.spawned = true;
    const arc = fx.arcs.find((item) => item.life >= 1) ?? fx.arcs[0]!;
    arc.mesh.position.copy(origin);
    arc.mesh.rotation.set(0.2, fx.side * 0.2, fx.side * -0.4);
    arc.mesh.scale.setScalar(1);
    arc.mesh.visible = true;
    arc.life = 0;
  }
  for (const arc of fx.arcs) {
    if (arc.life >= 1) continue;
    arc.life += dt / 0.14;
    const k = Math.min(1, arc.life);
    (arc.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.65;
    arc.mesh.scale.setScalar(1 + k * 0.35);
    if (arc.life >= 1) arc.mesh.visible = false;
  }
}

export function poseFighter(
  model: THREE.Object3D,
  rest: RestPose,
  opts: {
    moving: boolean;
    run: number;
    cycle: number;
    time: number;
    swing: number;
    side: number;
    armed?: boolean;
    style?: WeaponStyle;
  },
) {
  const { moving, run, cycle, time, swing, side, armed = false } = opts;
  const style: WeaponStyle = opts.style ?? (armed ? "sword" : "fist");
  resetPose(model, rest);

  const stride = Math.sin(cycle);
  const passing = Math.cos(cycle);
  const gait = moving ? 1 : 0;
  const thigh = (0.28 + run * 0.2) * gait;
  twist(model, rest, "LeftUpLeg", gait ? stride * thigh : 0, 0, 0);
  twist(model, rest, "RightUpLeg", gait ? -stride * thigh : 0, 0, 0);
  const kneeL = gait ? -0.06 - Math.max(0, passing) * (0.36 + run * 0.2) : 0;
  const kneeR = gait ? -0.06 - Math.max(0, -passing) * (0.36 + run * 0.2) : 0;
  twist(model, rest, "LeftLeg", kneeL, 0, 0);
  twist(model, rest, "RightLeg", kneeR, 0, 0);
  twist(model, rest, "LeftFoot", gait ? 0.02 - stride * 0.12 : 0, 0, 0);
  twist(model, rest, "RightFoot", gait ? 0.02 + stride * 0.12 : 0, 0, 0);

  const extend = swing > 0 ? punchExtend(swing) : 0;
  const leadRight = style !== "fist" || side > 0;
  const sway = Math.sin(cycle * 2) * 0.03 * gait * (1 - run * 0.35);
  const lean = extend * (leadRight ? -0.08 : 0.08);
  const sprint = moving && run > 0.45 ? 1 : 0;
  twist(model, rest, "Hips", sprint * 0.1, -sway, 0);
  twist(model, rest, "Spine", sprint * 0.12, sway * 0.2, 0);
  twist(model, rest, "Spine1", sprint * 0.05 + extend * 0.03, sway * 0.3 + lean, 0);
  twist(model, rest, "Spine2", 0, sway * 0.15, 0);

  const pulse = Math.sin(time * (1.3 + run * 2.2));
  const chest = model.getObjectByName("Spine2") as THREE.Bone | undefined;
  if (chest) chest.scale.set(1 + pulse * 0.012, 1, 1 + pulse * 0.008);

  model.updateMatrixWorld(true);
  const fwd = model.getWorldDirection(_fwd);
  const left = _left.set(1, 0, 0).applyQuaternion(model.getWorldQuaternion(_q));
  const reach = (out: THREE.Vector3, armName: string, fwdMul: number, upMul: number, sideMul: number) => {
    const shoulder = bone(model, armName)!.getWorldPosition(_p);
    out.copy(shoulder).addScaledVector(fwd, fwdMul).addScaledVector(_up, upMul).addScaledVector(left, sideMul);
  };
  const swingArm = (out: THREE.Vector3, armName: string, sign: number, outward: number) => {
    const shoulder = bone(model, armName)!.getWorldPosition(_p);
    out
      .copy(shoulder)
      .addScaledVector(_up, -0.32 + run * 0.02)
      .addScaledVector(fwd, sign * stride * (0.26 + run * 0.08))
      .addScaledVector(left, outward);
  };

  const lT = _lt;
  const rT = _rt;
  const punchRight = leadRight;
  const outward = punchRight ? -1 : 1;

  if (style === "fist") {
    if (moving && swing <= 0 && run > 0.45) {
      reach(lT, "LeftArm", 0.22, -0.06, 0.14);
      reach(rT, "RightArm", 0.22, -0.06, -0.14);
    } else if (moving && swing <= 0) {
      swingArm(lT, "LeftArm", -1, 0.1);
      swingArm(rT, "RightArm", 1, -0.1);
    } else if (swing <= 0) {
      reach(lT, "LeftArm", 0.02, -0.46, 0.16);
      reach(rT, "RightArm", 0.02, -0.46, -0.16);
    }
    if (swing > 0) {
      const armName = punchRight ? "RightArm" : "LeftArm";
      const shoulder = bone(model, armName)!.getWorldPosition(_jab);
      const chamber = _a.copy(shoulder).addScaledVector(_up, 0.16).addScaledVector(fwd, 0.08).addScaledVector(left, outward * 0.14);
      const strike = _c.copy(shoulder).addScaledVector(fwd, 0.55).addScaledVector(_up, 0.08).addScaledVector(left, outward * 0.02);
      const slot = punchRight ? rT : lT;
      slot.copy(chamber).lerp(strike, extend);
    }
  } else if (style === "bow") {
    const pull = swing > 0 ? extend : 0;
    reach(lT, "LeftArm", 0.36, -0.04, 0.14);
    reach(rT, "RightArm", 0.2 - pull * 0.24, -0.02, -0.04);
  } else if (style === "staff") {
    reach(lT, "LeftArm", 0.34, -0.12, 0.1);
    reach(rT, "RightArm", 0.26, 0.18, -0.06);
    if (swing > 0) {
      lT.addScaledVector(fwd, extend * 0.16);
      rT.addScaledVector(fwd, extend * 0.22).addScaledVector(_up, extend * 0.04);
    }
  } else if (style === "dagger") {
    const hitRight = side > 0;
    if (moving && swing <= 0 && run > 0.55) {
      swingArm(lT, "LeftArm", -1, 0.08);
      swingArm(rT, "RightArm", 1, -0.08);
    } else {
      reach(lT, "LeftArm", 0.22, -0.08, 0.14);
      reach(rT, "RightArm", 0.22, -0.08, -0.14);
    }
    if (swing > 0) {
      const armName = hitRight ? "RightArm" : "LeftArm";
      const shoulder = bone(model, armName)!.getWorldPosition(_jab);
      const outward = hitRight ? -1 : 1;
      const cocked = _a.copy(shoulder).addScaledVector(_up, 0.05).addScaledVector(fwd, 0.08).addScaledVector(left, outward * 0.14);
      const cut = _c.copy(shoulder).addScaledVector(fwd, 0.5).addScaledVector(left, outward * 0.02).addScaledVector(_up, 0.02);
      const slot = hitRight ? rT : lT;
      slot.copy(cocked).lerp(cut, extend);
    }
  } else if (style === "pala") {
    reach(rT, "RightArm", 0.04, -0.5, -0.2);
    reach(lT, "LeftArm", 0.1, -0.32, -0.02);
    if (swing > 0) {
      const shoulder = bone(model, "RightArm")!.getWorldPosition(_jab);
      const cocked = _a.copy(shoulder).addScaledVector(_up, 0.02).addScaledVector(left, -0.28).addScaledVector(fwd, -0.05);
      const cut = _c.copy(shoulder).addScaledVector(fwd, 0.42).addScaledVector(left, -0.05).addScaledVector(_up, -0.05);
      rT.copy(cocked).lerp(cut, extend);
      lT.addScaledVector(fwd, extend * 0.28).addScaledVector(left, -extend * 0.12);
    }
  } else {
    const len = 0.5;
    if (moving && swing <= 0) swingArm(lT, "LeftArm", -1, 0.1);
    else reach(lT, "LeftArm", 0.06, -0.42, 0.16);
    if (swing > 0) {
      const shoulder = bone(model, "RightArm")!.getWorldPosition(_jab);
      const cocked = _a.copy(shoulder).addScaledVector(_up, 0.1).addScaledVector(fwd, -0.02).addScaledVector(left, -0.2);
      const cut = _c.copy(shoulder).addScaledVector(fwd, len).addScaledVector(left, 0.12).addScaledVector(_up, 0.02);
      rT.copy(cocked).lerp(cut, extend);
    } else {
      reach(rT, "RightArm", 0.1, -0.16, -0.16);
    }
  }

  if (moving && swing <= 0) {
    _poleL.copy(fwd).multiplyScalar(-0.9).addScaledVector(left, 0.4).addScaledVector(_down, 0.2);
    _poleR.copy(fwd).multiplyScalar(-0.9).addScaledVector(left, -0.4).addScaledVector(_down, 0.2);
  } else {
    _poleL.copy(_down).addScaledVector(left, 0.4).addScaledVector(fwd, -0.45);
    _poleR.copy(_down).addScaledVector(left, -0.4).addScaledVector(fwd, -0.45);
  }
  solveArm(model, "LeftArm", "LeftForeArm", rest.l1, rest.l2, lT, _poleL, 0);
  solveArm(model, "RightArm", "RightForeArm", rest.r1, rest.r2, rT, _poleR, 0);

  const fingersFwd = _b.copy(fwd).addScaledVector(_up, 0.18);
  if (style === "fist") {
    if (swing > 0) {
      _in.copy(left);
      if (!punchRight) _in.negate();
      _in.addScaledVector(_down, 0.35);
      _jab.copy(fwd).addScaledVector(_up, 0.12);
      pointHand(model, punchRight ? "RightHand" : "LeftHand", _jab, _in);
      pointHand(model, punchRight ? "LeftHand" : "RightHand", fingersFwd, _down);
    } else {
      pointHand(model, "LeftHand", fingersFwd, _down);
      pointHand(model, "RightHand", fingersFwd, _down);
    }
  } else if (style === "bow") {
    const pull = swing > 0 ? extend : 0;
    pointHand(model, "LeftHand", _up, _jab.copy(fwd).negate());
    _in.copy(fwd).multiplyScalar(pull > 0.2 ? -0.85 : -0.25).addScaledVector(_up, 0.08);
    pointHand(model, "RightHand", _in, _down);
  } else if (style === "staff") {
    _jab.copy(_up).addScaledVector(fwd, 0.35);
    pointHand(model, "LeftHand", _jab, left);
    pointHand(model, "RightHand", _up, left);
  } else if (style === "dagger") {
    _jab.copy(fwd).addScaledVector(_up, 0.1);
    pointHand(model, "RightHand", _jab, left);
    pointHand(model, "LeftHand", _jab, _in.copy(left).negate());
  } else if (style === "pala") {
    _jab.copy(_down).addScaledVector(fwd, 0.15);
    pointHand(model, "RightHand", _jab, left);
    pointHand(model, "LeftHand", _jab, left);
  } else {
    pointHand(model, "LeftHand", fingersFwd, _down);
    _jab.copy(_up).multiplyScalar(0.82).addScaledVector(fwd, swing > 0 ? 0.15 + extend * 0.9 : 0.2);
    pointHand(model, "RightHand", _jab, left);
  }

  const curl = style === "fist" ? 1.35 : 1.15;
  for (const [name, ang] of Object.entries(FIST)) {
    const part = bone(model, name);
    const q = rest.quat[name];
    if (!part || !q) continue;
    const thumb = name.includes("Thumb");
    const sideSign = name.startsWith("Left") ? 1 : -1;
    part.quaternion.copy(q).multiply(_q.setFromEuler(_e.set(ang * curl, thumb ? 0.15 * sideSign : 0, thumb ? 0.2 * sideSign : 0)));
  }

  model.position.y = rest.groundY;
  model.updateMatrixWorld(true);
  const fy = Math.min(
    bone(model, "LeftFoot")!.getWorldPosition(_p).y,
    bone(model, "RightFoot")!.getWorldPosition(_a).y,
  );
  model.position.y -= fy - rest.footClear;
  if (run > 0.2 && moving) model.position.y += Math.abs(Math.sin(cycle * 2)) ** 2 * 0.02 * run;
}

export function stepSwing(fx: SwingFx, attacking: boolean, dt: number) {
  advanceSwing(fx, attacking, dt, 0.42);
}
