import { Sequelize } from "sequelize";
import log4js from "../utils/logger";

const logger = log4js.getLogger("db");

const db = new Sequelize({
    dialect: "sqlite",
    storage: "src/database/data.sqlite",
});

try {
    (async () => {
        await db.authenticate();
        logger.info("Connection has been established successfully.");
    })();
} catch (error) {
    logger.error("Unable to connect to the database:", error);
}

export default db;