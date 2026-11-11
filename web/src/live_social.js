/* ---------- sign-in through Telegram / VK, linked accounts, verified ranks ---------- */
Object.assign(T.ru, { lv_or: "или войти через", lv_tg_t: "Вход через Telegram", lv_tg_link_t: "Уведомления в Telegram", lv_tg_1: "Откройте нашего бота и нажмите «Запустить» (Start).", lv_tg_2: "Вернитесь сюда — страница обновится сама.", lv_tg_open: "Открыть Telegram", lv_tg_waiting: "Ждём подтверждения в Telegram…",
  lv_soc_t: "Последний шаг", lv_soc_lead: "Придумайте ник — его увидят другие игроки.", lv_links: "Привязки", lv_links_t: "Привязки и уведомления", lv_tg_row: "Telegram", lv_tg_row_d: "Сообщения, приглашения и заявки будут приходить в Telegram.", lv_tg_connect: "Подключить", lv_tg_on: "включены", lv_tg_off: "выключены",
  lv_turn_on: "Включить", lv_turn_off: "Выключить", lv_unlink: "Отвязать", lv_refresh: "Обновить", lv_steam_d: "Подтверждает медаль Dota 2 и ELO на FACEIT. Вводить ранг руками не придётся.", lv_steam_link: "Привязать Steam", lv_steam_ok: "Steam привязан, медаль Dota 2 подтверждена", lv_steam_norank: "Steam привязан, но ранг скрыт: включите в Dota 2 «Общедоступную историю матчей» и нажмите «Обновить».",
  lv_fc_d: "ELO подтверждено через ваш Steam и обновляется кнопкой «Обновить».", lv_fc_need: "Привяжите Steam — ELO на FACEIT подтянется само, по вашему Steam-аккаунту.", lv_fc_none: "У этого Steam нет аккаунта FACEIT с CS2.", lv_fc_ph: "Ник на FACEIT", lv_fc_link: "Привязать", lv_fc_ok: n => "FACEIT · " + n, lv_fc_soon: "Привязка FACEIT скоро появится.", lv_linked: "Готово, привязано", lv_updated: "Данные обновлены",
  lv_via: { tg: "вход через Telegram", vk: "вход через VK" }, lv_del_acc_nick: "Аккаунт, профиль и объявления будут удалены без возможности восстановления. Для подтверждения введите свой ник.", lv_verified: "ранг подтверждён" });
Object.assign(T.en, { lv_or: "or sign in with", lv_tg_t: "Sign in with Telegram", lv_tg_link_t: "Telegram notifications", lv_tg_1: "Open our bot and press Start.", lv_tg_2: "Come back here — the page updates by itself.", lv_tg_open: "Open Telegram", lv_tg_waiting: "Waiting for confirmation in Telegram…",
  lv_soc_t: "One last step", lv_soc_lead: "Pick a nickname — other players will see it.", lv_links: "Links", lv_links_t: "Linked accounts and notifications", lv_tg_row: "Telegram", lv_tg_row_d: "Messages, invites and applications will arrive in Telegram.", lv_tg_connect: "Connect", lv_tg_on: "on", lv_tg_off: "off",
  lv_turn_on: "Turn on", lv_turn_off: "Turn off", lv_unlink: "Unlink", lv_refresh: "Refresh", lv_steam_d: "Verifies your Dota 2 medal through Steam. No manual rank entry.", lv_steam_link: "Link Steam", lv_steam_ok: "Steam linked, Dota 2 medal verified", lv_steam_norank: "Steam is linked, but the rank is hidden: enable “Expose Public Match Data” in Dota 2 and press Refresh.",
  lv_fc_d: "ELO verified through your Steam; press Refresh to update.", lv_fc_need: "Link Steam — your FACEIT ELO is fetched automatically from your Steam account.", lv_fc_none: "This Steam has no FACEIT account with CS2.", lv_fc_ph: "FACEIT nickname", lv_fc_link: "Link", lv_fc_ok: n => "FACEIT · " + n, lv_fc_soon: "FACEIT linking is coming soon.", lv_linked: "Done, linked", lv_updated: "Data updated",
  lv_via: { tg: "signed in with Telegram", vk: "signed in with VK" }, lv_del_acc_nick: "Your account, profile and listings will be deleted for good. Type your nickname to confirm.", lv_verified: "rank verified" });
