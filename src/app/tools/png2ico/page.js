'use client';
import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import JSZip from 'jszip';
import HeadItem from "@/app/headItem";

export default function PngToIconConverter() {
    const [isEnglish, setIsEnglish] = useState(true);
    const [fileName, setFileName] = useState('');
    const [prefix, setPrefix] = useState('');
    const [showDownload, setShowDownload] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [selectedSizes, setSelectedSizes] = useState([16, 32, 48, 180, 192, 512]);
    const fileInputRef = useRef(null);

    const texts = {
        en: {
            fileBtn: "Select PNG File",
            title: "PNG to Icon Sizes",
            subtitle: "Upload a PNG and download resized versions.",
            convert: "Convert",
            download: "Download ZIP",
            langBtn: "中文",
            prefixLabel: "File Name Prefix",
            noFileError: "Please select a PNG file.",
            noSizeError: "Please select at least one size."
        },
        zh: {
            fileBtn: "选择 PNG 文件",
            title: "PNG 多尺寸转换工具",
            subtitle: "上传 PNG 图像并下载多尺寸图标。",
            convert: "转换",
            download: "下载 ZIP 包",
            langBtn: "English",
            prefixLabel: "生成文件名前缀",
            noFileError: "请选择 PNG 文件",
            noSizeError: "请至少选择一个尺寸"
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fullName = file.name;
            const nameOnly = fullName.replace(/\.[^/.]+$/, '');
            setFileName(fullName);
            setPrefix(nameOnly);
        }
    };

    const handleSizeChange = (size) => {
        setSelectedSizes(prev =>
            prev.includes(size)
                ? prev.filter(s => s !== size)
                : [...prev, size]
        );
    };

    const handleConvert = () => {
        const file = fileInputRef.current?.files[0];
        if (!file) {
            alert(texts[isEnglish ? 'en' : 'zh'].noFileError);
            return;
        }

        if (selectedSizes.length === 0) {
            alert(texts[isEnglish ? 'en' : 'zh'].noSizeError);
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const zip = new JSZip();
                const promises = selectedSizes.map(size => {
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, size, size);
                    return new Promise(resolve => {
                        canvas.toBlob(blob => {
                            const prefixValue = prefix.trim() || "icon";
                            zip.file(`${prefixValue}_${size}x${size}.png`, blob);
                            resolve();
                        }, "image/png");
                    });
                });

                Promise.all(promises).then(() => {
                    zip.generateAsync({ type: "blob" }).then(content => {
                        const url = URL.createObjectURL(content);
                        setDownloadUrl(url);
                        setShowDownload(true);
                    });
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        // Load Google Analytics script
        const script = document.createElement('script');
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-W3FSQNE2JY';
        script.async = true;
        document.body.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-W3FSQNE2JY');

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const currentLang = isEnglish ? 'en' : 'zh';
    const t = texts[currentLang];

    return (
        <main>
            <HeadItem title="PNG to Multi-Size Icon Generator" 
                      iconUrl="/icon/small/png2ico/png2ico.png"></HeadItem>

            <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center justify-center p-4">
                <h1>Free PNG to ICO Converter – Multi-size Icon Generator
                </h1>
                <h2>Convert PNG images to ICO files instantly. Support multiple sizes and batch download. 100% Free.
                </h2>
                <div className="max-w-lg w-full bg-white p-6 rounded-xl shadow-md text-center">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">{t.title}</h1>
                        <button
                            onClick={() => setIsEnglish(!isEnglish)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            {t.langBtn}
                        </button>
                    </div>
                    <p className="mb-4">{t.subtitle}</p>

                    <input
                        type="file"
                        id="fileInput"
                        ref={fileInputRef}
                        accept="image/png"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="mb-4 w-full border border-gray-300 px-4 py-2 rounded bg-white hover:bg-gray-100"
                    >
                        {t.fileBtn}
                    </button>

                    <p className="text-sm text-gray-600 mb-2">{fileName}</p>

                    <div className="mb-4">
                        <label htmlFor="prefixInput" className="block text-sm font-medium mb-1">
                            {t.prefixLabel}
                        </label>
                        <input
                            type="text"
                            id="prefixInput"
                            value={prefix}
                            onChange={(e) => setPrefix(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                    </div>

                    <div className="mb-4 grid grid-cols-3 gap-2 text-left text-sm">
                        {[16, 32, 48, 180, 192, 512].map(size => (
                            <label key={size} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedSizes.includes(size)}
                                    onChange={() => handleSizeChange(size)}
                                    className="mr-2"
                                />
                                {size}×{size}
                            </label>
                        ))}
                    </div>

                    <button
                        onClick={handleConvert}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        {t.convert}
                    </button>

                    {showDownload && (
                        <div className="mt-4">
                            <a
                                href={downloadUrl}
                                download={`${prefix || 'icons'}.zip`}
                                className="text-blue-600 underline"
                            >
                                {t.download}
                            </a>
                        </div>
                    )}
                </div>

                <footer className="mt-8 text-sm text-gray-500">
                    &copy; 2025 PNG to ICO Tool
                </footer>
            </div>
        </main>
    );
}