import { log as Brolog } from "wechaty";

export default class Log {
    prefix: string;
    constructor(prefix: string) {
        this.prefix = `[${prefix}]`;
    }

    info(...args: any[]) {
        Brolog.info(this.prefix, ...args);
    }

    error(...args: any[]) {
        Brolog.error(this.prefix, ...args);
    }

    warn(...args: any[]) {
        Brolog.warn(this.prefix, ...args);
    }
}