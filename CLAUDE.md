# CLAUDE.md — secondopt.com.ua

Статичний сайт L-TEX (секонд хенд, сток, іграшки, Bric-a-Brac гуртом).
GitHub Pages (`CNAME` → secondopt.com.ua), чистий HTML + CSS + JS, мова — українська.

## Керування: Штаб L-TEX

Закріплено рішенням власника 08.11.2026 (Р-240). Цей сайт — окремий
репозиторій, але ним керує той самий Штаб, що й системою L-TEX.

- **Задачі** цього сайту реєструються в реєстрі Штабу:
  `ltexlutskai-tech/ltex-ecosystem` → `docs/ops/REQUESTS.md` (нумерація Р-N
  спільна з L-TEX).
- **Правила Штабу** — `ltex-ecosystem` → `docs/ops/SHTAB_PROTOCOL.md`
  (розділ «Проєкти Штабу»).
- **У `main` зливає ЛИШЕ Штаб і лише після згоди власника.** Сайт на GitHub
  Pages: злиття в `main` = одразу на бойовому сайті.
- **Робочі сесії** працюють у гілці `claude/<задача>` і віддають звіт Штабу; у
  `main` самі не зливають.
- **Правило 6:** перед кожним пунктом перевір, чи це (або частина) вже є в
  коді сайту і в `ltex-ecosystem` (журнал сесій `docs/sessions/INDEX.md`,
  `docs/DECISIONS.md`). Є — будуй поверх, а не поруч.
- **Правило 8:** усе, що побачить відвідувач (нове/змінене поле форми, текст,
  кнопка, сторінка), — окремим пунктом у звіті Штабу.

**Форми → CRM L-TEX.** Усі форми шлють заявку через `window.ltexSendLead`
(скрипт «ЗАЯВКИ → CRM L-TEX» у `<head>` сторінки з формою) на
`https://ltex.com.ua/api/public/site-form` — там вона стає лідом і йде
менеджеру за областю, як заявки з ltex.com.ua. Додає `_form` (id форми),
`_page`, `_title`, `_referrer`, `utm_*`, нормалізує телефон; пастка для ботів —
``botcheck``. Cloudflare Worker `secondopt-forms` → Telegram-чат (`scripts/cloudflare-worker/worker.js`) — лише РЕЗЕРВ, коли CRM не відповіла (копія з
позначкою «⚠️ НЕ В CRM»); якщо не відповів і резерв — заявка чекає в
`localStorage` (`ltex_pending_leads`) і дошлеться в CRM при наступному
відкритті сайту. Резерв прибрати, коли Штаб скаже (Р-240). Нову форму
підключати так само: `window.ltexSendLead(form, new FormData(form))`, поля
`name`, `phone`, `region` (назва області, як у списку), honeypot.

Діагностика форм — `test-forms.html` (noindex): шле тестову заявку в CRM або в резерв.
