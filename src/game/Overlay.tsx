import { useEffect, useRef, useState, useSyncExternalStore, type DragEvent, type MouseEvent, type ReactNode } from "react";
import { bindControlsTest, input, readSim } from "@/game/input";
import { useHud } from "@/game/hudStore";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AuthScreens, CharacterScreens, leaveToCharacters } from "@/game/AccountScreens";
import { NetLive } from "@/game/NetLive";
import { answerDuel, answerSocial, addTradeItem, blockMate, closeTrade, endDuel, leaveParty, offerDuel, offerSocial, queuePick, removeFriend, setTradeOk, subscribeTarget, targetSnapshot } from "@/game/target";
import { chatFocused, chatSnapshot, sendChat, sendWhisper, setChatFocus, setWhisper, subscribeChat, whisperTarget } from "@/game/chat";
import { lootHint, queueGroundDrop, subscribeField, takeNearLoot } from "@/game/field";
import { captureSave, readCarry, setCarry } from "@/game/rpg";
import { saveCharacter } from "@/game/account";
import { useSession } from "@/game/session";
import { CATALOG, CLASS_TREES, className, displayName, ENHANCE, itemStats, MENTORS, openBagCount, PAGE_SIZE, SKILL_MAX, skillCdLeft, skillPreview, skillTier, SLOT_LABEL, STAT_LABEL, sumStats, useRpg, weaponFits, type CharTab, type EquipSlot, type Item, type ShopKind, type StatKey } from "@/game/rpg";
import { signOut } from "@/lib/auth/client";
import { loadGfx, readGfx, subscribeGfx, writeGfx } from "@/game/settings";
import { HOUSES, MAP_MARKS } from "@/game/world";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

const MOVE_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

function pocket(item: Item) {
  const bag = useRpg.getState().bag.slice();
  const hole = bag.findIndex((slot) => slot == null);
  if (hole < 0) {
    queueGroundDrop(item);
    useRpg.setState({ toast: "Çanta dolu" });
    return;
  }
  bag[hole] = item;
  useRpg.setState({ bag, toast: `${item.name} alındı` });
}

function dropBag(index: number) {
  const state = useRpg.getState();
  const item = state.bag[index];
  if (!item || item.id === "starter-chest") {
    useRpg.setState({ toast: item ? "Sandık yere atılmaz" : "" });
    return;
  }
  const bag = state.bag.slice();
  bag[index] = null;
  useRpg.setState({ bag, toast: `${item.name} yere bırakıldı` });
  queueGroundDrop(item);
}

function clearMove() {
  for (const code of MOVE_KEYS) input.keys.delete(code);
  input.keys.delete("Space");
}

function useHandLayout() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(
      "(orientation: landscape) and (pointer: coarse), (orientation: landscape) and (max-height: 520px) and (max-width: 1100px)",
    );
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

let bootPlayed = false;

