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
}
const enabledAdapters = process.env.ENABLED_ADAPTERS || "wechat";

const adapters: BaseAdapter[] = [];

enabledAdapters.split(",").forEach(name => {
    adapters.push(adapterMap[name]);
})

export async function setup() {
    // load extensions
    adapters.forEach((adapter) => {
        adapter.loadExtension(new BaseExtension(adapter));
        adapter.loadExtension(new FilterExtension(adapter));
    });
    adapters.forEach(async (adapter) => await adapter.start());

    const configs = getAllConfigurations();
    const { forwardTime } = configs;
    const [hour, minute] = forwardTime.split(":");

    var job = schedule.scheduleJob(
        `${minute} ${hour} * * *`,
        async function () {
            const adapter = adapters.find(
                (adapter) => adapter.profile.source === configs.targetSource
            );
            if (adapter) {
                const { startTime, endTime } = configs.aggregation;

                const messages = await getMessagesWithinPeriod(
                    parseTimeString(startTime),
                    parseTimeString(endTime)
                );
                await adapter.forwardMessages(messages);
            } else {
                logger.error(`Adapter for ${configs.targetSource} not found`);
            }
        }
    );

    for (const adapter of adapters) {
        adapter.on(
            "updateScheduleJob",
            (scheduleTime: string, scheduleHandler: Function) => {
                job.cancel();
                job = schedule.scheduleJob(
                    scheduleTime,
                    function (firstDate: Date) {
                        scheduleHandler(firstDate);
                    }
                );
            }
        );
    }
}
