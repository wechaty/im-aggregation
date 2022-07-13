/**
 * 这是插件的基类，所有插件都应该继承这个类。
 * 插件不提供持久化功能，所以插件的数据都会在每次重新加载时丢失。
 * 一个适配器可以有多个插件（extension），每个插件可以提供多个指令（command）
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
