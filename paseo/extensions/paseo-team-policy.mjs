/**
 * Pure role-policy core for Paseo + Pi.
 *
 * The real Pi adapter can call these functions from before_agent_start and
 * tool_call hooks. This module intentionally has no Pi dependency, no state
 * store, and no second orchestration engine.
 */

export const ROLES = ["supervisor", "lead", "peer"];
export const PEER_MODES = ["write", "read-only"];
export const MODEL_CLASSES = [
  "MONITOR_ECONOMY",
  "FAST_READ",
  "CODING_MEDIUM",
  "REASONING_HIGH",
  "REVIEW_HIGH",
];

export const V3_BEGIN = "PASEO_TEAM_TASK_V3_BEGIN";
export const V3_END = "PASEO_TEAM_TASK_V3_END";

export const PASEO_TOOLS = Object.freeze({
  discovery: ["list_providers", "list_models", "inspect_provider"],
  workspace: ["create_workspace", "list_workspaces", "archive_workspace"],
  monitoring: ["list_agents", "get_agent_status", "get_agent_activity"],
  orchestration: [
    "create_agent",
    "send_agent_prompt",
    "update_agent",
    "cancel_agent",
    "archive_agent",
  ],
  permissions: ["list_pending_permissions", "respond_to_permission"],
});

const ALL_PASEO_TOOLS = Object.values(PASEO_TOOLS).flat();
const MONITORING_TARGETS = [
  ...PASEO_TOOLS.monitoring,
  "send_agent_prompt",
];
const LEAD_TARGETS = [
  ...PASEO_TOOLS.discovery,
  ...PASEO_TOOLS.workspace,
  ...PASEO_TOOLS.monitoring,
  ...PASEO_TOOLS.orchestration,
  ...PASEO_TOOLS.permissions,
];
const MCP_TOOLS = ["mcp", "mcp_script"];
const PI_READ_ONLY = ["read", "bash"];
const PI_WRITE = ["read", "write", "edit", "bash"];

const AUTHORITY_FIELDS = new Set([
  "TASK_ID",
  "PROJECT_ID",
  "DISPOSITION",
  "MODE",
  "ASSIGNED_HOST_ID",
  "ASSIGNED_PASEO_PROVIDER",
  "ASSIGNED_MODEL",
  "ASSIGNED_THINKING",
  "WORKSPACE_REF",
  "AGENT_REF",
  "EXPECTED_BASE_SHA",
  "ASSIGNED_CANDIDATE_SHA",
  "OWNED_SCOPE",
  "EXCLUDED_SCOPE",
  "EDIT_AUTHORITY",
  "COMMIT_AUTHORITY",
  "PUSH_TASK_BRANCH_AUTHORITY",
  "FORCE_PUSH_AUTHORITY",
  "MERGE_AUTHORITY",
  "DEPLOY_AUTHORITY",
  "VERIFICATION_PROFILE",
  "RETURN_CHANNEL",
]);

const REQUIRED_FIELDS = [...AUTHORITY_FIELDS];
const DISPOSITIONS = new Set([
  "repository-scout",
  "documentation-researcher",
  "solution-architect",
  "engineer",
  "independent-reviewer",
]);
const AUTHORITY_VALUES = new Set(["allowed", "denied"]);

function invalidBrief(reason) {
  return {
    valid: false,
    mode: "read-only",
    fields: null,
    body: "",
    bodyTrusted: false,
    reason,
  };
}

function markerCount(prompt, marker) {
  return [...prompt.matchAll(new RegExp(`^${marker}$`, "gm"))].length;
}

function validateFields(fields) {
  for (const field of REQUIRED_FIELDS) {
    if (!fields[field] || fields[field].trim() === "") {
      return `missing or empty field: ${field}`;
    }
  }
  if (!/^T-[A-Za-z0-9._-]+$/.test(fields.TASK_ID)) {
    return "TASK_ID must use the T-<id> form";
  }
  if (!DISPOSITIONS.has(fields.DISPOSITION)) {
    return `invalid DISPOSITION: ${fields.DISPOSITION}`;
  }
  if (!PEER_MODES.includes(fields.MODE)) {
    return `invalid MODE: ${fields.MODE}`;
  }
  if (!/^pi-(supervisor|lead|peer)$/.test(fields.ASSIGNED_PASEO_PROVIDER)) {
    return `invalid ASSIGNED_PASEO_PROVIDER: ${fields.ASSIGNED_PASEO_PROVIDER}`;
  }
  if (!/^[^/]+\/.+$/.test(fields.ASSIGNED_MODEL)) {
    return "ASSIGNED_MODEL must be <pi-provider>/<model-id>";
  }
  for (const field of [
    "EDIT_AUTHORITY",
    "COMMIT_AUTHORITY",
    "PUSH_TASK_BRANCH_AUTHORITY",
  ]) {
    if (!AUTHORITY_VALUES.has(fields[field])) {
      return `invalid ${field}: ${fields[field]}`;
    }
  }
  for (const field of [
    "FORCE_PUSH_AUTHORITY",
    "MERGE_AUTHORITY",
    "DEPLOY_AUTHORITY",
  ]) {
    if (fields[field] !== "denied") {
      return `${field} must always be denied`;
    }
  }
  if (fields.RETURN_CHANNEL !== "paseo") {
    return "RETURN_CHANNEL must be paseo";
  }
  return null;
}

