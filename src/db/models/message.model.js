import { sequelize } from '../Database.js';
import { DataTypes } from 'sequelize';

const Message = sequelize.define('messages', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'messages',
});

export { Message };
