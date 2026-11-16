// Generated public consumer contract. Edit packages/contracts/src/public-data-export.ts.
// source-sha256: e9106dd307374146de13542c41c29975f6cfb05325f53ccaa893afb47d9e5c0c
/** Schema 1.0 is a whitelist of PUBLIC projections, never database run records. */
type Schema = { type?: string; properties?: Record<string, Schema>; required?: readonly string[]; additionalProperties?: boolean; items?: Schema; enum?: readonly unknown[]; anyOf?: readonly Schema[]; minimum?: number; maximum?: number; minLength?: number; maxLength?: number; minItems?: number; maxItems?: number; pattern?: string }
type Infer<S> = S extends { anyOf: readonly (infer U)[] } ? Infer<U>
  : S extends { enum: readonly (infer E)[] } ? E
  : S extends { type: 'object'; properties: infer P } ? { [K in keyof P]: Infer<P[K]> }
  : S extends { type: 'array'; items: infer I } ? Infer<I>[]
  : S extends { type: 'string' } ? string
  : S extends { type: 'integer' | 'number' } ? number
  : S extends { type: 'boolean' } ? boolean : null
const object = <P extends Record<string, Schema>>(properties: P) => ({ type: 'object' as const, properties, required: Object.keys(properties), additionalProperties: false })
const text = (maxLength = 200, pattern?: string) => ({ type: 'string' as const, minLength: 1, maxLength, ...(pattern ? { pattern } : {}) })
const count = (maximum = 1_000_000_000) => ({ type: 'integer' as const, minimum: 0, maximum })
const number = { type: 'number' as const, minimum: 0, maximum: 1_000_000_000 }
const optional = <S extends Schema>(schema: S) => ({ anyOf: [schema, { type: 'null' as const }] as const })
const enumeration = <const E extends readonly string[]>(values: E) => ({ enum: values })
const array = <S extends Schema>(items: S, maxItems: number, minItems = 0) => ({ type: 'array' as const, items, minItems, maxItems })
const id = text(200, '^[A-Za-z0-9][A-Za-z0-9._-]*$')
const stamp = text(30, '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?Z$')
const date = text(10, '^\\d{4}-\\d{2}-\\d{2}$')
const bps = optional(count(10_000))
const nullableText = optional(text(240))
const rankingSchema = object({
  date, model_id: id, model_name: text(), station_slug: id, station_name: text(), channel_id: id, group_name: text(),
  position: count(100_000), rank_published: optional(count(100_000)), evidence_status: text(40), catalog_only: { type: 'boolean' as const },
  release_kind: enumeration(['published', 'illustrative']), overall_bps: bps, availability_bps: bps, connectivity_bps: bps, stability_bps: bps,
  latency_p95_ms: optional(count()), status_windows: array(text(40), 168), sample_size: optional(count()),
  input_price: optional(number), output_price: optional(number), price_currency: nullableText, price_unit: nullableText,
  output_price_currency: nullableText, output_price_unit: nullableText, price_source: nullableText, price_recorded_at: optional(stamp),
  measured_at: optional(stamp), snapshot_version: text(), method_version: text(), observed_window: text(240), published_at: stamp,
})
const integritySchema = object({
  run_id: id, model_id: id, station_slug: id, group_name: nullableText, client_mode: text(80),
  agree: count(), total: count(), input_tokens_min: optional(count()), input_tokens_max: optional(count()),
  reasoning_median: optional(number), identified_model_id: optional(id), probe_keys: array(text(40, '^folk-[a-f0-9]{8}$'), 200), measured_at: optional(stamp),
})
const modelSchema = object({
  id, name: text(), vendor_id: id, vendor_name: text(), family: enumeration(['language', 'image', 'video']), status: enumeration(['measured', 'pending']), station_count: count(),
  official_price: optional(object({ currency: text(10), unit: text(40), input: optional(number), output: optional(number), cache_read: optional(number), source_label: text(), source_url: optional(text(1000, '^https://[^?#]+$')), verified_at: text(30) })),
})
const stationSchema = object({
  slug: id, name: text(), profile_url: text(300, '^https://folkbench\\.com/services/[A-Za-z0-9._-]+$'),
  listing_status: enumeration(['tested', 'catalog_only']), measurement_status: enumeration(['source_tagged', 'not_available']), first_listed_at: optional(text(30)),
  data_security_level: count(4), data_security_validity: enumeration(['current', 'expired', 'not_verified']), checked_at: optional(date),
  subject_present: enumeration(['yes', 'no', 'unspecified']), domestic_payment: enumeration(['yes', 'no', 'unspecified']), overseas_payment: enumeration(['yes', 'no', 'unspecified']),
  invoice: enumeration(['yes', 'no', 'unspecified']), customer_service: enumeration(['yes', 'no', 'unspecified']), refund: enumeration(['supported', 'not_supported', 'conditional', 'contact_required', 'unspecified']),
})
const boardSchema = object({ model_id: id, snapshot_version: optional(text()), method_version: optional(text()), observed_window: optional(text(240)), published_at: optional(stamp), rows: count(100_000) })
export const PUBLIC_DATA_SCHEMA_VERSION = '1.0' as const
export const PUBLIC_DATA_MAX_BYTES = 16 * 1024 * 1024
export const PUBLIC_DATA_MAX_GZIP_BYTES = 8 * 1024 * 1024
export const PUBLIC_DATA_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  ...object({
    schema_version: enumeration(['1.0']), snapshot_version: text(80, '^public-[a-f0-9]{64}$'), date,
    published_at: stamp, source_collected_at: stamp,
    policy: enumeration(['public-snapshot-includes-display-samples-and-existing-placement']),
    boards: array(boardSchema, 500, 1), rankings: array(rankingSchema, 100_000), integrity: array(integritySchema, 10_000),
    models: array(modelSchema, 10_000, 1), stations: array(stationSchema, 10_000, 1),
  }),
}
export type PublicDataExport = Infer<typeof PUBLIC_DATA_SCHEMA>
export type PublicDataRanking = Infer<typeof rankingSchema>
export type PublicDataIntegrity = Infer<typeof integritySchema>
export type PublicDataStation = Infer<typeof stationSchema>
export type PublicDataSource = Omit<PublicDataExport, 'snapshot_version' | 'date' | 'published_at'>

