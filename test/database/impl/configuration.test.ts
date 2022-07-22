import { equal } from "assert";
import { getAllConfigurations, setConfiguration } from "../../../src/database/impl/configuration";

describe("setConfiguration Function", () => {
    const oldConfig = getAllConfigurations();
    context("when given a valid configuration", () => {
        it("should set the configuration", () => {
            oldConfig.aggregation.startTime = "16:00";
            setConfiguration(oldConfig);
            const config = getAllConfigurations();
            equal(config.aggregation.startTime, "16:00");
        });
    });
});

describe("getAllConfigurations Function", () => {
    context("configuration should be a object with configuration type", () => {
        const config = getAllConfigurations();
        it("config should be a object", () => {
            equal(typeof config, "object");
        });
        it("config.aggregation should be a object.", () => {
            equal(typeof config.aggregation, "object");
        });
        it("config.target should be a object.", () => {
            equal(typeof config.target, "object");
        });
        it("config.forwardTime should be a string.", () => {
            equal(typeof config.forwardTime, "string");
        });
        it("config.blacklist should be a array.", () => {
            equal(Array.isArray(config.blacklist), true);
        });
        it("config.whitelist should be a array.", () => {
            equal(Array.isArray(config.whitelist), true);
        });
        it("config.filter should be a string.", () => {
            equal(
                ["none", "blacklist", "whitelist"].includes(config.filter),
                true
            );
        });
        it("config.forwardMessageLimit should be a number.", () => {
            equal(typeof config.forwardMessageLimit, "number");
        });
    });
});