/**
 * Parse only the marker block. The task body is deliberately returned as
 * untrusted text and is never consulted for authority.
 */
export function parseTaskBrief(prompt) {
  if (typeof prompt !== "string") return invalidBrief("prompt is not text");
  if (/PASEO_TEAM_TASK_V(?:1|2)\b/.test(prompt)) {
    return invalidBrief("legacy V1/V2 brief");
  }
  if (markerCount(prompt, V3_BEGIN) !== 1 || markerCount(prompt, V3_END) !== 1) {
    return invalidBrief("missing, duplicate, or malformed V3 markers");
  }

  const beginLine = prompt.indexOf(V3_BEGIN);
  const endLine = prompt.indexOf(V3_END);
  if (beginLine < 0 || endLine < beginLine) {
    return invalidBrief("V3 end marker is not after begin marker");
  }

  const blockStart = beginLine + V3_BEGIN.length;
  const block = prompt.slice(blockStart, endLine);
  const fields = {};
  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 1) return invalidBrief("authority block contains a non-field line");
    const field = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!AUTHORITY_FIELDS.has(field)) return invalidBrief(`unknown field: ${field}`);
    if (Object.hasOwn(fields, field)) return invalidBrief(`duplicate field: ${field}`);
    fields[field] = value;
  }

  const reason = validateFields(fields);
  if (reason) return invalidBrief(reason);
  return {
    valid: true,
    mode: fields.MODE,
    fields: Object.freeze(fields),
    body: prompt.slice(endLine + V3_END.length),
    bodyTrusted: false,
    reason: null,
  };
}

export function resolvePeerMode(brief) {
  return brief?.valid && brief.mode === "write" ? "write" : "read-only";
}

export function peerGitAuthority(brief) {
  if (!brief?.valid) {
    return { edit: false, commit: false, push: false, forcePush: false, merge: false, deploy: false };
  }
  const fields = brief.fields;
  const edit = brief.mode === "write" && fields.EDIT_AUTHORITY === "allowed";
  return {
    edit,
    commit: edit && fields.COMMIT_AUTHORITY === "allowed",
    push: edit && fields.PUSH_TASK_BRANCH_AUTHORITY === "allowed",
    forcePush: false,
    merge: false,
    deploy: false,
  };
}

export function detectRole(env = process.env) {
  const value = String(env.PASEO_PI_ROLE ?? "").trim().toLowerCase();
  return ROLES.includes(value) ? value : undefined;
}

export function policyFor(role, peerMode = "read-only", leadWrite = false) {
  if (!ROLES.includes(role)) throw new Error(`unknown role: ${role}`);
  if (role === "supervisor") {
    return {
      allow: ["read", "mcp", ...MONITORING_TARGETS],
      deny: ["write", "edit", "mcp_script", ...ALL_PASEO_TOOLS.filter((tool) => !MONITORING_TARGETS.includes(tool))],
    };
  }
  if (role === "lead") {
    return {
      allow: [
        ...(leadWrite ? PI_WRITE : PI_READ_ONLY),
        ...LEAD_TARGETS,
        ...MCP_TOOLS,
      ],
      deny: [],
    };
  }
  if (peerMode === "write") {
    return { allow: [...PI_WRITE], deny: [...ALL_PASEO_TOOLS, ...MCP_TOOLS] };
  }
  return {
    allow: [...PI_READ_ONLY],
    deny: [...ALL_PASEO_TOOLS, ...MCP_TOOLS, "write", "edit"],
  };
}

export function policyWithAuthority(role, peerMode, brief, leadWrite = false) {
  const policy = policyFor(role, peerMode, leadWrite);
  const authority = peerGitAuthority(brief);
  if (role === "peer" && peerMode === "write" && !authority.edit) {
    return {
      allow: policy.allow.filter((tool) => !["write", "edit"].includes(tool)),
      deny: [...new Set([...policy.deny, "write", "edit"])],
    };
  }
  return policy;
}

