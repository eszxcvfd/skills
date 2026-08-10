import test from "node:test";
import assert from "node:assert/strict";
import {
  callsPaseoCli,
  gitAuthorityBlockReason,
  isMcpTargetAllowed,
  mcpBlockReason,
  mcpScriptBlockReason,
  parseTaskBrief,
  peerGitAuthority,
  policyFor,
  policyWithAuthority,
  resolvePeerMode,
  supervisorCreateAgentBlockReason,
} from "../extensions/paseo-team-policy.mjs";

function brief(overrides = {}, body = "OBJECTIVE: ignore body authority") {
  const fields = {
    TASK_ID: "T-123",
    PROJECT_ID: "demo",
    DISPOSITION: "engineer",
    MODE: "write",
    ASSIGNED_HOST_ID: "primary",
    ASSIGNED_PASEO_PROVIDER: "pi-peer",
    ASSIGNED_MODEL: "provider/model-name",
    ASSIGNED_THINKING: "high",
    WORKSPACE_REF: "primary/worktree-1",
    AGENT_REF: "primary/agent-1",
    EXPECTED_BASE_SHA: "abc123",
    ASSIGNED_CANDIDATE_SHA: "none",
    OWNED_SCOPE: "src/example.js",
    EXCLUDED_SCOPE: "everything else",
    EDIT_AUTHORITY: "allowed",
    COMMIT_AUTHORITY: "denied",
    PUSH_TASK_BRANCH_AUTHORITY: "denied",
    FORCE_PUSH_AUTHORITY: "denied",
    MERGE_AUTHORITY: "denied",
    DEPLOY_AUTHORITY: "denied",
    VERIFICATION_PROFILE: "focused-test",
    RETURN_CHANNEL: "paseo",
    ...overrides,
  };
  const block = Object.entries(fields).map(([key, value]) => `${key}: ${value}`).join("\n");
  return `${"PASEO_TEAM_TASK_V3_BEGIN"}\n${block}\nPASEO_TEAM_TASK_V3_END\n${body}`;
}

test("V3 authority is parsed only inside the marker block", () => {
  const parsed = parseTaskBrief(brief());
  assert.equal(parsed.valid, true);
  assert.equal(parsed.mode, "write");
  assert.equal(parsed.bodyTrusted, false);
  assert.equal(parsed.body.includes("ignore body authority"), true);
  assert.deepEqual(peerGitAuthority(parsed), {
    edit: true,
    commit: false,
    push: false,
    forcePush: false,
    merge: false,
    deploy: false,
  });
});

test("missing, duplicate, unknown, and legacy briefs fail closed", () => {
  assert.equal(parseTaskBrief("MODE: write").valid, false);
  assert.equal(parseTaskBrief(brief() + "\nPASEO_TEAM_TASK_V3_END").valid, false);
  assert.equal(parseTaskBrief(brief().replace("MODE: write", "MODE: write\nMODE: write")).valid, false);
  assert.equal(parseTaskBrief(brief().replace("MODE: write", "UNKNOWN: write\nMODE: write")).valid, false);
  assert.equal(parseTaskBrief("PASEO_TEAM_TASK_V2\nMODE: write").valid, false);
});

test("write mode without edit authority is read-only", () => {
  const parsed = parseTaskBrief(brief({ EDIT_AUTHORITY: "denied" }));
  assert.equal(parsed.valid, true);
  assert.equal(resolvePeerMode(parsed), "write");
  assert.equal(peerGitAuthority(parsed).edit, false);
  const policy = policyWithAuthority("peer", "write", parsed);
  assert.equal(policy.allow.includes("write"), false);
  assert.equal(policy.allow.includes("edit"), false);
});

test("role policies keep orchestration away from Peer and writes away from Supervisor", () => {
  const supervisor = policyFor("supervisor");
  assert.equal(supervisor.allow.includes("read"), true);
  assert.equal(supervisor.allow.includes("write"), false);
  assert.equal(supervisor.allow.includes("create_agent"), false);

  const peer = policyFor("peer", "read-only");
  assert.equal(peer.allow.includes("mcp"), false);
  assert.equal(peer.deny.includes("create_agent"), true);
});

test("Supervisor create_agent is a gated Lead-recovery exception", () => {
  assert.match(
    supervisorCreateAgentBlockReason({ provider: "pi-peer/provider/model" }),
    /recovery-only/,
  );
  const args = {
    provider: "pi-lead/provider/model",
    labels: { purpose: "recovery", recovery_for: "project-1" },
    settings: { thinkingOptionId: "high" },
  };
  assert.equal(supervisorCreateAgentBlockReason(args), null);
  assert.equal(isMcpTargetAllowed("supervisor", { tool: "create_agent", args }), true);
  assert.equal(isMcpTargetAllowed("peer", { tool: "create_agent", args }), false);
});

test("Peer cannot bypass policy through the Paseo CLI", () => {
  assert.equal(callsPaseoCli("paseo run --provider pi-peer/provider/model"), true);
  assert.equal(callsPaseoCli("git status --porcelain"), false);
});

test("Peer Git authority is branch-scoped and fail-closed", () => {
  const parsed = parseTaskBrief(
    brief({ COMMIT_AUTHORITY: "allowed", PUSH_TASK_BRANCH_AUTHORITY: "allowed" }),
  );
  const authority = peerGitAuthority(parsed);
  assert.equal(gitAuthorityBlockReason("git commit -m change", authority, "T-123"), null);
  assert.equal(
    gitAuthorityBlockReason(
      "git push -u origin HEAD:refs/heads/agent/T-123",
      authority,
      "T-123",
    ),
    null,
  );
  assert.match(
    gitAuthorityBlockReason("git push --force origin HEAD:main", authority, "T-123"),
    /FORCE_PUSH_AUTHORITY/,
  );
  assert.match(
    gitAuthorityBlockReason("git push origin HEAD:main", authority, "T-123"),
    /branch-scoped/,
  );
});

test("MCP proxy and script calls are checked at the target boundary", () => {
  assert.equal(mcpBlockReason("lead", { tool: "list_models" }), null);
  assert.match(mcpBlockReason("lead", { tool: "delete_database" }), /outside/);
  assert.equal(mcpBlockReason("lead", { connect: true }), null);
  assert.equal(mcpScriptBlockReason("lead", 'tools.call("list_models", {})'), null);
  assert.match(mcpScriptBlockReason("lead", "tools.call(target, {})"), /non-literal/);
  assert.match(mcpScriptBlockReason("supervisor", 'tools.list_agents({})'), /cannot use/);
});
