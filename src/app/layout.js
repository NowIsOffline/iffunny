import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
  description: "iFunny - choice-helper.iFunny tools platform offering choice-helper and various productivity utilities.", 
  keywords:"iFunny,merging game, TXT reader,spy game,Spy Identification, Tension Challenge,choice-helper,tools platform, online utilities, decision helper",
  viewport:"width=device-width, initial-scale=1.0"  
};

export default function RootLayout({ children }) {
  return (
      <html lang="en">
      <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <GoogleCode/>

      {children}
      </body>
      </html>
  );
}
