/* ---------- interface: compact rows that open on demand ---------- */
Object.assign(T.ru, { lv_more: "Профиль", lv_all_games: "Все" });
Object.assign(T.en, { lv_more: "Profile", lv_all_games: "All" });
const CHEV = '<svg class="i lv-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

function card(p) {
  const G = GAMES[p.game], open = LV.open === p.id, id = esc(p.id), match = !p.mine && !!ME && isMatch(p), fav = !p.mine && S.favs.includes(p.uid);
  const size = partySize(p), have = Math.min(p.have || 1, size - 1);
  const marks = (p.ver ? `<span class="ver" title="${esc(t("lv_verified"))}">${ICON.shield}</span>` : "") + (fav ? `<span class="lv-fav" title="${esc(t("fav_on"))}">${ICON.star}</span>` : "") + (match ? `<span class="lv-match" title="${esc(t("match_tag"))}">${ICON.target}</span>` : "");
  const head = `<button class="lv-rh" data-action="lv-open" data-id="${id}" aria-expanded="${open}">${avatar(p.nick, p.on && !p.mine)}<span class="lv-rw"><span class="lv-rn"><b>${esc(p.nick)}</b>${marks}${p.mine ? `<span class="mine-tag">${esc(t("your_post"))}</span>` : ""}${p.old ? `<span class="lv-oldtag">${esc(t("lv_old_ago", rel(p.ended)))}</span>` : ""}</span><span class="lv-rm"><span class="gtag"><i></i>${esc(gshort(p.game))}</span><span>${esc(modeName(p.game, p.mode))}</span><span class="lv-need">${esc(t("need_short", size - have))}</span><span class="lv-roles">${esc(p.roles.map(r => roleName(p.game, r)).join(", "))}</span></span></span>${badge(p.r)}${CHEV}</button>`;
  let body = "";
  if (open) {
    const tags = `${p.style ? `<span class="sty">${esc(t("styles")[p.style])}</span>` : ""}${(p.stags || []).map(x => `<span class="safe">${esc(t("stags")[x])}</span>`).join("")}<span>${ICON.globe}${esc(regionName(p.region))} · ${esc(p.langs.map(x => x.toUpperCase()).join("/"))}</span><span>${p.mic ? ICON.mic + esc(t("mic")) : ICON.nomic + esc(t("no_mic"))}</span>${(p.when || []).map(w => `<span>${ICON.clock}${esc(t("times")[w])}</span>`).join("")}<span>${esc(rel(p.t0))}</span>`;
    const acts = p.mine
      ? `<div class="lv-ra">${expHtml(p)}<span class="sp"></span><button class="btn small" data-action="renew" data-id="${id}">${ICON.refresh}${esc(t("renew", durLabel(p.dur)))}</button><button class="iconbtn" data-action="del-post" data-id="${id}" aria-label="${esc(t("del"))}" title="${esc(t("del"))}">${ICON.trash}</button></div>`
      : `<div class="lv-ra"><button class="btn primary small" data-action="open-chat" data-id="${id}">${ICON.chat}${esc(t("write"))}</button><button class="btn small${S.stacks[p.game].includes(p.uid) ? " on" : ""}" data-action="toggle-stack" data-id="${id}">${S.stacks[p.game].includes(p.uid) ? ICON.check + esc(t("in_stack")) : ICON.plus + esc(t("lv_stack_add"))}</button><button class="iconbtn${fav ? " on" : ""}" data-action="fav" data-id="${id}" aria-pressed="${fav}" aria-label="${esc(fav ? t("fav_on") : t("fav_add"))}" title="${esc(fav ? t("fav_on") : t("fav_add"))}">${ICON.star}</button><span class="sp"></span><button class="btn ghost small" data-action="player" data-id="${id}">${esc(t("lv_more"))}</button></div>`;
    body = `<div class="lv-rb">${noteOf(p) ? `<p class="note">${esc(noteOf(p))}</p>` : ""}<div class="tags">${tags}</div>${hasC(p) ? `<div class="lv-rc">${contactsInner(p)}</div>` : ""}${acts}</div>`;
  }
  return `<article class="card lv-row${p.mine ? " mine" : ""}${p.old ? " lv-old" : ""}${open ? " open" : ""}" data-id="${id}" style="--g:var(${G.color})">${head}${body}</article>`;
}
function toggleRow(id) {
  const prev = LV.open; LV.open = prev === id ? null : id;
  [prev, id].forEach(x => { if (!x) return; const p = findPost(x); $$('.lv-row[data-id="' + x + '"]').forEach(el => { if (p) el.outerHTML = card(p); }); });
}
function renderRail() {
  const act = activePosts(), teams = S.view === "teams", all = teams ? allTeams() : null;
  const pill = (k, name, color) => {
    const n = teams ? (k === "all" ? all.length : all.filter(x => x.game === k).length) : (k === "all" ? act.length : act.filter(p => p.game === k).length);
    return `<button class="gt lv-gt${n ? "" : " none"}" data-game="${k}" aria-pressed="${S.game === k}" style="--g:var(${color})" title="${esc(teams ? t("teams_n", n) : t("lv_looking", n))}"><span class="gt-name">${esc(name)}</span>${n ? `<b class="lv-gn">${n}</b>` : ""}</button>`;
  };
  $("#rail").innerHTML = pill("all", t("lv_all_games"), "--accent") + railOrder().map(k => pill(k, gshort(k), GAMES[k].color)).join("");
}
function renderAll() { renderAll__base(); uiState(); }
function uiState() { document.body.classList.toggle("lv-nochat", !ME || (!Object.keys(S.chats || {}).length && S.view !== "chats")); }
// profile sections fold: only the essentials are open by default
function profileFold() {
  LV.fold = LV.fold || { "ps-main": true, "ps-games": true, "ps-posts": true };
  $$("#page .pgrid > .panel").forEach(el => {
    const h = el.querySelector("h2.sec"); if (!h || !el.id) return;
    const open = !!LV.fold[el.id];
    el.classList.add("lv-fold"); el.classList.toggle("shut", !open);
    h.insertAdjacentHTML("beforeend", CHEV); h.dataset.action = "lv-fold"; h.dataset.p = el.id; h.setAttribute("role", "button"); h.tabIndex = 0; h.setAttribute("aria-expanded", String(open));
  });
}
function foldPanel(id) { LV.fold[id] = !LV.fold[id]; const el = document.getElementById(id); if (el) { el.classList.toggle("shut", !LV.fold[id]); const h = el.querySelector("h2.sec"); if (h) h.setAttribute("aria-expanded", String(!!LV.fold[id])); } }

