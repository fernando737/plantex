import MockAdapter from 'axios-mock-adapter';
import { api } from '../hooks/useApi';

// Extend globalThis to include our mock adapter
declare global {
  var __mockAdapter: MockAdapter | undefined;
}

// Ensure MockAdapter is only initialized once
if (!globalThis.__mockAdapter) {
  globalThis.__mockAdapter = new MockAdapter(api, {
    delayResponse: 500,
  });

  // Pass through real API calls for development
  const passThroughRoutes = [
    /^\/?process\/.*/,
    /^\/?auth\/.*/,
    /^\/?participant\/.*/,
    /^\/?schema\/.*/,
    /^\/?option\/.*/,
    /^\/?property\/.*/,
    /^\/?professional\/.*/,
    /^\/?observation\/.*/,
    /^\/?observation-template\/.*/,
    /^\/?document\/.*/,
    /^\/?registry-system-config\/.*/,
    /^\/?doc-build\/.*/,
    /^\/?document-template\/.*/,
    /^\/?document-generation\/.*/,
  ];

  console.log('🔍 Mock API Configuration:', {
    passThroughRoutes: passThroughRoutes.map(r => r.toString()),
    isEnabled: true,
  });

  passThroughRoutes.forEach(route => {
    globalThis.__mockAdapter!.onAny(route).passThrough();
  });

  // Default fallback for unhandled routes
  globalThis.__mockAdapter.onAny().reply(() => {
    return [500, { message: 'Mock API Interception - No response defined.' }];
  });
}

export default api;
