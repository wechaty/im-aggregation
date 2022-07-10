/**
 * Voice Utils
 */
// @ts-ignore
import WxVoice from "wx-voice";
import log4js from "./logger";
import path from "path";

const voice = new WxVoice();
const logger = log4js.getLogger("voice");
const outputFolder = process.env.OUTPUT_FOLDER || "output";

voice.on("error", (err: any) => logger.error(err));

export async function convertSilkToWav(filePath: string) {
    const fileName = path.basename(filePath);
    const targetPath = path.resolve(
        outputFolder,
        fileName.replace(path.extname(filePath), ".wav")
    );
    return new Promise<string>((resolve, reject) => {
        voice.decode(
            filePath,
            targetPath,
            {
                format: "wav",
            },
            (file: any) => {
                if (file) {
                    resolve(file);
                } else {
                    reject(new Error("Failed to convert silk to wav"));
                }
            }
        );
    });
}

export async function getDuration(filePath: string) {
    return new Promise<number>((resolve, reject) => {
        voice.duration(filePath, (duration: number) => {
            if (duration) {
                resolve(duration);
            } else {
                reject(new Error("Failed to get duration"));
            }
        });
    });
}