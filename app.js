(() => {
  const { PHASES, SESSIONS, HIIT, FOCUS } = window.SF_DATA;
  const DAY = 86400000;
  const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const $ = id => document.getElementById(id);

  // ---------- State ----------
  const KEY = 'sophiefit-v1';
  const DEFAULTS = {
    birth: '2026-08-21', planStart: '2026-10-09', days: [1, 3, 5, 6],
    phase: 0, phaseStart: { 0: '2026-10-09' }, criteria: {}, log: {}, checkins: {}, impactOk: false,
  };
  let S;
  try { S = Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = { ...DEFAULTS }; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  // ---------- Dates ----------
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const key = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  const monday = d => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const fmt = d => d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  const daysBetween = (a, b) => Math.round((b - a) / DAY);

  const ppDays = () => daysBetween(parse(S.birth), today());
  const ppWeeksDone = () => Math.floor(ppDays() / 7);
  const ppWeekNow = () => ppWeeksDone() + 1;
  const datePhase = () => { const w = ppWeekNow(); let p = 0; PHASES.forEach((ph, i) => { if (w >= ph.ppFrom) p = i; }); return p; };
  const phaseWeek = () => {
    const start = S.phaseStart[S.phase] ? parse(S.phaseStart[S.phase]) : today();
    return Math.max(1, Math.floor(daysBetween(start, today()) / 7) + 1);
  };
  const planWeek = () => Math.max(1, Math.floor(daysBetween(parse(S.planStart), today()) / 7) + 1);

  // ---------- Schedule ----------
  const orderedDays = () => WEEK_ORDER.filter(d => S.days.includes(d));
  function slotFor(phaseIdx, weekday, weekNo, pWeek) {
    const days = orderedDays();
    const pos = days.indexOf(weekday);
    if (pos < 0) return null;
    const sl = PHASES[phaseIdx].slots;
    let id;
    if (days.length >= 4) id = pos < 4 ? sl[pos] : 'extra';
    else if (days.length === 3) id = [sl[0], weekNo % 2 ? sl[3] : sl[1], sl[2]][pos];
    else if (days.length === 2) id = [sl[0], sl[2]][pos];
    else id = sl[0];
    if (id === 'p1_intwalk' && pWeek < 3) id = 'p1_walk';
    return id;
  }
  function hiitFor(sessionId, weekNo) {
    const s = SESSIONS[sessionId];
    if (!s || !s.hiit) return null;
    let id = s.alt && weekNo % 2 ? s.alt : s.hiit;
    if (id === 'impact' && !S.impactOk) id = 'circuit';
    return HIIT.find(h => h.id === id);
  }
  SESSIONS.extra = { title: 'Aktive Erholung', mins: 30, kind: 'cardio', ex: [
    { name: 'Spaziergang, Radtour oder Schwimmen', dose: '30 Min.', hint: 'Locker, ohne Anstrengung.' },
    { name: 'Dehnen und Mobilisation', dose: '10 Min.', hint: '' },
  ]};

  const KIND = { kraft: 'Kraft', cardio: 'Ausdauer', hiit: 'HIIT', run: 'Laufen', pf: 'Beckenboden' };

  // ---------- Helpers ----------
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }
  const exList = (ex, limit) => `<ul class="ex">${ex.slice(0, limit || ex.length).map(e =>
    `<li><span>${esc(e.name)}</span><span class="dose">${esc(e.dose || '')}</span>${e.hint ? `<span class="hint">${esc(e.hint)}</span>` : ''}</li>`).join('')}</ul>`;
  const critDone = p => PHASES[p].criteria.every((_, i) => S.criteria[`${p}-${i}`]);
  const critCount = p => PHASES[p].criteria.filter((_, i) => S.criteria[`${p}-${i}`]).length;
  const thisWeekCheckin = () => S.checkins[key(monday(today()))];

  // ---------- Views ----------
  function renderTop() {
    const p = PHASES[S.phase];
    $('topSub').textContent = `${ppWeeksDone()} Wochen nach der Geburt · Phase ${S.phase + 1}: ${p.name}`;
  }

  function sessionCard(id, dateKey, isToday) {
    const s = SESSIONS[id];
    const done = S.log[dateKey]?.s;
    const h = hiitFor(id, planWeek());
    const short = s.kind === 'kraft' ? `<details><summary class="small muted" style="cursor:pointer">Wenig Zeit? 10-Minuten-Version</summary><p class="small muted" style="margin:6px 0">Eine Runde der ersten drei Übungen plus Beckenboden kurz. Zählt als erledigt.</p>${exList(s.ex, 3)}</details>` : '';
    return `<div class="card ${s.kind === 'hiit' ? 'heat' : ''}">
      <div class="row between"><span class="eyebrow">${isToday ? 'Heute' : 'Einheit'} · ${KIND[s.kind]}</span><span class="pill mono">ca. ${s.mins} Min.</span></div>
      <h2>${esc(s.title)}</h2>
      ${s.rounds ? `<p class="muted small">${esc(s.rounds)}. Aufwärmen: 5 Min. Atmung, Katze-Kuh, Hüftkreisen.</p>` : ''}
      ${exList(s.ex)}
      ${h ? `<p class="small"><b>Heute im Timer:</b> ${esc(h.title)} · ${mmss(total(h))} Min.</p>` : ''}
      ${short}
      <div class="row">
        ${h ? `<button class="btn heat" data-timer="${h.id}">Timer starten</button>` : ''}
        ${dateKey ? `<button class="btn ${done ? 'done' : ''}" data-done="${dateKey}">${done ? 'Erledigt ✓' : 'Als erledigt markieren'}</button>` : ''}
      </div>
    </div>`;
  }

  function renderToday() {
    const t = today(), tk = key(t), wd = t.getDay(), wk = planWeek(), pw = phaseWeek();
    const hour = new Date().getHours();
    const hello = hour < 11 ? 'Guten Morgen' : hour < 17 ? 'Hallo' : 'Guten Abend';
    const sid = slotFor(S.phase, wd, wk, pw);
    const ph = PHASES[S.phase];
    const ci = thisWeekCheckin();
    const dp = datePhase();
    let html = `<div class="card hero">
      <div class="eyebrow">${t.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      <h2>${hello}, Sophie</h2>
      <div class="row">
        <span class="chip"><b class="mono">${ppWeeksDone()}</b> Wochen nach der Geburt</span>
        <span class="chip">Phase ${S.phase + 1} · ${esc(ph.name)} · Woche ${pw}</span>
      </div>
      <div class="pbar" aria-hidden="true">${PHASES.map((_, i) => `<span class="${i < S.phase ? 'on' : i === S.phase ? 'cur' : ''}"></span>`).join('')}</div>
    </div>`;

    if (ci?.pelvic) html += `<div class="card warn"><h3>Diese Woche eine Stufe leichter</h3><p>Du hast Beschwerden am Beckenboden notiert. Bitte keine Sprünge oder Läufe, Gewichte reduzieren und das bei Hebamme, Frauenärztin oder Beckenboden-Physio ansprechen.</p></div>`;
    else if (ci && ci.energy <= 2) html += `<div class="card soft"><h3>Energie-Woche</h3><p>Wenig Energie notiert: diese Woche jede Einheit als 10-Minuten-Version reicht völlig. Schlaf geht vor.</p></div>`;

    if (S.phase < PHASES.length - 1 && critDone(S.phase) && dp > S.phase) {
      html += `<div class="card soft"><h3>Bereit für Phase ${S.phase + 2}</h3><p>Alle Kriterien erfüllt und der Zeitpunkt passt. Stark!</p><button class="btn" data-next-phase>Phase ${S.phase + 2} starten</button></div>`;
    }

    html += sid ? sessionCard(sid, tk, true) : `<div class="card"><div class="eyebrow">Heute</div><h2>Ruhetag</h2><p>Erholung gehört zum Training. Ein Spaziergang an der frischen Luft und die Beckenboden-Routine reichen heute.</p></div>`;

    const pf = SESSIONS[ph.daily];
    const pfDone = S.log[tk]?.pf;
    html += `<div class="card"><div class="row between"><h3>${esc(pf.title)} · täglich</h3><span class="pill mono">${pf.mins} Min.</span></div>
      <details><summary class="small muted" style="cursor:pointer">Übungen anzeigen</summary>${exList(pf.ex)}</details>
      <label class="check"><input type="checkbox" id="pfToday" ${pfDone ? 'checked' : ''}><span>Heute erledigt</span></label></div>`;

    const mon = monday(t);
    let planned = 0, done = 0;
    const cells = [...Array(7)].map((_, i) => {
      const d = new Date(mon); d.setDate(mon.getDate() + i);
      const k = key(d), s = slotFor(S.phase, d.getDay(), wk, pw), ok = S.log[k]?.s;
      if (s) planned++; if (ok) done++;
      return `<div class="day ${k === tk ? 'today' : ''}"><span>${WD[d.getDay()]}</span><b>${d.getDate()}</b><i class="dot ${ok ? 'ok' : s ? 'train' : ''}" title="${s ? esc(SESSIONS[s].title) : 'Ruhetag'}"></i></div>`;
    }).join('');
    html += `<div class="card"><div class="row between"><h3>Diese Woche</h3><span class="mono small">${done} von ${planned} Einheiten</span></div><div class="week">${cells}</div></div>`;

    const f = FOCUS[(wk - 1) % FOCUS.length];
    html += `<div class="card soft"><div class="eyebrow">Coaching · Woche ${wk}</div><h3>${esc(f[0])}</h3><p>${esc(f[1])}</p></div>`;

    for (let i = 1; i <= 7; i++) {
      const d = new Date(t); d.setDate(t.getDate() + i);
      const s = slotFor(S.phase, d.getDay(), planWeek() + (monday(d) > monday(t) ? 1 : 0), pw);
      if (s) { html += `<p class="muted small">Nächste Einheit: <b>${esc(SESSIONS[s].title)}</b> am ${d.toLocaleDateString('de-DE', { weekday: 'long' })}.</p>`; break; }
    }
    if (!ci) html += `<button class="btn ghost" data-goto="coach">Wochen-Check-in machen</button>`;
    $('v-heute').innerHTML = html;

    $('pfToday').addEventListener('change', e => { (S.log[tk] ||= {}).pf = e.target.checked; save(); });
  }

  let viewPhase = null;
  function renderPlan() {
    const vp = viewPhase ?? S.phase;
    const ph = PHASES[vp];
    const birth = parse(S.birth);
    const from = new Date(birth.getTime() + (ph.ppFrom - 1) * 7 * DAY);
    const to = new Date(birth.getTime() + ph.ppTo * 7 * DAY - DAY);
    const wk = planWeek();
    const rows = WEEK_ORDER.map(d => {
      const s = slotFor(vp, d, wk, vp === S.phase ? phaseWeek() : 9);
      return `<tr><th>${WD[d]}</th><td>${s ? `<b>${esc(SESSIONS[s].title)}</b> <span class="muted">· ${KIND[SESSIONS[s].kind]}</span>` : '<span class="muted">Ruhetag</span>'}</td></tr>`;
    }).join('');
    const uniq = [...new Set(ph.slots.concat(orderedDays().length > 4 ? ['extra'] : []))];
    const prevOk = vp === 0 || critDone(vp - 1);
    const n = critCount(vp), total = ph.criteria.length;

    let html = `<div class="row">${PHASES.map((p, i) => `<button class="chip-btn" aria-pressed="${i === vp}" data-vp="${i}">${i + 1} ${esc(p.name)}${i === S.phase ? ' •' : ''}</button>`).join('')}</div>
    <div class="card">
      <div class="row"><span class="pill solid" style="background:${ph.color}">Phase ${vp + 1}</span><span class="pill">${ph.ppTo > 90 ? `ab ${ph.ppFrom}. Woche` : `${ph.ppFrom}.–${ph.ppTo}. Woche`} nach Geburt</span><span class="pill">${fmt(from)}${ph.ppTo > 90 ? ' →' : ' – ' + fmt(to)}</span></div>
      <h2>${esc(ph.name)}</h2>
      <p>${esc(ph.goal)}</p>
      ${vp === S.phase ? '<p class="small muted">Das ist deine aktuelle Phase.</p>' : ''}
      ${vp === S.phase + 1 ? `<button class="btn" data-next-phase ${prevOk ? '' : 'disabled'}>Phase ${vp + 1} starten</button>${prevOk ? '' : '<p class="small muted">Erst alle Kriterien der aktuellen Phase abhaken.</p>'}` : ''}
    </div>
    <div class="card"><h3>Wochenplan</h3><p class="small muted">Für deine Trainingstage (änderbar unter Coach › Einstellungen). Täglich dazu: ${esc(SESSIONS[ph.daily].title)}.</p>
      <div class="scroll"><table class="t"><tbody>${rows}</tbody></table></div></div>
    ${uniq.map(id => { const s = SESSIONS[id]; return `<details class="card"><summary>${esc(s.title)} <span class="muted small">${KIND[s.kind]} · ${s.mins} Min.</span></summary>${s.rounds ? `<p class="small muted">${esc(s.rounds)}</p>` : ''}${exList(s.ex)}</details>`; }).join('')}
    <div class="card">
      <div class="row between"><h3>${vp === 3 ? 'Regeln für den Dauerbetrieb' : `Weiter zu Phase ${vp + 2}, wenn …`}</h3><span class="mono small">${n}/${total}</span></div>
      <div class="meter"><div style="width:${(n / total * 100).toFixed(0)}%"></div></div>
      ${ph.criteria.map((c, i) => `<label class="check"><input type="checkbox" data-crit="${vp}-${i}" id="crit-${vp}-${i}" ${S.criteria[`${vp}-${i}`] ? 'checked' : ''}><span>${esc(c)}</span></label>`).join('')}
      ${vp === 3 ? `<label class="check"><input type="checkbox" id="impactOk" ${S.impactOk ? 'checked' : ''}><span><b>Freigabe für Sprünge:</b> 4 Wochen beschwerdefrei gelaufen</span></label>` : ''}
    </div>
    ${warnCard()}`;
    $('v-plan').innerHTML = html;
    $('v-plan').querySelectorAll('[data-crit]').forEach(cb => cb.addEventListener('change', e => { S.criteria[e.target.dataset.crit] = e.target.checked; save(); renderPlan(); }));
    $('impactOk')?.addEventListener('change', e => { S.impactOk = e.target.checked; save(); });
  }

  const warnCard = () => `<div class="card warn"><h3>Sofort Pause und ärztlich abklären bei</h3><ul>
    <li>Urin-, Stuhl- oder Windverlust beim Training</li>
    <li>Druck-, Schwere- oder Fremdkörpergefühl im Becken</li>
    <li>Neuer Blutung oder Blutung länger als 8 Wochen nach der Geburt</li>
    <li>Schmerzen im Becken, an der Dammnaht oder im unteren Rücken</li>
    <li>Deutlicher Wölbung entlang der Bauchmitte bei Belastung</li>
    <li>Schwindel, Brustschmerz, ungewöhnlicher Atemnot, einseitig geschwollener Wade</li>
  </ul><p class="small">Bei anhaltenden Beschwerden hilft eine Beckenboden-Physiotherapie. Die Verordnung gibt es bei der Frauenärztin.</p></div>`;

  function renderHiit() {
    $('v-hiit').innerHTML = `<div class="card hero"><div class="eyebrow">HIIT</div><h2>Intervalle mit Timer</h2>
      <p>Freigeschaltet nach deiner aktuellen Phase. Sprünge kommen ganz zum Schluss, weil Stoßbelastung den Beckenboden am meisten fordert. Immer 5 Min. aufwärmen.</p></div>
      <div class="grid2">${HIIT.map(w => {
        const locked = w.phase > S.phase || (w.id === 'impact' && !S.impactOk);
        const list = w.blocks ? w.blocks.flat() : w.ex;
        const struct = w.blocks ? `${w.blocks.length} Blöcke · ${w.work}/${w.rest} Sek.` : `${w.rounds} × ${list.length > 1 ? list.length + ' Übungen · ' : ''}${w.work}/${w.rest} Sek.`;
        return `<div class="card ${locked ? 'locked' : ''}">
          <div class="row"><span class="pill solid" style="background:var(--p${w.phase + 1})">${esc(w.from)}</span><span class="pill mono">${mmss(total(w))} Min.</span></div>
          <h3>${esc(w.title)} <span class="intensity" aria-label="Intensität ${w.level} von 5">${[1, 2, 3, 4, 5].map(k => `<i class="${k <= w.level ? 'on' : ''}"></i>`).join('')}</span></h3>
          <p class="muted small">${esc(w.desc)}</p>
          <p class="mono small muted">${struct}</p>
          ${list.length > 1 ? `<ol class="small">${list.map(e => `<li>${esc(e[0])}</li>`).join('')}</ol>` : ''}
          <button class="btn ${locked ? 'ghost' : 'heat'}" data-timer="${w.id}">${locked ? 'Noch gesperrt · Vorschau' : 'Starten'}</button>
        </div>`;
      }).join('')}</div>`;
  }

  // ---------- Coach ----------
  let draft = null;
  function feedback(c) {
    const out = [];
    if (c.pelvic) out.push(['warn', 'Beckenboden geht vor', 'Diese Woche keine Sprünge und kein Laufen, Gewichte reduzieren. Halten die Beschwerden an: Hebamme, Frauenärztin oder Beckenboden-Physio.']);
    if (c.mood <= 2) out.push(['warn', 'Wie geht es dir wirklich?', 'Wenn die Stimmung seit mehr als zwei Wochen gedrückt ist, du dich leer, ängstlich oder überfordert fühlst: sprich mit Hebamme oder Ärztin. Eine Wochenbettdepression ist häufig und gut behandelbar.']);
    if (c.energy <= 2 || c.sleep <= 2) out.push(['soft', 'Erholungswoche', 'Jede Einheit als 10-Minuten-Version, dafür Schlaf priorisieren: Nickerchen wenn das Baby schläft, eine Nachtschicht an Florian abgeben. Eisenwerte prüfen lassen, falls noch nicht passiert.']);
    if (!out.length && c.energy >= 4 && c.sleep >= 3) out.push(['soft', 'Läuft!', 'Du darfst steigern: zwei Wiederholungen mehr oder etwas mehr Gewicht. Kriterien der Phase im Plan-Reiter abhaken.']);
    if (!out.length) out.push(['soft', 'Dranbleiben', 'Plan so lassen wie er ist. Konstanz schlägt Intensität.']);
    return out;
  }
  function renderCoach() {
    const wk = key(monday(today()));
    const c = draft || S.checkins[wk] || { energy: 0, sleep: 0, mood: 0, pelvic: false, note: '' };
    draft = { ...c };
    const scale = (f, label, lo, hi) => `<div class="stack" style="gap:6px"><div class="row between small"><b>${label}</b><span class="muted">${lo} → ${hi}</span></div>
      <div class="scale">${[1, 2, 3, 4, 5].map(v => `<button aria-pressed="${c[f] === v}" data-scale="${f}" data-v="${v}">${v}</button>`).join('')}</div></div>`;
    const saved = S.checkins[wk];
    const hist = Object.keys(S.checkins).sort().slice(-6).reverse();
    const pw = planWeek();
    $('v-coach').innerHTML = `
    <div class="card hero"><div class="eyebrow">Coach</div><h2>Wochen-Check-in</h2><p>Einmal pro Woche, am besten sonntags. Zwei Minuten, und die App passt die nächste Woche an.</p></div>
    <div class="card">
      ${scale('energy', 'Energie', 'leer', 'voller Akku')}
      ${scale('sleep', 'Erholt vom Schlaf', 'gar nicht', 'sehr')}
      ${scale('mood', 'Stimmung', 'schwer', 'richtig gut')}
      <label class="check"><input type="checkbox" id="ciPelvic" ${c.pelvic ? 'checked' : ''}><span>Beschwerden am Beckenboden (Druck, Urinverlust, Schmerzen)</span></label>
      <label class="f" for="ciNote">Notiz für die Woche<textarea id="ciNote" placeholder="z. B. 2 schlechte Nächte, Kraft B war super">${esc(c.note || '')}</textarea></label>
      <button class="btn" id="ciSave">${saved ? 'Check-in aktualisieren' : 'Check-in speichern'}</button>
    </div>
    ${saved ? feedback(saved).map(([cls, h, p]) => `<div class="card ${cls}"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('') : ''}
    ${hist.length ? `<div class="card"><h3>Verlauf</h3><div class="scroll"><table class="t"><thead><tr><th>Woche ab</th><th>Energie</th><th>Schlaf</th><th>Stimmung</th><th>Becken</th></tr></thead><tbody>
      ${hist.map(k => { const h = S.checkins[k]; return `<tr><td>${fmt(parse(k))}</td><td class="mono">${h.energy || '–'}</td><td class="mono">${h.sleep || '–'}</td><td class="mono">${h.mood || '–'}</td><td>${h.pelvic ? '⚠︎' : '✓'}</td></tr>`; }).join('')}
    </tbody></table></div></div>` : ''}

    <div class="card soft"><div class="eyebrow">Wochenfokus · Woche ${pw}</div><h3>${esc(FOCUS[(pw - 1) % FOCUS.length][0])}</h3><p>${esc(FOCUS[(pw - 1) % FOCUS.length][1])}</p></div>
    <details class="card"><summary>Alle 12 Coaching-Themen</summary><ol>${FOCUS.map(f => `<li><b>${esc(f[0])}:</b> ${esc(f[1])}</li>`).join('')}</ol></details>

    <div class="card">
      <h3>Fünf Regeln für mehr Energie</h3>
      <ol>
        <li><b>Schlaf schützen:</b> Ein fester Schlafblock pro Nacht, den Florian abdeckt, bringt mehr als jedes Supplement.</li>
        <li><b>Bewegung vor Perfektion:</b> 10 Minuten zählen. An schlechten Tagen reicht die Kurzversion.</li>
        <li><b>Regelmäßig essen:</b> Drei Mahlzeiten und zwei Snacks mit Eiweiß. Lange Pausen enden im Energieloch.</li>
        <li><b>Licht und Luft:</b> Täglich raus, am besten vormittags.</li>
        <li><b>Blutwerte kennen:</b> Eisen, Ferritin und Schilddrüse bei der Ärztin prüfen lassen, wenn die Müdigkeit nicht weggeht.</li>
      </ol>
    </div>

    <div class="card">
      <h3>Für Florian: so hilfst du am meisten</h3>
      <ul>
        <li>Trainingszeit blocken: An den Trainingstagen das Baby fest übernehmen, Handy weg.</li>
        <li>Eine Nachtschicht oder den frühen Morgen übernehmen.</li>
        <li>Sonntags Meal-Prep machen (siehe Essen).</li>
        <li>Fortschritte bemerken und aussprechen, nicht Gewicht oder Figur.</li>
        <li>Auf Stimmung achten und ansprechen, wenn sie über Wochen gedrückt ist.</li>
      </ul>
    </div>

    <div class="card warn">
      <h3>Baby-Blues oder mehr?</h3>
      <p>Weinerlichkeit in den ersten zwei Wochen ist häufig und geht von allein. Halten Niedergeschlagenheit, Antriebslosigkeit, Angst oder Schuldgefühle länger als zwei Wochen an, kann eine Wochenbettdepression dahinterstecken. Ansprechpartner: Hebamme, Frauenärztin, Hausarzt. Rund um die Uhr und kostenlos: Telefonseelsorge <span class="mono">0800 111 0 111</span>. Infos für Eltern: Schatten &amp; Licht e. V. (schatten-und-licht.de).</p>
    </div>

    ${warnCard()}

    <div class="card" id="settings">
      <h3>Einstellungen</h3>
      <label class="f" for="setBirth">Geburtstag des Babys<input type="date" id="setBirth" value="${S.birth}"></label>
      <div class="stack" style="gap:6px"><b class="small">Trainingstage (3 bis 4 empfohlen)</b>
        <div class="row">${WEEK_ORDER.map(d => `<button class="chip-btn" data-day="${d}" aria-pressed="${S.days.includes(d)}">${WD[d]}</button>`).join('')}</div></div>
      <label class="f" for="setPhase">Aktuelle Phase<select id="setPhase">${PHASES.map((p, i) => `<option value="${i}" ${i === S.phase ? 'selected' : ''}>Phase ${i + 1}: ${esc(p.name)}</option>`).join('')}</select></label>
      <div class="row">
        <button class="btn ghost" id="exportBtn">Daten sichern</button>
        <label class="btn ghost" for="importFile" style="cursor:pointer">Sicherung laden</label>
        <input type="file" id="importFile" accept="application/json" hidden>
      </div>
      <p class="small muted">Alle Daten bleiben auf diesem Gerät. „Daten sichern“ lädt eine Datei herunter, die du auf einem anderen Gerät wieder laden kannst.</p>
    </div>

    <details class="card"><summary>Quellen</summary><ul class="src">
      <li>Goom, Donnelly, Brockwell (2019): Returning to running postnatal – guideline for medical, health and fitness professionals. Belastungs- und Krafttests, Zeitrahmen ab 12 Wochen.</li>
      <li>Manchester University NHS: Returning to exercise in the postnatal period. Wochenweiser Aufbau nach vaginaler Geburt.</li>
      <li>Netzwerk Gesund ins Leben: Handlungsempfehlungen Ernährung und Bewegung von Säuglingen und stillenden Frauen (Update 2024). 150 Min. moderate Bewegung pro Woche plus Kraft an 2 Tagen.</li>
      <li>Verbraucherzentrale: Jod, Vitamine, Omega-3 in der Stillzeit. 100 µg Jod, 2 × Fisch/Woche oder 200 mg DHA, Eisen nur bei Mangel, ca. +500 kcal.</li>
      <li>Systematic Review und Metaanalyse: Effekt postpartaler Anämie auf die Lebensqualität (PMC8862508). Eisenmangel und Erschöpfung.</li>
      <li>Gluppe et al. (2021), Systematic Review zu Bauch- und Beckenbodentraining bei Rektusdiastase.</li>
      <li>KellyMom: Abnehmen in der Stillzeit, nicht vor 2 Monaten, langsam, nicht unter 1.500–1.800 kcal.</li>
    </ul><p class="small muted">Diese App ersetzt keine ärztliche oder physiotherapeutische Untersuchung.</p></details>`;

    const v = $('v-coach');
    v.querySelectorAll('[data-scale]').forEach(b => b.addEventListener('click', () => { draft[b.dataset.scale] = +b.dataset.v; draft.pelvic = $('ciPelvic').checked; draft.note = $('ciNote').value; renderCoach(); }));
    $('ciSave').addEventListener('click', () => {
      draft.pelvic = $('ciPelvic').checked; draft.note = $('ciNote').value;
      if (!draft.energy || !draft.sleep || !draft.mood) { toast('Bitte Energie, Schlaf und Stimmung auswählen.'); return; }
      S.checkins[wk] = { ...draft }; draft = null; save(); renderAll(); toast('Check-in gespeichert');
    });
    $('setBirth').addEventListener('change', e => { if (e.target.value) { S.birth = e.target.value; save(); renderAll(); } });
    v.querySelectorAll('[data-day]').forEach(b => b.addEventListener('click', () => {
      const d = +b.dataset.day;
      S.days = S.days.includes(d) ? S.days.filter(x => x !== d) : [...S.days, d];
      save(); renderAll();
    }));
    $('setPhase').addEventListener('change', e => setPhase(+e.target.value));
    $('exportBtn').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `sophie-fit-${key(today())}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $('importFile').addEventListener('change', async e => {
      const f = e.target.files[0]; if (!f) return;
      try { S = Object.assign({}, DEFAULTS, JSON.parse(await f.text())); save(); renderAll(); toast('Sicherung geladen'); }
      catch (err) { toast('Die Datei konnte nicht gelesen werden. Ist es eine Sophie-Fit-Sicherung?'); }
    });
  }

  function setPhase(p) {
    S.phase = p; S.phaseStart[p] = S.phaseStart[p] || key(today()); viewPhase = null;
    save(); renderAll(); toast(`Phase ${p + 1}: ${PHASES[p].name}`);
  }

  // ---------- Navigation ----------
  const VIEWS = ['heute', 'plan', 'hiit', 'essen', 'coach'];
  function show(v) {
    VIEWS.forEach(x => { $('v-' + x).hidden = x !== v; });
    document.querySelectorAll('.tabs button').forEach(b => { if (b.dataset.v === v) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    try { sessionStorage.setItem('sf-view', v); } catch (e) {}
    window.scrollTo(0, 0);
  }
  document.querySelector('.tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(b.dataset.v); });
  $('openSettings').addEventListener('click', () => { show('coach'); setTimeout(() => $('settings').scrollIntoView({ behavior: 'smooth' }), 50); });

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-timer],[data-done],[data-next-phase],[data-vp],[data-goto]');
    if (!t) return;
    if (t.dataset.timer) openTimer(HIIT.find(h => h.id === t.dataset.timer));
    else if (t.dataset.done) {
      const k = t.dataset.done; const entry = (S.log[k] ||= {}); entry.s = !entry.s; save(); renderAll();
      if (entry.s) toast('Stark. Einheit erledigt!');
    }
    else if (t.hasAttribute('data-next-phase')) setPhase(Math.min(S.phase + 1, PHASES.length - 1));
    else if (t.dataset.vp) { viewPhase = +t.dataset.vp; renderPlan(); }
    else if (t.dataset.goto) show(t.dataset.goto);
  });

  function renderAll() { renderTop(); renderToday(); renderPlan(); renderHiit(); renderCoach(); }

  // ---------- Timer ----------
  function buildSeq(w) {
    const seq = [{ kind: 'prep', name: 'Gleich geht’s los', hint: 'Position einnehmen', secs: 10 }];
    const push = (ex, last) => {
      seq.push({ kind: 'work', name: ex[0], hint: ex[1] || '', secs: w.work });
      if (!last && w.rest) seq.push({ kind: 'rest', name: w.restName, hint: '', secs: w.rest });
    };
    if (w.blocks) {
      w.blocks.forEach((pair, b) => {
        for (let r = 0; r < w.rounds; r++) pair.forEach((ex, i) => push(ex, b === w.blocks.length - 1 && r === w.rounds - 1 && i === pair.length - 1));
        if (b < w.blocks.length - 1) seq.push({ kind: 'rest', name: 'Blockpause', hint: 'Locker gehen, trinken', secs: w.blockRest });
      });
    } else {
      for (let r = 0; r < w.rounds; r++) w.ex.forEach((ex, i) => {
        const lastIn = i === w.ex.length - 1, lastAll = lastIn && r === w.rounds - 1;
        if (lastIn && !lastAll && w.roundRest) { push(ex, true); seq.push({ kind: 'rest', name: 'Rundenpause', hint: 'Locker gehen, trinken', secs: w.roundRest }); }
        else push(ex, lastAll);
      });
    }
    return seq;
  }
  function mmss(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
  function total(w) { return buildSeq(w).reduce((a, b) => a + b.secs, 0); }

  let seq = [], idx = 0, left = 0, tick = null, running = false, audio = null, wake = null, lastFocus = null;
  function beep(freq, dur) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = freq; o.connect(g); g.connect(audio.destination);
      g.gain.setValueAtTime(0.25, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur);
      o.start(); o.stop(audio.currentTime + dur);
    } catch (e) {}
  }
  function paint() {
    const s = seq[idx];
    $('timer').dataset.kind = s.kind;
    $('tKind').textContent = s.kind === 'work' ? 'Arbeit' : s.kind === 'rest' ? 'Pause' : 'Vorbereitung';
    $('tName').textContent = s.name; $('tHint').textContent = s.hint; $('tClock').textContent = mmss(left);
    const nx = seq.slice(idx + 1).find(x => x.kind === 'work');
    $('tNext').textContent = nx ? `Als Nächstes: ${nx.name}` : 'Letztes Intervall';
    const works = seq.filter(x => x.kind === 'work').length;
    const n = seq.slice(0, idx + 1).filter(x => x.kind === 'work').length;
    $('tPos').textContent = `Intervall ${Math.max(n, 1)} von ${works}`;
    const sum = seq.reduce((a, b) => a + b.secs, 0);
    const el = seq.slice(0, idx).reduce((a, b) => a + b.secs, 0) + (s.secs - left);
    $('tBar').style.width = `${(el / sum * 100).toFixed(1)}%`;
  }
  function step() {
    left--;
    if (left > 0 && left <= 3) beep(660, 0.12);
    if (left <= 0) {
      idx++;
      if (idx >= seq.length) return finish();
      left = seq[idx].secs; beep(seq[idx].kind === 'work' ? 990 : 520, 0.35);
    }
    paint();
  }
  function play(on) { running = on; clearInterval(tick); if (on) tick = setInterval(step, 1000); $('tPlay').textContent = on ? 'Pause' : 'Weiter trainieren'; }
  function finish() {
    play(false);
    $('timer').dataset.kind = 'rest'; $('tKind').textContent = 'Geschafft'; $('tName').textContent = 'Super gemacht, Sophie!';
    $('tHint').textContent = '5 Minuten locker auslaufen oder gehen und dehnen.'; $('tClock').textContent = '0:00'; $('tNext').textContent = '';
    $('tBar').style.width = '100%'; $('tPlay').hidden = true; $('tSkip').hidden = true; beep(880, 0.6);
    const tk = key(today());
    if (slotFor(S.phase, today().getDay(), planWeek(), phaseWeek()) && !S.log[tk]?.s) { (S.log[tk] ||= {}).s = true; save(); renderAll(); }
  }
  async function openTimer(w) {
    lastFocus = document.activeElement;
    seq = buildSeq(w); idx = 0; left = seq[0].secs;
    $('tTitle').textContent = w.title; $('tPlay').hidden = false; $('tSkip').hidden = false; $('timer').hidden = false;
    document.body.style.overflow = 'hidden'; beep(520, 0.15); paint(); play(true); $('tClose').focus();
    try { wake = await navigator.wakeLock?.request('screen'); } catch (e) { wake = null; }
  }
  function closeTimer() {
    play(false); $('timer').hidden = true; document.body.style.overflow = '';
    try { wake?.release(); } catch (e) {} wake = null; lastFocus?.focus();
  }
  $('tPlay').addEventListener('click', () => play(!running));
  $('tSkip').addEventListener('click', () => { left = 1; step(); });
  $('tClose').addEventListener('click', closeTimer);
  document.addEventListener('keydown', e => { if (!$('timer').hidden && e.key === 'Escape') closeTimer(); });

  // ---------- Start ----------
  renderAll();
  let start = 'heute';
  try { start = sessionStorage.getItem('sf-view') || (VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'heute'); } catch (e) {}
  show(start);

  if ('serviceWorker' in navigator && location.protocol === 'https:' && location.hostname.endsWith('github.io')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
