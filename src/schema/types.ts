import { Message } from "wechaty";
import BaseAdapter from "../adapters/Adapter";

export interface AdapterOptions {
    /**
     * The adapter's name.
     * @type {string}
     * @memberof AdapterOptions
     **/
    name: string;
}

export enum MessageType {
    Unknown = 0,

    Attachment = 1,
    Audio = 2,
    Contact = 3,
    ChatHistory = 4,
    Emoticon = 5,
    Image = 6,
    Text = 7,
    Location = 8,
    MiniProgram = 9,
    GroupNote = 10,
    Transfer = 11,
    RedEnvelope = 12,
    Recalled = 13,
    Url = 14,
    Video = 15,
    Post = 16,
}

export enum WechatPuppetType {
    Donut = "donut",
    Padlocal = "padlocal",
}

export const MessageTypeName = [
    "Unknown",
    "Attachment",
    "Audio",
    "Contact",
    "ChatHistory",
    "Emoticon",
    "Image",
    "Text",
    "Location",
    "MiniProgram",
    "GroupNote",
    "Transfer",
    "RedEnvelope",
    "Recalled",
    "Url",
    "Video",
    "Post",
];

export interface Command {
    name: string;
    shortcut: string;   // should be unique
    description: string;
    handle: (...args: any[]) => any;
}

export interface ContactQueryFilter {
    name?: string;
    alias?: string;
}

export interface AdapterMap {
    [key: string]: BaseAdapter;
}

export interface AggregationConfig {
    startTime: string;
    endTime: string;
}

export enum FilterType {
    blacklist = "blacklist",
    whitelist = "whitelist",
    none = "none",
}
export interface Configuration {
    [key: string]: string | any;
    aggregation: AggregationConfig;
    target: SimpleAccountProfile;
    forwardTime: string;
    blacklist: SimpleAccountProfile[];
    whitelist: SimpleAccountProfile[];
    filter: FilterType;
}

export interface Profile {
    id?: string;
    source: string;
}

export interface SimpleAccountProfile {
    source: string;
    id: string;
    name: string;
    alias: string;
}

export interface AdapterEventListener {
    message: (message: Message) => void;
}
