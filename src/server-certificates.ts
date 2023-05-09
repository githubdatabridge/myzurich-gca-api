import * as fs from 'fs';
import * as path from 'path';
import { container } from 'tsyringe';
import { LogService } from './services';

interface ServerCertificates {
    pfx: Buffer;
    key: Buffer;
    cert: Buffer;
}

interface TokenCertificates<T> {
    pfx: T;
    key: T;
    cert: T;
}

let certs: ServerCertificates = null;

const getServerCertificatePath = (certFileName: string): string => {
    const settings = {
        SERVER_CERT_PATH: path.resolve(`./certificates/server`),
    };

    return `${settings.SERVER_CERT_PATH}/${certFileName}`;
};

const getServerCertificates = (): ServerCertificates => {
    if (certs) {
        return certs;
    }

    var serverCertPath = path.resolve(`${__dirname}/certificates/server`);

    const readServerCert = (certFilename) => {
        return fs.readFileSync(`${serverCertPath}/${certFilename}`);
    };

    certs = {
        pfx: undefined, //readServerCert('server.pfx'),
        key: readServerCert('server.key'),
        cert: readServerCert('server.crt'),
    };

    return certs;
};

const getTokenCertificates = (): TokenCertificates<string> => {
    var serverCertPath = path.resolve(`${__dirname}/certificates/data`);
    var logger = container.resolve(LogService);

    const readServerCert = (certFilename) => {
        try {
            return fs.readFileSync(`${serverCertPath}/${certFilename}`, {
                encoding: 'utf8',
            });
        } catch (error) {
            logger
                .get()
                .warn(`Missing JWT Token certs in ./build/certificates/data`);
            return '';
        }
    };

    const certs: TokenCertificates<string> = {
        pfx: undefined,
        key: readServerCert('privatekey.pem.txt'),
        cert: readServerCert('publickey.cer'),
    };

    return certs;
};

export {
    getServerCertificates,
    getServerCertificatePath,
    getTokenCertificates,
};
