// src/app/game/page.js
'use client';  // 确保该文件作为客户端组件处理

import { useSearchParams } from 'next/navigation'; // 使用 next/navigation 获取查询参数
import { useEffect, useState } from 'react';

const gameCfg = {
    1: "https://turbowarp.org/965266120/embed",  // Game 1 URL
    2: "/games/tetris"  // Game 2 URL
};

const GamePage = () => {
    const searchParams = useSearchParams();  // 获取查询参数
    const [id, setId] = useState(1);  // Default to 1

    useEffect(() => {
        const idFromQuery = searchParams.get('id');  // 获取 id 查询参数
        if (idFromQuery && gameCfg[idFromQuery]) {
            setId(idFromQuery);  // If id exists in gameCfg, set it
        } else {
            setId(1);  // Default to 1 if id doesn't exist or isn't valid
        }
    }, [searchParams]);  // Re-run effect when query parameters change

    return (
        <div className="game-container">
            <iframe
                src={gameCfg[id]}  // Load game based on the id
                width="100%"
                height="100%"
                style={{ border: 'none', borderRadius: '15px' }}  // 添加圆角
                title={`Game ${id}`}
            />
        </div>
    );
};

export default GamePage;
