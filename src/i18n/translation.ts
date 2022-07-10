import zh from "./source/zh";
import en from "./source/en";
import { IntlPayload, IntlSourceMap } from "../schema/types";

class Intl {
    lang: string;
    source: IntlSourceMap;
    constructor(lang: string) {
        this.lang = lang;
        this.source = {
            zh,
            en,
        };
        if (!Object.keys(this.source).includes(this.lang)) this.lang = "en";
    }

    t(key: string, payload?: IntlPayload) {
        const source = this.source[this.lang];
        let msg = source[key];
        if (!msg) return key;
        for (const key in payload) {
            const value = payload[key];
            msg = msg.replace(`{${key}}`, value.toString());
        }
        return msg;
    }
}

const lang = process.env.LANGUAGE || "zh";

const intl = new Intl(lang);

export default intl;
