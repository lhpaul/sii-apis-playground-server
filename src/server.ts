
import {server as HapiServer, Server } from '@hapi/hapi';
import { createGcpLoggingPinoConfig } from '@google-cloud/pino-logging-gcp-config';
import * as Pino from 'hapi-pino';
import * as pino from 'pino';

import { routes } from './routes';
import { logOnPreHandler, logOnRequest, logOnPreResponse } from './utils/server/server.utils';

export let server: Server;

export const init = async function(): Promise<Server> {
    server = HapiServer({
        port: process.env.PORT || 4000,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    // Register plugins
    await server.register({
        plugin: Pino,
        options: {
            logEvents: [], // this is to avoid any auto generated log
            instance: process.env.NODE_ENV == 'production' ?
                pino.pino(createGcpLoggingPinoConfig(undefined, {
                    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
                    redact: {
                        paths: ['req'], // this is to avoid adding request's info to every log since it can bring sensitive info
                        remove: true
                    },
                })) : // prettier logs when running on local machine in order to better debug logs
                pino.pino({
                    transport: {
                      target: 'pino-pretty',
                      options: {
                        colorize: true
                      }
                    },
                    redact: {
                        paths: ['req'],
                        remove: true
                    },
                  })
        },
    });

    // Load routes
    server.route(routes);

    // Load handlers for lifecycle events.
    // For more information about lifecycle events, see https://futurestud.io/files/hapi/hapi-request-lifecycle.pdf and https://hapi.dev/api/?v=20.3.0#request-lifecycle
    server.ext({
        type: 'onRequest',
        method: [logOnRequest]
    });
    server.ext({
        type: 'onPreHandler',
        method: [logOnPreHandler]
    });

    server.ext({
        type: 'onPreResponse',
        method: [logOnPreResponse]
    });

    return server;
};

export const start = async function (): Promise<void> {
    server.logger.info({
        eventName: 'server-start',
        host: server.settings.host,
        port: server.settings.port,
    }, `Server started on ${server.settings.host}:${server.settings.port}`);
    return server.start();
};

process.on('unhandledRejection', (err) => {
    server.logger.error({
        eventName: 'unhandled-rejection',
        error: err,
    }, `Unhandled rejection: ${err}`);
    console.error('unhandledRejection', err);
    process.exit(1);
});