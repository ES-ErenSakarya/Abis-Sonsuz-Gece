import { o as __toESM } from "../_runtime.mjs";
import { Nt as require_jsx_runtime, Pt as require_react } from "../_libs/@react-three/fiber+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { D as authMiddleware, N as captureSave, P as className, T as applySave, at as useHud, k as beginPlay, r as CLASS_LIST } from "./middleware-SMghQq71.mjs";
import { i as signOut, r as signIn, t as authClient } from "./client-CVqXY6bk.mjs";
import { a as hasGateSessionMarker, t as GROK_PROVIDERS } from "./server-BVIQuoGk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AccountScreens-D6xLmeiX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var accountMeta = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("83e7a00206ced48e4f0b3ac3e899d5f3f3356d56626ad16923f2e1086c74abd8"));
var setDeletePassword = createServerFn({ method: "POST" }).validator((password) => password).middleware([authMiddleware]).handler(createSsrRpc("b0aa6f6bb8ca7c9820030fbf961bba8d434d770dcd329ec1de413d355d2c5e59"));
var listCharacters = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("87b74a0d71f57198c267cfe27c69ecc2bec41b8f62038db3d01615c81a21a461"));
var createCharacter = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(createSsrRpc("7ac364d62370305f9c3dbfbe8d0c10ed83d47498c99149888d472a1b27460b0e"));
var saveCharacter = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(createSsrRpc("9009e61e56e40e24e8e9c273c5e59d1824734a4e1a6d7ec0b24b0b56bd638a21"));
var deleteCharacter = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(createSsrRpc("585b747ea8b31bb3d84a8d1aa00dee082cf7fd995173778c5eebada5be1145ad"));
var changeDeletePassword = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(createSsrRpc("4de30c9c31c86eaaca6703aa9fa15dca632674bb50456a2f709d4dd2e042cb48"));
var useSession = create((set) => ({
	activeId: null,
	enter: (id) => set({ activeId: id }),
	leave: () => set({ activeId: null })
}));
var field = "mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-base text-fg";
var primary = "rounded-lg bg-primary px-4 py-3 text-base font-medium text-primary-fg disabled:opacity-40";
var ghost = "rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg disabled:opacity-40";
var CLASS_TONE = {
	savasci: "#c4553a",
	okcu: "#7eb06a",
	buyucu: "#7aa0d4",
	ninja: "#c9a15b"
};
function ClassSigil({ id }) {
	const tone = CLASS_TONE[id] ?? "#c9a15b";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className: "h-8 w-8 shrink-0",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "13.2",
				fill: "#141210",
				stroke: tone,
				strokeWidth: "1.4"
			}),
			id === "savasci" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 6.5 18.4 22h-4.8L16 6.5ZM9.5 24.5h13",
				fill: tone,
				stroke: tone,
				strokeWidth: "1.2"
			}) : null,
			id === "okcu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M7 16c4-8 14-8 18 0-4 8-14 8-18 0Zm9-6v12",
				fill: "none",
				stroke: tone,
				strokeWidth: "1.5"
			}) : null,
			id === "buyucu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "m16 6 1.5 7.2H25l-6 4.4 2.2 7.4L16 21l-5.2 4 2.2-7.4-6-4.4h7.5L16 6Z",
				fill: tone
			}) : null,
			id === "ninja" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M7 16h18M16 7v18M10.5 10.5l11 11M21.5 10.5l-11 11",
				fill: "none",
				stroke: tone,
				strokeWidth: "1.35"
			}) : null
		]
	});
}
function rememberToken(token) {
	if (typeof token !== "string" || !token || typeof window === "undefined") return;
	try {
		window.sessionStorage.setItem("grok-auth.bearer-token", token);
	} catch {}
}
function DeletePasswordForm({ onConfirmed }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [password, setPassword] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-xl border border-border bg-bg/60 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: ghost,
			onClick: () => setOpen(true),
			children: "Karakter Silme Şifresi Belirle"
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "block text-sm text-muted",
					htmlFor: "delete-pass",
					children: "Karakter silme şifresi"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "delete-pass",
					type: "password",
					autoComplete: "new-password",
					value: password,
					className: field,
					onChange: (e) => {
						setPassword(e.target.value);
						setNote("");
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `${primary} mt-3`,
					onClick: () => {
						if (password.trim().length < 4) {
							setNote("En az 4 karakter.");
							return;
						}
						onConfirmed(password.trim());
						setNote("Şifre Oluşturuldu");
					},
					children: "Onayla"
				}),
				note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-gold",
					children: note
				}) : null
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted",
			children: "Karakter silmek için ayrı bir şifre. Hesap şifren değil."
		})]
	});
}
function AuthScreens() {
	const [mode, setMode] = (0, import_react.useState)("giris");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [again, setAgain] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [deletePw, setDeletePw] = (0, import_react.useState)("");
	const [deleteReady, setDeleteReady] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const submit = async () => {
		setError("");
		setPending(true);
		try {
			if (mode === "giris") {
				const { data, error: err } = await authClient.signIn.email({
					email: email.trim(),
					password
				});
				if (err) throw new Error(err.message || "Giriş olmadı");
				rememberToken(data?.token);
			} else {
				if (password !== again) throw new Error("Şifreler aynı değil");
				if (!deleteReady) throw new Error("Önce karakter silme şifresini onayla");
				const { data, error: err } = await authClient.signUp.email({
					email: email.trim(),
					password,
					name: name.trim() || "Gezgin"
				});
				if (err) throw new Error(err.message || "Kayıt olmadı");
				rememberToken(data?.token);
				const saved = await setDeletePassword({ data: deletePw });
				if (!saved.ok && saved.reason !== "exists") throw new Error("Silme şifresi kaydedilemedi");
			}
			await authClient.getSession();
		} catch (err) {
			const message = err instanceof Error ? err.message : "Bir şey ters gitti";
			setError(/exist/i.test(message) ? "Bu e-posta zaten kayıtlı." : /invalid|credential|password/i.test(message) ? "E-posta veya şifre uyuşmadı." : message);
		} finally {
			setPending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "menu-card w-full max-w-md rounded-3xl border border-border bg-surface p-4 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-[0.22em] text-muted",
				children: "MMORPG"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-3xl font-medium leading-tight text-fg",
				children: "Abis: Sonsuz Gece"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Aynı köyde başkaları da yürür. Hesabın ve karakterlerin sende kalır."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: mode === "giris" ? primary : ghost,
					onClick: () => setMode("giris"),
					children: "Giriş"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: mode === "kayit" ? primary : ghost,
					onClick: () => setMode("kayit"),
					children: "Kayıt ol"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "mt-4 block text-sm text-muted",
				htmlFor: "email",
				children: "E-posta"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id: "email",
				type: "email",
				autoComplete: "email",
				value: email,
				className: field,
				onChange: (e) => setEmail(e.target.value)
			}),
			mode === "kayit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "mt-3 block text-sm text-muted",
				htmlFor: "acc-name",
				children: "Görünen ad"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id: "acc-name",
				value: name,
				maxLength: 24,
				className: field,
				onChange: (e) => setName(e.target.value)
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "mt-3 block text-sm text-muted",
				htmlFor: "acc-pass",
				children: "Şifre"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id: "acc-pass",
				type: "password",
				autoComplete: mode === "kayit" ? "new-password" : "current-password",
				value: password,
				className: field,
				onChange: (e) => setPassword(e.target.value)
			}),
			mode === "kayit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-3 block text-sm text-muted",
					htmlFor: "acc-again",
					children: "Şifre tekrar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "acc-again",
					type: "password",
					value: again,
					className: field,
					onChange: (e) => setAgain(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeletePasswordForm, { onConfirmed: (pw) => {
					setDeletePw(pw);
					setDeleteReady(true);
				} })
			] }) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-hp",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: `${primary} mt-4 w-full`,
				disabled: pending || !email.includes("@") || password.length < 8 || mode === "kayit" && !deleteReady,
				onClick: () => void submit(),
				children: pending ? "Bekleniyor…" : mode === "giris" ? "Giriş yap" : "Kayıt ol"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-col gap-2",
				children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: ghost,
					onClick: () => void signIn(p.providerId, { callbackURL: "/" }),
					children: [p.label, " ile devam et"]
				}, p.providerId))
			})
		]
	});
}
function CharacterScreens() {
	const [rows, setRows] = (0, import_react.useState)(null);
	const [needsPassword, setNeedsPassword] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [creating, setCreating] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [klass, setKlass] = (0, import_react.useState)("savasci");
	const [deleting, setDeleting] = (0, import_react.useState)(null);
	const [wipe, setWipe] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const reload = async () => {
		const [meta, list] = await Promise.all([accountMeta(), listCharacters()]);
		setNeedsPassword(!meta.hasDeletePassword);
		setRows(list);
	};
	(0, import_react.useEffect)(() => {
		let dead = false;
		reload().catch((err) => {
			if (!dead) setError(err instanceof Error ? err.message : "Liste açılmadı");
		});
		return () => {
			dead = true;
		};
	}, []);
	const ready = useHud((s) => s.ready);
	const play = (row) => {
		if (!useHud.getState().ready) return;
		applySave(row);
		useSession.getState().enter(row.id);
		beginPlay({
			x: row.x,
			z: row.z
		});
	};
	const make = async () => {
		if (creating == null) return;
		setBusy(true);
		setError("");
		try {
			const res = await createCharacter({ data: {
				slot: creating,
				name,
				classId: klass
			} });
			if (!res.ok || !("character" in res)) {
				setError(res.ok ? "Karakter yaratılamadı." : res.reason === "name" ? "Bu isim alınmış." : "Bu yuva dolu ya da ad çok kısa.");
				return;
			}
			setCreating(null);
			setName("");
			await reload();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Karakter yaratılamadı");
		} finally {
			setBusy(false);
		}
	};
	const wipeChar = async () => {
		if (!deleting) return;
		setBusy(true);
		setError("");
		try {
			const res = await deleteCharacter({ data: {
				id: deleting.id,
				password: wipe
			} });
			if (!res.ok) {
				setError(res.reason === "bad-password" ? "Silme şifresi yanlış." : "Karakter silinemedi.");
				return;
			}
			setDeleting(null);
			setWipe("");
			await reload();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Karakter silinemedi");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "menu-card relative max-h-[90dvh] w-full max-w-3xl overflow-auto rounded-3xl border border-gold/40 bg-surface p-5 text-fg shadow-[0_28px_70px_rgba(8,7,6,0.55)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-[0.28em] text-gold",
						children: "ABİS · SONSUZ GECE"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-3xl text-fg",
						children: "Karakter seç"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Altı yuva. Bir isim bir kez yaşar."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
			}),
			needsPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Karakter yaratmadan önce silme şifreni bir kez belirle."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeletePasswordForm, { onConfirmed: (pw) => {
					setDeletePassword({ data: pw }).then((res) => {
						if (res.ok || res.reason === "exists") setNeedsPassword(false);
						else setError("Şifre kaydedilemedi.");
					});
				} })]
			}) : creating != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-gold",
						children: [
							"Yuva ",
							creating + 1,
							" · yeni karakter"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-3 block text-sm text-muted",
						htmlFor: "char-name",
						children: "Karakter adı"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "char-name",
						value: name,
						maxLength: 16,
						className: field,
						onChange: (e) => setName(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: "Sınıf"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 grid grid-cols-2 gap-2",
						children: CLASS_LIST.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: `flex items-center gap-3 text-left ${klass === row.id ? primary : ghost}`,
							onClick: () => setKlass(row.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassSigil, { id: row.id }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block",
								children: row.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-0.5 block text-xs opacity-80",
								children: [
									row.arm,
									" · ",
									row.line
								]
							})] })]
						}, row.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "Başlangıç silahı köydeki sandıktan çıkar. Otomatik kuşanılmaz."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: primary,
							disabled: busy || name.trim().length < 2,
							onClick: () => void make(),
							children: "Karakteri yarat"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: ghost,
							onClick: () => setCreating(null),
							children: "Geri"
						})]
					})
				]
			}) : deleting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-fg",
						children: [deleting.name, " silinsin mi? Karakter silme şifreni yaz."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "password",
						value: wipe,
						className: field,
						onChange: (e) => setWipe(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: primary,
							disabled: busy || wipe.length < 4,
							onClick: () => void wipeChar(),
							children: "Karakteri sil"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: ghost,
							onClick: () => setDeleting(null),
							children: "Vazgeç"
						})]
					})
				]
			}) : rows === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Karakterler yükleniyor…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2",
				children: Array.from({ length: 6 }, (_, slot) => {
					const row = rows?.find((item) => item.slot === slot);
					if (!row) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex min-h-28 flex-col justify-between rounded-2xl border border-dashed border-gold/35 bg-bg/70 px-4 py-3 text-left",
						onClick: () => setCreating(slot),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs tracking-widest text-muted",
							children: ["YUVA ", slot + 1]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-gold",
							children: "Boş mühür · yeni karakter"
						})]
					}, slot);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-28 flex-col rounded-2xl border border-border bg-bg/80 px-4 py-3",
						style: { boxShadow: `inset 3px 0 0 ${CLASS_TONE[row.classId] ?? "#c9a15b"}` },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassSigil, { id: row.classId }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[10px] tracking-widest text-muted",
										children: ["YUVA ", slot + 1]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-lg text-fg",
										children: row.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-gold",
										children: [
											"Sv. ",
											row.level,
											" · ",
											className(row.classId)
										]
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: primary,
								disabled: !ready,
								onClick: () => play(row),
								children: ready ? "Giriş Yap" : "Dünya yerleşiyor"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: ghost,
								onClick: () => setDeleting(row),
								children: "Sil"
							})]
						})]
					}, row.id);
				})
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-hp",
				children: error
			}) : null,
			!needsPassword && creating == null && !deleting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangeDeletePassword, {}) : null
		]
	});
}
function ChangeDeletePassword() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [current, setCurrent] = (0, import_react.useState)("");
	const [next, setNext] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: ghost,
			onClick: () => setOpen((value) => !value),
			children: "Silme şifresini değiştir"
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 rounded-xl border border-border bg-bg/60 p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "block text-sm text-muted",
					htmlFor: "old-del",
					children: "Eski silme şifresi"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "old-del",
					type: "password",
					value: current,
					className: field,
					onChange: (e) => setCurrent(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-3 block text-sm text-muted",
					htmlFor: "new-del",
					children: "Yeni silme şifresi"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "new-del",
					type: "password",
					value: next,
					className: field,
					onChange: (e) => setNext(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `${primary} mt-3`,
					disabled: busy || current.length < 4 || next.trim().length < 4,
					onClick: () => {
						setBusy(true);
						setNote("");
						changeDeletePassword({ data: {
							current,
							next
						} }).then((res) => {
							if (!res.ok) {
								setNote(res.reason === "bad-password" ? "Eski şifre yanlış." : res.reason === "length" ? "Yeni şifre en az 4 karakter." : "Şifre değişmedi.");
								return;
							}
							setCurrent("");
							setNext("");
							setNote("Silme şifresi değişti.");
						}).catch(() => setNote("Şifre değişmedi.")).finally(() => setBusy(false));
					},
					children: "Kaydet"
				}),
				note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-gold",
					children: note
				}) : null
			]
		}) : null]
	});
}
function leaveToCharacters() {
	const id = useSession.getState().activeId;
	(id ? saveCharacter({ data: {
		id,
		save: captureSave()
	} }) : Promise.resolve()).finally(() => {
		useSession.getState().leave();
		import("./middleware-SMghQq71.mjs").then((n) => n.U).then((n) => n.ct).then(({ useHud }) => useHud.getState().setPlaying(false));
	});
}
function LoginPage() {
	const navigate = useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthScreens, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: `${ghost} mt-3`,
			onClick: () => void navigate({ to: "/" }),
			children: "Köye dön"
		})] })
	});
}
//#endregion
export { saveCharacter as a, leaveToCharacters as i, CharacterScreens as n, useCurrentUserState as o, LoginPage as r, useSession as s, AuthScreens as t };
