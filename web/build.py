"""Builds the production site into server/static.

  python3 web/build.py [https://stuckup.ru]

Sources: web/src (shell.html, *.css, app.js = shared app code, live.js = server-backed layer),
web/pages (legal pages), web/assets (fonts, icons). The result is committed, so deploys need no build tools.
"""
import datetime, json, pathlib, re, shutil, sys

SITE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "https://stuckup.ru"
W = pathlib.Path(__file__).resolve().parent
SRC, OUT = W / "src", W.parent / "server" / "static"
if OUT.exists(): shutil.rmtree(OUT)
OUT.mkdir(parents=True)

# ---------- app code: shared app.js + live layer ----------
app = (SRC / "app.js").read_text()
live = (SRC / "live.js").read_text()
parts, cur = {}, None
for line in live.split("\n"):
    m = re.match(r"^//@@(\w+)", line)
    if m: cur = m.group(1); parts[cur] = []; continue
    if cur: parts[cur].append(line)
head, main, boot = ("\n".join(parts[k]).strip() + "\n" for k in ("head", "main", "boot"))
main += "\n" + (SRC / "live_teams.js").read_text() + "\n" + (SRC / "live_social.js").read_text() + "\n" + (SRC / "live_ui.js").read_text()

def cut(s, a, b, new):
    i, j = s.index(a), s.index(b)
    assert 0 <= i < j
    return s[:i] + new + s[j:]

# 1) no demo data
app = cut(app, "/* ================= demo players ================= */", "/* ================= state ================= */",
          "/* ================= no demo data in the live build ================= */\nconst NOW0 = Date.now();\nconst SEED = [], LIVE = null, REPORTS0 = [], RANKQ0 = [], REPLIES = {}, TEAMS0 = [], SLOTS = [];\n\n")
# 2) functions redefined by the live layer: the original stays available as name__base
names = re.findall(r"^(?:async )?function (\w+)\(", main, re.M)
assert len(names) == len(set(names)), "duplicate function in live.js"
renamed = []
for n in names:
    pat = re.compile(r"^function " + re.escape(n) + r"\(", re.M)
    hits = pat.findall(app)
    assert len(hits) <= 1, n
    if hits: app = pat.sub("function " + n + "__base(", app); renamed.append(n)
for n in re.findall(r"\b(\w+)__base\(", main):
    assert n in renamed, "live.js calls " + n + "__base but app.js has no such function"
# 3) live state first, live layer before boot, live boot instead of demo boot
start = '(function () {\n"use strict";\n'
assert app.startswith(start)
app = start + head + app[len(start):]
b = app.index("/* ================= boot ================= */")
end = app.rindex("})();")
app = app[:b] + "/* ================= live layer ================= */\n" + main + "\n/* ================= boot ================= */\n" + boot + app[end:]

# ---------- page ----------
shell = (SRC / "shell.html").read_text()
css = (SRC / "extra2.css").read_text() + "\n" + (SRC / "live.css").read_text()
shell = shell.replace("/*EXTRA2*/", css).replace("/*LIGHT*/", (SRC / "light.css").read_text())
for a, b2 in [
    ('<p data-i18n="about_demo">', '<p class="lv-links"><a href="/rules" data-i18n="lv_rules">Правила</a><a href="/privacy" data-i18n="lv_privacy">Конфиденциальность</a><a href="https://t.me/Stuckup_gg_bot" rel="noopener" data-i18n="lv_contact_us">Связаться</a></p><p hidden>'),
]:
    assert a in shell, a
    shell = shell.replace(a, b2)
shell = re.sub(r'(<h1 class="sr-only" data-i18n="about_title">)[^<]*', r"\1Stuckup — поиск тиммейтов", shell)
_gl = '<p class="lv-glinks">' + "".join(f'<a href="/{v}">{n}</a>' for v, n in [("cs2", "CS2"), ("dota2", "Dota 2"), ("valorant", "Valorant"), ("league-of-legends", "LoL"), ("deadlock", "Deadlock"), ("marvel-rivals", "Marvel Rivals"), ("apex-legends", "Apex"), ("pubg", "PUBG"), ("fortnite", "Fortnite"), ("standoff2", "Standoff 2"), ("pubg-mobile", "PUBG Mobile")]) + "</p>"
shell = shell.replace('<p class="lv-links">', _gl + '<p class="lv-links">', 1)
shell = re.sub(r'(<p data-i18n="about_text">)[^<]*', r"\1Stuckup — поиск тиммейтов своего ранга в Dota 2, CS2 (Premier и FACEIT), Valorant, League of Legends, Deadlock, Marvel Rivals, Apex Legends, PUBG, Fortnite, Standoff 2 и PUBG Mobile. Размести объявление — и игроки напишут тебе в Discord или Telegram.", shell)
html = shell.replace("/*APP*/", app)

