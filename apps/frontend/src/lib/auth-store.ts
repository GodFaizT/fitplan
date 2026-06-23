import { create } from 'zustand';
import type { ApiUser } from './types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: ApiUser | null;
  /** Access token mantido apenas em memória (PROJECT.md 3.1). */
  accessToken: string | null;
  status: AuthStatus;
  setAuth: (accessToken: string, user: ApiUser) => void;
  setUser: (user: ApiUser) => void;
  setStatus: (status: AuthStatus) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: 'loading',
  setAuth: (accessToken, user) =>
    set({ accessToken, user, status: 'authenticated' }),
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  clear: () => set({ user: null, accessToken: null, status: 'unauthenticated' }),
}));
