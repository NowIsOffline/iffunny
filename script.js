const startButton = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');
const gameArea = document.getElementById('game-area');

const cellSize = 40;
const fallSpeed = 3;
let currentGroup = null;
let staticCells = [];
const moveInterval = 100; // 毫秒，比如100 = 0.1秒
let moveTimers = {};

const SHAPES = [
    { shape: [[1, 1, 1, 1]], name: "I" },
    { shape: [[1, 1], [1, 1]], name: "O" },
    { shape: [[0,1,0],[1,1,1]], name: "T" },
    { shape: [[1,0,0],[1,1,1]], name: "L" },
    { shape: [[0,0,1],[1,1,1]], name: "J" },
    { shape: [[1,1,0],[0,1,1]], name: "S" },
    { shape: [[0,1,1],[1,1,0]], name: "Z" }
];

const sitesConfig = [
    { name:"png2ico",desc:"",logo: './icon/png2ico.png', link: 'https://iffunny.com/png2ico/', logoIndex: 2 },
    { name:"TXT reader",desc:"",logo: './icon/education.png', link: 'https://iffunny.com/txtreader/',  logoIndex: 1 },
    { name:"choice-helper",desc:"",logo: './icon/choice-helper.png', link: 'https://iffunny.com/choice-helper/', logoIndex: 0 },
    { name:"ball Game",desc:"",logo: './icon/ballgames.png', link: 'https://iffunny.com/ballgames/',  logoIndex: 0 },
    { name:"Compose Game",desc:"",logo: './icon/composegame.png', link: 'https://iffunny.com/composegame/', logoIndex: 0 },
    { name:"No spy",desc:"",logo: './icon/protect.png', link: 'https://iffunny.com/nervesgame/',  logoIndex: 0 },
];

class Cell {
    constructor(x, y, siteInfo, color,parentDom) {
        this.x = x;
        this.y = y;
        this.site = siteInfo;
        this.color = color;
        this.el = document.createElement('div');
        parentDom.appendChild(this.el);
        this.el.className = 'cell';
        this.el.style.left = x + 'px';
        this.el.style.top = y + 'px';

        if (siteInfo) {
            const img = document.createElement('img');
            img.src = siteInfo.logo;
            this.el.appendChild(img);
            this.el.title = siteInfo.name;
           
        } else {
            this.el.style.background = color;
        }

        
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.el.style.left = x + 'px';
        this.el.style.top = y + 'px';
    }
}

class BlockGroup {
    constructor(shapeMatrix, siteInfo) {
        this.shape = shapeMatrix;
        this.cells = [];
        this.x = Math.floor(gameArea.clientWidth / 2 / cellSize) * cellSize;
        this.y = 0;
        this.color = randomPastelColor();

        const blockIndexes = [];
        for (let r = 0; r < shapeMatrix.length; r++) {
            for (let c = 0; c < shapeMatrix[r].length; c++) {
                if (shapeMatrix[r][c]) {
                    blockIndexes.push({ r, c });
                }
            }
        }
        this.siteInfo = siteInfo;
        let logoIndex = siteInfo.logoIndex ?? Math.floor(Math.random() * blockIndexes.length);
        this.parentDom = document.createElement("div");
        this.parentDom.className="block-group";
        blockIndexes.forEach((pos, idx) => {
            const { r, c } = pos;
            const cell = new Cell(
                this.x + c * cellSize,
                this.y + r * cellSize,
                idx === logoIndex ? siteInfo : null,
                this.color,
                this.parentDom
            );
            this.cells.push(cell);
        });
        gameArea.appendChild(this.parentDom);
        this.bindEvents();
    }
    bindEvents() {
        this.parentDom.addEventListener('mouseenter', (e) => {
            if(isShowInfoing){
                return;
            }
            showInfo(this.siteInfo, e.clientX, e.clientY);
        });


        this.parentDom.addEventListener('click', () => {
            window.open(this.siteInfo.link, '_blank');
        });
    }
    move(dx, dy) {
        // 检查水平移动是否会超出边界
        if (dx !== 0) {
            const newX = this.x + dx * cellSize;

            // 检查所有单元格是否会超出左右边界
            for (const cell of this.cells) {
                const cellNewX = cell.x + dx * cellSize;
                if (cellNewX < 0 || cellNewX + cellSize > gameArea.clientWidth) {
                    return; // 如果任何单元格会超出边界，则不执行移动
                }
            }
        }

        // 检查垂直移动是否会超出底部边界
        if (dy !== 0) {
            const newY = this.y + dy * cellSize;

            for (const cell of this.cells) {
                const cellNewY = cell.y + dy * cellSize;
                if (cellNewY + cellSize > gameArea.clientHeight) {
                    return; // 如果任何单元格会超出底部边界，则不执行移动
                }
            }
        }

        // 执行移动
        this.x += dx * cellSize;
        this.y += dy * cellSize;
        this.updateCells();

        // 检查碰撞
        if (this.isColliding()) {
            this.x -= dx * cellSize;
            this.y -= dy * cellSize;
            this.updateCells();
        }
    }


