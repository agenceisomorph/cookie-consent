import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Serveur de la fixture E2E.
 *
 * Le middleware absorbe le POST du journal de consentement : l'adapter Strapi
 * ecrit en "fire and forget" a chaque choix de l'utilisateur. Sans ce point
 * d'entree local, chaque test emettrait un appel reseau sortant et la fixture
 * dependrait d'un Strapi joignable.
 */
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'journal-consentement-local',
      configureServer(server) {
        server.middlewares.use('/api/cookie-consents', (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end();
            return;
          }
          req.resume();
          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ data: { id: 1 } }));
        });
      },
    },
  ],
  server: {
    port: 3099,
    strictPort: true,
  },
});
