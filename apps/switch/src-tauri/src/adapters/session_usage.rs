use std::collections::{BTreeMap, HashMap};
use std::fs::{self, File};
use std::io::{BufRead, BufReader};
use std::path::Path;

use chrono::{DateTime, Days, Local, NaiveDate, Timelike};
use serde_json::Value;

use crate::domain::{
    DailyUsageSummary, HourModelUsage, HourlyUsageSummary, SessionUsageSummary,
    ToolUsageSummary,
};

/// Local days kept on each tool, ending today. Older dated turns stay in the
/// tool totals and drop out of `days` and `hours`.
const USAGE_WINDOW_DAYS: u64 = 90;

#[derive(Clone, Copy, Default)]
struct DayAcc {
    turns: u32,
    input_tokens: u64,
    output_tokens: u64,
    cache_read_tokens: u64,
    cache_write_tokens: u64,
    priced_nanos: u128,
    unpriced_turns: u32,
}

impl DayAcc {
    fn absorb(&mut self, other: DayAcc) {
        self.turns += other.turns;
        self.input_tokens += other.input_tokens;
        self.output_tokens += other.output_tokens;
        self.cache_read_tokens += other.cache_read_tokens;
        self.cache_write_tokens += other.cache_write_tokens;
        self.priced_nanos += other.priced_nanos;
        self.unpriced_turns += other.unpriced_turns;
    }

    fn record(
        &mut self,
        count: u32,
        input: u64,
        output: u64,
        cache_read: u64,
        cache_write: u64,
        price: Option<u128>,
    ) {
        self.turns += count;
        self.input_tokens += input;
        self.output_tokens += output;
        self.cache_read_tokens += cache_read;
        self.cache_write_tokens += cache_write;
        match price {
            Some(nanos) => self.priced_nanos += nanos,
            None => self.unpriced_turns += count,
        }
    }
}

#[derive(Default)]
struct HourAcc {
    total: DayAcc,
    models: BTreeMap<String, DayAcc>,
}

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
struct LocalHour {
    date: NaiveDate,
    hour: u8,
}

#[derive(Default)]
struct Acc {
    files_scanned: u32,
    turns: u32,
    input_tokens: u64,
    output_tokens: u64,
    cache_read_tokens: u64,
    cache_write_tokens: u64,
    priced_nanos: u128,
    unpriced_turns: u32,
    undated_turns: u32,
    hours: BTreeMap<LocalHour, HourAcc>,
}

impl Acc {
    fn add_turn(
        &mut self,
        model: &str,
        input: u64,
        output: u64,
        cache_read: u64,
        cache_write: u64,
        when: Option<LocalHour>,
    ) {
        self.add_turns(model, 1, input, output, cache_read, cache_write, when);
    }

    /// `count` model calls whose tokens are already summed (tools that only
    /// keep per-session or per-turn rollups).
    #[allow(clippy::too_many_arguments)]
    fn add_turns(
        &mut self,
        model: &str,
        count: u32,
        input: u64,
        output: u64,
        cache_read: u64,
        cache_write: u64,
        when: Option<LocalHour>,
    ) {
        if count == 0 {
            return;
        }
        self.turns += count;
        self.input_tokens += input;
        self.output_tokens += output;
        self.cache_read_tokens += cache_read;
        self.cache_write_tokens += cache_write;
        let price =
            list_price_nanos(model, input, output, cache_read, cache_write);
        match price {
            Some(nanos) => self.priced_nanos += nanos,
            None => self.unpriced_turns += count,
        }
        if let Some(when) = when {
            let model_id = canonical_model_id(model);
            let bucket = self.hours.entry(when).or_default();
            bucket.total.record(
                count,
                input,
                output,
                cache_read,
                cache_write,
                price,
            );
            bucket.models.entry(model_id).or_default().record(
                count,
                input,
                output,
                cache_read,
                cache_write,
                price,
            );
        } else {
            self.undated_turns += count;
        }
    }

    fn into_summary(self, tool_id: &str, today: NaiveDate) -> ToolUsageSummary {
        let list_price_usd = if self.turns > self.unpriced_turns {
            Some(format_usd(self.priced_nanos))
        } else {
            None
        };
        let first_day = today
            .checked_sub_days(Days::new(USAGE_WINDOW_DAYS - 1))
            .unwrap_or(today);
        let mut days = Vec::with_capacity(USAGE_WINDOW_DAYS as usize);
        let mut hours = Vec::with_capacity((USAGE_WINDOW_DAYS * 24) as usize);
        for offset in 0..USAGE_WINDOW_DAYS {
            let Some(day) = first_day.checked_add_days(Days::new(offset))
            else {
                continue;
            };
            let mut combined = DayAcc::default();
            for hour in 0..24u8 {
                let bucket = self.hours.get(&LocalHour { date: day, hour });
                let total = bucket.map(|item| item.total).unwrap_or_default();
                let models = bucket
                    .map(|item| model_rows(&item.models))
                    .unwrap_or_default();
                combined.absorb(total);
                hours.push(HourlyUsageSummary {
                    date: day.to_string(),
                    hour,
                    turns: total.turns,
                    input_tokens: total.input_tokens,
                    output_tokens: total.output_tokens,
                    cache_read_tokens: total.cache_read_tokens,
                    cache_write_tokens: total.cache_write_tokens,
                    models,
                });
            }
            let unpriced_turns = combined.unpriced_turns;
            days.push(DailyUsageSummary {
                date: day.to_string(),
                turns: combined.turns,
                input_tokens: combined.input_tokens,
                output_tokens: combined.output_tokens,
                cache_read_tokens: combined.cache_read_tokens,
                cache_write_tokens: combined.cache_write_tokens,
                list_price_usd: (combined.turns > unpriced_turns)
                    .then(|| format_usd(combined.priced_nanos)),
                unpriced_turns,
            });
        }
        ToolUsageSummary {
            tool_id: tool_id.to_string(),
            files_scanned: self.files_scanned,
            turns: self.turns,
            input_tokens: self.input_tokens,
            output_tokens: self.output_tokens,
            cache_read_tokens: self.cache_read_tokens,
            cache_write_tokens: self.cache_write_tokens,
            list_price_usd,
            unpriced_turns: self.unpriced_turns,
            undated_turns: self.undated_turns,
            days,
            hours,
        }
    }
}

fn model_rows(models: &BTreeMap<String, DayAcc>) -> Vec<HourModelUsage> {
    let mut rows: Vec<HourModelUsage> = models
        .iter()
        .map(|(model, bucket)| HourModelUsage {
            model: model.clone(),
            turns: bucket.turns,
            input_tokens: bucket.input_tokens,
            output_tokens: bucket.output_tokens,
            cache_read_tokens: bucket.cache_read_tokens,
            cache_write_tokens: bucket.cache_write_tokens,
        })
        .collect();
    rows.sort_by(|left, right| {
        let tokens = |row: &HourModelUsage| {
            row.input_tokens
                + row.output_tokens
                + row.cache_read_tokens
                + row.cache_write_tokens
        };
        tokens(right)
            .cmp(&tokens(left))
            .then_with(|| left.model.cmp(&right.model))
    });
    rows
}

/// Scan local session files for writable tools. Prompts are never kept.
pub fn summarize(home: &Path) -> SessionUsageSummary {
    summarize_on(home, Local::now().date_naive())
}

fn summarize_on(home: &Path, today: NaiveDate) -> SessionUsageSummary {
    SessionUsageSummary {
        tools: vec![
            scan_claude(&home.join(".claude"))
                .into_summary("claude-code", today),
            scan_codex(&home.join(".codex")).into_summary("codex", today),
            scan_gemini(&home.join(".gemini"))
                .into_summary("gemini-cli", today),
            scan_opencode(&opencode_data_dir(home))
                .into_summary("opencode", today),
            scan_grok(&home.join(".grok")).into_summary("grok-build", today),
            scan_openclaw(&home.join(".openclaw"))
                .into_summary("openclaw", today),
            scan_hermes(&home.join(".hermes")).into_summary("hermes", today),
            scan_pi(&home.join(".pi").join("agent")).into_summary("pi", today),
            scan_minimax(&home.join(".minimax"))
                .into_summary("minimax-code", today),
            scan_dsh(&home.join(".dsh")).into_summary("dsh", today),
            scan_qwen(&home.join(".qwen")).into_summary("qwen-code", today),
            scan_kimi(home).into_summary("kimi-cli", today),
        ],
    }
}

/// OpenCode keeps config under `~/.config/opencode` and session data under
/// the XDG data home (`~/.local/share/opencode` by default).
fn opencode_data_dir(home: &Path) -> std::path::PathBuf {
    home.join(".local").join("share").join("opencode")
}

fn timestamp_hour(value: &Value) -> Option<LocalHour> {
    let raw = value.get("timestamp")?.as_str()?;
    let timestamp = DateTime::parse_from_rfc3339(raw).ok()?;
    let local = timestamp.with_timezone(&Local);
    Some(LocalHour {
        date: local.date_naive(),
        hour: u8::try_from(local.hour()).unwrap_or(0),
    })
}

fn scan_claude(root: &Path) -> Acc {
    let mut acc = Acc::default();
    walk_jsonl(&root.join("projects"), 10, |path| {
        acc.files_scanned += 1;
        let mut by_id: HashMap<
            String,
            (String, u64, u64, u64, u64, Option<LocalHour>),
        > = HashMap::new();
        for_each_json_line(path, |value| {
            if value.get("type").and_then(Value::as_str) != Some("assistant") {
                return;
            }
            let Some(message) = value.get("message") else {
                return;
            };
            let Some(id) = message.get("id").and_then(Value::as_str) else {
                return;
            };
            let Some(usage) = message.get("usage") else {
                return;
            };
            let model = message
                .get("model")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_string();
            let input = json_u64(usage, "input_tokens");
            let output = json_u64(usage, "output_tokens");
            let cache_read = json_u64(usage, "cache_read_input_tokens");
            let cache_write = json_u64(usage, "cache_creation_input_tokens");
            let has_stop =
                message.get("stop_reason").and_then(Value::as_str).is_some();
            let next = (
                model,
                input,
                output,
                cache_read,
                cache_write,
                timestamp_hour(value),
            );
            match by_id.get(id) {
                Some(existing) if !has_stop && existing.2 >= output => {}
                _ => {
                    by_id.insert(id.to_string(), next);
                }
            }
        });
        for (model, input, output, cache_read, cache_write, day) in
            by_id.into_values()
        {
            acc.add_turn(&model, input, output, cache_read, cache_write, day);
        }
    });
    acc
}

fn scan_codex(root: &Path) -> Acc {
    let mut acc = Acc::default();
    for folder in [root.join("sessions"), root.join("archived_sessions")] {
        walk_jsonl(&folder, 8, |path| {
            acc.files_scanned += 1;
            let mut last_model = String::new();
            let mut summed_last = false;
            let mut last_total: Option<(
                (u64, u64, u64, u64),
                Option<LocalHour>,
            )> = None;
            let mut previous_total: Option<(u64, u64, u64, u64)> = None;
            for_each_json_line(path, |value| {
                let kind = value.get("type").and_then(Value::as_str);
                let payload = value.get("payload");
                if kind == Some("turn_context") {
                    if let Some(model) = payload
                        .and_then(|p| p.get("model"))
                        .and_then(Value::as_str)
                    {
                        last_model = model.to_string();
                    }
                    return;
                }
                if kind != Some("event_msg") {
                    return;
                }
                let Some(payload) = payload else {
                    return;
                };
                if payload.get("type").and_then(Value::as_str)
                    != Some("token_count")
                {
                    return;
                }
                let Some(info) = payload.get("info") else {
                    return;
                };
                let total = info.get("total_token_usage").map(openai_usage);
                if let Some(last) = info.get("last_token_usage") {
                    let (input, output, cache_read, cache_write) =
                        openai_usage(last);
                    let repeated_total =
                        total.is_some() && total == previous_total;
                    if !repeated_total
                        && input + output + cache_read + cache_write > 0
                    {
                        acc.add_turn(
                            &last_model,
                            input,
                            output,
                            cache_read,
                            cache_write,
                            timestamp_hour(value),
                        );
                        summed_last = true;
                    }
                }
                if let Some(total) = total {
                    previous_total = Some(total);
                    last_total = Some((total, timestamp_hour(value)));
                }
            });
            if !summed_last {
                if let Some(((input, output, cache_read, cache_write), day)) =
                    last_total
                {
                    if input + output + cache_read + cache_write > 0 {
                        acc.add_turn(
                            &last_model,
                            input,
                            output,
                            cache_read,
                            cache_write,
                            day,
                        );
                    }
                }
            }
        });
    }
    acc
}

