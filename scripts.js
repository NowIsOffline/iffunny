// 多语言支持
const translations = {
    en: {  // 将英文设为第一个键
        title: "choice-helper",
        subtitle: "Helping you make decisions easily",
        uploadText: "Add images",
        clearAllText: "Clear All",
        randomCountLabel: "Number to select:",
        randomBtnText: "Random Select",
        resetSelectionText: "Reset Selection",
        footerText: "© 2023 Indecisive Helper - Helping you decide",
        noImagesWarning: "Please upload some images first",
        tooManySelected: "Number to select cannot exceed total images",
        selectedText: "Selected",
        skipAnimationText: "Skip animation",
        uploadAreaLabel: "Click or drag images here to upload",
        removeBtnText: "Remove this option",
		 randomHeading: "Random Selection",  // 新增
        optionsLabel: "Option"
    },
    zh: {
        title: "选择困难症助手",
        subtitle: "帮助您轻松做出选择",
        uploadText: "添加图片",
        clearAllText: "清空",
        randomCountLabel: "选择数量:",
        randomBtnText: "随机选择",
        resetSelectionText: "重置选择",
        footerText: "© 2023 选择困难症助手 - 帮助您轻松做出决定",
        noImagesWarning: "请先上传一些图片",
        tooManySelected: "选择数量不能超过图片总数",
        selectedText: "已选择",
        skipAnimationText: "跳过动画",
        uploadAreaLabel: "点击或拖放图片到这里上传",
        removeBtnText: "移除此选项",
		randomHeading: "随机选择",  // 新增
        optionsLabel: "选项"
    }
};

let currentLang = 'en'; // 默认设置为英文

// DOM元素翻译映射 - 添加新增的元素
const elementsToTranslate = {
    'title': 'title',
    'subtitle': 'subtitle',
    'uploadText': 'uploadText',
    'clearAllText': 'clearAllText',
    'randomCountLabel': 'randomCountLabel',
    'randomBtnText': 'randomBtnText',
    'resetSelectionText': 'resetSelectionText',
    'footerText': 'footerText',
    'skipAnimationText': 'skipAnimationText',
	'random-heading': 'randomHeading'  // 新增
};

// 切换语言函数保持不变
function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    
    // 更新所有文本
    for (const [elementId, translationKey] of Object.entries(elementsToTranslate)) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = translations[lang][translationKey];
        }
    }
    
    // 更新语言按钮状态
    document.getElementById('lang-zh').setAttribute('aria-pressed', lang === 'zh');
    document.getElementById('lang-en').setAttribute('aria-pressed', lang === 'en');
    
    // 更新ARIA标签和动态内容
    document.getElementById('uploadArea').setAttribute('aria-label', translations[lang].uploadAreaLabel);
    
    // 更新图片库中的移除按钮文本
    document.querySelectorAll('.remove-btn').forEach((btn, index) => {
        btn.setAttribute('aria-label', `${translations[lang].removeBtnText} ${index + 1}`);
    });
    
    // 更新SEO相关的元标签
    updateSEOMetaTags(lang);
	updateGallery();
}

// 更新SEO元标签
function updateSEOMetaTags(lang) {
    const title = lang === 'zh' ? '选择困难症助手 - 帮助您轻松做决定' : 'Indecisive Helper  - Help you make decisions';
    const description = lang === 'zh' ? '帮助选择困难症患者做决定的工具，支持图片上传、随机选择、多语言切换等功能。' : 'Tool to help indecisive people make choices, supports image upload, random selection, and multilingual switching.';
    
    document.title = title;
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:title"]').content = title;
    document.querySelector('meta[property="og:description"]').content = description;
}

// 图片上传和展示功能
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const imageGallery = document.getElementById('imageGallery');
const clearAllBtn = document.getElementById('clearAllBtn');
const randomBtn = document.getElementById('randomBtn');
const resetSelectionBtn = document.getElementById('resetSelectionBtn');
const randomCountInput = document.getElementById('randomCount');

let images = [];

// 上传区域点击事件
uploadArea.addEventListener('click', () => fileInput.click());

// 文件选择事件
fileInput.addEventListener('change', handleFileSelect);

// 拖放功能
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary-color)';
    uploadArea.style.backgroundColor = 'rgba(74, 111, 165, 0.1)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--secondary-color)';
    uploadArea.style.backgroundColor = '';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--secondary-color)';
    uploadArea.style.backgroundColor = '';
    
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect({ target: fileInput });
    }
});

