
"use client";

let canvas, ctx;
let board = [];
let currentPiece = null;
let nextPiece = null;
let dropInterval;
let score = 0;
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
let isGamePause = false;
let lastDropTime = 0;
let dropDelay = 800;

const COLORS = ["", "#FF5733", "#33C1FF", "#75FF33", "#FF33A6", "#FFD733", "#9D33FF", "#33FFBD"];
const SHAPES = [
    [],
    [[1, 1, 1, 1]],
    [[2, 0, 0], [2, 2, 2]],
    [[0, 0, 3], [3, 3, 3]],
    [[4, 4], [4, 4]],
    [[0, 5, 5], [5, 5, 0]],
    [[0, 6, 0], [6, 6, 6]],
    [[7, 7, 0], [0, 7, 7]],
];

function createPiece() {
    const type = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    const shape = SHAPES[type];
    return {
        x: Math.floor((COLS - shape[0].length) / 2),
        y: 0,
        shape,
        type,
    };
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
    if (currentPiece) {
        const { x, y, shape, type } = currentPiece;
        shape.forEach((row, dy) =>
            row.forEach((val, dx) => {
                if (val) drawBlock(x + dx, y + dy, type);
            })
        );
    }
}

function drawBlock(x, y, type) {
    ctx.fillStyle = COLORS[type];
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function validMove(shape, offsetX, offsetY) {
    return shape.every((row, dy) =>
        row.every((val, dx) => {
            const x = offsetX + dx;
            const y = offsetY + dy;
            return !val || (x >= 0 && x < COLS && y < ROWS && (y < 0 || !board[y][x]));
        })
    );
}

function mergePiece() {
    const { x, y, shape, type } = currentPiece;
    shape.forEach((row, dy) =>
        row.forEach((val, dx) => {
            if (val) board[y + dy][x + dx] = type;
        })
    );
}

function clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(new Array(COLS).fill(0));
            cleared++;
            y++;
        }
    }

    if (cleared > 0) {
        score += cleared * 100;
        updateScoreDisplay();
    }
}

function updateScoreDisplay() {
    const scoreEl = document.getElementById("score-value");
    if (scoreEl) {
        scoreEl.textContent = score.toString();
    }
}

function drawNextPiece() {
    const canvas = document.getElementById("next-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!nextPiece) return;

    const shape = nextPiece.shape;
    const type = nextPiece.type;
    const blockSize = 20;
    const offsetX = (canvas.width - shape[0].length * blockSize) / 2;
    const offsetY = (canvas.height - shape.length * blockSize) / 2;

    shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                ctx.fillStyle = COLORS[type];
                ctx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                ctx.strokeStyle = "#000";
                ctx.strokeRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
            }
        });
    });
}

function drop() {
    if (!move(0, 1)) {
        mergePiece();
        clearLines();
        currentPiece = nextPiece;
        nextPiece = createPiece();
        drawNextPiece();
        if (!validMove(currentPiece.shape, currentPiece.x, currentPiece.y)) {
            endGame();
        }
    }
}

function move(dx, dy) {
    const { shape, x, y } = currentPiece;
    if (validMove(shape, x + dx, y + dy)) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        return true;
    }
    return false;
}

function rotate() {
    const shape = currentPiece.shape;
    const rotated = shape[0].map((_, i) => shape.map(row => row[i])).reverse();
    if (validMove(rotated, currentPiece.x, currentPiece.y)) {
        currentPiece.shape = rotated;
    }
}

function endGame() {
    isGamePause = true;
    clearInterval(dropInterval);
    const over = document.getElementById("game-over-screen");
    const scoreShow = document.getElementById("score-display");
    if (over) over.style.display = "flex";
    if (scoreShow) scoreShow.textContent = "Score: " + score;
}

function gameLoop(timestamp) {
    if (isGamePause) return;
    if (lastDropTime === 0) lastDropTime = timestamp;
    const delta = timestamp - lastDropTime;
    if (delta > dropDelay) {
        drop();
        lastDropTime = timestamp;
    }
    drawBoard();
    requestAnimationFrame(gameLoop);
}

export function initializeTetrisGame() {
    canvas = document.getElementById("tetris-canvas");
    ctx = canvas.getContext("2d");
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    currentPiece = createPiece();
    nextPiece = createPiece();
    score = 0;
    isGamePause = false;
    lastDropTime = 0;
    drawNextPiece();
    updateScoreDisplay();
    requestAnimationFrame(gameLoop);

    document.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft" || e.key === "a") move(-1, 0);
        if (e.key === "ArrowRight" || e.key === "d") move(1, 0);
        if (e.key === "ArrowDown" || e.key === "s") move(0, 1);
        if (e.key === "z") rotate();
    });

    const btnL = document.getElementById("left-btn");
    const btnR = document.getElementById("right-btn");
    const btnD = document.getElementById("down-btn");
    const btnRot = document.getElementById("rotate-btn");

    if (btnL) btnL.onclick = () => move(-1, 0);
    if (btnR) btnR.onclick = () => move(1, 0);
    if (btnD) btnD.onclick = () => move(0, 1);
    if (btnRot) btnRot.onclick = rotate;
}

export function restartGame() {
    const over = document.getElementById("game-over-screen");
    if (over) over.style.display = "none";
    initializeTetrisGame();
}

export function pauseGame() {
    isGamePause = true;
}

export function moveLeft() {
    move(-1, 0);
}
export function moveRight() {
    move(1, 0);
}
export function moveDown() {
    move(0, 1);
}
export function rotatePiece() {
    rotate();
}
