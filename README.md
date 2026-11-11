# Stuckup

Поиск тиммейтов в соревновательных играх — https://stuckup.ru

- `server/` — облачная функция (Node.js 22, без зависимостей): API и раздача сайта. `server/static/` — собранный сайт.
- `web/` — исходники сайта. Сборка: `python3 web/build.py` (после правок в `web/src`), таблицы игр для сервера: `node web/gen-meta.js`.
- `dev/` — локальный запуск `node dev/server.js` (http://localhost:8787, база в памяти), тесты `node --test dev/test.js`.
- `tools/deploy.sh` + `.github/workflows/deploy.yml` — выкладка в Yandex Cloud при каждом пуше в `main`. Лог выкладки публикуется в ветку `deploy-logs`.

Секреты репозитория: `YC_SA_KEY` (обязательно), `TELEGRAM_BOT_TOKEN`, для писем — `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`.
