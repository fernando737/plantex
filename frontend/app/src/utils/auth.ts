// src/utils/auth.ts
import { useAuthStore, type User } from '../stores';
import { api } from '../hooks/useApi';
import { jwtDecode } from 'jwt-decode';
import Cookie from 'js-cookie';
import { showSuccess } from './notificationUtils';
import { handleApiOperation } from './errorHandler';

interface AuthResponse {
  access: string;
  refresh: string;
}

interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

export const isValidJWT = (token: string | undefined): boolean => {
  if (!token) return false;
  try {
    // JWT tokens use base64url encoding, not base64
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));

    return payload.exp && payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

export const setToken = (key: string, token: string): void => {
  if (isValidJWT(token)) {
    Cookie.set(key, token, {
      expires: 1,
      path: '/',
      secure: true,
      sameSite: 'strict',
    });
  } else {
    Cookie.remove(key);
  }
};

const decodeToken = (token: string): User | null => {
  try {
    return jwtDecode(token) as User;
  } catch {
    return null;
  }
};

// Login function
export const login = async (
  email: string,
  password: string
): Promise<ApiResult<AuthResponse>> => {
  try {
    const { data } = await api.post<AuthResponse>('/auth/token/', {
      email,
      password,
    });
    handleAuthSuccess(data);
    return { data, error: null };
  } catch (error: unknown) {
    // Handle authentication-specific errors
    const responseData = (error as any).response?.data;
    let errorMessage =
      'Error al iniciar sesión. Por favor, inténtelo de nuevo.';

    if (responseData) {
      // DRF JWT returns 'detail' field for authentication errors
      if (responseData.detail) {
        if (responseData.detail.includes('No active account found')) {
          errorMessage =
            'Credenciales inválidas. Por favor, verifique su correo y contraseña.';
        } else if (responseData.detail.includes('credentials')) {
          errorMessage = 'Correo o contraseña incorrectos.';
        } else {
          errorMessage = responseData.detail;
        }
      } else if (responseData.message) {
        // Fallback to our standardized error format
        errorMessage = responseData.message;
      }
    }

    return { data: null, error: errorMessage };
  }
};

// Register function
export const register = async (
  name: string,
  email: string,
  password: string,
  password2: string
): Promise<ApiResult<unknown>> => {
  try {
    // First, create the user
    const createResult = await api.post('/auth/create/', {
      name,
      email,
      password,
      password2,
    });

    // After successful user creation, automatically log in to get JWT tokens
    const loginResult = await api.post<AuthResponse>('/auth/token/', {
      email,
      password,
    });

    // Handle the login success (sets tokens and updates Zustand)
    handleAuthSuccess(loginResult.data);

    return { data: createResult.data, error: null };
  } catch (error: unknown) {
    // Handle registration-specific errors
    const responseData = (error as any).response?.data;
    let errorMessage = 'Error al registrar. Por favor, inténtelo de nuevo.';

    if (responseData) {
      // Check for specific registration errors
      if (responseData.detail) {
        if (responseData.detail.includes('already exists')) {
          errorMessage = 'Ya existe una cuenta con este correo electrónico.';
        } else if (responseData.detail.includes('password')) {
          errorMessage =
            'Error en la contraseña. Asegúrese de que tenga al menos 8 caracteres.';
        } else {
          errorMessage = responseData.detail;
        }
      } else if (responseData.message) {
        // Fallback to our standardized error format
        errorMessage = responseData.message;
      } else if (responseData.email) {
        // Handle field-specific errors
        errorMessage = `Error en el correo: ${responseData.email.join(', ')}`;
      } else if (responseData.password) {
        errorMessage = `Error en la contraseña: ${responseData.password.join(', ')}`;
      } else if (responseData.name) {
        errorMessage = `Error en el nombre: ${responseData.name.join(', ')}`;
      }
    }

    return { data: null, error: errorMessage };
  }
};

// Handles login success (sets tokens and updates Zustand)
const handleAuthSuccess = (data: AuthResponse): void => {
  const { access, refresh } = data;
  if (!access || !refresh) {
    throw new Error(
      'Error durante la autenticación. Por favor, inténtelo de nuevo.'
    );
  }

  setToken('access_token', access);
  setToken('refresh_token', refresh);

  const user = decodeToken(access);
  if (user) {
    useAuthStore.setState({ user, isLoggedIn: true });
    showSuccess(`Bienvenido de nuevo, ${user.name}!`);
  }
};

// Logout function
export const logout = (): void => {
  Cookie.remove('access_token');
  Cookie.remove('refresh_token');
  useAuthStore.setState({ user: null, isLoggedIn: false, error: null, isLoading: false });
  showSuccess('Cerraste sesión correctamente.');
};

// Auth Initialization (Runs at App Startup)
export const setAuthUser = async (): Promise<void> => {
  const access_token = Cookie.get('access_token');
  const refresh_token = Cookie.get('refresh_token');

  if (!isValidJWT(access_token)) {
    // Token expired or invalid → Try to refresh
    if (isValidJWT(refresh_token)) {
      const newAccessToken = await getRefreshedAccessToken();
      if (!newAccessToken) return;
    } else {
      logout();
      return;
    }
  }

  const accessToken = Cookie.get('access_token');
  if (accessToken) {
    const user = decodeToken(accessToken);
    if (user) {
      useAuthStore.setState({ user, isLoggedIn: true });
    }
  }
};

// Refresh Token Function
export const getRefreshedAccessToken = async (): Promise<string | null> => {
  const refresh_token = Cookie.get('refresh_token');
  if (!isValidJWT(refresh_token)) {
    logout();
    return null;
  }

  const result = await handleApiOperation(
    async () => {
      const { data } = await api.post<AuthResponse>('/auth/token/refresh/', {
        refresh: refresh_token,
      });
      setToken('access_token', data.access);
      return data.access;
    },
    undefined,
    'renovando token de acceso'
  );

  return result.success && result.data ? result.data : null;
};
