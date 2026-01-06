// Elemente
const startBtn = document.getElementById('startBtn');
const statusText = document.getElementById('statusText');
const difficultySelect = document.getElementById('difficultySelect');
const multiplayerToggle = document.getElementById('multiplayerToggle');

// Input Felder
const keyInput1 = document.getElementById('keyInput1');
const keyInput2 = document.getElementById('keyInput2');
const p2SetupDiv = document.getElementById('p2-setup');

// Pferde
const horseP1 = document.getElementById('horse-p1');
const horseLane2 = document.getElementById('horse-lane2'); // Kann KI 1 oder P2 sein
const labelLane2 = document.getElementById('label-lane2');
const aiHorses = [
    document.getElementById('horse-ai2'),
    document.getElementById('horse-ai3')
];

// Wett & Score Elemente
const moneyDisplay = document.getElementById('moneyDisplay');
const betInput = document.getElementById('betInput');
const scoreList = document.getElementById('scoreList');

// Spielvariablen
let keys = { p1: null, p2: null };
let gameRunning = false;
let positions = { p1: 0, lane2: 0, ai2: 0, ai3: 0 };
let gameLoop = null;
let playerMoney = 1000;
let currentBet = 0;

// Konstanten
const FINISH_LINE = 88;
const SPEEDS = {
    easy: 0.5,   // Langsamer
    medium: 0.9, // Normal
    hard: 1.4    // Schnell
};

// --- SETUP LOGIK ---

// 1. Multiplayer Toggle
multiplayerToggle.addEventListener('change', () => {
    if (multiplayerToggle.checked) {
        p2SetupDiv.style.display = 'block';
        labelLane2.innerText = "👤 P2";
        labelLane2.style.color = "#3498db"; // Blau für P2
        keyInput2.value = "";
        keys.p2 = null;
        checkReady();
    } else {
        p2SetupDiv.style.display = 'none';
        labelLane2.innerText = "🤖 KI 1";
        labelLane2.style.color = "white";
        keys.p2 = null; // P2 Key löschen
        checkReady();
    }
});

// 2. Tastenwahl P1
keyInput1.addEventListener('keydown', (e) => {
    e.preventDefault();
    keys.p1 = e.code;
    keyInput1.value = e.key.toUpperCase();
    checkReady();
});

// 3. Tastenwahl P2
keyInput2.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (e.code === keys.p1) {
        alert("Wähle eine andere Taste als Spieler 1!");
        return;
    }
    keys.p2 = e.code;
    keyInput2.value = e.key.toUpperCase();
    checkReady();
});

function checkReady() {
    const isMultiplayer = multiplayerToggle.checked;
    
    // Start button ist aktiv, wenn P1 gewählt hat (und P2, falls MP an ist)
    if (keys.p1 && (!isMultiplayer || keys.p2)) {
        startBtn.disabled = false;
        statusText.innerText = "Bereit zum Start!";
    } else {
        startBtn.disabled = true;
        statusText.innerText = "Wähle die Tasten...";
    }
}

// --- SPIEL LOGIK ---

startBtn.addEventListener('click', () => {
    // Wette prüfen
    const bet = parseInt(betInput.value);
    if (bet > playerMoney) {
        alert("Du hast nicht genug Geld!");
        return;
    }
    if (bet < 0) {
        alert("Ungültiger Einsatz!");
        return;
    }

    // Geld abziehen
    currentBet = bet;
    playerMoney -= currentBet;
    updateMoneyUI();

    resetGame();
    startCountdown();
});

function startCountdown() {
    startBtn.disabled = true;
    difficultySelect.disabled = true;
    multiplayerToggle.disabled = true;
    betInput.disabled = true;
    
    let count = 3;
    statusText.innerText = count;
    statusText.style.color = "#e74c3c";

    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            statusText.innerText = count;
        } else {
            clearInterval(timer);
            statusText.innerText = "LOS!!!";
            statusText.style.color = "#27ae60";
            startGame();
        }
    }, 1000);
}