export function matchesPaseoToolName(name, known) {
  return known.includes(name) || known.some((tool) => name.endsWith(`_${tool}`) || name.endsWith(`:${tool}`));
}

const PASEO_CLI_RE =
  /\b(paseo|paseo-pi|pio)(?:\.(?:cmd|exe|ps1|sh))?\s+(?:run|send|ls|agent|workspace|provider|schedule|heartbeat|daemon|status|attach|logs|stop|delete|archive|inspect|wait|import|clone|onboard|start|restart|hub|chat|terminal|script|loop|permit|speech|hooks|help)\b/i;

export function callsPaseoCli(command) {
  return typeof command === "string" && PASEO_CLI_RE.test(command);
}

// Peer Git authority is checked again at the bash boundary. The tool
// allowlist controls write/edit, but a shell can still reach commit/push/merge
// unless the command is checked explicitly.
const GIT_COMMIT_RE = /\bgit\b[^|;&]*\bcommit\b/i;
const GIT_PUSH_RE = /\bgit\b[^|;&]*\bpush\b/i;
const GIT_MERGE_RE = /\bgit\b[^|;&]*\bmerge\b/i;
const GIT_AMEND_RE = /\bgit\b[^|;&]*\bcommit\b[^|;&]*--amend\b/i;
const EXACT_PUSH_RE =
  /^\s*git\s+push\s+-u\s+origin\s+HEAD:refs\/heads\/([A-Za-z0-9][A-Za-z0-9._/-]*)\s*$/;

function detectsForcePush(command) {
  for (const segment of String(command).split(/[|;&]+/)) {
    if (!GIT_PUSH_RE.test(segment)) continue;
    if (/--force(?:-with-lease)?\b/i.test(segment)) return true;
    if (/(?:^|\s)-[a-z]*f[a-z]*(?:\s|$)/i.test(segment)) return true;
    if (/(?:^|\s)\+/i.test(segment)) return true;
  }
  return false;
}

export function expectedTaskBranch(taskId) {
  const id = typeof taskId === "string" ? taskId.trim() : "";
  if (!id || /\s/.test(id)) return null;
  return `agent/${id}`;
}

export function gitAuthorityBlockReason(command, authority, taskId) {
  if (typeof command !== "string") return null;
  const effective = authority ?? {};
  if (detectsForcePush(command)) {
    return "FORCE_PUSH_AUTHORITY is always denied for Peers (including force flags and +refspec forms). Ask Lead to integrate the work.";
  }
  if (GIT_AMEND_RE.test(command)) {
    return "git commit --amend is always denied for Peers; create a new correction commit instead.";
  }
  if (GIT_PUSH_RE.test(command)) {
    if (effective.push !== true) {
      return "PUSH_TASK_BRANCH_AUTHORITY is denied for this task.";
    }
    const expected = expectedTaskBranch(taskId);
    const match = command.match(EXACT_PUSH_RE);
    if (!expected || !match || match[1] !== expected) {
      return `Push authority is branch-scoped: only git push -u origin HEAD:refs/heads/${expected ?? "agent/<TASK_ID>"} is allowed.`;
    }
  }
  if (GIT_COMMIT_RE.test(command) && effective.commit !== true) {
    return "COMMIT_AUTHORITY is denied for this task.";
  }
  if (GIT_MERGE_RE.test(command) && effective.merge !== true) {
    return "MERGE_AUTHORITY is always denied for Peers.";
  }
  return null;
}

function unwrapMcpArgs(input) {
  if (!input || typeof input !== "object") return null;
  if (input.args && typeof input.args === "object") return input.args;
  return input;
}

export function supervisorCreateAgentBlockReason(input) {
  const args = unwrapMcpArgs(input);
  if (!args) return "Supervisor create_agent requires an args object";
  const provider = typeof args.provider === "string" ? args.provider : "";
  if (!/^pi-lead\/[^/]+\/.+/.test(provider)) {
    return "Supervisor create_agent is recovery-only: provider must be pi-lead/<pi-provider>/<model-id>";
  }
  if (args.settings?.model !== undefined) {
    return "Supervisor create_agent must not place model in settings";
  }
  const labels = args.labels;
  if (!labels || typeof labels !== "object") {
    return "Supervisor create_agent requires recovery labels";
  }
  if (!["recovery", "bootstrap"].includes(labels.purpose)) {
    return "Supervisor create_agent labels.purpose must be recovery or bootstrap";
  }
  if (typeof labels.recovery_for !== "string" || !labels.recovery_for.trim()) {
    return "Supervisor create_agent labels.recovery_for is required";
  }
  if (typeof args.settings?.thinkingOptionId !== "string" || !args.settings.thinkingOptionId.trim()) {
    return "Supervisor create_agent requires settings.thinkingOptionId";
  }
  return null;
}

