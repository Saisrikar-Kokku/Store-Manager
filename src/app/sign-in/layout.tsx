import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-black text-white min-h-screen flex items-center justify-center">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
} 