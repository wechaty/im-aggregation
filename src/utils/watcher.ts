import fs from "fs";
import path from "path";
import { Configuration } from "../schema/types";

// watch config.json's changes
const filePath = path.resolve(__dirname, "../database/config.json");
var originContent = JSON.parse(
    fs.readFileSync(filePath, "utf8")
) as Configuration;

export function onForwardTimeUpdate(callback: (timeString: string) => void) {
    fs.watch(filePath, (event: string, filename: string) => {
        if (event === "change") {
            const data = JSON.parse(
                fs.readFileSync(filePath, { encoding: "utf-8" })
            ) as Configuration;
            if (data.forwardTime != originContent.forwardTime) {
                callback(data.forwardTime);
                originContent = data;
            }
        }
    });
}
