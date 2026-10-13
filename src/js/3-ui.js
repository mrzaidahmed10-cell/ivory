/* ---------- shared bits ---------- */
const SPK='<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 6.3L21 10l-6.8 1.7L12 22l-2.2-10.3L3 10l6.8-1.7z"/></svg>';
const LOGO='<svg width="44" height="34" viewBox="56 104 400 304" role="img" aria-label="Ivory"><path d="M84 380L186 232 244 312 322 132 428 380" fill="none" stroke="currentColor" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHK='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
const WDL=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const seg=(a,o,c)=>`<div class="seg">${o.map(([v,t])=>`<button class="${v==c?'on':''}" data-a="${a}" data-v="${v}">${t}</button>`).join('')}</div>`;
const emptyCard=()=>`<div class="card p"><b style="font-size:17px">No sets logged yet</b><p class="sub" style="margin:4px 0 14px">Log your first set to see progress here.</p><button class="btn" data-a="go1">Log first set</button><div style="height:8px"></div><button class="btn g" data-a="sample">Load sample data</button></div>`;
function theme(){const d=document.documentElement;S.theme=='auto'?d.removeAttribute('data-theme'):d.dataset.theme=S.theme;const dark=S.theme=='dark'||(S.theme=='auto'&&matchMedia('(prefers-color-scheme:dark)').matches);document.querySelector('meta[name=theme-color]').content=dark?'#0a0c11':'#eeeae0'}

/* ---------- liquid glass nav: spring-driven lens (stretch, squash, lean, jelly settle); pages switch only on release ---------- */
const nav=$('.nav'),lens=$('.ind'),gb=$('.gb'),NB=[...document.querySelectorAll('.nb button')];
let cell=0,dg=null,hi=0;
const L={x:0,v:0,tx:0,p:0,pv:0,tp:0,raf:0,t:0,drag:0};
const RM=matchMedia('(prefers-reduced-motion:reduce)');
function lpaint(){const sp=Math.abs(L.v),st=Math.min(sp/2600,.26),d=L.v<0?-1:1;
 lens.style.translate=L.x.toFixed(2)+'px 0';
 lens.style.scale=(1+.15*L.p+st).toFixed(3)+' '+(1+.19*L.p-st*.38).toFixed(3);
 lens.style.transformOrigin=(50-d*Math.min(sp/50,22)).toFixed(1)+'% 50%';
 lens.style.transform='skewX('+(-Math.max(-11,Math.min(11,L.v/140))).toFixed(2)+'deg)';
 gb.style.scale=(1+.012*L.p+st*.06).toFixed(4)+' '+(1+.016*L.p-st*.05).toFixed(4)}
function lstep(t){const dt=Math.min(.033,Math.max(.001,(t-(L.t||t))/1000));L.t=t;
 const k=L.drag?620:250,z=L.drag?.8:.6,c=2*z*Math.sqrt(k);
 L.v+=((L.tx-L.x)*k-L.v*c)*dt;L.x+=L.v*dt;
 L.pv+=((L.tp-L.p)*320-L.pv*2*.46*Math.sqrt(320))*dt;L.p+=L.pv*dt;lpaint();
 if(Math.abs(L.tx-L.x)<.15&&Math.abs(L.v)<3&&Math.abs(L.tp-L.p)<.004&&Math.abs(L.pv)<.05){L.x=L.tx;L.v=0;L.p=L.tp;L.pv=0;lpaint();L.raf=0;L.t=0;return}
 L.raf=requestAnimationFrame(lstep)}
