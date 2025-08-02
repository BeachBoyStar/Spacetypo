/*
    Typomancer's Ascent - SIMPLIFIED VERSION
    A fast-paced vertical platformer where you overcome obstacles by typing magic words.
*/

// Wait for the DOM to be fully loaded before initializing the game
window.addEventListener('load', function(){
    // --- UI ELEMENTS ---
    const mainMenu = document.getElementById('main-menu');
    const gameOverMenu = document.getElementById('game-over-menu');
    const inGameUI = document.getElementById('in-game-ui');
    const startGameBtn = document.getElementById('start-game-btn');
    const retryBtn = document.getElementById('retry-btn');
    const spellInput = document.getElementById('spell-input');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const finalScoreDisplay = document.getElementById('final-score');

    // --- CANVAS SETUP ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // --- GAME STATE ---
    let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
    let score = 0;
    let level = 1;
    let climbSpeed = 1;
    let obstacles = [];
    let gameRunning = false;

    // --- SIMPLE WORD BANK ---
    const words = [
        'FIRE', 'ICE', 'WIND', 'ROCK', 'BOLT', 'HEAL', 'OPEN',
        'QUAKE', 'STORM', 'FROST', 'BLAZE', 'SMITE', 'GUARD',
        'UNLOCK', 'BANISH', 'QUENCH', 'BRIDGE', 'SILENCE',
        'LEVITATE', 'EXPLODE', 'SHATTER', 'PETRIFY', 'TELEPORT',
        'INFERNO', 'BLIZZARD', 'TEMPEST', 'METEOR', 'PURIFY'
    ];

    // --- PLAYER ---
    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 100,
        width: 50,
        height: 60,
        draw() {
            ctx.fillStyle = '#6a0dad';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Simple hat
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y - 10);
            ctx.lineTo(this.x + 10, this.y + 20);
            ctx.lineTo(this.x + this.width - 10, this.y + 20);
            ctx.closePath();
            ctx.fill();
        }
    };

    // --- FUNCTIONS ---
    function createObstacle() {
        const word = words[Math.floor(Math.random() * words.length)];
        return {
            x: Math.random() * (canvas.width - 150),
            y: -50,
            width: 150,
            height: 50,
            word: word,
            color: getRandomColor(),
            speed: climbSpeed
        };
    }

    function getRandomColor() {
        const colors = ['#FF4500', '#00BFFF', '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function updateObstacles() {
        // Add new obstacles
        if (Math.random() < 0.01 + level * 0.002) {
            obstacles.push(createObstacle());
        }

        // Update existing obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].y += obstacles[i].speed;
            
            // Remove obstacles that went off screen
            if (obstacles[i].y > canvas.height) {
                obstacles.splice(i, 1);
                // Small penalty for missing
                score = Math.max(0, score - 1);
                updateScore();
            }
            
            // Check collision with player
            else if (obstacles[i].y + obstacles[i].height > player.y &&
                     obstacles[i].y < player.y + player.height &&
                     obstacles[i].x + obstacles[i].width > player.x &&
                     obstacles[i].x < player.x + player.width) {
                endGame();
                return;
            }
        }
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px "IM Fell English SC"';
            ctx.textAlign = 'center';
            ctx.fillText(obstacle.word, obstacle.x + obstacle.width / 2, obstacle.y + 30);
        });
    }

    function drawBackground() {
        // Simple scrolling background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Tower walls
        ctx.fillStyle = '#555555';
        for (let i = 0; i < canvas.height; i += 40) {
            const offset = (Date.now() * climbSpeed * 0.1) % 40;
            ctx.fillRect(0, i + offset, 20, 20);
            ctx.fillRect(canvas.width - 20, i + offset, 20, 20);
        }
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
        const newLevel = Math.floor(score / 50) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelDisplay.textContent = `Level: ${level}`;
            climbSpeed += 0.2;
        }
    }

    function gameLoop() {
        if (!gameRunning) return;
        
        // Clear and draw background
        drawBackground();
        
        // Update and draw game objects
        updateObstacles();
        drawObstacles();
        player.draw();
        
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        gameState = 'playing';
        gameRunning = true;
        score = 0;
        level = 1;
        climbSpeed = 1;
        obstacles = [];
        
        // Update UI
        mainMenu.style.display = 'none';
        gameOverMenu.style.display = 'none';
        inGameUI.style.display = 'block';
        updateScore();
        
        spellInput.focus();
        gameLoop();
    }

    function endGame() {
        gameRunning = false;
        gameState = 'gameOver';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'flex';
        finalScoreDisplay.textContent = `Your final score: ${score}`;
    }

    function showMenu() {
        gameRunning = false;
        gameState = 'menu';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'none';
        mainMenu.style.display = 'flex';
    }

    // --- EVENT LISTENERS ---
    startGameBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);

    spellInput.addEventListener('keyup', function(e) {
        if (e.key !== 'Enter' || !gameRunning) return;

        const typedWord = spellInput.value.toUpperCase().trim();
        if (!typedWord) return;

        // Check if word matches any obstacle
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].word === typedWord) {
                obstacles.splice(i, 1);
                score += 10;
                updateScore();
                break;
            }
        }

        spellInput.value = '';
    });

    // --- INITIALIZE ---
    showMenu();
});








/*
    Typomancer's Ascent - SIMPLIFIED VERSION
    A fast-paced vertical platformer where you overcome obstacles by typing magic words.
*/

