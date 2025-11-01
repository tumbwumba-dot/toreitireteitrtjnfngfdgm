document.addEventListener('DOMContentLoaded', function() {

    // Discord Auth
    const checkAuth = () => {
        const discordUser = sessionStorage.getItem('discord_user');
        if(discordUser) {
            const user = JSON.parse(discordUser);
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
    
    checkAuth();
    
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
        const clientId = '1434129915502133249';
        const redirectUri = encodeURIComponent('https://zoneblast.netlify.app/');
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=identify`;
        const popup = window.open(authUrl, 'Discord Auth', 'width=500,height=700,left=100,top=100');
        const checkClosed = setInterval(() => {
            if(popup.closed) {
                clearInterval(checkClosed);
                const wasAuthed = checkAuth();
                if(wasAuthed) {
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
        document.getElementById('discord-not-connected').style.display = 'block';
        document.getElementById('discord-connected').style.display = 'none';
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
                checkAuth();
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
    soundOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:9999999;display:flex;align-items:center;justify-content:center;';
    soundOverlay.innerHTML = '<div style="text-align:center;font-family:Geogrotesque,Arial,sans-serif;"><h2 style="color:#ffa500;font-size:2.5rem;font-weight:900;margin-bottom:2rem;">НАЖМИТЕ ДЛЯ АКТИВАЦИИ</h2></div>';
    document.body.appendChild(soundOverlay);
    
    let currentMusicKit = localStorage.getItem('music_kit') || 'cs2';
    const musicTracks = {
        csgo: ['sounds/mainmenu.mp3', 'sounds/mainmenu1.mp3'],
        cs2: ['sounds/mainmenu2.mp3'],
        lastchristmas: ['sounds/SpotiDownloader.com - Last Christmas - Wham!.mp3'],
        perviyraz: ['sounds/SpotiDownloader.com - Первый раз - remix nevroz - JojoHF.mp3']
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
    
    const activateSound = () => {
        soundOverlay.style.opacity = '0';
        soundOverlay.style.transition = 'opacity 0.5s';
        soundFiles.forEach(src => {
            const audio = new Audio(src);
            audio.preload = 'auto';
            audio.load();
            preloadedSounds[src] = audio;
        });
        setTimeout(() => soundOverlay.remove(), 500);
        new Audio('sounds/inventory_new_item_accept_01.wav').play().catch(e => {});
        playNextTrack();
    };
    
    soundOverlay.addEventListener('click', activateSound);
    document.addEventListener('keydown', (e) => {
        if(e.key.length === 1 || e.key === ' ') {
            activateSound();
        }
    }, {once: true});
    
    const pages = ['inventory', 'seasons', 'main', 'settings', 'battlepass'];
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
            document.getElementById('bp-start-container').style.display = 'none';
            document.getElementById('bp-level-container').style.display = 'block';
            document.getElementById('bp-quest-btn').style.display = 'flex';
            document.getElementById('bp-rewards').style.display = 'flex';
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
    
    const updateBattlePass = () => {
        document.getElementById('bp-current-level').textContent = bpData.level;
        document.getElementById('bp-current-xp').textContent = bpData.xp;
        document.getElementById('bp-max-xp').textContent = bpData.maxXp;
        const fillPercent = (bpData.xp / bpData.maxXp) * 100;
        document.getElementById('bp-xp-fill').style.width = fillPercent + '%';
        
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
    };
    
    if(document.getElementById('bp-current-level')) {
        updateBattlePass();
    }
    
    const testLevelBtn = document.getElementById('test-level-up');
    if(testLevelBtn) {
        testLevelBtn.addEventListener('click', () => {
            bpData.level++;
            bpData.xp = 0;
            
            const targetReward = document.querySelector(`.bp-reward[data-level="${bpData.level}"]`);
            if(!targetReward) return;
            
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
                    }, 600);
                }, 300);
            }, 2500);
        });
    }
    

    
    // Quest system
    let questsOpen = false;
    const questBtn = document.getElementById('bp-quest-btn');
    const refreshBtn = document.getElementById('bp-refresh-btn');
    const bpHeader = document.querySelector('.bp-header');
    const bpRewards = document.querySelector('.bp-rewards');
    
    if(refreshBtn) {
        let refreshTimeout;
        const refreshTooltip = document.getElementById('refresh-tooltip');
        if(refreshTooltip) {
            document.body.appendChild(refreshTooltip);
            refreshTooltip.style.position = 'fixed';
            refreshTooltip.style.zIndex = '99999';
            refreshTooltip.style.transition = 'opacity 0.2s ease';
        }
        refreshBtn.addEventListener('mouseenter', (e) => {
            new Audio('sounds/sidemenu_rollover_02.wav').play().catch(e => {});
            if(!refreshTooltip) return;
            refreshTimeout = setTimeout(() => {
                const rect = refreshBtn.getBoundingClientRect();
                refreshTooltip.style.visibility = 'visible';
                refreshTooltip.style.display = 'block';
                requestAnimationFrame(() => {
                    const tooltipHeight = refreshTooltip.offsetHeight;
                    refreshTooltip.style.left = rect.right + 20 + 'px';
                    refreshTooltip.style.top = rect.top + rect.height / 2 - tooltipHeight / 2 + 80 + 'px';
                    requestAnimationFrame(() => {
                        refreshTooltip.style.opacity = '1';
                    });
                });
            }, 500);
        });
        refreshBtn.addEventListener('mouseleave', () => {
            clearTimeout(refreshTimeout);
            if(refreshTooltip) {
                refreshTooltip.style.opacity = '0';
                refreshTooltip.style.visibility = 'hidden';
            }
        });
        refreshBtn.addEventListener('click', () => {
            new Audio('sounds/sidemenu_click_01.wav').play().catch(e => {});
            location.reload();
        });
    }
    
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
                document.getElementById('bp-refresh-btn').style.display = 'flex';
                bpRewards.style.transform = 'translateY(100vh)';
                bpRewards.style.pointerEvents = 'none';
                bpRewards.classList.add('quests-active');
                bpHeader.style.transform = 'translateY(-69px)';
                bpHeader.style.borderRadius = '0 0 20px 20px';
                document.getElementById('page-battlepass').style.overflow = 'hidden';
                
                if(!document.getElementById('bp-quests')) {
                    const discordUser = sessionStorage.getItem('discord_user');
                    const userId = discordUser ? JSON.parse(discordUser).id : null;
                    
                    const questsDiv = document.createElement('div');
                    questsDiv.id = 'bp-quests';
                    questsDiv.className = 'bp-quests';
                    questsDiv.innerHTML = '';
                    
                    if(userId) {
                        fetch(`http://localhost:3000/progress/${userId}`)
                        .then(r => r.json())
                        .then(data => {
                            questsDiv.insertAdjacentHTML('beforeend', `
                                <div class="quest-item ${data.quest1 ? 'completed' : ''}">
                                    <div class="quest-title">СМОТРЕТЬ ТРАНСЛЯЦИЮ 30 МИНУТ</div>
                                    <div class="quest-progress">${Math.min(data.minutes, 30)} / 30</div>
                                    <div class="quest-reward">+500 XP</div>
                                </div>
                                <div class="quest-item ${data.quest2 ? 'completed' : ''}">
                                    <div class="quest-title">СМОТРЕТЬ ТРАНСЛЯЦИЮ 60 МИНУТ</div>
                                    <div class="quest-progress">${Math.min(data.minutes, 60)} / 60</div>
                                    <div class="quest-reward">+800 XP</div>
                                </div>
                                <div class="quest-item ${data.quest3 ? 'completed' : ''}">
                                    <div class="quest-title">СМОТРЕТЬ ТРАНСЛЯЦИЮ 120 МИНУТ</div>
                                    <div class="quest-progress">${Math.min(data.minutes, 120)} / 120</div>
                                    <div class="quest-reward">+1500 XP</div>
                                </div>
                            `);
                        });
                    } else {
                        questsDiv.insertAdjacentHTML('beforeend', `
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
                        `);
                    }
                    
                    setTimeout(() => {
                        const refreshBtn = document.getElementById('refresh-quests-btn');
                        if(refreshBtn) {
                            refreshBtn.addEventListener('mouseenter', () => {
                                new Audio('sounds/sidemenu_rollover_02.wav').play().catch(e => {});
                                refreshBtn.style.boxShadow = '0 6px 20px rgba(255,179,71,0.5)';
                            });
                            refreshBtn.addEventListener('mouseleave', () => {
                                refreshBtn.style.boxShadow = '0 4px 15px rgba(255,179,71,0.3)';
                            });
                            refreshBtn.addEventListener('click', () => {
                                new Audio('sounds/sidemenu_click_01.wav').play().catch(e => {});
                                location.reload();
                            });
                        }
                    }, 100);
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
                document.getElementById('bp-refresh-btn').style.display = 'none';
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
        seasons: 'sounds/mainmenu_press_news_01.wav'
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
    
    
    const musicVolumeSlider = document.getElementById('music-volume');
    const musicVolumeInput = document.getElementById('music-volume-input');
    
    if(musicVolumeSlider && musicVolumeInput) {
        musicVolumeSlider.addEventListener('input', (e) => {
            musicVolumeInput.value = e.target.value;
            bgMusic.volume = e.target.value / 100;
        });
        musicVolumeInput.addEventListener('input', (e) => {
            let val = parseInt(e.target.value) || 0;
            if(val < 0) val = 0;
            if(val > 100) val = 100;
            musicVolumeSlider.value = val;
            musicVolumeInput.value = val;
            bgMusic.volume = val / 100;
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
            const rarityText = musicFile.includes('Last Christmas') ? 'Редкий' : 'Легендарный';
            const rarityColor = musicFile.includes('Last Christmas') ? '#4b69ff' : '#d32ce6';
            
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
                overlay.classList.remove('active');
                clearTimeout(musicTimeout);
                music.pause();
                music.currentTime = 0;
                clearInterval(fadeOut);
                bgMusic.volume = originalVolume;
                const musicType = reward.dataset.musicFile.includes('Last Christmas') ? 'lastchristmas' : 'perviyraz';
                const inventoryItem = document.querySelector(`.inventory-item[data-music="${musicType}"]`);
                if(inventoryItem) inventoryItem.style.display = 'flex';
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
                localStorage.setItem('music_kit', musicType);
                bgMusic.pause();
                currentTrackIndex = 0;
                bgMusic.volume = musicVolumeSlider ? musicVolumeSlider.value / 100 : 0.3;
                playNextTrack();
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
    
    // Set active music kit on load
    document.querySelectorAll('.music-kit').forEach(kit => {
        const status = kit.querySelector('.tooltip-status');
        if(kit.dataset.music === currentMusicKit) {
            kit.classList.add('active');
            if(status) {
                status.classList.remove('not-equipped');
                status.classList.add('equipped');
            }
        } else {
            if(status) {
                status.classList.remove('equipped');
                status.classList.add('not-equipped');
            }
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
