import "dotenv/config";
import schedule from "node-schedule";
import BaseAdapter from "./adapters/Adapter";
import WeChatAdapter from "./adapters/WeChat";
import WeComAdapter from "./adapters/WeCom";
import WhatsAppAdapter from "./adapters/WhatsApp";
import { getAllConfigurations } from "./database/impl/configuration";
import { getMessagesWithinPeriod } from "./database/impl/message";
import BaseExtension from "./extensions/BaseExtension";
import FilterExtension from "./extensions/FilterExtension";
import { AdapterMap } from "./schema/types";
import { parseTimeString } from "./utils/helper";
import log4js from "./utils/logger";

const logger = log4js.getLogger("setup");

const adapterMap: AdapterMap = {
    wechat: new WeChatAdapter(),
    wecom: new WeComAdapter(),
    whatsapp: new WhatsAppAdapter(),
};
const enabledAdapters = process.env.ENABLED_ADAPTERS || "wechat";

const adapters: BaseAdapter[] = [];

enabledAdapters.split(",").forEach((name) => {
    adapters.push(adapterMap[name]);
});

async function forwardHandler() {
    const config = getAllConfigurations();
    const adapter = adapters.find(
        (adapter) => adapter.profile.source === config.target.source
    );
    if (adapter) {
        const { startTime, endTime } = config.aggregation;

        const messages = await getMessagesWithinPeriod(
            parseTimeString(startTime),
            parseTimeString(endTime)
        );
        await adapter.forwardMessages(messages);
    } else {
        logger.error(`Adapter for ${config.targetSource} not found`);
    }
}

export async function setup() {
    // load extensions
    adapters.forEach((adapter) => {
        adapter.loadExtension(new BaseExtension(adapter));
        adapter.loadExtension(new FilterExtension(adapter));
    });
    adapters.forEach(async (adapter) => await adapter.start());

    let config = getAllConfigurations();
    let { forwardTime } = config;
    let [hour, minute] = forwardTime.split(":");

    var job = schedule.scheduleJob(`${minute} ${hour} * * *`, forwardHandler);

    for (const adapter of adapters) {
        adapter.on("updateScheduleJob", () => {
            job.cancel();
            config = getAllConfigurations();
            logger.info("Update schedule job");
            [hour, minute] = config.forwardTime.split(":");
            job = schedule.scheduleJob(
                `${minute} ${hour} * * *`,
                forwardHandler
            );
        });
    }
}
