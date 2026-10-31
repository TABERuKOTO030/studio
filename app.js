'use strict';
// 秘幕手帐 Veil —— 运营排期 / 投稿 / 数据
const C=window.OPS_CONFIG;const sb=supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY,{auth:{persistSession:true,storageKey:'veil-auth'}});
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>ymd(new Date());const pd=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};const addD=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+n);return ymd(d)};
const num=v=>{const n=Number(String(v??'').replace(/[,¥￥\s]/g,''));return isFinite(n)?n:0};
const S={user:null,view:'cal',calMode:'month',cur:today().slice(0,7),sel:today(),theme:localStorage.getItem('veil-theme')||'noir',
  items:[],posts:[],stats:[],ideas:[],contacts:[],expenses:[],mf:[],xs:[],xp:[],set:{},q:'',postFilter:'全部',sub:'dash'};
const DEF_TYPES=[{k:'shoot',n:'拍摄',c:'#E8A7BE'},{k:'edit',n:'剪辑',c:'#A9B8F0'},{k:'publish',n:'发布',c:'#F3D38B'},{k:'promo',n:'推广',c:'#9FD8C9'},{k:'settle',n:'结算',c:'#C9B2E8'},{k:'other',n:'其他',c:'#B9B5B8'}];
const STATUSES=['策划','拍摄','剪辑','已发布'];
const types=()=>S.set.types||DEF_TYPES;const typeOf=k=>types().find(t=>t.k===k)||types()[types().length-1];
const cur=()=>(S.set.currency||'JPY');const money=v=>{const n=Math.round(num(v));return(cur()==='JPY'?'¥':cur()==='CNY'?'￥':cur()+' ')+n.toLocaleString()};
const pct=v=>isFinite(v)?(v*100).toFixed(1)+'%':'—';
const toast=(m,err)=>{const t=document.createElement('div');t.className='toast'+(err?' err':'');t.textContent=m;$('#toasts').append(t);setTimeout(()=>t.remove(),2600)};
const ic=n=>`<svg class="ic"><use href="#i-${n}"/></svg>`;
document.body.insertAdjacentHTML('afterbegin',`<svg width="0" height="0" style="position:absolute"><defs>
<symbol id="i-cal" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
<symbol id="i-film" viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/></symbol>
<symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 19h16M7 16v-5M12 16V7M17 16v-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></symbol>
<symbol id="i-more" viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="18" cy="12" r="1.7" fill="currentColor"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-l" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></symbol>
<symbol id="i-r" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>
<symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
<symbol id="i-rep" viewBox="0 0 24 24"><path d="M5 12a7 7 0 0 1 12-5l2 2M19 12a7 7 0 0 1-12 5l-2-2M19 4v5h-5M5 20v-5h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
<symbol id="star" viewBox="0 0 24 24"><path d="M12 0C12.6 8 16 11.4 24 12C16 12.6 12.6 16 12 24C11.4 16 8 12.6 0 12C8 11.4 11.4 8 12 0Z" fill="currentColor"/></symbol>
<symbol id="heart" viewBox="0 0 24 22"><path d="M12 21C4 15 0 11 0 6.5 0 3 2.7 0 6.2 0 8.6 0 10.8 1.3 12 3.4 13.2 1.3 15.4 0 17.8 0 21.3 0 24 3 24 6.5 24 11 20 15 12 21Z" fill="currentColor"/></symbol>
<symbol id="bow" viewBox="0 0 60 40"><path d="M30 16C22 4 6-2 4 8s6 18 26 10c-4 6-10 16-14 22l6 0 8-16 8 16 6 0c-4-6-10-16-14-22 20 8 28 0 26-10S38 4 30 16Z" fill="currentColor"/><circle cx="30" cy="17" r="4" fill="currentColor"/></symbol>
<symbol id="thorn" viewBox="0 0 240 40"><path d="M4 22C40 6 80 34 120 20S200 6 236 20" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M30 17l-6-10M54 22l4-11M82 26l-8-9M108 21l6-11M134 18l-5-11M160 14l7-9M188 15l-4 11M214 18l8-8M44 20l-10 3M96 24l-11 4M150 16l-10-5M200 15l9 5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M120 20c-6-12 4-18 0-20 9 6 6 14 0 20z" fill="currentColor" opacity=".85"/></symbol>
</defs></svg>`);
const deco=k=>S.theme==='noir'?{star:`<svg class="dk-star ${k||''}"><use href="#star"/></svg>`,orn:`<svg class="dk-thorn" viewBox="0 0 240 40"><use href="#thorn"/></svg>`}[k==='orn'?'orn':'star']
  :{star:`<svg class="dk-heart ${k||''}" viewBox="0 0 24 22"><use href="#heart"/></svg>`,orn:`<svg class="dk-bow" viewBox="0 0 60 40"><use href="#bow"/></svg>`}[k==='orn'?'orn':'star'];
// ---------- 数据层 ----------
const TB={items:'ops_items',posts:'ops_posts',stats:'ops_stats',ideas:'ops_ideas',contacts:'ops_contacts',expenses:'ops_expenses',mf:'ops_mf_snap',xs:'ops_x_snap',xp:'ops_x_posts'};
async function loadAll(){const r=await Promise.all(Object.entries(TB).map(([k,t])=>sb.from(t).select('*').limit(5000).then(x=>{if(x.error)throw x.error;S[k]=x.data})));
  const {data}=await sb.from('ops_settings').select('data').maybeSingle();S.set=data?.data||{};
  if(!data){S.set={x_handle:'awa_O3O',currency:'JPY',remind_default:[30],checklist_tpl:['确认拍摄场地与道具','备份原始素材','打码 / 审核检查','封面与标题','定价与发售时间','X 预告文案']};await saveSet()}}
async function saveSet(){S.set.updated=Date.now();const {error}=await sb.from('ops_settings').upsert({owner:S.user.id,data:S.set,updated_at:new Date().toISOString()});if(error)toast(error.message,1)}
async function save(k,row){const t=TB[k];const isNew=!row.id;let q;const r={...row};delete r.owner;delete r.created_at;
  if('updated_at' in r||['items','posts','xp'].includes(k))r.updated_at=new Date().toISOString();
  q=isNew?sb.from(t).insert(r).select().single():sb.from(t).update(r).eq('id',row.id).select().single();
  const {data,error}=await q;if(error){toast(T('保存失败')+'：'+error.message,1);throw error}
  const i=S[k].findIndex(x=>x.id===data.id);if(i>=0)S[k][i]=data;else S[k].push(data);return data}
async function del(k,id){const {error}=await sb.from(TB[k]).delete().eq('id',id);if(error){toast(error.message,1);throw error}S[k]=S[k].filter(x=>x.id!==id)}

// ---------- 主题 / 语言 ----------
function applyTheme(){document.documentElement.className='t-'+S.theme;const m=$('meta[name=theme-color]');if(m)m.content=S.theme==='noir'?'#0B0A0D':'#CFD9E3'}
const brand=(sub)=>S.theme==='noir'?`<header class="brand b-noir">${deco('s1')}${deco('s2')}${deco('s3')}<div class="wm">Veil</div>${deco('orn')}<p class="bt">${T('秘幕手帐')}</p>${sub?`<p class="bs">${esc(sub)}</p>`:''}</header>`
  :`<header class="brand b-mist"><div class="bows">${deco('orn')}<div class="wm">Veil</div>${deco('orn')}</div><p class="bt">${T('秘幕手帐')}</p><p class="cap">Display only ｜ スケジュールと記録</p>${sub?`<p class="bs">${esc(sub)}</p>`:''}</header>`;

// ---------- 登录 ----------
function authView(mode='in'){$('#app').innerHTML=`<div class="auth">${themeSw()}${brand(T('运营排期 · 投稿记录 · 数据'))}
  <form class="card auth-card" id="af"><div class="seg"><button type="button" data-m="in" class="${mode==='in'?'on':''}">${T('登录')}</button><button type="button" data-m="up" class="${mode==='up'?'on':''}">${T('注册')}</button></div>
  <label class="fld"><span>${T('邮箱')}</span><input name="email" type="email" autocomplete="email" required></label>
  <label class="fld"><span>${T('密码')}</span><input name="pw" type="password" minlength="8" autocomplete="${mode==='in'?'current-password':'new-password'}" required></label>
  <button class="btn big">${mode==='in'?T('进入'):T('创建账号')}</button><p class="hint">${T('数据仅你本人可见（行级权限隔离）。可在设置里开启本机密码锁。')}</p></form></div>`;
  $$('.seg button').forEach(b=>b.onclick=()=>authView(b.dataset.m));bindThemeSw();
  $('#af').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const email=f.get('email').trim(),password=f.get('pw');
    const r=mode==='in'?await sb.auth.signInWithPassword({email,password}):await sb.auth.signUp({email,password});
    if(r.error)return toast(r.error.message,1);if(!r.data.session)return toast(T('请查收确认邮件后登录'));boot()}}
const themeSw=()=>`<div class="tsw">${[['noir',T('绯夜')],['mist',T('雾蓝')]].map(([k,n])=>`<button data-th="${k}" class="${S.theme===k?'on':''}"><i class="sw sw-${k}"></i>${n}</button>`).join('')}<button data-lang class="lang">${LANG==='ja'?'中文':'日本語'}</button></div>`;
function bindThemeSw(){$$('[data-th]').forEach(b=>b.onclick=()=>{S.theme=b.dataset.th;localStorage.setItem('veil-theme',S.theme);applyTheme();S.user?render():authView()});
  $$('[data-lang]').forEach(b=>b.onclick=()=>{setLang(LANG==='ja'?'zh':'ja');S.user?render():authView()})}

// ---------- 本机密码锁 ----------
const LK='veil-lock';
async function hashPin(pin,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
  const b=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:150000,hash:'SHA-256'},k,256);return btoa(String.fromCharCode(...new Uint8Array(b)))}
const lockCfg=()=>{try{return JSON.parse(localStorage.getItem(LK)||'null')}catch{return null}};
function showLock(){const c=lockCfg();if(!c)return Promise.resolve();return new Promise(res=>{const L=$('#lock');L.className='on';let v='';
  const draw=(msg)=>{L.innerHTML=`<div class="lockbox">${brand()}<p class="lk-t">${msg||T('输入密码解锁')}</p><div class="dots">${[...Array(c.len)].map((_,i)=>`<i class="${i<v.length?'on':''}"></i>`).join('')}</div>
    <div class="pad">${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k=>`<button data-k="${k}" ${k===''?'disabled':''}>${k}</button>`).join('')}</div><button class="link" id="lkout">${T('忘记密码：退出登录')}</button></div>`;
    $$('[data-k]',L).forEach(b=>b.onclick=async()=>{const k=b.dataset.k;if(k==='⌫')v=v.slice(0,-1);else if(v.length<c.len)v+=k;draw();
      if(v.length===c.len){if(await hashPin(v,c.salt)===c.h){L.className='';L.innerHTML='';res()}else{v='';draw(T('密码不对，再试一次'))}}});
    $('#lkout',L).onclick=async()=>{localStorage.removeItem(LK);await sb.auth.signOut();location.reload()}};draw()})}