// 处理文件选择
function handleFileSelect(event) {
    const files = event.target.files;
    if (!files.length) return;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        
        const reader = new FileReader();
        
        reader.onload = (function(file) {
            return function(e) {
                images.push({
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    src: e.target.result,
                    file: file
                });
                
                updateGallery();
                updateButtonStates();
            };
        })(file);
        
        reader.readAsDataURL(file);
    }
    
    // 重置文件输入，允许重复选择相同文件
    fileInput.value = '';
}
// 更新图片库函数 - 添加多语言支持
function updateGallery() {
    imageGallery.innerHTML = '';
    
    if (images.length === 0) {
        imageGallery.innerHTML = `<p class="empty-message">${translations[currentLang].noImagesWarning}</p>`;
        return;
    }
    
    images.forEach((image, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.dataset.id = image.id;
        imageItem.setAttribute('role', 'listitem');
        imageItem.setAttribute('aria-label', `${translations[currentLang].optionsLabel} ${index + 1}`);
        
        imageItem.innerHTML = `
            <img src="${image.src}" alt="${translations[currentLang].optionsLabel} ${index + 1}">
            <button class="remove-btn" aria-label="${translations[currentLang].removeBtnText} ${index + 1}">×</button>
        `;
        
        imageItem.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeImage(image.id);
        });
        
        imageGallery.appendChild(imageItem);
    });
}


// 移除单张图片
function removeImage(id) {
    images = images.filter(img => img.id !== id);
    updateGallery();
    updateButtonStates();
    
    // 如果移除了所有图片，也重置选择
    if (images.length === 0) {
        resetSelection();
    }
}

// 一键移除所有图片
clearAllBtn.addEventListener('click', () => {
    images = [];
    updateGallery();
    updateButtonStates();
    resetSelection();
});

// 随机选择功能
randomBtn.addEventListener('click', async () => {
    const count = parseInt(randomCountInput.value) || 1;
    const skipAnimation = document.getElementById('skipAnimationToggle').checked;
    
     if (isNaN(count)) {
        count = 1;
        randomCountInput.value = 1;
    } else if (count < 1) {
        count = 1;
        randomCountInput.value = 1;
    }
    
    if (count > images.length) {
        alert(translations[currentLang].tooManySelected);
        return;
    }
    // 重置之前的选择
    resetSelection();
    
    // 随机选择
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    if (!skipAnimation) {
        // 添加更明显的跳动动画
        const allItems = document.querySelectorAll('.image-item');
        const animationDuration = 2000; // 2秒动画
        
        // 先给所有项目添加高亮效果
        allItems.forEach(item => {
            item.classList.add('highlight');
        });
        
        // 更强烈的随机跳动效果
        let lastHighlighted = null;
        const highlightInterval = setInterval(() => {
            if (lastHighlighted) {
                lastHighlighted.classList.remove('jump');
            }
            
            const randomIndex = Math.floor(Math.random() * allItems.length);
            lastHighlighted = allItems[randomIndex];
            lastHighlighted.classList.add('jump');
            
        }, 200); // 每200ms切换一次跳动
        
        // 动画结束后
        setTimeout(() => {
            clearInterval(highlightInterval);
            
            // 移除所有动画类
            allItems.forEach(item => {
                item.classList.remove('highlight', 'jump');
            });
            
            // 显示最终结果，带有更强的视觉效果
            selected.forEach((img, index) => {
                const element = document.querySelector(`.image-item[data-id="${img.id}"]`);
                if (element) {
                    element.classList.add('selected');
                    
                    // 添加延迟使选中效果依次显示
                    setTimeout(() => {
                        element.classList.add('selected-final');
                        element.setAttribute('aria-selected', 'true');
                        
                        // 添加庆祝效果(可选)
                        if(index === 0) {
                            createConfetti(element);
                        }
                    }, index * 100);
                }
            });
        }, animationDuration);
    } else {
        // 跳过动画，直接显示结果
        selected.forEach(img => {
            const element = document.querySelector(`.image-item[data-id="${img.id}"]`);
            if (element) {
                element.classList.add('selected', 'selected-final');
                element.setAttribute('aria-selected', 'true');
            }
        });
    }
});

// 重置选择
function resetSelection() {
    document.querySelectorAll('.image-item').forEach(item => {
        item.classList.remove('selected', 'selected-final', 'highlight', 'jump');
        item.setAttribute('aria-selected', 'false');
    });
}

// 更新按钮状态
function updateButtonStates() {
    const hasImages = images.length > 0;
    clearAllBtn.disabled = !hasImages;
    randomBtn.disabled = !hasImages;
    resetSelectionBtn.disabled = !hasImages;
    
    // 设置随机选择的最大值
    randomCountInput.max = images.length;
    if (parseInt(randomCountInput.value) > images.length) {
        randomCountInput.value = images.length;
    }
}

// 创建庆祝彩花效果
function createConfetti(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    for(let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${x}px`;
        confetti.style.top = `${y}px`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.body.appendChild(confetti);
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 3 + Math.random() * 3;
        const rotation = Math.random() * 360;
        
        let posX = x;
        let posY = y;
        let opacity = 1;
        
        const animate = () => {
            posX += Math.cos(angle) * velocity;
            posY += Math.sin(angle) * velocity + 0.5; // 添加重力
            opacity -= 0.02;
            
            confetti.style.transform = `translate(${posX - x}px, ${posY - y}px) rotate(${rotation}deg)`;
            confetti.style.opacity = opacity;
            
            if(opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                confetti.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// 初始化语言切换按钮
document.getElementById('lang-zh').addEventListener('click', () => switchLanguage('zh'));
document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));

// 初始化
switchLanguage(currentLang);
updateGallery();
updateButtonStates();

randomCountInput.value = 1; 
