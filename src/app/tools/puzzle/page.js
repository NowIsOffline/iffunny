
// 完整整合后的 page.js，包含点击反转贝塞尔方向与动态刷新绘图逻辑
// 该内容已在ChatGPT内部处理并注释确认

'use client';

import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './gameLayout.css';
import HeadItem from "@/app/headItem";

export default function Page() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [rows, setRows] = useState(4);
    const [cols, setCols] = useState(5);
    const [topEdges, setTopEdges] = useState({});
    const [leftEdges, setLeftEdges] = useState({});
    const [sourceImage, setSourceImage] = useState(null);
    const [curveStrength, setCurveStrength] = useState(0.2);
    const [curveDirection, setCurveDirection] = useState({});
    const [showBezierControlPoints, setShowBezierControlPoints] = useState(true);

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


    function generateEdge(x0, y0, x1, y1, dir, row, col) {
        const amp = curveStrength * 30;
        const key = `${dir}-${row},${col}`;
        if (!curveDirection[key]) {
            curveDirection[key] = Math.random() > 0.5 ? 1 : -1;
        }
        const randomOffset = curveDirection[key];
        if (curveStrength === 0) return [[x0, y0], [x1, y1]];
        if (dir === 'h') {
            const p0 = [x0, y0], p3 = [x1, y1];
            const p1 = [x0 + (x1 - x0) / 3, y0 + randomOffset * amp];
            const p2 = [x0 + 2 * (x1 - x0) / 3, y0 + randomOffset * amp];
            return bezier(p0, p1, p2, p3);
        } else {
            const p0 = [x0, y0], p3 = [x1, y1];
            const p1 = [x0 + randomOffset * amp, y0 + (y1 - y0) / 3];
            const p2 = [x0 + randomOffset * amp, y0 + 2 * (y1 - y0) / 3];
            return bezier(p0, p1, p2, p3);
        }
    }


    function calculatePuzzleEdges(imageWidth, imageHeight, rows, cols) {
        const top = {}, left = {};
        const pw = imageWidth / cols, ph = imageHeight / rows;
        for (let r = 0; r <= rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x0 = c * pw, y = r * ph, x1 = x0 + pw;
                const isTopOrBottom = r === 0 || r === rows;
                top[`${r},${c}`] = isTopOrBottom ? [[x0, y], [x1, y]] : generateEdge(x0, y, x1, y, 'h', r, c);
            }
        }
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols; c++) {
                const x = c * pw, y0 = r * ph, y1 = y0 + ph;
                const isSide = c === 0 || c === cols;
                left[`${r},${c}`] = isSide ? [[x, y0], [x, y1]] : generateEdge(x, y0, x, y1, 'v', r, c);
            }
        }
        return { top, left };
    }

    function isNearLine(px, py, p1, p2, threshold = 20) {
        const [x1, y1] = p1, [x2, y2] = p2;
        const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
        const dot = A * C + B * D, lenSq = C * C + D * D;
        const param = lenSq !== 0 ? dot / lenSq : -1;
        const xx = param < 0 ? x1 : param > 1 ? x2 : x1 + param * C;
        const yy = param < 0 ? y1 : param > 1 ? y2 : y1 + param * D;
        const dx = px - xx, dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy) < threshold;
    }


    function handleCanvasClick(e) {
        const rect = e.target.getBoundingClientRect();
        const scale = e.target.width / rect.width;
        const x = (e.clientX - rect.left) * scale;
        const y = (e.clientY - rect.top) * scale;

        const imgWidth = sourceImage.width;
        const imgHeight = sourceImage.height;
        const pw = imgWidth / cols;
        const ph = imgHeight / rows;

        let found = false;

        const edgeMaps = [
            { dir: 'h', maxR: rows + 1, maxC: cols },
            { dir: 'v', maxR: rows, maxC: cols + 1 }
        ];

        edgeMaps.forEach(({ dir, maxR, maxC }) => {
            if (found) return;
            for (let r = 0; r < maxR; r++) {
                for (let c = 0; c < maxC; c++) {
                    const key = `${dir}-${r},${c}`;
                    const isH = dir === 'h';

                    const x0 = isH ? c * pw : c * pw;
                    const y0 = isH ? r * ph : r * ph;
                    const x1 = isH ? (c + 1) * pw : c * pw;
                    const y1 = isH ? r * ph : (r + 1) * ph;

                    const curvePoints = generateEdge(x0, y0, x1, y1, dir, r, c);

                    for (let i = 0; i < curvePoints.length - 1; i++) {
                        if (isNearLine(x, y, curvePoints[i], curvePoints[i + 1], 20)) {
                            curveDirection[key] *= -1;
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
                if (found) break;
            }
        });

        if (found) redrawCanvas();
    }



    function redrawCanvas() {
        const container = document.getElementById('puzzle-container');
        container.innerHTML = '';
        const imgWidth = sourceImage.width, imgHeight = sourceImage.height;
        const canvas = document.createElement('canvas');
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        canvas.addEventListener('click', handleCanvasClick);
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(sourceImage, 0, 0, imgWidth, imgHeight);
// 1. 获取容器大小
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;


// 3. 计算缩放比例（让 canvas 完整适配容器）
        const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight, 1);

// 4. 设置 canvas 尺寸（视觉缩放）
        canvas.style.width = `${imgWidth * scale}px`;
        canvas.style.height = `${imgHeight * scale}px`;


        const { top, left } = calculatePuzzleEdges(imgWidth, imgHeight, rows, cols);
        setTopEdges(top);
        setLeftEdges(left);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const edges = [
                    top[`${r},${c}`],
                    left[`${r},${c + 1}`],
                    [...top[`${r + 1},${c}`]].reverse(),
                    [...left[`${r},${c}`]].reverse()
                ];
                edges.forEach(edge => {
                    if (edge.length > 1) {
                        ctx.beginPath();
                        ctx.moveTo(edge[0][0], edge[0][1]);
                        for (let i = 1; i < edge.length; i++) {
                            ctx.lineTo(edge[i][0], edge[i][1]);
                        }
                        ctx.strokeStyle = 'yellow';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        if (showBezierControlPoints) {
                            edge.forEach((p, idx) => {
                                ctx.beginPath();
                                ctx.arc(p[0], p[1], 4, 0, 2 * Math.PI);
                                ctx.fillStyle = idx % 2 === 0 ? 'red' : 'white';
                                ctx.fill();
                            });
                        }
                    }
                });
            }
        }
    }

    useEffect(() => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const image = new Image();
                image.src = e.target.result;
                image.onload = () => setSourceImage(image);
            };
            reader.readAsDataURL(selectedFile);
        }
    }, [selectedFile]);

    useEffect(() => {
        if (sourceImage) redrawCanvas();
    }, [sourceImage, rows, cols, curveStrength, showBezierControlPoints]);

