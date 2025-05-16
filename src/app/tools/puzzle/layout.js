import React from "react";
import Script from 'next/script';

export const metadata = {
    description: "Generate high-resolution jigsaw puzzles with curved Bezier edges. Customize rows, columns, curve strength, and download precise puzzle pieces.",
    viewport: "width=device-width, initial-scale=1.0",
    charSet: "UTF-8",
    keywords: "online,puzzle generator, jigsaw maker, bezier puzzle, custom puzzle online, download puzzle pieces"
};

export default function PuzzleReaderLayout({children}) {
    return (
        <div>
            <Script
                id="json-ld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "Online Puzzle Generator",
                        "url": "https://iffunny.com/tools/puzzle",
                        "applicationCategory": "MultimediaApplication",
                        "operatingSystem": "All",
                        "description": "Generate high-resolution jigsaw puzzles with curved Bezier edges..."
                    })
                }}
            />

            {children}
        </div>
    );
}
