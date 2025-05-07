// IconComponent.js
import React, {useEffect} from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import Link from 'next/link';

const ItemTypes = { ICON: 'icon' };

export default function Icon({ item, onDrop, onDelete, onOpenFolder }) {
    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, []);

    const iconBox = (
        <div className="w-20 h-20 flex items-center justify-center bg-white bg-opacity-80 rounded-2xl shadow-md border border-blue-200" onClick={() => item.type === 'folder' && onOpenFolder(item)}>
            <img src={item.logo || '/icon/robot.png'} alt={item.name} className="w-10 h-10" />
        </div>
    );

    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: ItemTypes.ICON,
        item,
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }), [item]);

    const [{ isOver }, drop] = useDrop({
        accept: ItemTypes.ICON,
        drop: (draggedItem) => {
            if (draggedItem.id !== item.id) onDrop(draggedItem, item);
            return undefined;
        },
        collect: (monitor) => ({ isOver: !!monitor.isOver({ shallow: true }) }),
    });

    return (
        <div
            ref={(node) => drag(drop(node))}
            className={`flex flex-col items-center space-y-1 cursor-pointer transition-transform ${isOver ? 'scale-125 z-10' : ''}`}
            style={{ opacity: isDragging ? 0.4 : 1 }}
        >
            {item.type === 'site' ? (
                <Link href={item.url || '#'} target="_blank" rel="noopener noreferrer">{iconBox}</Link>
            ) : iconBox}
            <span className="text-xs text-white font-medium text-center px-1 leading-tight">{item.name}</span>
        </div>
    );
}
