import { Geist, Geist_Mono, Jost } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${jost.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-black text-slate-100" suppressHydrationWarning>
        {children}
        {authModal}
        {taskModal}
      </body>
    </html>
  );
}
