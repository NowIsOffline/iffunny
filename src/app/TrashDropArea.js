import React from 'react';
import { useDrop, useDragDropManager } from 'react-dnd';

const ItemTypes = { ICON: 'icon' };

const TrashDropArea = ({ onDelete }) => {
    const manager = useDragDropManager();
    const monitor = manager.getMonitor();
    const draggedItem = monitor.getItem();
    const isDragging = monitor.isDragging();

    const showTrash = isDragging &&
        draggedItem &&
        !draggedItem.undeletable &&
        draggedItem.type !== 'folder';

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.ICON,
        drop: (item) => {
            console.log(item.undeletable+" "+item.type+" "+(!item.undeletable && item.type !== 'folder'));
            if (!item.undeletable && item.type !== 'folder') {
                console.log(item.id);
                onDelete(item.id);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    if (!showTrash) return null;

    return (
        <div
            ref={drop}
            className={`fixed top-2 left-1/2 transform -translate-x-1/2 z-50 px-6 py-2 rounded-full text-white font-bold transition-colors duration-200 ${
                isOver ? 'bg-red-600' : 'bg-red-400'
            }`}
        >
            🗑 拖动图标到这里删除
        </div>
    );
};

export default TrashDropArea;
