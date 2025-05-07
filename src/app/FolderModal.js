// FolderModal.js
import React from 'react';
import Icon from './IconComponent';

export default function FolderModal({ folderView, folderRef, onClose, onRemoveChild, onDragStart, onDrop }) {
    if (!folderView || !folderView.children) return null;

    return (
        <div className="fixed inset-0 z-30 bg-black/10 backdrop-blur-sm flex items-center justify-center">
            <div
                className="bg-white/30 backdrop-blur-lg p-6 rounded-xl shadow-xl w-96 relative"
                ref={folderRef}
            >
                <h3 className="text-xl font-bold mb-4">{folderView.name}</h3>
                <div className="grid grid-cols-4 gap-4 p-2 border border-dashed border-blue-300">
                    {[...folderView.children].sort((a, b) => a.name.localeCompare(b.name)).map(child => (
                        <div key={child.id} className="relative group">
                            <div onMouseDown={(e) => {
                                const startX = e.clientX;
                                const startY = e.clientY;
                                const onMouseMove = (moveEvent) => {
                                    const dx = Math.abs(moveEvent.clientX - startX);
                                    const dy = Math.abs(moveEvent.clientY - startY);
                                    if (dx > 4 || dy > 4) {
                                        onDragStart(child);
                                        document.removeEventListener('mousemove', onMouseMove);
                                        document.removeEventListener('mouseup', onMouseUp);
                                    }
                                };
                                const onMouseUp = () => {
                                    document.removeEventListener('mousemove', onMouseMove);
                                    document.removeEventListener('mouseup', onMouseUp);
                                };
                                document.addEventListener('mousemove', onMouseMove);
                                document.addEventListener('mouseup', onMouseUp);
                            }}>
                                <Icon item={child} onDrop={onDrop} onDelete={() => {}} onOpenFolder={() => {}} />
                            </div>
                            <button
                                onClick={() => onRemoveChild(folderView.id, child)}
                                className="absolute top-0 right-0 text-xs text-white bg-red-500 rounded-full px-1 hidden group-hover:block"
                            >✕</button>
                        </div>
                    ))}
                </div>
                <button
                    className="mt-4 text-blue-600 hover:underline"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
