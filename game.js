// ... (Obere Variablen bleiben gleich bis "Spielvariablen") ...
const startBtn = document.getElementById('startBtn');
const statusText = document.getElementById('statusText');
const difficultySelect = document.getElementById('difficultySelect');
const multiplayerToggle = document.getElementById('multiplayerToggle');
const keyInput1 = document.getElementById('keyInput1');
const keyInput2 = document.getElementById('keyInput2');
const p2SetupDiv = document.getElementById('p2-setup');

// Pferde Elemente
const horseP1 = document.getElementById('horse-p1');
const horseLane2 = document.getElementById('horse-lane2'); 
const labelLane2 = document.getElementById('label-lane2'); // Falls du Labels im UI hast
const aiHorses = [
    document.getElementById('horse-ai2'),
    document.getElementById('horse-ai3')
];

// Wett & Score
const moneyDisplay = document.getElementById('moneyDisplay');
const betInput = document.getElementById('betInput');
const scoreList = document.getElementById('scoreList');

// Variablen
let keys = { p1: null, p2: null };
let gameRunning = false;
let positions = { p1: 0, lane2: 0, ai2: 0, ai3: 0 };
let gameLoop = null;
let playerMoney = 1000;
let currentBet = 0;

// Konstanten
const FINISH_LINE = 92; // Etwas später, weil das Bild breit ist (Ziellinie im Bild beachten)
const SPEEDS = { easy: 0.4, medium: 0.8, hard: 1.3 };

// --- SETUP (Bleibt gleich) ---
multiplayerToggle.addEventListener('change', () => {
    if (multiplayerToggle.checked) {
        p2SetupDiv.style.display = 'block';
        keyInput2.value = ""; keys.p2 = null; checkReady();
    } else {
        p2SetupDiv.style.display = 'none'; keys.p2 = null; checkReady();
    }
});
keyInput1.addEventListener('keydown', (e) => { e.preventDefault(); keys.p1 = e.code; keyInput1.value = e.key.toUpperCase(); checkReady(); });
keyInput2.addEventListener('keydown', (e) => { e.preventDefault(); if(e.code === keys.p1) return; keys.p2 = e.code; keyInput2.value = e.key.toUpperCase(); checkReady(); });

function checkReady() {
    if (keys.p1 && (!multiplayerToggle.checked || keys.p2)) startBtn.disabled = false;
}

// --- SPIEL START & LOOP ---
startBtn.addEventListener('click', () => {
    let bet = parseInt(betInput.value);
    if (bet > playerMoney || bet < 0) { alert("Ungültiger Einsatz!"); return; }
    currentBet = bet; playerMoney -= currentBet; updateMoneyUI();
    resetGame(); startCountdown();
});

function startCountdown() {
    startBtn.disabled = true;
    let count = 3;
    statusText.innerText = count;
    let timer = setInterval(() => {
        count--;
        if (count > 0) statusText.innerText = count;
        else {
            clearInterval(timer);
            statusText.innerText = "LOS!!!";
            startGame();
        }
    }, 1000);
}

function startGame() {
    gameRunning = true;
    const diff = SPEEDS[difficultySelect.value];
    gameLoop = setInterval(() => {
        if (!gameRunning) return;
        if (!multiplayerToggle.checked) moveAI(horseLane2, 'lane2', diff);
        moveAI(aiHorses[0], 'ai2', diff);
        moveAI(aiHorses[1], 'ai3', diff);
    }, 100); // 100ms Loop
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    if (e.code === keys.p1) {
        positions.p1 += 1.5; // Spieler Geschwindigkeit
        updatePosition(horseP1, positions.p1);
        checkWin('Spieler 1');
    }
    if (multiplayerToggle.checked && e.code === keys.p2) {
        positions.lane2 += 1.5;
        updatePosition(horseLane2, positions.lane2);
        checkWin('Spieler 2');
    }
});

function moveAI(element, id, diffMultiplier) {
    // Zufallsgeschwindigkeit + Schwierigkeit
    const speed = (Math.random() * 1.5 + 0.2) * diffMultiplier;
    positions[id] += speed;
    updatePosition(element, positions[id]);
    
    let name = "KI";
    if (id === 'lane2') name = "Gegner 1";
    if (id === 'ai2') name = "Gegner 2";
    if (id === 'ai3') name = "Gegner 3";
    checkWin(name);
}

// --- HIER IST DIE MAGIE FÜR DEIN BILD ---
function updatePosition(element, percent) {
    // 1. Position aktualisieren (X-Achse)
    // Wir lassen sie bei 2% starten und maximal bis ca 92% laufen
    // Damit sie nicht aus dem Bild fliegen
    let visualPercent = 2 + (percent * 0.9); 
    element.style.left = visualPercent + '%';

    // 2. Größe anpassen (Perspektive "nach vorne")
    // Logik: Bei 0% Fortschritt -> Skalierung 1.0 (Normal)
    //        Bei 100% Fortschritt -> Skalierung 1.3 (30% Größer)
    // Das simuliert, dass sie auf die Kamera/das Ziel zulaufen
    
    let scaleFactor = 1 + (percent / 100 * 0.4); // 0.4 bestimmt wie viel größer sie werden (40%)
    
    element.style.transform = `scale(${scaleFactor})`;
}

function checkWin(winner) {
    if (positions.p1 >= 100 || positions.lane2 >= 100 || positions.ai2 >= 100 || positions.ai3 >= 100) {
        if (gameRunning) endGame(winner);
    }
}

function endGame(winner) {
    gameRunning = false;
    clearInterval(gameLoop);
    if (winner === 'Spieler 1') {
        let win = currentBet * 2; playerMoney += win;
        statusText.innerText = `SIEG! (+${win}$)`;
        statusText.style.color = "gold";
        addToScoreboard(true, `Sieg (+${win}$)`);
    } else {
        statusText.innerText = `Sieger: ${winner}`;
        statusText.style.color = "red";
        addToScoreboard(false, `Verloren gg. ${winner}`);
    }
    updateMoneyUI();
    startBtn.disabled = false;
}

function updateMoneyUI() { moneyDisplay.innerText = playerMoney; }

function addToScoreboard(won, text) {
    let li = document.createElement('li');
    li.innerText = text; li.className = won ? 'win-text' : 'loss-text';
    scoreList.prepend(li);
}

function resetGame() {
    positions = { p1: 0, lane2: 0, ai2: 0, ai3: 0 };
    // Alle zurücksetzen
    [horseP1, horseLane2, aiHorses[0], aiHorses[1]].forEach(h => {
        h.style.left = '2%';
        h.style.transform = 'scale(1)';
    });
    statusText.style.color = "#333";
}
