import { resolveWhatsAppInboundPolicy } from "../../inbound-policy.js";
import { loadSessionStore, resolveStorePath } from "../config.runtime.js";
import { normalizeGroupActivation } from "./group-activation.runtime.js";

type LoadConfigFn = typeof import("../config.runtime.js").loadConfig;

export function resolveGroupActivationFor(params: {
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
  const entry = store[params.sessionKey];
  const requireMention = resolveWhatsAppInboundPolicy({
    cfg: params.cfg,
    accountId: params.accountId,
  }).resolveConversationRequireMention(params.conversationId);
  const defaultActivation = !requireMention ? "always" : "mention";
  return normalizeGroupActivation(entry?.groupActivation) ?? defaultActivation;
}
