import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { Nt as require_jsx_runtime, Pt as require_react } from "../_libs/@react-three/fiber+[...].mjs";
import { $ as skillCdLeft, A as bindControlsTest, F as displayName, H as itemStats, J as readCarry, K as onPlaza, N as captureSave, P as className, S as STAT_LABEL, V as input, X as setCarry, Y as readSim, Z as setWindVolume, at as useHud, d as MAP_MARKS, et as skillPreview, f as MENTORS, i as CLASS_TREES, ot as useRpg, q as openBagCount, rt as sumStats, s as ENHANCE, st as weaponFits, t as CATALOG, tt as skillTier, u as HOUSES, y as SLOT_LABEL } from "./middleware-SMghQq71.mjs";
import { i as signOut } from "./client-CVqXY6bk.mjs";
import { a as saveCharacter, i as leaveToCharacters, n as CharacterScreens, o as useCurrentUserState, s as useSession, t as AuthScreens } from "./AccountScreens-D6xLmeiX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DLbGz1vi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var presence = {
	nick: "",
	level: 1,
	x: 0,
	z: 0,
	yaw: 0,
	moving: false,
	run: 0,
	swing: 0,
	weapon: false,
	style: "fist",
	helmet: false,
	armor: false,
	boots: false,
	hp: 120,
	hpMax: 120,
	side: 1
};
var remotes = /* @__PURE__ */ new Map();
var listeners$4 = /* @__PURE__ */ new Set();
var peerCount = 0;
var link = "off";
function poke() {
	for (const fn of listeners$4) fn();
}
function setLink(next, peers) {
	if (link === next && peerCount === peers) return;
	link = next;
	peerCount = peers;
	poke();
}
function upsertRemote(id, body) {
	const prev = remotes.get(id);
	if (!prev) {
		remotes.set(id, {
			...body,
			tx: body.x,
			tz: body.z,
			tyaw: body.yaw
		});
		return;
	}
	prev.tx = body.x;
	prev.tz = body.z;
	prev.tyaw = body.yaw;
	prev.nick = body.nick;
	prev.level = body.level;
	prev.moving = body.moving;
	prev.run = body.run;
	prev.swing = body.swing;
	prev.weapon = body.weapon;
	prev.style = body.style;
	prev.helmet = body.helmet;
	prev.armor = body.armor;
	prev.boots = body.boots;
	prev.hp = body.hp;
	prev.hpMax = body.hpMax;
	prev.side = body.side;
}
function retainRemotes(ids) {
	for (const id of [...remotes.keys()]) if (!ids.has(id)) remotes.delete(id);
}
function clearRemotes() {
	remotes.clear();
}
function num(data, key, fallback = 0) {
	const value = data[key];
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function parseBody(data) {
	if (!data || typeof data !== "object") return null;
	const row = data;
	if (row.kind !== "body") return null;
	const x = num(row, "x");
	const z = num(row, "z");
	if (Math.abs(x) > 200 || Math.abs(z) > 200) return null;
	return {
		nick: (typeof row.nick === "string" ? row.nick.replace(/\s+/g, " ").slice(0, 16) : "Gezgin") || "Gezgin",
		level: Math.max(1, Math.min(200, Math.floor(num(row, "level", 1)))),
		x,
		z,
		yaw: num(row, "yaw"),
		moving: Boolean(row.moving),
		run: Math.max(0, Math.min(1, num(row, "run"))),
		swing: Math.max(0, Math.min(1, num(row, "swing"))),
		weapon: Boolean(row.weapon),
		style: row.style === "bow" || row.style === "staff" || row.style === "dagger" || row.style === "sword" || row.style === "pala" || row.style === "fist" ? row.style : Boolean(row.weapon) ? "sword" : "fist",
		helmet: Boolean(row.helmet),
		armor: Boolean(row.armor),
		boots: Boolean(row.boots),
		hp: Math.max(0, num(row, "hp", 120)),
		hpMax: Math.max(1, num(row, "hpMax", 120)),
		side: num(row, "side", 1) < 0 ? -1 : 1
	};
}
var selfId = "";
var peers = [];
var mobs = [];
var loot = [];
var seen = /* @__PURE__ */ new Set();
var sender$2 = null;
var listeners$3 = /* @__PURE__ */ new Set();
var pending = [];
var remoteHits = [];
var lootHintText = "";
function publish$2() {
	for (const fn of listeners$3) fn();
}
function subscribeField(fn) {
	listeners$3.add(fn);
	return () => listeners$3.delete(fn);
}
function bindField(fn) {
	sender$2 = fn;
	return () => {
		if (sender$2 === fn) sender$2 = null;
	};
}
function setRoster(self, ids) {
	selfId = self;
	peers = ids;
}
function amHost() {
	const all = [selfId, ...peers].filter(Boolean).sort();
	if (!all.length) return true;
	return all[0] === selfId;
}
function fieldMobs() {
	return mobs;
}
function fieldLoot() {
	return loot;
}
function pushMobState(list) {
	mobs = list;
	sender$2?.({
		kind: "mobs",
		mobs: list
	});
}
function emitHit(id, dmg) {
	const hitId = `${id}:${Math.random().toString(36).slice(2, 8)}`;
	seen.add(hitId);
	sender$2?.({
		kind: "mobhit",
		id,
		dmg,
		hitId
	});
}
function queueGroundDrop(item) {
	pending.push(item);
}
function takePendingDrops() {
	const next = pending;
	pending = [];
	return next;
}
function placeLoot(item, x, z, id = `loot-${Math.random().toString(36).slice(2, 8)}`) {
	const row = {
		id,
		item,
		x,
		z
	};
	loot = [...loot, row].slice(-24);
	sender$2?.({
		kind: "drop",
		id,
		item,
		x,
		z
	});
	publish$2();
	return row;
}
function takeRemoteHits() {
	const next = remoteHits.slice();
	remoteHits.length = 0;
	return next;
}
function sendReward(peerId, xp, gold) {
	sender$2?.({
		kind: "reward",
		xp,
		gold
	}, peerId);
}
function lootHint() {
	return lootHintText;
}
function setLootHint(next) {
	if (lootHintText === next) return;
	lootHintText = next;
	publish$2();
}
function takeNearLoot(x, z) {
	const row = loot.find((entry) => Math.hypot(entry.x - x, entry.z - z) < 1.35);
	if (!row) return null;
	return takeLoot(row.id);
}
function takeLoot(id) {
	const row = loot.find((entry) => entry.id === id);
	if (!row) return null;
	loot = loot.filter((entry) => entry.id !== id);
	sender$2?.({
		kind: "take",
		id
	});
	publish$2();
	return row.item;
}
function shareXp(total) {
	const mates = partyMates();
	if (!mates.length) {
		useRpg.getState().grantXp(total);
		return;
	}
	const pool = Math.round(total * .4);
	const mine = Math.max(1, total - pool);
	const each = Math.max(1, Math.round(pool / mates.length));
	useRpg.getState().grantXp(mine);
	const nick = useRpg.getState().nick;
	for (const mate of mates) sender$2?.({
		kind: "xp",
		amount: each,
		nick,
		to: mate.id
	}, mate.id);
}
function asItem(raw) {
	if (!raw || typeof raw !== "object") return null;
	const row = raw;
	if (typeof row.id !== "string" || typeof row.name !== "string" || typeof row.uid !== "string") return null;
	return row;
}
function ingestField(from, data) {
	if (!data || typeof data !== "object") return false;
	const row = data;
	if (row.kind === "mobs" && Array.isArray(row.mobs)) {
		if (amHost()) return true;
		const hostId = [selfId, ...peers].filter(Boolean).sort()[0];
		if (hostId && from !== hostId) return true;
		mobs = row.mobs.filter((mob) => mob && typeof mob.id === "string");
		return true;
	}
	if (row.kind === "mobhit") {
		const hitId = typeof row.hitId === "string" ? row.hitId : "";
		if (hitId && seen.has(hitId)) return true;
		if (hitId) seen.add(hitId);
		const id = typeof row.id === "string" ? row.id : "";
		const dmg = Math.max(1, Math.min(400, Math.floor(Number(row.dmg) || 1)));
		if (id) remoteHits.push({
			id,
			dmg,
			from
		});
		return true;
	}
	if (row.kind === "drop") {
		const item = asItem(row.item);
		const id = typeof row.id === "string" ? row.id : "";
		if (!item || !id || loot.some((entry) => entry.id === id)) return true;
		loot = [...loot, {
			id,
			item,
			x: Number(row.x) || 0,
			z: Number(row.z) || 0
		}].slice(-24);
		publish$2();
		return true;
	}
	if (row.kind === "take") {
		const id = typeof row.id === "string" ? row.id : "";
		loot = loot.filter((entry) => entry.id !== id);
		publish$2();
		return true;
	}
	if (row.kind === "reward") {
		const xp = Math.max(1, Math.min(400, Math.floor(Number(row.xp) || 1)));
		const gold = Math.max(0, Math.min(500, Math.floor(Number(row.gold) || 0)));
		shareXp(xp);
		if (gold) useRpg.getState().addGold(gold);
		useRpg.setState({ toast: `+${xp} XP${gold ? ` +${gold}g` : ""}` });
		return true;
	}
	if (row.kind === "xp") {
		const nick = typeof row.nick === "string" ? row.nick : "";
		const amount = Math.max(1, Math.min(200, Math.floor(Number(row.amount) || 1)));
		const nickKey = nick.toLowerCase();
		if (partyMates().some((entry) => entry.id === from || entry.nick.toLowerCase() === nickKey)) {
			useRpg.getState().grantXp(amount);
			useRpg.setState({ toast: `${nick || "Grup"} +${amount} XP` });
		}
		return true;
	}
	return false;
}
var idleDuel = {
	phase: "idle",
	id: "",
	nick: "",
	level: 0
};
var idleSocial = {
	phase: "idle",
	act: "",
	id: "",
	nick: ""
};
var emptyBoard = () => ({
	mine: [],
	theirs: [],
	mineOk: false,
	theirsOk: false
});
var sel = null;
var duel = idleDuel;
var social = idleSocial;
var friends = [];
var party = [];
var board = emptyBoard();
var pick = null;
var snap$1 = {
	sel,
	duel,
	social,
	friends,
	party,
	trade: board
};
var listeners$2 = /* @__PURE__ */ new Set();
var sender$1 = null;
function publish$1() {
	snap$1 = {
		sel,
		duel,
		social,
		friends,
		party,
		trade: board
	};
	for (const fn of listeners$2) fn();
}
function subscribeTarget(fn) {
	listeners$2.add(fn);
	return () => listeners$2.delete(fn);
}
function targetSnapshot() {
	return snap$1;
}
function readTarget() {
	return {
		sel,
		duel,
		social
	};
}
function queuePick(x, y) {
	pick = {
		x,
		y
	};
}
function takePick() {
	const next = pick;
	pick = null;
	return next;
}
function setSelection(next) {
	if (!next) {
		if (!sel) return;
		sel = null;
		publish$1();
		return;
	}
	if (sel && sel.kind === next.kind && sel.id === next.id) {
		if (sel.kind === "player" && next.kind === "player" && (sel.nick !== next.nick || sel.level !== next.level)) {
			sel = next;
			publish$1();
		}
		return;
	}
	sel = next;
	publish$1();
}
function bindDuelSend(fn) {
	sender$1 = fn;
	return () => {
		if (sender$1 === fn) sender$1 = null;
	};
}
function packet(act, nick, level, extra) {
	return {
		kind: "duel",
		act,
		nick,
		level,
		...extra
	};
}
function offerDuel(nick, level) {
	if (!sel || sel.kind !== "player") return;
	if (duel.phase === "live" || duel.phase === "sent") return;
	const here = readSim();
	const foe = remotes.get(sel.id);
	if (onPlaza(here.x, here.z) || foe && onPlaza(foe.x, foe.z)) {
		useRpg.setState({ toast: "Taş meydanda düello yok. Meydanın dışına çık." });
		return;
	}
	duel = {
		phase: "sent",
		id: sel.id,
		nick: sel.nick,
		level: sel.level
	};
	sender$1?.(sel.id, packet("ask", nick, level));
	useRpg.setState({ toast: `${sel.nick} için düello teklifi gitti` });
	publish$1();
}
function answerDuel(yes, nick, level) {
	if (duel.phase !== "in") return;
	if (yes && onPlaza(readSim().x, readSim().z)) {
		useRpg.setState({ toast: "Taş meydanda düello yok. Meydanın dışına çık." });
		return;
	}
	sender$1?.(duel.id, packet(yes ? "yes" : "no", nick, level));
	if (yes) {
		duel = {
			...duel,
			phase: "live"
		};
		sel = {
			kind: "player",
			id: duel.id,
			nick: duel.nick,
			level: duel.level
		};
		useRpg.setState({ toast: `VS · ${duel.nick}` });
	} else {
		duel = idleDuel;
		useRpg.setState({ toast: "Düello reddedildi" });
	}
	publish$1();
}
function endDuel(nick, level) {
	if (duel.phase === "idle") return;
	if (duel.id) sender$1?.(duel.id, packet("end", nick, level));
	duel = idleDuel;
	useRpg.setState({ toast: "Düello bitti" });
	publish$1();
}
function sendDuelHit(dmg, crit) {
	if (duel.phase !== "live" || !duel.id) return;
	const who = useRpg.getState();
	sender$1?.(duel.id, packet("hit", who.nick, who.level, {
		dmg,
		crit
	}));
}
function upsertMate(list, mate) {
	if (!mate.nick) return list;
	const index = list.findIndex((row) => row.id === mate.id || row.nick === mate.nick);
	if (index >= 0) {
		const next = list.slice();
		next[index] = mate;
		return next;
	}
	return [...list, mate].slice(-8);
}
function removeFriend(id) {
	friends = friends.filter((mate) => mate.id !== id);
	publish$1();
}
function blockMate(mate) {
	friends = friends.filter((row) => row.id !== mate.id && row.nick !== mate.nick);
	party = party.filter((row) => row.id !== mate.id && row.nick !== mate.nick);
	const cur = useRpg.getState().blocked ?? [];
	const blocked = Array.from(/* @__PURE__ */ new Set([
		...cur,
		mate.id,
		mate.nick.toLowerCase()
	]));
	useRpg.setState({
		blocked,
		toast: `${mate.nick} engellendi`
	});
	if (social.id === mate.id) social = idleSocial;
	publish$1();
}
function isBlocked(id, nick) {
	const list = useRpg.getState().blocked ?? [];
	if (list.includes(id)) return true;
	return Boolean(nick && list.includes(nick.toLowerCase()));
}
function partyMates() {
	return party;
}
function offerSocial(act) {
	if (!sel || sel.kind !== "player") return;
	if (social.phase === "sent" || social.phase === "live") return;
	const who = useRpg.getState();
	social = {
		phase: "sent",
		act,
		id: sel.id,
		nick: sel.nick
	};
	sender$1?.(sel.id, {
		kind: "social",
		act: "ask",
		what: act,
		nick: who.nick,
		level: who.level
	});
	const label = act === "trade" ? "Ticaret" : act === "friend" ? "Dostluk" : "Grup";
	useRpg.setState({ toast: `${sel.nick} için ${label.toLowerCase()} teklifi gitti` });
	publish$1();
}
function answerSocial(yes) {
	if (social.phase !== "in" || !social.act) return;
	const who = useRpg.getState();
	sender$1?.(social.id, {
		kind: "social",
		act: yes ? "yes" : "no",
		what: social.act,
		nick: who.nick,
		level: who.level
	});
	if (!yes) {
		social = idleSocial;
		useRpg.setState({ toast: "Teklif reddedildi" });
		publish$1();
		return;
	}
	acceptSocial(social.act, social.nick, social.id, sel?.kind === "player" && sel.id === social.id ? sel.level : 1);
}
function acceptSocial(act, nick, id, level) {
	if (act === "trade") {
		social = {
			...social,
			phase: "live",
			act,
			nick
		};
		board = emptyBoard();
		useRpg.setState({
			toast: `Ticaret · ${nick}`,
			invOpen: true
		});
	} else if (act === "friend") {
		friends = upsertMate(friends, {
			id,
			nick,
			level
		});
		social = idleSocial;
		useRpg.setState({ toast: `${nick} artık dostun` });
	} else {
		party = upsertMate(party, {
			id,
			nick,
			level
		});
		social = idleSocial;
		useRpg.setState({ toast: `${nick} gruba katıldı` });
	}
	publish$1();
}
function giveBack(items) {
	if (!items.length) return;
	const bag = useRpg.getState().bag.slice();
	const leftover = [];
	for (const item of items) {
		const hole = bag.findIndex((slot) => slot == null);
		if (hole >= 0) bag[hole] = item;
		else leftover.push(item);
	}
	useRpg.setState({ bag });
	if (leftover.length) leftover.forEach((item) => queueGroundDrop(item));
}
function tryCommit() {
	if (social.phase !== "live" || social.act !== "trade") return;
	if (!board.mineOk || !board.theirsOk) return;
	const got = board.theirs.slice();
	board = emptyBoard();
	social = idleSocial;
	const bag = useRpg.getState().bag.slice();
	const leftover = [];
	for (const item of got) {
		const hole = bag.findIndex((slot) => slot == null);
		if (hole >= 0) bag[hole] = item;
		else leftover.push(item);
	}
	useRpg.setState({
		bag,
		toast: "Ticaret tamam"
	});
	if (leftover.length) leftover.forEach((item) => queueGroundDrop(item));
	publish$1();
}
function addTradeItem(index) {
	if (social.phase !== "live" || social.act !== "trade" || !social.id) return;
	const state = useRpg.getState();
	const item = state.bag[index];
	if (!item || item.id === "starter-chest") return;
	if (board.mine.length >= 8) {
		useRpg.setState({ toast: "Ticaret penceresi dolu" });
		return;
	}
	const bag = state.bag.slice();
	bag[index] = null;
	board = {
		mine: [...board.mine, item],
		theirs: board.theirs,
		mineOk: false,
		theirsOk: false
	};
	useRpg.setState({ bag });
	sender$1?.(social.id, {
		kind: "social",
		act: "offer",
		items: board.mine,
		nick: state.nick,
		level: state.level
	});
	publish$1();
}
function setTradeOk(yes) {
	if (social.phase !== "live" || social.act !== "trade" || !social.id) return;
	board = {
		...board,
		mineOk: yes
	};
	sender$1?.(social.id, {
		kind: "social",
		act: "accept",
		yes,
		nick: useRpg.getState().nick,
		level: useRpg.getState().level
	});
	publish$1();
	tryCommit();
}
function leaveParty() {
	const ids = party.map((mate) => mate.id);
	party = [];
	const who = useRpg.getState();
	for (const id of ids) sender$1?.(id, {
		kind: "social",
		act: "leave",
		what: "party",
		nick: who.nick,
		level: who.level
	});
	useRpg.setState({ toast: "Gruptan ayrıldın" });
	publish$1();
}
function closeTrade() {
	if (social.phase === "idle") return;
	if (social.act === "trade") giveBack(board.mine);
	board = emptyBoard();
	if (social.id) sender$1?.(social.id, {
		kind: "social",
		act: "end",
		what: social.act,
		nick: "",
		level: 1
	});
	social = idleSocial;
	publish$1();
}
function takeItem(raw) {
	if (!raw || typeof raw !== "object") return null;
	const row = raw;
	if (typeof row.id !== "string" || typeof row.name !== "string" || typeof row.uid !== "string") return null;
	return row;
}
function receivePacket(from, data) {
	if (!data || typeof data !== "object") return;
	const row = data;
	if (row.kind === "social") {
		receiveSocial(from, row);
		return;
	}
	if (row.kind === "duel") receiveDuel(from, data);
}
function receiveSocial(from, row) {
	const nick = typeof row.nick === "string" ? row.nick.replace(/\s+/g, " ").slice(0, 16) : "Oyuncu";
	const what = row.what === "trade" || row.what === "friend" || row.what === "party" ? row.what : social.act;
	if (row.act === "ask" && (what === "trade" || what === "friend" || what === "party")) {
		if (isBlocked(from, nick)) return;
		if (social.phase === "live") {
			sender$1?.(from, {
				kind: "social",
				act: "no",
				what,
				nick: "",
				level: 1
			});
			return;
		}
		social = {
			phase: "in",
			act: what,
			id: from,
			nick: nick || "Oyuncu"
		};
		sel = {
			kind: "player",
			id: from,
			nick: social.nick,
			level: 1
		};
		publish$1();
		return;
	}
	if (row.act === "yes" && social.phase === "sent" && social.id === from && what) {
		const level = Math.max(1, Math.min(200, Math.floor(Number(row.level) || 1)));
		acceptSocial(what, social.nick || nick, social.id, level);
		return;
	}
	if (row.act === "offer" && social.phase === "live" && social.id === from) {
		const items = Array.isArray(row.items) ? row.items.map((entry) => takeItem(entry)).filter((entry) => entry != null) : [];
		board = {
			...board,
			theirs: items,
			mineOk: false,
			theirsOk: false
		};
		publish$1();
		return;
	}
	if (row.act === "accept" && social.phase === "live" && social.id === from) {
		board = {
			...board,
			theirsOk: row.yes === true
		};
		publish$1();
		tryCommit();
		return;
	}
	if (row.act === "leave") {
		party = party.filter((mate) => mate.id !== from);
		useRpg.setState({ toast: `${nick} gruptan ayrıldı` });
		publish$1();
		return;
	}
	if (row.act === "give") {
		const item = takeItem(row.item);
		if (!item) return;
		const bag = useRpg.getState().bag.slice();
		const hole = bag.findIndex((slot) => slot == null);
		if (hole < 0) {
			useRpg.setState({ toast: "Çanta dolu, eşya alınamadı" });
			return;
		}
		bag[hole] = item;
		useRpg.setState({
			bag,
			toast: `${item.name} geldi`
		});
		return;
	}
	if ((row.act === "no" || row.act === "end") && social.id === from && social.phase !== "idle") {
		if (social.act === "trade") giveBack(board.mine);
		board = emptyBoard();
		social = idleSocial;
		useRpg.setState({ toast: row.act === "no" ? "Teklif reddedildi" : "Ticaret kapandı" });
		publish$1();
	}
}
function receiveDuel(from, data) {
	if (!data || typeof data !== "object") return;
	const row = data;
	if (row.kind !== "duel") return;
	const nick = typeof row.nick === "string" ? row.nick.replace(/\s+/g, " ").slice(0, 16) : "Oyuncu";
	const level = Math.max(1, Math.min(200, Math.floor(typeof row.level === "number" ? row.level : 1)));
	const act = row.act;
	if (act === "hit" && duel.phase === "live" && duel.id === from) {
		const dmg = Math.max(1, Math.min(400, Math.floor(typeof row.dmg === "number" ? row.dmg : 1)));
		const dead = useRpg.getState().hurtPlayer(dmg);
		useRpg.setState({ toast: dead ? "Düelloyu kaybettin" : `-${dmg}` });
		if (dead) {
			useRpg.setState({
				hp: useRpg.getState().hpMax * .45,
				toast: "Düelloyu kaybettin"
			});
			sender$1?.(from, packet("end", nick, level));
			duel = idleDuel;
			publish$1();
		}
		return;
	}
	if (act === "ask") {
		if (isBlocked(from, nick)) return;
		if (duel.phase === "live") {
			sender$1?.(from, packet("no", "", 1));
			return;
		}
		duel = {
			phase: "in",
			id: from,
			nick: nick || "Oyuncu",
			level
		};
		sel = {
			kind: "player",
			id: from,
			nick: duel.nick,
			level
		};
		publish$1();
		return;
	}
	if (act === "yes" && duel.phase === "sent" && duel.id === from) {
		if (onPlaza(readSim().x, readSim().z)) {
			sender$1?.(from, packet("end", nick, level));
			duel = idleDuel;
			useRpg.setState({ toast: "Taş meydanda düello yok. Meydanın dışına çık." });
			publish$1();
			return;
		}
		duel = {
			...duel,
			phase: "live"
		};
		sel = {
			kind: "player",
			id: from,
			nick: duel.nick,
			level: duel.level
		};
		useRpg.setState({ toast: `VS · ${duel.nick}` });
		publish$1();
		return;
	}
	if ((act === "no" || act === "end") && duel.id === from && duel.phase !== "idle") {
		const rejected = act === "no" && duel.phase === "sent";
		const lost = act === "end" && duel.phase === "live";
		duel = idleDuel;
		useRpg.setState({ toast: rejected ? "Düello reddedildi" : lost ? "Düello bitti" : "Düello bitti" });
		publish$1();
	}
}
var lines = [];
var bubbles = [];
var whisper = null;
var focused = false;
var seq = 1;
var sender = null;
var listeners$1 = /* @__PURE__ */ new Set();
var snap = lines;
function publish() {
	snap = lines.slice();
	for (const fn of listeners$1) fn();
}
function subscribeChat(fn) {
	listeners$1.add(fn);
	return () => listeners$1.delete(fn);
}
function chatSnapshot() {
	return snap;
}
function chatFocused() {
	return focused;
}
function setChatFocus(next) {
	if (focused === next) return;
	focused = next;
	publish();
}
function whisperTarget() {
	return whisper;
}
function setWhisper(next) {
	whisper = next;
	publish();
}
function bindChatSend(fn) {
	sender = fn;
	return () => {
		if (sender === fn) sender = null;
	};
}
function pushLine(nick, text, isWhisper) {
	lines = [...lines, {
		id: seq++,
		nick,
		text,
		whisper: isWhisper
	}].slice(-40);
	publish();
}
function pushBubble(key, nick, text) {
	const until = performance.now() + 4500;
	bubbles = [...bubbles.filter((row) => row.key !== key), {
		key,
		nick,
		text,
		until
	}];
}
function chatBubbles(now) {
	if (bubbles.some((row) => row.until <= now)) bubbles = bubbles.filter((row) => row.until > now);
	return bubbles;
}
function sendChat(raw) {
	const text = raw.replace(/\s+/g, " ").trim().slice(0, 80);
	if (!text) return;
	const nick = useRpg.getState().nick || "Gezgin";
	pushLine(nick, text, false);
	pushBubble("me", nick, text);
	sender?.(void 0, {
		kind: "chat",
		nick,
		text,
		whisper: false
	});
}
function sendWhisper(raw) {
	const text = raw.replace(/\s+/g, " ").trim().slice(0, 80);
	const to = whisper;
	if (!text || !to) return;
	const nick = useRpg.getState().nick || "Gezgin";
	pushLine(`→ ${to.nick}`, text, true);
	sender?.(to.id, {
		kind: "chat",
		nick,
		text,
		whisper: true
	});
}
function receiveChat(from, data) {
	if (!data || typeof data !== "object") return;
	const row = data;
	if (row.kind !== "chat" || typeof row.text !== "string") return;
	const nick = typeof row.nick === "string" ? row.nick.replace(/\s+/g, " ").slice(0, 16) : "Oyuncu";
	if (isBlocked(from, nick)) return;
	const text = row.text.replace(/\s+/g, " ").trim().slice(0, 80);
	if (!text) return;
	if (row.whisper && whisper?.id !== from) {
		const mine = useRpg.getState().nick;
		if (nick && nick !== mine && whisper?.id !== from) {}
	}
	pushLine(row.whisper ? `${nick} fısıldadı` : nick, text, Boolean(row.whisper));
	pushBubble(from, nick, text);
}
var KEY = "abis-gfx";
var gfx = {
	fps: 60,
	quality: 1,
	auto: true,
	volume: .45
};
var listeners = /* @__PURE__ */ new Set();
function readGfx() {
	return gfx;
}
function subscribeGfx(fn) {
	listeners.add(fn);
	return () => listeners.delete(fn);
}
function loadGfx() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return;
		const parsed = JSON.parse(raw);
		gfx = {
			...gfx,
			...parsed
		};
	} catch {}
}
function writeGfx(patch) {
	gfx = {
		...gfx,
		...patch
	};
	try {
		localStorage.setItem(KEY, JSON.stringify(gfx));
	} catch {}
	setWindVolume(gfx.volume);
	for (const fn of listeners) fn();
}
function autoQuality() {
	const cores = navigator.hardwareConcurrency || 4;
	const mem = navigator.deviceMemory ?? 8;
	if (cores <= 4 || mem <= 4) return .7;
	return 1;
}
var FAST_POLL_MS = 400;
var IDLE_POLL_MS = 2e3;
var PING_INTERVAL_MS = 2e3;
var STALL_MS = 1e4;
var MAX_RECOVERY_ATTEMPTS = 3;
var SIGNAL_RETRY_DELAYS_MS = [250, 750];
function defaultIceServers() {
	return [{ urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] }];
}
var P2PRoom = class {
	opts;
	peers = /* @__PURE__ */ new Map();
	/** Per-remote-peer signal delivery chains (order-preserving). */
	signalQueues = /* @__PURE__ */ new Map();
	cursor = 0;
	pollTimer = null;
	pingTimer = null;
	closed = false;
	everPolled = false;
	lastPeersFingerprint = "";
	constructor(opts) {
		this.opts = opts;
	}
	/**
	* The first poll IS the join: it registers this peer and returns the
	* roster. A failed first poll (cold DB, offline tab) must not strand the
	* room: the loop and timers start regardless and the next poll retries.
	*/
	async join() {
		try {
			await this.pollOnce();
		} catch {}
		if (this.closed) return;
		this.schedulePoll(this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
		this.pingTimer = setInterval(() => {
			this.pingAll();
			this.watchdog();
		}, PING_INTERVAL_MS);
	}
	close() {
		this.closed = true;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		if (this.pingTimer) clearInterval(this.pingTimer);
		for (const slot of this.peers.values()) slot.pc.close();
		this.peers.clear();
		fetch("/api/rtc", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				op: "leave",
				room: this.opts.room,
				peer: this.opts.selfId
			}),
			keepalive: true
		}).catch(() => {});
	}
	/** Send on the unreliable game-state channel (drops stale packets). */
	broadcast(data) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		for (const slot of this.peers.values()) if (slot.state?.readyState === "open") slot.state.send(wire);
	}
	/** Send reliably (ordered) to one peer, or to all when peerId is omitted. */
	send(data, peerId) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		const targets = peerId ? [this.peers.get(peerId)] : [...this.peers.values()];
		for (const slot of targets) if (slot?.reliable?.readyState === "open") slot.reliable.send(wire);
		else if (slot?.state?.readyState === "open") slot.state.send(wire);
	}
	peerList() {
		return [...this.peers.values()].map((s) => ({ ...s.info }));
	}
	schedulePoll(delay) {
		if (this.closed) return;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		this.pollTimer = setTimeout(() => void this.poll(), delay);
	}
	anyPairConnecting() {
		for (const s of this.peers.values()) {
			if (s.terminal) continue;
			if (s.info.connectionState !== "connected") return true;
		}
		return false;
	}
	async pollOnce() {
		const params = new URLSearchParams({
			room: this.opts.room,
			peer: this.opts.selfId,
			name: this.opts.name ?? "",
			since: String(this.cursor)
		});
		const res = await fetch(`/api/rtc?${params}`);
		if (this.closed) return;
		if (!res.ok) throw new Error(`signaling poll failed: ${res.status}`);
		const body = await res.json();
		if (this.closed) return;
		if (!this.everPolled) {
			this.everPolled = true;
			this.opts.onConnected?.();
		}
		this.reconcileRoster(body.peers);
		const roster = new Set(body.peers.map((p) => p.id));
		for (const sig of body.signals) {
			this.cursor = Math.max(this.cursor, sig.id);
			await this.onSignal(sig.from, sig.kind, sig.payload, roster);
			if (this.closed) return;
		}
	}
	async poll() {
		if (this.closed) return;
		try {
			await this.pollOnce();
		} catch {}
		this.schedulePoll(this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
	}
	reconcileRoster(peers) {
		const alive = new Set(peers.map((p) => p.id));
		for (const p of peers) {
			if (p.id === this.opts.selfId) continue;
			const existing = this.peers.get(p.id);
			if (existing) existing.info.name = p.name;
			else this.connectTo(p.id, p.name, this.opts.selfId > p.id);
		}
		for (const [id, slot] of this.peers) if (!alive.has(id)) {
			slot.pc.close();
			this.peers.delete(id);
		}
		this.emitPeers();
	}
	connectTo(peerId, name, initiator) {
		if (this.closed) return null;
		const pc = new RTCPeerConnection({ iceServers: this.opts.iceServers ?? defaultIceServers() });
		const slot = {
			pc,
			makingOffer: false,
			ignoreOffer: false,
			pendingCandidates: [],
			lastProgressAt: Date.now(),
			recoveryAttempts: 0,
			info: {
				id: peerId,
				name,
				connectionState: pc.connectionState,
				candidateType: null,
				rttMs: null
			}
		};
		this.peers.set(peerId, slot);
		pc.onicecandidate = (e) => {
			if (e.candidate) this.sendSignal(peerId, "ice", e.candidate.toJSON());
		};
		pc.onconnectionstatechange = () => {
			slot.info.connectionState = pc.connectionState;
			if (pc.connectionState === "connecting" || pc.connectionState === "connected") slot.lastProgressAt = Date.now();
			if (pc.connectionState === "connected") {
				slot.recoveryAttempts = 0;
				slot.terminal = false;
				this.readCandidateType(slot);
			}
			this.emitPeers();
			if (pc.connectionState === "failed") pc.restartIce();
			if (pc.connectionState === "failed" || pc.connectionState === "disconnected") this.schedulePoll(FAST_POLL_MS);
		};
		pc.onnegotiationneeded = async () => {
			try {
				slot.makingOffer = true;
				await pc.setLocalDescription();
				await this.sendSignal(peerId, "offer", pc.localDescription.toJSON());
			} catch {} finally {
				slot.makingOffer = false;
			}
		};
		pc.ondatachannel = (e) => this.attachChannel(slot, e.channel);
		if (initiator) {
			this.attachChannel(slot, pc.createDataChannel("state", {
				ordered: false,
				maxRetransmits: 0
			}));
			this.attachChannel(slot, pc.createDataChannel("reliable", { ordered: true }));
		}
		return slot;
	}
	attachChannel(slot, channel) {
		if (channel.label === "state") slot.state = channel;
		else slot.reliable = channel;
		channel.onopen = () => {
			slot.lastProgressAt = Date.now();
		};
		channel.onmessage = (e) => {
			let msg;
			try {
				msg = JSON.parse(e.data);
			} catch {
				return;
			}
			if (msg.t === "ping") {
				if (slot.state?.readyState === "open") slot.state.send(JSON.stringify({ t: "pong" }));
			} else if (msg.t === "pong") {
				if (slot.pingSentAt) {
					slot.info.rttMs = Math.round(performance.now() - slot.pingSentAt);
					slot.pingSentAt = void 0;
					this.emitPeers();
				}
			} else this.opts.onMessage?.(slot.info.id, msg.d, channel.label === "state" ? "state" : "reliable");
		};
	}
	/** Apply buffered ICE candidates once a remote description is in place. */
	async flushPendingCandidates(slot) {
		while (slot.pendingCandidates.length > 0) {
			const candidate = slot.pendingCandidates.shift();
			try {
				await slot.pc.addIceCandidate(candidate);
			} catch (err) {
				if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
			}
			if (this.closed) return;
		}
	}
	async onSignal(from, kind, payload, roster) {
		if (this.closed) return;
		let slot = this.peers.get(from);
		if (!slot) {
			if (!roster.has(from)) return;
			const created = this.connectTo(from, "", false);
			if (!created) return;
			slot = created;
		}
		const polite = this.opts.selfId < from;
		try {
			if (kind === "offer" || kind === "answer") {
				const description = payload;
				const collision = kind === "offer" && (slot.makingOffer || slot.pc.signalingState !== "stable");
				slot.ignoreOffer = !polite && collision;
				if (slot.ignoreOffer) return;
				try {
					await slot.pc.setRemoteDescription(description);
				} catch (err) {
					if (kind !== "offer" || slot.recreatedForOffer) throw err;
					const attempts = slot.recoveryAttempts;
					const name = slot.info.name;
					slot.pc.close();
					this.peers.delete(from);
					const fresh = this.connectTo(from, name, false);
					if (!fresh) return;
					fresh.recoveryAttempts = attempts;
					fresh.recreatedForOffer = true;
					slot = fresh;
					await slot.pc.setRemoteDescription(description);
				}
				if (this.closed) return;
				await this.flushPendingCandidates(slot);
				if (this.closed) return;
				if (kind === "offer") {
					await slot.pc.setLocalDescription();
					if (this.closed) return;
					await this.sendSignal(from, "answer", slot.pc.localDescription.toJSON());
				}
			} else if (kind === "ice") {
				const candidate = payload;
				if (!slot.pc.remoteDescription) {
					slot.pendingCandidates.push(candidate);
					return;
				}
				try {
					await slot.pc.addIceCandidate(candidate);
				} catch (err) {
					if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
				}
			}
		} catch {}
	}
	/**
	* Signals are serialized per remote peer (a candidate must never overtake
	* its SDP into the DB) and retried on failure with short backoff.
	*/
	sendSignal(to, kind, payload) {
		const next = (this.signalQueues.get(to) ?? Promise.resolve()).then(() => this.postSignal(to, kind, payload));
		this.signalQueues.set(to, next.catch(() => {}));
		return next;
	}
	async postSignal(to, kind, payload) {
		for (let attempt = 0;; attempt++) {
			if (this.closed) return;
			try {
				const res = await fetch("/api/rtc", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						op: "signal",
						room: this.opts.room,
						from: this.opts.selfId,
						to,
						kind,
						payload
					})
				});
				if (res.ok) return;
				throw new Error(`signal POST failed: ${res.status}`);
			} catch (err) {
				if (attempt >= SIGNAL_RETRY_DELAYS_MS.length) {
					console.warn(`[p2p] signal ${kind} to ${to} failed after retries`, err);
					return;
				}
				await new Promise((r) => setTimeout(r, SIGNAL_RETRY_DELAYS_MS[attempt]));
			}
		}
	}
	pingAll() {
		const wire = JSON.stringify({ t: "ping" });
		for (const slot of this.peers.values()) {
			if (slot.state?.readyState !== "open") continue;
			const stale = slot.pingSentAt !== void 0 && performance.now() - slot.pingSentAt > 2 * PING_INTERVAL_MS;
			if (slot.pingSentAt === void 0 || stale) {
				slot.pingSentAt = performance.now();
				slot.state.send(wire);
			}
		}
	}
	/**
	* Stuck-pair recovery, piggybacked on the ping interval. A pair that has
	* made no progress for STALL_MS gets rebuilt by the dialer with a FRESH
	* RTCPeerConnection (new DTLS identity — fixes the suspend/resume
	* fingerprint wedge). After MAX_RECOVERY_ATTEMPTS the pair is terminal:
	* visible to the app as its last connectionState, ignored by fast-poll.
	*/
	watchdog() {
		if (this.closed) return;
		const now = Date.now();
		for (const [peerId, slot] of this.peers) {
			const live = slot.pc.connectionState;
			if (live !== slot.info.connectionState) {
				slot.info.connectionState = live;
				if (live === "connecting" || live === "connected") slot.lastProgressAt = now;
				this.emitPeers();
			}
			if (slot.terminal || live === "connected") continue;
			if (now - slot.lastProgressAt <= STALL_MS) continue;
			if (slot.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
				slot.terminal = true;
				this.emitPeers();
				continue;
			}
			slot.recoveryAttempts += 1;
			slot.lastProgressAt = now;
			if (this.opts.selfId > peerId) {
				const { name } = slot.info;
				const attempts = slot.recoveryAttempts;
				slot.pc.close();
				this.peers.delete(peerId);
				const fresh = this.connectTo(peerId, name, true);
				if (fresh) fresh.recoveryAttempts = attempts;
				this.schedulePoll(FAST_POLL_MS);
			}
		}
	}
	async readCandidateType(slot) {
		try {
			const stats = await slot.pc.getStats();
			let selected;
			stats.forEach((s) => {
				if (s.type === "candidate-pair" && s.nominated) selected = s;
			});
			const localId = selected?.localCandidateId;
			if (localId) {
				const local = stats.get(localId);
				slot.info.candidateType = local?.candidateType ?? null;
				this.emitPeers();
			}
		} catch {}
	}
	emitPeers() {
		const list = this.peerList();
		const fingerprint = JSON.stringify(list.map((p) => [
			p.id,
			p.name,
			p.connectionState,
			p.candidateType,
			p.rttMs
		]));
		if (fingerprint === this.lastPeersFingerprint) return;
		this.lastPeersFingerprint = fingerprint;
		this.opts.onPeersChanged?.(list);
	}
};
/**
* React binding for P2PRoom. Identity and room id are captured once on mount
* so re-renders never tear down the mesh. Change room or name by remounting.
*/
function defaultRoom() {
	if (typeof window === "undefined") return "room-ssr";
	return `room-${window.location.hostname.split(".")[0]}`.slice(0, 64);
}
function useP2PRoom(options = {}) {
	const [selfId] = (0, import_react.useState)(() => `p-${Math.random().toString(36).slice(2, 10)}`);
	const [room] = (0, import_react.useState)(() => options.room ?? defaultRoom());
	const [name] = (0, import_react.useState)(() => options.name ?? selfId);
	const [peers, setPeers] = (0, import_react.useState)([]);
	const [joined, setJoined] = (0, import_react.useState)(false);
	const roomRef = (0, import_react.useRef)(null);
	const listeners = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		const p2p = new P2PRoom({
			room,
			selfId,
			name,
			onPeersChanged: setPeers,
			onMessage: (from, data, channel) => {
				for (const fn of listeners.current) fn(from, data, channel);
			},
			onConnected: () => setJoined(true)
		});
		roomRef.current = p2p;
		p2p.join();
		return () => {
			roomRef.current = null;
			p2p.close();
		};
	}, [
		room,
		selfId,
		name
	]);
	return {
		selfId,
		room,
		peers,
		joined,
		broadcast: (0, import_react.useCallback)((data) => roomRef.current?.broadcast(data), []),
		send: (0, import_react.useCallback)((data, peerId) => roomRef.current?.send(data, peerId), []),
		onMessage: (0, import_react.useCallback)((fn) => {
			listeners.current.add(fn);
			return () => {
				listeners.current.delete(fn);
			};
		}, [])
	};
}
function NetLive({ nick }) {
	const p2p = useP2PRoom({
		room: "abis-gece",
		name: (nick || "Gezgin").slice(0, 24)
	});
	(0, import_react.useEffect)(() => {
		setLink(p2p.joined ? "live" : "wait", p2p.peers.length);
		retainRemotes(new Set(p2p.peers.map((peer) => peer.id)));
		setRoster(p2p.selfId, p2p.peers.map((peer) => peer.id));
	}, [
		p2p.joined,
		p2p.peers,
		p2p.selfId
	]);
	(0, import_react.useEffect)(() => p2p.onMessage((from, data) => {
		if (data && typeof data === "object" && data.kind === "body") {
			const body = parseBody(data);
			if (body) upsertRemote(from, body);
			return;
		}
		if (ingestField(from, data)) return;
		receivePacket(from, data);
		receiveChat(from, data);
	}), [p2p.onMessage]);
	(0, import_react.useEffect)(() => bindDuelSend((peerId, data) => p2p.send(data, peerId)), [p2p.send]);
	(0, import_react.useEffect)(() => bindField((data, peerId) => {
		if (peerId) p2p.send(data, peerId);
		else p2p.broadcast(data);
	}), [p2p.send, p2p.broadcast]);
	(0, import_react.useEffect)(() => bindChatSend((peerId, data) => {
		if (peerId) p2p.send(data, peerId);
		else p2p.broadcast(data);
	}), [p2p.send, p2p.broadcast]);
	(0, import_react.useEffect)(() => {
		let frame = 0;
		let last = 0;
		const loop = (now) => {
			if (now - last >= 80) {
				last = now;
				p2p.broadcast({
					kind: "body",
					...presence
				});
			}
			frame = requestAnimationFrame(loop);
		};
		frame = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(frame);
	}, [p2p.broadcast]);
	(0, import_react.useEffect)(() => () => {
		setLink("off", 0);
		clearRemotes();
	}, []);
	return null;
}
function clamp(v, min, max) {
	return Math.max(min, Math.min(max, v));
}
var MOVE_KEYS = /* @__PURE__ */ new Set([
	"KeyW",
	"KeyA",
	"KeyS",
	"KeyD",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight"
]);
function pocket(item) {
	const bag = useRpg.getState().bag.slice();
	const hole = bag.findIndex((slot) => slot == null);
	if (hole < 0) {
		queueGroundDrop(item);
		useRpg.setState({ toast: "Çanta dolu" });
		return;
	}
	bag[hole] = item;
	useRpg.setState({
		bag,
		toast: `${item.name} alındı`
	});
}
function dropBag(index) {
	const state = useRpg.getState();
	const item = state.bag[index];
	if (!item || item.id === "starter-chest") {
		useRpg.setState({ toast: item ? "Sandık yere atılmaz" : "" });
		return;
	}
	const bag = state.bag.slice();
	bag[index] = null;
	useRpg.setState({
		bag,
		toast: `${item.name} yere bırakıldı`
	});
	queueGroundDrop(item);
}
function clearMove() {
	for (const code of MOVE_KEYS) input.keys.delete(code);
	input.keys.delete("Space");
}
function useHandLayout() {
	const [on, setOn] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const query = window.matchMedia("(orientation: landscape) and (pointer: coarse), (orientation: landscape) and (max-height: 520px) and (max-width: 1100px)");
		const sync = () => setOn(query.matches);
		sync();
		query.addEventListener("change", sync);
		window.addEventListener("orientationchange", sync);
		return () => {
			query.removeEventListener("change", sync);
			window.removeEventListener("orientationchange", sync);
		};
	}, []);
	return on;
}
function Overlay() {
	const playing = useHud((s) => s.playing);
	const zone = useHud((s) => s.zone);
	const { user, isPending } = useCurrentUserState();
	const activeId = useSession((s) => s.activeId);
	const nick = useRpg((s) => s.nick);
	const [mapOpen, setMapOpen] = (0, import_react.useState)(false);
	const [friendsOpen, setFriendsOpen] = (0, import_react.useState)(false);
	const [questHud, setQuestHud] = (0, import_react.useState)(true);
	const [menu, setMenu] = (0, import_react.useState)(null);
	const menuRef = (0, import_react.useRef)(menu);
	const friendsRef = (0, import_react.useRef)(false);
	menuRef.current = menu;
	friendsRef.current = friendsOpen;
	const drag = (0, import_react.useRef)(null);
	const lookPtr = (0, import_react.useRef)(null);
	const lookBtn = (0, import_react.useRef)(0);
	const moved = (0, import_react.useRef)(0);
	const joy = (0, import_react.useRef)(null);
	const knob = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!playing || !activeId) return;
		const save = () => {
			saveCharacter({ data: {
				id: activeId,
				save: captureSave()
			} }).catch(() => void 0);
		};
		const id = window.setInterval(save, 4e3);
		const hide = () => {
			if (document.visibilityState === "hidden") save();
		};
		window.addEventListener("pagehide", save);
		document.addEventListener("visibilitychange", hide);
		return () => {
			window.clearInterval(id);
			window.removeEventListener("pagehide", save);
			document.removeEventListener("visibilitychange", hide);
		};
	}, [playing, activeId]);
	(0, import_react.useEffect)(() => {
		bindControlsTest();
		const down = (e) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				for (const code of MOVE_KEYS) input.keys.delete(code);
				input.keys.delete("Space");
				if (e.code === "Escape") {
					setChatFocus(false);
					if (e.target instanceof HTMLElement) e.target.blur();
				}
				return;
			}
			if (MOVE_KEYS.has(e.code)) {
				input.keys.add(e.code);
				e.preventDefault();
				return;
			}
			input.keys.add(e.code);
			if (e.code === "Space") e.preventDefault();
			if ((e.ctrlKey || e.metaKey) && e.code === "KeyQ") {
				setQuestHud((open) => !open);
				e.preventDefault();
				return;
			}
			if (e.repeat) return;
			if (e.code === "Escape") {
				const panels = useRpg.getState();
				if (panels.invOpen || panels.charOpen || panels.shop) {
					panels.closePanels();
					e.preventDefault();
					return;
				}
				if (friendsRef.current) {
					setFriendsOpen(false);
					e.preventDefault();
					return;
				}
				if (menuRef.current) {
					setMenu(null);
					e.preventDefault();
					return;
				}
				setChatFocus(false);
				return;
			}
			if (e.code === "Enter") {
				setChatFocus(true);
				e.preventDefault();
				return;
			}
			if (e.code === "KeyI") useRpg.getState().toggleInv();
			if (e.code === "KeyC") useRpg.getState().showChar("stats");
			if (e.code === "KeyV") useRpg.getState().showChar("skills");
			if (e.code === "KeyB") useRpg.getState().showChar("quests");
			if (e.code === "KeyM") setMapOpen((open) => !open);
			if (e.code === "KeyN") setFriendsOpen((open) => !open);
			if (e.code.startsWith("Digit")) {
				const slot = Number(e.code.slice(5)) - 1;
				const id = useRpg.getState().hotbar[slot];
				if (id) useRpg.getState().castSkill(id);
			}
			if (e.code === "KeyE") {
				const here = readSim();
				const found = takeNearLoot(here.x, here.z);
				if (found) pocket(found);
				else useRpg.getState().interact();
			}
		};
		const up = (e) => {
			input.keys.delete(e.code);
		};
		const blur = () => {
			input.keys.clear();
			input.joyX = 0;
			input.joyY = 0;
			input.look = false;
			input.sprint = false;
		};
		const blockMenu = (e) => e.preventDefault();
		window.addEventListener("keydown", down);
		window.addEventListener("keyup", up);
		window.addEventListener("blur", blur);
		window.addEventListener("contextmenu", blockMenu);
		return () => {
			window.removeEventListener("keydown", down);
			window.removeEventListener("keyup", up);
			window.removeEventListener("blur", blur);
			window.removeEventListener("contextmenu", blockMenu);
		};
	}, []);
	const onPointerDown = (e) => {
		if (!playing) return;
		if (e.target.closest("[data-joy], [data-ui]")) return;
		const mouseLook = e.pointerType !== "touch" && e.button === 2;
		const touchLook = e.pointerType === "touch";
		if (!mouseLook && !touchLook) return;
		lookPtr.current = e.pointerId;
		lookBtn.current = e.button;
		moved.current = 0;
		drag.current = {
			x: e.clientX,
			y: e.clientY
		};
		input.look = false;
		e.currentTarget.setPointerCapture(e.pointerId);
		e.preventDefault();
	};
	const onPointerMove = (e) => {
		if (!drag.current || lookPtr.current !== e.pointerId) return;
		const dx = e.clientX - drag.current.x;
		const dy = e.clientY - drag.current.y;
		moved.current += Math.hypot(dx, dy);
		drag.current = {
			x: e.clientX,
			y: e.clientY
		};
		if (moved.current < 12) return;
		input.look = true;
		input.orbit -= dx * .0048;
		input.pitch = clamp(input.pitch + dy * .0032, .18, 1.15);
	};
	const onPointerUp = (e) => {
		if (lookPtr.current !== null && e.pointerId !== lookPtr.current) return;
		const started = lookPtr.current === e.pointerId;
		const click = started && lookBtn.current === 2 && moved.current < 8;
		const tapped = started && e.pointerType === "touch" && moved.current < 12;
		lookPtr.current = null;
		drag.current = null;
		input.look = false;
		if ((click || tapped) && useHud.getState().playing) queuePick(e.clientX, e.clientY);
	};
	const onWheel = (e) => {
		if (!playing) return;
		input.dist = clamp(input.dist + e.deltaY * .004, 3.8, 10);
	};
	const joyDown = (e) => {
		e.stopPropagation();
		const rect = e.currentTarget.getBoundingClientRect();
		joy.current = {
			id: e.pointerId,
			ox: rect.left + rect.width / 2,
			oy: rect.top + rect.height / 2
		};
		e.currentTarget.setPointerCapture(e.pointerId);
	};
	const joyMove = (e) => {
		e.stopPropagation();
		if (!joy.current || joy.current.id !== e.pointerId) return;
		const dx = (e.clientX - joy.current.ox) / 34;
		const dy = (e.clientY - joy.current.oy) / 34;
		let x = clamp(dx, -1, 1);
		let y = clamp(-dy, -1, 1);
		const mag = Math.hypot(x, y);
		if (mag < .16) {
			x = 0;
			y = 0;
		} else {
			const scale = Math.min(1, (mag - .16) / (.84 * Math.max(mag, .001)));
			x *= scale;
			y *= scale;
		}
		input.joyX = x;
		input.joyY = y;
		input.sprint = y > .82;
		e.currentTarget.classList.toggle("is-run", y > .82);
		if (knob.current) knob.current.style.transform = `translate(${x * 20}px, ${-y * 20}px)`;
	};
	const joyUp = (e) => {
		e.stopPropagation();
		joy.current = null;
		input.joyX = 0;
		input.joyY = 0;
		input.sprint = false;
		e.currentTarget.classList.remove("is-run");
		if (knob.current) knob.current.style.transform = "translate(0px, 0px)";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 touch-none select-none",
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onPointerCancel: onPointerUp,
		onWheel,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortraitLock, {}),
			playing && activeId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetLive, { nick }) : null,
			playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Vitals, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyWindow, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorldMap, {
						zone,
						big: mapOpen,
						onToggle: () => setMapOpen((open) => !open)
					}),
					friendsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FriendsWindow, { onClose: () => setFriendsOpen(false) }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						id: "mob-bars",
						className: "pointer-events-none absolute inset-0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						id: "chat-bubbles",
						className: "pointer-events-none absolute inset-0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						id: "nameplate",
						className: "pointer-events-none absolute hidden -translate-x-1/2 -translate-y-full whitespace-nowrap text-center text-sm font-medium text-fg",
						style: { textShadow: "0 1px 2px #1c1916" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Prompt, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestTracker, { open: questHud }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toast, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						id: "combat-floats",
						className: "pointer-events-none absolute inset-0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hurt, {})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center overflow-auto bg-bg/55 px-4 py-6 touch-pan-y",
				children: isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Oturum açılıyor…"
				}) : !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthScreens, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterScreens, {})
			}),
			playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"data-ui": true,
					className: "hud-char absolute top-4 right-4 z-30 rounded-md border border-border bg-surface/90 px-3 py-2 text-sm text-fg",
					onClick: () => setMenu((open) => open ? null : "root"),
					children: "Ayarlar"
				}),
				menu && !friendsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsMenu, {
					mode: menu,
					onMode: setMenu,
					onClose: () => setMenu(null),
					onFriends: () => setFriendsOpen(true)
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectBar, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialHud, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhisperDock, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickButtons, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panels, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "phone-dock",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-joy": true,
							className: "joy-stick hand-only absolute h-28 w-28 rounded-full border border-border bg-surface/80",
							onPointerDown: joyDown,
							onPointerMove: joyMove,
							onPointerUp: joyUp,
							onPointerCancel: joyUp,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "joy-ring",
									"aria-hidden": "true"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "joy-mark",
									"aria-hidden": "true",
									children: "koş"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									ref: knob,
									className: "joy-knob absolute top-8 left-8 h-12 w-12 rounded-full bg-primary"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "phone-dock-mid",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatDock, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hotbar, {})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchCluster, {})
					]
				})
			] }) : null
		]
	});
}
function PortraitLock() {
	const [note, setNote] = (0, import_react.useState)("");
	const lockLandscape = async () => {
		setNote("");
		try {
			if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
			const orientation = screen.orientation;
			if (!orientation?.lock) throw new Error("no-lock");
			await orientation.lock("landscape");
		} catch {
			setNote("Bu ekran kendi kendine dönmez. Telefonu yan tutman yeterli.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "portrait-gate pointer-events-auto absolute inset-0 z-[80] flex-col items-center justify-center gap-4 bg-bg px-6 text-center",
		role: "dialog",
		"aria-label": "Telefonu yatay çevir",
		onPointerDown: (e) => e.stopPropagation(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "phone-turn",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl text-gold",
				children: "Telefonu yatay çevir"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-xs text-sm text-muted",
				children: "Dikeyde oynanmaz. Yan çevirince çubuk, vuruş ve menüler birbirinin üstüne binmeden yerleşir."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "rounded-md border border-gold bg-surface px-4 py-2 text-sm text-gold",
				onClick: () => void lockLandscape(),
				children: "Yatay kilitle"
			}),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-xs text-xs text-muted",
				children: note
			}) : null
		]
	});
}
function TouchCluster() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "hand-cluster",
		"data-ui": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"data-ui": true,
			className: "hand-hit grid place-items-center rounded-full border border-gold bg-surface/95 text-[11px] font-medium text-gold",
			onPointerDown: (e) => {
				e.stopPropagation();
				input.keys.add("Space");
			},
			onPointerUp: (e) => {
				e.stopPropagation();
				input.keys.delete("Space");
			},
			onPointerCancel: () => input.keys.delete("Space"),
			children: "Vur"
		})
	});
}
function Bar({ label, value, max, tone }) {
	const pct = Math.max(0, Math.min(100, value / Math.max(1, max) * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-[2.4rem_1fr_3.2rem] items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs tracking-wide text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "h-2 overflow-hidden rounded-sm border border-border bg-bg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `block h-full ${tone}`,
					style: { width: `${pct}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-right text-xs text-fg",
				children: [
					Math.ceil(value),
					"/",
					Math.ceil(max)
				]
			})
		]
	});
}
function Vitals() {
	const hp = useRpg((s) => s.hp);
	const hpMax = useRpg((s) => s.hpMax);
	const mana = useRpg((s) => s.mana);
	const manaMax = useRpg((s) => s.manaMax);
	const sta = useRpg((s) => s.sta);
	const staMax = useRpg((s) => s.staMax);
	const xp = useRpg((s) => s.xp);
	const xpTo = useRpg((s) => s.xpTo);
	const [xpTip, setXpTip] = (0, import_react.useState)(false);
	const progress = xp / Math.max(1, xpTo) * 4;
	const pct = Math.round(xp / Math.max(1, xpTo) * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "hud-vitals pointer-events-auto absolute bottom-36 left-4 z-20 w-[min(18rem,72vw)] md:bottom-4",
		"data-xp": Math.floor(xp),
		"data-xp-to": xpTo,
		onPointerEnter: () => setXpTip(true),
		onPointerLeave: () => setXpTip(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-1 rounded-lg border border-border bg-surface/90 p-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					label: "CAN",
					value: hp,
					max: hpMax,
					tone: "bg-hp"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					label: "MANA",
					value: mana,
					max: manaMax,
					tone: "bg-mp"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					label: "STA",
					value: sta,
					max: staMax,
					tone: "bg-sta"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mt-1 flex gap-1",
					onMouseEnter: () => setXpTip(true),
					onMouseLeave: () => setXpTip(false),
					children: [[
						0,
						1,
						2,
						3
					].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Orb, { fill: progress - i }, i)), xpTip ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "absolute -top-7 left-0 rounded-md border border-gold bg-bg px-2 py-0.5 text-[11px] text-gold",
						children: [
							pct,
							"% · ",
							Math.floor(xp),
							"/",
							xpTo
						]
					}) : null]
				})
			]
		})
	});
}
function Orb({ fill }) {
	const amount = Math.max(0, Math.min(1, fill));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative h-7 w-7",
		"data-fill": amount.toFixed(3),
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 overflow-hidden rounded-full border-2 border-[#c9a15b] bg-[#100e0c]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 bottom-0 bg-[#e2b45a]",
				style: { height: `${amount * 100}%` }
			})
		})
	});
}
function SelectBar() {
	const snap = (0, import_react.useSyncExternalStore)(subscribeTarget, targetSnapshot, targetSnapshot);
	const nick = useRpg((s) => s.nick);
	const level = useRpg((s) => s.level);
	const { sel, duel } = snap;
	if (duel.phase === "in") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-ui": true,
		className: "pointer-events-auto absolute top-16 left-1/2 z-20 w-[min(18rem,90vw)] -translate-x-1/2 rounded-lg border border-gold/70 bg-surface/95 p-3 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-widest text-gold",
				children: "VS"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-fg",
				children: [
					duel.nick,
					" · Sv.",
					duel.level,
					" düello istiyor"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-md border border-gold bg-bg px-3 py-1.5 text-sm text-gold",
					onClick: () => answerDuel(true, nick, level),
					children: "Kabul"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-fg",
					onClick: () => answerDuel(false, nick, level),
					children: "Reddet"
				})]
			})
		]
	});
	if (duel.phase !== "live" && duel.phase !== "sent") return null;
	const label = sel ? sel.kind === "mob" ? sel.name : `${sel.nick} · Sv.${sel.level}` : `${duel.nick} · Sv.${duel.level}`;
	const vs = duel.phase === "live" ? "VS" : "Teklif gitti";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-ui": true,
		className: "pointer-events-auto absolute top-16 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border bg-surface/95 px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs tracking-widest text-gold",
				children: vs
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm text-fg",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "rounded-md border border-border bg-bg px-2 py-1 text-xs text-muted",
				onClick: () => endDuel(nick, level),
				children: "Bırak"
			})
		]
	});
}
function SocialHud() {
	const snap = (0, import_react.useSyncExternalStore)(subscribeTarget, targetSnapshot, targetSnapshot);
	const { sel, duel, social } = snap;
	if (social.phase === "in") {
		const title = social.act === "trade" ? "Ticaret" : social.act === "friend" ? "Dost" : "Grup";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-ui": true,
			className: "pointer-events-auto absolute top-16 left-1/2 z-20 w-[min(18rem,90vw)] -translate-x-1/2 rounded-lg border border-border bg-surface/95 p-3 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-gold",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-fg",
					children: [social.nick, " teklif ediyor"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "rounded-md border border-gold bg-bg px-3 py-1.5 text-sm text-gold",
						onClick: () => answerSocial(true),
						children: "Kabul"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-fg",
						onClick: () => answerSocial(false),
						children: "Reddet"
					})]
				})
			]
		});
	}
	if (social.phase === "live" && social.act === "trade") {
		const trade = snap.trade;
		const cell = (item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-12 items-center rounded-md border border-border bg-bg/80 px-2 text-xs text-fg",
			children: item ? displayName(item) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted",
				children: "Boş"
			})
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-ui": true,
			className: "hud-window pointer-events-auto absolute top-20 left-1/2 z-30 w-[min(40rem,96vw)] -translate-x-1/2 rounded-xl border border-border bg-surface/95 p-3",
			onPointerDown: (e) => e.stopPropagation(),
			onDragOver: (e) => e.preventDefault(),
			onDrop: (e) => {
				e.preventDefault();
				const raw = e.dataTransfer.getData("text/plain");
				if (raw.startsWith("bag:")) addTradeItem(Number(raw.slice(4)));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-gold",
						children: ["Ticaret · ", social.nick]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-xs text-muted",
						onClick: () => closeTrade(),
						children: "Kapat"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-[11px] text-muted",
					children: "Envanterden eşyayı kendi pencerenin üstüne sürükle. İki taraf da kabul edince takas olur."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-1 text-xs text-gold",
							children: "Sen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col gap-1",
							children: trade.mine.length === 0 ? cell(null) : trade.mine.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: cell(item) }, item.uid))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: trade.mineOk ? "mt-2 w-full rounded-md border border-gold bg-gold/15 px-2 py-1.5 text-sm text-gold" : "mt-2 w-full rounded-md border border-border px-2 py-1.5 text-sm",
							onClick: () => setTradeOk(!trade.mineOk),
							children: trade.mineOk ? "Kabul edildi" : "Kabul"
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-1 text-xs text-gold",
							children: social.nick
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col gap-1",
							children: trade.theirs.length === 0 ? cell(null) : trade.theirs.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: cell(item) }, item.uid))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 rounded-md border border-border px-2 py-1.5 text-center text-sm text-muted",
							children: trade.theirsOk ? "Kabul etti" : "Bekliyor"
						})
					] })]
				})
			]
		});
	}
	if (duel.phase === "in" || duel.phase === "live" || social.phase === "sent") return null;
	if (!sel || sel.kind !== "player") return null;
	const known = snap.friends.some((mate) => mate.id === sel.id);
	const grouped = snap.party.some((mate) => mate.id === sel.id);
	const act = (label, run, off = false) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		disabled: off,
		className: "rounded-md px-2.5 py-1.5 text-sm text-fg hover:bg-bg disabled:cursor-default disabled:opacity-35",
		onClick: run,
		children: label
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-ui": true,
		className: "hud-target pointer-events-auto absolute top-16 left-1/2 z-40 flex max-w-[96vw] -translate-x-1/2 flex-wrap items-center justify-center gap-0.5 rounded-lg border border-border bg-surface/95 px-1 py-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "px-2 text-xs text-gold",
				children: sel.nick
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: known,
				className: known ? "rounded-md border border-border px-2.5 py-1.5 text-sm text-muted opacity-50" : "hud-friend rounded-md border border-gold bg-gold/15 px-2.5 py-1.5 text-sm text-gold",
				onClick: () => offerSocial("friend"),
				children: known ? "Dostun" : "Dost ekle"
			}),
			act(grouped ? "Grupta" : "Grup", () => offerSocial("party"), grouped),
			act("Ticaret", () => offerSocial("trade")),
			act("Düello", () => offerDuel(useRpg.getState().nick, useRpg.getState().level)),
			act("Fısıltı", () => setWhisper({
				id: sel.id,
				nick: sel.nick
			}))
		]
	});
}
function ChatDock() {
	const lines = (0, import_react.useSyncExternalStore)(subscribeChat, chatSnapshot, chatSnapshot);
	const box = (0, import_react.useRef)(null);
	const [draft, setDraft] = (0, import_react.useState)("");
	const open = chatFocused();
	(0, import_react.useEffect)(() => {
		if (open) box.current?.focus();
	}, [open]);
	if (!open) return null;
	const recent = lines.filter((line) => !line.whisper).slice(-4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-ui": true,
		className: "hud-chat pointer-events-auto absolute bottom-28 left-1/2 z-20 w-[min(28rem,78vw)] -translate-x-1/2 md:bottom-24",
		onPointerDown: (e) => e.stopPropagation(),
		children: [recent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "chat-log mb-1 max-h-24 overflow-hidden rounded-md bg-bg/75 px-2 py-1.5",
			children: recent.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "truncate text-xs text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted",
					children: [line.nick, ": "]
				}), line.text]
			}, line.id))
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex gap-1",
			onSubmit: (e) => {
				e.preventDefault();
				sendChat(draft);
				setDraft("");
				setChatFocus(false);
				box.current?.blur();
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: box,
				value: draft,
				onChange: (e) => setDraft(e.target.value),
				onFocus: () => {
					clearMove();
					setChatFocus(true);
				},
				placeholder: "Mesaj",
				maxLength: 80,
				className: "min-w-0 flex-1 rounded-md border border-border bg-bg/95 px-2 py-1.5 text-sm text-fg outline-none"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				className: "rounded-md border border-border bg-surface px-2 text-sm text-gold",
				children: "Yaz"
			})]
		})]
	});
}
function WhisperDock() {
	const to = whisperTarget();
	const lines = (0, import_react.useSyncExternalStore)(subscribeChat, chatSnapshot, chatSnapshot);
	const box = (0, import_react.useRef)(null);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [pos, setPos] = (0, import_react.useState)({
		x: 48,
		y: 96
	});
	const drag = (0, import_react.useRef)(null);
	if (!to) return null;
	const recent = lines.filter((line) => line.whisper).slice(-12);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-ui": true,
		className: "hud-window hud-whisper pointer-events-auto absolute z-30 w-[min(36rem,94vw)] rounded-xl border border-gold/40 bg-surface/95 p-3 shadow-lg",
		style: {
			left: pos.x,
			top: pos.y
		},
		onPointerDown: (e) => e.stopPropagation(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex cursor-grab items-center justify-between active:cursor-grabbing",
				onPointerDown: (e) => {
					if (e.target.closest("button,input")) return;
					drag.current = {
						dx: e.clientX - pos.x,
						dy: e.clientY - pos.y
					};
					e.currentTarget.setPointerCapture(e.pointerId);
				},
				onPointerMove: (e) => {
					if (!drag.current) return;
					setPos({
						x: Math.max(8, e.clientX - drag.current.dx),
						y: Math.max(8, e.clientY - drag.current.dy)
					});
				},
				onPointerUp: () => {
					drag.current = null;
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-gold",
					children: ["Fısıltı · ", to.nick]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-xs text-muted",
					onClick: () => setWhisper(null),
					children: "Kapat"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 max-h-48 space-y-1 overflow-auto",
				children: [recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Henüz fısıltı yok"
				}) : null, recent.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-gold",
						children: [line.nick, ": "]
					}), line.text]
				}, line.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-1",
				onSubmit: (e) => {
					e.preventDefault();
					sendWhisper(draft);
					setDraft("");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: draft,
					ref: box,
					onChange: (e) => setDraft(e.target.value),
					onFocus: clearMove,
					placeholder: "Fısıltı yaz",
					maxLength: 120,
					className: "min-w-0 flex-1 rounded-md border border-border bg-bg px-2 py-2 text-sm text-fg outline-none"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "rounded-md border border-border px-3 text-sm text-gold",
					children: "Gönder"
				})]
			})
		]
	});
}
function Hotbar() {
	const hotbar = useRpg((s) => s.hotbar);
	const skills = useRpg((s) => s.skills);
	const classId = useRpg((s) => s.classId);
	const base = useRpg((s) => s.base);
	const invested = useRpg((s) => s.invested);
	const equipped = useRpg((s) => s.equipped);
	const level = useRpg((s) => s.level);
	const totals = sumStats({
		base,
		invested,
		equipped,
		level,
		skills
	});
	const [tip, setTip] = (0, import_react.useState)(null);
	const names = new Map(CLASS_TREES[classId].flatMap((tree) => tree.skills.map((sk) => [sk.id, sk])));
	const shown = tip ? names.get(tip.id) : void 0;
	const preview = tip ? skillPreview(tip.id, skills[tip.id] ?? 0, totals) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-ui": true,
		className: "hud-hotbar pointer-events-auto absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 gap-1 md:bottom-3",
		onPointerDown: (e) => e.stopPropagation(),
		children: [hotbar.map((id, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "relative grid h-12 w-12 place-items-center rounded-md border border-border bg-surface/95",
			onClick: () => id && useRpg.getState().castSkill(id),
			onMouseEnter: (e) => id && setTip({
				id,
				x: e.clientX,
				y: e.clientY
			}),
			onMouseMove: (e) => id && setTip({
				id,
				x: e.clientX,
				y: e.clientY
			}),
			onMouseLeave: () => setTip(null),
			onContextMenu: (e) => {
				e.preventDefault();
				useRpg.getState().setHotbar(index, null);
			},
			onDragOver: (e) => e.preventDefault(),
			onDrop: (e) => {
				e.preventDefault();
				const raw = e.dataTransfer.getData("text/plain");
				if (raw.startsWith("skill:")) useRpg.getState().setHotbar(index, raw.slice(6));
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-0.5 left-1 text-[9px] text-muted",
				children: index + 1
			}), id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillMark, { id }) : null]
		}, index)), shown && preview && tip ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute bottom-14 left-1/2 z-30 w-56 -translate-x-1/2 rounded-md border border-border bg-surface/95 p-2 text-left text-xs text-fg shadow-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-gold",
					children: shown.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-muted",
					children: shown.desc
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1",
					children: preview.buff ? "Hasar yok" : `Hasar ${preview.dmg}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted",
					children: [
						"Seviye ",
						skillTier(skills[tip.id] ?? 0),
						" · ",
						skillCdLeft(tip.id) > .05 ? `${skillCdLeft(tip.id).toFixed(1)} sn` : "Hazır"
					]
				})
			]
		}) : null]
	});
}
function QuickButtons() {
	const unspent = useRpg((s) => s.unspent);
	const points = useRpg((s) => s.skillPoints);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [unspent > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-ui": true,
		className: "hud-plus left-4",
		onClick: () => useRpg.getState().showChar("stats"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "+" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Statü Geliştir" })]
	}) : null, points > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-ui": true,
		className: "hud-plus right-4",
		onClick: () => useRpg.getState().showChar("skills"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "+" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Beceri Geliştir" })]
	}) : null] });
}
function QuestTracker({ open }) {
	const active = useRpg((s) => s.quests).filter((quest) => !quest.claimed);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hud-quests pointer-events-none absolute top-[42%] right-4 z-10 w-[min(14rem,34vw)] -translate-y-1/2 rounded-md border border-border bg-surface/80 px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] tracking-widest text-gold",
				children: "Görevler"
			}),
			active.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11px] text-muted",
				children: "Görev yok"
			}) : null,
			active.map((quest) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-fg",
					children: quest.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted",
					children: quest.done ? "Ödül için muhafıza dön" : `${Math.min(quest.have, quest.need)}/${quest.need}`
				})]
			}, quest.id))
		]
	});
}
function SettingsMenu({ mode, onMode, onClose, onFriends }) {
	const gfx = (0, import_react.useSyncExternalStore)(subscribeGfx, readGfx, readGfx);
	const panelOpen = useRpg((s) => s.charOpen || s.invOpen || Boolean(s.shop));
	(0, import_react.useEffect)(() => {
		loadGfx();
	}, []);
	if (panelOpen) return null;
	const go = (run) => {
		onClose();
		run();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-ui": true,
		className: "hud-window pointer-events-auto absolute top-1/2 left-1/2 z-50 w-[min(18rem,86vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface/95 p-3",
		onPointerDown: (e) => e.stopPropagation(),
		children: mode === "root" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1 text-xs tracking-widest text-gold",
					children: "Ayarlar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-md border border-border px-3 py-2 text-left text-sm",
					onClick: () => go(() => useRpg.getState().showChar("stats")),
					children: "Statü"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-md border border-border px-3 py-2 text-left text-sm",
					onClick: () => go(() => useRpg.getState().showChar("skills")),
					children: "Yetenek"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-md border border-border px-3 py-2 text-left text-sm",
					onClick: () => go(() => useRpg.getState().toggleInv()),
					children: "Çanta"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-md border border-border px-3 py-2 text-left text-sm",
					onClick: () => go(onFriends),
					children: "Dostlar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-md border border-border px-3 py-2 text-left text-sm",
					onClick: () => onMode("opts"),
					children: "Oyun Seçenekleri"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-md border border-border px-3 py-2 text-left text-sm",
					onClick: () => go(() => leaveToCharacters()),
					children: "Karakter Değişikliği"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-md border border-border px-3 py-2 text-left text-sm",
					onClick: () => go(() => void signOut("/")),
					children: "Çıkış"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-md border border-border px-3 py-2 text-left text-sm",
					onClick: () => go(() => {
						window.close();
						useRpg.setState({ toast: "Sekme kapanmazsa tarayıcıdan kapat" });
					}),
					children: "Oyun Sonu"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-md border border-gold px-3 py-2 text-left text-sm text-gold",
					onClick: onClose,
					children: "İptal"
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-gold",
					children: "Oyun Seçenekleri"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center justify-between gap-2",
					children: ["FPS", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "rounded-md border border-border bg-bg px-2 py-1",
						value: gfx.fps,
						onChange: (e) => writeGfx({ fps: Number(e.target.value) }),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: 30,
								children: "30"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: 60,
								children: "60"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: 120,
								children: "120"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center justify-between gap-2",
					children: ["Görüntü", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "rounded-md border border-border bg-bg px-2 py-1",
						value: gfx.quality,
						onChange: (e) => writeGfx({
							quality: Number(e.target.value),
							auto: false
						}),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: .7,
								children: "Düşük"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: 1,
								children: "Orta"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: 1.25,
								children: "Yüksek"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center justify-between gap-2",
					children: ["Otomatik grafik", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: gfx.auto,
						onChange: (e) => writeGfx({ auto: e.target.checked })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center justify-between gap-2",
					children: ["Ses", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 1,
						step: .05,
						value: gfx.volume,
						onChange: (e) => writeGfx({ volume: Number(e.target.value) })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-md border border-border px-3 py-1.5 text-left",
					onClick: onClose,
					children: "Kapat"
				})
			]
		})
	});
}
function PartyWindow() {
	const snap = (0, import_react.useSyncExternalStore)(subscribeTarget, targetSnapshot, targetSnapshot);
	const nick = useRpg((s) => s.nick);
	const level = useRpg((s) => s.level);
	if (!snap.party.length) return null;
	const rows = [{
		id: "me",
		nick: `${nick} (sen)`,
		level
	}, ...snap.party];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-ui": true,
		className: "hud-party pointer-events-auto absolute top-40 left-4 z-20 w-[min(12rem,46vw)] rounded-lg border border-border bg-surface/95 p-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wide text-gold",
				children: "Guruptakiler"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "rounded border border-border px-1 text-[10px]",
				onClick: () => leaveParty(),
				children: "Ayrıl"
			})]
		}), rows.map((mate) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "truncate text-xs text-fg",
			children: [
				mate.nick,
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted",
					children: ["Sv.", mate.level]
				})
			]
		}, mate.id + mate.nick))]
	});
}
function FriendsWindow({ onClose }) {
	const snap = (0, import_react.useSyncExternalStore)(subscribeTarget, targetSnapshot, targetSnapshot);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-ui": true,
		className: "hud-friends pointer-events-auto absolute right-4 bottom-40 z-20 w-[min(18rem,86vw)] rounded-lg border border-border bg-surface/95 p-2 md:bottom-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-wide text-gold",
					children: "Arkadaşlar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-xs text-muted",
					onClick: onClose,
					children: "Kapat"
				})]
			}),
			snap.friends.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Henüz dost yok"
			}) : null,
			snap.friends.map((mate) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex items-center justify-between gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "min-w-0 truncate text-xs text-fg",
					children: [
						mate.nick,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: ["Sv.", mate.level]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex shrink-0 gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "rounded border border-border px-1 text-[10px]",
							onClick: () => setWhisper({
								id: mate.id,
								nick: mate.nick
							}),
							children: "Fısıltı"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "rounded border border-border px-1 text-[10px]",
							onClick: () => removeFriend(mate.id),
							children: "Sil"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "rounded border border-border px-1 text-[10px] text-hp",
							onClick: () => blockMate(mate),
							children: "Engelle"
						})
					]
				})]
			}, mate.id))
		]
	});
}
function WorldMap({ zone, big, onToggle }) {
	const [sim, setSim] = (0, import_react.useState)(() => readSim());
	const [coords, setCoords] = (0, import_react.useState)(false);
	const [mark, setMark] = (0, import_react.useState)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const hand = useHandLayout();
	(0, import_react.useEffect)(() => {
		let frame = 0;
		const loop = () => {
			const next = readSim();
			setSim((prev) => Math.abs(prev.x - next.x) < .08 && Math.abs(prev.z - next.z) < .08 && Math.abs(prev.yaw - next.yaw) < .03 ? prev : next);
			frame = window.requestAnimationFrame(loop);
		};
		frame = window.requestAnimationFrame(loop);
		return () => window.cancelAnimationFrame(frame);
	}, []);
	const size = big ? hand ? 180 : 320 : hand ? 58 : 148;
	const half = 158;
	const px = (sim.x / half * .5 + .5) * size;
	const py = (sim.z / half * .5 + .5) * size;
	const deg = Math.atan2(-Math.sin(sim.yaw), Math.cos(sim.yaw)) * 180 / Math.PI;
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		const g = canvas?.getContext("2d");
		if (!canvas || !g) return;
		const s = size;
		canvas.width = s;
		canvas.height = s;
		g.fillStyle = "#6d7c58";
		g.fillRect(0, 0, s, s);
		const cx = s / 2;
		const cy = s / 2;
		const k = s / 316;
		const disc = (r, fill) => {
			g.beginPath();
			g.arc(cx, cy, r * k, 0, Math.PI * 2);
			g.fillStyle = fill;
			g.fill();
		};
		disc(65, "#16343c");
		disc(46.4, "#6d7c58");
		disc(16.5, "#c8c1b4");
		g.fillStyle = "#5a5148";
		for (const h of HOUSES) g.fillRect(cx + (h.x - h.w / 2) * k, cy + (h.z - h.d / 2) * k, Math.max(2, h.w * k), Math.max(2, h.d * k));
		g.strokeStyle = "#d7c4a4";
		g.lineWidth = Math.max(2, 4.2 * k);
		g.beginPath();
		g.moveTo(cx, cy - 63 * k);
		g.lineTo(cx, cy - 45 * k);
		g.moveTo(cx, cy + 45 * k);
		g.lineTo(cx, cy + 63 * k);
		g.moveTo(cx - 63 * k, cy);
		g.lineTo(cx - 45 * k, cy);
		g.moveTo(cx + 45 * k, cy);
		g.lineTo(cx + 63 * k, cy);
		g.stroke();
		g.fillStyle = "#e6c36a";
		for (const mark of MAP_MARKS) {
			g.beginPath();
			g.arc(cx + mark.x * k, cy + mark.z * k, Math.max(2.2, 2.4 * (s / 148)), 0, Math.PI * 2);
			g.fill();
		}
	}, [
		size,
		sim.x,
		sim.z
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-ui": true,
		className: big ? "pointer-events-auto absolute top-16 left-1/2 z-30 -translate-x-1/2" : "hud-map pointer-events-auto absolute top-16 right-4 z-20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "block",
			onClick: onToggle,
			"aria-label": "Harita",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "relative block overflow-hidden rounded-lg border border-border",
				style: {
					width: size,
					height: size
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						className: "block h-full w-full"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute z-10 h-0 w-0",
						style: {
							left: px,
							top: py,
							transform: `translate(-50%, -50%) rotate(${deg}deg)`,
							borderLeft: "5px solid transparent",
							borderRight: "5px solid transparent",
							borderBottom: "11px solid #7eb6ff"
						},
						onMouseEnter: (e) => {
							e.stopPropagation();
							setCoords(true);
						},
						onMouseLeave: () => setCoords(false)
					}),
					MAP_MARKS.map((spot) => {
						const left = (spot.x / half * .5 + .5) * size;
						const top = (spot.z / half * .5 + .5) * size;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2",
							style: {
								left,
								top
							},
							onMouseEnter: (e) => {
								e.stopPropagation();
								setMark(spot.name);
							},
							onMouseLeave: () => setMark(null),
							onPointerDown: (e) => e.stopPropagation()
						}, spot.name);
					}),
					mark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute top-1 left-1 z-20 rounded bg-bg/90 px-1 text-[10px] text-gold",
						children: mark
					}) : null,
					coords ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "absolute bottom-1 left-1 rounded bg-bg/90 px-1 text-[10px] text-fg",
						children: [
							"X ",
							sim.x.toFixed(0),
							" Z ",
							sim.z.toFixed(0)
						]
					}) : null
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 rounded-md border border-border bg-surface/90 px-2 py-1 text-center text-xs text-gold",
			children: zone
		})]
	});
}
function Prompt() {
	const near = useRpg((s) => s.near);
	const shop = useRpg((s) => s.shop);
	const mentor = useRpg((s) => s.mentor);
	const hint = (0, import_react.useSyncExternalStore)(subscribeField, lootHint, lootHint);
	const cls = "hud-prompt absolute bottom-[18%] left-1/2 -translate-x-1/2 rounded-lg border border-border bg-surface/90 px-3 py-2 text-sm text-fg";
	if (hint) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cls,
		children: hint
	});
	if (!near || shop) return null;
	const text = {
		mentor: `E — ${MENTORS.find((row) => row.id === mentor)?.name ?? "Usta"}`,
		smith: "E — Demirci, + bas",
		guard: "E — Köy Muhafızı",
		market: "E — Satıcı",
		armor: "E — Zırhçı",
		weapon: "E — Silahçı",
		depot: "E — Depo",
		stable: "E — Seyis",
		fisher: "E — Balıkçı",
		miner: "E — Madenci",
		well: "E — Kuyudan günlük bağış",
		fish: "E — Olta ve yemle balık tut",
		vein: "E — Kazmayla maden kır"
	}[near] ?? "E";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cls,
		children: text
	});
}
function Toast() {
	const toast = useRpg((s) => s.toast);
	(0, import_react.useEffect)(() => {
		if (!toast) return;
		const id = window.setTimeout(() => {
			if (useRpg.getState().toast === toast) useRpg.setState({ toast: "" });
		}, 2200);
		return () => window.clearTimeout(id);
	}, [toast]);
	if (!toast) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "absolute top-[22%] left-1/2 -translate-x-1/2 rounded-lg border border-gold bg-surface/95 px-3 py-2 text-sm text-fg",
		children: toast
	});
}
function Hurt() {
	const hurt = useRpg((s) => s.hurt);
	if (hurt <= 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 bg-hp/25",
		style: { opacity: hurt }
	});
}
function Panels() {
	const invOpen = useRpg((s) => s.invOpen);
	const charOpen = useRpg((s) => s.charOpen);
	const shop = useRpg((s) => s.shop);
	if (!invOpen && !charOpen && !shop) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0",
		"data-ui": true,
		children: [
			invOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inventory, {}) : null,
			charOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Character, {}) : null,
			shop && shop !== "smith" && shop !== "depot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TradeShop, { kind: shop })
			}) : null,
			shop === "depot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DepotShop, {})
			}) : null,
			shop === "smith" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmithShop, {})
			}) : null
		]
	});
}
function Shell({ title, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-ui": true,
		className: `pointer-events-auto max-h-[86dvh] overflow-auto rounded-xl border border-border/80 bg-surface/95 p-3 text-fg hud-window ${className ?? "w-full max-w-3xl"}`,
		onPointerDown: (e) => e.stopPropagation(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg text-gold",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "rounded-md border border-border px-2 py-1 text-sm",
				onClick: () => useRpg.getState().closePanels(),
				children: "Kapat"
			})]
		}), children]
	});
}
function Tip({ item, x, y }) {
	const s = itemStats(item);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none fixed z-30 w-52 rounded-md border border-gold bg-bg/95 p-2 text-xs text-fg",
		style: {
			left: x + 12,
			top: y + 12
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-gold",
				children: displayName(item)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-muted",
				children: [
					SLOT_LABEL[item.slot],
					" · Sv.",
					item.level
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"STR ",
				s.str,
				" · HP ",
				s.hp
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"ATS ",
				s.ats,
				" · MVS ",
				s.mvs,
				" · CTP ",
				s.ctp,
				"%"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: item.desc
			})
		]
	});
}
function ItemMark({ item }) {
	if (!item) return null;
	const pala = item.id.includes("pala");
	const bow = item.id.includes("bow");
	const staff = item.id.includes("staff");
	const dagger = item.id.includes("dagger");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "mb-0.5 h-6 w-6 text-gold",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "1.6",
		"aria-hidden": "true",
		children: pala ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 2v16M9 18h6M12 18v4" }) : bow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 4c7 4 7 12 0 16M8 4c3 5 3 11 0 16" }) : staff ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 3v18M12 6l3 2M12 6l-3 2" }) : dagger ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 3l2 8h-4l2-8zM10 13h4v6h-4z" }) : item.slot === "weapon" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 3v12M9 15h6M12 15v6" }) : item.slot === "armor" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M6 6h12l-1 13H7L6 6z" }) : item.slot === "helmet" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M6 14a6 6 0 0 1 12 0v3H6z" }) : item.slot === "boots" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 4h5v9H7l-1 5h11" }) : item.slot === "gloves" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 15V7m3 8V5m3 10V7m3 8v-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "12",
			r: "4"
		})
	});
}
var PAPER = [
	{
		slot: "weapon",
		area: "1 / 1 / 3 / 2"
	},
	{
		slot: "helmet",
		area: "1 / 2 / 2 / 3"
	},
	{
		slot: "earring",
		area: "1 / 3 / 2 / 4"
	},
	{
		slot: "necklace",
		area: "1 / 4 / 2 / 5"
	},
	{
		slot: "armor",
		area: "1 / 5 / 2 / 6"
	},
	{
		slot: "gloves",
		area: "2 / 2 / 3 / 3"
	},
	{
		slot: "bracelet",
		area: "2 / 3 / 3 / 4"
	},
	{
		slot: "ring",
		area: "2 / 4 / 3 / 5"
	},
	{
		slot: "belt",
		area: "2 / 5 / 3 / 6"
	},
	{
		slot: "boots",
		area: "3 / 3 / 4 / 4"
	}
];
var invSpot = {
	x: -1,
	y: 72
};
function Inventory() {
	const bag = useRpg((s) => s.bag);
	const equipped = useRpg((s) => s.equipped);
	const gold = useRpg((s) => s.gold);
	const bagStage = useRpg((s) => s.bagStage);
	const open = openBagCount(bagStage);
	const [page, setPage] = (0, import_react.useState)(0);
	const [tip, setTip] = (0, import_react.useState)(null);
	const [pos, setPos] = (0, import_react.useState)(() => {
		if (invSpot.x < 0 && typeof window !== "undefined") invSpot.x = Math.max(16, Math.round(window.innerWidth * .5 - 280));
		return {
			x: Math.max(8, invSpot.x),
			y: invSpot.y
		};
	});
	const drag = (0, import_react.useRef)(null);
	const show = (item, ev) => {
		if (!item) return;
		setTip({
			item,
			x: ev.clientX,
			y: ev.clientY
		});
	};
	const move = (clientX, clientY) => {
		if (!drag.current) return;
		const next = {
			x: Math.max(8, Math.min(window.innerWidth - 240, clientX - drag.current.dx)),
			y: Math.max(8, Math.min(window.innerHeight - 80, clientY - drag.current.dy))
		};
		invSpot.x = next.x;
		invSpot.y = next.y;
		setPos(next);
	};
	const start = page * 24;
	const release = (index, event) => {
		const rect = event.currentTarget.closest("[data-inv]")?.getBoundingClientRect();
		if (rect && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dropBag(index);
		setCarry(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-ui": true,
		"data-inv": true,
		className: "inv-sheet hud-window pointer-events-auto absolute max-h-[86dvh] w-[min(28rem,96vw)] overflow-auto p-3 text-fg",
		style: {
			left: pos.x,
			top: pos.y
		},
		onPointerDown: (e) => e.stopPropagation(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex cursor-grab items-center justify-between active:cursor-grabbing",
				onPointerDown: (e) => {
					if (e.target.closest("button")) return;
					drag.current = {
						dx: e.clientX - pos.x,
						dy: e.clientY - pos.y
					};
					e.currentTarget.setPointerCapture(e.pointerId);
				},
				onPointerMove: (e) => move(e.clientX, e.clientY),
				onPointerUp: () => {
					drag.current = null;
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg text-gold",
					children: "Envanter"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-md border border-border px-2 py-1 text-sm",
					onClick: () => useRpg.getState().closePanels(),
					children: "Kapat"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "equip-board",
					children: PAPER.map(({ slot, area }) => {
						const it = equipped[slot];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							draggable: !!it,
							style: { gridArea: area },
							className: `octo-slot ${slot === "weapon" ? "is-tall" : ""}`,
							onMouseEnter: (e) => show(it, e),
							onMouseMove: (e) => show(it, e),
							onMouseLeave: () => setTip(null),
							onClick: () => it && useRpg.getState().unequip(slot),
							onDragStart: (e) => {
								setCarry({
									kind: "slot",
									slot
								});
								e.dataTransfer.setData("text/plain", `slot:${slot}`);
								e.dataTransfer.effectAllowed = "move";
							},
							onDragEnd: () => setCarry(null),
							onDragOver: (e) => e.preventDefault(),
							onDrop: (e) => {
								e.preventDefault();
								const token = readCarry();
								const raw = e.dataTransfer.getData("text/plain");
								const index = token?.kind === "bag" ? token.index : raw.startsWith("bag:") ? Number(raw.slice(4)) : -1;
								if (index >= 0) useRpg.getState().equipFromBag(index);
								setCarry(null);
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemMark, { item: it }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-muted",
									children: SLOT_LABEL[slot]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate",
									children: it ? displayName(it) : "—"
								})
							]
						}, slot);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-1.5 flex gap-1",
					children: [
						0,
						1,
						2
					].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: n === page ? "bag-tab is-on" : "bag-tab",
						onClick: () => setPage(n),
						onDragOver: (e) => e.preventDefault(),
						onDrop: (e) => {
							e.preventDefault();
							e.stopPropagation();
							const token = readCarry();
							const raw = e.dataTransfer.getData("text/plain");
							if (token?.kind === "bag" || raw.startsWith("bag:")) {
								const from = token?.kind === "bag" ? token.index : Number(raw.slice(4));
								useRpg.getState().moveToPage(from, n);
							} else if (token?.kind === "slot" || raw.startsWith("slot:")) {
								const slot = token?.kind === "slot" ? token.slot : raw.slice(5);
								const start = n * 24;
								const bagNow = useRpg.getState().bag;
								let dest = -1;
								for (let i = 0; i < 24; i++) if (bagNow[start + i] == null) {
									dest = start + i;
									break;
								}
								if (dest >= 0) useRpg.getState().placeEquip(slot, dest);
								else useRpg.setState({ toast: "Bu pencere dolu" });
							}
							setCarry(null);
							setPage(n);
						},
						children: [
							"I",
							"II",
							"III"
						][n]
					}, n))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "bag-grid",
					children: Array.from({ length: 24 }, (_, i) => {
						const index = start + i;
						const it = bag[index] ?? null;
						const locked = index >= open;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							draggable: !!it && !locked,
							className: locked ? "octo-slot is-lock" : "octo-slot",
							onMouseEnter: (e) => show(it, e),
							onMouseMove: (e) => show(it, e),
							onMouseLeave: () => setTip(null),
							onClick: () => {
								if (locked) {
									useRpg.setState({ toast: "Envanter Genişletme ile açılır" });
									return;
								}
								if (it) useRpg.getState().equipFromBag(index);
							},
							onContextMenu: (e) => {
								e.preventDefault();
								e.stopPropagation();
								if (it) dropBag(index);
							},
							onDragStart: (e) => {
								setCarry({
									kind: "bag",
									index
								});
								e.dataTransfer.setData("text/plain", `bag:${index}`);
								e.dataTransfer.effectAllowed = "move";
							},
							onDragEnd: (e) => release(index, e),
							onDragOver: (e) => e.preventDefault(),
							onDrop: (e) => {
								e.preventDefault();
								const token = readCarry();
								const raw = e.dataTransfer.getData("text/plain");
								const from = token?.kind === "bag" ? token.index : raw.startsWith("bag:") ? Number(raw.slice(4)) : -1;
								if (locked) {
									if ((from >= 0 ? useRpg.getState().bag[from] : null)?.id === "bag-expand") useRpg.getState().useBagItem(from);
									else useRpg.setState({ toast: "Kilitli yuvaya Envanter Genişletme sürükle" });
									setCarry(null);
									return;
								}
								if (token?.kind === "bag" || raw.startsWith("bag:")) {
									const from = token?.kind === "bag" ? token.index : Number(raw.slice(4));
									useRpg.getState().swapBag(from, index);
								} else if (token?.kind === "slot" || raw.startsWith("slot:")) {
									const slot = token?.kind === "slot" ? token.slot : raw.slice(5);
									useRpg.getState().placeEquip(slot, index);
								}
								setCarry(null);
							},
							children: locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kilit" }) : it ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemMark, { item: it }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "truncate",
								children: [displayName(it), it.count && it.count > 1 ? ` x${it.count}` : ""]
							})] }) : ""
						}, index);
					})
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 border-t border-border pt-2 text-right text-sm text-gold",
				children: [gold, " Altın"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11px] text-muted",
				children: "Sağ tık veya pencerenin dışına sürükle: yere at"
			}),
			tip ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				item: tip.item,
				x: tip.x,
				y: tip.y
			}) : null
		]
	});
}
var charSpot = {
	x: 16,
	y: -1
};
function Character() {
	const level = useRpg((s) => s.level);
	const xp = useRpg((s) => s.xp);
	const xpTo = useRpg((s) => s.xpTo);
	const unspent = useRpg((s) => s.unspent);
	const base = useRpg((s) => s.base);
	const invested = useRpg((s) => s.invested);
	const equipped = useRpg((s) => s.equipped);
	const skills = useRpg((s) => s.skills);
	const skillPoints = useRpg((s) => s.skillPoints);
	const chosenTree = useRpg((s) => s.chosenTree);
	const charTab = useRpg((s) => s.charTab);
	const quests = useRpg((s) => s.quests);
	const classId = useRpg((s) => s.classId);
	const totals = sumStats({
		base,
		invested,
		equipped,
		level,
		skills
	});
	const [pos, setPos] = (0, import_react.useState)(() => {
		if (charSpot.y < 0 && typeof window !== "undefined") charSpot.y = Math.max(72, Math.round(window.innerHeight * .5 - 170));
		return {
			x: charSpot.x,
			y: Math.max(72, charSpot.y)
		};
	});
	const drag = (0, import_react.useRef)(null);
	const move = (clientX, clientY) => {
		if (!drag.current) return;
		const next = {
			x: Math.max(8, Math.min(window.innerWidth - 280, clientX - drag.current.dx)),
			y: Math.max(8, Math.min(window.innerHeight - 80, clientY - drag.current.dy))
		};
		charSpot.x = next.x;
		charSpot.y = next.y;
		setPos(next);
	};
	const trees = CLASS_TREES[classId];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-ui": true,
		className: `hud-window pointer-events-auto absolute max-h-[80dvh] overflow-auto rounded-xl border border-border/80 bg-surface/95 p-3 text-fg ${charTab === "skills" ? "w-[min(44rem,96vw)]" : "w-[min(22rem,90vw)]"}`,
		style: {
			left: pos.x,
			top: pos.y
		},
		onPointerDown: (e) => e.stopPropagation(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex cursor-grab items-center justify-between active:cursor-grabbing",
				onPointerDown: (e) => {
					if (e.target.closest("button")) return;
					drag.current = {
						dx: e.clientX - pos.x,
						dy: e.clientY - pos.y
					};
					e.currentTarget.setPointerCapture(e.pointerId);
				},
				onPointerMove: (e) => move(e.clientX, e.clientY),
				onPointerUp: () => {
					drag.current = null;
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg text-gold",
					children: charTab === "stats" ? "Statü" : charTab === "skills" ? "Yetenek" : "Görevler"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-xs text-muted",
					onClick: () => useRpg.getState().closePanels(),
					children: "Kapat"
				})]
			}),
			charTab === "stats" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-3 text-xs text-muted",
				children: [
					className(classId),
					" · Sv. ",
					level,
					" · ",
					Math.floor(xp),
					"/",
					xpTo,
					" · Puan ",
					unspent
				]
			}) : charTab === "skills" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs text-muted",
				children: level < 5 ? "Yetenekler 5. seviyede açılır." : `Yetenek puanı ${skillPoints}`
			}) : null,
			charTab === "quests" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [quests.filter((quest) => !quest.claimed).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Köy Muhafızından görev al."
				}) : null, quests.filter((quest) => !quest.claimed).map((quest) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border bg-bg/70 px-2 py-1.5 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-gold",
							children: quest.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: quest.detail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: quest.done ? "Muhafıza dön, ödülü al" : `${Math.min(quest.have, quest.need)}/${quest.need}` })
					]
				}, quest.id))]
			}) : charTab === "skills" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 items-start gap-3",
				children: [trees.map((tree, index) => {
					const key = `${classId}:${index}`;
					if (chosenTree && chosenTree !== key) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-1 text-xs text-gold",
						children: [tree.name, chosenTree === key ? " · seçili" : ""]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-1",
						children: tree.skills.map((sk) => {
							const rank = skills[sk.id] ?? 0;
							const preview = skillPreview(sk.id, rank, totals);
							const tip = preview.buff ? `${sk.desc} Seviye ${skillTier(rank)}` : `${sk.desc} Hasar ${preview.dmg}. Sonraki ${preview.next}.`;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								draggable: rank > 0,
								title: tip,
								onDragStart: (e) => {
									e.dataTransfer.setData("text/plain", `skill:${sk.id}`);
									e.dataTransfer.effectAllowed = "copy";
								},
								className: "grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-md border border-border bg-bg/70 px-2 py-1.5 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillMark, { id: sk.id }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [sk.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-[10px] text-muted",
										children: tip
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
										className: "tabular-nums text-gold",
										children: skillTier(rank)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: level < 5 || skillPoints <= 0 || rank >= 32,
										className: "h-7 w-7 rounded-md border border-border text-gold disabled:opacity-30",
										onClick: () => useRpg.getState().learnSkill(sk.id),
										children: "+"
									})
								]
							}, sk.id);
						})
					})] }, tree.name);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "col-span-2 text-[11px] text-muted",
					children: "İlk + bir ağacı kilitler. Öğrenileni alt çubuğa sürükle."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-1.5",
				children: [
					"str",
					"mag",
					"hp",
					"ats",
					"mvs",
					"ctp"
				].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatMark, { stat: key }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg/90",
							children: STAT_LABEL[key].split(" (")[0]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
							className: "tabular-nums",
							children: totals[key]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: unspent <= 0,
							className: "h-7 w-7 rounded-md border border-border text-gold disabled:opacity-30",
							onClick: () => useRpg.getState().spend(key),
							children: "+"
						})
					]
				}, key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex gap-1 border-t border-border pt-2",
				children: [
					"stats",
					"skills",
					"quests"
				].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: charTab === tab ? "rounded-md border border-gold px-2 py-1 text-xs text-gold" : "rounded-md border border-border px-2 py-1 text-xs text-muted",
					onClick: () => useRpg.setState({
						charTab: tab,
						charOpen: true
					}),
					children: tab === "stats" ? "Statü" : tab === "skills" ? "Yetenekler" : "Görevler"
				}, tab))
			})
		]
	});
}
function SkillMark({ id }) {
	const n = id.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
	const hue = n % 360;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: "22",
		height: "22",
		viewBox: "0 0 22 22",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "1",
			y: "1",
			width: "20",
			height: "20",
			rx: "4",
			fill: `hsl(${hue} 28% 18%)`,
			stroke: `hsl(${hue} 42% 62%)`
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: n % 2 ? "M11 4 L16 16 L6 16 Z" : "M5 11 h12 M11 5 v12",
			stroke: `hsl(${hue} 55% 72%)`,
			strokeWidth: "1.6",
			fill: "none"
		})]
	});
}
function StatMark({ stat }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid h-6 w-6 place-items-center rounded-md border border-gold/50 text-[11px] text-gold",
		children: stat === "str" ? "⚔" : stat === "mag" ? "✶" : stat === "hp" ? "♥" : stat === "ats" ? "»" : stat === "mvs" ? "→" : "✦"
	});
}
function shopRows(kind, classId) {
	return CATALOG.filter((row) => {
		if (!("shop" in row) || row.shop !== kind) return false;
		if (kind === "weapon" && !weaponFits(classId, row.id)) return false;
		return true;
	});
}
var TABS = {
	weapon: [{
		id: "silah",
		label: "Sınıf silahı",
		test: () => true
	}],
	armor: [{
		id: "zirh",
		label: "Zırh",
		test: (_id, slot) => slot === "armor" || slot === "helmet" || slot === "boots" || slot === "gloves" || slot === "belt"
	}, {
		id: "taki",
		label: "Takı",
		test: (_id, slot) => slot === "earring" || slot === "necklace" || slot === "bracelet" || slot === "ring"
	}],
	market: [{
		id: "iksir",
		label: "İksir",
		test: (id) => id.startsWith("pot-")
	}, {
		id: "diger",
		label: "Diğer",
		test: (id) => !id.startsWith("pot-")
	}],
	stable: [{
		id: "binek",
		label: "Binek",
		test: () => true
	}],
	fisher: [{
		id: "olta",
		label: "Olta",
		test: () => true
	}],
	miner: [{
		id: "kazma",
		label: "Kazma",
		test: () => true
	}]
};
var SHOP_TITLE = {
	market: "Satıcı",
	armor: "Zırhçı",
	weapon: "Silahçı",
	stable: "Seyis",
	fisher: "Balıkçı",
	miner: "Madenci"
};
function TradeShop({ kind }) {
	const gold = useRpg((s) => s.gold);
	const classId = useRpg((s) => s.classId);
	const tabs = TABS[kind] ?? [];
	const [tab, setTab] = (0, import_react.useState)(tabs[0]?.id ?? "");
	const [tip, setTip] = (0, import_react.useState)(null);
	const current = tabs.find((row) => row.id === tab) ?? tabs[0];
	const rows = shopRows(kind, classId).filter((row) => !current || current.test(row.id, row.slot));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: SHOP_TITLE[kind] ?? "Dükkan",
		className: "w-[min(32rem,96vw)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-2 text-sm text-gold",
				children: [gold, " Altın"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 flex flex-wrap gap-1",
				children: tabs.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: tab === row.id ? "rounded-md border border-gold px-2 py-1 text-xs text-gold" : "rounded-md border border-border px-2 py-1 text-xs text-muted",
					onClick: () => setTab(row.id),
					children: row.label
				}, row.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex max-h-[50dvh] flex-col gap-2 overflow-auto",
				children: rows.map((row) => {
					const preview = {
						...row,
						uid: row.id,
						level: 1,
						plus: 0
					};
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-md border border-border bg-bg px-2 py-2 text-sm",
						onMouseEnter: (e) => setTip({
							item: preview,
							x: e.clientX,
							y: e.clientY
						}),
						onMouseMove: (e) => setTip({
							item: preview,
							x: e.clientX,
							y: e.clientY
						}),
						onMouseLeave: () => setTip(null),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemMark, { item: preview }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								row.name,
								" ",
								row.req ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: ["Sv.", row.req]
								}) : null
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-gold",
								children: [row.price, "g"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: gold < row.price,
								className: "rounded-md border border-border px-3 py-2 disabled:opacity-40",
								onClick: () => useRpg.getState().buy(row.id),
								children: "Al"
							})
						]
					}, row.id);
				})
			}),
			tip ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				item: tip.item,
				x: tip.x,
				y: tip.y
			}) : null
		]
	});
}
function DepotShop() {
	const bag = useRpg((s) => s.bag);
	const depot = useRpg((s) => s.depot);
	const stage = useRpg((s) => s.bagStage);
	const [page, setPage] = (0, import_react.useState)(0);
	const [tip, setTip] = (0, import_react.useState)(null);
	const open = openBagCount(stage);
	const start = page * 24;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: "Depo",
		className: "w-[min(40rem,96vw)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs text-muted",
				children: "Açık çantanı sürükle. Depo ayrı durur."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 flex gap-1",
				children: [
					0,
					1,
					2
				].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: n === page ? "rounded-md border border-gold px-2 py-1 text-xs text-gold" : "rounded-md border border-border px-2 py-1 text-xs",
					onClick: () => setPage(n),
					children: ["Pencere ", n + 1]
				}, n))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1 text-xs text-gold",
					children: "Çanta"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4 gap-1",
					children: Array.from({ length: 24 }, (_, i) => {
						const index = start + i;
						const item = index < open ? bag[index] ?? null : null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							draggable: !!item,
							className: "min-h-11 rounded-md border border-border bg-bg p-1 text-left text-[10px]",
							onDragStart: (e) => {
								if (!item) return;
								setCarry({
									kind: "bag",
									index
								});
								e.dataTransfer.setData("text/plain", `bag:${index}`);
							},
							onDragOver: (e) => e.preventDefault(),
							onDrop: (e) => {
								e.preventDefault();
								const raw = e.dataTransfer.getData("text/plain");
								if (raw.startsWith("depot:")) useRpg.getState().withdraw(Number(raw.slice(6)));
							},
							onClick: () => item && useRpg.getState().deposit(index),
							onMouseEnter: (e) => item && setTip({
								item,
								x: e.clientX,
								y: e.clientY
							}),
							onMouseLeave: () => setTip(null),
							children: index >= open ? "Kilit" : item ? `${displayName(item)}${item.count && item.count > 1 ? ` x${item.count}` : ""}` : ""
						}, index);
					})
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1 text-xs text-gold",
					children: "Depo"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4 gap-1",
					onDragOver: (e) => e.preventDefault(),
					children: depot.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						draggable: !!item,
						className: "min-h-11 rounded-md border border-border bg-bg p-1 text-left text-[10px]",
						onDragStart: (e) => {
							e.dataTransfer.setData("text/plain", `depot:${index}`);
						},
						onDragOver: (e) => e.preventDefault(),
						onDrop: (e) => {
							e.preventDefault();
							const token = readCarry();
							const raw = e.dataTransfer.getData("text/plain");
							const from = token?.kind === "bag" ? token.index : raw.startsWith("bag:") ? Number(raw.slice(4)) : -1;
							if (from >= 0) useRpg.getState().deposit(from);
						},
						onClick: () => item && useRpg.getState().withdraw(index),
						onMouseEnter: (e) => item && setTip({
							item,
							x: e.clientX,
							y: e.clientY
						}),
						onMouseLeave: () => setTip(null),
						children: item ? displayName(item) : ""
					}, index))
				})] })]
			}),
			tip ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				item: tip.item,
				x: tip.x,
				y: tip.y
			}) : null
		]
	});
}
function SmithShop() {
	const bag = useRpg((s) => s.bag);
	const gold = useRpg((s) => s.gold);
	const itemAt = useRpg((s) => s.smithItem);
	const stoneAt = useRpg((s) => s.smithStone);
	const item = itemAt == null ? null : bag[itemAt] ?? null;
	const stone = stoneAt == null ? null : bag[stoneAt] ?? null;
	const cost = item && item.plus < 10 ? ENHANCE[item.plus] ?? 1550 : 0;
	const need = item ? item.plus + 1 : 1;
	const take = (which, raw) => {
		if (!raw.startsWith("bag:")) return;
		useRpg.getState().setSmith(which, Number(raw.slice(4)));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: "Demirci",
		className: "w-[min(32rem,96vw)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-2 text-sm text-gold",
				children: [gold, " Altın"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs text-muted",
				children: "Envanterden sürükle. Giyili eşya burada listelenmez."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmithSlot, {
						title: "+ Basılacak",
						item,
						onDrop: (raw) => take("item", raw)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-gold",
						children: "+"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmithSlot, {
						title: "+ Taşı",
						item: stone,
						onDrop: (raw) => take("stone", raw)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-gold",
						children: "="
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-gold/50 bg-bg p-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: "Sonuç"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: item ? `${item.name} +${Math.min(10, item.plus + 1)}` : "—" })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted",
				children: [
					"Gerekli: Güç Taşı x",
					need,
					" ve ",
					cost || "—",
					" altın"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-2 rounded-md border border-gold px-3 py-2 text-sm text-gold",
				onClick: () => useRpg.getState().forge(),
				children: "İşle"
			})
		]
	});
}
function SmithSlot({ title, item, onDrop }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-16 rounded-md border border-dashed border-border bg-bg p-2 text-xs",
		onDragOver: (e) => e.preventDefault(),
		onDrop: (e) => {
			e.preventDefault();
			onDrop(e.dataTransfer.getData("text/plain"));
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: item ? `${displayName(item)}${item.count ? ` x${item.count}` : ""}` : "Boş" })]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	const [Scene, setScene] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		import("./VillageScene-DFcguDUF.mjs").then((mod) => setScene(() => mod.VillageScene));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg",
		children: [Scene ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scene, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "grid h-full place-items-center text-muted",
			children: "Dünya hazırlanıyor"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay, {})]
	});
}
//#endregion
export { presence as C, takeRemoteHits as S, sendReward as _, subscribeGfx as a, takeLoot as b, sendDuelHit as c, amHost as d, emitHit as f, pushMobState as g, placeLoot as h, readGfx as i, setSelection as l, fieldMobs as m, autoQuality as n, chatBubbles as o, fieldLoot as p, loadGfx as r, readTarget as s, routes_exports as t, takePick as u, setLootHint as v, remotes as w, takePendingDrops as x, shareXp as y };
