import fs from "fs";
import path from "path";
import { Configuration } from "../schema/types";
import Log from "./logger";

const logger = new Log("Watcher");
const filePath = path.resolve(__dirname, "../database/config.json");
var originContent = JSON.parse(
    fs.readFileSync(filePath, "utf8")
) as Configuration;

/**
 * watch the config file and update the config when it changed
 * @param {function(timeString: string)} callback Call back function
 */
export function onForwardTimeUpdate(callback: (timeString: string) => void) {
    fs.watch(filePath, (event: string, filename: string) => {
        if (event === "change") {
            try {
                const data = JSON.parse(
                    fs.readFileSync(filePath, { encoding: "utf-8" })
                ) as Configuration;
                if (data.forwardTime != originContent.forwardTime) {
                    callback(data.forwardTime);
                    originContent = data;
                }
            } catch (error) {
                logger.error("%s (%s): %j", filename, filePath, error);
            }
        }
    });
}

export function onQrCodeUpdate(name: string, callback: () => any) {
    fs.watchFile(
        path.resolve(__dirname, `../../server/public/imgs/qrcode/${name}.png`),
        (curr, prev) => {
            if (curr.mtime > prev.mtime) {
                callback();
            }
        }
    );
}

export function offQrCodeUpdate(name: string) {
    fs.unwatchFile(
        path.resolve(__dirname, `../../server/public/imgs/qrcode/${name}.png`)
    );
}
