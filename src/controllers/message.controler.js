import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../db/models/message.model.js";
import { io } from "../../app.js";
import { Op, Sequelize } from 'sequelize';
import { User } from "../db/models/user.modal.js";
const sendMessage = asyncHandler(async (req, res) => {
  const { sender_id, receiver_id, text } = req.body;
  if (!sender_id || !receiver_id || !text) {
    throw new ApiError(400, "sender_id, receiver_id, and text are required");
  }
  const message = await Message.create({
    sender_id,
    receiver_id,
    text,
    timestamp: new Date()
  });
  const fullMessage = await Message.findOne({
    where: { id: message.id },
    include: [
      { model: User, as: 'sender', attributes: ['id', 'email', 'profile_image'] },
      { model: User, as: 'receiver', attributes: ['id', 'email', 'profile_image'] }
    ]
  });
  io.to(String(sender_id)).emit('receive_message', fullMessage);
  io.to(String(receiver_id)).emit('receive_message', fullMessage);

  return res.status(201).json(
    new ApiResponse(201, fullMessage, "Message sent successfully")
  );
});
const getMessages = asyncHandler(async (req, res) => {
  const { sender_id, receiver_id } = req.query;

  if (!sender_id || !receiver_id) {
    throw new ApiError(400, "sender_id and receiver_id are required");
  }

  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { sender_id, receiver_id },
        { sender_id: receiver_id, receiver_id: sender_id }
      ]
    },
    order: [['timestamp', 'ASC']],
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'email', 'profile_image'],
      },
      {
        model: User,
        as: 'receiver',
        attributes: ['id', 'email', 'profile_image'],
      }
    ]
  });
  io.emit
  return res.status(200).json(
    new ApiResponse(200, messages, "Chat history fetched successfully")
  );
});
const getAllMessagesLastMessage = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const latestPerConversation = await Message.findAll({
    where: {
      [Op.or]: [
        { sender_id: userId },
        { receiver_id: userId }
      ]
    },
    attributes: [
      [Sequelize.literal(`CASE 
        WHEN sender_id = ${userId} THEN receiver_id 
        ELSE sender_id 
      END`), 'conversation_with'],
      [Sequelize.fn('MAX', Sequelize.col('timestamp')), 'last_timestamp'],
    ],
    group: ['conversation_with'],
    raw: true,
  });

  const lastMessages = await Promise.all(
    latestPerConversation.map(async ({ conversation_with, last_timestamp }) => {
      return await Message.findOne({
        where: {
          [Op.or]: [
            { sender_id: userId, receiver_id: conversation_with },
            { sender_id: conversation_with, receiver_id: userId }
          ],
          timestamp: last_timestamp
        },
        order: [['timestamp', 'DESC']],
        include: [
          { model: User, as: 'sender', attributes: ['id', 'email', 'profile_image'] },
          { model: User, as: 'receiver', attributes: ['id', 'email', 'profile_image'] }
        ]
      });
    })
  );

  return res.status(200).json(
    new ApiResponse(200, lastMessages.filter(Boolean), "Last messages per conversation fetched successfully")
  );
});

export {
  sendMessage,
  getMessages,
  getAllMessagesLastMessage
};
