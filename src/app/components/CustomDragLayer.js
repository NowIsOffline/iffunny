'use client';
import { useDragLayer } from 'react-dnd';
import Image from 'next/image';
import dataStore from '../utils/DataStore';
const layerStyles = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    transform: 'translate(-50%, -50%)',
};

function getItemStyles(currentOffset) {
    if (!currentOffset) return { display: 'none' };
    const { x, y } = currentOffset;
    return {
        transform: `translate(${x}px, ${y}px)`,
    };
}

export default function CustomDragLayer() {
    const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        isDragging: monitor.isDragging(),
        currentOffset: monitor.getClientOffset(),
    }));
    if (!isDragging || !item) return null;

    const draggedIcon = dataStore.GetIconCfg(item.id)
    if (!draggedIcon) return null;

    return (
        <div style={layerStyles}>
            <div style={getItemStyles(currentOffset)}>
                {draggedIcon.iconType === "item" ? (
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        opacity: 0.9,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Image src={draggedIcon.logo} alt={draggedIcon.name} width={36} height={36}/>
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
                        {draggedIcon.itemArr?.map((id, i) => {
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
               
            </div>
        </div>
    );
}
