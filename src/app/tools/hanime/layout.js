import React from "react";
import HeadItem from "@/app/headItem";

export const metadata = {
    description: "Watch hentai online free download HD on mobile phone tablet laptop desktop.  Stream online, regularly released uncensored, subbed, in 720p and 1080p!",
    viewport: "width=device-width, initial-scale=1.0",
    charSet: "UTF-8",
    keywords: "Watch hentai online free download HD on mobile phone tablet laptop desktop.  Stream online, regularly released uncensored, subbed, in 720p and 1080p!"
};

export default function TxtReaderLayout({children}) {
    return (
        <div>
            <HeadItem title="Yeah you know" iconUrl="https://hanime.tv/favicon.png" />
            {children}
        </div>
    );
}
