'use strict';
const KEY='ivory.v1',DAY=864e5,$=s=>document.querySelector(s),V=$('#v');
const G=['Chest','Back','Legs','Shoulders','Arms','Core'];
const GH={Chest:215,Back:188,Legs:268,Shoulders:38,Arms:330,Core:150};
const BASE={
 Chest:['Chest Press','Incline Press','Pec Deck','Cable Fly','Bench Press','Incline Bench Press','Dumbbell Bench Press','Incline Dumbbell Press','Assisted Dip','Smith Machine Bench Press'],
 Back:['Lat Pulldown','Seated Row','Low Row','Assisted Pull-Up','Barbell Row','Dumbbell Row','T-Bar Row','Cable Row','Straight-Arm Pulldown','Back Extension','Deadlift'],
 Legs:['Leg Press','Leg Extension','Leg Curl','Seated Leg Curl','Hack Squat','Squat','Smith Machine Squat','Romanian Deadlift','Walking Lunge','Bulgarian Split Squat','Calf Raise','Seated Calf Raise','Hip Abductor','Hip Adductor','Hip Thrust','Glute Kickback'],
 Shoulders:['Shoulder Press','Overhead Press','Dumbbell Shoulder Press','Lateral Raise','Cable Lateral Raise','Rear Delt Fly','Face Pull','Upright Row','Shrug'],
 Arms:['Bicep Curl','Preacher Curl','Hammer Curl','Cable Curl','Tricep Pushdown','Tricep Extension','Skull Crusher','Overhead Tricep Extension','Close-Grip Bench Press'],
 Core:['Ab Crunch','Torso Rotation','Cable Crunch','Hanging Leg Raise','Weighted Plank']
};
const SK=['logs','custom','name','unit','goal','theme','prof','body','split','setup','rt'];
const LB=2.20462;
let S={logs:[],custom:[],name:'',unit:'lb',goal:4,theme:'auto',prof:{},body:[],split:null,setup:0,skip:0,rt:{auto:1,snd:1,def:90},tok:'',user:'',updated:0,ss:'ok',sel:'Chest Press',w:100,r:10,m:'e1',rg:90,cx:'',fc:0,ct:'p',fw:8,ai:{},chat:[]};
try{Object.assign(S,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
(function fix(){const o=x=>x&&typeof x=='object'&&!Array.isArray(x);
 if(!Array.isArray(S.logs))S.logs=[];if(!Array.isArray(S.custom))S.custom=[];if(!Array.isArray(S.body))S.body=[];
 if(!o(S.prof))S.prof={};if(!o(S.ai))S.ai={};if(!o(S.split)||!Array.isArray(S.split.days))S.split=null;
 if(!Array.isArray(S.chat))S.chat=[];S.chat=S.chat.filter(m=>m&&!m.err&&typeof m.t=='string').slice(-40);S.ct=S.ct=='f'?'f':'p';
 if(!o(S.rt))S.rt={};S.rt={auto:S.rt.auto===0?0:1,snd:S.rt.snd===0?0:1,def:Math.min(300,Math.max(30,Math.round(+S.rt.def||90)))};S.setup=S.setup?1:0;
 S.goal=Math.min(7,Math.max(1,+S.goal||4));if(S.unit!='kg')S.unit='lb'})();
const T={tab:0,busy:{},tried:{},err:{},chat:S.chat,chatBusy:0,sheet:'',lib:{q:'',g:'All'},sp:{text:'',stage:'paste',res:null,busy:0,msg:''},fc:{},aist:''};
let fp='',pt=0,_ix=null,_lm=null;

/* ---------- helpers ---------- */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f1=x=>+(+x).toFixed(1),clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const sod=t=>{const d=new Date(t);d.setHours(0,0,0,0);return+d};
const dayNo=t=>Math.round((sod(Date.now())-sod(t))/DAY);
const wkStart=t=>{const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return+d};
const when=t=>{const d=dayNo(t);return d<1?'Today':d==1?'Yesterday':d<7?d+' days ago':new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric'})};
const fv=v=>v>=1e4?(v/1e3).toFixed(1)+'k':Math.round(v).toLocaleString();
const buzz=()=>navigator.vibrate&&navigator.vibrate(8);
const cap=s=>String(s).replace(/\s+/g,' ').trim();
const sd=()=>Object.fromEntries(SK.map(k=>[k,S[k]]));
fp=JSON.stringify(sd());
function save(){_ix=null;_lm=null;const f=JSON.stringify(sd());if(f!==fp){fp=f;S.updated=Date.now();if(S.tok)queue()}try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),m.length>60?3800:2000)}

/* units and profile */
const P=()=>S.prof;
const dispW=kg=>S.unit=='kg'?kg:kg*LB, toKg=v=>S.unit=='kg'?v:v/LB;
const inches=cm=>Math.round(cm/2.54);
/* Lift weights are stored in the unit shown, so switching converts every stored weight (4 decimals, so toggling back is lossless). */
const cvt=(w,from,to)=>{if(from==to)return w;const v=+(w*(to=='kg'?1/LB:LB)).toFixed(4),r=Math.round(v*100)/100;return Math.abs(r-v)<.0011?r:v};
function setUnit(u){if(u!='kg'&&u!='lb'||u==S.unit)return;const from=S.unit;S.logs.forEach(l=>{l.w=cvt(l.w,from,u)});
 S.w=u=='kg'?Math.round(S.w/LB*2)/2:Math.round(S.w*LB);S.unit=u;S.ai={};T.tried={};T.fc={};save()}
function profAI(){const p=P(),o={};['age','sex','h','w','bf','goal','exp'].forEach(k=>{if(p[k]!==undefined&&p[k]!==''&&p[k]!==null)o[k]=p[k]});return o}

/* ---------- exercise library ---------- */
const STOP=new Set(['machine','the','a','an','with','on']),ALIAS={db:'dumbbell',dumbell:'dumbbell',bb:'barbell',lats:'lat',pulldowns:'pulldown'};
const tk=s=>String(s).toLowerCase().replace(/&/g,' and ').replace(/\(.*?\)/g,' ').replace(/[^a-z0-9]+/g,' ').trim().split(' ').filter(Boolean).map(w=>ALIAS[w]||w).filter(w=>!STOP.has(w)).map(w=>w.length>3&&w.endsWith('s')&&!w.endsWith('ss')?w.slice(0,-1):w);
const nk=s=>tk(s).join('');
function libMap(){if(_lm)return _lm;const m=new Map();for(const g of G)for(const x of BASE[g])m.set(x,{n:x,g});for(const c of S.custom)if(c&&c.n&&!m.has(c.n))m.set(c.n,{n:c.n,g:G.includes(c.g)?c.g:'Core',c:1});return _lm=m}
const lib=()=>[...libMap().values()];
const grp=x=>(libMap().get(x)||{g:'Other'}).g;
function match(name){const k=nk(name);if(!k)return null;const ta=new Set(tk(name));let best=null,bs=0;for(const e of libMap().values()){if(nk(e.n)===k)return e;const tb=tk(e.n),i=tb.filter(t=>ta.has(t)).length,sc=i/(ta.size+tb.length-i);if(sc>bs){bs=sc;best=e}}return bs>=.75?best:null}
const GUESS=[[/romanian|rdl|stiff.?leg|leg press|squat|lunge|leg (curl|ext)|calf|hip |glute|hamstring|quad|hack|step.?up/i,'Legs'],[/shoulder|overhead|ohp|military|lateral raise|front raise|rear delt|face pull|upright row|shrug|delt/i,'Shoulders'],[/tricep|bicep|curl|pushdown|skull|preacher|hammer|forearm|extension/i,'Arms'],[/row|pulldown|pull.?up|chin.?up|\blat\b|deadlift|back ext|pullover/i,'Back'],[/bench|chest|pec|fly|flye|push.?up|dip|press/i,'Chest'],[/crunch|\babs?\b|plank|sit.?up|core|rotation|leg raise|woodchop/i,'Core']];
const guessGroup=n=>{for(const[r,g]of GUESS)if(r.test(n))return g;return'Core'};

/* ---------- analytics ---------- */
const e1=l=>l.w*(1+l.r/30);
function ix(){if(_ix)return _ix;const m=new Map();for(const l of S.logs){const d=sod(l.t),e=e1(l);let a=m.get(l.ex);if(!a)m.set(l.ex,a=new Map());const c=a.get(d);if(!c)a.set(d,{d,w:l.w,r:l.r,e,mw:l.w,t:l.t});else{if(e>c.e){c.w=l.w;c.r=l.r;c.e=e}if(l.w>c.mw)c.mw=l.w;if(l.t>c.t)c.t=l.t}}
 const o=new Map();for(const[k,a]of m)o.set(k,[...a.values()].sort((x,y)=>x.d-y.d));return _ix=o}
const sess=x=>ix().get(x)||[];
const last=x=>{let b=null;for(const l of S.logs)if(l.ex==x&&(!b||l.t>b.t))b=l;return b};
const hist=(x,k)=>sess(x).slice(-k).reverse().map(c=>[dayNo(c.d),f1(c.w),c.r]);
const ser=(x,m)=>sess(x).map(c=>[c.d,m=='w'?f1(c.mw):Math.round(c.e*10)/10]);
const todayLogs=()=>{const t=sod(Date.now());return S.logs.filter(l=>l.t>=t)};
const doneSets=x=>todayLogs().filter(l=>l.ex==x).length;
function weeks(k){const w0=wkStart(Date.now()),o=[];for(let i=0;i<k;i++)o.push({wk:i,days:new Set(),sets:0,volume:0,byGroup:{}});
 for(const l of S.logs){const i=Math.round((w0-wkStart(l.t))/(7*DAY));if(i<0||i>=k)continue;const a=o[i];a.days.add(sod(l.t));a.sets++;a.volume+=l.w*l.r;const g=grp(l.ex);a.byGroup[g]=(a.byGroup[g]||0)+1}
 return o.map(a=>({wk:a.wk,sessions:a.days.size,sets:a.sets,volume:Math.round(a.volume),byGroup:a.byGroup,dset:a.days}))}
function streak(){const ds=new Set(S.logs.map(l=>sod(l.t)));let d=sod(Date.now()),s=0;if(!ds.has(d))d-=DAY;while(ds.has(d)){s++;d-=DAY}return s}
function records(){const out=new Map();for(const[x,a]of ix()){if(a.length<2)continue;let mx=a[0].e;for(let i=1;i<a.length;i++){if(a[i].e>mx*1.001){out.set(x,{ex:x,w:a[i].w,r:a[i].r,e:a[i].e,d:a[i].d,gain:a[i].e/mx-1});mx=a[i].e}}}
 return[...out.values()].sort((a,b)=>b.d-a.d)}
function stalls(){const o=[],lim=sod(Date.now())-21*DAY;for(const[x,a]of ix()){if(a.length<4||a[a.length-1].d<lim)continue;const L=a.slice(-3),Pv=a.slice(-9,-3);if(!Pv.length)continue;const pm=Math.max(...Pv.map(c=>c.e)),lm=Math.max(...L.map(c=>c.e));if(lm<=pm*1.005&&L[2].d-L[0].d>=7*DAY)o.push({ex:x,sessions:3,e1rm:Math.round(pm)})}return o}
const recent=(k=21)=>{const lim=sod(Date.now())-k*DAY,o=[];for(const[x,a]of ix())if(a[a.length-1].d>=lim)o.push(x);return o.sort((a,b)=>sess(b).slice(-1)[0].t-sess(a).slice(-1)[0].t)};

/* ---------- split ---------- */
const parseRange=r=>{const m=String(r||'').match(/(\d{1,3})\s*(?:-|–|to)\s*(\d{1,3})/);if(m)return[+m[1],Math.max(+m[1],+m[2])];const s=String(r||'').match(/\d{1,3}/);return s?[+s[0],+s[0]]:[8,12]};
function bestDay(logs){const sp=S.split;if(!sp)return -1;const ex=new Set(logs.map(l=>l.ex));let bi=-1,bc=0;sp.days.forEach((d,i)=>{const c=d.ex.filter(e=>ex.has(e.n)).length;if(c>bc){bc=c;bi=i}});return bi}
function splitDay(){const sp=S.split;if(!sp||!sp.days.length)return null;const n=sp.days.length;let i=0;
 if(sp.days.every(d=>d.wd!=null)){const wd=new Date().getDay();i=sp.days.findIndex(d=>d.wd==wd);if(i<0){let bd=8;sp.days.forEach((d,j)=>{const df=(d.wd-wd+7)%7;if(df&&df<bd){bd=df;i=j}});if(i<0)i=0}}
 else{const t0=sod(Date.now()),td=S.logs.filter(l=>l.t>=t0),k=td.length?bestDay(td):-1;
  if(k>=0)i=k;else if(S.logs.length){const ld=Math.max(...S.logs.map(l=>sod(l.t))),k2=bestDay(S.logs.filter(l=>sod(l.t)==ld));i=k2>=0?(k2+1)%n:0}}
 return{i,day:sp.days[i]}}
function splitText(){const sp=S.split;if(!sp)return'';return sp.days.map(d=>d.name+':\n'+d.ex.map(e=>e.n+' '+e.s+'x'+e.r).join('\n')).join('\n\n')}

/* ---------- local coaching (used when AI is unavailable) ---------- */
function nextSet(x,range){const[lo,hi]=range||[8,12],c=sess(x).slice(-1)[0],st=S.unit=='kg'?2.5:5;
 if(!c)return{w:null,r:Math.round((lo+hi)/2),why:'No history yet. Pick a weight you can lift for '+Math.round((lo+hi)/2)+' clean reps with 2 in reserve.'};
 if(c.r>=hi)return{w:f1(c.w+st),r:lo,why:'Hit '+c.r+' reps at '+f1(c.w)+'. Add weight and reset to '+lo+' reps.'};
 return{w:f1(c.w),r:Math.min(c.r+1,hi),why:'Last best was '+f1(c.w)+' × '+c.r+'. Add a rep.'}}
const restFor=(reps,g)=>{const hi=parseRange(reps)[1];return g=='Core'||g=='Arms'?60:hi<=6?150:hi<=10?105:75};
function mkItem(ex,sets,reps){const ns=nextSet(ex,parseRange(reps));return{ex,sets:sets||3,reps:reps||'8-12',w:ns.w,tr:ns.r,rest:restFor(reps||'8-12',grp(ex)),note:ns.why}}
function localPlan(){const d=splitDay();
 if(d)return{key:'s'+d.i,title:d.day.name,items:d.day.ex.map(e=>mkItem(e.n,e.s,e.r)),tips:[],src:'split',label:S.split.days.length>1?'Day '+(d.i+1)+' of '+S.split.days.length:''};
 const v=weeks(1)[0].byGroup,used=recent(60),pick=[],seen=new Set();
 [...G].sort((a,b)=>(v[a]||0)-(v[b]||0)).forEach(g=>{const x=used.find(u=>grp(u)==g&&!seen.has(u));if(x&&pick.length<5){pick.push(x);seen.add(x)}});
 return{key:'a',title:'Suggested session',items:pick.map(x=>mkItem(x,3,'8-12')),tips:[],src:'auto',label:''}}
function plan(){const b=localPlan(),c=S.ai.plan;
 if(c&&c.d==sod(Date.now())&&c.key==b.key&&c.p&&c.p.items.length){const p=c.p;
  if(b.src=='split'){const m=new Map(p.items.map(i=>[i.ex,i]));b.items=b.items.map(i=>{const a=m.get(i.ex);return a?{...i,sets:a.sets,reps:a.reps,w:a.w||i.w,tr:parseRange(a.reps)[0],rest:a.rest,note:a.note||i.note}:i})}
  else b.items=p.items.map(a=>({ex:a.ex,sets:a.sets,reps:a.reps,w:a.w||nextSet(a.ex).w,tr:parseRange(a.reps)[0],rest:a.rest,note:a.note}));
  if(p.title&&b.src!='split')b.title=p.title;b.tips=p.tips||[];b.est=p.est_min;b.ai=1}
 if(!b.est)b.est=Math.round(b.items.reduce((a,i)=>a+i.sets*(1.1+i.rest/60),0)+5);
 return b}
function localReview(){const W=weeks(4),cur=W[0],out=[],avgS=avg(W.map(w=>w.sessions)),by14={};
 W.slice(0,2).forEach(w=>Object.entries(w.byGroup).forEach(([g,c])=>by14[g]=(by14[g]||0)+c));
 const tot=Object.values(by14).reduce((a,b)=>a+b,0),pr=records().filter(r=>dayNo(r.d)<=14),st=stalls(),sk=streak(),p=P();
 if(avgS>=S.goal-.25)out.push({kind:'good',text:'Averaging '+f1(avgS)+' sessions a week against a goal of '+S.goal+'. Keep the schedule.'});else out.push({kind:'warn',text:'Averaging '+f1(avgS)+' sessions a week against a goal of '+S.goal+'. Book the next one now.'});
 if(tot>=12){const gs=G.map(g=>[g,by14[g]||0]).sort((a,b)=>a[1]-b[1]),lo=gs[0],hi=gs[5];if(lo[1]<hi[1]*.4)out.push({kind:'warn',text:lo[0]+' got '+lo[1]+' sets in two weeks against '+hi[1]+' for '+hi[0]+'. Add a '+lo[0].toLowerCase()+' session.'})}
 if(st.length)out.push({kind:'warn',text:st[0].ex+' has not improved in 3 sessions. Cut weight about 10% and rebuild, or change the rep target.'});
 if(pr.length)out.push({kind:'good',text:pr.length+' new record'+(pr.length>1?'s':'')+' in two weeks, led by '+pr[0].ex+'. Keep progressing on the same lifts.'});
 if(sk>=6)out.push({kind:'warn',text:'You trained '+sk+' days in a row. Take a rest day to keep recovering.'});
 if(p.w&&out.length<4){const lo=Math.round(1.6*p.w),hi=Math.round(2.2*p.w);out.push({kind:'tip',text:'Aim for roughly '+Math.round(dispW(lo))+' to '+Math.round(dispW(hi))+(S.unit=='kg'?' g':' g')+' of protein a day at your weight.'})}
 const sc=Math.round(clamp(40+Math.min(1,avgS/S.goal)*35+(st.length?0:15)+(tot>=12&&G.every(g=>(by14[g]||0)>0)?10:0),0,100));
 return{headline:sc>=80?'Strong and consistent':sc>=60?'Solid, a few gaps':'Room to tighten up',score:sc,insights:out.slice(0,4),src:'local'}}
function planFor(x){if(!S.split)return null;let c=0,sets=0,reps='';for(const d of S.split.days){const e=d.ex.find(e=>e.n==x);if(e){c++;sets=e.s;reps=e.r}}return c?{perWeek:f1(c*S.goal/S.split.days.length),sets,reps}:null}
function localForecast(x,m,wks){const s=ser(x,m);if(!s.length)return null;const cur=s[s.length-1][1],now=sod(Date.now()),pts=s.filter(p=>p[0]>=now-84*DAY),base={new:.012,mid:.006,adv:.003}[P().exp]||.006;let g=null;
 if(pts.length>=3){const xs=pts.map(p=>(p[0]-pts[0][0])/(7*DAY)),ys=pts.map(p=>p[1]),mx=avg(xs),my=avg(ys);let nn=0,dd=0;xs.forEach((v,i)=>{nn+=(v-mx)*(ys[i]-my);dd+=(v-mx)**2});g=dd?nn/dd/my:0}
 const pf=planFor(x),gf={fat:.75,gen:.9}[P().goal]||1,r=(g==null?base:clamp(g*.6+base*.4,0,.025))*(pf?clamp(.75+pf.perWeek*.125,.75,1.15):1)*gf,pts2=[],low=[],high=[];let v=cur;
 for(let i=1;i<=wks;i++){v=v*(1+r*Math.pow(.97,i-1));const sp=(v-cur)*.6+cur*.006*Math.sqrt(i);pts2.push(f1(v));low.push(f1(Math.max(cur*.95,v-sp)));high.push(f1(v+sp))}
 const end=pts2[wks-1],step=S.unit=='kg'?2.5:5,tgt=(Math.floor(cur/step)+1)*step,wi=pts2.findIndex(p=>p>=tgt),ms=wi>=0?[{label:f1(tgt)+' '+S.unit,week:wi+1}]:[];
 return{pts:pts2,low,high,weeks:wks,summary:'At your current pace this lift reaches about '+f1(end)+' '+S.unit+' in '+wks+' weeks ('+(end>=cur?'+':'')+f1((end/cur-1)*100)+'%).',milestones:ms,src:'local',plan:pf}}

/* ---------- split text parser (fallback when AI is unavailable) ---------- */
const WDN={sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6};
const titleCase=s=>s==s.toLowerCase()||s==s.toUpperCase()?s.toLowerCase().replace(/\b[a-z]/g,c=>c.toUpperCase()):s;
function parseLocal(text){const SR=/(\d{1,2})\s*(?:x|×|\*|sets?\s*(?:of|x)?)\s*(\d{1,3}(?:\s*(?:-|–|to)\s*\d{1,3})?)/i,days=[];let cur=null;
 const HEAD=/^(push|pull|legs?|upper|lower|full\s*body|chest|back|shoulders?|arms?|core|abs)(\s*(and|&|\+|\/)\s*(push|pull|legs?|chest|back|shoulders?|arms?|triceps?|biceps?|core|abs))*$/i;
 const anySR=String(text).split(/\r?\n/).some(l=>SR.test(l));
 for(let raw of String(text).split(/\r?\n/)){let line=raw.trim();if(!line)continue;
  const bare=line.replace(/^[\s\-–—•·*>#]+/,'').replace(/^\d+[.)]\s+/,'').trim();if(!bare)continue;
  if(/^(rest|off)\b/i.test(bare)&&!SR.test(bare)){cur=null;continue}
  const hasSR=SR.test(bare),core=bare.replace(/[:\-–—]+$/,'').replace(/\b(day|workout|session)\b/ig,'').replace(/\b[abc123]\b$/i,'').replace(/\s+/g,' ').trim();
  const isHead=!hasSR&&(/:\s*$/.test(bare)||/^day\s*\d+/i.test(bare)||/^(mon|tue|wed|thu|fri|sat|sun)[a-z]*\b/i.test(bare)||HEAD.test(core));
  if(isHead){const wm=bare.match(/\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*/i);cur={name:cap(bare.replace(/[:\-–—]+$/,'')).slice(0,30),wd:wm?WDN[wm[1].toLowerCase()]:null,ex:[]};days.push(cur);continue}
  const m=bare.match(SR);let name=bare.replace(SR,' ').replace(/@\s*\d+(\.\d+)?\s*(lbs?|kg)?/ig,' ').replace(/\(.*?\)/g,' ').replace(/\s+/g,' ').replace(/^[\s\-–—:,.x×]+|[\s\-–—:,.x×]+$/g,'').trim();
  if((name.match(/[a-z]/ig)||[]).length<3)continue;
  if(!cur&&!m&&anySR)continue;
  if(!cur){cur={name:'Day '+(days.length+1),wd:null,ex:[]};days.push(cur)}
  name=titleCase(name).slice(0,40);cur.ex.push({n:name,g:guessGroup(name),s:m?clamp(+m[1],1,10):3,r:m?m[2].replace(/\s*(?:-|–|to)\s*/i,'-'):'8-12'})}
 return{name:'My split',days:days.filter(d=>d.ex.length).slice(0,14)}}