let hiddenAt=0;document.addEventListener('visibilitychange',()=>{if(document.hidden){hiddenAt=Date.now();document.body.classList.add('veiled')}else{document.body.classList.remove('veiled');
  const c=lockCfg();if(c&&S.user&&Date.now()-hiddenAt>(c.after??60)*1000)showLock()}});
// ---------- 外壳 ----------
const TABS=[['cal','cal','日程'],['posts','film','投稿'],['data','chart','数据'],['more','more','更多']];
function render(){applyTheme();const v=S.view;
  $('#app').innerHTML=`<div class="shell v-${v}"><main id="main">${({cal:calView,posts:postsView,data:dataView,more:moreView})[v]()}</main>
  <nav class="tabs">${TABS.map(([k,i,n])=>`<button data-tab="${k}" class="${v===k?'on':''}">${ic(i)}<span>${T(n)}</span></button>`).join('')}</nav></div>`;
  $$('[data-tab]').forEach(b=>b.onclick=()=>{S.view=b.dataset.tab;location.hash=S.view;render();$('#main').scrollTop=0});bindThemeSw();
  ({cal:bindCal,posts:bindPosts,data:bindData,more:bindMore})[v]()}
function sheet(html,onMount){const R=$('#sheet');R.innerHTML=`<div class="scrim"></div><div class="sh">${html}</div>`;R.className='on';
  const close=()=>{R.className='';R.innerHTML=''};$('.scrim',R).onclick=close;$$('[data-close]',R).forEach(b=>b.onclick=close);onMount&&onMount($('.sh',R),close);return close}
const shHead=(t,sub)=>`<div class="sh-hd"><div><h3>${esc(t)}</h3>${sub?`<p>${esc(sub)}</p>`:''}</div><button class="ib" data-close aria-label="${T('关闭')}">${ic('x')}</button></div>`;
function confirmBox(msg,btns){return new Promise(res=>{sheet(`${shHead(msg)}<div class="row-btns">${btns.map((b,i)=>`<button class="btn ${b[1]||''}" data-i="${i}">${esc(b[0])}</button>`).join('')}</div>`,(el,close)=>{
  $$('[data-i]',el).forEach(b=>b.onclick=()=>{close();res(+b.dataset.i)});$('.scrim').onclick=()=>{close();res(-1)}})})}

// ---------- 日历 ----------
function occursOn(it,day){if(day<it.day)return false;if(it.until&&day>it.until)return false;if((it.exdates||[]).includes(day))return false;const r=it.rrule||'';if(!r)return day===it.day;
  const diff=Math.round((pd(day)-pd(it.day))/864e5);if(r==='daily')return true;if(r==='weekly')return diff%7===0;if(r==='biweekly')return diff%14===0;if(r==='monthly')return day.slice(8)===it.day.slice(8);if(r==='yearly')return day.slice(5)===it.day.slice(5);return false}
function eventsOn(day){const ev=S.items.filter(it=>occursOn(it,day)).map(it=>({kind:'item',it,day,t:it.all_day?'':it.t||'',title:it.title,type:it.type,done:it.done}));
  S.posts.filter(p=>p.sale_date===day).forEach(p=>{if(!ev.some(e=>e.it&&e.it.post_id===p.id&&e.type==='publish'))ev.push({kind:'sale',p,day,t:'',title:T('开售')+' · '+p.title,type:'publish'})});
  return ev.sort((a,b)=>(a.t||'00').localeCompare(b.t||'00'))}
const WD=()=>LANG==='ja'?['日','月','火','水','木','金','土']:['日','一','二','三','四','五','六'];
const chip=(e,i)=>{const ty=typeOf(e.type);return`<span class="chip ${e.done?'done':''}" style="--c:${ty.c}" data-ev="${e.kind==='item'?e.it.id:'p:'+e.p.id}" data-day="${e.day}">${esc(e.title||T('（无标题）'))}</span>`};
function calView(){const [y,m]=S.cur.split('-').map(Number);const first=new Date(y,m-1,1);const start=new Date(first);start.setDate(1-first.getDay());
  const mode=S.calMode;let body='';
  if(mode==='month'){let cells='';for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const ds=ymd(d);const ev=eventsOn(ds);const out=d.getMonth()!==m-1;
      if(i===35&&out)break;cells+=`<div class="cell ${out?'out':''} ${ds===today()?'today':''} ${ds===S.sel?'sel':''}" data-d="${ds}"><b>${d.getDate()}</b><div class="cchips">${ev.slice(0,3).map(chip).join('')}${ev.length>3?`<em>+${ev.length-3}</em>`:''}</div></div>`}
    body=`<div class="wk">${WD().map(w=>`<span>${w}</span>`).join('')}</div><div class="grid" id="grid">${cells}</div>${dayPanel(S.sel)}`}
  else if(mode==='week'){const s=addD(S.sel,-pd(S.sel).getDay());body=`<div class="weekl">${[...Array(7)].map((_,i)=>{const d=addD(s,i);return dayBlock(d)}).join('')}</div>`}
  else{const ds=[...Array(45)].map((_,i)=>addD(today(),i)).filter(d=>eventsOn(d).length);body=`<div class="agenda">${ds.length?ds.map(dayBlock).join(''):`<p class="empty">${T('接下来 45 天没有安排')}</p>`}</div>`}
  const title=mode==='month'?(LANG==='ja'?`${y}年${m}月`:`${y} 年 ${m} 月`):mode==='week'?T('本周 · ')+S.sel.slice(5):T('近期安排');
  return`${S.theme==='noir'?`<div class="topdeco">${deco('orn')}</div>`:''}<div class="calhd"><button class="ib" id="prev">${ic('l')}</button><h2 class="calt">${title}</h2><button class="ib" id="next">${ic('r')}</button><button class="ib" id="srch" aria-label="${T('搜索')}">${ic('search')}</button></div>
   <div class="seg mini" id="cm">${[['month','月'],['week','周'],['agenda','列表']].map(([k,n])=>`<button data-cm="${k}" class="${mode===k?'on':''}">${T(n)}</button>`).join('')}</div>
   <div class="legend">${types().map(t=>`<span style="--c:${t.c}">${esc(T(t.n))}</span>`).join('')}</div>${body}
   <button class="fab" id="add" aria-label="${T('新建日程')}">${ic('plus')}</button>`}
const dayLabel=d=>{const x=pd(d);return LANG==='ja'?`${x.getMonth()+1}月${x.getDate()}日（${WD()[x.getDay()]}）`:`${x.getMonth()+1} 月 ${x.getDate()} 日 · 周${WD()[x.getDay()]}`};
const evRow=e=>{const ty=typeOf(e.type);const it=e.it;const ck=it&&it.checklist?.length?`<i class="ck">${it.checklist.filter(c=>c.d).length}/${it.checklist.length}</i>`:'';
  return`<button class="evr ${e.done?'done':''}" data-ev="${e.kind==='item'?it.id:'p:'+e.p.id}" data-day="${e.day}"><i class="bar" style="background:${ty.c}"></i><span class="et">${e.t||T('全天')}</span><span class="en"><b>${esc(e.title||T('（无标题）'))}</b><small>${esc(T(ty.n))}${it&&it.rrule?' · '+ic('rep'):''}${it&&it.remind_on&&it.remind?.length?' · '+ic('bell'):''}</small></span>${ck}</button>`};
const dayPanel=d=>`<section class="daypanel card"><div class="dp-hd"><h3>${dayLabel(d)}</h3><button class="btn sm" data-addday="${d}">${ic('plus')}${T('添加')}</button></div>${eventsOn(d).map(evRow).join('')||`<p class="empty">${T('这天还空着')} ${deco('s')}</p>`}</section>`;
const dayBlock=d=>`<section class="dblock card ${d===today()?'today':''}"><div class="dp-hd"><h3>${dayLabel(d)}</h3><button class="ib sm" data-addday="${d}">${ic('plus')}</button></div>${eventsOn(d).map(evRow).join('')||`<p class="empty sm">—</p>`}</section>`;
function bindCal(){const mv=n=>{if(S.calMode==='month'){const [y,m]=S.cur.split('-').map(Number);const d=new Date(y,m-1+n,1);S.cur=ymd(d).slice(0,7);S.sel=S.cur===today().slice(0,7)?today():S.cur+'-01'}else{S.sel=addD(S.sel,7*n);S.cur=S.sel.slice(0,7)}render()};
  $('#prev').onclick=()=>mv(-1);$('#next').onclick=()=>mv(1);$('#srch').onclick=searchSheet;
  $$('[data-cm]').forEach(b=>b.onclick=()=>{S.calMode=b.dataset.cm;render()});
  $$('.cell').forEach(c=>c.onclick=e=>{if(drag.moved)return;S.sel=c.dataset.d;render()});
  $$('[data-addday]').forEach(b=>b.onclick=e=>{e.stopPropagation();itemEditor({day:b.dataset.addday})});$('#add').onclick=()=>itemEditor({day:S.sel});
  $$('.evr').forEach(b=>b.onclick=()=>openEv(b.dataset.ev,b.dataset.day));
  $$('.grid .chip').forEach(c=>c.addEventListener('pointerdown',dragStart))}
function openEv(id,day){if(id.startsWith('p:'))return postDetail(id.slice(2));const it=S.items.find(x=>x.id===id);if(it)itemEditor(it,day)}
// 长按拖动改期
const drag={};
function dragStart(e){const el=e.currentTarget;drag.moved=false;const id=el.dataset.ev,from=el.dataset.day;const sx=e.clientX,sy=e.clientY;let ghost=null,over=null;
  const timer=setTimeout(()=>{ghost=el.cloneNode(true);ghost.className='chip ghost';ghost.style.cssText+=`;position:fixed;left:${sx-30}px;top:${sy-12}px;z-index:99;pointer-events:none`;document.body.append(ghost);navigator.vibrate&&navigator.vibrate(15);$('#grid').classList.add('dragging')},280);
  const mvh=ev=>{if(!ghost){if(Math.abs(ev.clientX-sx)+Math.abs(ev.clientY-sy)>8)clearTimeout(timer);return}ev.preventDefault();drag.moved=true;ghost.style.left=ev.clientX-30+'px';ghost.style.top=ev.clientY-12+'px';
    const c=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('.cell');$$('.cell.over').forEach(x=>x.classList.remove('over'));if(c){c.classList.add('over');over=c.dataset.d}};
  const up=async()=>{clearTimeout(timer);removeEventListener('pointermove',mvh);removeEventListener('pointerup',up);if(!ghost)return;ghost.remove();$('#grid')?.classList.remove('dragging');
    setTimeout(()=>drag.moved=false,50);if(over&&over!==from)await reschedule(id,from,over)};
  addEventListener('pointermove',mvh,{passive:false});addEventListener('pointerup',up)}
async function reschedule(id,from,to){if(id.startsWith('p:')){const p=S.posts.find(x=>x.id===id.slice(2));await save('posts',{id:p.id,sale_date:to});}
  else{const it=S.items.find(x=>x.id===id);if(it.rrule){const ch=await confirmBox(T('这是重复日程'),[[T('只改这一次')],[T('整个系列一起挪')],[T('取消'),'ghost']]);if(ch<0||ch===2)return;
      if(ch===0){await save('items',{id:it.id,exdates:[...(it.exdates||[]),from]});const c={...it};delete c.id;await save('items',{...c,day:to,rrule:'',until:null,exdates:[]})}
      else{const diff=Math.round((pd(to)-pd(from))/864e5);await save('items',{id:it.id,day:addD(it.day,diff)})}}
    else await save('items',{id:it.id,day:to})}
  toast(T('已改到 ')+to.slice(5));S.sel=to;render()}
