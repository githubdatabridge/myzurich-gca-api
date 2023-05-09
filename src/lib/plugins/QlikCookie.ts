import { boomHandleError } from '../errors';
import { container } from 'tsyringe';
import { Plugin, Request, ResponseToolkit } from '@hapi/hapi';

import { Errors } from '..';
import { QlikStrategies } from '../strategies';
import { QesAuthProvider } from '../../services/authProviders/QesAuthProvider';

const QlikCookie: Plugin<any> = {
    name: 'QlikCookie',
    version: '0.1',
    register: function (server, options) {
        const qlikCookieScheme = function (server, options) {
            return {
                authenticate: async function (
                    request: Request,
                    h: ResponseToolkit
                ) {
                    try {
                        const qesAuthProvider =
                            container.resolve(QesAuthProvider);

                        const userData = await qesAuthProvider.ensureQlikUser(
                            request.state,
                            request.headers
                        );

                        return h.authenticated({
                            credentials: { userData, scope: userData.roles },
                        });
                    } catch (error) {
                        boomHandleError(
                            new Errors.Unauthorized('Unauthorized', {
                                innerError: error,
                                innerErrorMessage: error.message,
                            }),
                            true
                        );
                    }
                },
            };
        };
        server.auth.scheme('qlik_cookie_sessionId', qlikCookieScheme);
        server.auth.strategy(QlikStrategies.QesCookie, 'qlik_cookie_sessionId');
    },
};
export { QlikCookie };
