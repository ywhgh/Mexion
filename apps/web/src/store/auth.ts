import { create } from "zustand";

export type Admin = {
  id: number;
  username: string;
  createdAt: string;
};

export type AuthState = {
  admin: Admin | null;
  bootstrapped: boolean;
  setAuth: (next: { admin: Admin | null; bootstrapped: boolean }) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  bootstrapped: false,
  setAuth: (next) => set(next),
  clear: () => set({ admin: null, bootstrapped: true }),
}));