fn scan_gemini(root: &Path) -> Acc {
    let mut files = Vec::new();
    walk_files(&root.join("tmp"), 8, &["json", "jsonl"], |path| {
        if path
            .file_name()
            .and_then(|name| name.to_str())
            .is_some_and(|name| name.starts_with("session-"))
        {
            files.push(path.to_path_buf());
        }
    });
    let migrated: std::collections::HashSet<std::path::PathBuf> = files
        .iter()
        .filter(|path| {
            path.extension().and_then(|ext| ext.to_str()) == Some("jsonl")
        })
        .map(|path| path.with_extension(""))
        .collect();
    let mut acc = Acc::default();
    for path in files {
        if path.extension().and_then(|ext| ext.to_str()) == Some("json")
            && migrated.contains(&path.with_extension(""))
        {
            continue;
        }
        let Ok(raw) = fs::read_to_string(&path) else {
            continue;
        };
        acc.files_scanned += 1;
        for message in gemini_messages(&raw) {
            add_gemini_turn(&mut acc, &message);
        }
    }
    acc
}

fn add_gemini_turn(acc: &mut Acc, value: &Value) {
    let kind = value.get("type").and_then(Value::as_str);
    if kind != Some("gemini") && kind != Some("model") {
        return;
    }
    let Some(tokens) = value.get("tokens") else {
        return;
    };
    let model = value.get("model").and_then(Value::as_str).unwrap_or("");
    let reported_input = json_u64(tokens, "input");
    let output = json_u64(tokens, "output") + json_u64(tokens, "thoughts");
    let cache_read = json_u64(tokens, "cached");
    let input = reported_input.saturating_sub(cache_read);
    if input + output + cache_read == 0 {
        return;
    }
    acc.add_turn(model, input, output, cache_read, 0, timestamp_hour(value));
}

/// Old Gemini sessions are one JSON object, or one message per JSONL line.
/// Newer sessions append records: the same message id is replaced in place,
/// `$set.messages` replaces the list, and `$rewindTo` drops that message and
/// everything after it. A `.json` file left beside the migrated `.jsonl` is
/// ignored by the caller.
fn gemini_messages(raw: &str) -> Vec<Value> {
    if let Ok(Value::Object(map)) = serde_json::from_str::<Value>(raw) {
        if let Some(Value::Array(messages)) = map.get("messages") {
            return messages.clone();
        }
        let value = Value::Object(map);
        if value.get("tokens").is_some() {
            return vec![value];
        }
        return Vec::new();
    }

    let mut messages = Vec::new();
    let mut index: HashMap<String, usize> = HashMap::new();
    for line in raw.lines() {
        let Ok(Value::Object(mut record)) = serde_json::from_str::<Value>(line)
        else {
            continue;
        };
        if let Some(id) = record.get("$rewindTo").and_then(Value::as_str) {
            let keep = index.get(id).copied().unwrap_or(0);
            messages.truncate(keep);
            index.retain(|_, position| *position < keep);
        } else if let Some(Value::Object(mut set)) = record.remove("$set") {
            if let Some(Value::Array(list)) = set.remove("messages") {
                messages.clear();
                index.clear();
                for message in list {
                    upsert_gemini_message(&mut messages, &mut index, message);
                }
            }
        } else if record.get("id").and_then(Value::as_str).is_some()
            || record.get("sessionId").is_some()
        {
            if let Some(Value::Array(list)) = record.remove("messages") {
                for message in list {
                    upsert_gemini_message(&mut messages, &mut index, message);
                }
            }
            if record.get("id").and_then(Value::as_str).is_some() {
                upsert_gemini_message(
                    &mut messages,
                    &mut index,
                    Value::Object(record),
                );
            }
        } else {
            messages.push(Value::Object(record));
        }
    }
    messages
}

fn upsert_gemini_message(
    messages: &mut Vec<Value>,
    index: &mut HashMap<String, usize>,
    message: Value,
) {
    let Some(id) = message
        .get("id")
        .and_then(Value::as_str)
        .map(str::to_string)
    else {
        messages.push(message);
        return;
    };
    if let Some(position) = index.get(&id).copied() {
        messages[position] = message;
    } else {
        index.insert(id, messages.len());
        messages.push(message);
    }
}

/// OpenCode assistant turns only. Prompts live in `part` rows / files and are
/// never opened here.
fn scan_opencode(root: &Path) -> Acc {
    let mut acc = Acc::default();
    let db = root.join("opencode.db");
    if db.is_file() {
        acc.files_scanned += 1;
        scan_opencode_db(&db, &mut acc);
        return acc;
    }
    // Legacy JSON tree (pre ~1.2). Skip `part/` — that is where prompt text lives.
    let message_root = root.join("storage").join("message");
    walk_files(&message_root, 8, &["json"], |path| {
        acc.files_scanned += 1;
        let Ok(raw) = fs::read_to_string(path) else {
            return;
        };
        let Ok(value) = serde_json::from_str::<Value>(&raw) else {
            return;
        };
        add_opencode_assistant(&mut acc, &value, None);
    });
    // Oldest layout: storage/session/message/<session>/*.json
    let legacy = root.join("storage").join("session").join("message");
    walk_files(&legacy, 8, &["json"], |path| {
        acc.files_scanned += 1;
        let Ok(raw) = fs::read_to_string(path) else {
            return;
        };
        let Ok(value) = serde_json::from_str::<Value>(&raw) else {
            return;
        };
        // message v1 nested the assistant payload.
        if let Some(assistant) =
            value.get("metadata").and_then(|meta| meta.get("assistant"))
        {
            add_opencode_assistant(&mut acc, assistant, None);
        } else {
            add_opencode_assistant(&mut acc, &value, None);
        }
    });
    acc
}

fn scan_opencode_db(path: &Path, acc: &mut Acc) {
    use rusqlite::{Connection, OpenFlags};
    let Ok(conn) = Connection::open_with_flags(
        path,
        OpenFlags::SQLITE_OPEN_READ_ONLY | OpenFlags::SQLITE_OPEN_NO_MUTEX,
    ) else {
        return;
    };
    let _ = conn.pragma_update(None, "query_only", true);
    let Ok(mut statement) =
        conn.prepare("SELECT data, time_created FROM message")
    else {
        return;
    };
    let Ok(rows) = statement.query_map([], |row| {
        let data: String = row.get(0)?;
        let created: Option<i64> = row.get(1)?;
        Ok((data, created))
    }) else {
        return;
    };
    for row in rows.flatten() {
        let Ok(value) = serde_json::from_str::<Value>(&row.0) else {
            continue;
        };
        add_opencode_assistant(acc, &value, row.1);
    }
}

fn add_opencode_assistant(
    acc: &mut Acc,
    message: &Value,
    fallback_ms: Option<i64>,
) {
    if message.get("role").and_then(Value::as_str) != Some("assistant") {
        return;
    }
    let Some(tokens) = message.get("tokens") else {
        return;
    };
    let input = json_u64(tokens, "input");
    // Reasoning is billed with output in Folkbench list-price estimates.
    let output = json_u64(tokens, "output") + json_u64(tokens, "reasoning");
    let cache = tokens.get("cache");
    let cache_read = cache.map(|value| json_u64(value, "read")).unwrap_or(0);
    let cache_write = cache.map(|value| json_u64(value, "write")).unwrap_or(0);
    if input == 0 && output == 0 && cache_read == 0 && cache_write == 0 {
        return;
    }
    let model = message.get("modelID").and_then(Value::as_str).unwrap_or("");
    acc.add_turn(
        model,
        input,
        output,
        cache_read,
        cache_write,
        opencode_message_hour(message, fallback_ms),
    );
}

fn opencode_message_hour(
    message: &Value,
    fallback_ms: Option<i64>,
) -> Option<LocalHour> {
    let ms = message
        .get("time")
        .and_then(|time| {
            time.get("completed")
                .or_else(|| time.get("created"))
                .and_then(Value::as_i64)
        })
        .or(fallback_ms)?;
    let utc = DateTime::from_timestamp_millis(ms)?;
    let local = utc.with_timezone(&Local);
    Some(LocalHour {
        date: local.date_naive(),
        hour: u8::try_from(local.hour()).unwrap_or(0),
    })
}

// ---------------------------------------------------------------------------
// Additional tools. Every scanner keeps token counts only; message text that
// passes through memory while a line is parsed is never stored or returned.
// ---------------------------------------------------------------------------

fn local_hour_of(local: DateTime<Local>) -> LocalHour {
    LocalHour {
        date: local.date_naive(),
        hour: u8::try_from(local.hour()).unwrap_or(0),
    }
}

fn epoch_ms_hour(ms: i64) -> Option<LocalHour> {
    let utc = DateTime::from_timestamp_millis(ms)?;
    Some(local_hour_of(utc.with_timezone(&Local)))
}

/// RFC 3339 text, epoch milliseconds, or epoch seconds (with fraction).
fn flexible_hour(value: Option<&Value>) -> Option<LocalHour> {
    match value? {
        Value::String(raw) => {
            let parsed = DateTime::parse_from_rfc3339(raw).ok()?;
            Some(local_hour_of(parsed.with_timezone(&Local)))
        }
        Value::Number(number) => epoch_number_hour(number.as_f64()?),
        _ => None,
    }
}

fn epoch_number_hour(raw: f64) -> Option<LocalHour> {
    if !raw.is_finite() || raw <= 0.0 {
        return None;
    }
    // Anything below 1e11 is seconds (that is year 5138 in milliseconds).
    let ms = if raw < 100_000_000_000.0 {
        raw * 1000.0
    } else {
        raw
    };
    epoch_ms_hour(ms as i64)
}

/// Lines of a zstd-compressed JSONL file. A torn final frame (file still being
/// written) ends the stream; lines decoded before it are kept.
fn for_each_zstd_json_line(path: &Path, mut visit: impl FnMut(&Value)) {
    let Ok(file) = File::open(path) else {
        return;
    };
    let Ok(decoder) = zstd::stream::read::Decoder::new(file) else {
        return;
    };
    for line in BufReader::new(decoder).lines() {
        let Ok(line) = line else {
            break;
        };
        if line.trim().is_empty() {
            continue;
        }
        if let Ok(value) = serde_json::from_str::<Value>(&line) {
            visit(&value);
        }
    }
}

fn open_read_only_db(path: &Path) -> Option<rusqlite::Connection> {
    use rusqlite::{Connection, OpenFlags};
    let conn = Connection::open_with_flags(
        path,
        OpenFlags::SQLITE_OPEN_READ_ONLY | OpenFlags::SQLITE_OPEN_NO_MUTEX,
    )
    .ok()?;
    let _ = conn.pragma_update(None, "query_only", true);
    let _ = conn.busy_timeout(std::time::Duration::from_millis(500));
    Some(conn)
}

fn sql_u64(value: Option<i64>) -> u64 {
    value.map(|number| number.max(0) as u64).unwrap_or(0)
}

// --- Grok Build -------------------------------------------------------------

