/* ---------- network, sync, AI ---------- */
const ERR={no_key:'The server has no GROQ_API_KEY. Add it as a secret under Production in Pages, then redeploy.',bad_key:'Groq rejected the API key. Check it for typos or extra spaces.',groq_limit:'Groq is rate limiting this key. Try again in a minute.',timeout:'Groq took too long. Try again.',no_kv:'Cloud storage is not set up. Bind a KV namespace named IVORY_KV, then redeploy.',auth:'Sign in again to use the coach.',big:'Too much data to send.',closed:'Account limit reached. Sign in with an existing account.',taken:'That username is taken.',wrong:'Wrong username or passcode.',locked:'Too many tries. Wait 15 minutes.',invalid:'Check your username and passcode.',server:'Server error. Try again.',origin:'Blocked by origin check.',nobackend:'The backend is not deployed. Upload the zip with _worker.js at its root.'};
const errText=e=>e&&e.code==='upstream'?'Groq error: '+(e.detail||'unknown')+(/do(es)? not (exist|have access)/.test(e.detail||'')?' In the Groq console, check your project can use these models (Settings > Limits), or set a GROQ_MODEL variable.':''):ERR[e&&e.code]||(e&&(e.status===404||e.status===405)?ERR.nobackend:'Could not reach the server.');
async function api(p,b){const ac=new AbortController(),to=setTimeout(()=>ac.abort(),32000);let r;
 try{r=await fetch('/api/'+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b),signal:ac.signal})}catch(e){clearTimeout(to);throw{code:e&&e.name=='AbortError'?'timeout':'net'}}
 clearTimeout(to);let j={};try{j=await r.json()}catch(e){}
 if(!r.ok)throw{code:j.error,detail:j.detail,status:r.status};return j}
async function ai(kind,data){if(!S.tok)throw{code:'auth'};try{return await api('ai',{token:S.tok,kind,data})}catch(e){if(e.status===401&&e.code==='auth')drop(true);throw e}}
const typing=()=>{const a=document.activeElement;return a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)&&V.contains(a)};
const refresh=t=>{if(T.tab===t&&!typing())render()};

/* sync */
const SSL={ok:'Synced',syncing:'Syncing…',pending:'Saving…',offline:'Offline. Will retry.'};
const ssText=()=>S.tok?(SSL[S.ss]||'Synced')+' · '+S.user:'Saved on this device';
function setSS(v){S.ss=v;const e=$('#ss');if(e)e.textContent=ssText()}
function queue(){setSS('pending');clearTimeout(pt);pt=setTimeout(push,1500)}
function drop(quiet){S.tok='';S.user='';save();if(!quiet)toast('Signed out');if(!S.skip)obStart();else if(T.tab==3)render()}
function apply(d,u){SK.forEach(k=>{if(d[k]!==undefined&&(S[k]==null||typeof d[k]==typeof S[k]))S[k]=d[k]});if(!Array.isArray(S.logs))S.logs=[];S.updated=u;fp=JSON.stringify(sd());save();theme();render()}
function mergeIn(d){const ids=new Set(S.logs.map(l=>l.id)),du=d.unit=='kg'?'kg':'lb';(d.logs||[]).forEach(l=>{if(l&&!ids.has(l.id))S.logs.push(du==S.unit?l:{...l,w:cvt(l.w,du,S.unit)})});const cn=new Set(S.custom.map(c=>c.n));(d.custom||[]).forEach(c=>{if(c&&!cn.has(c.n))S.custom.push(c)});
 if(d.setup)S.setup=1;if(d.rt&&typeof d.rt=='object'&&!S.setup)S.rt={...S.rt,...d.rt};S.name=S.name||d.name||'';if(d.goal)S.goal=d.goal;S.prof={...(d.prof||{}),...S.prof};const bt=new Set(S.body.map(b=>b.t));(d.body||[]).forEach(b=>{if(b&&!bt.has(b.t))S.body.push(b)});S.body.sort((a,b)=>a.t-b.t);if(!S.split&&d.split)S.split=d.split}