export function matchesPublicDataSchema(value: unknown, schema: Schema = PUBLIC_DATA_SCHEMA): boolean {
  if (schema.anyOf) return schema.anyOf.some(item => matchesPublicDataSchema(value, item))
  if (schema.enum) return schema.enum.includes(value)
  if (schema.type === 'null') return value === null
  if (schema.type === 'boolean') return typeof value === 'boolean'
  if (schema.type === 'string') return typeof value === 'string' && value.length >= (schema.minLength ?? 0) && value.length <= (schema.maxLength ?? Infinity) && !/[\u0000-\u001f\u007f]/u.test(value) && (!schema.pattern || new RegExp(schema.pattern, 'u').test(value))
  if (schema.type === 'integer' || schema.type === 'number') return typeof value === 'number' && Number.isFinite(value) && (schema.type !== 'integer' || Number.isInteger(value)) && value >= (schema.minimum ?? -Infinity) && value <= (schema.maximum ?? Infinity)
  if (schema.type === 'array') return Array.isArray(value) && value.length >= (schema.minItems ?? 0) && value.length <= (schema.maxItems ?? Infinity) && value.every(item => matchesPublicDataSchema(item, schema.items!))
  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false
    const record = value as Record<string, unknown>
    return Object.keys(record).every(key => Object.hasOwn(schema.properties!, key)) && Object.entries(schema.properties!).every(([key, rule]) => Object.hasOwn(record, key) && matchesPublicDataSchema(record[key], rule))
  }
  return false
}
export function isPublicDataExport(value: unknown): value is PublicDataExport {
  if (!matchesPublicDataSchema(value)) return false
  const snapshot = value as PublicDataExport
  if (snapshot.rankings.some(row => row.date !== snapshot.date)) return false
  const day = new Date(`${snapshot.date}T00:00:00Z`)
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== snapshot.date) return false
  if (snapshot.integrity.some(row => row.agree > row.total || (row.input_tokens_min !== null && row.input_tokens_max !== null && row.input_tokens_min > row.input_tokens_max))) return false
  const unique = (items: string[]) => new Set(items).size === items.length
  return unique(snapshot.models.map(row => row.id)) && unique(snapshot.stations.map(row => row.slug)) && unique(snapshot.boards.map(row => row.model_id)) && unique(snapshot.rankings.map(row => `${row.model_id}:${row.channel_id}`)) && unique(snapshot.integrity.map(row => row.run_id)) && snapshot.boards.every(board => snapshot.rankings.filter(row => row.model_id === board.model_id).length === board.rows)
}

/** Dates describe an archive, not a change in its source content. */
export function publicDataContent(source: PublicDataSource | PublicDataExport) {
  return { schema_version: source.schema_version, policy: source.policy, boards: source.boards,
    rankings: source.rankings.map(({ date, ...row }) => row), integrity: source.integrity,
    models: source.models, stations: source.stations }
}
