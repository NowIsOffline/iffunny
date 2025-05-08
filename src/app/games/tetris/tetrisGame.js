"use client";
let canvas, ctx;
let board = [];
let currentPiece = null;
let dropInterval;
let score = 0;
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
let isGamePause= false;
console.log("Audio Path:", "/sounds/sound-hit.wav");
// let dropSound = new Audio("/sounds/sound-hit.wav");
// let clearLineSound = new Audio("/sounds/sound-win.wav");

const COLORS = ["", "#FF5733", "#33C1FF", "#75FF33", "#FF33A6", "#FFD733", "#9D33FF", "#33FFBD"];
const SHAPES = [
    [],
    [[1, 1, 1, 1]],
    [[2, 0, 0], [2, 2, 2]],
    [[0, 0, 3], [3, 3, 3]],
    [[4, 4], [4, 4]],
    [[0, 5, 5], [5, 5, 0]],
    [[0, 6, 0], [6, 6, 6]],
    [[7, 7, 0], [0, 7, 7]]
];

function createPiece() {
    const type = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    const shape = SHAPES[type];
    return {
        x: Math.floor((COLS - shape[0].length) / 2),
        y: 0,
        shape,
        type
    };
}


function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除整个画布
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
            return (
                !val ||
                (x >= 0 && x < COLS && y < ROWS && (y < 0 || !board[y][x]))
            );
        })
    );
}



function playSound(sound) {
    sound.play();
}

function mergePiece() {
    const { x, y, shape, type } = currentPiece;
    shape.forEach((row, dy) =>
        row.forEach((val, dx) => {
            if (val) board[y + dy][x + dx] = type;
        })
    );
    // playSound(dropSound); // 播放掉落音效
}
function clearLines() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            // 直接删除行，无闪烁效果
            board.splice(y, 1);
            board.unshift(new Array(COLS).fill(0)); // 添加一个空行到顶部
            score += 100; // 增加得分
            // document.getElementById("score-display").innerText = "Score: " + score;

            // playSound(clearLineSound); // 播放消除行音效
            y++; // 重新检查当前行，避免跳过
        }
    }
    drawBoard(); // 更新游戏界面
}

function drop() {
    if (!move(0, 1)) {
        mergePiece();
        clearLines();
        currentPiece = createPiece();
        if (!validMove(currentPiece.shape, currentPiece.x, currentPiece.y)) {
            endGame();
        }
    }
    drawBoard();
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
        drawBoard();
    }
}

function endGame() {
    clearInterval(dropInterval);
    isGamePause=true;
    document.getElementById("game-over-screen").style.display = "flex";
}
let lastDropTime = 0;
let dropDelay = 800;

function gameLoop(timestamp) {
    if(isGamePause){
        return;
    }
    if (!lastDropTime) lastDropTime = timestamp;
    const delta = timestamp - lastDropTime;

    if (delta > dropDelay) {
        drop();
        lastDropTime = timestamp;
    }

    drawBoard();
    requestAnimationFrame(gameLoop); // 使用 requestAnimationFrame 保证动画流畅
}

export function restartGame() {
    isGamePause = false;  // 恢复游戏
    document.getElementById("game-over-screen").style.display = "none";
    initializeTetrisGame(); // 重新初始化游戏
}


export function  initializeTetrisGame() {
    canvas = document.getElementById("tetris-canvas");
    ctx = canvas.getContext("2d");
    // 清空游戏面板和初始化变量
    board = [];
    for (let y = 0; y < ROWS; y++) board[y] = new Array(COLS).fill(0);
    currentPiece = createPiece();
    score = 0;  // 重置得分
    drawBoard();

    requestAnimationFrame(gameLoop); // ✅ 替代 setInterval

    document.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft" || e.key === "a") move(-1, 0);
        if (e.key === "ArrowRight" || e.key === "d") move(1, 0);
        if (e.key === "ArrowDown" || e.key === "s") move(0, 1);
        if (e.key === "z") rotate();
    });

    canvas.addEventListener("click", rotate);

    const btnL = document.getElementById("left-btn");
    const btnR = document.getElementById("right-btn");
    const btnD = document.getElementById("down-btn");
    const btnRot = document.getElementById("rotate-btn");

    if (btnL) btnL.onclick = () => move(-1, 0);
    if (btnR) btnR.onclick = () => move(1, 0);
    if (btnD) btnD.onclick = () => move(0, 1);
    if (btnRot) btnRot.onclick = rotate;
}

export default initializeTetrisGame;