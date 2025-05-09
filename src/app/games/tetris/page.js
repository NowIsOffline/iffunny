"use client";
import './gameLayout.css';
import { useEffect, useRef, useState } from "react";
import {
    initializeTetrisGame,
    restartGame,
    pauseGame,
    resumeGame,
    afterModeChange
} from "./tetrisGame";

export default function Page() {
    const [showSettings, setShowSettings] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const audioRef = useRef(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!initializedRef.current) {
            initializeTetrisGame();
            initializedRef.current = true;

            const tryPlay = () => {
                if (audioRef.current && soundEnabled) {
                    audioRef.current.volume = 0.3;
                    audioRef.current.play().catch(err => {});
                }
                document.removeEventListener("click", tryPlay);
                document.removeEventListener("touchstart", tryPlay);
            };
            document.addEventListener("click", tryPlay);
            document.addEventListener("touchstart", tryPlay);
        }

        // 控制音效播放
        if (audioRef.current) {
            if (soundEnabled) {
                audioRef.current.play().catch(() => {});
            } else {
                audioRef.current.pause();
            }
        }
    }, [soundEnabled]);

    // 控制暗黑样式切换
    useEffect(() => {
        let tetrisLayout = document.getElementById("tetrisLayout");
        if(tetrisLayout){
            tetrisLayout.classList.toggle("dark-mode", darkMode);
        }
        // ✅ 修复 canvas 背景同步
        afterModeChange();
    }, [darkMode]);

    const openSettings = () => {
        pauseGame();
        setShowSettings(true);
    };

    return (
        <main className="game-page-layout">
            <audio ref={audioRef} src="/sounds/sound_tetris_bgm.ogg" loop />

            <div className="game-container">
                <div className="game-box">
                    <div className="top-bar">
                        <div className="next-piece-box">
                            <canvas id="next-canvas" width="80" height="80"></canvas>
                        </div>
                        <div className="score-box">
                            <p>Score: <span id="score-value">0</span></p>
                            <button id="settings-btn" onClick={openSettings}>⚙️</button>
                        </div>
                    </div>
                    <canvas id="tetris-canvas" width="300" height="600"></canvas>
                </div>

                <div id="game-over-screen">
                    <p id="score-display">Score: 0</p>
                    <button onClick={restartGame}>重新开始</button>
                </div>

                <div className="mobile-controls">
                    <div id="joystick-container" className="joystick-container">
                        <div id="joystick-knob" className="joystick-knob"></div>
                    </div>
                    <div className="rotate-btn-wrap">
                        <button id="rotate-btn">旋转</button>
                    </div>
                </div>
            </div>

            {showSettings && (
                <div className="settings-modal">
                    <div className="modal-content">
                        <h2>设置</h2>
                        <label>
                            <input
                                type="checkbox"
                                checked={soundEnabled}
                                onChange={() => setSoundEnabled(prev => !prev)}
                            />
                            启用音效
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={darkMode}
                                onChange={() => setDarkMode(prev => !prev)}
                            />
                            启用暗黑模式
                        </label>
                        <button onClick={() => {
                            setShowSettings(false);
                            resumeGame();
                        }}>
                            关闭
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
