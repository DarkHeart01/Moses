// src/components/auth/logout-button.tsx
"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout} 
      disabled={isLoading}
      className="flex items-center"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      Sign out
    </Button>
  );
}
