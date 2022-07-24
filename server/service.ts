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

export async function restartAdapterProcess(name: string): Promise<void> {
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