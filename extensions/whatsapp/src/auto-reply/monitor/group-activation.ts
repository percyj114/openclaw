import { updateSessionStore } from "openclaw/plugin-sdk/config-runtime";
import { resolveWhatsAppLegacyGroupSessionKey } from "../../group-session-key.js";
import { resolveWhatsAppInboundPolicy } from "../../inbound-policy.js";
import { loadSessionStore, resolveStorePath } from "../config.runtime.js";
import { normalizeGroupActivation } from "./group-activation.runtime.js";

type LoadConfigFn = typeof import("../config.runtime.js").loadConfig;

export async function resolveGroupActivationFor(params: {
  cfg: ReturnType<LoadConfigFn>;
  accountId?: string | null;
  agentId: string;
  sessionKey: string;
  conversationId: string;
}) {
  const storePath = resolveStorePath(params.cfg.session?.store, {
    agentId: params.agentId,
  });
  const store = loadSessionStore(storePath);
  const legacySessionKey = resolveWhatsAppLegacyGroupSessionKey({
    sessionKey: params.sessionKey,
    accountId: params.accountId,
  });
  const legacyEntry = legacySessionKey ? store[legacySessionKey] : undefined;
  const entry = store[params.sessionKey] ?? legacyEntry;
  if (!store[params.sessionKey] && legacyEntry?.groupActivation !== undefined) {
    await updateSessionStore(storePath, (nextStore) => {
      const scopedEntry = nextStore[params.sessionKey];
      if (scopedEntry?.groupActivation !== undefined) {
        return;
      }
      nextStore[params.sessionKey] = {
        ...scopedEntry,
        groupActivation: legacyEntry.groupActivation,
      };
    });
  }
  const requireMention = resolveWhatsAppInboundPolicy({
    cfg: params.cfg,
    accountId: params.accountId,
  }).resolveConversationRequireMention(params.conversationId);
  const defaultActivation = !requireMention ? "always" : "mention";
  return normalizeGroupActivation(entry?.groupActivation) ?? defaultActivation;
}
