import log4js from "log4js";
import { log } from "wechaty";

log4js.configure({
    appenders: {
        dateFile: {
            type: "dateFile",
            filename: ".log/im-aggregation",
            pattern: "yyyy-MM-dd.log",
            alwaysIncludePattern: true,
            category: "im-aggregation",
            fileNameSep: "-",
            numBackups: 10,
        },
    },
    categories: {
        default: { appenders: ["dateFile"], level: "trace" },
    },
});

const logger = log4js.getLogger();

if (process.env.LOG_FILE) {
    logger.info("Log to file");

    console.log = logger.log.bind(logger);
    console.error = logger.error.bind(logger);
    console.warn = logger.warn.bind(logger);
    console.debug = logger.debug.bind(logger);
    console.trace = logger.trace.bind(logger);

    logger.info("Replacing console.log, console.error, console.warn, console.debug, console.trace");
    
    log.info = logger.info.bind(logger);
    log.error = logger.error.bind(logger);
    log.warn = logger.warn.bind(logger);
}

export default log4js;
