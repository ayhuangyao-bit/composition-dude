import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const project = fileURLToPath(new URL('..', import.meta.url));
export default defineConfig({
  root: path.join(project, 'desktop'), base: './', publicDir: path.join(project, 'public'),
  plugins: [react()], resolve: { alias: { '@': project } },
  css: { postcss: path.join(project, 'postcss.config.mjs') },
  build: { outDir: path.join(project, 'desktop/ui'), emptyOutDir: true, target: 'chrome134' },
});
