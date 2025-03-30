"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    // If we have a token, verify it
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    setVerifying(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/auth/verify/${token}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to verify email");
      }
      
      setVerified(true);
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push("/login?verified=true");
      }, 3000);
    } catch (err) {
      console.error("Verification error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setVerifying(false);
    }
  };

  const resendVerification = async () => {
    if (!email) {
      setError("Email address is missing");
      return;
    }
    
    setResending(true);
    setError(null);
    setResendSuccess(false);
    
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to resend verification email");
      }
      
      setResendSuccess(true);
    } catch (err) {
      console.error("Resend verification error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {token 
              ? "We're verifying your email address" 
              : "Please verify your email address to continue"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {token ? (
            <div className="flex flex-col items-center py-4">
              {verifying ? (
                <>
                  <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
                  <p className="text-center">Verifying your email address...</p>
                </>
              ) : verified ? (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Email Verified!</h3>
                  <p className="text-center text-gray-500">
                    Your email has been successfully verified. You'll be redirected to the login page.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-16 w-16 text-red-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Verification Failed</h3>
                  <p className="text-center text-gray-500 mb-4">
                    {error || "We couldn't verify your email address. The link may have expired."}
                  </p>
                  {email && (
                    <Button onClick={resendVerification} disabled={resending}>
                      {resending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Resend Verification Email
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p>
                We've sent a verification email to <strong>{email}</strong>.
                Please check your inbox and click the verification link to activate your account.
              </p>
              
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {resendSuccess && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Verification email has been resent. Please check your inbox.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex flex-col space-y-2">
                <Button onClick={resendVerification} disabled={resending}>
                  {resending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            {verified ? (
              <Link href="/login" className="text-blue-600 hover:underline">
                Go to Login
              </Link>
            ) : (
              <>
                Return to{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </>
            )}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