// Wait for the DOM to be fully loaded before initializing the game
window.addEventListener('load', function(){
    // --- UI ELEMENTS ---
    const mainMenu = document.getElementById('main-menu');
    const gameOverMenu = document.getElementById('game-over-menu');
    const inGameUI = document.getElementById('in-game-ui');
    const startGameBtn = document.getElementById('start-game-btn');
    const retryBtn = document.getElementById('retry-btn');
    const spellInput = document.getElementById('spell-input');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const finalScoreDisplay = document.getElementById('final-score');

    // --- CANVAS SETUP ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // --- GAME STATE ---
    let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
    let score = 0;
    let level = 1;
    let climbSpeed = 1;
    let obstacles = [];
    let gameRunning = false;

    // --- SIMPLE WORD BANK ---
    const words = [
        'FIRE', 'ICE', 'WIND', 'ROCK', 'BOLT', 'HEAL', 'OPEN',
        'QUAKE', 'STORM', 'FROST', 'BLAZE', 'SMITE', 'GUARD',
        'UNLOCK', 'BANISH', 'QUENCH', 'BRIDGE', 'SILENCE',
        'LEVITATE', 'EXPLODE', 'SHATTER', 'PETRIFY', 'TELEPORT',
        'INFERNO', 'BLIZZARD', 'TEMPEST', 'METEOR', 'PURIFY'
    ];

    // --- PLAYER ---
    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 100,
        width: 50,
        height: 60,
        draw() {
            ctx.fillStyle = '#6a0dad';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Simple hat
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y - 10);
            ctx.lineTo(this.x + 10, this.y + 20);
            ctx.lineTo(this.x + this.width - 10, this.y + 20);
            ctx.closePath();
            ctx.fill();
        }
    };

    // --- FUNCTIONS ---
    function createObstacle() {
        const word = words[Math.floor(Math.random() * words.length)];
        return {
            x: Math.random() * (canvas.width - 150),
            y: -50,
            width: 150,
            height: 50,
            word: word,
            color: getRandomColor(),
            speed: climbSpeed
        };
    }

    function getRandomColor() {
        const colors = ['#FF4500', '#00BFFF', '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function updateObstacles() {
        // Add new obstacles
        if (Math.random() < 0.01 + level * 0.002) {
            obstacles.push(createObstacle());
        }

        // Update existing obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].y += obstacles[i].speed;
            
            // Remove obstacles that went off screen
            if (obstacles[i].y > canvas.height) {
                obstacles.splice(i, 1);
                // Small penalty for missing
                score = Math.max(0, score - 1);
                updateScore();
            }
            
            // Check collision with player
            else if (obstacles[i].y + obstacles[i].height > player.y &&
                     obstacles[i].y < player.y + player.height &&
                     obstacles[i].x + obstacles[i].width > player.x &&
                     obstacles[i].x < player.x + player.width) {
                endGame();
                return;
            }
        }
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px "IM Fell English SC"';
            ctx.textAlign = 'center';
            ctx.fillText(obstacle.word, obstacle.x + obstacle.width / 2, obstacle.y + 30);
        });
    }

    function drawBackground() {
        // Simple scrolling background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Tower walls
        ctx.fillStyle = '#555555';
        for (let i = 0; i < canvas.height; i += 40) {
            const offset = (Date.now() * climbSpeed * 0.1) % 40;
            ctx.fillRect(0, i + offset, 20, 20);
            ctx.fillRect(canvas.width - 20, i + offset, 20, 20);
        }
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
        const newLevel = Math.floor(score / 50) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelDisplay.textContent = `Level: ${level}`;
            climbSpeed += 0.2;
        }
    }

    function gameLoop() {
        if (!gameRunning) return;
        
        // Clear and draw background
        drawBackground();
        
        // Update and draw game objects
        updateObstacles();
        drawObstacles();
        player.draw();
        
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        gameState = 'playing';
        gameRunning = true;
        score = 0;
        level = 1;
        climbSpeed = 1;
        obstacles = [];
        
        // Update UI
        mainMenu.style.display = 'none';
        gameOverMenu.style.display = 'none';
        inGameUI.style.display = 'block';
        updateScore();
        
        spellInput.focus();
        gameLoop();
    }

    function endGame() {
        gameRunning = false;
        gameState = 'gameOver';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'flex';
        finalScoreDisplay.textContent = `Your final score: ${score}`;
    }

    function showMenu() {
        gameRunning = false;
        gameState = 'menu';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'none';
        mainMenu.style.display = 'flex';
    }

    // --- EVENT LISTENERS ---
    startGameBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);

    spellInput.addEventListener('keyup', function(e) {
        if (e.key !== 'Enter' || !gameRunning) return;

        const typedWord = spellInput.value.toUpperCase().trim();
        if (!typedWord) return;

        // Check if word matches any obstacle
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].word === typedWord) {
                obstacles.splice(i, 1);
                score += 10;
                updateScore();
                break;
            }
        }

        spellInput.value = '';
    });

    // --- INITIALIZE ---
    showMenu();
});
/*
    Typomancer's Ascent - SIMPLIFIED VERSION
    A fast-paced vertical platformer where you overcome obstacles by typing magic words.
*/