async function push(){if(!S.tok)return;if(!navigator.onLine)return setSS('offline');setSS('syncing');try{const r=await api('sync',{action:'push',token:S.tok,data:sd(),updated:S.updated});if(r.conflict)apply(r.data,r.updated);else setSS('ok')}catch(e){e.status==401?drop(true):setSS('offline')}}
async function pullLWW(){if(!S.tok||!navigator.onLine)return;try{const r=await api('sync',{action:'pull',token:S.tok});if(r.data&&r.updated>(S.updated||0))apply(r.data,r.updated);else if(!r.data||r.updated<(S.updated||0))await push();else setSS('ok')}catch(e){e.status==401?drop(true):setSS('offline')}}
async function doAuth(a){const user=($('#au').value||'').trim().toLowerCase(),pass=$('#ap').value||'';
 if(!/^[a-z0-9_]{3,24}$/.test(user))return obErr('Username: 3 to 24 letters, numbers or _');if(pass.length<6)return obErr('Passcode needs 6+ characters');
 const b=$('#ogo');if(b){b.disabled=true;b.textContent='One moment…'}
 try{const r=await api('auth',{action:a,user,pass});S.tok=r.token;S.user=user;S.skip=0;if(r.data)mergeIn(r.data);fp='';S.updated=Date.now();save();clearTimeout(pt);push();theme();afterAuth()}
 catch(e){if(b){b.disabled=false;b.textContent=a=='signup'?'Create account':'Sign in'}if(e.code==='closed'){obMode('login');obErr(ERR.closed)}else obErr(errText(e))}}

/* ---------- AI features ---------- */
function cleanPlan(j,allowed){if(!j||!Array.isArray(j.items))return null;const items=[],seen=new Set();
 for(const a of j.items){const ex=String(a&&a.ex||'');if(seen.has(ex)||!(allowed?allowed.has(ex):libMap().has(ex)))continue;seen.add(ex);let reps=String(a.reps||'').replace(/\s/g,'');if(!/^\d{1,2}(-\d{1,2})?$/.test(reps))reps='8-12';const w=+a.w;
  items.push({ex,sets:clamp(Math.round(+a.sets)||3,1,8),reps,w:w>0&&w<2000?f1(w):0,rest:clamp(Math.round(+a.rest)||restFor(reps,grp(ex)),20,300),note:cap(a.note||'').slice(0,100)})}
 if(allowed?items.length<Math.ceil(allowed.size/2):items.length<2)return null;
 return{title:cap(j.title||'').slice(0,28),est_min:clamp(Math.round(+j.est_min)||0,0,240),items,tips:(Array.isArray(j.tips)?j.tips:[]).map(t=>cap(t).slice(0,150)).filter(Boolean).slice(0,3)}}
function planInput(){const b=localPlan(),d=splitDay(),names=b.items.map(i=>i.ex),x={unit:S.unit,p:profAI(),wk:new Date().toLocaleDateString('en-US',{weekday:'long'}),goalDays:S.goal,vol:weeks(1)[0].byGroup,since:S.logs.length?dayNo(Math.max(...S.logs.map(l=>l.t))):null};
 if(d){x.day={name:d.day.name,ex:d.day.ex.map(e=>({n:e.n,s:e.s,r:e.r}))};x.hist=names.map(n=>({n,g:grp(n),h:hist(n,4)}))}
 else{const c=recent(90).slice(0,14);x.cand=c;x.hist=c.map(n=>({n,g:grp(n),h:hist(n,4)}))}
 return{x,allowed:d?new Set(names):null,key:b.key}}
async function aiPlan(force){if(!S.tok||T.busy.plan)return;const{x,allowed,key}=planInput();if(!allowed&&!(x.cand&&x.cand.length))return;
 const tk='plan'+key+sod(Date.now());if(T.tried[tk]&&!force)return;T.tried[tk]=1;T.busy.plan=1;T.err.plan='';refresh(0);
 try{const p=cleanPlan(await ai('plan',x),allowed);if(!p)throw{code:'upstream',detail:'The coach returned an unusable plan'};S.ai.plan={d:sod(Date.now()),key,p};save()}
 catch(e){T.err.plan=errText(e);if(force)toast(T.err.plan)}
 T.busy.plan=0;refresh(0)}

function cleanReview(j){if(!j||!Array.isArray(j.insights))return null;const ins=j.insights.map(i=>({kind:['good','warn','tip'].includes(i&&i.kind)?i.kind:'tip',text:cap(i&&i.text||'').slice(0,150)})).filter(i=>i.text).slice(0,4);
 return ins.length?{headline:cap(j.headline||'').slice(0,40)||'Coach review',score:clamp(Math.round(+j.score)||0,0,100),insights:ins}:null}
const review=()=>{const c=S.ai.review;return c&&c.d==sod(Date.now())&&c.r?{...c.r,src:'ai'}:localReview()};
async function aiReview(force){if(!S.tok||T.busy.review||S.logs.length<3)return;const tk='rev'+sod(Date.now());if(T.tried[tk]&&!force)return;T.tried[tk]=1;T.busy.review=1;T.err.review='';refresh(0);
 try{const r=cleanReview(await ai('review',{unit:S.unit,p:profAI(),goalDays:S.goal,weeks:weeks(4).map(w=>({wk:w.wk,sessions:w.sessions,sets:w.sets,volume:w.volume,byGroup:w.byGroup})),prs:records().slice(0,6).map(r=>({ex:r.ex,e1rm:Math.round(r.e),daysAgo:dayNo(r.d)})),stalls:stalls().slice(0,4),split:S.split?S.split.days.map(d=>d.name+': '+d.ex.map(e=>e.n).join(', ')):null}));
  if(!r)throw{code:'upstream',detail:'The coach returned an unusable review'};S.ai.review={d:sod(Date.now()),r};save()}
 catch(e){T.err.review=errText(e);if(force)toast(T.err.review)}
 T.busy.review=0;refresh(0)}

