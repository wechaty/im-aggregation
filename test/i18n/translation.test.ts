import { equal } from "assert";
import intl from "../../src/i18n/translation";

describe("intl.t Function", () => {
    context("when given a valid key", () => {
        it("should return a string", () => {
            const key = "appendBlacklist";
            const msg = intl.t(key);
            equal(msg, "添加黑名单");
        });
    });
    context("when give a key with payload", () => {
        it("should return a string", () => {
            const key = "whitelistAppended";
            const msg = intl.t(key, {
                alias: "IM-Aggregation",
            });
            equal(msg, "白名单已添加：IM-Aggregation");
        });

        it("should return a string", () => {
            const key = "whitelistAppended";
            const msg = intl.t(key, {
                "alias": "{aaaa}",
                "aaaa": "IM-Aggregation",
            });
            equal(msg, "白名单已添加：IM-Aggregation");
        });
    });
    context("when given an invalid key", () => {
        it("should return the key", () => {
            const key = "invalid";
            const msg = intl.t(key);
            equal(msg, key);
        });
    });
});
