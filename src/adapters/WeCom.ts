import { FileBox } from "file-box";
import fs from "fs";
import path from "path";
import { Sayable, WechatyBuilder } from "wechaty";
import { MessageInterface, WechatyInterface } from "wechaty/impls";
import * as DBMessage from "../database/impl/message";
import Message from "../database/models/Message";
import Qiniu from "../database/storage/Qiniu";
import Storage from "../database/storage/Storage";
import intl from "../i18n/translation";
import { MessageType, MessageTypeName } from "../schema/types";
import { generateMsgFileName, isNullOrEmpty } from "../utils/helper";
import { convertSilkToWav, getDuration } from "../utils/voice";
import BaseAdapter from "./Adapter";

export default class WeComAdapter extends BaseAdapter {
    storage: Storage;
    static Init(): WechatyInterface {
        const token = process.env.WECOM_TOKEN || "";

        if (isNullOrEmpty(token)) {
            throw new Error(
                "WeCom token type or token is not set. Please check your environment variables."
            );
        }

        const bot = WechatyBuilder.build({
            puppet: "wechaty-puppet-service",
            puppetOptions: {
                token,
            },
        });
        return bot;
    }

    constructor() {
        const bot = WeComAdapter.Init();
        super(bot);
        const storageType = process.env.STORAGE_TYPE || "";
        switch (storageType) {
            case "qiniu":
                this.storage = new Qiniu();
                break;
            default:
                throw new Error(
                    "Storage type is not set. Please check your environment variables."
                );
        }
    }

    override async convertMessagesToSayable(
        messages: Message[]
    ): Promise<Sayable[]> {
        const msgBundle: Sayable[] = [];

        for (const message of messages) {
            switch (message.type) {
                case MessageType.Text:
                    msgBundle.push(message.content);
                    break;
                case MessageType.Image:
                case MessageType.Video:
                case MessageType.Attachment:
                    const fileBox = FileBox.fromFile(
                        message.attachment,
                        message.content
                    );
                    msgBundle.push(fileBox);
                    break;
                case MessageType.Emoticon:
                    const remoteUrl = await this.storage.upload(
                        message.attachment
                    );
                    const emoticonFileBox = FileBox.fromUrl(remoteUrl);
                    msgBundle.push(emoticonFileBox);
                    break;
                case MessageType.Audio:
                    const voiceFileBox = FileBox.fromFile(
                        message.attachment,
                        `[${message.sentAt.getHours()}:${message.sentAt.getMinutes()}]-${
                            message.talker
                        }.wav`
                    );
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
                default:
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

    override async saveMessage(message: MessageInterface): Promise<void> {
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
                buildOpt.content = fileBox.name;
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
            case MessageType.Url:
                const url = await message.toUrlLink();
                buildOpt.content = JSON.stringify(url.payload);
                buildOpt.attachment = url.payload.url;
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
                buildOpt.content = voiceFileBox.name;
                break;
            case MessageType.Unknown:
            case MessageType.Recalled:
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
