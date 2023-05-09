import { DbService } from '../lib/services';
import * as axios from 'axios';
import { injectable } from 'tsyringe';
import { ConfigService } from '.';

import { QlikActionRequest, QlikQesUser } from '../entities';

@injectable()
export class QlikService extends DbService {
    private apiKey: string;
    constructor(configService: ConfigService) {
        const host = configService.get('QLIK_SERVICE_HOST');
        const port = configService.get('QLIK_SERVICE_PORT');

        super(host, port);
        this.apiKey = configService.get('API_KEY') as string;
    }

    async auth(authHeader: string = '', data, sync = true, erase = true) {
        const url = `${this.getUrl()}/user/auth?sync=${sync}&erase=${erase}`;
        console.log('Qlik Auth', authHeader, JSON.stringify(data), sync, url);
        try {
            const response = await axios.default.post(url, data, {
                headers: {
                    Authorization: authHeader,
                    'x-api-key': this.apiKey,
                },
            });

            return response;
        } catch (e) {
            return this.parseError('QlikService@auth', e.response.data);
        }
    }

    async getUserBySessionId(
        sessionId: string,
        data: QlikActionRequest
    ): Promise<QlikQesUser> {
        const url = `${this.getUrl()}/user/${sessionId}`;
        try {
            const response = await axios.default.post<QlikQesUser>(url, data, {
                headers: {
                    'x-api-key': this.apiKey,
                },
            });

            return response.data;
        } catch (e) {
            this.parseError('QlikService@getUserBySessionId', e.response.data);
        }
    }

    async endUserSession(
        sessionId: string,
        data: QlikActionRequest
    ): Promise<boolean> {
        const url = `${this.getUrl()}/user/${sessionId}/end`;
        try {
            const response = await axios.default.post<any>(url, data, {
                headers: {
                    'x-api-key': this.apiKey,
                },
            });

            return response.status === 204;
        } catch (e) {
            this.parseError(
                'QlikService@endUserSession',
                e.response ? e.response.data : {}
            );
        }
    }

    async isSessionActive(
        sessionId: string,
        data: QlikActionRequest
    ): Promise<boolean> {
        const url = `${this.getUrl()}/user/${sessionId}/is-active`;
        try {
            const response = await axios.default.post<any>(url, data, {
                headers: {
                    'x-api-key': this.apiKey,
                },
            });

            return response.status === 200;
        } catch (e) {
            this.parseError(
                'QlikService@endUserSession',
                e.response ? e.response.data : {}
            );
        }
    }
}
