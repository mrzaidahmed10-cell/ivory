/* ---------- shared bits ---------- */
const SPK='<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 6.3L21 10l-6.8 1.7L12 22l-2.2-10.3L3 10l6.8-1.7z"/></svg>';
const LOGO='<svg width="44" height="34" viewBox="56 104 400 304" role="img" aria-label="Ivory"><path d="M84 380L186 232 244 312 322 132 428 380" fill="none" stroke="currentColor" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHK='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
const WDL=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const seg=(a,o,c)=>`<div class="seg">${o.map(([v,t])=>`<button class="${v==c?'on':''}" data-a="${a}" data-v="${v}">${t}</button>`).join('')}</div>`;
const emptyCard=()=>`<div class="card p"><b style="font-size:17px">No sets logged yet</b><p class="sub" style="margin:4px 0 14px">Log your first set to see progress here.</p><button class="btn" data-a="go1">Log first set</button><div style="height:8px"></div><button class="btn g" data-a="sample">Load sample data</button></div>`;
function theme(){const d=document.documentElement;S.theme=='auto'?d.removeAttribute('data-theme'):d.dataset.theme=S.theme;const dark=S.theme=='dark'||(S.theme=='auto'&&matchMedia('(prefers-color-scheme:dark)').matches);document.querySelector('meta[name=theme-color]').content=dark?'#0a0c11':'#eeeae0'}

/* ---------- liquid glass nav: drag the lens, pages switch only on release ---------- */
const nav=$('.nav'),lens=$('.ind'),NB=[...document.querySelectorAll('.nb button')];
let cell=0,dg=null;
const measure=()=>{cell=(nav.clientWidth-8)/4};
const place=(i)=>lens.style.setProperty('--x',i*cell+'px');
const hot=i=>NB.forEach((b,j)=>b.classList.toggle('on',j==i));
function choose(i){place(i);hot(i);if(i!==T.tab)sel(i);else buzz()}
nav.addEventListener('pointerdown',e=>{if(e.button>0)return;measure();dg={id:e.pointerId,sx:e.clientX,r:nav.getBoundingClientRect(),moved:0,off:0,x:T.tab*cell,vx:0,lx:e.clientX,lt:performance.now()}});
nav.addEventListener('pointermove',e=>{if(!dg||e.pointerId!==dg.id)return;
 if(!dg.moved){if(Math.abs(e.clientX-dg.sx)<5)return;dg.moved=1;try{nav.setPointerCapture(e.pointerId)}catch(_){}
  const f0=dg.sx-dg.r.left-4,c=T.tab*cell+cell/2;dg.off=Math.abs(f0-c)<=cell/2?f0-c:0;nav.classList.add('drag');buzz()}
 const max=3*cell;let x=e.clientX-dg.r.left-4-dg.off-cell/2;if(x<0)x=-Math.min(-x*.25,16);else if(x>max)x=max+Math.min((x-max)*.25,16);
 dg.x=x;lens.style.setProperty('--x',x+'px');const t=performance.now();dg.vx=(e.clientX-dg.lx)/Math.max(1,t-dg.lt);dg.lx=e.clientX;dg.lt=t;
 hot(clamp(Math.round(clamp(x,0,max)/cell),0,3))});
function endDrag(e,cancel){if(!dg)return;const d=dg;dg=null;nav.classList.remove('drag');try{nav.releasePointerCapture(d.id)}catch(_){}
 if(cancel){place(T.tab);hot(T.tab);return}
 if(!d.moved){choose(clamp(Math.floor((e.clientX-d.r.left-4)/cell),0,3));return}
 const v=performance.now()-d.lt>70||Math.abs(d.vx)<.25?0:d.vx;choose(clamp(Math.round(clamp(d.x+v*90,0,3*cell)/cell),0,3))}
nav.addEventListener('pointerup',e=>endDrag(e));nav.addEventListener('pointercancel',e=>endDrag(e,1));
NB.forEach((b,i)=>b.addEventListener('click',e=>{if(e.detail===0)choose(i)}));
if(window.ResizeObserver)new ResizeObserver(()=>{measure();place(T.tab)}).observe(nav);

function sel(i){const ch=i!==T.tab;if(ch&&T.tab==3)bodyHist();T.tab=i;hot(i);if(ch){V.style.animation='none';V.offsetHeight;V.style.animation=''}render();scrollTo(0,0);if(ch)buzz()}
function go(i){measure();place(i);sel(i)}
function render(){if(T.ob.on)return;V.innerHTML=[home,track,charts,settings][T.tab]();after()}
function after(){restPaint();if(T.tab==1){const r=$('#rail'),a=$('.rx.on');if(r&&a)r.scrollLeft=a.offsetLeft-r.clientWidth/2+a.offsetWidth/2}if(T.tab==0){aiPlan();aiReview()}if(T.tab==2){aiForecast();bindChart()}if(T.tab==3)updAist()}

