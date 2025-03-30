document.addEventListener('DOMContentLoaded', function() {
// 更加细腻的天空颜色序列 (24个阶段模拟一天变化)
const skyColors = [
    // 深夜到黎明前 (0:00-4:00)
    { name: '午夜', color: [8, 12, 35] },
    { name: '深夜1', color: [10, 15, 40] },
    { name: '深夜2', color: [12, 18, 45] },
    { name: '深夜3', color: [15, 22, 50] },
    
    // 黎明前到日出 (4:00-6:00)
    { name: '黎明前1', color: [20, 30, 65] },
    { name: '黎明前2', color: [30, 45, 85] },
    { name: '黎明前3', color: [50, 70, 110] },
    { name: '黎明', color: [80, 100, 140] },
    { name: '日出前', color: [120, 90, 70] },
    { name: '日出开始', color: [180, 120, 90] },
    { name: '日出高峰', color: [255, 150, 100] },
    
    // 早晨到中午 (6:00-12:00)
    { name: '早晨1', color: [220, 180, 150] },
    { name: '早晨2', color: [180, 200, 230] },
    { name: '早晨3', color: [140, 190, 240] },
    { name: '上午', color: [120, 200, 255] },
    { name: '中午', color: [110, 195, 250] },
    
    // 下午到傍晚 (12:00-18:00)
    { name: '下午1', color: [115, 190, 245] },
    { name: '下午2', color: [130, 180, 235] },
    { name: '傍晚开始', color: [160, 140, 180] },
    { name: '傍晚1', color: [200, 120, 100] },
    { name: '傍晚2', color: [220, 100, 70] },
    { name: '日落', color: [255, 100, 50] },
    
    // 日落到深夜 (18:00-24:00)
    { name: '黄昏1', color: [180, 70, 40] },
    { name: '黄昏2', color: [120, 50, 35] },
    { name: '夜晚开始', color: [60, 35, 40] },
    { name: '夜晚', color: [20, 25, 50] }
];
let currentColorIndex = 0;
const colorChangeInterval = 5000; // 每5秒变化一次
const colorTransitionDuration = 3000; // 颜色过渡持续3秒
const sky = document.getElementById('sky');

// 颜色过渡函数
function interpolateColor(color1, color2, factor) {
      // 使用缓动函数使过渡更自然
    const easeFactor = factor < 0.5 
        ? 2 * factor * factor 
        : 1 - Math.pow(-2 * factor + 2, 2) / 2;
    
    return [
        Math.round(color1[0] + (color2[0] - color1[0]) * easeFactor),
        Math.round(color1[1] + (color2[1] - color1[1]) * easeFactor),
        Math.round(color1[2] + (color2[2] - color1[2]) * easeFactor)
    ];
}

// 应用天空颜色
function applySkyColor(color) {
     // 创建更丰富的渐变效果
    const gradientStops = [
        `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        `rgb(${color[0]*0.9}, ${color[1]*0.9}, ${color[2]*0.9})`,
        `rgb(${color[0]*0.7}, ${color[1]*0.7}, ${color[2]*0.7})`,
        `rgb(${color[0]*0.5}, ${color[1]*0.5}, ${color[2]*0.5})`
    ];
    
    sky.style.background = `linear-gradient(to bottom, ${gradientStops.join(', ')})`;
}

// 更新天空颜色
function updateSkyColor() {
    const nextColorIndex = (currentColorIndex + 1) % skyColors.length;
    const currentColor = skyColors[currentColorIndex].color;
    const nextColor = skyColors[nextColorIndex].color;
    
    let startTime = null;
    
    const animateTransition = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / colorTransitionDuration, 1);
        
        const transitionColor = interpolateColor(currentColor, nextColor, progress);
        applySkyColor(transitionColor);
        
        if (progress < 1) {
            requestAnimationFrame(animateTransition);
        } else {
            currentColorIndex = nextColorIndex;
        }
    };
    
    requestAnimationFrame(animateTransition);
}

// 启动颜色循环
function startColorCycle() {
    applySkyColor(skyColors[0].color); // 初始颜色
    setInterval(updateSkyColor, colorChangeInterval);
}

// 创建流星
function createMeteor() {
    const meteor = document.createElement('div');
    meteor.className = 'meteor';
    
    const size = Math.random() * 1 + 0.5;
    const brightness = Math.random() * 0.8 + 0.2;
    const trailLength = Math.random() * 150 + 100;
    
    const startX = window.innerWidth * (0.5 + Math.random() * 0.5) + trailLength * 0.7;
    const startY = Math.random() * window.innerHeight * 0.5 - trailLength * 0.7;
    
    meteor.style.left = `${startX}px`;
    meteor.style.top = `${startY}px`;
    meteor.style.width = `${trailLength}px`;
    meteor.style.height = `${size}px`;
    meteor.style.opacity = brightness;
    meteor.style.animationDuration = `${Math.random() * 2 + 1}s`;
    
    sky.appendChild(meteor);
    meteor.addEventListener('animationend', () => meteor.remove());
}

// 创建流星群
function createMeteorShower() {
    const meteorCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < meteorCount; i++) {
        setTimeout(createMeteor, i * 300); // 流星之间有小延迟
    }
    setTimeout(createMeteorShower, Math.random() * 2000 + 1000);
}

// 初始化
function init() {
    startColorCycle();
    setTimeout(createMeteorShower, 1000);
}

// 启动
init();
});