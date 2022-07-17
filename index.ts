import childProcess from "child_process";

const enabledAdapters = process.env.ENABLED_ADAPTERS || "WeChat";

const validAdapters = ["WeChat", "WeCom", "WhatsApp"];

enabledAdapters
    .replace("，", ",")
    .replace(" ", ",")
    .split(",")
    .filter((a) => validAdapters.includes(a))
    .forEach((adapter) => {
        childProcess.execSync(`pm2 start "yarn run dev --adapter ${adapter}"`);
        // const yarn = childProcess.spawn("pm2", ["start", `"yarn run dev --adapter ${adapter}"`]);
    });
