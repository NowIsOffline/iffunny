// IconGrid.js
'use client';
import { useIcons } from './context/IconContext';
import { AnimatePresence, motion } from 'framer-motion';
import IconCard from '@/app/components/IconCard';
import React, {useEffect, useState} from 'react';
import CustomDragLayer from "@/app/components/CustomDragLayer";
import dataStore from "@/app/utils/DataStore";
import ShopModal from './components/ShopModal'; // 修改为实际路径
import SHOP_SITE_CFG from './configs/shop';
import FileViewerModal from "@/app/components/FileViewerModal"; // 你的配置

const AddIconModal = ({ show, onClose }) => {
    const [newSiteName, setNewSiteName] = useState('');
    const [newSiteUrl, setNewSiteUrl] = useState('');
    const [showShop, setShowShop] = useState(false);
    const [installedIds, setInstalledIds] = useState([]);

    const { tryAddCustomItem } = useIcons(); // 添加这一
    const handleAdd = () => {
        const trimmedUrl = newSiteUrl.trim();
        const trimmedName = newSiteName.trim();

        if (!trimmedName || !trimmedUrl) {
            alert('Please enter all msg');
            return;
        }

        // ✅ URL 格式验证
        const isValidUrl = /^https?:\/\/.+/.test(trimmedUrl);
        if (!isValidUrl) {
            alert('（http:// or https://）');
            return;
        }
        const base = new URL(trimmedUrl).origin;
        const logo = `${base}/favicon.ico`;

        const newItem = {
            type: 'item',
            name: trimmedName,
            url: trimmedUrl,
            logo: logo,
            iconType:"item",
            openType: "internal",
            stopDelete: false,
            createTime: ""
        };


        tryAddCustomItem(newItem);
        setNewSiteName('');
        setNewSiteUrl('');
        onClose();

    };

    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4 text-gray-800">Add new website</h2>
                <input
                    type="text"
                    placeholder="Name"
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    className="w-full p-2 border rounded-md mb-4"
                />
                <input
                    type="text"
                    placeholder="url (https://)"
                    value={newSiteUrl}
                    onChange={(e) => setNewSiteUrl(e.target.value)}
                    className="w-full p-2 border rounded-md mb-4"
                />
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="text-gray-500 hover:underline">Cancel</button>
                    <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600">Add</button>
                </div>
            </div>
        </div>
    );
};

export default function IconGrid() {
    const { icons, setIcons, moveIcon } = useIcons(); // ✅ 使用 context 中定义的

    const [draggingId, setDraggingId] = useState(1);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [time, setTime] = useState('');
    const [showShop, setShowShop] = useState(false);
    const [openFileId, setOpenFileId] = useState(null);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const t = now.toTimeString().slice(0, 8);
            setTime(t);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);
  
    const handleManualMove = () => {
        const fromIndex = parseInt(from);
        const toIndex = parseInt(to);
        if (!isNaN(fromIndex) && !isNaN(toIndex)) {
            moveIcon(fromIndex, toIndex);
        }
    };

    return (
        <div>
            <div className="relative text-center flex flex-col min-h-screen">
                <header>
                    <div className="text-white text-3xl font-mono font-bold tracking-wider mb-1">{time}</div>
                    <h1 className="text-4xl font-bold text-white mb-2 drop-shadow">If Funny</h1>
                    <h2 className="text-lg text-blue-100 italic drop-shadow">Drag icons to create folders</h2>
                    <AddIconModal
                        show={showAddModal}
                        onClose={() => setShowAddModal(false)}
                    />
                    {showShop && (
                        <ShopModal onClose={() => setShowShop(false)} />
                    )}
                    {openFileId !== null && (
                        <FileViewerModal
                            fileId={openFileId}
                            onClose={() => setOpenFileId(null)}
                            draggingId={draggingId}
                            setDraggingId={setDraggingId}
                            moveIcon={moveIcon}
                        />
                    )}

                    <p style={{width:"100%",color: 'white', fontSize: '0.75rem', position: 'absolute', bottom: '1rem'}}>Made by Offline @2025</p>   
                </header>

                {/*<div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>*/}
                {/*    <input type="number" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="from"*/}
                {/*           style={{width: '5rem'}}/>*/}
                {/*    <input type="number" value={to} onChange={(e) => setTo(e.target.value)} placeholder="to"*/}
                {/*           style={{width: '5rem'}}/>*/}
                {/*    <button onClick={handleManualMove}>MoveIcon</button>*/}
                {/*</div>*/}

                <motion.div layout style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'left'}}>
                    <AnimatePresence>
                        {icons.map((id, index) => (
                            <IconCard
                                key={id}
                                iconId={id}
                                index={index}
                                iconsLength={icons.length}
                                moveIcon={moveIcon}
                                setDraggingId={setDraggingId}
                                draggingId={draggingId}
                                onOpenInternal={(url) => {
                                    console.log(url)
                                    if (url === '#shop') setShowShop(true);
                                    else if (url.startsWith('#file:')) {
                                        const fileId = parseInt(url.split(':')[1]);
                                        setOpenFileId(fileId);
                                    }
                                }}
                            />
                        ))}
                    </AnimatePresence>
                    <div
                        onClick={() => setShowAddModal(true)}
                        style={{
                            position: 'relative',
                            margin: '0',
                            width: '5rem',
                            height: '6rem',
                            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                        }}
                    >
                        <div style={{
                            width: '4rem',
                            height: '4rem',
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents:"none"
                        }}>
                            <img src="icon/Add.png" alt="Add webSite" width="40" height="40"/>
                        </div>
                        <p style={{
                            fontSize: '0.75rem',
                            textAlign: 'center',
                            marginTop: '0.25rem',
                            color: 'white',
                            textShadow: '0 1px 2px black'
                        }}>
                            Add
                        </p>
                    </div>
                </motion.div>

                <CustomDragLayer/>
            </div>
           
        </div>
    );
}
