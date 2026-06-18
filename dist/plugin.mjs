import { n as __require, t as DotenvxWebpackPlugin } from "./webpack-plugin-BOs1JrvH.mjs";
import { activateTurbopackInjection } from "./turbopack-inject.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenvx from "@dotenvx/dotenvx";
//#region src/plugin.ts
/**
* withDotenvx() — Next.js config wrapper that loads dotenvx secrets at build time
* and inlines them into the webpack/turbopack runtime so they are available before
* any user code evaluates (Prisma Pool, etc.) at module-load time.
*
* Strategy:
* - At build time, call dotenvx.config() to decrypt env files and capture the
*   resolved key-value pairs.
* - Webpack builds: prepend Object.assign(process.env, {...}) into webpack-runtime.js
*   via DotenvxWebpackPlugin (processAssets hook at PROCESS_ASSETS_STAGE_ADDITIONS).
* - Turbopack builds: patch fs.writeFile to detect compilation completion and inject
*   the same snippet into [turbopack]_runtime.js files.
* - Webpack alias: aliases @next/env inside webpack-bundled code only (hot-reload,
*   preview mode). Does NOT cover Next.js's pre-webpack startup calls — use npm
*   overrides for full coverage. See README.
*/
const DEFAULT_ENV_FILES = [".env"];
const PLUGIN_DEBUG = !!process.env.DEBUG_DOTENVX_NEXT;
function debugLog(...args) {
	if (!PLUGIN_DEBUG) return;
	console.log("[dotenvx-next]", ...args);
}
function resolveExistingFiles(files, envDir) {
	return files.map((f) => path.resolve(envDir, f)).filter((absPath) => fs.existsSync(absPath));
}
async function dotenvxNextConfigFn(nextConfig, options, phase, defaults) {
	let resolvedNextConfig;
	if (typeof nextConfig === "function") resolvedNextConfig = { ...await nextConfig(phase, defaults) };
	else resolvedNextConfig = { ...nextConfig };
	const envDir = options.envDir ?? process.cwd();
	const resolvedFiles = resolveExistingFiles(options.files ?? DEFAULT_ENV_FILES, envDir);
	const isTurbopack = !!(process.env.TURBOPACK || process.env.TURBOPACK_DEV || process.env.TURBOPACK_BUILD || process.env.npm_config_turbopack);
	const { parsed: env = {} } = resolvedFiles.length ? dotenvx.config({
		path: resolvedFiles,
		overload: true,
		quiet: true
	}) : { parsed: {} };
	debugLog(`phase=${phase}, isTurbopack=${isTurbopack}, resolvedFiles=${JSON.stringify(resolvedFiles)}, envKeys=${Object.keys(env).join(",")}`);
	if (isTurbopack) activateTurbopackInjection(env);
	const prevWebpack = resolvedNextConfig.webpack;
	resolvedNextConfig.webpack = (webpackConfig, webpackOptions) => {
		const config = prevWebpack ? prevWebpack(webpackConfig, webpackOptions) : webpackConfig;
		if (!isTurbopack) config.plugins.push(new DotenvxWebpackPlugin({ env }));
		config.resolve ??= {};
		config.resolve.alias ??= {};
		const alias = config.resolve.alias;
		try {
			alias["@next/env"] = __require.resolve("@fantasticfour/dotenvx-next/next-env");
		} catch {
			alias["@next/env"] = fileURLToPath(new URL("./next-env-compat.js", import.meta.url));
		}
		return config;
	};
	return resolvedNextConfig;
}
function withDotenvx(nextConfig, options = {}) {
	return (phase, defaults) => dotenvxNextConfigFn(nextConfig, options, phase, defaults);
}
//#endregion
export { withDotenvx };

//# sourceMappingURL=plugin.mjs.map