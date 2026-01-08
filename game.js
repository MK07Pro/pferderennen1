// Elemente
const startBtn = document.getElementById('startBtn');              // Start-Button für das Rennen
const statusText = document.getElementById('statusText');          // Textanzeige für Status/Countdown
const difficultySelect = document.getElementById('difficultySelect'); // Dropdown für Schwierigkeitsgrad
const multiplayerToggle = document.getElementById('multiplayerToggle'); // Checkbox für Multiplayer-Modus

// Input Felder
const keyInput1 = document.getElementById('keyInput1');            // Eingabefeld für Taste von Spieler 1
const keyInput2 = document.getElementById('keyInput2');            // Eingabefeld für Taste von Spieler 2
const p2SetupDiv = document.getElementById('p2-setup');            // Bereich für P2-Einstellungen

// Pferde
const horseP1 = document.getElementById('horse-p1');               // Pferd von Spieler 1
const horseLane2 = document.getElementById('horse-lane2');         // Pferd auf Spur 2 (KI oder P2)
const labelLane2 = document.getElementById('label-lane2');         // Label für Spur 2 (KI/P2)
const aiHorses = [
    document.getElementById('horse-ai2'),                          // KI-Pferd 2
    document.getElementById('horse-ai3')                           // KI-Pferd 3
];

// Wett & Score Elemente
const moneyDisplay = document.getElementById('moneyDisplay');      // Anzeige des Spielergelds
const betInput = document.getElementById('betInput');              // Eingabefeld für Wetteinsatz
const scoreList = document.getElementById('scoreList');            // Liste der letzten Ergebnisse

// Spielvariablen
let keys = { p1: null, p2: null };                                 // Speichert die Tasten für P1 und P2
let gameRunning = false;                                           // Gibt an, ob das Rennen läuft
let positions = { p1: 0, lane2: 0, ai2: 0, ai3: 0 };               // Fortschritt aller Pferde in %
let gameLoop = null;                                               // Intervall für das Rennen
let playerMoney = 1000;                                            // Startgeld des Spielers
let currentBet = 0;                                                // Aktueller Einsatz

// Konstanten
const FINISH_LINE = 88;                                            // Ziel-Linie in Prozent
const SPEEDS = {
    easy: 0.5,   // Langsamer KI-Multiplikator
    medium: 0.9, // Normaler KI-Multiplikator
    hard: 1.4    // Schneller KI-Multiplikator
};

// --- SETUP LOGIK ---

// 1. Multiplayer Toggle
multiplayerToggle.addEventListener('change', () => {
    if (multiplayerToggle.checked) {                               // Wenn Multiplayer aktiviert wurde
        p2SetupDiv.style.display = 'block';                        // P2-Einstellungen anzeigen
        labelLane2.innerText = "👤 P2";                            // Label auf P2 ändern
        labelLane2.style.color = "#3498db";                        // Farbe für P2
        keyInput2.value = "";                                      // Eingabe zurücksetzen
        keys.p2 = null;                                            // P2-Taste löschen
        checkReady();                                              // Prüfen, ob Start möglich ist
    } else {
        p2SetupDiv.style.display = 'none';                         // P2-Einstellungen ausblenden
        labelLane2.innerText = "🤖 KI 1";                          // Label auf KI ändern
        labelLane2.style.color = "white";                          // Standardfarbe
        keys.p2 = null;                                            // P2-Taste löschen
        checkReady();                                              // Startbereitschaft prüfen
    }
});

// 2. Tastenwahl P1
keyInput1.addEventListener('keydown', (e) => {
    e.preventDefault();                                            // Verhindert, dass die Taste im Feld erscheint
    keys.p1 = e.code;                                              // Speichert den Tastencode
    keyInput1.value = e.key.toUpperCase();                         // Zeigt die Taste im Feld an
    checkReady();                                                  // Startbereitschaft prüfen
});

// 3. Tastenwahl P2
keyInput2.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (e.code === keys.p1) {                                      // Verhindert gleiche Taste wie P1
        alert("Wähle eine andere Taste als Spieler 1!");
        return;
    }
    keys.p2 = e.code;                                              // Speichert P2-Taste
    keyInput2.value = e.key.toUpperCase();                         // Zeigt Taste an
    checkReady();                                                  // Startbereitschaft prüfen
});

function checkReady() {
    const isMultiplayer = multiplayerToggle.checked;
    
    // Startbutton aktiv, wenn P1 eine Taste hat und (falls MP) auch P2
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
    if (bet > playerMoney) {                                       // Einsatz > Geld
        alert("Du hast nicht genug Geld!");
        return;
    }
    if (bet < 0) {                                                 // Negativer Einsatz
        alert("Ungültiger Einsatz!");
        return;
    }

    // Geld abziehen
    currentBet = bet;
    playerMoney -= currentBet;
    updateMoneyUI();

    resetGame();                                                   // Pferde zurücksetzen
    startCountdown();                                              // Countdown starten
});

