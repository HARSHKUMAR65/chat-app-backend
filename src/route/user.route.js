import { Router } from "express";
import { RegisterUser, loginUser , testing , GetCurrentUser } from "../controllers/user.controler.js";
import { verifyJwtUser } from '../middleware/Auth.midelware.js'
import {
  sendMessage,
  getMessages,
  getAllMessagesLastMessage
} from "../controllers/message.controler.js";
const router = Router();
router.route("/signup").post(RegisterUser);
router.route("/login").post(loginUser);
router.route("/testing").get(testing);
router.route("/current-user").get(verifyJwtUser, GetCurrentUser);

router.route("/message").post( sendMessage);
router.route("/messages").get( getMessages);
router.route("/last-messages").get(verifyJwtUser, getAllMessagesLastMessage);



export default router; 
