import { readFile } from "node:fs/promises";

export const FOUNDATION_ROLES = ["lead", "peer", "supervisor"];
const BUNDLE_KEYS = ["active", "explicitOnly", "packagedDisabled"];

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function stringList(value, label) {
  if (!Array.isArray(value) || value.some((item) => !nonEmptyString(item))) {
    return [`${label} must be an array of non-empty strings`];
  }
  return [];
}

export function validateFoundationManifest(manifest) {
  const errors = [];
  if (!isRecord(manifest)) return ["foundation manifest must be an object"];
  if (manifest.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (manifest.kind !== "paseo-foundation-role-bundle") {
    errors.push("kind must be paseo-foundation-role-bundle");
  }
  if (!isRecord(manifest.source)) {
    errors.push("source must be an object");
  } else {
    if (!nonEmptyString(manifest.source.repository)) errors.push("source.repository is required");
    if (!nonEmptyString(manifest.source.ref)) errors.push("source.ref is required");
    if (manifest.source.mode !== "downstream-contract-only") {
      errors.push("source.mode must be downstream-contract-only");
    }
  }
  if (!isRecord(manifest.roleBundles)) {
    errors.push("roleBundles must be an object");
  } else {
    for (const role of FOUNDATION_ROLES) {
      const bundle = manifest.roleBundles[role];
      if (!isRecord(bundle)) {
        errors.push(`roleBundles.${role} must be an object`);
        continue;
      }
      for (const key of BUNDLE_KEYS) {
        errors.push(...stringList(bundle[key], `roleBundles.${role}.${key}`));
      }
      const active = new Set(bundle.active ?? []);
      const explicit = new Set(bundle.explicitOnly ?? []);
      const disabled = new Set(bundle.packagedDisabled ?? []);
      for (const skill of active) {
        if (explicit.has(skill) || disabled.has(skill)) {
          errors.push(`roleBundles.${role}.${skill} appears in conflicting buckets`);
        }
      }
      for (const skill of explicit) {
        if (disabled.has(skill)) {
          errors.push(`roleBundles.${role}.${skill} is both explicitOnly and packagedDisabled`);
        }
      }
    }
  }
  if (!isRecord(manifest.projection)) {
    errors.push("projection must be an object");
  } else {
    if (manifest.projection.providerAdaptersAreTransportOnly !== true) {
      errors.push("projection.providerAdaptersAreTransportOnly must be true");
    }
    if (manifest.projection.leaseAndBriefRequired !== true) {
      errors.push("projection.leaseAndBriefRequired must be true");
    }
    if (manifest.projection.staticSkillPresenceGrantsAuthority !== false) {
      errors.push("projection.staticSkillPresenceGrantsAuthority must be false");
    }
    if (manifest.projection.invalidManifest !== "fail-closed") {
      errors.push("projection.invalidManifest must be fail-closed");
    }
  }
  return errors;
}

export async function readFoundationManifest(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2] ?? "foundation/manifest.json";
  readFoundationManifest(file)
    .then((manifest) => {
      const errors = validateFoundationManifest(manifest);
      if (errors.length) {
        console.error(JSON.stringify({ ok: false, file, errors }, null, 2));
        process.exitCode = 1;
        return;
      }
      console.log(JSON.stringify({ ok: true, file }, null, 2));
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
