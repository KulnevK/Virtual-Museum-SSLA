# Virtual-Museum-SSLA

Проект виртуального музея ФГБОУ ВО «СГЮА».

## Технологии

- Статический сайт: `HTML + CSS + JavaScript`
- 3D просмотр: [`model-viewer`](https://modelviewer.dev/)
- Данные экспонатов: `assets/js/museum-data.js`

## Локальный запуск

Не открывайте `index.html` напрямую через `file://` — для 3D нужен обычный HTTP-сервер.

Примеры запуска:

```bash
python3 -m http.server 8000
```

После запуска откройте `http://localhost:8000`.

## Подготовка к хостингу

Проект готов к публикации как статический сайт:

- главная страница: `index.html`
- стили: `assets/css/style.css`
- скрипты: `assets/js/app.js`, `assets/js/museum-data.js`
- изображения и 3D-модели: `assets/img/`, `assets/models/`

## Рекомендации по публикации

- Загружайте проект целиком, сохраняя структуру папок.
- Убедитесь, что сервер отдает `.glb` с корректным MIME-типом (`model/gltf-binary` или `application/octet-stream`).
- Если используете кэш/CDN, после обновлений очищайте кэш для `app.js` и `museum-data.js`.
