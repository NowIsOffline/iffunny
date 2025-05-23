import { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import dataStore from '../utils/DataStore';

export default function IconCard({ iconId, index, iconsLength, moveIcon, setDraggingId, draggingId, onOpenInternal }) {
    const ref = useRef();
    const hoverTimer = useRef(null);
    const pressTimer = useRef(null); // 处理长按定时器
    const menuRef = useRef(); // 用于检测菜单点击
    const [menuVisible, setMenuVisible] = useState(false); // 控制菜单显示
    const [dragging, setDragging] = useState(false);
    const [isLongPress, setIsLongPress] = useState(false); // 用于判断是否是长按触发的菜单
    const [isLongPressHandled, setIsLongPressHandled] = useState(false); // 用于控制是否已处理长按

    const icon = dataStore.GetIconCfg(iconId) || {
        id: iconId,
        name: 'Unknown',
        logo: ''
    };

    const [, drop] = useDrop({
        accept: 'ICON',
        hover(item, monitor) {
            if (!ref.current) return;

            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;

            const { left, right } = ref.current.getBoundingClientRect();
            const mouseX = monitor.getClientOffset().x;
            const EDGE_THRESHOLD = 12;

            const isLeftEdge = mouseX >= left && mouseX <= left + EDGE_THRESHOLD;
            const isRightEdge = mouseX >= right - EDGE_THRESHOLD;
            const isLast = hoverIndex === iconsLength - 1;

            let shouldInsert = false;
            let targetIndex = hoverIndex;
            if (isLeftEdge) {
                shouldInsert = true;
            } else if (isLast && isRightEdge) {
                shouldInsert = true;
                targetIndex = hoverIndex + 1;
            } else {
                return;
            }

            if (targetIndex === dragIndex || targetIndex === dragIndex + 1) return;

            clearTimeout(hoverTimer.current);
            hoverTimer.current = setTimeout(() => {
                // moveIcon(dragIndex, targetIndex);
                // item.index = targetIndex < dragIndex ? targetIndex : targetIndex - 1;
            }, 500);
        },
        drop: () => clearTimeout(hoverTimer.current)
    });

    const [{ isDragging }, drag, preview] = useDrag({
        type: 'ICON',
        collect: monitor => ({
            isDragging: monitor.isDragging()
        }),
        item: () => {
            setDraggingId(icon.id);
            setDragging(true);
            return { index, id: icon.id };
        },
        end: () => {
            setDraggingId(null);
            setDragging(false);
            clearTimeout(hoverTimer.current);
        }
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
            const img = new window.Image();
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
            preview(img, { captureDraggingState: true });
        }
    }, [preview]);

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
            ref={ref}
            onMouseDown={handlePressStart} // 监听按下事件
            onMouseUp={handlePressEnd} // 监听释放事件
            layout
            style={{
                position: 'relative',
                margin: '0',
                width: '5rem',
                height: '6rem',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
            }}
            initial={{ scale: 1 }}
            animate={{ scale: isDragging ? 0.8 : 1 }}
            className={"text-center"}
        >
            {icon.iconType === "item" ? (
                <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img src={icon.logo} alt={icon.name} width="40" height="40" />
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
