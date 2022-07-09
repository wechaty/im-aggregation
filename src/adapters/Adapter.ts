import QRCode from "qrcode";
import { Sayable, ScanStatus } from "wechaty";
import {
    ContactSelfInterface,
    MessageInterface,
    WechatyInterface,
} from "wechaty/impls";
import { loginAccount, logoutAccount } from "../database/impl/account";
import Message from "../database/models/Message";
import Extension from "../extensions/Extension";
import { Command, MessageType, Profile } from "../schema/types";
import { isNullOrEmpty } from "../utils/helper";
import log4js from "../utils/logger";
import EventEmitter from "events";

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

    async batchSay(messages: Sayable[]): Promise<void> {
        for (const message of messages) {
            await this.bot.say(message).catch(this.logger.error);
        }
    }

    async forwardMessages(messages: Message[]) {
        const sayableMessages = this.convertMessagesToSayable(messages);

        await this.batchSay(sayableMessages);
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
        if (self && message.type() === MessageType.Text) {
            const str = message.text();
            const [cmd, ...args] = str.split(" ");
            this.invokeCommand(cmd, ...args);
            return;
        }
        this.saveMessage(message);
    }

    private async heatBeatHandler(data: any): Promise<void> {
        // this.logger.trace(data);
    }

    private async errorHandler(error: Error): Promise<void> {
        this.logger.error(error);
    }

    convertMessagesToSayable(messages: Message[]): Sayable[] {
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
}
