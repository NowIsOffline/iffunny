// pages/index.js
'use client';
import style from "./style.css"
import React, { useState, useEffect } from 'react';
import HeadItem from "@/app/headItem";

const translations = {
    en: {
        title: "choice-helper",
        subtitle: "Helping you make decisions easily",
        uploadText: "Add images",
        clearAllText: "Clear All",
        randomCountLabel: "Number to select:",
        randomBtnText: "Random Select",
        resetSelectionText: "Reset Selection",
        footerText: "© 2025 Indecisive Helper - Helping you decide",
        noImagesWarning: "Please upload some images first",
        tooManySelected: "Number to select cannot exceed total images",
        selectedText: "Selected",
        skipAnimationText: "Skip animation",
        uploadAreaLabel: "Click or drag images here to upload",
        removeBtnText: "x",
        randomHeading: "Random Selection",
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
        footerText: "© 2025 选择困难症助手 - 帮助您轻松做出决定",
        noImagesWarning: "请先上传一些图片",
        tooManySelected: "选择数量不能超过图片总数",
        selectedText: "已选择",
        skipAnimationText: "跳过动画",
        uploadAreaLabel: "点击或拖放图片到这里上传",
        removeBtnText: "x",
        randomHeading: "随机选择",
        optionsLabel: "选项"
    }
};

const IndexPage = () => {
    const [currentLang, setCurrentLang] = useState('en');
    const [images, setImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [skipAnimation, setSkipAnimation] = useState(false);
    const [randomCount, setRandomCount] = useState(1);

    const switchLanguage = (lang) => {
        setCurrentLang(lang);
        document.documentElement.lang = lang;
    };

    const handleFileSelect = (event) => {
        const files = event.target.files;
        if (!files.length) return;

        const newImages = Array.from(files)
            .filter(file => file.type.startsWith('image/'))
            .map(file => ({
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                src: URL.createObjectURL(file),
                file
            }));

        setImages((prevImages) => [...prevImages, ...newImages]);
    };

    const removeImage = (id) => {
        setImages((prevImages) => prevImages.filter(img => img.id !== id));
    };

    const clearAllImages = () => {
        setImages([]);
        resetSelection(); // 重置所有的选中状态
    };

    const randomSelect = () => {
        // 清除上一轮的选择
        resetSelection();

        let count = randomCount;
        if (count > images.length) {
            alert(translations[currentLang].tooManySelected);
            return;
        }

        const shuffled = [...images].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);

        setSelectedImages(selected);

        // 只有在点击随机选择时才播放动画
        if (!skipAnimation) {
            playAnimation(selected); // 播放动画
        }
    };

    const handleRandomCountChange = (e) => {
        const count = Math.max(1, Math.min(images.length, e.target.value));
        setRandomCount(count);
    };

    const handleSkipAnimationToggle = () => {
        setSkipAnimation(prev => !prev);
    };

    const resetSelection = () => {
        setSelectedImages([]);
        document.querySelectorAll('.image-item').forEach(item => {
            item.classList.remove('selected', 'highlight', 'selected-final', 'jump');
            item.setAttribute('aria-selected', 'false');
        });
    };

    // 用于播放动画
    const playAnimation = (selected) => {
        const allItems = document.querySelectorAll('.image-item');
        allItems.forEach(item => {
            item.classList.add('highlight');
        });

        let lastHighlighted = null;
        const highlightInterval = setInterval(() => {
            if (lastHighlighted) {
                lastHighlighted.classList.remove('jump');
            }

            const randomIndex = Math.floor(Math.random() * allItems.length);
            lastHighlighted = allItems[randomIndex];
            lastHighlighted.classList.add('jump');
        }, 200); // 每200ms切换一次跳动

        setTimeout(() => {
            clearInterval(highlightInterval);

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
                    }, index * 100);
                }
            });
        }, 2000); // 动画时长为2秒
    };

    useEffect(() => {
        if (selectedImages.length > 0 && skipAnimation) {
            // 如果跳过动画，直接显示选中的图片
            selectedImages.forEach(img => {
                const element = document.querySelector(`.image-item[data-id="${img.id}"]`);
                if (element) {
                    element.classList.add('selected', 'selected-final');
                    element.setAttribute('aria-selected', 'true');
                }
            });
        }
    }, [selectedImages, skipAnimation]); // 监听 selectedImages 和 skipAnimation 的变化

    return (
        <div className="container">
            <HeadItem title="choice-helper"
                      iconUrl="/icon/small/choice-helper/favicon.png"></HeadItem>
            <header role="banner">
                <h1>{translations[currentLang].title}</h1>
                <h2>{translations[currentLang].subtitle}</h2>
                <div className="language-switcher" aria-label="Language Switcher">
                    <button onClick={() => switchLanguage('en')}>English</button>
                    <button onClick={() => switchLanguage('zh')}>中文</button>
                </div>
            </header>

            <main role="main">
                <section className="gallery-section" aria-labelledby="gallery-heading">
                    <h2 id="gallery-heading" className="visually-hidden">{translations[currentLang].randomHeading}</h2>
                    <div className="image-gallery" role="list">
                        {images.length === 0 ? (
                            <p>{translations[currentLang].noImagesWarning}</p>
                        ) : (
                            images.map((image, index) => (
                                <div className="image-item" key={image.id} role="listitem" data-id={image.id}>
                                    <img src={image.src} alt={`${translations[currentLang].optionsLabel} ${index + 1}`} />
                                    <button className="remove-btn" onClick={() => removeImage(image.id)}>
                                        {translations[currentLang].removeBtnText}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="upload-container">
                        <input type="file" id="fileInput" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
                        <button onClick={() => document.getElementById('fileInput').click()}>
                            {translations[currentLang].uploadText}
                        </button>
                        <button onClick={clearAllImages}>
                            {translations[currentLang].clearAllText}
                        </button>
                    </div>
                </section>

                <section className="random-section">
                    <h2>{translations[currentLang].randomHeading}</h2>
                    <div className="input-group">
                        <label>{translations[currentLang].randomCountLabel}</label>
                        <input type="number" value={randomCount} min="1" max={images.length} onChange={handleRandomCountChange} />
                    </div>
                    <div className="toggle-group">
                        <label className="toggle-label">
                            <input type="checkbox" checked={skipAnimation} onChange={handleSkipAnimationToggle} />
                            <span className="toggle-slider"></span>
                            {translations[currentLang].skipAnimationText}
                        </label>
                    </div>
                    <button onClick={randomSelect}>
                        {translations[currentLang].randomBtnText}
                    </button>
                    <button onClick={resetSelection}>
                        {translations[currentLang].resetSelectionText}
                    </button>
                </section>
            </main>

            <footer role="contentinfo">
                <p>{translations[currentLang].footerText}</p>
            </footer>
        </div>
    );
};

export default IndexPage;
