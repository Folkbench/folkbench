#!/usr/bin/env node
// Обновляет таблицу сервисов Folkbench RU в README.ru.md из публичного снимка каталога ru.folkbench.com.
// Без зависимостей: только Node.js 20+ или Bun. Меняет только блок между маркерами ru-catalog.
// В GitHub Actions пишет changed=true|false в $GITHUB_OUTPUT.
//
// Единственный источник данных — база ru.folkbench.com (проверка администратором). Таблицу в README
// руками не правят: исправления присылают через Issue, после проверки их вносят в базу.
//
// Запуск:
//   node scripts/ru-readme.mjs                      — взять снимок с CATALOG_URL (по умолчанию ru.folkbench.com)
//   node scripts/ru-readme.mjs --file catalog.json  — взять снимок из файла (для локальной проверки)
//
// Если снимок недоступен, не проходит проверку формата или пуст, README не меняется и скрипт
// завершается с ошибкой: пустая таблица никогда не заменяет последнюю удачную.

import { appendFile, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const CATALOG_URL = process.env.CATALOG_URL ?? "https://ru.folkbench.com/api/v1/public/catalog";
const README = fileURLToPath(new URL("../README.ru.md", import.meta.url));
const START = "<!-- ru-catalog:start — генерируется scripts/ru-readme.mjs, не править вручную -->";
const END = "<!-- ru-catalog:end -->";
const UTM = "utm_source=github&utm_medium=referral&utm_campaign=ru_matrix_v1&utm_content=main_repo_ru_readme";
const SITE_ORIGIN = "https://ru.folkbench.com";

function reject(message) {
  throw new Error(message);
}

async function loadCatalog() {
  const fileIndex = process.argv.indexOf("--file");
  if (fileIndex !== -1) {
    const path = process.argv[fileIndex + 1];
    if (path === undefined) reject("после --file нужен путь к файлу");
    return JSON.parse(await readFile(path, "utf8"));
  }
  const response = await fetch(CATALOG_URL, { signal: AbortSignal.timeout(15_000), headers: { accept: "application/json" } });
  if (!response.ok) reject(`снимок недоступен: HTTP ${response.status}`);
  return response.json();
}

/* ───────── проверка формата: всё, что попадает в README, должно быть ожидаемого типа ───────── */

const isString = (value) => typeof value === "string";
const isNumber = (value) => typeof value === "number" && Number.isFinite(value);
const isNullableNumber = (value) => value === null || isNumber(value);
const isNullableString = (value) => value === null || isString(value);
const isSiteUrl = (value) => isString(value) && value.startsWith(`${SITE_ORIGIN}/`);

const PROTOCOL = {
  anthropic: "Anthropic Messages",
  openai: "OpenAI Chat Completions",
  "openai-responses": "OpenAI Responses",
  google: "Gemini GenerateContent",
};

export function validate(catalog) {
  const problems = [];
  const expect = (condition, what) => {
    if (!condition) problems.push(what);
  };
  expect(catalog !== null && typeof catalog === "object", "снимок не объект");
  if (problems.length > 0) return problems;
  expect(catalog.schema_version === "3", `неизвестная версия схемы ${JSON.stringify(catalog.schema_version)}`);
  expect(isString(catalog.snapshot_id) && /^[0-9a-f]{16}$/.test(catalog.snapshot_id), "snapshot_id");
  expect(isNullableString(catalog.measured_at), "measured_at");
  expect(isString(catalog.node) && catalog.node.length <= 40, "node");
  expect(catalog.window_hours === 24, "window_hours");
  expect(Array.isArray(catalog.providers), "providers");
  for (const [i, provider] of (Array.isArray(catalog.providers) ? catalog.providers : []).entries()) {
    const at = `providers[${i}]`;
    expect(isString(provider?.id) && /^[a-z0-9][a-z0-9-]{0,63}$/.test(provider.id), `${at}.id`);
    expect(isString(provider?.name) && provider.name.length <= 60, `${at}.name`);
    expect(isSiteUrl(provider?.detail_url), `${at}.detail_url`);
    expect(isString(provider?.verified_at) && /^\d{4}-\d{2}-\d{2}$/.test(provider.verified_at), `${at}.verified_at`);
    expect(Array.isArray(provider?.payment_methods_verified) && provider.payment_methods_verified.every(isString), `${at}.payment_methods_verified`);
    expect(Array.isArray(provider?.routes) && provider.routes.length > 0, `${at}.routes`);
    for (const [j, route] of (Array.isArray(provider?.routes) ? provider.routes : []).entries()) {
      const r = `${at}.routes[${j}]`;
      expect(isString(route?.model_id) && route.model_id.length <= 128, `${r}.model_id`);
      expect(isSiteUrl(route?.model_url), `${r}.model_url`);
      expect(Array.isArray(route?.protocols) && route.protocols.length > 0 && new Set(route.protocols).size === route.protocols.length && route.protocols.every((item) => isString(item) && Object.hasOwn(PROTOCOL, item)), `${r}.protocols`);
      expect(isNullableString(route?.price_ref), `${r}.price_ref`);
      const m = route?.measurement;
      expect(isNumber(m?.attempts) && isNumber(m?.successes), `${r}.measurement.attempts`);
      expect(isNullableNumber(m?.availability_pct) && isNullableNumber(m?.ttft_p50_ms), `${r}.measurement`);
    }
  }
  return problems;
}

/* ───────── форматирование по-русски ───────── */

const NNBSP = " ";
const int = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const narrow = (text) => text.replace(/[   ]/g, NNBSP);
// Текст из снимка не должен ломать таблицу Markdown или превращаться в разметку
const cell = (text) => String(text).replace(/[\r\n]+/g, " ").replace(/[|\\`*_[\]<>]/g, (ch) => `\\${ch}`);
function plural(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
const withUtm = (url) => `${url}${url.includes("?") ? "&" : "?"}${UTM}`;

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

function formatUtc(iso) {
  const date = new Date(iso);
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}, ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;
}

export function render(catalog) {
  const lines = [];
  const measured = catalog.measured_at === null ? "замеров ещё не было" : `данные на ${formatUtc(catalog.measured_at)}`;
  lines.push(
    `Снимок \`${catalog.snapshot_id}\` · ${measured} · узел ${cell(catalog.node)} · окно 24 часа · порядок — по названию, это не рейтинг.`,
    "",
    "| Сервис | Модель | Протокол | Доступность 24 ч | TTFT p50 | Цена | Оплата | Проверено |",
    "| --- | --- | --- | ---: | ---: | --- | --- | --- |",
  );
  for (const provider of catalog.providers) {
    const name = `[${cell(provider.name)}](${withUtm(provider.detail_url)})`;
    const payments = provider.payment_methods_verified.length === 0 ? "не проверено" : provider.payment_methods_verified.map(cell).join(", ");
    for (const route of provider.routes) {
      const m = route.measurement;
      const availability = m.attempts === 0 || m.availability_pct === null ? "нет данных" : `${narrow(oneDecimal.format(m.availability_pct))}${NNBSP}% (${narrow(int.format(m.attempts))} ${plural(m.attempts, "попытка", "попытки", "попыток")})`;
      const ttft = m.ttft_p50_ms === null ? "—" : `${narrow(int.format(m.ttft_p50_ms))}${NNBSP}мс`;
      const protocol = route.protocols.map((item) => PROTOCOL[item]).join(" / ");
      lines.push(
        `| ${name} | [\`${route.model_id.replace(/`/g, "")}\`](${withUtm(route.model_url)}) | ${protocol} | ${availability} | ${ttft} | ${route.price_ref === null ? "не проверена" : cell(route.price_ref)} | ${payments} | ${formatDate(provider.verified_at)} |`,
      );
    }
  }
  const markdown = lines.join("\n");
  for (const provider of catalog.providers) {
    if (!markdown.includes(`/providers/${provider.id}/`)) throw new Error(`пропущен сервис ${provider.id}`);
    for (const route of provider.routes) {
      if (!markdown.includes(route.model_id)) throw new Error(`пропущена модель ${provider.id}/${route.model_id}`);
    }
  }
  return markdown;
}

