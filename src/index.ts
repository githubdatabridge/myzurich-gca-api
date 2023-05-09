import 'reflect-metadata';
import * as Hapi from '@hapi/hapi';
import * as Inert from '@hapi/inert';
import * as Bell from '@hapi/bell';
import * as Vision from '@hapi/vision';
import * as HapiSwagger from 'hapi-swagger';
import * as DevErrors from 'hapi-dev-errors';
import { container } from 'tsyringe';

import * as services from './services';
import * as controllers from './controllers';
import { getServerCertificates } from './server-certificates';
import { QlikCookie } from './lib/plugins/QlikCookie';

const configService = container.resolve(services.ConfigService);
const logService = container.resolve(services.LogService);

let gateway = {};

if (configService.get('GATEWAY_HOST') && configService.get('GATEWAY_PATH')) {
    gateway = {
        host: configService.get('GATEWAY_HOST'),
        basePath: configService.get('GATEWAY_PATH'),
    };

    logService
        .get()
        .info(
            `Setting up Swagger gateway ${gateway['host']}${gateway['basePath']}`
        );
}

const swaggerConfig: HapiSwagger.RegisterOptions = {
    info: {
        title: configService.get('TITLE'),
        version: configService.get('VERSION'),
    },
    securityDefinitions: {},
    ...gateway,
};
const setupLogs = (server: Hapi.Server) => {
    server.events.on('response', (request) => {
        logService
            .get()
            .debug(
                `Response Request ${
                    request.info.remoteAddress
                }: ${request.method.toUpperCase()}  ${request.path}  ${
                    request.info.hostname
                }`
            );
    });

    server.ext('onRequest', (request, reply) => {
        logService
            .get()
            .debug(
                `Request ${
                    request.info.remoteAddress
                }: ${request.method.toUpperCase()}  ${request.path}  ${
                    request.info.hostname
                }`
            );
        return reply.continue;
    });
};

const setupServerPlugins = async (server: Hapi.Server) => {
    await server.register({
        plugin: DevErrors,
        options: {
            showErrors: process.env.NODE_ENV !== 'production',
        },
    });

    await server.register([Inert, Vision, Bell, QlikCookie]);
    await server.register({
        plugin: HapiSwagger,
        options: swaggerConfig,
    });
};

const setupControllers = (server: Hapi.Server) => {
    const pingController = new controllers.PingController();
    const documentController = new controllers.DocumentController();

    server.route(pingController.routes());
    server.route(documentController.routes());
};

const hostConfiguration = {
    host: configService.get('HOST'),
    port: parseInt(configService.get('PORT')),
};

const routeConfiguration = {
    routes: {
        cors: {
            origin: ['*'],
            credentials: true,
            exposedHeaders: ['Content-Disposition'],
        },
    },
};

const isSsl = configService.get('SSL', true);

const init = async () => {
    const cfg = isSsl
        ? {
              ...hostConfiguration,
              tls: {
                  key: getServerCertificates().key,
                  cert: getServerCertificates().cert,
              },
              ...routeConfiguration,
          }
        : {
              ...hostConfiguration,
              ...routeConfiguration,
          };

    if (process.env.NODE_ENV !== 'production') {
        cfg['debug'] = {
            request: ['error'],
        };
    }
    const server = new Hapi.Server(cfg);

    await setupServerPlugins(server);
    setupControllers(server);
    setupLogs(server);

    await server.start();
    logService.get().info(`Server running on ${server.info.uri}`);

    process.on('SIGINT', (code) => {
        logService.get().info(`stopping server...`);
        server.stop().then(async () => {
            logService.get().info(`stopped server.`);
            process.exit(0);
        });
    });

    process.on('SIGTERM', (signal) => {
        logService.get().info(`stopping server...`);
        server.stop().then(async () => {
            logService.get().info(`stopped server.`);
            process.exit(0);
        });
    });

    process.on('unhandledRejection', (err) => {
        logService.get().error(`Unhandled Rejection ${err}`);
        logService.get().info(`stopping server...`);
        server.stop().then(async (err) => {
            logService.get().info(`stopped server.`);
            process.exit(1);
        });
    });
};

init();
