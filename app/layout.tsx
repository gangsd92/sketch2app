import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sketch2App — Gemini Agent",
  description: "Sketch a UI. A Gemini agent analyzes, plans, builds, and chats with you to refine it — live.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#09090b] text-[#fafafa] antialiased dark">
      <body className={`${inter.className} h-screen flex flex-col overflow-hidden`}>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
