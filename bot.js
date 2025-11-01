const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

const app = express();
app.use(cors());
app.use(express.json());

const VOICE_CHANNEL_ID = 'YOUR_VOICE_CHANNEL_ID';
const userProgress = {};

bot.on('ready', () => {
    console.log(`Бот запущен: ${bot.user.tag}`);
});

bot.on('voiceStateUpdate', (oldState, newState) => {
    const userId = newState.id;
    
    if(newState.channelId === VOICE_CHANNEL_ID && !oldState.channelId) {
        userProgress[userId] = { joinTime: Date.now() };
        console.log(`${userId} зашел в войс`);
    }
    
    if(oldState.channelId === VOICE_CHANNEL_ID && !newState.channelId) {
        if(userProgress[userId]) {
            const timeSpent = Math.floor((Date.now() - userProgress[userId].joinTime) / 1000 / 60);
            userProgress[userId].totalMinutes = (userProgress[userId].totalMinutes || 0) + timeSpent;
            console.log(`${userId} провел ${timeSpent} минут в войсе`);
        }
    }
});

app.get('/progress/:userId', (req, res) => {
    const userId = req.params.userId;
    const progress = userProgress[userId] || { totalMinutes: 0 };
    res.json({
        minutes: progress.totalMinutes || 0,
        quest1: progress.totalMinutes >= 30,
        quest2: progress.totalMinutes >= 60,
        quest3: progress.totalMinutes >= 120
    });
});

app.listen(3000, () => console.log('API запущен на порту 3000'));

bot.login(process.env.DISCORD_TOKEN);
