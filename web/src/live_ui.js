/* ---------- interface: compact rows that open on demand ---------- */
Object.assign(T.ru, { lv_more: "Профиль", lv_all_games: "Все" });
Object.assign(T.en, { lv_more: "Profile", lv_all_games: "All" });
const CHEV = '<svg class="i lv-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

function card(p) {
  const G = GAMES[p.game], open = LV.open === p.id, id = esc(p.id), match = !p.mine && !!ME && isMatch(p), fav = !p.mine && S.favs.includes(p.uid);
  const size = partySize(p), have = Math.min(p.have || 1, size - 1);
  const marks = (p.ver ? `<span class="ver" title="${esc(t("lv_verified"))}">${ICON.shield}</span>` : "") + (fav ? `<span class="lv-fav" title="${esc(t("fav_on"))}">${ICON.star}</span>` : "") + (match ? `<span class="lv-match" title="${esc(t("match_tag"))}">${ICON.target}</span>` : "");
  const head = `<button class="lv-rh" data-action="lv-open" data-id="${id}" aria-expanded="${open}">${avatar(p.nick, p.on && !p.mine)}<span class="lv-rw"><span class="lv-rn"><b>${esc(p.nick)}</b>${marks}${p.mine ? `<span class="mine-tag">${esc(t("your_post"))}</span>` : ""}</span><span class="lv-rm"><span class="gtag"><i></i>${esc(gshort(p.game))}</span><span>${esc(modeName(p.game, p.mode))}</span><span class="lv-need">${esc(t("need_short", size - have))}</span><span class="lv-roles">${esc(p.roles.map(r => roleName(p.game, r)).join(", "))}</span></span></span>${badge(p.r)}${CHEV}</button>`;
  let body = "";
  if (open) {
    const tags = `${p.style ? `<span class="sty">${esc(t("styles")[p.style])}</span>` : ""}${(p.stags || []).map(x => `<span class="safe">${esc(t("stags")[x])}</span>`).join("")}<span>${ICON.globe}${esc(regionName(p.region))} · ${esc(p.langs.map(x => x.toUpperCase()).join("/"))}</span><span>${p.mic ? ICON.mic + esc(t("mic")) : ICON.nomic + esc(t("no_mic"))}</span>${(p.when || []).map(w => `<span>${ICON.clock}${esc(t("times")[w])}</span>`).join("")}<span>${esc(rel(p.t0))}</span>`;
    const acts = p.mine
      ? `<div class="lv-ra">${expHtml(p)}<span class="sp"></span><button class="btn small" data-action="renew" data-id="${id}">${ICON.refresh}${esc(t("renew", durLabel(p.dur)))}</button><button class="iconbtn" data-action="del-post" data-id="${id}" aria-label="${esc(t("del"))}" title="${esc(t("del"))}">${ICON.trash}</button></div>`
      : `<div class="lv-ra"><button class="btn primary small" data-action="open-chat" data-id="${id}">${ICON.chat}${esc(t("write"))}</button><button class="btn small${S.stacks[p.game].includes(p.uid) ? " on" : ""}" data-action="toggle-stack" data-id="${id}">${S.stacks[p.game].includes(p.uid) ? ICON.check + esc(t("in_stack")) : ICON.plus + esc(t("lv_stack_add"))}</button><button class="iconbtn${fav ? " on" : ""}" data-action="fav" data-id="${id}" aria-pressed="${fav}" aria-label="${esc(fav ? t("fav_on") : t("fav_add"))}" title="${esc(fav ? t("fav_on") : t("fav_add"))}">${ICON.star}</button><span class="sp"></span><button class="btn ghost small" data-action="player" data-id="${id}">${esc(t("lv_more"))}</button></div>`;
    body = `<div class="lv-rb">${noteOf(p) ? `<p class="note">${esc(noteOf(p))}</p>` : ""}<div class="tags">${tags}</div>${hasC(p) ? `<div class="lv-rc">${contactsInner(p)}</div>` : ""}${acts}</div>`;
  }
  return `<article class="card lv-row${p.mine ? " mine" : ""}${open ? " open" : ""}" data-id="${id}" style="--g:var(${G.color})">${head}${body}</article>`;
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
