import * as axios from 'axios';
import * as http from 'http';
import * as https from 'https';

export const handleTextFields = (field) => {
    if (field === null) {
        return field;
    }

    if (typeof field === 'string') {
        return JSON.parse(field);
    }

    if (typeof field === 'object') {
        return JSON.stringify(field);
    }

    return field;
};

function secondsSinceUnixEpoch(date: Date = null): number {
    if (!date) {
        date = new Date();
    }
    return Math.round(date.valueOf() / 1000);
}

const ExtractCookieStateFromHeaders = (headers: any): any => {
    const state: any = {};
    if (!headers.cookie) {
        return state;
    }
    const cookieString: string = headers.cookie;

    const cookieArray = cookieString.split(';').map((x) => x.split('='));

    cookieArray.forEach((c) => {
        if (!Array.isArray(c) || !c[0] || !c[1]) {
            return;
        }
        state[`${c[0].trim()}`] = c[1].trim();
    });

    return state;
};

const axiosInstance = (apiKey: string, type: AxiosInstanceType) => {
    switch (type) {
        case AxiosInstanceType.QlikSaasService:
            return axios.default.create({
                headers: { 'x-api-key': `${apiKey}` },
                //60 sec timeout
                timeout: 60000,

                //keepAlive pools and reuses TCP connections, so it's faster
                httpAgent: new http.Agent({ keepAlive: true }),
                httpsAgent: new https.Agent({
                    keepAlive: true,
                    rejectUnauthorized: false,
                }),

                //follow up to 10 HTTP 3xx redirects
                maxRedirects: 10,

                //cap the maximum content length we'll accept to 50MBs, just in case
                maxContentLength: 50 * 1000 * 1000,
            });

        default:
            throw new Error(`AxiosInstanceType ${type} not implanted.`);
    }
};

enum AxiosInstanceType {
    QlikSaasService,
}

export {
    ExtractCookieStateFromHeaders,
    axiosInstance,
    AxiosInstanceType,
    secondsSinceUnixEpoch,
};
