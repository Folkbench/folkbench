import { escapeHtml as e, agreement, percent } from './common'
import type { PublicDataExport, PublicDataIntegrity, PublicDataRanking } from './contract.generated'
import { SUBSITE_NOTICE, SUBSITE_DATA_REPO, type Subsite, type SubsitePage, type SnapshotModel, cell, pathId, quote, numberPrice, unitLabel, table, mainAnchor, rankingModels, rowsForModel, hasPrice, modelName, modelRecord, stationName, sevenDays, officialPrice, writeSubsite } from './subsite-core'
import { LIST_NOTICE, directoryTopics, priceModels, priceStations, relatedViews } from './network'
export { directoryTopics } from './network'

const link = (path: string, label: string) => `<a href="${path}">${e(label)}</a>`
const stationLink = (site: Subsite, snapshot: PublicDataExport, slug: string) => mainAnchor(site,`/services/${slug}`,stationName(snapshot,slug),`station-${slug}`)
const sourceRows = (rows: PublicDataRanking[]) => [...rows].sort((a,b)=>a.position-b.position)
const stamp = (snapshot: PublicDataExport) => `<p class="muted">归档日期 ${snapshot.date}</p>`
function about(site:Subsite,snapshot:PublicDataExport,title:string,description:string,paragraphs:string[]):SubsitePage{
  return {path:'/about/',title,description,body:`<h1>${title}</h1>${paragraphs.map(value=>`<p>${value}</p>`).join('')}<p>本站由公开快照生成，数据来自 ${mainAnchor(site,'/','Folkbench','about')} / <a href="${SUBSITE_DATA_REPO}">folkbench-data</a>。</p><p>${SUBSITE_NOTICE}</p><p>快照不是原始运行记录，不含题面和回答全文。只读取已有归档，缺失日期不补造。</p><p>${mainAnchor(site,'/methodology','主站方法说明','about-methodology')} · ${mainAnchor(site,'/corrections','提交纠错','about-corrections')}</p>${stamp(snapshot)}`}
}

export function relayComparisonPages(snapshot:PublicDataExport,history:PublicDataExport[]):SubsitePage[]{
  const site='ai-relay-bench';const ids=rankingModels(snapshot);const pages:SubsitePage[]=[]
  pages.push({path:'/',title:`按模型对比中转站公开快照 · ${snapshot.date}`,description:`按模型查看各中转站的公开快照对比，含来源名次、可用率、稳定性和已公布价格。数据来自 Folkbench ${snapshot.date} 快照；${SUBSITE_NOTICE}`,body:`<h1>按模型对比中转站公开快照</h1><p class="lede">选一个模型，查看它在各中转站公开快照中的对比。名次沿用 Folkbench 主站规则，包含合作档位与运营加分。</p>${stamp(snapshot)}${table(['模型','当日站点数','有公开价格的行数','归档日期'],ids.map(id=>{const rows=rowsForModel(snapshot,id);return [link(`/models/${pathId(id)}/`,modelName(snapshot,id)),String(new Set(rows.map(row=>row.station_slug)).size),String(rows.filter(hasPrice).length),snapshot.date]}),'model-directory')}`})
  for(const id of ids){const name=modelName(snapshot,id);const rows=rowsForModel(snapshot,id);const archived=sevenDays(snapshot,history).flatMap(day=>rowsForModel(day,id).map(row=>[day.date,cell(row.station_name),cell(row.rank_published)]))
    pages.push({path:`/models/${pathId(id)}/`,title:`${name} 中转站对比 · ${snapshot.date}`,description:`${name} 在 ${snapshot.date} 的 ${rows.length} 条中转站公开记录，保留来源顺序并列出各项指标。`,body:`<h1>${e(name)} 中转站对比</h1><p>以下为 ${e(name)} 在 ${snapshot.date} 公开快照中的中转站对比，行序按来源 position 排列，未按本页指标重排。</p>${officialPrice(modelRecord(snapshot,id))}${table(['来源名次','中转站','分组','综合','可用率','稳定性','输入价','输出价','样本','evidence_status'],rows.map(row=>[cell(row.rank_published),stationLink(site,snapshot,row.station_slug),cell(row.group_name),percent(row.overall_bps),percent(row.availability_bps),percent(row.stability_bps),cell(quote(row.input_price,row.price_currency,row.price_unit)),cell(quote(row.output_price,row.output_price_currency,row.output_price_unit)),cell(row.sample_size),cell(row.evidence_status)]),'model-comparison')}${archived.length?`<h2>近 7 日来源名次</h2>${table(['归档日期','中转站','来源名次'],archived,'rank-history')}`:''}${relatedViews(site,snapshot,'model',id,name)}`})
  }
  for(const topic of directoryTopics(snapshot)){const models=topic.models.map(model=>model.id)
    pages.push({path:`/series/${pathId(topic.path)}/`,title:`${topic.name} 中转站对比 · ${snapshot.date}`,description:`${snapshot.date} 公开快照中 ${topic.name} 系列 ${models.length} 个模型的中转站对比入口，以及各模型当日出现的站点数。`,body:`<h1>${e(topic.name)} 中转站对比</h1><p class="lede">这里汇总 ${snapshot.date} 公开快照里 ${e(topic.name)} 系列各模型的对比入口。进入模型页可以看到该模型在各中转站的并排记录。</p><p class="notice">${LIST_NOTICE}</p>${stamp(snapshot)}<h2>${e(topic.name)} 系列模型</h2><ul>${models.map(id=>`<li>${link(`/models/${pathId(id)}/`,`${modelName(snapshot,id)} 中转站对比`)}</li>`).join('')}</ul><h2>各模型当日站点数</h2>${table(['模型','当日站点数','有公开价格的行数'],models.map(id=>{const rows=rowsForModel(snapshot,id);return [cell(modelName(snapshot,id)),String(new Set(rows.map(row=>row.station_slug)).size),String(rows.filter(hasPrice).length)]}),'series-models')}${relatedViews(site,snapshot,'series',topic.path,topic.name)}`})
  }
  pages.push(about(site,snapshot,'模型对比的读取口径','说明按模型查看公开记录时的来源顺序、字段空缺与历史窗口。',['本站先列模型目录，再在模型页并排展示当日全部榜单行。不会把某个指标的排序写成来源名次。','来源名次保留 rank_published，行序保留 position。历史只使用近 7 日已经存在的日期。']))
  return pages
}