/// `~/.grok/sessions/<cwd>/<session>/usage.json`. Each turn lists tokens per
/// model; `inputTokens` already includes `cachedReadTokens`.
fn scan_grok(root: &Path) -> Acc {
    let mut acc = Acc::default();
    walk_files(&root.join("sessions"), 2, &["json"], |path| {
        if path.file_name().and_then(|name| name.to_str()) != Some("usage.json")
        {
            return;
        }
        let Ok(raw) = fs::read_to_string(path) else {
            return;
        };
        let Ok(value) = serde_json::from_str::<Value>(&raw) else {
            return;
        };
        acc.files_scanned += 1;
        add_grok_usage(&mut acc, &value);
    });
    acc
}

fn add_grok_usage(acc: &mut Acc, value: &Value) {
    let session_when = flexible_hour(value.get("updatedAt"));
    match value.get("turns").and_then(Value::as_array) {
        Some(turns) if !turns.is_empty() => {
            for turn in turns {
                let when = flexible_hour(turn.get("endedAt")).or(session_when);
                add_grok_bucket(acc, turn, when);
            }
        }
        _ => {
            if let Some(session) = value.get("session") {
                add_grok_bucket(acc, session, session_when);
            }
        }
    }
}

fn add_grok_bucket(acc: &mut Acc, bucket: &Value, when: Option<LocalHour>) {
    if let Some(Value::Object(models)) = bucket.get("modelUsage") {
        if !models.is_empty() {
            for (model, usage) in models {
                add_grok_tokens(acc, model, usage, when);
            }
            return;
        }
    }
    let model = bucket
        .get("primaryModelId")
        .and_then(Value::as_str)
        .unwrap_or("");
    add_grok_tokens(acc, model, bucket, when);
}

fn add_grok_tokens(
    acc: &mut Acc,
    model: &str,
    usage: &Value,
    when: Option<LocalHour>,
) {
    let cache_read = json_u64(usage, "cachedReadTokens");
    let cache_write = json_u64(usage, "cacheCreationTokens");
    let input = json_u64(usage, "inputTokens").saturating_sub(cache_read);
    let output = json_u64(usage, "outputTokens");
    if input + output + cache_read + cache_write == 0 {
        return;
    }
    let calls =
        u32::try_from(json_u64(usage, "modelCalls").max(1)).unwrap_or(u32::MAX);
    acc.add_turns(model, calls, input, output, cache_read, cache_write, when);
}

// --- Pi and OpenClaw (shared pi session entries) ----------------------------

/// Pi session entry: assistant `message`, `usage`, `compaction` or
/// `branch_summary`. Pi `usage.input` excludes cache reads and writes.
/// Forked sessions copy entries, so `seen` drops repeats across files.
fn add_pi_entry(
    acc: &mut Acc,
    entry: &Value,
    fallback: Option<LocalHour>,
    seen: &mut std::collections::HashSet<String>,
) {
    let kind = entry.get("type").and_then(Value::as_str);
    let (usage, model, inner_time) = match kind {
        Some("message") => {
            let Some(message) = entry.get("message") else {
                return;
            };
            if message.get("role").and_then(Value::as_str) != Some("assistant")
            {
                return;
            }
            (
                message.get("usage"),
                message.get("model"),
                message.get("timestamp"),
            )
        }
        Some("usage") | Some("compaction") | Some("branch_summary") => {
            (entry.get("usage"), entry.get("model"), None)
        }
        _ => return,
    };
    let Some(usage) = usage else {
        return;
    };
    let input = json_u64(usage, "input");
    let output = json_u64(usage, "output");
    let cache_read = json_u64(usage, "cacheRead");
    let cache_write = json_u64(usage, "cacheWrite");
    if input + output + cache_read + cache_write == 0 {
        return;
    }
    let model = model.and_then(Value::as_str).unwrap_or("");
    let stamp = entry
        .get("timestamp")
        .map(Value::to_string)
        .or_else(|| inner_time.map(Value::to_string));
    if let Some(stamp) = stamp {
        let id = entry.get("id").and_then(Value::as_str).unwrap_or("");
        let key = format!(
            "{id}|{stamp}|{model}|{input}|{output}|{cache_read}|{cache_write}"
        );
        if !seen.insert(key) {
            return;
        }
    }
    let when = flexible_hour(entry.get("timestamp"))
        .or_else(|| flexible_hour(inner_time))
        .or(fallback);
    acc.add_turn(model, input, output, cache_read, cache_write, when);
}

/// `~/.pi/agent/sessions/--<cwd>--/<time>_<id>.jsonl`.
fn scan_pi(agent_dir: &Path) -> Acc {
    let mut acc = Acc::default();
    let mut seen = std::collections::HashSet::new();
    walk_jsonl(&agent_dir.join("sessions"), 3, |path| {
        acc.files_scanned += 1;
        for_each_json_line(path, |value| {
            add_pi_entry(&mut acc, value, None, &mut seen);
        });
    });
    acc
}

/// OpenClaw keeps pi-style transcript entries per agent in
/// `agents/<id>/agent/openclaw-agent.sqlite` (`transcript_events`, plain JSON
/// or zstd), cold archives in `agents/<id>/sessions/cold/*.jsonl.zst`, and
/// older installs in `agents/<id>/sessions/*.jsonl`.
fn scan_openclaw(root: &Path) -> Acc {
    let mut acc = Acc::default();
    let mut seen = std::collections::HashSet::new();
    let Ok(agents) = fs::read_dir(root.join("agents")) else {
        return acc;
    };
    for agent in agents.flatten() {
        let dir = agent.path();
        if !dir.is_dir() {
            continue;
        }
        let db = dir.join("agent").join("openclaw-agent.sqlite");
        if db.is_file() {
            acc.files_scanned += 1;
            scan_openclaw_db(&db, &mut acc, &mut seen);
        }
        let sessions = dir.join("sessions");
        walk_jsonl(&sessions, 1, |path| {
            acc.files_scanned += 1;
            for_each_json_line(path, |value| {
                add_pi_entry(&mut acc, value, None, &mut seen);
            });
        });
        walk_files(&sessions.join("cold"), 1, &["zst"], |path| {
            acc.files_scanned += 1;
            for_each_zstd_json_line(path, |value| {
                add_pi_entry(&mut acc, value, None, &mut seen);
            });
        });
    }
    acc
}

fn scan_openclaw_db(
    path: &Path,
    acc: &mut Acc,
    seen: &mut std::collections::HashSet<String>,
) {
    let Some(conn) = open_read_only_db(path) else {
        return;
    };
    let statement = conn
        .prepare(
            "SELECT event_json, event_zstd, created_at FROM transcript_events",
        )
        .or_else(|_| {
            conn.prepare(
                "SELECT event_json, NULL, created_at FROM transcript_events",
            )
        });
    let Ok(mut statement) = statement else {
        return;
    };
    let Ok(rows) = statement.query_map([], |row| {
        let text: Option<String> = row.get(0)?;
        let packed: Option<Vec<u8>> = row.get(1)?;
        let created: Option<i64> = row.get(2)?;
        Ok((text, packed, created))
    }) else {
        return;
    };
    for (text, packed, created) in rows.flatten() {
        let raw = match (text, packed) {
            (Some(text), _) => text,
            (None, Some(bytes)) => {
                let Ok(decoded) = zstd::stream::decode_all(bytes.as_slice())
                else {
                    continue;
                };
                let Ok(text) = String::from_utf8(decoded) else {
                    continue;
                };
                text
            }
            _ => continue,
        };
        let Ok(value) = serde_json::from_str::<Value>(&raw) else {
            continue;
        };
        let fallback =
            created.and_then(|stamp| epoch_number_hour(stamp as f64));
        add_pi_entry(acc, &value, fallback, seen);
    }
}

// --- Hermes ---------------------------------------------------------------

/// Hermes `state.db` (and `profiles/<name>/state.db`). Per-model rows in
/// `session_model_usage`; sessions without them fall back to the session
/// totals. Input excludes cache; output includes reasoning.
fn scan_hermes(root: &Path) -> Acc {
    let mut acc = Acc::default();
    let mut dbs = vec![root.join("state.db")];
    if let Ok(profiles) = fs::read_dir(root.join("profiles")) {
        for profile in profiles.flatten() {
            dbs.push(profile.path().join("state.db"));
        }
    }
    for db in dbs {
        if db.is_file() {
            acc.files_scanned += 1;
            scan_hermes_db(&db, &mut acc);
        }
    }
    acc
}

fn scan_hermes_db(path: &Path, acc: &mut Acc) {
    let Some(conn) = open_read_only_db(path) else {
        return;
    };
    let mut covered = std::collections::HashSet::new();
    if let Ok(mut statement) = conn.prepare(
        "SELECT session_id, model, api_call_count, input_tokens, output_tokens, \
         cache_read_tokens, cache_write_tokens, COALESCE(last_seen, first_seen) \
         FROM session_model_usage",
    ) {
        if let Ok(rows) = statement.query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, Option<String>>(1)?,
                row.get::<_, Option<i64>>(2)?,
                row.get::<_, Option<i64>>(3)?,
                row.get::<_, Option<i64>>(4)?,
                row.get::<_, Option<i64>>(5)?,
                row.get::<_, Option<i64>>(6)?,
                row.get::<_, Option<f64>>(7)?,
            ))
        }) {
            for (session, model, calls, input, output, read, write, seen_at) in
                rows.flatten()
            {
                covered.insert(session);
                let (input, output, read, write) = (
                    sql_u64(input),
                    sql_u64(output),
                    sql_u64(read),
                    sql_u64(write),
                );
                if input + output + read + write == 0 {
                    continue;
                }
                let calls = u32::try_from(sql_u64(calls).max(1))
                    .unwrap_or(u32::MAX);
                acc.add_turns(
                    model.as_deref().unwrap_or(""),
                    calls,
                    input,
                    output,
                    read,
                    write,
                    seen_at.and_then(epoch_number_hour),
                );
            }
        }
    }
    let Ok(mut statement) = conn.prepare(
        "SELECT id, model, input_tokens, output_tokens, cache_read_tokens, \
         cache_write_tokens, COALESCE(ended_at, started_at) FROM sessions",
    ) else {
        return;
    };
    let Ok(rows) = statement.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, Option<String>>(1)?,
            row.get::<_, Option<i64>>(2)?,
            row.get::<_, Option<i64>>(3)?,
            row.get::<_, Option<i64>>(4)?,
            row.get::<_, Option<i64>>(5)?,
            row.get::<_, Option<f64>>(6)?,
        ))
    }) else {
        return;
    };
    for (id, model, input, output, read, write, at) in rows.flatten() {
        if covered.contains(&id) {
            continue;
        }
        let (input, output, read, write) = (
            sql_u64(input),
            sql_u64(output),
            sql_u64(read),
            sql_u64(write),
        );
        if input + output + read + write == 0 {
            continue;
        }
        acc.add_turn(
            model.as_deref().unwrap_or(""),
            input,
            output,
            read,
            write,
            at.and_then(epoch_number_hour),
        );
    }
}

// --- MiniMax Code -----------------------------------------------------------

