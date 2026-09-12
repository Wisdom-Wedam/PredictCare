import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Ignore the JSON database file. The backend writes to it on every
      // registration/prediction; without this, Vite's watcher triggers a
      // full page reload that wipes the prediction result from the screen.
      // A function is used (not a glob) so it works on Windows backslash paths.
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {
              ignored: (filePath: string) =>
                filePath.replace(/\\/g, '/').includes('/src/db/data.json'),
            },
    },
  };
});