// Wait for the DOM to be fully loaded before initializing the game
window.addEventListener('load', function(){
    // --- UI ELEMENTS ---
    const mainMenu = document.getElementById('main-menu');
    const gameOverMenu = document.getElementById('game-over-menu');
    const inGameUI = document.getElementById('in-game-ui');
    const startGameBtn = document.getElementById('start-game-btn');
    const retryBtn = document.getElementById('retry-btn');
    const spellInput = document.getElementById('spell-input');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const finalScoreDisplay = document.getElementById('final-score');

    // --- CANVAS SETUP ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // --- GAME STATE ---
    let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
    let score = 0;
    let level = 1;
    let climbSpeed = 1;
    let obstacles = [];
    let gameRunning = false;

    // --- SIMPLE WORD BANK ---
    const words = [
        'FIRE', 'ICE', 'WIND', 'ROCK', 'BOLT', 'HEAL', 'OPEN',
        'QUAKE', 'STORM', 'FROST', 'BLAZE', 'SMITE', 'GUARD',
        'UNLOCK', 'BANISH', 'QUENCH', 'BRIDGE', 'SILENCE',
        'LEVITATE', 'EXPLODE', 'SHATTER', 'PETRIFY', 'TELEPORT',
        'INFERNO', 'BLIZZARD', 'TEMPEST', 'METEOR', 'PURIFY'
    ];

    // --- PLAYER ---
    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 100,
        width: 50,
        height: 60,
        draw() {
            ctx.fillStyle = '#6a0dad';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Simple hat
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y - 10);
            ctx.lineTo(this.x + 10, this.y + 20);
            ctx.lineTo(this.x + this.width - 10, this.y + 20);
            ctx.closePath();
            ctx.fill();
        }
    };

    // --- FUNCTIONS ---
    function createObstacle() {
        const word = words[Math.floor(Math.random() * words.length)];
        return {
            x: Math.random() * (canvas.width - 150),
            y: -50,
            width: 150,
            height: 50,
            word: word,
            color: getRandomColor(),
            speed: climbSpeed
        };
    }

    function getRandomColor() {
        const colors = ['#FF4500', '#00BFFF', '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function updateObstacles() {
        // Add new obstacles
        if (Math.random() < 0.01 + level * 0.002) {
            obstacles.push(createObstacle());
        }

        // Update existing obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].y += obstacles[i].speed;
            
            // Remove obstacles that went off screen
            if (obstacles[i].y > canvas.height) {
                obstacles.splice(i, 1);
                // Small penalty for missing
                score = Math.max(0, score - 1);
                updateScore();
            }
            
            // Check collision with player
            else if (obstacles[i].y + obstacles[i].height > player.y &&
                     obstacles[i].y < player.y + player.height &&
                     obstacles[i].x + obstacles[i].width > player.x &&
                     obstacles[i].x < player.x + player.width) {
                endGame();
                return;
            }
        }
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px "IM Fell English SC"';
            ctx.textAlign = 'center';
            ctx.fillText(obstacle.word, obstacle.x + obstacle.width / 2, obstacle.y + 30);
        });
    }

    function drawBackground() {
        // Simple scrolling background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Tower walls
        ctx.fillStyle = '#555555';
        for (let i = 0; i < canvas.height; i += 40) {
            const offset = (Date.now() * climbSpeed * 0.1) % 40;
            ctx.fillRect(0, i + offset, 20, 20);
            ctx.fillRect(canvas.width - 20, i + offset, 20, 20);
        }
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
        const newLevel = Math.floor(score / 50) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelDisplay.textContent = `Level: ${level}`;
            climbSpeed += 0.2;
        }
    }

    function gameLoop() {
        if (!gameRunning) return;
        
        // Clear and draw background
        drawBackground();
        
        // Update and draw game objects
        updateObstacles();
        drawObstacles();
        player.draw();
        
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        gameState = 'playing';
        gameRunning = true;
        score = 0;
        level = 1;
        climbSpeed = 1;
        obstacles = [];
        
        // Update UI
        mainMenu.style.display = 'none';
        gameOverMenu.style.display = 'none';
        inGameUI.style.display = 'block';
        updateScore();
        
        spellInput.focus();
        gameLoop();
    }

    function endGame() {
        gameRunning = false;
        gameState = 'gameOver';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'flex';
        finalScoreDisplay.textContent = `Your final score: ${score}`;
    }

    function showMenu() {
        gameRunning = false;
        gameState = 'menu';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'none';
        mainMenu.style.display = 'flex';
    }

    // --- EVENT LISTENERS ---
    startGameBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);

    spellInput.addEventListener('keyup', function(e) {
        if (e.key !== 'Enter' || !gameRunning) return;

        const typedWord = spellInput.value.toUpperCase().trim();
        if (!typedWord) return;

        // Check if word matches any obstacle
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].word === typedWord) {
                obstacles.splice(i, 1);
                score += 10;
                updateScore();
                break;
            }
        }

        spellInput.value = '';
    });

    // --- INITIALIZE ---
    showMenu();
});
/*
    Typomancer's Ascent - SIMPLIFIED VERSION
    A fast-paced vertical platformer where you overcome obstacles by typing magic words.
*/

// Wait for the DOM to be fully loaded before initializing the game
window.addEventListener('load', function(){
    // --- UI ELEMENTS ---
    const mainMenu = document.getElementById('main-menu');
    const gameOverMenu = document.getElementById('game-over-menu');
    const inGameUI = document.getElementById('in-game-ui');
    const startGameBtn = document.getElementById('start-game-btn');
    const retryBtn = document.getElementById('retry-btn');
    const spellInput = document.getElementById('spell-input');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const finalScoreDisplay = document.getElementById('final-score');

    // --- CANVAS SETUP ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // --- GAME STATE ---
    let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
    let score = 0;
    let level = 1;
    let climbSpeed = 1;
    let obstacles = [];
    let gameRunning = false;

    // --- SIMPLE WORD BANK ---
    const words = [
        'FIRE', 'ICE', 'WIND', 'ROCK', 'BOLT', 'HEAL', 'OPEN',
        'QUAKE', 'STORM', 'FROST', 'BLAZE', 'SMITE', 'GUARD',
        'UNLOCK', 'BANISH', 'QUENCH', 'BRIDGE', 'SILENCE',
        'LEVITATE', 'EXPLODE', 'SHATTER', 'PETRIFY', 'TELEPORT',
        'INFERNO', 'BLIZZARD', 'TEMPEST', 'METEOR', 'PURIFY'
    ];

    // --- PLAYER ---
    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 100,
        width: 50,
        height: 60,
        draw() {
            ctx.fillStyle = '#6a0dad';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Simple hat
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y - 10);
            ctx.lineTo(this.x + 10, this.y + 20);
            ctx.lineTo(this.x + this.width - 10, this.y + 20);
            ctx.closePath();
            ctx.fill();
        }
    };

    // --- FUNCTIONS ---
    function createObstacle() {
        const word = words[Math.floor(Math.random() * words.length)];
        return {
            x: Math.random() * (canvas.width - 150),
            y: -50,
            width: 150,
            height: 50,
            word: word,
            color: getRandomColor(),
            speed: climbSpeed
        };
    }

    function getRandomColor() {
        const colors = ['#FF4500', '#00BFFF', '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function updateObstacles() {
        // Add new obstacles
        if (Math.random() < 0.01 + level * 0.002) {
            obstacles.push(createObstacle());
        }

        // Update existing obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].y += obstacles[i].speed;
            
            // Remove obstacles that went off screen
            if (obstacles[i].y > canvas.height) {
                obstacles.splice(i, 1);
                // Small penalty for missing
                score = Math.max(0, score - 1);
                updateScore();
            }
            
            // Check collision with player
            else if (obstacles[i].y + obstacles[i].height > player.y &&
                     obstacles[i].y < player.y + player.height &&
                     obstacles[i].x + obstacles[i].width > player.x &&
                     obstacles[i].x < player.x + player.width) {
                endGame();
                return;
            }
        }
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px "IM Fell English SC"';
            ctx.textAlign = 'center';
            ctx.fillText(obstacle.word, obstacle.x + obstacle.width / 2, obstacle.y + 30);
        });
    }

    function drawBackground() {
        // Simple scrolling background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Tower walls
        ctx.fillStyle = '#555555';
        for (let i = 0; i < canvas.height; i += 40) {
            const offset = (Date.now() * climbSpeed * 0.1) % 40;
            ctx.fillRect(0, i + offset, 20, 20);
            ctx.fillRect(canvas.width - 20, i + offset, 20, 20);
        }
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
        const newLevel = Math.floor(score / 50) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelDisplay.textContent = `Level: ${level}`;
            climbSpeed += 0.2;
        }
    }

    function gameLoop() {
        if (!gameRunning) return;
        
        // Clear and draw background
        drawBackground();
        
        // Update and draw game objects
        updateObstacles();
        drawObstacles();
        player.draw();
        
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        gameState = 'playing';
        gameRunning = true;
        score = 0;
        level = 1;
        climbSpeed = 1;
        obstacles = [];
        
        // Update UI
        mainMenu.style.display = 'none';
        gameOverMenu.style.display = 'none';
        inGameUI.style.display = 'block';
        updateScore();
        
        spellInput.focus();
        gameLoop();
    }

    function endGame() {
        gameRunning = false;
        gameState = 'gameOver';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'flex';
        finalScoreDisplay.textContent = `Your final score: ${score}`;
    }

    function showMenu() {
        gameRunning = false;
        gameState = 'menu';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'none';
        mainMenu.style.display = 'flex';
    }

    // --- EVENT LISTENERS ---
    startGameBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);

    spellInput.addEventListener('keyup', function(e) {
        if (e.key !== 'Enter' || !gameRunning) return;

        const typedWord = spellInput.value.toUpperCase().trim();
        if (!typedWord) return;

        // Check if word matches any obstacle
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].word === typedWord) {
                obstacles.splice(i, 1);
                score += 10;
                updateScore();
                break;
            }
        }

        spellInput.value = '';
    });

    // --- INITIALIZE ---
    showMenu();
});
/*
    Typomancer's Ascent - SIMPLIFIED VERSION
    A fast-paced vertical platformer where you overcome obstacles by typing magic words.
*/

