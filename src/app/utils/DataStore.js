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
        }
    }

    loadFromLocal() {
        if (typeof window !== 'undefined') {
            const storedIcons = localStorage.getItem('icons');
            const storedCfg = localStorage.getItem('otherCfg');

            if (storedIcons) {
                this._icons = JSON.parse(storedIcons);
            }

            if (storedCfg) {
                this.OtherItemCfg = JSON.parse(storedCfg);
            }

            if (this._icons.length === 0) {
                this._icons = Object.keys(SHOP_SITE_CFG).map(id => parseInt(id));
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
            if (this._icons[i] < this.LocalSaveIconID) {
                installIconId.push(this._icons[i]);
            } else {
                const iconCfg = this.GetIconCfg(this._icons[i]);
                if (iconCfg && iconCfg.iconType === "file") {
                    for (let j = 0; j < iconCfg.itemArr.length; j++) {
                        if (iconCfg.itemArr[j] < this.LocalSaveIconID) {
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
        const idx = this._icons.indexOf(id);
        if (idx !== -1) {
            this._icons.splice(idx, 1);
            this.saveToLocal();
            if (this._setIcons) {
                this._setIcons([...this._icons]);
            }
            return;
        }

        const updatedIcons = [];
        for (let iconId of this._icons) {
            const cfg = this.GetIconCfg(iconId);
            if (cfg && cfg.iconType === 'file') {
                const indexInArr = cfg.itemArr.indexOf(id);
                if (indexInArr !== -1) {
                    cfg.itemArr.splice(indexInArr, 1);
                    if (cfg.itemArr.length === 1) {
                        updatedIcons.push(cfg.itemArr[0]);
                        delete this.OtherItemCfg[cfg.id];
                    } else if (cfg.itemArr.length > 1) {
                        updatedIcons.push(iconId);
                    }
                    break;
                }
            } else {
                updatedIcons.push(iconId);
            }
        }

        this._icons = updatedIcons;
        this.saveToLocal();
        if (this._setIcons) {
            this._setIcons([...this._icons]);
        }
    }
}

const singleton = new DataStore();
export default singleton;
