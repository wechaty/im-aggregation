import { ContactSelfInterface } from "wechaty/impls";
import crypto from "crypto";
import Account from "../models/Account";
import log4js from "../../utils/logger";

const logger = log4js.getLogger("db-account");

export async function loginAccount(
    user: ContactSelfInterface,
    source: string
): Promise<string> {
    /**
     * Use composed string to generate a unique id for the user
     * So that we can identify the user in the database
     * But there is a case that the user name is changed
     */
    const aid = crypto
        .createHash("md5")
        .update(`${user.id}-${source}`)
        .digest("hex");

    const [account] = await Account.findOrBuild({
        where: {
            id: aid,
            source,
        },
        defaults: {
            id: aid,
            source,
        },
    });
    account.status = "online";
    account.loginAt = new Date();
    await account.save();

    logger.info(`${source} User [${user.name()}] logged in.`);
    return aid;
}

export async function getAccount(source: string) {
    const account = await Account.findOne({
        where: {
            source,
        },
    });
    return account;
}

export async function logoutAccount(
    user: ContactSelfInterface,
    source: string
): Promise<void> {
    const aid = crypto
        .createHash("md5")
        .update(`${user.name()}-WeCom`)
        .digest("hex");
    const account = await Account.findOne({
        where: {
            id: aid,
            source,
        },
    });
    if (account) {
        account.status = "offline";
        await account.save();

        logger.info(`User [${user.name()}] logged out`);
    } else {
        logger.error(`Account [${aid}] not found`);
    }
}
