"use client"; // 确保该文件作为客户端组件处理

import { useEffect } from "react";
import { initializeTetrisGame, restartGame } from "./tetrisGame";  // 导入游戏初始化函数
import './gameLayout.css';  // 引入更新的样式

export default function Page() {
    useEffect(() => {
        initializeTetrisGame(); // 游戏初始化
    }, []);

    return (
        <main className="game-page-layout">
            <div className="game-container">
                <canvas id="tetris-canvas" width="300" height="600"></canvas> {/* 游戏画布 */}
            </div>
        </main>
    );
}
