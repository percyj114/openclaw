import { describe, expect, it } from "vitest";
import { resolveProviderDiscoveryFilterForTest } from "./models-config.providers.implicit.js";

const TEST_PLUGIN_REGISTRY_ENV = {
  OPENCLAW_DISABLE_PERSISTED_PLUGIN_REGISTRY: "1",
  OPENCLAW_LIVE_TEST: "1",
  VITEST: "1",
} as NodeJS.ProcessEnv;

describe("resolveProviderDiscoveryFilterForTest", () => {
  it("maps live provider backend ids to owning plugin ids", () => {
    expect(
      resolveProviderDiscoveryFilterForTest({
        env: {
          ...TEST_PLUGIN_REGISTRY_ENV,
          OPENCLAW_LIVE_TEST: "1",
          OPENCLAW_LIVE_PROVIDERS: "claude-cli",
        },
      }),
    ).toEqual(["anthropic"]);
  });

  it("honors gateway live provider filters too", () => {
    expect(
      resolveProviderDiscoveryFilterForTest({
        env: {
          ...TEST_PLUGIN_REGISTRY_ENV,
          OPENCLAW_LIVE_TEST: "1",
          OPENCLAW_LIVE_GATEWAY_PROVIDERS: "claude-cli",
        },
      }),
    ).toEqual(["anthropic"]);
  });

  it("keeps explicit plugin-id filters when no owning provider plugin exists", () => {
    expect(
      resolveProviderDiscoveryFilterForTest({
        env: {
          ...TEST_PLUGIN_REGISTRY_ENV,
          OPENCLAW_LIVE_TEST: "1",
          OPENCLAW_LIVE_PROVIDERS: "openrouter",
        },
      }),
    ).toEqual(["openrouter"]);
  });
});
