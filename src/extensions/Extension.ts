/**
 *  This is the base class of the plugin, all plugins should inherit this class.
 *  The plugin does not provide persistence, so the plugin's data will be lost every time it is reloaded.
 *  An adapter can have multiple plugins (extension), each of which can provide multiple commands.
 */

import BaseAdapter from "../adapters/Adapter";

export default class Extension {
    adapter: BaseAdapter;
    name: string;
    description: string;
    constructor(adapter: BaseAdapter, name: string, description: string) {
        this.adapter = adapter;
        this.name = name;
        this.description = description;
    }

    register() {
        throw new Error("Extension handler not implemented");
    }
}