// Wait for the DOM to be fully loaded before initializing the game
window.addEventListener('load', function(){
    // --- UI ELEMENTS ---
    const mainMenu = document.getElementById('main-menu');
    const gameOverMenu = document.getElementById('game-over-menu');
    const inGameUI = document.getElementById('in-game-ui');
    const startGameBtn = document.getElementById('start-game-btn');
    const retryBtn = document.getElementById('retry-btn');
    const spellInput = document.getElementById('spell-input');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const finalScoreDisplay = document.getElementById('final-score');

    // --- CANVAS SETUP ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // --- GAME STATE ---
    let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
    let score = 0;
    let level = 1;
    let climbSpeed = 1;
    let obstacles = [];
    let gameRunning = false;

    // --- SIMPLE WORD BANK ---
    const words = [
        'FIRE', 'ICE', 'WIND', 'ROCK', 'BOLT', 'HEAL', 'OPEN',
        'QUAKE', 'STORM', 'FROST', 'BLAZE', 'SMITE', 'GUARD',
        'UNLOCK', 'BANISH', 'QUENCH', 'BRIDGE', 'SILENCE',
        'LEVITATE', 'EXPLODE', 'SHATTER', 'PETRIFY', 'TELEPORT',
        'INFERNO', 'BLIZZARD', 'TEMPEST', 'METEOR', 'PURIFY'
    ];

    // --- PLAYER ---
    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 100,
        width: 50,
        height: 60,
        draw() {
            ctx.fillStyle = '#6a0dad';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Simple hat
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y - 10);
            ctx.lineTo(this.x + 10, this.y + 20);
            ctx.lineTo(this.x + this.width - 10, this.y + 20);
            ctx.closePath();
            ctx.fill();
        }
    };

    // --- FUNCTIONS ---
    function createObstacle() {
        const word = words[Math.floor(Math.random() * words.length)];
        return {
            x: Math.random() * (canvas.width - 150),
            y: -50,
            width: 150,
            height: 50,
            word: word,
            color: getRandomColor(),
            speed: climbSpeed
        };
    }

    function getRandomColor() {
        const colors = ['#FF4500', '#00BFFF', '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function updateObstacles() {
        // Add new obstacles
        if (Math.random() < 0.01 + level * 0.002) {
            obstacles.push(createObstacle());
        }

        // Update existing obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].y += obstacles[i].speed;
            
            // Remove obstacles that went off screen
            if (obstacles[i].y > canvas.height) {
                obstacles.splice(i, 1);
                // Small penalty for missing
                score = Math.max(0, score - 1);
                updateScore();
            }
            
            // Check collision with player
            else if (obstacles[i].y + obstacles[i].height > player.y &&
                     obstacles[i].y < player.y + player.height &&
                     obstacles[i].x + obstacles[i].width > player.x &&
                     obstacles[i].x < player.x + player.width) {
                endGame();
                return;
            }
        }
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px "IM Fell English SC"';
            ctx.textAlign = 'center';
            ctx.fillText(obstacle.word, obstacle.x + obstacle.width / 2, obstacle.y + 30);
        });
    }

    function drawBackground() {
        // Simple scrolling background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Tower walls
        ctx.fillStyle = '#555555';
        for (let i = 0; i < canvas.height; i += 40) {
            const offset = (Date.now() * climbSpeed * 0.1) % 40;
            ctx.fillRect(0, i + offset, 20, 20);
            ctx.fillRect(canvas.width - 20, i + offset, 20, 20);
        }
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
        const newLevel = Math.floor(score / 50) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelDisplay.textContent = `Level: ${level}`;
            climbSpeed += 0.2;
        }
    }

    function gameLoop() {
        if (!gameRunning) return;
        
        // Clear and draw background
        drawBackground();
        
        // Update and draw game objects
        updateObstacles();
        drawObstacles();
        player.draw();
        
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        gameState = 'playing';
        gameRunning = true;
        score = 0;
        level = 1;
        climbSpeed = 1;
        obstacles = [];
        
        // Update UI
        mainMenu.style.display = 'none';
        gameOverMenu.style.display = 'none';
        inGameUI.style.display = 'block';
        updateScore();
        
        spellInput.focus();
        gameLoop();
    }

    function endGame() {
        gameRunning = false;
        gameState = 'gameOver';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'flex';
        finalScoreDisplay.textContent = `Your final score: ${score}`;
    }

    function showMenu() {
        gameRunning = false;
        gameState = 'menu';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'none';
        mainMenu.style.display = 'flex';
    }

    // --- EVENT LISTENERS ---
    startGameBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);

    spellInput.addEventListener('keyup', function(e) {
        if (e.key !== 'Enter' || !gameRunning) return;

        const typedWord = spellInput.value.toUpperCase().trim();
        if (!typedWord) return;

        // Check if word matches any obstacle
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].word === typedWord) {
                obstacles.splice(i, 1);
                score += 10;
                updateScore();
                break;
            }
        }

        spellInput.value = '';
    });

    // --- INITIALIZE ---
    showMenu();
});
/*
    Typomancer's Ascent - SIMPLIFIED VERSION
    A fast-paced vertical platformer where you overcome obstacles by typing magic words.
*/

