import QRCode from "qrcode";
import { Contact, Sayable, ScanStatus } from "wechaty";
import {
    ContactSelfInterface,
    MessageInterface,
    WechatyInterface,
} from "wechaty/impls";
import { loginAccount, logoutAccount } from "../database/impl/account";
import Message from "../database/models/Message";
import Extension from "../extensions/Extension";
import { Command, FilterType, MessageType, Profile } from "../schema/types";
import { isNullOrEmpty } from "../utils/helper";
import log4js from "../utils/logger";
import EventEmitter from "events";
import { getAllConfigurations } from "../database/impl/configuration";

const downloadsFolder = process.env.DOWNLOADS_FOLDER || "downloads";

export default class BaseAdapter extends EventEmitter {
    profile: Profile;
    bot: WechatyInterface;
    logger: log4js.Logger;
    downloadsFolder: string = downloadsFolder;
    _commands: { [key: string]: Command } = {};
    _extensions: { [key: string]: Extension } = {};

    constructor(bot: WechatyInterface) {
        super();
        this.bot = bot;
        this.profile = {
            source: this.constructor.name.replace("Adapter", ""),
        };
        this.logger = log4js.getLogger(`${this.constructor.name}`);
        this.attachListeners();
    }

    attachListeners(): BaseAdapter {
        this.bot.on("scan", this.scanHandler.bind(this));
        this.bot.on("error", this.errorHandler.bind(this));
        this.bot.on("login", this.loginHandler.bind(this));
        this.bot.on("logout", this.logoutHandler.bind(this));
        this.bot.on("message", this.messageHandler.bind(this));
        this.bot.on("heartbeat", this.heatBeatHandler.bind(this));
        return this;
    }

    async start(): Promise<BaseAdapter> {
        await this.bot.start();
        this.logger.info("Bot started");
        return this;
    }

    async batchSay(messages: Sayable[], contact?: Contact): Promise<void> {
        for (const message of messages) {
            if (contact) {
                await contact.say(message).catch(this.logger.error);
            } else {
                await this.bot.say(message).catch(this.logger.error);
            }
        }
    }

    async forwardMessages(messages: Message[]) {
        const config = getAllConfigurations();
        const target = await this.bot.Contact.find({ id: config.target.id });
        if (!target) {
            this.logger.error("Target contact not found");
            return;
        }
        const sayableMessages = await this.convertMessagesToSayable(messages);

        await this.batchSay(sayableMessages, target);
    }

    private scanHandler(qrcode: string, status: ScanStatus): void {
        this.logger.log(`Scan QR Code to login: ${status}`);

        switch (status) {
            case ScanStatus.Waiting:
            case ScanStatus.Timeout:
                if (isNullOrEmpty(qrcode)) break;

                QRCode.toFile(
                    `output/${this.profile.source}-${new Date().getTime()}.png`,
                    qrcode
                );
                this.logger.log(
                    `Scan Status: QRCode image saved in output/${this.profile.source}.png.`
                );
                break;
            case ScanStatus.Scanned:
                this.logger.log("Scan Status: Scanned");
                break;
            case ScanStatus.Confirmed:
                this.logger.log("Scan Status: Confirmed");
                break;
            default:
                this.logger.log("Scan Status: Unknown");
                break;
        }
    }

    private async loginHandler(user: ContactSelfInterface): Promise<void> {
        const aid = await loginAccount(user, this.profile.source);
        this.profile.id = aid;
        this.bot.say(`[${new Date().toLocaleString()}] Login Successfully!`);
    }

    private async logoutHandler(user: ContactSelfInterface): Promise<void> {
        logoutAccount(user, this.profile.source);
    }

    private async messageHandler(message: MessageInterface): Promise<void> {
        const self = message.talker().self() && message.listener()?.self();
        if (self) {
            switch (message.type()) {
                case MessageType.Text:
                    const str = message.text();
                    const [cmd, ...args] = str.split(" ");
                    this.invokeCommand(cmd, ...args);
                    return;
                case MessageType.Contact:
                    // Forward contact to yourself to set messages aggregation target accout.
                    const contact = await message.toContact();
                    await this.invokeCommand("setfta", contact);
                    return;
                default:
                    break;
            }
        }
        if (!this.filter(message)) {
            return;
        }
        this.emit("message", message);
        this.saveMessage(message);
    }

    private async heatBeatHandler(data: any): Promise<void> {
        // this.logger.trace(data);
    }

    private async errorHandler(error: Error): Promise<void> {
        this.logger.error(error);
    }

    async convertMessagesToSayable(messages: Message[]): Promise<Sayable[]> {
        throw new Error("Not implemented");
    }

    saveMessage(message: MessageInterface): void {
        throw new Error("Not implemented");
    }

    public loadExtension(ext: Extension) {
        if (this._extensions[ext.name]) {
            throw new Error(`Extension ${ext.name} already exists.`);
        }
        this._extensions[ext.name] = ext;
        ext.register();
    }

    public unregisertExtension(ext: Extension) {
        delete this._extensions[ext.name];
    }

    public registerCommand(cmd: Command) {
        // shortcut should be unique
        if (this._commands.hasOwnProperty(cmd.shortcut)) {
            throw new Error(`Command ${cmd.shortcut} already exists`);
        }
        this._commands[cmd.shortcut] = cmd;
    }

    public async invokeCommand(shortcut: string, ...args: any[]) {
        if (this._commands[shortcut]) {
            await this._commands[shortcut].handle(...args);
        }
    }

    public filter(message: MessageInterface) {
        const config = getAllConfigurations();
        switch (config.filter) {
            case FilterType.blacklist:
                return config.blacklist.findIndex(
                    (a) =>
                        a.source === this.profile.source &&
                        a.id === message.talker().id
                ) > -1
                    ? null
                    : message;
            case FilterType.whitelist:
                return config.whitelist.findIndex(
                    (a) =>
                        a.source === this.profile.source &&
                        a.id === message.talker().id
                ) > -1
                    ? message
                    : null;
            default:
                break;
        }
        return message;
    }
}
