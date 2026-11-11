// Live layer: turns the shared app code (app.js) into the server-backed site.
// build.py inserts @@head right after "use strict", @@main before the boot section and uses @@boot as the boot section.
// A function declared in @@main replaces the function of the same name in app.js; the original stays callable as name__base.

//@@head
const LKEY = "stuckup-v1";
let ME = null;                       // signed-in account { id, email, nick } or null
const LV = { ready: false, loadErr: false, skew: 0, mail: "smtp", syncT: null, synced: "", feedAt: 0, sig: "", busy: false, favList: [], blockList: [] };
let AU = null;                       // state of the sign-in sheet

//@@main
/* ---------- strings ---------- */
Object.assign(T.ru, {
  demo_tag: "бета", demo_line: "", about_title: "Stuckup — поиск тиммейтов",
  about_text: "Stuckup — поиск тиммейтов своего ранга в Dota 2, CS2 (Premier и FACEIT), Valorant, League of Legends, Deadlock, Marvel Rivals, Apex Legends, PUBG, Fortnite, Standoff 2 и PUBG Mobile. Разместите объявление — и игроки напишут вам в Discord или Telegram.",
  exp_rules: ["Срок выбирается при публикации: от 1 часа до 3 дней. Потом объявление само исчезает из ленты.", "Продлить объявление можно в один клик — в ленте или в профиле.", "В каждой игре у вас одно активное объявление: новое заменяет старое."],
  replaced: "Прошлое объявление в этой игре заменено", expired_toast: "Срок объявления истёк",
  favs_empty: "Отмечайте звёздочкой тех, с кем хорошо сыграли, — их объявления будут первыми в ленте.",
  blocked_toast: n => n + " в чёрном списке: его объявления скрыты", reported: "Жалоба отправлена модераторам.",
  c_from_profile: "Контакты берутся из профиля и видны только вошедшим игрокам.", cvis_note: { all: "", chat: "", stack: "" },
  ob_cta: "Пройдите быстрый старт: 4 вопроса, и мы покажем игроков вашего уровня.",
  share_title: "Ссылка на объявление", share_note: "Отправьте её в Discord или Telegram — по ссылке откроется это объявление.",
  lv_n: { stack: (n, g) => n + " зовёт вас в стак · " + g, comment: n => n + " оставил(а) комментарий о вас", app: (n, tm) => n + " хочет в команду " + tm, app_ok: tm => "Вас приняли в команду " + tm, app_no: tm => "Заявку в " + tm + " отклонили",
    kicked: tm => "Вас убрали из команды " + tm, invite: (n, tm) => n + " зовёт вас в команду " + tm, book: (tm, w) => tm + " хочет сыграть прак · " + w, book_ok: (tm, w) => "Прак с " + tm + " подтверждён · " + w, book_no: tm => tm + " отклонили прак", sc_cancel: tm => "Прак с " + tm + " отменён",
    veto: tm => "Ваш ход в вето · прак с " + tm, result: tm => tm + " внесли результат прака — подтвердите", result_ok: tm => "Результат прака с " + tm + " засчитан", sub: (n, tm) => n + " откликнулся на замену в " + tm, sub_ok: tm => tm + " берут вас на замену", mod_post: () => "Модератор снял ваше объявление за нарушение правил", mod_warn: () => "Модератор вынес вам предупреждение" },
  lv_stack_add: "В стак", lv_stack_hint: "Позовите игроков в стак — им придёт уведомление. Дальше договоритесь в чате.", lv_stack_sent: n => n + " получит приглашение в стак",
  lv_cm: "Комментарии", lv_cm_none: "Комментариев пока нет.", lv_cm_ph: "Как сыграли? Пару слов об игроке", lv_cm_send: "Оставить комментарий", lv_cm_upd: "Сохранить", lv_cm_del: "Удалить", lv_cm_need: "Комментарий можно оставить после переписки в чате: когда вы оба написали друг другу.",
  lv_cm_mine: "ваш комментарий", lv_cm_saved: "Комментарий сохранён", lv_cm_deleted: "Комментарий удалён", lv_cm_about: "Комментарии обо мне", lv_cm_about_note: "Любой комментарий на своей странице можно удалить.",
  lv_rules: "Правила", lv_privacy: "Конфиденциальность", lv_contact_us: "Связаться",
  lv_login: "Войти", lv_signup: "Регистрация", lv_logout: "Выйти", lv_looking: n => n + " в поиске",
  lv_contact: "Связаться", lv_how_contact: "Как связаться", lv_c_login: "Войдите, чтобы увидеть контакты", lv_c_none: "Игрок не оставил контактов.",
  lv_contact_hint: "Напишите игроку в Discord или Telegram и скажите, что вы со Stuckup.",
  lv_guest_cta: "Войдите, чтобы видеть контакты игроков и разместить своё объявление.",
  lv_loading: "Загружаем объявления…", lv_load_err: "Не получилось загрузить объявления.", lv_retry: "Повторить",
  lv_empty_all: "Пока никто не ищет команду. Разместите объявление первым — его увидят все, кто зайдёт.",
  lv_empty_game: g => "В " + g + " пока никто не ищет. Разместите объявление первым.",
  lv_need_contact: "Укажите Discord или Telegram — иначе с вами не смогут связаться.",
  lv_del_q: "Удалить объявление?", lv_gone: "Это объявление уже снято.", lv_in: "Вы вошли", lv_out: "Вы вышли из аккаунта",
  lv_email: "Почта", lv_pass: "Пароль", lv_pass_new: "Новый пароль", lv_pass_hint: "Не меньше 8 символов.",
  lv_nick_hint: "3–20 символов: буквы, цифры, точка, дефис и _. Его увидят другие игроки.",
  lv_consent: ["Мне есть 14 лет, я принимаю ", "правила", " и ", "политику конфиденциальности", "."],
  lv_t_login: "Вход", lv_t_reg: "Регистрация", lv_t_code: "Код из письма", lv_t_reset: "Сброс пароля",
  lv_b_login: "Войти", lv_b_reg: "Создать аккаунт", lv_b_code: "Подтвердить", lv_b_reset: "Отправить код", lv_b_reset2: "Сменить пароль",
  lv_to_reg: "Нет аккаунта? Зарегистрироваться", lv_to_login: "Уже есть аккаунт? Войти", lv_forgot: "Забыли пароль?", lv_back: "Назад",
  lv_code_sent: e => "Мы отправили код на " + e + ". Введите его, чтобы закончить.", lv_code_spam: "Письма нет? Проверьте папку «Спам».",
  lv_code: "Код из 6 цифр", lv_resend: "Отправить ещё раз", lv_resent: "Код отправлен ещё раз",
  lv_dev_code: c => "Почта ещё не подключена, поэтому код показан здесь: " + c,
  lv_reset_hint: "Укажите почту аккаунта — пришлём код для смены пароля.",
  lv_acc: "Аккаунт", lv_nick_change: "Изменить ник", lv_nick_title: "Новый ник", lv_nick_saved: "Ник изменён", lv_nick_limit: "Ник можно менять не чаще 3 раз в сутки.",
  lv_c_note: "Контакты из профиля попадают в ваши объявления. Их видят только вошедшие игроки.",
  lv_del_acc: "Удалить аккаунт", lv_del_acc_t: "Аккаунт, профиль и объявления будут удалены без возможности восстановления. Для подтверждения введите пароль.", lv_del_acc_done: "Аккаунт удалён",
  lv_people: "Игроки", lv_posts: "Объявления", lv_contacts_btn: "Контакты",
  chats_empty: "Здесь будут ваши переписки. Нажмите «Написать» в объявлении игрока.", lv_chat_guest: "Войдите, чтобы писать игрокам.", lv_not_sent: "Сообщение не отправлено.",
  reason: { expired: "срок истёк", replaced: "заменено новым", closed: "снято вами" },
  archive_note: "Последние снятые объявления. Любое можно разместить заново в один клик.",
  lv_err: { network: "Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.", server: "Что-то сломалось на сервере. Попробуйте ещё раз.", auth: "Сначала войдите в аккаунт.",
    too_many: "Слишком много попыток. Попробуйте немного позже.", stack_full: "Стак уже полный.", need_chat: "Комментарий можно оставить после переписки в чате.", empty: "Слишком коротко.", bad_email: "Проверьте адрес почты.", short_password: "Пароль должен быть не короче 8 символов.", long_password: "Пароль слишком длинный.",
    bad_nick: "Ник: 3–20 символов, буквы, цифры, точка, дефис и _.", nick_taken: "Этот ник уже занят.", email_taken: "Эта почта уже зарегистрирована — войдите.", need_consent: "Нужно принять правила.",
    bad_login: "Неверная почта или пароль.", bad_password: "Неверный пароль.", banned: "Аккаунт заблокирован за нарушение правил.", code_expired: "Код устарел. Запросите новый.", code_tries: "Слишком много неверных попыток. Запросите новый код.",
    bad_code: "Неверный код.", mail_failed: "Не получилось отправить письмо. Попробуйте позже.", mail_off: "Сброс пароля заработает, когда подключим почту. Напишите нам в Telegram.",
    need_contact: "Оставьте хотя бы один контакт, пока у вас есть активные объявления.", no_links: "Ссылки в тексте нельзя. Контакты указываются в профиле.", need_rank: "Укажите ранг.",
    bad_dc: "Проверьте имя в Discord.", bad_tg: "Проверьте имя в Telegram.", post_gone: "Это объявление уже снято.", blocked_by: "Игрок ограничил сообщения от вас.", you_blocked: "Этот игрок у вас в чёрном списке.", empty: "Пустое сообщение.", list_full: "Список заполнен.", bad_target: "Так не получится.", forbidden: "Нет доступа." }
});
Object.assign(T.en, {
  demo_tag: "beta", demo_line: "", about_title: "Stuckup — find teammates",
  about_text: "Stuckup helps you find teammates of your rank in Dota 2, CS2 (Premier and FACEIT), Valorant, League of Legends, Deadlock, Marvel Rivals, Apex Legends, PUBG, Fortnite, Standoff 2 and PUBG Mobile. Post a listing and players will message you on Discord or Telegram.",
  exp_rules: ["You pick the duration when posting: 1 hour to 3 days. Then the listing leaves the feed on its own.", "You can extend a listing with one tap — in the feed or in your profile.", "One active listing per game: a new one replaces the old."],
  replaced: "Your previous listing for this game was replaced", expired_toast: "Your listing has expired",
  favs_empty: "Star the people you enjoyed playing with — their listings will come first in the feed.",
  blocked_toast: n => n + " is blocked: their listings are hidden", reported: "Report sent to the moderators.",
  c_from_profile: "Contacts come from your profile and are visible to signed-in players only.", cvis_note: { all: "", chat: "", stack: "" },
  share_title: "Link to the listing", share_note: "Send it on Discord or Telegram — the link opens this listing.",
  lv_n: { stack: (n, g) => n + " invites you to a stack · " + g, comment: n => n + " left a comment about you", app: (n, tm) => n + " wants to join " + tm, app_ok: tm => "You were accepted to " + tm, app_no: tm => "Your application to " + tm + " was declined",
    kicked: tm => "You were removed from " + tm, invite: (n, tm) => n + " invites you to team " + tm, book: (tm, w) => tm + " wants a scrim · " + w, book_ok: (tm, w) => "Scrim with " + tm + " confirmed · " + w, book_no: tm => tm + " declined the scrim", sc_cancel: tm => "Scrim with " + tm + " was cancelled",
    veto: tm => "Your turn in the veto · scrim with " + tm, result: tm => tm + " reported the scrim result — please confirm", result_ok: tm => "Scrim result with " + tm + " is recorded", sub: (n, tm) => n + " applied as a substitute for " + tm, sub_ok: tm => tm + " take you as a substitute", mod_post: () => "A moderator removed your listing for breaking the rules", mod_warn: () => "A moderator issued you a warning" },
  lv_stack_add: "To stack", lv_stack_hint: "Invite players to your stack — they get a notification. Then sort out the details in chat.", lv_stack_sent: n => n + " will get a stack invite",
  lv_cm: "Comments", lv_cm_none: "No comments yet.", lv_cm_ph: "How did it go? A few words about the player", lv_cm_send: "Leave a comment", lv_cm_upd: "Save", lv_cm_del: "Delete", lv_cm_need: "You can comment after a chat where both of you wrote to each other.",
  lv_cm_mine: "your comment", lv_cm_saved: "Comment saved", lv_cm_deleted: "Comment deleted", lv_cm_about: "Comments about me", lv_cm_about_note: "You can delete any comment on your own page.",
  lv_rules: "Rules", lv_privacy: "Privacy", lv_contact_us: "Contact",
  lv_login: "Sign in", lv_signup: "Sign up", lv_logout: "Sign out", lv_looking: n => n + " looking",
  lv_contact: "Contact", lv_how_contact: "How to reach", lv_c_login: "Sign in to see contacts", lv_c_none: "This player left no contacts.",
  lv_contact_hint: "Message the player on Discord or Telegram and mention you are from Stuckup.",
  lv_guest_cta: "Sign in to see players' contacts and post your own listing.",
  lv_loading: "Loading listings…", lv_load_err: "Could not load listings.", lv_retry: "Retry",
  lv_empty_all: "Nobody is looking for a team yet. Post the first listing — everyone who visits will see it.",
  lv_empty_game: g => "Nobody is looking in " + g + " yet. Post the first listing.",
  lv_need_contact: "Add Discord or Telegram — otherwise nobody can reach you.",
  lv_del_q: "Delete this listing?", lv_gone: "This listing is no longer active.", lv_in: "Signed in", lv_out: "Signed out",
  lv_email: "Email", lv_pass: "Password", lv_pass_new: "New password", lv_pass_hint: "At least 8 characters.",
  lv_nick_hint: "3–20 characters: letters, digits, dot, hyphen and _. Other players will see it.",
  lv_consent: ["I am 14 or older and accept the ", "rules", " and the ", "privacy policy", "."],
  lv_t_login: "Sign in", lv_t_reg: "Sign up", lv_t_code: "Code from the email", lv_t_reset: "Password reset",
  lv_b_login: "Sign in", lv_b_reg: "Create account", lv_b_code: "Confirm", lv_b_reset: "Send code", lv_b_reset2: "Change password",
  lv_to_reg: "No account? Sign up", lv_to_login: "Already have an account? Sign in", lv_forgot: "Forgot password?", lv_back: "Back",
  lv_code_sent: e => "We sent a code to " + e + ". Enter it to finish.", lv_code_spam: "No email? Check the spam folder.",
  lv_code: "6-digit code", lv_resend: "Send again", lv_resent: "Code sent again",
  lv_dev_code: c => "Email is not connected yet, so the code is shown here: " + c,
  lv_reset_hint: "Enter your account email — we will send a code to change the password.",
  lv_acc: "Account", lv_nick_change: "Change nickname", lv_nick_title: "New nickname", lv_nick_saved: "Nickname changed", lv_nick_limit: "You can change the nickname up to 3 times a day.",
  lv_c_note: "Profile contacts go into your listings. Only signed-in players see them.",
  lv_del_acc: "Delete account", lv_del_acc_t: "Your account, profile and listings will be deleted for good. Enter your password to confirm.", lv_del_acc_done: "Account deleted",
  lv_people: "Players", lv_posts: "Listings", lv_contacts_btn: "Contacts",
  chats_empty: "Your conversations will appear here. Tap “Message” on a player's listing.", lv_chat_guest: "Sign in to message players.", lv_not_sent: "Message not sent.",
  reason: { expired: "expired", replaced: "replaced by a new one", closed: "closed by you" },
  archive_note: "Your recent closed listings. Any of them can be posted again with one tap.",
  lv_err: { network: "No connection to the server. Check your internet and try again.", server: "Something broke on the server. Please try again.", auth: "Please sign in first.",
    too_many: "Too many attempts. Try again a bit later.", stack_full: "The stack is full.", need_chat: "You can comment after chatting with the player.", empty: "Too short.", bad_email: "Check the email address.", short_password: "The password must be at least 8 characters.", long_password: "The password is too long.",
    bad_nick: "Nickname: 3–20 characters, letters, digits, dot, hyphen and _.", nick_taken: "This nickname is taken.", email_taken: "This email is already registered — sign in.", need_consent: "You need to accept the rules.",
    bad_login: "Wrong email or password.", bad_password: "Wrong password.", banned: "This account is blocked for breaking the rules.", code_expired: "The code has expired. Request a new one.", code_tries: "Too many wrong attempts. Request a new code.",
    bad_code: "Wrong code.", mail_failed: "Could not send the email. Try again later.", mail_off: "Password reset will work once email is connected. Message us on Telegram.",
    need_contact: "Keep at least one contact while you have active listings.", no_links: "Links are not allowed in the text. Contacts go in your profile.", need_rank: "Set your rank.",
    bad_dc: "Check the Discord username.", bad_tg: "Check the Telegram username.", post_gone: "This listing is no longer active.", blocked_by: "This player does not accept your messages.", you_blocked: "This player is on your block list.", empty: "Empty message.", list_full: "The list is full.", bad_target: "That will not work.", forbidden: "No access." }
});

