import { createClient, RedisClientType } from "redis";
import Log from "./logger";

export class Redis {
    logger: Log;
    client: RedisClientType;
    constructor() {
        this.logger = new Log("Redis");
        this.client = createClient();
        this.init();
    }

    init(): void {
        this.client.on("error", this.errorHandler.bind(this));
    }

    errorHandler(err: Error): void {
        this.logger.error(err);
    }

    async connect(): Promise<void> {
        await this.client.connect();
    }

    async set(key: string, value: any): Promise<void> {
        await this.client.set(key, value);
    }

    async get(key: string): Promise<any> {
        return await this.client.get(key);
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async quit(): Promise<void> {
        await this.client.quit();
    }
    /**
     * @link https://github.com/redis/node-redis#pubsub
     * @returns {RedisClientType} a duplicate of the client
     */
    getSubscriber(): RedisClientType {
        return this.client.duplicate();
    }
}
