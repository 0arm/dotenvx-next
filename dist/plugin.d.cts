import { NextConfig } from "next";

//#region src/plugin.d.ts
interface DotenvxNextOptions {
  /**
   * Env files to load. Defaults to ['.env'], filtered to files that actually
   * exist in envDir.
   */
  files?: string[];
  /**
   * Directory where env files live. Defaults to process.cwd().
   */
  envDir?: string;
}
type NextConfigFn = (phase: string, defaults: {
  defaultConfig: NextConfig;
}) => NextConfig | Promise<NextConfig>;
declare function withDotenvx(nextConfig: NextConfig | NextConfigFn, options?: DotenvxNextOptions): NextConfigFn;
//#endregion
export { DotenvxNextOptions, withDotenvx };
//# sourceMappingURL=plugin.d.cts.map