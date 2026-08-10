import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolveClusterRoute, readJson, validateClusterConfig, defaultClusterPath } from "./model-routing.mjs";
import { validateFoundationManifest } from "./foundation-manifest.mjs";

function argumentValue(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

const args = process.argv.slice(2);
const file = argumentValue(args, "--cluster") ?? defaultClusterPath();
const manifestFile = argumentValue(args, "--manifest") ?? fileURLToPath(new URL("../foundation/manifest.json", import.meta.url));
const hostId = argumentValue(args, "--host-id");
const strict = args.includes("--strict");
const json = args.includes("--json");
const checks = [];

try {
  await access(manifestFile);
  const manifest = await readJson(manifestFile);
  const manifestErrors = validateFoundationManifest(manifest);
  checks.push({ name: "foundation-manifest", ok: manifestErrors.length === 0, errors: manifestErrors, detail: manifestFile });
} catch (error) {
  checks.push({ name: "foundation-manifest", ok: false, detail: error.message });
}

try {
  await access(file);
  checks.push({ name: "cluster-config-readable", ok: true, detail: file });
  const config = await readJson(file);
  const errors = validateClusterConfig(config);
  checks.push({ name: "cluster-schema", ok: errors.length === 0, errors });
  if (hostId) {
    const route = resolveClusterRoute(config, hostId, "FAST_READ");
    checks.push({ name: "host-route", ok: true, detail: `${route.paseoProvider}/${route.model}` });
    if (route.connection.type === "remote") {
      const endpointSet = Boolean(process.env[route.connection.endpointEnv]);
      checks.push({ name: "remote-endpoint-env", ok: endpointSet, detail: route.connection.endpointEnv });
    }
  }
} catch (error) {
  checks.push({ name: error.code ?? "preflight", ok: false, detail: error.message });
}

const ok = checks.every((check) => check.ok);
if (json) {
  console.log(JSON.stringify({ ok, strict, file, checks }, null, 2));
} else {
  for (const check of checks) console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}${check.detail ? `: ${check.detail}` : ""}`);
}
if (!ok || (strict && !hostId)) process.exitCode = 1;
