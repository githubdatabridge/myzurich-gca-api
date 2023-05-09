import { autoInjectable, delay, inject } from 'tsyringe';
import { ConfigService, QlikService } from '..';
import { QlikQesUser } from '../../entities';
import { Errors } from '../../lib';

import { BaseQAuthProvider } from './BaseQAuthProvider';
import { QlikAuthType } from './IAuthProvider';

@autoInjectable()
export class QesAuthProvider extends BaseQAuthProvider {
    private hostName;
    private vp;
    constructor(
        @inject(delay(() => ConfigService))
        private configService?: ConfigService,
        @inject(delay(() => QlikService)) private qlikService?: QlikService
    ) {
        super(QlikAuthType.Windows);
        this.hostName = this.configService.get('QLIK_HOST_NAME') as string;
        this.vp = this.configService.get('QLIK_VIRTUAL_PROXY') as string;
    }

    async ensureQlikUser(state: any, headers: any): Promise<QlikQesUser> {
        const qlikSessionId = state[`X-Qlik-Session-${this.vp}`];

        try {
            const qlikUser: QlikQesUser = await this.getUserBySessionId(
                qlikSessionId,
                this.hostName,
                this.vp
            );

            return qlikUser;
        } catch (e) {
            throw new Errors.Unauthorized('Unauthorized', {
                qlikSessionId,
            });
        }
    }

    private getQsInfo(hostName: string, vp: string) {
        return {
            host: hostName,
            vp,
        };
    }

    private async getUserBySessionId(
        qlikSessionId: string,
        hostName: string,
        vp: string
    ): Promise<QlikQesUser> {
        try {
            const qlikUser = await this.qlikService.getUserBySessionId(
                qlikSessionId,
                {
                    qsInfo: this.getQsInfo(hostName, vp),
                }
            );

            if (!qlikUser) {
                throw new Errors.Unauthorized('Unauthorized', {
                    qlikSessionId,
                });
            }

            return qlikUser;
        } catch (e) {
            throw new Errors.Unauthorized('Unauthorized', {
                qlikSessionId,
            });
        }
    }
}
