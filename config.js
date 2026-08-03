import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolvePaseoNodeEnv } from "./paseo-env.js";
import { z } from "zod";
import { expandTilde } from "../utils/path.js";
import { loadPersistedConfig, LogFormatSchema, LogLevelSchema, } from "./persisted-config.js";
import { ProviderOverrideSchema } from "./agent/provider-launch-config.js";
import { AgentProviderSchema } from "@getpaseo/protocol/provider-manifest";
import { hashDaemonPassword } from "./auth.js";
import { resolveSpeechConfig } from "./speech/speech-config-resolver.js";
import { mergeHostnames, parseHostnamesEnv } from "./hostnames.js";
const DEFAULT_PORT = 6767;
const DEFAULT_RELAY_ENDPOINT = "relay.paseo.sh:443";
const DEFAULT_APP_BASE_URL = "https://app.paseo.sh";
const DEFAULT_TRUSTED_PROXIES = ["loopback"];
export function resolveBundledWebUiDistDir(input = {}) {
    const moduleUrl = input.moduleUrl ?? import.meta.url;
    const moduleDir = path.dirname(fileURLToPath(moduleUrl));
    if (path.basename(moduleDir) === "server" && path.basename(path.dirname(moduleDir)) === "src") {
        return path.resolve(moduleDir, "..", "..", "dist", "server", "web-ui");
    }
    if (path.basename(moduleDir) === "server" &&
        path.basename(path.dirname(moduleDir)) === "server" &&
        path.basename(path.dirname(path.dirname(moduleDir))) === "dist") {
        const appDistDir = input.resourcesPath ? path.join(input.resourcesPath, "app-dist") : null;
        if (appDistDir && existsSync(appDistDir)) {
            return appDistDir;
        }
        return path.resolve(moduleDir, "..", "web-ui");
    }
    return path.resolve(moduleDir, "web-ui");
}
const processResourcesPath = "resourcesPath" in process ? process.resourcesPath : undefined;
const BUNDLED_WEB_UI_DIST_DIR = resolveBundledWebUiDistDir({
    resourcesPath: typeof processResourcesPath === "string" ? processResourcesPath : undefined,
});
function parseBooleanEnv(value) {
    if (value === undefined) {
        return undefined;
    }
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) {
        return true;
    }
    if (["0", "false", "no", "off"].includes(normalized)) {
        return false;
    }
    return undefined;
}
function normalizeLogEnv(value) {
    if (value === undefined) {
        return undefined;
    }
    return value.trim().toLowerCase();
}
function resolveLogConfigFromEnv(env, persisted) {
    const envLogLevel = LogLevelSchema.safeParse(normalizeLogEnv(env.PASEO_LOG_LEVEL));
    const envLogFormat = LogFormatSchema.safeParse(normalizeLogEnv(env.PASEO_LOG_FORMAT));
    if (!envLogLevel.success && !envLogFormat.success) {
        return persisted.log;
    }
    return {
        ...persisted.log,
        ...(envLogLevel.success ? { level: envLogLevel.data } : {}),
        ...(envLogFormat.success ? { format: envLogFormat.data } : {}),
    };
}
const OptionalVoiceLlmProviderSchema = z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => typeof value === "string" ? value.trim().toLowerCase() : null)
    .pipe(z.union([AgentProviderSchema, z.null()]));
