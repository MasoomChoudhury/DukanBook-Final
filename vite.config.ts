import path from 'path';
import { defineConfig } from 'vite'; // No loadEnv needed
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // DELETE THE 'define' BLOCK. IT IS NOT NEEDED.
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
