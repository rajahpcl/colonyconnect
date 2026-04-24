import { create } from 'zustand';
import type { SessionUser } from './types';

type AuthState = {
  user: SessionUser | null;
  csrfToken: string | null;
  isBootstrapping: boolean;
  setUser: (user: SessionUser | null) => void;
  setCsrfToken: (token: string | null) => void;
  setBootstrapping: (value: boolean) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  csrfToken: null,
  isBootstrapping: true,
  setUser: (user) => set({ user }),
  setCsrfToken: (token) => set({ csrfToken: token }),
  setBootstrapping: (value) => set({ isBootstrapping: value }),
  clearSession: () =>
    set({
      csrfToken: null,
      user: null,
    }),
}));
