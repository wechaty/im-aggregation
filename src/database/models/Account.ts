import { Sequelize, DataTypes, Model } from "sequelize";
import db from "../db";

class Account extends Model {
    declare id: string;
    declare status: string;
    declare source: string;
    declare loginAt: Date;
    declare createdAt: Date;
    declare updatedAt: Date;
}

Account.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        source: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        loginAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    { sequelize: db }
);

export default Account;
