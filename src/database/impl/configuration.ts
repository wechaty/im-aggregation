import { Configuration } from "../../schema/types";
import localCache from "../localcache";

export function setConfiguration(newConfig: Configuration) {
    // handle foo.bar case
    localCache.data = { ...localCache.data, ...newConfig };
    localCache.write();
}

export function getAllConfigurations() {
    const config = localCache.read();
    return config;
}
