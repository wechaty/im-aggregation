import { ContactSelfInterface } from "wechaty/impls";
import Account from "../models/Account";
import Log from "../../utils/logger";

const logger = new Log("DB-Account");

export async function loginAccount(
    user: ContactSelfInterface,
    source: string
): Promise<void> {
    const [account] = await Account.findOrBuild({
        where: {
            id: user.id,
            source,
        },
        defaults: {
            id: user.id,
            name: user.name(),
            source,
        },
    });
    account.status = "online";
    account.loginAt = new Date();
    await account.save();

    logger.info(`${source} User [${user.name()}] logged in.`);
}

export async function getAccount(source: string) {
    const account = await Account.findOne({
        where: {
            source,
        },
        order: [["updatedAt", "DESC"]],
    });
    return account;
}

export async function logoutAccount(
    user: ContactSelfInterface,
    source: string
): Promise<void> {
    const account = await Account.findOne({
        where: {
            id: user.id,
            source,
        },
    });
    if (account) {
        account.status = "offline";
        await account.save();

        logger.info(`User [${user.name()}] logged out`);
    } else {
        logger.error(`Account [${user.id}] not found`);
    }
}
