import { Op } from "sequelize";
import Message from "../models/Message";
import { getAllConfigurations } from "./configuration";

export async function saveMessage(payload: Omit<any, string>) {
    return Message.create(payload);
}

export async function getMessagesWithinPeriod(
    startTime: Date,
    endTime: Date
): Promise<Message[]> {
    const config = getAllConfigurations();
    const messages = await Message.findAll({
        where: {
            sentAt: {
                [Op.between]: [startTime, endTime],
            },
        },
        limit: config.forwardMessageLimit, // test
    });
    return messages;
}
