// src/app/game/layout.js
import React from 'react';
import './gameLayout.css';
import Head from "next/head";
import HeadItem from "@/app/headItem"; // 使用之前更新的 CSS
export const metadata = {
    title:"Funny Game",
    description: "Play exciting games here, featuring various action, adventure, and strategy games!",
    viewport: "width=device-width, initial-scale=1.0",
    charSet: "UTF-8",
    keywords: "games, online games, action games, adventure games, strategy games"
};

const GameLayout = ({ children }) => {
    return (
        <div className="game-page-layout">
            <HeadItem title="Funny Game" iconUrl="/icon/small/robot/favicon.png" />
            <Head>
                <meta property="og:title" content="Funny Game"/>
                <meta property="og:description" content="Play exciting games here!"/>
                <meta property="og:image" content="image_link"/>
                <meta property="og:url" content="page_url"/>
                <meta property="og:type" content="website"/>
                <meta name="twitter:title" content="Game Name - Game Website Title"/>
                <meta name="twitter:description" content="Play exciting games here!"/>
                <meta name="twitter:image" content="image_link"/>
                <meta name="twitter:card" content="summary_large_image"/>
            </Head>
            <div className="header">
                <button className="menu-button">☰</button>
                {/* 这里可以添加更多菜单或组件 */}
            </div>
            <h1 className="title">Funny Game</h1>
            <div className="game-content">
                {children} {/* 渲染游戏页面的内容 */}
            </div>
        </div>
    );
};

export default GameLayout;
