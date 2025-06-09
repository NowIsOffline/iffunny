// app/page.js
"use client"; // 需要在客户端渲染的标记

import { useEffect, useRef } from 'react';

export default function FullScreenIframe() {
    const iframeRef = useRef(null);

    // 可选：如果需要动态设置iframe高度或处理其他逻辑
    useEffect(() => {
        const handleResize = () => {
            // 这里可以添加调整iframe尺寸的逻辑
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={containerStyle}>
            <iframe
                ref={iframeRef}
                src="https://hanime.tv/" // 替换为你想要嵌入的网址
                style={iframeStyle}
                allowFullScreen
                title="Full Screen Iframe"
                allow="fullscreen"
            />
        </div>
    );
}

// 样式对象
const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    margin: 0,
    padding: 0,
    border: 'none',
};

const iframeStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
    margin: 0,
    padding: 0,
    display: 'block',
};