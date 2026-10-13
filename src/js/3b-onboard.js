/* ---------- first launch: sign in, then a short setup ---------- */
const OB=$('#ob');
T.ob={on:0,step:'auth',mode:'signup'};
const needAuth=()=>!S.tok&&!S.skip;
const needSetup=()=>!S.setup&&!S.logs.length&&!(S.name||P().age||P().w);
function obStart(){const st=needAuth()?'auth':needSetup()?0:null;if(st===null)return obEnd();
 T.ob.on=1;T.ob.step=st;document.body.classList.add('onb');V.innerHTML='';closeSheet();obRender();OB.scrollTop=0}
function obEnd(){T.ob.on=0;document.body.classList.remove('onb');OB.innerHTML='';measure();placeNow(T.tab);hot(T.tab);render()}
function afterAuth(){toast(T.ob.mode=='signup'?'Account created':'Signed in');if(needSetup()){T.ob.step=0;obRender();OB.scrollTop=0}else obEnd()}
const obErr=m=>{const e=$('#oerr');if(e)e.textContent=m||''};
function obMode(m){const u=$('#au'),p=$('#ap'),a=u?u.value:'',b=p?p.value:'';T.ob.mode=m;obRender();if($('#au')){$('#au').value=a;$('#ap').value=b}}
const obLabel=()=>T.ob.mode=='signup'?'Create account':'Sign in';
function obAuth(){const m=T.ob.mode;
 return`<div class="obw"><div class="obh">${LOGO.replace('width="44" height="34"','width="64" height="49"')}<h1>Ivory</h1><p>Track every lift. Train smarter.</p></div>
 <div class="card p">${seg('omode',[['signup','Create account'],['login','Sign in']],m)}
 <label>Username</label><input class="search" id="au" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="24" placeholder="yourname">
 <label>Passcode</label><input class="search" id="ap" type="password" autocomplete="${m=='signup'?'new-password':'current-password'}" maxlength="128" placeholder="6+ characters">
 <p class="note red" id="oerr" style="margin:0 0 10px;min-height:16px"></p><button class="btn" id="ogo" data-a="ogo">${obLabel()}</button></div>
 <p class="note" style="text-align:center">Your lifts sync across devices and the AI coach unlocks.</p>
 <button class="lnk" data-a="oskip">Continue without an account</button></div>`}
const pf=(k)=>{const p=P();return p[k]==null?'':p[k]};
const card=(a,v,t,d,on)=>`<button class="oc ${on?'on':''}" data-a="${a}" data-v="${v}"><b>${t}</b><span>${d}</span></button>`;
const OBS=[
 ()=>`<h1>About you</h1><p class="sub ol">So the coach can personalise targets.</p><div class="card p"><label>Name</label><input class="search" id="nm" value="${esc(S.name)}" placeholder="First name" maxlength="24" autocomplete="given-name"><label>Age</label><input class="search" data-pf="age" inputmode="numeric" value="${pf('age')}" placeholder="Years" maxlength="3"><label>Sex</label>${seg('osex',[['m','Male'],['f','Female'],['','Skip']],P().sex||'')}</div>`,
 ()=>{const p=P(),kg=S.unit=='kg',tin=p.h?inches(p.h):0;
  return`<h1>Your size</h1><p class="sub ol">Used for forecasts and fueling tips.</p><div class="card p"><label>Units</label>${seg('ounit',[['lb','lb · ft'],['kg','kg · cm']],S.unit)}
  <label>Height</label>${kg?`<div class="ht2"><input class="search" data-pf="hc" inputmode="numeric" value="${p.h?Math.round(p.h):''}" placeholder="cm"><span>cm</span></div>`:`<div class="ht2"><input class="search" data-pf="hf" inputmode="numeric" value="${p.h?Math.floor(tin/12):''}" placeholder="5"><span>ft</span><input class="search" data-pf="hi" inputmode="numeric" value="${p.h?tin%12:''}" placeholder="10"><span>in</span></div>`}
  <label>Weight</label><div class="ht2"><input class="search" data-pf="w" inputmode="decimal" value="${p.w?f1(dispW(p.w)):''}" placeholder="${S.unit}"><span>${S.unit}</span></div></div>`},
 ()=>`<h1>Body fat</h1><p class="sub ol">An estimate is fine. Skip it if you are unsure.</p><div class="card p"><label>Body fat %</label><div class="ht2"><input class="search" id="obf" data-pf="bf" inputmode="decimal" value="${pf('bf')}" placeholder="e.g. 18"><span>%</span></div>
  <label>Not sure? Pick the closest</label><div class="chips" style="margin:0">${[[12,'Lean · 12'],[17,'Fit · 17'],[22,'Average · 22'],[28,'Higher · 28']].map(([v,t])=>`<button class="chip" data-a="obf" data-v="${v}">${t}</button>`).join('')}</div></div>`,
 ()=>`<h1>Your goal</h1><p class="sub ol">The coach shapes targets around it.</p><div class="ocs">${[['str','Get stronger','Heavier lifts, lower reps'],['mus','Build muscle','Volume and steady progress'],['fat','Lose fat','Keep strength while cutting'],['gen','General fitness','Balanced and sustainable']].map(([v,t,d])=>card('ogoal',v,t,d,P().goal==v)).join('')}</div>
  <h2 style="margin-top:20px">Experience</h2><div class="ocs">${[['new','New','Under 1 year'],['mid','Intermediate','1 to 3 years'],['adv','Advanced','Over 3 years']].map(([v,t,d])=>card('oexp',v,t,d,P().exp==v)).join('')}</div>`,
 ()=>`<h1>Your week</h1><p class="sub ol">How often do you plan to train?</p><div class="card p"><div class="row" style="border:0"><span>Days per week</span><div class="mini"><button data-a="g-" aria-label="Fewer days">−</button><span><b id="gv">${S.goal}</b> days</span><button data-a="g+" aria-label="More days">+</button></div></div></div>
  <div class="card p"><b>Already have a split?</b><p class="sub" style="margin:4px 0 12px">Paste it as text and the coach builds every session from it. You can do this later in Settings.</p><button class="btn g" data-a="split">${S.split?'Split added · edit':'Paste my split'}</button></div>`
];
function obRender(){const o=T.ob;if(!o.on)return;
 if(o.step==='auth'){OB.innerHTML=obAuth();return}
 const n=OBS.length,i=o.step,last=i==n-1;
 OB.innerHTML=`<div class="obw"><div class="obp">${OBS.map((_,j)=>`<i class="${j<=i?'on':''}"></i>`).join('')}</div><div class="obt">${i>0?'<button class="lnk" data-a="oback">Back</button>':'<span></span>'}<span class="sub">Step ${i+1} of ${n}</span><button class="lnk" data-a="onext" data-v="skip">${last?'Skip':'Skip'}</button></div>${OBS[i]()}<div class="obf"><button class="btn" data-a="onext">${last?'Start training':'Continue'}</button></div></div>`}
function obFinish(){S.setup=1;bodyHist();save();obEnd();toast(S.name?'Welcome, '+S.name:'You are all set')}
