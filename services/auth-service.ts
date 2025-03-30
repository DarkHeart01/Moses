import fetchApi from '@/lib/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    credits: number;
  };
}
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/auth/login');
  }
};
