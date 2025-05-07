import "./globals.css";
import GoogleCode from "@/app/googleCode";
import React from "react";



export const metadata = {
  description: "iFunny - A clean, customizable web launcher with drag-and-drop icons, folder grouping, and local saving. Organize your favorite sites into a minimal start page.", 
  keywords:"iFunny,web launcher, drag and drop dashboard, custom homepage, site organizer, bookmark launcher, online launcher, website collection, icon grid, personal dashboard, minimal start page",
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