export type PriceGroup={key:string;label:string;rows:PublicDataRanking[]}
/** Both quote legs participate in the comparison key; missing metadata is never inferred. */
export function groupPrices(rows:PublicDataRanking[]):PriceGroup[]{
  const groups=new Map<string,PriceGroup>()
  for(const row of rows.filter(hasPrice)){
    const inCurrency=row.input_price!==null?row.price_currency:row.output_price_currency
    const inUnit=row.input_price!==null?row.price_unit:row.output_price_unit
    const outCurrency=row.output_price!==null?row.output_price_currency:inCurrency
    const outUnit=row.output_price!==null?row.output_price_unit:inUnit
    const key=JSON.stringify([row.model_id,inCurrency,inUnit,outCurrency,outUnit])
    const label=inCurrency===outCurrency&&inUnit===outUnit?`${inCurrency??'—'} · ${unitLabel(inUnit)}`:`输入 ${inCurrency??'—'} / ${unitLabel(inUnit)}；输出 ${outCurrency??'—'} / ${unitLabel(outUnit)}`
    const group=groups.get(key)??{key,label,rows:[]};group.rows.push(row);groups.set(key,group)
  }
  const compare=(a:number|null,b:number|null)=>a===null?(b===null?0:1):b===null?-1:a-b
  for(const group of groups.values()){
    const sample=group.rows[0]!;const metadata=JSON.parse(group.key) as (string|null)[]
    const comparable=metadata.slice(1).every(Boolean)&&metadata[1]===metadata[3]&&metadata[2]===metadata[4]
    group.rows.sort((a,b)=>comparable?(compare(a.input_price,b.input_price)||compare(a.output_price,b.output_price)||a.position-b.position):a.position-b.position)
    if(!sample)throw new Error('subsite_price_group_empty')
  }
  return [...groups.values()]
}
function priceTables(snapshot:PublicDataExport,id:string,day?:string):string{
  const groups=groupPrices(rowsForModel(snapshot,id));const site='aiapi-rank'
  if(!groups.length)return '<p class="empty">本日快照未收录公开价格</p>'
  return `<p>仅统计快照中已公布价格的行；未公布的不估算。</p>${groups.map(group=>`<h3>${day?`${day} · `:''}${e(group.label)}</h3>${table(['站名','分组','输入价','输出价','币种（输入 / 输出）','单位（输入 / 输出）','price_source','price_recorded_at'],group.rows.map(row=>[stationLink(site,snapshot,row.station_slug),cell(row.group_name),numberPrice(row.input_price),numberPrice(row.output_price),cell(row.price_currency===row.output_price_currency?row.price_currency:`${row.price_currency??'—'} / ${row.output_price_currency??'—'}`),cell(row.price_unit===row.output_price_unit?row.price_unit:`${row.price_unit??'—'} / ${row.output_price_unit??'—'}`),cell(row.price_source),cell(row.price_recorded_at)]),'public-prices')}`).join('')}`
}
function groupedVendors(snapshot:PublicDataExport):Map<string,SnapshotModel[]>{
  const groups=new Map<string,SnapshotModel[]>()
  for(const id of rankingModels(snapshot)){const model=modelRecord(snapshot,id);groups.set(model.vendor_id,[...(groups.get(model.vendor_id)??[]),model])}
  return groups
}
function vendorStations(snapshot:PublicDataExport,models:SnapshotModel[]):{slug:string;rows:PublicDataRanking[]}[]{
  const groups=new Map<string,PublicDataRanking[]>()
  for(const model of models)for(const row of rowsForModel(snapshot,model.id))groups.set(row.station_slug,[...(groups.get(row.station_slug)??[]),row])
  return [...groups].map(([slug,rows])=>({slug,rows}))
}
export function priceVendorPages(snapshot:PublicDataExport,history:PublicDataExport[]):SubsitePage[]{
  const site='aiapi-rank';const pages:SubsitePage[]=[];const ids=rankingModels(snapshot)
  const eligible=new Set(priceModels(snapshot))
  let body=`<h1>AI API 公开价格快照</h1><p class="lede">这里只整理公开快照里已经公布的价格，并按模型厂商列出相关中转站。未公布的价格不估算。官方参考价若与中转价币种不同，会分开展示，不换算。</p>${stamp(snapshot)}`
  for(const id of ids){const model=modelRecord(snapshot,id);body+=`<section><h2>${eligible.has(id)?link(`/prices/${pathId(id)}/`,model.name):e(model.name)}</h2>${officialPrice(model)}${priceTables(snapshot,id)}</section>`
    if(eligible.has(id))pages.push({path:`/prices/${pathId(id)}/`,title:`${model.name} 公开价格 · ${snapshot.date}`,description:`${model.name} 已公布输入和输出价格的 ${snapshot.date} 快照，按币种与单位分组，保留价格来源。`,body:`<h1>${e(model.name)} 公开价格</h1><p>官方参考价和中转报价均按原币种展示。同币种、同单位价格表按输入价排列；输入价相同再比较输出价。</p>${officialPrice(model)}${priceTables(snapshot,id)}${sevenDays(snapshot,history).some(day=>rowsForModel(day,id).some(hasPrice))?`<h2>近 7 日已有价格快照</h2>${sevenDays(snapshot,history).filter(day=>rowsForModel(day,id).some(hasPrice)).map(day=>`<section>${priceTables(day,id,day.date)}</section>`).join('')}`:''}${relatedViews(site,snapshot,'model',id,model.name)}`})
  }
  pages.unshift({path:'/',title:`AI API 公开价格快照 · ${snapshot.date}`,description:`按模型汇总中转站已公布的输入/输出价格，并按厂商列出相关站点。数据来自 Folkbench ${snapshot.date} 快照。官方参考价与中转价按原币种分列，不做汇率换算。${SUBSITE_NOTICE}`,body})
  const vendors=groupedVendors(snapshot)
  pages.push({path:'/vendors/',title:`模型厂商与相关站点 · ${snapshot.date}`,description:`浏览 ${snapshot.date} 榜单中实际出现的模型厂商及其相关中转站。`,body:`<h1>按模型厂商查站点</h1>${table(['厂商','当日榜单模型','相关站点数'],[...vendors].map(([id,models])=>[link(`/vendors/${pathId(id)}/`,models[0]!.vendor_name),cell(models.map(model=>model.name).join('、')),String(vendorStations(snapshot,models).length)]),'vendor-directory')}`})
  for(const[id,models]of vendors){const name=models[0]!.vendor_name;pages.push({path:`/vendors/${pathId(id)}/`,title:`${name} 相关中转站与公开价格 · ${snapshot.date}`,description:`${name} 当日榜单模型的官方参考价与相关站点，公开报价保持原币种和计价单位。`,body:`<h1>${e(name)} 相关中转站与公开价格</h1><h2>当日在榜单中的模型参考价</h2>${models.map(model=>`<section><h3>${eligible.has(model.id)?link(`/prices/${pathId(model.id)}/`,model.name):e(model.name)}</h3>${officialPrice(model)}</section>`).join('')}<h2>相关中转站</h2>${table(['站名','出现的模型','公开报价'],vendorStations(snapshot,models).map(item=>[stationLink(site,snapshot,item.slug),cell([...new Set(item.rows.map(row=>row.model_name))].join('、')),item.rows.filter(hasPrice).map(row=>`${e(row.model_name)} · ${cell(row.group_name)}：输入 ${cell(quote(row.input_price,row.price_currency,row.price_unit))} / 输出 ${cell(quote(row.output_price,row.output_price_currency,row.output_price_unit))}`).join('<br>')||'—']),'vendor-stations')}`})}
  for(const slug of priceStations(snapshot)){const name=stationName(snapshot,slug);const rows=snapshot.rankings.filter(row=>row.station_slug===slug&&hasPrice(row))
    pages.push({path:`/stations/${pathId(slug)}/prices/`,title:`${name} API 价格 · ${snapshot.date}`,description:`${name} 在 ${snapshot.date} 公开快照中已公布的 ${rows.length} 条 API 价格，按模型列出，保留原币种和计价单位。`,body:`<h1>${e(name)} API 价格</h1><p class="lede">以下是 ${e(name)} 在 ${snapshot.date} 公开快照里已公布的全部价格行，按模型列出。价格保留原币种和计价单位，不做汇率换算；未公布的价格不估算。</p><p class="notice">${LIST_NOTICE}</p>${stamp(snapshot)}${table(['模型','分组','输入价','输出价','币种（输入 / 输出）','单位（输入 / 输出）','price_source','price_recorded_at'],rows.map(row=>[eligible.has(row.model_id)?link(`/prices/${pathId(row.model_id)}/`,row.model_name):cell(row.model_name),cell(row.group_name),numberPrice(row.input_price),numberPrice(row.output_price),cell(row.price_currency===row.output_price_currency?row.price_currency:`${row.price_currency??'—'} / ${row.output_price_currency??'—'}`),cell(row.price_unit===row.output_price_unit?row.price_unit:`${row.price_unit??'—'} / ${row.output_price_unit??'—'}`),cell(row.price_source),cell(row.price_recorded_at)]),'station-prices')}<p>${mainAnchor(site,`/services/${slug}`,'查看主站完整页面',`station-prices-${slug}`)}</p>${relatedViews(site,snapshot,'station',slug,name)}`})
  }
  pages.push(about(site,snapshot,'公开价格的分组口径','说明价格缺失、原币种展示和价格表排序的适用范围。',['本站以公开标价和模型厂商为入口。价格来自归档，可能缺失；缺失单元格显示为 —。','官方参考价与中转价可能币种不同，本站不进行汇率换算。价格表只在相同模型、币种、单位的组内比较输入价，输入相同再比较输出价。','若输入和输出的币种或单位不同，则分项保留原报价并保持来源顺序。这里的价格阅读顺序不改变主站综合排名。']))
  return pages
}

