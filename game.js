// Elemente abrufen
const startBtn = document.getElementById('startBtn');
const statusText = document.getElementById('statusText');
const difficultySelect = document.getElementById('difficultySelect');
const multiplayerToggle = document.getElementById('multiplayerToggle');

// Input Felder
const keyInput1 = document.getElementById('keyInput1');
const keyInput2 = document.getElementById('keyInput2');
const p2SetupDiv = document.getElementById('p2-setup');

// Pferde (Die IDs müssen mit HTML übereinstimmen)
const horseP1 = document.getElementById('horse-p1');
const horseLane2 = document.getElementById('horse-lane2');
const labelLane2 = document.getElementById('label-lane2'); // (Optional, falls im HTML noch vorhanden)
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
// Da das Bild oft Ränder hat, lassen wir das Ziel bei ca. 92% sein, nicht 100%
const FINISH_LINE = 92; 
const SPEEDS = {
    easy: 0.5,
    medium: 0.9,
    hard: 1.4
};

// --- SETUP LOGIK ---
multiplayerToggle.addEventListener('change', () => {
    if (multiplayerToggle.checked) {
        p2SetupDiv.style.display = 'block';
        keyInput2.value = "";
        keys.p2 = null;
        checkReady();
    } else {
        p2SetupDiv.style.display = 'none';
        keys.p2 = null;
        checkReady();
    }
});

keyInput1.addEventListener('keydown', (e) => {
    e.preventDefault();
    keys.p1 = e.code;
    keyInput1.value = e.key.toUpperCase();
    checkReady();
});

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
    const bet = parseInt(betInput.value);
    if (bet > playerMoney) { alert("Nicht genug Geld!"); return; }
    if (bet < 0) { alert("Ungültiger Einsatz!"); return; }

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

        // KI Logik
        if (!isMultiplayer) {
            moveAI(horseLane2, 'lane2', difficulty);
        }
        moveAI(aiHorses[0], 'ai2', difficulty);
        moveAI(aiHorses[1], 'ai3', difficulty);

    }, 100);
}

// Steuerung
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    if (e.code === keys.p1) {
        positions.p1 += 1.8; // Spieler Speed
        updatePosition(horseP1, positions.p1);
        checkWin('Spieler 1');
    }

    if (multiplayerToggle.checked && e.code === keys.p2) {
        positions.lane2 += 1.8;
        updatePosition(horseLane2, positions.lane2);
        checkWin('Spieler 2');
    }
});

function moveAI(element, id, diffMultiplier) {
    const speed = (Math.random() * 2.0 + 0.3) * diffMultiplier;
    positions[id] += speed;
    updatePosition(element, positions[id]);
    
    let name = "KI";
    if (id === 'lane2') name = "Gegner 1";
    if (id === 'ai2') name = "Gegner 2";
    if (id === 'ai3') name = "Gegner 3";

    checkWin(name);
}

// *** WICHTIG: Die neue Positionierungs-Logik für das Bild ***
function updatePosition(element, percent) {
    // 1. Horizontale Bewegung
    // Wir begrenzen das Pferd etwas, damit es nicht komplett aus dem Bild fliegt
    // Start bei 2%, Ende bei ca 95%
    let visualPercent = 2 + (percent * 0.93);
    element.style.left = visualPercent + '%';

    // 2. Perspektiven-Effekt (Skalierung)
    // Wenn das Pferd nach rechts läuft, kommt es (optisch) näher -> wird größer.
    // Skalierung von 1.0 (Start) bis 1.3 (Ziel)
    let scaleFactor = 1 + (percent / 100 * 0.3); 
    
    element.style.transform = `scale(${scaleFactor})`;
}

function checkWin(winnerName) {
    // Wenn ein Pferd die imaginäre Ziellinie erreicht
    if (positions.p1 >= FINISH_LINE || positions.lane2 >= FINISH_LINE || positions.ai2 >= FINISH_LINE || positions.ai3 >= FINISH_LINE) {
        if (gameRunning) {
            endGame(winnerName);
        }
    }
}

function endGame(winner) {
    gameRunning = false;
    clearInterval(gameLoop);

    let winAmount = 0;
    if (winner === 'Spieler 1') {
        winAmount = currentBet * 2;
        playerMoney += winAmount;
        statusText.innerText = `🏆 GEWONNEN! (+${winAmount}$)`;
        statusText.style.color = "gold";
        addToScoreboard(true, `Sieg (+${winAmount}$)`);
    } else {
        statusText.innerText = `Verloren! Sieger: ${winner}`;
        statusText.style.color = "white"; // Auf weißem Hintergrund dunkelgrau machen? Nein, Container ist weiß, Textbox ist schwarz. Passt.
        addToScoreboard(false, `Verloren gegen ${winner}`);
    }

    updateMoneyUI();

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
    const li = document.createElement('li');
    li.innerText = text;
    li.className = won ? 'win-text' : 'loss-text';
    scoreList.prepend(li);
    if (scoreList.children.length > 5) {
        scoreList.removeChild(scoreList.lastChild);
    }
}

function resetGame() {
    positions = { p1: 0, lane2: 0, ai2: 0, ai3: 0 };
    
    // Pferde auf Start zurücksetzen
    const allHorses = [horseP1, horseLane2, aiHorses[0], aiHorses[1]];
    allHorses.forEach(h => {
        h.style.left = '2%';
        h.style.transform = 'scale(1)';
    });

    statusText.style.color = "#e74c3c";
}
