import fetchApi from '@/lib/api';

interface Session {
  id: string;
  osType: string;
  status: string;
  startTime: string;
  endTime: string | null;
  timeRemaining: number;
  connectionUrl?: string;
}

interface SessionHistory {
  id: string;
  osType: string;
  startTime: string;
  endTime: string | null;
  status: string;
  duration: number;
}

export const labService = {
  async startSession(osType: string): Promise<{ sessionId: string; message: string; status: string }> {
    return fetchApi('/lab/start', {
      method: 'POST',
      body: { osType },
    });
  },
  
  async getActiveSession(): Promise<{ session: Session | null; connectionUrl?: string }> {
    return fetchApi('/lab/active');
  },
  
  async connectToSession(sessionId: string): Promise<{ connectionUrl: string }> {
    return fetchApi(`/lab/${sessionId}/connect`);
  },
  
  async terminateSession(sessionId: string): Promise<{ message: string }> {
    return fetchApi(`/lab/${sessionId}/terminate`, {
      method: 'POST',
    });
  },
  
  async getSessionStatus(sessionId: string): Promise<Session> {
    return fetchApi(`/lab/${sessionId}/status`);
  },
  
  async getSessionHistory(): Promise<SessionHistory[]> {
    return fetchApi('/user/sessions');
  }
};
