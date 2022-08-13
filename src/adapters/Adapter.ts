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
import { isNullOrEmpty, waitFor } from "../utils/helper";
import Log from "../utils/logger";
import EventEmitter from "events";
import { getAllConfigurations } from "../database/impl/configuration";
import intl from "../i18n/translation";

const downloadsFolder = process.env.DOWNLOADS_FOLDER || "downloads";

export default class BaseAdapter extends EventEmitter {
    profile: Profile;
    bot: WechatyInterface;
    logger: Log;
    downloadsFolder: string = downloadsFolder;
    _commands: { [key: string]: Command } = {};
    _extensions: { [key: string]: Extension } = {};

    constructor(bot: WechatyInterface) {
        super();
        this.bot = bot;
        this.profile = {
            source: this.constructor.name.replace("Adapter", ""),
        };
        this.logger = new Log(`${this.constructor.name}`);
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

    async stop(): Promise<BaseAdapter> {
        const self = await this.bot.Contact.find({ id: this.profile.id });
        if (self) {
            await this.logoutHandler(self);
            this.logger.info("Account logged out");
        }
        await this.bot.logout();
        this.logger.info("Bot logout");
        return this;
    }

    /**
     * batch say messages to target contact
     * @param messages Messages to be sent
     * @param contact people to send messages to
     * @param interval interval between each message
     */
    async batchSay(
        messages: Sayable[],
        contact?: Contact,
        interval: number = 0
    ): Promise<void> {
        for (const message of messages) {
            if (contact) {
                await contact.say(message);
            } else {
                await this.bot.say(message);
            }
            await waitFor(interval);
        }
    }

    async forwardMessages(messages: Message[]) {
        const config = getAllConfigurations();
        const target = await this.bot.Contact.find({ id: config.target.id });
        if (!target) {
            this.logger.error("Target contact not found");
            return;
        }
        // make messages group by type
        const groupedMessages = messages.reduce((acc, cur) => {
            if (!acc[cur.source]) {
                acc[cur.source] = [];
            }
            acc[cur.source].push(cur);
            return acc;
        }, {} as { [key: string]: Message[] });

        for (const source in groupedMessages) {
            const msg = groupedMessages[source];
            const hint = intl.t("receiveMessageHint", {
                source,
                len: msg.length,
            }) as Sayable;
            try {
                const sayableMsg = await this.convertMessagesToSayable(msg);
                await this.batchSay([hint].concat(sayableMsg), target, 100);
            } catch (error) {
                this.logger.error(error);
            }
        }
    }

    scanHandler(qrcode: string, status: ScanStatus): void {
        this.logger.info(`Scan QR Code to login: ${status}`);

        switch (status) {
            case ScanStatus.Waiting:
            case ScanStatus.Timeout:
                if (isNullOrEmpty(qrcode)) break;

                QRCode.toFile(
                    `server/public/imgs/qrcode/${this.profile.source}.png`,
                    qrcode
                );
                this.logger.info(`QRCode: ${qrcode}`);
                this.logger.info(
                    `Scan Status: QRCode image saved in server/public/imgs/qrcode/${this.profile.source}.png.`
                );
                break;
            case ScanStatus.Scanned:
                this.logger.info("Scan Status: Scanned");
                break;
            case ScanStatus.Confirmed:
                this.logger.info("Scan Status: Confirmed");
                break;
            default:
                this.logger.info("Scan Status: Unknown");
                break;
        }
    }

    async loginHandler(user: ContactSelfInterface): Promise<void> {
        await loginAccount(user, this.profile.source);
        this.profile.id = user.id;
        this.bot.say(`[${new Date().toLocaleString()}] Login Successfully!`);
    }

    async logoutHandler(user: ContactSelfInterface | Contact): Promise<void> {
        return logoutAccount(user, this.profile.source);
    }

    async messageHandler(message: MessageInterface): Promise<void> {
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
        this.saveMessage(message).catch(this.logger.error);
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

    async saveMessage(message: MessageInterface): Promise<void> {
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
