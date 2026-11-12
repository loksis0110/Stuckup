(function () {
"use strict";

/* ================= i18n ================= */
function plural(n, f) { const a = n % 10, b = n % 100; if (a === 1 && b !== 11) return f[0]; if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return f[1]; return f[2]; }
const T = {
  ru: {
    demo_tag: "демо", nav_feed: "Лента", nav_teams: "Команды", nav_chats: "Чаты", nav_profile: "Профиль", nav_admin: "Админка", nav_post: "Создать", post_btn: "Разместить",
    all: "Все игры", mobile: "моб", rail_meta: (on, n) => on + " онлайн · " + n + " " + plural(n, ["пост", "поста", "постов"]), teams_n: n => n + " " + plural(n, ["команда", "команды", "команд"]),
    feed_title: "Ищут команду", demo_line: "Это демо: игроки, команды и объявления — примеры, собеседники отвечают автоматически, а ваши данные хранятся только в этом браузере.",
    filters: "Фильтры", search: "Поиск", search_ph: "Ник или текст объявления", mode: "Режим", rank: "Ранг", rank_sys: "Система рангов", any_sys: "Любая", from: "от", to: "до",
    pick_sys: "Выберите систему, чтобы задать диапазон.", pick_game: "Выберите игру сверху, и здесь появятся режим, ранг и роль.",
    roles: "Роль", region: "Регион", language: "Язык общения", any: "Любой", reset: "Сбросить фильтры", show_n: n => "Показать " + n,
    q_match: "Мой уровень", q_online: "Онлайн", q_verified: "Подтверждённые", q_favs: "Избранные", q_mic: "С микрофоном", q_contacts: "С контактами", q_fresh: "Свежие",
    found: n => n + " " + plural(n, ["объявление", "объявления", "объявлений"]), nothing: "По этим условиям никого нет.",
    write: "Написать", invite: "В стак", in_stack: "В стаке", report: "Пожаловаться",
    online: "онлайн", ingame: "в игре", just_now: "только что", min_ago: "мин назад", h_ago: "ч назад", d_ago: "дн назад",
    left_m: m => "ещё " + m + " мин", left_hm: (h, m) => "ещё " + h + " ч" + (m ? " " + m + " мин" : ""), left_dh: (d, h) => "ещё " + d + " дн" + (h ? " " + h + " ч" : ""),
    mic: "микрофон", no_mic: "без микрофона", your_post: "ваше объявление",
    party: (a, b) => "нас " + a + " из " + b, need: n => "ищем " + n, match_tag: "ваш уровень",
    del: "Удалить", deleted: "Объявление удалено", undo: "Вернуть", renew: d => "Продлить на " + d, renewed: "Объявление продлено",
    expired_toast: "Срок объявления истёк, оно в архиве профиля", stack_closed: "Стак собран, объявление закрыто", replaced: "Прошлое объявление в этой игре ушло в архив",
    stack: "Стак", stack_empty: "Нажимайте «В стак» у игроков в ленте, чтобы собрать команду.", stack_need: n => "Осталось найти: " + n, stack_full: "Стак собран, можно заходить в лобби.",
    group_chat: "Общий чат", group_chat_demo: "В полной версии здесь откроется общий чат стака.", clear: "Распустить",
    added_stack: n => n + " в стаке", removed_stack: n => n + " больше не в стаке", stack_is_full: "Стак уже полный",
    chats: "Чаты", chats_empty: "Напишите игроку из ленты, и переписка появится здесь.", msg_ph: "Сообщение", send: "Отправить", typing: "печатает…", back: "Назад", you_prefix: "Вы: ",
    quick_r: ["Го сейчас?", "Какой у тебя ранг?", "Во сколько играешь?", "Кинь Discord"], my_contacts: "Мои контакты",
    no_my_contacts: "Сначала добавьте Discord или Telegram в профиль", my_contacts_msg: "Мои контакты: ",
    sys_joined: n => n + " теперь в вашем стаке", c_wait_stack: "Добавь меня в стак, и я скину контакты.",
    verified: "Ранг подтверждён", c_hidden_chat: "откроются после ответа в чате", c_hidden_stack: "видны участникам стака",
    copy: "Скопировать", copied: v => "Скопировано: " + v, copy_fail: v => "Скопируйте вручную: " + v,
    report_title: "Жалоба", reasons: { toxic: "Оскорбления или токсичность", spam: "Спам или реклама", fake: "Ненастоящий ранг", scam: "Мошенничество" },
    report_block: "Добавить в чёрный список", report_send: "Отправить", reported: "Жалоба ушла модераторам. Её видно в админке.",
    profile: "Профиль", nick: "Никнейм", nick_ph: "Как вас зовут в игре", adult: "Мне есть 18 лет", adult_note: "Нужно, чтобы ставить отметку 18+ в объявлениях.",
    c_title: "Discord и Telegram", dc_ph: "имя пользователя", tg_ph: "username",
    dc_hint: "Имя пользователя, а не отображаемое имя: 2–32 символа, строчная латиница, цифры, точка и _.",
    tg_hint: "5–32 символа, начинается с буквы. Можно вставить ссылку t.me.",
    dc_err: "Так имя в Discord выглядеть не может. Проверьте длину и символы.", tg_err: "Ник в Telegram: 5–32 символа, латиница, цифры и _, первая — буква.",
    cvis: "Кто видит контакты", cvis_all: "Все", cvis_chat: "После ответа", cvis_stack: "Только стак",
    cvis_note: { all: "Контакты видны в объявлениях всем.", chat: "Контакты откроются собеседнику, когда вы ответите ему в чате.", stack: "Контакты видят только игроки, которых вы позвали в стак." },
    my_langs: "Языки общения", my_region: "Регион", my_ranks: "Мои ранги", my_ranks_note: "По ним работает «Мой уровень», и ими заполняются новые объявления.",
    not_set: "не указан", saved_auto: "Сохранено", active_posts: "Активные объявления", no_posts: "Активных объявлений нет.",
    archive: "Архив", archive_note: "Снятые объявления хранятся неделю, любое можно разместить заново.", archive_empty: "Архив пуст.", repost: "Опубликовать снова",
    reason: { expired: "срок истёк", replaced: "заменено новым", stack: "стак собран" },
    reset_demo: "Сбросить демо-данные", reset_confirm: "Удалить всё, что вы сделали в демо: объявления, переписку, команды, профиль и решения в админке?", yes_reset: "Да, сбросить", cancel: "Отмена", reset_done: "Демо-данные сброшены",
    new_post: "Новое объявление", s_game: "Игра", s_mode: "Режим", s_rank: "Ранг", s_roles: "Роли", s_group: "Группа", s_note: "Описание", s_contacts: "Контакты", s_time: "Сколько показывать",
    have: "Сколько вас уже", have_hint: (a, b) => "Ищете ещё " + (b - a), note_ph: "Кого ищете, во сколько играете, что важно в команде",
    show_c: "Показать мои контакты в объявлении", c_from_profile: "Берутся из профиля. Изменения сохранятся и там.",
    dur_hint: "Потом объявление само исчезнет из ленты. Продлить можно в один клик.", how_exp: "Как работает срок объявления", publish: "Опубликовать", posted: "Объявление опубликовано",
    need_nick: "Укажите никнейм", need_rank: "Укажите рейтинг", need_rank_match: "Укажите хотя бы один ранг в профиле, чтобы искать игроков своего уровня", open_profile: "В профиль",
    exp_rules: ["Срок выбирается при публикации: от 1 часа до 3 дней. Потом объявление само исчезает из ленты.", "За 15 минут до конца приходит уведомление, продлить можно в один клик.", "Собрали стак — объявление закрывается автоматически.", "В каждой игре у вас одно активное объявление: новое заменяет старое.", "Если вы не заходили 3 дня, ваши объявления снимаются.", "Закрытые объявления 30 дней лежат в архиве профиля, оттуда их можно перезапустить."],
    setup_title: "Настройте профиль за минуту", setup_text: "Ник, ранги, Discord или Telegram. Тогда «Мой уровень» покажет игроков вашего уровня, а объявления будут заполняться сами.", setup_btn: "Заполнить профиль", dismiss: "Позже",
    lang_ru: "Русский", lang_en: "Английский", level_n: l => l + " уровень", elo_ph: "ELO, например 1420", premier_ph: "Рейтинг, например 15400",
    durs: ["1 ч", "3 ч", "12 ч", "24 ч", "2 дня"], close: "Закрыть", stars: "звёзд",
    style: "Стиль игры", styles: { fun: "На фан", serious: "Серьёзно", train: "Тренировка" },
    safety: "Безопасность", stags: { adult: "18+", nomat: "Без мата", newbie: "Новичкам рады", women: "Женский стак", men: "Мужской стак" }, adult_need: "Отметка 18+ доступна, если в профиле указано, что вам есть 18.",
    rep_n: (p, n) => p + "% · " + n + " " + plural(n, ["отзыв", "отзыва", "отзывов"]), rep_none: "нет отзывов", noshow_n: n => n + " " + plural(n, ["неявка", "неявки", "неявок"]),
    rep_tags: { kind: "Адекватный", comms: "Хорошая связь", skill: "Сильный игрок", leader: "Хороший капитан", punctual: "Пунктуальный", toxic: "Токсичный", rage: "Бросает игры" },
    rate: "Оценить", rate_title: "Как прошла игра?", rate_up: "Сыграл бы снова", rate_down: "Не хочу снова", rate_ns: "Не пришёл в игру", rate_send: "Отправить отзыв", rated: "Спасибо, отзыв учтён",
    rate_need: "Оценивать можно тех, с кем вы были в стаке или переписывались.", rate_mates: "Оценить тиммейтов", rated_already: "Отзыв оставлен", rate_pick: "Отметьте хотя бы одного игрока",
    fav_add: "В избранное", fav_on: "В избранном", fav_added: n => n + " в избранном", fav_removed: n => n + " убран из избранного",
    block: "В чёрный список", unblock: "Разблокировать", blocked_toast: n => n + " в чёрном списке: его объявления и сообщения скрыты", unblocked_toast: n => n + " разблокирован", blocked_chat: "Вы заблокировали этого игрока.",
    call_again: "Позвать снова", call_again_msg: "Привет! Го снова в стак? Я тебя уже добавил.",
    favs_title: "Избранные игроки", favs_empty: "Отмечайте звёздочкой тех, с кем хорошо сыграли, и зовите снова в один клик.", blocked_title: "Чёрный список", blocked_empty: "Никого.",
    p_ranks: "Ранги", p_stats: "Статистика", p_rep: "Репутация", p_post: "Объявление",
    st_wr: "винрейт", st_matches: "матчей", st_last: "Последние 10", st_hours: "часов", st_src: s => "Источник: " + s + ". В демо цифры примерные.",
    st_none: g => "У " + g + " нет открытого API статистики. В полной версии игрок сможет заполнить её сам.", st_connect: "Подключите аккаунт выше, чтобы здесь появилась ваша статистика.",
    favk: { heroes: "Любимые герои", maps: "Любимые карты", agents: "Любимые агенты", champs: "Любимые чемпионы", legends: "Любимые легенды", modes: "Любимые режимы" },
    hs: "хедшоты", dmg: "урон за игру", wl: ["В", "П"],
    verify: "Подтвердить", v_api: s => "Подтверждён · " + s, v_shot: "Подтверждён модератором", v_wait: "На проверке", v_none: "Не подтверждён",
    shot_title: "Проверка ранга по скриншоту", shot_text: "У этой игры нет открытого API. Загрузите скриншот профиля, где видны ранг и ник. Модератор сверит его, обычно в течение суток.",
    shot_pick: "Выбрать скриншот", shot_send: "Отправить на проверку", shot_sent: "Скриншот отправлен модератору. Его видно в админке.", shot_need: "Сначала укажите ранг", shot_file_need: "Выберите изображение",
    acc_title: "Аккаунты", acc_note: "Подключение подтверждает ранги и подтягивает статистику. Сайт не видит ваши пароли.",
    accs: { steam: "Dota 2, Deadlock, друзья из Steam", faceit: "CS2 · FACEIT", riot: "Valorant, League of Legends", pubg: "PUBG: Battlegrounds, по нику" },
    connect: "Подключить", disconnect: "Отключить", acc_on: "Подключён", acc_t: s => "Подключение " + s,
    acc_demo: "В полной версии откроется официальная страница входа, и сайт получит только ник и открытые данные игр. В демо подключение имитируется.", acc_ok: s => s + " подключён, ранги подтверждены",
    acc_off: s => s + " отключён", resync: "Обновить", synced: "Данные обновлены", pubg_nick: "Ник в PUBG", pubg_nick_need: "Укажите ник в PUBG",
    notifs: "Уведомления", notif_empty: "Пока тихо. Здесь появятся сообщения, новые игроки вашего уровня и ответы команд.", notif_read: "Прочитать все",
    n_msg: n => n + " написал(а) вам", n_new: (n, g) => "Новое объявление в " + g + ": " + n, n_match: (n, g) => "Игрок вашего уровня в " + g + ": " + n,
    n_expire: g => "Объявление в " + g + " истекает через 15 минут", n_team: n => "Команда " + n + " приняла вашу заявку", n_app: (n, tm) => n + " хочет в команду " + tm,
    n_rank: "Модератор подтвердил ваш ранг", n_rank_no: "Модератор отклонил скриншот ранга", n_test: "Тестовое уведомление: бот на связи", n_voice: ch => "Голосовой канал готов: " + ch, to_tg: "→ Telegram",
    tg_title: "Telegram-бот", tg_text: "Бот присылает уведомления, даже когда сайт закрыт.", tg_connect: "Подключить бота",
    tg_steps: ["Откройте бота Stuckup в Telegram", "Отправьте ему код ниже", "Нажмите «Я отправил код»"], tg_done: "Я отправил код", tg_linked: "Бот подключён, уведомления дублируются в Telegram", tg_on: "Подключён", tg_unlink: "Отключить", tg_test: "Прислать тест", tg_demo: "В демо бот не отвечает: подключение имитируется.",
    n_prefs: "Что присылать", prefs: { match: "Новые игроки моего уровня", msg: "Сообщения", stack: "Стак и голосовой канал", expire: "Скорый конец срока объявления", team: "Заявки и ответы команд" },
    push: "Уведомления в браузере", push_note: "В полной версии браузер один раз спросит разрешение.",
    voice_btn: "Голосовой в Discord", voice_made: "Бот создал голосовой канал и разослал приглашение всем в стаке", voice_note: "Канал на сервере Stuckup удалится сам, когда все выйдут.",
    voice_open: "Открыть", voice_open_demo: "В полной версии откроется Discord с этим каналом.", voice_close: "Закрыть", voice_need: "Сначала позовите в стак хотя бы одного игрока",
    app_title: "Приложение для ПК", app_text: "Живёт в трее рядом с часами. Показывает новые объявления и сообщения поверх игры и сам ставит статус «в игре» из Steam.",
    app_dl: "Скачать для Windows", app_dl_demo: "Установщик появится вместе с полной версией.", app_lfg: "Ищу тиммейта", app_on: g => "Steam: в игре · " + g, app_off: "Steam не подключён",
    app_feats: ["Уведомления поверх игры без сворачивания", "Статус «в игре» ставится сам по данным Steam", "Быстрый ответ в чат прямо из трея", "Запуск вместе с Windows, почти не тратит ресурсы"], app_new: "Новые для вас", app_unread: n => n + " непрочитанных",
    teams: "Команды и кланы", team_new: "Создать команду", team_open: "Ищем", team_full: "Состав полный", team_apply: "Подать заявку", team_applied: "Заявка на рассмотрении", team_accepted: "Вы в команде",
    team_role: "Роль", team_msg: "Сообщение капитану", team_msg_ph: "Пара слов о себе: ранг, опыт, когда можете играть", team_sent: "Заявка отправлена капитану",
    team_name: "Название", team_tag: "Тег", team_tag_hint: "2–5 символов: латиница и цифры", team_desc: "Описание", team_desc_ph: "Чем занимаетесь: хабы, турниры, вечерние игры",
    team_sched: "Расписание", team_sched_ph: "Например: вт, чт, вс с 20:00 по Москве", team_create: "Создать", team_created: "Команда создана. Первые заявки придут в уведомления.",
    team_roster: "Состав", team_captain: "капитан", team_apps: "Заявки", team_apps_empty: "Заявок пока нет.", accept: "Принять", decline: "Отклонить", team_mine: "ваша команда",
    team_disband: "Распустить команду", team_disbanded: "Команда распущена", team_err_name: "Название — от 3 до 24 символов", team_err_tag: "Тег — 2–5 латинских букв или цифр",
    teams_empty: "В этой игре пока нет команд. Создайте первую.", team_accept_toast: n => n + " теперь в команде", more: "Подробнее", team_need_nick: "Сначала укажите никнейм в профиле", you: "Вы",
    admin: "Админ-панель", admin_demo: "Демо: в полной версии этот раздел видят только владелец сайта и модераторы. Решения здесь сразу влияют на ленту.",
    k_users: "Пользователей", k_users_d: "+37 за сутки", k_posts: "Активных объявлений", k_stacks: "Стаков собрано сегодня", k_reports: "Открытых жалоб",
    ch_games: "Объявления по играм сейчас", ch_hours: "Активность по часам, МСК", ch_week: "Новые пользователи за неделю",
    q_reports: "Жалобы", q_ranks: "Ранги на проверку", q_bans: "Баны", q_posts: "Все объявления",
    a_hide: "Снять объявление", a_ban7: "Бан 7 дней", a_banp: "Бан навсегда", a_dismiss: "Отклонить", a_unban: "Разбанить", a_approve: "Подтвердить", a_reject: "Отклонить",
    a_reports_empty: "Открытых жалоб нет.", a_ranks_empty: "Очередь пуста.", a_bans_empty: "Банов нет.", a_from: n => "от " + n, a_until: d => "до " + d, a_forever: "навсегда",
    a_banned: n => n + " забанен", a_unbanned: n => n + " разбанен", a_removed: "Объявление снято с ленты", a_rank_ok: "Ранг подтверждён", a_rank_no: "Заявка отклонена", a_dismissed: "Жалоба отклонена",
    days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"], a_noshot: "В демо скриншот не прикреплён", a_player: "Игрок", a_game: "Игра", a_rank: "Ранг", a_left: "Осталось",
    open_admin: "Открыть админ-панель", a_you: "вы",
    scam_warn: "Безопасность: никогда не сообщайте пароль и коды Steam Guard и не передавайте предметы или деньги вперёд. Модераторы Stuckup никогда об этом не просят.",
    psec: { main: "Профиль", acc: "Аккаунты", ranks: "Ранги", notif: "Уведомления", app: "Приложение", people: "Игроки", posts: "Объявления" },
    my_rep: "Моя репутация", my_rep_none: "Отзывов пока нет. Они появятся после первых игр с тиммейтами.", my_stats: "Моя статистика",
  },
  en: {
    demo_tag: "demo", nav_feed: "Feed", nav_teams: "Teams", nav_chats: "Chats", nav_profile: "Profile", nav_admin: "Admin", nav_post: "Post", post_btn: "Post listing",
    all: "All games", mobile: "mob", rail_meta: (on, n) => on + " online · " + n + " " + (n === 1 ? "post" : "posts"), teams_n: n => n + " team" + (n === 1 ? "" : "s"),
    feed_title: "Looking for team", demo_line: "This is a demo: players, teams and listings are examples, chat partners reply automatically, and your data stays in this browser only.",
    filters: "Filters", search: "Search", search_ph: "Nickname or listing text", mode: "Mode", rank: "Rank", rank_sys: "Rank system", any_sys: "Any", from: "from", to: "to",
    pick_sys: "Pick a system to set a range.", pick_game: "Pick a game above to filter by mode, rank and role.",
    roles: "Role", region: "Region", language: "Language", any: "Any", reset: "Reset filters", show_n: n => "Show " + n,
    q_match: "My level", q_online: "Online", q_verified: "Verified", q_favs: "Favorites", q_mic: "Has mic", q_contacts: "Has contacts", q_fresh: "Fresh",
    found: n => n + " " + (n === 1 ? "listing" : "listings"), nothing: "Nobody matches these filters.",
    write: "Message", invite: "Add to stack", in_stack: "In stack", report: "Report",
    online: "online", ingame: "in game", just_now: "just now", min_ago: "min ago", h_ago: "h ago", d_ago: "d ago",
    left_m: m => m + " min left", left_hm: (h, m) => h + " h" + (m ? " " + m + " min" : "") + " left", left_dh: (d, h) => d + " d" + (h ? " " + h + " h" : "") + " left",
    mic: "mic", no_mic: "no mic", your_post: "your listing",
    party: (a, b) => a + " of " + b, need: n => "need " + n, match_tag: "your level",
    del: "Delete", deleted: "Listing deleted", undo: "Undo", renew: d => "Extend by " + d, renewed: "Listing extended",
    expired_toast: "Your listing expired and moved to the archive", stack_closed: "Stack is full, listing closed", replaced: "Your previous listing for this game moved to the archive",
    stack: "Stack", stack_empty: "Tap “Add to stack” on players in the feed to build your team.", stack_need: n => "Still need: " + n, stack_full: "Stack is full, time to queue up.",
    group_chat: "Group chat", group_chat_demo: "In the full version this opens a shared chat for the stack.", clear: "Disband",
    added_stack: n => n + " joined the stack", removed_stack: n => n + " left the stack", stack_is_full: "Stack is already full",
    chats: "Chats", chats_empty: "Message a player from the feed and the conversation shows up here.", msg_ph: "Message", send: "Send", typing: "is typing…", back: "Back", you_prefix: "You: ",
    quick_r: ["Play now?", "What's your rank?", "When do you play?", "Send your Discord"], my_contacts: "My contacts",
    no_my_contacts: "Add Discord or Telegram to your profile first", my_contacts_msg: "My contacts: ",
    sys_joined: n => n + " is now in your stack", c_wait_stack: "Add me to your stack and I'll send my contacts.",
    verified: "Rank verified", c_hidden_chat: "unlock after they reply in chat", c_hidden_stack: "visible to stack members",
    copy: "Copy", copied: v => "Copied: " + v, copy_fail: v => "Copy it manually: " + v,
    report_title: "Report", reasons: { toxic: "Insults or toxicity", spam: "Spam or ads", fake: "Fake rank", scam: "Scam" },
    report_block: "Add to block list", report_send: "Send", reported: "Report sent to moderators. You can see it in Admin.",
    profile: "Profile", nick: "Nickname", nick_ph: "Your in-game name", adult: "I'm 18 or older", adult_note: "Required to use the 18+ tag on listings.",
    c_title: "Discord and Telegram", dc_ph: "username", tg_ph: "username",
    dc_hint: "Your username, not display name: 2–32 characters, lowercase letters, digits, period and _.",
    tg_hint: "5–32 characters, starts with a letter. You can paste a t.me link.",
    dc_err: "That can't be a Discord username. Check length and characters.", tg_err: "Telegram username: 5–32 characters, letters, digits and _, starting with a letter.",
    cvis: "Who sees contacts", cvis_all: "Everyone", cvis_chat: "After reply", cvis_stack: "Stack only",
    cvis_note: { all: "Everyone sees your contacts on your listings.", chat: "A player sees your contacts once you reply to them in chat.", stack: "Only players you added to your stack see your contacts." },
    my_langs: "Languages", my_region: "Region", my_ranks: "My ranks", my_ranks_note: "Used by “My level” and to prefill new listings.",
    not_set: "not set", saved_auto: "Saved", active_posts: "Active listings", no_posts: "No active listings.",
    archive: "Archive", archive_note: "Closed listings are kept for a week; any of them can be posted again.", archive_empty: "Archive is empty.", repost: "Post again",
    reason: { expired: "expired", replaced: "replaced", stack: "stack filled" },
    reset_demo: "Reset demo data", reset_confirm: "Delete everything you did in the demo: listings, chats, teams, profile and admin decisions?", yes_reset: "Yes, reset", cancel: "Cancel", reset_done: "Demo data reset",
    new_post: "New listing", s_game: "Game", s_mode: "Mode", s_rank: "Rank", s_roles: "Roles", s_group: "Group", s_note: "Description", s_contacts: "Contacts", s_time: "How long to show",
    have: "How many of you already", have_hint: (a, b) => "Looking for " + (b - a) + " more", note_ph: "Who you need, when you play, what matters to your team",
    show_c: "Show my contacts on the listing", c_from_profile: "Taken from your profile. Changes are saved there too.",
    dur_hint: "After that the listing leaves the feed on its own. Extending takes one tap.", how_exp: "How listing expiry works", publish: "Publish", posted: "Listing published",
    need_nick: "Enter a nickname", need_rank: "Enter your rating", need_rank_match: "Add at least one rank to your profile to find players at your level", open_profile: "Profile",
    exp_rules: ["You pick the duration when posting: 1 hour to 3 days. Then the listing leaves the feed on its own.", "You get a notification 15 minutes before it ends and can extend with one tap.", "Stack filled — the listing closes automatically.", "One active listing per game: a new one replaces the old.", "If you haven't visited for 3 days, your listings are taken down.", "Closed listings stay in your profile archive for 30 days and can be relaunched."],
    setup_title: "Set up your profile in a minute", setup_text: "Nickname, ranks, Discord or Telegram. Then “My level” shows players at your level and new listings fill themselves in.", setup_btn: "Fill in profile", dismiss: "Later",
    lang_ru: "Russian", lang_en: "English", level_n: l => "Level " + l, elo_ph: "Elo, e.g. 1420", premier_ph: "Rating, e.g. 15400",
    durs: ["1 h", "3 h", "12 h", "24 h", "2 days"], close: "Close", stars: "stars",
    style: "Play style", styles: { fun: "For fun", serious: "Tryhard", train: "Practice" },
    safety: "Safety", stags: { adult: "18+", nomat: "No swearing", newbie: "Newbie friendly", women: "Women's stack", men: "Men's stack" }, adult_need: "The 18+ tag requires confirming you're 18+ in your profile.",
    rep_n: (p, n) => p + "% · " + n + " reviews", rep_none: "no reviews yet", noshow_n: n => n + " no-show" + (n === 1 ? "" : "s"),
    rep_tags: { kind: "Friendly", comms: "Good comms", skill: "Skilled", leader: "Good leader", punctual: "On time", toxic: "Toxic", rage: "Leaves games" },
    rate: "Rate", rate_title: "How was the game?", rate_up: "Would play again", rate_down: "Not again", rate_ns: "Didn't show up", rate_send: "Submit review", rated: "Thanks, review saved",
    rate_need: "You can rate players you stacked or chatted with.", rate_mates: "Rate teammates", rated_already: "Reviewed", rate_pick: "Rate at least one player",
    fav_add: "Add to favorites", fav_on: "In favorites", fav_added: n => n + " added to favorites", fav_removed: n => n + " removed from favorites",
    block: "Block", unblock: "Unblock", blocked_toast: n => n + " blocked: their listings and messages are hidden", unblocked_toast: n => n + " unblocked", blocked_chat: "You blocked this player.",
    call_again: "Invite again", call_again_msg: "Hey! Want to stack again? I've added you.",
    favs_title: "Favorite players", favs_empty: "Star players you enjoyed playing with and invite them again in one tap.", blocked_title: "Blocked", blocked_empty: "Nobody.",
    p_ranks: "Ranks", p_stats: "Stats", p_rep: "Reputation", p_post: "Listing",
    st_wr: "win rate", st_matches: "matches", st_last: "Last 10", st_hours: "hours", st_src: s => "Source: " + s + ". Numbers are approximate in the demo.",
    st_none: g => g + " has no public stats API. In the full version players can fill this in themselves.", st_connect: "Connect an account above to see your stats here.",
    favk: { heroes: "Favorite heroes", maps: "Favorite maps", agents: "Favorite agents", champs: "Favorite champions", legends: "Favorite legends", modes: "Favorite modes" },
    hs: "headshots", dmg: "avg damage", wl: ["W", "L"],
    verify: "Verify", v_api: s => "Verified · " + s, v_shot: "Verified by moderator", v_wait: "Under review", v_none: "Not verified",
    shot_title: "Rank check by screenshot", shot_text: "This game has no public API. Upload a profile screenshot showing your rank and nickname. A moderator checks it, usually within a day.",
    shot_pick: "Choose screenshot", shot_send: "Send for review", shot_sent: "Screenshot sent to moderators. You can see it in Admin.", shot_need: "Set your rank first", shot_file_need: "Choose an image",
    acc_title: "Accounts", acc_note: "Connecting verifies ranks and pulls stats. The site never sees your passwords.",
    accs: { steam: "Dota 2, Deadlock, Steam friends", faceit: "CS2 · FACEIT", riot: "Valorant, League of Legends", pubg: "PUBG: Battlegrounds, by nickname" },
    connect: "Connect", disconnect: "Disconnect", acc_on: "Connected", acc_t: s => "Connect " + s,
    acc_demo: "In the full version the official sign-in page opens and the site only gets your nickname and public game data. In the demo connecting is simulated.", acc_ok: s => s + " connected, ranks verified",
    acc_off: s => s + " disconnected", resync: "Sync", synced: "Data updated", pubg_nick: "PUBG nickname", pubg_nick_need: "Enter your PUBG nickname",
    notifs: "Notifications", notif_empty: "Quiet for now. Messages, new players at your level and team replies show up here.", notif_read: "Mark all read",
    n_msg: n => n + " messaged you", n_new: (n, g) => "New listing in " + g + ": " + n, n_match: (n, g) => "Player at your level in " + g + ": " + n,
    n_expire: g => "Your " + g + " listing ends in 15 minutes", n_team: n => "Team " + n + " accepted your application", n_app: (n, tm) => n + " wants to join " + tm,
    n_rank: "A moderator verified your rank", n_rank_no: "A moderator rejected your rank screenshot", n_test: "Test notification: the bot is online", n_voice: ch => "Voice channel ready: " + ch, to_tg: "→ Telegram",
    tg_title: "Telegram bot", tg_text: "The bot sends notifications even when the site is closed.", tg_connect: "Connect bot",
    tg_steps: ["Open the Stuckup bot in Telegram", "Send it the code below", "Tap “I sent the code”"], tg_done: "I sent the code", tg_linked: "Bot connected, notifications are mirrored to Telegram", tg_on: "Connected", tg_unlink: "Disconnect", tg_test: "Send test", tg_demo: "The bot doesn't answer in the demo: connecting is simulated.",
    n_prefs: "What to send", prefs: { match: "New players at my level", msg: "Messages", stack: "Stack and voice channel", expire: "Listing about to expire", team: "Team applications and replies" },
    push: "Browser notifications", push_note: "In the full version the browser asks for permission once.",
    voice_btn: "Discord voice", voice_made: "The bot created a voice channel and invited everyone in the stack", voice_note: "The channel on the Stuckup server deletes itself when everyone leaves.",
    voice_open: "Open", voice_open_demo: "In the full version this opens Discord in that channel.", voice_close: "Close", voice_need: "Add at least one player to the stack first",
    app_title: "Desktop app", app_text: "Lives in the tray next to the clock. Shows new listings and messages over your game and sets your “in game” status from Steam.",
    app_dl: "Download for Windows", app_dl_demo: "The installer ships with the full version.", app_lfg: "Looking for team", app_on: g => "Steam: in game · " + g, app_off: "Steam not connected",
    app_feats: ["Notifications over the game without alt-tabbing", "“In game” status set automatically from Steam", "Quick reply to chats right from the tray", "Starts with Windows and stays light"], app_new: "New for you", app_unread: n => n + " unread",
    teams: "Teams and clans", team_new: "Create team", team_open: "Recruiting", team_full: "Roster full", team_apply: "Apply", team_applied: "Application pending", team_accepted: "You're in",
    team_role: "Role", team_msg: "Message to captain", team_msg_ph: "A few words: rank, experience, when you can play", team_sent: "Application sent to the captain",
    team_name: "Name", team_tag: "Tag", team_tag_hint: "2–5 characters: letters and digits", team_desc: "Description", team_desc_ph: "What you do: hubs, tournaments, evening games",
    team_sched: "Schedule", team_sched_ph: "E.g. Tue, Thu, Sun from 20:00 Moscow time", team_create: "Create", team_created: "Team created. First applications will arrive in notifications.",
    team_roster: "Roster", team_captain: "captain", team_apps: "Applications", team_apps_empty: "No applications yet.", accept: "Accept", decline: "Decline", team_mine: "your team",
    team_disband: "Disband team", team_disbanded: "Team disbanded", team_err_name: "Name must be 3 to 24 characters", team_err_tag: "Tag must be 2–5 letters or digits",
    teams_empty: "No teams for this game yet. Create the first one.", team_accept_toast: n => n + " joined the team", more: "Details", team_need_nick: "Set your nickname in your profile first", you: "You",
    admin: "Admin panel", admin_demo: "Demo: in the full version only the site owner and moderators see this section. Decisions here affect the feed right away.",
    k_users: "Users", k_users_d: "+37 today", k_posts: "Active listings", k_stacks: "Stacks formed today", k_reports: "Open reports",
    ch_games: "Listings by game now", ch_hours: "Activity by hour, Moscow time", ch_week: "New users this week",
    q_reports: "Reports", q_ranks: "Ranks to review", q_bans: "Bans", q_posts: "All listings",
    a_hide: "Remove listing", a_ban7: "Ban 7 days", a_banp: "Ban forever", a_dismiss: "Dismiss", a_unban: "Unban", a_approve: "Approve", a_reject: "Reject",
    a_reports_empty: "No open reports.", a_ranks_empty: "Queue is empty.", a_bans_empty: "No bans.", a_from: n => "by " + n, a_until: d => "until " + d, a_forever: "forever",
    a_banned: n => n + " banned", a_unbanned: n => n + " unbanned", a_removed: "Listing removed from the feed", a_rank_ok: "Rank approved", a_rank_no: "Request rejected", a_dismissed: "Report dismissed",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], a_noshot: "No screenshot attached in the demo", a_player: "Player", a_game: "Game", a_rank: "Rank", a_left: "Left",
    open_admin: "Open admin panel", a_you: "you",
    scam_warn: "Safety: never share your password or Steam Guard codes, and never hand over items or money first. Stuckup moderators never ask for this.",
    psec: { main: "Profile", acc: "Accounts", ranks: "Ranks", notif: "Notifications", app: "App", people: "Players", posts: "Listings" },
    my_rep: "My reputation", my_rep_none: "No reviews yet. They appear after your first games with teammates.", my_stats: "My stats",
  }
};

/* ---- v4 strings ---- */
Object.assign(T.ru, {
  demo_line: "Демо: игроки, команды и объявления — примеры, ответы в чате автоматические. Ваши данные хранятся только в этом браузере.",
  q_more: "Ещё", f_more: "Ещё", f_prem: "Premium-фильтры", q_rep90: "Репутация от 90%", q_nons: "Без неявок", q_sametime: "Играют в моё время",
  need_short: n => "ищем " + n, promo: "продвигается", sub_tag: "Ищут замену", sub_title: tg => "[" + tg + "] ищет замену", sub_role: r => "роль: " + r,
  sub_respond: "Откликнуться", sub_responded: "Отклик отправлен", sub_taken: (tm, w) => tm + " берут вас на замену · " + w, sub_resp_n: n => n + " " + plural(n, ["отклик", "отклика", "откликов"]),
  bump: "Поднять", bumped: "Объявление поднято наверх ленты", bump_wait: m => "Поднять снова можно через " + m + " мин",
  picks: "Подходят вам", picks_why: { rank: "ваш уровень", style: "ваш стиль", time: "ваше время", lang: "ваш язык" },
  ob_cta: "Пройдите быстрый старт: 4 вопроса, и мы покажем игроков вашего уровня.", ob_go: "Начать", ob_title: "Быстрый старт", ob_skip: "Пропустить", ob_next: "Далее", ob_back: "Назад", ob_finish: "Готово",
  ob_q: ["Во что играешь?", "Какой у тебя ранг?", "Когда обычно играешь?", "Как любишь играть?"], ob_need_game: "Выберите хотя бы одну игру", ob_rank_hint: "Можно пропустить и указать позже в профиле.",
  ob_done: n => n ? "Готово! Нашли " + n + " " + plural(n, ["подходящего игрока", "подходящих игрока", "подходящих игроков"]) : "Готово! Профиль настроен",
  times: { morning: "Утро", day: "День", evening: "Вечер", night: "Ночь" }, days2: { wd: "Будни", we: "Выходные" }, when_play: "Когда играю", how_play: "Стиль игры",
  my_games: "Мои игры", my_games_note: "Добавьте игры, в которые хотите играть, и укажите ранг. По ним работают «Мой уровень» и подборка.", add_game: "Добавить игру", edit: "Изменить",
  no_games: "Пока нет игр. Добавьте первую.", game_saved: "Игра сохранена", game_removed: "Игра убрана из профиля", remove_game: "Убрать игру", choose_game: "Выберите игру", pref_roles: "Мои роли", rank_none_set: "ранг не указан", save: "Сохранить",
  acc_for: g => "Подтвердит ранги: " + g, acc_need_game: g => "Добавьте " + g + " в «Мои игры», чтобы подтвердить ранг",
  share: "Поделиться", share_title: "Ссылка на страницу", share_note: "Так ссылка выглядит в Discord и Telegram:", share_me: "Моя страница",
  share_player_d: (g, r) => "Ищет команду в " + g + " · " + r, share_team_d: (g, r) => "Команда " + g + " · рейтинг " + r, share_me_d: n => n + " на Stuckup: игры, ранги и контакты",
  invite_link: "По ссылке", about_title: "Stuckup — поиск тиммейтов, команд и праков", about_text: "Находи игроков своего ранга в Dota 2, CS2 (Premier и FACEIT), Valorant, League of Legends, Deadlock, Marvel Rivals, Apex Legends, PUBG, Fortnite, Standoff 2 и PUBG Mobile. Собирай стак, вступай в команду, ищи соперников на праки, проводи вето карт и следи за рейтингом команды.", about_demo: "Сейчас открыта демо-версия: игроки, команды и объявления — примеры, ответы в чате автоматические, а твои данные хранятся только в этом браузере.", invite_title: "Приглашение по ссылке", invite_stack: "Друг откроет ссылку и сразу окажется в вашем стаке.", invite_team: "Друг откроет ссылку, зарегистрируется и сразу попадёт в состав.", invite_demo: "В демо через несколько секунд «друг» перейдёт по ссылке сам.",
  joined_stack: n => n + " перешёл по ссылке и теперь в стаке", joined_team: (n, tm) => n + " вступил в " + tm + " по ссылке", friend_hi: "Я по твоей ссылке, го!",
  prem_title: "Stuckup Premium", prem_price: "199 ₽", prem_per: "в месяц · цена для демо", prem_buy: "Оформить", prem_cancel: "Отменить подписку", prem_on: "Premium подключён. В демо ничего не списывается.", prem_off: "Подписка отменена", prem_active: "Premium активен",
  prem_feats: [["Поднимайте объявление наверх", "раз в 3 часа, у всех в ленте"], ["Выделение в ленте", "рамка и пометка «продвигается»"], ["Объявление до 7 дней", "вместо 3 дней"], ["Расширенные фильтры", "репутация, неявки, время игры"], ["Значок PRO", "в профиле и объявлениях"]],
  prem_note: "Всё основное на сайте бесплатно: Premium только ускоряет поиск.", prem_need: "Это доступно в Premium", prem_more: "Подробнее", prem_7d: "7 дней",
  team_tabs: { browse: "Команды", scrims: "Праки", rating: "Рейтинг", mine: "Мои" },
  sc_slots: "Ищут соперника", sc_slots_note: "Свободные слоты команд. Забронируйте время — капитан соперника подтвердит.", sc_br: "Для королевских битв праки идут в кастомных лобби на много команд — добавим отдельно.", sc_empty: "Свободных слотов в этой игре пока нет. Откройте свой.",
  sc_book: "Забронировать", sc_need_team: g => "Чтобы играть праки в " + g + ", создайте команду или вступите в неё", sc_no_rights: "Это может капитан или менеджер", sc_requested: "Запрос отправлен. Ждём подтверждения соперника.",
  sc_new: "Открыть слот", sc_new_t: "Новый слот для прака", sc_day: "День", sc_time: "Время, МСК", sc_format: "Формат", sc_note: "Комментарий", sc_note_ph: "Например: MR12, сервер Москва", sc_created: "Слот открыт. Предложения придут в уведомления.", sc_create: "Открыть",
  today: "Сегодня", tomorrow: "Завтра", after: "Послезавтра", fmt_lbl: { bo1: "Bo1", bo2: "2 карты", bo3: "Bo3" }, fmt_lbl_nomap: { bo1: "1 игра", bo2: "2 игры", bo3: "Bo3" },
  sst: { open: "Ищем соперника", incoming: "Хотят сыграть", pending: "Ждём подтверждения", confirmed: "Подтверждён" }, res: { win: "Победа", lose: "Поражение", draw: "Ничья", ns: "Соперник не пришёл" },
  sc_accept: "Принять", sc_decline: "Отклонить", sc_cancel: "Отменить", sc_cancelled: "Прак отменён", sc_ok_n: (tm, w) => tm + " подтвердили прак · " + w, sc_in_n: (tm, w) => tm + " хотят сыграть прак · " + w, sc_soon_n: (tm, m) => "Прак с " + tm + " через " + m + " мин",
  sc_upcoming: "Ближайшие праки", sc_history: "История праков", sc_none: "Праков пока нет. Откройте слот или забронируйте чужой во вкладке «Праки».", sc_vs: "против", sc_remind: "Напомним за 30 минут", sc_maps: "Карты", sc_mine_link: "Мои праки",
  veto: "Вето карт", veto_done_lbl: "Вето готово", veto_us: "Ваш ход", veto_them: "Соперник выбирает…", veto_act: { ban: "бан", pick: "пик", dec: "решающая" }, veto_by: { us: "вы", them: "соперник" }, veto_result: "Карты на прак", veto_save: "Сохранить", veto_saved: "Карты сохранены",
  veto_pool: { cs2: "Пул карт CS2 на 2026 год.", valorant: "Рейтинговый пул Valorant, сентябрь 2026.", standoff: "Пример пула Standoff 2: в полной версии капитан настроит свой." },
  rep_t: "Отчёт о праке", rep_beh: "Соперник", beh: { ok: "Вовремя", late: "Опоздали", ns: "Не пришли" }, rep_map: n => "Карта " + n, rep_game: n => "Игра " + n, rep_we: "Мы", rep_they: "Они", rep_skip: "Не играли",
  rep_send: "Сохранить отчёт", rep_need: "Заполните хотя бы одну карту или игру", rep_saved: d => "Отчёт сохранён. Рейтинг команды: " + (d > 0 ? "+" : "") + d, rep_ns_saved: "Неявка соперника записана в его репутацию",
  rep_demo: "В демо отчёт можно заполнить сразу. В полной версии — после времени прака, а рейтинг меняется, когда отчёты обеих команд совпали.", sc_report: "Отчёт",
  lb_title: g => "Рейтинг команд · " + g, lb_note: "Рейтинг растёт за победы на праках, сильнее — за победы над сильными соперниками. «Вовремя» — доля праков, на которые команда пришла без опоздания.",
  lb_team: "Команда", lb_rating: "Рейтинг", lb_rec: "В–П–Н", lb_on: "Вовремя", lb_pick: "Выберите игру сверху, чтобы увидеть рейтинг её команд.",
  trole: { captain: "Капитан", manager: "Менеджер", coach: "Тренер", player: "Игрок", sub: "Запасной" }, perm_t: "Кто что может в команде",
  perm: { scrims: "Праки, слоты и замены", apps: "Заявки в команду", veto: "Вето и отчёты", roster: "Состав и роли" },
  roster_main: (a, b) => "Основной состав " + a + "/" + b, role_changed: "Роль изменена", leave: "Выйти из команды", left: "Вы вышли из команды",
  mine_none: "У вас пока нет команды. Создайте свою или вступите в команду во вкладке «Команды».", place_n: n => "#" + n + " в рейтинге",
  sub_find: "Найти замену", sub_t: "Поиск замены", sub_for: "На какой прак", sub_evening: "Сегодня вечером", sub_posted: "Запрос на замену опубликован в ленте", sub_cands: "Отклики на замену",
  sub_take: "Взять", sub_took: n => n + " в составе как запасной", sub_close: "Закрыть поиск", sub_wait: "ждём откликов", sub_note_ph: "Например: нужен снайпер на 2 карты, рейтинг от 15 000",
  k_scrims: "Праков сегодня", k_prem: n => n + " с Premium", tm_rating: "рейтинг", tm_record: "В–П–Н", tm_on: "вовремя", tm_place: "место",
  fill_demo: "Добавить демо-участников", fill_demo_note: "В полной версии в состав попадают только зарегистрированные игроки: по заявкам или по ссылке.", team_open_none: "Ищем игроков",
  apps_n: n => n + " " + plural(n, ["заявка", "заявки", "заявок"]), team_full2: "Состав полный", my_scrims: "Праки команды",
});
Object.assign(T.en, {
  demo_line: "Demo: players, teams and listings are examples, chat replies are automatic. Your data stays in this browser only.",
  q_more: "More", f_more: "More", f_prem: "Premium filters", q_rep90: "Reputation 90%+", q_nons: "No no-shows", q_sametime: "Play when I do",
  need_short: n => "need " + n, promo: "promoted", sub_tag: "Looking for a sub", sub_title: tg => "[" + tg + "] needs a sub", sub_role: r => "role: " + r,
  sub_respond: "Respond", sub_responded: "Response sent", sub_taken: (tm, w) => tm + " picked you as a sub · " + w, sub_resp_n: n => n + " response" + (n === 1 ? "" : "s"),
  bump: "Bump", bumped: "Listing bumped to the top of the feed", bump_wait: m => "You can bump again in " + m + " min",
  picks: "Good matches for you", picks_why: { rank: "your level", style: "your style", time: "your hours", lang: "your language" },
  ob_cta: "Take the quick start: 4 questions and we'll show players at your level.", ob_go: "Start", ob_title: "Quick start", ob_skip: "Skip", ob_next: "Next", ob_back: "Back", ob_finish: "Done",
  ob_q: ["What do you play?", "What's your rank?", "When do you usually play?", "How do you like to play?"], ob_need_game: "Pick at least one game", ob_rank_hint: "You can skip this and add it later in your profile.",
  ob_done: n => n ? "Done! Found " + n + " matching player" + (n === 1 ? "" : "s") : "Done! Profile set up",
  times: { morning: "Morning", day: "Day", evening: "Evening", night: "Night" }, days2: { wd: "Weekdays", we: "Weekends" }, when_play: "When I play", how_play: "Play style",
  my_games: "My games", my_games_note: "Add the games you want to play and set your rank. “My level” and your matches use them.", add_game: "Add game", edit: "Edit",
  no_games: "No games yet. Add your first one.", game_saved: "Game saved", game_removed: "Game removed from your profile", remove_game: "Remove game", choose_game: "Choose a game", pref_roles: "My roles", rank_none_set: "rank not set", save: "Save",
  acc_for: g => "Verifies ranks: " + g, acc_need_game: g => "Add " + g + " to “My games” to verify your rank",
  share: "Share", share_title: "Page link", share_note: "This is how the link looks in Discord and Telegram:", share_me: "My page",
  share_player_d: (g, r) => "Looking for a team in " + g + " · " + r, share_team_d: (g, r) => g + " team · rating " + r, share_me_d: n => n + " on Stuckup: games, ranks and contacts",
  invite_link: "Invite link", about_title: "Stuckup — find teammates, teams and scrims", about_text: "Find players of your rank in Dota 2, CS2 (Premier and FACEIT), Valorant, League of Legends, Deadlock, Marvel Rivals, Apex Legends, PUBG, Fortnite, Standoff 2 and PUBG Mobile. Build a stack, join a team, find scrim opponents, run map veto and track your team rating.", about_demo: "This is a demo: players, teams and listings are examples, chat replies are automatic, and your data stays in this browser only.", invite_title: "Invite by link", invite_stack: "Your friend opens the link and lands straight in your stack.", invite_team: "Your friend opens the link, signs up and joins the roster.", invite_demo: "In the demo a “friend” follows the link by themselves in a few seconds.",
  joined_stack: n => n + " joined your stack via the link", joined_team: (n, tm) => n + " joined " + tm + " via the link", friend_hi: "Came from your link, let's go!",
  prem_title: "Stuckup Premium", prem_price: "$2.99", prem_per: "per month · demo price", prem_buy: "Subscribe", prem_cancel: "Cancel subscription", prem_on: "Premium is on. Nothing is charged in the demo.", prem_off: "Subscription cancelled", prem_active: "Premium is active",
  prem_feats: [["Bump your listing to the top", "every 3 hours, for everyone"], ["Highlight in the feed", "a frame and a “promoted” label"], ["Listings up to 7 days", "instead of 3 days"], ["Advanced filters", "reputation, no-shows, play hours"], ["PRO badge", "on your profile and listings"]],
  prem_note: "Everything essential is free: Premium only speeds things up.", prem_need: "Available with Premium", prem_more: "Details", prem_7d: "7 days",
  team_tabs: { browse: "Teams", scrims: "Scrims", rating: "Rating", mine: "Mine" },
  sc_slots: "Looking for opponents", sc_slots_note: "Open slots from teams. Book a time and the opposing captain confirms.", sc_br: "Battle royale scrims run in custom lobbies with many teams — coming separately.", sc_empty: "No open slots for this game yet. Open your own.",
  sc_book: "Book", sc_need_team: g => "To play scrims in " + g + ", create or join a team", sc_no_rights: "Only the captain or manager can do this", sc_requested: "Request sent. Waiting for the opponent to confirm.",
  sc_new: "Open a slot", sc_new_t: "New scrim slot", sc_day: "Day", sc_time: "Time, Moscow", sc_format: "Format", sc_note: "Comment", sc_note_ph: "E.g. MR12, Moscow server", sc_created: "Slot opened. Offers will arrive in notifications.", sc_create: "Open",
  today: "Today", tomorrow: "Tomorrow", after: "In 2 days", fmt_lbl: { bo1: "Bo1", bo2: "2 maps", bo3: "Bo3" }, fmt_lbl_nomap: { bo1: "1 game", bo2: "2 games", bo3: "Bo3" },
  sst: { open: "Looking for opponent", incoming: "Wants to play", pending: "Awaiting confirmation", confirmed: "Confirmed" }, res: { win: "Win", lose: "Loss", draw: "Draw", ns: "Opponent no-show" },
  sc_accept: "Accept", sc_decline: "Decline", sc_cancel: "Cancel", sc_cancelled: "Scrim cancelled", sc_ok_n: (tm, w) => tm + " confirmed the scrim · " + w, sc_in_n: (tm, w) => tm + " want to scrim · " + w, sc_soon_n: (tm, m) => "Scrim vs " + tm + " in " + m + " min",
  sc_upcoming: "Upcoming scrims", sc_history: "Scrim history", sc_none: "No scrims yet. Open a slot or book one in the “Scrims” tab.", sc_vs: "vs", sc_remind: "Reminder 30 minutes before", sc_maps: "Maps", sc_mine_link: "My scrims",
  veto: "Map veto", veto_done_lbl: "Veto done", veto_us: "Your turn", veto_them: "Opponent is choosing…", veto_act: { ban: "ban", pick: "pick", dec: "decider" }, veto_by: { us: "you", them: "opponent" }, veto_result: "Scrim maps", veto_save: "Save", veto_saved: "Maps saved",
  veto_pool: { cs2: "CS2 map pool for 2026.", valorant: "Valorant ranked pool, September 2026.", standoff: "Sample Standoff 2 pool: in the full version captains set their own." },
  rep_t: "Scrim report", rep_beh: "Opponent", beh: { ok: "On time", late: "Late", ns: "No-show" }, rep_map: n => "Map " + n, rep_game: n => "Game " + n, rep_we: "Us", rep_they: "Them", rep_skip: "Not played",
  rep_send: "Save report", rep_need: "Fill in at least one map or game", rep_saved: d => "Report saved. Team rating: " + (d > 0 ? "+" : "") + d, rep_ns_saved: "Opponent's no-show recorded in their reputation",
  rep_demo: "In the demo you can file the report right away. In the full version it opens after the scrim time and rating changes once both teams' reports match.", sc_report: "Report",
  lb_title: g => "Team rating · " + g, lb_note: "Rating grows with scrim wins, more so against stronger opponents. “On time” is the share of scrims the team showed up for without being late.",
  lb_team: "Team", lb_rating: "Rating", lb_rec: "W–L–D", lb_on: "On time", lb_pick: "Pick a game above to see its team rating.",
  trole: { captain: "Captain", manager: "Manager", coach: "Coach", player: "Player", sub: "Sub" }, perm_t: "Who can do what",
  perm: { scrims: "Scrims, slots and subs", apps: "Team applications", veto: "Veto and reports", roster: "Roster and roles" },
  roster_main: (a, b) => "Main roster " + a + "/" + b, role_changed: "Role changed", leave: "Leave team", left: "You left the team",
  mine_none: "You don't have a team yet. Create one or join a team in the “Teams” tab.", place_n: n => "#" + n + " in rating",
  sub_find: "Find a sub", sub_t: "Find a sub", sub_for: "For which scrim", sub_evening: "Tonight", sub_posted: "Sub request posted to the feed", sub_cands: "Sub responses",
  sub_take: "Pick", sub_took: n => n + " joined the roster as a sub", sub_close: "Close search", sub_wait: "waiting for responses", sub_note_ph: "E.g. need an AWPer for 2 maps, 15,000+ rating",
  k_scrims: "Scrims today", k_prem: n => n + " on Premium", tm_rating: "rating", tm_record: "W–L–D", tm_on: "on time", tm_place: "place",
  fill_demo: "Add demo members", fill_demo_note: "In the full version only registered players join a roster: via applications or a link.", team_open_none: "Looking for players",
  apps_n: n => n + " application" + (n === 1 ? "" : "s"), team_full2: "Roster full", my_scrims: "Team scrims",
});

/* ================= games & rank systems ================= */
const DURS = [60, 180, 720, 1440, 2880];
const GAME_KEYS = ["dota", "cs2", "valorant", "lol", "deadlock", "rivals", "apex", "pubg", "fortnite", "standoff", "pubgm"];
const SHOOTER_ROLES = { entry: ["Энтри", "Entry"], awp: ["Снайпер", "AWPer"], support: ["Саппорт", "Support"], lurker: ["Люркер", "Lurker"], igl: ["IGL", "IGL"] };
const BR_ROLES = { fragger: ["Фраггер", "Fragger"], sniper: ["Снайпер", "Sniper"], support: ["Саппорт", "Support"], igl: ["IGL", "IGL"], driver: ["Водитель", "Driver"] };
const GAMES = {
  dota: { name: "Dota 2", size: 5, plat: "Steam", color: "--g-dota", systems: ["medal"], kind: "moba", fav: "heroes", api: "OpenDota",
    pool: ["Pudge", "Invoker", "Juggernaut", "Crystal Maiden", "Shadow Fiend", "Lion", "Earthshaker", "Phantom Assassin", "Storm Spirit", "Puck", "Ember Spirit", "Witch Doctor", "Tinker", "Mars", "Axe"],
    modes: { ranked: ["Рейтинг", "Ranked"], normal: ["Обычная", "Unranked"], turbo: ["Турбо", "Turbo"] }, msize: {}, sysOf: () => "medal",
    roles: { pos1: ["1 · Керри", "1 · Carry"], pos2: ["2 · Мид", "2 · Mid"], pos3: ["3 · Оффлейн", "3 · Offlane"], pos4: ["4 · Роумер", "4 · Soft support"], pos5: ["5 · Фулл-саппорт", "5 · Hard support"] } },
  cs2: { name: "CS2", size: 5, plat: "Steam", color: "--g-cs2", systems: ["premier", "faceit", "comp"], kind: "shooter", fav: "maps", api: "FACEIT",
    pool: ["Mirage", "Inferno", "Nuke", "Ancient", "Anubis", "Dust II", "Overpass"],
    modes: { premier: ["Premier", "Premier"], faceit: ["FACEIT", "FACEIT"], comp: ["Соревновательный", "Competitive"], wingman: ["Напарники", "Wingman"] }, msize: { wingman: 2 },
    sysOf: m => (m === "faceit" ? "faceit" : m === "premier" ? "premier" : "comp"), roles: SHOOTER_ROLES },
  valorant: { name: "Valorant", size: 5, plat: "Riot ID", color: "--g-val", systems: ["val"], kind: "shooter", fav: "agents", api: "Riot API",
    pool: ["Jett", "Sage", "Omen", "Sova", "Reyna", "Killjoy", "Raze", "Clove", "Fade"],
    modes: { comp: ["Рейтинг", "Competitive"], unrated: ["Без рейтинга", "Unrated"], swift: ["Свифтплей", "Swiftplay"] }, msize: {}, sysOf: () => "val",
    roles: { duelist: ["Дуэлянт", "Duelist"], initiator: ["Инициатор", "Initiator"], controller: ["Контроллер", "Controller"], sentinel: ["Страж", "Sentinel"] } },
  lol: { name: "League of Legends", short: "LoL", size: 5, plat: "Riot ID", color: "--g-lol", systems: ["lol"], kind: "moba", fav: "champs", api: "Riot API",
    pool: ["Ahri", "Lee Sin", "Jinx", "Thresh", "Yasuo", "Lux", "Darius", "Kai'Sa"],
    modes: { solo: ["Одиночная/парная", "Solo/Duo"], flex: ["Гибкая", "Flex"], aram: ["ARAM", "ARAM"], normal: ["Обычная", "Normal"] }, msize: { solo: 2 }, sysOf: () => "lol",
    roles: { top: ["Топ", "Top"], jungle: ["Лес", "Jungle"], mid: ["Мид", "Mid"], adc: ["Стрелок", "Bot"], support: ["Поддержка", "Support"] } },
  deadlock: { name: "Deadlock", size: 6, plat: "Steam", color: "--g-dl", systems: ["dl"], kind: "moba", fav: "heroes", api: "Deadlock API",
    pool: ["Haze", "Infernus", "Seven", "Vindicta", "Lady Geist", "Abrams", "McGinnis", "Dynamo"],
    modes: { ranked: ["Рейтинг", "Ranked"], standard: ["Обычная", "Standard"] }, msize: { ranked: 2 }, sysOf: () => "dl",
    roles: { carry: ["Керри", "Carry"], support: ["Саппорт", "Support"], tank: ["Танк", "Tank"], ganker: ["Ганкер", "Ganker"] } },
  rivals: { name: "Marvel Rivals", short: "Rivals", size: 6, plat: "Steam", color: "--g-rv", systems: ["rv"], kind: "moba", fav: "heroes", api: null,
    pool: ["Loki", "Mantis", "Luna Snow", "Magneto", "Doctor Strange", "Spider-Man", "Hela"],
    modes: { comp: ["Соревновательный", "Competitive"], quick: ["Быстрая игра", "Quick Match"] }, msize: {}, sysOf: () => "rv",
    roles: { vanguard: ["Авангард", "Vanguard"], duelist: ["Дуэлянт", "Duelist"], strategist: ["Стратег", "Strategist"] } },
  apex: { name: "Apex Legends", short: "Apex", size: 3, plat: "EA", color: "--g-apex", systems: ["apex"], kind: "br", fav: "legends", api: null,
    pool: ["Wraith", "Bloodhound", "Pathfinder", "Lifeline", "Octane", "Bangalore"],
    modes: { ranked: ["Рейтинг", "Ranked"], trios: ["Трио", "Trios"], duos: ["Дуо", "Duos"] }, msize: { duos: 2 }, sysOf: () => "apex",
    roles: { assault: ["Штурмовик", "Assault"], skirmisher: ["Налётчик", "Skirmisher"], recon: ["Разведчик", "Recon"], support: ["Поддержка", "Support"], controller: ["Контроллер", "Controller"] } },
  pubg: { name: "PUBG", size: 4, plat: "Steam", color: "--g-pubg", systems: ["pubg"], kind: "br", fav: "maps", api: "PUBG API",
    pool: ["Erangel", "Miramar", "Taego", "Vikendi", "Deston"],
    modes: { rsquad: ["Рейтинг · сквад", "Ranked squad"], rduo: ["Рейтинг · дуо", "Ranked duo"], normal: ["Обычные", "Normal"] }, msize: { rduo: 2 }, sysOf: () => "pubg", roles: BR_ROLES },
  fortnite: { name: "Fortnite", size: 4, plat: "Epic Games", color: "--g-fortnite", systems: ["fn"], kind: "br", fav: "modes", api: null,
    pool: ["Battle Royale", "Zero Build", "Reload"],
    modes: { rsquad: ["Рейтинг · сквад", "Ranked squads"], rduo: ["Рейтинг · дуо", "Ranked duos"], zb: ["Zero Build", "Zero Build"], reload: ["Reload", "Reload"] }, msize: { rduo: 2 }, sysOf: () => "fn",
    roles: { builder: ["Билдер", "Builder"], fragger: ["Фраггер", "Fragger"], igl: ["IGL", "IGL"], support: ["Саппорт", "Support"] } },
  standoff: { name: "Standoff 2", size: 5, plat: "Standoff 2", color: "--g-so", systems: ["so"], kind: "shooter", fav: "maps", api: null, mobile: true,
    pool: ["Sandstone", "Province", "Rust", "Zone 9", "Sakura", "Breeze"],
    modes: { comp: ["Соревновательный", "Competitive"], allies: ["Союзники 2×2", "Allies 2v2"] }, msize: { allies: 2 }, sysOf: () => "so", roles: SHOOTER_ROLES },
  pubgm: { name: "PUBG Mobile", short: "PUBG M", size: 4, plat: "PUBG Mobile", color: "--g-pm", systems: ["pm"], kind: "br", fav: "maps", api: null, mobile: true,
    pool: ["Erangel", "Miramar", "Sanhok", "Livik", "Vikendi"],
    modes: { rsquad: ["Рейтинг · сквад", "Ranked squad"], rduo: ["Рейтинг · дуо", "Ranked duo"], normal: ["Обычные", "Classic"] }, msize: { rduo: 2 }, sysOf: () => "pm", roles: BR_ROLES }
};
const ACC = { steam: { name: "Steam", logo: "ST", sys: ["medal", "dl"], games: ["dota", "deadlock"] }, faceit: { name: "FACEIT", logo: "FC", sys: ["faceit"], games: ["cs2"] },
  riot: { name: "Riot Games", logo: "RG", sys: ["val", "lol"], games: ["valorant", "lol"] }, pubg: { name: "PUBG", logo: "PB", sys: ["pubg"], games: ["pubg"] } };
const IMPORT = { medal: { sys: "medal", t: 4, s: 2 }, dl: { sys: "dl", t: 5, s: 3 }, faceit: { sys: "faceit", elo: 1480 }, val: { sys: "val", t: 3, s: 3 }, lol: { sys: "lol", t: 3, s: 2 }, pubg: { sys: "pubg", t: 3, s: 2 } };
const SYS = {
  medal: { label: ["Медаль", "Medal"], kind: "tiers", subs: 5, subMin: 0, subTop: 6, subStyle: "stars", subDef: 1, via: "steam", src: "OpenDota",
    tiers: { ru: ["Рекрут", "Страж", "Рыцарь", "Герой", "Легенда", "Властелин", "Божество", "Титан"], en: ["Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"] },
    colors: ["--tb", "--ts", "--tcr", "--tg", "--tlg", "--td", "--tm", "--tim"] },
  premier: { label: ["Premier", "Premier"], kind: "rating", bands: [0, 5000, 10000, 15000, 20000, 25000, 30000], colors: ["--pr0", "--pr1", "--pr2", "--pr3", "--pr4", "--pr5", "--pr6"], via: null },
  faceit: { label: ["FACEIT", "FACEIT"], kind: "faceit", mins: [100, 501, 751, 901, 1051, 1201, 1351, 1531, 1751, 2001], via: "faceit", src: "FACEIT" },
  comp: { label: ["Звание", "Skill group"], kind: "tiers", subs: 0, via: null,
    tiers: { ru: ["Серебро I", "Серебро II", "Серебро III", "Серебро IV", "Серебро — элита", "Серебро — великий магистр", "Золотая звезда I", "Золотая звезда II", "Золотая звезда III", "Золотая звезда — магистр", "Магистр-хранитель I", "Магистр-хранитель II", "Магистр-хранитель — элита", "Заслуженный магистр-хранитель", "Легендарный беркут", "Легендарный беркут-магистр", "Великий магистр высшего ранга", "Всемирная элита"],
             en: ["Silver I", "Silver II", "Silver III", "Silver IV", "Silver Elite", "Silver Elite Master", "Gold Nova I", "Gold Nova II", "Gold Nova III", "Gold Nova Master", "Master Guardian I", "Master Guardian II", "Master Guardian Elite", "Distinguished Master Guardian", "Legendary Eagle", "Legendary Eagle Master", "Supreme Master First Class", "The Global Elite"] },
    short: ["S1", "S2", "S3", "S4", "SE", "SEM", "GN1", "GN2", "GN3", "GNM", "MG1", "MG2", "MGE", "DMG", "LE", "LEM", "SMFC", "GE"],
    colors: ["--ts", "--ts", "--ts", "--ts", "--ts", "--ts", "--tg", "--tg", "--tg", "--tg", "--tp", "--tp", "--tp", "--tp", "--td", "--td", "--tm", "--tim"] },
  val: { label: ["Ранг", "Rank"], kind: "tiers", subs: 3, subMin: 0, subTop: 7, subStyle: "num", subDef: 1, via: "riot", src: "Riot API",
    tiers: { ru: ["Железо", "Бронза", "Серебро", "Золото", "Платина", "Алмаз", "Расцвет", "Бессмертие", "Радиант"], en: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"] },
    colors: ["--pr0", "--tb", "--ts", "--tg", "--tp", "--tm", "--tcr", "--tim", "--pr6"] },
  lol: { label: ["Ранг", "Rank"], kind: "tiers", subs: 4, subMin: 0, subTop: 6, subStyle: "roman-desc", subDef: 4, via: "riot", src: "Riot API",
    tiers: { ru: ["Железо", "Бронза", "Серебро", "Золото", "Платина", "Изумруд", "Алмаз", "Мастер", "Грандмастер", "Претендент"], en: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"] },
    colors: ["--pr0", "--tb", "--ts", "--tg", "--tp", "--tcr", "--td", "--tm", "--tim", "--pr6"] },
  dl: { label: ["Ранг", "Rank"], kind: "tiers", subs: 6, subMin: 0, subTop: 10, subStyle: "roman", subDef: 1, via: "steam", src: "Deadlock API",
    tiers: { ru: ["Initiate", "Seeker", "Acolyte", "Sentinel", "Mystic", "Ritualist", "Emissary", "Oracle", "Phantom", "Ascendant", "Eternus"], en: ["Initiate", "Seeker", "Acolyte", "Sentinel", "Mystic", "Ritualist", "Emissary", "Oracle", "Phantom", "Ascendant", "Eternus"] },
    colors: ["--tb", "--ts", "--tcr", "--tg", "--tp", "--tc", "--td", "--te", "--tm", "--tch", "--tim"] },
  rv: { label: ["Ранг", "Rank"], kind: "tiers", subs: 3, subMin: 0, subTop: 6, subStyle: "roman-desc", subDef: 3, via: null,
    tiers: { ru: ["Бронза", "Серебро", "Золото", "Платина", "Алмаз", "Грандмастер", "Celestial", "Eternity", "One Above All"], en: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Grandmaster", "Celestial", "Eternity", "One Above All"] },
    colors: ["--tb", "--ts", "--tg", "--tp", "--td", "--tm", "--tc", "--tim", "--pr6"] },
  apex: { label: ["Ранг", "Rank"], kind: "tiers", subs: 4, subMin: 1, subTop: 5, subStyle: "roman-desc", subDef: 4, via: null,
    tiers: { ru: ["Новичок", "Бронза", "Серебро", "Золото", "Платина", "Алмаз", "Мастер", "Apex Predator"], en: ["Rookie", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Apex Predator"] },
    colors: ["--pr0", "--tb", "--ts", "--tg", "--tp", "--td", "--tm", "--tim"] },
  pubg: { label: ["Ранг", "Tier"], kind: "tiers", subs: 4, subMin: 0, subTop: 5, subStyle: "roman-desc", subDef: 4, via: "pubg", src: "PUBG API",
    tiers: { ru: ["Бронза", "Серебро", "Золото", "Платина", "Кристалл", "Алмаз", "Мастер", "Survivor"], en: ["Bronze", "Silver", "Gold", "Platinum", "Crystal", "Diamond", "Master", "Survivor"] },
    colors: ["--tb", "--ts", "--tg", "--tp", "--tc", "--td", "--tm", "--tu"] },
  fn: { label: ["Ранг", "Rank"], kind: "tiers", subs: 3, subMin: 0, subTop: 4, subStyle: "roman", subDef: 1, via: null,
    tiers: { ru: ["Бронза", "Серебро", "Золото", "Платина", "Алмаз", "Элита", "Чемпион", "Unreal"], en: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Elite", "Champion", "Unreal"] },
    colors: ["--tb", "--ts", "--tg", "--tp", "--td", "--te", "--tch", "--tu"] },
  so: { label: ["Ранг", "Rank"], kind: "tiers", subs: 4, subMin: 0, subTop: 2, subStyle: "roman", subDef: 1, via: null,
    tiers: { ru: ["Бронза", "Серебро", "Золото", "Платина", "Алмаз", "Мастер", "Элита", "Легенда", "Мифический"], en: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Elite", "Legend", "Mythic"] },
    colors: ["--tb", "--ts", "--tg", "--tp", "--td", "--tm", "--te", "--tch", "--tim"] },
  pm: { label: ["Ранг", "Tier"], kind: "tiers", subs: 5, subMin: 0, subTop: 5, subStyle: "roman-desc", subDef: 5, via: null,
    tiers: { ru: ["Бронза", "Серебро", "Золото", "Платина", "Алмаз", "Корона", "Ас", "Ас-мастер", "Ас-доминатор", "Завоеватель"], en: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Crown", "Ace", "Ace Master", "Ace Dominator", "Conqueror"] },
    colors: ["--tb", "--ts", "--tg", "--tp", "--td", "--tc", "--tch", "--tm", "--tim", "--pr6"] }
};
const SYS_GAME = { medal: "dota", premier: "cs2", faceit: "cs2", comp: "cs2", val: "valorant", lol: "lol", dl: "deadlock", rv: "rivals", apex: "apex", pubg: "pubg", fn: "fortnite", so: "standoff", pm: "pubgm" };
const REGIONS = { ru: ["Россия", "Russia"], eue: ["Европа · восток", "EU East"], euw: ["Европа · запад", "EU West"], asia: ["Азия", "Asia"], na: ["Сев. Америка", "North America"] };
const STYLES = ["fun", "serious", "train"];
const STAGS = ["adult", "nomat", "newbie", "women", "men"];
const SAFE_TAGS = ["adult", "nomat", "newbie"], PARTY_TAGS = ["women", "men"];
const REP_POS = ["kind", "comms", "skill", "leader", "punctual"];
const REP_NEG = ["toxic", "rage"];

/* ---- v4 constants ---- */
const SCRIM_GAMES = ["cs2", "valorant", "dota", "lol", "deadlock", "rivals", "standoff"];
const MAPS = { cs2: ["Mirage", "Inferno", "Nuke", "Ancient", "Anubis", "Dust II", "Overpass"], valorant: ["Abyss", "Ascent", "Haven", "Lotus", "Split", "Summit", "Sunset"], standoff: ["Sandstone", "Province", "Rust", "Zone 9", "Sakura", "Breeze", "Dune"] };
const FORMATS = { bo1: 1, bo2: 2, bo3: 3 };
const VETO_SEQ = { bo1: ["ban", "ban", "ban", "ban", "ban", "ban", "dec"], bo2: ["ban", "ban", "pick", "pick"], bo3: ["ban", "ban", "pick", "pick", "ban", "ban", "dec"] };
const TROLES = ["captain", "manager", "coach", "player", "sub"];
const PERMS = { scrims: ["captain", "manager"], apps: ["captain", "manager"], veto: ["captain", "manager", "coach"], roster: ["captain"] };
const TIMES = ["morning", "day", "evening", "night"];
const PREM_DUR = 10080;
const NICKS = ["Ares", "Borsch", "Clutchy", "Dyadya_Fedor", "Eagle_Eye", "Frost", "Gorynych", "Hype", "Ice_Tea", "Jager", "Kvas", "Leshiy", "Mamba", "Nevsky", "Orbita", "Pelmen", "Quake", "Ryzhy", "Sever", "Taiga", "Ural_Wolf", "Vortex", "Yasha", "Zubr", "Baikal", "Kedr", "Lynx", "Sokol", "Tundra_K", "Volna"];
const FRIEND_NICKS = ["Lyoha_Friend", "Masha_gg", "Dimas_228", "Zheka_Pro", "Nastya_Smoke", "Tolik_Ace"];
function atTime(dayOff, h, m) { const d = new Date(); d.setDate(d.getDate() + dayOff); d.setHours(h, m, 0, 0); return d.getTime(); }
function nextAt(h, m) { let ts = atTime(0, h, m); if (ts < Date.now() + 15 * 60000) ts = atTime(1, h, m); return ts; }
function dayLabel(ts) { const d0 = new Date(); d0.setHours(0, 0, 0, 0); const diff = Math.floor((ts - d0.getTime()) / 864e5); return diff === 0 ? t("today") : diff === 1 ? t("tomorrow") : diff === 2 ? t("after") : dateStr(ts); }
function whenLabel(ts) { return dayLabel(ts) + " " + clock(ts); }
function overlap(a, b) { return !!(a && b && a.some(x => b.includes(x))); }

/* ================= demo players ================= */
const NOW0 = Date.now();
const SEED = [
  { id: "p1", nick: "kolobok_pos5", game: "dota", mode: "ranked", r: { sys: "medal", t: 4, s: 3 }, roles: ["pos4", "pos5"], have: 2, region: "ru", langs: ["ru"], mic: true, on: true, ago: 6, dur: 180, ver: true, c: { dc: "kolobok_pos5", tg: "kolobok_dota" }, cvis: "all",
    style: "fun", stags: ["nomat"], rep: { up: 46, n: 50, ns: 1, tags: ["kind", "comms"] },
    note: { ru: "Нас двое (4 и 5), ищем керри, мида и оффлейнера на вечер. Без токсика, с 19:00 по Москве.", en: "Two of us (pos 4 and 5), looking for carry, mid and offlane tonight. No toxicity, from 19:00 Moscow time." } },
  { id: "p15", nick: "Grom_GE", game: "cs2", mode: "premier", r: { sys: "premier", v: 31250 }, extra: [{ sys: "faceit", elo: 2780 }], roles: ["entry", "igl"], have: 4, region: "ru", langs: ["ru", "en"], mic: true, on: true, game_on: true, ago: 4, dur: 60, ver: false, c: { dc: "grom.ge" }, cvis: "chat",
    style: "serious", stags: ["adult"], rep: { up: 88, n: 94, ns: 0, tags: ["skill", "leader"] },
    note: { ru: "Нужен пятый на вечер, рейтинг от 28 000. Перед игрой разминаемся и учим раскидки.", en: "Need a fifth tonight, 28,000+ rating. We warm up and practice utility before games." } },
  { id: "va1", nick: "Kira_Sage", game: "valorant", mode: "comp", r: { sys: "val", t: 4, s: 2 }, roles: ["sentinel", "controller"], have: 3, region: "ru", langs: ["ru", "en"], mic: true, on: true, ago: 8, dur: 180, ver: true, c: { dc: "kira.sage" }, cvis: "all",
    style: "serious", stags: ["adult", "nomat"], rep: { up: 31, n: 33, ns: 0, tags: ["comms", "kind"] },
    note: { ru: "Нас трое, нужны дуэлянт и инициатор. Играем вечером, связь обязательна.", en: "Three of us, need a duelist and an initiator. Evening games, comms required." } },
  { id: "p2", nick: "Sh4dowFiend", game: "dota", mode: "ranked", r: { sys: "medal", t: 6, s: 1 }, roles: ["pos2"], have: 1, region: "euw", langs: ["ru", "en"], mic: true, on: true, game_on: true, ago: 14, dur: 720, ver: true, c: { dc: "sh4dowfiend" }, cvis: "chat",
    style: "serious", stags: [], rep: { up: 61, n: 70, ns: 2, tags: ["skill"] },
    note: { ru: "Мид, нужен стак в рейтинг. Пул: Storm Spirit, Puck, Ember Spirit.", en: "Mid, need a ranked stack. Pool: Storm Spirit, Puck, Ember Spirit." } },
  { id: "p6", nick: "Vovan_AWP", game: "cs2", mode: "premier", r: { sys: "premier", v: 18450 }, extra: [{ sys: "faceit", elo: 1620 }], roles: ["awp"], have: 3, region: "ru", langs: ["ru"], mic: true, on: true, ago: 9, dur: 180, ver: true, c: { dc: "vovan.awp", tg: "vovan_awp" }, cvis: "chat",
    style: "fun", stags: [], rep: { up: 24, n: 27, ns: 1, tags: ["kind", "punctual"] },
    note: { ru: "Нас трое в Premier, ищем энтри и саппорта. Вечером, 3–4 карты.", en: "Three of us in Premier, looking for entry and support. Evenings, 3–4 maps." } },
  { id: "rv1", nick: "Loki_Strat", game: "rivals", mode: "comp", r: { sys: "rv", t: 4, s: 2 }, roles: ["strategist"], have: 4, region: "ru", langs: ["ru"], mic: true, on: true, ago: 11, dur: 720, ver: false, cvis: "all",
    style: "serious", stags: ["adult"], rep: { up: 12, n: 14, ns: 0, tags: ["leader"] },
    note: { ru: "Стак на соревновательный, нужны авангард и дуэлянт. Стратегов хватает.", en: "Competitive stack, need a vanguard and a duelist. We have strategists." } },
  { id: "p8", nick: "kostet", game: "cs2", mode: "faceit", r: { sys: "faceit", elo: 2140 }, extra: [{ sys: "premier", v: 24100 }], roles: ["igl"], have: 2, region: "ru", langs: ["ru"], mic: true, on: true, ago: 21, dur: 1440, ver: true, c: { tg: "kostet_igl" }, cvis: "stack",
    style: "train", stags: ["adult", "nomat"], rep: { up: 57, n: 58, ns: 0, tags: ["leader", "punctual"] },
    note: { ru: "Капитан. Собираю дисциплинированный стак на турниры выходного дня, по будням тренировки.", en: "IGL building a disciplined stack for weekend tournaments, practice on weekdays." } },
  { id: "so1", nick: "Mobile_Legenda", game: "standoff", mode: "comp", r: { sys: "so", t: 5 }, roles: ["awp"], have: 3, region: "ru", langs: ["ru"], mic: true, on: true, ago: 5, dur: 180, ver: false, c: { dc: "mobile.legenda" }, cvis: "all",
    style: "serious", stags: ["nomat"], rep: { up: 19, n: 22, ns: 1, tags: ["skill"] },
    note: { ru: "Ищем двоих в соревновательный, Мастер и выше. Играем с телефонов, связь в Discord.", en: "Looking for two for Competitive, Master and up. We play on phones, comms in Discord." } },
  { id: "p9", nick: "hanzo_eu", game: "cs2", mode: "comp", r: { sys: "comp", t: 8 }, roles: ["entry"], have: 1, region: "euw", langs: ["en"], mic: false, on: true, ago: 178.6, dur: 180, ver: false,
    style: "fun", stags: [], rep: { up: 3, n: 5, ns: 1, tags: [] },
    note: { ru: "Играю соревновательный на Mirage и Inferno, ищу напарника.", en: "Playing Competitive on Mirage and Inferno, looking for a partner." } },
  { id: "lo1", nick: "Mid_or_feed", game: "lol", mode: "flex", r: { sys: "lol", t: 5, s: 2 }, roles: ["mid", "jungle"], have: 2, region: "eue", langs: ["ru", "en"], mic: true, on: true, ago: 16, dur: 720, ver: true, cvis: "all", c: { dc: "mid.or.feed" },
    style: "serious", stags: [], rep: { up: 40, n: 47, ns: 1, tags: ["comms"] },
    note: { ru: "Гибкая очередь, нужны топ и поддержка. Сервер EUNE.", en: "Flex queue, need top and support. EUNE server." } },
  { id: "p11", nick: "Sasha_Drop", game: "pubg", mode: "rsquad", r: { sys: "pubg", t: 5, s: 2 }, roles: ["sniper"], have: 2, region: "ru", langs: ["ru"], mic: true, on: true, ago: 12, dur: 180, ver: true, c: { dc: "sasha_drop" }, cvis: "all",
    style: "serious", stags: ["women"], rep: { up: 22, n: 23, ns: 0, tags: ["kind", "comms"] },
    note: { ru: "Женский сквад, FPP. Нужна капитан, которая вызывает ротации.", en: "Women's squad, FPP. Need an IGL who calls rotations." } },
  { id: "ap1", nick: "WraithRunner", game: "apex", mode: "ranked", r: { sys: "apex", t: 4, s: 3 }, roles: ["skirmisher"], have: 2, region: "euw", langs: ["en"], mic: true, on: true, ago: 19, dur: 180, ver: false,
    style: "serious", stags: [], rep: { up: 9, n: 10, ns: 0, tags: ["skill"] },
    note: { ru: "Нужен третий в рейтинг, лобби Платины. Лучше разведчик или контроллер.", en: "Need a third for ranked, Platinum lobby. Recon or controller preferred." } },
  { id: "p13", nick: "pixel_kot", game: "fortnite", mode: "rduo", r: { sys: "fn", t: 5 }, roles: ["builder"], have: 1, region: "eue", langs: ["ru"], mic: true, on: true, ago: 7, dur: 720, ver: false, c: { tg: "pixel_kot_fn" }, cvis: "all",
    style: "train", stags: [], rep: { up: 15, n: 18, ns: 2, tags: [] },
    note: { ru: "Ищу дуо в рейтинг со строительством, играю от 14 часов в неделю.", en: "Looking for a ranked duo with building, I play 14+ hours a week." } },
  { id: "dl1", nick: "Haze_Hunter", game: "deadlock", mode: "ranked", r: { sys: "dl", t: 6, s: 4 }, roles: ["carry"], have: 1, region: "eue", langs: ["en", "ru"], mic: true, on: true, game_on: true, ago: 13, dur: 180, ver: true,
    style: "fun", stags: [], rep: { up: 7, n: 8, ns: 0, tags: ["kind"] },
    note: { ru: "Ищу напарника в рейтинг: там можно играть максимум вдвоём.", en: "Looking for a ranked partner: ranked allows two players per party." } },
  { id: "p14", nick: "Lia_ZB", game: "fortnite", mode: "zb", r: { sys: "fn", t: 4, s: 2 }, roles: ["igl", "support"], have: 3, region: "euw", langs: ["en", "ru"], mic: true, on: true, ago: 25, dur: 1440, ver: false, c: { dc: "lia.zb" }, cvis: "all",
    style: "fun", stags: ["newbie"], rep: { up: 28, n: 29, ns: 0, tags: ["kind", "comms"] },
    note: { ru: "Трио в Zero Build, нужен ещё один. Спокойная связь, новичкам рады.", en: "Zero Build trio, need one more. Calm comms, newbies welcome." } },
  { id: "pm1", nick: "Conq_Kazan", game: "pubgm", mode: "rsquad", r: { sys: "pm", t: 6 }, roles: ["igl"], have: 2, region: "ru", langs: ["ru"], mic: true, on: true, ago: 30, dur: 720, ver: false,
    style: "serious", stags: ["adult"], rep: { up: 33, n: 36, ns: 1, tags: ["leader"] },
    note: { ru: "Сквад в рейтинг, нужны двое с Короны и выше. Вечером по Москве.", en: "Ranked squad, need two from Crown and up. Evenings, Moscow time." } },
  { id: "p4", nick: "Nordlys", game: "dota", mode: "ranked", r: { sys: "medal", t: 5, s: 4 }, roles: ["pos1"], have: 1, region: "eue", langs: ["en"], mic: true, on: true, ago: 3, dur: 60, ver: true, c: { dc: "nordlys.carry" }, cvis: "all",
    style: "fun", stags: [], rep: { up: 18, n: 20, ns: 0, tags: ["kind"] },
    note: { ru: "Керри ищет саппорта в дуо, общение спокойное.", en: "Carry looking for a support duo, chill comms." } },
  { id: "so2", nick: "Tiny_Fox", game: "standoff", mode: "allies", r: { sys: "so", t: 1, s: 3 }, roles: ["entry"], have: 1, region: "ru", langs: ["ru"], mic: false, on: true, ago: 10, dur: 180, ver: false,
    style: "fun", stags: ["women", "newbie", "nomat"], rep: { up: 6, n: 6, ns: 0, tags: ["kind"] },
    note: { ru: "Ищу напарницу в союзники 2×2. Спокойно и без токсика.", en: "Looking for a partner for Allies 2v2. Calm, no toxicity." } },
  { id: "p16", nick: "MMR_boost_fast", game: "dota", mode: "ranked", r: { sys: "medal", t: 7, p: 120 }, roles: ["pos1"], have: 1, region: "ru", langs: ["ru"], mic: false, on: true, ago: 2, dur: 4320, ver: false,
    style: "serious", stags: [], rep: { up: 0, n: 0, ns: 0, tags: [] },
    note: { ru: "Подниму рейтинг быстро и недорого, пиши в личку за ценами!!!", en: "Fast cheap rank boost, DM me for prices!!!" } },
  { id: "p7", nick: "mira.lurk", game: "cs2", mode: "faceit", r: { sys: "faceit", elo: 1420 }, extra: [{ sys: "premier", v: 12900 }], roles: ["lurker", "support"], have: 1, region: "eue", langs: ["ru", "en"], mic: true, on: false, ago: 95, dur: 720, ver: true, c: { dc: "mira.lurk" }, cvis: "chat",
    style: "train", stags: ["women"], rep: { up: 38, n: 40, ns: 0, tags: ["comms", "punctual"] },
    note: { ru: "Ищу постоянный стак на FACEIT, будни вечером. Хочется без крика.", en: "Looking for a regular FACEIT stack, weekday evenings. No shouting please." } },
  { id: "va2", nick: "jett_main_2k", game: "valorant", mode: "swift", r: { sys: "val", t: 2, s: 3 }, roles: ["duelist"], have: 1, region: "ru", langs: ["ru"], mic: true, on: false, ago: 55, dur: 180, ver: true,
    style: "fun", stags: ["newbie"], rep: { up: 4, n: 6, ns: 1, tags: [] },
    note: { ru: "Ищу людей на свифтплей и обычные игры, просто поиграть вечером.", en: "Looking for people for Swiftplay and unrated, just casual evening games." } },
  { id: "p12", nick: "Tundra", game: "pubg", mode: "rduo", r: { sys: "pubg", t: 3, s: 3 }, roles: ["fragger", "driver"], have: 1, region: "eue", langs: ["ru"], mic: true, on: false, ago: 18, dur: 180, ver: false,
    style: "fun", stags: [], rep: { up: 11, n: 16, ns: 2, tags: [] },
    note: { ru: "Дуо по вечерам, TPP. Вожу аккуратно, честно.", en: "Evening duo, TPP. I drive carefully, promise." } },
  { id: "p3", nick: "babushka_offlane", game: "dota", mode: "turbo", r: { sys: "medal", t: 3, s: 2 }, roles: ["pos3"], have: 1, region: "ru", langs: ["ru"], mic: false, on: false, ago: 42, dur: 180, ver: true,
    style: "fun", stags: ["newbie", "nomat"], rep: { up: 12, n: 12, ns: 0, tags: ["kind"] },
    note: { ru: "Учусь на оффлейне, ищу спокойных ребят для турбо, потом в рейтинг.", en: "Learning offlane, looking for calm people for turbo, then ranked." } },
  { id: "p5", nick: "kirill_tinker", game: "dota", mode: "ranked", r: { sys: "medal", t: 7, p: 2430 }, roles: ["pos2", "pos3"], have: 3, region: "ru", langs: ["ru"], mic: true, on: false, ago: 130, dur: 4320, ver: true, c: { tg: "kirill_tinker" }, cvis: "stack",
    style: "train", stags: ["adult"], rep: { up: 70, n: 72, ns: 0, tags: ["skill", "leader"] },
    note: { ru: "Собираем стак на турнир выходного дня. После игр разбираем записи.", en: "Building a stack for a weekend cup. Replay review after games." } },
  { id: "p10", nick: "dedmaksim", game: "cs2", mode: "wingman", r: { sys: "comp", t: 4 }, roles: ["support"], have: 1, region: "ru", langs: ["ru"], mic: true, on: false, ago: 200, dur: 1440, ver: false,
    style: "fun", stags: ["adult", "nomat"], rep: { up: 30, n: 31, ns: 0, tags: ["kind", "punctual"] },
    note: { ru: "Мне 32, играю после работы. Напарники, без крика.", en: "I'm 32, play after work. Wingman, no shouting." } },
].map(p => { const t = NOW0 - p.ago * 60000; return Object.assign({}, p, { t, t0: t, exp: t + p.dur * 60000 }); });
const LIVE = { id: "lv1", nick: "fresh_entry", game: "cs2", mode: "premier", r: { sys: "premier", v: 17200 }, extra: [{ sys: "faceit", elo: 1390 }], roles: ["entry"], have: 1, region: "ru", langs: ["ru"], mic: true, on: true, dur: 180, ver: false, c: { dc: "fresh.entry" }, cvis: "all",
  style: "fun", stags: [], rep: { up: 5, n: 5, ns: 0, tags: ["kind"] },
  note: { ru: "Только что зашёл, ищу стак в Premier на пару часов.", en: "Just got on, looking for a Premier stack for a couple of hours." } };

const REPORTS0 = [
  { id: "r1", target: "p16", reason: "spam", from: "Sh4dowFiend", ago: 22 },
  { id: "r2", target: "p16", reason: "scam", from: "kolobok_pos5", ago: 15 },
  { id: "r3", target: "p12", reason: "toxic", from: "Sasha_Drop", ago: 70 },
];
const RANKQ0 = [{ id: "q1", target: "p15", sys: "premier", ago: 40 }, { id: "q2", target: "rv1", sys: "rv", ago: 95 }];

const REPLIES = {
  ru: ["Привет! Да, ещё ищем.", "Какой у тебя ранг и на чём играешь?", "Норм. Во сколько сможешь сегодня?", "Добавляйся в друзья в {plat}, ник тот же.", "Создаю лобби, заходи минут через 10.", "Договорились, до встречи в игре!"],
  en: ["Hey! Yes, still looking.", "What's your rank and role?", "Nice. What time can you play today?", "Add me on {plat}, same nickname.", "Making a lobby, join in about 10 minutes.", "Deal, see you in game!"]
};

/* ---- v4 teams ---- */
function genTeam(id, name, tag, game, region, style, st, desc) {
  const G = GAMES[game], roles = Object.keys(G.roles), R = rng(hashStr(id)), used = new Set(), members = [];
  for (let i = 0; i < G.size; i++) { let n, guard = 0; do { n = NICKS[Math.floor(R() * NICKS.length)]; } while (used.has(n) && guard++ < 60); used.add(n); members.push({ nick: n, role: roles[i % roles.length], trole: i === 0 ? "captain" : i === 1 ? "manager" : "player" }); }
  return { id, name, tag, game, region, style, size: G.size, open: [], members, st, desc: desc || { ru: "Постоянный состав. Ищем праки с командами своего уровня.", en: "Set roster. Looking for scrims with teams at our level." }, sched: { ru: "Праки по вечерам, 19:00–23:00 МСК", en: "Evening scrims, 19:00–23:00 Moscow time" } };
}
const TEAMS0 = [
  { id: "t1", name: "Северный ветер", tag: "NWND", game: "cs2", region: "ru", style: "serious", size: 5, open: ["entry"], st: { rating: 1240, w: 18, l: 9, d: 1, ok: 26, late: 2, ns: 0 },
    members: [{ nick: "kostet", role: "igl", r: { sys: "faceit", elo: 2140 }, trole: "captain" }, { nick: "Vovan_AWP", role: "awp", r: { sys: "faceit", elo: 1620 }, trole: "manager" }, { nick: "mira.lurk", role: "lurker", r: { sys: "faceit", elo: 1420 }, trole: "player" }, { nick: "Brat_Smoke", role: "support", r: { sys: "faceit", elo: 1710 }, trole: "player" }, { nick: "Coach_Petrovich", trole: "coach" }],
    desc: { ru: "Играем FACEIT-хабы и турниры выходного дня. Нужен энтри с FACEIT 8+ и желанием тренироваться.", en: "We play FACEIT hubs and weekend tournaments. Need an entry fragger, FACEIT 8+, willing to practice." },
    sched: { ru: "Тренировки: вт, чт, вс с 20:00 МСК", en: "Practice: Tue, Thu, Sun from 20:00 Moscow time" } },
  { id: "t2", name: "Tea Time", tag: "TEA", game: "dota", region: "eue", style: "fun", size: 5, open: ["pos4", "pos5"], st: { rating: 1150, w: 11, l: 10, d: 0, ok: 19, late: 2, ns: 0 },
    members: [{ nick: "Sh4dowFiend", role: "pos2", r: { sys: "medal", t: 6, s: 1 }, trole: "captain" }, { nick: "Nordlys", role: "pos1", r: { sys: "medal", t: 5, s: 4 }, trole: "player" }, { nick: "Offlane_Olya", role: "pos3", r: { sys: "medal", t: 5, s: 2 }, trole: "manager" }],
    desc: { ru: "Вечерний стак для рейтинга без нервов. Ищем двух саппортов уровня Властелина.", en: "Evening ranked stack, no stress. Looking for two Ancient-level supports." },
    sched: { ru: "Почти каждый вечер после 21:00", en: "Most evenings after 21:00" } },
  { id: "t3", name: "Phoenix Rise", tag: "PHX", game: "valorant", region: "euw", style: "serious", size: 5, open: ["duelist"], st: { rating: 1215, w: 14, l: 7, d: 1, ok: 20, late: 2, ns: 0 },
    members: [{ nick: "Kira_Sage", role: "sentinel", r: { sys: "val", t: 4, s: 2 }, trole: "captain" }, { nick: "OmenSmokes", role: "controller", r: { sys: "val", t: 5, s: 1 }, trole: "manager" }, { nick: "Sova_Eye", role: "initiator", r: { sys: "val", t: 4, s: 3 }, trole: "player" }, { nick: "KJ_Lock", role: "sentinel", r: { sys: "val", t: 4, s: 1 }, trole: "player" }],
    desc: { ru: "Готовимся к Premier. Нужен дуэлянт уровня Алмаза, разборы записей по средам.", en: "Preparing for Premier. Need a Diamond-level duelist, VOD reviews on Wednesdays." },
    sched: { ru: "Пн, ср, пт с 19:00 CET", en: "Mon, Wed, Fri from 19:00 CET" } },
  { id: "t4", name: "Мобильный штаб", tag: "MSHB", game: "standoff", region: "ru", style: "serious", size: 5, open: ["awp", "support"], st: { rating: 1130, w: 9, l: 6, d: 0, ok: 14, late: 1, ns: 0 },
    members: [{ nick: "Mobile_Legenda", role: "igl", r: { sys: "so", t: 5 }, trole: "captain" }, { nick: "Tap_Tap", role: "entry", r: { sys: "so", t: 4 }, trole: "manager" }, { nick: "GyroAim", role: "lurker", r: { sys: "so", t: 4 }, trole: "player" }],
    desc: { ru: "Собираем состав на онлайн-турниры по Standoff 2. Играем только с телефонов.", en: "Building a roster for online Standoff 2 tournaments. Phones only." },
    sched: { ru: "Каждый день с 18:00 МСК", en: "Daily from 18:00 Moscow time" } },
  { id: "t5", name: "Night Owls", tag: "OWL", game: "rivals", region: "ru", style: "fun", size: 6, open: ["vanguard", "duelist"], st: { rating: 1080, w: 7, l: 8, d: 1, ok: 13, late: 2, ns: 1 },
    members: [{ nick: "Loki_Strat", role: "strategist", r: { sys: "rv", t: 4, s: 2 }, trole: "captain" }, { nick: "MantisHeals", role: "strategist", r: { sys: "rv", t: 3, s: 1 }, trole: "player" }, { nick: "Webhead", role: "duelist", r: { sys: "rv", t: 4, s: 3 }, trole: "manager" }, { nick: "Thor_Hammer", role: "vanguard", r: { sys: "rv", t: 3, s: 2 }, trole: "player" }],
    desc: { ru: "Играем ночью, когда все спят. Соревновательный и иногда кастомки.", en: "We play late at night. Competitive and the occasional custom game." },
    sched: { ru: "Ежедневно с 23:00 МСК", en: "Daily from 23:00 Moscow time" } },
  { id: "t6", name: "Squad Zero", tag: "SQZ", game: "pubgm", region: "ru", style: "serious", size: 4, open: ["fragger", "support"],
    members: [{ nick: "Conq_Kazan", role: "igl", r: { sys: "pm", t: 6 }, trole: "captain" }, { nick: "Erangel_Ghost", role: "sniper", r: { sys: "pm", t: 5, s: 2 }, trole: "player" }],
    desc: { ru: "Идём в Завоеватели в этом сезоне. Нужны двое стабильных игроков с Короны.", en: "Pushing for Conqueror this season. Need two consistent Crown+ players." },
    sched: { ru: "Вечером, 4–5 игр", en: "Evenings, 4–5 games" } },
  genTeam("vlg", "Volga Five", "VLG", "cs2", "ru", "serious", { rating: 1310, w: 24, l: 8, d: 2, ok: 31, late: 1, ns: 0 }, { ru: "Играем FACEIT-хабы и онлайн-лиги. Ищем праки с сильными командами.", en: "We play FACEIT hubs and online leagues. Looking for scrims with strong teams." }),
  genTeam("plr", "Polar Bears", "PLR", "cs2", "ru", "serious", { rating: 1185, w: 15, l: 12, d: 1, ok: 24, late: 3, ns: 1 }),
  genTeam("ktch", "Kitchen Heroes", "KTCH", "cs2", "eue", "fun", { rating: 1120, w: 10, l: 11, d: 0, ok: 17, late: 3, ns: 1 }),
  genTeam("mrg", "Mirage Masters", "MRG", "cs2", "euw", "train", { rating: 1050, w: 6, l: 9, d: 0, ok: 13, late: 1, ns: 1 }),
  genTeam("nowl", "Neon Owls", "NOWL", "valorant", "eue", "serious", { rating: 1180, w: 12, l: 9, d: 0, ok: 19, late: 2, ns: 0 }),
  genTeam("spk", "Spike Club", "SPK", "valorant", "ru", "fun", { rating: 1090, w: 8, l: 10, d: 1, ok: 15, late: 3, ns: 1 }),
  genTeam("agd", "Ancient Guard", "AGD", "dota", "ru", "serious", { rating: 1270, w: 20, l: 9, d: 0, ok: 27, late: 2, ns: 0 }),
  genTeam("rsh", "Roshan Hunters", "RSH", "dota", "eue", "fun", { rating: 1110, w: 9, l: 10, d: 0, ok: 16, late: 2, ns: 1 }),
  genTeam("pkt", "Pocket Aces", "PKT", "standoff", "ru", "fun", { rating: 1060, w: 6, l: 8, d: 0, ok: 12, late: 2, ns: 0 }),
  genTeam("inf", "Infinity", "INF", "rivals", "euw", "serious", { rating: 1140, w: 10, l: 7, d: 0, ok: 15, late: 1, ns: 1 }),
  genTeam("brn", "Baron Call", "BRN", "lol", "eue", "serious", { rating: 1160, w: 11, l: 8, d: 0, ok: 18, late: 1, ns: 0 }),
  genTeam("soul", "Soul Urns", "SOUL", "deadlock", "eue", "fun", { rating: 1100, w: 7, l: 6, d: 0, ok: 11, late: 2, ns: 0 }),
];

["p8", "va1"].forEach(id => { const p = SEED.find(x => x.id === id); if (p) p.promo = true; });
SEED.forEach(p => { if (!p.when) { const h = hashStr(p.id) % 4; p.when = h === 0 ? ["night"] : h === 1 ? ["day", "evening"] : ["evening"]; } });
(function () {
  const at = nextAt(21, 0), t0 = NOW0 - 12 * 60000;
  SEED.splice(3, 0, { id: "sb1", kind: "sub", team: "vlg", nick: "Volga Five", game: "cs2", mode: "premier", r: { sys: "premier", v: 24000 }, roles: ["awp"], have: 4, region: "ru", langs: ["ru"], mic: true, on: true, ver: true, style: "serious", stags: ["adult"], rep: { up: 0, n: 0, ns: 0, tags: [] }, when: ["evening"],
    at, t: t0, t0, exp: at, note: { ru: "Наш снайпер заболел. Нужна замена на прак, рейтинг от 20 000.", en: "Our AWPer is sick. Need a sub for a scrim, 20,000+ rating." } });
})();
const SLOTS = [
  { id: "s1", team: "vlg", game: "cs2", at: Math.ceil((NOW0 + 25 * 60000) / 300000) * 300000, format: "bo1", note: { ru: "MR12, сервер Москва", en: "MR12, Moscow server" } },
  { id: "s2", team: "plr", game: "cs2", at: nextAt(20, 0), format: "bo3", note: { ru: "Полноценный Bo3 с вето", en: "Full Bo3 with veto" } },
  { id: "s3", team: "ktch", game: "cs2", at: atTime(1, 19, 0), format: "bo2", note: { ru: "Тренируем Nuke и Anubis", en: "Practising Nuke and Anubis" } },
  { id: "s4", team: "nowl", game: "valorant", at: nextAt(21, 0), format: "bo1", note: { ru: "Сервер Франкфурт", en: "Frankfurt server" } },
  { id: "s5", team: "spk", game: "valorant", at: atTime(1, 20, 30), format: "bo3", note: { ru: "", en: "" } },
  { id: "s6", team: "agd", game: "dota", at: atTime(1, 20, 0), format: "bo3", note: { ru: "Captains Mode, сервер Russia", en: "Captains Mode, Russia server" } },
  { id: "s7", team: "rsh", game: "dota", at: nextAt(22, 0), format: "bo1", note: { ru: "", en: "" } },
  { id: "s8", team: "pkt", game: "standoff", at: nextAt(22, 0), format: "bo1", note: { ru: "Только с телефонов", en: "Phones only" } },
  { id: "s9", team: "inf", game: "rivals", at: atTime(1, 18, 30), format: "bo3", note: { ru: "", en: "" } },
  { id: "s10", team: "brn", game: "lol", at: atTime(2, 20, 0), format: "bo1", note: { ru: "Турнирная драфт-пикировка", en: "Tournament draft" } },
  { id: "s11", team: "soul", game: "deadlock", at: nextAt(21, 30), format: "bo1", note: { ru: "", en: "" } },
];

/* ================= state ================= */
const KEY = "stackup-demo-v4";
function load() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
let saveQueued = false;
const SAVE_KEYS = ["lang", "profile", "set", "posts", "archive", "chats", "stacks", "stackGame", "favs", "blocked", "setupHidden", "notifs", "voice", "teams", "apps", "appRole", "rated", "mod", "prem", "friends", "scrims", "booked", "tpatch", "subreq", "subApplied", "bumpAt"];
function save() {
  if (saveQueued) return; saveQueued = true;
  setTimeout(() => { saveQueued = false; const o = {}; SAVE_KEYS.forEach(k => { o[k] = S[k]; }); try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }, 60);
}
function emptyMap(fn) { const o = {}; GAME_KEYS.forEach(g => { o[g] = fn(); }); return o; }
function blankProfile(lang) { return { nick: "", dc: "", tg: "", cvis: "chat", langs: [lang || "ru"], region: "ru", ranks: emptyMap(() => ({})), ver: {}, pending: {}, acc: {}, pubgNick: "", adult: false, games: [], roles: {}, time: [], days: [], style: "fun", onboarded: false }; }
function blankSet() { return { tg: false, tgCode: "", push: false, prefs: { match: true, msg: true, stack: true, expire: true, team: true } }; }
function blankMod() { return { banned: {}, removed: [], reports: REPORTS0.map(r => Object.assign({}, r, { t: NOW0 - r.ago * 60000 })), rankq: RANKQ0.map(q => Object.assign({}, q, { t: NOW0 - q.ago * 60000 })), ok: {}, resolved: 0, stacks: 52, scrims: 14 }; }
function seedChats() {
  return {
    p6: { msgs: [{ me: true, text: "Привет! Ещё ищете энтри?", t: NOW0 - 30 * 60000 }, { me: false, text: "Да, заходи вечером в 20:00, кину инвайт.", t: NOW0 - 28 * 60000 }], unread: 0, n: 1 },
    p1: { msgs: [{ me: false, text: "Привет! Видел, ты тоже на саппорте. Сыграем в паре?", t: NOW0 - 5 * 60000 }], unread: 1, n: 1 }
  };
}
function blankQ() { return { match: false, online: false, verified: false, favs: false, mic: false, contacts: false, fresh: false, rep90: false, nons: false, sametime: false }; }
const saved = load() || {};
const initLang = saved.lang || ((navigator.language || "ru").toLowerCase().startsWith("ru") ? "ru" : "en");
const S = {
  lang: initLang, view: "feed", game: "all", teamTab: "browse", myTeamSel: null,
  f: { q: "", modes: [], roles: [], sys: "any", rmin: 0, rmax: 99, region: "any", lng: "any", styles: [], stags: [] },
  q: blankQ(),
  profile: Object.assign(blankProfile(initLang), saved.profile || {}),
  set: Object.assign(blankSet(), saved.set || {}),
  posts: saved.posts || [], archive: (saved.archive || []).filter(a => NOW0 - a.ended < 30 * 864e5),
  chats: saved.chats || seedChats(), stacks: Object.assign(emptyMap(() => []), saved.stacks || {}),
  stackGame: saved.stackGame || "dota", favs: saved.favs || ["p8"], blocked: saved.blocked || [], setupHidden: !!saved.setupHidden,
  notifs: saved.notifs || [], voice: saved.voice || {}, teams: saved.teams || [], apps: saved.apps || {}, appRole: saved.appRole || {}, rated: saved.rated || {},
  mod: Object.assign(blankMod(), saved.mod || {}), prem: !!saved.prem, friends: saved.friends || [], scrims: saved.scrims || [], booked: saved.booked || {},
  tpatch: saved.tpatch || {}, subreq: saved.subreq || {}, subApplied: saved.subApplied || {}, bumpAt: saved.bumpAt || {},
  active: null, typing: {}
};
GAME_KEYS.forEach(g => { if (!S.profile.ranks[g]) S.profile.ranks[g] = {}; });
["ver", "pending", "acc", "roles"].forEach(k => { if (!S.profile[k]) S.profile[k] = {}; });
["games", "time", "days"].forEach(k => { if (!Array.isArray(S.profile[k])) S.profile[k] = []; });
function applyModToSeeds() { Object.keys(S.mod.ok || {}).forEach(id => { const p = SEED.find(x => x.id === id); if (p) p.ver = true; }); }
applyModToSeeds();

/* ================= helpers ================= */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const L = () => (S.lang === "ru" ? 0 : 1);
function t(k, ...a) { const v = T[S.lang][k]; return typeof v === "function" ? v(...a) : (v == null ? k : v); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function hue(s) { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
function hashStr(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function initials(n) { const c = String(n).replace(/[^A-Za-zА-Яа-яЁё0-9]/g, ""); return (c.slice(0, 2) || "?").toUpperCase(); }
function fmt(n) { return Number(n).toLocaleString(S.lang === "ru" ? "ru-RU" : "en-US"); }
function roman(n) { return ["", "I", "II", "III", "IV", "V", "VI"][n] || String(n); }
const isWide = () => window.matchMedia("(min-width: 820px)").matches;
function rel(ts) {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return t("just_now"); if (m < 60) return m + " " + t("min_ago");
  const h = Math.round(m / 60); if (h < 24) return h + " " + t("h_ago");
  return Math.round(h / 24) + " " + t("d_ago");
}
function leftText(ms) {
  const m = Math.max(1, Math.ceil(ms / 60000));
  if (m < 60) return t("left_m", m);
  const h = Math.floor(m / 60), mm = m % 60; if (h < 24) return t("left_hm", h, mm);
  return t("left_dh", Math.floor(h / 24), h % 24);
}
function clock(ts) { const d = new Date(ts); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
function dateStr(ts) { return new Date(ts).toLocaleDateString(S.lang === "ru" ? "ru-RU" : "en-US", { day: "numeric", month: "short" }); }
function durLabel(min) { if (min === PREM_DUR) return t("prem_7d"); const i = DURS.indexOf(min); return i >= 0 ? t("durs")[i] : Math.round(min / 60) + " h"; }
function regionName(r) { return (REGIONS[r] || [r, r])[L()]; }
function gname(g) { return GAMES[g].name; }
function gshort(g) { return GAMES[g].short || GAMES[g].name; }
function modeName(g, m) { return (GAMES[g].modes[m] || [m, m])[L()]; }
function roleName(g, r) { return (GAMES[g].roles[r] || [r, r])[L()]; }
function partySize(p) { return GAMES[p.game].msize[p.mode] || GAMES[p.game].size; }
function noteOf(p) { return typeof p.note === "string" ? p.note : (p.note ? p.note[S.lang] : ""); }
function loc(o) { return typeof o === "string" ? o : (o ? o[S.lang] : ""); }
function findPost(id) { return S.posts.find(p => p.id === id) || SEED.find(p => p.id === id) || S.friends.find(p => p.id === id); }

const ICON = {
  mic: '<svg class="i" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  nomic: '<svg class="i" viewBox="0 0 24 24"><path d="M3 3l18 18M9 9v2a3 3 0 0 0 5 2.2M15 9.3V6a3 3 0 0 0-5.8-1M5 11a7 7 0 0 0 11.5 5.4M12 18v3"/></svg>',
  chat: '<svg class="i" viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
  plus: '<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg class="i" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>',
  flag: '<svg class="i" viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  globe: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
  back: '<svg class="i" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
  shield: '<svg class="i" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  search: '<svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  trash: '<svg class="i" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  headset: '<svg class="i" viewBox="0 0 24 24"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>',
  send: '<svg class="i" viewBox="0 0 24 24"><path d="M21 3L3 10.5l7 2.5 2.5 7z"/><path d="M10 13l4-4"/></svg>',
  copy: '<svg class="i cp" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
  lock: '<svg class="i" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  clock: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  target: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  sliders: '<svg class="i" viewBox="0 0 24 24"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
  x: '<svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  refresh: '<svg class="i" viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>',
  link: '<svg class="i" viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  at: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>',
  star: '<svg class="i" viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  ban: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>',
  up: '<svg class="i" viewBox="0 0 24 24"><path d="M7 11v9H4v-9zM7 11l4-8a2 2 0 0 1 2 2v4h6a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7"/></svg>',
  down: '<svg class="i" viewBox="0 0 24 24"><path d="M17 13V4h3v9zM17 13l-4 8a2 2 0 0 1-2-2v-4H5a2 2 0 0 1-2-2.3l1.2-7A2 2 0 0 1 6.2 4H17"/></svg>',
  bell: '<svg class="i" viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  users: '<svg class="i" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 19c.8-3.2 3.2-5 6-5s5.2 1.8 6 5"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.2c2.6-.3 4.4 1.3 5 4.3"/></svg>',
  image: '<svg class="i" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/></svg>',
  monitor: '<svg class="i" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
};
function avatar(nick, on) { return '<span class="av" style="--h:' + hue(nick || "?") + '" aria-hidden="true">' + esc(initials(nick || "?")) + (on ? '<span class="dot"></span>' : "") + "</span>"; }

/* ================= ranks ================= */
function lvl(elo) { let l = 1; SYS.faceit.mins.forEach((m, i) => { if (elo >= m) l = i + 1; }); return l; }
function fcColor(l) { return l === 1 ? "--fc1" : l <= 3 ? "--fc2" : l <= 7 ? "--fc4" : l <= 9 ? "--fc8" : "--fc10"; }
function hasSub(sys, tv) { const s = SYS[sys]; return !!s.subs && tv >= (s.subMin || 0) && tv <= s.subTop; }
function step(r) {
  const s = SYS[r.sys];
  if (s.kind === "rating") { let i = 0; s.bands.forEach((b, k) => { if (r.v >= b) i = k; }); return i; }
  if (s.kind === "faceit") return lvl(r.elo) - 1;
  return r.t;
}
function stepLabels(sys) {
  const s = SYS[sys];
  if (s.kind === "rating") return s.bands.map((b, i) => i < s.bands.length - 1 ? fmt(b) + "–" + fmt(s.bands[i + 1] - 1) : fmt(b) + "+");
  if (s.kind === "faceit") return s.mins.map((m, i) => t("level_n", i + 1) + " · " + fmt(m) + (i < 9 ? "–" + fmt(s.mins[i + 1] - 1) : "+"));
  return s.tiers[S.lang];
}
function colorOf(r) {
  const s = SYS[r.sys];
  if (s.kind === "rating") return s.colors[step(r)];
  if (s.kind === "faceit") return fcColor(lvl(r.elo));
  return s.colors[r.t];
}
function subText(sys, v) { const st = SYS[sys].subStyle; return st === "stars" || st === "num" ? String(v) : roman(v); }
function rankText(r, short) {
  const s = SYS[r.sys];
  if (s.kind === "rating") return (short ? "Premier " : "") + fmt(r.v);
  if (s.kind === "faceit") return "FACEIT " + lvl(r.elo) + " · " + fmt(r.elo);
  let name = short && s.short ? s.short[r.t] : s.tiers[S.lang][r.t];
  if (hasSub(r.sys, r.t) && r.s) name += " " + subText(r.sys, r.s);
  if (r.sys === "medal" && r.t === 7 && r.p) name += " #" + r.p;
  return name;
}
function sysLabel(sys) { return sys === "premier" ? "Premier" : sys === "comp" ? (S.lang === "ru" ? "Звание CS2" : "CS2 skill group") : SYS[sys].label[L()]; }
function ring(l) {
  const C = 2 * Math.PI * 14;
  return '<svg class="ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="14" fill="none" stroke="var(--line-2)" stroke-width="3.5"/>' +
    '<circle cx="18" cy="18" r="14" fill="none" stroke="var(--c)" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="' + (C * l / 10).toFixed(1) + " " + C.toFixed(1) + '" transform="rotate(-90 18 18)"/>' +
    '<text x="18" y="22.5" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--fg)">' + l + "</text></svg>";
}
function badge(r) {
  const s = SYS[r.sys], c = colorOf(r);
  if (s.kind === "rating") return `<div class="rk" style="--c:var(${c})"><span class="rk-sys">Premier</span><span class="pl"><b>${fmt(r.v)}</b></span></div>`;
  if (s.kind === "faceit") { const l = lvl(r.elo); return `<div class="rk" style="--c:var(${c})" title="${esc(t("level_n", l))}"><span class="rk-sys">FACEIT</span><span class="fc">${ring(l)}<span class="elo mono">${fmt(r.elo)}<small>ELO</small></span></span></div>`; }
  const name = s.tiers[S.lang][r.t];
  const main = r.sys === "comp" ? `<b title="${esc(name)}">${s.short[r.t]}</b>` : `<b>${esc(name)}${hasSub(r.sys, r.t) && r.s && r.sys !== "medal" ? " " + subText(r.sys, r.s) : ""}</b>`;
  let sub = "";
  if (r.sys === "medal") sub = r.t <= 6 ? `<span class="pips" title="${r.s} ${esc(t("stars"))}">${'<i class="on"></i>'.repeat(r.s || 0)}${"<i></i>".repeat(5 - (r.s || 0))}</span>` : (r.p ? `<span class="place mono">#${r.p}</span>` : "");
  if (r.sys === "comp") sub = `<span class="rk-sys" style="text-transform:none;letter-spacing:0;font-family:var(--f-body);font-size:11.5px;white-space:normal">${esc(name)}</span>`;
  return `<div class="rk" style="--c:var(${c})"><span class="rk-sys">${esc(r.sys === "comp" || r.sys === "medal" ? SYS[r.sys].label[L()] : t("rank"))}</span><span class="tv"><i class="gem"></i>${main}</span>${sub}</div>`;
}
function miniRank(r) { return `<span class="mr" style="--c:var(${colorOf(r)})"><i></i>${esc(rankText(r, true))}</span>`; }
function myRank(game, sys) { return (S.profile.ranks[game] || {})[sys] || null; }
function hasAnyRank() { return GAME_KEYS.some(g => Object.values(S.profile.ranks[g] || {}).some(Boolean)); }
function isMatch(p) {
  const langs = S.profile.langs;
  if (langs.length && !p.langs.some(l => langs.includes(l))) return false;
  for (const r of [p.r].concat(p.extra || [])) {
    const m = myRank(p.game, r.sys);
    if (m && Math.abs(step(m) - step(r)) <= (r.sys === "comp" ? 2 : 1)) return true;
  }
  return false;
}
function subOptions(sys) { const s = SYS[sys]; const a = []; for (let i = 1; i <= s.subs; i++) a.push(i); return s.subStyle === "roman-desc" ? a.reverse() : a; }
function rankInput(pre, sys, r, allowNone, locked) {
  const s = SYS[sys], dis = locked ? " disabled" : "";
  if (s.kind === "tiers") {
    const tiers = s.tiers[S.lang];
    const tv = r ? r.t : (allowNone ? -1 : Math.min(3, tiers.length - 1));
    let h = `<div class="ri" data-pre="${pre}" data-sys="${sys}"><select class="inp" id="${pre}-t" data-ri="t" aria-label="${esc(sysLabel(sys))}"${dis}>` +
      (allowNone ? `<option value="-1">${esc(t("not_set"))}</option>` : "") +
      tiers.map((n, i) => `<option value="${i}"${i === tv ? " selected" : ""}>${esc(n)}</option>`).join("") + "</select>";
    if (s.subs) {
      const sv = r && r.s ? r.s : s.subDef, off = locked || !hasSub(sys, tv);
      h += `<select class="inp sub" id="${pre}-s" data-ri="s" aria-label="${s.subStyle === "stars" ? esc(t("stars")) : "Division"}"${off ? " disabled" : ""}>` +
        subOptions(sys).map(v => `<option value="${v}"${v === sv ? " selected" : ""}>${s.subStyle === "stars" ? v + " ★" : subText(sys, v)}</option>`).join("") + "</select>";
    }
    return h + "</div>";
  }
  const isR = s.kind === "rating", val = r ? (isR ? r.v : r.elo) : "";
  return `<div class="ri ri-num" data-pre="${pre}" data-sys="${sys}"><input class="inp mono" type="number" inputmode="numeric" min="${isR ? 0 : 100}" max="${isR ? 40000 : 5000}" id="${pre}-v" data-ri="v" placeholder="${esc(t(isR ? "premier_ph" : "elo_ph"))}" value="${val}" aria-label="${esc(sysLabel(sys))}"${dis}><span class="ri-prev" id="${pre}-prev">${r ? miniRank(r) : ""}</span></div>`;
}
function readRank(pre, sys) {
  const s = SYS[sys];
  if (s.kind === "tiers") {
    const el = document.getElementById(pre + "-t"); if (!el) return null;
    const tv = +el.value; if (tv < 0) return null;
    const r = { sys, t: tv };
    if (hasSub(sys, tv)) r.s = +document.getElementById(pre + "-s").value;
    return r;
  }
  const el = document.getElementById(pre + "-v"); if (!el) return null;
  const n = parseInt(el.value, 10); if (isNaN(n)) return null;
  return s.kind === "rating" ? { sys, v: Math.max(0, Math.min(40000, n)) } : { sys, elo: Math.max(100, Math.min(5000, n)) };
}
function refreshRankInput(wrap) {
  const pre = wrap.dataset.pre, sys = wrap.dataset.sys, s = SYS[sys];
  if (s.kind === "tiers" && s.subs) { const tv = +document.getElementById(pre + "-t").value; document.getElementById(pre + "-s").disabled = !hasSub(sys, tv); }
  if (s.kind !== "tiers") { const r = readRank(pre, sys); document.getElementById(pre + "-prev").innerHTML = r ? miniRank(r) : ""; }
}
function myVer(sys) { if (S.profile.ver[sys]) return S.profile.ver[sys]; if (S.profile.pending[sys]) return "wait"; return null; }

/* ================= stats ================= */
function statsFor(key, game) {
  const R = rng(hashStr(key + "|" + game)), G = GAMES[game];
  const wr = Math.round(45 + R() * 15), matches = Math.round(150 + R() * 1700), hours = Math.round(matches * (0.55 + R() * 0.35));
  const last = Array.from({ length: 10 }, () => R() * 100 < wr + 3);
  const fav = []; let guard = 0; while (fav.length < 3 && guard++ < 60) { const x = G.pool[Math.floor(R() * G.pool.length)]; if (!fav.includes(x)) fav.push(x); }
  let m1, m2;
  if (G.kind === "moba") { m1 = ["KDA", (2 + R() * 2.6).toFixed(1)]; m2 = [t("st_hours"), fmt(hours)]; }
  else if (G.kind === "shooter") { m1 = ["K/D", (0.85 + R() * 0.5).toFixed(2)]; m2 = [t("hs"), Math.round(35 + R() * 22) + "%"]; }
  else { m1 = ["K/D", (0.9 + R() * 2.4).toFixed(1)]; m2 = [t("dmg"), fmt(Math.round(240 + R() * 420))]; }
  return { wr, matches, last, fav, m1, m2 };
}
function statsHtml(key, game) {
  const G = GAMES[game];
  if (!G.api) return `<p class="hint">${esc(t("st_none", G.name))}</p>`;
  const st = statsFor(key, game), wl = t("wl");
  return `<div class="stats"><div class="kv"><div><b>${st.wr}%</b><span>${esc(t("st_wr"))}</span></div><div><b>${esc(st.m1[1])}</b><span>${esc(st.m1[0])}</span></div><div><b>${esc(st.m2[1])}</b><span>${esc(st.m2[0])}</span></div><div><b>${fmt(st.matches)}</b><span>${esc(t("st_matches"))}</span></div></div>
<div class="wl" aria-label="${esc(t("st_last"))}"><span class="lbl">${esc(t("st_last"))}</span>${st.last.map(w => `<i class="${w ? "w" : "l"}">${w ? wl[0] : wl[1]}</i>`).join("")}</div>
<div class="field" style="gap:6px"><span class="lbl">${esc(t("favk")[G.fav])}</span><div class="favs">${st.fav.map(f => `<span>${esc(f)}</span>`).join("")}</div></div>
<p class="src">${esc(t("st_src", G.api))}</p></div>`;
}

/* ================= reputation ================= */
function repOf(p) {
  const base = p.rep || { up: 0, n: 0, ns: 0, tags: [] }, my = S.rated[p.id];
  const r = { up: base.up, n: base.n, ns: base.ns, tags: base.tags.slice() };
  if (my) { r.n++; if (my.up) r.up++; if (my.ns) r.ns++; my.tags.forEach(tg => { if (!r.tags.includes(tg)) r.tags.push(tg); }); }
  return r;
}
function repHtml(p) {
  const r = repOf(p);
  if (!r.n) return `<span class="rep">${ICON.up}${esc(t("rep_none"))}</span>`;
  const pct = Math.round(r.up / r.n * 100);
  return `<span class="rep${pct < 80 ? " low" : ""}">${ICON.up}<b>${esc(t("rep_n", pct, r.n))}</b>${r.ns ? `<span class="ns">· ${esc(t("noshow_n", r.ns))}</span>` : ""}</span>`;
}
function interacted(id) { const c = S.chats[id]; const inStack = GAME_KEYS.some(g => S.stacks[g].includes(id)); return inStack || !!(c && c.msgs.some(m => m.me)); }

/* ================= contacts ================= */
const DC_RE = /^(?!.*\.\.)[a-z0-9_.]{2,32}$/;
const TG_RE = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;
function normDc(v) { return String(v || "").trim().replace(/^@/, "").toLowerCase(); }
function normTg(v) { return String(v || "").trim().replace(/^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//i, "").replace(/^@/, "").replace(/\/.*$/, ""); }
function hasC(p) { return !!(p.c && (p.c.dc || p.c.tg)); }
function theyReplied(id) { const c = S.chats[id]; return !!(c && c.msgs.some(m => !m.me && !m.sys)); }
function cState(p) {
  if (!hasC(p)) return "none";
  if (p.mine || p.cvis === "all") return "show";
  if (p.cvis === "chat") return theyReplied(p.id) ? "show" : "chat";
  return S.stacks[p.game].includes(p.id) ? "show" : "stack";
}
function cChip(kind, val) {
  const shown = kind === "tg" ? "@" + val : val;
  return `<button class="cc" data-action="copy" data-copy="${esc(shown)}" title="${esc(t("copy"))}">${kind === "dc" ? ICON.headset : ICON.send}<span class="cc-k">${kind === "dc" ? "Discord" : "Telegram"}</span><span class="cc-v">${esc(shown)}</span>${ICON.copy}</button>`;
}
function contactsInner(p) {
  const st = cState(p); if (st === "none") return "";
  if (st === "show") return (p.c.dc ? cChip("dc", p.c.dc) : "") + (p.c.tg ? cChip("tg", p.c.tg) : "");
  const names = [p.c.dc ? "Discord" : "", p.c.tg ? "Telegram" : ""].filter(Boolean).join(" · ");
  return `<span class="lock">${ICON.lock}${names} — ${esc(t(st === "chat" ? "c_hidden_chat" : "c_hidden_stack"))}</span>`;
}
function contactsHtml(p) { const h = contactsInner(p); return h ? `<div class="contacts">${h}</div>` : ""; }
function contactLine(c) { return [c.dc ? "Discord: " + c.dc : "", c.tg ? "Telegram: @" + c.tg : ""].filter(Boolean).join(", "); }
function copyText(v) {
  const done = () => toast(t("copied", v));
  const fallback = () => {
    try { const ta = document.createElement("textarea"); ta.value = v; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); ok ? done() : toast(t("copy_fail", v)); }
    catch (e) { toast(t("copy_fail", v)); }
  };
  try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, fallback); else fallback(); } catch (e) { fallback(); }
}

/* ================= toast + notifications ================= */
let toastTimer;
function toast(msg, action) {
  const el = $("#toast");
  el.innerHTML = "<span>" + esc(msg) + "</span>" + (action ? '<button type="button" id="toastBtn">' + esc(action.label) + "</button>" : "");
  el.hidden = false;
  if (action) $("#toastBtn").addEventListener("click", () => { el.hidden = true; action.fn(); });
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, action ? 5000 : 2800);
}
const NPREF = { msg: "msg", new: "match", match: "match", expire: "expire", team: "team", app: "team", voice: "stack", scrim: "team", join: "stack", sub: "team" };
const NICON = { msg: "chat", new: "plus", match: "target", expire: "clock", team: "users", app: "users", voice: "headset", rank: "shield", test: "bell", scrim: "users", join: "link" };
function notify(k, text, go) {
  const pref = NPREF[k]; if (pref && !S.set.prefs[pref]) return;
  S.notifs.unshift({ id: "n" + Date.now() + Math.floor(Math.random() * 999), k, text, t: Date.now(), read: false, go: go || null, tg: !!S.set.tg });
  S.notifs = S.notifs.slice(0, 40); save(); renderBell();
}
function renderBell() { const n = S.notifs.filter(x => !x.read).length, b = $("#bellBadge"); b.hidden = !n; b.textContent = n; $("#bell").setAttribute("aria-label", t("notifs") + (n ? " · " + n : "")); }

/* ================= posts lifecycle ================= */
function isBanned(id) { const b = S.mod.banned[id]; return !!b && (!b.until || b.until > Date.now()); }
function activePosts() { const now = Date.now(); return S.posts.concat(SEED).filter(p => p.exp > now && !S.blocked.includes(p.id) && !isBanned(p.id) && !S.mod.removed.includes(p.id)); }
function archivePost(p, reason) { S.archive.unshift(Object.assign({}, p, { ended: Date.now(), reason })); S.archive = S.archive.slice(0, 40); }
function closeMineForGame(game, reason) {
  const p = S.posts.find(x => x.game === game && x.kind !== "sub"); if (!p) return false;
  S.posts = S.posts.filter(x => x !== p); archivePost(p, reason); return true;
}
function otherRanks(game, sys) { return GAMES[game].systems.filter(s => s !== sys).map(s => myRank(game, s)).filter(Boolean); }
function addMyGame(g) { if (!S.profile.games.includes(g)) S.profile.games.push(g); }
function publish(F) {
  const now = Date.now();
  const replaced = closeMineForGame(F.game, "replaced");
  const v = S.profile.ver[F.r.sys];
  S.posts.unshift({ id: "me-" + now, mine: true, nick: S.profile.nick, game: F.game, mode: F.mode, r: F.r, extra: otherRanks(F.game, F.r.sys), roles: F.roles.length ? F.roles : [Object.keys(GAMES[F.game].roles)[0]],
    have: F.have, region: F.region, langs: S.profile.langs.length ? S.profile.langs.slice() : [S.lang], mic: F.mic, on: true, t: now, t0: now, exp: now + F.dur * 60000, dur: F.dur, ver: !!v,
    note: F.note, c: F.showC && (S.profile.dc || S.profile.tg) ? { dc: S.profile.dc, tg: S.profile.tg } : null, cvis: S.profile.cvis, style: F.style, stags: F.stags.slice(), when: S.profile.time.slice(), promo: S.prem });
  addMyGame(F.game);
  if (F.roles.length) S.profile.roles[F.game] = F.roles.slice();
  save();
  return replaced;
}

/* ================= static text ================= */
function applyLang() {
  document.documentElement.lang = S.lang;
  $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  $("#langBtn").innerHTML = S.lang === "ru" ? "<b>RU</b> / EN" : "RU / <b>EN</b>";
  $("#meBtn").innerHTML = avatar(S.profile.nick || "?", false);
  $("#meBtn").setAttribute("aria-label", t("profile"));
  renderBell();
}

/* ================= rail + quick ================= */
function railOrder() { const mine = S.profile.games.filter(g => GAME_KEYS.includes(g)); return mine.concat(GAME_KEYS.filter(g => !mine.includes(g))); }
function renderRail() {
  const act = activePosts().filter(p => p.kind !== "sub"), teams = allTeams(), inTeams = S.view === "teams";
  const tile = (k, name, color, mob) => {
    let meta;
    if (inTeams) meta = esc(t("teams_n", k === "all" ? teams.length : teams.filter(x => x.game === k).length));
    else { const items = k === "all" ? act : act.filter(p => p.game === k); meta = '<i class="odot" aria-hidden="true"></i>' + esc(items.filter(p => p.on).length + " " + t("online")); }
    return `<button class="gt" data-game="${k}" aria-pressed="${S.game === k}" style="--g:var(${color})"><span class="gt-name">${esc(name)}${mob ? `<small>${esc(t("mobile"))}</small>` : ""}</span><span class="gt-meta">${meta}</span></button>`;
  };
  $("#rail").innerHTML = tile("all", t("all"), "--accent") + railOrder().map(k => tile(k, gshort(k), GAMES[k].color, GAMES[k].mobile)).join("");
}
function filterCount() {
  const f = S.f, q = S.q; let n = 0;
  if (f.q.trim()) n++; if (f.modes.length) n++; if (f.roles.length) n++; if (f.region !== "any") n++; if (f.lng !== "any") n++; if (f.styles.length) n++; if (f.stags.length) n++;
  if (f.sys !== "any" && S.game !== "all" && (f.rmin > 0 || f.rmax < stepLabels(f.sys).length - 1)) n++;
  ["mic", "contacts", "fresh", "rep90", "nons", "sametime"].forEach(k => { if (q[k]) n++; });
  return n;
}
function renderQuick() {
  const n = filterCount();
  $("#quick").innerHTML = `<button class="qc qc-f" data-action="open-filters">${ICON.sliders}${esc(t("filters"))}${n ? `<span class="badge">${n}</span>` : ""}</button>` +
    ["match", "online", "verified", "favs"].map(k => `<button class="qc" data-q="${k}" aria-pressed="${!!S.q[k]}">${k === "match" ? ICON.target : k === "verified" ? ICON.shield : k === "favs" ? ICON.star : ""}${esc(t("q_" + k))}</button>`).join("");
}

/* ================= filters ================= */
function setGame(k) {
  S.game = k; S.f.modes = []; S.f.roles = [];
  S.f.sys = (k === "all" || GAMES[k].systems.length > 1) ? "any" : GAMES[k].systems[0];
  resetRange();
  if (k !== "all") S.stackGame = k;
}
function resetRange() { S.f.rmin = 0; S.f.rmax = S.f.sys === "any" ? 99 : stepLabels(S.f.sys).length - 1; }
function filterBody(pre) {
  const f = S.f, g = S.game;
  let h = `<div class="field"><label class="lbl" for="${pre}-q">${esc(t("search"))}</label><div class="search">${ICON.search}<input class="inp" id="${pre}-q" data-f="q" type="search" autocomplete="off" placeholder="${esc(t("search_ph"))}" value="${esc(f.q)}"></div></div>`;
  h += `<div class="field"><span class="lbl">${esc(t("s_game"))}</span><div class="chips"><button class="chip" data-game="all" aria-pressed="${g === "all"}">${esc(t("all"))}</button>${railOrder().map(k => `<button class="chip" data-game="${k}" aria-pressed="${g === k}">${esc(gshort(k))}</button>`).join("")}</div>${g === "all" ? `<p class="hint">${esc(S.lang === "ru" ? "Выберите игру — появятся режим, ранг и роль." : "Pick a game to filter by mode, rank and role.")}</p>` : ""}</div>`;
  if (g !== "all") {
    const G = GAMES[g];
    h += `<div class="field"><span class="lbl">${esc(t("mode"))}</span><div class="chips">` + Object.keys(G.modes).map(m => `<button class="chip" data-fm="${m}" aria-pressed="${f.modes.includes(m)}">${esc(modeName(g, m))}</button>`).join("") + "</div></div>";
    h += `<div class="field"><span class="lbl">${esc(t("rank"))}</span>`;
    if (G.systems.length > 1) h += `<div class="seg" role="group" aria-label="${esc(t("rank_sys"))}"><button data-fs="any" aria-pressed="${f.sys === "any"}">${esc(t("any_sys"))}</button>` + G.systems.map(s => `<button data-fs="${s}" aria-pressed="${f.sys === s}">${esc(s === "comp" ? (S.lang === "ru" ? "Звания" : "Skill groups") : SYS[s].label[L()])}</button>`).join("") + "</div>";
    if (f.sys === "any") h += `<p class="hint">${esc(t("pick_sys"))}</p>`;
    else {
      const labels = stepLabels(f.sys), opts = sel => labels.map((l, i) => `<option value="${i}"${i === sel ? " selected" : ""}>${esc(l)}</option>`).join("");
      h += `<div class="row2"><select class="inp" data-f="rmin" aria-label="${esc(t("from"))}">${opts(Math.min(f.rmin, labels.length - 1))}</select><select class="inp" data-f="rmax" aria-label="${esc(t("to"))}">${opts(Math.min(f.rmax, labels.length - 1))}</select></div>`;
    }
    h += "</div>";
    h += `<div class="field"><span class="lbl">${esc(t("roles"))}</span><div class="chips">` + Object.keys(G.roles).map(r => `<button class="chip" data-fr="${r}" aria-pressed="${f.roles.includes(r)}">${esc(roleName(g, r))}</button>`).join("") + "</div></div>";
  }
  h += `<div class="field"><span class="lbl">${esc(t("style"))}</span><div class="chips">${STYLES.map(s => `<button class="chip" data-fst="${s}" aria-pressed="${f.styles.includes(s)}">${esc(t("styles")[s])}</button>`).join("")}</div></div>`;
  h += `<div class="field"><span class="lbl">${esc(t("safety"))}</span><div class="chips">${SAFE_TAGS.map(s => `<button class="chip" data-fsg="${s}" aria-pressed="${f.stags.includes(s)}">${esc(t("stags")[s])}</button>`).join("")}</div></div>`;
  h += `<div class="field"><span class="lbl">${esc(S.lang === "ru" ? "Состав стака" : "Stack")}</span><div class="seg" role="group"><button data-fparty="any" aria-pressed="${!PARTY_TAGS.some(x => f.stags.includes(x))}">${esc(S.lang === "ru" ? "Не важно" : "Any")}</button>${PARTY_TAGS.map(s => `<button data-fparty="${s}" aria-pressed="${f.stags.includes(s)}">${esc(t("stags")[s])}</button>`).join("")}</div></div>`;
  h += `<div class="field"><span class="lbl">${esc(t("f_more"))}</span><div class="chips">${["mic", "contacts", "fresh"].map(k => `<button class="chip" data-q="${k}" aria-pressed="${!!S.q[k]}">${esc(t("q_" + k))}</button>`).join("")}</div></div>`;
  h += `<div class="field"><span class="lbl">${esc(t("f_prem"))} <span class="pro">PRO</span></span><div class="chips">${["rep90", "nons", "sametime"].map(k => S.prem ? `<button class="chip" data-q="${k}" aria-pressed="${!!S.q[k]}">${esc(t("q_" + k))}</button>` : `<button class="chip lk" data-action="premium" title="${esc(t("prem_need"))}">${ICON.lock} ${esc(t("q_" + k))}</button>`).join("")}</div></div>`;
  h += `<div class="field"><label class="lbl" for="${pre}-reg">${esc(t("region"))}</label><select class="inp" id="${pre}-reg" data-f="region"><option value="any">${esc(t("any"))}</option>` +
    Object.keys(REGIONS).map(r => `<option value="${r}"${f.region === r ? " selected" : ""}>${esc(regionName(r))}</option>`).join("") + "</select></div>";
  h += `<div class="field"><label class="lbl" for="${pre}-lng">${esc(t("language"))}</label><select class="inp" id="${pre}-lng" data-f="lng"><option value="any">${esc(t("any"))}</option><option value="ru"${f.lng === "ru" ? " selected" : ""}>${esc(t("lang_ru"))}</option><option value="en"${f.lng === "en" ? " selected" : ""}>${esc(t("lang_en"))}</option></select></div>`;
  h += `<button class="btn ghost small" data-action="reset-filters">${ICON.refresh}${esc(t("reset"))}</button>`;
  return h;
}
function renderFilters() { $("#fside").innerHTML = filterBody("fs"); const sh = $("#fsheet"); if (sh) sh.innerHTML = filterBody("fm"); }
function afterFilter() { renderFeed(); renderQuick(); const b = $("#showN"); if (b) b.textContent = t("show_n", filtered().length); }

/* ================= feed ================= */
function filtered() {
  const f = S.f, q = S.q, txt = f.q.trim().toLowerCase(), now = Date.now();
  return activePosts().filter(p => {
    if (S.game !== "all") {
      if (p.game !== S.game) return false;
      if (p.kind !== "sub") {
        if (f.modes.length && !f.modes.includes(p.mode)) return false;
        if (f.sys !== "any") { const rs = [p.r].concat(p.extra || []).filter(r => r.sys === f.sys); if (!rs.some(r => { const s = step(r); return s >= f.rmin && s <= f.rmax; })) return false; }
      }
      if (f.roles.length && !p.roles.some(r => f.roles.includes(r))) return false;
    }
    if (f.styles.length && !f.styles.includes(p.style)) return false;
    if (f.stags.length && !f.stags.every(s => (p.stags || []).includes(s))) return false;
    if (f.region !== "any" && p.region !== f.region) return false;
    if (f.lng !== "any" && !p.langs.includes(f.lng)) return false;
    if (q.online && !p.on) return false;
    if (q.verified && !p.ver) return false;
    if (q.favs && !S.favs.includes(p.id)) return false;
    if (q.mic && !p.mic) return false;
    if (q.contacts && !hasC(p)) return false;
    if (q.fresh && now - p.t0 > 3600000) return false;
    if (q.match && !p.mine && !isMatch(p)) return false;
    if (S.prem && q.rep90 && !p.mine) { const r = repOf(p); if (!r.n || r.up / r.n < 0.9) return false; }
    if (S.prem && q.nons && !p.mine && repOf(p).ns > 0) return false;
    if (S.prem && q.sametime && !p.mine && !overlap(p.when, S.profile.time)) return false;
    if (txt && !(p.nick.toLowerCase().includes(txt) || noteOf(p).toLowerCase().includes(txt))) return false;
    return true;
  }).sort((a, b) => (b.mine ? 1 : 0) - (a.mine ? 1 : 0) || (b.promo ? 1 : 0) - (a.promo ? 1 : 0) || (S.favs.includes(b.id) ? 1 : 0) - (S.favs.includes(a.id) ? 1 : 0) || (b.on ? 1 : 0) - (a.on ? 1 : 0) || b.t0 - a.t0);
}
function expHtml(p) {
  const now = Date.now(), left = p.exp - now, frac = Math.max(0, Math.min(1, left / Math.max(1, p.exp - p.t0)));
  const warn = left < 15 * 60000 || frac < 0.12;
  return `<div class="exp${warn ? " warn" : ""}" data-exp="${p.id}">${ICON.clock}<span class="xbar"><i style="width:${(frac * 100).toFixed(1)}%"></i></span><span class="exp-t">${esc(leftText(left))}</span></div>`;
}
function statusHtml(p) {
  if (p.mine) return `<span class="mine-tag">${esc(t("your_post"))}</span>`;
  if (p.game_on) return `<span class="game-txt">${esc(t("ingame"))}</span>`;
  return p.on ? `<span class="on-txt">${esc(t("online"))}</span>` : "";
}
function needHtml(p) {
  const size = partySize(p), have = Math.min(p.have || 1, size - 1);
  const ps = '<span class="ps" aria-hidden="true">' + '<i class="f"></i>'.repeat(have) + "<i></i>".repeat(size - have) + "</span>";
  return `<span class="need">${ps}<b>${esc(t("need_short", size - have))}</b><span class="rl">${esc(p.roles.map(r => roleName(p.game, r)).join(", "))}</span></span>`;
}
function card(p) {
  if (p.kind === "sub") return subCard(p);
  const G = GAMES[p.game], inStack = S.stacks[p.game].includes(p.id), match = !p.mine && isMatch(p);
  const who = p.mine ? `<span class="n">${esc(p.nick)}</span>` : `<button class="nickbtn" data-action="player" data-id="${p.id}"><span class="n">${esc(p.nick)}</span></button>`;
  const av = p.mine ? avatar(p.nick, false) : `<button class="avbtn" data-action="player" data-id="${p.id}" aria-label="${esc(p.nick)}">${avatar(p.nick, p.on)}</button>`;
  const tagline = p.mine ? `<span class="mine-tag">${esc(t("your_post"))}</span>${S.prem ? '<span class="pro">PRO</span>' : ""}` : (p.game_on ? `<span class="game-txt">${esc(t("ingame"))}</span>` : "") + (p.promo ? `<span class="promo-tag">${esc(t("promo"))}</span>` : "");
  const head = `<div class="c-head">${av}<div class="who"><div class="nick">${who}${p.ver ? `<span class="ver" title="${esc(t("verified"))}">${ICON.shield}</span>` : ""}</div><div class="meta"><span class="gtag"><i></i>${esc(gshort(p.game))}</span><span>${esc(modeName(p.game, p.mode))}</span><span>·</span><span>${esc(rel(p.t0))}</span>${tagline}</div></div>${badge(p.r)}</div>`;
  const note = noteOf(p) ? `<p class="note">${esc(noteOf(p))}</p>` : "";
  let foot;
  if (p.mine) {
    foot = `<div class="c-foot">${needHtml(p)}</div><div class="c-foot">${expHtml(p)}<div class="c-acts">${S.prem ? `<button class="btn small" data-action="bump" data-id="${esc(p.id)}">${ICON.up}${esc(t("bump"))}</button>` : ""}<button class="btn small" data-action="renew" data-id="${esc(p.id)}">${ICON.refresh}${esc(t("renew", durLabel(p.dur)))}</button><button class="iconbtn" data-action="del-post" data-id="${esc(p.id)}" aria-label="${esc(t("del"))}" title="${esc(t("del"))}">${ICON.trash}</button></div></div>`;
  } else {
    foot = `<div class="c-foot">${needHtml(p)}${match ? `<span class="match">${ICON.target}${esc(t("match_tag"))}</span>` : ""}<div class="c-acts"><button class="btn small${inStack ? " on" : ""}" data-action="toggle-stack" data-id="${p.id}" aria-pressed="${inStack}">${inStack ? ICON.check + esc(t("in_stack")) : ICON.plus + esc(t("invite"))}</button><button class="btn primary small" data-action="open-chat" data-id="${p.id}">${ICON.chat}${esc(t("write"))}</button></div></div>`;
  }
  return `<article class="card${p.mine ? " mine" : ""}${p.promo && !p.mine ? " promo" : ""}" data-id="${esc(p.id)}" style="--g:var(${G.color})">${head}${note}${foot}</article>`;
}
function subCard(p) {
  const tm = findTeam(p.team), G = GAMES[p.game], st = tm ? tst(tm) : null, tag = tm ? tm.tag : "?";
  const rq = p.mine ? S.subreq[p.team] : null, n = rq ? rq.cands.length : 0;
  const acts = p.mine ? `<button class="btn small" data-action="goto-myteam" data-id="${p.team}">${esc(t("more"))}</button>`
    : S.subApplied[p.id] ? `<span class="st-chip ok">${esc(t("sub_responded"))}</span>` : `<button class="btn small" data-action="team" data-id="${p.team}">${esc(t("more"))}</button><button class="btn primary small" data-action="sub-respond" data-id="${p.id}">${esc(t("sub_respond"))}</button>`;
  return `<article class="card subc${p.mine ? " mine" : ""}" data-id="${esc(p.id)}" style="--g:var(${G.color})"><div class="c-head"><button class="avbtn" data-action="team" data-id="${p.team}" aria-label="${esc(tag)}"><span class="t-tag">${esc(tag)}</span></button><div class="who"><div class="nick"><span class="n">${esc(t("sub_title", tag))}</span>${p.mine ? `<span class="mine-tag">${esc(t("your_post"))}</span>` : ""}</div><div class="meta"><span class="gtag"><i></i>${esc(gshort(p.game))}</span><span>${esc(t("sub_role", roleName(p.game, p.roles[0])))}</span><span>·</span><span>${esc(whenLabel(p.at))}</span></div></div>${st ? `<div class="rk"><span class="rk-sys">${esc(t("tm_rating"))}</span><span class="rating">${st.rating}</span></div>` : ""}</div>${noteOf(p) ? `<p class="note">${esc(noteOf(p))}</p>` : ""}<div class="c-foot"><span class="need"><span class="st-chip in">${esc(t("sub_tag"))}</span>${p.mine ? `<span>${esc(n ? t("sub_resp_n", n) : t("sub_wait"))}</span>` : ""}</span><div class="c-acts">${acts}</div></div></article>`;
}
function picksList() {
  if (!S.profile.games.length) return [];
  return activePosts().filter(p => !p.mine && p.kind !== "sub" && S.profile.games.includes(p.game)).map(p => {
    const why = []; if (isMatch(p)) why.push("rank"); if (p.style && p.style === S.profile.style) why.push("style"); if (overlap(p.when, S.profile.time)) why.push("time"); if (p.langs.some(l => S.profile.langs.includes(l))) why.push("lang");
    return { p, why, score: (why.includes("rank") ? 3 : 0) + why.length + (p.on ? 1 : 0) };
  }).filter(x => x.why.includes("rank") || x.score >= 4).sort((a, b) => b.score - a.score).slice(0, 4);
}
function pickCard(x) {
  const p = x.p;
  return `<div class="pick" style="--g:var(${GAMES[p.game].color})"><div class="pick-h"><button class="avbtn" data-action="player" data-id="${p.id}" aria-label="${esc(p.nick)}">${avatar(p.nick, p.on)}</button><div class="who"><div class="nick"><button class="nickbtn" data-action="player" data-id="${p.id}"><span class="n">${esc(p.nick)}</span></button>${p.ver ? `<span class="ver">${ICON.shield}</span>` : ""}</div><div class="meta"><span class="gtag"><i></i>${esc(gshort(p.game))}</span>${miniRank(p.r)}</div></div></div><div class="pick-f"><span class="why">${esc(x.why.map(w => t("picks_why")[w]).join(" · "))}</span><button class="btn primary small" data-action="open-chat" data-id="${p.id}">${esc(t("write"))}</button></div></div>`;
}
function renderFeed() {
  const items = filtered();
  $("#count").textContent = t("found", items.length);
  $("#list").innerHTML = items.length ? items.map(card).join("") :
    `<div class="empty"><span>${esc(t("nothing"))}</span><button class="btn small" data-action="reset-all">${ICON.refresh}${esc(t("reset"))}</button></div>`;
  renderSetup();
}
function updateTimers() {
  $$("[data-exp]").forEach(el => {
    const p = findPost(el.dataset.exp); if (!p) return;
    const tmp = document.createElement("div"); tmp.innerHTML = expHtml(p);
    el.replaceWith(tmp.firstElementChild);
  });
}

/* ================= setup + lobby ================= */
function renderSetup() {
  const el = $("#setup"); if (!el) return;
  if (!S.profile.onboarded && !S.setupHidden) { el.innerHTML = `<div class="slim">${ICON.target}<span>${esc(t("ob_cta"))}</span><button class="btn primary small" data-action="ob-start">${esc(t("ob_go"))}</button><button class="btn ghost small" data-action="hide-setup">${esc(t("dismiss"))}</button></div>`; return; }
  const pk = S.game === "all" ? picksList() : [];
  el.innerHTML = pk.length ? `<section class="picks"><h2 class="sec">${esc(t("picks"))}</h2><div class="picks-row">${pk.map(pickCard).join("")}</div></section>` : "";
}
function renderStack() {
  if (S.game === "all" && !S.stacks[S.stackGame].length) { const any = GAME_KEYS.find(k => S.stacks[k].length); if (!any) { $("#stackbar").innerHTML = ""; return; } S.stackGame = any; }
  const g = S.game === "all" ? S.stackGame : S.game, G = GAMES[g], ids = S.stacks[g], filled = ids.length + 1, need = G.size - filled, vc = S.voice[g];
  let slots = `<span class="slot me" title="${esc(S.profile.nick || t("you"))}">${S.lang === "ru" ? "ВЫ" : "YOU"}</span>`;
  ids.forEach(id => { const p = findPost(id); if (p) slots += `<button class="slot filled" data-action="player" data-id="${id}" title="${esc(p.nick)}">${avatar(p.nick, false)}</button>`; });
  for (let i = filled; i < G.size; i++) slots += '<span class="slot" aria-hidden="true">+</span>';
  const msg = need <= 0 ? t("stack_full") : ids.length ? t("stack_need", need) : t("stack_empty");
  const acts = `<button class="btn small" data-action="invite-link" data-kind="stack" data-id="${g}">${ICON.link}${esc(t("invite_link"))}</button>` +
    (ids.length ? (vc ? "" : `<button class="btn small" data-action="voice" data-g="${g}">${ICON.headset}Discord</button>`) + `<button class="btn small" data-action="rate-stack" data-g="${g}">${ICON.up}${esc(t("rate"))}</button><button class="btn ghost small" data-action="clear-stack" data-g="${g}">${esc(t("clear"))}</button>` : "") +
    (need <= 0 ? `<button class="btn primary small" data-action="group-chat">${ICON.chat}${esc(t("group_chat"))}</button>` : "");
  const voice = vc ? `<div class="voice">${ICON.headset}<span class="ch">${esc(vc.name)}</span><span class="hint">${esc(t("voice_note"))}</span><button class="btn small" data-action="voice-open">${esc(t("voice_open"))}</button><button class="btn ghost small" data-action="voice-close" data-g="${g}">${esc(t("voice_close"))}</button></div>` : "";
  $("#stackbar").innerHTML = `<div class="lobby${need <= 0 ? " full" : ""}" id="lobby" style="--g:var(${G.color})"><div class="lobby-row"><span class="lobby-title"><i class="dot"></i>${esc(t("stack"))} · ${esc(gshort(g))} <span class="mono">${filled}/${G.size}</span></span><div class="slots">${slots}</div></div><div class="lobby-row"><p class="msg">${esc(msg)}</p><span class="lobby-acts" style="flex-wrap:wrap">${acts}</span></div>${voice}</div>`;
}

/* ================= chat ================= */
function unreadTotal() { return Object.keys(S.chats).filter(id => !S.blocked.includes(id)).reduce((a, id) => a + (S.chats[id].unread || 0), 0); }
function renderUnread() { const n = unreadTotal(); $$("[data-unread]").forEach(b => { b.hidden = !n; b.textContent = n; }); }
function lastT(id) { const m = S.chats[id].msgs; return m.length ? m[m.length - 1].t : 0; }
function chatVisible(id) { return S.active === id && (isWide() || S.view === "chats"); }
function renderChat() {
  const box = $("#chatbox"), id = S.active;
  if (!id || !S.chats[id] || !findPost(id)) {
    S.active = null;
    const ids = Object.keys(S.chats).filter(cid => findPost(cid) && !S.blocked.includes(cid)).sort((a, b) => lastT(b) - lastT(a));
    box.innerHTML = `<div class="ch-head"><h2 class="sec">${esc(t("chats"))}</h2></div>` + (ids.length ? '<div class="convs">' + ids.map(cid => {
      const p = findPost(cid), c = S.chats[cid], last = c.msgs[c.msgs.length - 1];
      return `<button class="conv" data-action="open-chat" data-id="${cid}">${avatar(p.nick, p.on)}<span class="txt"><span class="nick"><span class="n">${esc(p.nick)}</span></span><span class="last">${last ? (last.me ? esc(t("you_prefix")) : "") + esc(last.text) : ""}</span></span><span class="side"><span class="tm">${last ? clock(last.t) : ""}</span>${c.unread ? `<span class="badge">${c.unread}</span>` : ""}</span></button>`;
    }).join("") + "</div>" : `<div class="empty" style="margin:16px">${esc(t("chats_empty"))}</div>`);
    renderUnread(); return;
  }
  const p = findPost(id), c = S.chats[id], blocked = S.blocked.includes(id);
  if (chatVisible(id)) c.unread = 0;
  const inStack = S.stacks[p.game].includes(p.id), ci = contactsInner(p);
  const bottom = blocked ? `<div class="blocked-bar"><span>${esc(t("blocked_chat"))}</span><button class="btn small" data-action="unblock" data-id="${p.id}">${esc(t("unblock"))}</button></div>` :
    `<div class="typing" id="typing">${S.typing[id] ? esc(p.nick + " " + t("typing")) : ""}</div>` +
    `<div class="qr">${t("quick_r").map(q => `<button type="button" data-action="qr" data-text="${esc(q)}">${esc(q)}</button>`).join("")}<button type="button" class="cbtn" data-action="send-contacts">${ICON.at}${esc(t("my_contacts"))}</button>${interacted(id) ? `<button type="button" data-action="rate" data-id="${p.id}">${ICON.up}${esc(S.rated[id] ? t("rated_already") : t("rate"))}</button>` : ""}</div>` +
    `<form class="composer" id="composer" autocomplete="off"><input class="inp" id="msgInput" maxlength="500" placeholder="${esc(t("msg_ph"))}" aria-label="${esc(t("msg_ph"))}"><button class="btn primary" type="submit" aria-label="${esc(t("send"))}">${ICON.send}</button></form>`;
  box.innerHTML = `<div class="room"><div class="ch-head"><button class="iconbtn" data-action="close-chat" aria-label="${esc(t("back"))}">${ICON.back}</button><button class="avbtn" data-action="player" data-id="${p.id}" aria-label="${esc(p.nick)}">${avatar(p.nick, p.on)}</button><div class="who"><div class="nick"><button class="nickbtn" data-action="player" data-id="${p.id}"><span class="n">${esc(p.nick)}</span></button></div><div class="meta"><span class="gtag" style="--g:var(${GAMES[p.game].color})"><i></i>${esc(gshort(p.game))}</span>${miniRank(p.r)}</div></div>` +
    (blocked ? "" : `<button class="btn small${inStack ? " on" : ""}" data-action="toggle-stack" data-id="${p.id}">${inStack ? ICON.check + esc(t("in_stack")) : ICON.plus + esc(t("invite"))}</button>`) + `</div>${ci ? `<div class="ch-c">${ci}</div>` : ""}` +
    `<div class="msgs" id="msgs">${c.msgs.map(m => m.sys ? `<div class="m sys">${esc(m.text)}</div>` : `<div class="m ${m.me ? "me" : "them"}">${esc(m.text)}<span class="tm">${clock(m.t)}</span></div>`).join("")}</div>${bottom}</div>`;
  const ms = $("#msgs"); ms.scrollTop = ms.scrollHeight;
  renderUnread(); save();
}
function openChat(id) {
  if (!S.chats[id]) S.chats[id] = { msgs: [], unread: 0, n: 0 };
  S.active = id;
  if (!isWide()) setView("chats"); else renderChat();
  const i = $("#msgInput"); if (i && isWide()) i.focus();
}
const SCAM_RE = /парол|password|steam ?guard|код подтвержд|скин|skins?\b|предмет|item|трейд|trade|обмен|деньг|money|переве|оплат|pay\b|карт[уаы]\b|card/i;
function scamCheck(id, text) { const c = S.chats[id]; if (c && !c.warned && SCAM_RE.test(text)) { c.warned = true; c.msgs.push({ sys: true, text: t("scam_warn"), t: Date.now() }); } }
function sendMsg(text) {
  const id = S.active; if (!id || !String(text).trim() || S.blocked.includes(id)) return;
  S.chats[id].msgs.push({ me: true, text: String(text).trim(), t: Date.now() });
  scamCheck(id, String(text));
  save(); renderChat(); botReply(id, String(text));
  if (isWide()) { const i = $("#msgInput"); if (i) i.focus(); }
}
function botReply(id, text) {
  const p = findPost(id), c = S.chats[id];
  if (!p || S.typing[id]) return;
  S.typing[id] = true;
  if (S.active === id) { const ty = $("#typing"); if (ty) ty.textContent = p.nick + " " + t("typing"); }
  setTimeout(() => {
    S.typing[id] = false;
    if (S.blocked.includes(id)) return;
    const lang = p.langs.includes(S.lang) ? S.lang : p.langs[0];
    let reply;
    if (/disc|дис|дс\b|тг|tg|teleg|телег|контакт|contact/i.test(text) && hasC(p)) {
      reply = (p.cvis === "stack" && !S.stacks[p.game].includes(p.id)) ? T[lang].c_wait_stack : contactLine(p.c);
    } else {
      const list = REPLIES[lang]; reply = list[Math.min(c.n || 0, list.length - 1)].replace("{plat}", GAMES[p.game].plat); c.n = (c.n || 0) + 1;
    }
    c.msgs.push({ me: false, text: reply, t: Date.now() });
    if (!chatVisible(id)) { c.unread = (c.unread || 0) + 1; notify("msg", t("n_msg", p.nick), { type: "chat", id }); }
    save();
    if (chatVisible(id) || !S.active) renderChat(); else renderUnread();
    renderFeed();
  }, 1200 + Math.random() * 1300);
}

/* ================= views ================= */
function setView(v) {
  S.view = v;
  $("#app").dataset.view = v;
  $$("[data-nav]").forEach(b => { if (b.closest(".topnav") || b.closest("nav.bottom")) b.setAttribute("aria-current", String(b.dataset.nav === v)); });
  if (v === "profile") renderProfile();
  if (v === "teams") renderTeams();
  if (v === "admin") renderAdmin();
  if (v === "feed" || v === "teams") renderRail();
  if (v === "chats" || isWide()) renderChat();
  measure();
  window.scrollTo(0, 0);
}
function renderPage() { if (S.view === "profile") renderProfile(); else if (S.view === "teams") renderTeams(); else if (S.view === "admin") renderAdmin(); }
function renderAll() { applyLang(); renderRail(); renderQuick(); renderFilters(); renderSetup(); renderStack(); renderFeed(); renderChat(); renderPage(); }

/* ================= sheets ================= */
function openSheet(title, body, foot, onMount) {
  const root = $("#modalRoot");
  root.innerHTML = `<div class="overlay" id="overlay"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-h"><h3 class="ttl">${esc(title)}</h3><button class="iconbtn" data-action="close-modal" aria-label="${esc(t("close"))}">${ICON.x}</button></div><div class="sheet-b" id="sheetBody">${body}</div>${foot ? `<div class="sheet-f">${foot}</div>` : ""}</div></div>`;
  const ov = $("#overlay");
  ov.addEventListener("click", e => { if (e.target === ov) closeModal(); });
  if (onMount) onMount(ov);
  document.body.style.overflow = "hidden";
}
function closeModal() { $("#modalRoot").innerHTML = ""; document.body.style.overflow = ""; F = null; OB = null; renderFilters(); }
function filtersSheet() { openSheet(t("filters"), `<div id="fsheet" style="display:grid;gap:18px">${filterBody("fm")}</div>`, `<button class="btn primary" data-action="close-modal" id="showN">${esc(t("show_n", filtered().length))}</button>`); }

/* ---------- player sheet ---------- */
function playerSheet(id) {
  const p = findPost(id); if (!p) return;
  const G = GAMES[p.game], fav = S.favs.includes(id), blk = S.blocked.includes(id), inStack = S.stacks[p.game].includes(id), r = repOf(p);
  const pct = r.n ? Math.round(r.up / r.n * 100) : 0;
  const ranks = [p.r].concat(p.extra || []).map(rk => `<div class="rrow">${badge(rk)}<span style="margin-left:auto">${p.ver && rk === p.r ? `<span class="vchip ok">${ICON.shield}${esc(SYS[rk.sys].src ? t("v_api", SYS[rk.sys].src) : t("v_shot"))}</span>` : `<span class="vchip no">${esc(t("v_none"))}</span>`}</span></div>`).join("");
  const repTags = r.tags.map(tg => `<span>${esc(t("rep_tags")[tg])}</span>`).join("");
  const tags = `${p.style ? `<span class="sty">${esc(t("styles")[p.style])}</span>` : ""}${p.roles.map(x => `<span class="role">${esc(roleName(p.game, x))}</span>`).join("")}${(p.stags || []).map(s => `<span class="safe">${esc(t("stags")[s])}</span>`).join("")}<span>${ICON.globe}${esc(regionName(p.region))} · ${esc(p.langs.map(x => x.toUpperCase()).join("/"))}</span><span>${p.mic ? ICON.mic + esc(t("mic")) : ICON.nomic + esc(t("no_mic"))}</span>${(p.when || []).map(w => `<span>${ICON.clock}${esc(t("times")[w])}</span>`).join("")}`;
  const body = `<div class="ph">${avatar(p.nick, p.on)}<div class="who"><div class="nick"><span class="n">${esc(p.nick)}</span>${p.ver ? `<span class="ver">${ICON.shield}</span>` : ""}${statusHtml(p)}</div><div class="meta"><span class="gtag" style="--g:var(${G.color})"><i></i>${esc(G.name)}</span><span>${esc(modeName(p.game, p.mode))}</span>${r.n ? `<span>·</span>${repHtml(p)}` : ""}</div></div></div>
<div class="pacts">${blk ? `<button class="btn small" data-action="unblock" data-id="${id}">${esc(t("unblock"))}</button>` : `<button class="btn primary small" data-action="open-chat" data-id="${id}">${ICON.chat}${esc(t("write"))}</button>${p.friend ? "" : `<button class="btn small${inStack ? " on" : ""}" data-action="toggle-stack" data-id="${id}">${inStack ? ICON.check + esc(t("in_stack")) : ICON.plus + esc(t("invite"))}</button>`}<button class="btn small${fav ? " on" : ""}" data-action="fav" data-id="${id}" aria-pressed="${fav}">${ICON.star}${esc(fav ? t("fav_on") : t("fav_add"))}</button><button class="btn small" data-action="share" data-kind="player" data-id="${id}">${ICON.link}${esc(t("share"))}</button>`}</div>
${p.exp > Date.now() ? `<section class="blk"><h4>${esc(t("p_post"))}</h4>${noteOf(p) ? `<p class="note" style="margin:0">${esc(noteOf(p))}</p>` : ""}<div class="tags">${tags}</div>${contactsHtml(p)}${expHtml(p)}</section>` : ""}
<section class="blk"><h4>${esc(t("p_ranks"))}</h4>${ranks}</section>
<section class="blk"><h4>${esc(t("p_stats"))} · ${esc(G.name)}</h4>${statsHtml(p.id, p.game)}</section>
<section class="blk"><h4>${esc(t("p_rep"))}</h4>${r.n ? `<div class="grp">${repHtml(p)}</div><div class="repbar" aria-hidden="true"><i style="width:${pct}%"></i></div>${repTags ? `<div class="favs">${repTags}</div>` : ""}` : `<p class="hint">${esc(t("rep_none"))}</p>`}${interacted(id) && !blk ? `<button class="btn small" style="justify-self:start" data-action="rate" data-id="${id}">${ICON.up}${esc(S.rated[id] ? t("rated_already") : t("rate"))}</button>` : `<p class="hint">${esc(t("rate_need"))}</p>`}</section>
<div class="actrow"><button class="btn ghost small" data-action="report" data-id="${id}">${ICON.flag}${esc(t("report"))}</button>${blk ? "" : `<button class="btn ghost small danger" data-action="block" data-id="${id}">${ICON.ban}${esc(t("block"))}</button>`}</div>`;
  openSheet(p.nick, body, "");
}
function playerSheetRefresh(id) { const o = $("#overlay"); if (o && o.querySelector(".ph")) playerSheet(id); }

/* ---------- rate ---------- */
let RATE = null;
function rateSheet(ids) {
  ids = ids.filter(id => findPost(id));
  if (!ids.length) return;
  RATE = {}; ids.forEach(id => { RATE[id] = S.rated[id] ? JSON.parse(JSON.stringify(S.rated[id])) : { up: null, tags: [], ns: false }; });
  const build = () => ids.map(id => {
    const p = findPost(id), st = RATE[id], pool = st.up === false ? REP_NEG : REP_POS;
    return `<div class="rate-p"><div class="row">${avatar(p.nick, false)}<b>${esc(p.nick)}</b><div class="thumbs"><button class="up" data-rt="up" data-id="${id}" aria-pressed="${st.up === true}">${ICON.up}${esc(t("rate_up"))}</button><button class="down" data-rt="down" data-id="${id}" aria-pressed="${st.up === false}">${ICON.down}${esc(t("rate_down"))}</button></div></div>
${st.up === null ? "" : `<div class="chips">${pool.map(tg => `<button class="chip" data-rtag="${tg}" data-id="${id}" aria-pressed="${st.tags.includes(tg)}">${esc(t("rep_tags")[tg])}</button>`).join("")}</div>`}
<label class="check"><input type="checkbox" data-rns="${id}"${st.ns ? " checked" : ""}> ${esc(t("rate_ns"))}</label></div>`;
  }).join("");
  openSheet(t("rate_title"), `<div id="rateBody" style="display:grid;gap:10px">${build()}</div>`, `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="rateSend">${esc(t("rate_send"))}</button>`, ov => {
    ov.addEventListener("click", e => {
      const b = e.target.closest("[data-rt]"), tg = e.target.closest("[data-rtag]");
      if (b) { const st = RATE[b.dataset.id], up = b.dataset.rt === "up"; if (st.up !== up) st.tags = []; st.up = up; $("#rateBody").innerHTML = build(); return; }
      if (tg) { const st = RATE[tg.dataset.id], k = tg.dataset.rtag, i = st.tags.indexOf(k); i >= 0 ? st.tags.splice(i, 1) : st.tags.push(k); tg.setAttribute("aria-pressed", String(i < 0)); return; }
      if (e.target.closest("#rateSend")) {
        const done = ids.filter(id => RATE[id].up !== null || RATE[id].ns);
        if (!done.length) { toast(t("rate_pick")); return; }
        done.forEach(id => { const st = RATE[id]; if (st.ns && st.up === null) st.up = false; S.rated[id] = st; });
        save(); closeModal(); renderFeed(); renderChat(); toast(t("rated"));
      }
    });
    ov.addEventListener("change", e => { const id = e.target.dataset.rns; if (id) RATE[id].ns = e.target.checked; });
  });
}

/* ---------- post form ---------- */
let F = null;
function newForm(fromArchive) {
  const pr = S.profile, game = fromArchive ? fromArchive.game : (S.game !== "all" ? S.game : (pr.games[0] || S.stackGame));
  const mode = fromArchive ? fromArchive.mode : Object.keys(GAMES[game].modes)[0];
  const sys = GAMES[game].sysOf(mode);
  return { game, mode, r: fromArchive ? fromArchive.r : (myRank(game, sys) || defRank(sys)), roles: fromArchive ? fromArchive.roles.slice() : (pr.roles[game] || []).slice(), have: fromArchive ? fromArchive.have : 1,
    region: fromArchive ? fromArchive.region : pr.region, mic: fromArchive ? fromArchive.mic : true, note: fromArchive ? noteOf(fromArchive) : "", dur: fromArchive ? (fromArchive.dur === PREM_DUR && !S.prem ? 4320 : fromArchive.dur) : 180,
    style: fromArchive ? (fromArchive.style || pr.style) : pr.style, stags: fromArchive ? (fromArchive.stags || []).filter(s => s !== "adult" || pr.adult) : [], showC: true, err: "" };
}
function defRank(sys) { const s = SYS[sys]; if (s.kind !== "tiers") return null; const tv = Math.min(3, s.tiers.ru.length - 1); const r = { sys, t: tv }; if (hasSub(sys, tv)) r.s = s.subDef; return r; }
function formBody() {
  const G = GAMES[F.game], sys = G.sysOf(F.mode), size = G.msize[F.mode] || G.size, pr = S.profile;
  F.have = Math.max(1, Math.min(F.have, size - 1));
  const sec = (title, inner) => `<section class="fsec"><h4>${esc(title)}</h4>${inner}</section>`;
  let h = "";
  if (F.err === "nick") h += `<p class="ferr">${esc(t("need_nick"))}</p>`;
  if (!pr.nick) h += `<div class="field"><label class="lbl" for="pf2-nick">${esc(t("nick"))}</label><input class="inp" id="pf2-nick" maxlength="24" placeholder="${esc(t("nick_ph"))}" value="${esc(F.nick || "")}"></div>`;
  h += sec(t("s_game"), `<div class="gpick">${railOrder().map(k => `<button type="button" data-pg="${k}" aria-pressed="${k === F.game}" style="--g:var(${GAMES[k].color})"><i></i>${esc(gshort(k))}</button>`).join("")}</div>`);
  h += sec(t("s_mode"), `<div class="chips">${Object.keys(G.modes).map(m => `<button type="button" class="chip" data-pm="${m}" aria-pressed="${m === F.mode}">${esc(modeName(F.game, m))}</button>`).join("")}</div>`);
  h += sec(t("s_rank") + " · " + sysLabel(sys), rankInput("pfr", sys, F.r, false) + (F.err === "rank" ? `<p class="ferr">${esc(t("need_rank"))}</p>` : ""));
  h += sec(t("s_roles"), `<div class="chips">${Object.keys(G.roles).map(r => `<button type="button" class="chip" data-prl="${r}" aria-pressed="${F.roles.includes(r)}">${esc(roleName(F.game, r))}</button>`).join("")}</div>`);
  h += sec(t("s_group"), `<div class="grp"><span class="hint" style="color:var(--fg-2)">${esc(S.lang === "ru" ? "Сколько игроков ищете" : "How many players you need")}</span><span class="stepper"><button type="button" data-have="1"${F.have >= size - 1 ? " disabled" : ""} aria-label="−">−</button><output class="mono">${size - F.have}</output><button type="button" data-have="-1"${F.have <= 1 ? " disabled" : ""} aria-label="+">+</button></span><span class="hint">${esc(S.lang === "ru" ? "В команде " + size + " — можно искать и одного." : "Team of " + size + " — you can look for just one.")}</span></div>
<div class="row2"><div class="field"><label class="lbl" for="pf2-reg">${esc(t("region"))}</label><select class="inp" id="pf2-reg">${Object.keys(REGIONS).map(r => `<option value="${r}"${F.region === r ? " selected" : ""}>${esc(regionName(r))}</option>`).join("")}</select></div>
<label class="check" style="align-self:end;padding-bottom:10px"><input type="checkbox" id="pf2-mic"${F.mic ? " checked" : ""}> ${esc(t("mic"))}</label></div>`);
  h += sec(t("style"), `<div class="seg" role="group" aria-label="${esc(t("style"))}">${STYLES.map(s => `<button type="button" data-pst="${s}" aria-pressed="${F.style === s}">${esc(t("styles")[s])}</button>`).join("")}</div>
<div class="chips">${SAFE_TAGS.map(s => `<button type="button" class="chip" data-psg="${s}" aria-pressed="${F.stags.includes(s)}"${s === "adult" && !pr.adult ? " disabled" : ""}>${esc(t("stags")[s])}</button>`).join("")}</div>${pr.adult ? "" : `<p class="hint">${esc(t("adult_need"))}</p>`}
<div class="field" style="margin-top:12px"><span class="lbl">${esc(S.lang === "ru" ? "Состав стака" : "Stack")}</span><div class="seg" role="group"><button type="button" data-pparty="any" aria-pressed="${!PARTY_TAGS.some(x => F.stags.includes(x))}">${esc(S.lang === "ru" ? "Не важно" : "Any")}</button>${PARTY_TAGS.map(x => `<button type="button" data-pparty="${x}" aria-pressed="${F.stags.includes(x)}">${esc(t("stags")[x])}</button>`).join("")}</div></div>`);
  h += sec(t("s_note"), `<textarea class="inp" id="pf2-note" maxlength="200" placeholder="${esc(t("note_ph"))}">${esc(F.note)}</textarea><div class="counter" id="pf2-cnt">${F.note.length}/200</div>`);
  h += sec(t("s_contacts"), `<div class="cgrid"><div class="field"><label class="lbl" for="pf2-dc">Discord</label><div class="pre"><span>${ICON.headset}</span><input class="inp mono" id="pf2-dc" autocapitalize="off" spellcheck="false" maxlength="40" placeholder="${esc(t("dc_ph"))}" value="${esc(F.dc != null ? F.dc : pr.dc)}"></div></div>
<div class="field"><label class="lbl" for="pf2-tg">Telegram</label><div class="pre"><span>@</span><input class="inp mono" id="pf2-tg" autocapitalize="off" spellcheck="false" maxlength="60" placeholder="${esc(t("tg_ph"))}" value="${esc(F.tg != null ? F.tg : pr.tg)}"></div></div></div>
${F.err === "dc" ? `<p class="ferr">${esc(t("dc_err"))}</p>` : ""}${F.err === "tg" ? `<p class="ferr">${esc(t("tg_err"))}</p>` : ""}
<label class="check"><input type="checkbox" id="pf2-showc"${F.showC ? " checked" : ""}> ${esc(t("show_c"))}</label><p class="hint">${esc(t("c_from_profile"))} ${esc(t("cvis_note")[pr.cvis])}</p>`);
  h += sec(t("s_time"), `<div class="seg" role="group" aria-label="${esc(t("s_time"))}">${DURS.concat(PREM_DUR).map(d => `<button type="button" data-pd="${d}" aria-pressed="${d === F.dur}"${d === PREM_DUR && !S.prem ? ' class="lk"' : ""}>${d === PREM_DUR && !S.prem ? ICON.lock + " " : ""}${esc(durLabel(d))}</button>`).join("")}</div><p class="hint">${esc(t("dur_hint"))}</p>
<details class="how"><summary>${esc(t("how_exp"))}</summary><ul class="rules">${t("exp_rules").map(r => `<li>${esc(r)}</li>`).join("")}</ul></details>`);
  return h;
}
function readFormInputs() {
  if (!F) return;
  const v = id => document.getElementById(id);
  if (v("pf2-nick")) F.nick = v("pf2-nick").value;
  if (v("pf2-note")) F.note = v("pf2-note").value;
  if (v("pf2-reg")) F.region = v("pf2-reg").value;
  if (v("pf2-mic")) F.mic = v("pf2-mic").checked;
  if (v("pf2-showc")) F.showC = v("pf2-showc").checked;
  if (v("pf2-dc")) F.dc = v("pf2-dc").value;
  if (v("pf2-tg")) F.tg = v("pf2-tg").value;
  const sys = GAMES[F.game].sysOf(F.mode);
  if (document.getElementById("pfr-" + (SYS[sys].kind === "tiers" ? "t" : "v"))) F.r = readRank("pfr", sys);
}
function rerenderForm() { const b = $("#sheetBody"); if (!b || !F) return; const top = b.scrollTop; b.innerHTML = formBody(); b.scrollTop = top; }
function postSheet(fromArchive) {
  F = newForm(fromArchive);
  openSheet(t("new_post"), formBody(), `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" data-action="publish">${esc(t("publish"))}</button>`, ov => {
    ov.addEventListener("click", e => {
      const pg = e.target.closest("[data-pg]"), pm = e.target.closest("[data-pm]"), prl = e.target.closest("[data-prl]"), hv = e.target.closest("[data-have]"), pd = e.target.closest("[data-pd]"), pst = e.target.closest("[data-pst]"), psg = e.target.closest("[data-psg]");
      if (!(pg || pm || prl || hv || pd || pst || psg) || !F) return;
      readFormInputs();
      if (pd && +pd.dataset.pd === PREM_DUR && !S.prem) { toast(t("prem_need"), { label: t("prem_more"), fn: () => { closeModal(); premiumSheet(); } }); return; }
      if (pg) { F.game = pg.dataset.pg; F.mode = Object.keys(GAMES[F.game].modes)[0]; F.roles = (S.profile.roles[F.game] || []).slice(); const sys = GAMES[F.game].sysOf(F.mode); F.r = myRank(F.game, sys) || defRank(sys); }
      if (pm) { const before = GAMES[F.game].sysOf(F.mode); F.mode = pm.dataset.pm; const sys = GAMES[F.game].sysOf(F.mode); if (sys !== before) F.r = myRank(F.game, sys) || defRank(sys); }
      if (prl) { const r = prl.dataset.prl, i = F.roles.indexOf(r); i >= 0 ? F.roles.splice(i, 1) : F.roles.push(r); }
      if (hv) F.have += +hv.dataset.have;
      if (pd) F.dur = +pd.dataset.pd;
      if (pst) F.style = pst.dataset.pst;
      if (psg) { const s = psg.dataset.psg, i = F.stags.indexOf(s); i >= 0 ? F.stags.splice(i, 1) : F.stags.push(s); }
      const ppt = e.target.closest("[data-pparty]");
      if (ppt) { F.stags = F.stags.filter(x => !PARTY_TAGS.includes(x)); if (ppt.dataset.pparty !== "any") F.stags.push(ppt.dataset.pparty); rerenderForm(); return; }
      F.err = ""; rerenderForm();
    });
    ov.addEventListener("input", e => { if (e.target.id === "pf2-note") $("#pf2-cnt").textContent = e.target.value.length + "/200"; });
  });
}
function doPublish() {
  if (!F) return;
  readFormInputs();
  const pr = S.profile;
  if (!pr.nick) { const n = (F.nick || "").trim(); if (!n) { F.err = "nick"; rerenderForm(); $("#sheetBody").scrollTop = 0; return; } pr.nick = n.slice(0, 24); }
  const dc = normDc(F.dc != null ? F.dc : pr.dc), tg = normTg(F.tg != null ? F.tg : pr.tg);
  if (dc && !DC_RE.test(dc)) { F.err = "dc"; rerenderForm(); return; }
  if (tg && !TG_RE.test(tg)) { F.err = "tg"; rerenderForm(); return; }
  pr.dc = dc; pr.tg = tg;
  if (!F.r) { F.err = "rank"; rerenderForm(); return; }
  const prev = pr.ranks[F.game][F.r.sys];
  if (pr.ver[F.r.sys] !== "api" && (!prev || JSON.stringify(prev) !== JSON.stringify(F.r))) { pr.ranks[F.game][F.r.sys] = F.r; delete pr.ver[F.r.sys]; delete pr.pending[F.r.sys]; }
  pr.region = F.region;
  F.note = F.note.trim().slice(0, 200);
  const replaced = publish(F);
  const g = F.game;
  closeModal();
  if (S.game !== "all" && S.game !== g) setGame(g);
  setView("feed"); renderAll();
  toast(replaced ? t("posted") + ". " + t("replaced") : t("posted"));
}

/* ---------- report / reset ---------- */
function reportSheet(id) {
  const p = findPost(id); if (!p) return;
  const rs = t("reasons");
  openSheet(t("report_title") + " · " + p.nick, `<div style="display:grid;gap:8px">${Object.keys(rs).map((k, i) => `<label class="reason"><input type="radio" name="rr" value="${k}"${i === 0 ? " checked" : ""}> ${esc(rs[k])}</label>`).join("")}</div><label class="check"><input type="checkbox" id="rhide"> ${esc(t("report_block"))}</label>`,
    `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="rsend">${esc(t("report_send"))}</button>`, ov => {
      ov.querySelector("#rsend").addEventListener("click", () => {
        const reason = (ov.querySelector('input[name="rr"]:checked') || {}).value || "toxic", hide = ov.querySelector("#rhide").checked;
        S.mod.reports.unshift({ id: "r" + Date.now(), target: id, reason, from: S.profile.nick || t("a_you"), t: Date.now(), mine: true });
        if (hide && !S.blocked.includes(id)) { S.blocked.push(id); if (S.active === id) S.active = null; }
        save(); closeModal(); renderRail(); renderFeed(); renderChat(); if (S.view === "admin") renderAdmin();
        toast(t("reported"), { label: t("nav_admin"), fn: () => setView("admin") });
      });
    });
}
function resetSheet() {
  openSheet(t("reset_demo"), `<p style="margin:0">${esc(t("reset_confirm"))}</p>`, `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="doReset">${esc(t("yes_reset"))}</button>`, ov => {
    ov.querySelector("#doReset").addEventListener("click", () => {
      try { localStorage.removeItem(KEY); } catch (e) {}
      location.reload();
    });
  });
}

/* ---------- accounts / verification / telegram / notifications ---------- */
function accSheet(k) {
  const A = ACC[k];
  const body = `<p style="margin:0">${esc(t("acc_demo"))}</p><div class="favs">${A.games.map(g => `<span>${esc(gname(g))}</span>`).join("")}</div>${k === "pubg" ? `<div class="field"><label class="lbl" for="pubgNick">${esc(t("pubg_nick"))}</label><input class="inp mono" id="pubgNick" maxlength="24" value="${esc(S.profile.pubgNick || S.profile.nick)}"></div>` : ""}`;
  openSheet(t("acc_t", A.name), body, `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="accGo">${esc(t("connect"))}</button>`, ov => {
    ov.querySelector("#accGo").addEventListener("click", () => {
      if (k === "pubg") { const n = ov.querySelector("#pubgNick").value.trim(); if (!n) { toast(t("pubg_nick_need")); return; } S.profile.pubgNick = n; }
      S.profile.acc[k] = Date.now();
      let any = false;
      A.sys.forEach(sys => { const g = SYS_GAME[sys]; if (!S.profile.games.includes(g)) return; any = true; if (!S.profile.ranks[g][sys]) S.profile.ranks[g][sys] = Object.assign({}, IMPORT[sys]); S.profile.ver[sys] = "api"; delete S.profile.pending[sys]; });
      S.posts.forEach(p => { if (S.profile.ver[p.r.sys]) p.ver = true; });
      save(); closeModal(); renderProfile(); renderFeed();
      toast(any ? t("acc_ok", A.name) : t("acc_need_game", A.games.map(gname).join(" / ")));
    });
  });
}
function shotSheet(game, sys) {
  const r = myRank(game, sys);
  if (!r) { toast(t("shot_need")); return; }
  let img = null;
  openSheet(t("shot_title"), `<p style="margin:0">${esc(t("shot_text"))}</p><div class="rrow">${badge(r)}</div><label class="btn" style="justify-self:start">${ICON.image}${esc(t("shot_pick"))}<input type="file" accept="image/*" id="shotFile" hidden></label><div id="shotPrev"></div>`,
    `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="shotSend">${esc(t("shot_send"))}</button>`, ov => {
      ov.querySelector("#shotFile").addEventListener("change", e => {
        const f = e.target.files && e.target.files[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = () => {
          const im = new Image();
          im.onload = () => { const w = Math.min(360, im.width), h = Math.round(im.height * w / im.width); const cv = document.createElement("canvas"); cv.width = w; cv.height = h; cv.getContext("2d").drawImage(im, 0, 0, w, h); try { img = cv.toDataURL("image/jpeg", 0.6); } catch (er) { img = null; } ov.querySelector("#shotPrev").innerHTML = img ? `<img class="shot" src="${img}" alt="">` : ""; };
          im.src = rd.result;
        };
        rd.readAsDataURL(f);
      });
      ov.querySelector("#shotSend").addEventListener("click", () => {
        if (!img) { toast(t("shot_file_need")); return; }
        S.profile.pending[sys] = { at: Date.now() };
        S.mod.rankq.unshift({ id: "q" + Date.now(), target: "me", sys, game, t: Date.now(), img });
        save(); closeModal(); renderProfile(); toast(t("shot_sent"), { label: t("nav_admin"), fn: () => setView("admin") });
      });
    });
}
function tgSheet() {
  if (!S.set.tgCode) S.set.tgCode = "STK-" + String(1000 + Math.floor(Math.random() * 9000));
  openSheet(t("tg_title"), `<p style="margin:0">${esc(t("tg_text"))}</p><ol class="steps">${t("tg_steps").map(s => `<li>${esc(s)}</li>`).join("")}</ol><div class="code">${esc(S.set.tgCode)}</div><p class="hint">${esc(t("tg_demo"))}</p>`,
    `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="tgOk">${esc(t("tg_done"))}</button>`, ov => {
      ov.querySelector("#tgOk").addEventListener("click", () => { S.set.tg = true; save(); closeModal(); renderProfile(); toast(t("tg_linked")); notify("test", t("n_test")); });
    });
}
function goTo(go) {
  go = go || {};
  if (go.type === "chat") openChat(go.id);
  else if (go.type === "player") playerSheet(go.id);
  else if (go.type === "teams") { S.teamTab = "browse"; setView("teams"); if (go.id) teamSheet(go.id); }
  else if (go.type === "myteam") { S.teamTab = "mine"; if (go.id) S.myTeamSel = go.id; setView("teams"); }
  else if (go.type === "profile") setView("profile");
  else if (go.type === "feed") setView("feed");
}
function notifSheet() {
  const list = S.notifs;
  const body = list.length ? `<div class="nlist">${list.map(n => `<button class="nitem${n.read ? "" : " unread"}" data-nid="${n.id}"><span class="ic">${ICON[NICON[n.k] || "bell"]}</span><span class="txt"><span>${esc(n.text)}</span><span class="sub"><span>${esc(rel(n.t))}</span>${n.tg ? `<span class="tgtag">${esc(t("to_tg"))}</span>` : ""}</span></span>${n.read ? "" : '<span class="ud"></span>'}</button>`).join("")}</div>` : `<p class="hint">${esc(t("notif_empty"))}</p>`;
  openSheet(t("notifs"), body, list.some(n => !n.read) ? `<button class="btn" id="nRead">${esc(t("notif_read"))}</button>` : "", ov => {
    const rb = ov.querySelector("#nRead"); if (rb) rb.addEventListener("click", () => { S.notifs.forEach(n => { n.read = true; }); save(); renderBell(); closeModal(); });
    ov.addEventListener("click", e => {
      const it = e.target.closest("[data-nid]"); if (!it) return;
      const n = S.notifs.find(x => x.id === it.dataset.nid); if (!n) return;
      n.read = true; save(); renderBell(); closeModal(); goTo(n.go);
    });
  });
}

/* ---------- share (public pages) ---------- */
const SITE_BASE = (typeof window !== "undefined" && window.STUCKUP_SITE) || "https://stuckup.ru";
function linkBox(link) { return `<div class="linkbox"><input class="inp" readonly value="${esc(link)}" aria-label="${esc(t("share_title"))}"><button class="btn primary" data-action="copy" data-copy="${esc(link)}">${ICON.copy}${esc(t("copy"))}</button></div>`; }
function shareSheet(kind, id) {
  let path, title, desc, big, sm, chips = [];
  if (kind === "player") { const p = findPost(id); if (!p) return; path = "u/" + p.nick; title = p.nick + " — " + gname(p.game); desc = t("share_player_d", gname(p.game), rankText(p.r, true)); big = p.nick; sm = gname(p.game) + " · " + modeName(p.game, p.mode); chips = [p.r].concat(p.extra || []).map(r => rankText(r, true)); const r = repOf(p); if (r.n) chips.push(Math.round(r.up / r.n * 100) + "% · " + r.n); }
  else if (kind === "team") { const tm = findTeam(id); if (!tm) return; const st = tst(tm); path = "t/" + tm.tag.toLowerCase(); title = "[" + tm.tag + "] " + tm.name; desc = t("share_team_d", gname(tm.game), st.rating); big = tm.name; sm = "[" + tm.tag + "] · " + gname(tm.game) + " · " + regionName(tm.region); chips = [t("tm_rating") + " " + st.rating, st.w + "–" + st.l + "–" + st.d]; const on = ontime(st); if (on != null) chips.push(on + "% " + t("tm_on")); }
  else { const n = S.profile.nick || "player"; path = "u/" + n; title = n; desc = t("share_me_d", n); big = n; sm = S.profile.games.map(gshort).join(" · ") || "Stuckup"; S.profile.games.forEach(g => GAMES[g].systems.forEach(sys => { const r = myRank(g, sys); if (r) chips.push(rankText(r, true)); })); }
  const link = SITE_BASE + "/#/" + encodeURIComponent(path).replace("%2F", "/");
  const og = `<div class="og"><span class="site">Stuckup</span><span class="ttl2">${esc(title)}</span><span class="ds">${esc(desc)}</span><div class="og-img"><span class="brand2"><i></i><i></i><i></i><i></i><i></i>&nbsp;STUCKUP</span><div><div class="big">${esc(big)}</div><div class="sm2">${esc(sm)}</div></div><div class="chips2">${chips.slice(0, 4).map(c => `<span>${esc(c)}</span>`).join("")}</div></div></div>`;
  openSheet(t("share"), `<div class="field"><span class="lbl">${esc(t("share_title"))}</span>${linkBox(link)}</div><p class="hint" style="margin:0">${esc(t("share_note"))}</p>${og}`, "");
}

/* ---------- invite by link ---------- */
function makeFriend(game) {
  const used = S.friends.map(f => f.nick), nick = FRIEND_NICKS.find(n => !used.includes(n)) || ("Friend_" + Math.floor(100 + Math.random() * 900));
  const sys = GAMES[game].systems[0], r = myRank(game, sys) || defRank(sys) || { sys: "premier", v: 12000 }, now = Date.now();
  const f = { id: "fr" + now, nick, game, mode: Object.keys(GAMES[game].modes)[0], r, roles: [Object.keys(GAMES[game].roles)[0]], langs: [S.lang], on: true, exp: 0, t: now, t0: now, friend: true, rep: { up: 0, n: 0, ns: 0, tags: [] }, region: S.profile.region, have: 1, mic: true, when: S.profile.time.slice() };
  S.friends.push(f); return f;
}
function joinFriend(kind, id) {
  if (kind === "stack") {
    const g = id; if (S.stacks[g].length + 1 >= GAMES[g].size) return;
    const f = makeFriend(g); S.stacks[g].push(f.id);
    S.chats[f.id] = { msgs: [{ me: false, text: t("friend_hi"), t: Date.now() }], unread: 1, n: 1 };
    notify("join", t("joined_stack", f.nick), { type: "chat", id: f.id }); toast(t("joined_stack", f.nick));
    renderStack(); renderChat(); renderUnread();
  } else {
    const tm = findTeam(id); if (!tm || !tm.mine) return;
    const f = makeFriend(tm.game); tm.members.push({ nick: f.nick, role: f.roles[0], trole: "player", r: f.r });
    notify("team", t("joined_team", f.nick, tm.name), { type: "myteam", id: tm.id }); toast(t("joined_team", f.nick, tm.name));
    if (S.view === "teams") renderTeams();
  }
  save();
}
function inviteSheet(kind, id) {
  const code = Math.random().toString(36).slice(2, 7).toUpperCase();
  const tm = kind === "team" ? findTeam(id) : null;
  const link = SITE_BASE + "/#/join/" + (kind === "stack" ? "s-" + id + "-" : "t-" + (tm ? tm.tag.toLowerCase() : "x") + "-") + code;
  openSheet(t("invite_title"), `<p style="margin:0">${esc(t(kind === "stack" ? "invite_stack" : "invite_team"))}</p>${linkBox(link)}<p class="hint">${esc(t("invite_demo"))}</p>`, "", () => { setTimeout(() => joinFriend(kind, id), 8000); });
}

/* ---------- premium ---------- */
function premiumSheet() {
  const body = `<div class="prem"><div class="price">${esc(t("prem_price"))} <small>${esc(t("prem_per"))}</small></div><ul class="plist">${t("prem_feats").map(([a, b]) => `<li>${ICON.check}<span><b>${esc(a)}</b> — ${esc(b)}</span></li>`).join("")}</ul><p class="hint" style="margin:0">${esc(t("prem_note"))}</p></div>`;
  openSheet(t("prem_title"), body, S.prem ? `<button class="btn ghost" id="premOff">${esc(t("prem_cancel"))}</button>` : `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="premOn">${esc(t("prem_buy"))}</button>`, ov => {
    const on = ov.querySelector("#premOn"), off = ov.querySelector("#premOff");
    if (on) on.addEventListener("click", () => { S.prem = true; S.posts.forEach(p => { p.promo = true; }); save(); closeModal(); renderAll(); toast(t("prem_on")); });
    if (off) off.addEventListener("click", () => { S.prem = false; S.posts.forEach(p => { p.promo = false; if (p.dur === PREM_DUR) p.dur = 2880; }); ["rep90", "nons", "sametime"].forEach(k => { S.q[k] = false; }); save(); closeModal(); renderAll(); toast(t("prem_off")); });
  });
}

/* ---------- onboarding ---------- */
let OB = null;
function obSheet() {
  const pr = S.profile;
  OB = { step: 0, nick: pr.nick, games: pr.games.slice(), sysSel: { cs2: "premier" }, ranks: {}, time: pr.time.slice(), days: (pr.days || []).slice(), style: pr.style || "fun", langs: pr.langs.slice(), err: "" };
  obRender();
}
function obRead() {
  if (!OB) return;
  if (OB.step === 0) { const n = $("#ob-nick"); if (n) OB.nick = n.value.trim().slice(0, 24); }
  if (OB.step === 1) OB.games.forEach(g => { const sys = g === "cs2" ? OB.sysSel.cs2 : GAMES[g].systems[0]; OB.ranks[g] = { sys, r: readRank("ob-" + g + "-" + sys, sys) }; });
}
function obBody() {
  const st = OB.step, bar = `<div class="ob-steps">${[0, 1, 2, 3].map(i => `<i class="${i <= st ? "on" : ""}"></i>`).join("")}</div><h4 class="ob-q">${esc(t("ob_q")[st])}</h4>`;
  if (st === 0) return bar + `<div class="field"><label class="lbl" for="ob-nick">${esc(t("nick"))}</label><input class="inp" id="ob-nick" maxlength="24" placeholder="${esc(t("nick_ph"))}" value="${esc(OB.nick)}"></div><div class="gpick">${GAME_KEYS.map(g => `<button type="button" data-og="${g}" aria-pressed="${OB.games.includes(g)}" style="--g:var(${GAMES[g].color})"><i></i>${esc(gshort(g))}</button>`).join("")}</div>${OB.err ? `<p class="ferr">${esc(OB.err)}</p>` : ""}`;
  if (st === 1) return bar + `<p class="hint" style="margin:0">${esc(t("ob_rank_hint"))}</p>` + OB.games.map(g => {
    const G = GAMES[g], sys = g === "cs2" ? OB.sysSel.cs2 : G.systems[0], saved0 = OB.ranks[g] && OB.ranks[g].sys === sys ? OB.ranks[g].r : myRank(g, sys);
    return `<div class="ob-rank" style="--g:var(${G.color})"><h4><i></i>${esc(G.name)}</h4>${g === "cs2" ? `<div class="seg">${G.systems.map(s => `<button type="button" data-osys="${s}" aria-pressed="${s === sys}">${esc(s === "comp" ? (S.lang === "ru" ? "Звание" : "Skill group") : SYS[s].label[L()])}</button>`).join("")}</div>` : ""}${rankInput("ob-" + g + "-" + sys, sys, saved0, true)}</div>`;
  }).join("");
  if (st === 2) return bar + `<div class="chips">${TIMES.map(x => `<button type="button" class="chip" data-ot="${x}" aria-pressed="${OB.time.includes(x)}">${esc(t("times")[x])}</button>`).join("")}</div><div class="chips">${["wd", "we"].map(x => `<button type="button" class="chip" data-od="${x}" aria-pressed="${OB.days.includes(x)}">${esc(t("days2")[x])}</button>`).join("")}</div>`;
  return bar + `<div class="seg">${STYLES.map(s => `<button type="button" data-ost="${s}" aria-pressed="${OB.style === s}">${esc(t("styles")[s])}</button>`).join("")}</div><div class="field"><span class="lbl">${esc(t("my_langs"))}</span><div class="chips">${["ru", "en"].map(l => `<button type="button" class="chip" data-ol="${l}" aria-pressed="${OB.langs.includes(l)}">${esc(t("lang_" + l))}</button>`).join("")}</div></div>`;
}
function obFoot() { return (OB.step === 0 ? `<button class="btn ghost" data-ob="skip">${esc(t("ob_skip"))}</button>` : `<button class="btn ghost" data-ob="back">${esc(t("ob_back"))}</button>`) + `<button class="btn primary" data-ob="next">${esc(OB.step === 3 ? t("ob_finish") : t("ob_next"))}</button>`; }
function obRender() {
  openSheet(t("ob_title"), obBody(), obFoot(), ov => {
    ov.addEventListener("click", e => {
      if (!OB) return;
      const og = e.target.closest("[data-og]"), osys = e.target.closest("[data-osys]"), ot = e.target.closest("[data-ot]"), od = e.target.closest("[data-od]"), ost = e.target.closest("[data-ost]"), ol = e.target.closest("[data-ol]"), ob = e.target.closest("[data-ob]");
      const tog = (arr, v, el) => { const i = arr.indexOf(v); i >= 0 ? arr.splice(i, 1) : arr.push(v); el.setAttribute("aria-pressed", String(i < 0)); };
      if (og) { tog(OB.games, og.dataset.og, og); OB.err = ""; return; }
      if (ot) { tog(OB.time, ot.dataset.ot, ot); return; }
      if (od) { tog(OB.days, od.dataset.od, od); return; }
      if (ol) { tog(OB.langs, ol.dataset.ol, ol); return; }
      if (ost) { OB.style = ost.dataset.ost; $$("[data-ost]").forEach(b => b.setAttribute("aria-pressed", String(b === ost))); return; }
      if (osys) { obRead(); OB.sysSel.cs2 = osys.dataset.osys; $("#sheetBody").innerHTML = obBody(); return; }
      if (!ob) return;
      const act = ob.dataset.ob;
      if (act === "skip") { S.profile.onboarded = true; S.setupHidden = true; save(); closeModal(); renderSetup(); return; }
      obRead();
      if (act === "back") { OB.step = Math.max(0, OB.step - 1); obRender(); return; }
      if (OB.step === 0 && !OB.games.length) { OB.err = t("ob_need_game"); $("#sheetBody").innerHTML = obBody(); return; }
      if (OB.step < 3) { OB.step++; obRender(); return; }
      const pr = S.profile;
      if (OB.nick) pr.nick = OB.nick;
      pr.games = OB.games.slice();
      OB.games.forEach(g => { const x = OB.ranks[g]; if (x && x.r && pr.ver[x.sys] !== "api") pr.ranks[g][x.sys] = x.r; });
      pr.time = OB.time.slice(); pr.days = OB.days.slice(); pr.style = OB.style; if (OB.langs.length) pr.langs = OB.langs.slice();
      pr.onboarded = true; save(); closeModal(); renderAll();
      toast(t("ob_done", picksList().length));
    });
  });
}

/* ---------- my games ---------- */
function gameAddSheet() {
  const left = GAME_KEYS.filter(g => !S.profile.games.includes(g));
  openSheet(t("choose_game"), `<div class="gpick">${left.map(g => `<button type="button" data-ga="${g}" style="--g:var(${GAMES[g].color})"><i></i>${esc(gshort(g))}</button>`).join("")}</div>`, "", ov => {
    ov.addEventListener("click", e => { const b = e.target.closest("[data-ga]"); if (b) gameSheet(b.dataset.ga, true); });
  });
}
function gameSheet(g, isNew) {
  const G = GAMES[g], roles = (S.profile.roles[g] || []).slice();
  const body = G.systems.map(sys => `<div class="ge-sys"><span class="lbl">${esc(sys === "premier" ? "Premier (CS Rating)" : sys === "comp" ? (S.lang === "ru" ? "Звание · соревновательный и напарники" : "Skill group · Competitive & Wingman") : sysLabel(sys))}</span>${rankInput("ge-" + sys, sys, myRank(g, sys), true, myVer(sys) === "api")}${isNew ? "" : verRow(g, sys)}</div>`).join("") +
    `<section class="fsec"><h4>${esc(t("pref_roles"))}</h4><div class="chips">${Object.keys(G.roles).map(r => `<button type="button" class="chip" data-gr="${r}" aria-pressed="${roles.includes(r)}">${esc(roleName(g, r))}</button>`).join("")}</div></section>`;
  openSheet(G.name, body, `${isNew ? `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button>` : `<button class="btn ghost danger" id="geDel">${esc(t("remove_game"))}</button>`}<button class="btn primary" id="geSave">${esc(t("save"))}</button>`, ov => {
    ov.addEventListener("click", e => {
      const r = e.target.closest("[data-gr]");
      if (r) { const k = r.dataset.gr, i = roles.indexOf(k); i >= 0 ? roles.splice(i, 1) : roles.push(k); r.setAttribute("aria-pressed", String(i < 0)); return; }
      if (e.target.closest("#geSave")) {
        addMyGame(g);
        G.systems.forEach(sys => {
          if (myVer(sys) === "api") return;
          const nr = readRank("ge-" + sys, sys), old = myRank(g, sys);
          if (JSON.stringify(nr) !== JSON.stringify(old)) { if (nr) S.profile.ranks[g][sys] = nr; else delete S.profile.ranks[g][sys]; delete S.profile.ver[sys]; delete S.profile.pending[sys]; S.mod.rankq = S.mod.rankq.filter(q => !(q.target === "me" && q.sys === sys)); }
        });
        S.profile.roles[g] = roles; save(); closeModal(); renderProfile(); renderRail(); renderSetup(); toast(t("game_saved"));
      }
      if (e.target.closest("#geDel")) {
        S.profile.games = S.profile.games.filter(x => x !== g); S.profile.ranks[g] = {};
        G.systems.forEach(sys => { delete S.profile.ver[sys]; delete S.profile.pending[sys]; });
        delete S.profile.roles[g]; save(); closeModal(); renderProfile(); renderRail(); renderSetup(); toast(t("game_removed"));
      }
    });
  });
}

/* ================= stack + favorites + block ================= */
function toggleStack(id, silent) {
  const p = findPost(id); if (!p || p.mine) return false;
  const arr = S.stacks[p.game], i = arr.indexOf(id);
  if (i >= 0) { arr.splice(i, 1); if (!silent) toast(t("removed_stack", p.nick)); }
  else {
    if (arr.length + 1 >= GAMES[p.game].size) { toast(t("stack_is_full")); return false; }
    arr.push(id);
    if (S.chats[id]) S.chats[id].msgs.push({ sys: true, text: t("sys_joined", p.nick), t: Date.now() });
    if (arr.length + 1 >= GAMES[p.game].size) { S.mod.stacks++; if (closeMineForGame(p.game, "stack")) toast(t("stack_closed")); else if (!silent) toast(t("added_stack", p.nick)); }
    else if (!silent) toast(t("added_stack", p.nick));
  }
  if (!arr.length) delete S.voice[p.game];
  S.stackGame = p.game; save();
  renderStack(); renderFeed(); renderRail();
  if (S.active === id || isWide()) renderChat();
  if (!F) playerSheetRefresh(id);
  return true;
}
function toggleFav(id) {
  const p = findPost(id); if (!p) return; const i = S.favs.indexOf(id);
  if (i >= 0) { S.favs.splice(i, 1); toast(t("fav_removed", p.nick)); } else { S.favs.push(id); toast(t("fav_added", p.nick)); }
  save(); renderFeed(); playerSheetRefresh(id); if (S.view === "profile") renderProfile();
}
function setBlocked(id, on) {
  const p = findPost(id); if (!p) return;
  if (on) { if (!S.blocked.includes(id)) S.blocked.push(id); GAME_KEYS.forEach(g => { S.stacks[g] = S.stacks[g].filter(x => x !== id); }); S.favs = S.favs.filter(x => x !== id); if (S.active === id) S.active = null; }
  else S.blocked = S.blocked.filter(x => x !== id);
  save(); closeModal(); renderRail(); renderStack(); renderFeed(); renderChat(); if (S.view === "profile") renderProfile();
  if (on) toast(t("blocked_toast", p.nick), { label: t("undo"), fn: () => setBlocked(id, false) }); else toast(t("unblocked_toast", p.nick));
}
function callAgain(id) {
  const p = findPost(id); if (!p) return;
  if (!S.stacks[p.game].includes(id)) toggleStack(id, true);
  openChat(id);
  sendMsg(t("call_again_msg"));
}

/* ================= profile ================= */
let saveTimer;
function profileStatus() { const el = $("#psv"); if (el) { el.textContent = t("saved_auto"); clearTimeout(saveTimer); saveTimer = setTimeout(() => { if ($("#psv")) $("#psv").textContent = ""; }, 1800); } }
function verRow(g, sys) {
  const v = myVer(sys), s = SYS[sys], r = myRank(g, sys);
  if (v === "api") return `<div class="vrow"><span class="vchip ok">${ICON.shield}${esc(t("v_api", s.src))}</span><button class="btn small" data-action="resync">${ICON.refresh}${esc(t("resync"))}</button></div>`;
  if (v === "shot") return `<div class="vrow"><span class="vchip ok">${ICON.shield}${esc(t("v_shot"))}</span></div>`;
  if (v === "wait") return `<div class="vrow"><span class="vchip wait">${ICON.clock}${esc(t("v_wait"))}</span></div>`;
  if (!r) return "";
  return `<div class="vrow"><span class="vchip no">${esc(t("v_none"))}</span>${s.via ? `<button class="btn small" data-action="acc" data-k="${s.via}">${ICON.link}${esc(t("verify"))} · ${esc(ACC[s.via].name)}</button>` : `<button class="btn small" data-action="shot" data-g="${g}" data-sys="${sys}">${ICON.image}${esc(t("verify"))}</button>`}</div>`;
}
function gameRow(g) {
  const G = GAMES[g], ranks = G.systems.map(sys => myRank(g, sys)).filter(Boolean), vers = G.systems.map(myVer).filter(Boolean);
  const roles = (S.profile.roles[g] || []).map(r => roleName(g, r)).join(", ");
  const vchip = vers.includes("api") || vers.includes("shot") ? `<span class="vchip ok">${ICON.shield}${esc(t("verified"))}</span>` : vers.includes("wait") ? `<span class="vchip wait">${ICON.clock}${esc(t("v_wait"))}</span>` : "";
  return `<div class="mg" style="--g:var(${G.color})"><span class="txt"><span class="gname"><i></i>${esc(G.name)}</span><span class="rks">${ranks.length ? ranks.map(miniRank).join("") : `<span class="hint">${esc(t("rank_none_set"))}</span>`}${vchip}</span>${roles ? `<span class="hint">${esc(roles)}</span>` : ""}</span><button class="btn small" data-action="game-edit" data-g="${g}">${esc(t("edit"))}</button></div>`;
}
function renderProfile() {
  const pr = S.profile, mine = S.posts.filter(p => p.exp > Date.now() && p.kind !== "sub"), sec = { main: t("profile"), games: t("my_games"), acc: t("acc_title"), notif: t("notifs"), people: t("psec").people, posts: t("psec").posts, prem: "Premium" };
  let h = `<div class="pgrid"><nav class="psec-nav" aria-label="${esc(t("profile"))}">${Object.keys(sec).map(k => `<button data-action="scrollto" data-t="ps-${k}">${esc(sec[k])}</button>`).join("")}</nav>`;
  h += `<div class="panel" id="ps-main"><div class="panel-h"><h2 class="sec">${esc(t("profile"))}</h2>${S.prem ? '<span class="pro">PRO</span>' : ""}<span class="sv" id="psv" aria-live="polite"></span></div>
<div class="p-head"><span id="pAv">${avatar(pr.nick || "?", false)}</span><div class="field"><label class="lbl" for="pf-nick">${esc(t("nick"))}</label><input class="inp" id="pf-nick" maxlength="24" placeholder="${esc(t("nick_ph"))}" value="${esc(pr.nick)}"></div><button class="btn small" data-action="share" data-kind="me">${ICON.link}${esc(t("share_me"))}</button></div>
<div class="row2" style="gap:14px"><div class="field"><span class="lbl">${esc(t("my_langs"))}</span><div class="chips">${["ru", "en"].map(l => `<button class="chip" data-pl="${l}" aria-pressed="${pr.langs.includes(l)}">${esc(t("lang_" + l))}</button>`).join("")}</div></div>
<div class="field"><label class="lbl" for="pf-reg">${esc(t("my_region"))}</label><select class="inp" id="pf-reg">${Object.keys(REGIONS).map(r => `<option value="${r}"${pr.region === r ? " selected" : ""}>${esc(regionName(r))}</option>`).join("")}</select></div></div>
<div class="field"><span class="lbl">${esc(t("when_play"))}</span><div class="chips">${TIMES.map(x => `<button class="chip" data-ptime="${x}" aria-pressed="${pr.time.includes(x)}">${esc(t("times")[x])}</button>`).join("")}${["wd", "we"].map(x => `<button class="chip" data-pdays="${x}" aria-pressed="${(pr.days || []).includes(x)}">${esc(t("days2")[x])}</button>`).join("")}</div></div>
<div class="field"><span class="lbl">${esc(t("how_play"))}</span><div class="seg" role="group" aria-label="${esc(t("how_play"))}">${STYLES.map(s => `<button data-pstyle="${s}" aria-pressed="${pr.style === s}">${esc(t("styles")[s])}</button>`).join("")}</div></div>
<div class="field" style="gap:4px"><label class="check"><input type="checkbox" id="pf-adult"${pr.adult ? " checked" : ""}> ${esc(t("adult"))}</label><p class="hint">${esc(t("adult_note"))}</p></div>
<div class="field"><span class="lbl">${esc(t("c_title"))}</span><div class="cgrid">
<div class="field"><div class="pre"><span>${ICON.headset}</span><input class="inp mono" id="pf-dc" aria-label="Discord" autocapitalize="off" autocomplete="off" spellcheck="false" maxlength="40" placeholder="Discord · ${esc(t("dc_ph"))}" value="${esc(pr.dc)}"></div><p class="hint" id="pf-dc-h">${esc(t("dc_hint"))}</p></div>
<div class="field"><div class="pre"><span>@</span><input class="inp mono" id="pf-tg" aria-label="Telegram" autocapitalize="off" autocomplete="off" spellcheck="false" maxlength="60" placeholder="Telegram · ${esc(t("tg_ph"))}" value="${esc(pr.tg)}"></div><p class="hint" id="pf-tg-h">${esc(t("tg_hint"))}</p></div></div></div>
<div class="field"><span class="lbl">${esc(t("cvis"))}</span><div class="seg" role="group" aria-label="${esc(t("cvis"))}">${["all", "chat", "stack"].map(v => `<button data-cvis="${v}" aria-pressed="${pr.cvis === v}">${esc(t("cvis_" + v))}</button>`).join("")}</div><p class="hint" id="cvisNote">${esc(t("cvis_note")[pr.cvis])}</p></div></div>`;
  h += `<div class="panel" id="ps-games"><div class="panel-h"><h2 class="sec">${esc(t("my_games"))}</h2><button class="btn primary small" style="margin-left:auto" data-action="game-add">${ICON.plus}${esc(t("add_game"))}</button></div><p class="hint" style="margin-top:-8px">${esc(t("my_games_note"))}</p>${pr.games.length ? `<div class="mygames">${pr.games.map(gameRow).join("")}</div>` : `<p class="hint">${esc(t("no_games"))}</p>`}</div>`;
  h += `<div class="panel" id="ps-acc"><div class="field" style="gap:4px"><h2 class="sec">${esc(t("acc_title"))}</h2><p class="hint">${esc(t("acc_note"))}</p></div><div class="accs">${Object.keys(ACC).map(k => {
    const on = !!pr.acc[k];
    return `<div class="acc${on ? " on" : ""}"><span class="logo">${ACC[k].logo}</span><span class="txt"><b>${esc(ACC[k].name)}${k === "pubg" && on && pr.pubgNick ? " · " + esc(pr.pubgNick) : ""}</b><span>${esc(t("acc_for", ACC[k].games.map(gname).join(", ")))}</span></span>${on ? `<span class="vchip ok">${ICON.check}${esc(t("acc_on"))}</span><button class="btn ghost small" data-action="acc-off" data-k="${k}">${esc(t("disconnect"))}</button>` : `<button class="btn small" data-action="acc" data-k="${k}">${ICON.link}${esc(t("connect"))}</button>`}</div>`;
  }).join("")}</div>`;
  const statGames = pr.games.filter(g => Object.keys(ACC).some(k => pr.acc[k] && ACC[k].games.includes(g)));
  if (statGames.length) h += `<div class="field" style="gap:10px"><span class="lbl">${esc(t("my_stats"))}</span>${statGames.map(g => `<div class="blk"><h4>${esc(gname(g))}</h4>${statsHtml("me|" + (pr.nick || "me"), g)}</div>`).join("")}</div>`;
  h += `</div>`;
  h += `<div class="panel" id="ps-notif"><h2 class="sec">${esc(t("notifs"))}</h2>
<div class="acc${S.set.tg ? " on" : ""}"><span class="logo">TG</span><span class="txt"><b>${esc(t("tg_title"))}</b><span>${esc(t("tg_text"))}</span></span>${S.set.tg ? `<span class="vchip ok">${ICON.check}${esc(t("tg_on"))}</span><button class="btn small" data-action="tg-test">${esc(t("tg_test"))}</button><button class="btn ghost small" data-action="tg-off">${esc(t("tg_unlink"))}</button>` : `<button class="btn small" data-action="tg">${ICON.send}${esc(t("tg_connect"))}</button>`}</div>
<div><label class="toggle"><span>${esc(t("push"))}<br><span class="hint">${esc(t("push_note"))}</span></span><input type="checkbox" data-set="push"${S.set.push ? " checked" : ""}></label></div>
<div class="field"><span class="lbl">${esc(t("n_prefs"))}</span><div>${Object.keys(t("prefs")).map(k => `<label class="toggle"><span>${esc(t("prefs")[k])}</span><input type="checkbox" data-pref="${k}"${S.set.prefs[k] ? " checked" : ""}></label>`).join("")}</div></div></div>`;
  const favRows = S.favs.map(findPost).filter(Boolean).map(p => `<div class="prow">${avatar(p.nick, p.on)}<span class="txt"><b>${esc(p.nick)}</b><span>${esc(gshort(p.game))} · ${esc(rankText(p.r, true))}</span></span><button class="btn small" data-action="call-again" data-id="${p.id}">${ICON.users}${esc(t("call_again"))}</button><button class="iconbtn fav" data-action="fav" data-id="${p.id}" aria-label="${esc(t("fav_on"))}">${ICON.star}</button></div>`).join("");
  const blkRows = S.blocked.map(findPost).filter(Boolean).map(p => `<div class="prow">${avatar(p.nick, false)}<span class="txt"><b>${esc(p.nick)}</b><span>${esc(gshort(p.game))}</span></span><button class="btn ghost small" data-action="unblock" data-id="${p.id}">${esc(t("unblock"))}</button></div>`).join("");
  h += `<div class="panel" id="ps-people"><div class="field"><h2 class="sec">${esc(t("favs_title"))}</h2>${favRows ? `<div>${favRows}</div>` : `<p class="hint">${esc(t("favs_empty"))}</p>`}</div><div class="field"><h2 class="sec">${esc(t("blocked_title"))}</h2>${blkRows ? `<div>${blkRows}</div>` : `<p class="hint">${esc(t("blocked_empty"))}</p>`}</div></div>`;
  h += `<div class="panel" id="ps-posts"><h2 class="sec">${esc(t("active_posts"))}</h2>${mine.length ? '<div class="list">' + mine.map(card).join("") + "</div>" : `<p class="hint">${esc(t("no_posts"))}</p>`}
<div class="field" style="gap:4px"><h2 class="sec">${esc(t("archive"))}</h2><p class="hint">${esc(t("archive_note"))}</p></div>` + (S.archive.length ? "<div>" + S.archive.map((a, i) =>
    `<div class="arow"><span class="gtag" style="--g:var(${GAMES[a.game].color})"><i></i>${esc(gshort(a.game))}</span><span class="txt"><span>${esc(modeName(a.game, a.mode))} · ${esc(rankText(a.r, true))}</span><span class="sub">${esc(t("reason")[a.reason] || a.reason)} · ${esc(rel(a.ended))}${noteOf(a) ? " · " + esc(noteOf(a).slice(0, 60)) : ""}</span></span><button class="btn small" data-action="repost" data-i="${i}">${ICON.refresh}${esc(t("repost"))}</button></div>`).join("") + "</div>" : `<p class="hint">${esc(t("archive_empty"))}</p>`) + "</div>";
  h += `<div class="panel" id="ps-prem">${S.prem ? `<div class="panel-h"><h2 class="sec">${esc(t("prem_title"))}</h2><span class="vchip ok">${ICON.check}${esc(t("prem_active"))}</span><button class="btn ghost small" style="margin-left:auto" data-action="premium">${esc(t("prem_more"))}</button></div>` :
    `<div class="prem"><div class="panel-h"><h2 class="sec">${esc(t("prem_title"))}</h2><span class="pro">PRO</span></div><div class="price">${esc(t("prem_price"))} <small>${esc(t("prem_per"))}</small></div><ul class="plist">${t("prem_feats").slice(0, 3).map(([a, b]) => `<li>${ICON.check}<span><b>${esc(a)}</b> — ${esc(b)}</span></li>`).join("")}</ul><button class="btn primary" style="justify-self:start" data-action="premium">${esc(t("prem_more"))}</button></div>`}</div>`;
  h += `<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn small" data-nav="admin">${ICON.shield}${esc(t("open_admin"))}</button><button class="btn ghost small danger" data-action="reset-demo">${ICON.trash}${esc(t("reset_demo"))}</button></div></div>`;
  $("#page").innerHTML = h;
}
function saveProfileField(el) {
  const pr = S.profile;
  if (el.id === "pf-nick") { pr.nick = el.value.trim().slice(0, 24); $("#pAv").innerHTML = avatar(pr.nick || "?", false); applyLang(); S.teams.forEach(tm => tm.members.forEach(m => { if (m.me) m.nick = pr.nick; })); }
  else if (el.id === "pf-dc" || el.id === "pf-tg") {
    const isDc = el.id === "pf-dc", v = isDc ? normDc(el.value) : normTg(el.value), ok = !v || (isDc ? DC_RE : TG_RE).test(v);
    const hint = $("#" + el.id + "-h");
    el.classList.toggle("bad", !ok); hint.textContent = ok ? t(isDc ? "dc_hint" : "tg_hint") : t(isDc ? "dc_err" : "tg_err"); hint.className = ok ? "hint" : "ferr";
    if (!ok) return;
    if (isDc) pr.dc = v; else pr.tg = v;
    S.posts.forEach(p => { if (p.c) p.c = { dc: pr.dc, tg: pr.tg }; });
  }
  else if (el.id === "pf-reg") pr.region = el.value;
  else if (el.id === "pf-adult") { pr.adult = el.checked; if (!pr.adult) S.posts.forEach(p => { p.stags = (p.stags || []).filter(s => s !== "adult"); }); }
  else return;
  save(); profileStatus();
}

/* ================= teams ================= */
function allTeams() { return S.teams.concat(TEAMS0); }
function findTeam(id) { return allTeams().find(x => x.id === id); }
function tst(tm) { return Object.assign({ rating: 1000, w: 0, l: 0, d: 0, ok: 0, late: 0, ns: 0 }, tm.st || {}, S.tpatch[tm.id] || {}); }
function ontime(st) { const n = st.ok + st.late + st.ns; return n ? Math.round(st.ok / n * 100) : null; }
function rosterOf(tm) { const list = tm.members.slice(); if (!tm.mine && S.apps[tm.id] === "accepted") list.push({ nick: S.profile.nick || t("you"), role: S.appRole[tm.id], trole: "player", me: true }); return list; }
function rosterCount(tm) { return rosterOf(tm).filter(m => m.trole !== "coach" && m.trole !== "sub").length; }
function myTeams() { return allTeams().filter(tm => tm.mine || S.apps[tm.id] === "accepted"); }
function myRole(tm) { if (tm.mine) { const me = tm.members.find(m => m.me); return me ? me.trole : "captain"; } return S.apps[tm.id] === "accepted" ? "player" : null; }
function can(tm, what) { const r = myRole(tm); return !!r && PERMS[what].includes(r); }
function teamFor(game) { return myTeams().find(tm => tm.game === game); }
function lbPlace(tm) { const list = allTeams().filter(x => x.game === tm.game).sort((a, b) => tst(b).rating - tst(a).rating); return list.indexOf(tm) + 1; }
function fmtLabel(game, f) { return (MAPS[game] ? t("fmt_lbl") : t("fmt_lbl_nomap"))[f]; }
function tagTile(tm, cls) { return `<span class="t-tag${cls ? " " + cls : ""}" style="--g:var(${GAMES[tm.game].color})">${esc(tm.tag)}</span>`; }
function stChip(sc) {
  if (sc.status === "played") { const k = sc.res === "ns" ? "ns" : sc.res === 1 ? "win" : sc.res === 0 ? "lose" : "draw"; return `<span class="st-chip ${k === "lose" ? "lose" : k === "win" ? "ok" : "done"}">${esc(t("res")[k])}${sc.score ? " " + esc(sc.score) : ""}</span>`; }
  const cls = { open: "open", incoming: "in", pending: "wait", confirmed: "ok" }[sc.status];
  return `<span class="st-chip ${cls}">${esc(t("sst")[sc.status])}</span>`;
}

function teamCard(tm) {
  const G = GAMES[tm.game], n = rosterCount(tm), st = tst(tm), ap = S.apps[tm.id], scr = SCRIM_GAMES.includes(tm.game);
  const need = n < tm.size ? `<span class="need"><span class="ps" aria-hidden="true">${'<i class="f"></i>'.repeat(n)}${"<i></i>".repeat(tm.size - n)}</span><b>${esc(t("need_short", tm.size - n))}</b><span class="rl">${esc(tm.open.length ? tm.open.map(r => roleName(tm.game, r)).join(", ") : t("team_open_none"))}</span></span>` : `<span class="need">${esc(t("team_full2"))} · ${n}/${tm.size}</span>`;
  return `<article class="team${tm.mine ? " mine" : ""}" style="--g:var(${G.color})"><div class="t-head">${tagTile(tm)}<div class="who"><b>${esc(tm.name)}</b><div class="meta"><span class="gtag"><i></i>${esc(gshort(tm.game))}</span><span>${esc(regionName(tm.region))}</span><span>·</span><span>${esc(t("styles")[tm.style])}</span></div></div>${scr ? `<div class="rk"><span class="rk-sys">${esc(t("tm_rating"))}</span><span class="rating">${st.rating}</span></div>` : ""}</div>
<div class="c-foot">${need}<div class="c-acts">${ap === "accepted" ? `<span class="status-chip">${ICON.check}${esc(t("team_accepted"))}</span>` : ap === "pending" ? `<span class="status-chip wait">${ICON.clock}${esc(t("team_applied"))}</span>` : tm.mine ? `<span class="mine-tag">${esc(t("team_mine"))}</span>` : ""}<button class="btn small" data-action="team" data-id="${tm.id}">${esc(t("more"))}</button></div></div></article>`;
}
function renderTeams() {
  const tabs = t("team_tabs"), mineN = myTeams().reduce((a, tm) => a + S.scrims.filter(s => s.team === tm.id && s.status === "incoming").length + (tm.apps || []).length, 0);
  let h = `<div class="tabs" role="tablist">${Object.keys(tabs).map(k => `<button role="tab" data-ttab="${k}" aria-selected="${S.teamTab === k}">${esc(tabs[k])}${k === "mine" && mineN ? `<span class="badge">${mineN}</span>` : ""}</button>`).join("")}</div>`;
  if (S.teamTab === "browse") h += browseHtml();
  else if (S.teamTab === "scrims") h += scrimsHtml();
  else if (S.teamTab === "rating") h += ratingHtml();
  else h += mineHtml();
  $("#page").innerHTML = h;
}
function browseHtml() {
  const list = allTeams().filter(tm => S.game === "all" || tm.game === S.game).sort((a, b) => (rosterCount(b) < b.size ? 1 : 0) - (rosterCount(a) < a.size ? 1 : 0) || tst(b).rating - tst(a).rating);
  return `<div class="pagehead"><h2 class="sec">${esc(t("teams"))}</h2><span class="mono muted" style="font-size:12.5px">${list.length}</span><button class="btn primary small" data-action="team-new">${ICON.plus}${esc(t("team_new"))}</button></div>` +
    (list.length ? `<div class="tlist">${list.map(teamCard).join("")}</div>` : `<div class="empty"><span>${esc(t("teams_empty"))}</span><button class="btn primary small" data-action="team-new">${ICON.plus}${esc(t("team_new"))}</button></div>`);
}
function slotCard(sl) {
  const tm = findTeam(sl.team), st = tst(tm), on = ontime(st), sid = S.booked[sl.id], sc = sid ? S.scrims.find(x => x.id === sid) : null, mt = teamFor(sl.game);
  const action = sc ? stChip(sc) : `<button class="btn primary small" data-action="slot-book" data-id="${sl.id}">${esc(t("sc_book"))}</button>`;
  return `<article class="slotc${sc ? " hl" : ""}" style="--g:var(${GAMES[sl.game].color})"><div class="slotc-h"><div class="when"><span>${esc(dayLabel(sl.at))}</span><b>${clock(sl.at)}</b></div><button class="avbtn" data-action="team" data-id="${tm.id}" aria-label="${esc(tm.name)}">${tagTile(tm)}</button><div class="who"><b>${esc(tm.name)}</b><div class="meta"><span class="gtag"><i></i>${esc(gshort(sl.game))}</span><span>${esc(fmtLabel(sl.game, sl.format))}</span><span>·</span><span>${esc(regionName(tm.region))}</span></div></div><div class="rk"><span class="rk-sys">${esc(t("tm_rating"))}</span><span class="rating">${st.rating}</span></div></div>
<div class="slotc-f"><span class="hint">${loc(sl.note) ? esc(loc(sl.note)) + " · " : ""}${on != null ? esc(on + "% " + t("tm_on")) : ""}${mt && !sc ? " · " + esc(t("sc_vs")) + " " + esc(mt.tag) : ""}</span>${action}</div></article>`;
}
function scrimsHtml() {
  const g = S.game;
  if (g !== "all" && !SCRIM_GAMES.includes(g)) return `<div class="empty"><span>${esc(t("sc_br"))}</span></div>`;
  const slots = SLOTS.filter(sl => (g === "all" || sl.game === g) && sl.at > Date.now() - 30 * 60000 && !isBanned(sl.team)).sort((a, b) => a.at - b.at);
  const mt = g !== "all" ? teamFor(g) : null;
  return `<div class="pagehead"><h2 class="sec">${esc(t("sc_slots"))}</h2>${mt && can(mt, "scrims") ? `<button class="btn primary small" data-action="slot-new" data-id="${mt.id}">${ICON.plus}${esc(t("sc_new"))}</button>` : ""}${myTeams().length ? `<button class="btn small" data-action="team-tab" data-tab="mine">${esc(t("sc_mine_link"))}</button>` : ""}</div><p class="hint" style="margin:-6px 0 14px">${esc(t("sc_slots_note"))}</p>` +
    (slots.length ? `<div class="slist">${slots.map(slotCard).join("")}</div>` : `<div class="empty"><span>${esc(t("sc_empty"))}</span></div>`);
}
function ratingHtml() {
  const g = S.game === "all" ? null : S.game;
  if (!g) return `<div class="empty"><span>${esc(t("lb_pick"))}</span></div>`;
  if (!SCRIM_GAMES.includes(g)) return `<div class="empty"><span>${esc(t("sc_br"))}</span></div>`;
  const list = allTeams().filter(tm => tm.game === g).sort((a, b) => tst(b).rating - tst(a).rating);
  return `<div class="pagehead"><h2 class="sec">${esc(t("lb_title", gname(g)))}</h2></div><div class="panel"><div class="scroll-x"><table class="lb"><thead><tr><th>#</th><th>${esc(t("lb_team"))}</th><th class="num">${esc(t("lb_rating"))}</th><th class="num opt">${esc(t("lb_rec"))}</th><th class="num opt">${esc(t("lb_on"))}</th></tr></thead><tbody>${list.map((tm, i) => { const st = tst(tm), on = ontime(st); return `<tr class="${tm.mine || S.apps[tm.id] === "accepted" ? "me" : ""}"><td class="pos${i < 3 ? " top3" : ""}">${i + 1}</td><td><button class="nickbtn tmc" data-action="team" data-id="${tm.id}">${tagTile(tm)}<span class="tn"><span class="n">${esc(tm.name)}</span><small class="sm">${st.w}–${st.l}–${st.d}${on != null ? " · " + on + "% " + esc(t("tm_on")) : ""}</small></span></button></td><td class="num rating">${st.rating}</td><td class="num opt">${st.w}–${st.l}–${st.d}</td><td class="num opt">${on != null ? on + "%" : "—"}</td></tr>`; }).join("")}</tbody></table></div><p class="hint">${esc(t("lb_note"))}</p></div>`;
}
function scrimCard(sc, tm) {
  const opp = sc.opp ? findTeam(sc.opp) : null, manage = can(tm, "scrims"), vt = can(tm, "veto"), ost = opp ? tst(opp) : null;
  let acts = "";
  if (sc.status === "open" && manage) acts = `<button class="btn ghost small" data-action="sc-cancel" data-id="${sc.id}">${esc(t("sc_cancel"))}</button>`;
  if (sc.status === "incoming" && manage) acts = `<button class="btn primary small" data-action="sc-accept" data-id="${sc.id}">${esc(t("sc_accept"))}</button><button class="btn ghost small" data-action="sc-decline" data-id="${sc.id}">${esc(t("sc_decline"))}</button>`;
  if (sc.status === "pending" && manage) acts = `<button class="btn ghost small" data-action="sc-cancel" data-id="${sc.id}">${esc(t("sc_cancel"))}</button>`;
  if (sc.status === "confirmed") acts = (MAPS[sc.game] && vt ? `<button class="btn small${sc.maps ? " on" : ""}" data-action="veto" data-id="${sc.id}">${sc.maps ? ICON.check + esc(t("veto_done_lbl")) : esc(t("veto"))}</button>` : "") + (vt ? `<button class="btn primary small" data-action="sc-report" data-id="${sc.id}">${esc(t("sc_report"))}</button>` : "") + (manage ? `<button class="btn ghost small" data-action="sc-cancel" data-id="${sc.id}">${esc(t("sc_cancel"))}</button>` : "");
  const title = opp ? `${t("sc_vs")} ${opp.name}` : t("sst").open;
  const delta = sc.status === "played" && sc.delta ? `<span class="${sc.delta > 0 ? "delta-up" : "delta-dn"}">${sc.delta > 0 ? "+" : ""}${sc.delta}</span>` : "";
  const sub = [fmtLabel(sc.game, sc.format), ost ? t("tm_rating") + " " + ost.rating : "", sc.maps ? t("sc_maps") + ": " + sc.maps.join(", ") : "", sc.status === "confirmed" ? t("sc_remind") : ""].filter(Boolean).join(" · ");
  return `<article class="slotc${sc.status === "incoming" ? " hl" : ""}" style="--g:var(${GAMES[sc.game].color})"><div class="slotc-h"><div class="when"><span>${esc(dayLabel(sc.at))}</span><b>${clock(sc.at)}</b></div>${opp ? `<button class="avbtn" data-action="team" data-id="${opp.id}" aria-label="${esc(opp.name)}">${tagTile(opp)}</button>` : ""}<div class="who"><b>${esc(title)}</b><div class="meta"><span>${esc(sub)}</span></div></div></div><div class="slotc-f"><span class="hint">${stChip(sc)} ${delta}</span>${acts}</div></article>`;
}
function mineHtml() {
  const list = myTeams();
  if (!list.length) return `<div class="empty"><span>${esc(t("mine_none"))}</span><button class="btn primary small" data-action="team-new">${ICON.plus}${esc(t("team_new"))}</button></div>`;
  const tm = list.find(x => x.id === S.myTeamSel) || list[0], G = GAMES[tm.game], st = tst(tm), on = ontime(st), role = myRole(tm), scr = SCRIM_GAMES.includes(tm.game);
  let h = list.length > 1 ? `<div class="seg" style="margin-bottom:14px">${list.map(x => `<button data-action="team-pick" data-id="${x.id}" aria-pressed="${x === tm}">${esc(x.tag)}</button>`).join("")}</div>` : "";
  h += `<div class="agrid"><div class="panel" style="--g:var(${G.color})"><div class="thead">${tagTile(tm)}<div class="who"><b>${esc(tm.name)}</b><div class="meta"><span class="gtag"><i></i>${esc(G.name)}</span><span>${esc(regionName(tm.region))}</span><span>·</span><span class="trole ${role}">${esc(t("trole")[role])}</span></div></div></div>
${scr ? `<div class="tstats"><div><b>${st.rating}</b><span>${esc(t("tm_rating"))}</span></div><div><b>${st.w}–${st.l}–${st.d}</b><span>${esc(t("tm_record"))}</span></div><div><b>${on != null ? on + "%" : "—"}</b><span>${esc(t("tm_on"))}</span></div><div><b>#${lbPlace(tm)}</b><span>${esc(t("tm_place"))}</span></div></div>` : ""}
<div class="actrow">${scr && can(tm, "scrims") ? `<button class="btn primary small" data-action="slot-new" data-id="${tm.id}">${ICON.plus}${esc(t("sc_new"))}</button><button class="btn small" data-action="sub-find" data-id="${tm.id}">${ICON.users}${esc(t("sub_find"))}</button>` : ""}${tm.mine && can(tm, "apps") ? `<button class="btn small" data-action="invite-link" data-kind="team" data-id="${tm.id}">${ICON.link}${esc(t("invite_link"))}</button>` : ""}<button class="btn small" data-action="share" data-kind="team" data-id="${tm.id}">${ICON.link}${esc(t("share"))}</button></div></div>`;
  if (scr) {
    const mine = S.scrims.filter(s => s.team === tm.id), up = mine.filter(s => s.status !== "played").sort((a, b) => a.at - b.at), hist = mine.filter(s => s.status === "played").sort((a, b) => b.at - a.at).slice(0, 6);
    h += `<div class="panel"><h2 class="sec">${esc(t("sc_upcoming"))}</h2>${up.length ? `<div class="slist">${up.map(s => scrimCard(s, tm)).join("")}</div>` : `<p class="hint">${esc(t("sc_none"))}</p>`}${hist.length ? `<h2 class="sec">${esc(t("sc_history"))}</h2><div class="slist">${hist.map(s => scrimCard(s, tm)).join("")}</div>` : ""}</div>`;
    const rq = S.subreq[tm.id];
    if (rq) h += `<div class="panel"><div class="panel-h"><h2 class="sec">${esc(t("sub_cands"))} · ${esc(roleName(tm.game, rq.role))} · ${esc(whenLabel(rq.at))}</h2><button class="btn ghost small" style="margin-left:auto" data-action="sub-close" data-id="${tm.id}">${esc(t("sub_close"))}</button></div>${rq.cands.length ? `<div>${rq.cands.map(findPost).filter(Boolean).map(p => { const rp = repOf(p), pct = rp.n ? Math.round(rp.up / rp.n * 100) : null; return `<div class="prow"><button class="avbtn" data-action="player" data-id="${p.id}" aria-label="${esc(p.nick)}">${avatar(p.nick, p.on)}</button><span class="txt"><b>${esc(p.nick)}</b><span>${esc(rankText(p.r, true))} · ${esc(roleName(p.game, p.roles[0]))}${pct != null ? ` · <span class="${pct < 80 ? "lowrep" : "okrep"}">${pct}%</span>` : ""}</span></span>${can(tm, "scrims") ? `<button class="btn primary small" data-action="sub-take" data-team="${tm.id}" data-id="${p.id}">${esc(t("sub_take"))}</button>` : ""}</div>`; }).join("")}</div>` : `<p class="hint">${esc(t("sub_wait"))}…</p>`}</div>`;
  }
  const roster = rosterOf(tm), canRoster = can(tm, "roster");
  h += `<div class="panel"><div class="panel-h"><h2 class="sec">${esc(t("team_roster"))}</h2><span class="hint" style="margin-left:auto">${esc(t("roster_main", rosterCount(tm), tm.size))}</span></div><div>${roster.map((m, i) => `<div class="prow">${avatar(m.me ? (S.profile.nick || "?") : m.nick, false)}<span class="txt"><b>${esc(m.me ? (S.profile.nick || t("you")) : m.nick)}${m.me ? ` · ${esc(t("you"))}` : ""}</b><span>${esc(m.role ? roleName(tm.game, m.role) : "—")}</span></span>${m.r ? miniRank(m.r) : ""}${canRoster && tm.mine && !m.me ? `<select class="inp mini" data-trole="${i}" data-team="${tm.id}" aria-label="${esc(t("team_role"))}">${TROLES.filter(r => r !== "captain").map(r => `<option value="${r}"${m.trole === r ? " selected" : ""}>${esc(t("trole")[r])}</option>`).join("")}</select>` : `<span class="trole ${m.trole}">${esc(t("trole")[m.trole])}</span>`}</div>`).join("")}</div>
<details class="how"><summary>${esc(t("perm_t"))}</summary><div class="scroll-x" style="margin-top:10px"><table class="perm"><thead><tr><th></th>${TROLES.map(r => `<th>${esc(t("trole")[r])}</th>`).join("")}</tr></thead><tbody>${Object.keys(PERMS).map(k => `<tr><td>${esc(t("perm")[k])}</td>${TROLES.map(r => `<td class="${PERMS[k].includes(r) ? "y" : "n"}">${PERMS[k].includes(r) ? "✓" : "—"}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details></div>`;
  if (tm.mine && can(tm, "apps")) {
    const apps = tm.apps || [];
    h += `<div class="panel"><h2 class="sec">${esc(t("team_apps"))}</h2>${apps.length ? apps.map((a, i) => `<div class="qitem"><div class="top">${avatar(a.nick, false)}<span class="txt"><b>${esc(a.nick)}</b><span>${esc(roleName(tm.game, a.role))}</span></span>${miniRank(a.r)}</div>${a.msg ? `<p class="ex">${esc(loc(a.msg))}</p>` : ""}<div class="acts"><button class="btn primary small" data-action="app-acc" data-team="${tm.id}" data-i="${i}">${esc(t("accept"))}</button><button class="btn ghost small" data-action="app-dec" data-team="${tm.id}" data-i="${i}">${esc(t("decline"))}</button></div></div>`).join("") : `<p class="hint">${esc(t("team_apps_empty"))}</p>`}</div>`;
  }
  h += `<div>${tm.mine ? `<button class="btn ghost small danger" data-action="team-disband" data-id="${tm.id}">${ICON.trash}${esc(t("team_disband"))}</button>` : `<button class="btn ghost small danger" data-action="team-leave" data-id="${tm.id}">${esc(t("leave"))}</button>`}</div></div>`;
  return h;
}
function teamSheet(id) {
  const tm = findTeam(id); if (!tm) return;
  const G = GAMES[tm.game], ap = S.apps[tm.id], n = rosterCount(tm), full = n >= tm.size, st = tst(tm), on = ontime(st), scr = SCRIM_GAMES.includes(tm.game);
  const roster = rosterOf(tm).map(m => `<div class="prow">${avatar(m.nick, false)}<span class="txt"><b>${esc(m.nick)}</b><span>${esc(m.role ? roleName(tm.game, m.role) : "—")}</span></span>${m.r ? miniRank(m.r) : ""}<span class="trole ${m.trole}">${esc(t("trole")[m.trole])}</span></div>`).join("");
  const member = tm.mine || ap === "accepted";
  const apply = !member && !ap && !full ? `<section class="blk"><h4>${esc(t("team_apply"))}</h4><div class="field"><label class="lbl" for="tapRole">${esc(t("team_role"))}</label><select class="inp" id="tapRole">${(tm.open.length ? tm.open : Object.keys(G.roles)).map(r => `<option value="${r}">${esc(roleName(tm.game, r))}</option>`).join("")}</select></div><div class="field"><label class="lbl" for="tapMsg">${esc(t("team_msg"))}</label><textarea class="inp" id="tapMsg" maxlength="300" placeholder="${esc(t("team_msg_ph"))}"></textarea></div></section>` : "";
  const foot = apply ? `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="tapGo">${esc(t("team_apply"))}</button>` : "";
  openSheet(tm.name, `<div class="thead" style="--g:var(${G.color})">${tagTile(tm)}<div class="who"><b>${esc(tm.name)}</b><div class="meta"><span class="gtag"><i></i>${esc(G.name)}</span><span>${esc(regionName(tm.region))}</span><span>·</span><span>${esc(t("styles")[tm.style])}</span></div></div></div>
${scr ? `<div class="tstats"><div><b>${st.rating}</b><span>${esc(t("tm_rating"))}</span></div><div><b>${st.w}–${st.l}–${st.d}</b><span>${esc(t("tm_record"))}</span></div><div><b>${on != null ? on + "%" : "—"}</b><span>${esc(t("tm_on"))}</span></div><div><b>#${lbPlace(tm)}</b><span>${esc(t("tm_place"))}</span></div></div>` : ""}
${loc(tm.desc) ? `<p class="note" style="margin:0">${esc(loc(tm.desc))}</p>` : ""}${loc(tm.sched) ? `<p class="hint" style="margin:0">${ICON.clock} ${esc(loc(tm.sched))}</p>` : ""}
<div class="actrow">${ap === "accepted" ? `<span class="status-chip">${ICON.check}${esc(t("team_accepted"))}</span>` : ap === "pending" ? `<span class="status-chip wait">${ICON.clock}${esc(t("team_applied"))}</span>` : ""}<button class="btn small" data-action="share" data-kind="team" data-id="${tm.id}">${ICON.link}${esc(t("share"))}</button>${member ? `<button class="btn small" data-action="goto-myteam" data-id="${tm.id}">${esc(t("team_tabs").mine)}</button>` : ""}</div>
<section class="blk"><h4>${esc(t("team_roster"))} · ${n}/${tm.size}</h4><div>${roster}</div></section>${apply}`, foot, ov => {
    const go = ov.querySelector("#tapGo");
    if (go) go.addEventListener("click", () => {
      if (!S.profile.nick) { toast(t("team_need_nick"), { label: t("open_profile"), fn: () => { closeModal(); setView("profile"); } }); return; }
      S.apps[tm.id] = "pending"; S.appRole[tm.id] = ov.querySelector("#tapRole").value; save(); closeModal(); renderTeams(); toast(t("team_sent"));
      setTimeout(() => { if (S.apps[tm.id] === "pending") { S.apps[tm.id] = "accepted"; save(); notify("team", t("n_team", tm.name), { type: "myteam", id: tm.id }); toast(t("n_team", tm.name)); if (S.view === "teams") renderTeams(); } }, 12000);
    });
  });
}
function teamNewSheet(game0) {
  if (!S.profile.nick) { toast(t("team_need_nick"), { label: t("open_profile"), fn: () => setView("profile") }); return; }
  const D = { game: game0 || (S.game !== "all" ? S.game : (S.profile.games[0] || "cs2")), style: "serious", open: [], err: "", name: "", tag: "", desc: "", sched: "", fill: true };
  const build = () => {
    const G = GAMES[D.game];
    return `${D.err ? `<p class="ferr">${esc(t(D.err))}</p>` : ""}<div class="row2"><div class="field"><label class="lbl" for="tnName">${esc(t("team_name"))}</label><input class="inp" id="tnName" maxlength="24" value="${esc(D.name)}"></div><div class="field"><label class="lbl" for="tnTag">${esc(t("team_tag"))}</label><input class="inp mono" id="tnTag" maxlength="5" autocapitalize="characters" value="${esc(D.tag)}" placeholder="ABC"></div></div><p class="hint" style="margin-top:-14px">${esc(t("team_tag_hint"))}</p>
<section class="fsec"><h4>${esc(t("s_game"))}</h4><div class="gpick">${railOrder().map(k => `<button type="button" data-tg="${k}" aria-pressed="${k === D.game}" style="--g:var(${GAMES[k].color})"><i></i>${esc(gshort(k))}</button>`).join("")}</div></section>
<section class="fsec"><h4>${esc(t("team_open"))}</h4><div class="chips">${Object.keys(G.roles).map(r => `<button type="button" class="chip" data-tr="${r}" aria-pressed="${D.open.includes(r)}">${esc(roleName(D.game, r))}</button>`).join("")}</div></section>
<section class="fsec"><h4>${esc(t("style"))}</h4><div class="seg">${STYLES.map(s => `<button type="button" data-ts="${s}" aria-pressed="${D.style === s}">${esc(t("styles")[s])}</button>`).join("")}</div></section>
<div class="field"><label class="lbl" for="tnDesc">${esc(t("team_desc"))}</label><textarea class="inp" id="tnDesc" maxlength="240" placeholder="${esc(t("team_desc_ph"))}">${esc(D.desc)}</textarea></div>
<div class="field"><label class="lbl" for="tnSched">${esc(t("team_sched"))}</label><input class="inp" id="tnSched" maxlength="80" placeholder="${esc(t("team_sched_ph"))}" value="${esc(D.sched)}"></div>
<div class="field" style="gap:4px"><label class="check"><input type="checkbox" id="tnFill"${D.fill ? " checked" : ""}> ${esc(t("fill_demo"))}</label><p class="hint">${esc(t("fill_demo_note"))}</p></div>`;
  };
  const read = () => { D.name = $("#tnName").value; D.tag = $("#tnTag").value; D.desc = $("#tnDesc").value; D.sched = $("#tnSched").value; D.fill = $("#tnFill").checked; };
  openSheet(t("team_new"), build(), `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="tnGo">${esc(t("team_create"))}</button>`, ov => {
    ov.addEventListener("click", e => {
      const g = e.target.closest("[data-tg]"), r = e.target.closest("[data-tr]"), s = e.target.closest("[data-ts]");
      if (g || r || s) { read(); if (g) { D.game = g.dataset.tg; D.open = []; } if (r) { const k = r.dataset.tr, i = D.open.indexOf(k); i >= 0 ? D.open.splice(i, 1) : D.open.push(k); } if (s) D.style = s.dataset.ts; D.err = ""; $("#sheetBody").innerHTML = build(); return; }
      if (!e.target.closest("#tnGo")) return;
      read(); const name = D.name.trim(), tag = D.tag.trim().toUpperCase();
      if (name.length < 3) { D.err = "team_err_name"; $("#sheetBody").innerHTML = build(); return; }
      if (!/^[A-Z0-9]{2,5}$/.test(tag)) { D.err = "team_err_tag"; $("#sheetBody").innerHTML = build(); return; }
      const G = GAMES[D.game], sys = G.systems[0], myR = myRank(D.game, sys) || defRank(sys) || { sys: "premier", v: 15000 };
      const id = "mt" + Date.now(), roles = Object.keys(G.roles), R = rng(hashStr(id));
      const capRole = (S.profile.roles[D.game] || [])[0] || roles.find(x => !D.open.includes(x)) || roles[0];
      const members = [{ nick: S.profile.nick, role: capRole, r: myRank(D.game, sys) || null, trole: "captain", me: true }];
      if (D.fill) { const free = roles.filter(x => x !== capRole && !D.open.includes(x)); const used = new Set(); for (let i = 0; i < Math.max(0, G.size - 1 - D.open.length); i++) { let n, guard = 0; do { n = NICKS[Math.floor(R() * NICKS.length)]; } while (used.has(n) && guard++ < 60); used.add(n); members.push({ nick: n, role: free[i % Math.max(1, free.length)] || roles[0], trole: i === 0 ? "manager" : "player" }); } }
      const tm = { id, mine: true, name, tag, game: D.game, region: S.profile.region, style: D.style, size: G.size, open: D.open.slice(), desc: D.desc.trim(), sched: D.sched.trim(), members, apps: [] };
      S.teams.unshift(tm); addMyGame(D.game); S.teamTab = "mine"; S.myTeamSel = id; save(); closeModal(); setView("teams"); toast(t("team_created"));
      if (D.open.length) {
        const mkApp = (nick, msg) => { const role = D.open[Math.floor(R() * D.open.length)], r = Object.assign({}, myR); if (SYS[myR.sys].kind === "tiers") { r.t = Math.max(0, Math.min(SYS[myR.sys].tiers.ru.length - 1, myR.t + (R() < 0.5 ? 0 : 1))); if (hasSub(myR.sys, r.t)) r.s = r.s || SYS[myR.sys].subDef; else delete r.s; } return { nick, role, r, msg }; };
        setTimeout(() => { const t1 = S.teams.find(x => x.id === id); if (!t1) return; const a = mkApp("Clutch_Nik", { ru: "Привет! Играю давно, могу по вечерам, есть микрофон.", en: "Hi! Long-time player, free in the evenings, have a mic." }); t1.apps.push(a); save(); notify("app", t("n_app", a.nick, t1.name), { type: "myteam", id }); if (S.view === "teams") renderTeams(); }, 9000);
      }
    });
  });
}
function slotNewSheet(teamId) {
  const tm = findTeam(teamId); if (!tm || !can(tm, "scrims")) { toast(t("sc_no_rights")); return; }
  const D = { day: 0, format: "bo1" }, times = []; for (let h = 12; h <= 23; h++) { times.push(h + ":00"); times.push(h + ":30"); }
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
      const sc = { id: "sc" + Date.now(), team: tm.id, opp: null, game: tm.game, at, format: D.format, note: D.note.trim(), status: "open" };
      S.scrims.push(sc); save(); closeModal(); renderTeams(); toast(t("sc_created"));
      setTimeout(() => simIncoming(sc.id), 9000);
    });
  });
}
function simIncoming(id) {
  const sc = S.scrims.find(x => x.id === id); if (!sc || sc.status !== "open") return;
  const my = tst(findTeam(sc.team)), opps = allTeams().filter(x => x.game === sc.game && !x.mine && S.apps[x.id] !== "accepted" && x.id !== sc.team);
  if (!opps.length) return;
  opps.sort((a, b) => Math.abs(tst(a).rating - my.rating) - Math.abs(tst(b).rating - my.rating));
  sc.opp = opps[0].id; sc.status = "incoming"; save();
  notify("scrim", t("sc_in_n", opps[0].name, whenLabel(sc.at)), { type: "myteam", id: sc.team }); toast(t("sc_in_n", opps[0].name, whenLabel(sc.at)));
  if (S.view === "teams") renderTeams();
}
function bookSlot(slotId) {
  const sl = SLOTS.find(x => x.id === slotId); if (!sl) return;
  const tm = teamFor(sl.game);
  if (!tm) { toast(t("sc_need_team", gname(sl.game)), { label: t("team_new"), fn: () => teamNewSheet(sl.game) }); return; }
  if (!can(tm, "scrims")) { toast(t("sc_no_rights")); return; }
  const sc = { id: "sc" + Date.now(), team: tm.id, opp: sl.team, game: sl.game, at: sl.at, format: sl.format, note: loc(sl.note), status: "pending", slot: sl.id };
  S.scrims.push(sc); S.booked[sl.id] = sc.id; save(); renderTeams(); toast(t("sc_requested"));
  setTimeout(() => {
    const cur = S.scrims.find(x => x.id === sc.id); if (!cur || cur.status !== "pending") return;
    cur.status = "confirmed"; save(); const o = findTeam(cur.opp);
    notify("scrim", t("sc_ok_n", o.name, whenLabel(cur.at)), { type: "myteam", id: cur.team }); toast(t("sc_ok_n", o.name, whenLabel(cur.at)));
    if (S.view === "teams") renderTeams();
  }, 6000);
}
function vetoSheet(id) {
  const sc = S.scrims.find(x => x.id === id); if (!sc || !MAPS[sc.game]) return;
  const seq = VETO_SEQ[sc.format], R = rng(hashStr(id + "v")), V = { i: 0, res: {}, order: [] };
  const by = i => (i % 2 === 0 ? "us" : "them");
  const free = () => MAPS[sc.game].filter(m => !V.res[m]);
  const apply = map => { const a = seq[V.i]; V.res[map] = { a, by: a === "dec" ? null : by(V.i) }; if (a !== "ban") V.order.push(map); V.i++; };
  const settle = () => {
    while (V.i < seq.length && seq[V.i] === "dec") apply(free()[0]);
    render();
    if (V.i < seq.length && by(V.i) === "them") setTimeout(() => { if (!$("#vetoGrid")) return; const f = free(); apply(f[Math.floor(R() * f.length)]); settle(); }, 800);
  };
  const render = () => {
    const done = V.i >= seq.length, ours = !done && by(V.i) === "us";
    const step = done ? `<div class="veto-step">${ICON.check}${esc(t("veto_result"))}: ${esc(V.order.join(", "))}</div>` : `<div class="veto-step${ours ? "" : " them"}">${ours ? esc(t("veto_us")) + " · " + esc(t("veto_act")[seq[V.i]]) : esc(t("veto_them"))}</div>`;
    const grid = `<div class="veto-grid" id="vetoGrid">${MAPS[sc.game].map(m => { const r = V.res[m]; return r ? `<div class="vmap ${r.a}"><span>${esc(m)}</span><small>${esc(t("veto_act")[r.a])}${r.by ? " · " + esc(t("veto_by")[r.by]) : ""}</small></div>` : `<button type="button" class="vmap" data-vm="${esc(m)}"${ours ? "" : " disabled"}><span>${esc(m)}</span><small>${esc(fmtLabel(sc.game, sc.format))}</small></button>`; }).join("")}</div>`;
    $("#sheetBody").innerHTML = step + grid + `<p class="hint">${esc(t("veto_pool")[sc.game])}</p>`;
    const sv = $("#vetoSave"); if (sv) sv.disabled = !done;
  };
  const opp = findTeam(sc.opp);
  openSheet(t("veto") + " · " + (opp ? opp.tag : ""), "", `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="vetoSave" disabled>${esc(t("veto_save"))}</button>`, ov => {
    ov.addEventListener("click", e => {
      const b = e.target.closest("[data-vm]");
      if (b && !b.disabled && V.i < seq.length && by(V.i) === "us") { apply(b.dataset.vm); settle(); return; }
      if (e.target.closest("#vetoSave") && V.i >= seq.length) { sc.maps = V.order.slice(); save(); closeModal(); renderTeams(); toast(t("veto_saved")); }
    });
  });
  settle();
}
function reportScrimSheet(id) {
  const sc = S.scrims.find(x => x.id === id); if (!sc) return;
  const tm = findTeam(sc.team), opp = findTeam(sc.opp), n = FORMATS[sc.format], hasMaps = !!MAPS[sc.game], D = { beh: "ok", win: {} };
  const rows = () => Array.from({ length: n }, (_, i) => hasMaps
    ? `<div class="rrow2"><span class="lbl">${esc(t("rep_map", i + 1))}</span><select class="inp" id="rm${i}"><option value="">${esc(t("rep_skip"))}</option>${MAPS[sc.game].map(m => `<option${sc.maps && sc.maps[i] === m ? " selected" : ""}>${esc(m)}</option>`).join("")}</select><span class="score"><input class="inp" type="number" inputmode="numeric" min="0" max="40" id="ra${i}" aria-label="${esc(t("rep_we"))}">:<input class="inp" type="number" inputmode="numeric" min="0" max="40" id="rb${i}" aria-label="${esc(t("rep_they"))}"></span></div>`
    : `<div class="rrow2"><span class="lbl">${esc(t("rep_game", i + 1))}</span><div class="seg">${["us", "them", "skip"].map(w => `<button type="button" data-rw="${i}" data-v="${w}" aria-pressed="${(D.win[i] || (i < 1 ? "" : "skip")) === w}">${esc(w === "us" ? t("rep_we") : w === "them" ? t("rep_they") : t("rep_skip"))}</button>`).join("")}</div></div>`).join("");
  const build = () => `<p class="hint" style="margin:0">${esc(t("sc_vs"))} ${esc(opp.name)} · ${esc(whenLabel(sc.at))} · ${esc(fmtLabel(sc.game, sc.format))}</p><div class="field"><span class="lbl">${esc(t("rep_beh"))}</span><div class="seg">${["ok", "late", "ns"].map(b => `<button type="button" data-rb="${b}" aria-pressed="${D.beh === b}">${esc(t("beh")[b])}</button>`).join("")}</div></div>${D.beh === "ns" ? "" : `<div style="display:grid;gap:8px">${rows()}</div>`}<p class="hint">${esc(t("rep_demo"))}</p>`;
  openSheet(t("rep_t"), build(), `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="repGo">${esc(t("rep_send"))}</button>`, ov => {
    ov.addEventListener("click", e => {
      const b = e.target.closest("[data-rb]"), w = e.target.closest("[data-rw]");
      if (b) { D.beh = b.dataset.rb; $("#sheetBody").innerHTML = build(); return; }
      if (w) { D.win[+w.dataset.rw] = w.dataset.v; $$(`[data-rw="${w.dataset.rw}"]`).forEach(x => x.setAttribute("aria-pressed", String(x === w))); return; }
      if (!e.target.closest("#repGo")) return;
      const my = tst(tm), os = tst(opp);
      if (D.beh === "ns") { os.ns++; S.tpatch[opp.id] = os; sc.status = "played"; sc.res = "ns"; sc.delta = 0; save(); closeModal(); renderTeams(); toast(t("rep_ns_saved")); return; }
      let wins = 0, losses = 0;
      for (let i = 0; i < n; i++) {
        if (hasMaps) { const a = parseInt($("#ra" + i).value, 10), bb = parseInt($("#rb" + i).value, 10); if (isNaN(a) || isNaN(bb) || a === bb) continue; a > bb ? wins++ : losses++; }
        else { const v = D.win[i]; if (v === "us") wins++; else if (v === "them") losses++; }
      }
      if (!wins && !losses) { toast(t("rep_need")); return; }
      const res = wins > losses ? 1 : wins < losses ? 0 : 0.5, E = 1 / (1 + Math.pow(10, (os.rating - my.rating) / 400)), dm = Math.round(32 * (res - E));
      my.rating += dm; os.rating -= dm;
      if (res === 1) { my.w++; os.l++; } else if (res === 0) { my.l++; os.w++; } else { my.d++; os.d++; }
      if (D.beh === "ok") os.ok++; else os.late++;
      S.tpatch[tm.id] = my; S.tpatch[opp.id] = os;
      sc.status = "played"; sc.res = res; sc.delta = dm; sc.score = wins + ":" + losses; sc.played = Date.now(); S.mod.scrims++;
      save(); closeModal(); renderTeams(); toast(t("rep_saved", dm));
    });
  });
}
function subFindSheet(teamId) {
  const tm = findTeam(teamId); if (!tm || !can(tm, "scrims")) { toast(t("sc_no_rights")); return; }
  const G = GAMES[tm.game], up = S.scrims.filter(s => s.team === teamId && s.status === "confirmed" && s.at > Date.now());
  openSheet(t("sub_t") + " · " + tm.tag, `<div class="row2"><div class="field"><label class="lbl" for="sbRole">${esc(t("team_role"))}</label><select class="inp" id="sbRole">${Object.keys(G.roles).map(r => `<option value="${r}">${esc(roleName(tm.game, r))}</option>`).join("")}</select></div>
<div class="field"><label class="lbl" for="sbFor">${esc(t("sub_for"))}</label><select class="inp" id="sbFor">${up.map(s => `<option value="${s.id}">${esc(t("sc_vs"))} ${esc(findTeam(s.opp).tag)} · ${esc(whenLabel(s.at))}</option>`).join("")}<option value="eve">${esc(t("sub_evening"))}</option></select></div></div>
<div class="field"><label class="lbl" for="sbNote">${esc(t("s_note"))}</label><textarea class="inp" id="sbNote" maxlength="200" placeholder="${esc(t("sub_note_ph"))}"></textarea></div>`,
    `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="sbGo">${esc(t("publish"))}</button>`, ov => {
      ov.querySelector("#sbGo").addEventListener("click", () => {
        const role = $("#sbRole").value, f = $("#sbFor").value, sc = S.scrims.find(x => x.id === f), at = sc ? sc.at : nextAt(20, 0), now = Date.now();
        const old = S.subreq[tm.id]; if (old) S.posts = S.posts.filter(p => p.id !== old.post);
        const sys = G.systems[0], post = { id: "sub-" + now, kind: "sub", mine: true, team: tm.id, nick: S.profile.nick, game: tm.game, mode: Object.keys(G.modes)[0], r: myRank(tm.game, sys) || defRank(sys) || { sys: "premier", v: 15000 }, roles: [role], have: rosterCount(tm), region: tm.region, langs: S.profile.langs.slice(), mic: true, on: true, ver: false, t: now, t0: now, exp: at, at, note: $("#sbNote").value.trim(), style: tm.style, stags: [], when: [] };
        S.posts.unshift(post); S.subreq[tm.id] = { post: post.id, role, at, cands: [] };
        save(); closeModal(); renderFeed(); renderTeams(); toast(t("sub_posted"));
        setTimeout(() => {
          const rq = S.subreq[tm.id]; if (!rq || rq.post !== post.id) return;
          const inTeam = rosterOf(tm).map(m => m.nick);
          rq.cands = SEED.filter(p => p.game === tm.game && !p.kind && !S.blocked.includes(p.id) && !isBanned(p.id) && !inTeam.includes(p.nick)).sort((a, b) => (b.roles.includes(role) ? 1 : 0) - (a.roles.includes(role) ? 1 : 0) || (b.on ? 1 : 0) - (a.on ? 1 : 0)).slice(0, 3).map(p => p.id);
          if (!rq.cands.length) return;
          save(); notify("app", t("sub_resp_n", rq.cands.length) + " · " + tm.name, { type: "myteam", id: tm.id }); toast(t("sub_resp_n", rq.cands.length) + " · " + tm.name);
          renderFeed(); if (S.view === "teams") renderTeams();
        }, 6000);
      });
    });
}

/* ================= admin ================= */
function nickOf(id) { if (id === "me") return S.profile.nick || t("a_you"); const p = findPost(id); return p ? p.nick : id; }
function renderAdmin() {
  const act = activePosts(), openR = S.mod.reports;
  const counts = GAME_KEYS.map(g => ({ g, n: act.filter(p => p.game === g).length })).sort((a, b) => b.n - a.n);
  const maxN = Math.max(1, ...counts.map(c => c.n));
  const hours = [6, 4, 3, 2, 2, 2, 3, 5, 8, 10, 12, 14, 16, 18, 20, 24, 30, 38, 48, 62, 74, 80, 66, 34];
  const maxH = Math.max(...hours), peak = hours.indexOf(maxH);
  const week = [28, 31, 25, 36, 44, 61, 52], maxW = Math.max(...week);
  const reportsHtml = openR.length ? openR.map(r => {
    const p = findPost(r.target);
    return `<div class="qitem"><div class="top">${avatar(nickOf(r.target), false)}<span class="txt"><b>${esc(nickOf(r.target))}</b><span>${esc(t("a_from", r.from))} · ${esc(rel(r.t))}${p ? " · " + esc(gshort(p.game)) : ""}</span></span><span class="rsn">${esc(t("reasons")[r.reason])}</span></div>${p ? `<p class="ex">${esc(noteOf(p))}</p>` : ""}
<div class="acts"><button class="btn small" data-adm="hide" data-id="${r.id}">${esc(t("a_hide"))}</button><button class="btn small" data-adm="ban7" data-id="${r.id}">${esc(t("a_ban7"))}</button><button class="btn small danger" data-adm="banp" data-id="${r.id}">${esc(t("a_banp"))}</button><button class="btn ghost small" data-adm="dismiss" data-id="${r.id}">${esc(t("a_dismiss"))}</button></div></div>`;
  }).join("") : `<p class="hint">${esc(t("a_reports_empty"))}</p>`;
  const rankHtml = S.mod.rankq.length ? S.mod.rankq.map(q => {
    const g = q.game || SYS_GAME[q.sys];
    let r = null; if (q.target === "me") r = myRank(g, q.sys); else { const p = findPost(q.target); if (p) r = [p.r].concat(p.extra || []).find(x => x.sys === q.sys) || null; }
    return `<div class="qitem"><div class="top">${avatar(nickOf(q.target), false)}<span class="txt"><b>${esc(nickOf(q.target))}</b><span>${esc(gname(g))} · ${esc(sysLabel(q.sys))} · ${esc(rel(q.t))}</span></span>${r ? miniRank(r) : ""}</div>${q.img ? `<img class="shot" src="${q.img}" alt="">` : `<p class="hint">${esc(t("a_noshot"))}</p>`}
<div class="acts"><button class="btn primary small" data-adm="rok" data-id="${q.id}">${esc(t("a_approve"))}</button><button class="btn ghost small" data-adm="rno" data-id="${q.id}">${esc(t("a_reject"))}</button></div></div>`;
  }).join("") : `<p class="hint">${esc(t("a_ranks_empty"))}</p>`;
  const bans = Object.keys(S.mod.banned).filter(isBanned);
  const bansHtml = bans.length ? bans.map(id => { const b = S.mod.banned[id]; return `<div class="prow">${avatar(nickOf(id), false)}<span class="txt"><b>${esc(nickOf(id))}</b><span>${esc(b.until ? t("a_until", dateStr(b.until)) : t("a_forever"))} · ${esc(t("reasons")[b.reason] || "")}</span></span><button class="btn ghost small" data-adm="unban" data-id="${id}">${esc(t("a_unban"))}</button></div>`; }).join("") : `<p class="hint">${esc(t("a_bans_empty"))}</p>`;
  const rows = act.slice().sort((a, b) => b.t0 - a.t0).map(p => `<tr><td>${esc(p.nick)}</td><td><span class="gtag" style="--g:var(${GAMES[p.game].color})"><i></i>${esc(gshort(p.game))}</span></td><td>${miniRank(p.r)}</td><td class="num">${esc(leftText(p.exp - Date.now()))}</td><td>${p.mine ? "" : `<button class="btn ghost small" data-adm="remove" data-id="${p.id}">${esc(t("a_hide"))}</button>`}</td></tr>`).join("");
  $("#page").innerHTML = `<div class="agrid"><div class="pagehead" style="margin:0"><h2 class="sec">${esc(t("admin"))}</h2></div><p class="demo-note">${esc(t("admin_demo"))}</p>
<div class="kpis"><div class="kpi"><span>${esc(t("k_users"))}</span><b>${fmt(1284 + S.friends.length)}</b><small>${esc(t("k_users_d"))} · ${esc(t("k_prem", 86 + (S.prem ? 1 : 0)))}</small></div><div class="kpi"><span>${esc(t("k_posts"))}</span><b>${act.length}</b></div><div class="kpi"><span>${esc(t("k_scrims"))}</span><b>${S.mod.scrims + S.scrims.filter(s => s.status === "confirmed").length}</b></div><div class="kpi${openR.length ? " alert" : ""}"><span>${esc(t("k_reports"))}</span><b>${openR.length}</b></div></div>
<div class="charts"><div class="panel"><h2 class="sec">${esc(t("ch_games"))}</h2><div class="hbars">${counts.filter(c => c.n).map(c => `<div class="hbar" style="--g:var(${GAMES[c.g].color})"><span class="l">${esc(gshort(c.g))}</span><span class="tr"><i style="width:${(c.n / maxN * 100).toFixed(0)}%"></i></span><span class="v">${c.n}</span></div>`).join("")}</div></div>
<div class="panel"><h2 class="sec">${esc(t("ch_week"))}</h2><div class="vbars">${week.map(v => `<div class="b${v === maxW ? " pk" : ""}"><i style="height:${(v / maxW * 100).toFixed(0)}%"><em>${v}</em></i></div>`).join("")}</div><div class="vlabels">${t("days").map(d => `<span>${esc(d)}</span>`).join("")}</div></div>
<div class="panel" style="grid-column:1/-1"><h2 class="sec">${esc(t("ch_hours"))}</h2><div class="vbars">${hours.map((v, i) => `<div class="b${i === peak ? " pk" : ""}" title="${String(i).padStart(2, "0")}:00 · ${v}"><i style="height:${(v / maxH * 100).toFixed(0)}%">${i === peak ? `<em>${v}</em>` : ""}</i></div>`).join("")}</div><div class="vlabels">${hours.map((v, i) => `<span>${i % 6 === 0 ? String(i).padStart(2, "0") : ""}</span>`).join("")}</div></div></div>
<div class="charts"><div class="panel"><h2 class="sec">${esc(t("q_reports"))} · ${openR.length}</h2><div>${reportsHtml}</div></div><div class="panel"><h2 class="sec">${esc(t("q_ranks"))} · ${S.mod.rankq.length}</h2><div>${rankHtml}</div></div></div>
<div class="panel"><h2 class="sec">${esc(t("q_bans"))}</h2><div>${bansHtml}</div></div>
<div class="panel"><h2 class="sec">${esc(t("q_posts"))} · ${act.length}</h2><div class="scroll-x"><table class="posts"><thead><tr><th>${esc(t("a_player"))}</th><th>${esc(t("a_game"))}</th><th>${esc(t("a_rank"))}</th><th>${esc(t("a_left"))}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div></div>`;
}
function adminAction(act, id) {
  const M = S.mod;
  if (["hide", "ban7", "banp", "dismiss"].includes(act)) {
    const r = M.reports.find(x => x.id === id); if (!r) return;
    if (act === "dismiss") { M.reports = M.reports.filter(x => x.id !== id); toast(t("a_dismissed")); }
    else {
      M.resolved += M.reports.filter(x => x.target === r.target).length;
      M.reports = M.reports.filter(x => x.target !== r.target);
      if (act === "hide") { if (!M.removed.includes(r.target)) M.removed.push(r.target); toast(t("a_removed")); }
      else { M.banned[r.target] = { until: act === "ban7" ? Date.now() + 7 * 864e5 : 0, reason: r.reason }; GAME_KEYS.forEach(g => { S.stacks[g] = S.stacks[g].filter(x => x !== r.target); }); toast(t("a_banned", nickOf(r.target))); }
    }
  }
  if (act === "unban") { delete M.banned[id]; toast(t("a_unbanned", nickOf(id))); }
  if (act === "remove") { if (!M.removed.includes(id)) M.removed.push(id); toast(t("a_removed")); }
  if (act === "rok" || act === "rno") {
    const q = M.rankq.find(x => x.id === id); if (!q) return;
    M.rankq = M.rankq.filter(x => x.id !== id);
    if (q.target === "me") {
      delete S.profile.pending[q.sys];
      if (act === "rok") { S.profile.ver[q.sys] = "shot"; S.posts.forEach(p => { if (p.r.sys === q.sys) p.ver = true; }); notify("rank", t("n_rank"), { type: "profile" }); }
      else notify("rank", t("n_rank_no"), { type: "profile" });
    } else if (act === "rok") { M.ok[q.target] = true; applyModToSeeds(); }
    toast(act === "rok" ? t("a_rank_ok") : t("a_rank_no"));
  }
  save(); renderAdmin(); renderRail(); renderFeed(); renderStack();
}

/* ================= events ================= */
document.addEventListener("click", e => {
  const nav = e.target.closest("[data-nav]");
  if (nav) { const v = nav.dataset.nav; if ($("#overlay")) closeModal(); if (v === "chats" && isWide()) { S.active = null; setView("feed"); return; } setView(v); return; }
  const gb = e.target.closest("[data-game]");
  if (gb) { setGame(gb.dataset.game); renderRail(); if (S.view === "teams") { renderTeams(); return; } renderQuick(); renderFilters(); renderStack(); renderFeed(); return; }
  const tt = e.target.closest("[data-ttab]");
  if (tt) { S.teamTab = tt.dataset.ttab; renderTeams(); return; }
  const qb = e.target.closest("[data-q]");
  if (qb) {
    const k = qb.dataset.q;
    if (k === "match" && !S.q.match && !hasAnyRank()) { toast(t("need_rank_match"), { label: t("open_profile"), fn: () => setView("profile") }); return; }
    S.q[k] = !S.q[k]; $$(`[data-q="${k}"]`).forEach(b => b.setAttribute("aria-pressed", String(S.q[k]))); renderFeed(); renderQuick(); const sn = $("#showN"); if (sn) sn.textContent = t("show_n", filtered().length); return;
  }
  const fpt = e.target.closest("[data-fparty]");
  if (fpt) { S.f.stags = S.f.stags.filter(x => !PARTY_TAGS.includes(x)); if (fpt.dataset.fparty !== "any") S.f.stags.push(fpt.dataset.fparty); renderFilters(); afterFilter(); return; }
  for (const [attr, key] of [["fm", "modes"], ["fr", "roles"], ["fst", "styles"], ["fsg", "stags"]]) {
    const el = e.target.closest("[data-" + attr + "]");
    if (el) { const v = el.dataset[attr], a = S.f[key], i = a.indexOf(v); i >= 0 ? a.splice(i, 1) : a.push(v); $$(`[data-${attr}="${v}"]`).forEach(b => b.setAttribute("aria-pressed", String(i < 0))); afterFilter(); return; }
  }
  const fs = e.target.closest("[data-fs]");
  if (fs) { S.f.sys = fs.dataset.fs; resetRange(); renderFilters(); afterFilter(); return; }
  const prof = [["pl", "langs"], ["ptime", "time"], ["pdays", "days"]];
  for (const [attr, key] of prof) {
    const el = e.target.closest("[data-" + attr + "]");
    if (el) { const v = el.dataset[attr], a = S.profile[key], i = a.indexOf(v); i >= 0 ? a.splice(i, 1) : a.push(v); el.setAttribute("aria-pressed", String(i < 0)); save(); profileStatus(); return; }
  }
  const ps = e.target.closest("[data-pstyle]");
  if (ps) { S.profile.style = ps.dataset.pstyle; $$("[data-pstyle]").forEach(b => b.setAttribute("aria-pressed", String(b === ps))); save(); profileStatus(); return; }
  const cv = e.target.closest("[data-cvis]");
  if (cv) { S.profile.cvis = cv.dataset.cvis; S.posts.forEach(p => { p.cvis = S.profile.cvis; }); $$("[data-cvis]").forEach(b => b.setAttribute("aria-pressed", String(b === cv))); $("#cvisNote").textContent = t("cvis_note")[S.profile.cvis]; save(); profileStatus(); return; }
  const adm = e.target.closest("[data-adm]");
  if (adm) { adminAction(adm.dataset.adm, adm.dataset.id); return; }
  const a = e.target.closest("[data-action]");
  if (!a) return;
  const id = a.dataset.id, over = !!$("#overlay");
  switch (a.dataset.action) {
    case "new-post": postSheet(); break;
    case "publish": doPublish(); break;
    case "close-modal": closeModal(); break;
    case "open-filters": filtersSheet(); break;
    case "reset-filters": case "reset-all": {
      const g = S.game; S.f = { q: "", modes: [], roles: [], sys: "any", rmin: 0, rmax: 99, region: "any", lng: "any", styles: [], stags: [] }; setGame(g);
      if (a.dataset.action === "reset-all") S.q = blankQ();
      renderFilters(); afterFilter(); break;
    }
    case "open-chat": if (over) closeModal(); openChat(id); break;
    case "close-chat": S.active = null; renderChat(); break;
    case "toggle-stack": toggleStack(id); break;
    case "player": playerSheet(id); break;
    case "fav": toggleFav(id); break;
    case "block": setBlocked(id, true); break;
    case "unblock": setBlocked(id, false); break;
    case "rate": if (over) closeModal(); rateSheet([id]); break;
    case "rate-stack": rateSheet(S.stacks[a.dataset.g].slice()); break;
    case "call-again": callAgain(id); break;
    case "report": if (over) closeModal(); reportSheet(id); break;
    case "copy": copyText(a.dataset.copy); break;
    case "qr": sendMsg(a.dataset.text); break;
    case "send-contacts": {
      if (!S.profile.dc && !S.profile.tg) { toast(t("no_my_contacts"), { label: t("open_profile"), fn: () => setView("profile") }); break; }
      sendMsg(t("my_contacts_msg") + contactLine(S.profile)); break;
    }
    case "renew": { const p = S.posts.find(x => x.id === id); if (p) { const now = Date.now(); p.t0 = now; p.exp = now + p.dur * 60000; p.warned = false; save(); renderFeed(); if (S.view === "profile") renderProfile(); toast(t("renewed")); } break; }
    case "bump": {
      if (!S.prem) { premiumSheet(); break; }
      const last = S.bumpAt[id] || 0, left = last + 3 * 3600000 - Date.now();
      if (left > 0) { toast(t("bump_wait", Math.ceil(left / 60000))); break; }
      const p = S.posts.find(x => x.id === id); if (p) { S.bumpAt[id] = Date.now(); p.t0 = Date.now(); save(); renderFeed(); toast(t("bumped")); }
      break;
    }
    case "del-post": {
      const idx = S.posts.findIndex(x => x.id === id); if (idx < 0) break;
      const [p] = S.posts.splice(idx, 1); save(); renderRail(); renderFeed(); if (S.view === "profile") renderProfile();
      toast(t("deleted"), { label: t("undo"), fn: () => { S.posts.splice(idx, 0, p); save(); renderRail(); renderFeed(); if (S.view === "profile") renderProfile(); } });
      break;
    }
    case "repost": { const arc = S.archive[+a.dataset.i]; if (arc) postSheet(arc); break; }
    case "clear-stack": S.stacks[a.dataset.g] = []; delete S.voice[a.dataset.g]; save(); renderStack(); renderFeed(); break;
    case "voice": {
      const g = a.dataset.g; if (!S.stacks[g].length) { toast(t("voice_need")); break; }
      const name = "stuckup-" + g + "-" + (1000 + Math.floor(Math.random() * 9000));
      S.voice[g] = { name, at: Date.now() };
      S.stacks[g].forEach(pid => { if (S.chats[pid]) S.chats[pid].msgs.push({ sys: true, text: t("n_voice", name), t: Date.now() }); });
      save(); renderStack(); toast(t("voice_made")); notify("voice", t("n_voice", name), { type: "feed" }); break;
    }
    case "voice-open": toast(t("voice_open_demo")); break;
    case "voice-close": delete S.voice[a.dataset.g]; save(); renderStack(); break;
    case "group-chat": toast(t("group_chat_demo")); break;
    case "hide-setup": S.setupHidden = true; save(); renderSetup(); break;
    case "ob-start": obSheet(); break;
    case "reset-demo": resetSheet(); break;
    case "notifs": notifSheet(); break;
    case "acc": accSheet(a.dataset.k); break;
    case "acc-off": { const k = a.dataset.k; delete S.profile.acc[k]; ACC[k].sys.forEach(s => { if (S.profile.ver[s] === "api") delete S.profile.ver[s]; }); save(); renderProfile(); toast(t("acc_off", ACC[k].name)); break; }
    case "resync": toast(t("synced")); break;
    case "shot": shotSheet(a.dataset.g, a.dataset.sys); break;
    case "tg": tgSheet(); break;
    case "tg-off": S.set.tg = false; save(); renderProfile(); break;
    case "tg-test": notify("test", t("n_test")); toast(t("n_test")); break;
    case "scrollto": { const el = document.getElementById(a.dataset.t); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); break; }
    case "game-add": gameAddSheet(); break;
    case "game-edit": gameSheet(a.dataset.g, false); break;
    case "share": shareSheet(a.dataset.kind, id); break;
    case "invite-link": inviteSheet(a.dataset.kind, id); break;
    case "premium": premiumSheet(); break;
    case "team": teamSheet(id); break;
    case "team-new": teamNewSheet(); break;
    case "team-tab": S.teamTab = a.dataset.tab; renderTeams(); break;
    case "team-pick": S.myTeamSel = id; renderTeams(); break;
    case "goto-myteam": if (over) closeModal(); goTo({ type: "myteam", id }); break;
    case "team-disband": { S.teams = S.teams.filter(x => x.id !== id); S.scrims = S.scrims.filter(s => s.team !== id); const rq = S.subreq[id]; if (rq) { S.posts = S.posts.filter(p => p.id !== rq.post); delete S.subreq[id]; } save(); renderTeams(); renderRail(); toast(t("team_disbanded")); break; }
    case "team-leave": delete S.apps[id]; delete S.appRole[id]; save(); renderTeams(); toast(t("left")); break;
    case "app-acc": case "app-dec": {
      const tm = findTeam(a.dataset.team); if (!tm || !tm.apps) break; const i = +a.dataset.i, ap = tm.apps[i]; if (!ap) break; tm.apps.splice(i, 1);
      if (a.dataset.action === "app-acc") { tm.members.push({ nick: ap.nick, role: ap.role, r: ap.r, trole: "player" }); tm.open = tm.open.filter(r => r !== ap.role); toast(t("team_accept_toast", ap.nick)); }
      save(); renderTeams(); break;
    }
    case "slot-new": slotNewSheet(id); break;
    case "slot-book": bookSlot(id); break;
    case "sc-accept": { const sc = S.scrims.find(x => x.id === id); if (sc) { sc.status = "confirmed"; save(); renderTeams(); toast(t("sst").confirmed); } break; }
    case "sc-decline": { const sc = S.scrims.find(x => x.id === id); if (sc) { sc.status = "open"; sc.opp = null; save(); renderTeams(); } break; }
    case "sc-cancel": { const sc = S.scrims.find(x => x.id === id); if (sc) { S.scrims = S.scrims.filter(x => x !== sc); if (sc.slot) delete S.booked[sc.slot]; save(); renderTeams(); toast(t("sc_cancelled")); } break; }
    case "veto": vetoSheet(id); break;
    case "sc-report": reportScrimSheet(id); break;
    case "sub-find": subFindSheet(id); break;
    case "sub-close": { const rq = S.subreq[id]; if (rq) { S.posts = S.posts.filter(p => p.id !== rq.post); delete S.subreq[id]; save(); renderTeams(); renderFeed(); } break; }
    case "sub-take": {
      const tm = findTeam(a.dataset.team), rq = S.subreq[a.dataset.team], p = findPost(id); if (!tm || !rq || !p) break;
      tm.members.push({ nick: p.nick, role: rq.role, r: p.r, trole: "sub" }); S.posts = S.posts.filter(x => x.id !== rq.post); delete S.subreq[tm.id];
      save(); renderTeams(); renderFeed(); toast(t("sub_took", p.nick)); break;
    }
    case "sub-respond": {
      const p = findPost(id); if (!p) break; S.subApplied[id] = true; save(); renderFeed(); toast(t("sub_responded"));
      const tm = findTeam(p.team);
      setTimeout(() => { notify("team", t("sub_taken", tm ? tm.name : p.nick, whenLabel(p.at)), { type: "teams", id: p.team }); toast(t("sub_taken", tm ? tm.name : p.nick, whenLabel(p.at))); }, 6000);
      break;
    }
  }
});
document.addEventListener("input", e => {
  const el = e.target;
  if (el.dataset.f === "q") { S.f.q = el.value; afterFilter(); return; }
  if (el.closest("#page") && S.view === "profile") {
    if (el.id === "pf-nick" || el.id === "pf-dc" || el.id === "pf-tg") { clearTimeout(el._t); el._t = setTimeout(() => saveProfileField(el), 350); }
    return;
  }
  if (el.dataset.ri) { const w = el.closest(".ri"); if (w) refreshRankInput(w); }
});
document.addEventListener("change", e => {
  const el = e.target, f = el.dataset.f;
  if (f === "rmin" || f === "rmax") {
    S.f[f] = +el.value;
    if (S.f.rmax < S.f.rmin) { if (f === "rmin") S.f.rmax = S.f.rmin; else S.f.rmin = S.f.rmax; renderFilters(); }
    afterFilter(); return;
  }
  if (f === "region" || f === "lng") { S.f[f] = el.value; $$(`[data-f="${f}"]`).forEach(x => { if (x !== el) x.value = el.value; }); afterFilter(); return; }
  if (el.dataset.set) { S.set[el.dataset.set] = el.checked; save(); profileStatus(); return; }
  if (el.dataset.pref) { S.set.prefs[el.dataset.pref] = el.checked; save(); profileStatus(); return; }
  if (el.dataset.trole) { const tm = findTeam(el.dataset.team); if (tm && tm.mine) { tm.members[+el.dataset.trole].trole = el.value; save(); renderTeams(); toast(t("role_changed")); } return; }
  if (el.closest("#page") && S.view === "profile") { saveProfileField(el); return; }
  if (el.dataset.ri) { const w = el.closest(".ri"); if (w) refreshRankInput(w); }
});
document.addEventListener("submit", e => {
  if (e.target.id !== "composer") return;
  e.preventDefault();
  const inp = $("#msgInput"); const v = inp.value; inp.value = ""; sendMsg(v);
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && $("#overlay")) closeModal(); });
$("#langBtn").addEventListener("click", () => {
  const keep = F; if (F) readFormInputs();
  S.lang = S.lang === "ru" ? "en" : "ru"; save(); renderAll();
  if (keep && $("#sheetBody")) { F = keep; rerenderForm(); }
});
function measure() {
  document.documentElement.style.setProperty("--hdr", $("#hdr").offsetHeight + "px");
  const nav = $("#bnav"); document.documentElement.style.setProperty("--nav", (getComputedStyle(nav).display === "none" ? 0 : nav.offsetHeight) + "px");
}
window.addEventListener("resize", measure);

/* ================= ticker ================= */
let lastActive = activePosts().length;
function tick() {
  const now = Date.now(); let changed = false;
  S.posts.forEach(p => { if (p.kind !== "sub" && !p.warned && p.exp - now < 15 * 60000 && p.exp > now) { p.warned = true; notify("expire", t("n_expire", gshort(p.game)), { type: "feed" }); } });
  const expired = S.posts.filter(p => p.exp <= now);
  if (expired.length) {
    expired.forEach(p => { if (p.kind === "sub") delete S.subreq[p.team]; else archivePost(p, "expired"); });
    S.posts = S.posts.filter(p => p.exp > now); save();
    if (expired.some(p => p.kind !== "sub")) toast(t("expired_toast"));
    changed = true;
  }
  S.scrims.forEach(sc => { if (sc.status === "confirmed" && !sc.reminded && sc.at - now <= 30 * 60000 && sc.at > now - 5 * 60000) { sc.reminded = true; const o = findTeam(sc.opp); notify("scrim", t("sc_soon_n", o ? o.name : "", Math.max(1, Math.round((sc.at - now) / 60000))), { type: "myteam", id: sc.team }); save(); } });
  const n = activePosts().length; if (n !== lastActive) { lastActive = n; changed = true; }
  if (changed) { renderRail(); renderFeed(); if (S.view !== "profile" || expired.length) renderPage(); if (S.active && !findPost(S.active)) renderChat(); }
  else updateTimers();
}
function addLive() {
  if (SEED.find(p => p.id === LIVE.id)) return;
  const t0 = Date.now(); SEED.unshift(Object.assign({}, LIVE, { t: t0, t0, exp: t0 + LIVE.dur * 60000, when: ["evening"] }));
  const p = SEED[0], match = isMatch(p);
  notify(match ? "match" : "new", match ? t("n_match", p.nick, gshort(p.game)) : t("n_new", p.nick, gshort(p.game)), { type: "player", id: p.id });
  lastActive = activePosts().length; renderRail(); renderFeed(); if (S.view === "admin") renderAdmin();
}

/* ================= boot ================= */
setGame("all");
setView("feed");
renderAll();
measure();
try { document.fonts && document.fonts.ready.then(measure); } catch (e) {}
setInterval(tick, 10000);
setTimeout(addLive, 35000);
if (!S.profile.onboarded && !S.setupHidden) setTimeout(() => { if (!$("#overlay")) obSheet(); }, 600);
})();
