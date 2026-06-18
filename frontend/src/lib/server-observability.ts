type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

const service = "tbilling-frontend";

export function requestIdFromHeaders(headers: Headers) {
  return headers.get("x-request-id") ?? headers.get("x-vercel-id") ?? crypto.randomUUID();
}

export function logEvent(level: LogLevel, fields: LogFields) {
  const payload = {
    level,
    service,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export async function reportServerError(error: unknown, fields: LogFields) {
  const payload = {
    event: "server_error",
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...fields,
  };

  logEvent("error", payload);

  const webhookUrl = process.env.ERROR_WEBHOOK_URL ?? process.env.OBSERVABILITY_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        service,
        environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
        timestamp: new Date().toISOString(),
        ...payload,
      }),
      cache: "no-store",
    });
  } catch (webhookError) {
    logEvent("warn", {
      event: "error_webhook_failed",
      message: webhookError instanceof Error ? webhookError.message : String(webhookError),
      requestId: fields.requestId,
    });
  }
}
