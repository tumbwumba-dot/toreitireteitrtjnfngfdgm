const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const cors = require('cors');

const app = express();

// CORS для локальной разработки
app.use(cors({
    origin: '*',
    credentials: true
}));

// Замени 'YOUR_STEAM_API_KEY' на свой ключ с https://steamcommunity.com/dev/apikey
const STEAM_API_KEY = 'CE086EF60D5CD176EB9AD765340483B0';

passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000/auth/steam/return',
    realm: 'http://localhost:3000/',
    apiKey: STEAM_API_KEY
  },
  function(identifier, profile, done) {
    // Здесь можно сохранить пользователя в БД
    console.log('Steam User:', profile);
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

app.use(session({
    secret: 'zone-blast-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

// Маршрут для начала авторизации
app.get('/auth/steam', passport.authenticate('steam'));

// Callback после авторизации Steam
app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    // Перенаправляем обратно на фронтенд с данными пользователя
    const userData = encodeURIComponent(JSON.stringify(req.user));
    const filePath = 'file:///C:/Users/neruk/OneDrive/Desktop/tour/index.html';
    res.redirect(`${filePath}?steamAuth=success&user=${userData}`);
  }
);

// Проверка статуса авторизации
app.get('/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ authenticated: true, user: req.user });
    } else {
        res.json({ authenticated: false });
    }
});

// Выход
app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect('file:///C:/Users/neruk/OneDrive/Desktop/tour/index.html');
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Steam Auth Server запущен на http://localhost:${PORT}`);
    console.log(`Не забудь заменить YOUR_STEAM_API_KEY на свой ключ!`);
});