/* ---------- rest timer ---------- */
const R={total:S.rt.def,left:S.rt.def,end:0,run:0,pill:0,pz:0};let rT=0,AC=null;
const mmss=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
function audioUnlock(){try{if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C()}if(AC&&AC.state=='suspended')AC.resume()}catch(e){}}
function chime(){if(!S.rt.snd)return;try{audioUnlock();if(!AC)return;[0,.22,.44].forEach((d,i)=>{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+d;o.type='sine';o.frequency.value=i==2?1047:784;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.28,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.4);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.45)})}catch(e){}}
function restStart(sec){if(sec)R.total=sec;R.left=R.total;R.end=Date.now()+R.left*1000;R.run=1;R.pz=0;R.pill=0;clearInterval(rT);rT=setInterval(restTick,250);restTick()}
function restPause(){if(!R.run)return;R.left=Math.max(0,Math.ceil((R.end-Date.now())/1000));R.run=0;R.pz=1;clearInterval(rT);restPaint()}
function restResume(){R.pz=0;R.end=Date.now()+R.left*1000;R.run=1;clearInterval(rT);rT=setInterval(restTick,250);restTick()}
function restReset(){clearInterval(rT);R.run=0;R.pz=0;R.pill=0;R.left=R.total;restPaint()}
function restAdd(s){if(R.run){R.end+=s*1000;R.total+=s;R.left+=s}else if(R.left<=0)restStart(s);else{R.left+=s;R.total+=s}restPaint()}
function restTick(){if(!R.run)return;R.left=Math.max(0,Math.ceil((R.end-Date.now())/1000));
 if(R.left<=0){clearInterval(rT);R.run=0;R.pill=Date.now()+4000;chime();navigator.vibrate&&navigator.vibrate([40,60,40,60,90]);setTimeout(restPaint,4100)}
 restPaint()}
function restPaint(){const l=R.left,fin=!R.run&&l<=0,t=$('#tmt');if(t)t.textContent=mmss(l);
 const r=$('#tmr');if(r)r.style.strokeDashoffset=(326.7*(1-(R.total?Math.min(1,l/R.total):0))).toFixed(1);
 const b=$('#tmb');if(b)b.textContent=R.run?'Pause':fin?'Restart':R.pz?'Resume':'Start';
 const st=$('#tms');if(st)st.textContent=R.run?'resting':fin?'go lift':'rest';
 document.querySelectorAll('[data-rp]').forEach(e=>e.classList.toggle('on',+e.dataset.rp==R.total));
 const show=!T.ob.on&&T.tab!=1&&(R.run||Date.now()<R.pill);$('#rs').classList.toggle('show',show);
 const p=$('#rt');if(p)p.innerHTML=(fin?'Go':mmss(l))+'<small>'+(fin?'rest over':'rest')+'</small>'}
const RP=[30,60,90,120,180];
const restCard=()=>`<div class="card p tm"><div class="tmr"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bgc"/><circle cx="60" cy="60" r="52" class="fgc" id="tmr" stroke-dasharray="326.7"/></svg><div class="tc"><b id="tmt">${mmss(R.left)}</b><span id="tms">rest</span></div></div>
<div class="tmc"><div class="chips" style="margin:0">${RP.map(v=>`<button class="chip" data-rp="${v}" data-a="rset" data-v="${v}">${mmss(v)}</button>`).join('')}</div><div class="two" style="margin:12px 0 0"><button class="btn" id="tmb" data-a="rtog">Start</button><button class="btn g" data-a="radd" data-v="15">+15s</button></div><button class="lnk" data-a="rreset" style="margin-top:6px">Reset</button></div></div>`;

/* ---------- sheets ---------- */
const shEl=$('#sh');
const SHEETS={lib:()=>libSheet(),custom:()=>customSheet(),split:()=>splitSheet(),chat:()=>chatSheet(),body:()=>bodySheet()};
function renderSheet(){shEl.innerHTML='<div class="sp" role="dialog" aria-modal="true" data-stop>'+(SHEETS[T.sheet]||(()=>''))()+'</div>';if(T.sheet=='chat')renderChat()}
function openSheet(k){const was=shEl.classList.contains('open');T.sheet=k;renderSheet();if(!was){shEl.offsetHeight;shEl.classList.add('open');document.body.classList.add('lock')}}
function closeSheet(){const w=T.sheet;T.sheet='';shEl.classList.remove('open');document.body.classList.remove('lock');const a=document.activeElement;if(a&&a.blur)a.blur();if(w=='body'){bodyHist();if(T.tab==3&&!T.ob.on)render()}}
const xBtn='<button data-a="closes" aria-label="Close">✕</button>';
function libList(){const q=T.lib.q.toLowerCase().trim(),l=lib().filter(e=>(T.lib.g=='All'||(T.lib.g=='Custom'?e.c:e.g==T.lib.g))&&e.n.toLowerCase().includes(q));
 return l.map(e=>{const k=last(e.n);return`<div class="row tap" data-a="pickx" data-v="${esc(e.n)}"><div><b class="${e.n==S.sel?'sel':''}">${esc(e.n)}</b><span class="sub">${e.g}${k?' · '+f1(k.w)+' '+S.unit:''}</span></div>${e.n==S.sel?'<i class="dot"></i>':''}</div>`}).join('')
 +'<div class="row tap" data-a="custom"><div><b class="sel">+ Add custom exercise</b></div></div><div class="row tap" data-a="split"><div><b class="sel">Paste a workout split</b></div></div>'}
