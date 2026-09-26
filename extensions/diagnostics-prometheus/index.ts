// Diagnostics Prometheus plugin entrypoint registers its OpenClaw integration.
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import {
  diagnosticsPrometheusConfigSchema,
  resolveDiagnosticsPrometheusConfig,
} from "./src/config.js";
import { createDiagnosticsPrometheusExporter } from "./src/service.js";

export default definePluginEntry({
  id: "diagnostics-prometheus",
  name: "Diagnostics Prometheus",
  description: "Expose OpenClaw diagnostics metrics in Prometheus text format",
  configSchema: diagnosticsPrometheusConfigSchema,
  register(api) {
    const config = resolveDiagnosticsPrometheusConfig(api.pluginConfig);
    const exporter = createDiagnosticsPrometheusExporter(api.pluginConfig);
    api.registerService(exporter.service);
    if (config.gatewayRoute) {
      api.registerHttpRoute({
        path: "/api/diagnostics/prometheus",
        auth: "gateway",
        match: "exact",
        gatewayRuntimeScopeSurface: "trusted-operator",
        handler: exporter.handler,
      });
    }
  },
});
