Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_chunk = require("./chunk-CKQMccvm.cjs");
let _dotenvx_dotenvx = require("@dotenvx/dotenvx");
_dotenvx_dotenvx = require_chunk.__toESM(_dotenvx_dotenvx, 1);
//#region src/next-env-compat.ts
/**
* Drop-in replacement for @next/env that wraps loadEnvConfig to also call
* dotenvx.config() so dotenvx-decrypted values are present in process.env
* whenever loadEnvConfig is invoked.
*
* Two coverage levels:
*
* 1. Webpack alias (partial): plugin.ts sets webpack resolve.alias['@next/env']
*    to this module. Intercepts imports of @next/env INSIDE webpack-bundled code
*    (hot-reload handlers, preview mode helpers in the server bundle).
*    Does NOT cover Next.js's own Node.js startup calls to loadEnvConfig, which
*    happen before webpack runs.
*
* 2. npm overrides (full): users add "@next/env" → "@fantasticfour/dotenvx-next"
*    in package.json overrides/resolutions. Node.js resolves require('@next/env')
*    to this package's CJS entry, which re-exports loadEnvConfig, covering startup.
*
* @next/env is CJS-only, so createRequire is used to load it from ESM.
*/
const { loadEnvConfig: originalLoadEnvConfig, initialEnv, updateInitialEnv, processEnv, resetEnv } = (0, require("node:module").createRequire)(require("url").pathToFileURL(__filename).href)("@next/env");
function loadEnvConfig(...args) {
	_dotenvx_dotenvx.default.config({ quiet: true });
	return originalLoadEnvConfig(...args);
}
//#endregion
exports.initialEnv = initialEnv;
exports.loadEnvConfig = loadEnvConfig;
exports.processEnv = processEnv;
exports.resetEnv = resetEnv;
exports.updateInitialEnv = updateInitialEnv;

//# sourceMappingURL=next-env-compat.cjs.map