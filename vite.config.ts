import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env': JSON.stringify(env)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@components': path.resolve(__dirname, './components'),
          '@services': path.resolve(__dirname, './services'),
          '@hooks': path.resolve(__dirname, './hooks'),
          '@types': path.resolve(__dirname, './types'),
          '@config': path.resolve(__dirname, './config'),
          '@data': path.resolve(__dirname, './data')
        }
      }
    };
});
