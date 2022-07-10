import { FileBox } from "file-box";
import fs from "fs";
import path from "path";
import { Sayable, WechatyBuilder } from "wechaty";
import { MessageInterface, WechatyInterface } from "wechaty/impls";
import * as DBMessage from "../database/impl/message";
import Message from "../database/models/Message";
import { MessageType, MessageTypeName } from "../schema/types";
import { generateMsgFileName } from "../utils/helper";
import { convertSilkToWav } from "../utils/voice";
import BaseAdapter from "./Adapter";

export default class WeComAdapter extends BaseAdapter {
    constructor() {
        const bot = WeComAdapter.Init();
        super(bot);
    }

    static Init(): WechatyInterface {
        const bot = WechatyBuilder.build({
            puppet: "wechaty-puppet-service",
            puppetOptions: {
                token: process.env.WECHATY_PUPPET_SERVICE_WECOM,
            },
        });
        return bot;
    }

    async convertMessagesToSayable(messages: Message[]): Promise<Sayable[]> {
        const msgBundle: Sayable[] = [];

        msgBundle.push(
            `[${this.profile.source}] You received ${messages.length} messages.`
        );
        for (const message of messages) {
            switch (message.type) {
                case MessageType.Text:
                    // TODO: Extension.
                    msgBundle.push(message.content);
                    break;
                case MessageType.Image:
                case MessageType.Attachment:
                    // case MessageType.Emoticon:
                    const fileBox = FileBox.fromFile(message.attachment);
                    msgBundle.push(fileBox);
                    break;
                case MessageType.Audio:
                    const voiceFileBox = FileBox.fromFile(message.attachment);
                    voiceFileBox.metadata = {
                        duration: 10,
                    };
                    msgBundle.push(voiceFileBox);
                    break;
                case MessageType.Url:
                    const urlLik = new this.bot.UrlLink(
                        JSON.parse(message.attachment)
                    );
                    msgBundle.push(urlLik);
                    break;
                default:
                    msgBundle.push(
                        `You received a ${
                            MessageTypeName[message.type]
                        } message`
                    );
                    break;
            }
        }
        return msgBundle;
    }

    async saveMessage(message: MessageInterface): Promise<void> {
        // TODO: Save message to database.
        // 要将微信的silk格式转为统一格式！
        const buildOpt = {
            type: message.type(),
            talker: message.talker()?.name(),
            listener: message.listener()?.name(),
            content: message.text(),
            sentAt: message.date(),
            aid: this.profile.id,
            source: this.profile.source,
            attachment: "",
        };

        switch (buildOpt.type) {
            case MessageType.Text:
                break;
            case MessageType.Image:
            case MessageType.Attachment:
            case MessageType.Video:
                const fileBox = await message.toFileBox();
                const fileName = await generateMsgFileName(message, fileBox);
                const filePath = path.join(this.downloadsFolder, fileName);
                if (!fs.existsSync(filePath)) fileBox.toFile(filePath);
                buildOpt.attachment = filePath;
                break;
            case MessageType.Emoticon:
                break;
            case MessageType.Url:
                const url = await message.toUrlLink();
                buildOpt.content = JSON.stringify(url.payload);
                buildOpt.attachment = url.payload.url;
                break;
            case MessageType.Audio:
                // const voiceFileBox = await message.toFileBox();
                // const voiceName = await generateMsgFileName(
                //     message,
                //     voiceFileBox
                // );
                // const voicePath = path.join(this.downloadsFolder, voiceName);
                // if (!fs.existsSync(voicePath)) voiceFileBox.toFile(voicePath);
                // buildOpt.attachment = await convertSilkToWav(voicePath);
                break;
            case MessageType.Unknown:
                // Unknown message type. Return directly.
                return;
            default:
                buildOpt.content = `You received a ${
                    MessageTypeName[buildOpt.type]
                } message.`;
                break;
        }

        await DBMessage.saveMessage(buildOpt);
    }
}