/* ---------- server ---------- */
async function api(method, path, body) {
  let res;
  try { res = await fetch("/api" + path, { method, credentials: "same-origin", headers: body !== undefined ? { "Content-Type": "application/json" } : {}, body: body !== undefined ? JSON.stringify(body) : undefined }); }
  catch (e) { return { ok: false, status: 0, error: "network" }; }
  let j = null; try { j = await res.json(); } catch (e) {}
  if (!res.ok) return Object.assign({}, j || {}, { ok: false, status: res.status, error: (j && j.error) || "server" });
  return Object.assign({}, j || {}, { ok: true, status: res.status });
}
function errText(r) { const m = t("lv_err"); return m[r.error] || m.server; }

/* ---------- local state + profile sync ---------- */
function load() { try { const o = JSON.parse(localStorage.getItem(LKEY) || "null") || {}; return { lang: o.lang, setupHidden: !!o.setupHidden, favs: [], blocked: [] }; } catch (e) { return { favs: [], blocked: [] }; } }
function seedChats() { return {}; }
function profilePayload() { const p = S.profile; return { dc: p.dc, tg: p.tg, langs: p.langs, region: p.region, adult: p.adult, games: p.games, roles: p.roles, ranks: p.ranks, time: p.time, days: p.days, style: p.style, onboarded: p.onboarded }; }
function save() {
  try { localStorage.setItem(LKEY, JSON.stringify({ lang: S.lang, setupHidden: S.setupHidden })); } catch (e) {}
  if (ME) { clearTimeout(LV.syncT); LV.syncT = setTimeout(pushProfile, 700); }
}
async function pushProfile() {
  clearTimeout(LV.syncT);
  if (!ME) return { ok: false, error: "auth" };
  const body = JSON.stringify(profilePayload());
  if (body === LV.synced) return { ok: true };
  const r = await api("PUT", "/me", { profile: JSON.parse(body), lang: S.lang });
  if (r.ok) { LV.synced = body; if (r.posts) mergeMine(r.posts); return r; }
  if (r.status === 401) { signedOut(true); return r; }
  toast(errText(r));
  if (r.user) { adoptUser(r.user); renderAll(); }
  return r;
}
function adoptUser(u) {
  ME = { id: u.id, email: u.email, nick: u.nick };
  S.profile = Object.assign(blankProfile(S.lang), u.profile, { nick: u.nick });
  GAME_KEYS.forEach(g => { if (!S.profile.ranks[g]) S.profile.ranks[g] = {}; });
  setLists(u);
  S.archive = (u.archive || []).slice();
  LV.synced = JSON.stringify(profilePayload());
  if (LV.teamsSig) { LV.teamsDrawn = ""; refreshTeams().then(teamsDraw); }
}
function setLists(o) {
  LV.favList = o.favs || []; LV.blockList = o.blocked || [];
  if (o.stacks || !ME) setStacks(o.stacks || {});
  S.favs = LV.favList.map(x => x.id); S.blocked = LV.blockList.map(x => x.id);
}
function signedOut(expired) {
  ME = null; S.profile = blankProfile(S.lang); setLists({}); LV.synced = ""; S.chats = {}; S.active = null; S.archive = [];
  S.posts.forEach(p => { p.mine = false; SEED.push(p); }); S.posts = [];
  if (LV.teamsSig) refreshTeams();
  if ($("#overlay")) closeModal();
  setView("feed"); renderAll();
  refreshFeed(true).then(() => { renderRail(); renderFeed(); });
  if (expired) toast(t("lv_err").auth);
}

