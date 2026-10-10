import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const serverSessionId = Date.now().toString();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __SERVER_SESSION_ID__: JSON.stringify(serverSessionId),
  },
  server: {
    port: 5173,
    open: false,
  },
});