Object.assign(T.ru.lv_err, { tg_off: "Вход через Telegram сейчас недоступен.", tg_taken: "Этот Telegram уже привязан к другому аккаунту.", vk_off: "Вход через VK пока не подключён.", vk_fail: "Не получилось войти через VK. Попробуйте ещё раз.", link_fail: "Не получилось привязать аккаунт. Попробуйте ещё раз.",
  link_taken: "Этот аккаунт уже привязан к другому игроку Stuckup.", link_off: "Эта привязка пока не подключена.", faceit_none: "Игрок с таким ником на FACEIT не найден.", faceit_nocs2: "У этого аккаунта FACEIT нет CS2.", last_login: "Это ваш единственный способ входа — отвязать нельзя." });
Object.assign(T.en.lv_err, { tg_off: "Telegram sign-in is not available right now.", tg_taken: "This Telegram is already linked to another account.", vk_off: "VK sign-in is not connected yet.", vk_fail: "Could not sign in with VK. Please try again.", link_fail: "Could not link the account. Please try again.",
  link_taken: "This account is already linked to another Stuckup player.", link_off: "This link is not available yet.", faceit_none: "No FACEIT player with this nickname.", faceit_nocs2: "This FACEIT account has no CS2.", last_login: "This is your only way to sign in — it cannot be unlinked." });