function startCountdown() {
    startBtn.disabled = true;                                      // UI sperren
    difficultySelect.disabled = true;
    multiplayerToggle.disabled = true;
    betInput.disabled = true;
    
    let count = 3;                                                 // Countdown Start
    statusText.innerText = count;
    statusText.style.color = "#e74c3c";                            // Rot

    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            statusText.innerText = count;                          // Countdown anzeigen
        } else {
            clearInterval(timer);                                  // Countdown stoppen
            statusText.innerText = "LOS!!!";                       // Startsignal
            statusText.style.color = "#27ae60";                    // Grün
            startGame();                                           // Rennen starten
        }
    }, 1000);
}

function startGame() {
    gameRunning = true;
    const isMultiplayer = multiplayerToggle.checked;
    const difficulty = SPEEDS[difficultySelect.value];             // KI-Multiplikator

    gameLoop = setInterval(() => {                                 // Hauptspielschleife
        if (!gameRunning) return;

        // KI für Spur 2 nur, wenn kein Multiplayer
        if (!isMultiplayer) {
            moveAI(horseLane2, 'lane2', difficulty);
        }
        
        // Andere KIs bewegen sich immer
        moveAI(aiHorses[0], 'ai2', difficulty);
        moveAI(aiHorses[1], 'ai3', difficulty);

    }, 100);                                                       // Alle 100ms
}

// Tastensteuerung (P1 und P2)
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    // Spieler 1
    if (e.code === keys.p1) {
        positions.p1 += 2;                                         // Geschwindigkeit P1
        updatePosition(horseP1, positions.p1);
        checkWin('Spieler 1');
    }

    // Spieler 2 (nur im Multiplayer)
    if (multiplayerToggle.checked && e.code === keys.p2) {
        positions.lane2 += 2;                                      // Geschwindigkeit P2
        updatePosition(horseLane2, positions.lane2);
        checkWin('Spieler 2');
    }
});

function moveAI(element, id, diffMultiplier) {
    // KI-Geschwindigkeit: Zufall * Schwierigkeitsgrad
    const speed = (Math.random() * 2.0 + 0.5) * diffMultiplier;
    positions[id] += speed;
    updatePosition(element, positions[id]);
    
    // Namen der KIs
    let name = "KI";
    if (id === 'lane2') name = "Jona";
    if (id === 'ai2') name = "Joey";
    if (id === 'ai3') name = "Maurice";

    checkWin(name);                                                // Prüfen, ob KI gewonnen hat
}

function updatePosition(element, percent) {
    element.style.left = percent + '%';                            // Pferd nach links verschieben
}

function checkWin(winnerName) {
    const isMultiplayer = multiplayerToggle.checked;

    // Wenn irgendein Pferd die Ziellinie erreicht
    if (positions.p1 >= FINISH_LINE || positions.lane2 >= FINISH_LINE || positions.ai2 >= FINISH_LINE || positions.ai3 >= FINISH_LINE) {
        if (gameRunning) {
            endGame(winnerName);                                   // Gewinner übergeben
        }
    }
}

function endGame(winner) {
    gameRunning = false;
    clearInterval(gameLoop);                                       // Spielschleife stoppen

    // Wett-Abrechnung (nur P1 kann Geld gewinnen)
    let winAmount = 0;
    if (winner === 'Spieler 1') {
        winAmount = currentBet * 2;                                // Gewinn = doppelter Einsatz
        playerMoney += winAmount;
        statusText.innerText = `🏆 GEWONNEN! (+${winAmount}$)`;    // Gewinnanzeige
        statusText.style.color = "gold";
        addToScoreboard(true, `Sieg (+${winAmount}$)`);            // Scoreboard-Eintrag
    } else {
        statusText.innerText = `Verloren! Sieger: ${winner}`;      // Verlustanzeige
        statusText.style.color = "white";
        addToScoreboard(false, `Verloren gegen ${winner}`);        // Scoreboard-Eintrag
    }

    updateMoneyUI();

    // UI wieder freigeben
    startBtn.disabled = false;
    startBtn.innerText = "Nächstes Rennen";
    difficultySelect.disabled = false;
    multiplayerToggle.disabled = false;
    betInput.disabled = false;
}

function updateMoneyUI() {
    moneyDisplay.innerText = playerMoney;                          // Geldanzeige aktualisieren
}

function addToScoreboard(won, text) {
    const li = document.createElement('li');                       // Neues Listenelement
    li.innerText = text;
    li.className = won ? 'win-text' : 'loss-text';                 // Farbe abhängig vom Ergebnis
    
    scoreList.prepend(li);                                         // Oben einfügen

    // Nur die letzten 5 Einträge behalten
    if (scoreList.children.length > 5) {
        scoreList.removeChild(scoreList.lastChild);
    }
}

function resetGame() {
    positions = { p1: 0, lane2: 0, ai2: 0, ai3: 0 };               // Positionen zurücksetzen
    updatePosition(horseP1, 0);
    updatePosition(horseLane2, 0);
    updatePosition(aiHorses[0], 0);
    updatePosition(aiHorses[1], 0);
    statusText.style.color = "#e74c3c";                            // Statusfarbe zurücksetzen
}



