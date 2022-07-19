import BaseAdapter from "../adapters/Adapter";
import {
    getAllConfigurations,
    setConfiguration
} from "../database/impl/configuration";
import intl from "../i18n/translation";
import { Command } from "../schema/types";
import { extractTimeString } from "../utils/helper";
import Extension from "./Extension";

export default class BaseExtension extends Extension {
    constructor(adapter: BaseAdapter) {
        super(
            adapter,
            intl.t("baseExtension"),
            intl.t("baseExtensionDescription")
        );
    }

    showCommands(): Command {
        const handle = async () => {
            const commands = this.adapter._commands;
            const msgBundle: string[] = [];
            msgBundle.push(
                intl.t("commandCountHint", {
                    len: Object.keys(commands).length,
                })
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
            name: intl.t("showCommand"),
            description: intl.t("showCommandDescription"),
            shortcut: "sc",
            handle,
        };
    }

    showExtensions(): Command {
        const handle = async () => {
            const extensions = this.adapter._extensions;
            const msgBundle: string[] = [];
            msgBundle.push(
                intl.t("extensionCountHint", {
                    len: Object.keys(extensions).length,
                })
            );
            for (const name in extensions) {
                const extension = extensions[name];
                msgBundle.push(`${extension.name} - ${extension.description}`);
            }
            await this.adapter.batchSay(msgBundle);
        };

        return {
            name: intl.t("showExtension"),
            description: intl.t("showExtensionDescription"),
            shortcut: "se",
            handle,
        };
    }

    showInfomation(): Command {
        const handle = async () => {
            const configs = getAllConfigurations();
            const msgBundle = [];

            msgBundle.push(
                intl.t("adapterInfo", {
                    source: this.adapter.profile.source,
                })
            );
            msgBundle.push(
                intl.t("baseExtensionForwardTime", {
                    forwardTime: configs.forwardTime,
                })
            );
            msgBundle.push(
                intl.t("baseExtensionForwardTarget", {
                    targetSource: configs.target.source,
                    name: configs.target.name,
                })
            );

            await this.adapter.batchSay(msgBundle);
        };

        return {
            name: intl.t("showInfomation"),
            description: intl.t("showInfomationDescription"),
            shortcut: "si",
            handle,
        };
    }

    logoutCommand(): Command {
        const handle = async () => {
            await this.adapter.bot.logout();
        };

        return {
            name: intl.t("logout"),
            description: intl.t("logoutDescription"),
            shortcut: "lo",
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
                this.adapter.bot.say(
                    intl.t("forwardTimeSet", { hour, minute })
                );
                this.adapter.emit("updateScheduleJob", { hour, minute });
            } catch (error) {
                this.adapter.bot.say(intl.t("invalidTimeFormat"));
            }
        };
        return {
            name: intl.t("setForwardTime"),
            description: intl.t("setForwardTimeDescription"),
            shortcut: "setft",
            handle,
        };
    }

    setForwardTargetAccount(): Command {
        const handle = async (alias: string) => {
            const targetContact = await this.adapter.bot.Contact.find({
                alias,
            });
            if (!targetContact) {
                await this.adapter.bot.say(
                    intl.t("aliasContactNotFound", { alias: alias })
                );
                return;
            }
            const config = getAllConfigurations();
            config.target = {
                source: this.adapter.profile.source,
                id: targetContact.id,
                name: targetContact.name(),
                alias,
            };
            setConfiguration(config);

            await this.adapter.bot.say(targetContact);
        };
        return {
            name: intl.t("setForwardTargetAccount"),
            description: intl.t("setForwardTargetAccountDescription"),
            shortcut: "setfta",
            handle,
        };
    }

    register() {
        this.adapter.registerCommand(this.showCommands());
        this.adapter.registerCommand(this.showExtensions());
        this.adapter.registerCommand(this.showInfomation());
        this.adapter.registerCommand(this.logoutCommand());
        this.adapter.registerCommand(this.setForwardTime());
        this.adapter.registerCommand(this.setForwardTargetAccount());
    }
}
