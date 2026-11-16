import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { publicDataContent, isPublicDataExport, type PublicDataExport } from './contract.generated'
import { sha256, json, START, END, validateSnapshot, selectedRows, isFreshSnapshotCheck } from './common'
import { csvCell, snapshotFiles, writeArchive, verifyArchive } from './archive'
import { updateReadme } from './readme'
import { publishCompletedWeek, isoWeek, prepareWeek, readPublishedReports, setWithdrawal, readWithdrawals } from './weekly'
import { buildRelaySite, buildWeeklySite } from './sites'

/** Fixed input to pure serializers and real file IO; no external service is replaced. */
function input(date='2026-11-10', score=7000):PublicDataExport {
  const source={schema_version:'1.0' as const, policy:'public-snapshot-includes-display-samples-and-existing-placement' as const,
    boards:[{model_id:'model-a',snapshot_version:'source-1',method_version:'folkbench-connectivity-v1',observed_window:'2026-11-09T12:00:00Z/2026-11-10T12:00:00Z',published_at:'2026-11-10T12:30:00Z',rows:1}],
    rankings:[{date,model_id:'model-a',model_name:'模型 A',station_slug:'station-a',station_name:'站点 A | <示例>',channel_id:'route-a',group_name:'standard',position:1,rank_published:3,evidence_status:'platform_measured',catalog_only:false,release_kind:'published' as const,overall_bps:score,availability_bps:9800,connectivity_bps:9800,stability_bps:null,latency_p95_ms:1200,status_windows:['ok','delayed'],sample_size:20,input_price:0.2,output_price:0.8,price_currency:'CNY',price_unit:'per_1m_tokens',output_price_currency:'CNY',output_price_unit:'per_1m_tokens',price_source:'official',price_recorded_at:'2026-11-10T12:00:00Z',measured_at:'2026-11-10T12:00:00Z',snapshot_version:'source-1',method_version:'folkbench-connectivity-v1',observed_window:'24h',published_at:'2026-11-10T12:30:00Z'}],
    integrity:[{run_id:'summary-a',model_id:'model-a',station_slug:'station-a',group_name:null,client_mode:'direct_openai',agree:2,total:3,input_tokens_min:100,input_tokens_max:120,reasoning_median:null,identified_model_id:null,probe_keys:['folk-0123abcd'],measured_at:'2026-11-10T12:00:00Z'}],
    models:[{id:'model-a',name:'模型 A',vendor_id:'vendor-a',vendor_name:'厂商 A',family:'language' as const,status:'measured' as const,station_count:1,official_price:null}],
    stations:[{slug:'station-a',name:'站点 A | <示例>',profile_url:'https://folkbench.com/services/station-a',listing_status:'tested' as const,measurement_status:'source_tagged' as const,first_listed_at:null,data_security_level:0,data_security_validity:'not_verified' as const,checked_at:null,subject_present:'unspecified' as const,domestic_payment:'unspecified' as const,overseas_payment:'unspecified' as const,invoice:'unspecified' as const,customer_service:'unspecified' as const,refund:'unspecified' as const}],
  }
  return {...source,source_collected_at:`${date}T12:30:00Z`,snapshot_version:`public-${sha256(JSON.stringify(publicDataContent({...source,source_collected_at:`${date}T12:30:00Z`})))}`,date,published_at:`${date}T12:30:00Z`}
}
async function directory(run:(path:string)=>Promise<void>){const base=resolve('.tmp/distribution-tests');await mkdir(base,{recursive:true});const path=await mkdtemp(join(base,'case-'));try{await run(path)}finally{await rm(path,{recursive:true,force:true})}}

