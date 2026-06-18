Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_chunk = require("./chunk-CKQMccvm.cjs");
let node_fs = require("node:fs");
node_fs = require_chunk.__toESM(node_fs, 1);
let node_path = require("node:path");
node_path = require_chunk.__toESM(node_path, 1);
//#region src/turbopack-inject.ts
/**
* Turbopack runtime injection — patches fs.writeFile/fs.writeFileSync to intercept
* turbopack's build output and prepend the env inline snippet into runtime files.
*
* Turbopack writes `[turbopack]_runtime.js` directly (bypassing webpack), so we
* can't use the processAssets hook. Instead we intercept fs writes and inject when
* export-detail.json is written (signals compilation is complete).
*/
function debugLog(...args) {
	if (!process.env.DEBUG_DOTENVX_NEXT) return;
	console.log("[dotenvx-next]", ...args);
}
let injectedTurbopackRuntime = false;
function isInjectedTurbopackRuntime() {
	return injectedTurbopackRuntime;
}
/**
* Inject the env inline snippet into turbopack runtime files.
* Called after export-detail.json is written (turbopack compilation complete).
*/
function injectDotenvxInitIntoTurbopackRuntime(nextDirPath, env) {
	if (injectedTurbopackRuntime) return;
	const serverRuntimeFiles = [];
	const edgeWrapperFiles = [];
	const walkDir = (dir) => {
		if (!node_fs.default.existsSync(dir)) return;
		for (const entry of node_fs.default.readdirSync(dir, { withFileTypes: true })) if (entry.isDirectory()) walkDir(node_path.default.join(dir, entry.name));
		else if (entry.name === "[turbopack]_runtime.js") serverRuntimeFiles.push(node_path.default.join(dir, entry.name));
		else if (entry.name.includes("edge-wrapper") && entry.name.endsWith(".js")) edgeWrapperFiles.push(node_path.default.join(dir, entry.name));
	};
	walkDir(nextDirPath);
	debugLog(`turbopack runtime injection: found ${serverRuntimeFiles.length} server runtime files,`, `${edgeWrapperFiles.length} edge wrapper files`);
	if (!serverRuntimeFiles.length) return;
	injectedTurbopackRuntime = true;
	const inlineSnippet = `(function(){if(typeof process!=='undefined'){Object.assign(process.env,${JSON.stringify(env)});}})();`;
	/**
	* Insert inlineSnippet into source respecting ESM constraints.
	* ESM files require all top-level `import` declarations to appear before any
	* other statements, so we must insert after the last import line rather than
	* prepending to the file.
	*/
	const insertIntoSource = (origSource) => {
		const lines = origSource.split("\n");
		let lastImportIdx = -1;
		for (let i = 0; i < lines.length; i++) if (/^import\s/.test(lines[i])) lastImportIdx = i;
		if (lastImportIdx >= 0) {
			lines.splice(lastImportIdx + 1, 0, inlineSnippet);
			return lines.join("\n");
		}
		return [inlineSnippet, origSource].join("\n");
	};
	for (const runtimeFile of serverRuntimeFiles) {
		const origSource = node_fs.default.readFileSync(runtimeFile, "utf8");
		node_fs.default.writeFileSync(runtimeFile, insertIntoSource(origSource));
		debugLog(`injected env into turbopack server runtime: ${runtimeFile}`);
	}
	for (const wrapperFile of edgeWrapperFiles) {
		const origSource = node_fs.default.readFileSync(wrapperFile, "utf8");
		node_fs.default.writeFileSync(wrapperFile, insertIntoSource(origSource));
		debugLog(`injected env into turbopack edge wrapper: ${wrapperFile}`);
	}
}
/**
* Patch global fs methods to detect when turbopack compilation completes,
* then trigger runtime injection.
*/
function activateTurbopackInjection(env) {
	debugLog("activating turbopack fs intercept");
	const origWriteFileFn = node_fs.default.promises.writeFile;
	node_fs.default.promises.writeFile = async function dotenvxPatchedWriteFile(...args) {
		const filePath = args[0].toString();
		debugLog("fs.promises.writeFile:", filePath);
		if (!injectedTurbopackRuntime && filePath.endsWith("/.next/export-detail.json")) injectDotenvxInitIntoTurbopackRuntime(filePath.substring(0, filePath.lastIndexOf("/")), env);
		return origWriteFileFn.apply(node_fs.default.promises, args);
	};
	const origWriteFileSyncFn = node_fs.default.writeFileSync;
	node_fs.default.writeFileSync = function dotenvxPatchedWriteFileSync(...args) {
		const filePath = args[0].toString();
		debugLog("fs.writeFileSync:", filePath);
		if (!injectedTurbopackRuntime && filePath.endsWith("/.next/export-detail.json")) injectDotenvxInitIntoTurbopackRuntime(filePath.substring(0, filePath.lastIndexOf("/")), env);
		origWriteFileSyncFn.apply(node_fs.default, args);
	};
}
//#endregion
exports.activateTurbopackInjection = activateTurbopackInjection;
exports.injectDotenvxInitIntoTurbopackRuntime = injectDotenvxInitIntoTurbopackRuntime;
exports.isInjectedTurbopackRuntime = isInjectedTurbopackRuntime;

//# sourceMappingURL=turbopack-inject.cjs.map