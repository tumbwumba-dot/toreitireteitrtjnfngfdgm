# Steam Authentication Server

## Установка

1. Открой командную строку (cmd) в папке server:
```
cd C:\Users\neruk\OneDrive\Desktop\tour\server
```

2. Установи зависимости:
```
npm install
```

## Получение Steam API Key

1. Зайди на https://steamcommunity.com/dev/apikey
2. Войди через Steam
3. Заполни форму:
   - Domain Name: localhost
   - Agree to terms
4. Скопируй полученный API ключ
5. Открой файл `server.js` и замени `YOUR_STEAM_API_KEY` на свой ключ

## Запуск сервера

```
npm start
```

или

```
node server.js
```

Сервер запустится на http://localhost:3000

## Важно!

- Сервер должен быть запущен перед открытием сайта
- Фронтенд должен быть открыт на http://127.0.0.1:5500 (Live Server в VS Code)
- После получения API ключа обязательно замени его в server.js