/* ---------- e-mail notifications and game subscriptions ---------- */
Object.assign(T.ru, { lv_mail_t: "Письма на почту", lv_mail_msg: "Новые сообщения", lv_mail_msg_d: "Если вы не на сайте — не чаще раза в 30 минут на один чат.", lv_mail_inv: "Приглашения и заявки", lv_mail_inv_d: "Стак, команды, праки, комментарии.",
  lv_subs_t: "Новые объявления", lv_subs_d: "Пришлём письмо, когда в игре кто-то ищет тиммейтов. Не чаще раза в 3 часа на игру.", lv_subs_none: "Вы ни на что не подписаны. Подписаться можно в ленте: выберите игру и нажмите «Сообщать о новых».",
  lv_follow: "Сообщать о новых", lv_following: "Вы подписаны", lv_follow_match: "только моего уровня", lv_follow_on: g => "Пришлём письмо, когда в " + g + " кто-то будет искать тиммейтов", lv_follow_off: "Подписка отключена",
  lv_unsub_done: "Готово, такие письма больше не придут", lv_no_email: "Письма приходят только на почту. Вы вошли через VK — почты в аккаунте нет." });
Object.assign(T.en, { lv_mail_t: "Email notifications", lv_mail_msg: "New messages", lv_mail_msg_d: "When you are not on the site — at most once per 30 minutes per chat.", lv_mail_inv: "Invites and applications", lv_mail_inv_d: "Stacks, teams, scrims, comments.",
  lv_subs_t: "New listings", lv_subs_d: "We email you when someone is looking for teammates in a game. At most once per 3 hours per game.", lv_subs_none: "No subscriptions. Pick a game in the feed and press “Notify me”.",
  lv_follow: "Notify me", lv_following: "Subscribed", lv_follow_match: "my level only", lv_follow_on: g => "We will email you when someone looks for teammates in " + g, lv_follow_off: "Subscription off",
  lv_unsub_done: "Done, you will not get these emails anymore", lv_no_email: "Notifications go to email. You signed in with VK, so there is no email in your account." });
Object.assign(T.ru.lv_err, { need_email: "Для подписки нужна почта в аккаунте." });
Object.assign(T.en.lv_err, { need_email: "Subscriptions need an email in your account." });

