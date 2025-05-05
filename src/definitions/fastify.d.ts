import FastifyRequest from 'fastify';
import { IProcessLogger } from './logging.interfaces';

declare module 'fastify' {
  interface FastifyBaseLogger extends IProcessLogger {}
}