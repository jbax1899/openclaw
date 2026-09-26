import { describe, expect, it } from "vitest";
import plugin from "./index.js";

function register(pluginConfig?: Record<string, unknown>) {
  const routes: unknown[] = [];
  const services: unknown[] = [];
  plugin.register({
    pluginConfig,
    registerHttpRoute(route: unknown) {
      routes.push(route);
    },
    registerService(service: unknown) {
      services.push(service);
    },
  } as never);
  return { routes, services };
}

describe("diagnostics-prometheus plugin registration", () => {
  it("keeps the authenticated Gateway route enabled by default", () => {
    const { routes, services } = register();

    expect(routes).toHaveLength(1);
    expect(services).toHaveLength(1);
    expect(routes[0]).toMatchObject({
      path: "/api/diagnostics/prometheus",
      auth: "gateway",
      match: "exact",
      gatewayRuntimeScopeSurface: "trusted-operator",
    });
    expect(typeof (routes[0] as { handler?: unknown }).handler).toBe("function");
  });

  it("can disable the Gateway route while retaining the service", () => {
    const { routes, services } = register({ gatewayRoute: false });

    expect(routes).toHaveLength(0);
    expect(services).toHaveLength(1);
  });
});
