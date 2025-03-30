// app/lab/[sessionId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertCircle, Terminal, Power } from "lucide-react";
import Terminall from "@/components/layout/terminal";

interface SessionData {
  id: string;
  osType: string;
  status: string;
  startTime: string;
  timeRemaining: number;
  connectionUrl?: string;
}

export default function LabSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = require("@/components/ui/use-toast");
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);

  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch(`/api/lab/${sessionId}/status`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch session data");
        }
        
        const data = await response.json();
        setSession(data);
        setTimeRemaining(data.timeRemaining);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Failed to load lab session");
        setLoading(false);
      }
    };

    fetchSessionData();
    const interval = setInterval(fetchSessionData, 10000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Set up timer to update remaining time
  useEffect(() => {
    if (!session || session.status !== "running") return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Show warning when 5 minutes remaining
        if (newTime === 300 && !showWarning) {
          setShowWarning(true);
          toast({
            title: "Session ending soon",
            description: "Your lab session will end in 5 minutes. Please save your work.",
            variant: "warning",
          });
        }
        
        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, showWarning, toast]);

  const formatRemainingTime = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTerminateSession = async () => {
    if (!confirm("Are you sure you want to end this session? All unsaved work will be lost.")) {
      return;
    }

    try {
      const response = await fetch(`/api/lab/${sessionId}/terminate`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to terminate session");
      }
      
      toast({
        title: "Session terminated",
        description: "Your lab session has been terminated successfully.",
      });
      
      router.push("/");
    } catch (err) {
      console.error("Error terminating session:", err);
      toast({
        title: "Error",
        description: "Failed to terminate session",
        variant: "destructive",
      });
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Card className="w-full max-w-4xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
              <p className="mt-4 text-lg">Loading your lab environment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render error state
  if (error || !session) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Session not found"}</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => router.push("/")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Terminal className="mr-2 h-6 w-6 text-blue-500" />
            {session.osType} Lab Session
          </h1>
          <p className="text-gray-500">
            Started at {new Date(session.startTime).toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Time remaining:</div>
            <div className="font-medium">{formatRemainingTime()}</div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleTerminateSession}
          >
            <Power className="mr-2 h-4 w-4" />
            End Session
          </Button>
        </div>
      </div>
      
      <Progress 
        value={(timeRemaining / (45 * 60)) * 100} 
        className="h-1 mb-4"
      />
      
      {showWarning && (
        <Alert className="mb-4" >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Session ending soon</AlertTitle>
          <AlertDescription>
            Your lab session will end in less than 5 minutes. Please save your work.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="bg-black rounded-md h-[calc(100vh-220px)] min-h-[500px]">
        {session.connectionUrl ? (
          <Terminall 
            connectionUrl={session.connectionUrl}
            onDisconnect={() => {
              toast({
                title: "Disconnected",
                description: "You have been disconnected from the lab session.",
                variant: "destructive",
              });
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connection not available</h3>
            <p className="text-gray-400 text-center max-w-md">
              {session.status === "provisioning" 
                ? "Your lab environment is still being provisioned. This usually takes 1-2 minutes."
                : "Unable to connect to the lab environment. Please try refreshing the page."}
            </p>
            {session.status !== "provisioning" && (
              <Button 
                className="mt-4"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
