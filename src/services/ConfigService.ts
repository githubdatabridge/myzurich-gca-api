import { injectable } from 'tsyringe';

import * as dotenv from 'dotenv';

@injectable()
export class ConfigService {
    config: dotenv.DotenvConfigOutput;

    private static DEFAULTS = {
        HOST: '0.0.0.0',
        PORT: 8080,
        SSL: false,
        TITLE: 'MyZurich GCA Api Service',
        VERSION: '1',
        APP_NAME: 'MyZurich GCA Api',
        QLIK_SERVICE_HOST: 'http://localhost',
        QLIK_SERVICE_PORT: 3006,
        QLIK_HOST_NAME: 'YOUR_QLIK_SERVER_HOST',
        QLIK_VIRTUAL_PROXY: 'YOUR_VIRTUAL_PROXY',
        API_KEY: 'f919861d-dda2-442e-b238-fee4f417445ba',
        QLIK_APP_SESSION_HEADER: 'X-Qlik-Session',
        LOG_TYPE: null, // file | database | null => null == both
        LOG_DIR: 'logs',
        LOG_LEVEL: 'info',
        LOG_CORE_FILE: 'core.log',
        LOG_DATE_PATTERN: 'YYYY-MM-DD',
        LOG_MAX_SIZE: '20m',
        LOG_MAX_FILES: '14d',
        LOG_DB_LEVEL: 'debug',
        LOG_DB_TABLE_NAME: 'logs',
    };

    constructor() {
        this.init();
    }

    private init() {
        this.config = dotenv.config();
    }

    get(value: string, isBool = false): any {
        if (!process.env || !process.env[value]) {
            return ConfigService.DEFAULTS[value];
        }

        return !isBool
            ? process.env[value]
            : process.env[value] === 'false'
            ? false
            : true;
    }
}
