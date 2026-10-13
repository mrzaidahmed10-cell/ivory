/* ---------- profile ---------- */
const pfEl=k=>$('#ob [data-pf='+k+']')||$('#sh [data-pf='+k+']')||$('[data-pf='+k+']');
function setProf(f,v){const p=P();v=String(v).trim();const nv=parseFloat(v),del=k=>{delete p[k]};
 if(f=='sex'||f=='goal'||f=='exp'){v?p[f]=v:del(f)}
 else if(v===''){if(f=='hc'||f=='hf'||f=='hi'){if(f=='hc'){del('h')}else{const a=pfEl('hf').value,b=pfEl('hi').value;if(a===''&&b==='')del('h')}}else del(f=='w'?'w':f)}
 else if(!isFinite(nv))return;
 else if(f=='age'){if(nv>=10&&nv<=100)p.age=Math.round(nv)}
 else if(f=='w'){if(nv>20&&nv<700)p.w=Math.round(toKg(nv)*100)/100}
 else if(f=='bf'){if(nv>=3&&nv<=60)p.bf=f1(nv)}
 else if(f=='hc'){if(nv>=100&&nv<=250)p.h=Math.round(nv)}
 else if(f=='hf'||f=='hi'){const tot=(parseFloat(pfEl('hf').value)||0)*12+(parseFloat(pfEl('hi').value)||0);if(tot>=40&&tot<=100)p.h=Math.round(tot*2.54)}
 save()}
function bodyHist(){const p=P();if(!p.w&&!p.bf)return;const d=sod(Date.now()),e={t:d,w:p.w,bf:p.bf},i=S.body.findIndex(b=>b.t==d);
 if(i>=0){if(S.body[i].w===e.w&&S.body[i].bf===e.bf)return;S.body[i]=e}else{const l=S.body[S.body.length-1];if(l&&l.w===e.w&&l.bf===e.bf)return;S.body.push(e)}
 S.body.sort((a,b)=>a.t-b.t);save()}

/* ---------- sample data ---------- */
function sample(){const E=[['Chest Press',90,2.5],['Shoulder Press',45,1.25],['Pec Deck',70,2],['Lat Pulldown',80,2.5],['Seated Row',95,0],['Bicep Curl',25,.8],['Leg Press',180,5],['Leg Curl',60,2],['Calf Raise',90,2.5]],L=[],today=sod(Date.now());
 for(let w=11;w>=0;w--)for(let j=0;j<3;j++){const da=w*7+[5,3,1][j],day=today-da*DAY,k=11-w;for(let q=0;q<3;q++){const[ex,b,g]=E[j*3+q],wt=S.unit=='kg'?Math.round((b+g*k)/LB/2.5)*2.5:Math.round((b+g*k)/2.5)*2.5;for(let s=0;s<3;s++)L.push({id:'s'+day+ex.length+q+s,ex,w:wt,r:10-s-(k%3==0?1:0),t:day+(17+q*.25)*36e5+s*6e5})}}
 return L}

