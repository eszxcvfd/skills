/**
 * Pi adapter for the pure Paseo role-policy core.
 *
 * This file is intentionally thin: Pi owns hook registration and active-tool
 * application; the policy decisions live in paseo-team-policy.mjs so they
 * can be tested without a running Pi daemon.
 */

import {
	isToolCallEventType,
	type ExtensionAPI,
} from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	callsPaseoCli,
	detectRole,
	denyReason,
	gitAuthorityBlockReason,
	mcpBlockReason,
	mcpScriptBlockReason,
	parseTaskBrief,
	peerGitAuthority,
	policyWithAuthority,
	resolvePeerMode,
} from "./paseo-team-policy.mjs";

type TeamRole = "supervisor" | "lead" | "peer";
type PeerMode = "write" | "read-only";
type ParsedBrief = ReturnType<typeof parseTaskBrief>;
type Policy = { allow: string[]; deny: string[] };

let currentBrief: ParsedBrief = null;

function leadWriteEnabled(): boolean {
	return ["1", "true", "yes"].includes(
		(process.env.PASEO_TEAM_LEAD_WRITE ?? "").trim().toLowerCase(),
	);
}

function promptsDir(): string {
	const override = process.env.PASEO_TEAM_PROMPTS_DIR?.trim();
	if (override) return override;
	const extensionDir = dirname(fileURLToPath(import.meta.url));
	const nextToExtension = join(extensionDir, "prompts");
	const agentPrompts = join(dirname(extensionDir), "prompts");
	return existsSync(nextToExtension) ? nextToExtension : agentPrompts;
}

const promptCache = new Map<TeamRole, string>();

function loadRolePrompt(role: TeamRole): string | undefined {
	const cached = promptCache.get(role);
	if (cached !== undefined) return cached;
	try {
		const prompt = readFileSync(join(promptsDir(), `${role}.md`), "utf8");
		promptCache.set(role, prompt);
		return prompt;
	} catch {
		console.warn(`[paseo-team] prompt file not found for role "${role}"`);
		return undefined;
	}
}

function extraTools(): string[] {
	return (process.env.PASEO_TEAM_EXTRA_TOOLS ?? "")
		.split(",")
		.map((tool) => tool.trim())
		.filter(Boolean);
}

function currentPeerMode(): PeerMode {
	return resolvePeerMode(currentBrief);
}

function currentPolicy(role: TeamRole): Policy {
	return policyWithAuthority(
		role,
		currentPeerMode(),
		currentBrief,
		leadWriteEnabled(),
	);
}

function applyPolicy(pi: ExtensionAPI, role: TeamRole): Policy {
	const registered = new Set(pi.getAllTools().map((tool) => tool.name));
	const policy = currentPolicy(role);
	const allowed = [...new Set([...policy.allow, ...extraTools()])].filter(
		(tool) => registered.has(tool),
	);
	pi.setActiveTools(allowed);
	return policy;
}

function describePolicy(policy: Policy): string {
	return `allow=[${policy.allow.join(", ")}] deny=[${policy.deny.join(", ")}]`;
}

function registerDebugCommands(pi: ExtensionAPI, role: TeamRole | undefined) {
	pi.registerCommand("team-role", {
		description: "Show the active Paseo team role and its tool policy",
		handler: async (_args, ctx) => {
			if (!role) {
				ctx.ui.notify(
					"PASEO_PI_ROLE is unset — extension is passive (no restrictions).",
					"warning",
				);
				return;
			}
			ctx.ui.notify(
				`role=${role} peerMode=${currentPeerMode()}\n${describePolicy(currentPolicy(role))}`,
				"info",
			);
		},
	});

	pi.registerCommand("team-tools", {
		description: "List active Pi tools under the Paseo team policy",
		handler: async (_args, ctx) => {
			const all = pi.getAllTools();
			const active = new Set(pi.getActiveTools());
			const rows = all.map(
				(tool) => `${active.has(tool.name) ? "active  " : "inactive"} ${tool.name}`,
			);
			console.log(
				`[paseo-team] /team-tools\nrole=${role ?? "none"}\n${rows.join("\n")}`,
			);
			ctx.ui.notify(`${all.length} registered tools; ${active.size} active`, "info");
		},
	});
}

export default function paseoTeamPolicy(pi: ExtensionAPI) {
	const activeRole = detectRole() as TeamRole | undefined;
	if (!activeRole) {
		console.log("[paseo-team] PASEO_PI_ROLE unset — extension passive");
		registerDebugCommands(pi, undefined);
		return;
	}

	const role = activeRole;
	pi.on("session_start", () => {
		currentBrief = null;
		applyPolicy(pi, role);
	});

	pi.on("before_agent_start", async (event) => {
		// Peer authority is recalculated from this prompt on every turn. A
		// missing or invalid V3 block therefore cannot inherit write access.
		if (role === "peer") currentBrief = parseTaskBrief(event.prompt);
		applyPolicy(pi, role);
		const rolePrompt = loadRolePrompt(role);
		if (!rolePrompt) return;
		return {
			systemPrompt: `${event.systemPrompt}\n\n## Paseo Team Role\n${rolePrompt}`,
		};
	});

	pi.on("tool_call", async (event) => {
		const peerMode = currentPeerMode();
		const policy = currentPolicy(role);
		if (policy.deny.includes(event.toolName)) {
			return {
				block: true,
				reason: denyReason(role, peerMode, event.toolName, currentBrief),
			};
		}

		if (isToolCallEventType("mcp", event)) {
			const reason = mcpBlockReason(role, event.input);
			if (reason) return { block: true, reason };
		}

		if (isToolCallEventType("mcp_script", event)) {
			const code =
				typeof event.input?.code === "string" ? event.input.code : "";
			const reason = mcpScriptBlockReason(role, code);
			if (reason) return { block: true, reason };
		}

		if (role === "peer" && isToolCallEventType("bash", event)) {
			const command =
				typeof event.input?.command === "string" ? event.input.command : "";
			if (callsPaseoCli(command)) {
				return {
					block: true,
					reason:
						"Peer cannot drive the Paseo CLI from bash; report a DEPENDENCY_REQUEST to Lead.",
				};
			}
			const reason = gitAuthorityBlockReason(
				command,
				peerGitAuthority(currentBrief),
				currentBrief?.fields?.TASK_ID,
			);
			if (reason) return { block: true, reason };
		}
	});

	registerDebugCommands(pi, role);
}
