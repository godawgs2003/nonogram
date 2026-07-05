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
let currentPuzzle = nonogramLibrary.normal[0]; 
let activeTool = 'fill'; 
let playerGrid = Array(15).fill(null).map(() => Array(15).fill(0)); 

// 1. Initialize Game Engine
function initGame() {
    generateClues();
    buildInteractiveGrid();
    setupToolControls();
}

// 2. Compute Clue Tracks
function generateClues() {
    const solution = currentPuzzle.gridSolution;

    // Generate Row Clues
    for (let r = 0; r < 15; r++) {
        const rowClues = getClueSequence(solution[r]);
        const clueBox = document.createElement('div');
        clueBox.className = 'row-clue-box';
        clueBox.style.cursor = 'pointer';
        
        rowClues.forEach(clue => {
            const span = document.createElement('span');
            span.innerText = clue;
            clueBox.appendChild(span);
        });

        // Click handler to X-out empty row squares
        clueBox.addEventListener('click', () => {
            clueBox.classList.toggle('clue-done');
            for (let c = 0; c < 15; c++) {
                if (playerGrid[r][c] === 0) {
                    playerGrid[r][c] = 2; 
                    const cellDom = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    if (cellDom) {
                        cellDom.classList.add('marked-x');
                    }
                }
            }
            checkVictoryState();
        });

        rowHeadersContainer.appendChild(clueBox);
    }

    // Generate Column Clues
    for (let c = 0; c < 15; c++) {
        const colArray = [];
        for (let r = 0; r < 15; r++) {
            colArray.push(solution[r][c]);
        }
        const colClues = getClueSequence(colArray);
        const clueBox = document.createElement('div');
        clueBox.className = 'col-clue-box';
        clueBox.style.cursor = 'pointer';
        
        colClues.forEach(clue => {
            const span = document.createElement('span');
            span.innerText = clue;
            clueBox.appendChild(span);
        });

        // Click handler to X-out empty column squares
        clueBox.addEventListener('click', () => {
            clueBox.classList.toggle('clue-done');
            for (let r = 0; r < 15; r++) {
                if (playerGrid[r][c] === 0) {
                    playerGrid[r][c] = 2; 
                    const cellDom = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    if (cellDom) {
                        cellDom.classList.add('marked-x');
                    }
                }
            }
            checkVictoryState();
        });

        colHeadersContainer.appendChild(clueBox);
    }
}

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
            playerGrid[r][c] = 0;
            cellDom.classList.remove('filled');
        } else {
            playerGrid[r][c] = 1;
            cellDom.classList.remove('marked-x');
            cellDom.classList.add('filled');
        }
    } else if (activeTool === 'x') {
        if (playerGrid[r][c] === 2) {
            playerGrid[r][c] = 0;
            cellDom.classList.remove('marked-x');
        } else {
            playerGrid[r][c] = 2;
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
            document.querySelectorAll('.col-clue-box, .row-clue-box').forEach(box => {
                box.classList.remove('clue-done');
            });
        }
    });
}

function checkVictoryState() {
    const solution = currentPuzzle.gridSolution;
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            if (solution[r][c] === 1 !== (playerGrid[r][c] === 1)) return;
        }
    }
    setTimeout(() => alert(`Congratulations! You solved the "${currentPuzzle.name}" puzzle! 🎉`), 100);
}

initGame();