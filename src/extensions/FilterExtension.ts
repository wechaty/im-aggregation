import BaseAdapter from "../adapters/Adapter";
import {
    getAllConfigurations,
    setConfiguration,
} from "../database/impl/configuration";
import { FilterType } from "../schema/types";
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

    async register() {
        this.adapter.registerCommand(this.setFilterType());
    }
}
