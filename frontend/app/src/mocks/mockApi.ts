// Mock adapter removed - all API calls now go directly to backend
import { api } from '../hooks/useApi';

console.log('🔍 Mock API Configuration: DISABLED - All requests pass through to backend');

export default api;
