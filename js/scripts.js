// CS:GO Style JavaScript for Zone Blast Autumn 2025
document.addEventListener('DOMContentLoaded', function() {
    console.log('Zone Blast Autumn 2025 - CS:GO Tournament Interface Loaded');

    // CS:GO HUD style animations
    // Animations/observer disabled for static UI

    // Observe HUD panels
    // Ensure cards are visible and static (no JS-driven transitions)
    document.querySelectorAll('.team-card, .graph-card').forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'none';
        card.style.transition = 'none';
    });

    // CS:GO click effects - weapon selection style
    // Click effects disabled for static UI — keep interaction via CSS only

    // CS:GO radar-style chart placeholders
    function drawCSGOChart(canvasId, title) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas with CS:GO dark theme
        ctx.clearRect(0, 0, width, height);

        // Draw grid background like radar
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.1)';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let i = 0; i <= width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= height; i += 20) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }

        // Draw title with CS:GO font style
        ctx.fillStyle = '#ffa500';
        ctx.font = 'bold 16px "Geogrotesque", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, height / 2 - 10);

        // Draw "NO DATA" like CS:GO HUD
        ctx.fillStyle = '#666666';
        ctx.font = '12px "Geogrotesque", Arial, sans-serif';
        ctx.fillText('AWAITING DATA STREAM', width / 2, height / 2 + 10);

        // Draw some random data points like radar signals
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            ctx.fillStyle = Math.random() > 0.5 ? '#ff4500' : '#00ff00';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Initialize CS:GO charts
    setTimeout(() => {
        drawCSGOChart('kdChart', 'СТАТИСТИКА K/D');
        drawCSGOChart('adrChart', 'МЕТРИКИ ADR');
    }, 1000);

    /* Вертикальный аккордеон дней для аналитики матчей */
    (function setupDaysAccordion() {
        const days = [
            '30 октября', '29 октября', '28 октября', '27 октября'
        ];
        const matchData = {
            '30 октября': [
                    {a: 'ChocoSteep', b: 'Rufat', score: '', status: 'waiting', map: 'Mirage, Inferno, Anubis', results: [{score: '13-8', winner: 'a'}, null, null]}
                ],
            '29 октября': [
                {a: 'Beta Force', b: 'Alpha Squad', score: '16-14', win: 'a', map: 'Dust2'},
                {a: 'Epsilon', b: 'Zeta', score: '10-16', win: 'b', map: 'Inferno'}
            ],
            '28 октября': [
                {a: 'Alpha Squad', b: 'Gamma Team', score: '16-10', win: 'a', map: 'Inferno'}
            ],
            '27 октября': [
                {a: 'Delta Ops', b: 'Beta Force', score: '9-16', win: 'b', map: 'Nuke'}
            ]
        };

        const accordion = document.querySelector('.days-accordion');
        if (!accordion) return;

        days.forEach(day => {
            const block = document.createElement('div');
            block.className = 'day-block';

            const title = document.createElement('div');
            title.className = 'day-title';
            title.textContent = day;
            block.appendChild(title);

            const matchesContainer = document.createElement('div');
            matchesContainer.className = 'matches-container';

            const table = document.createElement('table');
            table.className = 'matches-table';
            table.innerHTML = `<thead><tr><th>МАТЧ</th><th>КОМАНДА A</th><th>КОМАНДА B</th><th>СЧЕТ</th><th>КАРТА</th></tr></thead><tbody></tbody>`;
            matchesContainer.appendChild(table);
            block.appendChild(matchesContainer);

            // Заполнение таблицы
            const tbody = table.querySelector('tbody');
            const matches = matchData[day] || [];
            matches.forEach((m, i) => {
                // Если указано несколько карт через запятую — отрисовать по раунду
                const maps = (m.map || '').split(',').map(s => s.trim()).filter(Boolean);
                if (maps.length > 1) {
                    maps.forEach((mapName, j) => {
                        const tr = document.createElement('tr');
                        const tdIndex = document.createElement('td');
                        // Нумеруем раунды подряд: 1, 2, 3
                        tdIndex.textContent = `${j+1}`;

                        const tdA = document.createElement('td');
                        tdA.textContent = m.a;
                        tdA.classList.add('team-cell');
                        tdA.addEventListener('click', (ev) => {
                            ev.stopPropagation();
                            showTeamPanel(ev, m.a);
                        });

                        const tdB = document.createElement('td');
                        tdB.textContent = m.b;
                        tdB.classList.add('team-cell');
                        tdB.addEventListener('click', (ev) => {
                            ev.stopPropagation();
                            showTeamPanel(ev, m.b);
                        });

                        const tdScore = document.createElement('td');
                        // проверить результат для конкретной карты (если есть results)
                        const result = (m.results && m.results[j]) || null;
                        if (result && result.score) {
                            // Помещаем счёт внутрь span с градиентом, а класс победы ставим на td для семантики
                            // Разделённый мини-блок: слева команда A + её счёт, справа команда B + её счёт
                            const parts = (result.score || '').split('-').map(s => s.trim());
                            const leftNum = parts[0] || '';
                            const rightNum = parts[1] || '';
                            const split = document.createElement('div');
                            split.className = 'score-split';

                            const left = document.createElement('div');
                            left.className = 'ss-left';
                            left.innerHTML = `<div class="ss-name">${m.a}</div><div class="ss-score ss-score-left">${leftNum}</div>`;

                            const right = document.createElement('div');
                            right.className = 'ss-right';
                            right.innerHTML = `<div class="ss-name">${m.b}</div><div class="ss-score ss-score-right">${rightNum}</div>`;

                            const center = document.createElement('div');
                            center.className = 'ss-center';
                            center.textContent = 'РЕЗУЛЬТАТЫ';

                            split.appendChild(left);
                            split.appendChild(center);
                            split.appendChild(right);
                            tdScore.appendChild(split);
                            tdScore.className = result.winner === 'a' ? 'score-win' : (result.winner === 'b' ? 'score-loss' : '');
                            // no gradient — keep score plain/white
                            if (result.winner === 'a') {
                                tdA.classList.add('team-win');
                                tdB.classList.add('team-loss');
                            } else if (result.winner === 'b') {
                                tdB.classList.add('team-win');
                                tdA.classList.add('team-loss');
                            }
                        } else {
                            tdScore.className = 'waiting';
                            tdScore.innerHTML = `<span class="waiting-text">ожидание</span>`;
                        }

                        const tdMap = document.createElement('td');
                        tdMap.textContent = mapName;
                        tdMap.classList.add('map-cell');
                        const mn = (mapName || '').trim().toLowerCase();
                        if (mn === 'mirage') tdMap.classList.add('map-mirage');
                        if (mn === 'inferno') tdMap.classList.add('map-inferno');
                        if (mn === 'anubis') tdMap.classList.add('map-anubis');

                        tr.appendChild(tdIndex);
                        tr.appendChild(tdA);
                        tr.appendChild(tdB);
                        tr.appendChild(tdScore);
                        tr.appendChild(tdMap);

                        tbody.appendChild(tr);
                    });
                } else {
                    const tr = document.createElement('tr');
                    const tdIndex = document.createElement('td');
                    tdIndex.textContent = i + 1;

                    const tdA = document.createElement('td');
                    tdA.textContent = m.a;
                    tdA.classList.add('team-cell');
                    tdA.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        showTeamPanel(ev, m.a);
                    });

                    const tdB = document.createElement('td');
                    tdB.textContent = m.b;
                    tdB.classList.add('team-cell');
                    tdB.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        showTeamPanel(ev, m.b);
                    });

                    const tdScore = document.createElement('td');
                    const singleResult = (m.results && m.results[0]) || null;
                    if (singleResult && singleResult.score) {
                        // single match: показать мини-разделение с именами и числами под ними
                        const partsS = (singleResult.score || '').split('-').map(s => s.trim());
                        const leftS = partsS[0] || '';
                        const rightS = partsS[1] || '';
                        const splitS = document.createElement('div');
                        splitS.className = 'score-split';
                        const l = document.createElement('div');
                        l.className = 'ss-left';
                        l.innerHTML = `<div class='ss-name'>${m.a}</div><div class='ss-score'>${leftS}</div>`;
                        const r = document.createElement('div');
                        r.className = 'ss-right';
                        r.innerHTML = `<div class='ss-name'>${m.b}</div><div class='ss-score'>${rightS}</div>`;
                        const centerS = document.createElement('div');
                        centerS.className = 'ss-center';
                        centerS.textContent = 'РЕЗУЛЬТАТЫ';
                        splitS.appendChild(l);
                        splitS.appendChild(centerS);
                        splitS.appendChild(r);
                        tdScore.appendChild(splitS);
                        tdScore.className = '';
                        // no gradient — keep score plain/white
                        if (singleResult.winner === 'a') {
                            tdA.classList.add('team-win');
                            tdB.classList.add('team-loss');
                        } else if (singleResult.winner === 'b') {
                            tdB.classList.add('team-win');
                            tdA.classList.add('team-loss');
                        }
                    } else if (m.status === 'waiting') {
                        tdScore.className = 'waiting';
                        tdScore.innerHTML = `<span class="waiting-text">ожидание</span>`;
                    } else {
                        const scoreClass = m.win === 'a' ? 'score-win' : (m.win === 'b' ? 'score-loss' : '');
                        tdScore.className = scoreClass;
                        tdScore.textContent = m.score;
                    }

                    const tdMap = document.createElement('td');
                    tdMap.textContent = m.map;
                    tdMap.classList.add('map-cell');
                    const mm = (m.map || '').trim().toLowerCase();
                    if (mm === 'mirage') tdMap.classList.add('map-mirage');
                    if (mm === 'inferno') tdMap.classList.add('map-inferno');
                    if (mm === 'anubis') tdMap.classList.add('map-anubis');

                    tr.appendChild(tdIndex);
                    tr.appendChild(tdA);
                    tr.appendChild(tdB);
                    tr.appendChild(tdScore);
                    tr.appendChild(tdMap);

                    tbody.appendChild(tr);
                }
            });


            // Клик только по заголовку дня — раскрывает/скрывает таблицу
            title.addEventListener('click', (e) => {
                // Скрыть все остальные
                document.querySelectorAll('.day-block').forEach(b => {
                    if (b !== block) b.classList.remove('active');
                });
                // Переключить текущий
                block.classList.toggle('active');
            });

            // Предотвращаем всплытие кликов из таблицы/контента, чтобы они не закрывали блок
            matchesContainer.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            accordion.appendChild(block);
        });
    })();

    // CS:GO loading sequence
    function startLoadingSequence() {
        const header = document.querySelector('header');
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            header.style.transition = 'all 1s ease';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';

            // Simulate loading different HUD elements
            setTimeout(() => playLoadingSound(), 500);
        }, 200);
    }

    function playLoadingSound() {
        // Simulate CS:GO loading sounds with console messages
        const messages = [
            'Loading HUD interface...',
            'Connecting to tournament server...',
            'Synchronizing player data...',
            'Initializing match statistics...',
            'Tournament interface ready.'
        ];

        messages.forEach((msg, index) => {
            setTimeout(() => console.log(`[CS:GO] ${msg}`), index * 300);
        });
    }

    // Normal cursor
    document.body.style.cursor = 'default';

    // Add CS:GO style weapon buy menu effect to stats
    // Text-shadow hover scripts disabled to keep static appearance; CSS handles simple hovers

    // Initialize CS:GO interface (loading sequence disabled for static UI)
    // startLoadingSequence() intentionally not called to avoid header animation

    console.log('CS:GO Tournament Interface initialized successfully!');
});

