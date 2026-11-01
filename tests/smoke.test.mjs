import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

test("package exposes required quality commands", () => {
  assert.equal(typeof packageJson.scripts.lint, "string");
  assert.equal(typeof packageJson.scripts.build, "string");
  assert.equal(typeof packageJson.scripts.test, "string");
});

test("production build uses the Vite output directory expected by deployment", async () => {
  const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.equal(vercel.outputDirectory, "dist");
  assert.equal(vercel.framework, "vite");
  const headers = vercel.headers?.[0]?.headers || [];
  assert.ok(headers.some((header) => header.key === "X-Content-Type-Options" && header.value === "nosniff"));
  assert.ok(headers.some((header) => header.key === "X-Frame-Options" && header.value === "DENY"));
  assert.ok(headers.some((header) => header.key === "Strict-Transport-Security"));
});

test("Gemini credential is documented as a server-side secret", async () => {
  const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");
  assert.match(envExample, /GEMINI_API_KEY/);
  assert.doesNotMatch(envExample, /VITE_GEMINI_API_KEY/);
});
