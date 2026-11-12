# Landing pages for search engines: one per game. Used by web/build.py.
SLUGS = {"cs2": "cs2", "dota": "dota2", "valorant": "valorant", "lol": "league-of-legends", "deadlock": "deadlock", "rivals": "marvel-rivals",
         "apex": "apex-legends", "pubg": "pubg", "fortnite": "fortnite", "standoff": "standoff2", "pubgm": "pubg-mobile"}
TEXT = {
  "cs2": ("CS2", "Ищите тиммейтов в Counter-Strike 2 по рангу: Premier-рейтинг, ELO на FACEIT или звание в соревновательном режиме. Соберите пати на вечер, найдите пятого в стак или постоянную команду для праков.",
          ["Premier, FACEIT, соревновательный режим и напарники", "Роли: энтри, снайпер, саппорт, люркер, IGL", "ELO FACEIT подтверждается через Steam — без накрутки"]),
  "dota": ("Dota 2", "Найдите пати в Dota 2 под свой MMR и медаль: керри, мид, оффлейн, четвёрка или пятёрка. Без руинеров — у каждого игрока видны стиль игры, микрофон и время, когда он играет.",
           ["Рейтинговые и обычные игры, турнирные стаки", "Позиции с 1 по 5", "Медаль подтверждается через Steam и OpenDota"]),
  "valorant": ("Valorant", "Поиск тиммейтов в Valorant по рангу: от Железа до Радианта. Найдите дуэлянта, контроллера или смока в свою пати для ранкеда.",
               ["Соревновательный режим и обычные игры", "Роли: дуэлянт, инициатор, контроллер, страж", "Фильтры по рангу, региону и микрофону"]),
  "lol": ("League of Legends", "Найдите напарников в League of Legends: дуо в соло-очередь, флекс-пати или команду для Clash. Подбор по рангу и линии.",
          ["Solo/Duo, Flex и Clash", "Линии: топ, лес, мид, ADC, саппорт", "Поиск по рангу от Железа до Претендента"]),
  "deadlock": ("Deadlock", "Поиск тиммейтов в Deadlock от Valve: соберите шестёрку для рейтинговых матчей или найдите напарников для обычных игр.",
               ["Команды по 6 игроков", "Подбор по рангу", "Чат прямо на сайте"]),
  "rivals": ("Marvel Rivals", "Найдите тиммейтов в Marvel Rivals: танки, дуэлянты и стратеги для рейтинговых и быстрых матчей.",
             ["Команды по 6 игроков", "Роли: авангард, дуэлянт, стратег", "Подбор по рангу"]),
  "apex": ("Apex Legends", "Поиск сквада в Apex Legends: найдите двух напарников для рейтинга или пабликов по своему рангу.",
           ["Трио и дуо", "Подбор по рангу от Бронзы до Хищника", "Фильтры по микрофону и стилю игры"]),
  "pubg": ("PUBG", "Найдите сквад в PUBG: Battlegrounds — напарники для рейтинга, обычных матчей и турниров.",
           ["Сквады и дуо", "Подбор по рангу", "Регион и язык общения"]),
  "fortnite": ("Fortnite", "Поиск тиммейтов в Fortnite: дуо, трио и сквады для рейтинга, обычных игр и турниров.",
               ["Дуо, трио, сквад", "Ранговые и обычные матчи", "Фильтры по возрасту и стилю игры"]),
  "standoff": ("Standoff 2", "Ищите тиммейтов в Standoff 2 по званию: соберите пятёрку для соревновательного режима или найдите напарника для союзников.",
               ["Соревновательный режим и союзники", "Подбор по званию", "Мобильный шутер — удобно с телефона"]),
  "pubgm": ("PUBG Mobile", "Найдите сквад в PUBG Mobile: напарники для рейтинга и обычных матчей по вашему рангу.",
            ["Сквады и дуо", "Подбор по рангу от Бронзы до Завоевателя", "Удобно с телефона"]),
}
FAQ = [
  ("Это бесплатно?", "Да. Регистрация, объявления, чат и команды бесплатны."),
  ("Как найти тиммейта?", "Откройте ленту игры, отфильтруйте по рангу и роли и напишите игроку в чат на сайте — или разместите своё объявление, и вам напишут сами."),
  ("Можно ли доверять рангу?", "Ранг FACEIT и медаль Dota 2 подтверждаются через Steam — такие объявления отмечены щитком. Остальные ранги указывают сами игроки; на нечестных можно пожаловаться."),
  ("Сколько висит объявление?", "От часа до двух дней — срок вы выбираете сами. Продлить можно в один клик."),
]