/* ---------- feed data ---------- */
function adoptPost(p) {
  const o = Object.assign({}, p);
  o.t0 = p.t0 - LV.skew; o.exp = p.exp - LV.skew; o.t = o.t0;
  o.mine = !!ME && p.uid === ME.id; o.on = !!p.on; o.ver = false; o.cvis = "all";
  return o;
}
function setFeed(list) {
  const all = list.map(adoptPost);
  S.posts = all.filter(p => p.mine);
  SEED.length = 0; all.forEach(p => { if (!p.mine) SEED.push(p); });
  LV.sig = feedSig();
}
function feedSig() { return S.posts.concat(SEED).map(p => p.id + ":" + p.exp + ":" + p.nick + ":" + (p.c ? 1 : 0)).sort().join("|"); }
function mergeMine(list) {
  const mine = list.map(adoptPost);
  S.posts = mine; LV.sig = feedSig();
}
async function refreshFeed(silent) {
  const r = await api("GET", "/posts");
  if (!r.ok) { if (!LV.ready) LV.loadErr = true; if (!silent) toast(errText(r)); return false; }
  const skew = r.now - Date.now();
  LV.skew = Math.abs(skew) > 5000 ? skew : 0;
  const before = LV.sig;
  setFeed(r.posts);
  LV.ready = true; LV.loadErr = false; LV.feedAt = Date.now();
  return before !== LV.sig || true;
}
function activePosts() { const now = Date.now(); return S.posts.concat(SEED).filter(p => p.exp > now && !S.blocked.includes(p.uid)); }
function hasC(p) { return !!(p.hasC || (p.c && (p.c.dc || p.c.tg))); }
function cState(p) { return !hasC(p) ? "none" : (p.c ? "show" : "login"); }
function contactsInner(p) {
  const st = cState(p);
  if (st === "none") return "";
  if (st === "show") return (p.c.dc ? cChip("dc", p.c.dc) : "") + (p.c.tg ? cChip("tg", p.c.tg) : "");
  return `<button class="lock lv-lock" data-action="lv-auth">${ICON.lock}${esc(t("lv_c_login"))}</button>`;
}

/* ---------- header, rail, feed ---------- */
function applyLang() {
  applyLang__base();
  const b = $("#meBtn");
  if (!ME) { b.innerHTML = `<span class="lv-in">${esc(t("lv_login"))}</span>`; b.setAttribute("aria-label", t("lv_login")); }
  b.classList.toggle("guest", !ME);
}
function renderRail() {
  const act = activePosts();
  const tile = (k, name, color, mob) => {
    if (S.view === "teams") { const all = allTeams(), c = k === "all" ? all.length : all.filter(x => x.game === k).length; return `<button class="gt${c ? "" : " none"}" data-game="${k}" aria-pressed="${S.game === k}" style="--g:var(${color})"><span class="gt-name">${esc(name)}${mob ? `<small>${esc(t("mobile"))}</small>` : ""}</span><span class="gt-meta">${esc(t("teams_n", c))}</span></button>`; }
    const n = k === "all" ? act.length : act.filter(p => p.game === k).length;
    return `<button class="gt${n ? "" : " none"}" data-game="${k}" aria-pressed="${S.game === k}" style="--g:var(${color})"><span class="gt-name">${esc(name)}${mob ? `<small>${esc(t("mobile"))}</small>` : ""}</span><span class="gt-meta">${n ? '<i class="odot" aria-hidden="true"></i>' : ""}${esc(t("lv_looking", n))}</span></button>`;
  };
  $("#rail").innerHTML = tile("all", t("all"), "--accent") + railOrder().map(k => tile(k, gshort(k), GAMES[k].color, GAMES[k].mobile)).join("");
}
function filtered() {
  const f = S.f, q = S.q, txt = f.q.trim().toLowerCase(), now = Date.now();
  return activePosts().filter(p => {
    if (S.game !== "all") {
      if (p.game !== S.game) return false;
      if (f.modes.length && !f.modes.includes(p.mode)) return false;
      if (f.sys !== "any") { const rs = [p.r].concat(p.extra || []).filter(r => r.sys === f.sys); if (!rs.some(r => { const s = step(r); return s >= f.rmin && s <= f.rmax; })) return false; }
      if (f.roles.length && !p.roles.some(r => f.roles.includes(r))) return false;
    }
    if (f.styles.length && !f.styles.includes(p.style)) return false;
    if (f.stags.length && !f.stags.every(s => (p.stags || []).includes(s))) return false;
    if (f.region !== "any" && p.region !== f.region) return false;
    if (f.lng !== "any" && !p.langs.includes(f.lng)) return false;
    if (q.online && !p.on) return false;
    if (q.favs && !S.favs.includes(p.uid)) return false;
    if (q.mic && !p.mic) return false;
    if (q.contacts && !hasC(p)) return false;
    if (q.fresh && now - p.t0 > 3600000) return false;
    if (q.match && !p.mine && !isMatch(p)) return false;
    if (txt && !(p.nick.toLowerCase().includes(txt) || noteOf(p).toLowerCase().includes(txt))) return false;
    return true;
  }).sort((a, b) => (b.mine ? 1 : 0) - (a.mine ? 1 : 0) || (S.favs.includes(b.uid) ? 1 : 0) - (S.favs.includes(a.uid) ? 1 : 0) || (b.on ? 1 : 0) - (a.on ? 1 : 0) || b.t0 - a.t0);
}
function card(p) {
  const G = GAMES[p.game], match = !p.mine && !!ME && isMatch(p), fav = !p.mine && S.favs.includes(p.uid), id = esc(p.id);
  const who = `<button class="nickbtn" data-action="player" data-id="${id}"><span class="n">${esc(p.nick)}</span></button>`;
  const av = `<button class="avbtn" data-action="player" data-id="${id}" aria-label="${esc(p.nick)}">${avatar(p.nick, p.on && !p.mine)}</button>`;
  const tagline = p.mine ? `<span class="mine-tag">${esc(t("your_post"))}</span>` : "";
  const head = `<div class="c-head">${av}<div class="who"><div class="nick">${who}${fav ? `<span class="lv-fav" title="${esc(t("fav_on"))}">${ICON.star}</span>` : ""}</div><div class="meta"><span class="gtag"><i></i>${esc(gshort(p.game))}</span><span>${esc(modeName(p.game, p.mode))}</span><span>·</span><span>${esc(rel(p.t0))}</span>${tagline}</div></div>${badge(p.r)}</div>`;
  const note = noteOf(p) ? `<p class="note">${esc(noteOf(p))}</p>` : "";
  const foot = p.mine
    ? `<div class="c-foot">${needHtml(p)}</div><div class="c-foot">${expHtml(p)}<div class="c-acts"><button class="btn small" data-action="renew" data-id="${id}">${ICON.refresh}${esc(t("renew", durLabel(p.dur)))}</button><button class="iconbtn" data-action="del-post" data-id="${id}" aria-label="${esc(t("del"))}" title="${esc(t("del"))}">${ICON.trash}</button></div></div>`
    : `<div class="c-foot">${needHtml(p)}${match ? `<span class="match">${ICON.target}${esc(t("match_tag"))}</span>` : ""}<div class="c-acts"><button class="btn small" data-action="player" data-id="${id}">${esc(t("lv_contacts_btn"))}</button><button class="btn primary small" data-action="open-chat" data-id="${id}">${ICON.chat}${esc(t("write"))}</button></div></div>`;
  return `<article class="card${p.mine ? " mine" : ""}" data-id="${id}" style="--g:var(${G.color})">${head}${note}${foot}</article>`;
}
function pickCard(x) {
  const p = x.p, id = esc(p.id);
  return `<div class="pick" style="--g:var(${GAMES[p.game].color})"><div class="pick-h"><button class="avbtn" data-action="player" data-id="${id}" aria-label="${esc(p.nick)}">${avatar(p.nick, false)}</button><div class="who"><div class="nick"><button class="nickbtn" data-action="player" data-id="${id}"><span class="n">${esc(p.nick)}</span></button></div><div class="meta"><span class="gtag"><i></i>${esc(gshort(p.game))}</span>${miniRank(p.r)}</div></div></div><div class="pick-f"><span class="why">${esc(x.why.map(w => t("picks_why")[w]).join(" · "))}</span><button class="btn primary small" data-action="open-chat" data-id="${id}">${esc(t("write"))}</button></div></div>`;
}
function renderFeed() {
  if (!LV.ready) {
    $("#count").textContent = "";
    $("#list").innerHTML = LV.loadErr ? `<div class="empty"><span>${esc(t("lv_load_err"))}</span><button class="btn small" data-action="lv-retry">${ICON.refresh}${esc(t("lv_retry"))}</button></div>`
      : `<div class="empty lv-loading"><span>${esc(t("lv_loading"))}</span></div>`;
    renderSetup(); return;
  }
  const all = activePosts(), inGame = S.game === "all" ? all : all.filter(p => p.game === S.game);
  if (inGame.length) { renderFeed__base(); return; }
  $("#count").textContent = t("found", 0);
  $("#list").innerHTML = `<div class="empty lv-first"><span>${esc(S.game === "all" ? t("lv_empty_all") : t("lv_empty_game", gname(S.game)))}</span><button class="btn primary small" data-action="new-post">${ICON.plus}${esc(t("post_btn"))}</button></div>`;
  renderSetup();
}
function renderSetup() {
  const el = $("#setup"); if (!el) return;
  if (ME) { renderSetup__base(); return; }
  el.innerHTML = LV.ready ? `<div class="slim">${ICON.target}<span>${esc(t("lv_guest_cta"))}</span><button class="btn primary small" data-action="lv-auth" data-mode="register">${esc(t("lv_signup"))}</button><button class="btn ghost small" data-action="lv-auth">${esc(t("lv_login"))}</button></div>` : "";
}
function setStacks(st) { LV.stacks = st || {}; GAME_KEYS.forEach(g => { S.stacks[g] = (LV.stacks[g] || []).map(x => x.id); }); }
function renderStack() {
  const el = $("#stackbar"); if (!el) return;
  if (!ME) { el.innerHTML = ""; return; }
  let g = S.game;
  if (g === "all") { g = GAME_KEYS.find(k => S.stacks[k].length); if (!g) { el.innerHTML = ""; return; } }
  const G = GAMES[g], list = (LV.stacks || {})[g] || [], filled = list.length + 1, need = G.size - filled;
  let slots = `<span class="slot me" title="${esc(S.profile.nick)}">${S.lang === "ru" ? "ВЫ" : "YOU"}</span>`;
  list.forEach(x => { slots += `<button class="slot filled" data-action="open-chat" data-id="${esc(x.id)}" title="${esc(x.nick)}">${avatar(x.nick, false)}</button>`; });
  for (let i = filled; i < G.size; i++) slots += '<span class="slot" aria-hidden="true">+</span>';
  const msg = need <= 0 ? t("stack_full") : list.length ? t("stack_need", need) : t("lv_stack_hint");
  el.innerHTML = `<div class="lobby${need <= 0 ? " full" : ""}" id="lobby" style="--g:var(${G.color})"><div class="lobby-row"><span class="lobby-title"><i class="dot"></i>${esc(t("stack"))} · ${esc(gshort(g))} <span class="mono">${filled}/${G.size}</span></span><div class="slots">${slots}</div></div><div class="lobby-row"><p class="msg">${esc(msg)}</p>${list.length ? `<span class="lobby-acts"><button class="btn ghost small" data-action="clear-stack" data-g="${g}">${esc(t("clear"))}</button></span>` : ""}</div></div>`;
}
async function toggleStack(id) {
  if (!ME) { authSheet("login"); return false; }
  const p = findPost(id); if (!p || p.mine) return false;
  const on = !S.stacks[p.game].includes(p.uid);
  const r = await api("POST", "/stack", { uid: p.uid, game: p.game, on });
  if (!r.ok) { toast(errText(r)); return false; }
  setStacks(r.stacks);
  toast(on ? t("lv_stack_sent", p.nick) : t("removed_stack", p.nick));
  renderStack(); renderFeed(); playerSheetRefresh(id);
  return true;
}
async function clearStack(g) { const r = await api("POST", "/stack", { game: g, clear: true }); if (!r.ok) { toast(errText(r)); return; } setStacks(r.stacks); renderStack(); renderFeed(); }
function renderBell() { const n = LV.nUnread || 0, b = $("#bellBadge"); if (!b) return; b.hidden = !n; b.textContent = n; $("#bell").hidden = !ME; $("#bell").setAttribute("aria-label", t("notifs") + (n ? " · " + n : "")); }
function notifText(n) { const f = t("lv_n")[n.k]; if (!f) return ""; const a = (n.a || []).slice(); if (n.k === "stack" && GAMES[a[1]]) a[1] = gshort(a[1]); if ((n.k === "book" || n.k === "book_ok") && a[1]) a[1] = whenLabel(+a[1]); return f(...a); }
async function notifSheet() {
  if (!ME) { authSheet("login"); return; }
  const r = await api("GET", "/notifs"); if (!r.ok) { toast(errText(r)); return; }
  const list = r.notifs.filter(n => notifText(n));
  const body = list.length ? `<div class="nlist">${list.map((n, i) => `<button class="nitem${n.read ? "" : " unread"}" data-ni="${i}"><span class="ic">${ICON[{ stack: "plus", comment: "chat" }[n.k] || "users"]}</span><span class="txt"><span>${esc(notifText(n))}</span><span class="sub"><span>${esc(rel(n.t))}</span></span></span>${n.read ? "" : '<span class="ud"></span>'}</button>`).join("")}</div>` : `<p class="hint">${esc(t("notif_empty"))}</p>`;
  openSheet(t("notifs"), body, "", ov => {
    ov.addEventListener("click", e => { const it = e.target.closest("[data-ni]"); if (!it) return; const n = list[+it.dataset.ni]; closeModal(); if (n.go) goTo(n.go); });
  });
  if (LV.nUnread) { LV.nUnread = 0; renderBell(); api("POST", "/notifs/read", {}); }
}
function verRow() { return ""; }
function setView(v) {
  if (v !== "feed" && v !== "profile" && v !== "chats" && v !== "teams") v = "feed";
  if ((v === "profile" || v === "chats") && !ME) { authSheet("login"); return; }
  setView__base(v);
  if (v === "teams") refreshTeams().then(teamsDraw);
}
function closeModal() { AU = null; closeModal__base(); }

