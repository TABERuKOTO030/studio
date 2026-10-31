// ops-ingest：助手每日把 X 账号快照与帖子数据推入。头 x-ingest-secret；按 handle 匹配在设置里绑定了该账号的用户。
import { createClient } from 'npm:@supabase/supabase-js@2';
const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const J=(o:unknown,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});
const norm=(h:string)=>String(h||'').trim().replace(/^@/,'').toLowerCase();
const int=(v:any)=>v==null||v===''?null:Math.max(0,Math.round(Number(v)))||0;
const eq=(a:string,b:string)=>{if(a.length!==b.length)return false;let r=0;for(let i=0;i<a.length;i++)r|=a.charCodeAt(i)^b.charCodeAt(i);return r===0};
Deno.serve(async(req)=>{
  if(req.method!=='POST')return J({error:'POST only'},405);
  if(!eq(req.headers.get('x-ingest-secret')||'',Deno.env.get('OPS_INGEST_SECRET')||'\u0000'))return J({error:'forbidden'},403);
  try{const b=await req.json();const handle=norm(b.handle);if(!/^[a-z0-9_]{1,15}$/.test(handle))return J({error:'bad handle'},400);
    const {data:owners}=await admin.from('ops_settings').select('owner,data');const tg=(owners||[]).filter(o=>norm(o.data?.x_handle)===handle&&o.data?.x_ingest!==false).map(o=>o.owner);
    if(b.action==='delete'){const ids=(b.ids||[]).map(String);let n=0;for(const ow of tg){if(ids.length){const {count}=await admin.from('ops_x_posts').delete({count:'exact'}).eq('owner',ow).in('x_id',ids);n+=count||0}
        if(b.days?.length){const {count}=await admin.from('ops_x_snap').delete({count:'exact'}).eq('owner',ow).eq('handle',handle).in('day',b.days);n+=count||0}}return J({ok:true,owners:tg.length,deleted:n})}
    let snaps=0,posts=0;const s=b.snapshot;
    for(const ow of tg){
      if(s){const day=/^\d{4}-\d\d-\d\d$/.test(s.day||'')?s.day:new Date(Date.now()+9*36e5).toISOString().slice(0,10);
        const {error}=await admin.from('ops_x_snap').upsert({owner:ow,handle,day,followers:int(s.followers),following:int(s.following),posts:int(s.posts),listed:int(s.listed)},{onConflict:'owner,handle,day'});if(!error)snaps++}
      const {data:pp}=await admin.from('ops_posts').select('id,url').eq('owner',ow);
      const rows=(b.posts||[]).slice(0,500).filter((p:any)=>/^\d{1,25}$/.test(String(p.id))).map((p:any)=>{const text=String(p.text||'').slice(0,280);
        const ref=(pp||[]).find(x=>x.url&&text.includes(x.url.replace(/^https?:\/\//,'').slice(0,40)));
        return{owner:ow,handle,x_id:String(p.id),text,posted_at:p.created_at||null,likes:int(p.likes)||0,reposts:int(p.reposts)||0,replies:int(p.replies)||0,quotes:int(p.quotes)||0,views:int(p.views)||0,bookmarks:int(p.bookmarks)||0,
          is_promo:p.is_promo??/myfans|販売|発売|新作|セール|sale|t\.co\//i.test(text),post_ref:ref?.id||null,updated_at:new Date().toISOString()}});
      if(rows.length){const {error}=await admin.from('ops_x_posts').upsert(rows,{onConflict:'owner,x_id'});if(!error)posts+=rows.length;else return J({error:error.message},500)}}
    return J({ok:true,handle,owners:tg.length,snapshots:snaps,posts})}catch(e){return J({error:String(e)},400)}});