PAGE = """<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Поиск тиммейтов в {name} — найти пати и команду | Stuckup</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{site}/{slug}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#0b0d12">
<meta property="og:type" content="website"><meta property="og:site_name" content="Stuckup"><meta property="og:title" content="Поиск тиммейтов в {name} — Stuckup">
<meta property="og:description" content="{desc}"><meta property="og:url" content="{site}/{slug}"><meta property="og:image" content="{site}/og/{key}.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{ld}</script>
{metrika}
<style>
@font-face{{font-family:"Unbounded";src:url(/fonts/Unbounded.woff) format("woff");font-weight:100 900;font-display:swap}}
@font-face{{font-family:"Onest";src:url(/fonts/Onest.woff) format("woff");font-weight:100 900;font-display:swap}}
:root{{--bg:#0b0d12;--panel:#12151c;--line:#232836;--fg:#eef1f6;--fg2:#b6bdcb;--faint:#7d8697;--accent:#ffb000}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 "Onest",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}}
a{{color:var(--accent)}}
.wrap{{max-width:820px;margin:0 auto;padding:0 20px}}
header{{border-bottom:1px solid var(--line)}}
header .wrap{{display:flex;align-items:center;justify-content:space-between;height:60px}}
.brand{{font:700 17px "Unbounded",system-ui,sans-serif;letter-spacing:.08em;color:var(--fg);text-decoration:none}}.brand b{{color:var(--accent)}}
main{{padding:40px 0 64px}}
h1{{font:700 clamp(26px,5vw,38px)/1.15 "Unbounded",system-ui,sans-serif;margin:0 0 14px;text-wrap:balance}}
h2{{font:600 20px/1.3 "Onest",system-ui,sans-serif;margin:40px 0 12px}}
.lead{{font-size:17px;color:var(--fg2);margin:0 0 22px;max-width:62ch}}
.cta{{display:flex;gap:10px;flex-wrap:wrap}}
.btn{{display:inline-flex;align-items:center;height:44px;padding:0 18px;border-radius:12px;font-weight:600;text-decoration:none;border:1px solid var(--line);color:var(--fg)}}
.btn.pri{{background:var(--accent);border-color:transparent;color:#1a1300}}
ul.feat{{padding-left:20px;color:var(--fg2)}}
.list{{display:grid;gap:8px;margin:0;padding:0;list-style:none}}
.list li{{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px 14px;display:grid;gap:4px}}
.list .h{{display:flex;gap:10px;flex-wrap:wrap;align-items:baseline}}.list .h b{{font-size:15px}}.list .h span{{font-size:13px;color:var(--faint)}}
.list p{{margin:0;color:var(--fg2);font-size:14.5px}}
.muted{{color:var(--faint)}}
ol.steps{{padding-left:20px;color:var(--fg2)}}ol.steps li{{margin:6px 0}}
details{{border-top:1px solid var(--line);padding:12px 0}}summary{{cursor:pointer;font-weight:600}}details p{{color:var(--fg2);margin:8px 0 0}}
.games{{display:flex;flex-wrap:wrap;gap:8px}}.games a{{font-size:14px;border:1px solid var(--line);border-radius:999px;padding:6px 12px;text-decoration:none;color:var(--fg2)}}
footer{{border-top:1px solid var(--line);padding:22px 0 40px;font-size:14px;color:var(--faint)}}footer a{{color:var(--fg2);margin-right:16px}}
</style>
</head>
<body>
<header><div class="wrap"><a class="brand" href="/">STUCK<b>UP</b></a><a href="/#/g/{key}">Открыть ленту</a></div></header>
<main><div class="wrap">
<h1>Поиск тиммейтов в {name}</h1>
<p class="lead">{intro}</p>
<div class="cta"><a class="btn pri" href="/#/g/{key}">Смотреть, кто ищет</a><a class="btn" href="/#/g/{key}">Разместить объявление</a></div>
<h2>Сейчас ищут <span class="muted"><!--COUNT--></span></h2>
<!--LIST-->
<h2>Что есть для {name}</h2>
<ul class="feat">{feats}</ul>
<h2>Как это работает</h2>
<ol class="steps"><li>Зарегистрируйтесь по почте или через VK и укажите свой ранг.</li><li>Найдите игрока в ленте или разместите объявление — кого ищете и во сколько играете.</li><li>Договоритесь в чате на сайте и заходите в игру. Позовите людей в стак или соберите постоянную команду.</li></ol>
<h2>Вопросы</h2>
{faq}
<h2>Другие игры</h2>
<div class="games">{others}</div>
</div></main>
<footer><div class="wrap"><a href="/">Главная</a><a href="/rules">Правила</a><a href="/privacy">Конфиденциальность</a></div></footer>
</body>
</html>
"""

