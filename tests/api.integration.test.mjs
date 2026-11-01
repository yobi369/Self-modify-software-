import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import app from "../api/index.ts";

let server;
let baseUrl;
const originalApiKey = process.env.GEMINI_API_KEY;
const originalNodeEnv = process.env.NODE_ENV;
const originalAiEnabled = process.env.AI_API_ENABLED;

before(async () => {
  process.env.NODE_ENV = 'test';
  delete process.env.GEMINI_API_KEY;
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalApiKey;
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  if (originalAiEnabled === undefined) delete process.env.AI_API_ENABLED;
  else process.env.AI_API_ENABLED = originalAiEnabled;
});

test("health endpoint reports service status without exposing credentials", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  assert.equal(body.aiConfigured, false);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(JSON.stringify(body).includes("GEMINI_API_KEY"), false);
});

test("analysis rejects invalid request bodies before provider access", async () => {
  const response = await fetch(`${baseUrl}/api/ai/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: "  " }),
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "INVALID_REQUEST");
});

test("analysis fails explicitly when the AI provider is not configured", async () => {
  const response = await fetch(`${baseUrl}/api/ai/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: "int main(void) { return 0; }", language: "c" }),
  });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "AI_NOT_CONFIGURED");
});

test("mutation fails explicitly instead of returning a fabricated candidate", async () => {
  const response = await fetch(`${baseUrl}/api/ai/mutate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: "int value = 1;", language: "c" }),
  });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "AI_NOT_CONFIGURED");
});

test("malformed JSON and oversized payloads return controlled errors", async () => {
  const malformed = await fetch(`${baseUrl}/api/ai/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{not-json",
  });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).code, "INVALID_JSON");

  const oversized = await fetch(`${baseUrl}/api/ai/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: "x".repeat(140_000) }),
  });
  assert.equal(oversized.status, 413);
  assert.equal((await oversized.json()).code, "PAYLOAD_TOO_LARGE");
});

test("AI route applies its per-instance request throttle", async () => {
  const headers = { "content-type": "application/json", "x-forwarded-for": "198.51.100.77" };
  let lastStatus = 0;
  for (let index = 0; index < 16; index += 1) {
    const response = await fetch(`${baseUrl}/api/ai/analyze`, {
      method: "POST",
      headers,
      body: JSON.stringify({ code: " " }),
    });
    lastStatus = response.status;
    await response.arrayBuffer();
  }
  assert.equal(lastStatus, 429);
});

test("production analysis route cannot be enabled by an environment flag without authentication", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousAiEnabled = process.env.AI_API_ENABLED;
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.NODE_ENV = "production";
  process.env.AI_API_ENABLED = "true";
  process.env.GEMINI_API_KEY = "test-placeholder-not-a-real-key";
  try {
    const response = await fetch(`${baseUrl}/api/ai/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: "int main(void) { return 0; }", language: "c" }),
    });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, "AI_API_DISABLED");
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousAiEnabled === undefined) delete process.env.AI_API_ENABLED;
    else process.env.AI_API_ENABLED = previousAiEnabled;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});

test("production mutation route cannot be enabled by an environment flag without authentication", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousAiEnabled = process.env.AI_API_ENABLED;
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.NODE_ENV = "production";
  process.env.AI_API_ENABLED = "true";
  process.env.GEMINI_API_KEY = "test-placeholder-not-a-real-key";
  try {
    const response = await fetch(`${baseUrl}/api/ai/mutate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: "int value = 1;", language: "c" }),
    });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, "AI_API_DISABLED");
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousAiEnabled === undefined) delete process.env.AI_API_ENABLED;
    else process.env.AI_API_ENABLED = previousAiEnabled;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});
