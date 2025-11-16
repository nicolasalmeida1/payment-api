import Fastify from 'fastify';
import routes from './infrastructure/routes/index.routes.js';

const server = Fastify({
  logger: true,
});

server.register(routes);

async function start() {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });

    const address = server.server.address();
    const port = typeof address === 'string' ? address : address?.port;

    console.log(`Server running on port ${port}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

start();
