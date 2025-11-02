import { defineConfig, searchForWorkspaceRoot, Plugin, ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Assuming `./server/index.ts` exports a function that creates and returns an Express app
import { createServer } from './server';

/**
 * A custom Vite plugin to integrate your Express server during development.
 * This middleware allows your backend routes to work alongside Vite's dev server.
 */
function expressPlugin(): Plugin {
  return {
    name: 'express-plugin',
    apply: 'serve', // Apply only during development
    configureServer: async (server: ViteDevServer) => {
      const app = createServer();
      // Add the Express app as middleware to Vite's server
      server.middlewares.use(app);
    },
  };
}

// Main Vite Configuration
// Documentation: https://vitejs.dev/config/ [attached_file:1]
export default defineConfig({
  // Configuration for module resolution
  resolve: {
    alias: {
      // Set path aliases. Note: `__dirname` is not available in ES modules.
      // `path.resolve` defaults to the project's root directory.
      '@': path.resolve('client'),
      '@shared': path.resolve('shared'),
    },
  },

  // Development server options
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5000,
    strictPort: true, // Exit if port is already in use

    // HMR (Hot Module Replacement) configuration for containerized environments
    hmr: {
      protocol: 'wss',
      host: process.env.REPLIT_DEV_DOMAIN,
      clientPort: 443,
    },

    // Filesystem access control
    fs: {
      // To prevent "403 Forbidden" errors, allow access to the project's root
      allow: [
        searchForWorkspaceRoot(process.cwd()),
      ],
      // Deny access to sensitive files.
      // The "server/**" rule was removed as it can cause issues.
      deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**'],
    },
  },

  // Build-specific configuration
  build: {
    outDir: 'dist/spa',
  },

  // Array of Vite plugins to use
  plugins: [
    react(),
    expressPlugin(),
  ],
});