const kick=()=>{if(RM.matches){L.x=L.tx;L.p=L.tp;L.v=L.pv=0;lpaint();return}if(!L.raf){L.t=0;L.raf=requestAnimationFrame(lstep)}};
const measure=()=>{cell=(nav.clientWidth-8)/4};
const place=i=>{L.tx=i*cell;kick()};
const placeNow=i=>{L.tx=L.x=i*cell;L.v=0;lpaint()};
const hot=i=>{NB.forEach((b,j)=>b.classList.toggle('on',j==i))};
function choose(i){place(i);hot(i);if(i!==T.tab)sel(i);else buzz()}
const tabAt=x=>clamp(Math.round(clamp(x,0,3*cell)/cell),0,3);
nav.addEventListener('pointerdown',e=>{if(e.button>0)return;measure();dg={id:e.pointerId,sx:e.clientX,r:nav.getBoundingClientRect(),moved:0,off:0,x:L.x,vx:0,lx:e.clientX,lt:performance.now()};hi=T.tab;nav.classList.add('drag');L.tp=1;kick()});
nav.addEventListener('pointermove',e=>{if(!dg||e.pointerId!==dg.id)return;
 if(!dg.moved){if(Math.abs(e.clientX-dg.sx)<4)return;dg.moved=1;try{nav.setPointerCapture(e.pointerId)}catch(_){}
  const f0=dg.sx-dg.r.left-4,c=L.x+cell/2;dg.off=Math.abs(f0-c)<=cell/2?f0-c:0;L.drag=1;buzz()}
 const max=3*cell;let x=e.clientX-dg.r.left-4-dg.off-cell/2;if(x<0)x=-Math.min(-x*.3,20);else if(x>max)x=max+Math.min((x-max)*.3,20);
 dg.x=x;L.tx=x;kick();const t=performance.now();dg.vx=(e.clientX-dg.lx)/Math.max(1,t-dg.lt);dg.lx=e.clientX;dg.lt=t;
 const h=tabAt(x);if(h!==hi){hi=h;buzz()}hot(h)});
function endDrag(e,cancel){if(!dg)return;const d=dg;dg=null;L.drag=0;L.tp=0;nav.classList.remove('drag');try{nav.releasePointerCapture(d.id)}catch(_){}
 if(cancel){place(T.tab);hot(T.tab);return}
 if(!d.moved){choose(clamp(Math.floor((e.clientX-d.r.left-4)/cell),0,3));return}
 const v=performance.now()-d.lt>70||Math.abs(d.vx)<.25?0:d.vx;choose(tabAt(d.x+v*90))}
