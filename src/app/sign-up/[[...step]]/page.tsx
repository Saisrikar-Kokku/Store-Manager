import { SignUp } from '@clerk/nextjs';

export default function SignUpStepPage() {
  return (
    <SignUp
      afterSignInUrl="/"
      afterSignUpUrl="/"
      signInUrl="/sign-in"
      forceRedirectUrl="/"
    />
  );
} 