// Separate loopback-only entry. Nothing is imported into the production app.
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
const root = new URL('..', import.meta.url).pathname;
const server = await createServer({ root, cacheDir: new URL('../../verification/vite-cache', import.meta.url).pathname, configFile: false, plugins: [react()], server: { host: '127.0.0.1', port: 5180, strictPort: true, fs: { allow: [root] } }, appType: 'mpa' });
await server.listen();
console.log('Private preview: http://127.0.0.1:5180/shift10-preview.html');
