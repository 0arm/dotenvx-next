//#region src/turbopack-inject.d.ts
/**
 * Turbopack runtime injection — patches fs.writeFile/fs.writeFileSync to intercept
 * turbopack's build output and prepend the env inline snippet into runtime files.
 *
 * Turbopack writes `[turbopack]_runtime.js` directly (bypassing webpack), so we
 * can't use the processAssets hook. Instead we intercept fs writes and inject when
 * export-detail.json is written (signals compilation is complete).
 */
declare function isInjectedTurbopackRuntime(): boolean;
/**
 * Inject the env inline snippet into turbopack runtime files.
 * Called after export-detail.json is written (turbopack compilation complete).
 */
declare function injectDotenvxInitIntoTurbopackRuntime(nextDirPath: string, env: Record<string, string>): void;
/**
 * Patch global fs methods to detect when turbopack compilation completes,
 * then trigger runtime injection.
 */
declare function activateTurbopackInjection(env: Record<string, string>): void;
//#endregion
export { activateTurbopackInjection, injectDotenvxInitIntoTurbopackRuntime, isInjectedTurbopackRuntime };
//# sourceMappingURL=turbopack-inject.d.cts.map