const OFFS=[[0,'准时'],[15,'15 分钟前'],[30,'30 分钟前'],[60,'1 小时前'],[180,'3 小时前'],[1440,'1 天前'],[2880,'2 天前'],[10080,'1 周前']];
const REP=[['','不重复'],['daily','每天'],['weekly','每周'],['biweekly','每两周'],['monthly','每月'],['yearly','每年']];
function itemEditor(src,occDay){const isNew=!src.id;const it={title:'',type:'shoot',day:S.sel,t:'',dur:60,all_day:true,rrule:'',until:null,notes:'',checklist:[],remind:[...(S.set.remind_default||[30])],remind_on:true,done:false,post_id:null,...src};
  let ck=JSON.parse(JSON.stringify(it.checklist||[]));
  const html=`${shHead(isNew?T('新建日程'):T('编辑日程'),occDay&&it.rrule?T('重复系列 · 本次 ')+occDay:'')}
  <form id="itf" class="form">
   <label class="fld"><span>${T('标题')}</span><input name="title" value="${esc(it.title)}" placeholder="${T('例如：棚拍 · 新作 #12')}" required></label>
   <div class="fld"><span>${T('类型')}</span><div class="pick" id="tp">${types().map(t=>`<button type="button" data-v="${t.k}" style="--c:${t.c}" class="${it.type===t.k?'on':''}">${esc(T(t.n))}</button>`).join('')}</div></div>
   <div class="two"><label class="fld"><span>${T('日期')}</span><input name="day" type="date" value="${it.day}" required></label>
    <label class="fld"><span>${T('时间')}</span><input name="t" type="time" value="${esc(it.t||'')}" ${it.all_day?'disabled':''}></label></div>
   <label class="tgl"><input type="checkbox" name="all_day" ${it.all_day?'checked':''}><i></i>${T('全天')}</label>
   <div class="two"><label class="fld"><span>${T('重复')}</span><select name="rrule">${REP.map(([k,n])=>`<option value="${k}" ${it.rrule===k?'selected':''}>${T(n)}</option>`).join('')}</select></label>
    <label class="fld"><span>${T('重复截止')}</span><input name="until" type="date" value="${it.until||''}"></label></div>
   <div class="fld"><span>${T('提醒')} <label class="tgl inl"><input type="checkbox" name="remind_on" ${it.remind_on?'checked':''}><i></i></label></span><div class="pick sm" id="rm">${OFFS.map(([o,n])=>`<button type="button" data-v="${o}" class="${it.remind.includes(o)?'on':''}">${T(n)}</button>`).join('')}</div></div>
   <label class="fld"><span>${T('关联投稿')}</span><select name="post_id"><option value="">—</option>${S.posts.map(p=>`<option value="${p.id}" ${it.post_id===p.id?'selected':''}>${esc(p.title)}</option>`).join('')}</select></label>
   <label class="fld"><span>${T('备注')}</span><textarea name="notes" rows="3">${esc(it.notes||'')}</textarea></label>
   <div class="fld"><span>${T('清单')} <button type="button" class="link" id="tpl">${T('套用模板')}</button></span><div id="cks"></div>
    <div class="addck"><input id="ckn" placeholder="${T('添加清单项…')}"><button type="button" class="ib" id="cka">${ic('plus')}</button></div></div>
   <label class="tgl"><input type="checkbox" name="done" ${it.done?'checked':''}><i></i>${T('已完成')}</label>
   <div class="row-btns">${isNew?'':`<button type="button" class="btn ghost danger" id="itdel">${T('删除')}</button>`}<button class="btn">${T('保存')}</button></div></form>`;
  sheet(html,(el,close)=>{const f=$('#itf',el);
    const drawCk=()=>{$('#cks',el).innerHTML=ck.map((c,i)=>`<div class="ckr"><label><input type="checkbox" data-ci="${i}" ${c.d?'checked':''}><span>${esc(c.t)}</span></label><button type="button" class="ib sm" data-cx="${i}">${ic('x')}</button></div>`).join('');
      $$('[data-ci]',el).forEach(x=>x.onchange=()=>ck[x.dataset.ci].d=x.checked);$$('[data-cx]',el).forEach(x=>x.onclick=()=>{ck.splice(x.dataset.cx,1);drawCk()})};drawCk();
    const addck=()=>{const v=$('#ckn',el).value.trim();if(v){ck.push({t:v,d:false});$('#ckn',el).value='';drawCk()}};$('#cka',el).onclick=addck;$('#ckn',el).onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();addck()}};
    $('#tpl',el).onclick=()=>{(S.set.checklist_tpl||[]).forEach(t=>{if(!ck.some(c=>c.t===t))ck.push({t,d:false})});drawCk()};
    $$('#tp button',el).forEach(b=>b.onclick=()=>{$$('#tp button',el).forEach(x=>x.classList.remove('on'));b.classList.add('on')});
    $$('#rm button',el).forEach(b=>b.onclick=()=>b.classList.toggle('on'));
    f.all_day.onchange=()=>{f.t.disabled=f.all_day.checked;if(!f.all_day.checked&&!f.t.value)f.t.value='10:00'};
    if(!isNew)$('#itdel',el).onclick=async()=>{let ch=1;if(it.rrule&&occDay){ch=await confirmBox(T('删除重复日程'),[[T('只删这一次')],[T('删除整个系列'),'danger'],[T('取消'),'ghost']]);if(ch<0||ch===2)return}
      else{ch=await confirmBox(T('确定删除这条日程？'),[[T('删除'),'danger'],[T('取消'),'ghost']]);if(ch!==0)return;ch=1}
      if(ch===0)await save('items',{id:it.id,exdates:[...(it.exdates||[]),occDay]});else await del('items',it.id);close();toast(T('已删除'));render()};
    f.onsubmit=async e=>{e.preventDefault();const row={title:f.title.value.trim(),type:$('#tp .on',el)?.dataset.v||'other',day:f.day.value,all_day:f.all_day.checked,t:f.all_day.checked?null:f.t.value||null,
      rrule:f.rrule.value,until:f.until.value||null,remind:$$('#rm .on',el).map(b=>+b.dataset.v),remind_on:f.remind_on.checked,post_id:f.post_id.value||null,notes:f.notes.value,checklist:ck,done:f.done.checked};
      if(!isNew)row.id=it.id;await save('items',row);close();S.sel=row.day;S.cur=row.day.slice(0,7);toast(T('已保存'));render()}})}
function searchSheet(){sheet(`${shHead(T('搜索'))}<div class="search"><input id="sq" placeholder="${T('日程、投稿、选题、合作对象…')}" autofocus></div><div id="sr"></div>`,(el,close)=>{
  const run=()=>{const q=$('#sq',el).value.trim().toLowerCase();if(!q)return $('#sr',el).innerHTML='';const hit=o=>Object.values(o).some(v=>typeof v==='string'&&v.toLowerCase().includes(q)||Array.isArray(v)&&v.join(' ').toLowerCase().includes(q));
    const r=[...S.items.filter(hit).map(x=>[T('日程'),x.title,x.day,'i:'+x.id]),...S.posts.filter(hit).map(x=>[T('投稿'),x.title,x.sale_date||'','p:'+x.id]),...S.ideas.filter(hit).map(x=>[T('选题'),x.title,'','d:'+x.id]),...S.contacts.filter(hit).map(x=>[T('合作'),x.name,x.role||'','c:'+x.id])];
    $('#sr',el).innerHTML=r.slice(0,60).map(([k,t,s,id])=>`<button class="lrow" data-h="${id}"><i class="pill">${k}</i><b>${esc(t)}</b><small>${esc(s)}</small></button>`).join('')||`<p class="empty">${T('没有找到')}</p>`;
    $$('[data-h]',el).forEach(b=>b.onclick=()=>{close();const [k,id]=b.dataset.h.split(':');if(k==='i')itemEditor(S.items.find(x=>x.id===id));else if(k==='p')postDetail(id);else if(k==='d')ideaEditor(S.ideas.find(x=>x.id===id));else contactEditor(S.contacts.find(x=>x.id===id))})};
  $('#sq',el).oninput=run;$('#sq',el).focus()})}
// ---------- 投稿 ----------
const statsOf=pid=>S.stats.filter(s=>s.post_id===pid).sort((a,b)=>a.day.localeCompare(b.day)||a.created_at.localeCompare(b.created_at));
function metrics(p){const st=statsOf(p.id);const l=st[st.length-1]||{};const sales=num(l.sales);const fee=num(S.set.fee_pct)/100;
  const gross=l.revenue!=null&&l.revenue!==''?num(l.revenue):sales*num(p.price);const rev=gross*(1-fee);
  const exp=S.expenses.filter(e=>e.post_id===p.id).reduce((a,e)=>a+num(e.amount),0);const cost=num(p.budget)+exp;const profit=rev-cost;
  return{st,l,sales,views:num(l.views),likes:num(l.likes),rev,gross,cost,exp,profit,roi:cost>0?profit/cost:NaN,conv:num(l.views)?sales/num(l.views):NaN}}
const stBadge=s=>`<i class="st st-${STATUSES.indexOf(s)}">${esc(T(s))}</i>`;
function postsView(){const f=S.postFilter;const ps=S.posts.filter(p=>f==='全部'||p.status===f).sort((a,b)=>(b.sale_date||'9').localeCompare(a.sale_date||'9'));
  return`${S.theme==='mist'?`<div class="pagehd"><span class="cap">〈 ポスト 〉</span><h2 class="script">Posts</h2><p class="sp">${T('投稿记录')}</p></div>`:`<div class="pagehd"><h2 class="bl">Posts</h2>${deco('orn')}<p class="sp">${T('投稿记录')}</p></div>`}
  <div class="filters">${['全部',...STATUSES].map(s=>`<button data-pf="${s}" class="${f===s?'on':''}">${T(s)} <i>${s==='全部'?S.posts.length:S.posts.filter(p=>p.status===s).length}</i></button>`).join('')}</div>
  <div class="plist">${ps.map(p=>{const m=metrics(p);return`<button class="pcard card" data-p="${p.id}">${p.cover?`<img class="cov" src="${esc(p.cover)}" alt="">`:`<div class="cov ph">${deco('s')}</div>`}
   <div class="pc-b"><div class="pc-t"><b>${esc(p.title||T('（无标题）'))}</b>${stBadge(p.status)}</div><small>${esc(p.platform||'')} · ${p.sale_date?T('开售 ')+p.sale_date:T('未定档')}${p.theme?' · '+esc(p.theme):''}</small>
   <div class="pc-m"><span><em>${T('收入')}</em>${money(m.rev)}</span><span><em>ROI</em>${pct(m.roi)}</span><span><em>${T('销量')}</em>${m.sales}</span></div></div></button>`}).join('')||`<div class="empty card">${deco('orn')}<p>${T('还没有投稿记录，点右下角新建')}</p></div>`}</div>
  <button class="fab" id="padd" aria-label="${T('新建投稿')}">${ic('plus')}</button>`}
