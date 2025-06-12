'use client';

import { SHOP_SITE_CFG } from "@/app/configs/shop";

class DataStore {
    NormalItemNum = 100000;
    LocalSaveIconID = 100000;

    constructor() {
        if (DataStore.instance) return DataStore.instance;

        this.OtherItemCfg = {};
        this._icons = [];
        this._setIcons = null;

        // ❌ 不在构造函数加载本地数据，避免 SSR 报错
        DataStore.instance = this;
    }

    injectIconsSetter(setter) {
        this._setIcons = setter;
    }

    saveToLocal() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('icons', JSON.stringify(this._icons));
            localStorage.setItem('otherCfg', JSON.stringify(this.OtherItemCfg));
            localStorage.setItem('localSaveIconID', JSON.stringify(this.LocalSaveIconID)); // ✅ 保存 LocalSaveIconID
        }
    }

    loadFromLocal() {
        if (typeof window !== 'undefined') {
            const storedIcons = localStorage.getItem('icons');
            const storedCfg = localStorage.getItem('otherCfg');
            const storedId = localStorage.getItem('localSaveIconID');
            if (storedIcons) {
                this._icons = JSON.parse(storedIcons);
            }
            if (storedCfg) {
                this.OtherItemCfg = JSON.parse(storedCfg);
            }
            if (storedId) {
                this.LocalSaveIconID = JSON.parse(storedId); // ✅ 还原 LocalSaveIconID
            }

            if (this._icons.length === 0) {
                this._icons = [1,12];
                this.saveToLocal();
            }
        }
    }

    get ICONS() {
        return this._icons;
    }

    set ICONS(val) {
        this._icons = val;
        this.saveToLocal();
        if (this._setIcons) {
            this._setIcons([...val]);
        }
    }

    GetIconCfg(iconId) {
        if (SHOP_SITE_CFG?.hasOwnProperty(iconId) && iconId < this.NormalItemNum) {
            return SHOP_SITE_CFG[iconId];
        } else if (this.OtherItemCfg?.hasOwnProperty(iconId)) {
            return this.OtherItemCfg[iconId];
        }
        return SHOP_SITE_CFG[1];
    }

    get InstallIcons() {
        let installIconId = [];
        for (let i = 0; i < this._icons.length; i++) {
            if (this._icons[i] < this.NormalItemNum) {
                installIconId.push(this._icons[i]);
            } else {
                const iconCfg = this.GetIconCfg(this._icons[i]);
                if (iconCfg && iconCfg.iconType === "file") {
                    for (let j = 0; j < iconCfg.itemArr.length; j++) {
                        if (iconCfg.itemArr[j] < this.NormalItemNum) {
                            installIconId.push(iconCfg.itemArr[j]);
                        }
                    }
                }
            }
        }
        return installIconId;
    }

    TryAddIcon(id) {
        if (!this._icons.includes(id)) {
            this._icons.push(id);
            this.saveToLocal();
            if (this._setIcons) {
                this._setIcons([...this._icons]);
            }
        }
    }

    TryRemoveIcon(id) {
        console.log(id)
        const idx = this._icons.indexOf(id);
        if (idx !== -1) {
            console.log("idx !== -1")
            this._icons.splice(idx, 1);
            if(this.OtherItemCfg.hasOwnProperty(id)){
                delete this.OtherItemCfg[id];
            }
            this.saveToLocal();
            if (this._setIcons) {
                this._setIcons([...this._icons]);
            }
            return;
        }

        const updatedIcons = [];
        for (let iconId of this._icons) {
            const cfg = this.GetIconCfg(iconId);
            console.log(cfg)
            if (cfg && cfg.iconType === 'file') {
                const indexInArr = cfg.itemArr.indexOf(id);
                console.log(`indexInArr${indexInArr}`)
                if (indexInArr !== -1) {
                    cfg.itemArr.splice(indexInArr, 1);
                    if (cfg.itemArr.length === 1) {
                        updatedIcons.push(cfg.itemArr[0]);
                        delete this.OtherItemCfg[cfg.id];
                    } else if (cfg.itemArr.length > 1) {
                        updatedIcons.push(iconId);
                    }
                }else{
                    updatedIcons.push(iconId);
                }
            } else {
                updatedIcons.push(iconId);
            }
        }
        console.log(updatedIcons)
        this._icons = updatedIcons;
        this.saveToLocal();
        if (this._setIcons) {
            this._setIcons([...this._icons]);
        }
    }

    CreateFolderOrJoinIn(targetID, toID) {
        // 检查两个 ID 是否都在主图标列表中
        if (!this._icons.includes(targetID) || !this._icons.includes(toID)) {
            return false;
        }

        const targetCfg = this.GetIconCfg(targetID);
        const toCfg = this.GetIconCfg(toID);

        if (toCfg.iconType === "file") {
            // ✅ 将 targetID 加入已有文件夹中
            if (!toCfg.itemArr.includes(targetID)) {
                toCfg.itemArr.push(targetID);
            }

            // 移除 targetID
            const index = this._icons.indexOf(targetID);
            if (index !== -1) this._icons.splice(index, 1);

        } else {
            // ✅ 创建新的文件夹（组合图标）
            const newID = this.LocalSaveIconID++;
            const newCfg = {
                id: newID,
                name: "New Group",
                logo: "", // 可自定义
                iconType: "file",
                itemArr: [toID, targetID]
            };

            this.OtherItemCfg[newID] = newCfg;

            // 移除原始图标
            this._icons = this._icons.filter(id => id !== targetID && id !== toID);

            // 添加新图标
            this._icons.push(newID);
        }

        this.saveToLocal();
        if (this._setIcons) {
            this._setIcons([...this._icons]);
        }

        return true;
    }
    GetIconId(index){
        return this._icons[index]
    }
}

const singleton = new DataStore();
export default singleton;
