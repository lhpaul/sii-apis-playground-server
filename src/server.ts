import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import fastify, { FastifyInstance } from 'fastify';

import { routes } from './routes';
import { RequestLogger } from './utils/request-logger/request-logger.class';

export let server: FastifyInstance;

export const init = async function(): Promise<FastifyInstance> {
    server = fastify({
        logger: {
            level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info'
        }
    });

    if (process.env.NODE_ENV !== 'production') {
        await server.register(cors, {
            origin: 'localhost'
        });
    }

    server.register(helmet, { global: true })

    // Load routes
    routes.forEach(route => {
        server.route(route);
    });

    server.setNotFoundHandler((_request, reply) => {
        // TODO: move this values to constants
        reply.status(404).send({
            error: 'Not found',
            message: 'The requested resource was not found'
        });
    });

    // Wrap request logger
    server.addHook('onRequest', (request, _reply, done) => {
        request.log = new RequestLogger({
            logger: request.log
        });
        done();
    });

    // Add hook for timeout
    server.addHook('onTimeout', (request, reply) => {
        request.log.warn({
            logId: 'request-timeout',
            data: {
                requestId: request.id,
                elapsedTime: reply.elapsedTime
            }
        }, `Request timed out after ${reply.elapsedTime}ms`);
    });

    return server;
};

export const start = async function (): Promise<void> {
    const address = await server.listen({
        port: Number(process.env.PORT) || 4000,
        host: '0.0.0.0'
    });
    
    server.log.info({
        logId: 'server-start',
        data: {
            address
        }
    }, `Server started on ${address}`);
};

process.on('unhandledRejection', (err) => {
    server.log.error({
        logId: 'unhandled-rejection',
        data: {
            error: err,
        }
    }, `Unhandled rejection: ${err}`);
    console.error('unhandledRejection', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    server.log.error({
        logId: 'uncaught-exception',
        data: { error: err }
    }, `Uncaught exception: ${err}`);
    console.error('uncaughtException', err);
});