/* ---------- player sheet, favourites, block list, reports ---------- */
function playerSheet(id) {
  const p = findPost(id); if (!p) { toast(t("lv_gone")); return; }
  const G = GAMES[p.game], fav = S.favs.includes(p.uid), pid = esc(p.id);
  const ranks = [p.r].concat(p.extra || []).map(rk => `<div class="rrow">${badge(rk)}</div>`).join("");
  const tags = `${p.style ? `<span class="sty">${esc(t("styles")[p.style])}</span>` : ""}${p.roles.map(x => `<span class="role">${esc(roleName(p.game, x))}</span>`).join("")}${(p.stags || []).map(s => `<span class="safe">${esc(t("stags")[s])}</span>`).join("")}<span>${ICON.globe}${esc(regionName(p.region))} · ${esc(p.langs.map(x => x.toUpperCase()).join("/"))}</span><span>${p.mic ? ICON.mic + esc(t("mic")) : ICON.nomic + esc(t("no_mic"))}</span>${(p.when || []).map(w => `<span>${ICON.clock}${esc(t("times")[w])}</span>`).join("")}`;
  const contact = hasC(p) ? contactsHtml(p) + (p.c && !p.mine ? `<p class="hint">${esc(t("lv_contact_hint"))}</p>` : "") : `<p class="hint">${esc(t("lv_c_none"))}</p>`;
  const body = `<div class="ph">${avatar(p.nick, false)}<div class="who"><div class="nick"><span class="n">${esc(p.nick)}</span>${p.mine ? `<span class="mine-tag">${esc(t("your_post"))}</span>` : ""}</div><div class="meta"><span class="gtag" style="--g:var(${G.color})"><i></i>${esc(G.name)}</span><span>${esc(modeName(p.game, p.mode))}</span><span>·</span><span>${esc(rel(p.t0))}</span></div></div></div>
<section class="blk"><h4>${esc(t("lv_how_contact"))}</h4>${contact}</section>
<section class="blk"><h4>${esc(t("p_post"))}</h4>${noteOf(p) ? `<p class="note" style="margin:0">${esc(noteOf(p))}</p>` : ""}<div class="c-foot" style="margin:0">${needHtml(p)}</div><div class="tags">${tags}</div>${expHtml(p)}</section>
<section class="blk"><h4>${esc(t("p_ranks"))}</h4>${ranks}</section>
<section class="blk"><h4>${esc(t("lv_cm"))}</h4><div id="cmBox" data-uid="${esc(p.uid)}"><p class="hint">…</p></div></section>
<div class="pacts">${p.mine ? "" : `<button class="btn primary small" data-action="open-chat" data-id="${pid}">${ICON.chat}${esc(t("write"))}</button><button class="btn small${S.stacks[p.game].includes(p.uid) ? " on" : ""}" data-action="toggle-stack" data-id="${pid}">${S.stacks[p.game].includes(p.uid) ? ICON.check + esc(t("in_stack")) : ICON.plus + esc(t("lv_stack_add"))}</button><button class="btn small${fav ? " on" : ""}" data-action="fav" data-id="${pid}" aria-pressed="${fav}">${ICON.star}${esc(fav ? t("fav_on") : t("fav_add"))}</button>`}<button class="btn small" data-action="share" data-kind="player" data-id="${pid}">${ICON.link}${esc(t("share"))}</button></div>
${p.mine ? "" : `<div class="actrow"><button class="btn ghost small" data-action="report" data-id="${pid}">${ICON.flag}${esc(t("report"))}</button><button class="btn ghost small danger" data-action="block" data-id="${pid}">${ICON.ban}${esc(t("block"))}</button></div>`}`;
  openSheet(p.nick, body, "");
  loadComments(p.uid);
}
function commentsHtml(uid, r) {
  const own = ME && uid === ME.id, mine = ME ? r.comments.find(c => c.from === ME.id) : null;
  const rows = r.comments.map(c => `<div class="lv-cm">${avatar(c.nick, false)}<div class="txt"><div class="h"><b>${esc(c.nick)}</b><span>${esc(rel(c.t))}</span>${ME && c.from === ME.id ? `<span class="mine-tag">${esc(t("lv_cm_mine"))}</span>` : ""}</div><p>${esc(c.text)}</p></div>${own || (ME && c.from === ME.id) ? `<button class="iconbtn" data-cmdel="${esc(c.from)}" aria-label="${esc(t("lv_cm_del"))}" title="${esc(t("lv_cm_del"))}">${ICON.trash}</button>` : ""}</div>`).join("");
  const form = own ? "" : r.can ? `<form class="lv-cmform" id="cmForm"><textarea class="inp" id="cmText" maxlength="200" placeholder="${esc(t("lv_cm_ph"))}">${esc(mine ? mine.text : "")}</textarea><button class="btn small primary" type="submit">${esc(mine ? t("lv_cm_upd") : t("lv_cm_send"))}</button></form>` : ME ? `<p class="hint">${esc(t("lv_cm_need"))}</p>` : "";
  return (rows || `<p class="hint">${esc(t("lv_cm_none"))}</p>`) + form;
}
async function loadComments(uid, pre) {
  const r = pre || await api("GET", "/comments/" + encodeURIComponent(uid));
  const box = document.querySelector('#cmBox[data-uid="' + uid + '"]'); if (!box) return;
  if (!r.ok) { box.innerHTML = `<p class="hint">${esc(errText(r))}</p>`; return; }
  box.innerHTML = commentsHtml(uid, r);
  if (box._wired) return; box._wired = true;
  box.addEventListener("submit", async e => {
    e.preventDefault(); const text = box.querySelector("#cmText").value.trim();
    const x = await api("PUT", "/comments/" + encodeURIComponent(uid), { text });
    if (!x.ok) { toast(errText(x)); return; }
    toast(t("lv_cm_saved")); loadComments(uid, x);
  });
  box.addEventListener("click", async e => {
    const b = e.target.closest("[data-cmdel]"); if (!b) return;
    const x = await api("DELETE", "/comments/" + encodeURIComponent(uid), { from: b.dataset.cmdel });
    if (!x.ok) { toast(errText(x)); return; }
    toast(t("lv_cm_deleted")); loadComments(uid, x);
  });
}
function shareSheet(kind, id) {
  let link;
  if (kind === "team") { const tm = findTeam(id); if (!tm) return; link = location.origin + "/#/t/" + tm.id; }
  else { const p = findPost(id); if (!p) return; link = location.origin + "/#/p/" + p.id; }
  openSheet(t("share"), `<div class="field"><span class="lbl">${esc(t("share_title"))}</span>${linkBox(link)}</div><p class="hint" style="margin:0">${esc(t("share_note"))}</p>`, "");
}
function whoIs(id) { const p = findPost(id); if (p) return { uid: p.uid, nick: p.nick }; const x = LV.favList.concat(LV.blockList).find(v => v.id === id) || S.chats[id]; return { uid: id, nick: x ? x.nick : "" }; }
async function toggleFav(id) {
  if (!ME) { authSheet("login"); return; }
  const w = whoIs(id), on = !S.favs.includes(w.uid);
  const r = await api("POST", "/favs", { uid: w.uid, on });
  if (!r.ok) { toast(errText(r)); return; }
  setLists(r); toast(on ? t("fav_added", w.nick) : t("fav_removed", w.nick));
  renderFeed(); playerSheetRefresh(id); if (S.view === "profile") renderProfile();
}
async function setBlocked(id, on) {
  if (!ME) { authSheet("login"); return; }
  const w = whoIs(id);
  const r = await api("POST", "/blocks", { uid: w.uid, on });
  if (!r.ok) { toast(errText(r)); return; }
  setLists(r);
  if (on && S.active === w.uid) S.active = null;
  if ($("#overlay")) closeModal();
  renderRail(); renderFeed(); renderChat(); if (S.view === "profile") renderProfile();
  if (on) toast(t("blocked_toast", w.nick), { label: t("undo"), fn: () => setBlocked(w.uid, false) }); else toast(t("unblocked_toast", w.nick));
}
function reportSheet(id) {
  if (!ME) { authSheet("login"); return; }
  const p = findPost(id); if (!p) return;
  const rs = t("reasons");
  openSheet(t("report_title") + " · " + p.nick, `<div style="display:grid;gap:8px">${Object.keys(rs).map((k, i) => `<label class="reason"><input type="radio" name="rr" value="${k}"${i === 0 ? " checked" : ""}> ${esc(rs[k])}</label>`).join("")}</div><label class="check"><input type="checkbox" id="rhide"> ${esc(t("report_block"))}</label>`,
    `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="rsend">${esc(t("report_send"))}</button>`, ov => {
      ov.querySelector("#rsend").addEventListener("click", async () => {
        const reason = (ov.querySelector('input[name="rr"]:checked') || {}).value || "toxic", hide = ov.querySelector("#rhide").checked;
        const r = await api("POST", "/reports", { postId: p.id, reason });
        if (!r.ok) { toast(errText(r)); return; }
        closeModal();
        if (hide) await setBlocked(p.uid, true);
        toast(t("reported"));
      });
    });
}