function bindPosts(){$$('[data-pf]').forEach(b=>b.onclick=()=>{S.postFilter=b.dataset.pf;render()});$$('[data-p]').forEach(b=>b.onclick=()=>postDetail(b.dataset.p));$('#padd').onclick=()=>postEditor({})}
async function shrink(file){const img=await createImageBitmap(file);const s=Math.min(1,360/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=img.width*s;c.height=img.height*s;c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.78)}
function postEditor(src){const isNew=!src.id;const p={title:'',url:'',sale_date:'',theme:'',selling:'',budget:0,price:0,platform:'myfans',status:'策划',tags:[],cover:'',notes:'',...src};let cover=p.cover;
  sheet(`${shHead(isNew?T('新建投稿'):T('编辑投稿'))}<form id="pf" class="form">
  <label class="fld"><span>${T('标题')}</span><input name="title" value="${esc(p.title)}" required></label>
  <label class="fld"><span>${T('视频链接')}</span><input name="url" type="url" value="${esc(p.url||'')}" placeholder="https://myfans.jp/posts/…"></label>
  <div class="two"><label class="fld"><span>${T('出售日期')}</span><input name="sale_date" type="date" value="${p.sale_date||''}"></label>
   <label class="fld"><span>${T('平台')}</span><select name="platform">${['myfans','Fantia','FANZA','Candfans','X','其他'].map(x=>`<option ${p.platform===x?'selected':''}>${x}</option>`).join('')}</select></label></div>
  <div class="fld"><span>${T('状态')}</span><div class="pick" id="ps">${STATUSES.map(s=>`<button type="button" data-v="${s}" class="${p.status===s?'on':''}">${T(s)}</button>`).join('')}</div></div>
  <label class="fld"><span>${T('主题')}</span><input name="theme" value="${esc(p.theme||'')}" placeholder="${T('例如：制服 / 旅行 / 角色扮演')}"></label>
  <label class="fld"><span>${T('卖点')}</span><textarea name="selling" rows="2" placeholder="${T('用 、 或 , 分隔多个卖点')}">${esc(p.selling||'')}</textarea></label>
  <div class="two"><label class="fld"><span>${T('预算（成本）')}</span><input name="budget" inputmode="decimal" value="${p.budget??0}"></label><label class="fld"><span>${T('售价')}</span><input name="price" inputmode="decimal" value="${p.price??0}"></label></div>
  <label class="fld"><span>${T('标签')}</span><input name="tags" value="${esc((p.tags||[]).join(', '))}" placeholder="${T('逗号分隔')}"></label>
  <div class="fld"><span>${T('封面缩略图（可选，仅存缩小图）')}</span><div class="covrow"><div class="covp" id="cvp">${cover?`<img src="${cover}">`:''}</div><label class="btn ghost sm">${T('选择图片')}<input type="file" accept="image/*" id="cvf" hidden></label>${cover?`<button type="button" class="link" id="cvx">${T('移除')}</button>`:''}</div></div>
  <label class="fld"><span>${T('备注')}</span><textarea name="notes" rows="2">${esc(p.notes||'')}</textarea></label>
  ${isNew?`<label class="tgl"><input type="checkbox" name="mkcal" checked><i></i>${T('在日历上同时创建「发布」日程（带提醒）')}</label>`:''}
  <div class="row-btns">${isNew?'':`<button type="button" class="btn ghost danger" id="pdel">${T('删除')}</button>`}<button class="btn">${T('保存')}</button></div></form>`,(el,close)=>{const f=$('#pf',el);
    $$('#ps button',el).forEach(b=>b.onclick=()=>{$$('#ps button',el).forEach(x=>x.classList.remove('on'));b.classList.add('on')});
    $('#cvf',el).onchange=async e=>{const fl=e.target.files[0];if(!fl)return;cover=await shrink(fl);$('#cvp',el).innerHTML=`<img src="${cover}">`};if($('#cvx',el))$('#cvx',el).onclick=()=>{cover='';$('#cvp',el).innerHTML=''};
    if(!isNew)$('#pdel',el).onclick=async()=>{if(await confirmBox(T('删除投稿及其全部数据记录？'),[[T('删除'),'danger'],[T('取消'),'ghost']])!==0)return;await del('posts',p.id);S.stats=S.stats.filter(s=>s.post_id!==p.id);close();toast(T('已删除'));render()};
    f.onsubmit=async e=>{e.preventDefault();const row={title:f.title.value.trim(),url:f.url.value.trim(),sale_date:f.sale_date.value||null,platform:f.platform.value,status:$('#ps .on',el)?.dataset.v||'策划',theme:f.theme.value.trim(),
      selling:f.selling.value.trim(),budget:num(f.budget.value),price:num(f.price.value),tags:f.tags.value.split(/[,，、]/).map(x=>x.trim()).filter(Boolean),cover,notes:f.notes.value};if(!isNew)row.id=p.id;
      const r=await save('posts',row);if(isNew&&f.mkcal?.checked&&row.sale_date)await save('items',{title:T('发布 · ')+row.title,type:'publish',day:row.sale_date,all_day:true,remind:[1440,0],remind_on:true,post_id:r.id,checklist:(S.set.checklist_tpl||[]).map(t=>({t,d:false}))});
      close();toast(T('已保存'));isNew?postDetail(r.id):postDetail(p.id)}})}
function lineChart(series,{h=150,fmt=v=>v,labels=[]}={}){const all=series.flatMap(s=>s.v);if(all.length<1)return`<p class="empty sm">${T('数据不足，至少记录两次后显示趋势')}</p>`;
  const W=320,P=26;const max=Math.max(...all,1),min=Math.min(0,...all);const n=Math.max(...series.map(s=>s.v.length));const X=i=>P+(n<=1?0:i*(W-P-8)/(n-1)),Y=v=>h-18-(v-min)/(max-min||1)*(h-34);
  return`<svg class="chart" viewBox="0 0 ${W} ${h}">${[0,.5,1].map(t=>`<line x1="${P}" x2="${W-8}" y1="${Y(min+t*(max-min))}" y2="${Y(min+t*(max-min))}" class="gl"/><text x="2" y="${Y(min+t*(max-min))+3}" class="ax">${fmt(Math.round(min+t*(max-min)))}</text>`).join('')}
   ${series.map((s,k)=>`<polyline class="ln l${k}" points="${s.v.map((v,i)=>X(i)+','+Y(v)).join(' ')}"/>${s.v.map((v,i)=>`<circle class="pt l${k}" cx="${X(i)}" cy="${Y(v)}" r="2.6"/>`).join('')}`).join('')}
   ${labels.length?[0,labels.length-1].map(i=>`<text x="${X(i)}" y="${h-3}" class="ax" text-anchor="${i?'end':'start'}">${esc(labels[i])}</text>`).join(''):''}</svg>${series.length>1?`<div class="lg">${series.map((s,k)=>`<span class="l${k}">${esc(s.n)}</span>`).join('')}</div>`:''}`}
