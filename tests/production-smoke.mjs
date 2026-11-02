import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";

async function getAvailablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to allocate a local smoke-test port.");
  }
  const { port } = address;
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  return port;
}

const port = await getAvailablePort();
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["dist/server.cjs"], {
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(port),
    AI_API_ENABLED: "true",
    GEMINI_API_KEY: "smoke-test-placeholder-not-a-secret",
  },
  stdio: "ignore",
});

async function waitForServer() {
  let lastError;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Production server exited before becoming ready (code ${child.exitCode}).`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/health`, {
        signal: AbortSignal.timeout(1_000),
      });
      if (response.ok) return;
      lastError = new Error(`Health endpoint returned HTTP ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Production server did not become ready: ${lastError?.message || "unknown error"}`);
}

try {
  await waitForServer();

  const page = await fetch(baseUrl, { signal: AbortSignal.timeout(3_000) });
  assert.equal(page.status, 200, "production root route should serve the SPA");
  assert.match(await page.text(), /Self-Modifying Software Studio/, "production HTML should contain the application title");

  const health = await fetch(`${baseUrl}/api/health`);
  const healthBody = await health.json();
  assert.equal(health.status, 200);
  assert.equal(healthBody.status, "ok");
  assert.equal("aiConfigured" in healthBody, false, "health must not disclose provider configuration");
  assert.equal(health.headers.get("x-content-type-options"), "nosniff");
  assert.equal(health.headers.get("cache-control"), "no-store");

  for (const path of ["/api/ai/analyze", "/api/ai/mutate"]) {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: "int main(void) { return 0; }", language: "c" }),
    });
    const body = await response.json();
    assert.equal(response.status, 503, `${path} must remain disabled in production`);
    assert.equal(body.code, "AI_API_DISABLED");
  }

  process.stdout.write("Production smoke test passed: SPA, health headers, and fail-closed AI routes.\n");
} finally {
  if (child.exitCode === null) {
    child.kill("SIGTERM");
    await Promise.race([
      new Promise((resolve) => child.once("exit", resolve)),
      new Promise((resolve) => setTimeout(resolve, 2_000)),
    ]);
    if (child.exitCode === null) child.kill("SIGKILL");
  }
}