async function aiLift(){const x=S.sel,it=plan().items.find(i=>i.ex==x);
 const j=await ai('lift',{unit:S.unit,p:profAI(),ex:x,g:grp(x),h:hist(x,6),range:it?parseRange(it.reps):null});
 const w=+j.w,r=Math.round(+j.r);if(!(w>0&&w<2000&&r>=1&&r<=30))throw{code:'upstream',detail:'Unusable suggestion'};
 return{w:f1(w),r,rest:clamp(Math.round(+j.rest)||restFor('8-12',grp(x)),20,300),why:cap(j.why||'').slice(0,120)}}

function cleanSplit(j){if(!j||!Array.isArray(j.days))return null;const days=[];
 for(const d of j.days.slice(0,14)){const ex=[];for(const e of(Array.isArray(d.ex)?d.ex:[]).slice(0,24)){const n=cap(e&&e.n||'').slice(0,40);if((n.match(/[a-z]/ig)||[]).length<3||ex.some(q=>q.n.toLowerCase()==n.toLowerCase()))continue;let r=String(e.r||'8-12').replace(/\s/g,'');if(!/^\d{1,3}(-\d{1,3})?$/.test(r))r='8-12';
   ex.push({n,g:G.includes(e.g)?e.g:guessGroup(n),s:clamp(Math.round(+e.s)||3,1,10),r})}
  if(ex.length)days.push({name:cap(d.name||'Day '+(days.length+1)).slice(0,30),wd:Number.isInteger(d.wd)&&d.wd>=0&&d.wd<=6?d.wd:null,ex})}
 return days.length?{name:cap(j.name||'My split').slice(0,30),days}:null}
function annotate(res){res.days.forEach(d=>d.ex.forEach(e=>{const m=match(e.n);if(m){e.n=m.n;e.g=m.g;e.isNew=0}else e.isNew=1}));return res}
function commitSplit(res){const have=new Set(lib().map(e=>e.n.toLowerCase()));
 res.days.forEach(d=>d.ex.forEach(e=>{if(e.isNew&&!have.has(e.n.toLowerCase())){S.custom.push({n:e.n,g:e.g,c:1});have.add(e.n.toLowerCase())}}));
 S.split={name:res.name,t:Date.now(),days:res.days.map(d=>({name:d.name,wd:d.wd,ex:d.ex.map(e=>({n:e.n,s:e.s,r:e.r}))}))};S.ai.plan=null;T.tried={};save()}
async function readSplit(text){text=String(text).trim();if(!text)return toast('Paste your split first');T.sp.text=text;T.sp.busy=1;T.sp.msg='';renderSheet();let res=null,how='';
 if(S.tok){try{res=cleanSplit(await ai('parse',{text:text.slice(0,14000)}));how='ai'}catch(e){T.sp.msg=errText(e)+' Read it without AI instead.'}}
 if(!res){const l=parseLocal(text);res=l.days.length?l:null;how='local';if(!S.tok)T.sp.msg='Sign in to have the coach read messy splits. This is a basic read.'}
 T.sp.busy=0;if(!res){T.sp.msg='Could not find any exercises. Put one exercise per line, with a day heading above each group.';T.sp.stage='paste'}else{T.sp.res=annotate(res);T.sp.how=how;T.sp.stage='preview'}renderSheet()}

/* forecast */
const fcKey=(x,m,w)=>[x,m,w,S.logs.length].join('|');
function fcInput(x,m,w){const s=ser(x,m),now=sod(Date.now());const pl=planFor(x);
 return{unit:S.unit,p:profAI(),ex:x,g:grp(x),metric:m=='w'?'weight':'e1rm',cur:s[s.length-1][1],hist:s.slice(-24).map(p=>[dayNo(p[0]),p[1]]),weeks:w,plan:pl,freq:f1(sess(x).filter(c=>c.d>=now-28*DAY).length/4)}}
