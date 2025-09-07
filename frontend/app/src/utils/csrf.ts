// src/utils/csrf.ts
import { api } from '../hooks/useApi';
import Cookie from 'js-cookie';

export const fetchCSRFToken = async (): Promise<void> => {
  try {
    const response = await api.get('/auth/set-csrf-token/');
    Cookie.set('csrftoken', response.data.csrf_token);
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
};
