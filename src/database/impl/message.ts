import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import { MessageInterface } from "wechaty/impls";
import { generateMsgFileName } from "../../utils/helper";
import log4js from "../../utils/logger";
import Message from "../models/Message";

const logger = log4js.getLogger("db-message");
const downloadsFolder = process.env.DOWNLOADS_FOLDER || "downloads";
/**
 *
 * @param msg MessageInterface
 * @return Promise<string> local image path
 * extract the image file from the message
 */
async function extractFile(msg: MessageInterface): Promise<string> {
    const fileBox = await msg.toFileBox();
    const fileName = await generateMsgFileName(msg, fileBox);
    const filePath = path.join(downloadsFolder, fileName);
    if (!fs.existsSync(filePath)) fileBox.toFile(filePath);
    return filePath;
}
// /**
//  *
//  * @param msg
//  * @param aid
//  * @param source
//  */
// export async function saveMessage(
//     msg: MessageInterface,
//     aid: string,
//     source: string
// ): Promise<void> {
//     try {
//         const buildOpt = {
//             type: msg.type(),
//             talker: msg.talker()?.name(),
//             listener: msg.listener()?.name(),
//             content: msg.text(),
//             sentAt: msg.date(),
//             aid,
//             source,
//         };

//         const message = Message.build(buildOpt);

//         switch (buildOpt.type) {
//             case MessageType.Text:
//                 break;
//             case MessageType.Image:
//             case MessageType.Attachment:
//             case MessageType.Emoticon:
//             case MessageType.Audio:
//                 const filePath = await extractFile(msg);
//                 message.attachment = filePath;
//                 message.content = JSON.stringify(
//                     xml2Obj(message.content),
//                     null,
//                     2
//                 );
//                 break;
//             case MessageType.Url:
//                 const url = await msg.toUrlLink();
//                 message.attachment = JSON.stringify(url.payload);
//                 break;
//             default:
//                 break;
//         }
//         await message.save();

//         logger.info(`Message ${message.id} saved`);
//     } catch (error) {
//         logger.error("Save message error:", error);
//     }
// }

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