/* ---------- my listings ---------- */
function postSheet(fromArchive) {
  if (!ME) { authSheet("login", "post"); return; }
  postSheet__base(fromArchive);
}
async function doPublish() {
  if (!F || LV.busy) return;
  readFormInputs();
  const pr = S.profile;
  const dc = normDc(F.dc != null ? F.dc : pr.dc), tg = normTg(F.tg != null ? F.tg : pr.tg);
  if (dc && !DC_RE.test(dc)) { F.err = "dc"; rerenderForm(); return; }
  if (tg && !TG_RE.test(tg)) { F.err = "tg"; rerenderForm(); return; }
  if (!dc && !tg) { toast(t("lv_need_contact")); const el = $("#pf2-dc"); if (el) { el.scrollIntoView({ block: "center" }); el.focus(); } return; }
  if (!F.r) { F.err = "rank"; rerenderForm(); return; }
  LV.busy = true;
  const btn = document.querySelector('[data-action="publish"]'); if (btn) btn.disabled = true;
  const done = () => { LV.busy = false; if (btn) btn.disabled = false; };
  pr.dc = dc; pr.tg = tg;
  const sync = await pushProfile();
  if (!sync.ok) { done(); return; }
  const r = await api("POST", "/posts", { game: F.game, mode: F.mode, r: F.r, roles: F.roles, have: F.have, region: F.region, mic: F.mic, note: F.note.trim().slice(0, 200), dur: F.dur, style: F.style, stags: F.stags });
  done();
  if (!r.ok) { if (r.error === "need_rank") { F.err = "rank"; rerenderForm(); } toast(errText(r)); return; }
  adoptUser(r.user);
  const g = F.game;
  S.posts = S.posts.filter(x => x.game !== g); S.posts.unshift(adoptPost(r.post)); LV.sig = feedSig();
  closeModal();
  if (S.game !== "all" && S.game !== g) setGame(g);
  setView("feed"); renderAll();
  toast(r.replaced ? t("posted") + ". " + t("replaced") : t("posted"));
}
async function renewPost(id) {
  const r = await api("POST", "/posts/" + encodeURIComponent(id) + "/renew", {});
  if (!r.ok) { toast(errText(r)); if (r.status === 404) { await refreshFeed(true); renderRail(); renderFeed(); if (S.view === "profile") renderProfile(); } return; }
  const np = adoptPost(r.post); S.posts = S.posts.map(x => (x.id === id ? np : x)); LV.sig = feedSig();
  renderFeed(); if (S.view === "profile") renderProfile();
  toast(t("renewed"));
}
function deletePost(id) {
  toast(t("lv_del_q"), { label: t("del"), fn: async () => {
    const r = await api("DELETE", "/posts/" + encodeURIComponent(id), {});
    if (!r.ok) { toast(errText(r)); return; }
    S.posts = S.posts.filter(x => x.id !== id); LV.sig = feedSig(); if (r.archive) S.archive = r.archive;
    renderRail(); renderFeed(); if (S.view === "profile") renderProfile();
    toast(t("deleted"));
  } });
}

