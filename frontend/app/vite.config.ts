import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  // Warn about missing environment variables
  const requiredEnv = ['VITE_DNS_URL', 'VITE_BACKEND_PREFIX'];
  requiredEnv.forEach(key => {
    if (!env[key]) {
      console.warn(`[WARNING] Missing environment variable: ${key}`);
    }
  });

  return {
    base: '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/views': path.resolve(__dirname, './src/views'),
        '@/stores': path.resolve(__dirname, './src/stores'),
        '@/utils': path.resolve(__dirname, './src/utils'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/types': path.resolve(__dirname, './src/types'),
      },
    },
    optimizeDeps: {
      include: ['@emotion/react', '@emotion/styled'],
    },
    define: {
      'process.env': {
        ...env,
      },
      'process.env.NODE_ENV': JSON.stringify(mode),
      process: {
        env: {
          ...env,
          NODE_ENV: mode,
        },
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        onwarn: (warning, warn) => {
          console.warn(`[WARNING] ${warning.message}`);
          if (warning.loc) {
            console.warn(`[LOCATION] ${warning.loc.file}:${warning.loc.line}`);
          }
          warn(warning);
        },
      },
      outDir: 'dist',
    },
  };
});
