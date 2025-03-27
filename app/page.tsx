"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Clock, AlertCircle, Terminal, Play, Repeat, Loader2 } from "lucide-react";
import { Toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Types for our dashboard data
interface DashboardData {
  user: {
    name: string;
    credits: number;
  };
  activeSessions: SessionInfo[];
}

interface SessionInfo {
  id: string;
  osType: "Ubuntu" | "Rocky Linux" | "OpenSUSE";
  startTime: string;
  timeRemaining: number; // in seconds
  status: "provisioning" | "running" | "error" | "terminating";
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<SessionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStartingLab, setIsStartingLab] = useState<string | null>(null);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchDashboardData();
      // Set up polling to refresh session data
      const interval = setInterval(fetchDashboardData, 15000);
      return () => clearInterval(interval);
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      
      const data = await response.json();
      setDashboardData(data);
      
      // Check if there's an active session
      if (data.activeSessions && data.activeSessions.length > 0) {
        setActiveSession(data.activeSessions[0]);
      } else {
        setActiveSession(null);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Could not load dashboard data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const startLabSession = async (osType: "Ubuntu" | "Rocky Linux" | "OpenSUSE") => {
    if (dashboardData?.user.credits === 0) {
      Toast({
        title: "No credits available",
        variant: "destructive",
      });
      return;
    }

    setIsStartingLab(osType);
    
    try {
      const response = await fetch("/api/lab/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ osType }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to start lab session");
      }
      
      const data = await response.json();
      
      Toast({
        title: "Lab session started",
      });
      
      // Immediately redirect to the lab session page
      router.push(`/lab/${data.sessionId}`);
    } catch (err) {
      console.error("Error starting lab session:", err);
      Toast({
        title: "Failed to start lab session",
        variant: "destructive",
      });
    } finally {
      setIsStartingLab(null);
    }
  };

  const reconnectToSession = (sessionId: string) => {
    router.push(`/lab/${sessionId}`);
  };

  // Format remaining time
  const formatRemainingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {dashboardData?.user.name}</h1>
          <p className="text-gray-500 mt-1">
            Start a new lab session or reconnect to an active one
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <span className="text-gray-500">Credits:</span>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {dashboardData?.user.credits || 0}
          </Badge>
          <Button variant="outline" onClick={() => router.push("/profile")}>
            View Profile
          </Button>
        </div>
      </div>

      {activeSession && (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Terminal className="mr-2 h-5 w-5 text-blue-500" />
              Active Session: {activeSession.osType}
            </CardTitle>
            <CardDescription>
              Started at {new Date(activeSession.startTime).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  Time remaining:
                </span>
                <span className="font-medium">
                  {formatRemainingTime(activeSession.timeRemaining)}
                </span>
              </div>
              <Progress 
                value={(activeSession.timeRemaining / (45 * 60)) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => reconnectToSession(activeSession.id)}
            >
              <Repeat className="mr-2 h-4 w-4" />
              Reconnect to Session
            </Button>
          </CardFooter>
        </Card>
      )}

      {dashboardData?.user.credits === 0 ? (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No credits available</AlertTitle>
          <AlertDescription>
            You need to purchase more credits to start a new lab session.
            <Button 
              variant="default" 
              className="ml-4"
              onClick={() => router.push("/buy-credits")}
            >
              Purchase Credits
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <h2 className="text-2xl font-bold mb-4">Start a New Lab Session</h2>
      <p className="text-gray-500 mb-6">
        Each session costs 1 credit and lasts for 45 minutes. Choose an operating system below:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Ubuntu Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <img 
                src="/ubuntu-logo.svg" 
                alt="Ubuntu" 
                className="h-8 w-8 mr-2" 
              />
              Ubuntu
            </CardTitle>
            <CardDescription>
              Latest LTS version with common development tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Python, Node.js, Java development</li>
              <li>Docker and containerization</li>
              <li>Web development environment</li>
              <li>Data science tools</li>
            </ul>
          </CardContent>
          <CardFooter>
            {activeSession ? (
              <Button variant="outline" className="w-full" disabled>
                Active session in progress
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full"
                    disabled={isStartingLab !== null || dashboardData?.user.credits === 0}
                  >
                    {isStartingLab === "Ubuntu" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Lab
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start Ubuntu Lab Session</DialogTitle>
                    <DialogDescription>
                      This will use 1 credit from your account. The session will last for 45 minutes.
                    </DialogDescription>
                  </DialogHeader>
                  <p>
                    You currently have {dashboardData?.user.credits} credits available.
                  </p>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push("/manual")}
                    >
                      View Manual
                    </Button>
                    <Button 
                      onClick={() => startLabSession("Ubuntu")}
                      disabled={isStartingLab !== null}
                    >
                      {isStartingLab === "Ubuntu" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        "Start Session"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardFooter>
        </Card>

        {/* Rocky Linux Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <img 
                src="/rocky-logo.svg" 
                alt="Rocky Linux" 
                className="h-8 w-8 mr-2" 
              />
              Rocky Linux
            </CardTitle>
            <CardDescription>
              Enterprise-grade Linux distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Systems administration practice</li>
              <li>Enterprise application servers</li>
              <li>Security configuration training</li>
              <li>Automation with Ansible</li>
            </ul>
          </CardContent>
          <CardFooter>
            {activeSession ? (
              <Button variant="outline" className="w-full" disabled>
                Active session in progress
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full"
                    disabled={isStartingLab !== null || dashboardData?.user.credits === 0}
                  >
                    {isStartingLab === "Rocky Linux" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Lab
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start Rocky Linux Lab Session</DialogTitle>
                    <DialogDescription>
                      This will use 1 credit from your account. The session will last for 45 minutes.
                    </DialogDescription>
                  </DialogHeader>
                  <p>
                    You currently have {dashboardData?.user.credits} credits available.
                  </p>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push("/manual")}
                    >
                      View Manual
                    </Button>
                    <Button 
                      onClick={() => startLabSession("Rocky Linux")}
                      disabled={isStartingLab !== null}
                    >
                      {isStartingLab === "Rocky Linux" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        "Start Session"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardFooter>
        </Card>

        {/* OpenSUSE Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <img 
                src="/opensuse-logo.svg" 
                alt="OpenSUSE" 
                className="h-8 w-8 mr-2" 
              />
              OpenSUSE
            </CardTitle>
            <CardDescription>
              Stable and versatile Linux distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>YaST system management</li>
              <li>SUSE certification practice</li>
              <li>Enterprise Linux training</li>
              <li>Containerization with Podman</li>
            </ul>
          </CardContent>
          <CardFooter>
            {activeSession ? (
              <Button variant="outline" className="w-full" disabled>
                Active session in progress
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full"
                    disabled={isStartingLab !== null || dashboardData?.user.credits === 0}
                  >
                    {isStartingLab === "OpenSUSE" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Lab
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start OpenSUSE Lab Session</DialogTitle>
                    <DialogDescription>
                      This will use 1 credit from your account. The session will last for 45 minutes.
                    </DialogDescription>
                  </DialogHeader>
                  <p>
                    You currently have {dashboardData?.user.credits} credits available.
                  </p>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push("/manual")}
                    >
                      View Manual
                    </Button>
                    <Button 
                      onClick={() => startLabSession("OpenSUSE")}
                      disabled={isStartingLab !== null}
                    >
                      {isStartingLab === "OpenSUSE" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        "Start Session"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardFooter>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Learn how to use our virtual lab environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Check our comprehensive user manual for guides on how to use each lab environment, save your work, and manage your sessions.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push("/manual")}
            >
              View User Manual
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buy More Credits</CardTitle>
            <CardDescription>
              Extend your lab time with additional credits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Each credit gives you a 45-minute lab session. Purchase more credits to continue your learning journey without interruptions.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => router.push("/buy-credits")}
            >
              Purchase Credits
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
