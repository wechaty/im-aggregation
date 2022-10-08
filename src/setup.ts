import "dotenv/config";
import schedule from "node-schedule";
import BaseAdapter from "./adapters/Adapter";
import { getAllConfigurations } from "./database/impl/configuration";
import { getMessagesWithinPeriod } from "./database/impl/message";
import { ProcessMessage } from "./schema/types";
import {
    extractTimeString,
    loadInnerExtensions,
    parseTimeString,
} from "./utils/helper";
import Log from "./utils/logger";
import { Redis } from "./utils/redis";
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

async function redisMessageHandler(rawMessage: string) {
    const { shortcut, args = [] } = JSON.parse(rawMessage) as ProcessMessage;
    try {
        await adapter.invokeCommand(shortcut, ...args);
    } catch (error) {
        logger.error(error);
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

    // load inner extensions
    const exts = await loadInnerExtensions();
    exts.map((Ext) => adapter.loadExtension(new Ext(adapter)));

    await adapter.start();

    let config = getAllConfigurations();
    let { forwardTime } = config;
    let { hour, minute } = extractTimeString(forwardTime);

    logger.info(`Setting aggregation start time: ${config.aggregation.startTime}`);
    logger.info(`Setting aggregation end time: ${config.aggregation.endTime}`);
    logger.info(`Setting forward time: ${forwardTime}`);

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

    logger.info(`Connecting to redis...`);
    const redis = new Redis();
    const subscriber = await redis.getSubscriber();

    logger.info(`Subscribing to redis channel: ${targetAdapter}_message`);
    await subscriber.subscribe(`${targetAdapter}_message`, redisMessageHandler);
}

setup().catch((error) => {
    logger.error(error);
});
