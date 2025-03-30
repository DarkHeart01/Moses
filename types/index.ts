// User types
export interface User {
    id: string;
    name: string;
    email: string;
    credits: number;
    createdAt?: string;
    totalSessionsCompleted?: number;
  }
  // Session types
  export interface Session {
    id: string;
    osType: string;
    status: string;
    startTime: string;
    endTime?: string | null;
    timeRemaining: number;
    connectionUrl?: string;
  }
  
  export interface SessionHistory {
    id: string;
    osType: string;
    startTime: string;
    endTime: string | null;
    status: string;
    duration: number;
  }
  
  // Credit types
  export interface CreditTransaction {
    id: string;
    amount: number;
    description: string;
    timestamp: string;
  }
  
  // OS Package types
  export interface OSPackage {
    id: string;
    name: string;
    description: string;
    features: string[];
    logoSrc: string;
  }
  
  // Auth types
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface SignupData {
    name: string;
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  