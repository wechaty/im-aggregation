import BaseAdapter from "../adapters/Adapter";
import {
    getAllConfigurations,
    setConfiguration,
} from "../database/impl/configuration";
import { FilterType, SimpleAccountProfile } from "../schema/types";
import Extension from "./Extension";

export default class FilterExtension extends Extension {
    constructor(adapter: BaseAdapter) {
        super(
            adapter,
            "Filter Extension",
            "Manage filters for IM aggregation."
        );
    }

    setFilterType() {
        const handle = async (type: string) => {
            const config = getAllConfigurations();
            if (!["blacklist", "whitelist", "none"].includes(type))
                type = "none";
            config.filter = type as FilterType;
            setConfiguration(config);
            this.adapter.bot.say(`Filter type set to ${type}`);
        };
        return {
            name: "Set Filter Type",
            description: "Set filter type.",
            shortcut: "filter",
            handle,
        };
    }

    appendBlacklist() {
        const handle = async (alias: string) => {
            const contact = await this.adapter.bot.Contact.find({ alias });
            if (!contact) {
                this.adapter.bot.say(`No contact found for alias ${alias}`);
                return;
            }
            const config = getAllConfigurations();
            const profile: SimpleAccountProfile = {
                source: this.adapter.profile.source,
                id: contact.id,
                name: contact.name(),
                alias,
            };
            config.blacklist.push(profile);
            setConfiguration(config);
            await this.adapter.bot.say(`Added ${profile.name} to blacklist`);
        };
        return {
            name: "Append Blacklist",
            description: "Append a user to blacklist.",
            shortcut: "ab",
            handle,
        };
    }

    removeBlacklist() {
        const handle = async (alias: string) => {
            const config = getAllConfigurations();
            const index = config.blacklist.findIndex(
                (p) =>
                    p.source === this.adapter.profile.source &&
                    p.alias === alias
            );
            if (index === -1) {
                this.adapter.bot.say(`No contact found for alias ${alias}`);
                return;
            }
            config.blacklist.splice(index, 1);
            setConfiguration(config);
            await this.adapter.bot.say(`Removed ${alias} from blacklist`);
        };
        return {
            name: "Remove Blacklist",
            description: "Remove a user from blacklist.",
            shortcut: "rb",
            handle,
        };
    }

    appendWhitelist() {
        const handle = async (alias: string) => {
            const contact = await this.adapter.bot.Contact.find({ alias });
            if (!contact) {
                this.adapter.bot.say(`No contact found for alias ${alias}`);
                return;
            }
            const config = getAllConfigurations();
            const profile: SimpleAccountProfile = {
                source: this.adapter.profile.source,
                id: contact.id,
                name: contact.name(),
                alias,
            };
            config.whitelist.push(profile);
            setConfiguration(config);
            await this.adapter.bot.say(`Added ${profile.name} to whitelist`);
        };
        return {
            name: "Append Whitelist",
            description: "Append a user to whitelist.",
            shortcut: "aw",
            handle,
        };
    }

    removeWhitelist() {
        const handle = async (alias: string) => {
            const config = getAllConfigurations();
            const index = config.whitelist.findIndex(
                (p) =>
                    p.source === this.adapter.profile.source &&
                    p.alias === alias
            );
            if (index === -1) {
                this.adapter.bot.say(`No contact found for alias ${alias}`);
                return;
            }
            config.whitelist.splice(index, 1);
            setConfiguration(config);
            await this.adapter.bot.say(`Removed ${alias} from whitelist`);
        };
        return {
            name: "Remove Whitelist",
            description: "Remove a user from whitelist.",
            shortcut: "rw",
            handle,
        };
    }

    async register() {
        this.adapter.registerCommand(this.setFilterType());
        this.adapter.registerCommand(this.appendBlacklist());
        this.adapter.registerCommand(this.removeBlacklist());
        this.adapter.registerCommand(this.appendWhitelist());
        this.adapter.registerCommand(this.removeWhitelist());
    }
}
