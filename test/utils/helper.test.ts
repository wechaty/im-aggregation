import { equal } from "assert";
import { extractTimeString, isNullOrEmpty, parseTimeString } from "../../src/utils/helper";

describe("isNullOrEmpty Function", () => {
    context("when given a null value", () => {
        it("should return true when input is null", () => {
            equal(isNullOrEmpty(null), true);
        });
        it("should return true when input is undefined", () => {
            equal(isNullOrEmpty(undefined), true);
        });
        it("should return true when input is empty string", () => {
            equal(isNullOrEmpty(""), true);
        });
        it("should return true when input is empty array", () => {
            equal(isNullOrEmpty([]), true);
        });
        it("should return true when input is empty object", () => {
            equal(isNullOrEmpty({}), true);
        });
    });
    context("when given a non-null value", () => {
        it("should return false when input is not null or undefined or empty string or empty array or empty object", () => {
            equal(isNullOrEmpty("test"), false);
            equal(isNullOrEmpty(["test"]), false);
            equal(isNullOrEmpty({ test: "test" }), false);
        });
    });
});

describe("extractTimeString Function", () => {
    context("when given a valid time string", () => {
        it("should return a object with hour and minute", () => {
            const timeString = "16:00";
            const { hour, minute } = extractTimeString(timeString);
            equal(hour, "16");
            equal(minute, "00");
        });
    });
    context("when given an invalid time string", () => {
        it("should throw an error", () => {
            const timeString = "16:00";
            try {
                extractTimeString(timeString);
            } catch (error: any) {
                equal(error.message, "Invalid time string: 16:00");
            }
        });
    });
    context("when given a time string with invalid hour", () => {
        it("should throw an error", () => {
            const timeString = "24:00";
            try {
                extractTimeString(timeString);
            } catch (error: any) {
                equal(error.message, "Invalid time string: 24:00");
            }
        });
    });
    context("when given a time string with invalid minute", () => {
        it("should throw an error", () => {
            const timeString = "16:60";
            try {
                extractTimeString(timeString);
            } catch (error: any) {
                equal(error.message, "Invalid time string: 16:60");
            }
        });
    });
    context("when given a time string with invalid hour and minute", () => {
        it("should throw an error", () => {
            const timeString = "24:60";
            try {
                extractTimeString(timeString);
            } catch (error: any) {
                equal(error.message, "Invalid time string: 24:60");
            }
        });
    });
});

describe("parseTimeString Function", () => {
    context("when given a valid time string", () => {
        it("should return a date object", () => {
            const timeString = "16:00";
            const date = parseTimeString(timeString);
            equal(date.getHours(), 16);
            equal(date.getMinutes(), 0);
        });
    }).timeout(5000);
    context("when given an invalid time string", () => {
        it("should throw an error", () => {
            const timeString = "ab:00";
            try {
                parseTimeString(timeString);
            } catch (error: any) {
                equal(error.message, "Invalid time string: ab:00");
            }
        }).timeout(5000);
    }).timeout(5000);
    context("when given a time string with invalid hour", () => {
        it("should throw an error", () => {
            const timeString = "24:00";
            try {
                parseTimeString(timeString);
            } catch (error: any) {
                equal(error.message, "Invalid time string: 24:00");
            }
        }).timeout(5000);
    }).timeout(5000);
    context("when given a time string with invalid minute", () => {
        it("should throw an error", () => {
            const timeString = "16:60";
            try {
                parseTimeString(timeString);
            } catch (error: any) {
                equal(error.message, "Invalid time string: 16:60");
            }
        }).timeout(5000);
    }).timeout(5000);
    context("when given a time string with invalid hour and minute", () => {
        it("should throw an error", () => {
            const timeString = "24:60";
            try {
                parseTimeString(timeString);
            } catch (error: any) {
                equal(error.message, "Invalid time string: 24:60");
            }
        }).timeout(5000);
    }).timeout(5000);
}).timeout(5000);
