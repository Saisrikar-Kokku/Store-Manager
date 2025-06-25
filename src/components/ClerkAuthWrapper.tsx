"use client";
import { SignIn, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import React from 'react';

const ClerkAuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <SignedIn>
      <div className="flex justify-end p-4">
        <UserButton afterSignOutUrl="/" />
      </div>
      {children}
    </SignedIn>
    <SignedOut>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <SignIn routing="hash" signUpUrl="/sign-up" />
      </div>
    </SignedOut>
  </>
);

export default ClerkAuthWrapper; 