// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, Terminal, Info } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startVirtualLabSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First API call to send the first transcript
      const response1 = await fetch('/api/provision-vm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: `#!/bin/bash

# Update the system
sudo apt update && sudo apt upgrade -y

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

#Add the Docker repository
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null


#Update package database with Docker packages:
sudo apt update

#Install Docker:
yes | sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

#(REQUIRES YES OR NO FROM USER)



sudo usermod -aG docker $USER

sudo systemctl start docker
sudo systemctl enable docker
newgrp docker`
        }),
      });

      if (!response1.ok) {
        throw new Error('Failed to provision VM with first transcript');
      }

      // Second API call to send the second transcript and get the Guacamole URL
      const response2 = await fetch('/api/setup-guacamole', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: `# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Create a directory for Guacamole setup
mkdir -p ~/guacamole && cd ~/guacamole



# Create a Docker Compose file
cat <<EOF > docker-compose.yml
version: '3'
services:
  guacd:
    image: guacamole/guacd
    container_name: guacd
    restart: always
    networks:
      - guacamole_network

  guacamole:
    image: guacamole/guacamole
    container_name: guacamole
    restart: always
    ports:
      - "8080:8080"
    environment:
      GUACD_HOSTNAME: guacd
      GUACD_PORT: 4822
      MYSQL_HOSTNAME: guacamole-mysql
      MYSQL_PORT: 3306
      MYSQL_DATABASE: guacamole_db
      MYSQL_USER: guacamole_user
      MYSQL_PASSWORD: guacamole_password
    depends_on:
      - guacd
      - guacamole-mysql
    networks:
      - guacamole_network

  guacamole-mysql:
    image: mysql:5.7
    container_name: guacamole-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: mysql_root_password
      MYSQL_DATABASE: guacamole_db
      MYSQL_USER: guacamole_user
      MYSQL_PASSWORD: guacamole_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init:/docker-entrypoint-initdb.d
    networks:
      - guacamole_network


networks:
  guacamole_network:
    driver: bridge

volumes:
  mysql_data:
    driver: local

EOF


# Create init directory
mkdir -p ~/guacamole/init

# Download Guacamole SQL scripts
docker run --rm guacamole/guacamole /opt/guacamole/bin/initdb.sh --mysql > ~/guacamole/init/initdb.sql

#Start Guacamole
cd ~/guacamole
docker compose up -d

# Get the VM's external IP address
EXTERNAL_IP=$(curl -s ifconfig.me)

# Display access information
echo "Guacamole is now accessible at http://$EXTERNAL_IP:8080/guacamole"
echo "Default credentials: guacadmin / guacadmin"
echo "Please change the default password after your first login."


sudo apt install -y ufw
sudo ufw allow ssh
sudo ufw --force enable


#(Reqiures YES OR NO FROM USER)




# Configure firewall to allow port 8080
sudo ufw allow 8080/tcp
sudo ufw status`
        }),
      });

      if (!response2.ok) {
        throw new Error('Failed to set up Guacamole');
      }

      const data = await response2.json();
      
      // Redirect to the Guacamole URL
      if (data.guacamoleUrl) {
        window.location.href = data.guacamoleUrl;
      } else {
        throw new Error('No Guacamole URL returned from the API');
      }
    } catch (err) {
      console.error('Error starting lab session:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Virtual Lab Dashboard</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Linux Virtual Lab Environment</CardTitle>
          <CardDescription>
            Access a fully-configured Linux environment with Docker and Apache Guacamole
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <Terminal className="h-6 w-6 text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium">Ubuntu Environment</h3>
                <p className="text-sm text-gray-500">
                  This environment comes with Docker and Apache Guacamole pre-installed.
                  You'll be able to access it directly through your browser.
                </p>
              </div>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Important Information</AlertTitle>
              <AlertDescription>
                Starting a new session will provision a new VM. This process may take a few minutes.
                You'll be automatically redirected to the Guacamole interface once it's ready.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={startVirtualLabSession} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Provisioning VM and Setting Up Guacamole...
              </>
            ) : (
              'Start Lab Session'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Separator className="my-8" />
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">About This Lab</h2>
        <p>
          This virtual lab provides a complete Linux environment with Docker and Apache Guacamole
          installed. You can use it to practice Docker commands, set up containers, and explore
          Linux system administration.
        </p>
        <h3 className="text-xl font-bold mt-4">Default Credentials</h3>
        <p>
          When you access the Guacamole interface, use the following default credentials:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Username: <strong>guacadmin</strong></li>
          <li>Password: <strong>guacadmin</strong></li>
        </ul>
        <p className="text-sm text-red-500 font-medium">
          Important: Please change the default password after your first login for security reasons.
        </p>
      </div>
    </div>
  );
}