function socialButtons() {
  const c = LV.cfg || {}; if (!c.tg && !c.vk) return "";
  return `<div class="lv-soc"><span>${esc(t("lv_or"))}</span><div>${c.tg ? `<button type="button" class="btn" data-au="tg">${ICON.send}Telegram</button>` : ""}${c.vk ? `<a class="btn" href="/api/auth/vk/start">VK ID</a>` : ""}</div></div>`;
}
async function tgFlow(link) {
  const r = await api("POST", link ? "/me/tg/link" : "/auth/tg/start", {});
  if (!r.ok) { toast(errText(r)); return; }
  const after = AU && AU.after;
  openSheet(t(link ? "lv_tg_link_t" : "lv_tg_t"), `<ol class="lv-steps"><li>${esc(t("lv_tg_1"))}</li><li>${esc(t("lv_tg_2"))}</li></ol><a class="btn primary lv-wide" id="tgOpen" href="${esc(r.url)}" target="_blank" rel="noopener">${ICON.send}${esc(t("lv_tg_open"))}</a><p class="hint" id="tgWait">${esc(t("lv_tg_waiting"))}</p>`, "");
  const token = r.token, t0 = Date.now();
  const timer = setInterval(async () => {
    if (!$("#tgWait") || Date.now() - t0 > 600000) { clearInterval(timer); return; }
    if (document.hidden) return;
    const x = await api("POST", "/auth/tg/poll", { token });
    if (x.ok && x.wait) return;
    clearInterval(timer);
    if (!$("#tgWait")) return;
    if (!x.ok) { closeModal(); toast(errText(x)); return; }
    if (x.linked) { if (x.user) adoptUser(x.user); closeModal(); if (S.view === "profile") renderProfile(); toast(t("lv_linked")); return; }
    if (x.signup) { socialSheet(x.signup, x.suggest, after); return; }
    AU = { after }; await signedIn(x);
  }, 2000);
}
function socialSheet(token, suggest, after) {
  const c = t("lv_consent");
  miniSheet(t("lv_soc_t"), `<p class="lv-lead">${esc(t("lv_soc_lead"))}</p><div class="field"><label class="lbl" for="ms-nick">${esc(t("nick"))}</label><input class="inp" id="ms-nick" autocapitalize="off" spellcheck="false" maxlength="20" value="${esc(suggest && suggest.length >= 3 ? suggest : "")}"><p class="hint">${esc(t("lv_nick_hint"))}</p></div>
<label class="check lv-consent"><input type="checkbox" id="ms-consent"> <span>${esc(c[0])}<a href="/rules" target="_blank" rel="noopener">${esc(c[1])}</a>${esc(c[2])}<a href="/privacy" target="_blank" rel="noopener">${esc(c[3])}</a>${esc(c[4])}</span></label>`, t("lv_b_reg"), false, async ov => {
    const nick = ov.querySelector("#ms-nick").value.trim(), E = t("lv_err");
    if (!/^[A-Za-zА-Яа-яЁё0-9_.-]{3,20}$/.test(nick)) return E.bad_nick;
    if (!ov.querySelector("#ms-consent").checked) return E.need_consent;
    const r = await api("POST", "/auth/social/finish", { token, nick, consent: true, lang: S.lang });
    if (!r.ok) return errText(r);
    AU = { after }; await signedIn(r); return "";
  });
}
function linksPanel() {
  const c = LV.cfg || {}, v = ME.ver || {};
  const row = (logo, title, desc, acts, on) => `<div class="acc${on ? " on" : ""}"><span class="logo">${logo}</span><span class="txt"><b>${esc(title)}</b><span>${esc(desc)}</span></span>${acts}</div>`;
  let h = "";
  if (c.tg) h += ME.tg
    ? row("TG", t("lv_tg_row") + " · " + ME.tg.name, t("lv_tg_row_d") + " " + (S.lang === "ru" ? "Сейчас " : "Now ") + t(ME.tg.on ? "lv_tg_on" : "lv_tg_off") + ".", `<button class="btn small" data-lk="tg-toggle">${esc(t(ME.tg.on ? "lv_turn_off" : "lv_turn_on"))}</button>${ME.email || ME.vk ? `<button class="btn ghost small" data-lk="tg-unlink">${esc(t("lv_unlink"))}</button>` : ""}`, ME.tg.on)
    : row("TG", t("lv_tg_row"), t("lv_tg_row_d"), `<button class="btn small primary" data-lk="tg-link">${ICON.send}${esc(t("lv_tg_connect"))}</button>`);
  h += ME.steam
    ? row("ST", "Steam", v.medal ? t("lv_steam_ok") : t("lv_steam_norank"), `<button class="btn small" data-lk="refresh">${ICON.refresh}${esc(t("lv_refresh"))}</button><button class="btn ghost small" data-lk="steam-unlink">${esc(t("lv_unlink"))}</button>`, !!v.medal)
    : row("ST", "Steam", t("lv_steam_d"), `<a class="btn small" href="/api/link/steam/start">${ICON.link}${esc(t("lv_steam_link"))}</a>`);
  if (c.faceit || ME.faceit) h += ME.faceit ? row("FC", t("lv_fc_ok", ME.faceit), t("lv_fc_d"), "", true) : row("FC", "FACEIT · CS2", t(ME.steam ? "lv_fc_none" : "lv_fc_need"), "");
  return `<div class="panel" id="ps-link"><h2 class="sec">${esc(t("lv_links_t"))}</h2><div class="accs">${h}</div></div>`;
}
async function linkAct(k) {
  let r;
  if (k === "tg-link") { tgFlow(true); return; }
  if (k === "tg-toggle") r = await api("POST", "/me/tg", { on: !ME.tg.on });
  else if (k === "tg-unlink") r = await api("POST", "/me/tg", { unlink: true });
  else if (k === "refresh") r = await api("POST", "/link/refresh", {});
  else if (k === "steam-unlink" || k === "faceit-unlink") r = await api("DELETE", "/link/" + k.split("-")[0], {});
  if (!r) return;
  if (!r.ok) { toast(errText(r)); return; }
  adoptUser(r.user); renderProfile(); if (k === "refresh") toast(t("lv_updated"));
}
async function faceitLink(nick) {
  if (!nick) return;
  const r = await api("POST", "/link/faceit", { nick });
  if (!r.ok) { toast(errText(r)); return; }
  adoptUser(r.user); renderProfile(); toast(t("lv_linked"));
}
async function socialRoute(kind, arg) {
  if (kind === "signup") { socialSheet(arg, ""); return; }
  if (kind === "err") { toast(errText({ error: arg })); return; }
  const me = await api("GET", "/me");
  if (me.ok && me.user) { adoptUser(me.user); setView("profile"); renderAll(); const el = $("#ps-link"); if (el) el.scrollIntoView({ block: "start" }); toast(t(arg === "steam_norank" ? "lv_steam_norank" : "lv_linked")); }
}
