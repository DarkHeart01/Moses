"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Clock, AlertCircle, Terminal, Repeat } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useSession } from '@/hooks/use-session';
import OSCard from '@/components/lab/os-card';
import Loading from '@/components/shared/loading';
import Error from '@/components/shared/error';

// OS packages data
const osPackages = [
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    description: 'Latest LTS version with common development tools',
    features: [
      "Python, Node.js, Java development",
      "Docker and containerization",
      "Web development environment",
      "Data science tools"
    ],
    logoSrc: '/ubuntu-logo.svg'
  },
  {
    id: 'rocky',
    name: 'Rocky Linux',
    description: 'Enterprise-grade Linux distribution',
    features: [
      "Systems administration practice",
      "Enterprise application servers",
      "Security configuration training",
      "Automation with Ansible"
    ],
    logoSrc: '/rocky-logo.svg'
  },
  {
    id: 'opensuse',
    name: 'OpenSUSE',
    description: 'Stable and versatile Linux distribution',
    features: [
      "YaST system management",
      "SUSE certification practice",
      "Enterprise Linux training",
      "Containerization with Podman"
    ],
    logoSrc: '/opensuse-logo.svg'
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = require("@/components/ui/use-toast");
  const { user } = useAuth();
  const { 
    activeSession, 
    loading, 
    error, 
    fetchActiveSession, 
    startSession 
  } = useSession();
  const [isStartingLab, setIsStartingLab] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveSession();
    // Set up polling to refresh session data
    const interval = setInterval(fetchActiveSession, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStartSession = async (osType: string) => {
    if (!user || user.credits === 0) {
      toast({
        title: "No credits available",
        description: "Please purchase more credits to start a lab session.",
        variant: "destructive",
      });
      return;
    }

    setIsStartingLab(osType);
    
    try {
      await startSession(osType as "Ubuntu" | "Rocky Linux" | "OpenSUSE");
    } catch (err) {
      console.error("Error starting lab session:", err);
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

  if (loading) {
    return <Loading text="Loading your dashboard..." size="lg" />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Error 
          title="Error Loading Dashboard" 
          message={error} 
          actionLabel="Try Again" 
          onAction={fetchActiveSession} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-gray-500 mt-1">
            Start a new lab session or reconnect to an active one
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <span className="text-gray-500">Credits:</span>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {user?.credits || 0}
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

      {user?.credits === 0 ? (
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
        {osPackages.map((os) => (
          <OSCard
            key={os.id}
            name={os.name}
            description={os.description}
            features={os.features}
            logoSrc={os.logoSrc}
            isLoading={isStartingLab === os.name}
            isDisabled={!!activeSession || (user?.credits || 0) === 0}
            disabledReason={activeSession ? "Active session in progress" : (user?.credits || 0) === 0 ? "No credits available" : ""}
            onStart={() => handleStartSession(os.name)}
          />
        ))}
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
