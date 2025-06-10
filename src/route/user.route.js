import { Router } from "express";
import { RegisterUser, loginUser , testing , GetCurrentUser } from "../controllers/user.controler.js";
import { verifyJwtUser } from '../middleware/Auth.midelware.js'
import { upload } from "../middleware/Multer.midelware.js";
const router = Router();
router.route("/signup").post(upload.single("profile_image"), RegisterUser);
router.route("/login").post(loginUser);
router.route("/testing").get(testing);
router.route("/current-user").get(verifyJwtUser, GetCurrentUser);



export default router; 
