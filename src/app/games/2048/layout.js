import React from "react";
import HeadItem from "@/app/headItem";

export const metadata = {
    description: "The 2048 Classic Game. This is the classic version of 2048 game. Join the numbers and get to the 2048 tile. Play 2048 online for free here.",
    viewport: "width=device-width, initial-scale=1.0",
    charSet: "UTF-8",
    keywords: [
        "2048 game",
        "2048 puzzle",
        "2048 online",
        "number merging game",
        "play 2048 free",
        "2048 strategy",
        "2048 high score",
        "addictive puzzle game",
        "math puzzle game",
        "sliding tile game"
    ]};

export default function TetrisReaderLayout({children}) {
    return (
        <div>
            <HeadItem title="2048 Game - Play 2048 Game Online" iconUrl="https://2048game.com/favicon.ico" />
            {children}
        </div>
    );
}
