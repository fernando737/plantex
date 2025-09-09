import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createJSONStorage } from 'zustand/middleware';

export interface User {
  id?: number;
  username?: string;
  email?: string;
  name?: string;
  avatar?: string;
  // Add other user fields as needed
}

interface AuthStore {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      isLoggedIn: false,
      user: null,
      isLoading: false,
      error: null,
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
