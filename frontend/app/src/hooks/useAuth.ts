import { useCallback } from 'react';
import useAuthStore from '@/stores/authStore';
import type { User } from '@/types';

export const useAuth = () => {
  const { isLoggedIn, user, logIn, logout } = useAuthStore();

  const login = useCallback(
    (userData: User) => {
      logIn(userData);
    },
    [logIn]
  );

  const logoutUser = useCallback(() => {
    logout();
  }, [logout]);

  return {
    isLoggedIn,
    user,
    login,
    logout: logoutUser,
  };
};
