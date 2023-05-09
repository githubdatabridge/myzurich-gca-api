import { IAuthProvider, QlikAuthType } from './IAuthProvider';

export abstract class BaseQAuthProvider implements IAuthProvider {
    constructor(type: QlikAuthType) {
        this.type = type;
    }
    readonly type: QlikAuthType;
    abstract ensureQlikUser(...arg: any[]);
}
