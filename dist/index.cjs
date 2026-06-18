Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_plugin = require("./plugin.cjs");
const require_next_env_compat = require("./next-env-compat.cjs");
exports.initialEnv = require_next_env_compat.initialEnv;
exports.loadEnvConfig = require_next_env_compat.loadEnvConfig;
exports.processEnv = require_next_env_compat.processEnv;
exports.resetEnv = require_next_env_compat.resetEnv;
exports.updateInitialEnv = require_next_env_compat.updateInitialEnv;
exports.withDotenvx = require_plugin.withDotenvx;
