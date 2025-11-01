document.addEventListener('DOMContentLoaded', function() {

    // Discord Auth
    let currentUserId = null;
    
    const getUserKey = (key) => currentUserId ? `user_${currentUserId}_${key}` : null;
    
    const saveUserData = (key, value) => {
        const userKey = getUserKey(key);
        if(userKey) localStorage.setItem(userKey, JSON.stringify(value));
    };
    
    const loadUserData = (key, defaultValue = null) => {
        const userKey = getUserKey(key);
        if(!userKey) return defaultValue;
        const data = localStorage.getItem(userKey);
        return data ? JSON.parse(data) : defaultValue;
    };
    
    const checkAuth = () => {
        const discordUser = sessionStorage.getItem('discord_user');
        if(discordUser) {
            const user = JSON.parse(discordUser);
            currentUserId = user.id;
            document.getElementById('discord-not-connected').style.display = 'none';
            document.getElementById('discord-connected').style.display = 'block';
            document.getElementById('discord-username').textContent = user.username;
            document.getElementById('discord-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
            return true;
        }
        return false;
    };
    
    const requireAuth = () => {
        if(!checkAuth()) {
            new Audio('sounds/mainmenu_press_settings_02.wav').play().catch(e => {});
            document.getElementById('page-' + currentPage).classList.remove('active');
            document.getElementById('page-settings').classList.add('active');
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-page="settings"]').classList.add('active');
            
            if(currentPage === 'battlepass') {
                document.body.classList.remove('winter-theme');
                document.getElementById('snowfall').classList.remove('active');
                if(window.snowInterval) {
                    clearInterval(window.snowInterval);
                    window.snowInterval = null;
                }
            }
            
            currentPage = 'settings';
            return false;
        }
        return true;
    };
    
    const discordLoginBtn = document.getElementById('discord-login-btn');
    discordLoginBtn.addEventListener('mouseenter', () => {
        new Audio('sounds/sidemenu_rollover_02.wav').play().catch(e => {});
        discordLoginBtn.style.boxShadow = '0 6px 20px rgba(88,101,242,0.5)';
    });
    discordLoginBtn.addEventListener('mouseleave', () => {
        discordLoginBtn.style.boxShadow = '0 4px 15px rgba(88,101,242,0.3)';
    });
    discordLoginBtn.addEventListener('click', () => {
        new Audio('sounds/inventory_new_item_accept_01.wav').play().catch(e => {});
        const clientId = AUTH_CONFIG.discord.clientId;
        const redirectUri = encodeURIComponent(AUTH_CONFIG.discord.redirectUri);
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=identify`;
        const popup = window.open(authUrl, 'Discord Auth', 'width=500,height=700,left=100,top=100');
        const checkClosed = setInterval(() => {
            if(popup.closed) {
                clearInterval(checkClosed);
                const wasAuthed = checkAuth();
                if(wasAuthed) {
                    loadAllUserData();
                    bgMusic.pause();
                    currentTrackIndex = 0;
                    playNextTrack();
                    new Audio('sounds/item_drop2_uncommon.wav').play().catch(e => {});
                }
            }
        }, 500);
    });
    
    const discordLogoutBtn = document.getElementById('discord-logout-btn');
    discordLogoutBtn.addEventListener('mouseenter', () => {
        new Audio('sounds/sidemenu_rollover_02.wav').play().catch(e => {});
        discordLogoutBtn.style.background = 'rgba(255,255,255,0.1)';
        discordLogoutBtn.style.borderColor = 'rgba(255,255,255,0.2)';
    });
    discordLogoutBtn.addEventListener('mouseleave', () => {
        discordLogoutBtn.style.background = 'rgba(255,255,255,0.05)';
        discordLogoutBtn.style.borderColor = 'rgba(255,255,255,0.1)';
    });
    discordLogoutBtn.addEventListener('click', () => {
        new Audio('sounds/sidemenu_click_01.wav').play().catch(e => {});
        sessionStorage.removeItem('discord_user');
        currentUserId = null;
        document.getElementById('discord-not-connected').style.display = 'block';
        document.getElementById('discord-connected').style.display = 'none';
        
        document.querySelectorAll('.inventory-item').forEach(item => {
            if(!['csgo', 'cs2'].includes(item.dataset.music)) {
                item.style.display = 'none';
            }
        });
        
        document.querySelectorAll('.bp-reward').forEach(reward => {
            reward.style.opacity = '1';
        });
        
        const startContainer = document.getElementById('bp-start-container');
        const levelContainer = document.getElementById('bp-level-container');
        const questBtn = document.getElementById('bp-quest-btn');
        const rewards = document.getElementById('bp-rewards');
        const completed = document.getElementById('bp-completed-container');
        if(startContainer) startContainer.style.display = 'flex';
        if(levelContainer) levelContainer.style.display = 'none';
        if(questBtn) questBtn.style.display = 'none';
        if(rewards) rewards.style.display = 'none';
        if(completed) completed.remove();
        
        bpData.level = 1;
        bpData.xp = 0;
        bpData.maxXp = 1000;
        if(document.getElementById('bp-current-level')) updateBattlePass();
        
        currentMusicKit = 'cs2';
        updateMusicKitUI();
        bgMusic.pause();
        currentTrackIndex = 0;
        playNextTrack();
        
        if(musicVolumeSlider) musicVolumeSlider.value = 30;
        if(musicVolumeInput) musicVolumeInput.value = 30;
        bgMusic.volume = 0.3;
    });
    
    const hash = window.location.hash;
    if(hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get('access_token');
        fetch('https://discord.com/api/users/@me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(r => r.json())
        .then(user => {
            sessionStorage.setItem('discord_user', JSON.stringify(user));
            if(window.opener) {
                window.opener.sessionStorage.setItem('discord_user', JSON.stringify(user));
                window.close();
            } else {
                window.location.hash = '';
                currentUserId = user.id;
                checkAuth();
                loadAllUserData();
                new Audio('sounds/item_drop2_uncommon.wav').play().catch(e => {});
            }
        });
    }

    const soundFiles = [
        'sounds/inventory_new_item_accept_01.wav',
        'sounds/sidemenu_rollover_02.wav',
        'sounds/sidemenu_click_01.wav',
        'sounds/mainmenu_press_home_01.wav',
        'sounds/mainmenu_press_settings_02.wav',
        'sounds/mainmenu_press_inventory_02.wav',
        'sounds/mainmenu_press_shop_01.wav',
        'sounds/mainmenu_press_news_01.wav'
    ];
    const preloadedSounds = {};
    
    const soundOverlay = document.createElement('div');
    soundOverlay.id = 'sound-overlay';
    soundOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:9999999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
    soundOverlay.innerHTML = '<div style="text-align:center;font-family:Geogrotesque,Arial,sans-serif;"><h2 style="color:#ffa500;font-size:2.5rem;font-weight:900;margin-bottom:2rem;">НАЖМИТЕ ДЛЯ АКТИВАЦИИ</h2></div>';
    document.body.appendChild(soundOverlay);
    
    let currentMusicKit = 'cs2';
    const musicTracks = {
        csgo: ['sounds/mainmenu.mp3', 'sounds/mainmenu1.mp3'],
        cs2: ['sounds/mainmenu2.mp3'],
        lastchristmas: ['sounds/SpotiDownloader.com - Last Christmas - Wham!.mp3'],
        perviyraz: ['sounds/SpotiDownloader.com - Первый раз - remix nevroz - JojoHF.mp3'],
        dashstar: ['sounds/mainmenudashstar.mp3']
    };
    let currentTrackIndex = 0;
    const bgMusic = new Audio();
    bgMusic.volume = 0.3;
    
    const playNextTrack = () => {
        const tracks = musicTracks[currentMusicKit];
        if(!tracks) return;
        bgMusic.src = tracks[currentTrackIndex];
        bgMusic.play().catch(e => {});
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    };
    
    bgMusic.addEventListener('ended', playNextTrack);
    
    const musicVolumeSlider = document.getElementById('music-volume');
    const musicVolumeInput = document.getElementById('music-volume-input');
    
    const activateSound = () => {
        soundOverlay.remove();
        new Audio('sounds/inventory_new_item_accept_01.wav').play().catch(e => {});
        checkAuth();
        if(currentUserId) {
            loadAllUserData();
        } else {
            currentMusicKit = 'cs2';
        }
        bgMusic.volume = musicVolumeSlider ? musicVolumeSlider.value / 100 : 0.3;
        playNextTrack();
    };
    
    soundOverlay.addEventListener('click', activateSound);
    
    const pages = ['inventory', 'friends', 'battlepass', 'main', 'leaderboard', 'seasons', 'settings'];
    
    // Remove test button from production
    const testBtn = document.getElementById('test-level-up');
    if(testBtn) testBtn.remove();
    let currentPage = 'main';
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if(Math.abs(diff) < 50) return;
        const currentIndex = pages.indexOf(currentPage);
        let targetIndex = currentIndex;
        if(diff > 0 && currentIndex < pages.length - 1) {
            targetIndex = currentIndex + 1;
        } else if(diff < 0 && currentIndex > 0) {
            targetIndex = currentIndex - 1;
        }
        if(targetIndex !== currentIndex) {
            const targetBtn = document.querySelector(`[data-page="${pages[targetIndex]}"]`);
            if(targetBtn) targetBtn.click();
        }
    });
    
    // Battle Pass system
    // Start Battle Pass button
    const startBpBtn = document.getElementById('start-battlepass');
    if(startBpBtn) {
        startBpBtn.addEventListener('click', () => {
            if(!requireAuth()) return;
            new Audio('sounds/sidemenu_click_01.wav').play().catch(e => {});
            setTimeout(() => {
                new Audio('sounds/item_drop2_uncommon.wav').play().catch(e => {});
            }, 100);
            const startContainer = document.getElementById('bp-start-container');
            const levelContainer = document.getElementById('bp-level-container');
            const questBtn = document.getElementById('bp-quest-btn');
            const rewards = document.getElementById('bp-rewards');
            if(startContainer) startContainer.style.display = 'none';
            if(levelContainer) levelContainer.style.display = 'block';
            if(questBtn) questBtn.style.display = 'flex';
            if(rewards) rewards.style.display = 'flex';
            if(currentUserId) saveUserData('bp_started', true);
        });
        // CS2 button hover effect
        startBpBtn.addEventListener('mouseenter', () => {
            startBpBtn.style.background = 'linear-gradient(135deg, #2a5298 0%, #4a90e2 50%, #2a5298 100%)';
            startBpBtn.style.boxShadow = '0 4px 12px rgba(74,144,226,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
            new Audio('sounds/sidemenu_rollover_02.wav').play().catch(e => {});
        });
        startBpBtn.addEventListener('mouseleave', () => {
            startBpBtn.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)';
            startBpBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
        });
        

    }
    
    const bpData = {
        level: 1,
        xp: 0,
        maxXp: 1000
    };
    
    const loadAllUserData = () => {
        if(!currentUserId) return;
        
        currentMusicKit = loadUserData('music_kit', 'cs2');
        const savedBp = loadUserData('battlepass');
        if(savedBp) {
            bpData.level = savedBp.level;
            bpData.xp = savedBp.xp;
            bpData.maxXp = savedBp.maxXp;
        }
        
        const bpStarted = loadUserData('bp_started', false);
        if(bpStarted) {
            const startContainer = document.getElementById('bp-start-container');
            const levelContainer = document.getElementById('bp-level-container');
            const questBtn = document.getElementById('bp-quest-btn');
            const rewards = document.getElementById('bp-rewards');
            if(startContainer) startContainer.style.display = 'none';
            if(levelContainer) levelContainer.style.display = 'block';
            if(questBtn) questBtn.style.display = 'flex';
            if(rewards) rewards.style.display = 'flex';
        }
        
        const collectedRewards = loadUserData('collected_rewards', []);
        collectedRewards.forEach(level => {
            const reward = document.querySelector(`.bp-reward[data-level="${level}"]`);
            if(reward) reward.style.opacity = '0.3';
        });
        
        const inventory = loadUserData('inventory', []);
        inventory.forEach(musicType => {
            const item = document.querySelector(`.inventory-item[data-music="${musicType}"]`);
            if(item) item.style.display = 'flex';
        });
        
        const volume = loadUserData('music_volume', 30);
        if(musicVolumeSlider) musicVolumeSlider.value = volume;
        if(musicVolumeInput) musicVolumeInput.value = volume;
        bgMusic.volume = volume / 100;
        
        if(document.getElementById('bp-current-level')) updateBattlePass();
        updateMusicKitUI();
        
        bgMusic.pause();
        currentTrackIndex = 0;
    };
    
    const updateMusicKitUI = () => {
        document.querySelectorAll('.music-kit').forEach(kit => {
            const musicType = kit.dataset.music;
            const status = kit.querySelector('.tooltip-status');
            if(musicType === currentMusicKit) {
                kit.classList.add('active');
                if(status) {
                    status.classList.remove('not-equipped');
                    status.classList.add('equipped');
                    status.textContent = 'ЭКИПИРОВАН';
                }
            } else {
                kit.classList.remove('active');
                if(status) {
                    status.classList.remove('equipped');
                    status.classList.add('not-equipped');
                    status.textContent = 'НЕ ЭКИПИРОВАН';
                }
            }
        });
    };
    
    const updateBattlePass = () => {
        if(bpData.level >= 15) {
            const levelContainer = document.getElementById('bp-level-container');
            const questBtn = document.getElementById('bp-quest-btn');
            if(levelContainer) levelContainer.style.display = 'none';
            if(questBtn) questBtn.style.display = 'none';
            if(!document.getElementById('bp-completed-container')) {
                const completedDiv = document.createElement('div');
                completedDiv.id = 'bp-completed-container';
                completedDiv.style.cssText = 'text-align:center;margin-top:1rem;';
                completedDiv.innerHTML = '<div style="font-size:2rem;font-weight:900;color:#ffb347;text-shadow:0 0 20px rgba(255,179,71,0.6);text-transform:uppercase;letter-spacing:0.2em;">ПРОЙДЕН</div>';
                const header = document.querySelector('.bp-header');
                if(header) header.appendChild(completedDiv);
            }
        } else {
            const levelContainer = document.getElementById('bp-level-container');
            const questBtn = document.getElementById('bp-quest-btn');
            if(levelContainer) levelContainer.style.display = 'block';
            if(questBtn) questBtn.style.display = 'flex';
            const completed = document.getElementById('bp-completed-container');
            if(completed) completed.remove();
        }
        
        const currentLevel = document.getElementById('bp-current-level');
        const currentXp = document.getElementById('bp-current-xp');
        const maxXp = document.getElementById('bp-max-xp');
        const xpFill = document.getElementById('bp-xp-fill');
        
        if(currentLevel) currentLevel.textContent = bpData.level;
        if(currentXp) currentXp.textContent = bpData.xp;
        if(maxXp) maxXp.textContent = bpData.maxXp;
        if(xpFill) {
            const fillPercent = (bpData.xp / bpData.maxXp) * 100;
            xpFill.style.width = fillPercent + '%';
        }
        
        document.querySelectorAll('.bp-reward').forEach(reward => {
            const level = parseInt(reward.dataset.level);
            const item = reward.querySelector('.bp-reward-item');
            if(level <= bpData.level) {
                item.classList.remove('locked');
                item.classList.add('unlocked');
            } else {
                item.classList.remove('unlocked');
                item.classList.add('locked');
            }
        });
        
        if(currentUserId) saveUserData('battlepass', bpData);
        updateLeaderboard();
    };
    
    const testLevelBtn = document.getElementById('test-level-up');
    if(testLevelBtn) {
        testLevelBtn.addEventListener('click', () => {
            bpData.level++;
            bpData.xp = 0;
            
            if(bpData.level === 15) {
                const targetReward = document.querySelector('.bp-reward[data-level="15"]');
                if(!targetReward) return;
            }
            
            const isLevel15 = bpData.level === 15;
            
            const targetReward = document.querySelector(`.bp-reward[data-level="${bpData.level}"]`);
            if(!targetReward) {
                return;
            }
            
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:999999;opacity:0;transition:opacity 0.3s;';
            const content = document.createElement('div');
            content.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;transition:opacity 0.3s;width:100%;';
            content.innerHTML = `
                <div style="font-size:1.5rem;color:#ffb347;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:1rem;opacity:0.8;animation:fadeIn 0.4s;">НОВЫЙ УРОВЕНЬ</div>
                <div style="font-size:8rem;font-weight:900;opacity:0;margin:0;">${bpData.level}</div>
                <div style="font-size:1.2rem;color:#a0d0ff;text-transform:uppercase;letter-spacing:0.15em;margin-top:1rem;animation:fadeIn 0.4s;">РАЗБЛОКИРОВАНЫ НОВЫЕ НАГРАДЫ</div>
            `;
            const levelNum = document.createElement('div');
            levelNum.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:8rem;font-weight:900;color:#ffb347;text-shadow:0 0 40px rgba(255,179,71,0.8);z-index:1000001;animation:levelPulse 0.6s ease-out;';
            levelNum.textContent = bpData.level;
            const style = document.createElement('style');
            style.textContent = '@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}@keyframes levelPulse{0%{transform:translate(-50%,-50%) scale(0.3);opacity:0}50%{transform:translate(-50%,-50%) scale(1.2)}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}';
            document.head.appendChild(style);
            overlay.appendChild(content);
            document.body.appendChild(overlay);
            document.body.appendChild(levelNum);
            new Audio('sounds/lastroundhalf.wav').play().catch(e => {});
            setTimeout(() => overlay.style.opacity = '1', 10);
            setTimeout(() => {
                content.style.opacity = '0';
                overlay.style.background = 'transparent';
                setTimeout(() => {
                    const rect = targetReward.getBoundingClientRect();
                    levelNum.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    levelNum.style.fontSize = '1.5rem';
                    levelNum.style.left = rect.left + rect.width / 2 + 'px';
                    levelNum.style.top = rect.top + rect.height / 2 + 'px';
                    levelNum.style.opacity = '0';
                    setTimeout(() => {
                        updateBattlePass();
                        new Audio('sounds/premier_nextmapgroup.wav').play().catch(e => {});
                        const item = targetReward.querySelector('.bp-reward-item');
                        if(item) {
                            item.style.animation = 'itemUnlock 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                            const unlockStyle = document.createElement('style');
                            unlockStyle.textContent = '@keyframes itemUnlock{0%{transform:scale(0.8);opacity:0.5}50%{transform:scale(1.15) rotate(5deg)}75%{transform:scale(0.95) rotate(-3deg)}100%{transform:scale(1) rotate(0deg);opacity:1}}';
                            document.head.appendChild(unlockStyle);
                            setTimeout(() => {
                                item.style.animation = '';
                                unlockStyle.remove();
                            }, 800);
                        }
                        if(targetReward.dataset.rewardType === 'music-kit') {
                            attachMusicKitHandler(targetReward);
                        }
                        overlay.remove();
                        levelNum.remove();
                        style.remove();
                        
                        if(isLevel15) {
                            setTimeout(() => {
                                const completionOverlay = document.createElement('div');
                                completionOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:999999;opacity:0;transition:opacity 0.5s;overflow:hidden;';
                                
                                for(let i=0;i<30;i++){
                                    const wind = document.createElement('div');
                                    wind.style.cssText = `position:absolute;width:${Math.random()*200+100}px;height:2px;background:linear-gradient(90deg, transparent, rgba(255,215,0,${Math.random()*0.3+0.1}), transparent);top:${Math.random()*100}%;left:-200px;animation:windBlow ${Math.random()*3+2}s linear ${Math.random()*2}s infinite;transform:rotate(${Math.random()*20-10}deg);`;
                                    completionOverlay.appendChild(wind);
                                }
                                
                                const content = document.createElement('div');
                                content.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:100%;';
                                content.innerHTML = `
                                    <div style="font-size:5rem;font-weight:900;background:linear-gradient(135deg, #ffd700 0%, #ffed4e 25%, #ffd700 50%, #ffed4e 75%, #ffd700 100%);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-shadow:0 0 60px rgba(255,215,0,1);filter:drop-shadow(0 0 30px rgba(255,215,0,0.8)) drop-shadow(0 0 60px rgba(255,215,0,0.4));animation:epicEntry 2s cubic-bezier(0.34, 1.56, 0.64, 1), shimmer 3s ease-in-out infinite;margin-bottom:2rem;letter-spacing:0.1em;">BATTLE PASS</div>
                                    <div style="font-size:3.5rem;font-weight:900;background:linear-gradient(135deg, #ff6b35 0%, #ffd700 50%, #ff6b35 100%);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-transform:uppercase;letter-spacing:0.4em;animation:explosiveEntry 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.5s both, shimmer 3s ease-in-out 0.5s infinite;filter:drop-shadow(0 0 20px rgba(255,179,71,0.6));position:relative;">ЗАВЕРШЕН</div>
                                    <div style="font-size:1.8rem;color:#a0d0ff;margin-top:3rem;animation:floatIn 1.5s ease-out 1.5s both;text-shadow:0 0 20px rgba(160,208,255,0.6);letter-spacing:0.1em;">ВСЕ НАГРАДЫ ПОЛУЧЕНЫ</div>
                                `;
                                const compStyle = document.createElement('style');
                                compStyle.textContent = `
                                    @keyframes epicEntry{0%{transform:scale(0.3) rotateX(90deg);opacity:0;filter:blur(20px) drop-shadow(0 0 0 transparent)}40%{transform:scale(1.3) rotateX(-10deg);filter:blur(0px) drop-shadow(0 0 40px rgba(255,215,0,1))}70%{transform:scale(0.9) rotateX(5deg)}100%{transform:scale(1) rotateX(0deg);opacity:1;filter:blur(0px) drop-shadow(0 0 30px rgba(255,215,0,0.8))}}
                                    @keyframes explosiveEntry{0%{transform:scale(0) rotate(-180deg);opacity:0;filter:blur(30px)}60%{transform:scale(1.2) rotate(10deg);filter:blur(0px)}80%{transform:scale(0.95) rotate(-5deg)}100%{transform:scale(1) rotate(0deg);opacity:1}}
                                    @keyframes floatIn{0%{transform:translateY(100px) scale(0.5);opacity:0}60%{transform:translateY(-20px) scale(1.1)}100%{transform:translateY(0) scale(1);opacity:1}}
                                    @keyframes shimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
                                    @keyframes windBlow{0%{left:-200px;opacity:0}10%{opacity:1}90%{opacity:1}100%{left:100%;opacity:0}}
                                `;
                                document.head.appendChild(compStyle);
                                completionOverlay.appendChild(content);
                                document.body.appendChild(completionOverlay);
                                
                                const mvpMusic = new Audio('sounds/roundmvpanthem_01.mp3');
                                mvpMusic.volume = musicVolumeSlider ? musicVolumeSlider.value / 100 : 0.3;
                                const originalVolume = bgMusic.volume;
                                
                                let fadeInterval = setInterval(() => {
                                    if(bgMusic.volume > 0.02) {
                                        bgMusic.volume = Math.max(0, bgMusic.volume - 0.02);
                                    } else {
                                        bgMusic.volume = 0;
                                        clearInterval(fadeInterval);
                                    }
                                }, 50);
                                
                                mvpMusic.play().catch(e => {});
                                setTimeout(() => completionOverlay.style.opacity = '1', 10);
                                
                                mvpMusic.addEventListener('ended', () => {
                                    completionOverlay.style.opacity = '0';
                                    setTimeout(() => {
                                        completionOverlay.remove();
                                        compStyle.remove();
                                        let fadeInInterval = setInterval(() => {
                                            if(bgMusic.volume < originalVolume - 0.02) {
                                                bgMusic.volume = Math.min(originalVolume, bgMusic.volume + 0.02);
                                            } else {
                                                bgMusic.volume = originalVolume;
                                                clearInterval(fadeInInterval);
                                            }
                                        }, 50);
                                    }, 1000);
                                });
                            }, 500);
                        }
                    }, 600);
                }, 300);
            }, 2500);
        });
    }
    

    
    // Quest system
    let questsOpen = false;
    const questBtn = document.getElementById('bp-quest-btn');
    const bpHeader = document.querySelector('.bp-header');
    const bpRewards = document.querySelector('.bp-rewards');
    
    if(questBtn) {
        let questTimeout;
        const questTooltip = document.getElementById('quest-tooltip');
        if(questTooltip) {
            document.body.appendChild(questTooltip);
            questTooltip.style.position = 'fixed';
            questTooltip.style.zIndex = '99999';
            questTooltip.style.display = 'none';
            questTooltip.style.opacity = '0';
            questTooltip.style.visibility = 'hidden';
            questTooltip.style.transform = 'none';
            questTooltip.style.left = 'auto';
            questTooltip.style.top = 'auto';
        }
        questBtn.addEventListener('mouseenter', (e) => {
            new Audio('sounds/sidemenu_rollover_02.wav').play().catch(e => {});
            if(!questTooltip) return;
            questTimeout = setTimeout(() => {
                const rect = questBtn.getBoundingClientRect();
                questTooltip.style.display = 'block';
                questTooltip.style.visibility = 'visible';
                questTooltip.style.opacity = '0';
                questTooltip.style.left = '0px';
                questTooltip.style.top = '0px';
                
                const tooltipWidth = questTooltip.offsetWidth;
                const tooltipHeight = questTooltip.offsetHeight;
                
                questTooltip.style.left = (rect.left - tooltipWidth - 20) + 'px';
                questTooltip.style.top = (rect.top + (rect.height - tooltipHeight) / 2 + 3) + 'px';
                questTooltip.style.opacity = '1';
            }, 500);
        });
        questBtn.addEventListener('mouseleave', () => {
            clearTimeout(questTimeout);
            if(questTooltip) {
                questTooltip.style.opacity = '0';
                questTooltip.style.visibility = 'hidden';
            }
        });
        questBtn.addEventListener('click', () => {
            new Audio('sounds/sidemenu_click_01.wav').play().catch(e => {});
            setTimeout(() => {
                new Audio('sounds/cards_draw_01.wav').play().catch(e => {});
            }, 50);
            if(!questsOpen) {
                document.getElementById('quest-icon').src = 'https://img.icons8.com/?size=100&id=11630&format=png&color=a0d0ff';
                document.getElementById('quest-tooltip-text').textContent = 'Вернуться назад';
                document.getElementById('quest-tooltip-desc').textContent = 'Закрыть квесты и вернуться к Battle Pass';
                bpRewards.style.transform = 'translateY(100vh)';
                bpRewards.style.pointerEvents = 'none';
                bpRewards.classList.add('quests-active');
                bpHeader.style.transform = 'translateY(-69px)';
                bpHeader.style.borderRadius = '0 0 20px 20px';
                document.getElementById('page-battlepass').style.overflow = 'hidden';
                
                if(!document.getElementById('bp-quests')) {
                    const questsDiv = document.createElement('div');
                    questsDiv.id = 'bp-quests';
                    questsDiv.className = 'bp-quests';
                    questsDiv.innerHTML = `
                        <div class="quest-item">
                            <div class="quest-title">СМОТРЕТЬ ТРАНСЛЯЦИЮ 30 МИНУТ</div>
                            <div class="quest-progress">0 / 30</div>
                            <div class="quest-reward">+500 XP</div>
                        </div>
                        <div class="quest-item">
                            <div class="quest-title">СМОТРЕТЬ ТРАНСЛЯЦИЮ 60 МИНУТ</div>
                            <div class="quest-progress">0 / 60</div>
                            <div class="quest-reward">+800 XP</div>
                        </div>
                        <div class="quest-item">
                            <div class="quest-title">СМОТРЕТЬ ТРАНСЛЯЦИЮ 120 МИНУТ</div>
                            <div class="quest-progress">0 / 120</div>
                            <div class="quest-reward">+1500 XP</div>
                        </div>
                    `;
                    document.querySelector('#page-battlepass .page-content').appendChild(questsDiv);
                    setTimeout(() => {
                        questsDiv.classList.add('active');
                        questsDiv.querySelectorAll('.quest-item').forEach(item => {
                            item.addEventListener('mouseenter', () => {
                                new Audio('sounds/sidemenu_rollover_02.wav').play().catch(e => {});
                            });
                        });
                    }, 50);
                }
                questsOpen = true;
            } else {
                document.getElementById('quest-icon').src = 'https://img.icons8.com/?size=100&id=11765&format=png&color=a0d0ff';
                document.getElementById('quest-tooltip-text').textContent = 'Открыть квесты';
                document.getElementById('quest-tooltip-desc').textContent = 'Просмотреть доступные квестовые задания';
                const questsDiv = document.getElementById('bp-quests');
                if(questsDiv) {
                    questsDiv.classList.remove('active');
                    setTimeout(() => questsDiv.remove(), 400);
                }
                bpHeader.style.transform = 'translateY(0)';
                bpHeader.style.borderRadius = '4px';
                bpRewards.style.transform = 'translateY(0)';
                setTimeout(() => {
                    bpRewards.style.pointerEvents = 'auto';
                    bpRewards.classList.remove('quests-active');
                }, 400);
                document.getElementById('page-battlepass').style.overflow = 'visible';
                
                questsOpen = false;
            }
        });
    }
    
    const navSounds = {
        main: 'sounds/mainmenu_press_home_01.wav',
        settings: 'sounds/mainmenu_press_settings_02.wav',
        inventory: 'sounds/mainmenu_press_inventory_02.wav',
        battlepass: 'sounds/mainmenu_press_shop_01.wav',
        seasons: 'sounds/mainmenu_press_news_01.wav',
        friends: 'sounds/mainmenu_press_inventory_02.wav',
        leaderboard: 'sounds/mainmenu_press_news_01.wav'
    };
    
    const mockLeaderboard = [
        {username: 'Player1', level: 15, xp: 15000},
        {username: 'Player2', level: 12, xp: 12500},
        {username: 'Player3', level: 10, xp: 10200},
        {username: 'Player4', level: 8, xp: 8300},
        {username: 'Player5', level: 7, xp: 7100}
    ];
    
    const updateLeaderboard = () => {
        const tbody = document.getElementById('leaderboard-table');
        if(!tbody) return;
        
        const allPlayers = [...mockLeaderboard];
        if(currentUserId) {
            const discordUserData = sessionStorage.getItem('discord_user');
            if(discordUserData) {
                const discordUser = JSON.parse(discordUserData);
                allPlayers.push({username: discordUser.username, level: bpData.level, xp: bpData.level * 1000 + bpData.xp});
            }
        }
        
        allPlayers.sort((a, b) => {
            if(b.level !== a.level) return b.level - a.level;
            return b.xp - a.xp;
        });
        
        const currentUsername = currentUserId && sessionStorage.getItem('discord_user') ? JSON.parse(sessionStorage.getItem('discord_user')).username : null;
        tbody.innerHTML = allPlayers.map((p, i) => `
            <tr style="${currentUsername && p.username === currentUsername ? 'background:rgba(88,101,242,0.1);' : ''}">
                <td>${i + 1}</td>
                <td>${p.username}</td>
                <td>${p.level}</td>
                <td>${p.xp}</td>
            </tr>
        `).join('');
    };
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => new Audio('sounds/sidemenu_rollover_02.wav').play().catch(e => {}));
        btn.addEventListener('click', () => {
            const targetPage = btn.dataset.page;
            if(targetPage === currentPage) return;
            new Audio(navSounds[targetPage] || 'sounds/inventory_item_select_01.wav').play().catch(e => {});
            const currentPageEl = document.getElementById(`page-${currentPage}`);
            const targetPageEl = document.getElementById(`page-${targetPage}`);
            
            currentPageEl.classList.remove('active');
            targetPageEl.classList.add('active');
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPage = targetPage;
            window.scrollTo({top: 0, behavior: 'smooth'});
            
            if(targetPage === 'battlepass') {
                document.body.classList.add('winter-theme');
                document.getElementById('snowfall').classList.add('active');
                if(!window.snowInterval) {
                    window.snowInterval = setInterval(() => {
                        const snowflake = document.createElement('div');
                        snowflake.className = 'snowflake';
                        snowflake.textContent = '❄';
                        snowflake.style.left = Math.random() * 100 + '%';
                        snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
                        snowflake.style.fontSize = (Math.random() * 10 + 10) + 'px';
                        document.getElementById('snowfall').appendChild(snowflake);
                        setTimeout(() => snowflake.remove(), 5000);
                    }, 200);
                }
            } else {
                document.body.classList.remove('winter-theme');
                document.getElementById('snowfall').classList.remove('active');
                if(window.snowInterval) {
                    clearInterval(window.snowInterval);
                    window.snowInterval = null;
                }
            }
        });
    });
    
    if(musicVolumeSlider && musicVolumeInput) {
        musicVolumeSlider.addEventListener('input', (e) => {
            musicVolumeInput.value = e.target.value;
            bgMusic.volume = e.target.value / 100;
            if(currentUserId) saveUserData('music_volume', parseInt(e.target.value));
        });
        musicVolumeInput.addEventListener('input', (e) => {
            let val = parseInt(e.target.value) || 0;
            if(val < 0) val = 0;
            if(val > 100) val = 100;
            musicVolumeSlider.value = val;
            musicVolumeInput.value = val;
            bgMusic.volume = val / 100;
            if(currentUserId) saveUserData('music_volume', val);
        });
    }
    
    // Tooltip positioning
    document.querySelectorAll('.inventory-item').forEach(item => {
        const tooltip = item.querySelector('.item-tooltip');
        if(!tooltip) return;
        
        item.addEventListener('mouseenter', (e) => {
            const rect = item.getBoundingClientRect();
            tooltip.style.left = (rect.right + 20) + 'px';
            tooltip.style.top = (rect.top + rect.height / 2 - 60) + 'px';
            tooltip.style.transform = 'translateY(-50%)';
        });
    });
    
    // Music kit unlock animation
    const attachMusicKitHandler = (reward) => {
        const item = reward.querySelector('.bp-reward-item');
        if(!item.classList.contains('unlocked')) return;
        
        item.addEventListener('click', () => {
            const musicFile = reward.dataset.musicFile;
            const imgSrc = reward.querySelector('.bp-reward-image').src;
            const name = reward.querySelector('.bp-reward-name').textContent;
            let rarityText = 'Легендарный';
            let rarityColor = '#d32ce6';
            if(musicFile.includes('Last Christmas')) {
                rarityText = 'Редкий';
                rarityColor = '#4b69ff';
            }
            if(musicFile.includes('dashstar')) {
                rarityText = 'Тайный';
                rarityColor = '#eb4b4b';
            }
            
            const overlay = document.createElement('div');
            overlay.className = 'music-unlock-overlay';
            overlay.innerHTML = `
                <div class="inspect-container">
                    <img src="${imgSrc}" class="inspect-image" alt="${name}" style="animation:itemReveal 1s cubic-bezier(0.34, 1.56, 0.64, 1);">
                    <div class="inspect-info" style="animation:fadeInUp 0.8s ease-out 0.5s both;">
                        <div style="color:#4CAF50;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:0.5rem;font-weight:700;">ПОЛУЧЕНО</div>
                        <div class="inspect-class">Музыкальный набор</div>
                        <div class="inspect-title">${name}</div>
                        <div class="inspect-rarity" style="color:${rarityColor};">${rarityText}</div>
                        <div style="color:#888;font-size:0.85rem;margin-top:0.5rem;">Коллекция: Winter 2026</div>
                    </div>
                    <button class="inspect-close" style="display:none;">×</button>
                    <div class="inspect-hint">Клик для закрытия</div>
                </div>
            `;
            const animStyle = document.createElement('style');
            animStyle.textContent = '@keyframes itemReveal{0%{transform:scale(0.3) rotateY(180deg);opacity:0}60%{transform:scale(1.1) rotateY(0deg)}100%{transform:scale(1) rotateY(0deg);opacity:1}}@keyframes fadeInUp{0%{transform:translateY(30px);opacity:0}100%{transform:translateY(0);opacity:1}}';
            document.head.appendChild(animStyle);
            
            document.body.appendChild(overlay);
            
            const inspectSound = new Audio('sounds/inspect_weapon_01.wav');
            inspectSound.play().catch(e => {});
            
            const originalVolume = bgMusic.volume;
            let fadeOut = setInterval(() => {
                if(bgMusic.volume > 0.05) {
                    bgMusic.volume -= 0.05;
                } else {
                    bgMusic.volume = 0;
                    clearInterval(fadeOut);
                }
            }, 50);
            
            const music = new Audio(musicFile);
            music.volume = musicVolumeSlider ? musicVolumeSlider.value / 100 : 0.3;
            const musicTimeout = setTimeout(() => music.play().catch(e => {}), 1000);
            
            setTimeout(() => overlay.classList.add('active'), 10);
            
            const closeUnlock = () => {
                new Audio('sounds/inventory_new_item_accept_01.wav').play().catch(e => {});
                overlay.classList.remove('active');
                clearTimeout(musicTimeout);
                music.pause();
                music.currentTime = 0;
                clearInterval(fadeOut);
                bgMusic.volume = originalVolume;
                
                const imgElement = overlay.querySelector('.inspect-image');
                const inventoryBtn = document.querySelector('[data-page="inventory"]');
                if(imgElement && inventoryBtn) {
                    const imgClone = imgElement.cloneNode(true);
                    const imgRect = imgElement.getBoundingClientRect();
                    const btnRect = inventoryBtn.getBoundingClientRect();
                    
                    imgClone.style.cssText = `position:fixed;left:${imgRect.left}px;top:${imgRect.top}px;width:${imgRect.width}px;height:${imgRect.height}px;z-index:9999999;transition:all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);pointer-events:none;`;
                    document.body.appendChild(imgClone);
                    
                    setTimeout(() => {
                        imgClone.style.left = btnRect.left + btnRect.width / 2 + 'px';
                        imgClone.style.top = btnRect.top + btnRect.height / 2 + 'px';
                        imgClone.style.width = '0px';
                        imgClone.style.height = '0px';
                        imgClone.style.opacity = '0';
                    }, 10);
                    
                    setTimeout(() => imgClone.remove(), 800);
                }
                
                let musicType = 'perviyraz';
                if(reward.dataset.musicFile.includes('Last Christmas')) musicType = 'lastchristmas';
                if(reward.dataset.musicFile.includes('dashstar')) musicType = 'dashstar';
                const inventoryItem = document.querySelector(`.inventory-item[data-music="${musicType}"]`);
                if(inventoryItem) inventoryItem.style.display = 'flex';
                
                if(currentUserId) {
                    const inventory = loadUserData('inventory', []);
                    if(!inventory.includes(musicType)) {
                        inventory.push(musicType);
                        saveUserData('inventory', inventory);
                    }
                    
                    const level = parseInt(reward.dataset.level);
                    const collectedRewards = loadUserData('collected_rewards', []);
                    if(!collectedRewards.includes(level)) {
                        collectedRewards.push(level);
                        saveUserData('collected_rewards', collectedRewards);
                    }
                }
                
                reward.style.transition = 'opacity 0.5s ease';
                reward.style.opacity = '0.3';
                setTimeout(() => {
                    overlay.remove();
                    animStyle.remove();
                }, 300);
            };
            
            setTimeout(() => {
                overlay.addEventListener('click', closeUnlock);
            }, 2000);
            document.addEventListener('keydown', function escHandler(e) {
                if(e.key === 'Escape') {
                    closeUnlock();
                    document.removeEventListener('keydown', escHandler);
                }
            });
        });
    };
    
    document.querySelectorAll('.bp-reward[data-reward-type="music-kit"]').forEach(reward => {
        attachMusicKitHandler(reward);
    });
    
    // Inspect mode
    const showInspect = (kit) => {
        const musicType = kit.dataset.music;
        const imgSrc = kit.querySelector('.item-image').src;
        const name = kit.querySelector('.item-name').textContent;
        const rarity = kit.querySelector('.item-rarity').textContent;
        const rarityClass = kit.querySelector('.item-rarity').className;
        const collection = kit.querySelector('.tooltip-details .tooltip-detail-value') ? kit.querySelector('.tooltip-details .tooltip-detail-value').textContent : 'Counter-Strike';
        const rarityValue = kit.querySelectorAll('.tooltip-details .tooltip-detail-value')[1];
        const rarityColor = rarityValue ? window.getComputedStyle(rarityValue).color : '';
        
        const overlay = document.createElement('div');
        overlay.className = 'inspect-overlay';
        overlay.innerHTML = `
            <div class="inspect-container">
                <img src="${imgSrc}" class="inspect-image" alt="${name}" style="animation:itemReveal 1s cubic-bezier(0.34, 1.56, 0.64, 1);">
                <div class="inspect-info" style="animation:fadeInUp 0.8s ease-out 0.5s both;">
                    <div class="inspect-class">Музыкальный набор</div>
                    <div class="inspect-title">${name}</div>
                    <div class="inspect-rarity" style="color:${rarityColor || (rarityClass.includes('rare') ? '#4b69ff' : '#888')}">${rarity}</div>
                    <div style="color:#888;font-size:0.85rem;margin-top:0.5rem;">Коллекция: ${collection}</div>
                </div>
                <button class="inspect-close">×</button>
                <div class="inspect-hint">ESC или клик для закрытия</div>
            </div>
        `;
        const inspectAnimStyle = document.createElement('style');
        inspectAnimStyle.textContent = '@keyframes itemReveal{0%{transform:scale(0.3) rotateY(180deg);opacity:0}60%{transform:scale(1.1) rotateY(0deg)}100%{transform:scale(1) rotateY(0deg);opacity:1}}@keyframes fadeInUp{0%{transform:translateY(30px);opacity:0}100%{transform:translateY(0);opacity:1}}';
        document.head.appendChild(inspectAnimStyle);
        
        document.body.appendChild(overlay);
        new Audio('sounds/item_showcase_sticker_01.wav').play().catch(e => {});
        
        setTimeout(() => overlay.classList.add('active'), 10);
        
        const closeInspect = () => {
            new Audio('sounds/inventory_item_close_01.wav').play().catch(e => {});
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
                inspectAnimStyle.remove();
            }, 300);
        };
        
        overlay.querySelector('.inspect-close').addEventListener('click', closeInspect);
        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) closeInspect();
        });
        
        document.addEventListener('keydown', function escHandler(e) {
            if(e.key === 'Escape') {
                closeInspect();
                document.removeEventListener('keydown', escHandler);
            }
        });
    };
    
    // Context menu for music kits
    let contextMenu = null;
    
    const showContextMenu = (e, kit) => {
        if(!requireAuth()) return;
        e.preventDefault();
        
        const musicType = kit.dataset.music;
        const isEquipped = kit.classList.contains('active');
        
        if(contextMenu) contextMenu.remove();
        
        contextMenu = document.createElement('div');
        contextMenu.className = 'cs2-context-menu';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
        
        const inspectItem = document.createElement('div');
        inspectItem.className = 'cs2-context-item';
        inspectItem.textContent = 'Осмотреть';
        inspectItem.addEventListener('mouseenter', () => {
            new Audio('sounds/sidemenu_rollover_02.wav').play().catch(e => {});
        });
        inspectItem.addEventListener('click', () => {
            showInspect(kit);
            contextMenu.remove();
            contextMenu = null;
        });
        
        contextMenu.appendChild(inspectItem);
        
        if(!isEquipped) {
            const menuItem = document.createElement('div');
            menuItem.className = 'cs2-context-item';
            menuItem.textContent = 'Применить набор музыки';
            
            menuItem.addEventListener('mouseenter', () => {
                new Audio('sounds/sidemenu_rollover_02.wav').play().catch(e => {});
            });
            
            menuItem.addEventListener('click', () => {
                document.querySelectorAll('.music-kit').forEach(k => {
                    k.classList.remove('active');
                    const status = k.querySelector('.tooltip-status');
                    if(status) {
                        status.classList.remove('equipped');
                        status.classList.add('not-equipped');
                        status.textContent = 'НЕ ЭКИПИРОВАН';
                    }
                });
                
                kit.classList.add('active');
                const status = kit.querySelector('.tooltip-status');
                if(status) {
                    status.classList.remove('not-equipped');
                    status.classList.add('equipped');
                    status.textContent = 'ЭКИПИРОВАН';
                }
                
                currentMusicKit = musicType;
                if(currentUserId) saveUserData('music_kit', musicType);
                bgMusic.pause();
                currentTrackIndex = 0;
                bgMusic.volume = musicVolumeSlider ? musicVolumeSlider.value / 100 : 0.3;
                playNextTrack();
                updateMusicKitUI();
                const acceptSound = new Audio('sounds/inventory_new_item_accept_01.wav');
                acceptSound.volume = 0.5;
                acceptSound.play().catch(e => {});
                
                contextMenu.remove();
                contextMenu = null;
            });
            
            contextMenu.appendChild(menuItem);
        }
        
        document.body.appendChild(contextMenu);
        new Audio('sounds/sidemenu_rollover_02.wav').play().catch(e => {});
    };
    
    document.querySelectorAll('.music-kit').forEach(kit => {
        kit.addEventListener('mouseenter', () => {
            const hoverSound = new Audio('sounds/sidemenu_rollover_02.wav');
            hoverSound.volume = 0.3;
            hoverSound.play().catch(e => {});
        });
        kit.addEventListener('click', (e) => {
            new Audio('sounds/sidemenu_click_01.wav').play().catch(err => {});
            showContextMenu(e, kit);
        });
        kit.addEventListener('contextmenu', (e) => {
            new Audio('sounds/sidemenu_click_01.wav').play().catch(err => {});
            showContextMenu(e, kit);
        });
    });
    
    document.addEventListener('click', (e) => {
        if(contextMenu && !contextMenu.contains(e.target) && !e.target.closest('.music-kit')) {
            contextMenu.remove();
            contextMenu = null;
        }
    });
    

    
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('copy', (e) => e.preventDefault());
    document.addEventListener('cut', (e) => e.preventDefault());
    document.addEventListener('paste', (e) => e.preventDefault());
    document.addEventListener('dragstart', (e) => e.preventDefault());
    document.addEventListener('selectstart', (e) => {
        if(!e.target.matches('input, textarea')) e.preventDefault();
    });
    
    // Add hover sounds for tournament elements
    document.querySelectorAll('.bracket-match, .match-card, .players-table tbody tr').forEach(element => {
        element.addEventListener('mouseenter', () => {
            new Audio('sounds/sidemenu_rollover_02.wav').play().catch(e => {});
        });
    });
    
    document.addEventListener('click', (e) => {
        if(e.target.matches('button, .inventory-item, .quest-item, .bp-reward, .season-card, .match-row, .day-title, .bracket-match, .match-card')) {
            new Audio('sounds/sidemenu_click_01.wav').play().catch(err => {});
        }
    });

});
