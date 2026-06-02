import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';
import {defineConfig} from 'vite';

dotenv.config();

const readJsonBody = async (req: any) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
};

const createVercelResponse = (res: any) => {
  let statusCode = 200;

  return {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(payload));
    },
  };
};

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'local-api',
        configureServer(server) {
          server.middlewares.use('/api/create-user', async (req, res) => {
            const { default: handler } = await import('./api/create-user');
            (req as any).body = await readJsonBody(req);
            await handler(req, createVercelResponse(res));
          });

          server.middlewares.use('/api/send-reminder', async (req, res) => {
            const { default: handler } = await import('./api/send-reminder');
            (req as any).body = await readJsonBody(req);
            await handler(req, createVercelResponse(res));
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
