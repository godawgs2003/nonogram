// game.js
import { nonogramLibrary } from './puzzles.js';

// DOM Elements
const boardContainer = document.getElementById('board');
const colHeadersContainer = document.getElementById('colHeaders');
const rowHeadersContainer = document.getElementById('rowHeaders');
const fillToolBtn = document.getElementById('fillToolBtn');
const xToolBtn = document.getElementById('xToolBtn');
const clearBtn = document.getElementById('clearBtn');
const introScreen = document.getElementById('introScreen');
const startBtn = document.getElementById('startBtn');

// Game State
let currentPuzzle = nonogramLibrary.normal[0]; 
let activeTool = 'fill'; 
let playerGrid = Array(15).fill(null).map(() => Array(15).fill(0)); 

// Dragging State Trackers
let isDragging = false;
let dragActionType = null; // 0 = clear, 1 = fill, 2 = X

// 1. Initialize Game Engine
function initGame() {
    generateClues();
    buildInteractiveGrid();
    setupToolControls();
    setupGlobalMouseListeners();
    checkClueStatus(); 
}

// Handle Title Screen Dismissal
if (startBtn && introScreen) {
    startBtn.addEventListener('click', () => {
        introScreen.style.display = 'none';
    });
}

// 2. Compute Clue Tracks
function generateClues() {
    const solution = currentPuzzle.gridSolution;

    // Generate Row Clues
    for (let r = 0; r < 15; r++) {
        const rowClues = getClueSequence(solution[r]);
        const clueBox = document.createElement('div');
        clueBox.className = 'row-clue-box';
        clueBox.dataset.rowIndex = r;
        clueBox.style.cursor = 'pointer';
        
        rowClues.forEach(clue => {
            const span = document.createElement('span');
            span.innerText = clue;
            clueBox.appendChild(span);
        });

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
        clueBox.dataset.colIndex = c;
        clueBox.style.cursor = 'pointer';
        
        colClues.forEach(clue => {
            const span = document.createElement('span');
            span.innerText = clue;
            clueBox.appendChild(span);
        });

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

// 3. Build Web Board Architecture with Touch & Drag Event Bindings
function buildInteractiveGrid() {
    boardContainer.innerHTML = '';
    
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            // --- DESKTOP MOUSE EVENTS ---
            cell.addEventListener('mousedown', (e) => {
                e.preventDefault(); 
                isDragging = true;
                setDragIntent(r, c);
                executeCellModification(cell, r, c);
            });

            cell.addEventListener('mouseenter', () => {
                if (isDragging) {
                    executeCellModification(cell, r, c);
                }
            });

            // --- MOBILE TOUCH EVENTS ---
            cell.addEventListener('touchstart', (e) => {
                // Prevent browser scrolling while trying to draw
                e.preventDefault(); 
                isDragging = true;
                setDragIntent(r, c);
                executeCellModification(cell, r, c);
            }, { passive: false });

            boardContainer.appendChild(cell);
        }
    }

    // Capture dragging finger movements across the entire board surface
    boardContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        // Target the coordinate placement of the finger
        const touch = e.touches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

        // Verify if the element under the finger is a grid cell
        if (targetElement && targetElement.classList.contains('cell')) {
            const r = parseInt(targetElement.dataset.row);
            const c = parseInt(targetElement.dataset.col);
            executeCellModification(targetElement, r, c);
        }
    }, { passive: false });
}

// Determines if the user is intending to draw paths, mark X's, or erase
function setDragIntent(r, c) {
    if (activeTool === 'fill') {
        dragActionType = (playerGrid[r][c] === 1) ? 0 : 1;
    } else if (activeTool === 'x') {
        dragActionType = (playerGrid[r][c] === 2) ? 0 : 2;
    }
}

// Main cell editing filter applied via click or drag moves
function executeCellModification(cellDom, r, c) {
    const currentVal = playerGrid[r][c];

    if (dragActionType === 0) {
        if ((activeTool === 'fill' && currentVal === 1) || (activeTool === 'x' && currentVal === 2)) {
            playerGrid[r][c] = 0;
            cellDom.classList.remove('filled', 'marked-x');
        }
    } else if (dragActionType === 1) {
        if (currentVal !== 1) {
            playerGrid[r][c] = 1;
            cellDom.classList.remove('marked-x');
            cellDom.classList.add('filled');
        }
    } else if (dragActionType === 2) {
        if (currentVal !== 2) {
            playerGrid[r][c] = 2;
            cellDom.classList.remove('filled');
            cellDom.classList.add('marked-x');
        }
    }

    checkClueStatus();
    checkVictoryState();
}

// Reset drag flags when click or touch interaction lifts anywhere
function setupGlobalMouseListeners() {
    const stopDrag = () => {
        isDragging = false;
        dragActionType = null;
    };
    
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
    window.addEventListener('touchcancel', stopDrag);
}

// 4. Interface Layout Control Bindings
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

// 5. Audits Clue Tracking Elements for Automated Gray-Out Effects
function checkClueStatus() {
    const solution = currentPuzzle.gridSolution;

    // Check Row matches
    for (let r = 0; r < 15; r++) {
        let isRowDone = true;
        for (let c = 0; c < 15; c++) {
            if ((solution[r][c] === 1) !== (playerGrid[r][c] === 1)) {
                isRowDone = false;
                break;
            }
        }
        const rowElement = document.querySelector(`.row-clue-box[data-row-index="${r}"]`);
        if (rowElement) {
            if (isRowDone) rowElement.classList.add('clue-done');
            else rowElement.classList.remove('clue-done');
        }
    }

    // Check Column matches
    for (let c = 0; c < 15; c++) {
        let isColDone = true;
        for (let r = 0; r < 15; r++) {
            if ((solution[r][c] === 1) !== (playerGrid[r][c] === 1)) {
                isColDone = false;
                break;
            }
        }
        const colElement = document.querySelector(`.col-clue-box[data-col-index="${c}"]`);
        if (colElement) {
            if (isColDone) colElement.classList.add('clue-done');
            else colElement.classList.remove('clue-done');
        }
    }
}

function checkVictoryState() {
    const solution = currentPuzzle.gridSolution;
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            if ((solution[r][c] === 1) !== (playerGrid[r][c] === 1)) return;
        }
    }
    setTimeout(() => alert(`Congratulations! You solved the "${currentPuzzle.name}" puzzle! 🎉`), 100);
}

initGame();