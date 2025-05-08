"use client";
import './gameLayout.css';
import {
    initializeTetrisGame,
    restartGame,
    moveLeft,
    moveRight,
    moveDown,
    rotatePiece,
    pauseGame
} from "./tetrisGame";
import { useEffect, useRef } from "react";
export default function Page() {
    const audioRef = useRef(null);
    useEffect(() => {
        initializeTetrisGame();
        // 播放背景音乐
        const audio = audioRef.current;
        if (audio) {
            audio.volume = 0.3;
            audio.play().catch(e => {
                // 部分浏览器需用户交互后才能播放，忽略错误
                console.log("Audio play blocked:", e);
            });
        }

        // 设置按钮点击事件
        const settingsBtn = document.getElementById("settings-btn");
        if (settingsBtn) {
            settingsBtn.onclick = () => {
                pauseGame();
                alert("设置菜单 - 可拓展为模态框");
            };
        }

        const knob = document.getElementById("joystick-knob");
        const container = document.getElementById("joystick-container");

        if (!knob || !container) return;

        let startX = 0;
        let startY = 0;
        let lastMoveTime = 0;
        const throttleDelay = 100;

        container.addEventListener("touchstart", e => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });

        container.addEventListener("touchmove", e => {
            e.preventDefault();
            const now = Date.now();
            if (now - lastMoveTime < throttleDelay) return;
            lastMoveTime = now;

            const touch = e.touches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;

            const angle = Math.atan2(dy, dx);
            const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 30);
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;

            knob.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 20) moveRight();
                else if (dx < -20) moveLeft();
            } else {
                if (dy > 20) moveDown();
            }
        });

        container.addEventListener("touchend", () => {
            knob.style.transform = "translate(0, 0)";
        });

        const rotateBtn = document.getElementById("rotate-btn");
        if (rotateBtn) {
            rotateBtn.onclick = rotatePiece;
        }
    }, []);

    return (
        <main className="game-page-layout">
            {/* 背景音乐 audio 标签 */}
            <audio ref={audioRef} src="/sounds/sound_tetrisbgm.wav" loop />
            <div className="game-container">
                <div className="game-box">
                    <div className="top-bar">
                        <div className="next-piece-box">
                            <canvas id="next-canvas" width="80" height="80"></canvas>
                        </div>
                        <div className="score-box">
                            <p>Score: <span id="score-value">0</span></p>
                            <button id="settings-btn">⚙️</button>
                        </div>
                    </div>
                    <canvas id="tetris-canvas" width="300" height="600"></canvas>
                </div>

                {/* 游戏结束提示 */}
                <div id="game-over-screen">
                    <p id="score-display">Score: 0</p>
                    <button onClick={restartGame}>重新开始</button>
                </div>

                {/* 控制按钮区域（移动端） */}
                <div className="mobile-controls">
                    <div id="joystick-container" className="joystick-container">
                        <div id="joystick-knob" className="joystick-knob"></div>
                    </div>
                    <div className="rotate-btn-wrap">
                        <button id="rotate-btn">旋转</button>
                    </div>
                </div>
            </div>
        </main>
    );
}
