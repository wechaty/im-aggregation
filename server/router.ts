import { Router } from "express";
import fs from "fs";
import path from "path";
import { getAccount } from "../src/database/impl/account";
import Response from "./Response";
import {
    exitAdapterProcess,
    getAdapterProcessStatus,
    restartAdapterProcess,
    sendMessageToProcess,
} from "./service";

interface user {
    status: string;
    name: string;
}
interface AdapterInfo {
    name: string;
    modified: Date;
    url: string;
    status?: string;
    loginAt?: Date;
    user: user;
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
            qrcodePath = path.resolve(
                __dirname,
                "./public/imgs/qrcode/empty.jpg"
            );
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
            user: {
                status: account?.status || "offline",
                name: account?.name || "",
            },
        });
    }
    res.json(Response.success(info)).end();
});

router.post("/exit", async (req, res) => {
    const adapter = req.body.adapter;
    try {
        await exitAdapterProcess(adapter);
        res.json(Response.success()).end();
    } catch (err: any) {
        res.json(Response.error(err.message)).end();
    }
});

router.post("/restart", async (req, res) => {
    const adapter = req.body.adapter;
    try {
        const list = await getAdapterProcessStatus();
        await restartAdapterProcess(adapter, list);

        res.json(Response.success()).end();
    } catch (err: any) {
        res.json(Response.error(err.message)).end();
    }
});

router.post("/logout", async (req, res) => {
    const adapter: string = req.body.adapter;
    try {
        await sendMessageToProcess(adapter, { shortcut: "lo" });

        res.json(Response.success()).end();
    } catch (err: any) {
        res.json(Response.error(err.message)).end();
    }
});

export default router;
