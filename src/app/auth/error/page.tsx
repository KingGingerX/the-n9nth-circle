"use client";

import { Skull } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "Server configuration error. Contact the Game Master.",
  AccessDenied: "Access denied. You are not authorized.",
  Verification: "Verification link is invalid or expired.",
  OAuthSignin: "OAuth signin failed. Try a different provider.",
  OAuthCallback: "OAuth callback error. Try again.",
  OAuthCreateAccount: "Could not create account. Try a different provider.",
  EmailCreateAccount: "Could not create account with that email.",
  Callback: "Authentication callback failed.",
  SessionRequired: "You must be signed in to access this page.",
  Default: "An authentication error occurred.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <Skull className="w-14 h-14 text-blood-600 mx-auto mb-6" />
        <h1 className="font-display text-3xl font-black text-bone-100 mb-3">Authentication Failed</h1>
        <p className="text-bone-400 text-sm mb-2">{message}</p>
        {error !== "Default" && (
          <p className="text-bone-600 text-xs mb-8">Error code: {error}</p>
        )}
        <div className="space-y-3">
          <Link href="/auth/signin" className="btn-primary block w-full text-center">
            Try Again
          </Link>
          <Link href="/" className="btn-secondary block w-full text-center">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-bone-500">Loading...</div></div>}>
      <ErrorContent />
    </Suspense>
  );
}