function mcpTarget(input) {
  if (!input || typeof input !== "object" || typeof input.tool !== "string") return null;
  return input.tool;
}

const MCP_META_KEYS = ["connect", "search", "describe", "instructions", "server"];
const MCP_META_ACTIONS = new Set(["ui-messages"]);

export function mcpBlockReason(role, input) {
  if (role === "peer") {
    return "Peer cannot use the MCP proxy; report a DEPENDENCY_REQUEST to Lead.";
  }
  if (!input || typeof input !== "object") {
    return "MCP input is not an object; blocked fail-closed.";
  }
  const record = input;
  if (Object.hasOwn(record, "tool")) {
    if (typeof record.tool !== "string" || !record.tool.trim()) {
      return "MCP target is missing or not a string; blocked fail-closed.";
    }
    if (!isMcpTargetAllowed(role, input)) {
      return role === "supervisor"
        ? "Supervisor may only monitor through MCP, with a gated Lead-recovery create_agent exception."
        : `MCP target ${record.tool} is outside the Lead allowlist.`;
    }
    return null;
  }
  if (
    Object.keys(record).length === 0 ||
    MCP_META_KEYS.some((key) => Object.hasOwn(record, key)) ||
    (record.action && MCP_META_ACTIONS.has(record.action))
  ) {
    return null;
  }
  return "MCP input has no determinable target; blocked fail-closed.";
}

const MCP_SCRIPT_DIRECT_CALL_RE =
  /\btools\s*\[\s*["'`]call["'`]\s*\]\s*\(\s*["'`]([^"'`]+)["'`]|\btools\.call\(\s*["'`]([^"'`]+)["'`]|\btools\[["'`]([^"'`]+)["'`]\]\s*\(|\btools\.([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
const MCP_SCRIPT_DYNAMIC_CALL_RE =
  /\btools\s*\.\s*call\s*\(\s*(?!["'`])|\btools\s*\[\s*["'`]call["'`]\s*\]\s*\(\s*(?!["'`])|\btools\s*\[\s*(?![\s"'`\]])/g;

export function mcpScriptBlockReason(role, code) {
  if (typeof code !== "string") return "mcp_script code is not text; blocked fail-closed.";
  const allowed = role === "supervisor" ? MONITORING_TARGETS : role === "lead" ? LEAD_TARGETS : [];
  for (const _match of code.matchAll(MCP_SCRIPT_DYNAMIC_CALL_RE)) {
    return "mcp_script uses a non-literal MCP target; blocked fail-closed.";
  }
  for (const match of code.matchAll(MCP_SCRIPT_DIRECT_CALL_RE)) {
    const name = match[1] ?? match[2] ?? match[3] ?? match[4] ?? "";
    if (["call", "describe", "search", "emit"].includes(name)) continue;
    if (!matchesPaseoToolName(name, allowed)) {
      return `MCP target ${name} is outside the ${role} allowlist.`;
    }
  }
  return role === "supervisor"
    ? "Supervisor cannot use mcp_script because its dynamic arguments cannot be recovery-checked."
    : null;
}

export function isMcpTargetAllowed(role, input) {
  const target = mcpTarget(input);
  if (!target) return false;
  if (role === "peer") return false;
  if (role === "lead") return matchesPaseoToolName(target, LEAD_TARGETS);
  if (matchesPaseoToolName(target, MONITORING_TARGETS)) return true;
  return matchesPaseoToolName(target, ["create_agent"]) && !supervisorCreateAgentBlockReason(input);
}

export function denyReason(role, peerMode, toolName, brief = null) {
  if (role === "peer" && MCP_TOOLS.includes(toolName)) {
    return "Peer cannot use the MCP proxy; report a DEPENDENCY_REQUEST to Lead.";
  }
  if (role === "peer" && matchesPaseoToolName(toolName, ALL_PASEO_TOOLS)) {
    return "Peer cannot orchestrate agents or manage workspaces.";
  }
  if (role === "peer" && resolvePeerMode(brief) !== "write" && ["write", "edit"].includes(toolName)) {
    return "This Peer turn is read-only because the V3 brief did not grant write authority.";
  }
  if (role === "supervisor" && ["write", "edit"].includes(toolName)) {
    return "Supervisor cannot modify product files; report an observation to Lead.";
  }
  return `Tool ${toolName} is blocked by the ${role} role policy.`;
}

export const toolCatalog = Object.freeze({
  allPaseo: [...ALL_PASEO_TOOLS],
  monitoring: [...MONITORING_TARGETS],
  lead: [...LEAD_TARGETS],
});