    rotate() {
            // 创建旋转后的新形状（顺时针90度）
            const rows = this.shape.length;
            const cols = this.shape[0].length;
            const newShape = [];

            // 创建新形状的矩阵
            for (let c = 0; c < cols; c++) {
                const newRow = [];
                for (let r = rows - 1; r >= 0; r--) {
                    newRow.push(this.shape[r][c]);
                }
                newShape.push(newRow);
            }

            // 备份当前位置
            const backupPos = this.cells.map(c => ({x: c.x, y: c.y}));
            const backupShape = this.shape;

            // 计算旋转中心点（使用第一个单元格作为基准）
            const pivotX = this.cells[0].x;
            const pivotY = this.cells[0].y;

            // 更新形状和位置
            this.shape = newShape;

            // 重新计算所有单元格的位置
            let cellIndex = 0;
            for (let r = 0; r < newShape.length; r++) {
                for (let c = 0; c < newShape[r].length; c++) {
                    if (newShape[r][c]) {
                        // 计算相对于旋转中心的新位置
                        const newX = pivotX + (c * cellSize);
                        const newY = pivotY + (r * cellSize);
                        this.cells[cellIndex].setPosition(newX, newY);
                        cellIndex++;
                    }
                }
            }

            // 如果旋转后发生碰撞，则回退
            if (this.isColliding()) {
                this.shape = backupShape;
                this.cells.forEach((cell, idx) => {
                    cell.setPosition(backupPos[idx].x, backupPos[idx].y);
                });
            }
        }

    updateCells() {
        let idx = 0;
        for (let r = 0; r < this.shape.length; r++) {
            for (let c = 0; c < this.shape[r].length; c++) {
                if (this.shape[r][c]) {
                    this.cells[idx].setPosition(this.x + c * cellSize, this.y + r * cellSize);
                    idx++;
                }
            }
        }
    }

    fall() {
        this.y += fallSpeed;
        this.updateCells();
        if (this.isColliding()) {
            this.y -= fallSpeed;
            this.updateCells();
            this.fix();
        }
    }

    isColliding() {
        for (const cell of this.cells) {
            if (cell.y + cellSize > gameArea.clientHeight) return true;
            for (const s of staticCells) {
                if (Math.abs(cell.x - s.x) < cellSize && Math.abs(cell.y - s.y) < cellSize) {
                    return true;
                }
            }
        }
        return false;
    }

    fix() {
        staticCells.push(...this.cells);
        currentGroup = null;
        setTimeout(() => { // 加个延迟，避免瞬间卡住
            spawnNextGroup();
        }, 100);
    }
}

function spawnNextGroup() {
    if (sitesConfig.length === 0) return;
    const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const siteInfo = sitesConfig.shift();
    currentGroup = new BlockGroup(randomShape.shape, siteInfo);
}

function randomPastelColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
}

function gameLoop() {
    if (currentGroup) currentGroup.fall();
    requestAnimationFrame(gameLoop);
}



window.addEventListener('keydown', (e) => {
    if (!currentGroup) return;
    const key = e.key.toLowerCase();
    if (['a', 'd', 's'].includes(key) && !moveTimers[key]) {
        moveTimers[key] = setInterval(() => {
            moveGroup(key);
        }, moveInterval);
    }
});

function moveGroup(key){
    if(!currentGroup) return;
    if (key === 'a') currentGroup.move(-1, 0);
    if (key === 'd') currentGroup.move(1, 0);
    if (key === 's') currentGroup.move(0, 1);
}

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (moveTimers[key]) {
        clearInterval(moveTimers[key]);
        moveTimers[key] = null;
    }
});

// 点击旋转
gameArea.addEventListener('click', (e) => {
    if (!currentGroup) return;
    currentGroup.rotate();
});


const infoBox = document.getElementById('info-box');
const infoLogo = document.getElementById('info-logo');
const infoTitle = document.getElementById('info-title');
const infoDesc = document.getElementById('info-desc');

let isShowInfoing=false;
infoBox.addEventListener('mouseleave', () => {
   if(isShowInfoing){
       return;
   }
   hideInfo();
});
function showInfo(site, x, y) {
    if(isShowInfoing){
        return;
    }
    isShowInfoing=true;
    infoLogo.src = site.logo;
    infoTitle.textContent = site.name;
    infoDesc.textContent = site.desc;
    infoBox.style.left = x - 100 + 'px';
    infoBox.style.top = y - 100 + 'px';
    infoBox.style.display = 'block';
    setTimeout(() => {
        isShowInfoing=false;
        infoBox.style.opacity = '1';
    }, 10);
    infoBox.onclick = () => {
        window.open(site.link, '_blank');
    }
}

function hideInfo() {
    infoBox.style.opacity = '0';
    infoBox.style.display = 'none';
}


// 在文件顶部添加这些变量
let joystickBase = null;
let joystickHandle = null;
let joystickActive = false;
let joystickStartX = 0;
let joystickStartY = 0;
let joystickX = 0;
let joystickY = 0;
const joystickRadius = 60;
const joystickDeadZone = 20;

