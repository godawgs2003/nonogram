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
    const solution = currentPuzzle.gridSolution;

    // Generate Row Clues (Left Side)
    for (let r = 0; r < 15; r++) {
        const rowClues = getClueSequence(solution[r]);
        const clueBox = document.createElement('div');
        clueBox.className = 'row-clue-box';
        
        rowClues.forEach(clue => {
            const span = document.createElement('span');
            span.innerText = clue;
            clueBox.appendChild(span);
        });
        rowHeadersContainer.appendChild(clueBox);
    }

    // Generate Column Clues (Top Side)
    for (let c = 0; c < 15; c++) {
        const colArray = [];
        for (let r = 0; r < 15; r++) {
            colArray.push(solution[r][c]);
        }
        const colClues = getClueSequence(colArray);
        const clueBox = document.createElement('div');
        clueBox.className = 'col-clue-box';
        
        colClues.forEach(clue => {
            const span = document.createElement('span');
            span.innerText = clue;
            clueBox.appendChild(span);
        });
        colHeadersContainer.appendChild(clueBox);
    }
}

// Helper tool to count consecutive filled chains
function getClueSequence(arr) {
    const sequence = [];
    let count = 0;
    
    arr.forEach(val => {
        if (val === 1) {
            count++;
        } else if (count > 0) {
            sequence.push(count);
            count = 0;
        }
    });
    if (count > 0) sequence.push(count);
    
    return sequence.length === 0 ? [0] : sequence;
}

// 3. Build Web Board Architecture
function buildInteractiveGrid() {
    boardContainer.innerHTML = '';
    
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;

            cell.addEventListener('click', () => handleCellClick(cell, r, c));
            
            boardContainer.appendChild(cell);
        }
    }
}

// 4. Handle Input Interactions
function handleCellClick(cellDom, r, c) {
    if (activeTool === 'fill') {
        if (playerGrid[r][c] === 1) {
            playerGrid[r][c] = 0; // Toggle off if already filled
            cellDom.classList.remove('filled');
        } else {
            playerGrid[r][c] = 1; // Mark filled
            cellDom.classList.remove('marked-x');
            cellDom.classList.add('filled');
        }
    } else if (activeTool === 'x') {
        if (playerGrid[r][c] === 2) {
            playerGrid[r][c] = 0; // Toggle off if already X
            cellDom.classList.remove('marked-x');
        } else {
            playerGrid[r][c] = 2; // Mark as X boundary
            cellDom.classList.remove('filled');
            cellDom.classList.add('marked-x');
        }
    }
    
    checkVictoryState();
}

// 5. Interface Layout Control Bindings
function setupToolControls() {
    fillToolBtn.addEventListener('click', () => {
        activeTool = 'fill';
        fillToolBtn.classList.add('active-tool');
        xToolBtn.classList.remove('active-tool');
    });

    xToolBtn.addEventListener('click', () => {
        activeTool = 'x';
        xToolBtn.classList.add('active-tool');
        fillToolBtn.classList.remove('active-tool');
    });

    clearBtn.addEventListener('click', () => {
        if (confirm("Reset the whole puzzle grid?")) {
            playerGrid = Array(15).fill(null).map(() => Array(15).fill(0));
            document.querySelectorAll('.cell').forEach(cell => {
                cell.className = 'cell';
            });
        }
    });
}

// 6. Win Conditions Rule Matching
function checkVictoryState() {
    const solution = currentPuzzle.gridSolution;
    
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            const targetFill = solution[r][c] === 1;
            const playerFilled = playerGrid[r][c] === 1;
            
            // If the player filled state doesn't match the required solution map, exit check early
            if (targetFill !== playerFilled) return;
        }
    }
    
    // Quick delay check so the UI has a moment to render the final filled cell
    setTimeout(() => {
        alert(`Congratulations! You solved the "${currentPuzzle.name}" puzzle successfully! 🎉`);
    }, 100);
}

// Run engine initialization when file loads
initGame();