/* ---------- sign in / sign up ---------- */
function authSheet(mode, after) {
  AU = { mode: mode || "login", after: after || (AU && AU.after) || null, email: (AU && AU.email) || "", nick: (AU && AU.nick) || "", pass: "", code: "", consent: false, err: "", devCode: "", busy: false };
  authRender();
}
function authRead() {
  if (!AU) return;
  const v = id => { const el = document.getElementById(id); return el ? el.value : null; };
  if (v("au-email") != null) AU.email = v("au-email").trim();
  if (v("au-nick") != null) AU.nick = v("au-nick").trim();
  if (v("au-pass") != null) AU.pass = v("au-pass");
  if (v("au-code") != null) AU.code = v("au-code").replace(/\D/g, "");
  const c = document.getElementById("au-consent"); if (c) AU.consent = c.checked;
}
function authBody() {
  const m = AU.mode, c = t("lv_consent");
  const email = `<div class="field"><label class="lbl" for="au-email">${esc(t("lv_email"))}</label><input class="inp" id="au-email" type="email" inputmode="email" autocomplete="${m === "register" ? "email" : "username"}" autocapitalize="off" spellcheck="false" maxlength="254" required value="${esc(AU.email)}"></div>`;
  const pass = (label, ac, hint) => `<div class="field"><label class="lbl" for="au-pass">${esc(label)}</label><input class="inp" id="au-pass" type="password" autocomplete="${ac}" minlength="${ac === "new-password" ? 8 : 1}" maxlength="72" required value="${esc(AU.pass)}">${hint ? `<p class="hint">${esc(hint)}</p>` : ""}</div>`;
  const code = `<div class="field"><label class="lbl" for="au-code">${esc(t("lv_code"))}</label><input class="inp mono lv-code" id="au-code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required value="${esc(AU.code)}"></div>`;
  const err = AU.err ? `<p class="ferr" role="alert">${esc(AU.err)}</p>` : "";
  const dev = AU.devCode ? `<p class="lv-dev">${esc(t("lv_dev_code", AU.devCode))}</p>` : "";
  let h = "";
  if (m === "login") h = email + pass(t("lv_pass"), "current-password") + err + `<div class="lv-links2"><button type="button" class="lv-a" data-au="register">${esc(t("lv_to_reg"))}</button><button type="button" class="lv-a" data-au="reset">${esc(t("lv_forgot"))}</button></div>`;
  else if (m === "register") h = `<div class="field"><label class="lbl" for="au-nick">${esc(t("nick"))}</label><input class="inp" id="au-nick" autocomplete="nickname" autocapitalize="off" spellcheck="false" minlength="3" maxlength="20" required placeholder="${esc(t("nick_ph"))}" value="${esc(AU.nick)}"><p class="hint">${esc(t("lv_nick_hint"))}</p></div>` + email + pass(t("lv_pass"), "new-password", t("lv_pass_hint")) +
    `<label class="check lv-consent"><input type="checkbox" id="au-consent" required${AU.consent ? " checked" : ""}> <span>${esc(c[0])}<a href="/rules" target="_blank" rel="noopener">${esc(c[1])}</a>${esc(c[2])}<a href="/privacy" target="_blank" rel="noopener">${esc(c[3])}</a>${esc(c[4])}</span></label>` + err + `<div class="lv-links2"><button type="button" class="lv-a" data-au="login">${esc(t("lv_to_login"))}</button></div>`;
  else if (m === "code") h = `<p class="lv-lead">${esc(t("lv_code_sent", AU.email))}</p>` + dev + code + err + `<p class="hint">${esc(t("lv_code_spam"))}</p><div class="lv-links2"><button type="button" class="lv-a" data-au="resend">${esc(t("lv_resend"))}</button><button type="button" class="lv-a" data-au="register">${esc(t("lv_back"))}</button></div>`;
  else if (m === "reset") h = `<p class="lv-lead">${esc(t("lv_reset_hint"))}</p>` + email + err + `<div class="lv-links2"><button type="button" class="lv-a" data-au="login">${esc(t("lv_back"))}</button></div>`;
  else h = `<p class="lv-lead">${esc(t("lv_code_sent", AU.email))}</p>` + dev + code + pass(t("lv_pass_new"), "new-password", t("lv_pass_hint")) + err + `<div class="lv-links2"><button type="button" class="lv-a" data-au="reset">${esc(t("lv_back"))}</button></div>`;
  return `<form id="auForm" class="lv-form" novalidate>${h}</form>`;
}
function authRender() {
  const m = AU.mode, title = { login: "lv_t_login", register: "lv_t_reg", code: "lv_t_code", reset: "lv_t_reset", reset2: "lv_t_reset" }[m], btn = { login: "lv_b_login", register: "lv_b_reg", code: "lv_b_code", reset: "lv_b_reset", reset2: "lv_b_reset2" }[m];
  openSheet(t(title), authBody(), `<button class="btn primary lv-wide" type="submit" form="auForm" id="auGo"${AU.busy ? " disabled" : ""}>${esc(t(btn))}</button>`, ov => {
    ov.addEventListener("submit", e => { e.preventDefault(); authSubmit(); });
    ov.addEventListener("click", e => {
      const b = e.target.closest("[data-au]"); if (!b || !AU) return;
      authRead();
      if (b.dataset.au === "resend") { authResend(); return; }
      AU.mode = b.dataset.au; AU.err = ""; AU.code = ""; AU.devCode = ""; authRender();
    });
    const first = ov.querySelector(m === "code" || m === "reset2" ? "#au-code" : m === "register" ? "#au-nick" : "#au-email");
    if (first && !AU.err && isWide()) first.focus();
  });
}
function authFail(r) { if (!AU) return; AU.busy = false; AU.err = r.error === "bad_code" && r.left ? errText(r) + " " + (S.lang === "ru" ? "Осталось попыток: " : "Attempts left: ") + r.left : errText(r); authRender(); }
async function authSubmit() {
  if (!AU || AU.busy) return;
  authRead();
  const m = AU.mode, E = t("lv_err");
  const local = (m !== "code" && m !== "reset2" && !/^\S+@\S+\.\S+$/.test(AU.email)) ? E.bad_email
    : (m === "register" && !/^[A-Za-zА-Яа-яЁё0-9_.-]{3,20}$/.test(AU.nick)) ? E.bad_nick
    : ((m === "register" || m === "reset2") && AU.pass.length < 8) ? E.short_password
    : (m === "login" && !AU.pass) ? E.bad_login
    : (m === "register" && !AU.consent) ? E.need_consent
    : ((m === "code" || m === "reset2") && AU.code.length !== 6) ? E.bad_code : "";
  if (local) { AU.err = local; authRender(); return; }
  AU.busy = true; AU.err = ""; const go = $("#auGo"); if (go) go.disabled = true;
  let r;
  if (m === "login") r = await api("POST", "/auth/login", { email: AU.email, password: AU.pass });
  else if (m === "register") r = await api("POST", "/auth/register", { email: AU.email, password: AU.pass, nick: AU.nick, consent: true, lang: S.lang });
  else if (m === "code") r = await api("POST", "/auth/verify", { email: AU.email, code: AU.code });
  else if (m === "reset") r = await api("POST", "/auth/reset", { email: AU.email });
  else r = await api("POST", "/auth/reset/confirm", { email: AU.email, code: AU.code, password: AU.pass });
  if (!AU) return;
  if (!r.ok) {
    if (m === "code" && r.error === "nick_taken") { AU.mode = "register"; AU.code = ""; }
    authFail(r); return;
  }
  AU.busy = false;
  if (m === "register" || m === "reset") { AU.mode = m === "register" ? "code" : "reset2"; AU.code = ""; AU.devCode = r.devCode || ""; if (m === "reset") AU.pass = ""; authRender(); return; }
  await signedIn(r);
}
async function authResend() {
  const r = await api("POST", "/auth/resend", { email: AU.email });
  if (!AU) return;
  if (!r.ok) { authFail(r); return; }
  AU.devCode = r.devCode || ""; AU.err = ""; authRender(); toast(t("lv_resent"));
}
async function signedIn(r) {
  const after = AU && AU.after;
  adoptUser(r.user);
  closeModal();
  await refreshFeed(true);
  if (r.posts && r.posts.length && !S.posts.length) mergeMine(r.posts);
  renderAll();
  toast(t("lv_in"));
  pollChats();
  if (!S.profile.onboarded) obSheet();
  else if (after === "post") postSheet();
}
async function logout() {
  await pushProfile();
  await api("POST", "/auth/logout", {});
  signedOut(false);
  toast(t("lv_out"));
}

