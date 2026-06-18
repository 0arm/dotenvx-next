Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_chunk = require("./chunk-CKQMccvm.cjs");
const require_webpack_plugin = require("./webpack-plugin.cjs");
const require_turbopack_inject = require("./turbopack-inject.cjs");
let node_fs = require("node:fs");
node_fs = require_chunk.__toESM(node_fs, 1);
let node_path = require("node:path");
node_path = require_chunk.__toESM(node_path, 1);
let node_url = require("node:url");
let _dotenvx_dotenvx = require("@dotenvx/dotenvx");
_dotenvx_dotenvx = require_chunk.__toESM(_dotenvx_dotenvx, 1);
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
	return files.map((f) => node_path.default.resolve(envDir, f)).filter((absPath) => node_fs.default.existsSync(absPath));
}
async function dotenvxNextConfigFn(nextConfig, options, phase, defaults) {
	let resolvedNextConfig;
	if (typeof nextConfig === "function") resolvedNextConfig = { ...await nextConfig(phase, defaults) };
	else resolvedNextConfig = { ...nextConfig };
	const envDir = options.envDir ?? process.cwd();
	const resolvedFiles = resolveExistingFiles(options.files ?? DEFAULT_ENV_FILES, envDir);
	const isTurbopack = !!(process.env.TURBOPACK || process.env.TURBOPACK_DEV || process.env.TURBOPACK_BUILD || process.env.npm_config_turbopack);
	const { parsed: env = {} } = resolvedFiles.length ? _dotenvx_dotenvx.default.config({
		path: resolvedFiles,
		overload: true,
		quiet: true
	}) : { parsed: {} };
	debugLog(`phase=${phase}, isTurbopack=${isTurbopack}, resolvedFiles=${JSON.stringify(resolvedFiles)}, envKeys=${Object.keys(env).join(",")}`);
	if (isTurbopack) require_turbopack_inject.activateTurbopackInjection(env);
	const prevWebpack = resolvedNextConfig.webpack;
	resolvedNextConfig.webpack = (webpackConfig, webpackOptions) => {
		const config = prevWebpack ? prevWebpack(webpackConfig, webpackOptions) : webpackConfig;
		if (!isTurbopack) config.plugins.push(new require_webpack_plugin.DotenvxWebpackPlugin({ env }));
		config.resolve ??= {};
		config.resolve.alias ??= {};
		const alias = config.resolve.alias;
		try {
			alias["@next/env"] = require.resolve("@fantasticfour/dotenvx-next/next-env");
		} catch {
			alias["@next/env"] = (0, node_url.fileURLToPath)(new URL("./next-env-compat.js", require("url").pathToFileURL(__filename).href));
		}
		return config;
	};
	return resolvedNextConfig;
}
function withDotenvx(nextConfig, options = {}) {
	return (phase, defaults) => dotenvxNextConfigFn(nextConfig, options, phase, defaults);
}
//#endregion
exports.withDotenvx = withDotenvx;

//# sourceMappingURL=plugin.cjs.map