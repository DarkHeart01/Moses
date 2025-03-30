"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import GoogleLoginButton from "@/components/auth/login-button";
import Image from "next/image";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:block relative w-1/2">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-xl text-white">
            <Image 
              src="/unnati-logo-white.png" 
              alt="Unnati Cloud Labs" 
              width={200} 
              height={80} 
              className="mb-8"
            />
            <h2 className="text-3xl font-bold mb-6">Virtual Learning Without Limits</h2>
            <p className="text-lg mb-6">
              Access high-performance virtual labs directly from your browser.
              No hardware limitations. No complex setup. Just pure learning.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access Unnati Cloud Labs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleLoginButton />
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
