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
    title: "TXT reader",
    description: "TXT reader",
    viewport: "width=device-width, initial-scale=1.0",
    charSet: "UTF-8",
    keywords: "TXT reader"
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <link rel="canonical" href="https://iffunny.com/"/>
        <link rel="icon" type="image/png" href="icon/small/png2ico/png2ico_32x32.png"/>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <GoogleCode/>

        {children}
        </body>
        </html>
    );
}
