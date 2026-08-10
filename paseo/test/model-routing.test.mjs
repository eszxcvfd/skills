import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveClusterRoute,
  validateClusterConfig,
  validateRoute,
} from "../scripts/model-routing.mjs";

const route = (provider = "pi-peer", model = "vendor/model", thinking = "high") => ({
  paseoProvider: provider,
  model,
  thinking,
});

function cluster() {
  const routes = {
    MONITOR_ECONOMY: route("pi-supervisor", "vendor/monitor", "low"),
    FAST_READ: route("pi-peer", "vendor/fast", "low"),
    CODING_MEDIUM: route("pi-peer", "vendor/code", "medium"),
    REASONING_HIGH: route("pi-peer", "vendor/reason", "high"),
    REVIEW_HIGH: route("pi-peer", "openrouter/vendor/review", "xhigh"),
  };
  return {
    version: 1,
    hosts: {
      primary: {
        connection: { type: "local" },
        required: true,
        capabilities: ["git-read", "git-write", "focused-test"],
        limits: { writers: 1, readers: 2 },
        routes,
      },
    },
  };
}

test("cluster routing validates and preserves multi-slash model ids", () => {
  const config = cluster();
  assert.deepEqual(validateClusterConfig(config), []);
  assert.deepEqual(validateRoute(route("pi-peer", "openrouter/vendor/name")), []);
  const resolved = resolveClusterRoute(config, "primary", "REVIEW_HIGH");
  assert.equal(resolved.model, "openrouter/vendor/review");
});

test("routing fails instead of falling back to another host or class", () => {
  const config = cluster();
  assert.throws(
    () => resolveClusterRoute(config, "missing", "FAST_READ"),
    (error) => error.code === "HOST_ROUTE_UNAVAILABLE",
  );
  assert.throws(
    () => resolveClusterRoute(config, "primary", "REVIEW_HIGH", ["independent-review"]),
    (error) => error.code === "HOST_CAPABILITY_UNAVAILABLE",
  );
});

test("invalid route model and thinking are reported", () => {
  const errors = validateRoute({ paseoProvider: "pi-peer", model: "missing-model", thinking: "turbo" });
  assert.equal(errors.length, 2);
});