function stationFacts(snapshot:PublicDataExport,slug:string):string{
  const station=snapshot.stations.find(row=>row.slug===slug)!
  return table(['字段','公开资料'],[['收录状态',station.listing_status],['首次收录',station.first_listed_at],['安全等级',station.data_security_level],['有效性',station.data_security_validity],['核验日期',station.checked_at],['主体资料',station.subject_present],['境内支付',station.domestic_payment],['境外支付',station.overseas_payment],['发票',station.invoice],['客服',station.customer_service],['退款',station.refund]].map(([name,value])=>[cell(name),cell(value)]),'station-facts')
}
const GUIDE=[
  ['这是什么','这是 Folkbench 公开快照的站点目录，不是交易平台。页面整理已经公开的资料，服务购买与使用需遵循站方条款。'],
  ['排序和名次',SUBSITE_NOTICE],
  ['如何阅读收录状态','常规收录对应 tested，仅收录对应 catalog_only；这些是来源状态，后者不是额外的质量保证。'],
  ['如何阅读空缺价格','价格可能空缺。空缺不代表免费，也不代表站点未经营；请查看主站及站方当前公布的信息。'],
  ['支付、发票与退款','这些字段只说明公开资料里的支持状态。unspecified 表示快照未收录，不表示肯定或否定；页面不会补写具体支付渠道。'],
  ['安全等级与有效性','安全等级要连同有效性一起看。not_verified 时，不应把等级当成已核验结论；expired 表示核验状态已过期。'],
  ['选站之后','请到 Folkbench 主站查看完整页面，并自行核实站方当前条款、报价和适用范围。'],
  ['如何提交纠错','发现错误时，请提供归档日期、模型或站点标识，以及需要核对的公开字段，通过纠错入口提交。'],
]
export function stationDirectoryPages(snapshot:PublicDataExport):SubsitePage[]{
  const site='ai-zhongzhuan';const pages:SubsitePage[]=[];const topics=directoryTopics(snapshot)
  let body=`<h1>AI 中转站公开目录</h1><p class="lede">这是 Folkbench 公开快照里的中转站目录。资料字段来自已公布信息，不是探测分数。查看名次和完整页面请回到主站。</p>${stamp(snapshot)}<p>${link('/guide/','新手指南：如何阅读目录')}</p>`
  for(const[status,label]of [['tested','常规收录'],['catalog_only','仅收录']]){const stations=snapshot.stations.filter(row=>row.listing_status===status);body+=`<section><h2>${label}（${stations.length}）</h2>${table(['站名','首次收录','安全等级','有效性','境内支付','境外支付','发票','客服','退款'],stations.map(row=>[link(`/stations/${pathId(row.slug)}/`,row.name),cell(row.first_listed_at),cell(row.data_security_level),cell(row.data_security_validity),cell(row.domestic_payment),cell(row.overseas_payment),cell(row.invoice),cell(row.customer_service),cell(row.refund)]),'station-directory')}</section>`}
  body+=`<h2>按模型系列查找站点</h2><ul>${topics.map(topic=>`<li>${link(`/${topic.path}-zhongzhuanzhan/`,`${topic.name} 中转站公开目录`)}</li>`).join('')}</ul>`
  pages.push({path:'/',title:`AI 中转站公开目录 · ${snapshot.date}`,description:`Folkbench ${snapshot.date} 公开快照中的中转站目录，含收录状态、支付与发票等公开资料，以及新手指南。${SUBSITE_NOTICE}`,body})
  for(const station of snapshot.stations){const rows=snapshot.rankings.filter(row=>row.station_slug===station.slug);pages.push({path:`/stations/${pathId(station.slug)}/`,title:`${station.name} · 公开资料 ${snapshot.date}`,description:`${station.name} 的收录、安全核验及支付发票等公开资料，并列出 ${snapshot.date} 榜单中出现的模型。`,body:`<h1>${e(station.name)} 公开资料</h1>${stationFacts(snapshot,station.slug)}<h2>当日榜单中的模型记录</h2>${rows.length?table(['模型','分组','来源名次','输入价','输出价'],rows.map(row=>[cell(row.model_name),cell(row.group_name),cell(row.rank_published),cell(quote(row.input_price,row.price_currency,row.price_unit)),cell(quote(row.output_price,row.output_price_currency,row.output_price_unit))]),'station-models'):'<p>本日快照未收录该站的榜单行</p>'}<p>${mainAnchor(site,`/services/${station.slug}`,'查看主站完整页面',`station-${station.slug}`)}</p>${relatedViews(site,snapshot,'station',station.slug,station.name)}`})}
  pages.push({path:'/guide/',title:'新手指南：如何阅读中转站公开目录',description:'从收录状态、空缺价格、资料支持状态和安全有效性阅读公开目录，了解下一步核实和纠错方式。',body:`<h1>新手指南：如何阅读中转站公开目录</h1>${GUIDE.map(([title,paragraph],index)=>`<section><h2>${index+1}. ${title}</h2><p>${paragraph}</p></section>`).join('')}<p>${mainAnchor(site,'/','查看 Folkbench','guide')} · ${mainAnchor(site,'/corrections','提交纠错','guide-corrections')} · ${mainAnchor(site,'/vendor-join','站点入驻申请','guide-join')}</p>`})
  for(const topic of topics)pages.push({path:`/${topic.path}-zhongzhuanzhan/`,title:`${topic.name} 中转站公开目录 · ${snapshot.date}`,description:`在 ${snapshot.date} 榜单里出现 ${topic.name} 相关模型的站点目录，继续查看站点公开资料。`,body:`<h1>${topic.name} 中转站公开目录</h1><p>下列站点在当日榜单中出现过相关模型。这里只按目录呈现，不合成为跨模型总榜。</p>${table(['站名','出现的模型'],vendorStations(snapshot,topic.models).map(item=>[snapshot.stations.some(row=>row.slug===item.slug)?link(`/stations/${pathId(item.slug)}/`,stationName(snapshot,item.slug)):stationLink(site,snapshot,item.slug),cell([...new Set(item.rows.map(row=>row.model_name))].join('、'))]),'series-stations')}${relatedViews(site,snapshot,'series',topic.path,topic.name)}`})
  pages.push(about(site,snapshot,'站点目录的来源与阅读方式','说明目录资料、枚举支持状态、安全有效性和模型记录的来源。',['本站以公开站点资料为入口，目录覆盖当日 stations 中的全部条目。支付、发票、客服和退款字段不是探测结果。','常规收录与仅收录分开呈现；模型记录只说明站点在当日榜单里出现的内容。名次仍沿用主站规则。']))
  return pages
}

