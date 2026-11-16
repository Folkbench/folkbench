import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { isSubsite } from './subsite-core'

const root=execFileSync('git',['rev-parse','--show-toplevel'],{encoding:'utf8'}).trim()
const spec=JSON.parse(readFileSync(`${root}/repository.json`,'utf8'))
if(!isSubsite(spec.owner)||spec.name!==`${spec.owner}.github.io`||spec.default_branch!=='main'||spec.visibility!=='public'||spec.homepage!==`https://${spec.owner}.github.io/`)throw new Error('subsite_repository_invalid')
const workflow=readFileSync(`${root}/.github/workflows/pages.yml`,'utf8')
if(!workflow.includes("cron: '0 13 * * *'")||!workflow.includes('contents: read')||!workflow.includes('pages: write')||!workflow.includes('id-token: write')||!workflow.includes(`--site ${spec.owner}`)||/contents:\s*write/u.test(workflow))throw new Error('subsite_workflow_scope_invalid')
const readme=readFileSync(`${root}/README.md`,'utf8')
for(const match of readme.matchAll(/https:\/\/folkbench\.com[^\s)]+/gu)){const url=new URL(match[0]);if(url.searchParams.get('utm_source')!==spec.owner||url.searchParams.get('utm_medium')!=='pages'||url.searchParams.get('utm_campaign')!=='subsite')throw new Error('subsite_readme_utm_invalid')}
const tracked=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean)
if(tracked.some(path=>/^(?:daily|latest|reports)\//u.test(path)))throw new Error('subsite_must_not_store_snapshots')
if(process.argv.includes('--staged'))execFileSync('git',['diff','--quiet'],{cwd:root})
if(process.argv.includes('--push')){
  execFileSync('git',['diff','--quiet','HEAD'],{cwd:root})
  const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()
  const refs=await new Promise<string>(resolve=>{let text='';process.stdin.setEncoding('utf8');process.stdin.on('data',value=>{text+=value});process.stdin.on('end',()=>resolve(text))})
  for(const line of refs.trim().split('\n').filter(Boolean))if(line.split(' ')[1]!==head)throw new Error('subsite_push_must_match_verified_head')
}
console.log('subsite_repository_verified')