# ---------- rank reference pages ----------
def _tiers(names_ru, names_en, subs=None, sub_style=None, sub_top=None):
    rows = []
    for i, (r, e) in enumerate(zip(names_ru, names_en)):
        d = ""
        if subs and (sub_top is None or i <= sub_top):
            d = {"stars": f"{subs} звёзд", "num": f"{subs} ступени (1–{subs})", "roman-desc": "дивизионы " + " → ".join(["IV", "III", "II", "I"][4 - subs:]), "roman": "дивизионы I–" + ["I", "II", "III", "IV", "V", "VI"][subs - 1]}.get(sub_style, f"{subs} ступени")
        rows.append((r, e, d or "—"))
    return rows

RANKS = {
  "cs2": {
    "title": "Ранги CS2: Premier, FACEIT и звания по порядку",
    "desc": "Все ранги Counter-Strike 2 по порядку: цвета рейтинга Premier, уровни FACEIT с границами ELO и 18 званий соревновательного режима.",
    "intro": "В CS2 три системы рангов, и они не связаны между собой: рейтинг Premier (CS Rating), уровень FACEIT и звание в обычном соревновательном режиме — у каждой карты своё.",
    "sections": [
      ("Рейтинг Premier (CS Rating)", "Число от 0 и выше. Цвет плашки меняется каждые 5 000 очков.", ["Цвет", "Рейтинг"],
       [("Серый", "0 – 4 999"), ("Голубой", "5 000 – 9 999"), ("Синий", "10 000 – 14 999"), ("Фиолетовый", "15 000 – 19 999"), ("Розовый", "20 000 – 24 999"), ("Красный", "25 000 – 29 999"), ("Золотой", "30 000 и выше")]),
      ("Уровни FACEIT", "10 уровней, каждый — диапазон ELO.", ["Уровень", "ELO"],
       [("1", "100 – 500"), ("2", "501 – 750"), ("3", "751 – 900"), ("4", "901 – 1 050"), ("5", "1 051 – 1 200"), ("6", "1 201 – 1 350"), ("7", "1 351 – 1 530"), ("8", "1 531 – 1 750"), ("9", "1 751 – 2 000"), ("10", "2 001 и выше")]),
      ("Звания соревновательного режима", "18 званий от Серебра I до Глобальной элиты. Звание своё на каждой карте.", ["№", "Звание", "In English"], "COMP"),
    ],
    "game": "cs2",
  },
  "dota2": {
    "title": "Ранги Dota 2: все медали по порядку",
    "desc": "Медали Dota 2 по порядку — от Рекрута до Титана: восемь медалей, у каждой пять звёзд, у Титана — место в таблице лидеров.",
    "intro": "Рейтинг в Dota 2 показывается медалью. Медалей восемь, у первых семи по пять звёзд. На вершине — Титан (Immortal): вместо звёзд у него номер в таблице лидеров региона.",
    "sections": [("Медали", "От младшей к старшей.", ["№", "Медаль", "In English", "Ступени"], "MEDAL")],
    "game": "dota",
  },
  "valorant": {
    "title": "Ранги Valorant по порядку",
    "desc": "Все ранги Valorant по порядку: от Железа до Радианта, у каждого ранга кроме Радианта — три ступени.",
    "intro": "В Valorant девять рангов. У первых восьми по три ступени (например, Золото 1, 2, 3), Радиант — один, это лучшие игроки региона.",
    "sections": [("Ранги", "От младшего к старшему.", ["№", "Ранг", "In English", "Ступени"], "VAL")],
    "game": "valorant",
  },
  "lol": {
    "title": "Ранги League of Legends по порядку",
    "desc": "Все ранги League of Legends по порядку: от Железа до Претендента, дивизионы IV–I и высшие лиги без дивизионов.",
    "intro": "В League of Legends десять рангов. С Железа по Алмаз у каждого четыре дивизиона — от IV к I. Мастер, Грандмастер и Претендент дивизионов не имеют.",
    "sections": [("Ранги", "От младшего к старшему.", ["№", "Ранг", "In English", "Дивизионы"], "LOL")],
    "game": "lol",
  },
}
