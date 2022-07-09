import { FileBoxInterface } from "file-box";
import path from "path";
import { MessageInterface } from "wechaty/impls";
import { MessageTypeName } from "../schema/types";
import converter from "xml-js";
import crypto from "crypto";
import _ from "lodash";

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
/**
 * extract time from string
 * @param timeString 18:00, 19-00,19.00,19点00
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

export function xml2Obj(xml: string): any {
    const json = converter.xml2js(xml, {
        compact: true,
    });
    return json;
}

/**
 * find a specify type property in a object
 * @param obj
 * @param property
 * @returns
 */
function findProperty(obj: any, property: string): any {
    if (obj[property] && typeof obj[property] === "string") {
        return obj[property];
    }
    for (const key in obj) {
        if (obj[key] && typeof obj[key] === "object") {
            const prop = findProperty(obj[key], property);
            if (!isNullOrEmpty(prop)) {
                return prop;
            }
        }
    }
    return null;
}