test('public schema rejects raw run additions, private probe identifiers and malformed dates',()=>{
  const snapshot=input();assert.equal(isPublicDataExport(snapshot),true)
  assert.equal(isPublicDataExport({...snapshot,raw_runs:[]}),false)
  assert.equal(isPublicDataExport({...snapshot,integrity:[{...snapshot.integrity[0],answers:['private']}]}),false)
  assert.equal(isPublicDataExport({...snapshot,integrity:[{...snapshot.integrity[0],probe_keys:['private-question-id']}]}),false)
  assert.equal(isPublicDataExport({...snapshot,date:'2026-02-30'}),false)
  assert.throws(()=>validateSnapshot({...snapshot,rankings:[{...snapshot.rankings[0],overall_bps:9000}]}),/hash/)
})
test('real archive IO preserves history, verifies bytes, and skips identical content on a new date',async()=>directory(async root=>{
  assert.equal(await writeArchive(root,input()),true)
  const previous=await readFile(join(root,'latest','manifest.json'),'utf8')
  assert.equal(await writeArchive(root,input('2026-11-11')),false)
  assert.equal(await readFile(join(root,'latest','manifest.json'),'utf8'),previous)
  await assert.rejects(writeArchive(root,input('2026-11-10',8000)),/conflict/)
  assert.equal(await writeArchive(root,input('2026-11-11',8000)),true)
  assert.equal((await verifyArchive(join(root,'daily','2026','11','10'))).rankings[0]!.overall_bps,7000)
  await rename(join(root,'daily','2026','11','10'),join(root,'daily','2026','11','12'))
  await assert.rejects(verifyArchive(join(root,'daily','2026','11','12')),/date_mismatch/)
  const csv=await readFile(join(root,'latest','rankings.csv'),'utf8');assert.equal(csv.charCodeAt(0),0xfeff);assert.match(csv,/站点 A \| <示例>/u)
  await writeFile(join(root,'latest','integrity.json'),'[]\n');await assert.rejects(verifyArchive(join(root,'latest')),/mismatch/)
}))
test('CSV guards formulas while keeping numbers and escaped text usable',()=>{
  assert.equal(csvCell('=SUM(A1)'),"'=SUM(A1)");assert.equal(csvCell(' +1'),"' +1");assert.equal(csvCell(0.2),'0.2');assert.equal(csvCell('a,"b"'),'"a,""b"""');assert.equal(csvCell(null),'')
  const files=snapshotFiles(input());const manifest=JSON.parse(files.get('manifest.json')!);for(const file of manifest.files)assert.equal(sha256(files.get(file.path)!),file.sha256)
})
test('README preserves all bytes outside markers, includes disclosure and avoids execution-count claims',()=>{
  const original=`中文前缀\r\n${START}\r\nold\r\n${END}\r\n尾部 unchanged\r\n`
  const result=updateReadme(original,input());assert.equal(result.slice(0,result.indexOf(START)),original.slice(0,original.indexOf(START)));assert.equal(result.slice(result.indexOf(END)),original.slice(original.indexOf(END)))
  for (const tag of result.match(/<details\b[^>]*>/gi) ?? []) assert.match(tag, /\bopen(?:\s|=|>)/i)
  assert.match(result,/今日|快照/u);assert.match(result,/展示样本/u);assert.match(result,/快照收录 1 条探针结果，覆盖 1 家站点/u);assert.match(result,/2026-11-09 20:00:00/u);assert.doesNotMatch(result,/过去 24 小时.*运行/u)
  assert.equal(updateReadme(result,input()),result);assert.throws(()=>updateReadme(original+START,input()),/markers/)
})
test('selection follows source order, not scores',()=>{
  const snapshot=input();snapshot.rankings.push({...snapshot.rankings[0]!,channel_id:'route-b',station_slug:'station-b',position:2,overall_bps:9900})
  assert.deepEqual(selectedRows(snapshot,'model-a').map(row=>row.channel_id),['route-a','route-b'])
  snapshot.rankings[0]!.catalog_only=true;assert.deepEqual(selectedRows(snapshot,'model-a').map(row=>row.channel_id),['route-b'])
})
test('stale generation cannot masquerade as a successful unchanged daily export',()=>{
  assert.equal(isFreshSnapshotCheck('2026-11-15',new Date('2026-11-16T12:29:59Z')),true)
  assert.equal(isFreshSnapshotCheck('2026-11-15',new Date('2026-11-16T12:40:00Z')),false)
  assert.equal(isFreshSnapshotCheck('2026-11-16',new Date('2026-11-16T12:40:00Z')),true)
  assert.equal(isFreshSnapshotCheck(null,new Date('2026-11-16T12:40:00Z')),false)
})
test('weekly summaries deduplicate repeated public observations, and complete weeks publish automatically without rewriting history',async()=>directory(async root=>{
  const report=prepareWeek([input(),input('2026-11-11')],'2026-W46');assert.equal(report.results.length,1);assert.equal(report.agree,2);assert.equal(report.total,3)
  await assert.rejects(publishCompletedWeek(root,report,new Date('2026-11-11T00:00:00Z')),/not_complete/)
  const future=new Date('2026-11-16T00:00:00Z');assert.equal(await publishCompletedWeek(root,report,future),true);assert.equal(await publishCompletedWeek(root,report,future),false)
  const published=await readPublishedReports(root);assert.equal(published.length,1);assert.equal(published[0]!.content_hash,sha256(json(report)))
  await buildWeeklySite(join(root,'site'),published);const rss=await readFile(join(root,'site','rss.xml'),'utf8');assert.match(rss,/2026-W46/);assert.doesNotMatch(rss,/异常/u)
  const png=await readFile(join(root,'site','weeks','2026-W46','share.png'));assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630)
  await writeFile(join(root,'reports','2026-W46.json'),json({...published[0],raw_runs:[]}))
  await assert.rejects(readPublishedReports(root),/metadata_invalid/)
  assert.equal(isoWeek('2027-01-01'),'2026-W53')
}))
test('relay generation escapes public names and produces every catalog station page',async()=>directory(async root=>{
  const snapshot=input();await buildRelaySite(root,snapshot,[snapshot]);const html=await readFile(join(root,'index.html'),'utf8');assert.match(html,/&lt;示例&gt;/u);assert.doesNotMatch(html,/<示例>/u)
  await readFile(join(root,'stations','station-a','index.html'));const sitemap=await readFile(join(root,'sitemap.xml'),'utf8');assert.match(sitemap,/\/models\/model-a\//);assert.match(sitemap,/\/stations\/station-a\//)
}))

test('a current-week page can launch immediately and withdrawal does not erase archives',async()=>directory(async root=>{
  const report=prepareWeek([input()],'2026-W46')
  await buildWeeklySite(join(root,'site'),[],{report,published_at:'2026-11-10T12:30:00Z'})
  assert.match(await readFile(join(root,'site','index.html'),'utf8'),/进行中/u)
  assert.doesNotMatch(await readFile(join(root,'site','rss.xml'),'utf8'),/<item>/u)
  await setWithdrawal(root,'current',true);assert.deepEqual(await readWithdrawals(root),['current'])
  await buildWeeklySite(join(root,'withdrawn'),[])
  assert.match(await readFile(join(root,'withdrawn','index.html'),'utf8'),/当前没有公开周报/u)
}))
