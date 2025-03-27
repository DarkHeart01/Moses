// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Clock, Terminal, Info, AlertCircle } from "lucide-react";

// Types for our user profile data
interface UserProfile {
  id: string;
  name: string;
  email: string;
  credits: number;
  createdAt: string;
  totalSessionsCompleted: number;
}

// Types for session history
interface SessionHistory {
  id: string;
  startTime: string;
  endTime: string | null;
  osType: "Ubuntu" | "Rocky Linux" | "OpenSUSE";
  status: "completed" | "terminated" | "active";
  duration: number; // in minutes
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      // Fetch user profile data
      fetchUserProfile();
      // Fetch session history
      fetchSessionHistory();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Could not load profile data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessionHistory = async () => {
    try {
      const response = await fetch("/api/user/sessions");
      if (!response.ok) {
        throw new Error("Failed to fetch session history");
      }
      const data = await response.json();
      setSessionHistory(data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      // We don't set the main error state here to avoid blocking the profile display
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-lg">Loading your profile...</p>
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
          <Button onClick={() => router.push("/")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`https://avatar.vercel.sh/${profile?.id}`} />
                <AvatarFallback>{profile?.name ? getUserInitials(profile.name) : "UN"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile?.name}</CardTitle>
                <CardDescription>{profile?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Available Credits</span>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {profile?.credits || 0}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  Each lab session costs 1 credit (45 minutes)
                </div>
                
                {profile?.credits === 0 && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No credits remaining</AlertTitle>
                    <AlertDescription>
                      Please purchase more credits to continue using the labs.
                    </AlertDescription>
                  </Alert>
                )}
                
                {profile?.credits && profile.credits <= 2 && profile.credits > 0 && (
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Low credits</AlertTitle>
                    <AlertDescription>
                      You are running low on credits. Consider purchasing more soon.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <Separator />
              
              <div>
                <span className="text-gray-500">Member Since</span>
                <p>{profile?.createdAt ? formatDate(profile.createdAt) : "N/A"}</p>
              </div>
              
              <div>
                <span className="text-gray-500">Total Lab Sessions</span>
                <p>{profile?.totalSessionsCompleted || 0} completed sessions</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/buy-credits")}>
              Purchase More Credits
            </Button>
          </CardFooter>
        </Card>
        
        {/* Sessions History Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lab Session History</CardTitle>
            <CardDescription>
              Your past and current virtual lab sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="all">All Sessions</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {sessionHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    You haven't used any lab sessions yet. Start a new session from the dashboard.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessionHistory.map((session) => (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Terminal className="h-5 w-5 text-blue-500" />
                              <span className="font-medium">{session.osType}</span>
                              <Badge
                              >
                                {session.status}
                              </Badge>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <Clock className="mr-1 h-4 w-4" />
                              {formatDate(session.startTime)} {session.endTime ? `- ${formatDate(session.endTime)}` : "(In progress)"}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="block font-medium">
                              {session.duration} {session.duration === 1 ? "minute" : "minutes"}
                            </span>
                            <span className="text-sm text-gray-500">
                              1 credit used
                            </span>
                          </div>
                        </div>
                        
                        {session.status === "active" && (
                          <div className="mt-4">
                            <Button
                              onClick={() => router.push(`/lab/${session.id}`)}
                              variant="outline"
                              className="w-full"
                            >
                              Reconnect to Session
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="active">
                {sessionHistory.filter(s => s.status === "active").length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    You have no active lab sessions at the moment.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessionHistory
                      .filter(s => s.status === "active")
                      .map((session) => (
                        <div key={session.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <Terminal className="h-5 w-5 text-blue-500" />
                                <span className="font-medium">{session.osType}</span>
                                <Badge variant="default">Active</Badge>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <Clock className="mr-1 h-4 w-4" />
                                Started: {formatDate(session.startTime)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <Button
                              onClick={() => router.push(`/lab/${session.id}`)}
                              className="w-full"
                            >
                              Reconnect to Session
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed">
                {sessionHistory.filter(s => s.status === "completed" || s.status === "terminated").length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    You don't have any completed lab sessions yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessionHistory
                      .filter(s => s.status === "completed" || s.status === "terminated")
                      .map((session) => (
                        <div key={session.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <Terminal className="h-5 w-5 text-blue-500" />
                                <span className="font-medium">{session.osType}</span>
                                <Badge
                                >
                                  {session.status}
                                </Badge>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <Clock className="mr-1 h-4 w-4" />
                                {formatDate(session.startTime)} - {formatDate(session.endTime || "")}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <span className="block font-medium">
                                {session.duration} {session.duration === 1 ? "minute" : "minutes"}
                              </span>
                              <span className="text-sm text-gray-500">
                                1 credit used
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
