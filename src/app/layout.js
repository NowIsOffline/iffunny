import GoogleCode from "@/app/googleCode";
import React from "react";
import styles from './style.css'



export const metadata = {
  description: "iFunny - A clean, customizable web launcher with drag-and-drop icons, folder grouping, and local saving. Personalized bookmark page,Organize your favorite sites into a minimal start page.", 
  keywords:"iFunny,online tools,online games,web launcher, drag and drop dashboard, custom homepage, site organizer, bookmark launcher, online launcher, website collection, icon grid, personal dashboard, minimal start page",
  viewport:"width=device-width, initial-scale=1.0"  
};

export default function RootLayout({ children }) {
  return (
      <html lang="en">
      <head>
          <link rel="canonical" href="https://iffunny.com/"/>
      </head>
      <body
      >
      <GoogleCode></GoogleCode>

      {children}
      </body>
      </html>
  );
}