/* ---------- profile ---------- */
function renderProfile() {
  if (!ME) { $("#page").innerHTML = ""; return; }
  const pr = S.profile, mine = S.posts.filter(p => p.exp > Date.now()), sec = { main: t("profile"), games: t("my_games"), posts: t("lv_posts"), people: t("lv_people"), acc: t("lv_acc") };
  let h = `<div class="pgrid"><nav class="psec-nav" aria-label="${esc(t("profile"))}">${Object.keys(sec).map(k => `<button data-action="scrollto" data-t="ps-${k}">${esc(sec[k])}</button>`).join("")}</nav>`;
  h += `<div class="panel" id="ps-main"><div class="panel-h"><h2 class="sec">${esc(t("profile"))}</h2><span class="sv" id="psv" aria-live="polite"></span></div>
<div class="p-head"><span id="pAv">${avatar(pr.nick || "?", false)}</span><div class="lv-id"><b>${esc(pr.nick)}</b><span>${esc(ME.email)}</span></div><button class="btn small" data-action="lv-nick">${esc(t("lv_nick_change"))}</button></div>
<div class="row2" style="gap:14px"><div class="field"><span class="lbl">${esc(t("my_langs"))}</span><div class="chips">${["ru", "en"].map(l => `<button class="chip" data-pl="${l}" aria-pressed="${pr.langs.includes(l)}">${esc(t("lang_" + l))}</button>`).join("")}</div></div>
<div class="field"><label class="lbl" for="pf-reg">${esc(t("my_region"))}</label><select class="inp" id="pf-reg">${Object.keys(REGIONS).map(r => `<option value="${r}"${pr.region === r ? " selected" : ""}>${esc(regionName(r))}</option>`).join("")}</select></div></div>
<div class="field"><span class="lbl">${esc(t("when_play"))}</span><div class="chips">${TIMES.map(x => `<button class="chip" data-ptime="${x}" aria-pressed="${pr.time.includes(x)}">${esc(t("times")[x])}</button>`).join("")}${["wd", "we"].map(x => `<button class="chip" data-pdays="${x}" aria-pressed="${(pr.days || []).includes(x)}">${esc(t("days2")[x])}</button>`).join("")}</div></div>
<div class="field"><span class="lbl">${esc(t("how_play"))}</span><div class="seg" role="group" aria-label="${esc(t("how_play"))}">${STYLES.map(s => `<button data-pstyle="${s}" aria-pressed="${pr.style === s}">${esc(t("styles")[s])}</button>`).join("")}</div></div>
<div class="field" style="gap:4px"><label class="check"><input type="checkbox" id="pf-adult"${pr.adult ? " checked" : ""}> ${esc(t("adult"))}</label><p class="hint">${esc(t("adult_note"))}</p></div>
<div class="field"><span class="lbl">${esc(t("c_title"))}</span><div class="cgrid">
<div class="field"><div class="pre"><span>${ICON.headset}</span><input class="inp mono" id="pf-dc" aria-label="Discord" autocapitalize="off" autocomplete="off" spellcheck="false" maxlength="40" placeholder="Discord · ${esc(t("dc_ph"))}" value="${esc(pr.dc)}"></div><p class="hint" id="pf-dc-h">${esc(t("dc_hint"))}</p></div>
<div class="field"><div class="pre"><span>@</span><input class="inp mono" id="pf-tg" aria-label="Telegram" autocapitalize="off" autocomplete="off" spellcheck="false" maxlength="60" placeholder="Telegram · ${esc(t("tg_ph"))}" value="${esc(pr.tg)}"></div><p class="hint" id="pf-tg-h">${esc(t("tg_hint"))}</p></div></div><p class="hint">${esc(t("lv_c_note"))}</p></div></div>`;
  h += `<div class="panel" id="ps-games"><div class="panel-h"><h2 class="sec">${esc(t("my_games"))}</h2><button class="btn primary small" style="margin-left:auto" data-action="game-add">${ICON.plus}${esc(t("add_game"))}</button></div><p class="hint" style="margin-top:-8px">${esc(t("my_games_note"))}</p>${pr.games.length ? `<div class="mygames">${pr.games.map(gameRow).join("")}</div>` : `<p class="hint">${esc(t("no_games"))}</p>`}</div>`;
  h += `<div class="panel" id="ps-posts"><div class="panel-h"><h2 class="sec">${esc(t("active_posts"))}</h2><button class="btn primary small" style="margin-left:auto" data-action="new-post">${ICON.plus}${esc(t("post_btn"))}</button></div>${mine.length ? '<div class="list">' + mine.map(card).join("") + "</div>" : `<p class="hint">${esc(t("no_posts"))}</p>`}
<div class="field" style="gap:4px"><h2 class="sec">${esc(t("archive"))}</h2><p class="hint">${esc(t("archive_note"))}</p></div>` + (S.archive.length ? "<div>" + S.archive.map((a, i) =>
    `<div class="arow"><span class="gtag" style="--g:var(${GAMES[a.game].color})"><i></i>${esc(gshort(a.game))}</span><span class="txt"><span>${esc(modeName(a.game, a.mode))} · ${esc(rankText(a.r, true))}</span><span class="sub">${esc(t("reason")[a.reason] || a.reason)} · ${esc(rel(a.ended))}${noteOf(a) ? " · " + esc(noteOf(a).slice(0, 60)) : ""}</span></span><button class="btn small" data-action="repost" data-i="${i}">${ICON.refresh}${esc(t("repost"))}</button></div>`).join("") + "</div>" : `<p class="hint">${esc(t("archive_empty"))}</p>`) + "</div>";
  const favRows = LV.favList.map(x => `<div class="prow">${avatar(x.nick, false)}<span class="txt"><b>${esc(x.nick)}</b></span><button class="iconbtn fav" data-action="fav" data-id="${esc(x.id)}" aria-label="${esc(t("fav_on"))}" title="${esc(t("fav_on"))}">${ICON.star}</button></div>`).join("");
  const blkRows = LV.blockList.map(x => `<div class="prow">${avatar(x.nick, false)}<span class="txt"><b>${esc(x.nick)}</b></span><button class="btn ghost small" data-action="unblock" data-id="${esc(x.id)}">${esc(t("unblock"))}</button></div>`).join("");
  h += `<div class="panel" id="ps-people"><div class="field"><h2 class="sec">${esc(t("favs_title"))}</h2>${favRows ? `<div>${favRows}</div>` : `<p class="hint">${esc(t("favs_empty"))}</p>`}</div><div class="field"><h2 class="sec">${esc(t("blocked_title"))}</h2>${blkRows ? `<div>${blkRows}</div>` : `<p class="hint">${esc(t("blocked_empty"))}</p>`}</div></div>`;
  h += `<div class="panel" id="ps-cm"><div class="field" style="gap:4px"><h2 class="sec">${esc(t("lv_cm_about"))}</h2><p class="hint">${esc(t("lv_cm_about_note"))}</p></div><div id="cmBox" data-uid="${esc(ME.id)}"><p class="hint">…</p></div></div>`;
  h += `<div class="panel" id="ps-acc"><h2 class="sec">${esc(t("lv_acc"))}</h2><div class="lv-id"><b>${esc(pr.nick)}</b><span>${esc(ME.email)}</span></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn small" data-action="lv-logout">${esc(t("lv_logout"))}</button><button class="btn ghost small danger" data-action="lv-delete-acc">${ICON.trash}${esc(t("lv_del_acc"))}</button></div></div></div>`;
  $("#page").innerHTML = h;
  loadComments(ME.id);
}
function miniSheet(title, inner, btnLabel, danger, onSubmit) {
  openSheet(title, `<form id="msForm" class="lv-form" novalidate>${inner}<p class="ferr" id="msErr" role="alert" hidden></p></form>`,
    `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary${danger ? " lv-danger" : ""}" type="submit" form="msForm" id="msGo">${esc(btnLabel)}</button>`, ov => {
      ov.addEventListener("submit", async e => {
        e.preventDefault(); const go = $("#msGo"), er = $("#msErr"); if (go.disabled) return;
        go.disabled = true; er.hidden = true;
        const msg = await onSubmit(ov);
        if (msg && $("#msErr")) { $("#msErr").textContent = msg; $("#msErr").hidden = false; $("#msGo").disabled = false; }
      });
      const f = ov.querySelector("input"); if (f && isWide()) f.focus();
    });
}
function nickSheet() {
  miniSheet(t("lv_nick_title"), `<div class="field"><label class="lbl" for="ms-nick">${esc(t("nick"))}</label><input class="inp" id="ms-nick" autocomplete="nickname" autocapitalize="off" spellcheck="false" maxlength="20" value="${esc(S.profile.nick)}"><p class="hint">${esc(t("lv_nick_hint"))} ${esc(t("lv_nick_limit"))}</p></div>`, t("save"), false, async ov => {
    const nick = ov.querySelector("#ms-nick").value.trim();
    if (!/^[A-Za-zА-Яа-яЁё0-9_.-]{3,20}$/.test(nick)) return t("lv_err").bad_nick;
    if (nick === S.profile.nick) { closeModal(); return ""; }
    const r = await api("PUT", "/me", { nick });
    if (!r.ok) return r.error === "too_many" ? t("lv_nick_limit") : errText(r);
    adoptUser(r.user); if (r.posts) mergeMine(r.posts);
    closeModal(); renderAll(); toast(t("lv_nick_saved")); return "";
  });
}
function deleteAccSheet() {
  miniSheet(t("lv_del_acc"), `<p class="lv-lead">${esc(t("lv_del_acc_t"))}</p><div class="field"><label class="lbl" for="ms-pass">${esc(t("lv_pass"))}</label><input class="inp" id="ms-pass" type="password" autocomplete="current-password" maxlength="72"></div>`, t("lv_del_acc"), true, async ov => {
    const r = await api("DELETE", "/me", { password: ov.querySelector("#ms-pass").value });
    if (!r.ok) return errText(r);
    signedOut(false); toast(t("lv_del_acc_done")); return "";
  });
}

