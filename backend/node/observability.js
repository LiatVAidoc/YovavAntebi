import crypto from "crypto";
import pino from "pino";
import pinoHttp from "pino-http";
import client from "prom-client";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: undefined // omit pid/hostname noise; keep logs focused for the exercise
});

export function requestIdMiddleware(req, res, next) {
  const existing = req.header("x-request-id");
  const id = existing && String(existing).trim() ? String(existing).trim() : crypto.randomUUID();
  req.requestId = id;
  res.setHeader("x-request-id", id);
  next();
}

export function pinoHttpMiddleware() {
  return pinoHttp({
    logger,
    genReqId: (req, res) => {
      // Use the requestId assigned by requestIdMiddleware
      return req.requestId || res.getHeader("x-request-id") || crypto.randomUUID();
    },
    customProps: (req) => ({
      requestId: req.requestId
    })
  });
}

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDurationMs = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "status_code"],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2000, 5000],
  registers: [register]
});

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register]
});

export function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const diffMs = Number(process.hrtime.bigint() - start) / 1e6;
    const route = req.route?.path ? String(req.route.path) : "unknown";
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode)
    };

    httpRequestsTotal.inc(labels, 1);
    httpRequestDurationMs.observe(labels, diffMs);
  });

  next();
}

export async function metricsHandler(_req, res) {
  res.set("Content-Type", register.contentType);
  res.status(200).send(await register.metrics());
}


