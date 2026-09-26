import { describe, expect, it } from "vitest";
import { diagnosticsPrometheusConfigSchema, resolveDiagnosticsPrometheusConfig } from "./config.js";

describe("diagnostics-prometheus config", () => {
  it("accepts a private listener and applies safe defaults", () => {
    const result = diagnosticsPrometheusConfigSchema.safeParse({
      gatewayRoute: false,
      privateListener: { port: 9091 },
    });

    expect(result.success).toBe(true);
    expect(resolveDiagnosticsPrometheusConfig(result.success ? result.data : undefined)).toEqual({
      gatewayRoute: false,
      privateListener: { host: "0.0.0.0", port: 9091, path: "/metrics" },
    });
  });

  it("rejects invalid listener ports and paths", () => {
    expect(
      diagnosticsPrometheusConfigSchema.safeParse({
        privateListener: { port: 0, path: "metrics" },
      }).success,
    ).toBe(false);
    expect(
      diagnosticsPrometheusConfigSchema.safeParse({
        privateListener: { port: 65536, path: "/metrics?token=secret" },
      }).success,
    ).toBe(false);
  });

  it("fails closed when a direct caller supplies invalid listener config", () => {
    expect(
      resolveDiagnosticsPrometheusConfig({
        gatewayRoute: false,
        privateListener: { host: "", port: "9091", path: "metrics" },
      }),
    ).toEqual({ gatewayRoute: false });
  });
});
