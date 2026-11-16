import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { fetchSnapshot, json, sha256, readSnapshot, DATA_REPO } from './common'
import { readHistory, verifyArchive, writeArchive } from './archive'
import { updateReadme } from './readme'
import { isoWeek, prepareWeek, publishCompletedWeek, readPublishedReports, readWithdrawals, setWithdrawal } from './weekly'
import { buildRelaySite, buildWeeklySite } from './sites'

const args = process.argv.slice(2); const command = args.shift()
function option(name: string, fallback?: string): string {
  const index = args.indexOf(`--${name}`); const value = index < 0 ? fallback : args[index+1]
  if (!value || value.startsWith('--')) throw new Error(`distribution_argument_missing:${name}`)
  return value
}
const root = resolve(option('root','.'))
async function output(name: string, value: string): Promise<void> {
  if (process.env.GITHUB_OUTPUT) await writeFile(process.env.GITHUB_OUTPUT, `${name}=${value}\n`,{flag:'a'})
  console.log(`${name}=${value}`)
}
async function verifySite(path: string): Promise<void> {
  const html:string[]=[]
  async function visit(dir:string):Promise<void>{for(const entry of await readdir(dir,{withFileTypes:true})){const child=join(dir,entry.name);if(entry.isSymbolicLink())throw new Error('distribution_symlink_rejected');if(entry.isDirectory())await visit(child);else if(entry.name.endsWith('.html'))html.push(child)}}
  await visit(path);if(!html.length)throw new Error('distribution_site_empty')
  const titles=new Set<string>();const descriptions=new Set<string>()
  for(const file of html){const body=await readFile(file,'utf8');if(file.endsWith('404.html'))continue
    const title=body.match(/<title>(.*?)<\/title>/u)?.[1];const description=body.match(/<meta name="description" content="([^"]*)"/u)?.[1]
    if(!title||!description||titles.has(title)||descriptions.has(description))throw new Error('distribution_metadata_not_unique');titles.add(title);descriptions.add(description)
    for(const match of body.matchAll(/href="([^"]+)"/gu)){const href=match[1]!.replaceAll('&amp;','&');if(href.startsWith('https://folkbench.com/')){const u=new URL(href);if(u.searchParams.get('utm_source')!=='github'||u.searchParams.get('utm_medium')!=='pages'||!u.searchParams.get('utm_campaign')||!u.searchParams.get('utm_content'))throw new Error('distribution_utm_missing')}
      if(href.startsWith('/relay-rank/')||href.startsWith('/integrity-weekly/')){const relative=href.replace(/^\/(?:relay-rank|integrity-weekly)\//u,'');const target=join(path,relative.endsWith('/')||relative===''?`${relative}index.html`:relative);await stat(target)}
      if(/(?:[?&](?:aff|ref|partner)=|\/go\/|\/outbound)/iu.test(href))throw new Error('distribution_promotional_link')
    }
    for(const match of body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gu))JSON.parse(match[1]!)
  }
}