/// MiniMax Code (pi-agent runtime) writes one row per model call to
/// `local_runtime_token_usage` under `~/.minimax/v2/sqlite/`. Older drafts kept
/// the same table in `chats/local-runtime.sqlite`; rows are de-duplicated.
fn scan_minimax(root: &Path) -> Acc {
    let mut acc = Acc::default();
    let mut dbs = Vec::new();
    if let Ok(entries) = fs::read_dir(root.join("v2").join("sqlite")) {
        let mut found: Vec<_> = entries
            .flatten()
            .map(|entry| entry.path())
            .filter(|path| {
                path.extension().and_then(|ext| ext.to_str()) == Some("sqlite")
            })
            .collect();
        found.sort();
        dbs.extend(found);
    }
    dbs.push(root.join("v2").join("chats").join("local-runtime.sqlite"));
    dbs.push(root.join("chats").join("local-runtime.sqlite"));
    let mut seen = std::collections::HashSet::new();
    for db in dbs {
        if !db.is_file() {
            continue;
        }
        let Some(conn) = open_read_only_db(&db) else {
            continue;
        };
        let Ok(mut statement) = conn.prepare(
            "SELECT session_id, COALESCE(turn_id, ''), COALESCE(model, ''), ts, \
             input_tokens, output_tokens, cache_read_tokens, cache_write_tokens \
             FROM local_runtime_token_usage",
        ) else {
            continue;
        };
        acc.files_scanned += 1;
        let Ok(rows) = statement.query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, Option<i64>>(3)?,
                row.get::<_, Option<i64>>(4)?,
                row.get::<_, Option<i64>>(5)?,
                row.get::<_, Option<i64>>(6)?,
                row.get::<_, Option<i64>>(7)?,
            ))
        }) else {
            continue;
        };
        for (session, turn, model, ts, input, output, read, write) in
            rows.flatten()
        {
            let (input, output, read, write) = (
                sql_u64(input),
                sql_u64(output),
                sql_u64(read),
                sql_u64(write),
            );
            if input + output + read + write == 0 {
                continue;
            }
            let key = format!(
                "{session}|{turn}|{model}|{ts:?}|{input}|{output}|{read}|{write}"
            );
            if !seen.insert(key) {
                continue;
            }
            acc.add_turn(
                &model,
                input,
                output,
                read,
                write,
                ts.and_then(|stamp| epoch_number_hour(stamp as f64)),
            );
        }
    }
    acc
}

// --- DeepSeek Harness -------------------------------------------------------

/// `~/.dsh/sessions/<workspace>/session-<id>/session.v<N>.jsonl[.zstd]`.
/// `assistant/message` and `compaction/summary` carry `usage`; `inputTokens`
/// is uncached input and `outputTokens` includes reasoning.
fn scan_dsh(root: &Path) -> Acc {
    let mut acc = Acc::default();
    walk_files(
        &root.join("sessions"),
        3,
        &["jsonl", "zstd", "zst"],
        |path| {
            let Some(name) = path.file_name().and_then(|name| name.to_str())
            else {
                return;
            };
            if !name.starts_with("session") {
                return;
            }
            acc.files_scanned += 1;
            if name.ends_with(".jsonl") {
                for_each_json_line(path, |value| {
                    add_dsh_event(&mut acc, value)
                });
            } else if name.ends_with(".jsonl.zstd")
                || name.ends_with(".jsonl.zst")
            {
                for_each_zstd_json_line(path, |value| {
                    add_dsh_event(&mut acc, value)
                });
            }
        },
    );
    acc
}

fn add_dsh_event(acc: &mut Acc, value: &Value) {
    let Some(data) = value.get("data") else {
        return;
    };
    let model = match value.get("type").and_then(Value::as_str) {
        Some("assistant/message") => data
            .get("message")
            .and_then(|message| message.get("source"))
            .and_then(|source| source.get("model"))
            .and_then(Value::as_str),
        Some("compaction/summary") => data.get("model").and_then(Value::as_str),
        _ => return,
    };
    let Some(usage) = data.get("usage") else {
        return;
    };
    let input = json_u64(usage, "inputTokens");
    let output = json_u64(usage, "outputTokens");
    let cache_read = json_u64(usage, "cacheReadTokens");
    let cache_write = json_u64(usage, "cacheWriteTokens");
    if input + output + cache_read + cache_write == 0 {
        return;
    }
    acc.add_turn(
        model.unwrap_or(""),
        input,
        output,
        cache_read,
        cache_write,
        flexible_hour(value.get("time")),
    );
}

// --- Qwen Code --------------------------------------------------------------

/// Qwen Code records `type: "assistant"` lines with Gemini-style
/// `usageMetadata` in `~/.qwen/projects/<cwd>/chats/*.jsonl` (and `archive/`).
/// Older builds used the Gemini CLI layout under `~/.qwen/tmp`.
fn scan_qwen(root: &Path) -> Acc {
    let mut acc = scan_gemini(root);
    walk_jsonl(&root.join("projects"), 4, |path| {
        if !path.components().any(|part| part.as_os_str() == "chats") {
            return;
        }
        acc.files_scanned += 1;
        for_each_json_line(path, |value| add_qwen_record(&mut acc, value));
    });
    acc
}

fn add_qwen_record(acc: &mut Acc, value: &Value) {
    if value.get("type").and_then(Value::as_str) != Some("assistant") {
        return;
    }
    let Some(usage) = value.get("usageMetadata") else {
        return;
    };
    let cache_read = json_u64(usage, "cachedContentTokenCount");
    let prompt = json_u64(usage, "promptTokenCount");
    let input = prompt.saturating_sub(cache_read);
    let candidates = json_u64(usage, "candidatesTokenCount");
    let thoughts = json_u64(usage, "thoughtsTokenCount");
    let total = json_u64(usage, "totalTokenCount");
    // Gemini-native: total = prompt + candidates + thoughts. OpenAI-compatible
    // converters put completion_tokens (reasoning included) in candidates.
    let output = if thoughts > 0 && total >= prompt + candidates + thoughts {
        candidates + thoughts
    } else {
        candidates
    };
    if input + output + cache_read == 0 {
        return;
    }
    let model = value.get("model").and_then(Value::as_str).unwrap_or("");
    acc.add_turn(model, input, output, cache_read, 0, timestamp_hour(value));
}

// --- Kimi -------------------------------------------------------------------

/// Kimi Code: `~/.kimi-code/sessions/<ws>/<session>/agents/<agent>/wire.jsonl`,
/// usage on `context.append_loop_event` → `step.end`; the model comes from the
/// latest `config.update`. Legacy kimi-cli (`~/.kimi/sessions/**/wire.jsonl`)
/// records `StatusUpdate.token_usage`. Forks copy records, so step ids are
/// de-duplicated.
fn scan_kimi(home: &Path) -> Acc {
    let mut acc = Acc::default();
    let mut seen = std::collections::HashSet::new();
    for root in [
        home.join(".kimi-code").join("sessions"),
        home.join(".kimi").join("sessions"),
    ] {
        walk_jsonl(&root, 7, |path| {
            if path.file_name().and_then(|name| name.to_str())
                != Some("wire.jsonl")
            {
                return;
            }
            acc.files_scanned += 1;
            let mut model = String::new();
            for_each_json_line(path, |value| {
                add_kimi_record(&mut acc, value, &mut model, &mut seen);
            });
        });
    }
    acc
}

fn add_kimi_record(
    acc: &mut Acc,
    value: &Value,
    model: &mut String,
    seen: &mut std::collections::HashSet<String>,
) {
    let kind = value.get("type").and_then(Value::as_str);
    if matches!(kind, Some("config.update") | Some("config_updated")) {
        let alias = value
            .get("modelAlias")
            .or_else(|| value.get("config").and_then(|c| c.get("modelAlias")))
            .and_then(Value::as_str);
        if let Some(alias) = alias {
            *model = alias.to_string();
        }
        return;
    }
    let event = match kind {
        Some("context.append_loop_event") => value.get("event"),
        Some("step.end") => Some(value),
        _ => None,
    };
    if let Some(event) = event {
        if event.get("type").and_then(Value::as_str) != Some("step.end") {
            return;
        }
        let Some(usage) = event.get("usage") else {
            return;
        };
        if let Some(id) = event.get("uuid").and_then(Value::as_str) {
            if !seen.insert(id.to_string()) {
                return;
            }
        }
        let input = json_u64(usage, "inputOther");
        let output = json_u64(usage, "output");
        let cache_read = json_u64(usage, "inputCacheRead");
        let cache_write = json_u64(usage, "inputCacheCreation");
        if input + output + cache_read + cache_write == 0 {
            return;
        }
        let when = flexible_hour(value.get("time"))
            .or_else(|| flexible_hour(event.get("time")));
        acc.add_turn(
            model.as_str(),
            input,
            output,
            cache_read,
            cache_write,
            when,
        );
        return;
    }
    // Legacy kimi-cli: {"timestamp": 1.7e9, "message": {"type": "StatusUpdate",
    // "payload": {"token_usage": {...}, "message_id": "..."}}}
    let Some(message) = value.get("message") else {
        return;
    };
    if message.get("type").and_then(Value::as_str) != Some("StatusUpdate") {
        return;
    }
    let Some(payload) = message.get("payload") else {
        return;
    };
    let Some(usage) = payload.get("token_usage") else {
        return;
    };
    if let Some(id) = payload.get("message_id").and_then(Value::as_str) {
        if !seen.insert(id.to_string()) {
            return;
        }
    }
    let input = json_u64(usage, "input_other");
    let output = json_u64(usage, "output");
    let cache_read = json_u64(usage, "input_cache_read");
    let cache_write = json_u64(usage, "input_cache_creation");
    if input + output + cache_read + cache_write == 0 {
        return;
    }
    acc.add_turn(
        model.as_str(),
        input,
        output,
        cache_read,
        cache_write,
        flexible_hour(value.get("timestamp")),
    );
}

fn openai_usage(value: &Value) -> (u64, u64, u64, u64) {
    let input = json_u64(value, "input_tokens");
    let cached = json_u64(value, "cached_input_tokens");
    (
        input.saturating_sub(cached),
        json_u64(value, "output_tokens"),
        cached,
        json_u64(value, "cache_write_input_tokens"),
    )
}

fn json_u64(value: &Value, key: &str) -> u64 {
    value
        .get(key)
        .and_then(Value::as_u64)
        .or_else(|| {
            value
                .get(key)
                .and_then(Value::as_f64)
                .map(|number| number.max(0.0) as u64)
        })
        .unwrap_or(0)
}

fn for_each_json_line(path: &Path, mut visit: impl FnMut(&Value)) {
    let Ok(file) = File::open(path) else {
        return;
    };
    let reader = BufReader::new(file);
    for line in reader.lines() {
        let Ok(line) = line else {
            continue;
        };
        if line.trim().is_empty() {
            continue;
        }
        let Ok(value) = serde_json::from_str::<Value>(&line) else {
            continue;
        };
        visit(&value);
    }
}

fn walk_jsonl(root: &Path, max_depth: usize, visit: impl FnMut(&Path)) {
    walk_files(root, max_depth, &["jsonl"], visit);
}

fn walk_files(
    root: &Path,
    max_depth: usize,
    extensions: &[&str],
    mut visit: impl FnMut(&Path),
) {
    const MAX_FILES: usize = 8_000;
    fn rec(
        dir: &Path,
        depth: usize,
        max_depth: usize,
        extensions: &[&str],
        remaining: &mut usize,
        visit: &mut impl FnMut(&Path),
    ) {
        if depth > max_depth || *remaining == 0 {
            return;
        }
        let Ok(entries) = fs::read_dir(dir) else {
            return;
        };
        for entry in entries.flatten() {
            if *remaining == 0 {
                return;
            }
            let path = entry.path();
            let Ok(meta) = path.symlink_metadata() else {
                continue;
            };
            if meta.file_type().is_symlink() {
                continue;
            }
            if meta.is_dir() {
                rec(&path, depth + 1, max_depth, extensions, remaining, visit);
            } else if meta.is_file()
                && path.extension().and_then(|ext| ext.to_str()).is_some_and(
                    |ext| extensions.iter().any(|expected| *expected == ext),
                )
            {
                *remaining -= 1;
                visit(&path);
            }
        }
    }
    let mut remaining = MAX_FILES;
    rec(root, 0, max_depth, extensions, &mut remaining, &mut visit);
}

/// Published list USD, stored as nanodollars per token.
/// $3 / 1M tokens = 3000 nanodollars per token.
fn list_price_nanos(
    model: &str,
    input: u64,
    output: u64,
    cache_read: u64,
    cache_write: u64,
) -> Option<u128> {
    let (input_n, output_n, cache_read_n, cache_write_n) = rates_for(model)?;
    Some(
        u128::from(input) * input_n
            + u128::from(output) * output_n
            + u128::from(cache_read) * cache_read_n
            + u128::from(cache_write) * cache_write_n,
    )
}

