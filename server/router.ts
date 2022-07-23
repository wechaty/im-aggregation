import { Router } from "express";
import fs from "fs";
import path from "path";
import pm2, { ProcessDescription } from "pm2";

interface AdapterInfo {
    name: string;
    modified: Date;
    url: string;
    status?: string;
}

const router = Router();

router.get("/info", async (_, res) => {
    const info: AdapterInfo[] = [];
    const status = await getAdapterProcessStatus();

    fs.readdirSync(path.resolve(__dirname, "./public/imgs/qrcode"))
        // .filter((f) => status.find((p) => p.name === f.split(".")[0]))
        .forEach((file) => {
            const stat = fs.statSync(
                path.resolve(__dirname, `./public/imgs/qrcode/${file}`)
            );
            const adapterName = file.split(".")[0];
            const pro = status.find((p) => p.name === adapterName);
            info.push({
                name: adapterName,
                modified: stat.mtime,
                url: `/imgs/qrcode/${file}`,
                status: pro?.pm2_env?.status || "Not Running",
            });
        });
    // status.
    res.json(JSONResponse.success(info)).end();
});

router.post("/exit", async (req, res) => {
    const adapter = req.body.adapter;
    try {
        await exitAdapterProcess(adapter);
        res.json(JSONResponse.success()).end();
    } catch (err: any) {
        res.json(JSONResponse.error(err.message)).end();
    }
});

class JSONResponse {
    status: "success" | "error" = "success";
    data: any;
    static success(data?: any): JSONResponse {
        return {
            status: "success",
            data,
        };
    }
    static error(data?: any): JSONResponse {
        return {
            status: "error",
            data,
        };
    }
}

async function getAdapterProcessStatus(): Promise<ProcessDescription[]> {
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err);
            }
            pm2.list((err, list) => {
                if (err) {
                    reject(err);
                }
                resolve(list);
            });
        });
    });
}

async function exitAdapterProcess(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err);
            }
            pm2.stop(name, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    });
}

async function restartAdapterProcess(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err);
            }
            pm2.restart(name, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    });
}

export default router;
