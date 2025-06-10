import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../db/models/message.model.js";
import { io } from "../../app.js";
import { Op } from 'sequelize';
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
  io.emit('newMessage', message);

  return res.status(201).json(new ApiResponse(201, message, "Message sent successfully"));
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
    order: [['timestamp', 'ASC']]
  });

  return res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

export { sendMessage, getMessages };
