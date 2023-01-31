import Logger from './Logger.js';
const log = new Logger('Host');

export default class Host {
    constructor(ip, authorized) {
        this.auth = new Map();
        this.auth.set(ip, authorized);
    }
    isAuthorized(ip) {
        return this.auth.has(ip);
    }
    deleteIP(ip) {
        return this.auth.delete(ip);
    }
};
