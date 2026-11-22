<div align="center">

# Folkbench на русском

**[ru.folkbench.com](https://ru.folkbench.com/?utm_source=github&utm_medium=referral&utm_campaign=ru_matrix_v1&utm_content=main_repo_ru_readme)** — каталог и замеры API нейросетей для русскоязычных разработчиков

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [Español](README.es.md)

</div>

<br>

Folkbench RU — отдельный сайт на русском языке: сравнение API-провайдеров по автоматическим замерам, проверка своего API (отпечаток модели, тест с пеликаном, скорость) и каталог сервисов, прошедших ручную проверку.

Мы не продаём API и не отвечаем за сохранность средств у провайдеров. Сайт поддерживается командой Folkbench и аффилирован с Modelflare: такие сервисы помечены «аффилирован» и измеряются по тем же правилам, без приоритета.

## Сервисы в каталоге

<!-- ru-catalog:start — генерируется scripts/ru-readme.mjs, не править вручную -->
Снимок `95bdc70ff7a9e34c` · данные на 22.11.2026, 13:38 UTC · узел US-West · окно 24 часа · порядок — по названию, это не рейтинг.

| Сервис | Модель | Протокол | Доступность 24 ч | TTFT p50 | Цена | Оплата | Проверено |
| --- | --- | --- | ---: | ---: | --- | --- | --- |
| [Modelflare](https://ru.folkbench.com/providers/modelflare/?utm_source=github&utm_medium=referral&utm_campaign=ru_matrix_v1&utm_content=main_repo_ru_readme) · аффилирован | [`claude-fable-5-2`](https://ru.folkbench.com/models/claude-fable-5-2/?utm_source=github&utm_medium=referral&utm_campaign=ru_matrix_v1&utm_content=main_repo_ru_readme) | Anthropic Messages | 96,8 % (157 попыток) | 3 316 мс | не проверена | не проверено | 21.11.2026 |
| [Modelflare](https://ru.folkbench.com/providers/modelflare-gpt/?utm_source=github&utm_medium=referral&utm_campaign=ru_matrix_v1&utm_content=main_repo_ru_readme) · аффилирован | [`gpt-6.2-astra`](https://ru.folkbench.com/models/gpt-6.2-astra/?utm_source=github&utm_medium=referral&utm_campaign=ru_matrix_v1&utm_content=main_repo_ru_readme) | OpenAI Chat Completions | 100,0 % (155 попыток) | 1 423 мс | не проверена | не проверено | 21.11.2026 |
| [Modelflare](https://ru.folkbench.com/providers/modelflare-gpt/?utm_source=github&utm_medium=referral&utm_campaign=ru_matrix_v1&utm_content=main_repo_ru_readme) · аффилирован | [`gpt-6.2-sol`](https://ru.folkbench.com/models/gpt-6.2-sol/?utm_source=github&utm_medium=referral&utm_campaign=ru_matrix_v1&utm_content=main_repo_ru_readme) | OpenAI Chat Completions | 100,0 % (155 попыток) | 1 482 мс | не проверена | не проверено | 21.11.2026 |
<!-- ru-catalog:end -->

Таблица собирается из [публичного снимка каталога](https://ru.folkbench.com/api/v1/public/catalog). Руками её не правят: данные хранятся в базе сайта, исправления присылайте по каналам ниже. Полные карточки сервисов — в [каталоге на сайте](https://ru.folkbench.com/providers/?utm_source=github&utm_medium=referral&utm_campaign=ru_matrix_v1&utm_content=main_repo_ru_readme).

## Как сравнивать

- Смотрите на точный model ID, протокол, условия оплаты, узел замеров и дату проверки.
- **«Не проверено» не значит «нет».** Отсутствие цены не означает бесплатный доступ.
- «Принимает карты» и «можно оплатить картой российского банка» — разные утверждения. Публикуются только способы оплаты, которые администратор проверил сам.
- Доступность — доля успешных ответов среди всех попыток за 24 часа; ответы 429 и таймауты считаются неуспешными.
- Замеры идут с одного узла (он указан над таблицей). Из вашей сети задержка и доступность могут отличаться.
- Отпечаток модели — ранжирование внутри эталонного банка, а не доказательство подлинности её весов.
- Начинайте с минимального пополнения: место в таблице не гарантирует, что сервис будет работать завтра.

Подробно — в [методике](https://ru.folkbench.com/methodology/?utm_source=github&utm_medium=referral&utm_campaign=ru_matrix_v1&utm_content=main_repo_ru_readme).

## Добавить сервис или исправить ошибку

Размещение бесплатное и не зависит от рекламы; порядок в таблицах определяется только замерами.

- **Почта:** reply@folkbench.com
- **Telegram:** [@mmmagnus98](https://t.me/mmmagnus98)
- **GitHub:** [«Folkbench RU: предложить сервис»](../../issues/new?template=ru-add-service.yml) · [«Folkbench RU: исправление»](../../issues/new?template=ru-correction.yml)

Шаблон заявки и порядок проверки — на [странице «Добавить сервис»](https://ru.folkbench.com/submit/?utm_source=github&utm_medium=referral&utm_campaign=ru_matrix_v1&utm_content=main_repo_ru_readme). Issues и pull request — только предложения: данные в базу вносит администратор после проверки.

**Не публикуйте API-ключи, пароли, платёжные данные и личные документы.** Issues открыты всем.

## Лицензия

Условия использования материалов этого репозитория — в [LICENSE.md](LICENSE.md). Названия и товарные знаки сервисов принадлежат их владельцам.
