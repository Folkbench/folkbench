import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { publicDataContent, type PublicDataExport, type PublicDataRanking } from './contract.generated'
import { sha256 } from './common'
import { SUBSITES, renderSubsitePage, verificationTags, sevenDays } from './subsite-core'
import { buildSubsite, relayComparisonPages, priceVendorPages, stationDirectoryPages, identitySnapshotPages, groupPrices, hasSharedBasePair } from './subsites'
import { snapshotBadge } from './snapshot-badge'

function row(slug:string,position:number,input:number|null,output:number|null,currency='CNY'):PublicDataRanking{return {
  date:'2026-11-16',model_id:'gpt-6-astra',model_name:'GPT 6 Astra',station_slug:slug,station_name:`站点 ${slug}`,channel_id:`route-${slug}`,group_name:'标准组',position,rank_published:position,evidence_status:'not_verified',catalog_only:false,release_kind:'published',overall_bps:position===1?7000:9900,availability_bps:9800,connectivity_bps:9800,stability_bps:null,latency_p95_ms:null,status_windows:[],sample_size:null,input_price:input,output_price:output,price_currency:currency,price_unit:'per_1m_tokens',output_price_currency:currency,output_price_unit:'per_1m_tokens',price_source:'official',price_recorded_at:'2026-11-16T12:00:00Z',measured_at:null,snapshot_version:'source-1',method_version:'catalog-v1',observed_window:'catalog-only',published_at:'2026-11-16T12:30:00Z',
}}
/** Deterministic inputs for view selection and real file boundaries, without replacing services. */
function input():PublicDataExport{
  const rankings=[row('a',1,2,4),row('b',2,0,3),row('c',3,null,1,'USD')]
  const source={schema_version:'1.0' as const,policy:'public-snapshot-includes-display-samples-and-existing-placement' as const,source_collected_at:'2026-11-16T12:30:00Z',
    boards:[{model_id:'gpt-6-astra',snapshot_version:'source-1',method_version:'catalog-v1',observed_window:'catalog-only',published_at:'2026-11-16T12:30:00Z',rows:rankings.length}],rankings,
    integrity:[{run_id:'p1',model_id:'gpt-6-astra',station_slug:'a',group_name:null,client_mode:'direct_openai',agree:2,total:3,input_tokens_min:null,input_tokens_max:null,reasoning_median:null,identified_model_id:'gpt-6.1-sol',probe_keys:['folk-0123abcd'],measured_at:'2026-11-16T12:00:00Z'}],
    models:[{id:'gpt-6-astra',name:'GPT 6 Astra',vendor_id:'openai',vendor_name:'OpenAI',family:'language' as const,status:'measured' as const,station_count:3,official_price:{currency:'USD',unit:'per_1m_tokens',input:10,output:20,cache_read:null,source_label:'公开参考价',source_url:null,verified_at:'2026-11-16'}},{id:'pending-model',name:'待收录模型',vendor_id:'unused',vendor_name:'未上榜厂商',family:'language' as const,status:'pending' as const,station_count:0,official_price:null}],
    stations:['a','b','c','d'].map(slug=>({slug,name:`站点 ${slug}`,profile_url:`https://folkbench.com/services/${slug}`,listing_status:slug==='d'?'catalog_only' as const:'tested' as const,measurement_status:'not_available' as const,first_listed_at:null,data_security_level:0,data_security_validity:'not_verified' as const,checked_at:null,subject_present:'unspecified' as const,domestic_payment:'unspecified' as const,overseas_payment:'unspecified' as const,invoice:'unspecified' as const,customer_service:'unspecified' as const,refund:'unspecified' as const})),
  }
  return {...source,snapshot_version:`public-${sha256(JSON.stringify(publicDataContent(source)))}`,date:'2026-11-16',published_at:source.source_collected_at}
}
const bodyRows=(body:string,kind:string)=>[...body.matchAll(new RegExp(`<table data-table="${kind}">[\\s\\S]*?<tbody>([\\s\\S]*?)<\\/tbody>`,'gu'))].reduce((sum,match)=>sum+(match[1]?.match(/<tr>/gu)?.length??0),0)

