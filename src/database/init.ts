import Configuration from "./models/Configuration";

Configuration.sync({
    force: true,
}).then(() => {
    Configuration.bulkCreate([
        {
            key: "self",
            value: "true",
        },
        {
            key: "aggregationStartTime",
            value: "09:00", // 09:00 AM
        },
        {
            key: "aggregationEndTime",
            value: "0", // 0 means until aggregation forward time, it ends.
        },
        {
            key: "aggregationForwardTime",
            value: "16:00", // 4:00 PM
        },
        {
            key: "targetSource",
            value: "WeCom",
        },
    ]);
});