// Wait for the DOM to be fully loaded before initializing the game
window.addEventListener('load', function(){
    // --- UI ELEMENTS ---
    const mainMenu = document.getElementById('main-menu');
    const gameOverMenu = document.getElementById('game-over-menu');
    const inGameUI = document.getElementById('in-game-ui');
    const startGameBtn = document.getElementById('start-game-btn');
    const retryBtn = document.getElementById('retry-btn');
    const spellInput = document.getElementById('spell-input');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const finalScoreDisplay = document.getElementById('final-score');

    // --- CANVAS SETUP ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // --- GAME STATE ---
    let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
    let score = 0;
    let level = 1;
    let climbSpeed = 1;
    let obstacles = [];
    let gameRunning = false;

    // --- SIMPLE WORD BANK ---
    const words = [
        'FIRE', 'ICE', 'WIND', 'ROCK', 'BOLT', 'HEAL', 'OPEN',
        'QUAKE', 'STORM', 'FROST', 'BLAZE', 'SMITE', 'GUARD',
        'UNLOCK', 'BANISH', 'QUENCH', 'BRIDGE', 'SILENCE',
        'LEVITATE', 'EXPLODE', 'SHATTER', 'PETRIFY', 'TELEPORT',
        'INFERNO', 'BLIZZARD', 'TEMPEST', 'METEOR', 'PURIFY'
    ];

    // --- PLAYER ---
    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 100,
        width: 50,
        height: 60,
        draw() {
            ctx.fillStyle = '#6a0dad';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Simple hat
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y - 10);
            ctx.lineTo(this.x + 10, this.y + 20);
            ctx.lineTo(this.x + this.width - 10, this.y + 20);
            ctx.closePath();
            ctx.fill();
        }
    };

    // --- FUNCTIONS ---
    function createObstacle() {
        const word = words[Math.floor(Math.random() * words.length)];
        return {
            x: Math.random() * (canvas.width - 150),
            y: -50,
            width: 150,
            height: 50,
            word: word,
            color: getRandomColor(),
            speed: climbSpeed
        };
    }

    function getRandomColor() {
        const colors = ['#FF4500', '#00BFFF', '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function updateObstacles() {
        // Add new obstacles
        if (Math.random() < 0.01 + level * 0.002) {
            obstacles.push(createObstacle());
        }

        // Update existing obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].y += obstacles[i].speed;
            
            // Remove obstacles that went off screen
            if (obstacles[i].y > canvas.height) {
                obstacles.splice(i, 1);
                // Small penalty for missing
                score = Math.max(0, score - 1);
                updateScore();
            }
            
            // Check collision with player
            else if (obstacles[i].y + obstacles[i].height > player.y &&
                     obstacles[i].y < player.y + player.height &&
                     obstacles[i].x + obstacles[i].width > player.x &&
                     obstacles[i].x < player.x + player.width) {
                endGame();
                return;
            }
        }
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px "IM Fell English SC"';
            ctx.textAlign = 'center';
            ctx.fillText(obstacle.word, obstacle.x + obstacle.width / 2, obstacle.y + 30);
        });
    }

    function drawBackground() {
        // Simple scrolling background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Tower walls
        ctx.fillStyle = '#555555';
        for (let i = 0; i < canvas.height; i += 40) {
            const offset = (Date.now() * climbSpeed * 0.1) % 40;
            ctx.fillRect(0, i + offset, 20, 20);
            ctx.fillRect(canvas.width - 20, i + offset, 20, 20);
        }
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
        const newLevel = Math.floor(score / 50) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelDisplay.textContent = `Level: ${level}`;
            climbSpeed += 0.2;
        }
    }

    function gameLoop() {
        if (!gameRunning) return;
        
        // Clear and draw background
        drawBackground();
        
        // Update and draw game objects
        updateObstacles();
        drawObstacles();
        player.draw();
        
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        gameState = 'playing';
        gameRunning = true;
        score = 0;
        level = 1;
        climbSpeed = 1;
        obstacles = [];
        
        // Update UI
        mainMenu.style.display = 'none';
        gameOverMenu.style.display = 'none';
        inGameUI.style.display = 'block';
        updateScore();
        
        spellInput.focus();
        gameLoop();
    }

    function endGame() {
        gameRunning = false;
        gameState = 'gameOver';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'flex';
        finalScoreDisplay.textContent = `Your final score: ${score}`;
    }

    function showMenu() {
        gameRunning = false;
        gameState = 'menu';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'none';
        mainMenu.style.display = 'flex';
    }

    // --- EVENT LISTENERS ---
    startGameBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);

    spellInput.addEventListener('keyup', function(e) {
        if (e.key !== 'Enter' || !gameRunning) return;

        const typedWord = spellInput.value.toUpperCase().trim();
        if (!typedWord) return;

        // Check if word matches any obstacle
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].word === typedWord) {
                obstacles.splice(i, 1);
                score += 10;
                updateScore();
                break;
            }
        }

        spellInput.value = '';
    });

    // --- INITIALIZE ---
    showMenu();
});
/*
    Typomancer's Ascent - SIMPLIFIED VERSION
    A fast-paced vertical platformer where you overcome obstacles by typing magic words.
*/

