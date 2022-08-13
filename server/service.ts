import pm2, { ProcessDescription } from "pm2";

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

export async function sendMessageToProcess(
    name: string,
    message: any,
    list: pm2.ProcessDescription[]
) {
    return new Promise<void>((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err);
            }
            const p = list.find((p) => p.name === name);
            if (!p) {
                reject(new Error(`${name} not found`));
                return;
            } else if (p.pm_id !== 0 && !p.pm_id) {
                reject(new Error(`${name} not found and pid is undefined`));
                return;
            }

            pm2.sendDataToProcessId(
                p.pm_id,
                {
                    type: "process:msg",
                    topic: "Server Message",
                    data: message,
                },
                (err, packet) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                }
            );
        });
        pm2.launchBus(function (err, pm2_bus) {
            pm2_bus.on("process:msg", function (packet: any) {
                console.log(packet);
            });
        });
    });
}
