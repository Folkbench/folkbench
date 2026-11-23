import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { validate, render, writeCatalogTable } from "./ru-readme.mjs";

const START = "<!-- ru-catalog:start — генерируется scripts/ru-readme.mjs, не править вручную -->";
const END = "<!-- ru-catalog:end -->";

function route(model) {
  return {
    model_id: model,
    protocols: ["openai"],
    model_family: model,
    model_title: model,
    model_url: `https://ru.folkbench.com/models/${model}/`,
    price_ref: null,
    measurement: {
      attempts: 10, successes: 9, r429: 0, r5xx: 0, timeouts: 1, other: 0,
      availability_pct: 90, ttft_p50_ms: 120, ttft_p95_ms: 200, output_tps_p50: 40, input_tokens_p50: 8,
    },
    fingerprint_7d: { status: "no_data", checks: 0, matches: 0 },
  };
}

function provider(id, name, model) {
  return {
    id, name,
    detail_url: `https://ru.folkbench.com/providers/${id}/`,
    api_base_url: `https://api.${id}.example/v1`,
    verified_at: "2026-11-22",
    payment_methods_verified: [],
    access_notes_ru: null,
    claude_code_verified: false,
    routes: [route(model)],
  };
}

function catalog(providers) {
  return {
    schema_version: "3",
    snapshot_id: "0123456789abcdef",
    sha256: "a".repeat(64),
    generated_at: "2026-11-23T00:00:00.000Z",
    measured_at: "2026-11-23T00:00:00.000Z",
    status: "ready",
    node: "US-West",
    window_hours: 24,
    source_url: "https://ru.folkbench.com/",
    methodology_url: "https://ru.folkbench.com/methodology/",
    providers,
  };
}

test("schema 3 keeps Modelflare and another provider in catalog order", () => {
  const source = catalog([
    provider("cheapai", "CheapAI", "gpt-6.2-sol"),
    provider("modelflare", "Modelflare", "claude-opus-5-5"),
  ]);
  assert.deepEqual(validate(source), []);
  const markdown = render(source);
  assert.ok(markdown.indexOf("/providers/cheapai/") < markdown.indexOf("/providers/modelflare/"));
  assert.match(markdown, /CheapAI/);
  assert.match(markdown, /Modelflare/);
  assert.doesNotMatch(markdown, /аффилирован/);
  assert.ok(validate({ ...source, schema_version: "1" }).length > 0);
});

test("a rejected catalog does not replace the previous table", async () => {
  const directory = await mkdtemp(join(tmpdir(), "ru-readme-"));
  const readme = join(directory, "README.ru.md");
  const file = join(directory, "catalog.json");
  const original = `перед\n${START}\nстарая таблица\n${END}\nпосле\n`;
  await writeFile(readme, original);
  await writeFile(file, JSON.stringify({ schema_version: "1", providers: [] }));
  const child = spawn("bun", ["scripts/ru-readme.mjs", "--file", file, "--readme", readme], { cwd: new URL("..", import.meta.url).pathname });
  const code = await new Promise((resolve) => child.on("close", resolve));
  assert.notEqual(code, 0);
  assert.equal(await readFile(readme, "utf8"), original);
  const good = catalog([provider("modelflare", "Modelflare", "gpt-6.2-sol"), provider("cheapai", "CheapAI", "gpt-6.2-sol")]);
  const written = await writeCatalogTable(good, readme);
  assert.equal(written.providers, 2);
  const next = await readFile(readme, "utf8");
  assert.match(next, /Modelflare/);
  assert.match(next, /CheapAI/);
  assert.match(next, /^перед\n/u);
  assert.match(next, /\nпосле\n$/u);
  await rm(directory, { recursive: true, force: true });
});
