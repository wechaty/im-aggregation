import { Router } from "express";
import fs from "fs";
import path from "path";
import { getAccount } from "../src/database/impl/account";
import JSONResponse from "./JSONResponse";
import {
    exitAdapterProcess,
    getAdapterProcessStatus,
    restartAdapterProcess,
} from "./service";

interface AdapterInfo {
    name: string;
    modified: Date;
    url: string;
    status?: string;
    loginAt?: Date;
}

const router = Router();

router.get("/info", async (_, res) => {
    const info: AdapterInfo[] = [];
    const status = await getAdapterProcessStatus();

    const adapters = fs
        .readdirSync(path.resolve(__dirname, "../src/adapters"))
        .filter((file) => !file.startsWith("Adapter"));
    for (const adapter of adapters) {
        const adapterName = adapter.split(".")[0];

        let qrcodePath = path.resolve(
            __dirname,
            `./public/imgs/qrcode/${adapterName}.png`
        );
        if (!fs.existsSync(qrcodePath)) {
            qrcodePath = path.resolve(__dirname, "./public/imgs/empty.png");
        }

        const stat = fs.statSync(qrcodePath);
        const pro = status.find((p) => p.name === adapterName);
        const account = await getAccount(adapterName);
        
        info.push({
            name: adapterName,
            modified: stat.mtime,
            url: qrcodePath.replace(`${__dirname}/public`, ""),
            status: pro?.pm2_env?.status || "Not Running",
            loginAt: account?.loginAt,
        });
    }
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

router.post("/restart", async (req, res) => {
    const adapter = req.body.adapter;
    try {
        await restartAdapterProcess(adapter);
        res.json(JSONResponse.success()).end();
    } catch (err: any) {
        res.json(JSONResponse.error(err.message)).end();
    }
});

export default router;
