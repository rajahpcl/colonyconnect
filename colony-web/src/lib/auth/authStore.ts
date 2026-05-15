import { create } from 'zustand';
import type { SessionUser } from './types';

type AuthState = {
  user: SessionUser | null;
  isBootstrapping: boolean;
  setUser: (user: SessionUser | null) => void;
  setBootstrapping: (value: boolean) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isBootstrapping: true,
  setUser: (user) => set({ user }),
  setBootstrapping: (value) => set({ isBootstrapping: value }),
  clearSession: () =>
    set({
      user: null,
    }),
}));
