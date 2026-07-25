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

import { CONFIG } from "@/lib/config";

export const metadata = {
  title: CONFIG.SITE_NAME,
  description: CONFIG.DESCRIPTION,
};

export default function RootLayout({ children, authModal, taskModal }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-slate-100">
        {children}
        {authModal}
        {taskModal}
      </body>
    </html>
  );
}
