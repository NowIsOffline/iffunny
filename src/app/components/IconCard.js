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

    return (
        <motion.div
            ref={node => {
                ref.current = node;
                drag(drop(node)); // 正确绑定拖拽源 + 拖拽目标
            }}
            layout
            style={{
                position: 'relative',
                margin: '0',
                width: '5rem',
                height: '6rem',
                display: 'flex',
                backgroundColor: 'transparent',
                flexWrap: 'wrap',
                justifyContent: 'center',
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
        </motion.div>
    );
}
