/* 
         ================================================================
         🧠 JAVASCRIPT SECTION: The "Brain" of our Game
         This is where the magic happens! This code tells the game how to work.
         It keeps track of the score, makes the gems fall, checks if you got a match,
         and handles what happens when you click or swipe on the screen.
         ================================================================ 
        */

        // 🛠️ 1. SETTING UP THE GAME PIECES
        // Here we grab the different parts of our HTML (like the score text) 
        // so we can change them later using code.
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('score-val');
        const movesEl = document.getElementById('moves-val');
        const levelEl = document.getElementById('level-val');
        const goalEl = document.getElementById('goal-val');
        const overlay = document.getElementById('overlay');
        const startBtn = document.getElementById('start-btn');
        const messageBox = document.getElementById('message-box');
        const hintBtn = document.getElementById('hint-btn');
        const saveBtn = document.getElementById('save-btn');
        const loadBtn = document.getElementById('load-btn');
        const loadInput = document.getElementById('load-input');

        // 📏 2. GAME RULES AND SETTINGS
        // We decide how big the game board is, how many different gems there are,
        // and what colors they should be!
        const GRID_COLS = 10;
        const GRID_ROWS = 8;
        const GEM_TYPES = 6;
        const GEM_ROCK = 6;
        const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#f97316', '#475569'];

        // 💥 POWER-UPS! What happens when you match 4 or 5 gems!
        const POWER_NONE = 0;
        const POWER_BOMB = 1; // 4 Match
        const POWER_WILD = 2; // 5 Match

        // 🎒 3. THE GAME'S MEMORY (STATE)
        // This is a big list of everything the game needs to remember while you play,
        // like your score, what level you are on, and where all the gems are right now.
        let state = {
            grid: [],
            score: 0,
            moves: 20,
            level: 1,
            goal: 2500,
            selected: null,
            dragStart: null,
            isAnimating: false,
            width: 0,
            height: 0,
            cellSize: 0,
            particles: [],
            gameStarted: false,
            spawnRockThisTurn: false
        };

        // 🎲 4. BUILDING THE STARTING BOARD
        // When the game starts, we need to fill the empty board with random gems.
        // This function puts a gem in every row and column, but makes sure 
        // we don't accidentally start with any 3-in-a-row matches!
        function initGrid() {
            state.grid = [];
            for (let r = 0; r < GRID_ROWS; r++) {
                state.grid[r] = [];
                for (let c = 0; c < GRID_COLS; c++) {
                    let type;
                    do {
                        type = Math.floor(Math.random() * GEM_TYPES);
                    } while (
                        (c >= 2 && state.grid[r][c - 1].type === type && state.grid[r][c - 2].type === type) ||
                        (r >= 2 && state.grid[r - 1][c].type === type && state.grid[r - 2][c].type === type)
                    );

                    state.grid[r][c] = {
                        type: type,
                        power: POWER_NONE,
                        offsetX: 0,
                        offsetY: -GRID_ROWS - r,
                        scale: 1,
                        alpha: 1
                    };
                }
            }
            
            // Guarantee at least one rock for level 12+ starts/loads
            if (state.level >= 12) {
                const rockR = Math.floor(Math.random() * GRID_ROWS);
                const rockC = Math.floor(Math.random() * GRID_COLS);
                state.grid[rockR][rockC].type = GEM_ROCK;
            }

            animateIntro();
        }

        // 🎬 5. THE OPENING ANIMATION
        // This makes all the gems fall from the top of the screen when the game first starts.
        // It looks super cool, like they are raining down!
        async function animateIntro() {
            state.isAnimating = true;
            let finished = false;
            while (!finished) {
                finished = true;
                for (let r = 0; r < GRID_ROWS; r++) {
                    for (let c = 0; c < GRID_COLS; c++) {
                        let gem = state.grid[r][c];
                        if (gem.offsetY < 0) {
                            gem.offsetY += 0.35;
                            if (gem.offsetY > 0) gem.offsetY = 0;
                            finished = false;
                        }
                    }
                }
                await new Promise(res => setTimeout(res, 10));
            }
            state.isAnimating = false;
        }

        // 📱 6. MAKING IT FIT ANY SCREEN
        // Whether you play on a giant computer or a tiny phone, this function
        // stretches and squishes the game board so it fits perfectly!
        function resize() {
            const container = document.getElementById('game-container');
            const availableHeight = container.clientHeight - 250;
            const availableWidth = container.clientWidth * 0.95;

            state.cellSize = Math.floor(Math.min(availableWidth / GRID_COLS, availableHeight / GRID_ROWS));

            canvas.width = state.cellSize * GRID_COLS;
            canvas.height = state.cellSize * GRID_ROWS;
            state.width = canvas.width;
            state.height = canvas.height;
        }

        // 🖌️ 7. DRAWING A SINGLE GEM
        // This is a big set of instructions telling the computer exactly how to draw
        // a circle, square, triangle, or star, and how to paint it with a shiny color!
        function drawGem(r, c, type, power, xOffset = 0, yOffset = 0, scale = 1, alpha = 1, isPulsing = false) {
            const x = (c + xOffset) * state.cellSize + state.cellSize / 2;
            const y = (r + yOffset) * state.cellSize + state.cellSize / 2;
            const r_size = (state.cellSize / 2) * 0.8 * scale;

            if (y < -state.cellSize) return;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(x, y);

            // Special power up indicators
            if (power === POWER_BOMB) {
                ctx.strokeStyle = 'rgba(0,0,0,0.8)';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(0, 0, r_size * 1.1, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = 'white';
                ctx.stroke();
            } else if (power === POWER_WILD) {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 6;
                ctx.shadowBlur = 15;
                ctx.shadowColor = 'white';
                ctx.beginPath();
                ctx.arc(0, 0, r_size * 1.1, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            ctx.fillStyle = COLORS[type];
            ctx.beginPath();
            if (type === 0) { // Diamond
                ctx.moveTo(0, -r_size); ctx.lineTo(r_size, 0); ctx.lineTo(0, r_size); ctx.lineTo(-r_size, 0);
            } else if (type === 1) { // Hex
                for (let i = 0; i < 6; i++) {
                    const ang = (Math.PI * 2 / 6) * i;
                    ctx.lineTo(Math.cos(ang) * r_size, Math.sin(ang) * r_size);
                }
            } else if (type === 2) { // Circle
                ctx.arc(0, 0, r_size, 0, Math.PI * 2);
            } else if (type === 3) { // Square
                ctx.rect(-r_size * 0.8, -r_size * 0.8, r_size * 1.6, r_size * 1.6);
            } else if (type === 4) { // Triangle
                ctx.moveTo(0, -r_size); ctx.lineTo(r_size, r_size); ctx.lineTo(-r_size, r_size);
            } else if (type === 5) { // Star
                for (let i = 0; i < 5; i++) {
                    const ang = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    ctx.lineTo(Math.cos(ang) * r_size, Math.sin(ang) * r_size);
                }
            } else if (type === 6) { // Rock
                ctx.moveTo(r_size * 0.4, -r_size * 0.8);
                ctx.lineTo(r_size * 0.8, -r_size * 0.4);
                ctx.lineTo(r_size * 0.9, r_size * 0.4);
                ctx.lineTo(r_size * 0.5, r_size * 0.8);
                ctx.lineTo(-r_size * 0.4, r_size * 0.9);
                ctx.lineTo(-r_size * 0.8, r_size * 0.3);
                ctx.lineTo(-r_size * 0.7, -r_size * 0.5);
                ctx.lineTo(-r_size * 0.2, -r_size * 0.9);
            }
            ctx.closePath();
            ctx.fill();

            // Shine
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.ellipse(-r_size / 3, -r_size / 3, r_size / 4, r_size / 6, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();

            if (isPulsing) {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 4;
                ctx.stroke();
            }
            ctx.restore();
        }

        // 🔍 8. THE MATCH DETECTIVE
        // This function looks at the whole board, row by row and column by column.
        // It's looking for 3, 4, or 5 gems of the same color touching each other!
        function findMatches() {
            let sets = [];
            // Horizontal
            for (let r = 0; r < GRID_ROWS; r++) {
                let count = 1;
                for (let c = 1; c <= GRID_COLS; c++) {
                    if (c < GRID_COLS && state.grid[r][c].type !== GEM_ROCK && state.grid[r][c].type === state.grid[r][c - 1].type) {
                        count++;
                    } else {
                        if (count >= 3 && state.grid[r][c - 1].type !== GEM_ROCK) {
                            let match = [];
                            for (let i = 1; i <= count; i++) match.push({ r, c: c - i });
                            sets.push({ gems: match, length: count, orientation: 'horizontal' });
                        }
                        count = 1;
                    }
                }
            }
            // Vertical
            for (let c = 0; c < GRID_COLS; c++) {
                let count = 1;
                for (let r = 1; r <= GRID_ROWS; r++) {
                    if (r < GRID_ROWS && state.grid[r][c].type !== GEM_ROCK && state.grid[r][c].type === state.grid[r - 1][c].type) {
                        count++;
                    } else {
                        if (count >= 3 && state.grid[r - 1][c].type !== GEM_ROCK) {
                            let match = [];
                            for (let i = 1; i <= count; i++) match.push({ r: r - i, c });
                            sets.push({ gems: match, length: count, orientation: 'vertical' });
                        }
                        count = 1;
                    }
                }
            }
            return sets;
        }

        // 💥 9. DESTROYING MATCHES & DROPPING NEW GEMS
        // If the "Match Detective" found matches, this function deletes those gems,
        // adds points to your score, and drops new gems from the ceiling to fill the holes!
        async function handleMatches() {
            let sets = findMatches();
            if (sets.length === 0) {
                state.isAnimating = false;
                if (state.moves <= 0) endGame();
                return;
            }

            state.isAnimating = true;
            let toRemove = [];
            let powerSpawned = [];

            let allBombsInMatches = [];
            sets.forEach(set => {
                updateScore(set.length * 100);
                set.gems.forEach(g => {
                    toRemove.push(g);
                    if (state.grid[g.r][g.c].power === POWER_BOMB) {
                        allBombsInMatches.push({ r: g.r, c: g.c, type: state.grid[g.r][g.c].type });
                    }
                });

                // Check for Double Bomb Power-up
                let bombCount = 0;
                set.gems.forEach(g => {
                    if (state.grid[g.r][g.c].power === POWER_BOMB) bombCount++;
                });

                const head = set.gems[0];
                if (bombCount >= 2) {
                    showMessage("BOMB COMBO!");
                    updateScore(1000);
                    if (set.orientation === 'horizontal') {
                        for (let c = 0; c < GRID_COLS; c++) toRemove.push({ r: head.r, c });
                    } else {
                        for (let r = 0; r < GRID_ROWS; r++) toRemove.push({ r, c: head.c });
                    }
                }

                // Spawn Power-ups based on match length
                if (set.length === 4) {
                    powerSpawned.push({ r: head.r, c: head.c, power: POWER_BOMB, type: state.grid[head.r][head.c].type });
                } else if (set.length === 5) {
                    powerSpawned.push({ r: head.r, c: head.c, power: POWER_WILD, type: state.grid[head.r][head.c].type });
                } else if (set.length >= 6) {
                    updateScore(2000);
                    showMessage("BOARD CLEAR!");
                    for (let r = 0; r < GRID_ROWS; r++) {
                        for (let c = 0; c < GRID_COLS; c++) {
                            toRemove.push({ r, c });
                        }
                    }
                }
            });

            // Cross Combo: 2+ matches and different colored bombs
            const uniqueTypes = new Set(allBombsInMatches.map(b => b.type));
            if (sets.length >= 2 && uniqueTypes.size >= 2) {
                showMessage("CROSS COMBO!");
                updateScore(2000);
                allBombsInMatches.forEach(b => {
                    for (let c = 0; c < GRID_COLS; c++) toRemove.push({ r: b.r, c });
                    for (let r = 0; r < GRID_ROWS; r++) toRemove.push({ r, c: b.c });
                });
            }

            // Unique removal list
            toRemove = toRemove.filter((v, i, a) => a.findIndex(t => t.r === v.r && t.c === v.c) === i);

            // Trigger Power-up Effects if any removed gem was a bomb/wild
            let chainReaction = true;
            while (chainReaction) {
                chainReaction = false;
                toRemove.forEach(m => {
                    const gem = state.grid[m.r][m.c];
                    if (gem.power === POWER_BOMB) {
                        gem.power = POWER_NONE; // prevent loop
                        for (let dr = -1; dr <= 1; dr++) {
                            for (let dc = -1; dc <= 1; dc++) {
                                let nr = m.r + dr, nc = m.c + dc;
                                if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
                                    if (!toRemove.some(tr => tr.r === nr && tr.c === nc)) {
                                        toRemove.push({ r: nr, c: nc });
                                        chainReaction = true;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Rock Smashing Score
            let rocksDestroyed = 0;
            toRemove.forEach(m => {
                if (state.grid[m.r][m.c].type === GEM_ROCK) rocksDestroyed++;
            });
            if (rocksDestroyed > 0) {
                if (rocksDestroyed === 1) {
                    updateScore(750);
                    showMessage("ROCK SMASHED!");
                } else {
                    updateScore(rocksDestroyed * 1250);
                    showMessage(`${rocksDestroyed} ROCKS SMASHED!`);
                }
            }

            // Animation out
            for (let i = 0; i < 8; i++) {
                toRemove.forEach(m => {
                    state.grid[m.r][m.c].scale -= 0.12;
                    state.grid[m.r][m.c].alpha -= 0.12;
                    if (i === 4) createParticles(m.c * state.cellSize + state.cellSize / 2, m.r * state.cellSize + state.cellSize / 2, COLORS[state.grid[m.r][m.c].type]);
                });
                await new Promise(r => setTimeout(r, 20));
            }

            // Collapse
            for (let c = 0; c < GRID_COLS; c++) {
                let empty = 0;
                for (let r = GRID_ROWS - 1; r >= 0; r--) {
                    if (toRemove.some(m => m.r === r && m.c === c)) {
                        empty++;
                    } else if (empty > 0) {
                        state.grid[r + empty][c] = { ...state.grid[r][c] };
                        state.grid[r + empty][c].offsetY = -empty;
                    }
                }
                for (let i = 0; i < empty; i++) {
                    let type = Math.floor(Math.random() * GEM_TYPES);
                    if (state.level >= 12 && state.spawnRockThisTurn) {
                        let rocks = 0;
                        for(let rr=0; rr<GRID_ROWS; rr++) for(let cc=0; cc<GRID_COLS; cc++) {
                            if(state.grid[rr] && state.grid[rr][cc] && state.grid[rr][cc].type === GEM_ROCK) rocks++;
                        }
                        if (rocks < 5) {
                            type = GEM_ROCK;
                            state.spawnRockThisTurn = false;
                        }
                    }
                    state.grid[i][c] = {
                        type: type,
                        power: POWER_NONE,
                        offsetY: -empty,
                        scale: 1,
                        alpha: 1
                    };
                }
            }

            // Place power-ups that were earned
            powerSpawned.forEach(ps => {
                state.grid[ps.r][ps.c].power = ps.power;
                state.grid[ps.r][ps.c].type = ps.type;
                state.grid[ps.r][ps.c].scale = 1;
                state.grid[ps.r][ps.c].alpha = 1;
                state.grid[ps.r][ps.c].offsetY = 0;
            });

            // Falling animation
            let falling = true;
            while (falling) {
                falling = false;
                for (let r = 0; r < GRID_ROWS; r++) {
                    for (let c = 0; c < GRID_COLS; c++) {
                        if (state.grid[r][c].offsetY < 0) {
                            state.grid[r][c].offsetY += 0.4;
                            if (state.grid[r][c].offsetY > 0) state.grid[r][c].offsetY = 0;
                            falling = true;
                        }
                    }
                }
                await new Promise(r => setTimeout(r, 16));
            }
            handleMatches();
        }

        // ↔️ 10. SWAPPING TWO GEMS
        // When you swipe your finger, this function tries to swap the gem you touched
        // with the one next to it. If it doesn't make a match, it swaps them right back!
        async function swapGems(r1, c1, r2, c2) {
            state.isAnimating = true;
            const gem1 = state.grid[r1][c1];
            const gem2 = state.grid[r2][c2];

            // Special Case: Wildcard Swap
            if (gem1.power === POWER_WILD || gem2.power === POWER_WILD) {
                state.moves--;
                movesEl.innerText = state.moves;
                if (state.level >= 12 && Math.random() < 0.1) state.spawnRockThisTurn = true;
                const colorToClear = (gem1.power === POWER_WILD) ? gem2.type : gem1.type;
                const wildR = (gem1.power === POWER_WILD) ? r1 : r2;
                const wildC = (gem1.power === POWER_WILD) ? c1 : c2;

                let wildcardMatches = [{ r: wildR, c: wildC }];
                for (let r = 0; r < GRID_ROWS; r++) {
                    for (let c = 0; c < GRID_COLS; c++) {
                        if (state.grid[r][c].type === colorToClear) wildcardMatches.push({ r, c });
                    }
                }

                // Visual clear trigger
                showMessage("WILDCARD!");
                updateScore(wildcardMatches.length * 150);

                // Clear them manually
                for (let i = 0; i < 8; i++) {
                    wildcardMatches.forEach(m => {
                        state.grid[m.r][m.c].scale -= 0.12;
                        state.grid[m.r][m.c].alpha -= 0.12;
                    });
                    await new Promise(r => setTimeout(r, 20));
                }

                // Re-init the collapse logic by faking a match remove
                let toRemove = wildcardMatches;
                for (let c = 0; c < GRID_COLS; c++) {
                    let empty = 0;
                    for (let r = GRID_ROWS - 1; r >= 0; r--) {
                        if (toRemove.some(m => m.r === r && m.c === c)) empty++;
                        else if (empty > 0) {
                            state.grid[r + empty][c] = { ...state.grid[r][c] };
                            state.grid[r + empty][c].offsetY = -empty;
                        }
                    }
                    for (let i = 0; i < empty; i++) {
                        state.grid[i][c] = { type: Math.floor(Math.random() * GEM_TYPES), power: POWER_NONE, offsetY: -empty, scale: 1, alpha: 1 };
                    }
                }

                // Falling animation for wildcard collapse
                let falling = true;
                while (falling) {
                    falling = false;
                    for (let r = 0; r < GRID_ROWS; r++) {
                        for (let c = 0; c < GRID_COLS; c++) {
                            if (state.grid[r][c].offsetY < 0) {
                                state.grid[r][c].offsetY += 0.4;
                                if (state.grid[r][c].offsetY > 0) state.grid[r][c].offsetY = 0;
                                falling = true;
                            }
                        }
                    }
                    await new Promise(r => setTimeout(r, 16));
                }

                handleMatches();
                return;
            }

            const frames = 10;
            for (let i = 1; i <= frames; i++) {
                gem1.offsetX = (c2 - c1) * (i / frames);
                gem1.offsetY = (r2 - r1) * (i / frames);
                gem2.offsetX = (c1 - c2) * (i / frames);
                gem2.offsetY = (r1 - r2) * (i / frames);
                await new Promise(r => setTimeout(r, 16));
            }

            const tempType = gem1.type;
            const tempPower = gem1.power;
            gem1.type = gem2.type;
            gem1.power = gem2.power;
            gem2.type = tempType;
            gem2.power = tempPower;
            gem1.offsetX = gem1.offsetY = gem2.offsetX = gem2.offsetY = 0;

            if (findMatches().length === 0) {
                showMessage("NO MATCH!");
                for (let i = 1; i <= frames; i++) {
                    gem1.offsetX = (c1 - c2) * (i / frames);
                    gem1.offsetY = (r1 - r2) * (i / frames);
                    gem2.offsetX = (c2 - c1) * (i / frames);
                    gem2.offsetY = (r2 - r1) * (i / frames);
                    await new Promise(r => setTimeout(r, 16));
                }
                gem2.type = gem1.type;
                gem2.power = gem1.power;
                gem1.type = tempType;
                gem1.power = tempPower;
                gem1.offsetX = gem1.offsetY = gem2.offsetX = gem2.offsetY = 0;
                state.isAnimating = false;
            } else {
                state.moves--;
                movesEl.innerText = state.moves;
                if (state.level >= 12 && Math.random() < 0.1) state.spawnRockThisTurn = true;
                handleMatches();
            }
        }

        // ✨ 11. SPARKLE EXPLOSIONS
        // This creates those tiny little dots that fly away when a gem gets destroyed.
        function createParticles(x, y, color) {
            for (let i = 0; i < 12; i++) {
                state.particles.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 12,
                    vy: (Math.random() - 0.5) * 12,
                    life: 1.0,
                    color: color
                });
            }
        }

        // 🏆 12. KEEPING SCORE AND LEVELING UP
        // Gives you points! If you get enough points, you move to the next level!
        function updateScore(pts) {
            state.score += pts;
            scoreEl.innerText = state.score;
            let leveledUp = false;
            let hitLevel12 = false;
            
            while (state.score >= state.goal) {
                state.level++; state.goal += 3000; state.moves += 10;
                leveledUp = true;
                if (state.level === 12) hitLevel12 = true;
            }
            
            if (leveledUp) {
                levelEl.innerText = state.level; goalEl.innerText = state.goal; movesEl.innerText = state.moves;
                
                if (hitLevel12 || state.level === 12) {
                    // Force a rock to spawn immediately
                    let rockR = Math.floor(Math.random() * GRID_ROWS);
                    let rockC = Math.floor(Math.random() * GRID_COLS);
                    let attempts = 0;
                    while (state.grid[rockR][rockC].power > 0 && attempts < 50) {
                        rockR = Math.floor(Math.random() * GRID_ROWS);
                        rockC = Math.floor(Math.random() * GRID_COLS);
                        attempts++;
                    }
                    state.grid[rockR][rockC].type = GEM_ROCK;

                    const tutBox = document.getElementById('tutorial-box');
                    tutBox.classList.add('show');
                    state.gameStarted = false;
                } else {
                    showMessage("LEVEL UP!");
                }
            }
        }

        // 💬 13. POP-UP MESSAGES
        // Shows words on the screen quickly, like "LEVEL UP!" or "WILDCARD!"
        function showMessage(txt) {
            messageBox.innerText = txt;
            messageBox.style.opacity = "1";
            setTimeout(() => messageBox.style.opacity = "0", 1200);
        }

        // 🏁 14. GAME OVER
        // Oh no! You ran out of moves. This shows the game over screen.
        function endGame() {
            document.getElementById('overlay-title').innerText = "GAME OVER";
            startBtn.innerText = "RESTART";
            overlay.style.display = "flex";
        }

        // 👇 15. PLAYER CONTROLS (MOUSE AND TOUCH)
        // These next functions figure out exactly where your mouse or finger is
        // so we know which gem you are trying to touch or swipe!
        function getCanvasCoords(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            let x, y;
            if (e.touches && e.touches.length > 0) {
                x = (e.touches[0].clientX - rect.left) * scaleX;
                y = (e.touches[0].clientY - rect.top) * scaleY;
            } else if (e.offsetX !== undefined && e.target === canvas) {
                x = e.offsetX * scaleX;
                y = e.offsetY * scaleY;
            } else {
                x = (e.clientX - rect.left) * scaleX;
                y = (e.clientY - rect.top) * scaleY;
            }
            return { x, y };
        }

        function getCellFromCoords(e) {
            const coords = getCanvasCoords(e);
            const c = Math.floor(coords.x / state.cellSize);
            const r = Math.floor(coords.y / state.cellSize);
            if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) return { r, c };
            return null;
        }

        function onPointerDown(e) {
            if (state.isAnimating || !state.gameStarted) return;
            const cell = getCellFromCoords(e);
            if (cell) {
                state.selected = cell;
                state.dragStart = getCanvasCoords(e);
            }
        }

        function onPointerMove(e) {
            if (!state.dragStart || state.isAnimating) return;

            const currentCoords = getCanvasCoords(e);
            const dx = currentCoords.x - state.dragStart.x;
            const dy = currentCoords.y - state.dragStart.y;
            const threshold = state.cellSize * 0.4;

            if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
                let targetR = state.selected.r;
                let targetC = state.selected.c;

                if (Math.abs(dx) > Math.abs(dy)) {
                    targetC += dx > 0 ? 1 : -1;
                } else {
                    targetR += dy > 0 ? 1 : -1;
                }

                if (targetR >= 0 && targetR < GRID_ROWS && targetC >= 0 && targetC < GRID_COLS) {
                    swapGems(state.selected.r, state.selected.c, targetR, targetC);
                }

                state.dragStart = null;
                state.selected = null;
            }
        }

        function onPointerUp() {
            state.dragStart = null;
        }

        canvas.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); onPointerDown(e); });
        window.addEventListener('touchmove', onPointerMove);
        window.addEventListener('touchend', onPointerUp);

        startBtn.addEventListener('click', () => {
            startBtn.blur();
            if (startBtn.innerText === "CONTINUE") {
                overlay.style.display = "none";
                state.gameStarted = true;
                return;
            }
            state.score = 0; state.moves = 20; state.level = 1; state.goal = 2500;
            state.gameStarted = true;
            scoreEl.innerText = "0"; movesEl.innerText = "20"; levelEl.innerText = "1"; goalEl.innerText = "2500";
            overlay.style.display = "none";
            initGrid();
        });

        document.getElementById('tutorial-ok-btn').addEventListener('click', () => {
            document.getElementById('tutorial-ok-btn').blur();
            document.getElementById('tutorial-box').classList.remove('show');
            state.gameStarted = true;
        });

        // 💡 18. GIVING A HINT
        // This function looks for a match and highlights the gems!
        hintBtn.addEventListener('click', async () => {
            hintBtn.blur();
            if (state.isAnimating || !state.gameStarted) return;
            
            // Look for a possible match
            for (let r = 0; r < GRID_ROWS; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    // Try horizontal swap
                    if (c < GRID_COLS - 1) {
                        let t = state.grid[r][c].type;
                        let p = state.grid[r][c].power;
                        state.grid[r][c].type = state.grid[r][c+1].type;
                        state.grid[r][c].power = state.grid[r][c+1].power;
                        state.grid[r][c+1].type = t;
                        state.grid[r][c+1].power = p;
                        
                        let matches = findMatches();
                        
                        state.grid[r][c+1].type = state.grid[r][c].type;
                        state.grid[r][c+1].power = state.grid[r][c].power;
                        state.grid[r][c].type = t;
                        state.grid[r][c].power = p;
                        
                        if (matches.length > 0) {
                            state.grid[r][c].isHint = true;
                            state.grid[r][c+1].isHint = true;
                            setTimeout(() => {
                                if (state.grid[r] && state.grid[r][c]) state.grid[r][c].isHint = false;
                                if (state.grid[r] && state.grid[r][c+1]) state.grid[r][c+1].isHint = false;
                            }, 1000);
                            return;
                        }
                    }
                    // Try vertical swap
                    if (r < GRID_ROWS - 1) {
                        let t = state.grid[r][c].type;
                        let p = state.grid[r][c].power;
                        state.grid[r][c].type = state.grid[r+1][c].type;
                        state.grid[r][c].power = state.grid[r+1][c].power;
                        state.grid[r+1][c].type = t;
                        state.grid[r+1][c].power = p;
                        
                        let matches = findMatches();
                        
                        state.grid[r+1][c].type = state.grid[r][c].type;
                        state.grid[r+1][c].power = state.grid[r][c].power;
                        state.grid[r][c].type = t;
                        state.grid[r][c].power = p;
                        
                        if (matches.length > 0) {
                            state.grid[r][c].isHint = true;
                            state.grid[r+1][c].isHint = true;
                            setTimeout(() => {
                                if (state.grid[r] && state.grid[r][c]) state.grid[r][c].isHint = false;
                                if (state.grid[r+1] && state.grid[r+1][c]) state.grid[r+1][c].isHint = false;
                            }, 1000);
                            return;
                        }
                    }
                }
            }
            showMessage("NO MOVES!");
        });

        // 💾 19. SAVE AND LOAD CODES
        // Just like old games, this creates a secret string of letters and numbers
        // that remembers what level you are on and your score!
        saveBtn.addEventListener('click', () => {
            saveBtn.blur();
            if (!state.gameStarted) return;
            // We combine the stats with a dash in between
            const secretData = `${state.level}-${state.score}-${state.moves}-${state.goal}`;
            // btoa turns our text into a Base64 "secret code"
            const code = btoa(secretData);
            loadInput.value = code;
            showMessage("CODE COPIED!");
            // Also put it in the clipboard if possible
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(code).catch(err => {});
            }
        });

        loadBtn.addEventListener('click', () => {
            loadBtn.blur();
            const code = loadInput.value.trim();
            if (!code) return;
            try {
                // atob translates the secret code back into our text
                const secretData = atob(code);
                const parts = secretData.split('-');
                if (parts.length === 4) {
                    state.level = parseInt(parts[0]);
                    state.score = parseInt(parts[1]);
                    state.moves = parseInt(parts[2]);
                    state.goal = parseInt(parts[3]);
                    
                    // Update the screen
                    levelEl.innerText = state.level;
                    scoreEl.innerText = state.score;
                    movesEl.innerText = state.moves;
                    goalEl.innerText = state.goal;
                    
                    state.gameStarted = true;
                    overlay.style.display = "none";
                    
                    // Generate a new board for this level
                    initGrid();
                    showMessage("GAME LOADED!");
                    loadInput.value = "";
                } else {
                    showMessage("BAD CODE!");
                }
            } catch (e) {
                showMessage("BAD CODE!");
            }
        });

        window.addEventListener('resize', resize);

        // 🎥 16. THE MOVIE PROJECTOR
        // Just like a movie is made of thousands of pictures shown really fast,
        // this function redraws the entire game board 60 times every second 
        // so everything looks like it's moving smoothly!
        function render(time) {
            ctx.clearRect(0, 0, state.width, state.height);
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            for (let i = 0; i <= GRID_COLS; i++) {
                ctx.beginPath(); ctx.moveTo(i * state.cellSize, 0); ctx.lineTo(i * state.cellSize, state.height); ctx.stroke();
            }
            for (let i = 0; i <= GRID_ROWS; i++) {
                ctx.beginPath(); ctx.moveTo(0, i * state.cellSize); ctx.lineTo(state.width, i * state.cellSize); ctx.stroke();
            }

            if (state.grid.length) {
                for (let r = 0; r < GRID_ROWS; r++) {
                    for (let c = 0; c < GRID_COLS; c++) {
                        const g = state.grid[r][c];
                        let s = g.scale;
                        let isSelected = state.selected && state.selected.r === r && state.selected.c === c;
                        let isPulsing = isSelected || g.isHint;
                        if (isPulsing) s *= (1 + Math.sin(time / 100) * 0.15);
                        drawGem(r, c, g.type, g.power, g.offsetX, g.offsetY, s, g.alpha, isPulsing);
                    }
                }
            }

            for (let i = state.particles.length - 1; i >= 0; i--) {
                const p = state.particles[i];
                p.x += p.vx; p.y += p.vy; p.life -= 0.03;
                if (p.life <= 0) state.particles.splice(i, 1);
                else {
                    ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
                    ctx.beginPath(); ctx.arc(p.x, p.y, 4 * p.life, 0, Math.PI * 2); ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
            requestAnimationFrame(render);
        }

        // 🚀 17. START THE ENGINES!
        // When the web page finishes loading, this tells the game to start drawing!
        window.onload = () => { resize(); requestAnimationFrame(render); };
    
