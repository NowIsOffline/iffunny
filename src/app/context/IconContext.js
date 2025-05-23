'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import dataStore from '../utils/DataStore';
import { SHOP_SITE_CFG } from '../configs/shop'; // 若需重置初始

const IconContext = createContext();

export function IconProvider({ children }) {
    const [icons, setIcons] = useState([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            dataStore.loadFromLocal();
            dataStore.injectIconsSetter(setIcons);
            setIcons([...dataStore.ICONS]);
        }
    }, []);

    const moveIcon = (from, to) => {
        if (from === to || from < 0 || to < 0 || from >= icons.length || to > icons.length) return;

        const updated = [...icons];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        dataStore._icons = updated;        // 更新数据源
        dataStore.saveToLocal();           // 手动持久化
        setIcons([...updated]);            // 触发 UI 刷新
    };


    const tryAddCustomItem = (newItem) => {
        const createIconID = dataStore.LocalSaveIconID++;
        newItem.id = createIconID;
        dataStore.OtherItemCfg[createIconID] = newItem;
        const updated = [...icons, createIconID];
        dataStore.ICONS = updated;
    };

    return (
        <IconContext.Provider value={{ icons, setIcons, moveIcon, tryAddCustomItem }}>
            {children}
        </IconContext.Provider>
    );
}

export function useIcons() {
    return useContext(IconContext);
}
