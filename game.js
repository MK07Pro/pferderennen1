// Elemente holen
const startBtn = document.getElementById('startBtn');
const keyInput = document.getElementById('keyInput');
const statusText = document.getElementById('statusText');
const playerHorse = document.getElementById('horse-player');
const aiHorses = [
    document.getElementById('horse-ai1'),
    document.getElementById('horse-ai2'),
    document.getElementById('horse-ai3')
];

// Spielvariablen
let selectedKey = null;
let gameRunning = false;
let positions = { player: 0, ai1: 0, ai2: 0, ai3: 0 };
let gameLoop = null;
const FINISH_LINE = 90; // Ziel bei 90% der Breite (damit es im Bild bleibt)

// 1. Taste auswählen
keyInput.addEventListener('keydown', (e) => {
    e.preventDefault(); // Verhindert Scrollen bei Leertaste
    selectedKey = e.code; // Speichert den Tastencode (z.B. "Space" oder "KeyA")
    keyInput.value = e.key.toUpperCase();
    startBtn.disabled = false; // Startbutton aktivieren
    statusText.innerText = "Bereit? Drücke Start!";
});

// 2. Spiel starten
startBtn.addEventListener('click', () => {
    resetGame();
    startCountdown();
});

// 3. Countdown Logik
function startCountdown() {
    startBtn.disabled = true;
    keyInput.disabled = true;
    let count = 3;
    statusText.innerText = count;

    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            statusText.innerText = count;
        } else {
            clearInterval(timer);
            statusText.innerText = "LOS!!! Hämmer die Taste!";
            startGame();
        }
    }, 1000);
}

// 4. Spielablauf
function startGame() {
    gameRunning = true;

    // KI Loop: Gegner bewegen sich automatisch
    gameLoop = setInterval(() => {
        if (!gameRunning) return;

        // Jede KI bewegt sich zufällig ein bisschen vorwärts
        moveAI(0, 'ai1');
        moveAI(1, 'ai2');
        moveAI(2, 'ai3');

    }, 100); // Alle 100ms bewegen sich die Gegner
}

// Spieler Input
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    // Prüfen, ob die gewählte Taste gedrückt wurde
    if (e.code === selectedKey) {
        positions.player += 2; // Spieler bewegt sich 2% vorwärts pro Druck
        updatePosition(playerHorse, positions.player);
        checkWin('Spieler');
    }
});

// KI Bewegung
function moveAI(index, id) {
    // Zufällige Geschwindigkeit zwischen 0.5 und 2.5
    const speed = Math.random() * 2.0 + 0.5; 
    positions[id] += speed;
    updatePosition(aiHorses[index], positions[id]);
    checkWin('KI ' + (index + 1));
}

// Visuelles Update
function updatePosition(element, percent) {
    element.style.left = percent + '%';
}

// Siegbedingung prüfen
function checkWin(who) {
    // Wenn jemand über die Ziellinie ist
    if (positions.player >= FINISH_LINE || 
        positions.ai1 >= FINISH_LINE || 
        positions.ai2 >= FINISH_LINE || 
        positions.ai3 >= FINISH_LINE) {
        
        // Nur der Erste löst das Ende aus
        if (gameRunning) {
            endGame(who);
        }
    }
}

function endGame(winner) {
    gameRunning = false;
    clearInterval(gameLoop);
    
    if (winner === 'Spieler') {
        statusText.innerText = "🏆 GEWONNEN! Du bist der Champion! 🏆";
        statusText.style.color = "green";
    } else {
        statusText.innerText = `😢 Verloren! ${winner} war schneller.`;
        statusText.style.color = "red";
    }
    
    startBtn.disabled = false;
    keyInput.disabled = false;
    startBtn.innerText = "Nochmal spielen";
}

function resetGame() {
    positions = { player: 0, ai1: 0, ai2: 0, ai3: 0 };
    updatePosition(playerHorse, 0);
    aiHorses.forEach(h => updatePosition(h, 0));
    statusText.style.color = "#d9534f";
}