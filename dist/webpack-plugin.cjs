Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region src/webpack-plugin.ts
const PLUGIN_NAME = "DotenvxNextWebpackPlugin";
const SERVER_RUNTIME_ASSETS = [
	"webpack-runtime.js",
	"../webpack-runtime.js",
	"webpack-api-runtime.js",
	"../webpack-api-runtime.js"
];
const EDGE_RUNTIME_ASSETS = [
	"edge-runtime-webpack.js",
	"webpack-runtime.js",
	"../webpack-runtime.js"
];
var DotenvxWebpackPlugin = class {
	constructor(options) {
		this.options = options;
	}
	apply(compiler) {
		const { env } = this.options;
		const inlineSnippet = `(function(){if(typeof process!=='undefined'){Object.assign(process.env,${JSON.stringify(env)});}})();`;
		const webpack = require("webpack");
		compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
			compilation.hooks.processAssets.tap({
				name: PLUGIN_NAME,
				stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
			}, () => {
				const runtimeNames = new Set([...SERVER_RUNTIME_ASSETS, ...EDGE_RUNTIME_ASSETS]);
				for (const assetName of runtimeNames) {
					if (!compilation.getAsset(assetName)) continue;
					compilation.updateAsset(assetName, (origSource) => {
						const updatedSourceStr = [inlineSnippet, origSource.source().toString()].join("\n");
						return new webpack.sources.RawSource(updatedSourceStr);
					});
				}
			});
		});
	}
};
//#endregion
exports.DotenvxWebpackPlugin = DotenvxWebpackPlugin;

//# sourceMappingURL=webpack-plugin.cjs.map