/* ───────── запись ───────── */

function option(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

export async function writeCatalogTable(catalog, readmePath = README) {
  const problems = validate(catalog);
  if (problems.length > 0) reject(`снимок не прошёл проверку формата: ${problems.slice(0, 10).join(", ")}`);
  if (catalog.providers.length === 0) reject("в снимке нет ни одного сервиса");
  const readme = await readFile(readmePath, "utf8");
  const startAt = readme.indexOf(START);
  const endAt = readme.indexOf(END);
  if (startAt === -1 || endAt === -1 || endAt < startAt) reject("в README.ru.md нет маркеров таблицы");
  const rendered = render(catalog);
  const next = `${readme.slice(0, startAt + START.length)}\n${rendered}\n${readme.slice(endAt)}`;
  const changed = next !== readme;
  if (changed) await writeFile(readmePath, next);
  return { changed, snapshotId: catalog.snapshot_id, providers: catalog.providers.length };
}

async function main() {
  const readmePath = option("readme") ?? README;
  const before = await readFile(readmePath, "utf8");
  try {
    const catalog = await loadCatalog();
    const result = await writeCatalogTable(catalog, readmePath);
    console.log(result.changed
      ? `[ru-readme] таблица обновлена: снимок ${result.snapshotId}, сервисов ${result.providers}`
      : `[ru-readme] без изменений (снимок ${result.snapshotId})`);
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `changed=${result.changed}\nsnapshot_id=${result.snapshotId}\n`);
  } catch (error) {
    const current = await readFile(readmePath, "utf8").catch(() => before);
    if (current !== before) await writeFile(readmePath, before);
    console.error(`[ru-readme] ${error instanceof Error ? error.message : String(error)}; README.ru.md не изменён`);
    process.exit(1);
  }
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invokedDirectly) await main();