fn rates_for(model: &str) -> Option<(u128, u128, u128, u128)> {
    let id = canonical_model_id(model);
    if let Some(rates) = official_rates(&id) {
        return Some(rates);
    }
    if let Some(undated) = without_revision_date(&id) {
        if let Some(rates) = official_rates(undated) {
            return Some(rates);
        }
    }
    without_calendar_date(&id).and_then(official_rates)
}

fn canonical_model_id(model: &str) -> String {
    let id = model.trim().to_ascii_lowercase();
    for prefix in ["anthropic/", "openai/", "google/", "models/"] {
        if let Some(rest) = id.strip_prefix(prefix) {
            return rest.to_string();
        }
    }
    id
}

fn without_revision_date(id: &str) -> Option<&str> {
    let bytes = id.as_bytes();
    if bytes.len() < 9 || bytes[bytes.len() - 9] != b'-' {
        return None;
    }
    let date = &bytes[bytes.len() - 8..];
    if date.iter().all(|byte| byte.is_ascii_digit()) {
        Some(&id[..id.len() - 9])
    } else {
        None
    }
}

/// OpenAI snapshot ids use `-YYYY-MM-DD`. Strip that suffix once.
fn without_calendar_date(id: &str) -> Option<&str> {
    let bytes = id.as_bytes();
    if bytes.len() < 11 || bytes[bytes.len() - 11] != b'-' {
        return None;
    }
    let date = &bytes[bytes.len() - 10..];
    if date[4] == b'-'
        && date[7] == b'-'
        && date[..4].iter().all(u8::is_ascii_digit)
        && date[5..7].iter().all(u8::is_ascii_digit)
        && date[8..].iter().all(u8::is_ascii_digit)
    {
        Some(&id[..id.len() - 11])
    } else {
        None
    }
}

/// Pinned published list, nanodollars per token.
/// Tuple is input, output, cache read, cache write.
/// Standard, short-context rates checked on 2026-10-08.
/// Claude cache write is the 5-minute rate. An official "-"
/// or any unpublished cache component is 0. Gemini Flash rows
/// use the paid price in effect through 2026-12-31.
/// Claude Haiku 5.5 uses prompts up to 100,000 tokens.
fn official_rates(id: &str) -> Option<(u128, u128, u128, u128)> {
    let rates = match id {
        "claude-fable-5-1" | "claude-mythos-5-1" => {
            (10_000, 50_000, 250, 12_500)
        }
        "claude-fable-5" | "claude-mythos-5" => (10_000, 50_000, 1_000, 12_500),
        "claude-opus-5-5" => (4_000, 20_000, 200, 5_000),
        "claude-opus-5" | "claude-opus-4-8" | "claude-opus-4-7"
        | "claude-opus-4-6" | "claude-opus-4-5" => (5_000, 25_000, 500, 6_250),
        "claude-opus-4-1" | "claude-opus-4" | "claude-3-opus" => {
            (15_000, 75_000, 1_500, 18_750)
        }
        "claude-sonnet-5-5" => (2_000, 10_000, 100, 2_500),
        "claude-sonnet-5" => (2_000, 10_000, 200, 2_500),
        "claude-sonnet-4-6" | "claude-sonnet-4-5" | "claude-sonnet-4"
        | "claude-3-7-sonnet" | "claude-3-5-sonnet" => {
            (3_000, 15_000, 300, 3_750)
        }
        "claude-haiku-5-5" => (100, 500, 10, 125),
        "claude-haiku-4-5" => (1_000, 5_000, 100, 1_250),
        "claude-3-5-haiku" | "claude-3-haiku" => (800, 4_000, 80, 1_000),
        "gpt-6-astra" => (10_000, 50_000, 1_000, 12_500),
        "gpt-6.1-sol" => (2_000, 10_000, 100, 2_500),
        "gpt-6-luna" => (100, 500, 10, 125),
        "gpt-6-sol" => (2_000, 10_000, 200, 2_500),
        "gpt-5.6-cyber" => (12_500, 75_000, 1_250, 15_625),
        "gpt-5.6-sol" => (4_000, 20_000, 400, 5_000),
        "gpt-5.6-terra" => (2_000, 12_000, 200, 2_500),
        "gpt-5.6-luna" => (200, 1_200, 20, 250),
        "gpt-5.5-cyber" => (12_500, 75_000, 1_250, 0),
        "gpt-5.5" => (5_000, 30_000, 500, 0),
        "gpt-5.5-pro" | "gpt-5.4-pro" => (30_000, 180_000, 0, 0),
        "gpt-5.4" => (2_500, 15_000, 250, 0),
        "gpt-5.4-mini" => (750, 4_500, 75, 0),
        "gpt-5.4-nano" => (200, 1_250, 20, 0),
        "gpt-5.3-codex" | "gpt-5.2" => (1_750, 14_000, 175, 0),
        "gpt-5.2-pro" => (21_000, 168_000, 0, 0),
        "gpt-5.1" => (1_250, 10_000, 125, 0),
        "gpt-5-nano" => (50, 400, 5, 50),
        "gpt-5-mini" => (250, 2_000, 25, 250),
        "gpt-5" => (1_250, 10_000, 125, 1_250),
        "gpt-4.1-mini" => (400, 1_600, 100, 400),
        "gpt-4.1" => (2_000, 8_000, 500, 2_000),
        "gpt-4o-mini" => (150, 300, 75, 150),
        "gpt-4o" => (2_500, 10_000, 1_250, 2_500),
        "o4-mini" | "o3-mini" | "o1-mini" => (1_100, 4_400, 275, 1_100),
        "o3" => (2_000, 8_000, 500, 2_000),
        "gemini-3.8-flash" | "gemini-3.7-flash" | "gemini-3.6-flash" => {
            (750, 3_750, 75, 0)
        }
        "gemini-3.5-flash" => (1_500, 9_000, 150, 0),
        "gemini-3.5-flash-lite" => (300, 2_500, 30, 0),
        "gemini-3.1-flash-lite" => (250, 1_500, 25, 0),
        "gemini-3.1-pro-preview" | "gemini-3.1-pro-preview-customtools" => {
            (2_000, 12_000, 200, 0)
        }
        "gemini-3-flash-preview" => (500, 3_000, 50, 0),
        "gemini-2.5-pro" | "gemini-2.0-pro" => (1_250, 10_000, 315, 1_250),
        "gemini-2.5-flash-lite" => (100, 400, 10, 100),
        "gemini-2.5-flash" | "gemini-2.0-flash" => (150, 600, 37, 150),
        _ => return None,
    };
    Some(rates)
}