/* ---------- chat ---------- */
function unreadTotal() { return Object.keys(S.chats).reduce((a, id) => a + (S.blocked.includes(id) ? 0 : (S.chats[id].unread || 0)), 0); }
function chatSig() { return Object.keys(S.chats).map(id => id + ":" + S.chats[id].t + ":" + S.chats[id].unread + ":" + (S.chats[id].on ? 1 : 0)).join("|"); }
function renderChat() {
  const box = $("#chatbox"); if (!box) return;
  const head = `<div class="ch-head"><h2 class="sec">${esc(t("chats"))}</h2></div>`;
  if (!ME) { box.innerHTML = head + `<div class="empty" style="margin:16px"><span>${esc(t("lv_chat_guest"))}</span><button class="btn primary small" data-action="lv-auth">${esc(t("lv_login"))}</button></div>`; renderUnread(); return; }
  const id = S.active, c = id ? S.chats[id] : null;
  if (!c) {
    S.active = null;
    const ids = Object.keys(S.chats).filter(k => !S.blocked.includes(k) && (S.chats[k].t || S.chats[k].msgs.length)).sort((a, b) => S.chats[b].t - S.chats[a].t);
    box.innerHTML = head + (ids.length ? '<div class="convs">' + ids.map(k => {
      const x = S.chats[k];
      return `<button class="conv" data-action="open-chat" data-id="${esc(k)}">${avatar(x.nick, x.on)}<span class="txt"><span class="nick"><span class="n">${esc(x.nick)}</span></span><span class="last">${x.from === ME.id ? esc(t("you_prefix")) : ""}${esc(x.last || "")}</span></span><span class="side"><span class="tm">${x.t ? (Date.now() - x.t < 72000000 ? clock(x.t) : dateStr(x.t)) : ""}</span>${x.unread ? `<span class="badge">${x.unread}</span>` : ""}</span></button>`;
    }).join("") + "</div>" : `<div class="empty" style="margin:16px">${esc(t("chats_empty"))}</div>`);
    renderUnread(); return;
  }
  const old = $("#msgInput"), draft = old ? old.value : "", focused = old && document.activeElement === old;
  const post = activePosts().find(x => x.uid === id), pid = post ? esc(post.id) : "";
  const who = post ? `<button class="avbtn" data-action="player" data-id="${pid}" aria-label="${esc(c.nick)}">${avatar(c.nick, c.on)}</button><div class="who"><div class="nick"><button class="nickbtn" data-action="player" data-id="${pid}"><span class="n">${esc(c.nick)}</span></button></div><div class="meta"><span class="gtag" style="--g:var(${GAMES[post.game].color})"><i></i>${esc(gshort(post.game))}</span>${miniRank(post.r)}</div></div>`
    : `${avatar(c.nick, c.on)}<div class="who"><div class="nick"><span class="n">${esc(c.nick)}</span></div></div>`;
  let day = "";
  const msgs = c.msgs.map(m => {
    if (m.sys) return `<div class="m sys">${esc(m.text)}</div>`;
    const d = dateStr(m.t), sep = d !== day ? `<div class="m sys lv-day">${esc(d)}</div>` : ""; day = d;
    return sep + `<div class="m ${m.me ? "me" : "them"}${m.pending ? " lv-pending" : ""}">${esc(m.text)}<span class="tm">${clock(m.t)}</span></div>`;
  }).join("");
  box.innerHTML = `<div class="room"><div class="ch-head"><button class="iconbtn" data-action="close-chat" aria-label="${esc(t("back"))}">${ICON.back}</button>${who}</div>` +
    `<div class="msgs" id="msgs">${msgs || (c.loaded ? "" : `<div class="m sys">…</div>`)}</div>` +
    `<div class="qr">${c.msgs.length ? "" : t("quick_r").map(q => `<button type="button" data-action="qr" data-text="${esc(q)}">${esc(q)}</button>`).join("")}<button type="button" class="cbtn" data-action="send-contacts">${ICON.at}${esc(t("my_contacts"))}</button></div>` +
    `<form class="composer" id="composer" autocomplete="off"><input class="inp" id="msgInput" maxlength="500" placeholder="${esc(t("msg_ph"))}" aria-label="${esc(t("msg_ph"))}"><button class="btn primary" type="submit" aria-label="${esc(t("send"))}">${ICON.send}</button></form></div>`;
  const ms = $("#msgs"); ms.scrollTop = ms.scrollHeight;
  const inp = $("#msgInput"); inp.value = draft; if (focused) inp.focus();
  renderUnread();
}
function openChat(id) {
  if (!ME) { authSheet("login"); return; }
  const w = whoIs(id); if (!w.uid || w.uid === ME.id) return;
  if (!S.chats[w.uid]) S.chats[w.uid] = { id: w.uid, nick: w.nick, msgs: [], unread: 0, t: 0, last: "", loaded: false };
  S.active = w.uid;
  if (!isWide()) setView("chats"); else renderChat();
  const i = $("#msgInput"); if (i && isWide()) i.focus();
  loadChat(w.uid);
}
function addMsgs(c, list) {
  let added = 0;
  list.forEach(m => {
    if (c.msgs.some(x => x.id === m.id)) return;
    if (!m.me && !c.warned && SCAM_RE.test(m.text)) { c.warned = true; c.msgs.push({ sys: true, text: t("scam_warn"), t: m.t }); }
    c.msgs.push(m); added++;
  });
  return added;
}
async function loadChat(uid) {
  const c = S.chats[uid]; if (!c || c.loading) return;
  c.loading = true;
  const real = c.msgs.filter(m => m.id && !m.pending), after = real.length ? real[real.length - 1].id : "";
  const r = await api("GET", "/chats/" + encodeURIComponent(uid) + (after ? "?after=" + encodeURIComponent(after) : ""));
  c.loading = false;
  if (!r.ok) return;
  const n = addMsgs(c, r.msgs), first = !c.loaded;
  c.loaded = true; c.unread = 0;
  if (S.active === uid && (n || first)) renderChat(); else renderUnread();
}
async function sendMsg(text) {
  const id = S.active, c = id ? S.chats[id] : null; text = String(text || "").trim().slice(0, 500);
  if (!c || !text) return;
  const tmp = { id: "tmp" + Date.now(), me: true, text, t: Date.now(), pending: true };
  c.msgs.push(tmp); renderChat();
  if (isWide()) { const i = $("#msgInput"); if (i) i.focus(); }
  const r = await api("POST", "/chats/" + encodeURIComponent(id), { text });
  const k = c.msgs.indexOf(tmp);
  if (!r.ok) {
    if (k >= 0) c.msgs.splice(k, 1);
    toast(r.error === "network" || r.error === "server" ? t("lv_not_sent") : errText(r));
    if (S.active === id) { renderChat(); const i = $("#msgInput"); if (i && !i.value) i.value = text; }
    return;
  }
  if (k >= 0) c.msgs[k] = r.msg;
  c.last = text.slice(0, 80); c.t = r.msg.t; c.from = ME.id;
  if (S.active === id) renderChat();
}
async function pollChats() {
  if (!ME || document.hidden) return;
  const now = Date.now(), beat = now - (LV.beatAt || 0) > 120000;
  LV.chatAt = now; if (beat) LV.beatAt = now;
  const r = await api("GET", "/chats" + (beat ? "?beat=1" : ""));
  if (!r.ok) { if (r.status === 401) signedOut(true); return; }
  if ((r.notifs || 0) !== (LV.nUnread || 0)) { const up = (r.notifs || 0) > (LV.nUnread || 0); LV.nUnread = r.notifs || 0; renderBell(); if (up && S.view === "teams") refreshTeams().then(teamsDraw); }
  const before = chatSig();
  r.chats.forEach(x => {
    const c = S.chats[x.id] || (S.chats[x.id] = { id: x.id, nick: x.nick, msgs: [], unread: 0, t: 0, last: "", loaded: false });
    const fresh = x.t > c.t;
    c.nick = x.nick; c.last = x.last; c.from = x.from; c.on = x.on; if (fresh) c.t = x.t;
    if (S.active === x.id && chatVisible(x.id)) { if (fresh || x.unread) loadChat(x.id); }
    else c.unread = x.unread;
  });
  if (before !== chatSig()) { if (!S.active && (isWide() || S.view === "chats")) renderChat(); else renderUnread(); }
}
function chatTick() {
  teamsDraw();
  if (!ME || document.hidden) return;
  const open = isWide() || S.view === "chats", every = S.active && open ? 5000 : open ? 12000 : 25000;
  if (Date.now() - (LV.chatAt || 0) >= every) pollChats();
}

/* ---------- ticker ---------- */
function tick() {
  if (document.hidden || !LV.ready) return;
  if (Date.now() - LV.feedAt > 30000 && !LV.busy) { softRefresh(); return; }
  if (S.view === "teams" && !$("#overlay") && Date.now() - (LV.teamsAt || 0) > 15000 && !(document.activeElement && document.activeElement.closest && document.activeElement.closest("#page select"))) refreshTeams().then(teamsDraw);
  const n = activePosts().length;
  if (n !== lastActive) { lastActive = n; renderRail(); if (!$("#overlay")) renderFeed(); if (S.view === "profile" && !$("#overlay") && !document.activeElement.closest("#page")) renderProfile(); }
  else updateTimers();
}
async function softRefresh() {
  LV.feedAt = Date.now();
  const before = LV.sig, ok = await refreshFeed(true);
  if (!ok) return;
  lastActive = activePosts().length;
  if (before !== LV.sig) { renderRail(); renderFeed(); } else updateTimers();
}
function addLive() {}
function openDeepLink() {
  const m = /^#\/([pt])\/([A-Za-z0-9_-]{6,40})$/.exec(location.hash || ""); if (!m) return;
  try { history.replaceState(null, "", location.pathname); } catch (e) {}
  if (m[1] === "p") playerSheet(m[2]);
  else refreshTeams().then(() => { S.teamTab = "browse"; setView("teams"); teamSheet(m[2]); });
}

//@@boot
const teamsSoon = () => refreshTeams().then(teamsDraw);
document.addEventListener("click", e => {
  if (e.target.closest("[data-ttab]")) teamsSoon();
  const a = e.target.closest("[data-action]"); if (!a) return;
  const id = a.dataset.id;
  const H = {
    "lv-auth": () => authSheet(a.dataset.mode || "login"),
    "lv-retry": () => { LV.loadErr = false; renderFeed(); start(); },
    "lv-logout": logout, "lv-nick": nickSheet, "lv-delete-acc": deleteAccSheet,
    "renew": () => renewPost(id), "del-post": () => deletePost(id),
    "clear-stack": () => clearStack(a.dataset.g)
  };
  const fn = H[a.dataset.action];
  if (fn) { e.preventDefault(); e.stopPropagation(); fn(); }
  else if (teamClick(a)) { e.preventDefault(); e.stopPropagation(); }
}, true);
document.addEventListener("change", e => { const el = e.target; if (el.dataset && el.dataset.trole != null && el.dataset.team) { e.stopPropagation(); teamRoleChange(el); } }, true);
document.addEventListener("visibilitychange", () => { if (!document.hidden && LV.ready && Date.now() - LV.feedAt > 30000) softRefresh(); if (!document.hidden) chatTick(); });
window.addEventListener("hashchange", () => { if (LV.ready) openDeepLink(); });
async function start() {
  const [me, okFeed] = await Promise.all([api("GET", "/me"), refreshFeed(true)]);
  if (me.ok && me.user) {
    adoptUser(me.user);
    // the feed was requested in parallel: mark my own listings now that we know who I am
    const all = S.posts.concat(SEED); S.posts = []; SEED.length = 0;
    all.forEach(p => { p.mine = p.uid === ME.id; (p.mine ? S.posts : SEED).push(p); });
    if (me.posts) mergeMine(me.posts);
  }
  if (!okFeed) { LV.loadErr = true; }
  lastActive = activePosts().length;
  renderAll(); measure();
  if (ME) pollChats();
  if (LV.ready) openDeepLink();
  if (ME && !S.profile.onboarded && !S.setupHidden && !$("#overlay")) setTimeout(() => { if (!$("#overlay")) obSheet(); }, 500);
}
setGame("all");
setView("feed");
renderAll();
measure();
try { document.fonts && document.fonts.ready.then(measure); } catch (e) {}
setInterval(tick, 10000);
setInterval(chatTick, 2500);
start();
