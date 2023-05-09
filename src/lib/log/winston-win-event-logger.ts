import TransportStream = require('winston-transport');
import nodeWindows = require('node-windows');

export class WinstonWinEventLogger extends TransportStream {
    logger: nodeWindows.EventLogger;

    constructor(opts) {
        super(opts);

        this.logger = new nodeWindows.EventLogger(opts);
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        let { message, level } = info;

        if (level === 'error') {
            this.logger.error(message);
        } else if (level === 'warn') {
            this.logger.warn(message);
        } else {
            this.logger.info(message);
        }

        callback();
    }
}
