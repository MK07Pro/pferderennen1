// Elemente
const startBtn = document.getElementById('startBtn');
const statusText = document.getElementById('statusText');
const difficultySelect = document.getElementById('difficultySelect');
const multiplayerToggle = document.getElementById('multiplayerToggle');
const keyInput1 = document.getElementById('keyInput1');
const keyInput2 = document.getElementById('keyInput2');
const p2SetupDiv = document.getElementById('p2-setup');

// Pferde (Wieder 4 Stück)
const horseP1 = document.getElementById('horse-p1');       // Spieler 1 (Vorne)
const horseLane2 = document.getElementById('horse-lane2'); // P2 oder KI 1 (Mitte vorne)

// KI Array enthält wieder beide hinteren Pferde
const aiHorses = [
    document.getElementById('horse-ai2'),                  // KI 2 (Mitte hinten)
    document.getElementById('horse-ai3')                   // KI 3 (Ganz hinten)
];

// Wett & Score
const moneyDisplay = document.getElementById('moneyDisplay');
const betInput = document.getElementById('betInput');
const scoreList = document.getElementById('scoreList');

// Variablen (Positionen für 4 Pferde)
let keys = { p1: null, p2: null };
let gameRunning = false;
// ai3 ist wieder dabei!
let positions = { p1: 0, lane2: 0, ai2: 0, ai3: 0 }; 
let gameLoop = null;
let playerMoney = 1000;
let currentBet = 0;

// Konstanten
const FINISH_LINE = 92; 
const SPEEDS = {
    easy: 0.5,
    medium: 0.9,
    hard: 1.4
};

// --- SETUP ---
multiplayerToggle.addEventListener('change', () => {
    if (multiplayerToggle.checked) {
        p2SetupDiv.style.display = 'block';
        keyInput2.value = ""; keys.p2 = null; checkReady();
    } else {
        p2SetupDiv.style.display = 'none'; keys.p2 = null; checkReady();
    }
});

keyInput1.addEventListener('keydown', (e) => {
    e.preventDefault(); keys.p1 = e.code; keyInput1.value = e.key.toUpperCase(); checkReady();
});

keyInput2.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (e.code === keys.p1) { alert("Andere Taste wählen!"); return; }
    keys.p2 = e.code; keyInput2.value = e.key.toUpperCase(); checkReady();
});

function checkReady() {
    if (keys.p1 && (!multiplayerToggle.checked || keys.p2)) {
        startBtn.disabled = false; statusText.innerText = "Bereit!";
    } else {
        startBtn.disabled = true; statusText.innerText = "Wähle Tasten...";
    }
}

// --- SPIEL LOOP ---
startBtn.addEventListener('click', () => {
    let bet = parseInt(betInput.value);
    if (bet > playerMoney || bet < 0) { alert("Ungültiger Einsatz!"); return; }
    currentBet = bet; playerMoney -= currentBet; updateMoneyUI();
    resetGame(); startCountdown();
});

function startCountdown() {
    startBtn.disabled = true;
    let count = 3; statusText.innerText = count; statusText.style.color = "#e74c3c";
    let timer = setInterval(() => {
        count--;
        if (count > 0) statusText.innerText = count;
        else {
            clearInterval(timer);
            statusText.innerText = "LOS!!!"; statusText.style.color = "#27ae60";
            startGame();
        }
    }, 1000);
}

function startGame() {
    gameRunning = true;
    const diff = SPEEDS[difficultySelect.value];
    gameLoop = setInterval(() => {
        if (!gameRunning) return;

        // KI Logik für Spur 2 (wenn kein P2)
        if (!multiplayerToggle.checked) moveAI(horseLane2, 'lane2', diff);
        
        // KI Logik für die hinteren beiden Pferde
        moveAI(aiHorses[0], 'ai2', diff);
        // Das hier ist neu (wieder da) für das 4. Pferd:
        moveAI(aiHorses[1], 'ai3', diff);

    }, 100);
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    if (e.code === keys.p1) {
        positions.p1 += 1.8; updatePosition(horseP1, positions.p1); checkWin('Spieler 1');
    }
    if (multiplayerToggle.checked && e.code === keys.p2) {
        positions.lane2 += 1.8; updatePosition(horseLane2, positions.lane2); checkWin('Spieler 2');
    }
});

function moveAI(element, id, diffMultiplier) {
    const speed = (Math.random() * 2.0 + 0.3) * diffMultiplier;
    positions[id] += speed;
    updatePosition(element, positions[id]);
    
    let name = "KI";
    if (id === 'lane2') name = "Gegner 1";
    if (id === 'ai2') name = "Gegner 2";
    // Name für das 4. Pferd:
    if (id === 'ai3') name = "Gegner 3";

    checkWin(name);
}

function updatePosition(element, percent) {
    let visualPercent = 2 + (percent * 0.93);
    element.style.left = visualPercent + '%';
    let scaleFactor = 1 + (percent / 100 * 0.3); 
    element.style.transform = `scale(${scaleFactor})`;
}

function checkWin(winnerName) {
    // Prüfen, ob EINES der 4 Pferde gewonnen hat
    if (positions.p1 >= FINISH_LINE || positions.lane2 >= FINISH_LINE || 
        positions.ai2 >= FINISH_LINE || positions.ai3 >= FINISH_LINE) {
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
        statusText.style.color = "white";
        addToScoreboard(false, `Verloren gegen ${winner}`);
    }
    updateMoneyUI();
    startBtn.disabled = false;
}

function updateMoneyUI() { moneyDisplay.innerText = playerMoney; }

function addToScoreboard(won, text) {
    const li = document.createElement('li');
    li.innerText = text; li.className = won ? 'win-text' : 'loss-text';
    scoreList.prepend(li);
    if (scoreList.children.length > 5) scoreList.removeChild(scoreList.lastChild);
}

function resetGame() {
    // Alle 4 Positionen zurücksetzen
    positions = { p1: 0, lane2: 0, ai2: 0, ai3: 0 };
    
    // Alle 4 Pferde-Elemente zurücksetzen
    const allHorses = [horseP1, horseLane2, aiHorses[0], aiHorses[1]];
    allHorses.forEach(h => {
        h.style.left = '2%';
        h.style.transform = 'scale(1)';
    });

    statusText.style.color = "#e74c3c";
}