async function main():Promise<void>{
  if(command==='archive'){
    const snapshot=args.includes('--snapshot')?await readSnapshot(resolve(option('snapshot'))):await fetchSnapshot()
    const changed=await writeArchive(root,snapshot);await output('changed',String(changed));await output('snapshot_version',snapshot.snapshot_version)
  }else if(command==='readme'){
    const snapshot=await verifyArchive(join(resolve(option('data-root')),'latest'))
    // The matching immutable daily archive must already exist, not only a mutable latest directory.
    const daily=await verifyArchive(join(resolve(option('data-root')),'daily',...snapshot.date.split('-')))
    if(daily.snapshot_version!==snapshot.snapshot_version)throw new Error('distribution_readme_archive_missing')
    const path=join(root,'README.md');const before=await readFile(path,'utf8');const after=updateReadme(before,snapshot)
    if(after!==before)await writeFile(path,after)
    await output('changed',String(after!==before));await output('snapshot_version',snapshot.snapshot_version)
  }else if(command==='relay-site'){
    const data=resolve(option('data-root'));const snapshot=await verifyArchive(join(data,'latest'));const history=await readHistory(data)
    await buildRelaySite(resolve(option('out')),snapshot,history);await verifySite(resolve(option('out')))
  }else if(command==='weekly-sync'){
    const history=await readHistory(resolve(option('data-root')))
    const current=isoWeek(new Date(Date.now()+8*60*60_000).toISOString().slice(0,10))
    let changed=false
    for(const week of [...new Set(history.map(snapshot=>isoWeek(snapshot.date)))].sort()){
      if(week<current)changed=(await publishCompletedWeek(root,prepareWeek(history,week)))||changed
    }
    await output('changed',String(changed))
  }else if(command==='weekly-withdraw'){
    await setWithdrawal(root,option('week'),!args.includes('--restore'))
  }else if(command==='weekly-site'){
    const history=await readHistory(resolve(option('data-root')))
    const current=isoWeek(new Date(Date.now()+8*60*60_000).toISOString().slice(0,10))
    const snapshots=history.filter(snapshot=>isoWeek(snapshot.date)===current)
    const withdrawn=await readWithdrawals(root)
    const live=snapshots.length&&!withdrawn.includes('current')&&!withdrawn.includes(current)?{report:prepareWeek(snapshots,current),published_at:snapshots.at(-1)!.published_at}:undefined
    await buildWeeklySite(resolve(option('out')),(await readPublishedReports(root)).filter(item=>!withdrawn.includes(item.report.week)),live)
    await verifySite(resolve(option('out')))
  }else if(command==='verify-site'){
    await verifySite(root)
  }else if(command==='verify'){
    const kind=option('kind','data')
    if(args.includes('--staged')){
      execFileSync('git',['diff','--quiet','--','latest','daily','reports','withdrawals.json'],{cwd:root})
      const changed=execFileSync('git',['diff','--cached','--name-only','--diff-filter=DMRT','--','daily','reports'],{cwd:root,encoding:'utf8'}).trim()
      if(changed)throw new Error('distribution_published_history_changed')
      const paths=execFileSync('git',['diff','--cached','--name-only','--diff-filter=AC','--','daily'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean)
      const directories=new Set<string>()
      for(const path of paths){if(!/^daily\/\d{4}\/\d{2}\/\d{2}\/[^/]+$/u.test(path))throw new Error('distribution_archive_path_invalid');directories.add(path.slice(0,path.lastIndexOf('/')))}
      for(const directory of directories)await verifyArchive(join(root,directory))
    }
    if(args.includes('--push')){
      execFileSync('git',['diff','--quiet','HEAD','--','daily','latest','reports','withdrawals.json'],{cwd:root})
      const refs=await new Promise<string>(resolve=>{let input='';process.stdin.setEncoding('utf8');process.stdin.on('data',chunk=>{input+=chunk});process.stdin.on('end',()=>resolve(input))})
      const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()
      for(const line of refs.trim().split('\n').filter(Boolean)){
        const [,localSha,,remoteSha]=line.split(' ')
        if(localSha!==head)throw new Error('distribution_push_must_match_verified_head')
        if(remoteSha&& !/^0+$/u.test(remoteSha)){
          const changed=execFileSync('git',['diff','--name-only','--diff-filter=DMRT',remoteSha,localSha,'--','daily','reports'],{cwd:root,encoding:'utf8'}).trim()
          if(changed)throw new Error('distribution_published_history_changed')
        }
      }
    }
    if(kind==='data'){
      let hasLatest=true;try{await stat(join(root,'latest'))}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;hasLatest=false}
      if(hasLatest){const snapshot=await verifyArchive(join(root,'latest'));await verifyArchive(join(root,'daily',...snapshot.date.split('-')));await readHistory(root)}
    }else if(kind==='weekly')await readPublishedReports(root)
    console.log('distribution_verified')
  }else if(command==='monthly'){
    const month=option('month');if(!/^\d{4}-(?:0[1-9]|1[0-2])$/u.test(month))throw new Error('distribution_month_invalid')
    if(month>=new Date().toISOString().slice(0,7))throw new Error('distribution_month_not_complete')
    const history=await readHistory(root,{month})
    if(!history.length)throw new Error('distribution_month_empty')
    const out=resolve(option('out'));await mkdir(out,{recursive:true});const body=json({schema_version:'1.0',month,snapshots:history})
    await writeFile(join(out,`${month}.json`),body);await writeFile(join(out,`${month}.sha256`),`${sha256(body)}  ${month}.json\n`)
    await writeFile(join(out,'notes.md'),`# ${month} 公开快照\n\n包含 ${history.length} 个实际归档日期，缺失日期不补造。排序沿用主站规则，部分数据为展示样本。\n\n数据来源：[Folkbench Data](${DATA_REPO})。CC BY 4.0。\n`)
  }else if(command==='failure-alert'){
    // Query actual workflow history; retries/manual attempts on the same day count once.
    const repo=option('repo');const workflow=option('workflow');if(!/^Folkbench\/[A-Za-z0-9._-]+$/u.test(repo)||!/^[-a-z0-9]+\.yml$/u.test(workflow))throw new Error('distribution_alert_target_invalid')
    const payload=JSON.parse(execFileSync('gh',['api',`repos/${repo}/actions/workflows/${workflow}/runs?per_page=100`],{encoding:'utf8'}))
    const days=new Map<string,boolean>()
    for(const run of payload.workflow_runs??[]){if(run.event!=='schedule'||run.status!=='completed')continue;const day=new Date(Date.parse(run.created_at)+8*60*60_000).toISOString().slice(0,10);days.set(day,(days.get(day)??false)||run.conclusion==='success')}
    if(process.env.GITHUB_EVENT_NAME==='schedule'){const today=new Date(Date.now()+8*60*60_000).toISOString().slice(0,10);if(!days.has(today))days.set(today,false)}
    const failed=[...days].sort(([a],[b])=>b.localeCompare(a)).slice(0,2)
    if(failed.length!==2||failed.some(([,success])=>success)||Date.parse(failed[0]![0])-Date.parse(failed[1]![0])!==86_400_000)return
    const title='每日公开快照分发连续两天失败';const issues=JSON.parse(execFileSync('gh',['issue','list','--repo',repo,'--state','open','--json','number,title'],{encoding:'utf8'}))
    if(issues.some((issue:{title:string})=>issue.title===title))return
    const bodyFile=join(root,'.distribution-alert.md');await writeFile(bodyFile,`工作流 ${workflow} 在 ${failed[1]![0]} 和 ${failed[0]![0]} 均未成功。请检查 Actions 日志；旧快照继续保留。\n`)
    execFileSync('gh',['issue','create','--repo',repo,'--title',title,'--body-file',bodyFile],{stdio:'inherit'})
  }else throw new Error('distribution_command_invalid')
}
await main()
