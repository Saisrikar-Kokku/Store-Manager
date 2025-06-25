import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import Image from 'next/image';
import React from 'react';
import ThemeToggle from '@/components/ThemeToggle';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LUVORA – Let Aura Wear Our Love",
  description: "LUVORA: Let Aura Wear Our Love. A futuristic, neon-inspired business management app for fashion brands.",
  keywords: ["luvora", "clothing store", "inventory management", "sales tracking", "neon", "fashion", "business management", "aura", "love", "retail"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${spaceGrotesk.variable} antialiased font-sans bg-black text-white min-h-screen`}
        >
          <header className="glass flex items-center justify-between px-6 py-4 border-b border-luvora/30 bg-black/80 sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <Image src="/luvora-logo.png" alt="LUVORA Logo" width={120} height={120} priority />
              <div>
                <h1 className="text-3xl font-bold font-luvora text-luvora drop-shadow-lg">LUVORA</h1>
                <p className="text-xs text-pink-300 tracking-widest font-medium mt-1">LET AURA WEAR OUR LOVE.</p>
              </div>
            </div>
            <ThemeToggle />
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="glass p-6 rounded-2xl shadow-lg">
              {children}
            </div>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