fn format_usd(nanos: u128) -> String {
    let dollars = nanos / 1_000_000_000;
    let frac = (nanos % 1_000_000_000) / 100_000;
    format!("{dollars}.{frac:04}")
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;
    use std::path::PathBuf;
    use std::sync::atomic::{AtomicU64, Ordering};

    static SEQUENCE: AtomicU64 = AtomicU64::new(0);

    struct TempHome(PathBuf);
    impl TempHome {
        fn new() -> Self {
            let path = std::env::temp_dir().join(format!(
                "folkbench-switch-usage-{}-{}",
                std::process::id(),
                SEQUENCE.fetch_add(1, Ordering::Relaxed)
            ));
            fs::create_dir_all(&path).unwrap();
            Self(path)
        }
    }
    impl Drop for TempHome {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    fn write_jsonl(path: &Path, lines: &[&str]) {
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(path, lines.join("\n") + "\n").unwrap();
    }

    fn local_noon(day: NaiveDate) -> String {
        Local
            .from_local_datetime(&day.and_hms_opt(12, 0, 0).unwrap())
            .single()
            .unwrap()
            .to_rfc3339()
    }

    #[test]
    fn dated_claude_and_gemini_turns_fill_only_their_local_day() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let yesterday = today.pred_opt().unwrap();
        let timestamp = local_noon(yesterday);
        let claude_partial = serde_json::json!({
            "timestamp": timestamp, "type": "assistant",
            "message": {"id": "msg_1", "model": "claude-sonnet-4", "usage": {"input_tokens": 10, "output_tokens": 5}}
        }).to_string();
        let claude_final = serde_json::json!({
            "timestamp": timestamp, "type": "assistant",
            "message": {"id": "msg_1", "model": "claude-sonnet-4", "stop_reason": "end_turn", "usage": {"input_tokens": 10, "output_tokens": 20}}
        }).to_string();
        write_jsonl(
            &home.0.join(".claude/projects/demo/session.jsonl"),
            &[&claude_partial, &claude_final],
        );
        let gemini = serde_json::json!({
            "timestamp": timestamp, "type": "gemini", "model": "gemini-2.5-flash",
            "tokens": {"input": 7, "output": 4, "cached": 1, "thoughts": 2}
        }).to_string();
        write_jsonl(
            &home.0.join(".gemini/tmp/demo/chats/session-1.jsonl"),
            &[&gemini],
        );

        let summary = summarize_on(&home.0, today);
        let claude = &summary.tools[0];
        let gemini = &summary.tools[2];
        let claude_day = claude
            .days
            .iter()
            .find(|row| row.date == yesterday.to_string())
            .unwrap();
        let gemini_day = gemini
            .days
            .iter()
            .find(|row| row.date == yesterday.to_string())
            .unwrap();
        assert_eq!(claude_day.turns, 1);
        assert_eq!(claude_day.input_tokens, 10);
        assert_eq!(claude_day.output_tokens, 20);
        assert_eq!(gemini_day.turns, 1);
        assert_eq!(gemini_day.input_tokens, 6);
        assert_eq!(gemini_day.output_tokens, 6);
        assert_eq!(gemini_day.cache_read_tokens, 1);
        assert_eq!(claude.undated_turns, 0);
        assert_eq!(gemini.undated_turns, 0);
        assert_eq!(claude.hours.len(), 90 * 24);
        assert_eq!(gemini.hours.len(), 90 * 24);
        let claude_hour = claude
            .hours
            .iter()
            .find(|row| row.date == yesterday.to_string() && row.hour == 12)
            .unwrap();
        assert_eq!(claude_hour.input_tokens, claude_day.input_tokens);
        assert_eq!(claude_hour.output_tokens, claude_day.output_tokens);
        assert!(
            claude
                .hours
                .iter()
                .filter(
                    |row| row.date == yesterday.to_string() && row.hour != 12
                )
                .all(|row| row.turns == 0)
        );
        let gemini_hour = gemini
            .hours
            .iter()
            .find(|row| row.date == yesterday.to_string() && row.hour == 12)
            .unwrap();
        assert_eq!(gemini_hour.input_tokens, gemini_day.input_tokens);
        assert_eq!(gemini_hour.cache_read_tokens, 1);
    }

    #[test]
    fn codex_repeated_rate_limit_event_does_not_double_count_usage() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let timestamp = local_noon(today);
        let context = serde_json::json!({
            "timestamp": timestamp, "type": "turn_context", "payload": {"model": "gpt-5"}
        }).to_string();
        let first = serde_json::json!({
            "timestamp": timestamp, "type": "event_msg", "payload": {"type": "token_count", "info": {
                "last_token_usage": {"input_tokens": 10, "output_tokens": 3},
                "total_token_usage": {"input_tokens": 10, "output_tokens": 3}
            }}
        }).to_string();
        let second = serde_json::json!({
            "timestamp": timestamp, "type": "event_msg", "payload": {"type": "token_count", "info": {
                "last_token_usage": {"input_tokens": 20, "output_tokens": 4},
                "total_token_usage": {"input_tokens": 30, "output_tokens": 7}
            }}
        }).to_string();
        write_jsonl(
            &home.0.join(".codex/sessions/2026/09/23/rollout.jsonl"),
            &[&context, &first, &first, &second],
        );

        let codex = summarize_on(&home.0, today).tools.remove(1);
        assert_eq!(codex.turns, 2);
        assert_eq!(codex.input_tokens, 30);
        assert_eq!(codex.output_tokens, 7);
        assert_eq!(codex.days.last().unwrap().input_tokens, 30);
        assert_eq!(
            codex
                .hours
                .iter()
                .find(|row| row.date == today.to_string() && row.hour == 12)
                .unwrap()
                .input_tokens,
            30
        );
    }

    #[test]
    fn undated_turns_remain_in_totals_but_not_in_the_chart() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        write_jsonl(
            &home.0.join(".claude/projects/demo/session.jsonl"),
            &[
                r#"{"type":"assistant","message":{"id":"msg_1","model":"claude-sonnet-4","usage":{"input_tokens":10,"output_tokens":5}}}"#,
            ],
        );
        let claude = summarize_on(&home.0, today).tools.remove(0);
        assert_eq!(claude.turns, 1);
        assert_eq!(claude.undated_turns, 1);
        assert!(claude.days.iter().all(|row| row.turns == 0));
        assert!(claude.hours.iter().all(|row| row.turns == 0));
    }

    #[test]
    fn turns_stay_in_the_local_hour_of_their_timestamp() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let older = today.checked_sub_days(Days::new(100)).unwrap();
        let turn =
            |id: &str, day: NaiveDate, hour: u32, minute: u32, input: u64| {
                let timestamp = Local
                    .from_local_datetime(
                        &day.and_hms_opt(hour, minute, 0).unwrap(),
                    )
                    .single()
                    .unwrap()
                    .to_rfc3339();
                serde_json::json!({
                    "timestamp": timestamp,
                    "type": "assistant",
                    "message": {
                        "id": id,
                        "model": "claude-sonnet-4",
                        "stop_reason": "end_turn",
                        "usage": {"input_tokens": input, "output_tokens": 1}
                    }
                })
                .to_string()
            };
        let lines = [
            turn("h0", today, 0, 10, 1),
            turn("h1", today, 1, 5, 2),
            turn("h14", today, 14, 40, 4),
            turn("h23", today, 23, 50, 8),
            turn("old", older, 9, 0, 1_000),
        ];
        let refs: Vec<&str> = lines.iter().map(String::as_str).collect();
        write_jsonl(&home.0.join(".claude/projects/demo/session.jsonl"), &refs);
        let claude = summarize_on(&home.0, today).tools.remove(0);
        let at = |hour: u8| {
            claude
                .hours
                .iter()
                .find(|row| row.date == today.to_string() && row.hour == hour)
                .unwrap()
                .input_tokens
        };
        assert_eq!(at(0), 1);
        assert_eq!(at(1), 2);
        assert_eq!(at(14), 4);
        assert_eq!(at(23), 8);
        assert_eq!(at(12), 0);
        let day = claude
            .days
            .iter()
            .find(|row| row.date == today.to_string())
            .unwrap();
        assert_eq!(day.input_tokens, 15);
        assert_eq!(
            claude.hours.iter().map(|row| row.input_tokens).sum::<u64>(),
            day.input_tokens
        );
        assert_eq!(claude.input_tokens, 1_015);
        assert!(claude.hours.iter().all(|row| row.date != older.to_string()));
    }

    #[test]
    fn one_hour_keeps_each_model_separate() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let stamp = Local
            .from_local_datetime(&today.and_hms_opt(14, 10, 0).unwrap())
            .single()
            .unwrap()
            .to_rfc3339();
        let turn = |id: &str, model: &str, input: u64| {
            serde_json::json!({
                "timestamp": stamp,
                "type": "assistant",
                "message": {
                    "id": id,
                    "model": model,
                    "stop_reason": "end_turn",
                    "usage": {"input_tokens": input, "output_tokens": 1}
                }
            })
            .to_string()
        };
        let lines = [
            turn("a", "claude-sonnet-4", 10),
            turn("b", "anthropic/claude-sonnet-4", 3),
            turn("c", "claude-opus-4", 4),
        ];
        let refs: Vec<&str> = lines.iter().map(String::as_str).collect();
        write_jsonl(&home.0.join(".claude/projects/demo/session.jsonl"), &refs);
        let claude = summarize_on(&home.0, today).tools.remove(0);
        let hour = claude
            .hours
            .iter()
            .find(|row| row.date == today.to_string() && row.hour == 14)
            .unwrap();
        assert_eq!(hour.input_tokens, 17);
        assert_eq!(hour.models.len(), 2);
        assert_eq!(hour.models[0].model, "claude-sonnet-4");
        assert_eq!(hour.models[0].input_tokens, 13);
        assert_eq!(hour.models[1].model, "claude-opus-4");
        assert_eq!(hour.models[1].input_tokens, 4);
        let quiet = claude
            .hours
            .iter()
            .find(|row| row.date == today.to_string() && row.hour == 12)
            .unwrap();
        assert!(quiet.models.is_empty());
    }

    #[test]
    fn claude_counts_unique_message_and_drops_prompt_text() {
        let home = TempHome::new();
        let file = home.0.join(".claude/projects/demo/session.jsonl");
        write_jsonl(
            &file,
            &[
                r#"{"type":"user","message":{"content":"secret-prompt-do-not-leak"}}"#,
                r#"{"type":"assistant","message":{"id":"msg_1","model":"claude-sonnet-4","usage":{"input_tokens":10,"output_tokens":20,"cache_read_input_tokens":100,"cache_creation_input_tokens":5}}}"#,
                r#"{"type":"assistant","message":{"id":"msg_1","model":"claude-sonnet-4","stop_reason":"end_turn","usage":{"input_tokens":10,"output_tokens":40,"cache_read_input_tokens":100,"cache_creation_input_tokens":5}}}"#,
            ],
        );
        let summary = summarize(&home.0);
        let claude = summary
            .tools
            .iter()
            .find(|row| row.tool_id == "claude-code")
            .unwrap();
        assert_eq!(claude.turns, 1);
        assert_eq!(claude.input_tokens, 10);
        assert_eq!(claude.output_tokens, 40);
        assert_eq!(claude.cache_read_tokens, 100);
        assert_eq!(claude.cache_write_tokens, 5);
        assert!(claude.list_price_usd.is_some());
        let encoded = serde_json::to_string(&summary).unwrap();
        assert!(!encoded.contains("secret-prompt-do-not-leak"));
    }

    #[test]
    fn codex_sums_last_token_usage_for_gpt() {
        let home = TempHome::new();
        let file = home.0.join(".codex/sessions/2026/09/22/rollout-demo.jsonl");
        write_jsonl(
            &file,
            &[
                r#"{"type":"turn_context","payload":{"model":"gpt-4.1"}}"#,
                r#"{"type":"event_msg","payload":{"type":"token_count","info":{"last_token_usage":{"input_tokens":80,"cached_input_tokens":20,"output_tokens":10,"reasoning_output_tokens":5,"total_tokens":115}}}}"#,
                r#"{"type":"event_msg","payload":{"type":"token_count","info":{"last_token_usage":{"input_tokens":40,"cached_input_tokens":0,"output_tokens":8,"reasoning_output_tokens":0,"total_tokens":48}}}}"#,
            ],
        );
        let summary = summarize(&home.0);
        let codex = summary
            .tools
            .iter()
            .find(|row| row.tool_id == "codex")
            .unwrap();
        assert_eq!(codex.turns, 2);
        assert_eq!(codex.input_tokens, 100);
        assert_eq!(codex.output_tokens, 18);
        assert_eq!(codex.cache_read_tokens, 20);
        assert!(codex.list_price_usd.is_some());
    }

    #[test]
    fn gemini_reads_message_token_object() {
        let home = TempHome::new();
        let file = home.0.join(".gemini/tmp/proj/chats/session-1.jsonl");
        write_jsonl(
            &file,
            &[
                r#"{"type":"session_metadata","model":"gemini-2.5-flash"}"#,
                r#"{"type":"user","content":"hello"}"#,
                r#"{"type":"gemini","model":"gemini-2.5-flash","tokens":{"input":15,"output":9,"cached":3,"thoughts":2}}"#,
            ],
        );
        let summary = summarize(&home.0);
        let gemini = summary
            .tools
            .iter()
            .find(|row| row.tool_id == "gemini-cli")
            .unwrap();
        assert_eq!(gemini.turns, 1);
        assert_eq!(gemini.input_tokens, 12);
        assert_eq!(gemini.output_tokens, 11);
        assert_eq!(gemini.cache_read_tokens, 3);
        assert!(gemini.list_price_usd.is_some());
    }

    #[cfg(unix)]
    #[test]
    fn skips_symlinked_jsonl() {
        let home = TempHome::new();
        let real = home.0.join("outside.jsonl");
        write_jsonl(
            &real,
            &[
                r#"{"type":"assistant","message":{"id":"msg_x","model":"claude-sonnet-4","usage":{"input_tokens":999,"output_tokens":999}}}"#,
            ],
        );
        let dir = home.0.join(".claude/projects/demo");
        fs::create_dir_all(&dir).unwrap();
        std::os::unix::fs::symlink(&real, dir.join("session.jsonl")).unwrap();
        let summary = summarize(&home.0);
        let claude = summary
            .tools
            .iter()
            .find(|row| row.tool_id == "claude-code")
            .unwrap();
        assert_eq!(claude.turns, 0);
        assert_eq!(claude.files_scanned, 0);
    }

    #[test]
    fn unknown_model_counts_tokens_without_price() {
        let nanos = list_price_nanos("mystery-model", 10, 10, 0, 0);
        assert!(nanos.is_none());
        assert_eq!(format_usd(1_250_000_000), "1.2500");
        assert_eq!(
            list_price_nanos("gpt-5-mini", 1_000_000, 0, 0, 0),
            Some(250_000_000)
        );
        assert_eq!(
            list_price_nanos("gpt-4o-mini", 1_000_000, 0, 0, 0),
            Some(150_000_000)
        );
        assert_eq!(
            list_price_nanos("o3-mini", 1_000_000, 0, 0, 0),
            Some(1_100_000_000)
        );
        let o3 = list_price_nanos("o3", 1, 0, 0, 0).unwrap();
        let o3_mini = list_price_nanos("o3-mini", 1, 0, 0, 0).unwrap();
        assert!(o3 > o3_mini);
        assert_eq!(
            list_price_nanos("claude-haiku-4-5", 1_000_000, 0, 0, 0),
            Some(1_000_000_000)
        );
        assert_eq!(
            list_price_nanos("claude-3-5-haiku", 1_000_000, 0, 0, 0),
            Some(800_000_000)
        );
        assert_eq!(
            list_price_nanos("gemini-2.5-flash-lite", 1_000_000, 0, 0, 0),
            Some(100_000_000)
        );
        let dated =
            list_price_nanos("claude-sonnet-4-5-20250929", 1_000_000, 0, 0, 0);
        assert_eq!(
            dated,
            list_price_nanos("claude-sonnet-4-5", 1_000_000, 0, 0, 0),
        );
        let prefixed =
            list_price_nanos("models/gemini-2.5-flash", 1_000_000, 0, 0, 0);
        assert_eq!(
            prefixed,
            list_price_nanos("gemini-2.5-flash", 1_000_000, 0, 0, 0),
        );
        assert_eq!(
            list_price_nanos("anthropic/claude-opus-4", 1_000_000, 0, 0, 0),
            Some(15_000_000_000)
        );
        assert!(list_price_nanos("custom-sonnet", 1, 1, 0, 0).is_none());
        assert!(list_price_nanos("claude-opus-extra", 1, 1, 0, 0).is_none());
        assert!(list_price_nanos("opus", 1, 1, 0, 0).is_none());
        assert_eq!(
            list_price_nanos("gpt-5.6-terra", 1_000_000, 0, 0, 0),
            Some(2_000_000_000)
        );
        assert_eq!(
            list_price_nanos("gpt-5.6-sol", 0, 1_000_000, 0, 0),
            Some(20_000_000_000)
        );
        assert_eq!(
            list_price_nanos("gpt-6-sol", 0, 0, 1_000_000, 0),
            Some(200_000_000)
        );
        assert_eq!(
            list_price_nanos("gpt-6-astra", 0, 0, 0, 1_000_000),
            Some(12_500_000_000)
        );
        assert_eq!(
            list_price_nanos("gpt-5.1-2025-11-13", 1_000_000, 0, 0, 0),
            Some(1_250_000_000)
        );
        assert_eq!(list_price_nanos("gpt-5.1", 0, 0, 0, 1_000_000), Some(0));
        assert_eq!(
            list_price_nanos("gpt-5", 0, 0, 0, 1_000_000),
            Some(1_250_000_000)
        );
        assert_eq!(
            list_price_nanos("gpt-5.4-mini", 0, 0, 1_000_000, 0),
            Some(75_000_000)
        );
        assert_eq!(
            list_price_nanos("gpt-5.6-cyber", 0, 0, 0, 1_000_000),
            Some(15_625_000_000)
        );
        assert_eq!(
            list_price_nanos("gpt-5.3-codex", 1_000_000, 0, 0, 0),
            Some(1_750_000_000)
        );
        assert_eq!(
            list_price_nanos("claude-opus-4-5-20251101", 1_000_000, 0, 0, 0),
            Some(5_000_000_000)
        );
        assert_eq!(
            list_price_nanos("claude-haiku-5-5", 1_000_000, 0, 0, 0),
            Some(100_000_000)
        );
        assert_eq!(
            list_price_nanos("claude-opus-5-5", 0, 1_000_000, 0, 0),
            Some(20_000_000_000)
        );
        assert_eq!(
            list_price_nanos("claude-fable-5-1", 0, 0, 1_000_000, 0),
            Some(250_000_000)
        );
        assert_eq!(
            list_price_nanos("gemini-3.8-flash", 1_000_000, 0, 0, 0),
            Some(750_000_000)
        );
        assert_eq!(
            list_price_nanos("gemini-3.1-pro-preview", 0, 0, 1_000_000, 0),
            Some(200_000_000)
        );
        assert_eq!(
            list_price_nanos("gemini-3-flash-preview", 0, 1_000_000, 0, 0),
            Some(3_000_000_000)
        );
        assert!(list_price_nanos("gemini-3.8-live", 1, 1, 0, 0).is_none());
        assert!(list_price_nanos("gpt-image-2", 1, 1, 0, 0).is_none());
    }

    #[test]
    fn codex_falls_back_to_total_when_last_usage_is_absent() {
        let home = TempHome::new();
        let file = home
            .0
            .join(".codex/sessions/2026/09/22/rollout-total.jsonl");
        write_jsonl(
            &file,
            &[
                r#"{"type":"turn_context","payload":{"model":"gpt-5"}}"#,
                r#"{"type":"event_msg","payload":{"type":"token_count","info":{"total_token_usage":{"input_tokens":200,"output_tokens":50,"cached_input_tokens":0,"reasoning_output_tokens":10}}}}"#,
            ],
        );
        let summary = summarize(&home.0);
        let codex = summary
            .tools
            .iter()
            .find(|row| row.tool_id == "codex")
            .unwrap();
        assert_eq!(codex.turns, 1);
        assert_eq!(codex.input_tokens, 200);
        assert_eq!(codex.output_tokens, 50);
        assert_eq!(codex.list_price_usd.as_deref(), Some("0.0007"));
    }

    #[test]
    fn gemini_jsonl_counts_a_rewritten_message_once() {
        let home = TempHome::new();
        let file = home.0.join(".gemini/tmp/proj/chats/session-new.jsonl");
        write_jsonl(
            &file,
            &[
                r#"{"sessionId":"sess-1","projectHash":"h"}"#,
                r#"{"id":"g1","type":"gemini","model":"gemini-2.5-flash","timestamp":"2026-10-04T10:00:00Z","tokens":{"input":10,"output":1,"cached":0,"thoughts":0}}"#,
                r#"{"id":"g1","type":"gemini","model":"gemini-2.5-flash","timestamp":"2026-10-04T10:00:01Z","tokens":{"input":4,"output":2,"cached":1,"thoughts":0}}"#,
            ],
        );
        let summary = summarize(&home.0);
        let gemini = summary
            .tools
            .iter()
            .find(|row| row.tool_id == "gemini-cli")
            .unwrap();
        assert_eq!(gemini.files_scanned, 1);
        assert_eq!(gemini.turns, 1);
        assert_eq!(gemini.input_tokens, 3);
        assert_eq!(gemini.output_tokens, 2);
        assert_eq!(gemini.cache_read_tokens, 1);
    }

    #[test]
    fn gemini_migrated_json_is_not_counted_beside_jsonl() {
        let home = TempHome::new();
        let dir = home.0.join(".gemini/tmp/proj/chats");
        write_jsonl(
            &dir.join("session-x.jsonl"),
            &[
                r#"{"id":"g1","type":"gemini","model":"gemini-2.5-flash","tokens":{"input":5,"output":1,"cached":0,"thoughts":0}}"#,
            ],
        );
        fs::write(
            dir.join("session-x.json"),
            r#"{"messages":[{"type":"gemini","model":"gemini-2.5-flash","tokens":{"input":100,"output":100,"cached":0,"thoughts":0}}]}"#,
        )
        .unwrap();
        fs::write(
            dir.join("session-y.json"),
            r#"{"messages":[{"type":"gemini","model":"gemini-2.5-flash","tokens":{"input":8,"output":2,"cached":1,"thoughts":0}}]}"#,
        )
        .unwrap();
        let summary = summarize(&home.0);
        let gemini = summary
            .tools
            .iter()
            .find(|row| row.tool_id == "gemini-cli")
            .unwrap();
        assert_eq!(gemini.files_scanned, 2);
        assert_eq!(gemini.turns, 2);
        assert_eq!(gemini.input_tokens, 5 + 7);
        assert_eq!(gemini.output_tokens, 1 + 2);
        assert_eq!(gemini.cache_read_tokens, 1);
    }

    #[test]
    fn opencode_json_assistant_messages_count_tokens_without_parts() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let noon = Local
            .from_local_datetime(&today.and_hms_opt(12, 0, 0).unwrap())
            .single()
            .unwrap();
        let ms = noon.timestamp_millis();
        let message = serde_json::json!({
            "role": "assistant",
            "modelID": "gpt-5",
            "tokens": {
                "total": 33,
                "input": 10,
                "output": 20,
                "reasoning": 3,
                "cache": {"read": 2, "write": 1}
            },
            "time": {"created": ms, "completed": ms}
        });
        let path = home
            .0
            .join(".local/share/opencode/storage/message/ses_demo/msg_1.json");
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(&path, message.to_string()).unwrap();
        // Prompt-bearing part files must be ignored even if present.
        let part = home.0.join(
            ".local/share/opencode/storage/part/ses_demo/msg_1/prt_1.json",
        );
        fs::create_dir_all(part.parent().unwrap()).unwrap();
        fs::write(
            &part,
            r#"{"type":"text","text":"SECRET_PROMPT_MUST_NOT_BE_READ"}"#,
        )
        .unwrap();

        let summary = summarize_on(&home.0, today);
        let opencode = summary
            .tools
            .iter()
            .find(|row| row.tool_id == "opencode")
            .unwrap();
        assert_eq!(opencode.turns, 1);
        assert_eq!(opencode.input_tokens, 10);
        assert_eq!(opencode.output_tokens, 23);
        assert_eq!(opencode.cache_read_tokens, 2);
        assert_eq!(opencode.cache_write_tokens, 1);
        let day = opencode
            .days
            .iter()
            .find(|row| row.date == today.to_string())
            .unwrap();
        assert_eq!(day.turns, 1);
        assert_eq!(day.output_tokens, 23);
    }

    #[test]
    fn opencode_sqlite_db_is_preferred_over_legacy_json() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let noon = Local
            .from_local_datetime(&today.and_hms_opt(15, 0, 0).unwrap())
            .single()
            .unwrap();
        let ms = noon.timestamp_millis();
        let root = home.0.join(".local/share/opencode");
        fs::create_dir_all(&root).unwrap();
        // Legacy JSON that would double-count if both sources were read.
        let legacy = root.join("storage/message/ses_x/msg_legacy.json");
        fs::create_dir_all(legacy.parent().unwrap()).unwrap();
        fs::write(
            &legacy,
            serde_json::json!({
                "role": "assistant",
                "modelID": "gpt-5",
                "tokens": {"input": 99, "output": 99, "reasoning": 0, "cache": {"read": 0, "write": 0}},
                "time": {"created": ms, "completed": ms}
            })
            .to_string(),
        )
        .unwrap();
        let db_path = root.join("opencode.db");
        {
            use rusqlite::Connection;
            let conn = Connection::open(&db_path).unwrap();
            conn.execute_batch(
                "CREATE TABLE message (
                    id TEXT,
                    session_id TEXT,
                    time_created INTEGER,
                    data TEXT
                );",
            )
            .unwrap();
            let data = serde_json::json!({
                "role": "assistant",
                "modelID": "gpt-5-mini",
                "tokens": {
                    "input": 4,
                    "output": 5,
                    "reasoning": 1,
                    "cache": {"read": 0, "write": 0}
                },
                "time": {"created": ms, "completed": ms}
            })
            .to_string();
            conn.execute(
                "INSERT INTO message (id, session_id, time_created, data) VALUES (?1, ?2, ?3, ?4)",
                rusqlite::params!["msg_1", "ses_1", ms, data],
            )
            .unwrap();
        }
        let summary = summarize_on(&home.0, today);
        let opencode = summary
            .tools
            .iter()
            .find(|row| row.tool_id == "opencode")
            .unwrap();
        assert_eq!(opencode.turns, 1);
        assert_eq!(opencode.input_tokens, 4);
        assert_eq!(opencode.output_tokens, 6);
        assert_ne!(opencode.input_tokens, 99);
    }

    fn tool<'a>(
        summary: &'a SessionUsageSummary,
        id: &str,
    ) -> &'a ToolUsageSummary {
        summary.tools.iter().find(|row| row.tool_id == id).unwrap()
    }

    fn noon_ms(day: NaiveDate) -> i64 {
        Local
            .from_local_datetime(&day.and_hms_opt(12, 0, 0).unwrap())
            .single()
            .unwrap()
            .timestamp_millis()
    }

    #[test]
    fn every_configurable_tool_has_a_usage_row() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let summary = summarize_on(&home.0, today);
        let ids: Vec<&str> = summary
            .tools
            .iter()
            .map(|row| row.tool_id.as_str())
            .collect();
        for id in [
            "claude-code",
            "codex",
            "gemini-cli",
            "opencode",
            "grok-build",
            "openclaw",
            "hermes",
            "pi",
            "minimax-code",
            "dsh",
            "qwen-code",
            "kimi-cli",
        ] {
            assert!(ids.contains(&id), "missing {id}");
        }
        assert!(summary.tools.iter().all(|row| row.turns == 0));
    }

    #[test]
    fn grok_usage_json_counts_turns_per_model() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let usage = serde_json::json!({
            "sessionId": "s1",
            "updatedAt": local_noon(today),
            "session": {"inputTokens": 999},
            "turns": [{
                "endedAt": local_noon(today),
                "modelUsage": {"grok-4.6-build": {
                    "inputTokens": 100, "outputTokens": 20,
                    "cachedReadTokens": 60, "cacheCreationTokens": 0,
                    "modelCalls": 3
                }}
            }]
        });
        let path = home.0.join(".grok/sessions/%2Ftmp/s1/usage.json");
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(&path, usage.to_string()).unwrap();
        let summary = summarize_on(&home.0, today);
        let grok = tool(&summary, "grok-build");
        assert_eq!(grok.turns, 3);
        assert_eq!(grok.input_tokens, 40);
        assert_eq!(grok.cache_read_tokens, 60);
        assert_eq!(grok.output_tokens, 20);
        assert_eq!(grok.undated_turns, 0);
        assert_eq!(grok.days.last().unwrap().turns, 3);
    }

    #[test]
    fn pi_sessions_skip_user_text_and_forked_duplicates() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let stamp = local_noon(today);
        let user = serde_json::json!({
            "type": "message", "id": "u1", "timestamp": stamp,
            "message": {"role": "user", "content": "secret prompt"}
        })
        .to_string();
        let assistant = serde_json::json!({
            "type": "message", "id": "a1", "timestamp": stamp,
            "message": {"role": "assistant", "model": "claude-sonnet-4-5",
                "usage": {"input": 10, "output": 5, "cacheRead": 100, "cacheWrite": 7}}
        })
        .to_string();
        let warm = serde_json::json!({
            "type": "usage", "id": "w1", "timestamp": stamp, "kind": "cache_warm",
            "model": "claude-sonnet-4-5",
            "usage": {"input": 0, "output": 0, "cacheRead": 50, "cacheWrite": 0}
        })
        .to_string();
        write_jsonl(
            &home.0.join(".pi/agent/sessions/--tmp--/1_a.jsonl"),
            &[&user, &assistant, &warm],
        );
        write_jsonl(
            &home.0.join(".pi/agent/sessions/--tmp--/2_fork.jsonl"),
            &[&assistant],
        );
        let summary = summarize_on(&home.0, today);
        let pi = tool(&summary, "pi");
        assert_eq!(pi.turns, 2);
        assert_eq!(pi.input_tokens, 10);
        assert_eq!(pi.output_tokens, 5);
        assert_eq!(pi.cache_read_tokens, 150);
        assert_eq!(pi.cache_write_tokens, 7);
        assert!(pi.list_price_usd.is_some());
    }

    #[test]
    fn openclaw_reads_plain_and_zstd_transcript_rows() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let stamp = local_noon(today);
        let db_path = home
            .0
            .join(".openclaw/agents/main/agent/openclaw-agent.sqlite");
        fs::create_dir_all(db_path.parent().unwrap()).unwrap();
        let conn = rusqlite::Connection::open(&db_path).unwrap();
        conn.execute_batch(
            "CREATE TABLE transcript_events (session_id TEXT, seq INTEGER, \
             event_json TEXT, created_at INTEGER, event_zstd BLOB)",
        )
        .unwrap();
        let first = serde_json::json!({
            "type": "message", "id": "a1", "timestamp": stamp,
            "message": {"role": "assistant", "model": "gpt-5",
                "usage": {"input": 3, "output": 4, "cacheRead": 0, "cacheWrite": 0}}
        })
        .to_string();
        let second = serde_json::json!({
            "type": "message", "id": "a2", "timestamp": stamp,
            "message": {"role": "assistant", "model": "gpt-5",
                "usage": {"input": 30, "output": 40, "cacheRead": 5, "cacheWrite": 0}}
        })
        .to_string();
        let packed = zstd::stream::encode_all(second.as_bytes(), 1).unwrap();
        conn.execute(
            "INSERT INTO transcript_events VALUES ('s', 1, ?1, 0, NULL)",
            [&first],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO transcript_events VALUES ('s', 2, NULL, 0, ?1)",
            [&packed],
        )
        .unwrap();
        drop(conn);
        let summary = summarize_on(&home.0, today);
        let claw = tool(&summary, "openclaw");
        assert_eq!(claw.turns, 2);
        assert_eq!(claw.input_tokens, 33);
        assert_eq!(claw.output_tokens, 44);
        assert_eq!(claw.cache_read_tokens, 5);
    }

    #[test]
    fn hermes_prefers_per_model_rows_then_session_totals() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let seconds = noon_ms(today) as f64 / 1000.0;
        let db_path = home.0.join(".hermes/state.db");
        fs::create_dir_all(db_path.parent().unwrap()).unwrap();
        let conn = rusqlite::Connection::open(&db_path).unwrap();
        conn.execute_batch(
            "CREATE TABLE sessions (id TEXT, model TEXT, started_at REAL, \
             ended_at REAL, input_tokens INTEGER, output_tokens INTEGER, \
             cache_read_tokens INTEGER, cache_write_tokens INTEGER); \
             CREATE TABLE session_model_usage (session_id TEXT, model TEXT, \
             api_call_count INTEGER, input_tokens INTEGER, output_tokens INTEGER, \
             cache_read_tokens INTEGER, cache_write_tokens INTEGER, \
             first_seen REAL, last_seen REAL);",
        )
        .unwrap();
        conn.execute(
            "INSERT INTO sessions VALUES ('a', 'gpt-5', ?1, NULL, 100, 10, 0, 0)",
            [seconds],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO sessions VALUES ('b', 'gpt-5', ?1, NULL, 7, 3, 1, 0)",
            [seconds],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO session_model_usage VALUES ('a', 'gpt-5', 4, 100, 10, 0, 0, ?1, ?1)",
            [seconds],
        )
        .unwrap();
        drop(conn);
        let summary = summarize_on(&home.0, today);
        let hermes = tool(&summary, "hermes");
        assert_eq!(hermes.turns, 5);
        assert_eq!(hermes.input_tokens, 107);
        assert_eq!(hermes.output_tokens, 13);
        assert_eq!(hermes.cache_read_tokens, 1);
        assert_eq!(hermes.days.last().unwrap().turns, 5);
    }

    #[test]
    fn minimax_reads_runtime_token_rows_once() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let ms = noon_ms(today);
        let schema = "CREATE TABLE local_runtime_token_usage (id INTEGER PRIMARY KEY, \
             session_id TEXT, agent_name TEXT, framework_type TEXT, turn_id TEXT, \
             model TEXT, ts INTEGER, input_tokens INTEGER, output_tokens INTEGER, \
             reasoning_tokens INTEGER, cache_read_tokens INTEGER, \
             cache_write_tokens INTEGER, cost_usd REAL, raw TEXT)";
        for path in [
            home.0.join(".minimax/v2/sqlite/runtime-state.sqlite"),
            home.0.join(".minimax/v2/chats/local-runtime.sqlite"),
        ] {
            fs::create_dir_all(path.parent().unwrap()).unwrap();
            let conn = rusqlite::Connection::open(&path).unwrap();
            conn.execute_batch(schema).unwrap();
            conn.execute(
                "INSERT INTO local_runtime_token_usage (session_id, agent_name, \
                 framework_type, turn_id, model, ts, input_tokens, output_tokens, \
                 reasoning_tokens, cache_read_tokens, cache_write_tokens) \
                 VALUES ('s', 'main', 'pi-agent', 't1', 'MiniMax-M3', ?1, 11, 22, 0, 33, 0)",
                [ms],
            )
            .unwrap();
        }
        let summary = summarize_on(&home.0, today);
        let minimax = tool(&summary, "minimax-code");
        assert_eq!(minimax.turns, 1);
        assert_eq!(minimax.input_tokens, 11);
        assert_eq!(minimax.output_tokens, 22);
        assert_eq!(minimax.cache_read_tokens, 33);
        assert_eq!(minimax.undated_turns, 0);
    }

    #[test]
    fn dsh_reads_zstd_session_log() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let ms = noon_ms(today);
        let lines = [
            serde_json::json!({"type": "session", "version": 4, "id": "x", "createdAt": ms}),
            serde_json::json!({"type": "assistant/message", "seq": 1, "time": ms, "data": {
                "turn": 1, "step": 1,
                "message": {"role": "assistant", "source": {"kind": "model", "provider": "deepseek", "model": "deepseek-v4-pro"}, "content": []},
                "stream": [],
                "usage": {"inputTokens": 12, "outputTokens": 8, "cacheReadTokens": 40, "cacheWriteTokens": 0}
            }}),
            serde_json::json!({"type": "compaction/summary", "seq": 2, "time": ms, "data": {
                "model": "deepseek-flash", "provider": "deepseek",
                "usage": {"inputTokens": 3, "outputTokens": 2}
            }}),
        ]
        .iter()
        .map(|line| line.to_string())
        .collect::<Vec<_>>()
        .join("\n")
            + "\n";
        let path = home
            .0
            .join(".dsh/sessions/--ws--/session-x/session.v4.jsonl.zstd");
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(
            &path,
            zstd::stream::encode_all(lines.as_bytes(), 1).unwrap(),
        )
        .unwrap();
        let summary = summarize_on(&home.0, today);
        let dsh = tool(&summary, "dsh");
        assert_eq!(dsh.files_scanned, 1);
        assert_eq!(dsh.turns, 2);
        assert_eq!(dsh.input_tokens, 15);
        assert_eq!(dsh.output_tokens, 10);
        assert_eq!(dsh.cache_read_tokens, 40);
        assert_eq!(dsh.undated_turns, 0);
    }

    #[test]
    fn qwen_reads_assistant_usage_metadata() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let stamp = local_noon(today);
        let user = serde_json::json!({"type": "user", "timestamp": stamp, "message": {"parts": [{"text": "hi"}]}}).to_string();
        let assistant = serde_json::json!({
            "type": "assistant", "timestamp": stamp, "model": "qwen3-coder-plus",
            "usageMetadata": {"promptTokenCount": 50, "candidatesTokenCount": 9,
                "cachedContentTokenCount": 20, "thoughtsTokenCount": 1, "totalTokenCount": 60}
        })
        .to_string();
        write_jsonl(
            &home.0.join(".qwen/projects/-tmp-demo/chats/abc.jsonl"),
            &[&user, &assistant],
        );
        let summary = summarize_on(&home.0, today);
        let qwen = tool(&summary, "qwen-code");
        assert_eq!(qwen.turns, 1);
        assert_eq!(qwen.input_tokens, 30);
        assert_eq!(qwen.cache_read_tokens, 20);
        assert_eq!(qwen.output_tokens, 10);
    }

    #[test]
    fn kimi_reads_step_end_usage_and_legacy_status_updates() {
        let home = TempHome::new();
        let today = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        let ms = noon_ms(today);
        let config = serde_json::json!({"type": "config.update", "agentId": "main", "modelAlias": "kimi-k3", "time": ms}).to_string();
        let step = serde_json::json!({
            "type": "context.append_loop_event", "agentId": "main", "time": ms,
            "event": {"type": "step.end", "uuid": "st1", "turnId": "1", "step": 1,
                "usage": {"inputOther": 5, "output": 6, "inputCacheRead": 70, "inputCacheCreation": 1}}
        })
        .to_string();
        write_jsonl(
            &home
                .0
                .join(".kimi-code/sessions/ws/s1/agents/main/wire.jsonl"),
            &[&config, &step],
        );
        // A fork copies the same step record.
        write_jsonl(
            &home
                .0
                .join(".kimi-code/sessions/ws/s2/agents/main/wire.jsonl"),
            &[&config, &step],
        );
        let legacy = serde_json::json!({
            "timestamp": ms as f64 / 1000.0,
            "message": {"type": "StatusUpdate", "payload": {"message_id": "m1",
                "token_usage": {"input_other": 2, "output": 3, "input_cache_read": 4, "input_cache_creation": 0}}}
        })
        .to_string();
        write_jsonl(&home.0.join(".kimi/sessions/h/s/wire.jsonl"), &[&legacy]);
        let summary = summarize_on(&home.0, today);
        let kimi = tool(&summary, "kimi-cli");
        assert_eq!(kimi.turns, 2);
        assert_eq!(kimi.input_tokens, 7);
        assert_eq!(kimi.output_tokens, 9);
        assert_eq!(kimi.cache_read_tokens, 74);
        assert_eq!(kimi.cache_write_tokens, 1);
        assert_eq!(kimi.undated_turns, 0);
    }
}
