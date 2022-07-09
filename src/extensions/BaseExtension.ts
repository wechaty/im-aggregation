import BaseAdapter from "../adapters/Adapter";
import {
    getAllConfigurations,
    setConfiguration,
} from "../database/impl/configuration";
import { Command, FilterType } from "../schema/types";
import { extractTimeString } from "../utils/helper";
import Extension from "./Extension";

export default class BaseExtension extends Extension {
    constructor(adapter: BaseAdapter) {
        super(
            adapter,
            "Base Extension",
            "This is a base extension for Wechaty. It provides some basic commands."
        );
    }

    showCommands(): Command {
        const handle = async () => {
            const commands = this.adapter._commands;
            const msgBundle: string[] = [];
            msgBundle.push(
                `You have ${Object.keys(commands).length} commands registered.`
            );
            for (const name in commands) {
                const command = commands[name];
                msgBundle.push(
                    `${command.name} - [${command.shortcut}] - ${command.description}`
                );
            }
            await this.adapter.batchSay(msgBundle);
        };
        return {
            name: "Show Commands",
            description: "Show all commands registered in Wechaty.",
            shortcut: "sc",
            handle,
        };
    }

    showExtensions(): Command {
        const handle = async () => {
            const extensions = this.adapter._extensions;
            const msgBundle: string[] = [];
            msgBundle.push(
                `You have ${
                    Object.keys(extensions).length
                } extensions registered.`
            );
            for (const name in extensions) {
                const extension = extensions[name];
                msgBundle.push(`${extension.name} - ${extension.description}`);
            }
            await this.adapter.batchSay(msgBundle);
        };

        return {
            name: "Show Extensions",
            description: "Show all extensions registered in Wechaty.",
            shortcut: "se",
            handle,
        };
    }

    showInfomation(): Command {
        const handle = async () => {
            const configs = getAllConfigurations();
            const msgBundle = [];
            msgBundle.push(`Adapter: ${this.adapter.profile.source}`);
            msgBundle.push(`Forward time: ${configs.forwardTime}`);
            msgBundle.push(`Forward target source: ${configs.targetSource}`);
            msgBundle.push(`Forward target account id: ${configs.targetId}`);

            await this.adapter.batchSay(msgBundle);
        };

        return {
            name: "Show Infomation",
            description: "Show infomation of IM aggregation.",
            shortcut: "si",
            handle,
        };
    }

    logoutCommand(): Command {
        const handle = async () => {
            await this.adapter.bot.logout();
        };

        return {
            name: "Logout",
            description: "Logout from Wechaty.",
            shortcut: "lo",
            handle,
        };
    }

    setCommand(): Command {
        const handle = async () => {
            this.adapter.bot.say("Not implemented yet.");
        };
        return {
            name: "Set Configuration",
            description: "Set configuration.",
            shortcut: "set",
            handle,
        };
    }

    setForwardTime(): Command {
        const handle = async (time: string) => {
            try {
                const { hour, minute } = extractTimeString(time);
                const config = getAllConfigurations();
                config.forwardTime = `${hour}:${minute}`;
                setConfiguration(config);
                this.adapter.bot.say(`Forward time set to ${hour}:${minute}`);
            } catch (error) {
                this.adapter.bot.say("Invalid time format.");
            }
        };
        return {
            name: "Set Forward Time",
            description: "Set forward time.",
            shortcut: "setft",
            handle,
        };
    }

    setForwardTargetAccount(): Command {
        const handle = async (targetAccount: string) => {
            const targetContact = await this.adapter.bot.Contact.find({
                alias: targetAccount,
            });
            if (!targetContact) {
                this.adapter.bot.say(`${targetAccount} not found.`);
                return;
            }
            const config = getAllConfigurations();
            config.targetId = targetContact.id;
            config.targetSource = this.adapter.profile.source;
            setConfiguration(config);

            this.adapter.bot.say(targetContact);
        };
        return {
            name: "Set Forward Target Account",
            description: "Set forward target account.",
            shortcut: "setfta",
            handle,
        };
    }

    register() {
        this.adapter.registerCommand(this.showCommands());
        this.adapter.registerCommand(this.showExtensions());
        this.adapter.registerCommand(this.showInfomation());
        this.adapter.registerCommand(this.logoutCommand());
        this.adapter.registerCommand(this.setCommand());
        this.adapter.registerCommand(this.setForwardTime());
        this.adapter.registerCommand(this.setForwardTargetAccount());
    }
}
