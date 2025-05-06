import { Geist, Geist_Mono } from "next/font/google";
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
    title: "PNG to Multi-Size Icon Generator",
    description: "Convert PNG to ICO and other sizes online. 在线多尺寸 PNG 转图标工具。Free online tool to convert PNG to multiple icon sizes like 16x16, 32x32, 512x512. 免费在线 PNG 图标转换工具。",
    viewport:"width=device-width, initial-scale=1.0",
    charSet:"UTF-8",
    keywords:"png to ico, png resize, 图标生成, favicon 生成, 图标打包"
};

export default function RootLayout({ children }) {
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
