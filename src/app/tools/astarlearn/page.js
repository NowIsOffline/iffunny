'use client';

import { useState } from 'react';
import './page.css';

const ROWS = 30;
const COLS = 30;
const START_POS = { row: 10, col: 5 };
const END_POS = { row: 10, col: 20 };

export default function Home() {
    const [grid, setGrid] = useState(() =>
        Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
                if (row === START_POS.row && col === START_POS.col) return 'start';
                if (row === END_POS.row && col === END_POS.col) return 'end';
                return 'empty';
            })
        )
    );

    const handleClick = (row, col) => {
        setGrid(prev =>
            prev.map((r, i) =>
                r.map((cell, j) => {
                    if (i === START_POS.row && j === START_POS.col) return 'start';
                    if (i === END_POS.row && j === END_POS.col) return 'end';
                    if (i === row && j === col) {
                        return cell === 'wall' ? 'empty' : 'wall';
                    }
                    return cell;
                })
            )
        );
    };

    return (
        <div className="container">
            {/* 左侧：网格区域 */}
            <div className="grid-wrapper">
                <div className="grid">
                    {grid.map((row, i) =>
                        row.map((cell, j) => (
                            <div
                                key={`${i}-${j}`}
                                className={`cell ${cell}`}
                                onClick={() => handleClick(i, j)}
                            ></div>
                        ))
                    )}
                </div>
            </div>

            {/* 右侧：功能区 */}
            <div className="right-panel">
                <h2 className="title">A星算法</h2>

                <div className="tip-box">
                    <p>
                        1. 拖动 <span className="green">起点</span> 或 <span className="red">终点</span> 网格支持重新设置“起点”或“终点”
                    </p>
                    <p>2. 点击空白网格支持设置障碍物，再次点击障碍物点取消设置</p>
                    <p>3. 获取最优路径按钮会一次性获取A星算法的最优路径，并显示在画面中，方便学习、测试使用。</p>
                </div>

                <div className="legend">
                    <Legend color="#ffffff" label="网格" />
                    <Legend color="#000000" label="障碍物" />
                    <Legend color="#00ff00" label="起点" />
                    <Legend color="#ff4d4f" label="终点" />
                    <Legend color="#ffff66" label="参与计算的网格" />
                    <Legend color="#b366ff" label="A*路径" />
                    <Legend color="#66b3ff" label="已探索格子" />
                </div>

                <div className="buttons">
                    <button className="btn blue">获取最优路径</button>
                    <button className="btn blue">单步执行（调试）</button>
                    <button className="btn white">清空画布</button>
                </div>
            </div>
        </div>
    );
}

function Legend({ color, label }) {
    return (
        <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: color }} />
            <span>{label}</span>
        </div>
    );
}
