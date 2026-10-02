import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
//#region node_modules/.nitro/vite/services/ssr/assets/secrets.server-DvOeM5Py.js
var scrypt$1 = promisify(scrypt);
async function hashSecret(password) {
	const salt = randomBytes(16).toString("hex");
	return `${salt}:${(await scrypt$1(password, salt, 32)).toString("hex")}`;
}
async function verifySecret(password, stored) {
	const [salt, hex] = stored.split(":");
	if (!salt || !hex) return false;
	const key = await scrypt$1(password, salt, 32);
	const prev = Buffer.from(hex, "hex");
	if (prev.length !== key.length) return false;
	return timingSafeEqual(prev, key);
}
//#endregion
export { hashSecret, verifySecret };