// 添加摇杆初始化函数
function initJoystick() {
    // 创建摇杆基础
    joystickBase = document.createElement('div');
    joystickBase.id = 'joystick-base';
    joystickBase.style.position = 'fixed';
    joystickBase.style.bottom = '100px';
    joystickBase.style.left = '50%';
    joystickBase.style.transform = 'translateX(-50%)';
    joystickBase.style.width = joystickRadius * 2 + 'px';
    joystickBase.style.height = joystickRadius * 2 + 'px';
    joystickBase.style.borderRadius = '50%';
    joystickBase.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    joystickBase.style.display = 'none'; // 默认隐藏
    joystickBase.style.zIndex = '1000';
    document.body.appendChild(joystickBase);

    // 创建摇杆手柄
    joystickHandle = document.createElement('div');
    joystickHandle.id = 'joystick-handle';
    joystickHandle.style.position = 'absolute';
    joystickHandle.style.width = '40px';
    joystickHandle.style.height = '40px';
    joystickHandle.style.borderRadius = '50%';
    joystickHandle.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    joystickHandle.style.transform = 'translate(-50%, -50%)';
    joystickHandle.style.top = '50%';
    joystickHandle.style.left = '50%';
    joystickBase.appendChild(joystickHandle);

    // 检查是否是移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        joystickBase.style.display = 'block';
    }

    // 添加触摸事件
    joystickBase.addEventListener('touchstart', handleJoystickStart);
    document.addEventListener('touchmove', handleJoystickMove);
    document.addEventListener('touchend', handleJoystickEnd);
}

// 摇杆事件处理函数
function handleJoystickStart(e) {
    // e.preventDefault();
    const touch = e.touches[0];
    const rect = joystickBase.getBoundingClientRect();
    joystickStartX = rect.left + joystickRadius;
    joystickStartY = rect.top + joystickRadius;
    joystickActive = true;
    updateJoystick(touch.clientX, touch.clientY);
}

function handleJoystickMove(e) {
    if (!joystickActive||!e) return;
    // e.preventDefault();
    const touch = e.touches[0];
    updateJoystick(touch.clientX, touch.clientY);
}

function handleJoystickEnd(e) {
    joystickActive = false;
    joystickX = 0;
    joystickY = 0;
    joystickHandle.style.top = '50%';
    joystickHandle.style.left = '50%';
}

function updateJoystick(x, y) {
    if (!joystickActive) return;

    // 计算摇杆偏移
    const dx = x - joystickStartX;
    const dy = y - joystickStartY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 限制摇杆移动范围
    let angle = Math.atan2(dy, dx);
    let limitedDistance = Math.min(distance, joystickRadius);

    // 更新摇杆手柄位置
    const handleX = joystickStartX + Math.cos(angle) * limitedDistance;
    const handleY = joystickStartY + Math.sin(angle) * limitedDistance;

    joystickHandle.style.left = (Math.cos(angle) * limitedDistance + joystickRadius) + 'px';
    joystickHandle.style.top = (Math.sin(angle) * limitedDistance + joystickRadius) + 'px';

    // 计算摇杆方向
    if (distance > joystickDeadZone) {
        joystickX = Math.cos(angle);
        joystickY = Math.sin(angle);
    } else {
        joystickX = 0;
        joystickY = 0;
    }
}
let joystickLastMoveTime = 0;
const joystickMoveInterval = 100; // 摇杆移动间隔时间（毫秒）

// 修改游戏循环以处理摇杆输入
function gameLoop() {
    const now = Date.now();
    if (currentGroup) {
        currentGroup.fall();
        // 处理摇杆输入
        if(now - joystickLastMoveTime > joystickMoveInterval){
            if (joystickActive && Math.abs(joystickX) > 0.3) {
                moveGroup(joystickX > 0 ? "d" : "a")
            }
            if (joystickActive && joystickY > 0.7) {
                moveGroup("s")
            }
            joystickLastMoveTime = now;
        }
       
    }
    requestAnimationFrame(gameLoop);
}

// 添加旋转按钮
function initMobileControls() {
    const rotateBtn = document.createElement('div');
    rotateBtn.id = 'rotate-btn';
    rotateBtn.textContent = '↻';
    rotateBtn.style.position = 'fixed';
    rotateBtn.style.right = '30px';
    rotateBtn.style.bottom = '100px';
    rotateBtn.style.width = '60px';
    rotateBtn.style.height = '60px';
    rotateBtn.style.borderRadius = '50%';
    rotateBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    rotateBtn.style.display = 'flex';
    rotateBtn.style.justifyContent = 'center';
    rotateBtn.style.alignItems = 'center';
    rotateBtn.style.fontSize = '30px';
    rotateBtn.style.color = 'white';
    rotateBtn.style.zIndex = '1000';

    // 检查是否是移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.appendChild(rotateBtn);
    }

    rotateBtn.addEventListener('touchstart', (e) => {
        // e.preventDefault();
        if (currentGroup) currentGroup.rotate();
    });
}

// 在startButton.onclick中调用initMobileControls
startButton.onclick = () => {
    startScreen.style.display = 'none';
    spawnNextGroup();
    gameLoop();
    initJoystick();
    initMobileControls(); // 初始化移动控制
};