function parseOptionalVoiceLlmProvider(value) {
    const parsed = OptionalVoiceLlmProviderSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
}
function extractProviderOverrides(providers) {
    if (!providers) {
        return undefined;
    }
    const providerOverrides = Object.entries(providers).flatMap(([providerId, provider]) => {
        const parsed = ProviderOverrideSchema.safeParse(provider);
        return parsed.success ? [[providerId, parsed.data]] : [];
    });
    return providerOverrides.length > 0 ? Object.fromEntries(providerOverrides) : undefined;
}
function extractAgentProviderSettings(providerOverrides) {
    if (!providerOverrides) {
        return undefined;
    }
    const runtimeSettings = Object.entries(providerOverrides).flatMap(([providerId, provider]) => {
        const parsedProviderId = AgentProviderSchema.safeParse(providerId);
        if (!parsedProviderId.success || (!provider.command && !provider.env)) {
            return [];
        }
        return [
            [
                parsedProviderId.data,
                {
                    command: provider.command
                        ? {
                            mode: "replace",
                            argv: provider.command,
                        }
                        : undefined,
                    env: provider.env,
                },
            ],
        ];
    });
    return runtimeSettings.length > 0
        ? Object.fromEntries(runtimeSettings)
        : undefined;
}
function resolveTlsFromEnv(envValue, persistedValue, fallback) {
    if (envValue !== undefined) {
        return parseBooleanEnv(envValue) ?? false;
    }
    return persistedValue ?? fallback;
}
function resolveRelayConfig(input) {
    const enabled = input.cliRelayEnabled ??
        parseBooleanEnv(input.env.PASEO_RELAY_ENABLED) ??
        input.persisted.daemon?.relay?.enabled ??
        true;
    const endpoint = input.env.PASEO_RELAY_ENDPOINT ??
        input.persisted.daemon?.relay?.endpoint ??
        DEFAULT_RELAY_ENDPOINT;
    const publicEndpoint = input.env.PASEO_RELAY_PUBLIC_ENDPOINT ??
        input.persisted.daemon?.relay?.publicEndpoint ??
        endpoint;
    const useTls = input.cliRelayUseTls ??
        resolveTlsFromEnv(input.env.PASEO_RELAY_USE_TLS, input.persisted.daemon?.relay?.useTls, endpoint === DEFAULT_RELAY_ENDPOINT);
    const publicUseTls = resolveTlsFromEnv(input.env.PASEO_RELAY_PUBLIC_USE_TLS, input.persisted.daemon?.relay?.publicUseTls, useTls);
    return { enabled, endpoint, publicEndpoint, useTls, publicUseTls };
}
function resolveServiceProxyPublicBaseUrl(value) {
    if (value === null) {
        return null;
    }
    try {
        return new URL(value).toString().replace(/\/$/, "");
    }
    catch {
        throw new Error(`Invalid PASEO_SERVICE_PROXY_PUBLIC_BASE_URL: ${value}`);
    }
}
function resolveServiceProxyConfig(env, persisted) {
    const enabledShim = parseBooleanEnv(env.PASEO_SERVICE_PROXY_ENABLED) ?? persisted.daemon?.serviceProxy?.enabled;
    // COMPAT(serviceProxyEnabled): added 2026-06-02, remove after 2026-12-02.
    // `enabled=false` used to disable the separate service proxy listener. Localhost
    // service proxying is now always enabled; this only suppresses optional layers.
    const optionalLayersEnabled = enabledShim !== false;
    const publicBaseUrl = optionalLayersEnabled
        ? resolveServiceProxyPublicBaseUrl(env.PASEO_SERVICE_PROXY_PUBLIC_BASE_URL ??
            persisted.daemon?.serviceProxy?.publicBaseUrl ??
            null)
        : null;
    const standaloneListen = optionalLayersEnabled
        ? (env.PASEO_SERVICE_PROXY_LISTEN ?? persisted.daemon?.serviceProxy?.listen ?? null)
        : null;
    return { publicBaseUrl, standaloneListen };
}
function resolveWebUiConfig(paseoHome, env, cli, persisted) {
    const enabled = cli?.webUiEnabled ??
        parseBooleanEnv(env.PASEO_WEB_UI_ENABLED) ??
        persisted.features?.webUi?.enabled ??
        false;
    const rawDistDir = env.PASEO_WEB_UI_DIST_DIR ?? persisted.features?.webUi?.distDir;
    const trimmedDistDir = rawDistDir?.trim();
    const distDir = trimmedDistDir
        ? path.resolve(path.isAbsolute(trimmedDistDir) ? trimmedDistDir : paseoHome, trimmedDistDir)
        : BUNDLED_WEB_UI_DIST_DIR;
    return {
        enabled,
        distDir,
    };
}
function resolveVoiceLlmConfig(env, persisted) {
    const envVoiceLlmProvider = parseOptionalVoiceLlmProvider(env.PASEO_VOICE_LLM_PROVIDER);
    const persistedVoiceLlmProvider = parseOptionalVoiceLlmProvider(persisted.features?.voiceMode?.llm?.provider);
    return {
        provider: envVoiceLlmProvider ?? persistedVoiceLlmProvider ?? null,
        providerExplicit: envVoiceLlmProvider !== null || persistedVoiceLlmProvider !== null,
        model: persisted.features?.voiceMode?.llm?.model ?? null,
    };
}
function resolveCorsAllowedOrigins(env, persisted) {
    const envCorsOrigins = env.PASEO_CORS_ORIGINS
        ? env.PASEO_CORS_ORIGINS.split(",").map((s) => s.trim())
        : [];
    const persistedCorsOrigins = persisted.daemon?.cors?.allowedOrigins ?? [];
    return Array.from(new Set([...persistedCorsOrigins, ...envCorsOrigins].filter((s) => s.length > 0)));
}
function parseTrustedProxiesEnv(value) {
    const trimmed = value?.trim();
    if (!trimmed) {
        return undefined;
    }
    const normalized = trimmed.toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) {
        return true;
    }
    if (["0", "false", "no", "off"].includes(normalized)) {
        return [];
    }
    return trimmed
        .split(",")
        .map((proxy) => proxy.trim())
        .filter((proxy) => proxy.length > 0);
}
function resolveTrustedProxiesConfig(env, persisted) {
    return (parseTrustedProxiesEnv(env.PASEO_TRUSTED_PROXIES) ??
        persisted.daemon?.trustedProxies ??
        DEFAULT_TRUSTED_PROXIES);
}
// PASEO_LISTEN can be:
// - host:port (TCP)
// - /path/to/socket (Unix socket)
// - unix:///path/to/socket (Unix socket)
// Default is TCP at 127.0.0.1:6767
function resolveListenAddress(env, cli, persisted) {
    return (cli?.listen ??
        env.PASEO_LISTEN ??
        persisted.daemon?.listen ??
        `127.0.0.1:${env.PORT ?? DEFAULT_PORT}`);
}
function resolveAuthConfig(env, persisted) {
    const envPassword = env.PASEO_PASSWORD?.trim();
    if (envPassword) {
        return { password: hashDaemonPassword(envPassword) };
    }
    return persisted.daemon?.auth?.password
        ? { password: persisted.daemon.auth.password }
        : undefined;
}
function resolveWorktreesRoot(paseoHome, persisted) {
    const configuredRoot = persisted.worktrees?.root?.trim();
    if (!configuredRoot) {
        return undefined;
    }
    const expandedRoot = expandTilde(configuredRoot);
    return path.isAbsolute(expandedRoot)
        ? path.resolve(expandedRoot)
        : path.resolve(paseoHome, expandedRoot);
}
function resolveAppendSystemPrompt(persisted) {
    return persisted.daemon?.appendSystemPrompt ?? "";
}
function resolveBrowserToolsEnabled(persisted) {
    return persisted.daemon?.browserTools?.enabled ?? false;
}
function resolveStaticLoadConfigSettings(env, cli, persisted) {
    return {
        mcpEnabled: cli?.mcpEnabled ?? persisted.daemon?.mcp?.enabled ?? true,
        mcpInjectIntoAgents: cli?.mcpInjectIntoAgents ?? persisted.daemon?.mcp?.injectIntoAgents ?? false,
        browserToolsEnabled: resolveBrowserToolsEnabled(persisted),
        autoArchiveAfterMerge: persisted.daemon?.autoArchiveAfterMerge ?? false,
        appendSystemPrompt: resolveAppendSystemPrompt(persisted),
        terminalProfiles: persisted.daemon?.terminalProfiles,
        hostnames: mergeHostnames([
            persisted.daemon?.hostnames,
            parseHostnamesEnv(env.PASEO_HOSTNAMES ?? env.PASEO_ALLOWED_HOSTS),
            cli?.hostnames,
        ]),
        trustedProxies: resolveTrustedProxiesConfig(env, persisted),
        appBaseUrl: env.PASEO_APP_BASE_URL ?? persisted.app?.baseUrl ?? DEFAULT_APP_BASE_URL,
    };
}
export function loadConfig(paseoHome, options) {
    const env = options?.env ?? process.env;
    const persisted = loadPersistedConfig(paseoHome);
    const listen = resolveListenAddress(env, options?.cli, persisted);
    const { mcpEnabled, mcpInjectIntoAgents, browserToolsEnabled, autoArchiveAfterMerge, appendSystemPrompt, terminalProfiles, hostnames, trustedProxies, appBaseUrl, } = resolveStaticLoadConfigSettings(env, options?.cli, persisted);
    const relay = resolveRelayConfig({
        env,
        persisted,
        cliRelayEnabled: options?.cli?.relayEnabled,
        cliRelayUseTls: options?.cli?.relayUseTls,
    });
    const serviceProxy = resolveServiceProxyConfig(env, persisted);
    const webUi = resolveWebUiConfig(paseoHome, env, options?.cli, persisted);
    const { openai, speech } = resolveSpeechConfig({
        paseoHome,
        env,
        persisted,
    });
    const voiceLlm = resolveVoiceLlmConfig(env, persisted);
    const providerOverrides = extractProviderOverrides(persisted.agents?.providers);
    return {
        listen,
        paseoHome,
        desktopManaged: env.PASEO_DESKTOP_MANAGED === "1",
        worktreesRoot: resolveWorktreesRoot(paseoHome, persisted),
        corsAllowedOrigins: resolveCorsAllowedOrigins(env, persisted),
        hostnames,
        trustedProxies,
        mcpEnabled,
        mcpInjectIntoAgents,
        browserToolsEnabled,
        autoArchiveAfterMerge,
        enableTerminalAgentHooks: persisted.daemon?.enableTerminalAgentHooks ?? false,
        appendSystemPrompt,
        terminalProfiles,
        mcpDebug: env.MCP_DEBUG === "1",
        isDev: resolvePaseoNodeEnv(env) === "development",
        agentStoragePath: path.join(paseoHome, "agents"),
        staticDir: "public",
        agentClients: {},
        relayEnabled: relay.enabled,
        relayEndpoint: relay.endpoint,
        relayPublicEndpoint: relay.publicEndpoint,
        relayUseTls: relay.useTls,
        relayPublicUseTls: relay.publicUseTls,
        serviceProxy,
        webUi,
        appBaseUrl,
        auth: resolveAuthConfig(env, persisted),
        openai,
        speech,
        voiceLlmProvider: voiceLlm.provider,
        voiceLlmProviderExplicit: voiceLlm.providerExplicit,
        voiceLlmModel: voiceLlm.model,
        agentProviderSettings: extractAgentProviderSettings(providerOverrides),
        metadataGeneration: persisted.agents?.metadataGeneration,
        providerOverrides,
        log: resolveLogConfigFromEnv(env, persisted),
    };
}
//# sourceMappingURL=config.js.map