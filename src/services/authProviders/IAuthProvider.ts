import { QlikQesUser } from '../../entities';

export enum QlikAuthType {
    Windows = 'windows',
}

export interface IAuthProvider {
    readonly type: QlikAuthType;
    ensureQlikUser(...arg): Promise<QlikQesUser>;
}
