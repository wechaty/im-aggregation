import { FileBox } from "file-box";
import fs from "fs";
import path from "path";
import { Sayable, WechatyBuilder, WechatyOptions } from "wechaty";
import PuppetPadlocal from "wechaty-puppet-padlocal";
import { MessageInterface, WechatyInterface } from "wechaty/impls";
import intl from "../i18n/translation";
import * as DBMessage from "../database/impl/message";
import Message from "../database/models/Message";
import {
    MessageType,
    MessageTypeName,
    WechatPuppetType,
} from "../schema/types";
import { generateMsgFileName, isNullOrEmpty } from "../utils/helper";
import { convertSilkToWav, getDuration } from "../utils/voice";
import BaseAdapter from "./Adapter";

export default class WeChatAdapter extends BaseAdapter {
    static Init(): WechatyInterface {
        let options: WechatyOptions;
        const type = process.env.WECHAT_TOKEN_TYPE;
        const token = process.env.WECHAT_TOKEN;

        if (isNullOrEmpty(type) || isNullOrEmpty(token)) {
            throw new Error(
                "WeChat token type or token is not set. Please check your environment variables."
            );
        }

        switch (type) {
            case WechatPuppetType.Donut:
                options = {
                    puppet: "wechaty-puppet-service",
                    puppetOptions: {
                        token,
                    },
                };
                break;
            case WechatPuppetType.Padlocal:
                options = {
                    puppet: new PuppetPadlocal({
                        token,
                    }),
                };
                break;
            default:
                throw new Error(
                    `WeChatAdapter: Init: Unknown WechatPuppetType: ${type}`
                );
        }

        return WechatyBuilder.build(options);
    }

    constructor() {
        const bot = WeChatAdapter.Init();
        super(bot);
    }

    async convertMessagesToSayable(messages: Message[]): Promise<Sayable[]> {
        const msgBundle: Sayable[] = [];

        msgBundle.push(
            intl.t("receiveMessageHint", {
                source: this.profile.source,
                len: messages.length,
            })
        );
        for (const message of messages) {
            switch (message.type) {
                case MessageType.Text:
                    // TODO: Extension.
                    msgBundle.push(message.content);
                    break;
                case MessageType.Image:
                case MessageType.Attachment:
                    const fileBox = FileBox.fromFile(message.attachment);
                    msgBundle.push(fileBox);
                    break;
                case MessageType.Emoticon:
                    const emoticonFileBox = FileBox.fromFile(
                        message.attachment
                    );
                    msgBundle.push(emoticonFileBox);
                    break;
                case MessageType.Audio:
                    const voiceFileBox = FileBox.fromFile(message.attachment);
                    const duration = await getDuration(message.attachment);
                    voiceFileBox.metadata = {
                        duration,
                    };
                    msgBundle.push(voiceFileBox);
                    break;
                case MessageType.Url:
                    const urlLik = new this.bot.UrlLink(
                        JSON.parse(message.content)
                    );
                    msgBundle.push(urlLik);
                    break;
                default: // Unknown message type.
                    msgBundle.push(
                        intl.t("receiveUnsupportedMessage", {
                            type: MessageTypeName[message.type],
                        })
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
                if (!fs.existsSync(filePath)) await fileBox.toFile(filePath);
                buildOpt.attachment = filePath;
                break;
            case MessageType.Emoticon:
                const emoticonFileBox = await message.toFileBox();
                const emoticonFileName = await generateMsgFileName(
                    message,
                    emoticonFileBox
                );
                const emoticonFilePath = path.join(
                    this.downloadsFolder,
                    emoticonFileName.replace(
                        path.extname(emoticonFileName),
                        ".gif"
                    )
                );
                if (!fs.existsSync(emoticonFilePath))
                    await emoticonFileBox.toFile(emoticonFilePath);
                buildOpt.attachment = emoticonFilePath;
                break;
            case MessageType.Audio:
                const voiceFileBox = await message.toFileBox();
                const voiceName = await generateMsgFileName(
                    message,
                    voiceFileBox
                );
                const voicePath = path.resolve(this.downloadsFolder, voiceName);
                if (!fs.existsSync(voicePath))
                    await voiceFileBox.toFile(voicePath);
                buildOpt.attachment = await convertSilkToWav(voicePath);
                break;
            case MessageType.Url:
                const talkerType = message.talker().type();
                if (talkerType === this.bot.Contact.Type.Official) {
                    return;
                }
                const url = await message.toUrlLink();
                buildOpt.content = JSON.stringify(url.payload);
                buildOpt.attachment = url.payload.url;
                break;
            case MessageType.Unknown:
                // Unknown message type. Return directly.
                return;
            default:
                buildOpt.content = intl.t("receiveUnsupportedMessage", {
                    type: MessageTypeName[buildOpt.type],
                });
                break;
        }

        await DBMessage.saveMessage(buildOpt);
    }
}
