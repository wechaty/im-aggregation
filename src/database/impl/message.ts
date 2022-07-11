import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import { MessageInterface } from "wechaty/impls";
import { generateMsgFileName } from "../../utils/helper";
import log4js from "../../utils/logger";
import Message from "../models/Message";

const logger = log4js.getLogger("db-message");
const downloadsFolder = process.env.DOWNLOADS_FOLDER || "downloads";

export async function saveMessage(
    payload: Omit<any, string>
) {
    return Message.create(payload);
}

export async function getMessagesWithinPeriod(
    startTime: Date,
    endTime: Date
): Promise<Message[]> {
    const messages = await Message.findAll({
        where: {
            sentAt: {
                [Op.between]: [startTime, endTime],
            },
        },
        limit: 10,  // test
    });
    return messages;
}
