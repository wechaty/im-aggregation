import { FileBoxInterface } from "file-box";
import path from "path";
import { MessageInterface } from "wechaty/impls";
import { MessageTypeName } from "../schema/types";
import crypto from "crypto";
import _ from "lodash";
import fs from "fs";

export function isNullOrEmpty(value: any): boolean {
    return _.isNull(value) || _.isEmpty(value);
}

export async function generateMsgFileName(
    msg: MessageInterface,
    fileBox: FileBoxInterface
): Promise<string> {
    const typeName = MessageTypeName[msg.type()];

    const buffer = await fileBox.toBuffer();
    // use crypto to convert buffer to md5
    const md5 = crypto.createHash("md5").update(buffer).digest("hex");

    const dateString = msg
        .date()
        .toLocaleString()
        .replace(/:/g, "")
        .replace(/\s/g, "-")
        .replace(/\//g, "");

    let extName = path.extname(fileBox.name);
    // if (isNullOrEmpty(extName)) {
    //     extName = ".gif";
    // }
    return `${typeName}-${isNullOrEmpty(md5) ? dateString : md5}${extName}`;
}

export async function generateMsgFileReadableName(msg: MessageInterface) {
    const talker = msg.talker()?.name();
    const listener = msg.listener()?.name();
    const room = msg.room();
    if (room) {
        return `${msg.date().getHours()}:${msg.date().getMinutes()} ${talker}`;
    }
}

/**
 * extract time from string
 * @param timeString 18:00, 19-00, 19.00, 19点00
 * @returns
 */
export function extractTimeString(timeString: string) {
    timeString = timeString.replace(/：|-|,|，|\.|。|点/g, ":");
    const [_, hour, minute] = /(\d{1,2}):(\d{1,2})/.exec(timeString) || [];
    if (
        !hour ||
        !minute ||
        parseInt(hour, 10) > 23 ||
        parseInt(minute, 10) > 59 ||
        parseInt(hour, 10) < 0 ||
        parseInt(minute, 10) < 0
    ) {
        throw new Error(`Invalid time string: ${timeString}`);
    }
    return {
        hour,
        minute,
    };
}

/**
 * convert 16:00 to a date object
 * @param timeString
 * @returns
 */
export function parseTimeString(timeString: string): Date {
    const { hour, minute } = extractTimeString(timeString);

    const date = new Date();
    date.setHours(Number(hour));
    date.setMinutes(Number(minute));
    return date;
}

export async function waitFor(interval: number) {
    if (interval === 0) return;

    if (interval < 0 || interval > 10000 || isNaN(interval)) {
        throw new Error(`Invalid interval: ${interval}`);
    }
    return new Promise((resolve) => {
        setTimeout(resolve, interval);
    });
}

export async function loadInnerExtensions() {
    const Extensions = [];
    const fileNames = fs
        .readdirSync(path.resolve(__dirname, "../extensions"))
        .filter((f) => f !== "Extension.ts");
    for (const fileName of fileNames) {
        const Extension = (await import(`../extensions/${fileName}`)).default;
        Extensions.push(Extension);
    }
    return Extensions;
}