const libSheet=()=>`<h3>Exercises${xBtn}</h3><input class="search" id="lq" type="search" placeholder="Search exercises" value="${esc(T.lib.q)}" autocomplete="off"><div class="chips">${['All',...G,'Custom'].map(g=>`<button class="chip ${g==T.lib.g?'on':''}" data-a="lg" data-v="${g}">${g}</button>`).join('')}</div><div class="list" id="ll">${libList()}</div>`;
const customSheet=()=>`<h3>New exercise${xBtn}</h3><p class="sub">Add any machine or movement. It joins your library and syncs.</p><input class="search" id="cn" placeholder="Exercise name" maxlength="40" autocomplete="off"><label>Muscle group</label><select id="cg">${G.map(g=>`<option>${g}</option>`).join('')}</select><div style="height:14px"></div><button class="btn" data-a="savec">Add exercise</button>`;
function splitSheet(){const sp=T.sp;
 if(sp.stage=='preview'&&sp.res){const r=sp.res,cnt=r.days.reduce((a,d)=>a+d.ex.length,0),nw=r.days.reduce((a,d)=>a+d.ex.filter(e=>e.isNew).length,0);
  return`<h3>Check your split${xBtn}</h3><p class="sub">${r.days.length} day${r.days.length>1?'s':''} · ${cnt} exercises · read ${sp.how=='ai'?'with AI':'without AI'}${nw?' · '+nw+' new will be added':''}</p>${sp.msg?`<p class="note" style="margin:0 0 8px">${esc(sp.msg)}</p>`:''}
  <div class="list">${r.days.map(d=>`<div class="day"><b>${esc(d.name)}${d.wd!=null?' · '+WDL[d.wd]:''}</b>${d.ex.map(e=>`<p><span>${esc(e.n)}${e.isNew?'<span class="new">NEW</span>':''}</span><span>${e.s} × ${esc(e.r)}</span></p>`).join('')}</div>`).join('')}</div>
  <div class="two"><button class="btn g" data-a="spback">Edit text</button><button class="btn" data-a="spuse">Use this split</button></div>`}
 if(!sp.text&&S.split)sp.text=splitText();
 return`<h3>Workout split${xBtn}</h3><p class="sub">Paste it any way you have it: notes, a message from a trainer, a spreadsheet copy.${S.split?' This replaces your current split.':''}</p>
 <textarea id="spt" placeholder="Push&#10;Bench press 4x8&#10;Incline dumbbell press 3x10&#10;Lateral raise 3x15&#10;&#10;Pull&#10;Lat pulldown 4x10&#10;Seated row 3x10" spellcheck="false">${esc(sp.text)}</textarea>
 ${sp.msg?`<p class="note" style="margin:8px 0 0">${esc(sp.msg)}</p>`:''}<div style="height:12px"></div>
 <button class="btn" data-a="readsp" ${sp.busy?'disabled':''}>${sp.busy?'Reading…':S.tok?'Read with AI':'Read split'}</button>`}
const bodySum=()=>{const p=P(),o=[];if(p.age)o.push(p.age);if(p.sex)o.push(p.sex=='m'?'Male':'Female');if(p.h){const t=inches(p.h);o.push(S.unit=='kg'?Math.round(p.h)+' cm':Math.floor(t/12)+'′'+t%12+'″')}if(p.w)o.push(f1(dispW(p.w))+' '+S.unit);if(p.bf)o.push(p.bf+'%');return o.join(' · ')};
function bodySheet(){const p=P(),kg=S.unit=='kg',tin=p.h?inches(p.h):0,lean=p.w&&p.bf?f1(dispW(p.w*(1-p.bf/100))):null;
 return`<h3>Body & goals${xBtn}</h3><p class="sub">The coach uses this for targets, forecasts and fueling tips.${lean?' Lean mass is about '+lean+' '+S.unit+'.':''}</p>
 <div class="card" style="margin:0 0 4px"><div class="row"><span>Name</span><input class="ri" id="nm" value="${esc(S.name)}" placeholder="Add your name" maxlength="24"></div>
 <div class="row"><span>Age</span><input class="ri n" data-pf="age" inputmode="numeric" value="${p.age||''}" placeholder="—"></div>
 <div class="row"><span>Sex</span><select class="rs" data-pf="sex">${sOpt([['','Not set'],['m','Male'],['f','Female']],p.sex||'')}</select></div>
 <div class="row"><span>Height</span>${kg?`<div class="ht"><input class="ri n" data-pf="hc" inputmode="numeric" value="${p.h?Math.round(p.h):''}" placeholder="—">cm</div>`:`<div class="ht"><input class="ri n" style="width:46px" data-pf="hf" inputmode="numeric" value="${p.h?Math.floor(tin/12):''}" placeholder="—">ft<input class="ri n" style="width:46px" data-pf="hi" inputmode="numeric" value="${p.h?tin%12:''}" placeholder="—">in</div>`}</div>
 <div class="row"><span>Weight</span><div class="ht"><input class="ri n" data-pf="w" inputmode="decimal" value="${p.w?f1(dispW(p.w)):''}" placeholder="—">${S.unit}</div></div>
 <div class="row"><span>Body fat</span><div class="ht"><input class="ri n" data-pf="bf" inputmode="decimal" value="${p.bf||''}" placeholder="—">%</div></div>
 <div class="row"><span>Goal</span><select class="rs" data-pf="goal">${sOpt([['','Not set'],['str','Get stronger'],['mus','Build muscle'],['fat','Lose fat'],['gen','General fitness']],p.goal||'')}</select></div>
 <div class="row"><span>Experience</span><select class="rs" data-pf="exp">${sOpt([['','Not set'],['new','Under 1 year'],['mid','1 to 3 years'],['adv','Over 3 years']],p.exp||'')}</select></div></div>`}