/* --- Team panel + Steam avatar integration helpers --- */
(function(){
    // Map of team name -> array of steam profile URLs (user-provided)
    const teamPlayers = {
        'ChocoSteep': [
            'https://steamcommunity.com/profiles/76561199508252956/',
            'https://steamcommunity.com/profiles/76561199410968139/',
            'https://steamcommunity.com/profiles/76561199583135417/'
        ],
        'Rufat': [
            'https://steamcommunity.com/profiles/76561199584531950/',
            'https://steamcommunity.com/profiles/76561199851125647/',
            'https://steamcommunity.com/profiles/76561199729749913/',
            'https://steamcommunity.com/profiles/76561199142259766/'
        ]
    };

    function extractSteamId(url){
        try{
            const u = new URL(url);
            const parts = u.pathname.split('/').filter(Boolean);
            // /profiles/<steamid> or /id/<vanity>
            if(parts[0] === 'profiles' && parts[1]) return parts[1];
            return null; // vanity or unknown
        }catch(e){ return null; }
    }

    async function fetchAvatarsByApi(steamIds){
        // Загружаем аватарки и имена напрямую через прокси на Steam API
        const STEAM_PROXY_BASE = 'https://zoneblast.cc';
        // out: steamid -> { avatar: url|string, name: string|undefined }
        const out = {};
        if (!steamIds || steamIds.length === 0) return out;

        // Пытаемся получить через прокси
        try {
            const q = encodeURIComponent(steamIds.join(','));
            const url = `${STEAM_PROXY_BASE}/api/steam/avatars?ids=${q}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (res && res.ok) {
                const data = await res.json();
                // Ожидаем формат: { "7656...": { avatar: "https://...", name: "PlayerName" }, ... }
                if (data && typeof data === 'object') {
                    Object.keys(data).forEach(k => {
                        if (data[k]) {
                            out[k] = data[k];
                        }
                    });
                }
            }
        } catch (err) {
            console.warn('Steam proxy fetch failed:', err);
        }

        // Hardcoded данные для известных игроков (fallback)
        const hardcoded = {
            '76561199508252956': { avatar: 'https://avatars.steamstatic.com/3ee8c546ec12a5c969feac1edac9807ac64aed19_full.jpg', name: '525' },
            '76561199410968139': { avatar: 'https://avatars.steamstatic.com/750944021bca9d5fee0f6fd4e2188f85d7d30d79_full.jpg', name: 'MyagkoyPosadki' },
            '76561199583135417': { avatar: 'https://avatars.steamstatic.com/b2ee52a62ea353bb772742aaec8c4990e4a5d412_full.jpg', name: 'sw1lows' },
            '76561199584531950': { avatar: 'https://avatars.steamstatic.com/7e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e_full.jpg', name: 'rufat1' },
            '76561199851125647': { avatar: 'https://avatars.steamstatic.com/8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e_full.jpg', name: 'rufat2' },
            '76561199729749913': { avatar: 'https://avatars.steamstatic.com/9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e_full.jpg', name: 'rufat3' },
            '76561199142259766': { avatar: 'https://avatars.steamstatic.com/1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e_full.jpg', name: 'rufat4' }
        };

        // Для отсутствующих — hardcoded или placeholder
        steamIds.forEach(id => {
            if (!out[id] && hardcoded[id]) {
                out[id] = hardcoded[id];
            } else if (!out[id]) {
                out[id] = { avatar: 'https://via.placeholder.com/48x48?text=User', name: `Player ${id.slice(-5)}` };
            }
        });

        return out;
    }


    function closeTeamPanel(){
        const ex = document.getElementById('team-panel');
        if(ex) ex.remove();
        document.removeEventListener('click', onDocClickForPanel);
        document.removeEventListener('keydown', onEscClose);
    }

    function onDocClickForPanel(e){
        const panel = document.getElementById('team-panel');
        if(!panel) return;
        if(!panel.contains(e.target)) closeTeamPanel();
    }

    function onEscClose(e){ if(e.key === 'Escape') closeTeamPanel(); }

    async function showTeamPanel(ev, teamName){
        console.log('showTeamPanel called', teamName, ev && {clientX: ev.clientX, clientY: ev.clientY});
        console.log('teamPanel: step 1 - start');
        try{
            closeTeamPanel();
        const profiles = teamPlayers[teamName] || [];

        const panel = document.createElement('div');
        panel.id = 'team-panel';
        panel.className = 'team-panel';

        // header without API key input
        const header = document.createElement('div'); header.className = 'tp-header';
        const title = document.createElement('div'); title.className = 'tp-title'; title.textContent = teamName;
        const closeBtn = document.createElement('button'); closeBtn.className = 'tp-close'; closeBtn.innerText = '✕';
        closeBtn.addEventListener('click', closeTeamPanel);

        header.appendChild(title);
        header.appendChild(closeBtn);

        panel.appendChild(header);

        const playersWrap = document.createElement('div'); playersWrap.className = 'tp-players';
        panel.appendChild(playersWrap);

        // Append hidden panel first so we can measure its size, then position near cursor
        document.body.appendChild(panel);
        console.log('teamPanel: step 2 - appended to DOM');
        panel.style.visibility = 'hidden';
        panel.style.left = '0px';
        panel.style.top = '0px';

        // Position panel near cursor but keep inside viewport
        const pad = 12;
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        const cursorX = ev.clientX || 0;
        const cursorY = ev.clientY || 0;

        // Measure after insertion
        const pw = panel.offsetWidth || panel.getBoundingClientRect().width || 300;
        const ph = panel.offsetHeight || panel.getBoundingClientRect().height || 200;
        console.log('teamPanel: step 3 - measured', {pw, ph, cursorX, cursorY, vw, vh});

        // Всегда слева от курсора
        let left = cursorX - pw - pad;
        let top = cursorY - Math.floor(ph/2);
        // если ушло за левый край, ставим вплотную к краю
        if (left < 8) left = 8;
        // если ушло за верх, ставим вплотную к верху
        if (top < 8) top = 8;
        // если ушло за низ, сдвигаем вверх
        if (top + ph > vh - 8) top = vh - ph - 8;

        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
        panel.style.visibility = 'visible';
        console.log('teamPanel: step 4 - positioned', {left, top});

        // Prepare steam ids
        const steamIds = profiles.map(extractSteamId).filter(Boolean);
        const avatarsById = await fetchAvatarsByApi(steamIds);

        // render players
        for(const url of profiles){
            const row = document.createElement('div'); row.className = 'team-player';
            const img = document.createElement('img');
            const nameDiv = document.createElement('div'); nameDiv.className = 'tp-name';

            const sid = extractSteamId(url);
            if(sid && avatarsById[sid]){
                const entry = avatarsById[sid];
                if (typeof entry === 'string') {
                    img.src = entry;
                    nameDiv.textContent = `Player ${sid.slice(-5)}`;
                } else if (typeof entry === 'object') {
                    img.src = entry.avatar || 'https://via.placeholder.com/48x48?text=User';
                    nameDiv.textContent = entry.name || `Player ${sid.slice(-5)}`;
                } else {
                    img.src = 'https://via.placeholder.com/48x48?text=User';
                    nameDiv.textContent = `Player ${sid.slice(-5)}`;
                }
            } else {
                img.src = 'https://via.placeholder.com/48x48?text=User';
                nameDiv.textContent = `Player ${url.split('/').pop()}`; // Показываем часть URL
            }

            row.appendChild(img);
            row.appendChild(nameDiv);
            playersWrap.appendChild(row);
        }

        // Attach global listeners to close
        setTimeout(()=>{ // allow immediate click to not trigger close
            document.addEventListener('click', onDocClickForPanel);
            document.addEventListener('keydown', onEscClose);
        }, 50);
        } catch (err) {
            console.error('showTeamPanel error', err);
            closeTeamPanel();
        }
    }

    // Expose showTeamPanel for testing and for handlers
    window.__showTeamPanel = showTeamPanel;
    // Also expose as global name so existing handlers calling showTeamPanel(...) work
    window.showTeamPanel = showTeamPanel;
})();