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

    const baseAmplitude = 10;
    const variation = 0.3;

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

                const pw = imgWidth / cols;
                const ph = imgHeight / rows;

                const top = {};
                const left = {};

                for (let r = 0; r <= rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const x0 = c * pw;
                        const y = r * ph;
                        const x1 = x0 + pw;
                        top[`${r},${c}`] = r === 0 || r === rows ? [[x0, y], [x1, y]] : generateEdge(x0, y, x1, y, 'h');
                    }
                }

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c <= cols; c++) {
                        const x = c * pw;
                        const y0 = r * ph;
                        const y1 = y0 + ph;
                        left[`${r},${c}`] = c === 0 || c === cols ? [[x, y0], [x, y1]] : generateEdge(x, y0, x, y1, 'v');
                    }
                }

                setTopEdges(top);
                setLeftEdges(left);

                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1.2;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const path = new Path2D();
                        const points = [
                            ...top[`${r},${c}`],
                            ...left[`${r},${c + 1}`],
                            ...[...top[`${r + 1},${c}`]].reverse(),
                            ...[...left[`${r},${c}`]].reverse(),
                        ];
                        path.moveTo(points[0][0], points[0][1]);
                        for (let i = 1; i < points.length; i++) {
                            path.lineTo(points[i][0], points[i][1]);
                        }
                        path.closePath();
                        ctx.stroke(path);
                    }
                }
            };
        };
        reader.readAsDataURL(selectedFile);
    }, [selectedFile, rows, cols]);

    function generateEdge(x0, y0, x1, y1, dir) {
        const amp = baseAmplitude * (1 + Math.random() * variation * 2 - variation) * (Math.random() > 0.5 ? 1 : -1);
        if (dir === 'h') {
            const p0 = [x0, y0];
            const p3 = [x1, y1];
            const p1 = [x0 + (x1 - x0) / 3, y0 + amp];
            const p2 = [x0 + 2 * (x1 - x0) / 3, y0 + amp];
            return bezier(p0, p1, p2, p3);
        } else {
            const p0 = [x0, y0];
            const p3 = [x1, y1];
            const p1 = [x0 + amp, y0 + (y1 - y0) / 3];
            const p2 = [x0 + amp, y0 + 2 * (y1 - y0) / 3];
            return bezier(p0, p1, p2, p3);
        }
    }

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
            </div>
            <button onClick={handleDownloadZip} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4" >
                下载拼图 ZIP（高清）
            </button>
            <div id="puzzle-container" className="border w-full min-h-[200px]" />
        </div>
    );
}