const PROMPTS=['How was my week?','Why am I stalling?','Should I deload?','What should I eat today?'];
const chatSheet=()=>`<h3>Ask coach${xBtn}</h3><p class="sub">Knows your split, lifts and body data.</p>`+(S.tok?`<div class="chips">${PROMPTS.map(p=>`<button class="chip" data-a="q" data-v="${esc(p)}">${p}</button>`).join('')}</div><div class="msgs" id="cm"></div><div class="ask"><input class="search" id="cq" placeholder="Ask about your training" enterkeyhint="send" autocomplete="off" maxlength="500"><button class="btn" data-a="send" aria-label="Send">↑</button></div>`:`<p style="margin:6px 0 16px">Sign in under Settings to chat with the coach.</p><button class="btn" data-a="acct">Open Settings</button>`);
function renderChat(){const m=$('#cm');if(!m)return;m.innerHTML=(T.chat.length?T.chat.map(x=>`<div class="msg ${x.r}">${esc(x.t)}</div>`).join(''):'<p class="sub">Ask anything about your training. Try “How was my week?”.</p>')+(T.chatBusy?'<div class="msg c"><div class="shim" style="width:70px"></div></div>':'');m.scrollTop=m.scrollHeight}

/* ---------- home ---------- */
function home(){const h=new Date().getHours(),gr=h<5?'Late night':h<12?'Good morning':h<18?'Good afternoon':'Good evening';
 const head=`<div class="hd"><div><p class="sub">${new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</p><h1>${gr}${S.name?', '+esc(S.name):''}</h1></div>${LOGO}</div>`;
 if(!S.logs.length&&!S.split)return head+onboard();
 return head+todayCard()+weekCard()+coachCard()+recordsCard()}
const onboard=()=>`<div class="card hero"><div class="hh"><div><b>Start with your split</b><p class="sub" style="max-width:230px">Paste it as text. The coach reads it, builds each session and tracks your progress from there.</p></div></div><button class="btn" style="margin-top:18px" data-a="split">Paste your split</button><div style="height:8px"></div><button class="btn g" data-a="go1">Log a set instead</button></div><div class="card"><div class="row tap" data-a="sample"><div><b>Load sample data</b><span class="sub">Look around with 12 weeks of example training</span></div></div></div>`;
function todayCard(){const p=plan(),busy=T.busy.plan,started=todayLogs().length>0,n=p.items.length,done=p.items.filter(i=>doneSets(i.ex)>=i.sets).length;
 if(!n)return`<div class="card hero"><div class="hh"><div><b>Today</b><p class="sub">Paste your split or log a set to get a plan.</p></div></div><button class="btn" style="margin-top:14px" data-a="split">Paste your split</button></div>`;
 const rows=p.items.slice(0,6).map(i=>{const ds=doneSets(i.ex),ok=ds>=i.sets;return`<div class="ex ${ok?'done':''}" data-a="pick" data-v="${esc(i.ex)}"><span class="ck ${ok?'on':ds?'part':''}" style="--p:${Math.min(1,ds/i.sets)*360}deg">${ok?CHK:''}</span><div><b>${esc(i.ex)}</b><span class="sub">${i.sets} × ${esc(i.reps)}${i.w?' · '+f1(i.w)+' '+S.unit:''}</span></div><em>${ds?ds+'/'+i.sets:''}</em></div>`}).join('')+(n>6?`<div class="more" data-a="go1">+${n-6} more in Track</div>`:'');
 const tips=p.tips.slice(0,2).map(t=>`<p>${esc(t)}</p>`).join(''),hint=!S.tok?'<p class="note">Sign in under Settings to let the coach tune this plan.</p>':T.err.plan&&!p.ai?`<p class="note red">${esc(T.err.plan)}</p>`:'';
 return`<div class="card hero"><div class="hh"><div><span class="sub">Today</span><b>${esc(p.title)}</b><p class="sub">${[p.label,n+' exercises','~'+p.est+' min'].filter(Boolean).join(' · ')}</p></div><button class="tag sg" data-a="${S.tok?'plan':'acct'}" ${busy?'disabled':''}>${SPK}${S.tok?busy?'Thinking…':'Refresh':'Sign in'}</button></div>${rows}${tips?`<div class="tips">${tips}</div>`:''}${hint}<button class="btn" style="margin-top:14px" data-a="start">${done==n?'Session complete':started?'Continue session':'Start session'}</button></div>`}
