"use client";
import { SignIn, UserButton, SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import React from 'react';

const ClerkAuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded } = useUser();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-luvora mx-auto mb-4"></div>
          <p className="text-gray-500">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <div className="flex justify-end p-4">
          <UserButton afterSignOutUrl="/" />
        </div>
        {children}
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen bg-black">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-luvora text-luvora mb-2">LUVORA</h1>
            <p className="text-pink-300 tracking-widest">LET AURA WEAR OUR LOVE</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-luvora/30">
            <SignIn routing="hash" signUpUrl="/sign-up" />
          </div>
        </div>
      </SignedOut>
    </>
  );
};

export default ClerkAuthWrapper; 