import {Geist, Geist_Mono} from "next/font/google";
import GoogleCode from "@/app/googleCode";
import React from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    description: "TXT reader",
    viewport: "width=device-width, initial-scale=1.0",
    charSet: "UTF-8",
    keywords: "TXT reader"
};

export default function TxtReaderLayout({children}) {
    return (
        <main
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {children}
        </main>
    );
}