function weekCard(){const W=weeks(1)[0],w0=wkStart(Date.now()),td=sod(Date.now()),ds=[...W.dset],by=W.byGroup,gs=G.filter(g=>by[g]);
 const dots=['M','T','W','T','F','S','S'].map((l,i)=>{const d=sod(w0+i*DAY+DAY/2);return`<div><span>${l}</span><i class="${ds.some(x=>Math.abs(x-d)<DAY/2)?'on':''} ${Math.abs(d-td)<DAY/2?'td':''}"></i></div>`}).join('');
 return`<h2>This week</h2><div class="card"><div class="wk">${dots}</div><div class="kp"><div><b>${W.sessions}/${S.goal}</b><span>sessions</span></div><div><b>${fv(W.volume)}</b><span>${S.unit} lifted</span></div><div><b>${streak()}</b><span>day streak</span></div></div>${gs.length?`<div class="bw"><div class="bal">${gs.map(g=>`<i style="--h:${GH[g]};flex:${by[g]}"></i>`).join('')}</div><div class="lg">${gs.map(g=>`<span style="--h:${GH[g]}">${g} ${by[g]}</span>`).join('')}</div></div>`:''}</div>`}
function coachCard(){if(S.logs.length<3)return'';const r=review(),busy=T.busy.review;
 return`<h2>Coach<button data-a="chat">Ask a question</button></h2><div class="card p"><div class="eh"><b style="font-size:17px">${esc(r.headline)}</b><span class="score">${r.score}</span></div>${r.insights.map(i=>`<div class="in ${i.kind}"><i></i><p>${esc(i.text)}</p></div>`).join('')}<div class="eh" style="margin-top:4px"><span class="sub">${r.src=='ai'?'AI review · last 4 weeks':busy?'Asking the coach…':S.tok?'Quick review':'Quick review · sign in for AI'}</span>${S.tok?`<button class="tag sg" data-a="review" ${busy?'disabled':''}>${SPK}${busy?'Thinking…':'Refresh'}</button>`:''}</div>${T.err.review&&r.src!='ai'?`<p class="note red">${esc(T.err.review)}</p>`:''}</div>`}
function recordsCard(){const rs=records().slice(0,8);if(!rs.length)return'';
 return`<h2>Records</h2><div class="prs">${rs.map(r=>{const d=dayNo(r.d);return`<div class="pr" data-a="chart" data-v="${esc(r.ex)}"><small>PR · ${d<1?'today':d+'d ago'}</small><b>${esc(r.ex)}</b><strong>${f1(r.w)} × ${r.r}</strong><span class="sub">+${f1(r.gain*100)}% est. 1RM</span></div>`}).join('')}</div>`}
/* ---------- track ---------- */
function sessItems(){const p=plan(),m=new Set(p.items.map(i=>i.ex)),out=p.items.map(i=>({...i,pl:1}));
 const add=x=>{if(!m.has(x)){m.add(x);out.push({ex:x,sets:0,reps:'',w:0,tr:0,rest:S.rt.def,note:'',pl:0})}};
 todayLogs().sort((a,b)=>a.t-b.t).forEach(l=>add(l.ex));add(S.sel);return out}