function cleanFc(j,w,cur){if(!j||!Array.isArray(j.pts)||j.pts.length<w)return null;const num=a=>a.slice(0,w).map(Number),pts=num(j.pts);if(pts.some(v=>!isFinite(v)))return null;
 const p=pts.map(v=>f1(clamp(v,cur*.9,cur*1.6)));let low=Array.isArray(j.low)&&j.low.length>=w?num(j.low):null,high=Array.isArray(j.high)&&j.high.length>=w?num(j.high):null;
 if(!low||low.some(v=>!isFinite(v)))low=p.map((v,i)=>v-(v-cur)*.5-cur*.004*(i+1));if(!high||high.some(v=>!isFinite(v)))high=p.map((v,i)=>v+(v-cur)*.5+cur*.004*(i+1));
 const ms=(Array.isArray(j.milestones)?j.milestones:[]).map(m=>({label:cap(m&&m.label||'').slice(0,30),week:Math.round(+(m&&m.week))})).filter(m=>m.label&&m.week>=1&&m.week<=w).slice(0,2);
 return{pts:p,low:low.map((v,i)=>f1(Math.min(v,p[i]))),high:high.map((v,i)=>f1(Math.max(v,p[i]))),weeks:w,summary:cap(j.summary||'').slice(0,170),milestones:ms,src:'ai'}}
function fcGet(){const x=S.cx,m=S.m,w=S.fw;if(!x||x=='__bw'||sess(x).length<1)return null;const c=S.ai.fc&&S.ai.fc[fcKey(x,m,w)];return c&&c.d==sod(Date.now())?c.r:localForecast(x,m,w)}
async function aiForecast(force){const x=S.cx,m=S.m,w=S.fw;if(S.ct!='f'||!S.tok||!x||x=='__bw'||sess(x).length<1)return;const key=fcKey(x,m,w),c=S.ai.fc&&S.ai.fc[key];
 if(c&&c.d==sod(Date.now())&&!force)return;if(T.busy.fc||(T.tried['fc'+key]&&!force))return;T.tried['fc'+key]=1;T.busy.fc=1;T.err.fc='';refresh(2);
 try{const inp=fcInput(x,m,w),r=cleanFc(await ai('forecast',inp),w,inp.cur);if(!r)throw{code:'upstream',detail:'The coach returned an unusable forecast'};
  S.ai.fc=S.ai.fc||{};S.ai.fc[key]={d:sod(Date.now()),r};const ks=Object.keys(S.ai.fc);if(ks.length>14)delete S.ai.fc[ks[0]];save()}
 catch(e){T.err.fc=errText(e);if(force)toast(T.err.fc)}
 T.busy.fc=0;refresh(2)}

/* chat */
function ctx(){return{focus:T.focus||null,unit:S.unit,p:profAI(),goalDays:S.goal,split:S.split?S.split.days.map(d=>({name:d.name,ex:d.ex.map(e=>e.n+' '+e.s+'x'+e.r)})):null,weeks:weeks(4).map(w=>({sessions:w.sessions,sets:w.sets,volume:w.volume,byGroup:w.byGroup})),lifts:recent(28).slice(0,14).map(x=>({n:x,g:grp(x),h:hist(x,4)})),prs:records().slice(0,5).map(r=>({ex:r.ex,e1rm:Math.round(r.e),daysAgo:dayNo(r.d)})),stalls:stalls().slice(0,4),today:todayLogs().map(l=>[l.ex,l.w,l.r])}}
async function chatSend(q){q=String(q).replace(/\s+/g,' ').trim().slice(0,500);if(!q||T.chatBusy)return;if(!S.tok)return toast('Sign in to chat with the coach');T.chat.push({r:'u',t:q});T.chatBusy=1;save();renderChat();
 try{const j=await ai('chat',{q,hist:T.chat.filter(m=>!m.err).slice(-9,-1).map(m=>({r:m.r,t:m.t.slice(0,600)})),ctx:ctx()}),rep=String(j&&j.reply||'').trim().slice(0,1600);if(!rep)throw{code:'upstream',detail:'Empty answer'};
  const f=(Array.isArray(j.follow)?j.follow:[]).map(x=>cap(x).slice(0,48)).filter(Boolean).slice(0,3);T.chat.push({r:'c',t:rep,f});if(T.chat.length>40)T.chat.splice(0,T.chat.length-40);save()}
 catch(e){T.chat.push({r:'c',t:errText(e),err:1})}
 T.chatBusy=0;renderChat()}

/* connection test */
async function testAI(){T.aist='Checking…';updAist();
 try{let h=null;try{h=await(await fetch('/api/health')).json()}catch(e){}
  if(!h)T.aist=ERR.nobackend;else if(!h.kv)T.aist=ERR.no_kv;else if(!h.key)T.aist=ERR.no_key;else if(!S.tok)T.aist='Server is ready. Sign in to use the coach.';
  else{const j=await ai('ping',{});T.aist='Connected'+(j.model?' · '+j.model:'')}}
 catch(e){T.aist=errText(e)}updAist()}
const updAist=()=>{const e=$('#aist');if(e)e.textContent=T.aist||'Not tested'};