/* ---------- actions ---------- */
function loadEx(x){S.sel=x;const it=plan().items.find(i=>i.ex==x),l=last(x);S.w=it&&it.w?it.w:l?f1(l.w):S.w;S.r=it?it.tr:l?l.r:S.r;save()}
const adj=(k,d)=>{S[k]=Math.max(k=='r'?1:0,Math.round((+S[k]+d)*10)/10);$(k=='w'?'#iw':'#ir').value=S[k];save()};
function rdef(d){S.rt.def=Math.min(300,Math.max(30,S.rt.def+d));if(!R.run&&R.left==R.total){R.total=R.left=S.rt.def}save();const e=$('#rdv');if(e)e.textContent=mmss(S.rt.def)}
const A={
 go1(){go(1)},acct(){closeSheet();S.skip=0;T.ob.mode='login';obStart()},acct2(){A.acct()},
 wd(v){adj('w',+v)},repeat(){const l=last(S.sel);if(!l)return;S.w=f1(l.w);S.r=l.r;save();render()},body(){openSheet('body')},
 'w-':()=>adj('w',-(S.unit=='kg'?2.5:5)),'w+':()=>adj('w',S.unit=='kg'?2.5:5),'r-':()=>adj('r',-1),'r+':()=>adj('r',1),
 log(){const w=+S.w,r=+S.r;if(!(w>0)||!(r>0))return toast('Enter weight and reps');const prev=sess(S.sel),L={id:Date.now()+'',ex:S.sel,w,r,t:Date.now()},pr=prev.length&&e1(L)>Math.max(...prev.map(c=>c.e))*1.001,it=plan().items.find(i=>i.ex==S.sel);
  S.logs.push(L);save();toast(pr?'New personal best · '+S.sel:'Set logged');if(S.rt.auto)restStart(it?it.rest:S.rt.def);render()},
 del(v){S.logs=S.logs.filter(l=>l.id!=v);save();render()},
 pick(v){loadEx(v);go(1)},
 pickx(v){loadEx(v);if(T.sheet)closeSheet();render();scrollTo({top:0,behavior:'smooth'})},
 start(){const p=plan(),it=p.items.find(i=>doneSets(i.ex)<i.sets)||p.items[0];if(it)loadEx(it.ex);go(1)},
 plan(){aiPlan(1)},review(){aiReview(1)},
 chart(v){S.cx=v;go(2)},m(v){S.m=v;render()},rg(v){S.rg=+v;render()},ct(v){S.ct=v=='f'?'f':'p';save();render()},fx(v){S.cx=v;save();render();scrollTo({top:0,behavior:'smooth'})},fcr(){aiForecast(1)},fw(v){S.fw=+v;save();render()},
 async suggest(_,el){if(el.dataset.b)return;el.dataset.b=1;const lab=el.innerHTML;el.innerHTML=SPK+'&nbsp;Thinking…';let r,src='local';
  if(S.tok){try{r=await aiLift();src='ai'}catch(e){toast(errText(e)+' Using a quick suggestion.')}}
  if(!r){const it=plan().items.find(i=>i.ex==S.sel),n=nextSet(S.sel,it?parseRange(it.reps):null);r={w:n.w||S.w,r:n.r,why:n.why}}
  S.w=r.w;S.r=r.r;save();const iw=$('#iw');if(iw){iw.value=r.w;$('#ir').value=r.r;const y=$('#why');y.textContent=(src=='ai'?'Coach: ':'')+r.why+(r.rest?' Rest about '+r.rest+'s.':'');y.classList.add('sel')}el.dataset.b='';el.innerHTML=lab},
 finish(){T.focus=pageFocus();openSheet('chat');if(S.tok&&!T.chatBusy)chatSend("Review today's session: what went well, and what should I change next time?")},
 /* sheets */
 chat(){openChat('',pageFocus())},closes(){closeSheet()},clearchat(){T.chat.length=0;save();renderSheet();renderChat()},
 cask(_,el){const i=el.parentNode.querySelector('input');if(!i||!i.value.trim())return;const q=i.value;i.value='';openChat(q,pageFocus())},cq(v){openChat(v,pageFocus())},
 send(){const i=$('#cq');if(!i)return;const q=i.value;i.value='';chatSend(q)},q(v){chatSend(v)},
 lib(){openSheet('lib')},lg(v){T.lib.g=v;renderSheet()},
 custom(){openSheet('custom');setTimeout(()=>{const i=$('#cn');i&&i.focus()},380)},
 savec(){const x=cap($('#cn').value);if(!x)return toast('Enter a name');if(lib().some(e=>e.n.toLowerCase()==x.toLowerCase()))return toast('That exercise already exists');S.custom.push({n:x,g:$('#cg').value,c:1});save();loadEx(x);T.lib.q='';T.lib.g='All';closeSheet();toast('Added '+x);render()},
 split(){T.sp={text:T.sp.text,stage:'paste',res:null,busy:0,msg:'',how:''};openSheet('split')},
 readsp(){const t=$('#spt');readSplit(t?t.value:T.sp.text)},
 spback(){T.sp.stage='paste';renderSheet()},
 spuse(){if(!T.sp.res)return;commitSplit(T.sp.res);const nm=T.sp.res.days.length;T.sp={text:'',stage:'paste',res:null,busy:0,msg:'',how:''};closeSheet();toast('Split saved · '+nm+' day'+(nm>1?'s':''));const d=splitDay();if(d&&d.day.ex[0])loadEx(d.day.ex[0].n);render()},
 splitclear(){if(confirm('Remove your workout split? Logged sets stay.')){S.split=null;S.ai.plan=null;save();render();toast('Split removed')}},
 /* rest */
 rtog(){R.run?restPause():R.pz&&R.left>0?restResume():restStart()},rset(v){restStart(+v)},rreset(){restReset()},radd(v){restAdd(+v)},r15(){restAdd(15)},rskip(){restReset()},
 rauto(){S.rt.auto=S.rt.auto?0:1;save();render()},rsnd(){S.rt.snd=S.rt.snd?0:1;save();if(S.rt.snd)chime();render()},
 'rd-'(){rdef(-15)},'rd+'(){rdef(15)},
 /* sign in + setup */
 omode(v){obMode(v)},ogo(){doAuth(T.ob.mode)},oskip(){S.skip=1;save();T.ob.step=needSetup()?0:null;T.ob.step===null?obEnd():(obRender(),OB.scrollTop=0)},
 osex(v,el){setProf('sex',v);el.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el))},
 ounit(v){setUnit(v);obRender()},
 ogoal(v,el){setProf('goal',v);el.parentNode.querySelectorAll('.oc').forEach(b=>b.classList.toggle('on',b===el))},
 oexp(v,el){setProf('exp',v);el.parentNode.querySelectorAll('.oc').forEach(b=>b.classList.toggle('on',b===el))},
 obf(v){setProf('bf',v);const i=$('#obf');if(i)i.value=v},
 oback(){if(T.ob.step>0){T.ob.step--;obRender();OB.scrollTop=0}},
 onext(){if(T.ob.step>=OBS.length-1)obFinish();else{T.ob.step++;obRender();OB.scrollTop=0}},
 /* settings */
 unit(v){setUnit(v);render();toast('Converted your lift weights to '+v)},theme(v){S.theme=v;save();theme();render()},
 'g-'(){S.goal=Math.max(1,S.goal-1);$('#gv').textContent=S.goal;save()},'g+'(){S.goal=Math.min(7,S.goal+1);$('#gv').textContent=S.goal;save()},
 sample(){S.logs=S.logs.filter(l=>!String(l.id).startsWith('s')).concat(sample());if(!S.split){S.split={name:'Push Pull Legs',t:Date.now(),days:[{name:'Push',wd:null,ex:[{n:'Chest Press',s:3,r:'8-10'},{n:'Shoulder Press',s:3,r:'8-10'},{n:'Pec Deck',s:3,r:'10-12'}]},{name:'Pull',wd:null,ex:[{n:'Lat Pulldown',s:3,r:'8-10'},{n:'Seated Row',s:3,r:'8-10'},{n:'Bicep Curl',s:3,r:'10-12'}]},{name:'Legs',wd:null,ex:[{n:'Leg Press',s:3,r:'8-10'},{n:'Leg Curl',s:3,r:'10-12'},{n:'Calf Raise',s:3,r:'10-12'}]}]}}
  S.ai.plan=null;T.tried={};save();toast('Sample data loaded');go(0)},
 export(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({app:'ivory',v:2,...sd()},null,1)],{type:'application/json'}));a.download='ivory-backup.json';a.click()},
 import(){$('#imp').click()},
 reset(){if(confirm('Delete all logs and settings? This can\'t be undone.')){S.logs=[];S.custom=[];S.name='';S.prof={};S.body=[];S.split=null;S.ai={};S.chat.length=0;T.tried={};save();toast('All data deleted');go(0)}},
 out(){const t=S.tok;S.tok='';S.user='';S.skip=0;T.ob.mode='login';save();toast('Signed out');obStart();api('sync',{action:'out',token:t}).catch(()=>{})},
 async rmacct(){if(!confirm('Delete your account and cloud data? Data on this device stays.'))return;try{await api('sync',{action:'delete',token:S.tok});S.tok='';S.user='';S.skip=0;T.ob.mode='signup';save();toast('Account deleted');obStart()}catch(e){toast("Couldn't delete. Try again.")}},
 syncnow(){pullLWW().then(()=>{toast('Synced');render()})},
 signup(){doAuth('signup')},login(){doAuth('login')},testai(){testAI()}
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(t){const f=A[t.dataset.a];if(f){buzz();f(t.dataset.v,t)}}else if(e.target===shEl)closeSheet()});
document.addEventListener('input',e=>{const t=e.target,i=t.id;
 if(i=='iw'||i=='ir'){S[i=='iw'?'w':'r']=+t.value;save()}
 else if(i=='lq'){T.lib.q=t.value;$('#ll').innerHTML=libList()}
 else if(i=='nm'){S.name=t.value;save()}
 else if(i=='spt'){T.sp.text=t.value}
 else if(t.dataset&&t.dataset.pf)setProf(t.dataset.pf,t.value)});
