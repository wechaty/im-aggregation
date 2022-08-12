import { Sequelize } from "sequelize";
import Log from "../utils/logger";

const logger = new Log("DB");

const db = new Sequelize({
    dialect: "sqlite",
    storage: "src/database/data.sqlite",
    logging: () => {},
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
