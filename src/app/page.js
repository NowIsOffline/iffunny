'use client';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';  // 导入 TouchBackend
import { IconProvider } from './context/IconContext';
import IconGrid from './IconGrid';
import HeadItem from "@/app/headItem";
import Head from "next/head";
import React, { useState } from "react";

export default function Page() {
    // 直接使用三元表达式动态设置后端
    let backend = HTML5Backend;
    if (typeof window !== 'undefined') {
        backend= /Mobi|Android/i.test(window.navigator.userAgent) ? TouchBackend :HTML5Backend;
    }
    return (
        <DndProvider backend={backend}>
            <HeadItem title="If Funny" iconUrl="/icon/robot.ico"/>
            <Head>
                <link rel="canonical" href="https://iffunny.com/"/>
                <meta property="og:title" content="If funny"/>
                <meta property="og:description"
                      content="Drag, group and manage your favorite websites on a personalized web dashboard. No login required."/>
                <meta property="og:image" content="https://iffunny.com/path-to-image.png"/>
                <meta property="og:url" content="https://iffunny.com/"/>
                <meta property="og:type" content="website"/>
            </Head>
            <img src="https://picsum.photos/200/300/?blur" alt="Random Image" className="absolute inset-0 w-full h-full object-cover z-0"/>

            <div className="absolute inset-0 bg-white/30 backdrop-blur-md z-0"/>

            <IconProvider className={"relative min-h-screen font-sans"}>
                <IconGrid/>
            </IconProvider>
        </DndProvider>
    );
}
