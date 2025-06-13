import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../db/models/message.model.js";
import { io } from "../../app.js";
import { Op, Sequelize } from 'sequelize';

/**
 * Send a new message and broadcast it via socket.io
 */
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

  // Emit real-time update
  io.emit('newMessage', message);

  return res.status(201).json(
    new ApiResponse(201, message, "Message sent successfully")
  );
});

/**
 * Get all messages between two users (chat history)
 */
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
    order: [['timestamp', 'ASC']]
  });

  return res.status(200).json(
    new ApiResponse(200, messages, "Chat history fetched successfully")
  );
});

/**
 * Get the last message for each unique conversation involving the current user
 */
const getAllMessagesLastMessage = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Step 1: Get conversation list with latest timestamps
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

  // Step 2: Get actual messages
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
        order: [['timestamp', 'DESC']]
      });
    })
  );

  return res.status(200).json(
    new ApiResponse(200, lastMessages, "Last messages per conversation fetched successfully")
  );
});

export {
  sendMessage,
  getMessages,
  getAllMessagesLastMessage
};
