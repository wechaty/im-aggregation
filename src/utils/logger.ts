import log4js from "log4js";

log4js.configure({
    appenders: {
        dateFile: {
            type: "dateFile",
            filename: ".log/im-aggregation",
            pattern: "yyyy-MM-dd.log",
            alwaysIncludePattern: true,
            category: "im-aggregation",
        },
    },
    categories: {
        default: { appenders: ["dateFile"], level: "trace" },
    },
});

const logger = log4js.getLogger();

// console.log = logger.info.bind(logger);

export default log4js;