function mailPanel() {
  if (!ME.email) return `<div class="panel" id="ps-mail"><h2 class="sec">${esc(t("lv_mail_t"))}</h2><p class="hint">${esc(t("lv_no_email"))}</p></div>`;
  const mp = ME.mailp || { msg: true, inv: true };
  const sw = (k, title, desc) => `<label class="lv-sw"><span class="txt"><b>${esc(title)}</b><span>${esc(desc)}</span></span><input type="checkbox" data-mailp="${k}"${mp[k] ? " checked" : ""}><i aria-hidden="true"></i></label>`;
  const subs = Object.keys(ME.subs || {}).filter(g => GAMES[g]);
  const rows = subs.map(g => `<div class="lv-subrow" style="--g:var(${GAMES[g].color})"><span class="gtag"><i></i>${esc(gshort(g))}</span><span class="hint">${ME.subs[g].match ? esc(t("lv_follow_match")) : ""}</span><span class="sp"></span><button class="btn ghost small" data-action="lv-unfollow" data-g="${g}">${esc(S.lang === "ru" ? "Отписаться" : "Unsubscribe")}</button></div>`).join("");
  return `<div class="panel" id="ps-mail"><h2 class="sec">${esc(t("lv_mail_t"))}</h2><div class="lv-sws">${sw("msg", t("lv_mail_msg"), t("lv_mail_msg_d"))}${sw("inv", t("lv_mail_inv"), t("lv_mail_inv_d"))}</div>
<div class="field" style="gap:6px"><span class="lbl">${esc(t("lv_subs_t"))}</span><p class="hint" style="margin:0">${esc(t("lv_subs_d"))}</p>${rows || `<p class="hint">${esc(t("lv_subs_none"))}</p>`}</div></div>`;
}
async function setMailPref(k, on) {
  const r = await api("POST", "/me/mail", { [k]: on });
  if (!r.ok) { toast(errText(r)); renderProfile(); return; }
  adoptUser(r.user);
}
async function follow(g, on, match) {
  if (!ME) { authSheet("login"); return; }
  if (!ME.email) { toast(t("lv_no_email")); return; }
  const r = await api("POST", "/subs", { game: g, on, match: !!match });
  if (!r.ok) { toast(errText(r)); return; }
  adoptUser(r.user); followBtn(); if (S.view === "profile") renderProfile();
  toast(on ? t("lv_follow_on", gname(g)) : t("lv_follow_off"));
}
function followSheet(g) {
  if ((ME.subs || {})[g]) { follow(g, false); return; }
  openSheet(t("lv_follow") + " · " + gshort(g), `<p class="lv-lead">${esc(t("lv_subs_d"))}</p><label class="check"><input type="checkbox" id="flMatch" checked> ${esc(S.lang === "ru" ? "Только игроки моего уровня" : "Only players of my level")}</label>`,
    `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="flGo">${esc(t("lv_follow"))}</button>`, ov => {
      ov.querySelector("#flGo").addEventListener("click", () => { const m = ov.querySelector("#flMatch").checked; closeModal(); follow(g, true, m); });
    });
}
function followBtn() {
  const head = $(".feedhead"); if (!head) return;
  const old = head.querySelector(".lv-follow"); if (old) old.remove();
  if (S.view !== "feed" || S.game === "all") return;
  const on = !!(ME && (ME.subs || {})[S.game]);
  head.insertAdjacentHTML("beforeend", `<button class="btn ghost small lv-follow${on ? " on" : ""}" data-action="lv-follow" data-g="${S.game}">${on ? ICON.check + esc(t("lv_following")) : ICON.bell + esc(t("lv_follow"))}</button>`);
}
Object.assign(T.ru, { lv_recent_t: "Недавно искали", lv_recent_d: "Эти объявления уже сняты по сроку, но игроки могли ещё не найти команду — напишите им.", lv_old_ago: w => "искал(а) " + w });
Object.assign(T.en, { lv_recent_t: "Recently looking", lv_recent_d: "These listings have expired, but the players may still be looking — message them.", lv_old_ago: w => "looked " + w });
function findPost(id) { return findPost__base(id) || (LV.recent || []).find(p => p.id === id) || null; }
// while the feed of a game is short, show who was looking during the last day
function renderRecent() {
  const list = $("#list"); if (!list || !LV.ready) return;
  const act = activePosts().filter(p => S.game === "all" || p.game === S.game);
  if (act.length >= 6) return;
  const rec = (LV.recent || []).filter(p => (S.game === "all" || p.game === S.game) && !S.blocked.includes(p.uid) && !act.some(a => a.uid === p.uid && a.game === p.game)).slice(0, 12);
  if (!rec.length) return;
  list.insertAdjacentHTML("beforeend", `<section class="lv-recent"><div class="lv-recent-h"><h3>${esc(t("lv_recent_t"))}</h3><p class="hint">${esc(t("lv_recent_d"))}</p></div><div class="list">${rec.map(card).join("")}</div></section>`);
}
function renderFeed() { renderFeedCore(); renderRecent(); followBtn(); }
document.addEventListener("change", e => { const el = e.target.closest && e.target.closest("[data-mailp]"); if (el) setMailPref(el.dataset.mailp, el.checked); });
document.addEventListener("click", e => { const a = e.target.closest("[data-action]"); if (!a) return;
  if (a.dataset.action === "lv-follow") { e.stopPropagation(); if (!ME) authSheet("login"); else followSheet(a.dataset.g); }
  if (a.dataset.action === "lv-unfollow") { e.stopPropagation(); follow(a.dataset.g, false); } }, true);
