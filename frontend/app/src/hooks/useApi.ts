import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookie from 'js-cookie';
import { isValidJWT, getRefreshedAccessToken } from '@/utils/auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${import.meta.env.VITE_DNS_URL}/${import.meta.env.VITE_BACKEND_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug logging to see what URL is being constructed
console.log('🔍 API Configuration:', {
  VITE_DNS_URL: import.meta.env.VITE_DNS_URL,
  VITE_BACKEND_PREFIX: import.meta.env.VITE_BACKEND_PREFIX,
  baseURL: api.defaults.baseURL,
});

// Request interceptor to add auth token and CSRF token
api.interceptors.request.use(config => {
  const access_token = Cookie.get('access_token');
  const csrftoken = Cookie.get('csrftoken');

  if (isValidJWT(access_token)) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }

  // Add CSRF token for state-changing requests
  if (
    csrftoken &&
    config.method &&
    (config.method === 'post' ||
      config.method === 'put' ||
      config.method === 'patch' ||
      config.method === 'delete')
  ) {
    config.headers['X-CSRFToken'] = csrftoken;
  }

  // For FormData (file uploads), don't set Content-Type header
  // Let the browser set it automatically with the correct boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Check if it's a 401 error and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const newAccessToken = await getRefreshedAccessToken();

        if (newAccessToken) {
          // Update the authorization header with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          // Retry the original request with the new token
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // If refresh failed or no refresh token, logout
      Cookie.remove('access_token');
      Cookie.remove('refresh_token');
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  }
);

export const useApiGet = <T>(url: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [url],
    queryFn: async (): Promise<T> => {
      const response = await api.get(url);
      return response.data;
    },
    enabled: options?.enabled ?? true,
  });
};

export const useApiPost = <T, D = unknown>(url: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: D): Promise<T> => {
      // For FormData (file uploads), don't set Content-Type header
      // Let the browser set it automatically with the correct boundary
      const config: any = {};
      if (!(data instanceof FormData)) {
        config.headers = {
          'Content-Type': 'application/json',
        };
      }

      const response = await api.post(url, data, config);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useApiPut = <T, D = unknown>(url: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: D): Promise<T> => {
      // For FormData (file uploads), don't set Content-Type header
      // Let the browser set it automatically with the correct boundary
      const config: any = {};
      if (!(data instanceof FormData)) {
        config.headers = {
          'Content-Type': 'application/json',
        };
      }

      const response = await api.put(url, data, config);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useApiPatch = <T, D = unknown>(url: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: D): Promise<T> => {
      // For FormData (file uploads), don't set Content-Type header
      // Let the browser set it automatically with the correct boundary
      const config: any = {};
      if (!(data instanceof FormData)) {
        config.headers = {
          'Content-Type': 'application/json',
        };
      }

      const response = await api.patch(url, data, config);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useApiDelete = <T>(url: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<T> => {
      const response = await api.delete(url);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export { api };