// Wait for the DOM to be fully loaded before initializing the game
window.addEventListener('load', function(){
    // --- UI ELEMENTS ---
    const mainMenu = document.getElementById('main-menu');
    const gameOverMenu = document.getElementById('game-over-menu');
    const inGameUI = document.getElementById('in-game-ui');
    const startGameBtn = document.getElementById('start-game-btn');
    const retryBtn = document.getElementById('retry-btn');
    const spellInput = document.getElementById('spell-input');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const finalScoreDisplay = document.getElementById('final-score');

    // --- CANVAS SETUP ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // --- GAME STATE ---
    let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
    let score = 0;
    let level = 1;
    let climbSpeed = 1;
    let obstacles = [];
    let gameRunning = false;

    // --- SIMPLE WORD BANK ---
    const words = [
        'FIRE', 'ICE', 'WIND', 'ROCK', 'BOLT', 'HEAL', 'OPEN',
        'QUAKE', 'STORM', 'FROST', 'BLAZE', 'SMITE', 'GUARD',
        'UNLOCK', 'BANISH', 'QUENCH', 'BRIDGE', 'SILENCE',
        'LEVITATE', 'EXPLODE', 'SHATTER', 'PETRIFY', 'TELEPORT',
        'INFERNO', 'BLIZZARD', 'TEMPEST', 'METEOR', 'PURIFY'
    ];

    // --- PLAYER ---
    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 100,
        width: 50,
        height: 60,
        draw() {
            ctx.fillStyle = '#6a0dad';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Simple hat
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y - 10);
            ctx.lineTo(this.x + 10, this.y + 20);
            ctx.lineTo(this.x + this.width - 10, this.y + 20);
            ctx.closePath();
            ctx.fill();
        }
    };

    // --- FUNCTIONS ---
    function createObstacle() {
        const word = words[Math.floor(Math.random() * words.length)];
        return {
            x: Math.random() * (canvas.width - 150),
            y: -50,
            width: 150,
            height: 50,
            word: word,
            color: getRandomColor(),
            speed: climbSpeed
        };
    }

    function getRandomColor() {
        const colors = ['#FF4500', '#00BFFF', '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function updateObstacles() {
        // Add new obstacles
        if (Math.random() < 0.01 + level * 0.002) {
            obstacles.push(createObstacle());
        }

        // Update existing obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].y += obstacles[i].speed;
            
            // Remove obstacles that went off screen
            if (obstacles[i].y > canvas.height) {
                obstacles.splice(i, 1);
                // Small penalty for missing
                score = Math.max(0, score - 1);
                updateScore();
            }
            
            // Check collision with player
            else if (obstacles[i].y + obstacles[i].height > player.y &&
                     obstacles[i].y < player.y + player.height &&
                     obstacles[i].x + obstacles[i].width > player.x &&
                     obstacles[i].x < player.x + player.width) {
                endGame();
                return;
            }
        }
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px "IM Fell English SC"';
            ctx.textAlign = 'center';
            ctx.fillText(obstacle.word, obstacle.x + obstacle.width / 2, obstacle.y + 30);
        });
    }

    function drawBackground() {
        // Simple scrolling background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Tower walls
        ctx.fillStyle = '#555555';
        for (let i = 0; i < canvas.height; i += 40) {
            const offset = (Date.now() * climbSpeed * 0.1) % 40;
            ctx.fillRect(0, i + offset, 20, 20);
            ctx.fillRect(canvas.width - 20, i + offset, 20, 20);
        }
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
        const newLevel = Math.floor(score / 50) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelDisplay.textContent = `Level: ${level}`;
            climbSpeed += 0.2;
        }
    }

    function gameLoop() {
        if (!gameRunning) return;
        
        // Clear and draw background
        drawBackground();
        
        // Update and draw game objects
        updateObstacles();
        drawObstacles();
        player.draw();
        
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        gameState = 'playing';
        gameRunning = true;
        score = 0;
        level = 1;
        climbSpeed = 1;
        obstacles = [];
        
        // Update UI
        mainMenu.style.display = 'none';
        gameOverMenu.style.display = 'none';
        inGameUI.style.display = 'block';
        updateScore();
        
        spellInput.focus();
        gameLoop();
    }

    function endGame() {
        gameRunning = false;
        gameState = 'gameOver';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'flex';
        finalScoreDisplay.textContent = `Your final score: ${score}`;
    }

    function showMenu() {
        gameRunning = false;
        gameState = 'menu';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'none';
        mainMenu.style.display = 'flex';
    }

    // --- EVENT LISTENERS ---
    startGameBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);

    spellInput.addEventListener('keyup', function(e) {
        if (e.key !== 'Enter' || !gameRunning) return;

        const typedWord = spellInput.value.toUpperCase().trim();
        if (!typedWord) return;

        // Check if word matches any obstacle
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].word === typedWord) {
                obstacles.splice(i, 1);
                score += 10;
                updateScore();
                break;
            }
        }

        spellInput.value = '';
    });

    // --- INITIALIZE ---
    showMenu();
});
/*
    Typomancer's Ascent - SIMPLIFIED VERSION
    A fast-paced vertical platformer where you overcome obstacles by typing magic words.
*/

