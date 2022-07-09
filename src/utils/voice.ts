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

voice.on("error", (err: any) => console.log(err));

export async function convertSilkToWav(filePath: string) {
    const fileName = path.basename(filePath);
    const targetPath = path.resolve(
        outputFolder,
        fileName.replace(".sil", ".wav")
    );
    return new Promise<string>((resolve, reject) => {
        voice.decode(filePath, targetPath, (file: any) => {
            if (file) {
                resolve(targetPath);
            } else {
                reject();
            }
        });
    });
}