function track(){const x=S.sel,l=last(x),p=plan(),items=sessItems(),it=p.items.find(i=>i.ex==x),tl=todayLogs().sort((a,b)=>a.t-b.t),mine=tl.filter(s=>s.ex==x),n=mine.length,tot=it?it.sets:0,vol=tl.reduce((a,s)=>a+s.w*s.r,0),kg=S.unit=='kg',qd=kg?[-5,-2.5,2.5,5]:[-10,-5,5,10];
 const tgt=it?`Target ${it.w?f1(it.w)+' '+S.unit:'your weight'} × ${it.tr} · ${it.sets} sets · rest ${it.rest}s`:'',why=it?it.note:nextSet(x).why;
 const stp=(k,lab,v,mode)=>`<div><label>${lab}</label><div class="st"><button data-a="${k}-" aria-label="Decrease">−</button><input id="i${k}" type="number" inputmode="${mode}" value="${v}"><button data-a="${k}+" aria-label="Increase">+</button></div></div>`;
 const rail=`<div class="rail" id="rail">${items.map(i=>{const ds=doneSets(i.ex),ok=i.sets&&ds>=i.sets;return`<button class="rx ${i.ex==x?'on':''} ${ok?'ok':''}" data-a="pickx" data-v="${esc(i.ex)}">${ok?CHK:''}<span>${esc(i.ex)}</span>${ds?`<em>${ds}${i.sets?'/'+i.sets:''}</em>`:''}</button>`}).join('')}<button class="rx add" data-a="lib">+ Exercise</button></div>`;
 const act=`<div class="card p act"><div class="eh"><div style="min-width:0"><b class="big">${esc(x)}</b><p class="sub">${grp(x)}${l?` · Last ${f1(l.w)} × ${l.r}, ${when(l.t).toLowerCase()}`:' · No sets yet'}</p></div><button class="tag" data-a="lib">Change</button></div>${tgt?`<p class="sel tg">${esc(tgt)}</p>`:''}<p class="sub" id="why" style="margin:4px 0 0">${esc(why||'')}</p>
 <div class="two">${stp('w','Weight ('+S.unit+')',S.w,'decimal')}${stp('r','Reps',S.r,'numeric')}</div>
 <div class="qd">${qd.map(v=>`<button data-a="wd" data-v="${v}">${v>0?'+':'−'}${Math.abs(v)}</button>`).join('')}</div>
 <button class="btn" data-a="log">Log set ${n+1}${tot?' of '+Math.max(tot,n+1):''}</button><div style="height:8px"></div><button class="btn g sm" id="sg" data-a="suggest">${SPK}&nbsp;Suggest next set</button></div>`;
 const rn=Math.max(tot,n),sets=rn?`<h2>Sets<span class="sub">${n}${tot?' of '+tot:''} done</span></h2><div class="card">${Array.from({length:rn},(_,i)=>{const s=mine[i];return s?`<div class="row"><span class="ck on" style="flex:none">${CHK}</span><div><b>Set ${i+1} · ${f1(s.w)} × ${s.r}</b><span class="sub">${new Date(s.t).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}</span></div><button class="x" data-a="del" data-v="${s.id}" aria-label="Delete set">×</button></div>`:`<div class="row pend"><span class="ck" style="flex:none"></span><div><b>Set ${i+1}</b><span class="sub">Target ${it&&it.w?f1(it.w)+' × ':''}${it?it.tr:''}</span></div></div>`}).join('')}</div>`:'';
 const ses=items.filter(i=>i.pl||doneSets(i.ex)>0),done=ses.filter(i=>i.sets&&doneSets(i.ex)>=i.sets).length;
 const sess=ses.length?`<h2>${esc(p.items.length?p.title:'Session')}<span class="sub">${p.items.length?done+'/'+p.items.length+' done · ':''}${tl.length} set${tl.length==1?'':'s'}${tl.length?' · '+fv(vol)+' '+S.unit:''}</span></h2><div class="card">${ses.map(i=>{const ds=doneSets(i.ex),ok=i.sets&&ds>=i.sets,ls=tl.filter(s=>s.ex==i.ex).map(s=>f1(s.w)+'×'+s.r).join('  ·  ');return`<div class="row tap" data-a="pickx" data-v="${esc(i.ex)}"><span class="ck ${ok?'on':ds?'part':''}" style="--p:${i.sets?Math.min(1,ds/i.sets)*360:360}deg;flex:none">${ok?CHK:''}</span><div><b class="${i.ex==x?'sel':''}">${esc(i.ex)}</b><span class="sub">${ls||(i.sets?i.sets+' × '+esc(i.reps)+(i.w?' · '+f1(i.w)+' '+S.unit:''):'')}</span></div><span class="sub" style="flex:none">${ds}${i.sets?'/'+i.sets:''}</span></div>`}).join('')}</div>`:'';
 return`<div class="hd"><h1>Track</h1><button class="tag sg" data-a="chat" style="margin-top:8px">${SPK}Ask coach</button></div>${rail}${act}<h2>Rest timer</h2>${restCard()}${sets}${sess}${tl.length?'<button class="btn g" data-a="finish">Finish session and review</button>':''}`}

