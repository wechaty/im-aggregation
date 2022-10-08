import fs from "fs";
import path from "path";
import { Configuration } from "../schema/types";

const filePath = path.resolve(__dirname, "./config.json");
class LocalCache<T> {
    data: T;
    filePath: string;
    constructor() {
        this.filePath = filePath;
        this.data = this.read();
    }
    read() {
        const rawJSONString = fs.readFileSync(this.filePath, {
            encoding: "utf-8",
        });
        
        const data = JSON.parse(rawJSONString) as T;
        this.data = data;
        return data;
    }
    write() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 4));
    }
}

const localCache = new LocalCache<Configuration>();

export default localCache;
