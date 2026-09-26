import { buildJsonPluginConfigSchema } from "openclaw/plugin-sdk/plugin-entry";

export const diagnosticsPrometheusConfigSchema = buildJsonPluginConfigSchema({
  type: "object",
  additionalProperties: false,
  properties: {
    gatewayRoute: {
      type: "boolean",
      default: true,
    },
    privateListener: {
      type: "object",
      additionalProperties: false,
      required: ["port"],
      properties: {
        host: {
          type: "string",
          minLength: 1,
          default: "0.0.0.0",
        },
        port: {
          type: "integer",
          minimum: 1,
          maximum: 65535,
        },
        path: {
          type: "string",
          pattern: "^/[^?#]*$",
          default: "/metrics",
        },
      },
    },
  },
});

export type DiagnosticsPrometheusConfig = {
  gatewayRoute: boolean;
  privateListener?: {
    host: string;
    port: number;
    path: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function resolveDiagnosticsPrometheusConfig(value: unknown): DiagnosticsPrometheusConfig {
  const raw = isRecord(value) ? value : {};
  const privateListener = isRecord(raw.privateListener) ? raw.privateListener : undefined;
  const host =
    privateListener === undefined
      ? undefined
      : privateListener.host === undefined
        ? "0.0.0.0"
        : typeof privateListener.host === "string" && privateListener.host.trim()
          ? privateListener.host.trim()
          : undefined;
  const port = privateListener?.port;
  const path =
    privateListener === undefined
      ? undefined
      : privateListener.path === undefined
        ? "/metrics"
        : typeof privateListener.path === "string" && /^\/[^?#]*$/u.test(privateListener.path)
          ? privateListener.path
          : undefined;

  return {
    gatewayRoute: raw.gatewayRoute !== false,
    ...(host &&
    typeof port === "number" &&
    Number.isInteger(port) &&
    port > 0 &&
    port <= 65535 &&
    path
      ? { privateListener: { host, port, path } }
      : {}),
  };
}