// Wait for the DOM to be fully loaded before initializing the game
window.addEventListener('load', function(){
    // --- UI ELEMENTS ---
    const mainMenu = document.getElementById('main-menu');
    const gameOverMenu = document.getElementById('game-over-menu');
    const inGameUI = document.getElementById('in-game-ui');
    const startGameBtn = document.getElementById('start-game-btn');
    const retryBtn = document.getElementById('retry-btn');
    const spellInput = document.getElementById('spell-input');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const finalScoreDisplay = document.getElementById('final-score');

    // --- CANVAS SETUP ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // --- GAME STATE ---
    let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
    let score = 0;
    let level = 1;
    let climbSpeed = 1;
    let obstacles = [];
    let gameRunning = false;

    // --- SIMPLE WORD BANK ---
    const words = [
        'FIRE', 'ICE', 'WIND', 'ROCK', 'BOLT', 'HEAL', 'OPEN',
        'QUAKE', 'STORM', 'FROST', 'BLAZE', 'SMITE', 'GUARD',
        'UNLOCK', 'BANISH', 'QUENCH', 'BRIDGE', 'SILENCE',
        'LEVITATE', 'EXPLODE', 'SHATTER', 'PETRIFY', 'TELEPORT',
        'INFERNO', 'BLIZZARD', 'TEMPEST', 'METEOR', 'PURIFY'
    ];

    // --- PLAYER ---
    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 100,
        width: 50,
        height: 60,
        draw() {
            ctx.fillStyle = '#6a0dad';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Simple hat
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y - 10);
            ctx.lineTo(this.x + 10, this.y + 20);
            ctx.lineTo(this.x + this.width - 10, this.y + 20);
            ctx.closePath();
            ctx.fill();
        }
    };

    // --- FUNCTIONS ---
    function createObstacle() {
        const word = words[Math.floor(Math.random() * words.length)];
        return {
            x: Math.random() * (canvas.width - 150),
            y: -50,
            width: 150,
            height: 50,
            word: word,
            color: getRandomColor(),
            speed: climbSpeed
        };
    }

    function getRandomColor() {
        const colors = ['#FF4500', '#00BFFF', '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function updateObstacles() {
        // Add new obstacles
        if (Math.random() < 0.01 + level * 0.002) {
            obstacles.push(createObstacle());
        }

        // Update existing obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].y += obstacles[i].speed;
            
            // Remove obstacles that went off screen
            if (obstacles[i].y > canvas.height) {
                obstacles.splice(i, 1);
                // Small penalty for missing
                score = Math.max(0, score - 1);
                updateScore();
            }
            
            // Check collision with player
            else if (obstacles[i].y + obstacles[i].height > player.y &&
                     obstacles[i].y < player.y + player.height &&
                     obstacles[i].x + obstacles[i].width > player.x &&
                     obstacles[i].x < player.x + player.width) {
                endGame();
                return;
            }
        }
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px "IM Fell English SC"';
            ctx.textAlign = 'center';
            ctx.fillText(obstacle.word, obstacle.x + obstacle.width / 2, obstacle.y + 30);
        });
    }

    function drawBackground() {
        // Simple scrolling background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Tower walls
        ctx.fillStyle = '#555555';
        for (let i = 0; i < canvas.height; i += 40) {
            const offset = (Date.now() * climbSpeed * 0.1) % 40;
            ctx.fillRect(0, i + offset, 20, 20);
            ctx.fillRect(canvas.width - 20, i + offset, 20, 20);
        }
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
        const newLevel = Math.floor(score / 50) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelDisplay.textContent = `Level: ${level}`;
            climbSpeed += 0.2;
        }
    }

    function gameLoop() {
        if (!gameRunning) return;
        
        // Clear and draw background
        drawBackground();
        
        // Update and draw game objects
        updateObstacles();
        drawObstacles();
        player.draw();
        
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        gameState = 'playing';
        gameRunning = true;
        score = 0;
        level = 1;
        climbSpeed = 1;
        obstacles = [];
        
        // Update UI
        mainMenu.style.display = 'none';
        gameOverMenu.style.display = 'none';
        inGameUI.style.display = 'block';
        updateScore();
        
        spellInput.focus();
        gameLoop();
    }

    function endGame() {
        gameRunning = false;
        gameState = 'gameOver';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'flex';
        finalScoreDisplay.textContent = `Your final score: ${score}`;
    }

    function showMenu() {
        gameRunning = false;
        gameState = 'menu';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'none';
        mainMenu.style.display = 'flex';
    }

    // --- EVENT LISTENERS ---
    startGameBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);

    spellInput.addEventListener('keyup', function(e) {
        if (e.key !== 'Enter' || !gameRunning) return;

        const typedWord = spellInput.value.toUpperCase().trim();
        if (!typedWord) return;

        // Check if word matches any obstacle
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].word === typedWord) {
                obstacles.splice(i, 1);
                score += 10;
                updateScore();
                break;
            }
        }

        spellInput.value = '';
    });

    // --- INITIALIZE ---
    showMenu();
});
/*
    Typomancer's Ascent - SIMPLIFIED VERSION
    A fast-paced vertical platformer where you overcome obstacles by typing magic words.
*/

// Wait for the DOM to be fully loaded before initializing the game
window.addEventListener('load', function(){
    // --- UI ELEMENTS ---
    const mainMenu = document.getElementById('main-menu');
    const gameOverMenu = document.getElementById('game-over-menu');
    const inGameUI = document.getElementById('in-game-ui');
    const startGameBtn = document.getElementById('start-game-btn');
    const retryBtn = document.getElementById('retry-btn');
    const spellInput = document.getElementById('spell-input');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const finalScoreDisplay = document.getElementById('final-score');

    // --- CANVAS SETUP ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // --- GAME STATE ---
    let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
    let score = 0;
    let level = 1;
    let climbSpeed = 1;
    let obstacles = [];
    let gameRunning = false;

    // --- SIMPLE WORD BANK ---
    const words = [
        'FIRE', 'ICE', 'WIND', 'ROCK', 'BOLT', 'HEAL', 'OPEN',
        'QUAKE', 'STORM', 'FROST', 'BLAZE', 'SMITE', 'GUARD',
        'UNLOCK', 'BANISH', 'QUENCH', 'BRIDGE', 'SILENCE',
        'LEVITATE', 'EXPLODE', 'SHATTER', 'PETRIFY', 'TELEPORT',
        'INFERNO', 'BLIZZARD', 'TEMPEST', 'METEOR', 'PURIFY'
    ];

    // --- PLAYER ---
    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 100,
        width: 50,
        height: 60,
        draw() {
            ctx.fillStyle = '#6a0dad';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Simple hat
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y - 10);
            ctx.lineTo(this.x + 10, this.y + 20);
            ctx.lineTo(this.x + this.width - 10, this.y + 20);
            ctx.closePath();
            ctx.fill();
        }
    };

    // --- FUNCTIONS ---
    function createObstacle() {
        const word = words[Math.floor(Math.random() * words.length)];
        return {
            x: Math.random() * (canvas.width - 150),
            y: -50,
            width: 150,
            height: 50,
            word: word,
            color: getRandomColor(),
            speed: climbSpeed
        };
    }

    function getRandomColor() {
        const colors = ['#FF4500', '#00BFFF', '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function updateObstacles() {
        // Add new obstacles
        if (Math.random() < 0.01 + level * 0.002) {
            obstacles.push(createObstacle());
        }

        // Update existing obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].y += obstacles[i].speed;
            
            // Remove obstacles that went off screen
            if (obstacles[i].y > canvas.height) {
                obstacles.splice(i, 1);
                // Small penalty for missing
                score = Math.max(0, score - 1);
                updateScore();
            }
            
            // Check collision with player
            else if (obstacles[i].y + obstacles[i].height > player.y &&
                     obstacles[i].y < player.y + player.height &&
                     obstacles[i].x + obstacles[i].width > player.x &&
                     obstacles[i].x < player.x + player.width) {
                endGame();
                return;
            }
        }
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px "IM Fell English SC"';
            ctx.textAlign = 'center';
            ctx.fillText(obstacle.word, obstacle.x + obstacle.width / 2, obstacle.y + 30);
        });
    }

    function drawBackground() {
        // Simple scrolling background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Tower walls
        ctx.fillStyle = '#555555';
        for (let i = 0; i < canvas.height; i += 40) {
            const offset = (Date.now() * climbSpeed * 0.1) % 40;
            ctx.fillRect(0, i + offset, 20, 20);
            ctx.fillRect(canvas.width - 20, i + offset, 20, 20);
        }
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
        const newLevel = Math.floor(score / 50) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelDisplay.textContent = `Level: ${level}`;
            climbSpeed += 0.2;
        }
    }

    function gameLoop() {
        if (!gameRunning) return;
        
        // Clear and draw background
        drawBackground();
        
        // Update and draw game objects
        updateObstacles();
        drawObstacles();
        player.draw();
        
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        gameState = 'playing';
        gameRunning = true;
        score = 0;
        level = 1;
        climbSpeed = 1;
        obstacles = [];
        
        // Update UI
        mainMenu.style.display = 'none';
        gameOverMenu.style.display = 'none';
        inGameUI.style.display = 'block';
        updateScore();
        
        spellInput.focus();
        gameLoop();
    }

    function endGame() {
        gameRunning = false;
        gameState = 'gameOver';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'flex';
        finalScoreDisplay.textContent = `Your final score: ${score}`;
    }

    function showMenu() {
        gameRunning = false;
        gameState = 'menu';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'none';
        mainMenu.style.display = 'flex';
    }

    // --- EVENT LISTENERS ---
    startGameBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);

    spellInput.addEventListener('keyup', function(e) {
        if (e.key !== 'Enter' || !gameRunning) return;

        const typedWord = spellInput.value.toUpperCase().trim();
        if (!typedWord) return;

        // Check if word matches any obstacle
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].word === typedWord) {
                obstacles.splice(i, 1);
                score += 10;
                updateScore();
                break;
            }
        }

        spellInput.value = '';
    });

    // --- INITIALIZE ---
    showMenu();
});
/*
    Typomancer's Ascent - SIMPLIFIED VERSION
    A fast-paced vertical platformer where you overcome obstacles by typing magic words.
*/

