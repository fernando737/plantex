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
  logIn: (userData: User) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      isLoggedIn: false,
      user: null,
      isLoading: false,
      error: null,
      logIn: (userData: User) => set({ isLoggedIn: true, user: userData }),
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          // For now, simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful login
          if (email && password) {
            const userData: User = {
              id: 1,
              email,
              name: email.split('@')[0],
            };
            set({ isLoggedIn: true, user: userData, isLoading: false });
          } else {
            throw new Error('Invalid credentials');
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false 
          });
        }
      },
      logout: () => set({ isLoggedIn: false, user: null, error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
