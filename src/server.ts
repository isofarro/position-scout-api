import Fastify from 'fastify';
import { getConfig } from './common/config';
import { gameRoutes } from './games/routes';

const app = Fastify({ logger: true });

// Register feature routes
app.register(gameRoutes, { prefix: '/games' });

const { port } = getConfig();
app.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
