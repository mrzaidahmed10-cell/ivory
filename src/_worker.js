// Ivory backend for Cloudflare Pages (advanced mode).
//   GROQ_API_KEY  (secret)        Groq Cloud key. Never sent to the browser.
//   IVORY_KV      (KV binding)    accounts and synced data
//   GROQ_MODEL    (optional var)  preferred model, tried first
//   MAX_USERS     (optional var)  account limit, default 10
const enc = new TextEncoder();
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const b64 = u => btoa(String.fromCharCode(...u));
const ub64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const rnd = n => b64(crypto.getRandomValues(new Uint8Array(n))).replace(/[+/=]/g, '');
const eq = (a, b) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };
async function hash(pass, salt) {
  const k = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
  return b64(new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, k, 256)));
}
const apiKey = env => String(env.GROQ_API_KEY || '').trim().replace(/^["']+|["']+$/g, '').trim();

const BASE = 'You are Ivory Coach, the strength coach inside the Ivory gym tracker. One lifter uses it. Be specific, direct and brief. Use the lifter\'s unit (field "unit") for every weight. Ground every claim in the data given; when data is thin, say so in a few words instead of guessing. No emoji, no markdown. For pain, injury or medical issues, tell them to see a professional. The profile p has: age, sex (m/f), h (height in cm), w (body weight in kg), bf (body fat percent), goal (str strength, mus muscle, fat fat loss, gen general fitness), exp (new under 1 year, mid 1 to 3 years, adv over 3 years); any of them may be missing. Reply with one JSON object only.';

const KINDS = {
  plan: { tokens: 1100, temp: 0.3, sys: BASE + ' Task: plan the lifter\'s next session. Input: unit, p, wk (weekday), goalDays, day (optional: the prescribed split day {name, ex:[{n,s,r}]}), cand (candidate exercises when there is no day), hist: [{n, g, h:[[daysAgo, weight, reps], ...]}] with the best set of each recent session, newest first, vol (sets per muscle group over the last 7 days), since (days since last training). If day is given, output exactly its exercises in its order; otherwise choose 4 to 6 from cand, favoring under-trained muscle groups. For each exercise give sets, reps (a string such as "8-10"), w (target working weight as a number, 0 if there is no history and no sensible estimate), rest (seconds) and note (under 80 characters: one concrete cue or adjustment). Use progressive overload: add a rep before weight, add about 2.5-5 lb (1-2.5 kg) after reaching the top of the rep range, hold or reduce slightly after a stall or decline. Copy exercise names exactly as given. Also give title (under 28 characters), est_min (integer) and tips: up to 3 short strings that improve this session (warm-up, order, rest, recovery or fueling tied to their goal and body data). Schema: {"title":string,"est_min":int,"items":[{"ex":string,"sets":int,"reps":string,"w":number,"rest":int,"note":string}],"tips":[string]}' },
  review: { tokens: 800, temp: 0.4, sys: BASE + ' Task: review the last 4 weeks. Input: unit, p, goalDays, weeks: [{wk (0 is this week), sessions, sets, volume, byGroup}], prs: [{ex, e1rm, daysAgo}], stalls: [{ex, sessions, e1rm}], split (optional summary). Give the 3 or 4 most useful findings: progress, muscle balance, frequency, recovery or deload need, stalls, and one tip tied to their body data and goal (protein, sleep or calories in general terms only). Each insight has kind (good, warn or tip) and text under 130 characters that states the finding and then the action. Also give headline (under 40 characters) and score (0-100 for consistency and balance). Schema: {"headline":string,"score":int,"insights":[{"kind":"good|warn|tip","text":string}]}' },
  lift: { tokens: 300, temp: 0.3, sys: BASE + ' Task: recommend the next working set. Input: unit, p, ex, g, h: [[daysAgo, weight, reps], ...] newest first, range (target rep range or null). Use progressive overload: add a rep before weight, add about 2.5-5 lb (1-2.5 kg) after the top of the range, hold or drop slightly after a stall. If h is empty, suggest a light start for 10 reps. Reps between 3 and 20. Also rest in seconds. Schema: {"w":number,"r":int,"rest":int,"why":string under 100 characters}' },
  parse: { tokens: 3000, temp: 0.1, sys: BASE + ' Task: convert the pasted workout split into structured data. Input: text. Muscle groups allowed: Chest, Back, Legs, Shoulders, Arms, Core. Make one day per workout day or heading, in the order written. For each exercise give n (clean title-case name with no sets, reps or weights), g (one allowed group), s (sets as an integer, 3 if missing) and r (reps as a string like "8-12" or "10", "8-12" if missing). Skip rest days, cardio and plain notes. If a day names a weekday set wd from 0 (Sunday) to 6 (Saturday), else null. Never invent exercises that are not in the text. Schema: {"name":string,"days":[{"name":string,"wd":int|null,"ex":[{"n":string,"g":string,"s":int,"r":string}]}]}' },
  forecast: { tokens: 900, temp: 0.3, sys: BASE + ' Task: forecast progress on one lift. Input: unit, p, ex, g, metric (e1rm or weight), cur (current value), hist: [[daysAgo, value], ...] oldest first, weeks (horizon), plan: {perWeek, sets, reps} from their split or null, freq (observed sessions per week). Predict the value at the end of each of the next N weeks. Use realistic diminishing returns scaled by training age (exp), the lift\'s frequency and volume, body composition and goal, and the lifter\'s own trend. Never predict more than 3 percent gain in a single week; flat weeks are fine. low and high are the likely range for each week. Also summary (under 140 characters) and up to 2 milestones {label, week}. Schema: {"pts":[number],"low":[number],"high":[number],"summary":string,"milestones":[{"label":string,"week":int}]} where each array has exactly N entries.' },
  chat: { tokens: 800, temp: 0.5, sys: BASE + ' Task: answer the lifter\'s question as their coach. Input: q, hist (earlier turns [{r:"u"|"c", t}]), ctx (profile, split, recent training, focus). ctx.focus, when present, is what screen they are on (an exercise with its history and target, or a forecast): answer about it first. You can discuss and critique their split, suggest swaps, volume, progression, deloads, recovery and nutrition. Use concrete numbers from their data. Under 140 words, short plain paragraphs, no markdown symbols. When asked to review a session or week, say what went well and what to change next time. If the question is not about training, recovery or nutrition, say you only cover training. Also give follow: up to 3 short follow-up questions they might ask next (under 7 words each). Schema: {"reply":string,"follow":[string]}' },
  ping: { tokens: 20, temp: 0, sys: 'Reply with the JSON object {"ok":true}.' }
};

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (!u.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    if (u.pathname === '/api/health') return J({ kv: !!env.IVORY_KV, key: !!apiKey(env), open: true });
    if (req.method !== 'POST') return J({ error: 'method' }, 405);
    const o = req.headers.get('origin');
    if (o && new URL(o).host !== u.host) return J({ error: 'origin' }, 403);
    let b;
    try { const t = await req.text(); if (t.length > 1.5e6) return J({ error: 'big' }, 413); b = JSON.parse(t); if (!b || typeof b !== 'object') throw 0; }
    catch { return J({ error: 'bad' }, 400); }
    try {
      if (!env.IVORY_KV) return J({ error: 'no_kv' }, 503);
      if (u.pathname === '/api/auth') return await auth(b, env);
      if (u.pathname === '/api/sync') return await sync(b, env);
      if (u.pathname === '/api/ai') return await ai(b, env);
    } catch (e) { return J({ error: 'server' }, 500); }
    return J({ error: 'not_found' }, 404);
  }
};

async function mint(kv, user) {
  const t = rnd(32);
  await kv.put('t:' + t, user, { expirationTtl: 60 * 86400 });
  return t;
}
const who = async (b, env) => (typeof b.token === 'string' && b.token.length > 20 && b.token.length < 100) ? env.IVORY_KV.get('t:' + b.token) : null;

async function auth(b, env) {
  const kv = env.IVORY_KV;
  const user = String(b.user || '').toLowerCase().trim(), pass = String(b.pass || '');
  if (!/^[a-z0-9_]{3,24}$/.test(user) || pass.length < 6 || pass.length > 128) return J({ error: 'invalid' }, 400);
  if (b.action === 'signup') {
    if (await kv.get('u:' + user)) return J({ error: 'taken' }, 409);
    // Capped at MAX_USERS accounts (default 10) so strangers can't spend your Groq key.
    { const cap = Math.max(1, parseInt(env.MAX_USERS) || 10), l = await kv.list({ prefix: 'u:', limit: cap }); if (l.keys.length >= cap) return J({ error: 'closed' }, 403); }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    await kv.put('u:' + user, JSON.stringify({ salt: b64(salt), hash: await hash(pass, salt) }));
    return J({ token: await mint(kv, user), data: null, updated: 0 });
  }
  if (b.action === 'login') {
    const fk = 'f:' + user, fails = +(await kv.get(fk)) || 0;
    if (fails >= 8) return J({ error: 'locked' }, 429);
    const raw = await kv.get('u:' + user), rec = raw && JSON.parse(raw);
    const ok = rec && eq(await hash(pass, ub64(rec.salt)), rec.hash);
    if (!ok) { await kv.put(fk, String(fails + 1), { expirationTtl: 900 }); return J({ error: 'wrong' }, 401); }
    const d = await kv.get('d:' + user), rd = d ? JSON.parse(d) : { data: null, updated: 0 };
    return J({ token: await mint(kv, user), data: rd.data, updated: rd.updated });
  }
  return J({ error: 'bad' }, 400);
}

async function sync(b, env) {
  const kv = env.IVORY_KV, user = await who(b, env);
  if (!user) return J({ error: 'auth' }, 401);
  if (b.action === 'pull') { const r = await kv.get('d:' + user); return J(r ? JSON.parse(r) : { data: null, updated: 0 }); }
  if (b.action === 'push') {
    const d = b.data;
    if (!d || typeof d !== 'object' || !Array.isArray(d.logs) || d.logs.length > 30000) return J({ error: 'bad' }, 400);
    const cur = await kv.get('d:' + user), c = cur && JSON.parse(cur), upd = +b.updated || Date.now();
    if (c && c.updated > upd) return J({ conflict: 1, data: c.data, updated: c.updated });
    await kv.put('d:' + user, JSON.stringify({ data: d, updated: upd }));
    return J({ ok: 1 });
  }
  if (b.action === 'out') { await kv.delete('t:' + b.token); return J({ ok: 1 }); }
  if (b.action === 'delete') { await kv.delete('d:' + user); await kv.delete('u:' + user); await kv.delete('t:' + b.token); return J({ ok: 1 }); }
  return J({ error: 'bad' }, 400);
}

// Parses a model reply into an object even if it is wrapped in text or fences.
function pj(t) {
  t = String(t || '').replace(/<think>[\s\S]*?<\/think>/g, '');
  try { return JSON.parse(t); } catch { }
  const a = t.indexOf('{'), z = t.lastIndexOf('}');
  if (a >= 0 && z > a) { try { return JSON.parse(t.slice(a, z + 1)); } catch { } }
  return null;
}

const API = 'https://api.groq.com/openai/v1/';
const SKIP = /whisper|guard|tts|playai|orpheus|embed|moderation|safeguard|vision-preview|distil-whisper/i;
const RANK = [/llama-3\.3-70b/, /llama-4-maverick/, /llama-4-scout/, /kimi-k2/, /llama-3\.1-70b/, /gpt-oss-120b/, /qwen/, /llama-3\.1-8b/, /gpt-oss-20b/, /llama/];
const STATIC = ['llama-3.3-70b-versatile', 'meta-llama/llama-4-scout-17b-16e-instruct', 'openai/gpt-oss-20b', 'llama-3.1-8b-instant'];
let MC = { at: 0, ids: null }, GOOD = '';

// Asks Groq which models this key can actually use, best first.
async function listModels(key) {
  if (MC.ids && Date.now() - MC.at < 300000) return MC.ids;
  try {
    const ac = new AbortController(), to = setTimeout(() => ac.abort(), 8000);
    const r = await fetch(API + 'models', { headers: { authorization: 'Bearer ' + key }, signal: ac.signal });
    clearTimeout(to);
    if (r.status === 401 || r.status === 403) return 'bad_key';
    const j = await r.json();
    const ids = (j.data || []).filter(m => m && m.id && m.active !== false && !SKIP.test(m.id)).map(m => m.id);
    const rk = id => { const i = RANK.findIndex(x => x.test(id)); return i < 0 ? 99 : i; };
    ids.sort((x, y) => rk(x) - rk(y));
    if (ids.length) { MC = { at: Date.now(), ids }; return ids; }
  } catch { }
  return null;
}

async function callGroq(env, K, user) {
  const key = apiKey(env);
  if (!key) return { err: 'no_key', status: 503 };
  const found = await listModels(key);
  if (found === 'bad_key') return { err: 'bad_key', status: 502, detail: 'Groq rejected the key' };
  const pool = Array.isArray(found) && found.length ? found : STATIC;
  const cands = [...new Set([GOOD, env.GROQ_MODEL, ...pool].map(x => String(x || '').trim()).filter(Boolean))].slice(0, 6);
  const tried = []; let limit = null, timeout = false;
  for (const model of cands) {
    const oss = /gpt-oss/.test(model);
    for (const json of [true, false]) {
      const ac = new AbortController(), to = setTimeout(() => ac.abort(), 25000);
      let r;
      try {
        r = await fetch(API + 'chat/completions', {
          method: 'POST', signal: ac.signal,
          headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
          body: JSON.stringify({
            model, temperature: K.temp, max_tokens: K.tokens + (oss ? 1500 : 0),
            ...(oss ? { reasoning_effort: 'low' } : {}),
            ...(json ? { response_format: { type: 'json_object' } } : {}),
            messages: [{ role: 'system', content: K.sys }, { role: 'user', content: user }]
          })
        });
      } catch (e) { clearTimeout(to); timeout = true; tried.push(model + ': timed out'); break; }
      clearTimeout(to);
      let j = null; try { j = await r.json(); } catch { }
      if (r.ok) {
        const out = pj(j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content);
        if (out) { GOOD = model; return { out, model }; }
        tried.push(model + ': unreadable output');
        break;
      }
      const msg = String(j && j.error && j.error.message || r.statusText || ('HTTP ' + r.status)).slice(0, 160);
      if (r.status === 401 || r.status === 403) return { err: 'bad_key', status: 502, detail: msg };
      if (r.status === 429) { limit = msg; tried.push(model + ': rate limited'); break; }
      if (r.status === 400 && json) continue;   // retry the same model without JSON mode
      tried.push(model + ': ' + msg);
      if (model === GOOD) GOOD = '';
      break;                                    // next model
    }
  }
  if (limit && tried.every(t => /rate limited|timed out/.test(t))) return { err: 'groq_limit', status: 429, detail: limit };
  if (timeout && tried.every(t => /timed out/.test(t))) return { err: 'timeout', status: 504, detail: 'Groq did not answer in time' };
  return { err: 'upstream', status: 502, detail: ('Tried ' + tried.length + ' model(s) — ' + tried.join(' | ') + (found ? '' : ' (model list unavailable)')).slice(0, 500) };
}

async function ai(b, env) {
  const user = await who(b, env);
  if (!user) return J({ error: 'auth' }, 401);
  const K = KINDS[b.kind];
  if (!K) return J({ error: 'bad' }, 400);
  const data = JSON.stringify(b.data || {});
  if (data.length > 30000) return J({ error: 'big' }, 413);
  const r = await callGroq(env, K, data);
  if (r.err) return J({ error: r.err, detail: r.detail || '' }, r.status);
  if (b.kind === 'ping') return J({ ok: true, model: r.model });
  return J(r.out);
}
