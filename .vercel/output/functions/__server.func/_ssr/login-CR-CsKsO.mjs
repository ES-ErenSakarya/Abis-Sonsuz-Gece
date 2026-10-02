import { Nt as require_jsx_runtime } from "../_libs/@react-three/fiber+[...].mjs";
import { y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useCurrentUserState, r as LoginPage } from "./AccountScreens-D6xLmeiX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-CR-CsKsO.js
var import_jsx_runtime = require_jsx_runtime();
function LoginRoute() {
	const { user, isPending } = useCurrentUserState();
	if (!isPending && user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginPage, {});
}
//#endregion
export { LoginRoute as component };
