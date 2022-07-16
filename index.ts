import childProcess from "child_process";

const enabledAdapters = process.env.ENABLED_ADAPTERS || "WeChat";

const validAdapters = ["WeChat", "WeCom", "WhatsApp"];

enabledAdapters
    .replace("，", ",")
    .replace(" ", ",")
    .split(",")
    .filter((a) => validAdapters.includes(a))
    .forEach((adapter) => {
        childProcess.execSync(`TARGET_ADAPTER=${adapter} FORK_MODE=true yarn run dev`);
    });
