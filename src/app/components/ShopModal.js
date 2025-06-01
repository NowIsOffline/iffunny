import React from 'react';
import dataStore from '../utils/DataStore';
import {SHOP_SITE_CFG} from '../configs/shop'; // 你的配置

export default function ShopModal({ onClose }) {
    const installedIds = dataStore.InstallIcons;

    const toggleInstall = (id) => {
        if (installedIds.includes(id)) {
            dataStore.TryRemoveIcon(id);
        } else {
            dataStore.TryAddIcon(id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-[32rem] max-h-[80vh] p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Funny WebSite</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">×</button>
                </div>
                {/* Add fixed height and scrolling to only the list */}
                <ul className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {Object.values(SHOP_SITE_CFG)
                        .filter(app => app.id !== 1)
                        .map(app => (
                            <li key={app.id} className="flex items-center justify-between border p-2 rounded-md hover:bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <img src={app.logo} alt={app.name} className="w-10 h-10" />
                                    <div>
                                        <p className="font-semibold">{app.name}</p>
                                        <p className="text-sm text-gray-600">{app.desc}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleInstall(app.id)}
                                    className={`px-4 py-1 rounded-md text-white ${installedIds.includes(app.id) ? 'bg-red-500' : 'bg-green-500'} flex items-center justify-center`}
                                    style={{
                                        minWidth: '100px',  // Ensures consistent width for both buttons
                                        width: 'auto'       // Let the width adjust if needed while ensuring consistency
                                    }}
                                >
                                    {installedIds.includes(app.id) ? 'Uninstall' : 'Install'}
                                </button>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}
