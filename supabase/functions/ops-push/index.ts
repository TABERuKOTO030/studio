// ops-push：秘幕手帐日程提醒。pg_cron 每 5 分钟带 x-cron-secret 调用；登录用户可 {test:true} 自测。
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')||'mailto:admin@example.com',Deno.env.get('VAPID_PUBLIC_KEY')!,Deno.env.get('VAPID_PRIVATE_KEY')!);
const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const J=(o:unknown,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{...cors,'content-type':'application/json'}});
const TYPES:Record<string,string>={shoot:'拍摄',edit:'剪辑',publish:'发布',promo:'推广',settle:'结算',other:'其他'};
// 某时区本地时间 → UTC 毫秒
function tzOffMin(tz:string,ms:number){const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).formatToParts(new Date(ms)).map(x=>[x.type,x.value]));return(Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute)-ms)/6e4}
const localToUtc=(tz:string,day:string,hm:string)=>{const [y,m,d]=day.split('-').map(Number);const [h,mi]=hm.split(':').map(Number);const g=Date.UTC(y,m-1,d,h,mi);return g-tzOffMin(tz,g)*6e4};
const addDays=(day:string,n:number)=>new Date(Date.parse(day+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
function occurs(it:any,day:string){if(day<it.day)return false;if(it.until&&day>it.until)return false;if((it.exdates||[]).includes(day))return false;
  const r=it.rrule||'';if(!r)return day===it.day;const diff=Math.round((Date.parse(day)-Date.parse(it.day))/864e5);
  if(r==='daily')return true;if(r==='weekly')return diff%7===0;if(r==='monthly')return day.slice(8)===it.day.slice(8);if(r==='yearly')return day.slice(5)===it.day.slice(5);return false}
async function send(s:any,payload:any){try{const r=await webpush.sendNotification({endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}},JSON.stringify(payload),{TTL:6*3600,urgency:'high'});return r.statusCode}
  catch(e:any){if(e.statusCode===404||e.statusCode===410)await admin.from('ops_push').delete().eq('id',s.id);return e.statusCode||0}}
const offTxt=(o:number)=>o===0?'现在':o<60?`${o} 分钟后`:o<1440?`${Math.round(o/60)} 小时后`:`${Math.round(o/1440)} 天后`;
function payload(s:any,it:any,o:number,hm:string){const generic={title:'秘幕手帐',body:'你有一条日程提醒',tag:'ops-'+it.id,url:'./#cal'};
  if(!s.preview)return generic;return{title:`${TYPES[it.type]||'日程'} · ${offTxt(o)}`,body:`${it.title||'（无标题）'}${it.all_day?'':' · '+hm}`,tag:'ops-'+it.id,url:'./#cal'}}
Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  try{const body=await req.json().catch(()=>({}));
    if(body.test){const tok=(req.headers.get('authorization')||'').replace(/^Bearer /,'');const {data:u}=await admin.auth.getUser(tok);if(!u?.user)return J({error:'unauthorized'},401);
      const {data:subs}=await admin.from('ops_push').select('*').eq('owner',u.user.id).eq('enabled',true);let ok=0;const st:number[]=[];
      for(const s of subs||[]){const c=await send(s,s.preview?{title:'秘幕手帐 · 测试',body:'提醒通道正常，日程到点会这样通知你。',tag:'ops-test'}:{title:'秘幕手帐',body:'测试通知：提醒通道正常',tag:'ops-test'});st.push(c);if(c>=200&&c<300)ok++}
      return J({devices:(subs||[]).length,sent:ok,status:st})}
    if(req.headers.get('x-cron-secret')!==Deno.env.get('OPS_CRON_SECRET'))return J({error:'forbidden'},403);
    const {data:subs}=await admin.from('ops_push').select('*').eq('enabled',true);const byOwner=new Map<string,any[]>();for(const s of subs||[]){if(!byOwner.has(s.owner))byOwner.set(s.owner,[]);byOwner.get(s.owner)!.push(s)}
    const now=Date.now();const out:any[]=[];
    for(const [owner,ss] of byOwner){const tz=ss[0].tz||'Asia/Tokyo';const today=new Date(now+tzOffMin(tz,now)*6e4).toISOString().slice(0,10);
      const {data:items}=await admin.from('ops_items').select('*').eq('owner',owner).eq('remind_on',true).eq('done',false).neq('remind','{}').lte('day',addDays(today,31));
      for(const it of items||[]){const hm=it.all_day?'09:00':(it.t||'09:00');
        for(let d=-1;d<=31;d++){const day=addDays(today,d);if(!occurs(it,day))continue;const at=localToUtc(tz,day,hm);
          for(const o of it.remind||[]){const fire=at-o*6e4;if(now<fire||now>=fire+25*6e4)continue;const k=`${it.id}|${day}|${o}`;
            const {error}=await admin.from('ops_sent').insert({k,owner});if(error)continue;
            for(const s of ss){const st=await send(s,payload(s,it,o,hm));out.push({i:it.id.slice(0,8),day,o,st})}}}}}
    return J({owners:byOwner.size,results:out});
  }catch(e){return J({error:String(e)},500)}});
