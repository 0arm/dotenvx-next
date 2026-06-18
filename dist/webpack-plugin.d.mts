import * as _$webpack from "webpack";

//#region src/webpack-plugin.d.ts
/**
 * DotenvxWebpackPlugin — injects resolved env vars into webpack runtime files.
 *
 * At build time, dotenvx has already decrypted the env files and provided the
 * key-value pairs. We serialize them into a compact Object.assign(process.env, {...})
 * snippet and prepend it to the webpack runtime so every value is available before
 * any user module code runs (before Prisma Pool, etc. can evaluate at import time).
 */
type WebpackCompiler = _$webpack.Compiler;
interface DotenvxWebpackPluginOptions {
  /** Resolved env key-value pairs from dotenvx.config() at build time */
  env: Record<string, string>;
}
declare class DotenvxWebpackPlugin {
  private readonly options;
  constructor(options: DotenvxWebpackPluginOptions);
  apply(compiler: WebpackCompiler): void;
}
//#endregion
export { DotenvxWebpackPlugin, DotenvxWebpackPluginOptions };
//# sourceMappingURL=webpack-plugin.d.mts.map