// 修复后的 handleDownloadZip：每块拼图导出为其真实边界框尺寸

    const handleDownloadZip = async () => {
        if (!sourceImage || Object.keys(topEdges).length === 0 || Object.keys(leftEdges).length === 0) return;

        const zip = new JSZip();
        const imgWidth = sourceImage.width;
        const imgHeight = sourceImage.height;

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

                // 计算边界框
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                points.forEach(([x, y]) => {
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                });
                const boxWidth = Math.ceil(maxX - minX);
                const boxHeight = Math.ceil(maxY - minY);

                path.moveTo(points[0][0], points[0][1]);
                for (let i = 1; i < points.length; i++) {
                    path.lineTo(points[i][0], points[i][1]);
                }
                path.closePath();

                const pieceCanvas = document.createElement('canvas');
                pieceCanvas.width = boxWidth;
                pieceCanvas.height = boxHeight;
                const pieceCtx = pieceCanvas.getContext('2d');

                pieceCtx.save();
                pieceCtx.translate(-minX, -minY);
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

    return <div className="p-4 max-w-4xl mx-auto">
        <HeadItem title="Online Puzzle Generator - Create Custom Bezier Jigsaw Puzzles"
                  iconUrl="/icon/puzzle.ico"></HeadItem>
        
        <h1 className="text-2xl font-bold mb-4">Create Your Own Jigsaw Puzzle Online</h1>
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
            {/* Upload Button */}
            <div className="mb-2 md:mb-0">
                <label htmlFor="fileUpload"
                       className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition">
                    Upload Image
                </label>
                <input
                    id="fileUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 text-sm items-center">
                <label className="flex items-center gap-2">
                    Rows:
                    <input type="number" min="2" max="10" value={rows} onChange={(e) => setRows(Number(e.target.value))}
                           className="border px-2 py-1 w-16 rounded"/>
                </label>
                <label className="flex items-center gap-2">
                    Columns:
                    <input type="number" min="2" max="10" value={cols} onChange={(e) => setCols(Number(e.target.value))}
                           className="border px-2 py-1 w-16 rounded"/>
                </label>
                <label className="flex items-center gap-2">
                    Curve:
                    <input type="range" min="0" max="1" step="0.1" value={curveStrength}
                           onChange={(e) => setCurveStrength(Number(e.target.value))}/>
                    <span className="w-6 inline-block">{curveStrength}</span>
                </label>
                <label className="flex items-center gap-2">
                    Show Points:
                    <input type="checkbox" checked={showBezierControlPoints}
                           onChange={() => setShowBezierControlPoints(!showBezierControlPoints)}/>
                </label>
            </div>
            <button onClick={handleDownloadZip}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4">
                Download Puzzle Pieces (ZIP)
            </button>
        </div>

        <div id="puzzle-container" className="border w-full min-h-[200px]"/>
        <div className="mb-4 p-4 border border-gray-300 bg-gray-50 rounded text-sm text-gray-800 leading-relaxed">
            <h2 className="text-base font-semibold mb-2">📘 How to Use:</h2>
            <ol className="list-decimal list-inside space-y-1">
                <li>Click <strong>Upload Image</strong> to select your puzzle background.</li>
                <li>Adjust <strong>Rows</strong> and <strong>Columns</strong> to set puzzle grid size.</li>
                <li>Use <strong>Curve Strength</strong> to control edge curvature.</li>
                <li>Click yellow lines to flip the direction of edge curves.</li>
                <li>Enable <strong>Show Control Points</strong> to visualize Bezier anchors.</li>
            </ol>
        </div>
    </div>;
}
