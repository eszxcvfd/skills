import test from "node:test";
import assert from "node:assert/strict";
import { readFoundationManifest, validateFoundationManifest } from "../scripts/foundation-manifest.mjs";

test("Foundation role admission manifest is valid and fail-closed", async () => {
  const manifest = await readFoundationManifest("foundation/manifest.json");
  assert.deepEqual(validateFoundationManifest(manifest), []);
  const invalid = structuredClone(manifest);
  invalid.projection.staticSkillPresenceGrantsAuthority = true;
  assert.match(validateFoundationManifest(invalid).join("; "), /must be false/);
});
