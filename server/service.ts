import pm2, { ProcessDescription } from "pm2";
import { Redis } from "../src/utils/redis";

export async function getAdapterProcessStatus(): Promise<ProcessDescription[]> {
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

export async function exitAdapterProcess(name: string): Promise<void> {
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

export async function restartAdapterProcess(
    name: string,
    list: pm2.ProcessDescription[]
): Promise<void> {
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err);
            }
            // not found in list
            if (!list.find((p) => p.name === name)) {
                pm2.start(
                    {
                        name,
                        script: `yarn run dev --adapter ${name}`,
                    },
                    (err) => {
                        if (err) {
                            reject(err);
                        }
                        resolve();
                    }
                );
            } else {
                pm2.restart(name, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            }
        });
    });
}

export async function sendMessageToProcess(name: string, message: any) {
    const r = new Redis();
    const subscriber = await r.getSubscriber();

    await subscriber.publish(`${name}_message`, JSON.stringify(message));
}
