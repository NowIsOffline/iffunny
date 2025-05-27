import React from "react";
import HeadItem from "@/app/headItem";

export const metadata = {
    description: "Fully featured free online PNG to ICO converter creates multi-image icon files,Convert PNG to ICO online for free. Support multiple icon sizes (16x16, 32x32, 48x48, 256x256), batch upload and download. No login, no watermark. Fast, clean, and bilingual (English/Chinese).",
    viewport: "width=device-width, initial-scale=1.0",
    charSet: "UTF-8",
    keywords: "PNG to ICO, online icon converter, ico generator, free PNG to icon, batch convert png, favicon converter, create ico file, Windows icon maker, convert png to ico online, multi-size icon\n"
};

export default function TxtReaderLayout({children}) {
    return (
        <div>
            <HeadItem title="Free online PNG image to icon converter" iconUrl="https://www.png2ico.com/images/favicon.ico" />
            {children}
        </div>
    );
}
