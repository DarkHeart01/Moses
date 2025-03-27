"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function ManualPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Unnati Cloud Labs - User Manual</h1>
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Important Information</AlertTitle>
        <AlertDescription>
          Each virtual lab session costs 1 credit and lasts for 45 minutes. You can reconnect to an active session if disconnected.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="getting-started" className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="ubuntu">Ubuntu</TabsTrigger>
          <TabsTrigger value="rocky">Rocky Linux</TabsTrigger>
          <TabsTrigger value="opensuse">OpenSUSE</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Unnati Cloud Labs</CardTitle>
              <CardDescription>
                Learn how to use our browser-based virtual lab environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Start Guide</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Navigate to the Dashboard and select your preferred operating system</li>
                <li>Click "Start Lab" to initialize a new virtual machine session</li>
                <li>Wait for the system to provision your environment (typically 1-2 minutes)</li>
                <li>Use the browser-based terminal just like a regular terminal</li>
                <li>Your session will automatically terminate after 45 minutes</li>
                <li>You will receive notifications 5 minutes before your session expires</li>
              </ol>

              <h3 className="text-lg font-semibold mt-6">Managing Your Credits</h3>
              <p>Each 45-minute session costs 1 credit from your account. You can check your remaining credits on your profile page.</p>
              
              <h3 className="text-lg font-semibold mt-6">Reconnecting to Active Sessions</h3>
              <p>If you get disconnected during an active session, simply return to the dashboard and click on the "Reconnect" button next to your active session.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ubuntu">
          <Card>
            <CardHeader>
              <CardTitle>Ubuntu Environment</CardTitle>
              <CardDescription>
                Guide to using the Ubuntu virtual lab environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Ubuntu Environment Overview</h3>
              <p>Our Ubuntu environment comes pre-installed with common development tools and libraries.</p>
              
              <h3 className="text-lg font-semibold mt-4">Available Software</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Python 3.10 with pip and venv</li>
                <li>Node.js 18 LTS and npm</li>
                <li>Java Development Kit 17</li>
                <li>Git and GitHub CLI</li>
                <li>Docker and Docker Compose</li>
                <li>VS Code Server (browser-based)</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-4">Common Ubuntu Commands</h3>
              <div className="bg-gray-100 p-4 rounded-md font-mono text-sm">
                <p>sudo apt update # Update package lists</p>
                <p>sudo apt install package-name # Install a package</p>
                <p>pwd # Show current directory</p>
                <p>ls -la # List all files with details</p>
                <p>mkdir dirname # Create a directory</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rocky">
          <Card>
            <CardHeader>
              <CardTitle>Rocky Linux Environment</CardTitle>
              <CardDescription>
                Guide to using the Rocky Linux virtual lab environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Rocky Linux Environment Overview</h3>
              <p>Our Rocky Linux environment is configured for enterprise applications and systems administration training.</p>
              
              <h3 className="text-lg font-semibold mt-4">Available Software</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Python 3.9 with pip</li>
                <li>Podman and Buildah</li>
                <li>Web servers: Apache and Nginx</li>
                <li>MariaDB and PostgreSQL</li>
                <li>Ansible for automation</li>
                <li>SELinux tools and utilities</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opensuse">
          <Card>
            <CardHeader>
              <CardTitle>OpenSUSE Environment</CardTitle>
              <CardDescription>
                Guide to using the OpenSUSE virtual lab environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">OpenSUSE Environment Overview</h3>
              <p>Our OpenSUSE environment is optimized for enterprise Linux and SUSE certification training.</p>
              
              <h3 className="text-lg font-semibold mt-4">Available Software</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Python 3.10 and Ruby</li>
                <li>YaST system administration tools</li>
                <li>Zypper package manager</li>
                <li>KVM virtualization tools</li>
                <li>AppArmor security</li>
                <li>Snapper for system snapshots</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator className="my-8" />

      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">How do I save my work between sessions?</h3>
          <p className="text-gray-700">Each virtual environment has a /persistent directory that maintains your data between sessions. Make sure to save important files there.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">What happens when my session expires?</h3>
          <p className="text-gray-700">You'll receive a notification 5 minutes before expiration. After 45 minutes, the session automatically ends. Save your work to the /persistent folder to keep it.</p>
        </div>
      </div>
    </div>
  );
}
