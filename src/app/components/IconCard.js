// IconCard.js
'use client';
import { useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import dataStore from '../utils/DataStore';

export default function IconCard({ iconId, index, iconsLength, moveIcon, setDraggingId, draggingId, onOpenInternal })
 {
    const ref = useRef();
    const hoverTimer = useRef(null);

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
            return { index, id: icon.id };
        },
        end: () => {
            setDraggingId(null);
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

    drag(drop(ref));
    const handleClick = () => {
        if(icon.iconType==="file"){
            onOpenInternal?.(`#file:${icon.id}`);
        }else if (icon.openType === "link") {
            window.open(icon.url, '_blank');
        } else if (icon.openType === "internal") {
            onOpenInternal?.(icon.url);
        } 
    };

    return (
        <motion.div
            onClick={handleClick}
            ref={ref}
            layout
            style={{
                position: 'relative',
                margin: '0',
                width: '5rem',
                height: '6rem',
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            }}
            initial={{scale: 1}}
            animate={{scale: isDragging ? 0.8 : 1}}
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
                    <img src={icon.logo} alt={icon.name} width="40" height="40"/>
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
