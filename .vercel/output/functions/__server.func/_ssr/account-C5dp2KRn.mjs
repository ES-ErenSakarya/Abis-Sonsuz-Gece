import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { D as authMiddleware, E as asClassId } from "./middleware-SMghQq71.mjs";
import { r as getSql } from "./db-Di6qFjM_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-C5dp2KRn.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function asJson(value, fallback) {
	if (typeof value === "string") try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
	return value ?? fallback;
}
function splitInvested(raw) {
	const obj = asJson(raw, {});
	const num = (key) => typeof obj[key] === "number" ? obj[key] : 0;
	const skills = {};
	const extra = obj.skills;
	if (extra && typeof extra === "object") {
		for (const [key, value] of Object.entries(extra)) if (typeof value === "number") skills[key] = value;
	}
	const hotbar = Array.isArray(obj.hotbar) ? obj.hotbar.map((id) => typeof id === "string" ? id : null).slice(0, 8) : [];
	while (hotbar.length < 8) hotbar.push(null);
	const quests = Array.isArray(obj.quests) ? obj.quests : [];
	const depot = Array.isArray(obj.depot) ? obj.depot : [];
	const blocked = Array.isArray(obj.blocked) ? obj.blocked.filter((id) => typeof id === "string") : [];
	return {
		invested: {
			str: num("str"),
			hp: num("hp"),
			ats: num("ats"),
			mvs: num("mvs"),
			ctp: num("ctp"),
			mag: num("mag")
		},
		skills,
		skillPoints: num("skillPoints"),
		chosenTree: typeof obj.chosenTree === "string" ? obj.chosenTree : null,
		hotbar,
		quests,
		depot,
		blocked,
		bagStage: num("bagStage"),
		wellAt: num("wellAt"),
		bonusUntil: num("bonusUntil"),
		x: typeof obj.x === "number" && Number.isFinite(obj.x) ? obj.x : void 0,
		z: typeof obj.z === "number" && Number.isFinite(obj.z) ? obj.z : void 0
	};
}
function rowOf(raw) {
	const stats = splitInvested(raw.invested);
	return {
		id: raw.id,
		slot: Number(raw.slot),
		classId: asClassId(raw.class_id),
		name: raw.name,
		level: Number(raw.level),
		xp: Number(raw.xp),
		vials: Number(raw.vials),
		unspent: Number(raw.unspent),
		gold: Number(raw.gold),
		hp: Number(raw.hp),
		invested: stats.invested,
		skills: stats.skills,
		skillPoints: stats.skillPoints,
		chosenTree: stats.chosenTree,
		hotbar: stats.hotbar,
		quests: stats.quests,
		depot: stats.depot,
		blocked: stats.blocked,
		bagStage: stats.bagStage,
		wellAt: stats.wellAt,
		bonusUntil: stats.bonusUntil,
		x: stats.x,
		z: stats.z,
		bag: asJson(raw.bag, []),
		equipped: asJson(raw.equipped, {
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
		})
	};
}
var accountMeta_createServerFn_handler = createServerRpc({
	id: "83e7a00206ced48e4f0b3ac3e899d5f3f3356d56626ad16923f2e1086c74abd8",
	name: "accountMeta",
	filename: "src/game/account.ts"
}, (opts) => accountMeta.__executeServer(opts));
var accountMeta = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(accountMeta_createServerFn_handler, async ({ context }) => {
	return { hasDeletePassword: (await (await getSql())`
      select user_id from account_secrets where user_id = ${context.userId}
    `).length > 0 };
});
var setDeletePassword_createServerFn_handler = createServerRpc({
	id: "b0aa6f6bb8ca7c9820030fbf961bba8d434d770dcd329ec1de413d355d2c5e59",
	name: "setDeletePassword",
	filename: "src/game/account.ts"
}, (opts) => setDeletePassword.__executeServer(opts));
var setDeletePassword = createServerFn({ method: "POST" }).validator((password) => password).middleware([authMiddleware]).handler(setDeletePassword_createServerFn_handler, async ({ context, data: password }) => {
	const pw = password.trim();
	if (pw.length < 4 || pw.length > 32) return {
		ok: false,
		reason: "length"
	};
	const sql = await getSql();
	if ((await sql`
      select user_id from account_secrets where user_id = ${context.userId}
    `).length) return {
		ok: false,
		reason: "exists"
	};
	const { hashSecret } = await import("./secrets.server-DvOeM5Py.mjs");
	const hash = await hashSecret(pw);
	await sql`
      insert into account_secrets (user_id, delete_pass_hash) values (${context.userId}, ${hash})
    `;
	return { ok: true };
});
var listCharacters_createServerFn_handler = createServerRpc({
	id: "87b74a0d71f57198c267cfe27c69ecc2bec41b8f62038db3d01615c81a21a461",
	name: "listCharacters",
	filename: "src/game/account.ts"
}, (opts) => listCharacters.__executeServer(opts));
var listCharacters = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listCharacters_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select id, slot, class_id, name, level, xp, vials, unspent, gold, hp, invested, bag, equipped
      from characters where user_id = ${context.userId} order by slot
    `).map(rowOf);
});
var createCharacter_createServerFn_handler = createServerRpc({
	id: "7ac364d62370305f9c3dbfbe8d0c10ed83d47498c99149888d472a1b27460b0e",
	name: "createCharacter",
	filename: "src/game/account.ts"
}, (opts) => createCharacter.__executeServer(opts));
var createCharacter = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(createCharacter_createServerFn_handler, async ({ context, data }) => {
	const slot = Math.floor(Number(data.slot));
	const name = data.name.trim().replace(/\s+/g, " ").slice(0, 16);
	if (slot < 0 || slot > 5 || name.length < 2) return {
		ok: false,
		reason: "invalid"
	};
	const sql = await getSql();
	if ((await sql`
      select id from characters where user_id = ${context.userId} and slot = ${slot}
    `).length) return {
		ok: false,
		reason: "taken"
	};
	const count = await sql`
      select count(*)::int as n from characters where user_id = ${context.userId}
    `;
	if (Number(count[0]?.n ?? 0) >= 6) return {
		ok: false,
		reason: "full"
	};
	if ((await sql`
      select id from characters where lower(name) = lower(${name})
    `).length) return {
		ok: false,
		reason: "name"
	};
	const classId = asClassId(data.classId);
	const id = crypto.randomUUID();
	const invested = JSON.stringify({
		str: 0,
		hp: 0,
		ats: 0,
		mvs: 0,
		ctp: 0
	});
	const bagSlots = Array.from({ length: 72 }, () => null);
	bagSlots[0] = {
		uid: `chest-${id.slice(0, 8)}`,
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
	const bag = JSON.stringify(bagSlots);
	const equipped = JSON.stringify({
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
	});
	await sql.query(`insert into characters (id, user_id, slot, name, class_id, gold, invested, bag, equipped)
       values ($1, $2, $3, $4, $5, 0, $6::jsonb, $7::jsonb, $8::jsonb)`, [
		id,
		context.userId,
		slot,
		name,
		classId,
		invested,
		bag,
		equipped
	]);
	const row = (await sql`select id, slot, class_id, name, level, xp, vials, unspent, gold, hp, invested, bag, equipped from characters where id = ${id}`)[0];
	if (!row) return {
		ok: false,
		reason: "invalid"
	};
	return {
		ok: true,
		character: rowOf(row)
	};
});
var saveCharacter_createServerFn_handler = createServerRpc({
	id: "9009e61e56e40e24e8e9c273c5e59d1824734a4e1a6d7ec0b24b0b56bd638a21",
	name: "saveCharacter",
	filename: "src/game/account.ts"
}, (opts) => saveCharacter.__executeServer(opts));
var saveCharacter = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(saveCharacter_createServerFn_handler, async ({ context, data }) => {
	const id = data.id;
	const save = data.save;
	if (!id || !save || typeof save.name !== "string") return { ok: false };
	const level = Math.max(1, Math.min(200, Math.floor(Number(save.level) || 1)));
	const sql = await getSql();
	if (!(await sql`
      select id from characters where id = ${id} and user_id = ${context.userId}
    `).length) return { ok: false };
	await sql.query(`update characters set
         level = $1, xp = $2, vials = $3, unspent = $4, gold = $5, hp = $6,
         invested = $7::jsonb, bag = $8::jsonb, equipped = $9::jsonb, updated_at = now()
       where id = $10 and user_id = $11`, [
		level,
		Math.max(0, Math.floor(Number(save.xp) || 0)),
		Math.max(0, Math.min(4, Math.floor(Number(save.vials) || 0))),
		Math.max(0, Math.floor(Number(save.unspent) || 0)),
		Math.max(0, Math.floor(Number(save.gold) || 0)),
		Math.max(0, Math.floor(Number(save.hp) || 0)),
		JSON.stringify({
			...save.invested ?? {},
			skills: save.skills ?? {},
			skillPoints: save.skillPoints ?? 0,
			chosenTree: save.chosenTree ?? null,
			hotbar: save.hotbar ?? [],
			quests: save.quests ?? [],
			depot: save.depot ?? [],
			blocked: save.blocked ?? [],
			bagStage: save.bagStage ?? 0,
			wellAt: save.wellAt ?? 0,
			bonusUntil: save.bonusUntil ?? 0,
			x: typeof save.x === "number" ? save.x : void 0,
			z: typeof save.z === "number" ? save.z : void 0
		}),
		JSON.stringify(Array.isArray(save.bag) ? save.bag.slice(0, 72) : []),
		JSON.stringify(save.equipped ?? {}),
		id,
		context.userId
	]);
	return { ok: true };
});
var deleteCharacter_createServerFn_handler = createServerRpc({
	id: "585b747ea8b31bb3d84a8d1aa00dee082cf7fd995173778c5eebada5be1145ad",
	name: "deleteCharacter",
	filename: "src/game/account.ts"
}, (opts) => deleteCharacter.__executeServer(opts));
var deleteCharacter = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(deleteCharacter_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hash = (await sql`
      select delete_pass_hash from account_secrets where user_id = ${context.userId}
    `)[0]?.delete_pass_hash;
	if (!hash) return {
		ok: false,
		reason: "no-password"
	};
	const { verifySecret } = await import("./secrets.server-DvOeM5Py.mjs");
	if (!await verifySecret(data.password ?? "", hash)) return {
		ok: false,
		reason: "bad-password"
	};
	await sql`delete from characters where id = ${data.id} and user_id = ${context.userId}`;
	return { ok: true };
});
var changeDeletePassword_createServerFn_handler = createServerRpc({
	id: "4de30c9c31c86eaaca6703aa9fa15dca632674bb50456a2f709d4dd2e042cb48",
	name: "changeDeletePassword",
	filename: "src/game/account.ts"
}, (opts) => changeDeletePassword.__executeServer(opts));
var changeDeletePassword = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(changeDeletePassword_createServerFn_handler, async ({ context, data }) => {
	const next = (data.next ?? "").trim();
	if (next.length < 4 || next.length > 32) return {
		ok: false,
		reason: "length"
	};
	const sql = await getSql();
	const hash = (await sql`
      select delete_pass_hash from account_secrets where user_id = ${context.userId}
    `)[0]?.delete_pass_hash;
	if (!hash) return {
		ok: false,
		reason: "no-password"
	};
	const { verifySecret, hashSecret } = await import("./secrets.server-DvOeM5Py.mjs");
	if (!await verifySecret(data.current ?? "", hash)) return {
		ok: false,
		reason: "bad-password"
	};
	await sql`update account_secrets set delete_pass_hash = ${await hashSecret(next)} where user_id = ${context.userId}`;
	return { ok: true };
});
//#endregion
export { accountMeta_createServerFn_handler, changeDeletePassword_createServerFn_handler, createCharacter_createServerFn_handler, deleteCharacter_createServerFn_handler, listCharacters_createServerFn_handler, saveCharacter_createServerFn_handler, setDeletePassword_createServerFn_handler };
