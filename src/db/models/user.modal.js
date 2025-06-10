import { sequelize } from '../Database.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import { DataTypes } from 'sequelize';

dotenv.config({ path: './.env' });

const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    profile_image: {
        type: DataTypes.STRING, 
        allowNull: true,
    },
}, {
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

User.prototype.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

User.prototype.generateAccessToken = function () {
    return jwt.sign(
        { _id: this.id, email: this.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

User.prototype.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this.id, email: this.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export { User };
