import { Sequelize, DataTypes, Model } from "sequelize";
import db from "../db";

class Message extends Model {
    declare id: number;
    declare aid: string;
    declare talker: string;
    declare listener: string;
    declare content: string;
    declare type: number;
    declare source: string;
    declare sentAt: Date;
    declare attachment: string;
    declare createdAt: Date;
    declare updatedAt: Date;
}

Message.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        aid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        talker: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        listener: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        source: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        attachment: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        sentAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    { sequelize: db }
);

export default Message;
