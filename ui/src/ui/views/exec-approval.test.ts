import { nothing, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { i18n } from "../../i18n/index.ts";
import { createStorageMock } from "../../test-helpers/storage.ts";
import type { AppViewState } from "../app-view-state.ts";
import type { ExecApprovalRequest } from "../controllers/exec-approval.ts";
import { renderExecApprovalPrompt } from "./exec-approval.ts";

function createState(queue: ExecApprovalRequest[]): AppViewState {
  return {
    execApprovalQueue: queue,
    execApprovalBusy: false,
    execApprovalError: null,
    handleExecApprovalDecision: vi.fn(async () => {}),
  } as unknown as AppViewState;
}

describe("renderExecApprovalPrompt", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-29T00:00:00.000Z"));
    vi.stubGlobal("localStorage", createStorageMock());
    await i18n.setLocale("en");
  });

  afterEach(async () => {
    await i18n.setLocale("en");
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders exec approval chrome from the active locale", async () => {
    await i18n.setLocale("zh-CN");
    const container = document.createElement("div");
    const active: ExecApprovalRequest = {
      id: "approval-1",
      kind: "exec",
      request: {
        command: "pnpm check:changed",
        host: "gateway",
        agentId: "main",
        sessionKey: "main",
        cwd: "/tmp/project",
        resolvedPath: "/tmp/project",
        security: "workspace-write",
        ask: "on-request",
      },
      createdAtMs: Date.now(),
      expiresAtMs: Date.now() + 61_000,
    };
    const queued: ExecApprovalRequest = {
      ...active,
      id: "approval-2",
      createdAtMs: Date.now() + 1,
      expiresAtMs: Date.now() + 62_000,
    };

    render(renderExecApprovalPrompt(createState([active, queued])), container);

    expect(container.textContent).toContain("需要 Exec 审批");
    expect(container.textContent).toContain("1m 后过期");
    expect(container.textContent).toContain("2 个待处理");
    expect(container.textContent).toContain("主机");
    expect(container.textContent).toContain("代理");
    expect(container.textContent).toContain("允许一次");
    expect(container.textContent).toContain("始终允许");
    expect(container.textContent).toContain("拒绝");

    render(nothing, container);
  });
});