/* ---------- charts ---------- */
const smooth=P=>{let d='M'+P[0][0]+','+P[0][1];for(let i=1;i<P.length;i++){const m=(P[i-1][0]+P[i][0])/2;d+='C'+m+','+P[i-1][1]+' '+m+','+P[i][1]+' '+P[i][0]+','+P[i][1]}return d};
function lineChart(s,f){const W=340,H=200,L=8,R=10,T0=14,B=22;if(!s.length)return'<p class="sub" style="padding:70px 0;text-align:center">No sessions in this range</p>';
 const now=sod(Date.now()),x0=s[0][0],lastP=s[s.length-1],fut=f?f.pts.map((v,i)=>[now+(i+1)*7*DAY,v]):[];let x1=lastP[0];if(f)x1=Math.max(x1,now+f.weeks*7*DAY);
 const vs=s.map(p=>p[1]);if(f)vs.push(...f.pts,...f.low,...f.high);let a=Math.min(...vs),b=Math.max(...vs);if(a==b){a-=1;b+=1}const pd=(b-a)*.14;a-=pd;b+=pd;
 const X=t=>x1==x0?W/2:L+(t-x0)/(x1-x0)*(W-L-R),Y=v=>T0+(1-(v-a)/(b-a))*(H-T0-B),fd=t=>new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric'});
 const hp=s.map(p=>[X(p[0]),Y(p[1])]),d=smooth(hp),gl=[0,1,2].map(k=>{const y=T0+k*(H-T0-B)/2;return`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" stroke="var(--bd)"/><text x="${L}" y="${y-3}">${f1(b-(b-a)*k/2)}</text>`}).join('');
 let fx='',pts=s.map((p,i)=>[hp[i][0],hp[i][1],p[0],p[1],0]);
 if(f){const an=hp[hp.length-1],fp=[an,...fut.map(p=>[X(p[0]),Y(p[1])])],up=fut.map((p,i)=>[X(p[0]),Y(f.high[i])]),lo=fut.map((p,i)=>[X(p[0]),Y(f.low[i])]).reverse();
  fx=`<path d="M${an[0]},${an[1]}${up.map(q=>'L'+q).join('')}${lo.map(q=>'L'+q).join('')}Z" fill="var(--ac)" opacity=".15"/><path d="${smooth(fp)}" fill="none" stroke="var(--ac)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 7"/><circle cx="${fp[fp.length-1][0]}" cy="${fp[fp.length-1][1]}" r="4" fill="var(--bg)" stroke="var(--ac)" stroke-width="2"/>`;
  pts=pts.concat(fut.map((p,i)=>[fp[i+1][0],fp[i+1][1],p[0],p[1],1]))}
 return`<svg id="ch" viewBox="0 0 ${W} ${H}" data-p='${JSON.stringify(pts)}'><defs><linearGradient id="ar" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--ac)" stop-opacity=".4"/><stop offset="1" stop-color="var(--ac)" stop-opacity="0"/></linearGradient></defs>${gl}<path d="${d}L${hp[hp.length-1][0]},${H-B}L${hp[0][0]},${H-B}Z" fill="url(#ar)"/>${fx}<path d="${d}" fill="none" stroke="var(--ac)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><text x="${L}" y="${H-6}">${fd(x0)}</text><text x="${W-R}" y="${H-6}" text-anchor="end">${fd(x1)}</text><circle id="dt" cx="${hp[hp.length-1][0]}" cy="${hp[hp.length-1][1]}" r="5" fill="var(--tx)" stroke="var(--ac)" stroke-width="3"/></svg>`}
function charts(){const opts=recent(9999);if(S.body.filter(b=>b.w).length>=2)opts.push('__bw');if(!opts.length)return'<h1>Charts</h1>'+emptyCard();if(!opts.includes(S.cx))S.cx=opts[0];
 const bw=S.cx=='__bw',all_=bw?S.body.filter(b=>b.w).map(b=>[sod(b.t),f1(dispW(b.w))]):ser(S.cx,S.m);let s=all_.filter(p=>S.rg>=999||p[0]>=sod(Date.now())-S.rg*DAY);if(!s.length&&all_.length)s=all_.slice(-1);
 const canFc=!bw&&sess(S.cx).length>=2,f=S.fc&&canFc?fcGet():null,cur=s.length?s[s.length-1][1]:0,ch=s.length?cur-s[0][1]:0,best=s.length?Math.max(...s.map(p=>p[1])):0,W=weeks(8).reverse(),wm=Math.max(1,...W.map(w=>w.volume));
 return`<h1>Charts</h1><select id="cs" aria-label="Exercise">${opts.map(x=>`<option value="${esc(x)}" ${x==S.cx?'selected':''}>${x=='__bw'?'Body weight':esc(x)}</option>`).join('')}</select><div style="height:12px"></div>
<div class="card p"><div style="display:grid;gap:8px">${bw?'':seg('m',[['e1','Est. 1RM'],['w','Top weight']],S.m)}${seg('rg',[[30,'1M'],[90,'3M'],[180,'6M'],[999,'All']],S.rg)}</div>
<div class="rd"><b id="rd">${s.length?f1(cur)+' '+S.unit:'—'}</b><span class="sub" id="rs2">${s.length?when(s[s.length-1][0]):''}</span></div>${lineChart(s,f)}
<div class="stat"><div><b>${f1(cur)}</b><span>Current</span></div><div><b class="${ch>0?'sel':''}">${ch>0?'+':''}${f1(ch)}</b><span>Change</span></div><div><b>${f1(best)}</b><span>Best</span></div></div>
${canFc?`<div class="fc"><div class="top"><button class="chip ${S.fc?'on':''}" data-a="fc">${SPK} Forecast</button>${S.fc?seg('fw',[[4,'4w'],[8,'8w'],[12,'12w']],S.fw):''}</div>${S.fc&&f?`<p style="font-size:14px;line-height:1.4">${esc(f.summary)}</p>${f.milestones.length?`<div class="ms">${f.milestones.map(m=>`<span>${esc(m.label)} · week ${m.week}</span>`).join('')}</div>`:''}<p class="sub">${f.src=='ai'?'AI forecast from your history, split and body data':T.busy.fc?'Asking the coach…':S.tok?'Trend estimate':'Trend estimate · sign in for the AI forecast'}</p>${T.err.fc&&f.src!='ai'?`<p class="note red">${esc(T.err.fc)}</p>`:''}`:'<p class="sub">See where this lift is heading, based on your history, split and body data.</p>'}</div>`:''}</div>
<h2>Weekly volume · all lifts</h2><div class="card p"><div class="sub">${S.unit} lifted per week</div><div class="vb">${W.map((w,i)=>`<div><i style="height:${w.volume/wm*80}%"></i>${i==7?'Now':(7-i)+'w'}</div>`).join('')}</div></div>`}
function bindChart(){const c=$('#ch');if(!c)return;const Pn=JSON.parse(c.dataset.p),dt=$('#dt');
 c.onpointermove=c.onpointerdown=e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*340;let b=Pn[0];Pn.forEach(p=>{if(Math.abs(p[0]-x)<Math.abs(b[0]-x))b=p});dt.setAttribute('cx',b[0]);dt.setAttribute('cy',b[1]);$('#rd').textContent=f1(b[3])+' '+S.unit;$('#rs2').textContent=b[4]?'in '+Math.round((b[2]-sod(Date.now()))/(7*DAY))+' wk · forecast':when(b[2])}}

