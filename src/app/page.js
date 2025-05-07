// 安装依赖：
// npm install react-dnd react-dnd-html5-backend

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import HeadItem from '@/app/headItem';
import Icon from '@/app/IconComponent';
import FolderModal from '@/app/FolderModal';
import CustomDragLayer from '@/app/CustomDragLayer';
import TrashDropArea from './TrashDropArea';
import Head from "next/head";
const generateId = () => {
    const saved = localStorage.getItem('dashboard_items');
    const savedItems = saved ? JSON.parse(saved) : [];
    let childIds=[];
    console.log(savedItems)
    if(savedItems){
        childIds= savedItems
            .filter(i => i.type === 'folder' && Array.isArray(i.children))
            .flatMap(f => f.children.map(child => child.id));
    }


    const merged = [
        ...DEFAULT_SITES.filter(d => !childIds.includes(d.id)),
        ...savedItems.filter(item => !DEFAULT_SITES.some(d => d.id === item.id)),
    ];
    let maxId=1;
    merged.forEach(item => {
        if (item.id > maxId) maxId = item.id;
        if (item.type === 'folder' && Array.isArray(item.children)) {
            item.children.forEach(child => {
                if (child.id > maxId) maxId = child.id;
            });
        }
    });

    return maxId + 1;
};

