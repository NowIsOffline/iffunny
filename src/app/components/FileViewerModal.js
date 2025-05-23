import React, { useState } from 'react';
import dataStore from '../utils/DataStore';
import IconCard from './IconCard';

export default function FileViewerModal({ fileId, onClose, draggingId, setDraggingId, moveIcon }) {
    const cfg = dataStore.GetIconCfg(fileId);
    if (!cfg || !cfg.itemArr || cfg.itemArr.length === 0) return null;

    const [editing, setEditing] = useState(false);
    const [tempName, setTempName] = useState(cfg.name);

    const handleBlur = () => {
        setEditing(false);
        if (tempName !== cfg.name) {
            cfg.name = tempName;
            if (dataStore.OtherItemCfg[fileId]) {
                dataStore.OtherItemCfg[fileId].name = tempName;
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-auto relative">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex-1 text-center">
                        {editing ? (
                            <input
                                autoFocus
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onBlur={handleBlur}
                                className="text-lg font-bold border border-gray-300 rounded px-2 py-1 w-1/2 text-center"
                            />
                        ) : (
                            <h2
                                className="text-lg font-bold text-gray-700 cursor-pointer"
                                onClick={() => setEditing(true)}
                            >
                                {cfg.name}
                            </h2>
                        )}
                    </div>
                    <button onClick={onClose} className="text-xl text-gray-500 hover:text-black">×</button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {cfg.itemArr.map((iconId, index) => (
                        <IconCard
                            key={iconId}
                            iconId={iconId}
                            index={index}
                            iconsLength={cfg.itemArr.length}
                            moveIcon={moveIcon}
                            draggingId={draggingId}
                            setDraggingId={setDraggingId}
                            onOpenInternal={() => {}}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
