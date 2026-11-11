/* ---------- teams & scrims (server-backed) ---------- */
Object.assign(T.ru.sst, { reported: "ждём подтверждения", toconfirm: "подтвердите результат", disputed: "результат оспорен" });
Object.assign(T.en.sst, { reported: "awaiting confirmation", toconfirm: "confirm the result", disputed: "result disputed" });
Object.assign(T.ru, { sc_remind: "", lv_kick: "Убрать из команды", lv_disband_q: "Распустить команду? Это нельзя отменить.", lv_leave_q: "Выйти из команды?", lv_yes: "Да",
  lv_rep_note: "Результат засчитается и изменит рейтинг, когда его подтвердит соперник.", lv_rep_sent: "Результат отправлен сопернику на подтверждение",
  lv_cf_t: "Результат прака", lv_cf_score: (a, b) => "Соперник внёс счёт " + a + ":" + b + " (вы : они).", lv_cf_ns: "Соперник отметил, что ваша команда не пришла на прак.", lv_cf_beh: "Как соперник пришёл на игру",
  lv_cf_ok: "Подтвердить", lv_cf_no: "Оспорить", lv_cf_done: "Результат засчитан", lv_cf_disputed: "Результат оспорен — его посмотрит модератор", lv_veto_wait: "Обновляется автоматически, когда ходит соперник.",
  lv_team_login: "Войдите, чтобы создавать команды и подавать заявки." });
Object.assign(T.en, { sc_remind: "", lv_kick: "Remove from team", lv_disband_q: "Disband the team? This cannot be undone.", lv_leave_q: "Leave the team?", lv_yes: "Yes",
  lv_rep_note: "The result counts and changes the rating once your opponent confirms it.", lv_rep_sent: "Result sent to the opponent for confirmation",
  lv_cf_t: "Scrim result", lv_cf_score: (a, b) => "The opponent reported " + a + ":" + b + " (you : them).", lv_cf_ns: "The opponent reported that your team did not show up.", lv_cf_beh: "How the opponent showed up",
  lv_cf_ok: "Confirm", lv_cf_no: "Dispute", lv_cf_done: "Result recorded", lv_cf_disputed: "Result disputed — a moderator will review it", lv_veto_wait: "Updates automatically when the opponent moves.",
  lv_team_login: "Sign in to create teams and apply." });
Object.assign(T.ru.lv_err, { team_err_name: "Название команды — от 3 символов.", team_err_tag: "Тег: 2–5 латинских букв или цифр.", team_have: "У вас уже есть команда в этой игре.", tag_taken: "Этот тег уже занят.", team_full: "В команде нет свободных мест.", team_member: "Вы уже в этой команде.",
  no_rights: "Это может делать только капитан или менеджер.", app_gone: "Заявка уже обработана.", app_has_team: "Игрок уже вступил в другую команду.", captain_leave: "Капитан не может выйти — можно только распустить команду.", bad_time: "Выберите время в будущем.",
  slot_taken: "Этот слот уже занят или отменён.", veto_turn: "Сейчас ход соперника.", veto_closed: "Вето уже завершено.", veto_map: "Эта карта уже выбрана.", report_closed: "Результат уже внесён.", report_early: "Результат можно внести после начала прака.",
  report_own: "Свой результат подтверждает соперник.", rep_need: "Укажите счёт хотя бы одной карты.", team_gone: "Команда больше не существует.", scrim_gone: "Этот прак отменён." });
Object.assign(T.en.lv_err, { team_err_name: "Team name: at least 3 characters.", team_err_tag: "Tag: 2–5 Latin letters or digits.", team_have: "You already have a team in this game.", tag_taken: "This tag is taken.", team_full: "The team has no free spots.", team_member: "You are already in this team.",
  no_rights: "Only the captain or a manager can do this.", app_gone: "This application was already handled.", app_has_team: "The player has joined another team.", captain_leave: "The captain cannot leave — only disband the team.", bad_time: "Pick a time in the future.",
  slot_taken: "This slot is taken or cancelled.", veto_turn: "It is the opponent's turn.", veto_closed: "The veto is finished.", veto_map: "This map is already taken.", report_closed: "The result is already reported.", report_early: "You can report after the scrim starts.",
  report_own: "Your result is confirmed by the opponent.", rep_need: "Enter the score of at least one map.", team_gone: "The team no longer exists.", scrim_gone: "This scrim was cancelled." });

