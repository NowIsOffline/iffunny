"use client";
import './gameLayout.css';
import { useEffect, useRef, useState } from "react";
import {
    initializeTetrisGame,
    restartGame,
    pauseGame,
    resumeGame,
    moveRight,
    moveDown,
    moveLeft,
    afterModeChange
} from "./tetrisGame";


export default function Page() {
    const [showSettings, setShowSettings] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [showTitleScreen, setShowTitleScreen] = useState(true);
    const audioRef = useRef(null);
    const [highScore, setHighScore] = useState(0);
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("highScore");
            if (stored) setHighScore(Number(stored));
        }
    }, []);

    const initializedRef = useRef(false);

    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;

            const tryPlay = () => {
                if (audioRef.current && soundEnabled) {
                    audioRef.current.volume = 0.3;
                    audioRef.current.play().catch(() => {});
                }
                document.removeEventListener("click", tryPlay);
                document.removeEventListener("touchstart", tryPlay);
            };
            document.addEventListener("click", tryPlay);
            document.addEventListener("touchstart", tryPlay);
        }

        if (audioRef.current) {
            if (soundEnabled) {
                audioRef.current.play().catch(() => {});
            } else {
                audioRef.current.pause();
            }
        }

       
        
    }, [soundEnabled]);


    useEffect(() => {
        if (!showTitleScreen) {
            const timer = setTimeout(() => {
                initializeTetrisGame();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [showTitleScreen]);

    useEffect(() => {
        const tetrisLayout = document.getElementById("tetrisLayout");
        if (tetrisLayout) {
            tetrisLayout.classList.toggle("dark-mode", darkMode);
        }
        afterModeChange();
    }, [darkMode]);

    const openSettings = () => {
        pauseGame();
        setShowSettings(true);
    };

    const startGame = () => {
        setShowTitleScreen(false);
    };

    const returnToTitle = () => {
        const over = document.getElementById("game-over-screen");
        if (over) over.style.display = "none";

        const canvas = document.getElementById("tetris-canvas");
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        const scoreEl = document.getElementById("score-value");
        if (scoreEl) scoreEl.textContent = "0";

        setShowTitleScreen(true);
    };

    return (
        <main className="game-page-layout">
            <audio ref={audioRef} src="/sounds/sound_tetris_bgm.ogg" loop />

            {showTitleScreen ? (
                <div className="settings-modal">
                    <div className="modal-content">
                        <h1>Tetris Classic</h1>
                        <p>High Score: {highScore}</p>
                        <button onClick={startGame}>Start Game</button>
                        <p className="seo-description">
                            Play the classic Tetris puzzle game. Stack falling blocks and beat your high score!
                        </p>
                    </div>
                </div>
            ) : (
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
                        <button onClick={restartGame}>Restart</button>
                        <button onClick={returnToTitle}>Back to Title</button>
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
            )}

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
                            Enable Sound
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={darkMode}
                                onChange={() => setDarkMode(prev => !prev)}
                            />
                            Enable Dark Mode
                        </label>
                        <button onClick={() => {
                            setShowSettings(false);
                            resumeGame();
                        }}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