function barList(rows,fmt=money){const max=Math.max(...rows.map(r=>Math.abs(r[1])),1);return rows.length?`<div class="bars">${rows.map(([n,v,sub])=>`<div class="br"><span class="bn">${esc(n)}</span><span class="bb"><i style="width:${Math.max(2,Math.abs(v)/max*100)}%" class="${v<0?'neg':''}"></i></span><b>${fmt(v)}</b>${sub?`<small>${esc(sub)}</small>`:''}</div>`).join('')}</div>`:`<p class="empty sm">${T('暂无数据')}</p>`}
function postDetail(id){const p=S.posts.find(x=>x.id===id);if(!p)return;const m=metrics(p);const sp=(p.selling||'').split(/[、,，\n]/).map(x=>x.trim()).filter(Boolean);
  const promo=S.xp.filter(x=>x.post_ref===p.id||(x.is_promo&&p.sale_date&&x.posted_at&&Math.abs((new Date(x.posted_at)-pd(p.sale_date))/864e5)<=7));
  sheet(`${shHead(p.title||T('（无标题）'),`${p.platform||''} · ${p.sale_date?T('开售 ')+p.sale_date:T('未定档')}`)}
  <div class="pd">${p.cover?`<img class="pd-cov" src="${esc(p.cover)}" alt="">`:''}<div class="pd-tags">${stBadge(p.status)}${p.theme?`<i class="pill">${esc(p.theme)}</i>`:''}${(p.tags||[]).map(t=>`<i class="pill soft">#${esc(t)}</i>`).join('')}</div>
   <div class="kpis"><div><em>${T('收入')}${num(S.set.fee_pct)?T('（扣手续费）'):''}</em><b>${money(m.rev)}</b></div><div><em>${T('利润')}</em><b class="${m.profit<0?'neg':''}">${money(m.profit)}</b></div><div><em>ROI</em><b>${pct(m.roi)}</b></div>
    <div><em>${T('销量')}</em><b>${m.sales}</b></div><div><em>${T('播放')}</em><b>${m.views.toLocaleString()}</b></div><div><em>${T('转化率')}</em><b>${pct(m.conv)}</b></div></div>
   <dl class="kv"><dt>${T('售价')}</dt><dd>${money(p.price)}</dd><dt>${T('预算')}</dt><dd>${money(p.budget)}${m.exp?` + ${T('关联支出')} ${money(m.exp)}`:''}</dd>
    ${p.url?`<dt>${T('链接')}</dt><dd><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.url.replace(/^https?:\/\//,'').slice(0,40))}</a></dd>`:''}
    ${sp.length?`<dt>${T('卖点')}</dt><dd>${sp.map(s=>`<i class="pill soft">${esc(s)}</i>`).join(' ')}</dd>`:''}${p.notes?`<dt>${T('备注')}</dt><dd>${esc(p.notes)}</dd>`:''}</dl>
   <h4 class="sec">${T('数据走势')}</h4><div class="card flat">${lineChart([{n:T('收入'),v:m.st.map(s=>s.revenue!=null?num(s.revenue):num(s.sales)*num(p.price))},{n:T('销量×价'),v:[]}].slice(0,1),{fmt:v=>v>=1e4?(v/1e4).toFixed(1)+'万':v,labels:m.st.map(s=>s.day.slice(5))})}
    ${lineChart([{n:T('播放'),v:m.st.map(s=>num(s.views))},{n:T('点赞'),v:m.st.map(s=>num(s.likes))}],{h:120,labels:m.st.map(s=>s.day.slice(5))})}</div>
   <h4 class="sec">${T('数据记录')} <small>${T('累计值，每次录入一行')}</small></h4>
   <form id="sf" class="statf"><input name="day" type="date" value="${today()}"><input name="views" inputmode="numeric" placeholder="${T('播放')}"><input name="likes" inputmode="numeric" placeholder="${T('点赞')}"><input name="comments" inputmode="numeric" placeholder="${T('评论')}"><input name="sales" inputmode="numeric" placeholder="${T('销量')}"><input name="revenue" inputmode="decimal" placeholder="${T('销售额(可空)')}"><button class="btn sm">${T('记录')}</button></form>
   <div class="tbl"><table><thead><tr><th>${T('日期')}</th><th>${T('播放')}</th><th>${T('点赞')}</th><th>${T('评论')}</th><th>${T('销量')}</th><th>${T('销售额')}</th><th></th></tr></thead><tbody>${m.st.slice().reverse().map(s=>`<tr><td>${s.day.slice(5)}</td><td>${s.views??'—'}</td><td>${s.likes??'—'}</td><td>${s.comments??'—'}</td><td>${s.sales??'—'}</td><td>${s.revenue!=null?money(s.revenue):'—'}</td><td><button class="ib sm" data-sx="${s.id}">${ic('x')}</button></td></tr>`).join('')||`<tr><td colspan="7" class="empty">${T('还没有数据')}</td></tr>`}</tbody></table></div>
   <h4 class="sec">${T('X 宣传帖')} <small>${T('开售前后 7 天')}</small></h4>${promo.length?promo.map(xRow).join(''):`<p class="empty sm">${T('暂无关联的 X 帖子')}</p>`}
   <h4 class="sec">${T('关联日程')}</h4>${S.items.filter(i=>i.post_id===p.id).map(i=>`<button class="lrow" data-it="${i.id}"><i class="dot" style="background:${typeOf(i.type).c}"></i><b>${esc(i.title)}</b><small>${i.day}</small></button>`).join('')||`<p class="empty sm">—</p>`}
   <div class="row-btns"><button class="btn ghost" id="pcal">${T('加日程')}</button><button class="btn" id="pedit">${T('编辑投稿')}</button></div></div>`,(el,close)=>{
    $('#pedit',el).onclick=()=>{close();postEditor(p)};$('#pcal',el).onclick=()=>{close();itemEditor({title:p.title,type:'promo',day:p.sale_date||today(),post_id:p.id})};
    $$('[data-it]',el).forEach(b=>b.onclick=()=>{close();itemEditor(S.items.find(x=>x.id===b.dataset.it))});
    $$('[data-sx]',el).forEach(b=>b.onclick=async()=>{await del('stats',b.dataset.sx);postDetail(id)});
    $('#sf',el).onsubmit=async e=>{e.preventDefault();const f=e.target;const v=k=>f[k].value.trim()===''?null:num(f[k].value);
      if(['views','likes','comments','sales','revenue'].every(k=>v(k)==null))return toast(T('至少填一个数'),1);
      await save('stats',{post_id:p.id,day:f.day.value||today(),views:v('views'),likes:v('likes'),comments:v('comments'),sales:v('sales'),revenue:v('revenue')});toast(T('已记录'));postDetail(id);if(S.view!=='cal')render()}})}
const xRow=x=>{const er=x.views?(x.likes+x.reposts+x.replies+x.quotes+x.bookmarks)/x.views:NaN;return`<div class="xrow"><p>${esc((x.text||'').slice(0,90))}</p><small>${x.posted_at?new Date(x.posted_at).toLocaleString(LANG==='ja'?'ja-JP':'zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):''} · ♡ ${x.likes} · ↻ ${x.reposts} · 💬 ${x.replies} · ${T('浏览')} ${x.views.toLocaleString()} · ${T('互动率')} ${pct(er)}${x.is_promo?` · <i class="pill soft">${T('宣传')}</i>`:''}</small></div>`};
// ---------- 数据 ----------
const netRevAt=(p,d)=>{const fee=num(S.set.fee_pct)/100;const st=statsOf(p.id).filter(s=>s.day<=d);const l=st[st.length-1];if(!l)return 0;return(l.revenue!=null?num(l.revenue):num(l.sales)*num(p.price))*(1-fee)};
const mEnd=ym=>{const [y,m]=ym.split('-').map(Number);return ymd(new Date(y,m,0))};const mAdd=(ym,n)=>{const [y,m]=ym.split('-').map(Number);return ymd(new Date(y,m-1+n,1)).slice(0,7)};
function monthFin(ym){const prev=mEnd(mAdd(ym,-1)),end=mEnd(ym);const rev=S.posts.reduce((a,p)=>a+netRevAt(p,end)-netRevAt(p,prev),0);
  const exp=S.expenses.filter(e=>(e.day||'').startsWith(ym)).reduce((a,e)=>a+num(e.amount),0);const bud=S.posts.filter(p=>(p.sale_date||p.created_at?.slice(0,10)||'').startsWith(ym)).reduce((a,p)=>a+num(p.budget),0);
  return{rev,exp:exp+bud,profit:rev-exp-bud,n:S.posts.filter(p=>(p.sale_date||'').startsWith(ym)).length}}
const xHandle=()=>String(S.set.x_handle||'').replace(/^@/,'');
const xSnaps=()=>S.xs.filter(s=>s.handle.toLowerCase()===xHandle().toLowerCase()).sort((a,b)=>a.day.localeCompare(b.day));
const er=x=>x.views?(x.likes+x.reposts+x.replies+x.quotes+x.bookmarks)/x.views:NaN;
function groupSum(key){const g={};S.posts.forEach(p=>{const ks=key(p);const m=metrics(p);ks.forEach(k=>{g[k]=g[k]||{rev:0,n:0,sales:0};g[k].rev+=m.rev;g[k].n++;g[k].sales+=m.sales})});return Object.entries(g).sort((a,b)=>b[1].rev-a[1].rev)}
function dataView(){const sub=S.sub;return`<div class="pagehd">${S.theme==='mist'?`<span class="cap">〈 データ 〉</span><h2 class="script">Insight</h2>`:`<h2 class="bl">Insight</h2>${deco('orn')}`}<p class="sp">${T('数据分析')}</p></div>
  <div class="seg mini">${[['dash','总览'],['x','X 账号'],['mf','myfans']].map(([k,n])=>`<button data-sub="${k}" class="${sub===k?'on':''}">${T(n)}</button>`).join('')}</div>${({dash:dashView,x:xView,mf:mfView})[sub]()}`}
function dashView(){const ym=today().slice(0,7);const f=monthFin(ym);const k=S.set.kpi||{};const xs=xSnaps();const fol=xs.length?xs[xs.length-1].followers:null;
  const months=[...Array(6)].map((_,i)=>mAdd(ym,i-5));const fins=months.map(monthFin);
  const prog=(n,v,t,fmt)=>t?`<div class="kpi"><div class="kh"><span>${n}</span><b>${fmt(v)} <small>/ ${fmt(t)}</small></b></div><div class="pb"><i style="width:${Math.min(100,v/t*100)}%"></i></div></div>`:'';
  const up=[...Array(7)].map((_,i)=>addD(today(),i)).flatMap(d=>eventsOn(d).map(e=>({...e,d})));
  const roi=S.posts.map(p=>[p.title,metrics(p)]).filter(x=>x[1].cost>0||x[1].rev>0).sort((a,b)=>(b[1].roi||0)-(a[1].roi||0)).slice(0,8);
  return`<div class="kpis big card"><div><em>${T('本月收入')}</em><b>${money(f.rev)}</b></div><div><em>${T('本月支出')}</em><b>${money(f.exp)}</b></div><div><em>${T('本月利润')}</em><b class="${f.profit<0?'neg':''}">${money(f.profit)}</b></div><div><em>${T('本月开售')}</em><b>${f.n}</b></div></div>
  ${(k.revenue||k.posts||k.followers)?`<section class="card"><h4 class="ct">${T('本月目标')}</h4>${prog(T('收入'),f.rev,num(k.revenue),money)}${prog(T('开售数'),f.n,num(k.posts),v=>v)}${prog(T('X 粉丝'),fol||0,num(k.followers),v=>Math.round(v).toLocaleString())}</section>`:`<button class="card hintcard" id="kpiset">${deco('s')} ${T('设置每月 KPI 目标 →')}</button>`}
  <section class="card"><h4 class="ct">${T('近 6 个月')}</h4>${lineChart([{n:T('收入'),v:fins.map(x=>x.rev)},{n:T('利润'),v:fins.map(x=>x.profit)}],{fmt:v=>Math.abs(v)>=1e4?(v/1e4).toFixed(0)+'万':v,labels:months.map(m=>m.slice(2))})}</section>
  <section class="card"><h4 class="ct">${T('接下来 7 天')}</h4>${up.length?up.slice(0,8).map(e=>`<button class="lrow" data-ev="${e.kind==='item'?e.it.id:'p:'+e.p.id}" data-day="${e.d}"><i class="dot" style="background:${typeOf(e.type).c}"></i><b>${esc(e.title)}</b><small>${e.d.slice(5)} ${e.t||''}</small></button>`).join(''):`<p class="empty sm">${T('一周内没有安排')}</p>`}</section>
  <section class="card"><h4 class="ct">${T('各作品 ROI')}</h4>${barList(roi.map(([n,m])=>[n,isFinite(m.roi)?m.roi:0,money(m.profit)]),v=>pct(v))}</section>
  <section class="card"><h4 class="ct">${T('主题 · 按收入')}</h4>${barList(groupSum(p=>p.theme?[p.theme]:[]).slice(0,6).map(([n,g])=>[n,g.rev,`${g.n} ${T('部')} · ${T('均')} ${money(g.rev/g.n)}`]))}</section>
  <section class="card"><h4 class="ct">${T('卖点 · 按收入')}</h4>${barList(groupSum(p=>(p.selling||'').split(/[、,，\n]/).map(x=>x.trim()).filter(Boolean)).slice(0,8).map(([n,g])=>[n,g.rev,`${g.n} ${T('部')}`]))}</section>`}
function xView(){const xs=xSnaps();const l=xs[xs.length-1];const at=d=>{const s=xs.filter(x=>x.day<=d).pop();return s?s.followers:null};
  const g7=l&&at(addD(l.day,-7))!=null?l.followers-at(addD(l.day,-7)):null,g30=l&&at(addD(l.day,-30))!=null?l.followers-at(addD(l.day,-30)):null;
  const ps=S.xp.filter(x=>x.handle.toLowerCase()===xHandle().toLowerCase()).sort((a,b)=>(b.posted_at||'').localeCompare(a.posted_at||''));const rec=ps.slice(0,30);
  const avgEr=rec.filter(x=>x.views).reduce((a,x)=>a+er(x),0)/(rec.filter(x=>x.views).length||1);
  const hr=[...Array(24)].map(()=>[]),wd=[...Array(7)].map(()=>[]);ps.forEach(x=>{if(!x.posted_at||!x.views)return;const d=new Date(new Date(x.posted_at).getTime()+9*36e5);hr[d.getUTCHours()].push(x);wd[d.getUTCDay()].push(x)});
  const avg=a=>a.length?a.reduce((s,x)=>s+x.views,0)/a.length:0;const hmax=Math.max(...hr.map(avg),1),wmax=Math.max(...wd.map(avg),1);
  const corr=S.posts.filter(p=>p.sale_date).map(p=>{const pr=ps.filter(x=>x.post_ref===p.id||(x.is_promo&&x.posted_at&&Math.abs((new Date(x.posted_at)-pd(p.sale_date))/864e5)<=7));return[p,pr.length,pr.reduce((a,x)=>a+x.views,0),metrics(p).sales]});
  const pear=(()=>{const c=corr.filter(r=>r[2]||r[3]);if(c.length<3)return NaN;const xs=c.map(r=>r[2]),ys=c.map(r=>r[3]);const mx=xs.reduce((a,b)=>a+b)/xs.length,my=ys.reduce((a,b)=>a+b)/ys.length;
    const n=xs.reduce((a,x,i)=>a+(x-mx)*(ys[i]-my),0),d=Math.sqrt(xs.reduce((a,x)=>a+(x-mx)**2,0)*ys.reduce((a,y)=>a+(y-my)**2,0));return d?n/d:NaN})();
  return`<section class="card"><div class="xh"><b>@${esc(xHandle()||'—')}</b><small>${l?T('更新于 ')+l.day:T('还没有快照')}</small><button class="btn sm ghost" id="xman">${T('手动录入')}</button></div>
   <div class="kpis"><div><em>${T('粉丝')}</em><b>${l?l.followers.toLocaleString():'—'}</b></div><div><em>${T('7 天')}</em><b>${g7==null?'—':(g7>=0?'+':'')+g7}</b></div><div><em>${T('30 天')}</em><b>${g30==null?'—':(g30>=0?'+':'')+g30}</b></div><div><em>${T('关注')}</em><b>${l?.following??'—'}</b></div><div><em>${T('帖子数')}</em><b>${l?.posts??'—'}</b></div><div><em>${T('平均互动率')}</em><b>${rec.length?pct(avgEr):'—'}</b></div></div></section>
  <section class="card"><h4 class="ct">${T('粉丝增长')}</h4>${lineChart([{n:T('粉丝'),v:xs.slice(-90).map(s=>s.followers)}],{labels:xs.slice(-90).map(s=>s.day.slice(5))})}</section>
  <section class="card"><h4 class="ct">${T('最佳发帖时段（JST，平均浏览）')}</h4><div class="heat">${hr.map((a,h)=>`<i style="--v:${avg(a)/hmax}" title="${h}:00 · ${a.length}"><span>${h%3===0?h:''}</span></i>`).join('')}</div>
   <div class="wdb">${wd.map((a,i)=>`<div><i style="height:${Math.max(4,avg(a)/wmax*60)}px"></i><span>${WD()[i]}</span></div>`).join('')}</div>${ps.length<10?`<p class="empty sm">${T('帖子样本较少，结论仅供参考')}</p>`:''}</section>
  <section class="card"><h4 class="ct">${T('热门帖子')}</h4>${ps.slice().sort((a,b)=>b.views-a.views).slice(0,5).map(xRow).join('')||`<p class="empty sm">${T('暂无帖子数据')}</p>`}</section>
  <section class="card"><h4 class="ct">${T('宣传与销量（开售 ±7 天）')}</h4>${corr.length?`<div class="tbl"><table><thead><tr><th>${T('作品')}</th><th>${T('宣传帖')}</th><th>${T('浏览')}</th><th>${T('销量')}</th></tr></thead><tbody>${corr.map(([p,n,v,s])=>`<tr><td>${esc(p.title.slice(0,14))}</td><td>${n}</td><td>${v.toLocaleString()}</td><td>${s}</td></tr>`).join('')}</tbody></table></div>
   <p class="note">${isFinite(pear)?`${T('宣传浏览量与销量的相关系数')} r = <b>${pear.toFixed(2)}</b> ${pear>.5?T('（正相关明显：宣传有效）'):pear>.2?T('（弱正相关）'):T('（相关性不明显）')}`:T('至少 3 部有数据的作品后计算相关系数')}</p>`:`<p class="empty sm">${T('给投稿填上出售日期后显示')}</p>`}</section>`}
function mfView(){const ms=S.mf.slice().sort((a,b)=>a.day.localeCompare(b.day));const l=ms[ms.length-1];
  return`<section class="card"><div class="xh"><b>myfans</b><small>${S.set.myfans_url?esc(S.set.myfans_url.replace(/^https?:\/\//,'')):T('未填写主页链接')}</small><button class="btn sm ghost" id="mfurl">${T('主页链接')}</button></div>
   <div class="kpis"><div><em>${T('粉丝')}</em><b>${l?.followers??'—'}</b></div><div><em>${T('订阅者')}</em><b>${l?.subscribers??'—'}</b></div><div><em>${T('点赞')}</em><b>${l?.likes??'—'}</b></div><div><em>${T('帖子')}</em><b>${l?.posts??'—'}</b></div><div><em>${T('视频')}</em><b>${l?.videos??'—'}</b></div><div><em>${T('当期收入')}</em><b>${l?.revenue!=null?money(l.revenue):'—'}</b></div></div>
   <div class="row-btns"><button class="btn ghost" id="mfman">${T('手动录入')}</button><button class="btn" id="mfimp">${T('粘贴 / CSV 导入')}</button></div></section>
  <section class="card"><h4 class="ct">${T('粉丝与订阅走势')}</h4>${lineChart([{n:T('粉丝'),v:ms.map(s=>num(s.followers))},{n:T('订阅者'),v:ms.map(s=>num(s.subscribers))}],{labels:ms.map(s=>s.day.slice(5))})}</section>
  <section class="card"><h4 class="ct">${T('myfans 作品')}</h4>${S.posts.filter(p=>p.platform==='myfans').map(p=>{const m=metrics(p);return`<button class="lrow" data-p="${p.id}"><b>${esc(p.title)}</b><small>${T('播放')} ${m.views} · ${T('销量')} ${m.sales} · ${money(m.rev)}</small></button>`}).join('')||`<p class="empty sm">${T('暂无')}</p>`}</section>
  <p class="note">${T('myfans 没有开放 API。目前通过创作者后台复制数据后粘贴导入；填好主页链接后，后续可接入公开主页数据（粉丝数、点赞数、帖子数）的自动抓取。')}</p>`}
function bindData(){$$('[data-sub]').forEach(b=>b.onclick=()=>{S.sub=b.dataset.sub;render()});$$('.lrow[data-ev]').forEach(b=>b.onclick=()=>openEv(b.dataset.ev,b.dataset.day));$$('[data-p]').forEach(b=>b.onclick=()=>postDetail(b.dataset.p));
  $('#kpiset')&&($('#kpiset').onclick=kpiEditor);$('#xman')&&($('#xman').onclick=xManual);$('#mfman')&&($('#mfman').onclick=mfManual);$('#mfimp')&&($('#mfimp').onclick=mfImport);$('#mfurl')&&($('#mfurl').onclick=()=>{S.view='more';render();settingsSheet()})}
function kpiEditor(){const k=S.set.kpi||{};sheet(`${shHead(T('每月 KPI 目标'))}<form class="form" id="kf"><label class="fld"><span>${T('月收入目标')}</span><input name="revenue" inputmode="decimal" value="${k.revenue||''}"></label>
  <label class="fld"><span>${T('每月开售作品数')}</span><input name="posts" inputmode="numeric" value="${k.posts||''}"></label><label class="fld"><span>${T('X 粉丝目标')}</span><input name="followers" inputmode="numeric" value="${k.followers||''}"></label><button class="btn">${T('保存')}</button></form>`,(el,close)=>{
  $('#kf',el).onsubmit=async e=>{e.preventDefault();const f=e.target;S.set.kpi={revenue:num(f.revenue.value),posts:num(f.posts.value),followers:num(f.followers.value)};await saveSet();close();render()}})}
function xManual(){sheet(`${shHead(T('手动录入 X 数据'))}<form class="form" id="xf"><h4 class="sec">${T('账号快照')}</h4><div class="two"><label class="fld"><span>${T('日期')}</span><input name="day" type="date" value="${today()}"></label><label class="fld"><span>${T('粉丝')}</span><input name="followers" inputmode="numeric"></label></div>
  <div class="two"><label class="fld"><span>${T('关注')}</span><input name="following" inputmode="numeric"></label><label class="fld"><span>${T('帖子数')}</span><input name="posts" inputmode="numeric"></label></div>
  <h4 class="sec">${T('单条帖子（可选）')}</h4><label class="fld"><span>${T('帖子链接或 ID')}</span><input name="pid" placeholder="https://x.com/…/status/123"></label><label class="fld"><span>${T('内容摘要')}</span><input name="text"></label>
  <div class="two"><label class="fld"><span>${T('发帖时间')}</span><input name="at" type="datetime-local"></label><label class="fld"><span>${T('浏览')}</span><input name="views" inputmode="numeric"></label></div>
  <div class="three"><label class="fld"><span>♡</span><input name="likes" inputmode="numeric"></label><label class="fld"><span>↻</span><input name="reposts" inputmode="numeric"></label><label class="fld"><span>💬</span><input name="replies" inputmode="numeric"></label></div>
  <div class="two"><label class="fld"><span>${T('收藏')}</span><input name="bookmarks" inputmode="numeric"></label><label class="tgl"><input type="checkbox" name="promo"><i></i>${T('宣传帖')}</label></div><button class="btn">${T('保存')}</button></form>`,(el,close)=>{
  $('#xf',el).onsubmit=async e=>{e.preventDefault();const f=e.target;const h=xHandle();if(!h)return toast(T('先在设置里填写 X 账号'),1);
    if(f.followers.value){const ex=S.xs.find(s=>s.handle===h&&s.day===f.day.value);await save('xs',{...(ex?{id:ex.id}:{}),handle:h,day:f.day.value,followers:num(f.followers.value),following:f.following.value?num(f.following.value):null,posts:f.posts.value?num(f.posts.value):null})}
    const id=(f.pid.value.match(/(\d{5,25})/)||[])[1];if(id){const ex=S.xp.find(x=>x.x_id===id);await save('xp',{...(ex?{id:ex.id}:{}),handle:h,x_id:id,text:f.text.value,posted_at:f.at.value?new Date(f.at.value).toISOString():null,views:num(f.views.value),likes:num(f.likes.value),reposts:num(f.reposts.value),replies:num(f.replies.value),bookmarks:num(f.bookmarks.value),is_promo:f.promo.checked})}
    close();toast(T('已保存'));render()}})}
function mfManual(){sheet(`${shHead(T('录入 myfans 账号数据'))}<form class="form" id="mff"><label class="fld"><span>${T('日期')}</span><input name="day" type="date" value="${today()}"></label>
  <div class="two">${[['followers','粉丝'],['subscribers','订阅者'],['likes','点赞'],['posts','帖子'],['videos','视频'],['revenue','当期收入']].map(([k,n])=>`<label class="fld"><span>${T(n)}</span><input name="${k}" inputmode="decimal"></label>`).join('')}</div><button class="btn">${T('保存')}</button></form>`,(el,close)=>{
  $('#mff',el).onsubmit=async e=>{e.preventDefault();const f=e.target;const v=k=>f[k].value===''?null:num(f[k].value);const ex=S.mf.find(s=>s.day===f.day.value);
    await save('mf',{...(ex?{id:ex.id}:{}),day:f.day.value,followers:v('followers'),subscribers:v('subscribers'),likes:v('likes'),posts:v('posts'),videos:v('videos'),revenue:v('revenue')});close();toast(T('已保存'));render()}})}
const HDR={title:['title','标题','タイトル','作品'],day:['date','day','日期','日付','日时','日時'],views:['views','播放','再生','再生数','閲覧','浏览'],likes:['likes','点赞','いいね'],comments:['comments','评论','コメント'],sales:['sales','销量','販売数','購入数','売上数'],
  revenue:['revenue','销售额','収益','売上','売上金額','金額'],followers:['followers','粉丝','フォロワー'],subscribers:['subscribers','订阅者','加入者','サブスク'],posts:['posts','帖子','投稿数'],videos:['videos','视频','動画数']};
function parseTable(txt){const lines=txt.trim().split(/\r?\n/).filter(l=>l.trim());if(lines.length<2)return null;const sep=lines[0].includes('\t')?'\t':',';const split=l=>l.split(sep).map(x=>x.trim().replace(/^"|"$/g,''));
  const h=split(lines[0]).map(x=>{const lx=x.toLowerCase();return Object.keys(HDR).find(k=>HDR[k].some(a=>lx===a.toLowerCase()||lx.includes(a.toLowerCase())))||null});return{h,rows:lines.slice(1).map(split)}}
const normDay=s=>{const m=String(s||'').match(/(\d{4})[\/\-.年](\d{1,2})[\/\-.月](\d{1,2})/);return m?`${m[1]}-${pad(m[2])}-${pad(m[3])}`:today()};
function mfImport(){sheet(`${shHead(T('粘贴 / CSV 导入'),T('从 myfans 后台复制表格，或导出的 CSV'))}<div class="form"><p class="note">${T('第一行为表头。含「标题」列 → 按作品导入数据记录（同名作品自动匹配，没有则新建）；不含标题 → 作为账号快照导入。支持中/日/英表头：')}<br><code>title,date,views,likes,comments,sales,revenue</code><br><code>date,followers,subscribers,likes,posts,videos,revenue</code></p>
  <textarea id="imt" rows="8" placeholder="title,date,views,likes,sales,revenue&#10;新作 #12,2026-10-30,1200,85,14,"></textarea><label class="btn ghost sm">${T('选择 CSV 文件')}<input type="file" accept=".csv,text/csv,text/plain" id="imf" hidden></label><div id="imp"></div><button class="btn" id="imgo">${T('导入')}</button></div>`,(el,close)=>{
  $('#imf',el).onchange=async e=>{const f=e.target.files[0];if(f)$('#imt',el).value=await f.text();prev()};const prev=()=>{const t=parseTable($('#imt',el).value);$('#imp',el).innerHTML=t?`<p class="note">${T('识别列')}：${t.h.map(x=>x||'×').join(' · ')} · ${t.rows.length} ${T('行')}</p>`:''};$('#imt',el).oninput=prev;
  $('#imgo',el).onclick=async()=>{const t=parseTable($('#imt',el).value);if(!t)return toast(T('至少需要表头和一行数据'),1);const g=(r,k)=>{const i=t.h.indexOf(k);return i<0||r[i]===''||r[i]==null?null:r[i]};let n=0;
    try{if(t.h.includes('title')){for(const r of t.rows){const title=g(r,'title');if(!title)continue;let p=S.posts.find(x=>x.title===title);if(!p)p=await save('posts',{title,platform:'myfans',status:'已发布'});
        const v=k=>g(r,k)==null?null:num(g(r,k));await save('stats',{post_id:p.id,day:normDay(g(r,'day')),views:v('views'),likes:v('likes'),comments:v('comments'),sales:v('sales'),revenue:v('revenue')});n++}}
      else{for(const r of t.rows){const day=normDay(g(r,'day'));const v=k=>g(r,k)==null?null:num(g(r,k));const ex=S.mf.find(s=>s.day===day);await save('mf',{...(ex?{id:ex.id}:{}),day,followers:v('followers'),subscribers:v('subscribers'),likes:v('likes'),posts:v('posts'),videos:v('videos'),revenue:v('revenue')});n++}}}
    catch(e){return}close();toast(T('已导入 ')+n+T(' 行'));render()}})}
// ---------- 更多 ----------
function moreView(){const ym=today().slice(0,7);const expM=S.expenses.filter(e=>(e.day||'').startsWith(ym)).reduce((a,e)=>a+num(e.amount),0);
  return`<div class="pagehd">${S.theme==='mist'?`<span class="cap">〈 その他 〉</span><h2 class="script">Atelier</h2>`:`<h2 class="bl">Atelier</h2>${deco('orn')}`}<p class="sp">${esc(S.user.email)}</p></div>
  <section class="card"><div class="ch"><h4 class="ct">${T('选题灵感')}</h4><button class="btn sm" id="iadd">${ic('plus')}${T('记一个')}</button></div>
   ${S.ideas.slice().sort((a,b)=>b.score-a.score).map(i=>`<button class="lrow" data-idea="${i.id}"><i class="pill soft">${'♥'.repeat(i.score||0)}</i><b>${esc(i.title)}</b><small>${esc(i.theme||'')} · ${esc(T(i.status||'待定'))}</small></button>`).join('')||`<p class="empty sm">${T('灵感随手记在这里，之后一键转成投稿')}</p>`}</section>
  <section class="card"><div class="ch"><h4 class="ct">${T('合作对象')}</h4><button class="btn sm" id="cadd">${ic('plus')}${T('添加')}</button></div>
   ${S.contacts.map(c=>`<button class="lrow" data-ct="${c.id}"><b>${esc(c.name)}</b><small>${esc(c.role||'')}${c.rate?' · '+money(c.rate):''}</small></button>`).join('')||`<p class="empty sm">${T('摄影、化妆、共演、场地…')}</p>`}</section>
  <section class="card"><div class="ch"><h4 class="ct">${T('支出账本')} <small>${T('本月')} ${money(expM)}</small></h4><button class="btn sm" id="eadd">${ic('plus')}${T('记一笔')}</button></div>
   ${S.expenses.slice().sort((a,b)=>(b.day||'').localeCompare(a.day||'')).slice(0,12).map(e=>`<button class="lrow" data-ex="${e.id}"><b>${money(e.amount)}</b><small>${e.day} · ${esc(T(e.category||'其他'))}${e.post_id?' · '+esc(S.posts.find(p=>p.id===e.post_id)?.title||''):''}${e.note?' · '+esc(e.note):''}</small></button>`).join('')||`<p class="empty sm">${T('道具、场地、服装、外包…可关联到作品计入 ROI')}</p>`}</section>
  <section class="card menu"><button id="mset">${ic('bell')}<span>${T('设置 · 提醒 · 密码锁')}</span>${ic('r')}</button><button id="mtpl">${ic('cal')}<span>${T('清单模板与日程类型')}</span>${ic('r')}</button>
   <button id="mexp">${ic('chart')}<span>${T('导出 / 备份 / 恢复')}</span>${ic('r')}</button><button id="msrch">${ic('search')}<span>${T('搜索')}</span>${ic('r')}</button><button id="mout"><span>${T('退出登录')}</span></button></section>
  <div class="foot">${deco('orn')}<p>Veil · ${T('秘幕手帐')} · v1</p></div>`}
function bindMore(){$('#iadd').onclick=()=>ideaEditor({});$('#cadd').onclick=()=>contactEditor({});$('#eadd').onclick=()=>expenseEditor({});
  $$('[data-idea]').forEach(b=>b.onclick=()=>ideaEditor(S.ideas.find(x=>x.id===b.dataset.idea)));$$('[data-ct]').forEach(b=>b.onclick=()=>contactEditor(S.contacts.find(x=>x.id===b.dataset.ct)));
  $$('[data-ex]').forEach(b=>b.onclick=()=>expenseEditor(S.expenses.find(x=>x.id===b.dataset.ex)));
  $('#mset').onclick=settingsSheet;$('#mtpl').onclick=tplSheet;$('#mexp').onclick=exportSheet;$('#msrch').onclick=searchSheet;$('#mout').onclick=async()=>{await sb.auth.signOut();location.reload()}}
function simpleEditor(k,o,title,fields,extra){const isNew=!o.id;sheet(`${shHead(title)}<form class="form" id="sf2">${fields.map(([n,l,t,opts])=>t==='select'?`<label class="fld"><span>${T(l)}</span><select name="${n}">${opts.map(([v,lb])=>`<option value="${esc(v)}" ${String(o[n]??'')===String(v)?'selected':''}>${esc(lb)}</option>`).join('')}</select></label>`
  :t==='area'?`<label class="fld"><span>${T(l)}</span><textarea name="${n}" rows="3">${esc(o[n]||'')}</textarea></label>`:`<label class="fld"><span>${T(l)}</span><input name="${n}" ${t?`type="${t}"`:''} value="${esc(o[n]??'')}"></label>`).join('')}
  <div class="row-btns">${isNew?'':`<button type="button" class="btn ghost danger" id="sdel">${T('删除')}</button>`}${extra&&!isNew?`<button type="button" class="btn ghost" id="sx">${esc(extra[0])}</button>`:''}<button class="btn">${T('保存')}</button></div></form>`,(el,close)=>{
  if(!isNew)$('#sdel',el).onclick=async()=>{await del(k,o.id);close();render()};if(extra&&!isNew)$('#sx',el).onclick=()=>{close();extra[1](o)};
  $('#sf2',el).onsubmit=async e=>{e.preventDefault();const f=e.target;const row={};fields.forEach(([n,,t])=>{let v=f[n].value;if(t==='number'||n==='amount'||n==='rate'||n==='score')v=v===''?null:num(v);if(n==='post_id'&&!v)v=null;row[n]=v});if(!isNew)row.id=o.id;await save(k,row);close();toast(T('已保存'));render()}})}
const ideaEditor=o=>simpleEditor('ideas',{score:3,status:'待定',...o},o.id?T('编辑选题'):T('新选题'),[['title','标题'],['theme','主题'],['notes','想法 / 卖点','area'],['score','期待度 1-5','select',[1,2,3,4,5].map(v=>[v,'♥'.repeat(v)])],['status','状态','select',['待定','准备中','已转投稿','放弃'].map(v=>[v,T(v)])]],
  [T('转成投稿'),async i=>{const p=await save('posts',{title:i.title,theme:i.theme,selling:i.notes,status:'策划'});await save('ideas',{id:i.id,status:'已转投稿'});render();postDetail(p.id)}]);
const contactEditor=o=>simpleEditor('contacts',o,o.id?T('编辑合作对象'):T('新合作对象'),[['name','名字 / 昵称'],['role','角色（摄影 / 化妆 / 共演…）'],['contact','联系方式'],['rate','报价','number'],['notes','备注','area']]);
const expenseEditor=o=>simpleEditor('expenses',{day:today(),category:'道具',...o},o.id?T('编辑支出'):T('记一笔支出'),[['day','日期','date'],['amount','金额','number'],['category','分类','select',['道具','服装','场地','交通','外包','广告','设备','其他'].map(v=>[v,T(v)])],['post_id','关联作品','select',[['','—'],...S.posts.map(p=>[p.id,p.title])]],['note','备注']]);
function tplSheet(){sheet(`${shHead(T('清单模板与日程类型'))}<div class="form"><label class="fld"><span>${T('发布清单模板（每行一项）')}</span><textarea id="tplt" rows="7">${esc((S.set.checklist_tpl||[]).join('\n'))}</textarea></label>
  <div class="fld"><span>${T('日程类型与颜色')}</span>${types().map((t,i)=>`<div class="tyr"><input type="color" value="${t.c}" data-tc="${i}"><input value="${esc(t.n)}" data-tn="${i}"></div>`).join('')}</div>
  <label class="fld"><span>${T('默认提醒')}</span><select id="rdef">${OFFS.map(([o,n])=>`<option value="${o}" ${(S.set.remind_default||[30])[0]===o?'selected':''}>${T(n)}</option>`).join('')}</select></label><button class="btn" id="tsv">${T('保存')}</button></div>`,(el,close)=>{
  $('#tsv',el).onclick=async()=>{S.set.checklist_tpl=$('#tplt',el).value.split('\n').map(x=>x.trim()).filter(Boolean);S.set.types=types().map((t,i)=>({...t,c:$(`[data-tc="${i}"]`,el).value,n:$(`[data-tn="${i}"]`,el).value||t.n}));S.set.remind_default=[+$('#rdef',el).value];await saveSet();close();toast(T('已保存'));render()}})}
function exportSheet(){sheet(`${shHead(T('导出 / 备份 / 恢复'))}<div class="form"><button class="btn" id="exj">${T('导出完整备份（JSON）')}</button><button class="btn ghost" id="exc">${T('导出投稿与数据（CSV）')}</button><button class="btn ghost" id="exi">${T('导出日程（CSV）')}</button>
  <label class="btn ghost">${T('从备份恢复（合并导入）')}<input type="file" id="rst" accept=".json,application/json" hidden></label><p class="note">${T('备份文件含全部记录，请妥善保管。')}</p></div>`,(el)=>{
  const dl=(name,txt,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4e3)};
  const csv=rows=>'\ufeff'+rows.map(r=>r.map(v=>{v=v==null?'':String(v);return/[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(',')).join('\n');
  $('#exj',el).onclick=()=>dl(`veil-backup-${today()}.json`,JSON.stringify({app:'veil',v:1,at:new Date().toISOString(),settings:S.set,...Object.fromEntries(Object.keys(TB).map(k=>[k,S[k]]))},null,1),'application/json');
  $('#exc',el).onclick=()=>dl(`veil-posts-${today()}.csv`,csv([['title','platform','status','sale_date','theme','selling','budget','price','url','tags','revenue','profit','roi','sales','views'],...S.posts.map(p=>{const m=metrics(p);return[p.title,p.platform,p.status,p.sale_date,p.theme,p.selling,p.budget,p.price,p.url,(p.tags||[]).join(' '),Math.round(m.rev),Math.round(m.profit),isFinite(m.roi)?m.roi.toFixed(3):'',m.sales,m.views]}),[],['post','day','views','likes','comments','sales','revenue'],...S.stats.map(s=>[S.posts.find(p=>p.id===s.post_id)?.title,s.day,s.views,s.likes,s.comments,s.sales,s.revenue])]),'text/csv');
  $('#exi',el).onclick=()=>dl(`veil-schedule-${today()}.csv`,csv([['title','type','day','time','all_day','repeat','until','notes','done'],...S.items.map(i=>[i.title,typeOf(i.type).n,i.day,i.t,i.all_day,i.rrule,i.until,i.notes,i.done])]),'text/csv');
  $('#rst',el).onchange=async e=>{try{const b=JSON.parse(await e.target.files[0].text());if(b.app!=='veil')throw 0;const idmap={};
    for(const p of b.posts||[]){const {id,owner,created_at,...r}=p;const n=await save('posts',r);idmap[id]=n.id}
    for(const k of ['items','stats','ideas','contacts','expenses','mf','xs','xp'])for(const o of b[k]||[]){const {id,owner,created_at,...r}=o;if(r.post_id)r.post_id=idmap[r.post_id]||null;if(r.post_ref)r.post_ref=idmap[r.post_ref]||null;if(k==='stats'&&!r.post_id)continue;try{await save(k,r)}catch{}}
    toast(T('恢复完成'));render()}catch{toast(T('不是有效的备份文件'),1)}}})}
// ---------- 设置 / 推送 ----------
const b64u=s=>{const p='='.repeat((4-s.length%4)%4);const r=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from([...r].map(c=>c.charCodeAt(0)))};
async function pushSub(){if(!('serviceWorker'in navigator)||!('PushManager'in window))return null;const reg=await navigator.serviceWorker.getRegistration();return reg?reg.pushManager.getSubscription():null}
async function myPushRow(){const s=await pushSub();if(!s)return null;const {data}=await sb.from('ops_push').select('*').eq('endpoint',s.endpoint).maybeSingle();return data}
async function enablePush(preview){if(!('PushManager'in window))throw new Error(T('此浏览器不支持推送。iPhone 需先「添加到主屏幕」再从主屏幕打开。'));
  const perm=await Notification.requestPermission();if(perm!=='granted')throw new Error(T('通知权限被拒绝，请在系统设置里允许'));const reg=await navigator.serviceWorker.ready;
  let s=await reg.pushManager.getSubscription();if(!s)s=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(C.VAPID_PUBLIC_KEY)});const j=s.toJSON();
  await sb.from('ops_push').delete().eq('endpoint',j.endpoint);const {error}=await sb.from('ops_push').insert({endpoint:j.endpoint,p256dh:j.keys.p256dh,auth:j.keys.auth,tz:Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Tokyo',preview:!!preview});if(error)throw error}
async function settingsSheet(){const lc=lockCfg();const row=await myPushRow().catch(()=>null);
  sheet(`${shHead(T('设置'))}<div class="form">
  <h4 class="sec">${T('外观')}</h4>${themeSw()}
  <h4 class="sec">${T('提醒推送')}</h4><div class="card flat"><p class="note">${row?T('本设备已开启提醒'):T('本设备未开启提醒')}</p>
   <label class="tgl"><input type="checkbox" id="pvw" ${row?.preview?'checked':''}><i></i>${T('通知里显示日程标题（默认只显示「你有一条日程提醒」）')}</label>
   <div class="row-btns">${row?`<button class="btn ghost" id="poff">${T('关闭本设备提醒')}</button><button class="btn" id="ptest">${T('发送测试通知')}</button>`:`<button class="btn" id="pon">${T('开启本设备提醒')}</button>`}</div></div>
  <h4 class="sec">${T('本机密码锁')}</h4><div class="card flat"><p class="note">${lc?T('已开启 · 离开超过 ')+(lc.after??60)+T(' 秒后需重新输入'):T('打开 App 时需输入数字密码；切到后台时自动遮挡内容')}</p>
   <div class="row-btns">${lc?`<button class="btn ghost" id="lkoff">${T('关闭密码锁')}</button>`:''}<button class="btn" id="lkset">${lc?T('修改密码'):T('设置密码')}</button></div></div>
  <h4 class="sec">${T('账号绑定')}</h4><label class="fld"><span>${T('X 账号（不含 @）')}</span><input id="xh" value="${esc(xHandle())}"></label>
   <label class="tgl"><input type="checkbox" id="xing" ${S.set.x_ingest!==false?'checked':''}><i></i>${T('允许助手每日自动导入 X 公开数据')}</label>
   <label class="fld"><span>${T('myfans 主页链接')}</span><input id="mfu" type="url" value="${esc(S.set.myfans_url||'')}" placeholder="https://myfans.jp/…"></label>
  <h4 class="sec">${T('金额')}</h4><div class="two"><label class="fld"><span>${T('货币')}</span><select id="cur">${['JPY','CNY','USD'].map(c=>`<option ${cur()===c?'selected':''}>${c}</option>`).join('')}</select></label>
   <label class="fld"><span>${T('平台手续费 %')}</span><input id="fee" inputmode="decimal" value="${S.set.fee_pct??0}"></label></div>
  <button class="btn" id="setsv">${T('保存设置')}</button></div>`,(el,close)=>{bindThemeSw();
   const busy=async(fn)=>{try{await fn()}catch(e){toast(e.message||String(e),1)}};
   $('#pon',el)&&($('#pon',el).onclick=()=>busy(async()=>{await enablePush($('#pvw',el).checked);toast(T('已开启提醒'));settingsSheet()}));
   $('#poff',el)&&($('#poff',el).onclick=()=>busy(async()=>{const s=await pushSub();if(s){await sb.from('ops_push').delete().eq('endpoint',s.endpoint);await s.unsubscribe()}toast(T('已关闭'));settingsSheet()}));
   $('#ptest',el)&&($('#ptest',el).onclick=()=>busy(async()=>{const {data,error}=await sb.functions.invoke(C.PUSH_FUNCTION,{body:{test:true}});if(error)throw error;toast(data.sent?T('测试通知已发出'):T('发送失败，请重新开启提醒'),!data.sent)}));
   $('#pvw',el).onchange=()=>busy(async()=>{if(row){await sb.from('ops_push').update({preview:$('#pvw',el).checked}).eq('id',row.id);toast(T('已更新'))}});
   $('#lkoff',el)&&($('#lkoff',el).onclick=()=>{localStorage.removeItem(LK);toast(T('已关闭密码锁'));settingsSheet()});
   $('#lkset',el).onclick=()=>pinSetup();
   $('#setsv',el).onclick=()=>busy(async()=>{S.set.x_handle=$('#xh',el).value.trim().replace(/^@/,'');S.set.x_ingest=$('#xing',el).checked;S.set.myfans_url=$('#mfu',el).value.trim();S.set.currency=$('#cur',el).value;S.set.fee_pct=num($('#fee',el).value);await saveSet();close();toast(T('已保存'));render()})})}
function pinSetup(){sheet(`${shHead(T('设置本机密码'),T('只保存在本设备（加盐哈希），忘记时可退出登录重置'))}<form class="form" id="pinf"><label class="fld"><span>${T('数字密码（4–6 位）')}</span><input name="p1" inputmode="numeric" pattern="\\d{4,6}" type="password" required></label>
  <label class="fld"><span>${T('再输入一次')}</span><input name="p2" inputmode="numeric" type="password" required></label><label class="fld"><span>${T('离开多久后上锁')}</span><select name="after">${[[0,'立即'],[60,'1 分钟'],[300,'5 分钟'],[1800,'30 分钟']].map(([v,n])=>`<option value="${v}" ${v===60?'selected':''}>${T(n)}</option>`).join('')}</select></label><button class="btn">${T('保存')}</button></form>`,(el,close)=>{
  $('#pinf',el).onsubmit=async e=>{e.preventDefault();const f=e.target;if(!/^\d{4,6}$/.test(f.p1.value))return toast(T('请输入 4–6 位数字'),1);if(f.p1.value!==f.p2.value)return toast(T('两次输入不一致'),1);
    const salt=crypto.getRandomValues(new Uint32Array(4)).join('-');localStorage.setItem(LK,JSON.stringify({h:await hashPin(f.p1.value,salt),salt,len:f.p1.value.length,after:+f.after.value}));close();toast(T('密码锁已开启'))}})}
// ---------- 启动 ----------
async function boot(){applyTheme();const {data:{session}}=await sb.auth.getSession();if(!session){S.user=null;return authView()}S.user=session.user;
  await showLock();$('#app').innerHTML=`<div class="loading">${brand()}<p>${T('载入中…')}</p></div>`;
  try{await loadAll()}catch(e){toast(e.message,1)}const h=location.hash.slice(1);if(TABS.some(t=>t[0]===h))S.view=h;render()}
if('serviceWorker'in navigator&&!new URLSearchParams(location.search).has('nosw'))navigator.serviceWorker.register('sw.js');
sb.auth.onAuthStateChange((ev)=>{if(ev==='SIGNED_OUT'){S.user=null;authView()}});
boot();