function BootScreen({
  done,
  sessionWaiting,
  sceneReady,
  worldReady,
}: {
  done: boolean;
  sessionWaiting: boolean;
  sceneReady: boolean;
  worldReady: boolean;
}) {
  const pctRef = useRef(8);
  const [pct, setPct] = useState(8);
  const [gone, setGone] = useState(bootPlayed);
  useEffect(() => {
    if (bootPlayed) return;
    let raf = 0;
    const tick = () => {
      const goal = done ? 100 : sessionWaiting ? 30 : !sceneReady ? 54 : !worldReady ? 76 : 92;
      const gap = goal - pctRef.current;
      if (gap > 0.2) pctRef.current = Math.min(goal, pctRef.current + Math.max(0.22, gap * 0.08));
      if (done) pctRef.current = Math.min(100, pctRef.current + 1.8);
      if (done && pctRef.current > 99.2) pctRef.current = 100;
      setPct(pctRef.current);
      if (pctRef.current >= 100) {
        bootPlayed = true;
        window.setTimeout(() => setGone(true), 180);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done, sceneReady, sessionWaiting, worldReady]);
  if (gone) return null;
  const shown = Math.min(100, Math.round(pct));
  return (
    <div className="absolute inset-0 z-50 bg-black" data-ui>
      <img src="/boot.jpg" alt="Abis Sonsuz Gece" className="h-full w-full object-cover object-center" />
      <div className="absolute inset-x-0 bottom-[12%] flex flex-col items-center px-6">
        <p className="mb-1.5 text-[13px] font-semibold tracking-wide text-[#e7fdff]" style={{ textShadow: "0 0 10px #4df0ff" }}>
          {shown}%
        </p>
        <div className="h-3.5 w-[min(28rem,70vw)] overflow-hidden rounded-full border-2 border-[#3ad4e4] bg-black/75 p-px shadow-[0_0_18px_rgba(58,220,235,0.55)]">
          <div
            className="h-full rounded-full transition-[width] duration-100"
            style={{
              width: `${shown}%`,
              background: "linear-gradient(90deg, #042f38 0%, #0c7f92 38%, #5eebf8 82%, #ffffff 100%)",
              boxShadow: "0 0 14px #6df6ff",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function Overlay({ sceneReady = false }: { sceneReady?: boolean }) {
  const playing = useHud((s) => s.playing);
  const zone = useHud((s) => s.zone);
  const { user, isPending } = useCurrentUserState();
  const [sessionSlow, setSessionSlow] = useState(false);
  useEffect(() => {
    if (!isPending) {
      setSessionSlow(false);
      return;
    }
    const id = window.setTimeout(() => setSessionSlow(true), 2500);
    return () => window.clearTimeout(id);
  }, [isPending]);
  const ready = useHud((s) => s.ready);
  const sessionWaiting = isPending && !sessionSlow;
  const bootDone = !sessionWaiting && sceneReady && ready;
  const activeId = useSession((s) => s.activeId);
  const nick = useRpg((s) => s.nick);
  const [mapOpen, setMapOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [questHud, setQuestHud] = useState(true);
  const [menu, setMenu] = useState<null | "root" | "opts">(null);
  const menuRef = useRef(menu);
  const friendsRef = useRef(false);
  menuRef.current = menu;
  friendsRef.current = friendsOpen;
  const drag = useRef<{ x: number; y: number } | null>(null);
  const lookPtr = useRef<number | null>(null);
  const lookBtn = useRef(0);
  const moved = useRef(0);
  const joy = useRef<{ id: number; ox: number; oy: number } | null>(null);
  const knob = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing || !activeId) return;
    const save = () => {
      void saveCharacter({ data: { id: activeId, save: captureSave() } }).catch(() => undefined);
    };
    const id = window.setInterval(save, 4000);
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

  useEffect(() => {
    bindControlsTest();
    const down = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (typing) {
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
    const up = (e: KeyboardEvent) => {
      input.keys.delete(e.code);
    };
    const blur = () => {
      input.keys.clear();
      input.joyX = 0;
      input.joyY = 0;
      input.look = false;
      input.sprint = false;
    };
    const blockMenu = (e: Event) => e.preventDefault();
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

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!playing) return;
    if ((e.target as HTMLElement).closest("[data-joy], [data-ui]")) return;
    const mouseLook = e.pointerType !== "touch" && e.button === 2;
    const touchLook = e.pointerType === "touch";
    if (!mouseLook && !touchLook) return;
    lookPtr.current = e.pointerId;
    lookBtn.current = e.button;
    moved.current = 0;
    drag.current = { x: e.clientX, y: e.clientY };
    input.look = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || lookPtr.current !== e.pointerId) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    moved.current += Math.hypot(dx, dy);
    drag.current = { x: e.clientX, y: e.clientY };
    if (moved.current < 12) return;
    input.look = true;
    input.orbit -= dx * 0.0048;
    input.pitch = clamp(input.pitch + dy * 0.0032, 0.18, 1.15);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (lookPtr.current !== null && e.pointerId !== lookPtr.current) return;
    const started = lookPtr.current === e.pointerId;
    const click = started && lookBtn.current === 2 && moved.current < 8;
    const tapped = started && e.pointerType === "touch" && moved.current < 12;
    lookPtr.current = null;
    drag.current = null;
    input.look = false;
    if ((click || tapped) && useHud.getState().playing) queuePick(e.clientX, e.clientY);
  };
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!playing) return;
    input.dist = clamp(input.dist + e.deltaY * 0.004, 3.8, 10);
  };

  const joyDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    joy.current = { id: e.pointerId, ox: rect.left + rect.width / 2, oy: rect.top + rect.height / 2 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const joyMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!joy.current || joy.current.id !== e.pointerId) return;
    const dx = (e.clientX - joy.current.ox) / 34;
    const dy = (e.clientY - joy.current.oy) / 34;
    let x = clamp(dx, -1, 1);
    let y = clamp(-dy, -1, 1);
    const mag = Math.hypot(x, y);
    if (mag < 0.16) {
      x = 0;
      y = 0;
    } else {
      const scale = Math.min(1, (mag - 0.16) / (0.84 * Math.max(mag, 0.001)));
      x *= scale;
      y *= scale;
    }
    input.joyX = x;
    input.joyY = y;
    input.sprint = y > 0.82;
    e.currentTarget.classList.toggle("is-run", y > 0.82);
    if (knob.current) {
      knob.current.style.transform = `translate(${x * 20}px, ${-y * 20}px)`;
    }
  };
  const joyUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    joy.current = null;
    input.joyX = 0;
    input.joyY = 0;
    input.sprint = false;
    e.currentTarget.classList.remove("is-run");
    if (knob.current) knob.current.style.transform = "translate(0px, 0px)";
  };

  return (
    <div
      className="absolute inset-0 touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      <PortraitLock />
      {!playing ? <BootScreen done={bootDone} sessionWaiting={sessionWaiting} sceneReady={sceneReady} worldReady={ready} /> : null}
      {playing && activeId ? <NetLive nick={nick} /> : null}
      {playing ? (
        <div className="pointer-events-none absolute inset-0">
          <Vitals />
          <PartyWindow />
          <WorldMap zone={zone} big={mapOpen} onToggle={() => setMapOpen((open) => !open)} />
          {friendsOpen ? <FriendsWindow onClose={() => setFriendsOpen(false)} /> : null}
          <div id="mob-bars" className="pointer-events-none absolute inset-0" />
          <div id="chat-bubbles" className="pointer-events-none absolute inset-0" />
          <div
            id="nameplate"
            className="pointer-events-none absolute hidden -translate-x-1/2 -translate-y-full whitespace-nowrap text-center text-sm font-medium text-fg"
            style={{ textShadow: "0 1px 2px #1c1916" }}
          />
          <Prompt />
          <QuestTracker open={questHud} />
          <Toast />
          <div id="combat-floats" className="pointer-events-none absolute inset-0" />
          <Hurt />
        </div>
      ) : (
        <div className="absolute inset-0 grid place-items-center overflow-auto bg-bg/55 px-4 py-6 touch-pan-y">
          {sessionWaiting ? null : !user ? (
            <AuthScreens />
          ) : (
            <CharacterScreens />
          )}
        </div>
      )}

      {playing ? (
        <>
          <button
            type="button"
            data-ui
            className="hud-char absolute top-4 right-4 z-30 rounded-md border border-border bg-surface/90 px-3 py-2 text-sm text-fg"
            onClick={() => setMenu((open) => (open ? null : "root"))}
          >
            Ayarlar
          </button>
          {menu && !friendsOpen ? <SettingsMenu mode={menu} onMode={setMenu} onClose={() => setMenu(null)} onFriends={() => setFriendsOpen(true)} /> : null}
          <SelectBar />
          <SocialHud />
          <WhisperDock />
          <QuickButtons />
          <Panels />
          <div className="phone-dock">
            <div
              data-joy
              className="joy-stick hand-only absolute h-28 w-28 rounded-full border border-border bg-surface/80"
              onPointerDown={joyDown}
              onPointerMove={joyMove}
              onPointerUp={joyUp}
              onPointerCancel={joyUp}
            >
              <span className="joy-ring" aria-hidden="true" />
              <span className="joy-mark" aria-hidden="true">
                koş
              </span>
              <div ref={knob} className="joy-knob absolute top-8 left-8 h-12 w-12 rounded-full bg-primary" />
            </div>
            <div className="phone-dock-mid">
              <ChatDock />
              <Hotbar />
            </div>
            <TouchCluster />
          </div>
        </>
      ) : null}
    </div>
  );
}

function PortraitLock() {
  const [note, setNote] = useState("");
  const lockLandscape = async () => {
    setNote("");
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      const orientation = screen.orientation as ScreenOrientation & { lock?: (mode: string) => Promise<void> };
      if (!orientation?.lock) throw new Error("no-lock");
      await orientation.lock("landscape");
    } catch {
      setNote("Bu ekran kendi kendine dönmez. Telefonu yan tutman yeterli.");
    }
  };
  return (
    <div
      className="portrait-gate pointer-events-auto absolute inset-0 z-[80] flex-col items-center justify-center gap-4 bg-bg px-6 text-center"
      role="dialog"
      aria-label="Telefonu yatay çevir"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <span className="phone-turn" aria-hidden="true" />
      <h1 className="font-display text-2xl text-gold">Telefonu yatay çevir</h1>
      <p className="max-w-xs text-sm text-muted">Dikeyde oynanmaz. Yan çevirince çubuk, vuruş ve menüler birbirinin üstüne binmeden yerleşir.</p>
      <button type="button" className="rounded-md border border-gold bg-surface px-4 py-2 text-sm text-gold" onClick={() => void lockLandscape()}>
        Yatay kilitle
      </button>
      {note ? <p className="max-w-xs text-xs text-muted">{note}</p> : null}
    </div>
  );
}

function TouchCluster() {
  return (
    <div className="hand-cluster" data-ui>
      <button
        type="button"
        data-ui
        className="hand-hit grid place-items-center rounded-full border border-gold bg-surface/95 text-[11px] font-medium text-gold"
        onPointerDown={(e) => {
          e.stopPropagation();
          input.keys.add("Space");
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          input.keys.delete("Space");
        }}
        onPointerCancel={() => input.keys.delete("Space")}
      >
        Vur
      </button>
    </div>
  );
}

function Bar({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div className="grid grid-cols-[2.4rem_1fr_3.2rem] items-center gap-2">
      <span className="text-xs tracking-wide text-muted">{label}</span>
      <span className="h-2 overflow-hidden rounded-sm border border-border bg-bg">
        <span className={`block h-full ${tone}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="text-right text-xs text-fg">
        {Math.ceil(value)}/{Math.ceil(max)}
      </span>
    </div>
  );
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
  const [xpTip, setXpTip] = useState(false);
  const progress = (xp / Math.max(1, xpTo)) * 4;
  const pct = Math.round((xp / Math.max(1, xpTo)) * 100);
  return (
    <div
      className="hud-vitals pointer-events-auto absolute bottom-36 left-4 z-20 w-[min(18rem,72vw)] md:bottom-4"
      data-xp={Math.floor(xp)}
      data-xp-to={xpTo}
      onPointerEnter={() => setXpTip(true)}
      onPointerLeave={() => setXpTip(false)}
    >
      <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface/90 p-2">
        <Bar label="CAN" value={hp} max={hpMax} tone="bg-hp" />
        <Bar label="MANA" value={mana} max={manaMax} tone="bg-mp" />
        <Bar label="STA" value={sta} max={staMax} tone="bg-sta" />
        <div className="relative mt-1 flex gap-1" onMouseEnter={() => setXpTip(true)} onMouseLeave={() => setXpTip(false)}>
          {[0, 1, 2, 3].map((i) => (
            <Orb key={i} fill={progress - i} />
          ))}
          {xpTip ? (
            <span className="absolute -top-7 left-0 rounded-md border border-gold bg-bg px-2 py-0.5 text-[11px] text-gold">
              {pct}% · {Math.floor(xp)}/{xpTo}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Orb({ fill }: { fill: number }) {
  const amount = Math.max(0, Math.min(1, fill));
  return (
    <div className="relative h-7 w-7" data-fill={amount.toFixed(3)} aria-hidden="true">
      <div className="absolute inset-0 overflow-hidden rounded-full border-2 border-[#c9a15b] bg-[#100e0c]">
        <div className="absolute inset-x-0 bottom-0 bg-[#e2b45a]" style={{ height: `${amount * 100}%` }} />
      </div>
    </div>
  );
}

function SelectBar() {
  const snap = useSyncExternalStore(subscribeTarget, targetSnapshot, targetSnapshot);
  const nick = useRpg((s) => s.nick);
  const level = useRpg((s) => s.level);
  const { sel, duel } = snap;
  if (duel.phase === "in") {
    return (
      <div data-ui className="pointer-events-auto absolute top-16 left-1/2 z-20 w-[min(18rem,90vw)] -translate-x-1/2 rounded-lg border border-gold/70 bg-surface/95 p-3 text-center">
        <p className="text-xs tracking-widest text-gold">VS</p>
        <p className="mt-1 text-sm text-fg">
          {duel.nick} · Sv.{duel.level} düello istiyor
        </p>
        <div className="mt-2 flex justify-center gap-2">
          <button type="button" className="rounded-md border border-gold bg-bg px-3 py-1.5 text-sm text-gold" onClick={() => answerDuel(true, nick, level)}>
            Kabul
          </button>
          <button type="button" className="rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-fg" onClick={() => answerDuel(false, nick, level)}>
            Reddet
          </button>
        </div>
      </div>
    );
  }
  if (duel.phase !== "live" && duel.phase !== "sent") return null;
  const label = sel ? (sel.kind === "mob" ? sel.name : `${sel.nick} · Sv.${sel.level}`) : `${duel.nick} · Sv.${duel.level}`;
  const vs = duel.phase === "live" ? "VS" : "Teklif gitti";
  return (
    <div data-ui className="pointer-events-auto absolute top-16 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border bg-surface/95 px-3 py-2">
      <span className="text-xs tracking-widest text-gold">{vs}</span>
      <span className="text-sm text-fg">{label}</span>
      <button type="button" className="rounded-md border border-border bg-bg px-2 py-1 text-xs text-muted" onClick={() => endDuel(nick, level)}>
        Bırak
      </button>
    </div>
  );
}

function SocialHud() {
  const snap = useSyncExternalStore(subscribeTarget, targetSnapshot, targetSnapshot);
  const { sel, duel, social } = snap;
  if (social.phase === "in") {
    const title = social.act === "trade" ? "Ticaret" : social.act === "friend" ? "Dost" : "Grup";
    return (
      <div data-ui className="pointer-events-auto absolute top-16 left-1/2 z-20 w-[min(18rem,90vw)] -translate-x-1/2 rounded-lg border border-border bg-surface/95 p-3 text-center">
        <p className="text-xs tracking-widest text-gold">{title}</p>
        <p className="mt-1 text-sm text-fg">{social.nick} teklif ediyor</p>
        <div className="mt-2 flex justify-center gap-2">
          <button type="button" className="rounded-md border border-gold bg-bg px-3 py-1.5 text-sm text-gold" onClick={() => answerSocial(true)}>
            Kabul
          </button>
          <button type="button" className="rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-fg" onClick={() => answerSocial(false)}>
            Reddet
          </button>
        </div>
      </div>
    );
  }
  if (social.phase === "live" && social.act === "trade") {
    const trade = snap.trade;
    const cell = (item: Item | null) => (
      <div className="flex min-h-12 items-center rounded-md border border-border bg-bg/80 px-2 text-xs text-fg">
        {item ? displayName(item) : <span className="text-muted">Boş</span>}
      </div>
    );
    return (
      <div
        data-ui
        className="hud-window pointer-events-auto absolute top-20 left-1/2 z-30 w-[min(40rem,96vw)] -translate-x-1/2 rounded-xl border border-border bg-surface/95 p-3"
        onPointerDown={(e) => e.stopPropagation()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const raw = e.dataTransfer.getData("text/plain");
          if (raw.startsWith("bag:")) addTradeItem(Number(raw.slice(4)));
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-gold">Ticaret · {social.nick}</p>
          <button type="button" className="text-xs text-muted" onClick={() => closeTrade()}>
            Kapat
          </button>
        </div>
        <p className="mb-2 text-[11px] text-muted">Envanterden eşyayı kendi pencerenin üstüne sürükle. İki taraf da kabul edince takas olur.</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-xs text-gold">Sen</p>
            <div className="flex flex-col gap-1">
              {trade.mine.length === 0 ? cell(null) : trade.mine.map((item) => <div key={item.uid}>{cell(item)}</div>)}
            </div>
            <button
              type="button"
              className={trade.mineOk ? "mt-2 w-full rounded-md border border-gold bg-gold/15 px-2 py-1.5 text-sm text-gold" : "mt-2 w-full rounded-md border border-border px-2 py-1.5 text-sm"}
              onClick={() => setTradeOk(!trade.mineOk)}
            >
              {trade.mineOk ? "Kabul edildi" : "Kabul"}
            </button>
          </div>
          <div>
            <p className="mb-1 text-xs text-gold">{social.nick}</p>
            <div className="flex flex-col gap-1">
              {trade.theirs.length === 0 ? cell(null) : trade.theirs.map((item) => <div key={item.uid}>{cell(item)}</div>)}
            </div>
            <p className="mt-2 rounded-md border border-border px-2 py-1.5 text-center text-sm text-muted">{trade.theirsOk ? "Kabul etti" : "Bekliyor"}</p>
          </div>
        </div>
      </div>
    );
  }
  if (duel.phase === "in" || duel.phase === "live" || social.phase === "sent") return null;
  if (!sel || sel.kind !== "player") return null;
  const known = snap.friends.some((mate) => mate.id === sel.id);
  const grouped = snap.party.some((mate) => mate.id === sel.id);
  const act = (label: string, run: () => void, off = false) => (
    <button type="button" disabled={off} className="rounded-md px-2.5 py-1.5 text-sm text-fg hover:bg-bg disabled:cursor-default disabled:opacity-35" onClick={run}>
      {label}
    </button>
  );
  return (
    <div data-ui className="hud-target pointer-events-auto absolute top-16 left-1/2 z-40 flex max-w-[96vw] -translate-x-1/2 flex-wrap items-center justify-center gap-0.5 rounded-lg border border-border bg-surface/95 px-1 py-1">
      <span className="px-2 text-xs text-gold">{sel.nick}</span>
      <button
        type="button"
        disabled={known}
        className={known ? "rounded-md border border-border px-2.5 py-1.5 text-sm text-muted opacity-50" : "hud-friend rounded-md border border-gold bg-gold/15 px-2.5 py-1.5 text-sm text-gold"}
        onClick={() => offerSocial("friend")}
      >
        {known ? "Dostun" : "Dost ekle"}
      </button>
      {act(grouped ? "Grupta" : "Grup", () => offerSocial("party"), grouped)}
      {act("Ticaret", () => offerSocial("trade"))}
      {act("Düello", () => offerDuel(useRpg.getState().nick, useRpg.getState().level))}
      {act("Fısıltı", () => setWhisper({ id: sel.id, nick: sel.nick }))}
    </div>
  );
}

function ChatDock() {
  const lines = useSyncExternalStore(subscribeChat, chatSnapshot, chatSnapshot);
  const box = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const open = chatFocused();
  useEffect(() => {
    if (open) box.current?.focus();
  }, [open]);
  if (!open) return null;
  const recent = lines.filter((line) => !line.whisper).slice(-4);
  return (
    <div data-ui className="hud-chat pointer-events-auto absolute bottom-28 left-1/2 z-20 w-[min(28rem,78vw)] -translate-x-1/2 md:bottom-24" onPointerDown={(e) => e.stopPropagation()}>
      {recent.length > 0 ? (
        <div className="chat-log mb-1 max-h-24 overflow-hidden rounded-md bg-bg/75 px-2 py-1.5">
          {recent.map((line) => (
            <p key={line.id} className="truncate text-xs text-fg">
              <span className="text-muted">{line.nick}: </span>
              {line.text}
            </p>
          ))}
        </div>
      ) : null}
      <form
        className="flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          sendChat(draft);
          setDraft("");
          setChatFocus(false);
          box.current?.blur();
        }}
      >
        <input
          ref={box}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => {
            clearMove();
            setChatFocus(true);
          }}
          placeholder="Mesaj"
          maxLength={80}
          className="min-w-0 flex-1 rounded-md border border-border bg-bg/95 px-2 py-1.5 text-sm text-fg outline-none"
        />
        <button type="submit" className="rounded-md border border-border bg-surface px-2 text-sm text-gold">
          Yaz
        </button>
      </form>
    </div>
  );
}

function WhisperDock() {
  const to = whisperTarget();
  const lines = useSyncExternalStore(subscribeChat, chatSnapshot, chatSnapshot);
  const box = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [pos, setPos] = useState({ x: 48, y: 96 });
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  if (!to) return null;
  const recent = lines.filter((line) => line.whisper).slice(-12);
  return (
    <div
      data-ui
      className="hud-window hud-whisper pointer-events-auto absolute z-30 w-[min(36rem,94vw)] rounded-xl border border-gold/40 bg-surface/95 p-3 shadow-lg"
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className="mb-2 flex cursor-grab items-center justify-between active:cursor-grabbing"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button,input")) return;
          drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setPos({
            x: Math.max(8, e.clientX - drag.current.dx),
            y: Math.max(8, e.clientY - drag.current.dy),
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        <p className="text-sm text-gold">Fısıltı · {to.nick}</p>
        <button type="button" className="text-xs text-muted" onClick={() => setWhisper(null)}>
          Kapat
        </button>
      </div>
      <div className="mb-2 max-h-48 space-y-1 overflow-auto">
        {recent.length === 0 ? <p className="text-xs text-muted">Henüz fısıltı yok</p> : null}
        {recent.map((line) => (
          <p key={line.id} className="text-sm text-fg">
            <span className="text-gold">{line.nick}: </span>
            {line.text}
          </p>
        ))}
      </div>
      <form
        className="flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          sendWhisper(draft);
          setDraft("");
        }}
      >
        <input
          value={draft}
          ref={box}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={clearMove}
          placeholder="Fısıltı yaz"
          maxLength={120}
          className="min-w-0 flex-1 rounded-md border border-border bg-bg px-2 py-2 text-sm text-fg outline-none"
        />
        <button type="submit" className="rounded-md border border-border px-3 text-sm text-gold">
          Gönder
        </button>
      </form>
    </div>
  );
}

function Hotbar() {
  const hotbar = useRpg((s) => s.hotbar);
  const skills = useRpg((s) => s.skills);
  const classId = useRpg((s) => s.classId);
  const base = useRpg((s) => s.base);
  const invested = useRpg((s) => s.invested);
  const equipped = useRpg((s) => s.equipped);
  const level = useRpg((s) => s.level);
  const totals = sumStats({ base, invested, equipped, level, skills });
  const [tip, setTip] = useState<{ id: string; x: number; y: number } | null>(null);
  const names = new Map(CLASS_TREES[classId].flatMap((tree) => tree.skills.map((sk) => [sk.id, sk] as const)));
  const shown = tip ? names.get(tip.id) : undefined;
  const preview = tip ? skillPreview(tip.id, skills[tip.id] ?? 0, totals) : null;
  return (
    <div data-ui className="hud-hotbar pointer-events-auto absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 gap-1 md:bottom-3" onPointerDown={(e) => e.stopPropagation()}>
      {hotbar.map((id, index) => (
        <button
          key={index}
          type="button"
          className="relative grid h-12 w-12 place-items-center rounded-md border border-border bg-surface/95"
          onClick={() => id && useRpg.getState().castSkill(id)}
          onMouseEnter={(e) => id && setTip({ id, x: e.clientX, y: e.clientY })}
          onMouseMove={(e) => id && setTip({ id, x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setTip(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            useRpg.getState().setHotbar(index, null);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const raw = e.dataTransfer.getData("text/plain");
            if (raw.startsWith("skill:")) useRpg.getState().setHotbar(index, raw.slice(6));
          }}
        >
          <span className="absolute top-0.5 left-1 text-[9px] text-muted">{index + 1}</span>
          {id ? <SkillMark id={id} /> : null}
        </button>
      ))}
      {shown && preview && tip ? (
        <div className="pointer-events-none absolute bottom-14 left-1/2 z-30 w-56 -translate-x-1/2 rounded-md border border-border bg-surface/95 p-2 text-left text-xs text-fg shadow-lg">
          <p className="text-gold">{shown.name}</p>
          <p className="mt-1 text-muted">{shown.desc}</p>
          <p className="mt-1">{preview.buff ? "Hasar yok" : `Hasar ${preview.dmg}`}</p>
          <p className="text-muted">Seviye {skillTier(skills[tip.id] ?? 0)} · {skillCdLeft(tip.id) > 0.05 ? `${skillCdLeft(tip.id).toFixed(1)} sn` : "Hazır"}</p>
        </div>
      ) : null}
    </div>
  );
}

function QuickButtons() {
  const unspent = useRpg((s) => s.unspent);
  const points = useRpg((s) => s.skillPoints);
  return (
    <>
      {unspent > 0 ? (
        <button type="button" data-ui className="hud-plus left-4" onClick={() => useRpg.getState().showChar("stats")}>
          <b>+</b>
          <span>Statü Geliştir</span>
        </button>
      ) : null}
      {points > 0 ? (
        <button type="button" data-ui className="hud-plus right-4" onClick={() => useRpg.getState().showChar("skills")}>
          <b>+</b>
          <span>Beceri Geliştir</span>
        </button>
      ) : null}
    </>
  );
}

function QuestTracker({ open }: { open: boolean }) {
  const quests = useRpg((s) => s.quests);
  const active = quests.filter((quest) => !quest.claimed);
  if (!open) return null;
  return (
    <div className="hud-quests pointer-events-none absolute top-[42%] right-4 z-10 w-[min(14rem,34vw)] -translate-y-1/2 rounded-md border border-border bg-surface/80 px-3 py-2">
      <p className="text-[10px] tracking-widest text-gold">Görevler</p>
      {active.length === 0 ? <p className="mt-1 text-[11px] text-muted">Görev yok</p> : null}
      {active.map((quest) => (
        <div key={quest.id} className="mt-1.5">
          <p className="text-xs text-fg">{quest.title}</p>
          <p className="text-[11px] text-muted">{quest.done ? "Ödül için muhafıza dön" : `${Math.min(quest.have, quest.need)}/${quest.need}`}</p>
        </div>
      ))}
    </div>
  );
}

function SettingsMenu({ mode, onMode, onClose, onFriends }: { mode: "root" | "opts"; onMode: (mode: "root" | "opts") => void; onClose: () => void; onFriends: () => void }) {
  const gfx = useSyncExternalStore(subscribeGfx, readGfx, readGfx);
  const panelOpen = useRpg((s) => s.charOpen || s.invOpen || Boolean(s.shop));
  useEffect(() => {
    loadGfx();
  }, []);
  if (panelOpen) return null;
  const go = (run: () => void) => {
    onClose();
    run();
  };
  return (
    <div data-ui className="hud-window pointer-events-auto absolute top-1/2 left-1/2 z-50 w-[min(18rem,86vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface/95 p-3" onPointerDown={(e) => e.stopPropagation()}>
      {mode === "root" ? (
        <div className="flex flex-col gap-1.5">
          <p className="mb-1 text-xs tracking-widest text-gold">Ayarlar</p>
          <button type="button" className="rounded-md border border-border px-3 py-2 text-left text-sm" onClick={() => go(() => useRpg.getState().showChar("stats"))}>
            Statü
          </button>
          <button type="button" className="rounded-md border border-border px-3 py-2 text-left text-sm" onClick={() => go(() => useRpg.getState().showChar("skills"))}>
            Yetenek
          </button>
          <button type="button" className="rounded-md border border-border px-3 py-2 text-left text-sm" onClick={() => go(() => useRpg.getState().toggleInv())}>
            Çanta
          </button>
          <button type="button" className="rounded-md border border-border px-3 py-2 text-left text-sm" onClick={() => go(onFriends)}>
            Dostlar
          </button>
          <button type="button" className="rounded-md border border-border px-3 py-2 text-left text-sm" onClick={() => onMode("opts")}>
            Oyun Seçenekleri
          </button>
          <button type="button" className="rounded-md border border-border px-3 py-2 text-left text-sm" onClick={() => go(() => leaveToCharacters())}>
            Karakter Değişikliği
          </button>
          <button type="button" className="rounded-md border border-border px-3 py-2 text-left text-sm" onClick={() => go(() => void signOut("/"))}>
            Çıkış
          </button>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-2 text-left text-sm"
            onClick={() =>
              go(() => {
                window.close();
                useRpg.setState({ toast: "Sekme kapanmazsa tarayıcıdan kapat" });
              })
            }
          >
            Oyun Sonu
          </button>
          <button type="button" className="rounded-md border border-gold px-3 py-2 text-left text-sm text-gold" onClick={onClose}>
            İptal
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-xs tracking-widest text-gold">Oyun Seçenekleri</p>
          <label className="flex items-center justify-between gap-2">
            FPS
            <select className="rounded-md border border-border bg-bg px-2 py-1" value={gfx.fps} onChange={(e) => writeGfx({ fps: Number(e.target.value) })}>
              <option value={30}>30</option>
              <option value={60}>60</option>
              <option value={120}>120</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-2">
            Görüntü
            <select className="rounded-md border border-border bg-bg px-2 py-1" value={gfx.quality} onChange={(e) => writeGfx({ quality: Number(e.target.value), auto: false })}>
              <option value={0.7}>Düşük</option>
              <option value={1}>Orta</option>
              <option value={1.25}>Yüksek</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-2">
            Otomatik grafik
            <input type="checkbox" checked={gfx.auto} onChange={(e) => writeGfx({ auto: e.target.checked })} />
          </label>
          <label className="flex items-center justify-between gap-2">
            Ses
            <input type="range" min={0} max={1} step={0.05} value={gfx.volume} onChange={(e) => writeGfx({ volume: Number(e.target.value) })} />
          </label>
          <button type="button" className="rounded-md border border-border px-3 py-1.5 text-left" onClick={onClose}>
            Kapat
          </button>
        </div>
      )}
    </div>
  );
}

function PartyWindow() {
  const snap = useSyncExternalStore(subscribeTarget, targetSnapshot, targetSnapshot);
  const nick = useRpg((s) => s.nick);
  const level = useRpg((s) => s.level);
  if (!snap.party.length) return null;
  const rows = [{ id: "me", nick: `${nick} (sen)`, level }, ...snap.party];
  return (
    <div data-ui className="hud-party pointer-events-auto absolute top-40 left-4 z-20 w-[min(12rem,46vw)] rounded-lg border border-border bg-surface/95 p-2">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs tracking-wide text-gold">Guruptakiler</p>
        <button type="button" className="rounded border border-border px-1 text-[10px]" onClick={() => leaveParty()}>
          Ayrıl
        </button>
      </div>
      {rows.map((mate) => (
        <p key={mate.id + mate.nick} className="truncate text-xs text-fg">
          {mate.nick} <span className="text-muted">Sv.{mate.level}</span>
        </p>
      ))}
    </div>
  );
}

function FriendsWindow({ onClose }: { onClose: () => void }) {
  const snap = useSyncExternalStore(subscribeTarget, targetSnapshot, targetSnapshot);
  return (
    <div data-ui className="hud-friends pointer-events-auto absolute right-4 bottom-40 z-20 w-[min(18rem,86vw)] rounded-lg border border-border bg-surface/95 p-2 md:bottom-24">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs tracking-wide text-gold">Arkadaşlar</p>
        <button type="button" className="text-xs text-muted" onClick={onClose}>
          Kapat
        </button>
      </div>
      {snap.friends.length === 0 ? <p className="text-xs text-muted">Henüz dost yok</p> : null}
      {snap.friends.map((mate) => (
        <div key={mate.id} className="mt-1 flex items-center justify-between gap-1">
          <p className="min-w-0 truncate text-xs text-fg">
            {mate.nick} <span className="text-muted">Sv.{mate.level}</span>
          </p>
          <span className="flex shrink-0 gap-1">
            <button type="button" className="rounded border border-border px-1 text-[10px]" onClick={() => setWhisper({ id: mate.id, nick: mate.nick })}>
              Fısıltı
            </button>
            <button type="button" className="rounded border border-border px-1 text-[10px]" onClick={() => removeFriend(mate.id)}>
              Sil
            </button>
            <button type="button" className="rounded border border-border px-1 text-[10px] text-hp" onClick={() => blockMate(mate)}>
              Engelle
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}

function WorldMap({ zone, big, onToggle }: { zone: string; big: boolean; onToggle: () => void }) {
  const [sim, setSim] = useState(() => readSim());
  const [coords, setCoords] = useState(false);
  const [mark, setMark] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hand = useHandLayout();
  useEffect(() => {
    let frame = 0;
    const loop = () => {
      const next = readSim();
      setSim((prev) =>
        Math.abs(prev.x - next.x) < 0.08 && Math.abs(prev.z - next.z) < 0.08 && Math.abs(prev.yaw - next.yaw) < 0.03 ? prev : next,
      );
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const size = big ? (hand ? 180 : 320) : hand ? 58 : 148;
  const half = 158;
  const px = ((sim.x / half) * 0.5 + 0.5) * size;
  const py = ((sim.z / half) * 0.5 + 0.5) * size;
  const deg = (Math.atan2(-Math.sin(sim.yaw), Math.cos(sim.yaw)) * 180) / Math.PI;
  useEffect(() => {
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
    const k = s / (half * 2);
    const disc = (r: number, fill: string) => {
      g.beginPath();
      g.arc(cx, cy, r * k, 0, Math.PI * 2);
      g.fillStyle = fill;
      g.fill();
    };
    disc(65, "#16343c");
    disc(46.4, "#6d7c58");
    disc(16.5, "#c8c1b4");
    g.fillStyle = "#5a5148";
    for (const h of HOUSES) {
      g.fillRect(cx + (h.x - h.w / 2) * k, cy + (h.z - h.d / 2) * k, Math.max(2, h.w * k), Math.max(2, h.d * k));
    }
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
  }, [size, sim.x, sim.z]);
  return (
    <div data-ui className={big ? "pointer-events-auto absolute top-16 left-1/2 z-30 -translate-x-1/2" : "hud-map pointer-events-auto absolute top-16 right-4 z-20"}>
      <button type="button" className="block" onClick={onToggle} aria-label="Harita">
        <span className="relative block overflow-hidden rounded-lg border border-border" style={{ width: size, height: size }}>
          <canvas ref={canvasRef} className="block h-full w-full" />
          <span
            className="absolute z-10 h-0 w-0"
            style={{
              left: px,
              top: py,
              transform: `translate(-50%, -50%) rotate(${deg}deg)`,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderBottom: "11px solid #7eb6ff",
            }}
            onMouseEnter={(e) => {
              e.stopPropagation();
              setCoords(true);
            }}
            onMouseLeave={() => setCoords(false)}
          />
          {MAP_MARKS.map((spot) => {
            const left = ((spot.x / half) * 0.5 + 0.5) * size;
            const top = ((spot.z / half) * 0.5 + 0.5) * size;
            return (
              <span
                key={spot.name}
                className="absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2"
                style={{ left, top }}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setMark(spot.name);
                }}
                onMouseLeave={() => setMark(null)}
                onPointerDown={(e) => e.stopPropagation()}
              />
            );
          })}
          {mark ? (
            <span className="absolute top-1 left-1 z-20 rounded bg-bg/90 px-1 text-[10px] text-gold">{mark}</span>
          ) : null}
          {coords ? (
            <span className="absolute bottom-1 left-1 rounded bg-bg/90 px-1 text-[10px] text-fg">
              X {sim.x.toFixed(0)} Z {sim.z.toFixed(0)}
            </span>
          ) : null}
        </span>
      </button>
      <p className="mt-1 rounded-md border border-border bg-surface/90 px-2 py-1 text-center text-xs text-gold">{zone}</p>
    </div>
  );
}

function Prompt() {
  const near = useRpg((s) => s.near);
  const shop = useRpg((s) => s.shop);
  const mentor = useRpg((s) => s.mentor);
  const hint = useSyncExternalStore(subscribeField, lootHint, lootHint);
  const cls = "hud-prompt absolute bottom-[18%] left-1/2 -translate-x-1/2 rounded-lg border border-border bg-surface/90 px-3 py-2 text-sm text-fg";
  if (hint) return <p className={cls}>{hint}</p>;
  if (!near || shop) return null;
  const text =
    (
      {
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
        vein: "E — Kazmayla maden kır",
      } as Record<string, string>
    )[near] ?? "E";
  return <p className={cls}>{text}</p>;
}

function Toast() {
  const toast = useRpg((s) => s.toast);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => {
      if (useRpg.getState().toast === toast) useRpg.setState({ toast: "" });
    }, 2200);
    return () => window.clearTimeout(id);
  }, [toast]);
  if (!toast) return null;
  return <p className="absolute top-[22%] left-1/2 -translate-x-1/2 rounded-lg border border-gold bg-surface/95 px-3 py-2 text-sm text-fg">{toast}</p>;
}

function Hurt() {
  const hurt = useRpg((s) => s.hurt);
  if (hurt <= 0) return null;
  return <div className="absolute inset-0 bg-hp/25" style={{ opacity: hurt }} />;
}

function Panels() {
  const invOpen = useRpg((s) => s.invOpen);
  const charOpen = useRpg((s) => s.charOpen);
  const shop = useRpg((s) => s.shop);
  if (!invOpen && !charOpen && !shop) return null;
  return (
    <div className="pointer-events-none absolute inset-0" data-ui>
      {shop === "smith" ? (
        <div className="pointer-events-none absolute inset-0 flex flex-wrap items-start justify-center gap-3 overflow-auto p-3 pt-14">
          <Inventory docked />
          <SmithShop />
        </div>
      ) : invOpen ? (
        <Inventory />
      ) : null}
      {charOpen ? <Character /> : null}
      {shop && shop !== "smith" && shop !== "depot" ? (
        <div className="absolute inset-0 grid place-items-center p-3">
          <TradeShop kind={shop} />
        </div>
      ) : null}
      {shop === "depot" ? (
        <div className="absolute inset-0 grid place-items-center p-3">
          <DepotShop />
        </div>
      ) : null}
    </div>
  );
}

function Shell({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section
      data-ui
      className={`pointer-events-auto max-h-[86dvh] overflow-auto rounded-xl border border-border/80 bg-surface/95 p-3 text-fg hud-window ${className ?? "w-full max-w-3xl"}`}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg text-gold">{title}</h2>
        <button type="button" className="rounded-md border border-border px-2 py-1 text-sm" onClick={() => useRpg.getState().closePanels()}>
          Kapat
        </button>
      </div>
      {children}
    </section>
  );
}

function Tip({ item, x, y }: { item: Item; x: number; y: number }) {
  const s = itemStats(item);
  return (
    <div className="pointer-events-none fixed z-30 w-52 rounded-md border border-gold bg-bg/95 p-2 text-xs text-fg" style={{ left: x + 12, top: y + 12 }}>
      <p className="text-sm text-gold">{displayName(item)}</p>
      <p className="text-muted">
        {SLOT_LABEL[item.slot]} · Sv.{item.level}
      </p>
      <p>
        STR {s.str} · HP {s.hp}
      </p>
      <p>
        ATS {s.ats} · MVS {s.mvs} · CTP {s.ctp}%
      </p>
      <p className="text-muted">{item.desc}</p>
    </div>
  );
}

function ItemMark({ item }: { item: Item | null }) {
  if (!item) return null;
  const pala = item.id.includes("pala");
  const bow = item.id.includes("bow");
  const staff = item.id.includes("staff");
  const dagger = item.id.includes("dagger");
  return (
    <svg viewBox="0 0 24 24" className="mb-0.5 h-6 w-6 text-gold" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      {pala ? (
        <path d="M12 2v16M9 18h6M12 18v4" />
      ) : bow ? (
        <path d="M8 4c7 4 7 12 0 16M8 4c3 5 3 11 0 16" />
      ) : staff ? (
        <path d="M12 3v18M12 6l3 2M12 6l-3 2" />
      ) : dagger ? (
        <path d="M12 3l2 8h-4l2-8zM10 13h4v6h-4z" />
      ) : item.slot === "weapon" ? (
        <path d="M12 3v12M9 15h6M12 15v6" />
      ) : item.slot === "armor" ? (
        <path d="M6 6h12l-1 13H7L6 6z" />
      ) : item.slot === "helmet" ? (
        <path d="M6 14a6 6 0 0 1 12 0v3H6z" />
      ) : item.slot === "boots" ? (
        <path d="M8 4h5v9H7l-1 5h11" />
      ) : item.slot === "gloves" ? (
        <path d="M8 15V7m3 8V5m3 10V7m3 8v-5" />
      ) : (
        <circle cx="12" cy="12" r="4" />
      )}
    </svg>
  );
}

const PAPER: { slot: EquipSlot; area: string }[] = [
  { slot: "weapon", area: "1 / 1 / 3 / 2" },
  { slot: "helmet", area: "1 / 2 / 2 / 3" },
  { slot: "earring", area: "1 / 3 / 2 / 4" },
  { slot: "necklace", area: "1 / 4 / 2 / 5" },
  { slot: "armor", area: "1 / 5 / 2 / 6" },
  { slot: "gloves", area: "2 / 2 / 3 / 3" },
  { slot: "bracelet", area: "2 / 3 / 3 / 4" },
  { slot: "ring", area: "2 / 4 / 3 / 5" },
  { slot: "belt", area: "2 / 5 / 3 / 6" },
  { slot: "boots", area: "3 / 3 / 4 / 4" },
];

const invSpot = { x: -1, y: 72 };

function Inventory({ docked = false }: { docked?: boolean }) {
  const bag = useRpg((s) => s.bag);
  const equipped = useRpg((s) => s.equipped);
  const gold = useRpg((s) => s.gold);
  const bagStage = useRpg((s) => s.bagStage);
  const open = openBagCount(bagStage);
  const [page, setPage] = useState(0);
  const [tip, setTip] = useState<{ item: Item; x: number; y: number } | null>(null);
  const [pos, setPos] = useState(() => {
    if (invSpot.x < 0 && typeof window !== "undefined") invSpot.x = Math.max(16, Math.round(window.innerWidth * 0.5 - 280));
    return { x: Math.max(8, invSpot.x), y: invSpot.y };
  });
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const show = (item: Item | null, ev: MouseEvent) => {
    if (!item) return;
    setTip({ item, x: ev.clientX, y: ev.clientY });
  };
  const move = (clientX: number, clientY: number) => {
    if (!drag.current) return;
    const next = {
      x: Math.max(8, Math.min(window.innerWidth - 240, clientX - drag.current.dx)),
      y: Math.max(8, Math.min(window.innerHeight - 80, clientY - drag.current.dy)),
    };
    invSpot.x = next.x;
    invSpot.y = next.y;
    setPos(next);
  };
  const start = page * PAGE_SIZE;
  const release = (index: number, event: DragEvent<HTMLButtonElement>) => {
    const panel = (event.currentTarget as HTMLElement).closest("[data-inv]");
    const rect = panel?.getBoundingClientRect();
    if (rect && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dropBag(index);
    setCarry(null);
  };
  return (
    <section
      data-ui
      data-inv
      className={`inv-sheet hud-window pointer-events-auto max-h-[86dvh] w-[min(28rem,96vw)] overflow-auto p-3 text-fg ${docked ? "relative" : "absolute"}`}
      style={docked ? undefined : { left: pos.x, top: pos.y }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className="mb-3 flex cursor-grab items-center justify-between active:cursor-grabbing"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => move(e.clientX, e.clientY)}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        <h2 className="font-display text-lg text-gold">Envanter</h2>
        <button type="button" className="rounded-md border border-border px-2 py-1 text-sm" onClick={() => useRpg.getState().closePanels()}>
          Kapat
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <div className="equip-board">
          {PAPER.map(({ slot, area }) => {
            const it = equipped[slot];
            return (
              <button
                key={slot}
                type="button"
                draggable={!!it}
                style={{ gridArea: area }}
                className={`octo-slot ${slot === "weapon" ? "is-tall" : ""}`}
                onMouseEnter={(e) => show(it, e)}
                onMouseMove={(e) => show(it, e)}
                onMouseLeave={() => setTip(null)}
                onClick={() => it && useRpg.getState().unequip(slot)}
                onDragStart={(e) => {
                  setCarry({ kind: "slot", slot });
                  e.dataTransfer.setData("text/plain", `slot:${slot}`);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setCarry(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const token = readCarry();
                  const raw = e.dataTransfer.getData("text/plain");
                  const index = token?.kind === "bag" ? token.index : raw.startsWith("bag:") ? Number(raw.slice(4)) : -1;
                  if (index >= 0) useRpg.getState().equipFromBag(index);
                  setCarry(null);
                }}
              >
                <ItemMark item={it} />
                <span className="block text-muted">{SLOT_LABEL[slot]}</span>
                <span className="block truncate">{it ? displayName(it) : "—"}</span>
              </button>
            );
          })}
        </div>
        <div>
          <div className="mb-1.5 flex gap-1">
            {[0, 1, 2].map((n) => (
              <button
                key={n}
                type="button"
                className={n === page ? "bag-tab is-on" : "bag-tab"}
                onClick={() => setPage(n)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const token = readCarry();
                  const raw = e.dataTransfer.getData("text/plain");
                  if (token?.kind === "bag" || raw.startsWith("bag:")) {
                    const from = token?.kind === "bag" ? token.index : Number(raw.slice(4));
                    useRpg.getState().moveToPage(from, n);
                  } else if (token?.kind === "slot" || raw.startsWith("slot:")) {
                    const slot = token?.kind === "slot" ? token.slot : (raw.slice(5) as EquipSlot);
                    const start = n * PAGE_SIZE;
                    const bagNow = useRpg.getState().bag;
                    let dest = -1;
                    for (let i = 0; i < PAGE_SIZE; i++) {
                      if (bagNow[start + i] == null) {
                        dest = start + i;
                        break;
                      }
                    }
                    if (dest >= 0) useRpg.getState().placeEquip(slot, dest);
                    else useRpg.setState({ toast: "Bu pencere dolu" });
                  }
                  setCarry(null);
                  setPage(n);
                }}
              >
                {["I", "II", "III"][n]}
              </button>
            ))}
          </div>
          <div className="bag-grid">
            {Array.from({ length: PAGE_SIZE }, (_, i) => {
              const index = start + i;
              const it = bag[index] ?? null;
              const locked = index >= open;
              return (
                <button
                  key={index}
                  type="button"
                  draggable={!!it && !locked}
                  className={locked ? "octo-slot is-lock" : "octo-slot"}
                  onMouseEnter={(e) => show(it, e)}
                  onMouseMove={(e) => show(it, e)}
                  onMouseLeave={() => setTip(null)}
                  onClick={() => {
                    if (locked) {
                      useRpg.setState({ toast: "Envanter Genişletme ile açılır" });
                      return;
                    }
                    if (it) useRpg.getState().equipFromBag(index);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (it) dropBag(index);
                  }}
                  onDragStart={(e) => {
                    setCarry({ kind: "bag", index });
                    e.dataTransfer.setData("text/plain", `bag:${index}`);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={(e) => release(index, e)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const token = readCarry();
                    const raw = e.dataTransfer.getData("text/plain");
                    const from = token?.kind === "bag" ? token.index : raw.startsWith("bag:") ? Number(raw.slice(4)) : -1;
                    if (locked) {
                      const item = from >= 0 ? useRpg.getState().bag[from] : null;
                      if (item?.id === "bag-expand") useRpg.getState().useBagItem(from);
                      else useRpg.setState({ toast: "Kilitli yuvaya Envanter Genişletme sürükle" });
                      setCarry(null);
                      return;
                    }
                    if (token?.kind === "bag" || raw.startsWith("bag:")) {
                      const from = token?.kind === "bag" ? token.index : Number(raw.slice(4));
                      useRpg.getState().swapBag(from, index);
                    } else if (token?.kind === "slot" || raw.startsWith("slot:")) {
                      const slot = token?.kind === "slot" ? token.slot : (raw.slice(5) as EquipSlot);
                      useRpg.getState().placeEquip(slot, index);
                    }
                    setCarry(null);
                  }}
                >
                  {locked ? (
                    <span>Kilit</span>
                  ) : it ? (
                    <>
                      <ItemMark item={it} />
                      <span className="truncate">{displayName(it)}{it.count && it.count > 1 ? ` x${it.count}` : ""}</span>
                    </>
                  ) : (
                    ""
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <p className="mt-3 border-t border-border pt-2 text-right text-sm text-gold">{gold} Altın</p>
      <p className="mt-1 text-[11px] text-muted">Sağ tık veya pencerenin dışına sürükle: yere at</p>
      {tip ? <Tip item={tip.item} x={tip.x} y={tip.y} /> : null}
    </section>
  );
}

const charSpot = { x: 16, y: -1 };

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
  const totals = sumStats({ base, invested, equipped, level, skills });
  const [pos, setPos] = useState(() => {
    if (charSpot.y < 0 && typeof window !== "undefined") {
      charSpot.y = Math.max(72, Math.round(window.innerHeight * 0.5 - 170));
    }
    return { x: charSpot.x, y: Math.max(72, charSpot.y) };
  });
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const move = (clientX: number, clientY: number) => {
    if (!drag.current) return;
    const next = {
      x: Math.max(8, Math.min(window.innerWidth - 280, clientX - drag.current.dx)),
      y: Math.max(8, Math.min(window.innerHeight - 80, clientY - drag.current.dy)),
    };
    charSpot.x = next.x;
    charSpot.y = next.y;
    setPos(next);
  };
  const trees = CLASS_TREES[classId];
  const tabs: CharTab[] = ["stats", "skills", "quests"];
  return (
    <section
      data-ui
      className={`hud-window pointer-events-auto absolute max-h-[80dvh] overflow-auto rounded-xl border border-border/80 bg-surface/95 p-3 text-fg ${charTab === "skills" ? "w-[min(44rem,96vw)]" : "w-[min(22rem,90vw)]"}`}
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className="mb-3 flex cursor-grab items-center justify-between active:cursor-grabbing"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => move(e.clientX, e.clientY)}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        <p className="font-display text-lg text-gold">{charTab === "stats" ? "Statü" : charTab === "skills" ? "Yetenek" : "Görevler"}</p>
        <button type="button" className="text-xs text-muted" onClick={() => useRpg.getState().closePanels()}>
          Kapat
        </button>
      </div>
      {charTab === "stats" ? (
        <p className="mb-3 text-xs text-muted">
          {className(classId)} · Sv. {level} · {Math.floor(xp)}/{xpTo} · Puan {unspent}
        </p>
      ) : charTab === "skills" ? (
        <p className="mb-3 text-xs text-muted">{level < 5 ? "Yetenekler 5. seviyede açılır." : `Yetenek puanı ${skillPoints}`}</p>
      ) : null}
      {charTab === "quests" ? (
        <div className="flex flex-col gap-2">
          {quests.filter((quest) => !quest.claimed).length === 0 ? <p className="text-xs text-muted">Köy Muhafızından görev al.</p> : null}
          {quests.filter((quest) => !quest.claimed).map((quest) => (
            <div key={quest.id} className="rounded-md border border-border bg-bg/70 px-2 py-1.5 text-xs">
              <p className="text-gold">{quest.title}</p>
              <p className="text-muted">{quest.detail}</p>
              <p>{quest.done ? "Muhafıza dön, ödülü al" : `${Math.min(quest.have, quest.need)}/${quest.need}`}</p>
            </div>
          ))}
        </div>
      ) : charTab === "skills" ? (
        <div className="grid grid-cols-2 items-start gap-3">
          {trees.map((tree, index) => {
            const key = `${classId}:${index}`;
            if (chosenTree && chosenTree !== key) return null;
            return (
              <div key={tree.name}>
                <p className="mb-1 text-xs text-gold">{tree.name}{chosenTree === key ? " · seçili" : ""}</p>
                <div className="flex flex-col gap-1">
                  {tree.skills.map((sk) => {
                    const rank = skills[sk.id] ?? 0;
                    const preview = skillPreview(sk.id, rank, totals);
                    const tip = preview.buff
                      ? `${sk.desc} Seviye ${skillTier(rank)}`
                      : `${sk.desc} Hasar ${preview.dmg}. Sonraki ${preview.next}.`;
                    return (
                      <div
                        key={sk.id}
                        draggable={rank > 0}
                        title={tip}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", `skill:${sk.id}`);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-md border border-border bg-bg/70 px-2 py-1.5 text-xs"
                      >
                        <SkillMark id={sk.id} />
                        <span>
                          {sk.name}
                          <span className="block text-[10px] text-muted">{tip}</span>
                        </span>
                        <b className="tabular-nums text-gold">{skillTier(rank)}</b>
                        <button
                          type="button"
                          disabled={level < 5 || skillPoints <= 0 || rank >= SKILL_MAX}
                          className="h-7 w-7 rounded-md border border-border text-gold disabled:opacity-30"
                          onClick={() => useRpg.getState().learnSkill(sk.id)}
                        >
                          +
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p className="col-span-2 text-[11px] text-muted">İlk + bir ağacı kilitler. Öğrenileni alt çubuğa sürükle.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {(["str", "mag", "hp", "ats", "mvs", "ctp"] as StatKey[]).map((key) => (
            <div key={key} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 text-sm">
              <StatMark stat={key} />
              <span className="text-fg/90">{STAT_LABEL[key].split(" (")[0]}</span>
              <b className="tabular-nums">{totals[key]}</b>
              <button type="button" disabled={unspent <= 0} className="h-7 w-7 rounded-md border border-border text-gold disabled:opacity-30" onClick={() => useRpg.getState().spend(key)}>
                +
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-1 border-t border-border pt-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={charTab === tab ? "rounded-md border border-gold px-2 py-1 text-xs text-gold" : "rounded-md border border-border px-2 py-1 text-xs text-muted"}
            onClick={() => useRpg.setState({ charTab: tab, charOpen: true })}
          >
            {tab === "stats" ? "Statü" : tab === "skills" ? "Yetenekler" : "Görevler"}
          </button>
        ))}
      </div>
    </section>
  );
}

function skillWaitLabel(id: string, rank: number) {
  const left = skillCdLeft(id);
  if (left > 0.05) return `${left.toFixed(1)} sn`;
  return rank > 0 ? "hazır" : "—";
}

function SkillMark({ id }: { id: string }) {
  const n = id.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const hue = n % 360;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <rect x="1" y="1" width="20" height="20" rx="4" fill={`hsl(${hue} 28% 18%)`} stroke={`hsl(${hue} 42% 62%)`} />
      <path d={n % 2 ? "M11 4 L16 16 L6 16 Z" : "M5 11 h12 M11 5 v12"} stroke={`hsl(${hue} 55% 72%)`} strokeWidth="1.6" fill="none" />
    </svg>
  );
}

function StatMark({ stat }: { stat: StatKey }) {
  const glyph = stat === "str" ? "⚔" : stat === "mag" ? "✶" : stat === "hp" ? "♥" : stat === "ats" ? "»" : stat === "mvs" ? "→" : "✦";
  return <span className="grid h-6 w-6 place-items-center rounded-md border border-gold/50 text-[11px] text-gold">{glyph}</span>;
}

function shopRows(kind: ShopKind, classId: ReturnType<typeof useRpg.getState>["classId"]) {
  return CATALOG.filter((row) => {
    if (!("shop" in row) || row.shop !== kind) return false;
    if (kind === "weapon" && !weaponFits(classId, row.id)) return false;
    return true;
  });
}

const TABS: Record<string, { id: string; label: string; test: (id: string, slot: string) => boolean }[]> = {
  weapon: [{ id: "silah", label: "Sınıf silahı", test: () => true }],
  armor: [
    { id: "zirh", label: "Zırh", test: (_id, slot) => slot === "armor" || slot === "helmet" || slot === "boots" || slot === "gloves" || slot === "belt" },
    { id: "taki", label: "Takı", test: (_id, slot) => slot === "earring" || slot === "necklace" || slot === "bracelet" || slot === "ring" },
  ],
  market: [
    { id: "iksir", label: "İksir", test: (id) => id.startsWith("pot-") },
    { id: "diger", label: "Diğer", test: (id) => !id.startsWith("pot-") },
  ],
  stable: [{ id: "binek", label: "Binek", test: () => true }],
  fisher: [{ id: "olta", label: "Olta", test: () => true }],
  miner: [{ id: "kazma", label: "Kazma", test: () => true }],
};

const SHOP_TITLE: Record<string, string> = {
  market: "Satıcı",
  armor: "Zırhçı",
  weapon: "Silahçı",
  stable: "Seyis",
  fisher: "Balıkçı",
  miner: "Madenci",
};

function TradeShop({ kind }: { kind: Exclude<ShopKind, "smith" | "depot"> }) {
  const gold = useRpg((s) => s.gold);
  const classId = useRpg((s) => s.classId);
  const tabs = TABS[kind] ?? [];
  const [tab, setTab] = useState(tabs[0]?.id ?? "");
  const [tip, setTip] = useState<{ item: Item; x: number; y: number } | null>(null);
  const current = tabs.find((row) => row.id === tab) ?? tabs[0];
  const rows = shopRows(kind, classId).filter((row) => !current || current.test(row.id, row.slot));
  return (
    <Shell title={SHOP_TITLE[kind] ?? "Dükkan"} className="w-[min(32rem,96vw)]">
      <p className="mb-2 text-sm text-gold">{gold} Altın</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {tabs.map((row) => (
          <button key={row.id} type="button" className={tab === row.id ? "rounded-md border border-gold px-2 py-1 text-xs text-gold" : "rounded-md border border-border px-2 py-1 text-xs text-muted"} onClick={() => setTab(row.id)}>
            {row.label}
          </button>
        ))}
      </div>
      <div className="flex max-h-[50dvh] flex-col gap-2 overflow-auto">
        {rows.map((row) => {
          const preview = { ...row, uid: row.id, level: 1, plus: 0 } as Item;
          return (
            <div
              key={row.id}
              className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-md border border-border bg-bg px-2 py-2 text-sm"
              onMouseEnter={(e) => setTip({ item: preview, x: e.clientX, y: e.clientY })}
              onMouseMove={(e) => setTip({ item: preview, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setTip(null)}
            >
              <ItemMark item={preview} />
              <span>
                {row.name} {row.req ? <span className="text-muted">Sv.{row.req}</span> : null}
              </span>
              <span className="text-gold">{row.price}g</span>
              <button type="button" disabled={gold < row.price} className="rounded-md border border-border px-3 py-2 disabled:opacity-40" onClick={() => useRpg.getState().buy(row.id)}>
                Al
              </button>
            </div>
          );
        })}
      </div>
      {tip ? <Tip item={tip.item} x={tip.x} y={tip.y} /> : null}
    </Shell>
  );
}

function DepotShop() {
  const bag = useRpg((s) => s.bag);
  const depot = useRpg((s) => s.depot);
  const stage = useRpg((s) => s.bagStage);
  const [page, setPage] = useState(0);
  const [tip, setTip] = useState<{ item: Item; x: number; y: number } | null>(null);
  const open = openBagCount(stage);
  const start = page * PAGE_SIZE;
  return (
    <Shell title="Depo" className="w-[min(40rem,96vw)]">
      <p className="mb-2 text-xs text-muted">Açık çantanı sürükle. Depo ayrı durur.</p>
      <div className="mb-2 flex gap-1">
        {[0, 1, 2].map((n) => (
          <button key={n} type="button" className={n === page ? "rounded-md border border-gold px-2 py-1 text-xs text-gold" : "rounded-md border border-border px-2 py-1 text-xs"} onClick={() => setPage(n)}>
            Pencere {n + 1}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-1 text-xs text-gold">Çanta</p>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: PAGE_SIZE }, (_, i) => {
              const index = start + i;
              const item = index < open ? bag[index] ?? null : null;
              const locked = index >= open;
              return (
                <button
                  key={index}
                  type="button"
                  draggable={!!item}
                  className="min-h-11 rounded-md border border-border bg-bg p-1 text-left text-[10px]"
                  onDragStart={(e) => {
                    if (!item) return;
                    setCarry({ kind: "bag", index });
                    e.dataTransfer.setData("text/plain", `bag:${index}`);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const raw = e.dataTransfer.getData("text/plain");
                    if (raw.startsWith("depot:")) useRpg.getState().withdraw(Number(raw.slice(6)));
                  }}
                  onClick={() => item && useRpg.getState().deposit(index)}
                  onMouseEnter={(e) => item && setTip({ item, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTip(null)}
                >
                  {locked ? "Kilit" : item ? `${displayName(item)}${item.count && item.count > 1 ? ` x${item.count}` : ""}` : ""}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs text-gold">Depo</p>
          <div className="grid grid-cols-4 gap-1" onDragOver={(e) => e.preventDefault()}>
            {depot.map((item, index) => (
              <button
                key={index}
                type="button"
                draggable={!!item}
                className="min-h-11 rounded-md border border-border bg-bg p-1 text-left text-[10px]"
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", `depot:${index}`);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const token = readCarry();
                  const raw = e.dataTransfer.getData("text/plain");
                  const from = token?.kind === "bag" ? token.index : raw.startsWith("bag:") ? Number(raw.slice(4)) : -1;
                  if (from >= 0) useRpg.getState().deposit(from);
                }}
                onClick={() => item && useRpg.getState().withdraw(index)}
                onMouseEnter={(e) => item && setTip({ item, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setTip(null)}
              >
                {item ? displayName(item) : ""}
              </button>
            ))}
          </div>
        </div>
      </div>
      {tip ? <Tip item={tip.item} x={tip.x} y={tip.y} /> : null}
    </Shell>
  );
}

function SmithShop() {
  const bag = useRpg((s) => s.bag);
  const gold = useRpg((s) => s.gold);
  const itemAt = useRpg((s) => s.smithItem);
  const stoneAt = useRpg((s) => s.smithStone);
  const item = itemAt == null ? null : bag[itemAt] ?? null;
  const stone = stoneAt == null ? null : bag[stoneAt] ?? null;
  const cost = item && item.plus < 10 ? (ENHANCE[item.plus] ?? 1550) : 0;
  const need = item ? item.plus + 1 : 1;
  const take = (which: "item" | "stone", raw: string) => {
    const carried = readCarry();
    const from = raw.startsWith("bag:") ? Number(raw.slice(4)) : carried?.kind === "bag" ? carried.index : -1;
    if (from < 0) return;
    useRpg.getState().setSmith(which, from);
  };
  return (
    <Shell title="Demirci" className="w-[min(32rem,96vw)]">
      <p className="mb-2 text-sm text-gold">{gold} Altın</p>
      <p className="mb-2 text-xs text-muted">Envanterden sürükle. Giyili eşya burada listelenmez.</p>
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
        <SmithSlot title="+ Basılacak" item={item} onDrop={(raw) => take("item", raw)} />
        <span className="text-gold">+</span>
        <SmithSlot title="+ Taşı" item={stone} onDrop={(raw) => take("stone", raw)} />
        <span className="text-gold">=</span>
        <div className="rounded-md border border-gold/50 bg-bg p-2 text-xs">
          <p className="text-muted">Sonuç</p>
          <p>{item ? `${item.name} +${Math.min(10, item.plus + 1)}` : "—"}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">
        Gerekli: Güç Taşı x{need} ve {cost || "—"} altın
      </p>
      <button type="button" className="mt-2 rounded-md border border-gold px-3 py-2 text-sm text-gold" onClick={() => useRpg.getState().forge()}>
        İşle
      </button>
    </Shell>
  );
}

function SmithSlot({ title, item, onDrop }: { title: string; item: Item | null; onDrop: (raw: string) => void }) {
  return (
    <div
      className="min-h-16 rounded-md border border-dashed border-border bg-bg p-2 text-xs"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(e.dataTransfer.getData("text/plain"));
      }}
    >
      <p className="text-muted">{title}</p>
      <p>{item ? `${displayName(item)}${item.count ? ` x${item.count}` : ""}` : "Boş"}</p>
    </div>
  );
}
