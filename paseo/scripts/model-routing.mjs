import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { resolve as resolvePath } from "node:path";

export const MODEL_CLASSES = [
  "MONITOR_ECONOMY",
  "FAST_READ",
  "CODING_MEDIUM",
  "REASONING_HIGH",
  "REVIEW_HIGH",
];
export const THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"];
export const PASEO_PROVIDERS = ["pi-supervisor", "pi-lead", "pi-peer"];

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function modelParts(model) {
  if (!nonEmptyString(model)) return null;
  const slash = model.indexOf("/");
  if (slash <= 0 || slash === model.length - 1) return null;
  return { provider: model.slice(0, slash), modelId: model.slice(slash + 1) };
}

export function validateRoute(route, label = "route") {
  const errors = [];
  if (!isRecord(route)) return [`${label} must be an object`];
  if (!PASEO_PROVIDERS.includes(route.paseoProvider)) {
    errors.push(`${label}.paseoProvider must be one of ${PASEO_PROVIDERS.join(", ")}`);
  }
  if (!modelParts(route.model)) {
    errors.push(`${label}.model must be <pi-provider>/<model-id> with both segments non-empty`);
  }
  if (!THINKING_LEVELS.includes(route.thinking)) {
    errors.push(`${label}.thinking must be one of ${THINKING_LEVELS.join(", ")}`);
  }
  return errors;
}

export function validateSingleHostConfig(config) {
  const errors = [];
  if (!isRecord(config)) return ["single-host config must be an object"];
  if (config.version !== 1) errors.push("single-host config.version must be 1");
  if (!nonEmptyString(config.hostId)) errors.push("single-host config.hostId is required");
  if (!isRecord(config.routes)) errors.push("single-host config.routes is required");
  for (const modelClass of MODEL_CLASSES) {
    errors.push(...validateRoute(config.routes?.[modelClass], `routes.${modelClass}`));
  }
  return errors;
}

function validateConnection(connection, label) {
  const errors = [];
  if (!isRecord(connection)) return [`${label} must be an object`];
  if (!["local", "remote"].includes(connection.type)) {
    errors.push(`${label}.type must be local or remote`);
  }
  if (connection.type === "remote" && !/^[A-Z][A-Z0-9_]*$/.test(connection.endpointEnv ?? "")) {
    errors.push(`${label}.endpointEnv must be an environment variable name`);
  }
  if (connection.type === "local" && connection.endpointEnv !== undefined) {
    errors.push(`${label}.endpointEnv is not allowed for a local host`);
  }
  return errors;
}

function validateHost(host, hostId) {
  const label = `hosts.${hostId}`;
  const errors = [];
  if (!isRecord(host)) return [`${label} must be an object`];
  errors.push(...validateConnection(host.connection, `${label}.connection`));
  if (typeof host.required !== "boolean") errors.push(`${label}.required must be boolean`);
  if (!Array.isArray(host.capabilities) || host.capabilities.some((item) => !nonEmptyString(item))) {
    errors.push(`${label}.capabilities must be an array of strings`);
  }
  if (!isRecord(host.limits)) {
    errors.push(`${label}.limits must be an object`);
  } else {
    for (const field of ["writers", "readers"]) {
      if (!Number.isInteger(host.limits[field]) || host.limits[field] < 0) {
        errors.push(`${label}.limits.${field} must be a non-negative integer`);
      }
    }
  }
  if (!isRecord(host.routes)) errors.push(`${label}.routes is required`);
  for (const modelClass of MODEL_CLASSES) {
    errors.push(...validateRoute(host.routes?.[modelClass], `${label}.routes.${modelClass}`));
  }
  return errors;
}

export function validateClusterConfig(config) {
  const errors = [];
  if (!isRecord(config)) return ["cluster config must be an object"];
  if (config.version !== 1) errors.push("cluster config.version must be 1");
  if (!isRecord(config.hosts) || Object.keys(config.hosts).length === 0) {
    errors.push("cluster config.hosts must contain at least one host");
  } else {
    for (const [hostId, host] of Object.entries(config.hosts)) {
      if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(hostId)) {
        errors.push(`invalid host id: ${hostId}`);
      }
      errors.push(...validateHost(host, hostId));
    }
  }
  return errors;
}

export function resolveClusterRoute(config, hostId, modelClass, requiredCapabilities = []) {
  const errors = validateClusterConfig(config);
  if (errors.length) {
    const error = new Error(`CONFIG_INVALID: ${errors.join("; ")}`);
    error.code = "CONFIG_INVALID";
    throw error;
  }
  if (!MODEL_CLASSES.includes(modelClass)) {
    const error = new Error(`MODEL_CLASS_UNAVAILABLE: ${modelClass}`);
    error.code = "MODEL_CLASS_UNAVAILABLE";
    throw error;
  }
  const host = config.hosts[hostId];
  if (!host) {
    const error = new Error(`HOST_ROUTE_UNAVAILABLE: ${hostId}`);
    error.code = "HOST_ROUTE_UNAVAILABLE";
    throw error;
  }
  const missing = requiredCapabilities.filter((capability) => !host.capabilities.includes(capability));
  if (missing.length) {
    const error = new Error(`HOST_CAPABILITY_UNAVAILABLE: ${missing.join(", ")}`);
    error.code = "HOST_CAPABILITY_UNAVAILABLE";
    throw error;
  }
  return Object.freeze({
    hostId,
    modelClass,
    connection: host.connection,
    capabilities: [...host.capabilities],
    ...host.routes[modelClass],
  });
}

export async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

export function defaultClusterPath() {
  return resolvePath(homedir(), ".paseo-pi-team", "cluster-routing.local.json");
}

function argumentValue(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

async function main(argv) {
  const command = argv[0] ?? "validate";
  const file = argumentValue(argv, "--file") ?? argv[1];
  if (command === "validate") {
    const target = file ?? defaultClusterPath();
    const config = await readJson(target);
    const errors = isRecord(config.hosts) ? validateClusterConfig(config) : validateSingleHostConfig(config);
    if (errors.length) {
      console.error(JSON.stringify({ ok: false, file: target, errors }, null, 2));
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify({ ok: true, file: target }, null, 2));
    return;
  }
  if (command === "resolve") {
    const target = file ?? defaultClusterPath();
    const hostId = argumentValue(argv, "--host-id");
    const modelClass = argumentValue(argv, "--class");
    if (!hostId || !modelClass) throw new Error("resolve requires --host-id and --class");
    const route = resolveClusterRoute(await readJson(target), hostId, modelClass);
    console.log(JSON.stringify(route, null, 2));
    return;
  }
  throw new Error(`unknown command: ${command}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
