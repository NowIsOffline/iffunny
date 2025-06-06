import React from "react";
import HeadItem from "@/app/headItem";

export const metadata = {
    description: "Enjoy a fast and responsive Tetris game online. Features dark mode, sound, mobile controls, and high score tracking.",
    viewport: "width=device-width, initial-scale=1.0",
    charSet: "UTF-8",
    keywords: "Tetris, block game, online tetris, classic puzzle, falling blocks, mobile tetris, web tetris,Tetris online, play Tetris for free, HTML5 Tetris, dark mode Tetris, retro block puzzle, browser Tetris, mobile Tetris game, falling blocks"
};

export default function TetrisReaderLayout({children}) {
    return (
        <div id="tetrisLayout">
            <HeadItem title="Tetris" iconUrl="/icon/tetris.ico" />
            {children}
        </div>
    );
}
