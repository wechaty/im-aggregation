/**
 * Qiniu Storage
 * @link https://developer.qiniu.com/kodo/1289/nodejs
 */
import qiniu from "qiniu";
import Storage from "./Storage";
import Log from "../../utils/logger";
import path from "path";

const logger = new Log("Qiniu");

const accessKey = process.env.QINIU_ACCESS_KEY;
const secretKey = process.env.QINIU_SECRET_KEY;

if (!accessKey || !secretKey) {
    logger.error("Qiniu accessKey or secretKey is not set");
}

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

const bucket = process.env.QINIU_BUCKET || "";
const endpoint = process.env.QINIU_ENDPOINT || "";

if (!bucket) {
    logger.error("Qiniu bucket is not set");
}

const config = new qiniu.conf.Config();

// @ts-ignore
// 华东机房
config.zone = qiniu.zone.Zone_z0;

export default class Qiniu extends Storage {
    private bucket: string;
    private mac: qiniu.auth.digest.Mac;
    private config: qiniu.conf.Config;
    private logger: Log;

    constructor() {
        super();
        this.bucket = bucket;
        this.mac = mac;
        this.config = config;
        this.logger = logger;
    }
    /**
     *
     * @param filePath 文件路径
     * @returns 远程文件路径
     */
    override async upload(filePath: string): Promise<string> {
        const fileName = path.basename(filePath);
        return new Promise((resolve, reject) => {
            const formUploader = new qiniu.form_up.FormUploader(this.config);
            const putExtra = new qiniu.form_up.PutExtra();
            const key = fileName;
            const putPolicy = new qiniu.rs.PutPolicy({
                scope: this.bucket + ":" + key,
            });
            const uploadToken = putPolicy.uploadToken(this.mac);
            formUploader.putFile(
                uploadToken,
                key,
                filePath,
                putExtra,
                (err, body, info) => {
                    if (err) {
                        this.logger.error(err);
                        this.logger.info(info);
                        reject(err);
                    } else if (info.statusCode == 200) {
                        resolve(endpoint + "/" + body.key);
                    } else {
                        this.logger.info(info.statusCode);
                        this.logger.info(body);
                    }
                }
            );
        });
    }
}
