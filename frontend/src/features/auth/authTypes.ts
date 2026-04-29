export interface User {
  id: string;
  email: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  isAuth: boolean | false;
  tokens: Tokens | null;
  isAuthLoading: boolean;
  authError: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}
