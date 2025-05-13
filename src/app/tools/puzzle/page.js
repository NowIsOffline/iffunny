'use client';

import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './gameLayout.css';

export default function Page() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [rows, setRows] = useState(4);
    const [cols, setCols] = useState(5);
    const [topEdges, setTopEdges] = useState({});
    const [leftEdges, setLeftEdges] = useState({});
    const [sourceImage, setSourceImage] = useState(null);
    const [curveStrength, setCurveStrength] = useState(0.2); // 弯曲力度参数
    const [curveDirection, setCurveDirection] = useState({}); // 保存每条边的弯曲方向
    const [showBezierControlPoints, setShowBezierControlPoints] = useState(true); // 控制是否绘制贝塞尔曲线顶点

    // 随机生成颜色
    function getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // 计算贝塞尔曲线，使用固定的弯曲方向
    function bezier(p0, p1, p2, p3, steps = 40) {
        const points = [];
        for (let t = 0; t <= 1; t += 1 / steps) {
            const x =
                (1 - t) ** 3 * p0[0] +
                3 * (1 - t) ** 2 * t * p1[0] +
                3 * (1 - t) * t ** 2 * p2[0] +
                t ** 3 * p3[0];
            const y =
                (1 - t) ** 3 * p0[1] +
                3 * (1 - t) ** 2 * t * p1[1] +
                3 * (1 - t) * t ** 2 * p2[1] +
                t ** 3 * p3[1];
            points.push([x, y]);
        }
        return points;
    }

    // 计算贝塞尔曲线时随机化弯曲方向，只在第一次生成时决定
    function generateEdge(x0, y0, x1, y1, dir, row, col) {
        const amp = curveStrength * 30; // 弯曲幅度由 curveStrength 决定

        // 只在第一次生成时随机决定弯曲方向
        if (!curveDirection[`${row},${col}`]) {
            curveDirection[`${row},${col}`] = Math.random() > 0.5 ? 1 : -1; // 随机决定弯曲方向
        }
        const randomOffset = curveDirection[`${row},${col}`]; // 使用固定的方向

        if (curveStrength === 0) {
            // 如果弯曲力度为 0，返回直线
            return [[x0, y0], [x1, y1]];
        }

        if (dir === 'h') {
            // 生成水平直线
            return [[x0, y0], [x1, y1]]; // 这里恢复为直线，不再生成贝塞尔曲线
        } else {
            // 生成垂直贝塞尔曲线
            const p0 = [x0, y0];
            const p3 = [x1, y1];
            const p1 = [x0 + randomOffset * amp, y0 + (y1 - y0) / 3]; // 随机方向
            const p2 = [x0 + randomOffset * amp, y0 + 2 * (y1 - y0) / 3]; // 随机方向
            return bezier(p0, p1, p2, p3);
        }
    }

    // 计算拼图块的顶点位置
    function calculatePuzzleEdges(imageWidth, imageHeight, rows, cols) {
        const top = {};
        const left = {};
        const pw = imageWidth / cols;  // 拼图块宽度
        const ph = imageHeight / rows; // 拼图块高度

        // 生成拼图块的顶点
        for (let r = 0; r <= rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x0 = c * pw;
                const y = r * ph;
                const x1 = x0 + pw;
                // 处理水平线
                top[`${r},${c}`] = [[x0, y], [x1, y]];
            }
        }

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols; c++) {
                const x = c * pw;
                const y0 = r * ph;
                const y1 = y0 + ph;
                // 处理竖直线，内部使用贝塞尔曲线
                left[`${r},${c}`] = c === 0 || c === cols ? [[x, y0], [x, y1]] : generateEdge(x, y0, x, y1, 'v', r, c);
            }
        }

        return { top, left };
    }

    useEffect(() => {
        if (!selectedFile) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const image = new Image();
            image.src = e.target.result;
            setSourceImage(image);

            image.onload = () => {
                const container = document.getElementById('puzzle-container');
                container.innerHTML = '';

                const imgWidth = image.width;
                const imgHeight = image.height;

                const canvas = document.createElement('canvas');
                canvas.width = imgWidth;
                canvas.height = imgHeight;
                container.appendChild(canvas);
                const maxDisplayWidth = 800; // 页面可视区域宽度上限
                const scale = image.width > maxDisplayWidth ? maxDisplayWidth / image.width : 1;

                container.style.transform = `scale(${scale})`;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, imgWidth, imgHeight);

                // 计算拼图的顶点位置
                const { top, left } = calculatePuzzleEdges(imgWidth, imgHeight, rows, cols);
                setTopEdges(top);
                setLeftEdges(left);

                // 绘制拼图的顶点和边缘
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        // 获取拼图块四个顶点
                        const points = [
                            ...top[`${r},${c}`], // 顶部的两个顶点
                            ...left[`${r},${c + 1}`], // 右侧的两个顶点
                            ...[...top[`${r + 1},${c}`]].reverse(), // 底部的两个顶点
                            ...[...left[`${r},${c}`]].reverse(), // 左侧的两个顶点
                        ];
                        if(showBezierControlPoints){
                            // 在每个顶点位置绘制小圆点
                            points.forEach((point, index) => {
                                ctx.beginPath();
                                ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI);

                                // 贝塞尔曲线的顶点绘制为白色，垂直线的顶点绘制为红色
                                if (index % 2 === 1) {
                                    ctx.fillStyle = 'white'; // 贝塞尔曲线顶点
                                } else {
                                    ctx.fillStyle = 'red'; // 垂直方向线的顶点
                                }
                                ctx.fill();
                            });
                        }
                        

                        // 绘制拼图块的边缘
                        ctx.strokeStyle = 'yellow'; // 使用黄色绘制边缘
                        ctx.lineWidth = 2;

                        // 绘制每条边
                        for (let i = 0; i < points.length; i++) {
                            const start = points[i];
                            const end = points[(i + 1) % points.length]; // 获取下一个顶点
                            ctx.beginPath();
                            ctx.moveTo(start[0], start[1]);
                            ctx.lineTo(end[0], end[1]);
                            ctx.stroke();
                        }

                        const bezierPoints = generateEdge(points[0][0], points[0][1], points[1][0], points[1][1], 'h', r, c);
                        bezierPoints.forEach((point) => {
                            ctx.beginPath();
                            ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI);
                            ctx.fillStyle = 'blue'; // 控制点颜色
                            ctx.fill();
                        });
                    }
                }
            };
        };
        reader.readAsDataURL(selectedFile);
    }, [selectedFile, rows, cols, curveStrength, showBezierControlPoints]); // 添加了 `showBezierControlPoints` 作为依赖

    const handleDownloadZip = async () => {
        if (!sourceImage || Object.keys(topEdges).length === 0 || Object.keys(leftEdges).length === 0) return;

        const zip = new JSZip();
        const imgWidth = sourceImage.width;
        const imgHeight = sourceImage.height;
        const pw = imgWidth / cols;
        const ph = imgHeight / rows;

        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = imgWidth;
        sourceCanvas.height = imgHeight;
        const ctx = sourceCanvas.getContext('2d');
        ctx.drawImage(sourceImage, 0, 0);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const path = new Path2D();
                const points = [
                    ...topEdges[`${r},${c}`],
                    ...leftEdges[`${r},${c + 1}`],
                    ...[...topEdges[`${r + 1},${c}`]].reverse(),
                    ...[...leftEdges[`${r},${c}`]].reverse(),
                ];
                path.moveTo(points[0][0], points[0][1]);
                for (let i = 1; i < points.length; i++) {
                    path.lineTo(points[i][0], points[i][1]);
                }
                path.closePath();

                const pieceCanvas = document.createElement('canvas');
                pieceCanvas.width = pw;
                pieceCanvas.height = ph;
                const pieceCtx = pieceCanvas.getContext('2d');

                pieceCtx.save();
                pieceCtx.translate(-c * pw, -r * ph);
                pieceCtx.clip(path);
                pieceCtx.drawImage(sourceCanvas, 0, 0);
                pieceCtx.restore();

                await new Promise((resolve) => {
                    pieceCanvas.toBlob((blob) => {
                        zip.file(`piece_r${r}_c${c}.png`, blob);
                        resolve();
                    });
                });
            }
        }

        const zipContent = await zip.generateAsync({ type: 'blob' });
        saveAs(zipContent, 'puzzle_pieces_hd.zip');
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">高清拼图生成器</h1>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="mb-4"
            />
            <div className="flex gap-4 mb-4">
                <label>
                    行数：
                    <input
                        type="number"
                        min="2"
                        max="10"
                        value={rows}
                        onChange={(e) => setRows(Number(e.target.value))}
                        className="border px-2 py-1 ml-2 w-16"
                    />
                </label>
                <label>
                    列数：
                    <input
                        type="number"
                        min="2"
                        max="10"
                        value={cols}
                        onChange={(e) => setCols(Number(e.target.value))}
                        className="border px-2 py-1 ml-2 w-16"
                    />
                </label>
                <label>
                    弯曲力度：
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={curveStrength}
                        onChange={(e) => setCurveStrength(Number(e.target.value))}
                        className="ml-2"
                    />
                    <span>{curveStrength}</span>
                </label>
                <label>
                    显示贝塞尔曲线顶点：
                    <input
                        type="checkbox"
                        checked={showBezierControlPoints}
                        onChange={() => setShowBezierControlPoints(!showBezierControlPoints)}
                        className="ml-2"
                    />
                </label>
            </div>
            <button onClick={handleDownloadZip} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4" >
                下载拼图 ZIP（高清）
            </button>
            <div id="puzzle-container" className="border w-full min-h-[200px]" />
        </div>
    );
}
