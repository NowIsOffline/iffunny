import "./globals.css";
import GoogleCode from "@/app/googleCode";
import React from "react";



export const metadata = {
  description: "iFunny - choice-helper.iFunny tools platform offering choice-helper and various productivity utilities.", 
  keywords:"iFunny,merging game, TXT reader,spy game,Spy Identification, Tension Challenge,choice-helper,tools platform, online utilities, decision helper",
  viewport:"width=device-width, initial-scale=1.0"  
};

export default function RootLayout({ children }) {
  return (
      <html lang="en">
      <body
      >
      <GoogleCode></GoogleCode>

      {children}
      </body>
      </html>
  );
}
