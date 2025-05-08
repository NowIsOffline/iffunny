import React from "react";
import HeadItem from "@/app/headItem";

export const metadata = {
    title:"Tetris",
    description: "TXT reader",
    viewport: "width=device-width, initial-scale=1.0",
    charSet: "UTF-8",
    keywords: "TXT reader"
};

export default function TxtReaderLayout({children}) {
    return (
        <div>
            <HeadItem title="Funny Game" iconUrl="/icon/small/robot/favicon.png" />
            {children}
        </div>
    );
}
