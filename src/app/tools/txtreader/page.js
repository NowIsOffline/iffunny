'use client';
import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import HeadItem from "@/app/headItem";

export default function TxtReader() {
    // 状态管理
    const [fileContent, setFileContent] = useState('');
    const [chapters, setChapters] = useState([]);
    const [currentChapter, setCurrentChapter] = useState(0);
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [fileName, setFileName] = useState('');
    const [encoding, setEncoding] = useState('auto');
    const [fontSize, setFontSize] = useState('16px');
    const [lineHeight, setLineHeight] = useState('1.6');
    const [theme, setTheme] = useState('default');
    const [showSettings, setShowSettings] = useState(false);

    // Refs
    const fileInputRef = useRef(null);
    const readerContentRef = useRef(null);

    // 多语言资源
    const i18nResources = {
        zh: {
            title: "智能TXT小说阅读器",
            selectFile: "选择TXT小说文件",
            noFileSelected: "未选择文件",
            fileEncoding: "文件编码:",
            autoDetect: "自动检测",
            traditionalChinese: "Big5 (繁体)",
            chapterList: "章节目录",
            selectFileFirst: "请先选择小说文件",
            progress: "进度: ",
            prevChapter: "上一章",
            nextChapter: "下一章",
            contentPlaceholder: "内容将在这里显示...",
            readingSettings: "阅读设置 (点击展开)",
            fontSize: "字体大小",
            small: "小",
            medium: "中",
            large: "大",
            xlarge: "特大",
            lineHeight: "行间距",
            tight: "紧凑",
            normal: "适中",
            loose: "宽松",
            xloose: "很宽松",
            themeColor: "主题颜色",
            default: "默认",
            darkMode: "暗黑模式",
            eyeProtection: "护眼模式",
            greenTheme: "绿意盎然",
            blueTheme: "蓝色海洋",
            appName: "智能TXT阅读器",
            featureDesc: "中英文双语版",
            privacyNotice: "所有内容均在本地处理，保护您的隐私",
            preface: "序章",
            fullText: "全文"
        },
        en: {
            title: "Smart TXT Novel Reader",
            selectFile: "Select TXT File",
            noFileSelected: "No file selected",
            fileEncoding: "File Encoding:",
            autoDetect: "Auto Detect",
            traditionalChinese: "Big5 (Traditional)",
            chapterList: "Chapters",
            selectFileFirst: "Please select a file first",
            progress: "Progress: ",
            prevChapter: "Previous",
            nextChapter: "Next",
            contentPlaceholder: "Content will be displayed here...",
            readingSettings: "Reading Settings (Click to expand)",
            fontSize: "Font Size",
            small: "Small",
            medium: "Medium",
            large: "Large",
            xlarge: "X-Large",
            lineHeight: "Line Height",
            tight: "Tight",
            normal: "Normal",
            loose: "Loose",
            xloose: "X-Loose",
            themeColor: "Theme Color",
            default: "Default",
            darkMode: "Dark Mode",
            eyeProtection: "Eye Protection",
            greenTheme: "Green Theme",
            blueTheme: "Blue Theme",
            appName: "Smart TXT Reader",
            featureDesc: "Bilingual Version",
            privacyNotice: "All content processed locally, protecting your privacy",
            preface: "Preface",
            fullText: "Full Text"
        }
    };

    // 获取当前语言文本
    const t = (key) => i18nResources[currentLanguage][key] || key;

    // 处理文件选择
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);

        try {
            const buffer = await file.arrayBuffer();
            let detectedEncoding = encoding;

            if (encoding === 'auto') {
                detectedEncoding = await detectEncoding(buffer);
            }

            const content = await decodeContent(buffer, detectedEncoding);
            setFileContent(content);
            parseChapters(content);
        } catch (error) {
            console.error("Error reading file:", error);
            alert(t('errorReadingFile'));
        }
    };

    // 检测文件编码
    const detectEncoding = (buffer) => {
        return new Promise((resolve) => {
            const arr = new Uint8Array(buffer);

            // 简单的BOM检测
            if (arr.length >= 3 && arr[0] === 0xEF && arr[1] === 0xBB && arr[2] === 0xBF) {
                resolve('UTF-8');
                return;
            }

            // 尝试UTF-8解码
            try {
                const decoder = new TextDecoder('UTF-8', {fatal: true});
                decoder.decode(arr.slice(0, 1024));
                resolve('UTF-8');
                return;
            } catch (e) {}

            // 尝试常见中文编码
            const chineseEncodings = ['GBK', 'GB18030', 'Big5'];
            for (let enc of chineseEncodings) {
                try {
                    const decoder = new TextDecoder(enc, {fatal: true});
                    decoder.decode(arr.slice(0, 1024));
                    resolve(enc);
                    return;
                } catch (e) {}
            }

            // 默认使用GB18030
            resolve('GB18030');
        });
    };

    // 解码内容
    const decodeContent = (buffer, encoding) => {
        return new Promise((resolve, reject) => {
            try {
                const decoder = new TextDecoder(encoding);
                let content = decoder.decode(new Uint8Array(buffer));
                content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                resolve(content);
            } catch (error) {
                reject(error);
            }
        });
    };

    // 解析章节
    const parseChapters = (content) => {
        const newChapters = [];
        const regex = /(^|\n)([第][0-9零一二三四五六七八九十百千]+[章卷][^\n]*)\n/g;

        let lastIndex = 0;
        let firstChapterIndex = -1;
        let match;

        while ((match = regex.exec(content)) !== null) {
            const title = match[2].trim();
            const start = match.index + match[0].length;

            if (firstChapterIndex === -1) {
                firstChapterIndex = match.index;
            }

            if (newChapters.length > 0) {
                newChapters[newChapters.length - 1].end = match.index;
                newChapters[newChapters.length - 1].content = content.substring(
                    newChapters[newChapters.length - 1].start,
                    newChapters[newChapters.length - 1].end
                );
            } else if (match.index > 0) {
                newChapters.push({
                    title: t('preface'),
                    start: 0,
                    end: match.index,
                    content: content.substring(0, match.index)
                });
            }

            newChapters.push({
                title: title,
                start: start,
                end: content.length,
                content: ""
            });
        }

        if (newChapters.length === 0) {
            newChapters.push({
                title: t('fullText'),
                start: 0,
                end: content.length,
                content: content
            });
        } else {
            newChapters[newChapters.length - 1].end = content.length;
            newChapters[newChapters.length - 1].content = content.substring(
                newChapters[newChapters.length - 1].start,
                newChapters[newChapters.length - 1].end
            );
        }

        setChapters(newChapters);
        setCurrentChapter(0);
    };

    // 跳转到章节
    const goToChapter = (index) => {
        if (index >= 0 && index < chapters.length) {
            setCurrentChapter(index);
            if (readerContentRef.current) {
                readerContentRef.current.scrollTop = 0;
            }
        }
    };

    // 上一章
    const goToPrevChapter = () => {
        if (currentChapter > 0) {
            setCurrentChapter(currentChapter - 1);
        }
    };

    // 下一章
    const goToNextChapter = () => {
        if (currentChapter < chapters.length - 1) {
            setCurrentChapter(currentChapter + 1);
        }
    };

    // 切换语言
    const switchLanguage = (lang) => {
        if (lang !== currentLanguage) {
            setCurrentLanguage(lang);

            // 更新章节标题
            if (chapters.length > 0) {
                const updatedChapters = [...chapters];
                if (updatedChapters[0].title === t('preface', { language: currentLanguage })) {
                    updatedChapters[0].title = t('preface');
                }
                if (updatedChapters.length === 1 && updatedChapters[0].title === t('fullText', { language: currentLanguage })) {
                    updatedChapters[0].title = t('fullText');
                }
                setChapters(updatedChapters);
            }
        }
    };

    // 计算阅读进度
    const calculateProgress = () => {
        if (chapters.length === 0) return 0;

        let readChars = 0;
        for (let i = 0; i < currentChapter; i++) {
            readChars += chapters[i].content.length;
        }

        const totalChars = fileContent.length;
        return Math.round((readChars / totalChars) * 100);
    };

    // 应用主题样式
    const themeStyles = {
        default: {
            '--bg-color': '#fff',
            '--text-color': '#333',
            '--container-bg': '#fff',
            '--sidebar-bg': '#fafafa',
            '--reader-bg': '#fff',
            '--reader-text': '#333',
            '--control-bg': '#f0f0f0',
            '--hover-bg': '#e6f2ff',
            '--current-bg': '#d4e6ff'
        },
        dark: {
            '--bg-color': '#222',
            '--text-color': '#eee',
            '--container-bg': '#333',
            '--sidebar-bg': '#444',
            '--reader-bg': '#333',
            '--reader-text': '#eee',
            '--control-bg': '#444',
            '--hover-bg': '#555',
            '--current-bg': '#666'
        },
        sepia: {
            '--bg-color': '#f4ecd8',
            '--text-color': '#5b4636',
            '--container-bg': '#f8f1e0',
            '--sidebar-bg': '#f0e6d2',
            '--reader-bg': '#f8f1e0',
            '--reader-text': '#5b4636',
            '--control-bg': '#e6d9c5',
            '--hover-bg': '#e0d4b8',
            '--current-bg': '#d8c9a8'
        },
        green: {
            '--bg-color': '#e8f5e9',
            '--text-color': '#2e7d32',
            '--container-bg': '#f1f8e9',
            '--sidebar-bg': '#e0f2e1',
            '--reader-bg': '#f1f8e9',
            '--reader-text': '#1b5e20',
            '--control-bg': '#dcedc8',
            '--hover-bg': '#c8e6c9',
            '--current-bg': '#a5d6a7'
        },
        blue: {
            '--bg-color': '#e3f2fd',
            '--text-color': '#0d47a1',
            '--container-bg': '#e8eaf6',
            '--sidebar-bg': '#d9ddf1',
            '--reader-bg': '#e8eaf6',
            '--reader-text': '#1a237e',
            '--control-bg': '#c5cae9',
            '--hover-bg': '#b3c1f1',
            '--current-bg': '#9fa8da'
        }
    };

    // 应用主题
    const applyTheme = (themeName) => {
        const styles = themeStyles[themeName] || themeStyles.default;
        Object.entries(styles).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
        setTheme(themeName);
    };

    // 键盘导航
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (chapters.length === 0) return;

            switch (e.key) {
                case 'ArrowLeft':
                case 'PageUp':
                    goToPrevChapter();
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'PageDown':
                    goToNextChapter();
                    e.preventDefault();
                    break;
                case 'Home':
                    goToChapter(0);
                    e.preventDefault();
                    break;
                case 'End':
                    goToChapter(chapters.length - 1);
                    e.preventDefault();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [chapters, currentChapter]);

    // 初始化主题
    useEffect(() => {
        applyTheme('default');
    }, []);

    return (
        <div>
            <HeadItem title="TXT reader"
                      iconUrl="/icon/small/education/education.png"></HeadItem>
            <div className="language-switcher">
                <button
                    className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
                    onClick={() => switchLanguage('en')}
                >
                    English
                </button>
                <button
                    className={`lang-btn ${currentLanguage === 'zh' ? 'active' : ''}`}
                    onClick={() => switchLanguage('zh')}
                >
                    中文
                </button>
            </div>

            <div className="container">
                <h1>{t('title')}</h1>

                <div className="file-upload">
                    <input
                        type="file"
                        id="fileInput"
                        ref={fileInputRef}
                        className="file-input"
                        accept=".txt"
                        onChange={handleFileSelect}
                    />
                    <button
                        className="upload-btn"
                        onClick={() => fileInputRef.current.click()}
                    >
                        {t('selectFile')}
                    </button>
                    <div className="file-info">
                        <div className="file-name">
                            {fileName || t('noFileSelected')}
                        </div>
                        <div className="encoding-selector">
                            <label htmlFor="encoding">{t('fileEncoding')}</label>
                            <select
                                id="encoding"
                                value={encoding}
                                onChange={(e) => setEncoding(e.target.value)}
                            >
                                <option value="auto">{t('autoDetect')}</option>
                                <option value="UTF-8">UTF-8</option>
                                <option value="GBK">GBK</option>
                                <option value="GB18030">GB18030</option>
                                <option value="Big5">{t('traditionalChinese')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="sidebar">
                    <h3>{t('chapterList')}</h3>
                    <div className="chapter-list">
                        {chapters.length > 0 ? (
                            chapters.map((chapter, index) => (
                                <div
                                    key={index}
                                    className={`chapter-item ${index === currentChapter ? 'current' : ''}`}
                                    onClick={() => goToChapter(index)}
                                >
                                    {chapter.title}
                                </div>
                            ))
                        ) : (
                            <div className="chapter-item">{t('selectFileFirst')}</div>
                        )}
                    </div>
                    <div className="progress-info">
                        {t('progress')}{calculateProgress()}%
                    </div>
                </div>

                <div className="reader-container" style={{ display: chapters.length > 0 ? 'flex' : 'none' }}>
                    <div className="reader-controls">
                        <button
                            className="control-btn"
                            onClick={goToPrevChapter}
                            disabled={currentChapter <= 0}
                        >
                            {t('prevChapter')}
                        </button>
                        <span>{chapters[currentChapter]?.title || ''}</span>
                        <button
                            className="control-btn"
                            onClick={goToNextChapter}
                            disabled={currentChapter >= chapters.length - 1}
                        >
                            {t('nextChapter')}
                        </button>
                    </div>
                    <div
                        className="reader-content"
                        ref={readerContentRef}
                        style={{
                            fontSize: fontSize,
                            lineHeight: lineHeight
                        }}
                    >
                        {chapters[currentChapter]?.content || t('contentPlaceholder')}
                    </div>
                </div>

                <div className="settings" onClick={() => setShowSettings(!showSettings)}>
                    <div className="settings-title">{t('readingSettings')}</div>
                    <div className="setting-row" style={{ opacity: showSettings ? 1 : 0, height: showSettings ? 'auto' : 0 }}>
                        <div className="setting-group">
                            <label htmlFor="fontSize">{t('fontSize')}</label>
                            <select
                                id="fontSize"
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                            >
                                <option value="14px">{t('small')}</option>
                                <option value="16px">{t('medium')}</option>
                                <option value="18px">{t('large')}</option>
                                <option value="20px">{t('xlarge')}</option>
                            </select>
                        </div>
                        <div className="setting-group">
                            <label htmlFor="lineHeight">{t('lineHeight')}</label>
                            <select
                                id="lineHeight"
                                value={lineHeight}
                                onChange={(e) => setLineHeight(e.target.value)}
                            >
                                <option value="1.4">{t('tight')}</option>
                                <option value="1.6">{t('normal')}</option>
                                <option value="1.8">{t('loose')}</option>
                                <option value="2.0">{t('xloose')}</option>
                            </select>
                        </div>
                        <div className="setting-group">
                            <label>{t('themeColor')}</label>
                            <div className="theme-selector">
                                {Object.keys(themeStyles).map((themeName) => (
                                    <div
                                        key={themeName}
                                        className={`theme-option ${theme === themeName ? 'selected' : ''}`}
                                        data-theme={themeName}
                                        style={{ background: themeStyles[themeName]['--bg-color'] }}
                                        onClick={() => applyTheme(themeName)}
                                        title={t(themeName)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer">
                    <p>© 2025 {t('appName')} - {t('featureDesc')}</p>
                    <p>{t('privacyNotice')}</p>
                </div>
            </div>

            <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Microsoft YaHei", "SimSun", sans-serif;
        }
        body {
          background-color: var(--bg-color);
          color: var(--text-color);
          line-height: 1.6;
          padding: 20px;
          transition: background-color 0.3s, color 0.3s;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background-color: var(--container-bg);
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 10px;
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 15px;
          transition: background-color 0.3s, box-shadow 0.3s;
        }
        h1 {
          grid-column: 1 / -1;
          text-align: center;
          margin: 10px 0;
          color: var(--text-color);
          transition: color 0.3s;
        }
        .file-upload {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 5px;
          padding: 10px;
          border: 2px dashed #ccc;
          border-radius: 5px;
          background-color: #f9f9f9;
          transition: all 0.3s;
          height: 60px;
          overflow: hidden;
        }
        .file-upload:hover {
          height: auto;
          border-color: #3498db;
        }
        .file-input {
          display: none;
        }
        .upload-btn {
          background-color: #3498db;
          color: white;
          padding: 8px 15px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 8px;
          transition: background-color 0.3s;
        }
        .upload-btn:hover {
          background-color: #2980b9;
        }
        .file-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .file-name {
          margin-top: 5px;
          font-size: 13px;
          color: #666;
          text-align: center;
          word-break: break-all;
          transition: color 0.3s;
        }
        .encoding-selector {
          margin-top: 8px;
          width: 100%;
          max-width: 280px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .file-upload:hover .encoding-selector {
          opacity: 1;
        }
        .sidebar {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 180px);
        }
        .chapter-list {
          flex: 1;
          overflow-y: auto;
          border: 1px solid #eee;
          border-radius: 5px;
          padding: 8px;
          background-color: var(--sidebar-bg);
          transition: background-color 0.3s, border-color 0.3s;
        }
        .chapter-item {
          padding: 6px 8px;
          margin-bottom: 4px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .chapter-item:hover {
          background-color: var(--hover-bg);
        }
        .chapter-item.current {
          background-color: var(--current-bg);
          font-weight: bold;
        }
        .reader-container {
          display: none;
          flex-direction: column;
          height: calc(100vh - 180px);
        }
        .reader-controls {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px;
          background-color: var(--control-bg);
          border-radius: 5px;
          align-items: center;
          transition: background-color 0.3s;
        }
        .progress-info {
          font-size: 13px;
          color: #666;
          transition: color 0.3s;
        }
        .control-btn {
          background-color: #3498db;
          color: white;
          padding: 4px 12px;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 13px;
          transition: background-color 0.3s;
        }
        .control-btn:hover {
          background-color: #2980b9;
        }
        .control-btn:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        .reader-content {
          padding: 15px;
          line-height: var(--line-height);
          font-size: var(--font-size);
          background-color: var(--reader-bg);
          color: var(--reader-text);
          border: 1px solid #eee;
          border-radius: 5px;
          flex: 1;
          white-space: pre-wrap;
          overflow-y: auto;
          transition: background-color 0.3s, color 0.3s, border-color 0.3s;
        }
        .settings {
          margin-top: 10px;
          padding: 5px;
          background-color: #f9f9f9;
          border-radius: 5px;
          grid-column: 1 / -1;
          transition: background-color 0.3s;
          height: 40px;
          overflow: hidden;
          cursor: pointer;
        }
        .settings:hover {
          height: auto;
          padding: 15px;
        }
        .setting-row {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          opacity: 0;
          transition: opacity 0.3s;
          height: 0;
          overflow: hidden;
        }
        .settings:hover .setting-row,
        .settings.expanded .setting-row {
          opacity: 1;
          height: auto;
        }
        .setting-group {
          margin-bottom: 10px;
        }
        label {
          display: block;
          margin-bottom: 3px;
          font-weight: bold;
          font-size: 13px;
          transition: color 0.3s;
        }
        select {
          padding: 6px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 100%;
          max-width: 200px;
          font-size: 13px;
          transition: background-color 0.3s, border-color 0.3s, color 0.3s;
        }
        .theme-selector {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        .theme-option {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid transparent;
          transition: transform 0.2s;
        }
        .theme-option:hover {
          transform: scale(1.1);
        }
        .theme-option.selected {
          border-color: #333;
          transform: scale(1.1);
        }
        .settings-title {
          text-align: center;
          margin: 5px 0;
          font-size: 14px;
          cursor: pointer;
        }
        .footer {
          text-align: center;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px solid #eee;
          color: #777;
          font-size: 12px;
          grid-column: 1 / -1;
          transition: color 0.3s, border-color 0.3s;
        }
        .language-switcher {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 10px;
        }
        .lang-btn {
          background: none;
          border: 1px solid #ccc;
          border-radius: 3px;
          padding: 2px 8px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s;
        }
        .lang-btn.active {
          background-color: #3498db;
          color: white;
          border-color: #3498db;
        }
        @media (max-width: 768px) {
          .container {
            grid-template-columns: 1fr;
          }
          .sidebar, .reader-container {
            height: auto;
            max-height: 300px;
          }
          .reader-content {
            font-size: 16px;
            padding: 10px;
          }
          .chapter-list {
            max-height: 200px;
            margin-bottom: 15px;
          }
        }
      `}</style>
        </div>
    );
}