// Wait for the DOM to be fully loaded before initializing the game
window.addEventListener('load', function(){
    // --- UI ELEMENTS ---
    const mainMenu = document.getElementById('main-menu');
    const gameOverMenu = document.getElementById('game-over-menu');
    const inGameUI = document.getElementById('in-game-ui');
    const startGameBtn = document.getElementById('start-game-btn');
    const retryBtn = document.getElementById('retry-btn');
    const spellInput = document.getElementById('spell-input');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const finalScoreDisplay = document.getElementById('final-score');

    // --- CANVAS SETUP ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // --- GAME STATE ---
    let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
    let score = 0;
    let level = 1;
    let climbSpeed = 1;
    let obstacles = [];
    let gameRunning = false;

    // --- SIMPLE WORD BANK ---
    const words = [
        'FIRE', 'ICE', 'WIND', 'ROCK', 'BOLT', 'HEAL', 'OPEN',
        'QUAKE', 'STORM', 'FROST', 'BLAZE', 'SMITE', 'GUARD',
        'UNLOCK', 'BANISH', 'QUENCH', 'BRIDGE', 'SILENCE',
        'LEVITATE', 'EXPLODE', 'SHATTER', 'PETRIFY', 'TELEPORT',
        'INFERNO', 'BLIZZARD', 'TEMPEST', 'METEOR', 'PURIFY'
    ];

    // --- PLAYER ---
    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 100,
        width: 50,
        height: 60,
        draw() {
            ctx.fillStyle = '#6a0dad';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Simple hat
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y - 10);
            ctx.lineTo(this.x + 10, this.y + 20);
            ctx.lineTo(this.x + this.width - 10, this.y + 20);
            ctx.closePath();
            ctx.fill();
        }
    };

    // --- FUNCTIONS ---
    function createObstacle() {
        const word = words[Math.floor(Math.random() * words.length)];
        return {
            x: Math.random() * (canvas.width - 150),
            y: -50,
            width: 150,
            height: 50,
            word: word,
            color: getRandomColor(),
            speed: climbSpeed
        };
    }

    function getRandomColor() {
        const colors = ['#FF4500', '#00BFFF', '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function updateObstacles() {
        // Add new obstacles
        if (Math.random() < 0.01 + level * 0.002) {
            obstacles.push(createObstacle());
        }

        // Update existing obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].y += obstacles[i].speed;
            
            // Remove obstacles that went off screen
            if (obstacles[i].y > canvas.height) {
                obstacles.splice(i, 1);
                // Small penalty for missing
                score = Math.max(0, score - 1);
                updateScore();
            }
            
            // Check collision with player
            else if (obstacles[i].y + obstacles[i].height > player.y &&
                     obstacles[i].y < player.y + player.height &&
                     obstacles[i].x + obstacles[i].width > player.x &&
                     obstacles[i].x < player.x + player.width) {
                endGame();
                return;
            }
        }
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px "IM Fell English SC"';
            ctx.textAlign = 'center';
            ctx.fillText(obstacle.word, obstacle.x + obstacle.width / 2, obstacle.y + 30);
        });
    }

    function drawBackground() {
        // Simple scrolling background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Tower walls
        ctx.fillStyle = '#555555';
        for (let i = 0; i < canvas.height; i += 40) {
            const offset = (Date.now() * climbSpeed * 0.1) % 40;
            ctx.fillRect(0, i + offset, 20, 20);
            ctx.fillRect(canvas.width - 20, i + offset, 20, 20);
        }
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
        const newLevel = Math.floor(score / 50) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelDisplay.textContent = `Level: ${level}`;
            climbSpeed += 0.2;
        }
    }

    function gameLoop() {
        if (!gameRunning) return;
        
        // Clear and draw background
        drawBackground();
        
        // Update and draw game objects
        updateObstacles();
        drawObstacles();
        player.draw();
        
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        gameState = 'playing';
        gameRunning = true;
        score = 0;
        level = 1;
        climbSpeed = 1;
        obstacles = [];
        
        // Update UI
        mainMenu.style.display = 'none';
        gameOverMenu.style.display = 'none';
        inGameUI.style.display = 'block';
        updateScore();
        
        spellInput.focus();
        gameLoop();
    }

    function endGame() {
        gameRunning = false;
        gameState = 'gameOver';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'flex';
        finalScoreDisplay.textContent = `Your final score: ${score}`;
    }

    function showMenu() {
        gameRunning = false;
        gameState = 'menu';
        
        inGameUI.style.display = 'none';
        gameOverMenu.style.display = 'none';
        mainMenu.style.display = 'flex';
    }

    // --- EVENT LISTENERS ---
    startGameBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);

    spellInput.addEventListener('keyup', function(e) {
        if (e.key !== 'Enter' || !gameRunning) return;

        const typedWord = spellInput.value.toUpperCase().trim();
        if (!typedWord) return;

        // Check if word matches any obstacle
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].word === typedWord) {
                obstacles.splice(i, 1);
                score += 10;
                updateScore();
                break;
            }
        }

        spellInput.value = '';
    });

    // --- INITIALIZE ---
    showMenu();
});
