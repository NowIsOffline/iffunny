// page.js
'use client';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { IconProvider } from './context/IconContext';
import IconGrid from './IconGrid';
import HeadItem from "@/app/headItem";
import Head from "next/head";
import React, {useEffect, useState} from "react";

export default function Page() {

    return (
        <DndProvider backend={HTML5Backend}>
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
            <img src="/image/bg01.png" alt="Background" className="absolute inset-0 w-full h-full object-cover z-0"/>
            <div className="absolute inset-0 bg-white/30 backdrop-blur-md z-0"/>

            <IconProvider className={"relative min-h-screen font-sans"}>
                <IconGrid/>
            </IconProvider>
        </DndProvider>
    );
}
