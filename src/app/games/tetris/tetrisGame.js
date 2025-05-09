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
let onelineScore=100;
// 🎵 音效播放器
let dropSound, clearSound;

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
    ctx.fillStyle = IsDark() ? "#000" : "#d7f0fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    // ✅ 在 drawBoard() 最后加这一段
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 1);  // 起点：最底部横向
    ctx.lineTo(canvas.width, canvas.height - 1);  // 终点：右边底部
    ctx.lineWidth = 2;
    ctx.strokeStyle = IsDark() ? "#444" : "#888";  // 暗黑/普通模式分色
    ctx.stroke();
}

function IsDark(){
    const tetrisLayout = document.getElementById("tetrisLayout");
    return tetrisLayout?.classList.contains("dark-mode")
}
function drawBlock(x, y, type) {
    if (IsDark()) {
        const neonColors = ["", "#39ff14", "#00ffff", "#ff00ff", "#ffff00", "#ff5722", "#00e5ff", "#ff4081"];
        ctx.strokeStyle = neonColors[type];
        ctx.lineWidth = 2;
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    } else {
        ctx.fillStyle = COLORS[type];
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
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
    let linesToClear = [];
    for (let y = 0; y < ROWS; y++) {
        if (board[y].every(cell => cell)) {
            linesToClear.push(y);
        }
    }

    for (let i = 0; i < linesToClear.length; i++) {
        board.splice(linesToClear[i], 1);
        board.unshift(new Array(COLS).fill(0));
    }

    const cleared = linesToClear.length;

    if (cleared > 0) {
        if (clearSound) clearSound.play();
        score += cleared * 100;
        updateScoreDisplay();
    }
}

function updateScoreDisplay() {
    const scoreEl = document.getElementById("score-value");
    if (scoreEl) {
        scoreEl.textContent = score.toString();
        // ✅ 分数到1000后加速
        if(score>=30*onelineScore){
            dropDelay = 100;
        }else if(score>=20*onelineScore){
            dropDelay = 200;
        }else if (score >= 10*onelineScore) {
            dropDelay = 400;
        } else {
            dropDelay = 800;
        }

    }
}

function drawNextPiece() {
    const nextCanvas = document.getElementById("next-canvas");
    if (!nextCanvas) return;
    const nextPieceCtx = nextCanvas.getContext("2d");
    nextPieceCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!nextPiece) return;

    const isDark = IsDark();
    const shape = nextPiece.shape;
    const type = nextPiece.type;
    const blockSize = 20;
    const offsetX = (nextCanvas.width - shape[0].length * blockSize) / 2;
    const offsetY = (nextCanvas.height - shape.length * blockSize) / 2;

    shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                if (isDark) {
                    const neonColors = ["", "#39ff14", "#00ffff", "#ff00ff", "#ffff00", "#ff5722", "#00e5ff", "#ff4081"];
                    nextPieceCtx.strokeStyle = neonColors[type];
                    nextPieceCtx.lineWidth = 2;
                    nextPieceCtx.strokeRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                } else {
                    nextPieceCtx.fillStyle = COLORS[type];
                    nextPieceCtx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                    nextPieceCtx.strokeStyle = "#000";
                    nextPieceCtx.strokeRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                }
            }
        });
    });
}

function drop() {
    if (!move(0, 1)) {
        mergePiece();
        if (dropSound) dropSound.play();
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
    if (typeof window !== "undefined") {
        const currentHigh = Number(localStorage.getItem("tetrisHighScore") || 0);
        if (score > currentHigh) {
            localStorage.setItem("highScore", score.toString());
        }
    }

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
let controlsBound;
export function initializeTetrisGame() {

    canvas = document.getElementById("tetris-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    if (!dropSound) {
        dropSound = new Audio("/sounds/sound_tetris_drop.ogg");
        dropSound.volume = 0.4;
    }
    if (!clearSound) {
        clearSound = new Audio("/sounds/sound_tetris_clear.ogg");
        clearSound.volume = 0.5;
    }


    if (!controlsBound) {
        controlsBound = true;
        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft" || e.key === "a") moveLeft();
            if (e.key === "ArrowRight" || e.key === "d") moveRight();
            if (e.key === "ArrowDown" || e.key === "s") moveDown();
            if (e.key === "z") rotate();
        });
        const rotBtn = document.getElementById("rotate-btn");
        if (rotBtn) rotBtn.addEventListener("click", rotate);
        AddTouchEvent();
    }

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

    // 初始化音效
    dropSound = new Audio("/sounds/sound_tetris_drop.ogg");
    clearSound = new Audio("/sounds/sound_tetris_clear.ogg");
    dropSound.volume = 0.4;
    clearSound.volume = 0.5;


    requestAnimationFrame(gameLoop);
 
}

function AddTouchEvent() {
    const knob = document.getElementById("joystick-knob");
    const container = document.getElementById("joystick-container");
    if (!knob || !container) return;

    let startX = 0;
    let startY = 0;
    let lastMoveTime = 0;
    const throttleDelay = 100;

    container.addEventListener("touchstart", e => {
        console.log("touchmove")
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    });

    container.addEventListener("touchmove", e => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastMoveTime < throttleDelay) return;
        lastMoveTime = now;
        console.log("touchmove")
        const touch = e.touches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;

        const angle = Math.atan2(dy, dx);
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 30);
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        knob.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 20) moveRight();
            else if (dx < -20) moveLeft();
        } else {
            if (dy > 20) moveDown();
        }
    });

    container.addEventListener("touchend", () => {
        knob.style.transform = "translate(0, 0)";
    });
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
export function restartGame() {
    const over = document.getElementById("game-over-screen");
    if (over) over.style.display = "none";
    initializeTetrisGame();
}

export function pauseGame() {
    isGamePause = true;
}

export function resumeGame(){
    if (isGamePause) {
        isGamePause = false;
        requestAnimationFrame(gameLoop);
    }
}

export function afterModeChange(){
    if(!ctx){
        return
    }
    drawBoard();
    drawNextPiece();
}