import BaseAdapter from "../adapters/Adapter";
import {
    getAllConfigurations,
    setConfiguration,
} from "../database/impl/configuration";
import intl from "../i18n/translation";
import { FilterType, SimpleAccountProfile } from "../schema/types";
import Extension from "./Extension";

export default class FilterExtension extends Extension {
    constructor(adapter: BaseAdapter) {
        super(
            adapter,
            intl.t("filterExtension"),
            intl.t("filterExtensionDescription")
        );
    }

    setFilterType() {
        const handle = async (type: string) => {
            const config = getAllConfigurations();
            if (!["blacklist", "whitelist", "none"].includes(type))
                type = "none";
            config.filter = type as FilterType;
            setConfiguration(config);
            this.adapter.bot.say(intl.t("filterTypeSetTo", { type }));
        };
        return {
            name: intl.t("setFilterType"),
            description: intl.t("setFilterTypeDescription"),
            shortcut: "filter",
            handle,
        };
    }

    appendBlacklist() {
        const handle = async (alias: string) => {
            const contact = await this.adapter.bot.Contact.find({ alias });
            if (!contact) {
                this.adapter.bot.say(intl.t("aliasContactNotFound", { alias }));
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
            await this.adapter.bot.say(intl.t("blacklistAppended", { alias }));
        };
        return {
            name: intl.t("appendBlacklist"),
            description: intl.t("appendBlacklistDescription"),
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
                this.adapter.bot.say(intl.t("aliasContactNotFound", { alias }));
                return;
            }
            config.blacklist.splice(index, 1);
            setConfiguration(config);
            await this.adapter.bot.say(intl.t("blacklistRemoved", { alias }));
        };
        return {
            name: intl.t("removeBlacklist"),
            description: intl.t("removeBlacklistDescription"),
            shortcut: "rb",
            handle,
        };
    }

    appendWhitelist() {
        const handle = async (alias: string) => {
            const contact = await this.adapter.bot.Contact.find({ alias });
            if (!contact) {
                this.adapter.bot.say(intl.t("aliasContactNotFound", { alias }));
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
            await this.adapter.bot.say(intl.t("whitelistAppended", { alias }));
        };
        return {
            name: intl.t("appendWhitelist"),
            description: intl.t("appendWhitelistDescription"),
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
                this.adapter.bot.say(intl.t("aliasContactNotFound", { alias }));
                return;
            }
            config.whitelist.splice(index, 1);
            setConfiguration(config);
            await this.adapter.bot.say(intl.t("whitelistRemoved", { alias }));
        };
        return {
            name: intl.t("removeWhitelist"),
            description: intl.t("removeWhitelistDescription"),
            shortcut: "rw",
            handle,
        };
    }

    setForwardMessageLimit() {
        const handle = async (limit: string) => {
            const config = getAllConfigurations();
            config.forwardMessageLimit = parseInt(limit);
            if (
                isNaN(config.forwardMessageLimit) ||
                config.forwardMessageLimit < 0 ||
                config.forwardMessageLimit > 100
            ) {
                this.adapter.bot.say(intl.t("invalidForwardMessageLimit"));
                return;
            }
            setConfiguration(config);
            this.adapter.bot.say(intl.t("forwardMessageLimitSetTo", { limit }));
        };
        return {
            name: intl.t("setForwardMessageLimit"),
            description: intl.t("setForwardMessageLimitDescription"),
            shortcut: "setfml",
            handle,
        };
    }

    async register() {
        this.adapter.registerCommand(this.setFilterType());
        this.adapter.registerCommand(this.appendBlacklist());
        this.adapter.registerCommand(this.removeBlacklist());
        this.adapter.registerCommand(this.appendWhitelist());
        this.adapter.registerCommand(this.removeWhitelist());
        this.adapter.registerCommand(this.setForwardMessageLimit());
    }
}