nav.addEventListener('pointerup',e=>endDrag(e));nav.addEventListener('pointercancel',e=>endDrag(e,1));
NB.forEach((b,i)=>b.addEventListener('click',e=>{if(e.detail===0)choose(i)}));
if(window.ResizeObserver)new ResizeObserver(()=>{measure();placeNow(T.tab)}).observe(nav);

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
function renderSheet(){shEl.innerHTML='<div class="sp" role="dialog" aria-modal="true" data-stop><div class="grab"></div>'+(SHEETS[T.sheet]||(()=>''))()+'</div>';if(T.sheet=='chat')renderChat()}
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
const PROMPTS=['How was my week?','Critique my split','Why am I stalling?','Should I deload?','What should I eat today?'];
const cbar=(ph,chips)=>S.tok?`<div class="cb"><input class="search" data-cq enterkeyhint="send" autocomplete="off" maxlength="500" placeholder="${esc(ph)}"><button class="btn" data-a="cask" aria-label="Ask coach">↑</button></div>${chips?`<div class="chips cbc">${chips.map(c=>`<button class="chip" data-a="cq" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>`:''}`:`<div class="row tap" style="min-height:44px" data-a="acct"><span class="sel">Sign in to chat with your coach</span></div>`;
function pageFocus(){const lastv=x=>{const a=ser(x,S.m);return a.length?a[a.length-1][1]:null};
 if(T.tab==1){const x=S.sel,it=plan().items.find(i=>i.ex==x);return{screen:'track',ex:x,g:grp(x),hist:hist(x,5),target:it?{sets:it.sets,reps:it.reps,w:it.w,rest:it.rest}:null,todaySets:todayLogs().filter(l=>l.ex==x).map(l=>[l.w,l.r])}}
 if(T.tab==2){const x=S.cx;if(!x||x=='__bw')return{screen:'charts'};const f=S.ct=='f'?fcGet():null,n=lastv(x);return{screen:S.ct=='f'?'forecast':'charts',ex:x,hist:hist(x,6),forecast:f&&n?{weeks:f.weeks,now:n,end:f.pts[f.weeks-1],low:f.low[f.weeks-1],high:f.high[f.weeks-1],plan:planFor(x)}:null}}
 return{screen:T.tab==0?'home':'settings',today:T.tab==0?plan().title:undefined}}
function openChat(q,focus){T.focus=focus||null;openSheet('chat');if(q)chatSend(q);else setTimeout(renderChat,0)}
const chatSheet=()=>`<h3>Coach<span class="hb">${S.tok&&T.chat.length?'<button class="tag" data-a="clearchat">Clear</button>':''}${xBtn}</span></h3><p class="sub">Knows your split, lifts and body data${T.focus&&T.focus.ex?' · looking at '+esc(T.focus.ex):''}.</p>`+(S.tok?`<div class="msgs" id="cm"></div><div class="ask"><input class="search" id="cq" placeholder="Ask about your training or split" enterkeyhint="send" autocomplete="off" maxlength="500"><button class="btn" data-a="send" aria-label="Send">↑</button></div>`:`<p style="margin:6px 0 16px">Sign in to chat with the coach.</p><button class="btn" data-a="acct">Sign in</button>`);
function renderChat(){const m=$('#cm');if(!m)return;const lastC=T.chat.length&&T.chat[T.chat.length-1];
 const fl=lastC&&lastC.r=='c'&&!lastC.err&&lastC.f&&lastC.f.length?lastC.f:null;
 m.innerHTML=(T.chat.length?T.chat.map(x=>`<div class="msg ${x.r}">${esc(x.t)}</div>`).join(''):`<p class="sub">Ask anything about your training or your split. Try one of these.</p><div class="chips cbc" style="flex-wrap:wrap">${PROMPTS.map(p=>`<button class="chip" data-a="q" data-v="${esc(p)}">${p}</button>`).join('')}</div>`)
 +(T.chatBusy?'<div class="msg c"><div class="shim" style="width:70px"></div></div>':'')+(fl&&!T.chatBusy?`<div class="chips cbc fl" style="flex-wrap:wrap">${fl.map(p=>`<button class="chip" data-a="q" data-v="${esc(p)}">${esc(p)}</button>`).join('')}</div>`:'');m.scrollTop=m.scrollHeight}
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
function coachCard(){const r=S.logs.length>=3?review():null,busy=T.busy.review,lc=[...T.chat].reverse().find(m=>m.r=='c'&&!m.err);
 const chips=S.logs.length?['How was my week?','Critique my split','What should I train today?']:['Explain my split','How should I start?'];
 return`<h2>Coach<button data-a="chat">${T.chat.length?'Open chat':'Full chat'}</button></h2><div class="card p">${r?`<div class="eh"><b style="font-size:17px">${esc(r.headline)}</b><span class="score">${r.score}</span></div>${r.insights.map(i=>`<div class="in ${i.kind}"><i></i><p>${esc(i.text)}</p></div>`).join('')}<div class="eh" style="margin:4px 0 12px"><span class="sub">${r.src=='ai'?'AI review · last 4 weeks':busy?'Asking the coach…':S.tok?'Quick review':'Quick review · sign in for AI'}</span>${S.tok?`<button class="tag sg" data-a="review" ${busy?'disabled':''}>${SPK}${busy?'Thinking…':'Refresh'}</button>`:''}</div>${T.err.review&&r.src!='ai'?`<p class="note red" style="margin:0 0 10px">${esc(T.err.review)}</p>`:''}`:''}${lc?`<div class="lastc" data-a="chat"><span class="sub">Last answer</span><p>${esc(lc.t.length>150?lc.t.slice(0,150)+'…':lc.t)}</p></div>`:''}${cbar('Ask your coach anything',chips)}</div>`}
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
 const act=`<div class="card p act"><div class="eh"><div style="min-width:0"><b class="big">${esc(x)}</b><p class="sub">${grp(x)}${l?` · Last ${f1(l.w)} × ${l.r}, ${when(l.t).toLowerCase()}`:' · No sets yet'}</p></div><button class="tag" data-a="lib">Change</button></div>${tgt?`<p class="sel tg">${esc(tgt)}</p>`:''}${l&&(+S.w!=l.w||+S.r!=l.r)?`<div class="tg2"><button class="tag" data-a="repeat">Use last set · ${f1(l.w)} × ${l.r}</button></div>`:''}<p class="sub" id="why" style="margin:4px 0 0">${esc(why||'')}</p>
 <div class="two">${stp('w','Weight ('+S.unit+')',f1(S.w),'decimal')}${stp('r','Reps',S.r,'numeric')}</div>
 <div class="qd">${qd.map(v=>`<button data-a="wd" data-v="${v}">${v>0?'+':'−'}${Math.abs(v)}</button>`).join('')}</div>
 <button class="btn" data-a="log">Log set ${n+1}${tot?' of '+Math.max(tot,n+1):''}</button><div style="height:8px"></div><button class="btn g sm" id="sg" data-a="suggest">${SPK}&nbsp;Suggest next set</button></div>`;
 const rn=Math.max(tot,n),sets=rn?`<h2>Sets<span class="sub">${n}${tot?' of '+tot:''} done</span></h2><div class="card">${Array.from({length:rn},(_,i)=>{const s=mine[i];return s?`<div class="row"><span class="ck on" style="flex:none">${CHK}</span><div><b>Set ${i+1} · ${f1(s.w)} × ${s.r}</b><span class="sub">${new Date(s.t).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}</span></div><button class="x" data-a="del" data-v="${s.id}" aria-label="Delete set">×</button></div>`:`<div class="row pend"><span class="ck" style="flex:none"></span><div><b>Set ${i+1}</b><span class="sub">Target ${it&&it.w?f1(it.w)+' × ':''}${it?it.tr:''}</span></div></div>`}).join('')}</div>`:'';
 const ses=items.filter(i=>i.pl||doneSets(i.ex)>0),done=ses.filter(i=>i.sets&&doneSets(i.ex)>=i.sets).length;
 const sess=ses.length?`<h2>${esc(p.items.length?p.title:'Session')}<span class="sub">${p.items.length?done+'/'+p.items.length+' done · ':''}${tl.length} set${tl.length==1?'':'s'}${tl.length?' · '+fv(vol)+' '+S.unit+' · '+Math.max(1,Math.round((Date.now()-tl[0].t)/6e4))+' min':''}</span></h2><div class="card">${ses.map(i=>{const ds=doneSets(i.ex),ok=i.sets&&ds>=i.sets,ls=tl.filter(s=>s.ex==i.ex).map(s=>f1(s.w)+'×'+s.r).join('  ·  ');return`<div class="row tap" data-a="pickx" data-v="${esc(i.ex)}"><span class="ck ${ok?'on':ds?'part':''}" style="--p:${i.sets?Math.min(1,ds/i.sets)*360:360}deg;flex:none">${ok?CHK:''}</span><div><b class="${i.ex==x?'sel':''}">${esc(i.ex)}</b><span class="sub">${ls||(i.sets?i.sets+' × '+esc(i.reps)+(i.w?' · '+f1(i.w)+' '+S.unit:''):'')}</span></div><span class="sub" style="flex:none">${ds}${i.sets?'/'+i.sets:''}</span></div>`}).join('')}</div>`:'';
 return`<div class="hd"><h1>Track</h1><button class="tag sg" data-a="chat" style="margin-top:8px">${SPK}Coach</button></div>${rail}${act}<div class="card p cbk">${cbar('Ask coach about '+x,['Is this weight right?','How do I progress this lift?'])}</div><h2>Rest timer</h2>${restCard()}${sets}${sess}${tl.length?'<button class="btn g" data-a="finish">Finish session and review</button>':''}`}

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
function lifts_(){return recent(9999)}
function charts(){const lifts=lifts_(),opts=[...lifts];if(S.body.filter(b=>b.w).length>=2)opts.push('__bw');if(!opts.length)return'<h1>Charts</h1>'+emptyCard();
 const fv_=S.ct=='f'&&lifts.length>0,pool=fv_?lifts:opts;if(!pool.includes(S.cx))S.cx=pool[0];
 const head=`<div class="hd"><h1>Charts</h1></div>${lifts.length?seg('ct',[['p','Progress'],['f',SPK+' Forecast']],fv_?'f':'p').replace('class="seg"','class="seg big"'):''}<select id="cs" aria-label="Exercise" style="margin:12px 0">${pool.map(x=>`<option value="${esc(x)}" ${x==S.cx?'selected':''}>${x=='__bw'?'Body weight':esc(x)}</option>`).join('')}</select>`;
 return head+(fv_?forecastView():progressView())}
function progressView(){const bw=S.cx=='__bw',all_=bw?S.body.filter(b=>b.w).map(b=>[sod(b.t),f1(dispW(b.w))]):ser(S.cx,S.m);let s=all_.filter(p=>S.rg>=999||p[0]>=sod(Date.now())-S.rg*DAY);if(!s.length&&all_.length)s=all_.slice(-1);
 const cur=s.length?s[s.length-1][1]:0,ch=s.length?cur-s[0][1]:0,best=s.length?Math.max(...s.map(p=>p[1])):0,W=weeks(8).reverse(),wm=Math.max(1,...W.map(w=>w.volume));
 return`<div class="card p"><div style="display:grid;gap:8px">${bw?'':seg('m',[['e1','Est. 1RM'],['w','Top weight']],S.m)}${seg('rg',[[30,'1M'],[90,'3M'],[180,'6M'],[999,'All']],S.rg)}</div>
<div class="rd"><b id="rd">${s.length?f1(cur)+' '+S.unit:'—'}</b><span class="sub" id="rs2">${s.length?when(s[s.length-1][0]):''}</span></div>${lineChart(s,null)}
<div class="stat"><div><b>${f1(cur)}</b><span>Current</span></div><div><b class="${ch>0?'sel':''}">${ch>0?'+':''}${f1(ch)}</b><span>Change</span></div><div><b>${f1(best)}</b><span>Best</span></div></div></div>
${bw?'':`<div class="card p fcta" data-a="ct" data-v="f"><div><b>${SPK} See your forecast</b><p class="sub">Where this lift is heading, built from your history, split and body data.</p></div><span class="sel">›</span></div>`}
<h2>Weekly volume · all lifts</h2><div class="card p"><div class="sub">${S.unit} lifted per week</div><div class="vb">${W.map((w,i)=>`<div><i style="height:${w.volume/wm*80}%"></i>${i==7?'Now':(7-i)+'w'}</div>`).join('')}</div></div>`}
function forecastView(){const x=S.cx,sx=ser(x,S.m),f=fcGet(),W=S.fw;
 if(!sx.length||!f)return`<div class="card p"><b>No data for this lift yet</b><p class="sub">Log a set and the forecast appears here.</p></div>`;
 const s=sx.filter(p=>p[0]>=sod(Date.now())-120*DAY),cur=sx[sx.length-1][1],end=f.pts[W-1],lo=f.low[W-1],hi=f.high[W-1],pct=(end/cur-1)*100,pl=planFor(x),fr=f1(sess(x).filter(c=>c.d>=sod(Date.now())-28*DAY).length/4),n=sess(x).length,busy=T.busy.fc;
 const ex=P().exp,gl=P().goal,facts=[pl?pl.perWeek+'× a week in your split':S.split?'Not in your split':'No split added',pl?pl.sets+' sets × '+pl.reps:'',n+' session'+(n==1?'':'s')+' logged',fr?fr+'× a week lately':'',{new:'Under 1 year',mid:'1 to 3 years',adv:'Over 3 years'}[ex]||'',{str:'Get stronger',mus:'Build muscle',fat:'Lose fat',gen:'General fitness'}[gl]||'',P().bf?P().bf+'% body fat':''].filter(Boolean);
 const wk=f.pts.map((v,i)=>[i+1,v,f.low[i],f.high[i]]).filter(r=>r[0]%(W>8?2:1)==0||r[0]==W);
 const rows=lifts_().filter(l=>l!=x&&sess(l).length>=1).slice(0,5).map(l=>{const g=localForecast(l,S.m,W);if(!g)return'';const c=ser(l,S.m).slice(-1)[0][1],e=g.pts[W-1];return`<div class="row tap" data-a="fx" data-v="${esc(l)}"><div><b>${esc(l)}</b><span class="sub">${f1(c)} → ${f1(e)} ${S.unit}</span></div><span class="dl up">+${f1((e/c-1)*100)}%</span></div>`}).join('');
 return`<div class="card p"><div style="display:grid;gap:8px">${seg('m',[['e1','Est. 1RM'],['w','Top weight']],S.m)}${seg('fw',[[4,'4 weeks'],[8,'8 weeks'],[12,'12 weeks']],S.fw)}</div>
<div class="rd"><b id="rd">${f1(end)} ${S.unit}</b><span class="sub" id="rs2">in ${W} weeks · ${pct>=0?'+':''}${f1(pct)}%</span></div>${lineChart(s,f)}
<div class="stat"><div><b>${f1(cur)}</b><span>Now</span></div><div><b class="sel">${f1(end)}</b><span>Week ${W}</span></div><div><b>${f1(lo)}–${f1(hi)}</b><span>Likely range</span></div></div></div>
<h2>Coach's take${S.tok?`<button data-a="fcr" ${busy?'disabled':''}>${busy?'Thinking…':'Refresh'}</button>`:''}</h2><div class="card p">${busy&&f.src!='ai'?'<div class="shim" style="width:80%;margin-bottom:8px"></div><div class="shim" style="width:60%"></div>':`<p style="font-size:15px;line-height:1.45">${esc(f.summary)}</p>`}${n<3?'<p class="note" style="margin:8px 0 0">Only '+n+' session'+(n==1?'':'s')+' so far, so this leans on typical progress. It sharpens as you log more.</p>':''}
<div class="sub" style="margin-top:10px">${f.src=='ai'?'AI forecast · split and body data included':S.tok?'Trend estimate · AI forecast loads automatically':'Trend estimate · sign in for the AI forecast'}</div>${T.err.fc&&f.src!='ai'?`<p class="note red" style="margin:6px 0 0">${esc(T.err.fc)}</p>`:''}</div>
<h2>Built from</h2><div class="card p"><div class="ms">${facts.map(t=>`<span>${esc(t)}</span>`).join('')}</div></div>
<h2>Week by week</h2><div class="prs">${wk.map(r=>`<div class="pr nopt"><small>Week ${r[0]}</small><strong>${f1(r[1])}</strong><span class="sub">${f1(r[2])} to ${f1(r[3])}</span></div>`).join('')}</div>
${f.milestones.length?`<h2>Milestones</h2><div class="card">${f.milestones.map(m=>`<div class="row"><span class="ck on" style="flex:none">${CHK}</span><div><b>${esc(m.label)}</b><span class="sub">Around week ${m.week}</span></div></div>`).join('')}</div>`:''}
${rows?`<h2>Other lifts · ${W} weeks</h2><div class="card">${rows}</div><p class="note">Quick estimates from each lift's own trend and your split.</p>`:''}
<h2>Ask the coach</h2><div class="card p">${cbar('Ask about this forecast',['Why this number?','How do I beat it?','What would speed it up?'])}</div>`}
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
<p class="note">Switching units converts every logged weight, so your history stays accurate.</p>
<h2>AI coach</h2><div class="card"><div class="row"><div><b>Connection</b><span class="sub" id="aist" style="white-space:normal">${esc(T.aist||'Not tested')}</span></div></div><div class="row tap" data-a="testai"><span class="sel">Test connection</span></div></div>
<h2>Account</h2>${acct}
<h2>Data</h2><div class="card"><div class="row tap" data-a="sample"><span>Load sample data</span></div><div class="row tap" data-a="export"><span>Export backup</span></div><div class="row tap" data-a="import"><span>Import backup</span></div>${sp?'<div class="row tap" data-a="splitclear"><span class="red">Remove split</span></div>':''}<div class="row tap" data-a="reset"><span class="red">Reset all data</span></div>${tt?'<div class="row tap" data-a="rmacct"><span class="red">Delete account</span></div>':''}</div><input type="file" id="imp" accept="application/json,.json" hidden><p class="foot">Ivory 3.0</p>`}