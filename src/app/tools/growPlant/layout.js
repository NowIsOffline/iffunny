import React from "react";
import HeadItem from "@/app/headItem";

export const metadata = {
    description: "Browse beautiful home design ideas and useful how-tos to make your best home. Our expert advice makes creating the home you've always wanted easy and fun./Chinese).",
    viewport: "width=device-width, initial-scale=1.0",
    charSet: "UTF-8",
    keywords: "Browse beautiful home design ideas and useful how-tos to make your best home. Our expert advice makes creating the home you've always wanted easy and fun."
};

export default function TxtReaderLayout({children}) {
    return (
        <div>
            <HeadItem title="The Spruce: Make Your Best Home" iconUrl="https://www.thespruce.com/favicon.ico" />
            {children}
        </div>
    );
}