function isMyTeam(id) { const tm = S.teams.find(x => x.id === id); return !!(tm && tm.mine); }
function viewScrim(sc, side) {
  const host = side === sc.host, st = sc.status;
  const o = { id: sc.id, team: side, opp: host ? sc.guest : sc.host, game: sc.game, at: sc.at, format: sc.format, note: sc.note, maps: sc.maps || null, raw: sc, host };
  o.status = st === "requested" ? (host ? "incoming" : "pending") : st === "reported" ? ((sc.rep.by === "host") === host ? "reported" : "toconfirm") : st;
  if (st === "played" && sc.res) {
    if (sc.res.ns) { o.res = "ns"; o.delta = 0; }
    else { const mine = (sc.res.by === "host") === host; o.res = mine ? sc.res.res : 1 - sc.res.res; o.delta = mine ? sc.res.delta : -sc.res.delta; o.score = mine ? sc.res.wins + ":" + sc.res.losses : sc.res.losses + ":" + sc.res.wins; }
  }
  return o;
}
function setTeams(r) {
  S.teams = r.teams.map(tm => { tm.members.forEach(m => { m.me = !!ME && m.uid === ME.id; }); tm.mine = tm.members.some(m => m.me); tm.apps = tm.apps || []; return tm; });
  S.apps = {}; (r.apps || []).forEach(id => { S.apps[id] = "pending"; });
  S.scrims = []; SLOTS.length = 0; S.booked = {};
  r.scrims.forEach(sc => {
    if (!S.teams.some(x => x.id === sc.host) || (sc.guest && !S.teams.some(x => x.id === sc.guest))) return;
    const mh = isMyTeam(sc.host), mg = !!sc.guest && isMyTeam(sc.guest);
    if (mh) S.scrims.push(viewScrim(sc, sc.host)); else if (mg) S.scrims.push(viewScrim(sc, sc.guest));
    if (!mh && (sc.status === "open" || (mg && (sc.status === "requested" || sc.status === "confirmed")))) { SLOTS.push({ id: sc.id, team: sc.host, game: sc.game, at: sc.at, format: sc.format, note: sc.note }); if (mg) S.booked[sc.id] = sc.id; }
  });
  LV.teamsAt = Date.now(); LV.teamsSig = JSON.stringify([r.teams, r.scrims, r.apps]);
}
async function refreshTeams() {
  const r = await api("GET", "/teams"); if (!r.ok) return false;
  const before = LV.teamsSig; setTeams(r);
  return before !== LV.teamsSig;
}
async function teamAct(path, body, okMsg, method) {
  const r = await api(method || "POST", path, body || {});
  if (!r.ok) toast(errText(r));
  await refreshTeams();
  if (r.ok && $("#overlay")) closeModal();
  if (S.view === "teams") { renderTeams(); renderRail(); }
  if (r.ok && okMsg) toast(okMsg);
  return r.ok ? r : null;
}
function askThen(q, fn) { toast(q, { label: t("lv_yes"), fn }); }
function stChip(sc) {
  const extra = { reported: "wait", toconfirm: "in", disputed: "lose" }[sc.status];
  return extra ? `<span class="st-chip ${extra}">${esc(t("sst")[sc.status])}</span>` : stChip__base(sc);
}
function scrimCard(sc, tm) {
  let h = scrimCard__base(sc, tm);
  if (sc.status === "toconfirm" && can(tm, "veto")) h = h.replace(/<\/div><\/article>$/, `<button class="btn primary small" data-action="sc-confirm" data-id="${esc(sc.id)}">${esc(t("lv_cf_ok"))}</button></div></article>`);
  return h;
}
// redraws the teams page when fresh data differs from what is on screen
function teamsDraw() { if (S.view === "teams" && !$("#overlay") && LV.teamsSig !== LV.teamsDrawn && !(document.activeElement && document.activeElement.matches && document.activeElement.matches("#page select"))) { renderTeams(); renderRail(); } }
function renderTeams() {
  LV.teamsDrawn = LV.teamsSig;
  renderTeams__base();
  $$("#page select[data-trole]").forEach(sel => sel.insertAdjacentHTML("beforeend", `<option value="__kick">${esc(t("lv_kick"))}</option>`));
  const b = $('#page [data-action="team-disband"]');
  if (b) { const tm = findTeam(b.dataset.id); if (tm && myRole(tm) !== "captain") { b.dataset.action = "team-leave"; b.textContent = t("leave"); } }
  if (!ME && S.teamTab === "mine") $("#page").insertAdjacentHTML("beforeend", `<p class="hint" style="margin-top:12px">${esc(t("lv_team_login"))}</p>`);
}
function teamSheet(id) {
  const tm = findTeam(id); if (!tm) { toast(t("lv_err").team_gone); return; }
  teamSheet__base(id);
  const go = $("#tapGo"); if (!go) return;
  const btn = go.cloneNode(true); go.replaceWith(btn);
  btn.addEventListener("click", () => {
    if (!ME) { authSheet("login"); return; }
    teamAct("/teams/" + tm.id + "/apply", { role: $("#tapRole").value, msg: $("#tapMsg").value.trim() }, t("team_sent"));
  });
}
function teamNewSheet(game0) {
  if (!ME) { authSheet("login"); return; }
  const D = { game: game0 || (S.game !== "all" ? S.game : (S.profile.games[0] || "cs2")), style: "serious", open: [], err: "", name: "", tag: "", desc: "", sched: "" };
  const build = () => {
    const G = GAMES[D.game];
    return `${D.err ? `<p class="ferr">${esc(D.err)}</p>` : ""}<div class="row2"><div class="field"><label class="lbl" for="tnName">${esc(t("team_name"))}</label><input class="inp" id="tnName" maxlength="24" value="${esc(D.name)}"></div><div class="field"><label class="lbl" for="tnTag">${esc(t("team_tag"))}</label><input class="inp mono" id="tnTag" maxlength="5" autocapitalize="characters" value="${esc(D.tag)}" placeholder="ABC"></div></div><p class="hint" style="margin-top:-14px">${esc(t("team_tag_hint"))}</p>
<section class="fsec"><h4>${esc(t("s_game"))}</h4><div class="gpick">${railOrder().map(k => `<button type="button" data-tg="${k}" aria-pressed="${k === D.game}" style="--g:var(${GAMES[k].color})"><i></i>${esc(gshort(k))}</button>`).join("")}</div></section>
<section class="fsec"><h4>${esc(t("team_open"))}</h4><div class="chips">${Object.keys(G.roles).map(r => `<button type="button" class="chip" data-tr="${r}" aria-pressed="${D.open.includes(r)}">${esc(roleName(D.game, r))}</button>`).join("")}</div></section>
<section class="fsec"><h4>${esc(t("style"))}</h4><div class="seg">${STYLES.map(s => `<button type="button" data-ts="${s}" aria-pressed="${D.style === s}">${esc(t("styles")[s])}</button>`).join("")}</div></section>
<div class="field"><label class="lbl" for="tnDesc">${esc(t("team_desc"))}</label><textarea class="inp" id="tnDesc" maxlength="240" placeholder="${esc(t("team_desc_ph"))}">${esc(D.desc)}</textarea></div>
<div class="field"><label class="lbl" for="tnSched">${esc(t("team_sched"))}</label><input class="inp" id="tnSched" maxlength="80" placeholder="${esc(t("team_sched_ph"))}" value="${esc(D.sched)}"></div>`;
  };
  const read = () => { D.name = $("#tnName").value; D.tag = $("#tnTag").value; D.desc = $("#tnDesc").value; D.sched = $("#tnSched").value; };
  openSheet(t("team_new"), build(), `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="tnGo">${esc(t("team_create"))}</button>`, ov => {
    ov.addEventListener("click", async e => {
      const g = e.target.closest("[data-tg]"), r = e.target.closest("[data-tr]"), s = e.target.closest("[data-ts]");
      if (g || r || s) { read(); if (g) { D.game = g.dataset.tg; D.open = []; } if (r) { const k = r.dataset.tr, i = D.open.indexOf(k); i >= 0 ? D.open.splice(i, 1) : D.open.push(k); } if (s) D.style = s.dataset.ts; D.err = ""; $("#sheetBody").innerHTML = build(); return; }
      const go = e.target.closest("#tnGo"); if (!go || go.disabled) return;
      read(); const name = D.name.trim(), tag = D.tag.trim().toUpperCase(), E = t("lv_err");
      const bad = name.length < 3 ? E.team_err_name : !/^[A-Z0-9]{2,5}$/.test(tag) ? E.team_err_tag : "";
      if (bad) { D.err = bad; $("#sheetBody").innerHTML = build(); return; }
      go.disabled = true;
      const x = await api("POST", "/teams", { name, tag, game: D.game, style: D.style, open: D.open, desc: D.desc.trim(), sched: D.sched.trim() });
      if (!x.ok) { D.err = errText(x); if ($("#sheetBody")) { $("#sheetBody").innerHTML = build(); go.disabled = false; } return; }
      addMyGame(D.game); S.teamTab = "mine"; S.myTeamSel = x.team.id;
      await refreshTeams(); closeModal(); setView("teams"); toast(t("team_created"));
    });
  });
}
function slotNewSheet(teamId) {
  const tm = findTeam(teamId); if (!tm || !can(tm, "scrims")) { toast(t("sc_no_rights")); return; }
  const D = { day: 0, format: "bo1" }, times = []; for (let h = 10; h <= 23; h++) { times.push(h + ":00"); times.push(h + ":30"); }
  const build = () => `<div class="field"><span class="lbl">${esc(t("sc_day"))}</span><div class="seg">${[0, 1, 2].map(d => `<button type="button" data-sd="${d}" aria-pressed="${D.day === d}">${esc([t("today"), t("tomorrow"), t("after")][d])}</button>`).join("")}</div></div>
<div class="row2"><div class="field"><label class="lbl" for="scTime">${esc(t("sc_time"))}</label><select class="inp" id="scTime">${times.map(x => `<option${x === (D.time || "20:00") ? " selected" : ""}>${x}</option>`).join("")}</select></div>
<div class="field"><span class="lbl">${esc(t("sc_format"))}</span><div class="seg">${Object.keys(FORMATS).map(f => `<button type="button" data-sf="${f}" aria-pressed="${D.format === f}">${esc(fmtLabel(tm.game, f))}</button>`).join("")}</div></div></div>
<div class="field"><label class="lbl" for="scNote">${esc(t("sc_note"))}</label><input class="inp" id="scNote" maxlength="80" placeholder="${esc(t("sc_note_ph"))}" value="${esc(D.note || "")}"></div>`;
  const read = () => { D.time = $("#scTime").value; D.note = $("#scNote").value; };
  openSheet(t("sc_new_t") + " · " + tm.tag, build(), `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="scGo">${esc(t("sc_create"))}</button>`, ov => {
    ov.addEventListener("click", e => {
      const d = e.target.closest("[data-sd]"), f = e.target.closest("[data-sf]");
      if (d || f) { read(); if (d) D.day = +d.dataset.sd; if (f) D.format = f.dataset.sf; $("#sheetBody").innerHTML = build(); return; }
      if (!e.target.closest("#scGo")) return;
      read(); const [hh, mm] = D.time.split(":").map(Number);
      let at = atTime(D.day, hh, mm); if (at < Date.now()) at = atTime(D.day + 1, hh, mm);
      teamAct("/scrims", { team: tm.id, at, format: D.format, note: D.note.trim() }, t("sc_created"));
    });
  });
}
function bookSlot(slotId) {
  if (!ME) { authSheet("login"); return; }
  const sl = SLOTS.find(x => x.id === slotId); if (!sl) return;
  const tm = teamFor(sl.game);
  if (!tm) { toast(t("sc_need_team", gname(sl.game)), { label: t("team_new"), fn: () => teamNewSheet(sl.game) }); return; }
  if (!can(tm, "scrims")) { toast(t("sc_no_rights")); return; }
  teamAct("/scrims/" + slotId + "/book", { team: tm.id }, t("sc_requested"));
}
function vetoSheet(id) {
  const get = () => S.scrims.find(x => x.id === id);
  let sc = get(); if (!sc || !MAPS[sc.game]) return;
  const seq = VETO_SEQ[sc.format], opp = findTeam(sc.opp);
  const render = () => {
    sc = get(); if (!sc || !$("#sheetBody")) return;
    const v = sc.raw.veto || { i: 0, res: {}, order: [] }, done = v.i >= seq.length, tm = findTeam(sc.team);
    const ours = !done && (v.i % 2 === 0) === sc.host, canMove = ours && tm && can(tm, "veto");
    const who = by => ((by === "host") === sc.host ? "us" : "them");
    const step = done ? `<div class="veto-step">${ICON.check}${esc(t("veto_result"))}: ${esc(v.order.join(", "))}</div>` : `<div class="veto-step${ours ? "" : " them"}">${ours ? esc(t("veto_us")) + " · " + esc(t("veto_act")[seq[v.i]]) : esc(t("veto_them"))}</div>`;
    const grid = `<div class="veto-grid" id="vetoGrid">${MAPS[sc.game].map(m => { const r = v.res[m]; return r ? `<div class="vmap ${r.a}"><span>${esc(m)}</span><small>${esc(t("veto_act")[r.a])}${r.by ? " · " + esc(t("veto_by")[who(r.by)]) : ""}</small></div>` : `<button type="button" class="vmap" data-vm="${esc(m)}"${canMove ? "" : " disabled"}><span>${esc(m)}</span><small>${esc(fmtLabel(sc.game, sc.format))}</small></button>`; }).join("")}</div>`;
    $("#sheetBody").innerHTML = step + grid + `<p class="hint">${esc(t("veto_pool")[sc.game])}${done ? "" : " " + esc(t("lv_veto_wait"))}</p>`;
  };
  openSheet(t("veto") + " · " + (opp ? opp.tag : ""), "", `<button class="btn primary" data-action="close-modal">${esc(t("close"))}</button>`, ov => {
    ov.addEventListener("click", async e => {
      const b = e.target.closest("[data-vm]"); if (!b || b.disabled) return;
      $$("#vetoGrid [data-vm]").forEach(x => { x.disabled = true; });
      const r = await api("POST", "/scrims/" + id + "/veto", { map: b.dataset.vm });
      if (!r.ok) toast(errText(r));
      await refreshTeams(); render();
    });
  });
  render();
  let drawn = "";
  const timer = setInterval(async () => { if (!$("#vetoGrid")) { clearInterval(timer); return; } if (document.hidden) return; await refreshTeams(); const x = get(), sig = x ? JSON.stringify(x.raw.veto) : ""; if (sig !== drawn) { drawn = sig; render(); } }, 2000);
}
function reportScrimSheet(id) {
  const sc = S.scrims.find(x => x.id === id); if (!sc) return;
  const opp = findTeam(sc.opp), n = FORMATS[sc.format], hasMaps = !!MAPS[sc.game], D = { beh: "ok", win: {} };
  const rows = () => Array.from({ length: n }, (_, i) => hasMaps
    ? `<div class="rrow2"><span class="lbl">${esc(t("rep_map", i + 1))}</span><select class="inp" id="rm${i}"><option value="">${esc(t("rep_skip"))}</option>${MAPS[sc.game].map(m => `<option${sc.maps && sc.maps[i] === m ? " selected" : ""}>${esc(m)}</option>`).join("")}</select><span class="score"><input class="inp" type="number" inputmode="numeric" min="0" max="40" id="ra${i}" aria-label="${esc(t("rep_we"))}">:<input class="inp" type="number" inputmode="numeric" min="0" max="40" id="rb${i}" aria-label="${esc(t("rep_they"))}"></span></div>`
    : `<div class="rrow2"><span class="lbl">${esc(t("rep_game", i + 1))}</span><div class="seg">${["us", "them", "skip"].map(w => `<button type="button" data-rw="${i}" data-v="${w}" aria-pressed="${(D.win[i] || (i < 1 ? "" : "skip")) === w}">${esc(w === "us" ? t("rep_we") : w === "them" ? t("rep_they") : t("rep_skip"))}</button>`).join("")}</div></div>`).join("");
  const build = () => `<p class="hint" style="margin:0">${esc(t("sc_vs"))} ${esc(opp.name)} · ${esc(whenLabel(sc.at))} · ${esc(fmtLabel(sc.game, sc.format))}</p><div class="field"><span class="lbl">${esc(t("rep_beh"))}</span><div class="seg">${["ok", "late", "ns"].map(b => `<button type="button" data-rb="${b}" aria-pressed="${D.beh === b}">${esc(t("beh")[b])}</button>`).join("")}</div></div>${D.beh === "ns" ? "" : `<div style="display:grid;gap:8px">${rows()}</div>`}<p class="hint">${esc(t("lv_rep_note"))}</p>`;
  openSheet(t("rep_t"), build(), `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="repGo">${esc(t("rep_send"))}</button>`, ov => {
    ov.addEventListener("click", e => {
      const b = e.target.closest("[data-rb]"), w = e.target.closest("[data-rw]");
      if (b) { D.beh = b.dataset.rb; $("#sheetBody").innerHTML = build(); return; }
      if (w) { D.win[+w.dataset.rw] = w.dataset.v; $$(`[data-rw="${w.dataset.rw}"]`).forEach(x => x.setAttribute("aria-pressed", String(x === w))); return; }
      if (!e.target.closest("#repGo")) return;
      const games = [];
      if (D.beh !== "ns") {
        for (let i = 0; i < n; i++) {
          if (hasMaps) { const a = parseInt($("#ra" + i).value, 10), bb = parseInt($("#rb" + i).value, 10); if (isNaN(a) || isNaN(bb) || a === bb) continue; games.push({ map: $("#rm" + i).value, a, b: bb }); }
          else { const v = D.win[i]; if (v === "us") games.push({ a: 1, b: 0 }); else if (v === "them") games.push({ a: 0, b: 1 }); }
        }
        if (!games.length) { toast(t("rep_need")); return; }
      }
      teamAct("/scrims/" + id + "/report", { beh: D.beh, games }, t("lv_rep_sent"));
    });
  });
}
function confirmScrimSheet(id) {
  const sc = S.scrims.find(x => x.id === id); if (!sc || sc.status !== "toconfirm") return;
  const rep = sc.raw.rep, opp = findTeam(sc.opp); let beh = "ok";
  const build = () => `<p class="hint" style="margin:0">${esc(t("sc_vs"))} ${esc(opp.name)} · ${esc(whenLabel(sc.at))}</p><p class="lv-lead">${esc(rep.beh === "ns" ? t("lv_cf_ns") : t("lv_cf_score", rep.losses, rep.wins))}</p>${rep.beh === "ns" ? "" : `<div class="field"><span class="lbl">${esc(t("lv_cf_beh"))}</span><div class="seg">${["ok", "late"].map(b => `<button type="button" data-cb="${b}" aria-pressed="${beh === b}">${esc(t("beh")[b])}</button>`).join("")}</div></div>`}<p class="hint">${esc(t("lv_rep_note"))}</p>`;
  openSheet(t("lv_cf_t"), build(), `<button class="btn ghost danger" id="cfNo">${esc(t("lv_cf_no"))}</button><button class="btn primary" id="cfOk">${esc(t("lv_cf_ok"))}</button>`, ov => {
    ov.addEventListener("click", e => {
      const b = e.target.closest("[data-cb]");
      if (b) { beh = b.dataset.cb; $("#sheetBody").innerHTML = build(); return; }
      if (e.target.closest("#cfOk")) teamAct("/scrims/" + id + "/confirm", { ok: true, beh }, t("lv_cf_done"));
      if (e.target.closest("#cfNo")) teamAct("/scrims/" + id + "/confirm", { ok: false }, t("lv_cf_disputed"));
    });
  });
}
function teamClick(a) {
  const act = a.dataset.action, id = a.dataset.id;
  if (act === "team-disband") { askThen(t("lv_disband_q"), () => teamAct("/teams/" + id, {}, t("team_disbanded"), "DELETE")); return true; }
  if (act === "team-leave") { askThen(t("lv_leave_q"), () => teamAct("/teams/" + id + "/leave", {}, t("left"))); return true; }
  if (act === "app-acc" || act === "app-dec") { const tm = findTeam(a.dataset.team), ap = tm && tm.apps[+a.dataset.i]; if (ap) teamAct("/teams/" + tm.id + "/apps", { uid: ap.uid, accept: act === "app-acc" }, act === "app-acc" ? t("team_accept_toast", ap.nick) : ""); return true; }
  if (act === "sc-accept" || act === "sc-decline") { teamAct("/scrims/" + id + "/answer", { accept: act === "sc-accept" }, act === "sc-accept" ? t("sst").confirmed : ""); return true; }
  if (act === "sc-cancel") { teamAct("/scrims/" + id + "/cancel", {}, t("sc_cancelled")); return true; }
  if (act === "sc-confirm") { confirmScrimSheet(id); return true; }
  return false;
}
function teamRoleChange(el) {
  const tm = findTeam(el.dataset.team), m = tm && tm.members[+el.dataset.trole]; if (!m) return;
  if (el.value === "__kick") teamAct("/teams/" + tm.id + "/kick", { uid: m.uid }, ""); else teamAct("/teams/" + tm.id + "/role", { uid: m.uid, trole: el.value }, t("role_changed"));
}
function miniRank(r) { return r ? miniRank__base(r) : ""; }
