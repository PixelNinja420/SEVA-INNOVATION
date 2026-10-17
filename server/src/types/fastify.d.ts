import '@fastify/jwt';
import { UserPayload } from './index.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: UserPayload;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: UserPayload;
    user: UserPayload;
  }
}
