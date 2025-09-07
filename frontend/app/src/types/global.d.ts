// Global type declarations for missing packages

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    VITE_DNS_URL: string;
    VITE_PATH_PREFIX: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}

// Process global for Vite
declare var process: {
  env: NodeJS.ProcessEnv;
};

// JWT Decode
declare module 'jwt-decode' {
  export function jwtDecode<T = any>(token: string): T;
}

// React Router types (if needed)
declare module 'react-router-dom' {
  export * from 'react-router-dom';
}