const normalizedModel=(id:string)=>id.toLowerCase().replaceAll('.','-')
const sharedBaseIds=new Set(['gpt-6-astra','gpt-6-1-sol'])
export function hasSharedBasePair(rows:PublicDataIntegrity[]):boolean{return rows.some(row=>row.identified_model_id&&normalizedModel(row.model_id)!==normalizedModel(row.identified_model_id)&&sharedBaseIds.has(normalizedModel(row.model_id))&&sharedBaseIds.has(normalizedModel(row.identified_model_id)))}
function sharedBaseNotice(rows:PublicDataIntegrity[],context:PublicDataIntegrity[]=rows):string{return hasSharedBasePair(context)&&rows.some(row=>sharedBaseIds.has(normalizedModel(row.model_id))||row.identified_model_id&&sharedBaseIds.has(normalizedModel(row.identified_model_id)))?'<p class="notice">GPT 6 Astra 与 GPT 6.1 Sol 共享底模，当前指纹无法区分这类配对；模型标识不同不能直接作为底模变化的判断。</p>':''}
function probeRowsTable(snapshot:PublicDataExport,rows:PublicDataIntegrity[],kind:string):string{
  return table(['站点','模型','分组','调用方式','agree / total','输入 Token 范围','思考 Token 中位数','识别模型','测量时间'],rows.map(row=>[stationLink('ai-model-check',snapshot,row.station_slug),cell(modelName(snapshot,row.model_id)),cell(row.group_name),cell(row.client_mode),e(agreement(row.agree,row.total)),row.input_tokens_min===null||row.input_tokens_max===null?'—':`${row.input_tokens_min}–${row.input_tokens_max}`,cell(row.reasoning_median),cell(row.identified_model_id),cell(row.measured_at)]),kind)
}
export function identitySnapshotPages(snapshot:PublicDataExport,history:PublicDataExport[]):SubsitePage[]{
  const site='ai-model-check';const rows=snapshot.integrity;const models=[...new Set(rows.map(row=>row.model_id))];const stations=[...new Set(rows.map(row=>row.station_slug))]
  const mismatches=rows.filter(row=>row.identified_model_id!==null&&row.identified_model_id!==row.model_id)
  const stats=`快照收录 ${rows.length} 条探针结果、覆盖 ${stations.length} 家站点`
  const total=rows.reduce((sum,row)=>sum+row.total,0),agree=rows.reduce((sum,row)=>sum+row.agree,0)
  const pages:SubsitePage[]=[{path:'/',title:`模型身份探针公开快照 · ${snapshot.date}`,description:`Folkbench ${snapshot.date} 公开快照的身份探针汇总。${stats}。。单次结果不能证明模型被替换。`,body:`<h1>模型身份探针公开快照</h1><p class="lede">${stats}。下面是按模型和站点查看的公开汇总，以及指纹识别结果与申报模型不一致的观察。单次结果不能证明模型被替换。</p>${stamp(snapshot)}<p>覆盖 ${models.length} 个模型 · 汇总一致率 ${e(agreement(agree,total))}</p><section class="signals"><h2>指纹观察</h2><p>这是公开快照中的指纹观察，单次结果不能证明模型被替换。</p>${sharedBaseNotice(rows)}${mismatches.length?table(['申报模型','识别结果','站点','分组','agree / total','测量时间'],mismatches.map(row=>[`${cell(modelName(snapshot,row.model_id))}<br><small>${e(row.model_id)}</small>`,cell(row.identified_model_id),stationLink(site,snapshot,row.station_slug),cell(row.group_name),e(agreement(row.agree,row.total)),cell(row.measured_at)]),'fingerprint-observations'):'<p>本日快照未收录标识不同的指纹观察。</p>'}</section><h2 id="models">按模型查看</h2>${table(['模型','公开结果条数'],models.map(id=>[link(`/models/${pathId(id)}/`,modelName(snapshot,id)),String(rows.filter(row=>row.model_id===id).length)]),'probe-models')}<h2 id="stations">按站点查看</h2>${table(['站点','公开结果条数'],stations.map(slug=>[link(`/stations/${pathId(slug)}/`,stationName(snapshot,slug)),String(rows.filter(row=>row.station_slug===slug).length)]),'probe-stations')}`}]
  for(const id of models){const selected=rows.filter(row=>row.model_id===id);const past=sevenDays(snapshot,history).flatMap(day=>day.integrity.filter(row=>row.model_id===id).map(row=>[day.date,cell(stationName(day,row.station_slug)),e(agreement(row.agree,row.total)),cell(row.identified_model_id),cell(row.measured_at)]));pages.push({path:`/models/${pathId(id)}/`,title:`${modelName(snapshot,id)} 身份探针快照 · ${snapshot.date}`,description:`${modelName(snapshot,id)} 在 ${snapshot.date} 已公开的 ${selected.length} 条探针汇总，展示调用方式、Token 与指纹观察。`,body:`<h1>${e(modelName(snapshot,id))} 身份探针快照</h1><p>以下为该模型当日已经公开的汇总，记录数不是执行次数。输入 Token、思考 Token 和指纹均为辅助信号。</p>${sharedBaseNotice(selected,snapshot.integrity)}${probeRowsTable(snapshot,selected,'model-probes')}${past.length?`<h2>近 7 日已有归档</h2>${table(['归档日期','站点','agree / total','识别模型','测量时间'],past,'probe-history')}`:''}${relatedViews(site,snapshot,'model',id,modelName(snapshot,id))}`})}
  for(const slug of stations){const selected=rows.filter(row=>row.station_slug===slug);pages.push({path:`/stations/${pathId(slug)}/`,title:`${stationName(snapshot,slug)} 身份探针快照 · ${snapshot.date}`,description:`${stationName(snapshot,slug)} 在 ${snapshot.date} 公开的 ${selected.length} 条身份探针汇总，按模型和分组展示。`,body:`<h1>${e(stationName(snapshot,slug))} 身份探针快照</h1><p>这里按站点汇集当日公开结果，不是完整站点档案。单次一致率或指纹观察不能证明模型被替换。</p>${sharedBaseNotice(selected,snapshot.integrity)}${probeRowsTable(snapshot,selected,'station-probes')}<p>${mainAnchor(site,`/services/${slug}`,'查看主站完整页面',`station-${slug}`)}</p>${relatedViews(site,snapshot,'station',slug,stationName(snapshot,slug))}`})}
  pages.push(about(site,snapshot,'身份探针信号与局限','说明一致率、匿名题目 ID、Token、模型指纹及共享底模的解释边界。',['agree / total 表示可比较题目的匹配情况。总一致率为所展示汇总的 agree 之和除以 total 之和。','题目只公开匿名 ID；输入 Token、思考 Token 和指纹都是辅助信号。不设置未经确认的异常阈值，不由单次结果推断模型替换。','记录数不是执行次数。部分模型共享底模，指纹无法区分；涉及这类配对时，会在观察列表和相关页面注明。',...(hasSharedBasePair(rows)?['GPT 6 Astra 与 GPT 6.1 Sol 共享底模，当前指纹无法区分这类配对。']:[])]))
  return pages
}
export async function buildSubsite(root:string,site:Subsite,snapshot:PublicDataExport,history:PublicDataExport[]):Promise<void>{
  const pages=site==='ai-relay-bench'?relayComparisonPages(snapshot,history):site==='aiapi-rank'?priceVendorPages(snapshot,history):site==='ai-zhongzhuan'?stationDirectoryPages(snapshot):identitySnapshotPages(snapshot,history)
  await writeSubsite(root,site,snapshot,pages)
}