/* ---------- settings ---------- */
const sOpt=(o,c)=>o.map(([v,t])=>`<option value="${v}" ${v==c?'selected':''}>${t}</option>`).join('');
function settings(){const sp=S.split,tt=!!S.tok,bs=bodySum();
 const sw=(a,on,lab,sub)=>`<div class="row"><div><b>${lab}</b>${sub?`<span class="sub">${sub}</span>`:''}</div><button class="sw ${on?'on':''}" role="switch" aria-checked="${!!on}" aria-label="${lab}" data-a="${a}"><i></i></button></div>`;
 const acct=tt?`<div class="card"><div class="row"><span>Cloud sync</span><span class="sub" style="flex:none" id="ss">${ssText()}</span></div><div class="row tap" data-a="syncnow"><span>Sync now</span></div><div class="row tap" data-a="out"><span>Sign out</span></div></div>`
 :`<div class="card"><div class="row tap" data-a="acct2"><div><b>Sign in or create account</b><span class="sub">Sync across devices and unlock the AI coach</span></div><span class="sel" style="flex:none">›</span></div></div>`;
 return`<h1>Settings</h1><div class="card"><div class="row"><div class="av">${esc((S.name||S.user||'I')[0].toUpperCase())}</div><div><b style="font-size:17px">${esc(S.name||S.user||'Your profile')}</b><span class="sub">${S.logs.length} sets logged · <span id="${tt?'':'ss'}">${ssText()}</span></span></div></div>
<div class="row tap" data-a="body"><div><b>Body & goals</b><span class="sub">${bs||'Add age, height, weight and body fat'}</span></div><span class="sel" style="flex:none">${bs?'Edit':'Add'}</span></div></div>
<h2>Training</h2><div class="card"><div class="row"><span>Weekly goal</span><div class="mini"><button data-a="g-" aria-label="Fewer days">−</button><span><b id="gv">${S.goal}</b> days</span><button data-a="g+" aria-label="More days">+</button></div></div>
<div class="row tap" data-a="split"><div><b>Workout split</b><span class="sub">${sp?esc(sp.name)+' · '+sp.days.length+' day'+(sp.days.length>1?'s':'')+' · '+sp.days.reduce((a,d)=>a+d.ex.length,0)+' exercises':'Not set. Paste it and the coach reads it.'}</span></div><span class="sel" style="flex:none">${sp?'Edit':'Add'}</span></div>
${sw('rauto',S.rt.auto,'Auto-start rest timer','After you log a set')}${sw('rsnd',S.rt.snd,'Timer sound','Chime and vibration when rest ends')}
<div class="row"><span>Default rest</span><div class="mini"><button data-a="rd-" aria-label="Shorter">−</button><span><b id="rdv">${mmss(S.rt.def)}</b></span><button data-a="rd+" aria-label="Longer">+</button></div></div></div>
<h2>Appearance</h2><div class="card"><div class="row"><span>Units</span>${seg('unit',[['lb','lb'],['kg','kg']],S.unit)}</div><div class="row"><span>Theme</span>${seg('theme',[['auto','Auto'],['light','Light'],['dark','Dark']],S.theme)}</div></div>
<p class="note">Units change labels and your body data. Logged lift weights are not converted.</p>
<h2>AI coach</h2><div class="card"><div class="row"><div><b>Connection</b><span class="sub" id="aist" style="white-space:normal">${esc(T.aist||'Not tested')}</span></div></div><div class="row tap" data-a="testai"><span class="sel">Test connection</span></div></div>
<h2>Account</h2>${acct}
<h2>Data</h2><div class="card"><div class="row tap" data-a="sample"><span>Load sample data</span></div><div class="row tap" data-a="export"><span>Export backup</span></div><div class="row tap" data-a="import"><span>Import backup</span></div>${sp?'<div class="row tap" data-a="splitclear"><span class="red">Remove split</span></div>':''}<div class="row tap" data-a="reset"><span class="red">Reset all data</span></div>${tt?'<div class="row tap" data-a="rmacct"><span class="red">Delete account</span></div>':''}</div><input type="file" id="imp" accept="application/json,.json" hidden><p class="foot">Ivory 3.0</p>`}