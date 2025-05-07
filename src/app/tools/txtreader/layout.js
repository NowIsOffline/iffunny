import React from "react";

export const metadata = {
    description: "TXT reader",
    viewport: "width=device-width, initial-scale=1.0",
    charSet: "UTF-8",
    keywords: "TXT reader"
};

export default function TxtReaderLayout({children}) {
    return (
        <div>
        {children}
        </div>
    );
}
