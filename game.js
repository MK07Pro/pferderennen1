// ===============================
// Elemente aus dem DOM holen
// ===============================

// Start-Button
const startBtn = document.getElementById('startBtn');

// Eingabefeld für die Taste
const keyInput = document.getElementById('keyInput');

// Textfeld für Statusmeldungen (Countdown, Sieg, Niederlage)
const statusText = document.getElementById('statusText');

// Spieler-Pferd
const playerHorse = document.getElementById('horse-player');

// KI-Pferde als Array
const aiHorses = [
    document.getElementById('horse-ai1'),
    document.getElementById('horse-ai2'),
    document.getElementById('horse-ai3')
];

// ===============================
// Spielvariablen
// ===============================

let selectedKey = null;
let gameRunning = false;
let positions = { player: 0, ai1: 0, ai2: 0, ai3: 0 };
let gameLoop = null;

// ANPASSUNG: Ziel etwas früher, da die Pferde-Bilder breiter sind und der Bogen Platz braucht
const FINISH_LINE = 88; 

// ===============================
// 1. Taste auswählen
// ===============================

// Reagiert auf Tastendruck im Eingabefeld
keyInput.addEventListener('keydown', (e) => {
    e.preventDefault(); // Verhindert Scrollen (z.B. bei Leertaste)

    // Speichert den Tastencode (technisch eindeutig)
    selectedKey = e.code;

    // Zeigt die gedrückte Taste im Eingabefeld an
    keyInput.value = e.key.toUpperCase();

    // Aktiviert den Start-Button
    startBtn.disabled = false;

    // Statusmeldung
    statusText.innerText = "Bereit? Drücke Start!";
});

// ===============================
// 2. Spiel starten
// ===============================

// Klick auf Start-Button
startBtn.addEventListener('click', () => {
    resetGame();       // Setzt alle Positionen zurück
    startCountdown();  // Startet den Countdown
});

// ===============================
// 3. Countdown-Logik
// ===============================

function startCountdown() {
    // Während des Countdowns keine Eingaben erlauben
    startBtn.disabled = true;
    keyInput.disabled = true;

    // Startwert des Countdowns
    let count = 3;
    statusText.innerText = count;

    // Countdown-Intervall (1 Sekunde)
    const timer = setInterval(() => {
        count--;

        if (count > 0) {
            // Countdown anzeigen
            statusText.innerText = count;
        } else {
            // Countdown beenden
            clearInterval(timer);
            statusText.innerText = "LOS!!! Hämmer die Taste!";
            startGame(); // Spiel starten
        }
    }, 1000);
}

// ===============================
// 4. Spielablauf
// ===============================

function startGame() {
    // Spielstatus aktivieren
    gameRunning = true;

    // KI-Bewegungsschleife
    gameLoop = setInterval(() => {
        if (!gameRunning) return;

        // Jede KI bewegt sich automatisch vorwärts
        moveAI(0, 'ai1');
        moveAI(1, 'ai2');
        moveAI(2, 'ai3');

    }, 100); // KI bewegt sich alle 100 ms
}

// ===============================
// Spieler-Eingabe
// ===============================

// Globaler Listener für Tastendrücke
document.addEventListener('keydown', (e) => {
    // Nur reagieren, wenn das Spiel läuft
    if (!gameRunning) return;
    
    // Prüfen, ob die richtige Taste gedrückt wurde
    if (e.code === selectedKey) {
        // Spieler bewegt sich 2% vorwärts
        positions.player += 2;

        // Position visuell aktualisieren
        updatePosition(playerHorse, positions.player);

        // Sieg prüfen
        checkWin('Spieler');
    }
});

// ===============================
// KI-Bewegung
// ===============================

function moveAI(index, id) {
    // Zufällige Geschwindigkeit zwischen 0.5 und 2.5
    const speed = Math.random() * 2.0 + 0.5;

    // Position der KI erhöhen
    positions[id] += speed;

    // Visuelle Position aktualisieren
    updatePosition(aiHorses[index], positions[id]);

    // Sieg prüfen
    checkWin('KI ' + (index + 1));
}

// ===============================
// Visuelles Update
// ===============================

// Setzt die CSS-left-Position in Prozent
function updatePosition(element, percent) {
    element.style.left = percent + '%';
}

// ===============================
// Siegbedingung prüfen
// ===============================

function checkWin(who) {
    // Prüfen, ob jemand die Ziellinie erreicht hat
    if (positions.player >= FINISH_LINE || 
        positions.ai1 >= FINISH_LINE || 
        positions.ai2 >= FINISH_LINE || 
        positions.ai3 >= FINISH_LINE) {
        
        // Nur der erste Gewinner beendet das Spiel
        if (gameRunning) {
            endGame(who);
        }
    }
}

// ===============================
// Spiel beenden
// ===============================

function endGame(winner) {
    // Spiel stoppen
    gameRunning = false;
    clearInterval(gameLoop);

    // Sieg- oder Niederlagentext anzeigen
    if (winner === 'Spieler') {
        statusText.innerText = "🏆 GEWONNEN! Du bist der Champion! 🏆";
        statusText.style.color = "green";
    } else {
        statusText.innerText = `😢 Verloren! ${winner} war schneller.`;
        statusText.style.color = "red";
    }

    // UI wieder freigeben
    startBtn.disabled = false;
    keyInput.disabled = false;
    startBtn.innerText = "Nochmal spielen";
}

// ===============================
// Spiel zurücksetzen
// ===============================

function resetGame() {
    // Alle Positionen zurücksetzen
    positions = { player: 0, ai1: 0, ai2: 0, ai3: 0 };

    // Pferde visuell zurücksetzen
    updatePosition(playerHorse, 0);
    aiHorses.forEach(h => updatePosition(h, 0));

    // Statusfarbe zurücksetzen
    statusText.style.color = "#d9534f";
}