test('comparison includes every source row and preserves placement even when scores disagree',()=>{
  const s=input(),pages=relayComparisonPages(s,[s]);assert.deepEqual(pages.map(page=>page.path),['/','/models/gpt-6-astra/','/about/'])
  assert.equal(bodyRows(pages[0]!.body,'model-directory'),1);assert.equal(bodyRows(pages[1]!.body,'model-comparison'),3)
  const body=pages[1]!.body;assert(body.indexOf('station-a')<body.indexOf('station-b'));assert(body.includes('not_verified'))
})
test('prices retain zero, sort only comparable quotes, keep currencies apart and omit unlisted vendors',()=>{
  const s=input(),before=JSON.stringify(s);const groups=groupPrices(s.rankings)
  assert.equal(groups.length,2);assert.deepEqual(groups[0]!.rows.map(row=>row.station_slug),['b','a']);assert.equal(groups[1]!.rows[0]!.input_price,null);assert.equal(JSON.stringify(s),before)
  const pages=priceVendorPages(s,[s]);assert(pages.some(page=>page.path==='/vendors/openai/'));assert(!pages.some(page=>page.path.includes('unused')||page.path.includes('pending-model')))
  assert.equal(bodyRows(pages[0]!.body,'public-prices'),3)
  assert.doesNotMatch(pages[0]!.body,/可用率|稳定性|一致率/u)
})
test('directory includes catalog-only stations and guide sections, without probe tables',()=>{
  const s=input(),pages=stationDirectoryPages(s);const profile=pages.find(page=>page.path==='/stations/d/')!
  assert.match(profile.body,/本日快照未收录该站的榜单行/u);assert.doesNotMatch(profile.body,/agree|一致率/u)
  assert.equal(pages.filter(page=>page.path.startsWith('/stations/')).length,4);assert.equal(pages.find(page=>page.path==='/guide/')!.body.match(/<section>/gu)?.length,8)
  assert(pages.some(page=>page.path==='/gpt-zhongzhuanzhan/'));assert(!pages.some(page=>page.path==='/claude-zhongzhuanzhan/'))
})
test('identity pages follow only current public summaries and disclose the shared-base limitation',()=>{
  const s=input(),pages=identitySnapshotPages(s,[s]);assert(hasSharedBasePair(s.integrity));assert.match(pages[0]!.body,/快照收录 1 条探针结果、覆盖 1 家站点/u)
  assert.match(pages.find(page=>page.path==='/models/gpt-6-astra/')!.body,/共享底模/u)
  assert.equal(pages.filter(page=>page.path.startsWith('/stations/')).length,1);assert(!pages.some(page=>page.path.includes('weeks')||page.path.includes('rss')))
})
test('history filters calendar days without inventing a missing date',()=>{
  const s=input();assert.deepEqual(sevenDays(s,[{...s,date:'2026-11-08'},{...s,date:'2026-11-14'},s,{...s,date:'2026-11-17'}]).map(item=>item.date),['2026-11-16','2026-11-14'])
})
test('metadata tokens are optional and affect only head; badges escape XML',()=>{
  assert.equal(verificationTags({BING_SITE_VERIFICATION:' ',BAIDU_SITE_VERIFICATION:''}),'')
  const s=input(),page=relayComparisonPages(s,[s])[0]!
  const empty=renderSubsitePage('ai-relay-bench',s,page,{})
  const populated=renderSubsitePage('ai-relay-bench',s,page,{BING_SITE_VERIFICATION:'012345ABC',BAIDU_SITE_VERIFICATION:'codeva-123'})
  assert.match(populated,/<meta name="msvalidate.01" content="012345ABC">/u);assert.match(populated,/<meta name="baidu-site-verification" content="codeva-123">/u)
  assert.equal(empty.slice(empty.indexOf('<body')),populated.slice(populated.indexOf('<body')))
  assert.match(snapshotBadge('<标签>','2026-11-16'),/&lt;标签&gt;/u)
})
test('four real output trees have distinct homes, valid links, manifests and public badges',async()=>{
  const base=resolve('.tmp/subsite-tests');await mkdir(base,{recursive:true});const root=await mkdtemp(join(base,'case-'))
  try{const s=input(),homes:string[]=[];for(const site of Object.keys(SUBSITES) as (keyof typeof SUBSITES)[]){const directory=join(root,site);await buildSubsite(directory,site,s,[s]);homes.push(await readFile(join(directory,'index.html'),'utf8'));assert.match(await readFile(join(directory,'badge.svg'),'utf8'),/2026-11-16/)}assert.equal(new Set(homes.map(body=>body.match(/<h1>(.*?)<\/h1>/u)![1])).size,4)}finally{await rm(root,{recursive:true,force:true})}
})