i = html.index('\n<div class="app"')
top, body = html[:i], html[i:]
top = top.replace('<title>Stuckup Teammates</title>\n', "").replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
top = re.sub(r'<link rel="preconnect"[^>]*>\n', "", top)
top = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com/[^"]*">\n', "", top)
faces = "".join('@font-face{font-family:"%s";src:url(/fonts/%s.woff) format("woff");font-weight:100 900;font-style:normal;font-display:swap}\n' % (fam, fam.replace(" ", ""))
                for fam in ("Unbounded", "Onest", "JetBrains Mono"))
assert "<style>" in top
top = top.replace("<style>", "<style>\n" + faces, 1)

METRIKA = 114211934
TITLE = "Stuckup — поиск тиммейтов в Dota 2, CS2, Valorant и других играх"
DESC = "Найди тиммейтов своего ранга в Dota 2, CS2, Valorant, LoL, Deadlock, Marvel Rivals, Apex, PUBG, Fortnite и Standoff 2. Размести объявление и собери команду на вечер. Бесплатно."
ld = {"@context": "https://schema.org", "@type": "WebApplication", "name": "Stuckup", "url": SITE + "/", "applicationCategory": "GameApplication",
      "operatingSystem": "Web", "inLanguage": ["ru", "en"], "description": DESC, "offers": {"@type": "Offer", "price": "0", "priceCurrency": "RUB"}}
meta = f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{TITLE}</title>
<meta name="description" content="{DESC}">
<link rel="canonical" href="{SITE}/">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#0b0d12">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Stuckup">
<meta property="og:locale" content="ru_RU">
<meta property="og:url" content="{SITE}/">
<meta property="og:title" content="Stuckup — найди тиммейтов своего ранга">
<meta property="og:description" content="{DESC}">
<meta property="og:image" content="{SITE}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<!--VERIFY-->
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<script>window.STUCKUP_SITE = "{SITE}";</script>
<script>(function(m,e,t,r,i,k,a){{m[i]=m[i]||function(){{(m[i].a=m[i].a||[]).push(arguments)}};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym({METRIKA},"init",{{clickmap:true,trackLinks:true,accurateTrackBounce:true}});window.STUCKUP_YM={METRIKA};</script>
'''
(OUT / "index.html").write_text(meta + top + "\n</head>\n<body>" + body + "\n</body>\n</html>\n")

# ---------- legal pages ----------
layout = (W / "pages" / "_layout.html").read_text()
for name in ("rules", "privacy"):
    src = (W / "pages" / (name + ".html")).read_text()
    title = re.search(r"<!--TITLE: (.*?)-->", src).group(1)
    desc = re.search(r"<!--DESC: (.*?)-->", src).group(1)
    bodyp = re.sub(r"<!--(TITLE|DESC): .*?-->\n", "", src)
    (OUT / (name + ".html")).write_text(layout.replace("{{TITLE}}", title).replace("{{DESC}}", desc).replace("{{SITE}}", SITE).replace("{{PATH}}", "/" + name).replace("{{BODY}}", bodyp))

shutil.copy(W / "pages" / "admin.html", OUT / "admin.html")

# ---------- assets ----------
shutil.copytree(W / "assets" / "fonts", OUT / "fonts")
for f in (W / "assets").iterdir():
    if f.is_file(): shutil.copy(f, OUT / f.name)
today = datetime.date.today().isoformat()
(OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: {SITE}/sitemap.xml\n")
# ---------- game landing pages (the list of listings is filled in by the server) ----------
import importlib.util, html as _h
_spec = importlib.util.spec_from_file_location("games", W / "pages" / "games.py"); GP = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(GP)
(OUT / "g").mkdir(exist_ok=True)
metrika_tag = '<script>(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(%d,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});</script>' % METRIKA
for key, slug in GP.SLUGS.items():
    name, intro, feats = GP.TEXT[key]
    desc = "Поиск тиммейтов в " + name + ": найдите пати и команду по своему рангу. " + intro.split(". ")[0].rstrip(".") + "."
    ld = json.dumps({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in GP.FAQ]}, ensure_ascii=False)
    others = "".join(f'<a href="/{s2}">{_h.escape(GP.TEXT[k2][0])}</a>' for k2, s2 in GP.SLUGS.items() if k2 != key)
    page = GP.PAGE.format(name=_h.escape(name), slug=slug, key=key, site=SITE, desc=_h.escape(desc), intro=_h.escape(intro), ld=ld, metrika=metrika_tag,
        feats="".join("<li>" + _h.escape(f) + "</li>" for f in feats), faq="".join(f"<details><summary>{_h.escape(q)}</summary><p>{_h.escape(a)}</p></details>" for q, a in GP.FAQ), others=others)
    (OUT / "g" / (key + ".html")).write_text(page)
(OUT / "g" / "slugs.json").write_text(json.dumps({"/" + v: k for k, v in GP.SLUGS.items()}))
urls = "".join(f"  <url><loc>{SITE}{p}</loc><lastmod>{today}</lastmod></url>\n" for p in ["/"] + ["/" + v for v in GP.SLUGS.values()] + ["/rules", "/privacy"])
(OUT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
(OUT / "site.webmanifest").write_text(json.dumps({"name": "Stuckup", "short_name": "Stuckup", "start_url": "/", "display": "standalone", "background_color": "#0b0d12", "theme_color": "#0b0d12",
    "icons": [{"src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png"}, {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"}]}, ensure_ascii=False, indent=1))
(OUT / "404.html").write_text('<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Страница не найдена — Stuckup</title></head><body style="background:#0b0d12;color:#eef1f6;font-family:system-ui,sans-serif;padding:48px 24px;text-align:center"><p style="font-size:18px">Такой страницы нет.</p><p><a href="/" style="color:#ffb000">На главную Stuckup</a></p></body></html>\n')
print("built:", ", ".join(sorted(p.name for p in OUT.iterdir())), "| index.html", (OUT / "index.html").stat().st_size // 1024, "KB | overridden:", len(renamed), "functions")
