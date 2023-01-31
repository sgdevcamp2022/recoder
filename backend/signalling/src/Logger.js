import { inspect } from 'util';

import pkg from 'colors';
const { enable, yellow, green, red, cyan, magenta } = pkg;

enable(); // Enable colors

const options = {
    depth: null,
    colors: true,
};
export default class Logger {
    constructor(appName = 'CoMeet', debugOn = true) {
        this.appName = yellow(appName);
        this.debugOn = debugOn;
        this.timeStart = Date.now();
        this.timeEnd = null;
        this.timeElapsedMs = null;
    }

    debug(msg, op = '') {
        if (this.debugOn) {
            this.timeEnd = Date.now();
            this.timeElapsedMs = this.getFormatTime(Math.floor(this.timeEnd - this.timeStart));
            console.debug(
                '[' + this.getDataTime() + '] [' + this.appName + '] ' + msg,
                inspect(op, options),
                this.timeElapsedMs,
            );
            this.timeStart = Date.now();
        }
    }

    log(msg, op = '') {
        console.log('[' + this.getDataTime() + '] [' + this.appName + '] ' + msg, inspect(op, options));
    }

    info(msg, op = '') {
        console.info(
            '[' + this.getDataTime() + '] [' + this.appName + '] ' + green(msg),
            inspect(op, options),
        );
    }

    warn(msg, op = '') {
        console.warn(
            '[' + this.getDataTime() + '] [' + this.appName + '] ' + yellow(msg),
            inspect(op, options),
        );
    }

    error(msg, op = '') {
        console.error(
            '[' + this.getDataTime() + '] [' + this.appName + '] ' + red(msg),
            inspect(op, options),
        );
    }

    getDataTime() {
        return cyan(new Date().toISOString().replace(/T/, ' ').replace(/Z/, ''));
    }

    getFormatTime(ms) {
        let time = Math.floor(ms);
        let type = 'ms';

        if (ms >= 1000) {
            time = Math.floor((ms / 1000) % 60);
            type = 's';
        }
        if (ms >= 60000) {
            time = Math.floor((ms / 1000 / 60) % 60);
            type = 'm';
        }
        if (ms >= (3, 6e6)) {
            time = Math.floor((ms / 1000 / 60 / 60) % 24);
            type = 'h';
        }
        return magenta('+' + time + type);
    }
};