const isTouchDevice = () =>
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const backend = isTouchDevice() ? TouchBackend : HTML5Backend;
const DEFAULT_SITES = [
    { id: 1, type: 'site', name: 'png2ico', url: '/tools/png2ico', logo: '/icon/png2ico.png', undeletable: true },
    { id: 2, type: 'site', name: 'TXT reader', url: '/tools/txtreader', logo: '/icon/education.png', undeletable: true },
    { id: 3, type: 'site', name: 'Google', url: 'https://google.com', logo: 'https://www.google.com/favicon.ico',undeletable: true},
    { id: 4, type: 'site', name: 'GitHub', url: 'https://github.com', logo: 'https://github.com/favicon.ico',undeletable: true },
    { id: 5, type: 'site', name: 'Wikipedia', url: 'https://wikipedia.org', logo: 'https://www.wikipedia.org/favicon.ico' ,undeletable: true},
];
const AddIconModal = ({ show, onClose, onAdd }) => {
    const [newSiteName, setNewSiteName] = useState('');
    const [newSiteUrl, setNewSiteUrl] = useState('');

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

        const newItem = {
            id: generateId(),
            type: 'site',
            name: trimmedName,
            url: trimmedUrl,
            logo: `${trimmedUrl.replace(/\/$/, '')}/favicon.ico`,
        };

        onAdd(newItem);
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

export default function DashboardPage() {
    const [items, setItems] = useState(null);

    const [folderView, setFolderView] = useState(null);
    const [time, setTime] = useState('');
    const [pendingFolder, setPendingFolder] = useState(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [draggedChild, setDraggedChild] = useState(null);
    const [folderRect, setFolderRect] = useState(null);
    const folderRef = useRef(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const resolveIdConflicts = (savedItems, defaultSites) => {
        const usedIds = new Set(defaultSites.map(site => site.id));
        let nextId = Math.max(...usedIds) + 1;

        const reassignId = (item) => {
            item.id = nextId++;
            usedIds.add(item.id);
        };

        const updatedItems = savedItems.map(item => {
            const newItem = { ...item };

            if (usedIds.has(newItem.id)) {
                reassignId(newItem);
            } else {
                usedIds.add(newItem.id);
            }

            if (newItem.type === 'folder' && Array.isArray(newItem.children)) {
                newItem.children = newItem.children.map(child => {
                    const newChild = { ...child };
                    if (usedIds.has(newChild.id)) {
                        reassignId(newChild);
                    } else {
                        usedIds.add(newChild.id);
                    }
                    return newChild;
                });
            }

            return newItem;
        });

        return updatedItems;
    };

    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('dashboard_items');
            const savedItemsRaw = saved ? JSON.parse(saved) : [];

            const resolvedSavedItems = resolveIdConflicts(savedItemsRaw, DEFAULT_SITES);

            const childIds = resolvedSavedItems
                .filter(i => i.type === 'folder' && Array.isArray(i.children))
                .flatMap(f => f.children.map(child => child.id));

            const merged = [
                ...DEFAULT_SITES.filter(d => !childIds.includes(d.id)),
                ...resolvedSavedItems.filter(item => !DEFAULT_SITES.some(d => d.id === item.id)),
            ];

            setItems(merged);
            setInitialized(true); // ✅ 标记已完成初始化
        }
    }, []);


    const prevRef = useRef();

    useEffect(() => {
        if (!items) return;

        const filteredItems = items.filter(item =>
            !DEFAULT_SITES.some(site => site.id === item.id)
        );

        const current = JSON.stringify(filteredItems);

        if (prevRef.current !== current && typeof window !== 'undefined') {
            console.log("set item dashboard_items");
            localStorage.setItem('dashboard_items', current);
            prevRef.current = current;
        }
    }, [items]);


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

    useEffect(() => {
        if (folderRef.current) {
            setFolderRect(folderRef.current.getBoundingClientRect());
        }
    }, [folderView]);
    if (!items) return null; // 等待数据加载
    const mergeToFolder = (itemA, itemB, folderName) => {
        const newFolder = {
            id: generateId(),
            type: 'folder',
            name: folderName,
            logo: '/icon/folder.png',
            children: [itemA, itemB],
        };
        setItems((prev) => prev.filter(i => i.id !== itemA.id && i.id !== itemB.id).concat(newFolder));
    };

    const handleDrop = (dragged, target) => {
        if (target.type === 'site' && dragged.type === 'site' && !items.some(i => i.children?.some(c => c.id === dragged.id))) {
            setPendingFolder({ itemA: dragged, itemB: target });
        } else if (target.type === 'folder') {
            setItems((prev) => prev.map(i => {
                if (i.id === target.id) return { ...i, children: [...i.children, dragged] };
                return i;
            }).filter(i => i.id !== dragged.id));
            setFolderView(null);
        }
    };

    const handleCreateFolder = () => {
        if (pendingFolder && newFolderName.trim()) {
            mergeToFolder(pendingFolder.itemA, pendingFolder.itemB, newFolderName.trim());
            setPendingFolder(null);
            setNewFolderName('');
        }
    };

    const handleRemoveFromFolder = (folderId, child) => {
        let updatedFolder = null;
        const updatedItems = items.flatMap(i => {
            if (i.id === folderId) {
                const rest = i.children.filter(c => c.id !== child.id);
                if (rest.length === 1) return rest;
                updatedFolder = { ...i, children: rest };
                return updatedFolder;
            }
            return i;
        });
        setItems([...updatedItems, { ...child }]);
        setFolderView(updatedFolder?.children.length > 0 ? updatedFolder : null);
    };

    const handleOuterDrop = (e) => {
        if (draggedChild && folderRect && folderView) {
            const x = e.clientX;
            const y = e.clientY;
            if (
                x < folderRect.left ||
                x > folderRect.right ||
                y < folderRect.top ||
                y > folderRect.bottom
            ) {
                handleRemoveFromFolder(folderView.id, draggedChild);
                setDraggedChild(null);
            }
        }
    };

    return (
        <DndProvider backend={backend}>
            <main className="relative min-h-screen font-sans" onMouseUp={handleOuterDrop} onMouseMove={handleOuterDrop}>
                <HeadItem title="If Funny" iconUrl="/icon/small/robot/favicon.png" />
                <Head>
                    <meta property="og:title" content="If funny" />
                    <meta property="og:description" content="Drag, group and manage your favorite websites on a personalized web dashboard. No login required." />
                    <meta property="og:image" content="/icon/robot.png" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                </Head>

                <CustomDragLayer />
                <TrashDropArea onDelete={(id) => setItems(prev => prev.filter(i => i.id !== id))} />
                <img src="/image/bg01.png" alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
                <div className="absolute inset-0 bg-white/30 backdrop-blur-md z-0" />

                <div className="relative z-10 p-4 md:p-8 flex flex-col min-h-screen">
                    <header className="text-center mb-6">
                        <div className="text-white text-3xl font-mono font-bold tracking-wider mb-1">{time}</div>
                        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow">If Funny</h1>
                        <h2 className="text-lg text-blue-100 italic drop-shadow">Drag icons to create folders</h2>
                    </header>

                    {initialized ? (
                        <section className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6 justify-items-center">
                            {items.map((item) => (
                                <Icon
                                    key={item.id}
                                    item={item}
                                    onDrop={handleDrop}
                                    onDelete={() => {}}
                                    onOpenFolder={(folder) => setFolderView(folder)}
                                />
                            ))}
                            {/* 添加图标按钮 */}
                            <div
                                onClick={() => setShowAddModal(true)}
                                className="flex flex-col items-center space-y-1 cursor-pointer"
                            >
                                <div className="w-20 h-20 flex items-center justify-center bg-white bg-opacity-80 rounded-2xl shadow-md border border-dashed border-blue-400 hover:bg-blue-100">
                                    <span className="text-3xl text-blue-500 font-bold">+</span>
                                </div>
                                <span className="text-xs text-white font-medium text-center">Add</span>
                            </div>
                        </section>
                    ) : null}
    
                    <AddIconModal
                        show={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onAdd={(item) => setItems(prev => [...prev, item])}
                    />
                    <footer className="mt-auto text-center text-sm text-white pt-10">
                        Made by Offline @2025
                    </footer>
                </div>

                <FolderModal
                    folderView={folderView}
                    folderRef={folderRef}
                    onClose={() => setFolderView(null)}
                    onRemoveChild={handleRemoveFromFolder}
                    onDragStart={(child) => setDraggedChild(child)}
                    onDrop={handleDrop}
                />

                {pendingFolder && (
                    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center">
                        <div className="bg-white rounded-xl p-6 shadow-lg w-80">
                            <h2 className="text-lg font-bold mb-4 text-gray-800">Name the New Folder</h2>
                            <input
                                type="text"
                                placeholder="Enter folder name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                className="w-full p-2 border rounded-md mb-4"
                            />
                            <div className="flex justify-end space-x-4">
                                <button onClick={() => setPendingFolder(null)} className="text-gray-500 hover:underline">Cancel</button>
                                <button onClick={handleCreateFolder} className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600">Create</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </DndProvider>
    );
}
