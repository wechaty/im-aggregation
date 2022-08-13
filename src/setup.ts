import "dotenv/config";
import schedule from "node-schedule";
import BaseAdapter from "./adapters/Adapter";
import { getAllConfigurations } from "./database/impl/configuration";
import { getMessagesWithinPeriod } from "./database/impl/message";
import BaseExtension from "./extensions/BaseExtension";
import FilterExtension from "./extensions/FilterExtension";
import { ProcessMessage } from "./schema/types";
import { extractTimeString, parseTimeString } from "./utils/helper";
import Log from "./utils/logger";
import { onForwardTimeUpdate } from "./utils/watcher";

const logger = new Log("Setup");

var adapter: BaseAdapter;

async function forwardHandler() {
    const config = getAllConfigurations();

    // 如果当前适配器是目标适配器，那么就进行转发。
    if (adapter && adapter.profile.source === config.target.source) {
        const { startTime, endTime } = config.aggregation;

        const messages = await getMessagesWithinPeriod(
            parseTimeString(startTime),
            parseTimeString(endTime)
        );
        await adapter.forwardMessages(messages);
    } else if (!adapter) {
        logger.error("Adapter not initialized");
    }
}

export async function setup() {
    const targetAdapter = process.argv[3];
    if (!targetAdapter) {
        logger.error("Target adapter not specified");
        return;
    }

    const Adapter = (await import(`./adapters/${targetAdapter}`)).default;

    adapter = new Adapter();

    adapter.loadExtension(new BaseExtension(adapter));
    adapter.loadExtension(new FilterExtension(adapter));

    await adapter.start();

    let config = getAllConfigurations();
    let { forwardTime } = config;
    let { hour, minute } = extractTimeString(forwardTime);

    var forwardJob = schedule.scheduleJob(
        `${minute} ${hour} * * *`,
        forwardHandler
    );

    onForwardTimeUpdate((timeString: string) => {
        const { hour, minute } = extractTimeString(timeString);

        forwardJob.cancel();
        logger.info(
            `${targetAdapter} Update schedule job: ${minute} ${hour} * * *`
        );

        forwardJob = schedule.scheduleJob(
            `${minute} ${hour} * * *`,
            forwardHandler
        );
    });
}

process.on("message", (msg: any) => {
    logger.info("Receive Message", msg);
});

setup();