function startGame() {
    gameRunning = true;
    const isMultiplayer = multiplayerToggle.checked;
    const difficulty = SPEEDS[difficultySelect.value];

    gameLoop = setInterval(() => {
        if (!gameRunning) return;

        // KI Bewegung (Lane 2 nur, wenn KEIN Multiplayer)
        if (!isMultiplayer) {
            moveAI(horseLane2, 'lane2', difficulty);
        }
        
        // Die anderen KIs bewegen sich immer
        moveAI(aiHorses[0], 'ai2', difficulty);
        moveAI(aiHorses[1], 'ai3', difficulty);

    }, 100);
}

// Tastensteuerung (P1 und P2)
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    // Spieler 1
    if (e.code === keys.p1) {
        positions.p1 += 2; // P1 Geschwindigkeit
        updatePosition(horseP1, positions.p1);
        checkWin('Spieler 1');
    }

    // Spieler 2 (Nur wenn MP an ist)
    if (multiplayerToggle.checked && e.code === keys.p2) {
        positions.lane2 += 2; // P2 Geschwindigkeit
        updatePosition(horseLane2, positions.lane2);
        checkWin('Spieler 2');
    }
});

function moveAI(element, id, diffMultiplier) {
    // Basis-Geschwindigkeit * Schwierigkeit
    // Zufall zwischen 0.5 und 2.5 * Multiplier
    const speed = (Math.random() * 2.0 + 0.5) * diffMultiplier;
    positions[id] += speed;
    updatePosition(element, positions[id]);
    
    // Name für KI ermitteln
    let name = "KI";
    if (id === 'lane2') name = "Jona";
    if (id === 'ai2') name = "Joey";
    if (id === 'ai3') name = "Maurice";

    checkWin(name);
}

function updatePosition(element, percent) {
    element.style.left = percent + '%';
}

function checkWin(winnerName) {
    const isMultiplayer = multiplayerToggle.checked;

    if (positions.p1 >= FINISH_LINE || positions.lane2 >= FINISH_LINE || positions.ai2 >= FINISH_LINE || positions.ai3 >= FINISH_LINE) {
        if (gameRunning) {
            endGame(winnerName);
        }
    }
}

function endGame(winner) {
    gameRunning = false;
    clearInterval(gameLoop);

    // Wett-Abrechnung (Nur wenn P1 gewinnt)
    let winAmount = 0;
    if (winner === 'Spieler 1') {
        winAmount = currentBet * 2;
        playerMoney += winAmount;
        statusText.innerText = `🏆 GEWONNEN! (+${winAmount}$)`;
        statusText.style.color = "gold";
        addToScoreboard(true, `Sieg (+${winAmount}$)`);
    } else {
        statusText.innerText = `Verloren! Sieger: ${winner}`;
        statusText.style.color = "white";
        addToScoreboard(false, `Verloren gegen ${winner}`);
    }

    updateMoneyUI();

    // Reset UI
    startBtn.disabled = false;
    startBtn.innerText = "Nächstes Rennen";
    difficultySelect.disabled = false;
    multiplayerToggle.disabled = false;
    betInput.disabled = false;
}

function updateMoneyUI() {
    moneyDisplay.innerText = playerMoney;
}

function addToScoreboard(won, text) {
    // Neues Listenelement erstellen
    const li = document.createElement('li');
    li.innerText = text;
    li.className = won ? 'win-text' : 'loss-text';
    
    // Oben einfügen
    scoreList.prepend(li);

    // Nur die letzten 5 anzeigen
    if (scoreList.children.length > 5) {
        scoreList.removeChild(scoreList.lastChild);
    }
}

function resetGame() {
    positions = { p1: 0, lane2: 0, ai2: 0, ai3: 0 };
    updatePosition(horseP1, 0);
    updatePosition(horseLane2, 0);
    updatePosition(aiHorses[0], 0);
    updatePosition(aiHorses[1], 0);
    statusText.style.color = "#e74c3c";
}

