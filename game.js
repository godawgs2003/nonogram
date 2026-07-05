// game.js
import { nonogramLibrary } from './puzzles.js';

// DOM Elements
const boardContainer = document.getElementById('board');
const colHeadersContainer = document.getElementById('colHeaders');
const rowHeadersContainer = document.getElementById('rowHeaders');
const fillToolBtn = document.getElementById('fillToolBtn');
const xToolBtn = document.getElementById('xToolBtn');
const clearBtn = document.getElementById('clearBtn');

// Game State
let currentPuzzle = nonogramLibrary.normal[0]; // Defaulting to our Smile Emoji
let activeTool = 'fill'; // 'fill' or 'x'
let playerGrid = Array(15).fill(null).map(() => Array(15).fill(0)); // Tracks player inputs: 0=empty, 1=filled, 2=X

// 1. Initialize Game Engine
function initGame() {
    generateClues();
    buildInteractiveGrid();
    setupToolControls();
}

// 2. Compute Clue Tracks (Parsing arrays into puzzle runs)
function generateClues() {
    const solution = currentPuzzle.gridSolution;[cite: 3]

    // Generate Row Clues (Left Side)[cite: 3]
    for (let r = 0; r < 15; r++) {
        const rowClues = getClueSequence(solution[r]);[cite: 3]
        const clueBox = document.createElement('div');[cite: 3]
        clueBox.className = 'row-clue-box';[cite: 3]
        clueBox.style.cursor = 'pointer'; // Visual hint that it's interactive
        
        rowClues.forEach(clue => {
            const span = document.createElement('span');[cite: 3]
            span.innerText = clue;[cite: 3]
            clueBox.appendChild(span);[cite: 3]
        });

        // ADDED: Click handler to X-out empty row squares
        clueBox.addEventListener('click', () => {
            clueBox.classList.toggle('clue-done');
            for (let c = 0; c < 15; c++) {
                if (playerGrid[r][c] === 0) {
                    playerGrid[r][c] = 2; // Update game state to 'X'
                    const cellDom = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    if (cellDom) {
                        cellDom.classList.add('marked-x');
                    }
                }
            }
            checkVictoryState();
        });

        rowHeadersContainer.appendChild(clueBox);[cite: 3]
    }

    // Generate Column Clues (Top Side)[cite: 3]
    for (let c = 0; c < 15; c++) {
        const colArray = [];[cite: 3]
        for (let r = 0; r < 15; r++) {
            colArray.push(solution[r][c]);[cite: 3]
        }
        const colClues = getClueSequence(colArray);[cite: 3]
        const clueBox = document.createElement('div');[cite: 3]
        clueBox.className = 'col-clue-box';[cite: 3]
        clueBox.style.cursor = 'pointer'; // Visual hint that it's interactive
        
        colClues.forEach(clue => {
            const span = document.createElement('span');[cite: 3]
            span.innerText = clue;[cite: 3]
            clueBox.appendChild(span);[cite: 3]
        });

        // ADDED: Click handler to X-out empty column squares
        clueBox.addEventListener('click', () => {
            clueBox.classList.toggle('clue-done');
            for (let r = 0; r < 15; r++) {
                if (playerGrid[r][c] === 0) {
                    playerGrid[r][c] = 2; // Update game state to 'X'
                    const cellDom = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    if (cellDom) {
                        cellDom.classList.add('marked-x');
                    }
                }
            }
            checkVictoryState();
        });

        colHeadersContainer.appendChild(clueBox);[cite: 3]
    }
}

// Helper tool to count consecutive filled chains[cite: 3]
function getClueSequence(arr) {
    const sequence = [];[cite: 3]
    let count = 0;[cite: 3]
    
    arr.forEach(val => {
        if (val === 1) {[cite: 3]
            count++;[cite: 3]
        } else if (count > 0) {[cite: 3]
            sequence.push(count);[cite: 3]
            count = 0;[cite: 3]
        }
    });
    if (count > 0) sequence.push(count);[cite: 3]
    
    return sequence.length === 0 ? [0] : sequence;[cite: 3]
}

// 3. Build Web Board Architecture[cite: 3]
function buildInteractiveGrid() {
    boardContainer.innerHTML = '';[cite: 3]
    
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            const cell = document.createElement('div');[cite: 3]
            cell.className = 'cell';[cite: 3]
            cell.dataset.row = r;[cite: 3]
            cell.dataset.col = c;[cite: 3]

            cell.addEventListener('click', () => handleCellClick(cell, r, c));[cite: 3]
            
            boardContainer.appendChild(cell);[cite: 3]
        }
    }
}

// 4. Handle Input Interactions[cite: 3]
function handleCellClick(cellDom, r, c) {
    if (activeTool === 'fill') {[cite: 3]
        if (playerGrid[r][c] === 1) {[cite: 3]
            playerGrid[r][c] = 0; // Toggle off if already filled[cite: 3]
            cellDom.classList.remove('filled');[cite: 3]
        } else {
            playerGrid[r][c] = 1; // Mark filled[cite: 3]
            cellDom.classList.remove('marked-x');[cite: 3]
            cellDom.classList.add('filled');[cite: 3]
        }
    } else if (activeTool === 'x') {[cite: 3]
        if (playerGrid[r][c] === 2) {[cite: 3]
            playerGrid[r][c] = 0; // Toggle off if already X[cite: 3]
            cellDom.classList.remove('marked-x');[cite: 3]
        } else {
            playerGrid[r][c] = 2; // Mark as X boundary[cite: 3]
            cellDom.classList.remove('filled');[cite: 3]
            cellDom.classList.add('marked-x');[cite: 3]
        }
    }
    
    checkVictoryState();[cite: 3]
}

// 5. Interface Layout Control Bindings[cite: 3]
function setupToolControls() {
    fillToolBtn.addEventListener('click', () => {[cite: 3]
        activeTool = 'fill';[cite: 3]
        fillToolBtn.classList.add('active-tool');[cite: 3]
        xToolBtn.classList.remove('active-tool');[cite: 3]
    });

    xToolBtn.addEventListener('click', () => {[cite: 3]
        activeTool = 'x';[cite: 3]
        xToolBtn.classList.add('active-tool');[cite: 3]
        fillToolBtn.classList.remove('active-tool');[cite: 3]
    });

    clearBtn.addEventListener('click', () => {[cite: 3]
        if (confirm("Reset the whole puzzle grid?")) {[cite: 3]
            playerGrid = Array(15).fill(null).map(() => Array(15).fill(0));[cite: 3]
            document.querySelectorAll('.cell').forEach(cell => {[cite: 3]
                cell.className = 'cell';[cite: 3]
            });
            // Reset clue cross-out styles when board is cleared
            document.querySelectorAll('.col-clue-box, .row-clue-box').forEach(box => {
                box.classList.remove('clue-done');
            });
        }
    });
}

// 6. Win Conditions Rule Matching[cite: 3]
function checkVictoryState() {
    const solution = currentPuzzle.gridSolution;[cite: 3]
    
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            const targetFill = solution[r][c] === 1;[cite: 3]
            const playerFilled = playerGrid[r][c] === 1;[cite: 3]
            
            // If the player filled state doesn't match the required solution map, exit check early[cite: 3]
            if (targetFill !== playerFilled) return;[cite: 3]
        }
    }
    
    // Quick delay check so the UI has a moment to render the final filled cell[cite: 3]
    setTimeout(() => {
        alert(`Congratulations! You solved the "${currentPuzzle.name}" puzzle successfully! 🎉`);[cite: 3]
    }, 100);[cite: 3]
}

// Run engine initialization when file loads[cite: 3]
initGame();[cite: 3]