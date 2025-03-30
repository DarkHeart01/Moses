import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { labService } from '@/services/lab-service';

interface Session {
  id: string;
  osType: string;
  status: string;
  startTime: string;
  timeRemaining: number;
  connectionUrl?: string;
}

export function useSession() {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = require('@/components/ui/use-toast');

  const fetchActiveSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { session } = await labService.getActiveSession();
      setActiveSession(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch active session';
      setError(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (osType: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { sessionId } = await labService.startSession(osType);
      
      toast({
        title: "Session started",
        description: `Your ${osType} environment is being provisioned.`,
      });
      
      router.push(`/lab/${sessionId}`);
      return sessionId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start session';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await labService.terminateSession(sessionId);
      
      toast({
        title: "Session terminated",
        description: "Your lab session has been terminated successfully.",
      });
      
      setActiveSession(null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to terminate session';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    activeSession,
    loading,
    error,
    fetchActiveSession,
    startSession,
    terminateSession,
  };
}
