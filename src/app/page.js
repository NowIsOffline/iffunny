'use client';
import React, { useState, useEffect } from "react";
import GoogleCode from "@/app/googleCode";
const DEFAULT_SITES = [
    // { name: "Ball Game", url: "https://iffunny.com/ballgames/", logo: "/icon/ballgames.png" },
    // { name: "Compose Game", url: "https://iffunny.com/composegame/", logo: "/icon/composegame.png" },
    // { name: "No Spy", url: "https://iffunny.com/nervesgame/", logo: "/icon/protect.png" },
    // { name: "png2ico", url: "https://iffunny.com/png2ico/", logo: "/icon/png2ico.png" },
    // { name: "TXT reader", url: "https://iffunny.com/txtreader/", logo: "/icon/education.png" },
    // { name:"choice-helper", url: "https://iffunny.com/choice-helper/", logo: "/icon/choice-helper.png" },
    { name:"Google", url: "https://google.com", logo: "https://www.google.com/favicon.ico" },
    { name: "GitHub", url: "https://github.com", logo: "https://github.com/favicon.ico" },
    { name: "Wikipedia", url: "https://wikipedia.org", logo: "https://www.wikipedia.org/favicon.ico" }

];

const LOCAL_STORAGE_KEY = "customSites";

export default function CartoonNav() {
    const [search, setSearch] = useState("");
    const [time, setTime] = useState("");
    const [customSites, setCustomSites] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newSite, setNewSite] = useState({ name: "Website", url: "", logo: "/icon/robot.png" });

    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            setCustomSites(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customSites));
    }, [customSites]);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const seconds = now.getSeconds().toString().padStart(2, "0");
            setTime(`${hours}:${minutes}:${seconds}`);
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    const allSites = [...DEFAULT_SITES, ...customSites];
    const filteredSites = allSites.filter(site =>
        site.name.toLowerCase().includes(search.toLowerCase())
    );
    
    
    const handleAddSite = () => {
        if (!newSite.url.trim()) return;
        setCustomSites([...customSites, { ...newSite }]);
        setNewSite({ name: "Website", url: "", logo: "/icon/other.png" });
        setShowModal(false);
    };

    return (
        <main className="relative min-h-screen font-sans">
            {/* Background Image */}
            <GoogleCode/>
            <img
                src="/image/bg01.png"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />
            {/* Blurred Overlay */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-md z-0" />

            <div className="relative z-10 p-4 md:p-8 flex flex-col min-h-screen">
                <header className="text-center mb-6">
                    <div className="text-white text-3xl font-mono font-bold tracking-wider mb-1">{time}</div>
                    <h1 className="text-4xl font-bold text-white mb-2 drop-shadow">If Funny</h1>
                    <h2 className="text-lg text-blue-100 italic drop-shadow">Click any icon to visit the site</h2>
                </header>

                <div className="flex justify-center mb-6">
                    <input
                        type="text"
                        placeholder="🔍 Search site name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 w-full max-w-md rounded-full shadow-inner border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <section className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6 justify-items-center">
                    {filteredSites.map((site) => (
                        <div key={site.url} className="flex flex-col items-center space-y-1">
                            <a
                                href={site.url}
                                className="w-20 h-20 flex items-center justify-center bg-white bg-opacity-80 rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all border border-blue-200"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img src={site.logo} alt={`${site.name} logo`} className="w-10 h-10" />
                            </a>
                            <span className="text-xs text-white font-medium text-center px-1 leading-tight">
                {site.name}
              </span>
                        </div>
                    ))}

                    {/* Add new site */}
                    <div
                        className="flex flex-col items-center space-y-1 cursor-pointer"
                        onClick={() => setShowModal(true)}
                    >
                        <div className="w-20 h-20 flex items-center justify-center bg-white bg-opacity-80 rounded-2xl shadow-inner border border-dashed border-blue-300 text-blue-400 text-3xl">
                            +
                        </div>
                        <span className="text-xs text-white font-medium text-center px-1 leading-tight">
              Add Site
            </span>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-auto text-center text-sm text-white pt-10">
                    Made by Offline @2025
                </footer>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-20 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-80 space-y-4 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-800 text-center">Add New Site</h3>
                        <input
                            type="text"
                            placeholder="Site Name (default: Website)"
                            value={newSite.name}
                            onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                            className="w-full p-2 border rounded-md"
                        />
                        <input
                            type="text"
                            placeholder="Site URL (required)"
                            value={newSite.url}
                            onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                            className="w-full p-2 border rounded-md"
                        />
                        {/* Logo is fixed to default */}
                        <input
                            type="text"
                            value="/icon/other.png"
                            disabled
                            className="w-full p-2 border rounded-md bg-gray-100 text-gray-400 cursor-not-allowed"
                            title="Logo is fixed and not editable"
                        />

                        <div className="flex justify-between pt-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-sm text-gray-500 hover:underline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddSite}
                                className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
