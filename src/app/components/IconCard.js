'use client';
import { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import dataStore from '../utils/DataStore';
import { useIcons } from "@/app/context/IconContext";

export default function IconCard({ iconId, index, iconsLength, moveIcon, setDraggingId, draggingId, onOpenInternal }) {
    const ref = useRef();
    const { createFolderOrJoinIn } = useIcons();

    const hoverTimer = useRef(null);
    const pressTimer = useRef(null); // 处理长按定时器
    const menuRef = useRef(); // 用于检测菜单点击
    const [menuVisible, setMenuVisible] = useState(false); // 控制菜单显示
    const [dragging, setDragging] = useState(false);
    const [isLongPress, setIsLongPress] = useState(false); // 用于判断是否是长按触发的菜单
    const [isLongPressHandled, setIsLongPressHandled] = useState(false); // 用于控制是否已处理长按
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);  // 判断是否为移动端

    const icon = dataStore.GetIconCfg(iconId) || {
        id: iconId,
        name: 'Unknown',
        logo: ''
    };

    // 检测设备类型，判断是否为移动端
    useEffect(() => {
        const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent);
        setIsMobile(isMobileDevice);
    }, []);

    const [, drop] = useDrop({
        accept: 'ICON',
        hover(item, monitor) {
            if (!ref.current) return;
            setIsHovered(true); // ✅ 开启放大
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
        },
        drop: (item, monitor) => {
            setIsHovered(false);
            clearTimeout(hoverTimer.current);

            const sourceId = item.id;      // 拖拽源的 ID
            const targetId = icon.id;      // 当前被悬停目标的 ID
            var sourceCfg = dataStore.GetIconCfg(sourceId);
            if (sourceCfg.iconType === "file") {
                return;
            }
            if (sourceId !== targetId) {
                createFolderOrJoinIn(sourceId, targetId); // ✅ 调用上下文封装方法
            }
        },
        collect: (monitor) => {
            if (!monitor.isOver({ shallow: true })) {
                setIsHovered(false); // ✅ 当鼠标离开时取消放大
            }
        }
    });

    const [{ isDragging }, drag, preview] = useDrag({
        type: 'ICON',
        collect: monitor => ({
            isDragging: monitor.isDragging()
        }),
        item: () => {
            setDraggingId(icon.id);
            setDragging(true);

            // 🧹 取消长按定时器，防止触发菜单
            clearTimeout(pressTimer.current);

            return { index, id: icon.id };
        },
        end: () => {
            setDraggingId(null);
            setDragging(false);
            clearTimeout(hoverTimer.current);
        }
    });

    // 点击外部区域隐藏菜单
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuVisible && menuRef.current && !menuRef.current.contains(e.target) && !ref.current.contains(e.target)) {
                setMenuVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuVisible]);

    const handlePressStart = () => {
        // 处理长按1秒
        pressTimer.current = setTimeout(() => {
            setMenuVisible(true);
            setIsLongPress(true); // 设置为长按触发
            setIsLongPressHandled(false); // 标记长按未处理
        }, 1000);
    };

    const handlePressEnd = () => {
        // 清除长按定时器
        clearTimeout(pressTimer.current);

        if (isLongPress) {
            setIsLongPressHandled(true); // 设置为已处理长按
        } else {
            handleClick(); // 长按未触发，执行点击
        }
    };

    const handleClick = () => {
        if (isLongPressHandled) return; // 如果长按已处理，不执行点击事件

        // 执行正常点击事件
        if (icon.iconType === "file") {
            onOpenInternal?.(`#file:${icon.id}`);
        } else if (icon.openType === "link") {
            window.open(icon.url, '_blank');
        } else if (icon.openType === "internal") {
            onOpenInternal?.(icon.url);
        }
    };

    const handleUninstall = (e) => {
        e.stopPropagation(); // 阻止事件冒泡，防止触发外层点击事件
        dataStore.TryRemoveIcon(iconId); // 执行卸载逻辑
        setMenuVisible(false); // 隐藏菜单
    };

    return (
        <motion.div
            ref={node => {
                ref.current = node;
                drag(drop(node)); // 正确绑定拖拽源 + 拖拽目标
            }}
            layout
            onMouseDown={handlePressStart} // 监听按下事件
            onMouseUp={handlePressEnd} // 监听释放事件
            style={{
                position: 'relative',
                margin: '0',
                width: '5rem',
                height: '6rem',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                backgroundColor: 'transparent',
            }}
            initial={{ scale: 1 }}
            animate={{ scale: isDragging ? 0.8 : isHovered ? 1.1 : 1 }}
            className={"text-center"}
        >
            {icon.iconType === "item" ? (
                <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: 'transparent',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img src={icon.logo} alt={icon.name} width="100%" height="40" draggable={false}/>
                </div>
            ) : (
                <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridTemplateRows: 'repeat(3, 1fr)',
                    gap: '1px',
                    padding: '2px'
                }}>
                    {icon.itemArr?.map((id, i) => {
                        const subIconCfg = dataStore.GetIconCfg(id);
                        return (
                            <img
                                key={subIconCfg.id}
                                src={subIconCfg.logo}
                                alt={`${subIconCfg.name} ${i}`}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                draggable={false}
                            />
                        );
                    })}
                </div>
            )}

            {/* 显示菜单栏 */}
            {menuVisible && (
                <div
                    ref={menuRef}
                    style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        padding: '5px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        zIndex: 10,
                    }}
                >
                    <button onClick={handleUninstall} style={{ width:"100%",height:"100%",backgroundColor: 'red', color: 'white', border: 'none', padding: '0 5px' }}>
                        x
                    </button>
                </div>
            )}

            <p style={{
                width: "4rem",
                fontSize: '0.75rem',
                textAlign: 'center',
                marginTop: '0.25rem',
                color: 'white',
                textShadow: '0 1px 2px black'
            }}>
                {icon.name}
            </p>
        </motion.div>
    );
}
