Как задеплоить этот статический сайт на GitHub Pages

Короткая инструкция (я уже инициализировал локальный git и сделал коммит). Вам осталось:

1) Создать новый репозиторий на GitHub (веб-интерфейс). Назовите его, например, "tour".

2) Добавить удалённый origin и запушить main-ветку:

```bash
cd "c:/Users/neruk/OneDrive/Desktop/tour"
git remote add origin https://github.com/<YOUR_USER>/<REPO>.git
git branch -M main
git push -u origin main
```

3) GitHub Actions (workflow `.github/workflows/deploy-gh-pages.yml`) автоматически запустит деплой на GitHub Pages при пуше в `main`. Pages будет опубликован из ветки `gh-pages` (создаётся action). Через пару минут сайт будет доступен по адресу:

`https://<YOUR_USER>.github.io/<REPO>/`

Если хотите, я могу создать репозиторий через API (требуется GitHub personal access token с правом repo). Скажите, если хотите, чтобы я сделал это за вас.

Альтернативы:
- Netlify Drop — перетащите содержимое проекта (ZIP) на https://app.netlify.com/drop
- Railway — могу пробовать снова, но для этого потребуется исправить конфликты установки CLI на вашей системе.
