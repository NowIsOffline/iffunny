import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "If funny",
  description: "If funny",
};

export default function RootLayout({ children }) {
  return (
      <html lang="en">
      <link rel="canonical" href="https://iffunny.com/"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <meta name="description"
            content="iFunny - choice-helper.iFunny tools platform offering choice-helper and various productivity utilities."/>
      <meta name="keywords"
            content="iFunny,merging game, TXT reader,spy game,Spy Identification, Tension Challenge,choice-helper,tools platform, online utilities, decision helper"/>
      <link rel="icon" type="image/png" sizes="32x32" href="./icon/small/robot/favicon-32x32.png"/>
      <link rel="icon" type="image/png" sizes="16x16" href="./icon/small/robot/favicon-16x16.png"/>
      <link rel="apple-touch-icon" sizes="180x180" href="./icon/small/robot/apple-touch-icon.png"/>

      <meta property="og:title" content="iFunny | choice-helper"/>
      <meta property="og:description" content="choice-helper,funny game"/>
      <meta property="og:image" content="https://iffunny.com/images/logo.png"/>
      <meta property="og:url" content="https://iffunny.com/"/>
      <meta name="twitter:card" content="summary_large_image"/>

      <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      {children}
      </body>
      </html>
  );
}