document.addEventListener('change',e=>{const t=e.target;
 if(t.id=='cs'){S.cx=t.value;render()}
 else if(t.dataset&&t.dataset.pf){setProf(t.dataset.pf,t.value);if(t.dataset.pf=='w'||t.dataset.pf=='bf')bodyHist()}
 else if(t.id=='imp'){const f=t.files&&t.files[0];if(!f)return;f.text().then(x=>{const d=JSON.parse(x);if(!d||!Array.isArray(d.logs))throw 0;if(!confirm('Replace your current data with this backup?'))return;SK.forEach(k=>{if(d[k]!==undefined&&(S[k]==null||typeof d[k]==typeof S[k]))S[k]=d[k]});S.ai={};T.tried={};save();theme();toast('Backup imported');go(0)}).catch(()=>toast('That file is not an Ivory backup'));t.value=''}});
document.addEventListener('keydown',e=>{if(e.key!='Enter')return;const i=e.target.id;if(i=='ap'||i=='au')A.ogo();else if(i=='cq')A.send();else if(i=='cn')A.savec();else if(e.target.dataset&&e.target.dataset.cq!==undefined){const b=e.target.parentNode.querySelector('[data-a=cask]');b&&b.click()}});
document.addEventListener('focusin',e=>{const t=e.target;if(t.tagName=='INPUT'&&(t.type=='number'||t.inputMode=='decimal'||t.inputMode=='numeric'))setTimeout(()=>{try{t.select()}catch(_){}},30)});
if(window.visualViewport){const kb=()=>document.body.classList.toggle('kb',innerHeight-visualViewport.height>140);visualViewport.addEventListener('resize',kb)}
/* swipe a sheet down by its handle to close it */
document.addEventListener('pointerdown',e=>{const g=e.target.closest&&e.target.closest('.grab');if(!g)return;const sp=g.parentNode,y0=e.clientY;let dy=0;sp.classList.add('dr');try{g.setPointerCapture(e.pointerId)}catch(_){}
 const mv=ev=>{dy=Math.max(0,ev.clientY-y0);sp.style.transform='translateY('+dy+'px)'},up=()=>{g.removeEventListener('pointermove',mv);g.removeEventListener('pointerup',up);g.removeEventListener('pointercancel',up);sp.classList.remove('dr');if(dy>90){sp.style.transform='';closeSheet()}else sp.style.transform=''};
 g.addEventListener('pointermove',mv);g.addEventListener('pointerup',up);g.addEventListener('pointercancel',up)});
addEventListener('online',()=>{if(S.tok)pullLWW()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S.tok)pullLWW()});

/* ---------- start ---------- */
theme();measure();placeNow(0);hot(0);
document.addEventListener('pointerdown',audioUnlock,{once:true});
obStart();if(!T.ob.on)render();
if(S.tok)setTimeout(pullLWW,400);
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
