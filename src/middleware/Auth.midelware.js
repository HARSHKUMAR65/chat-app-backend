import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../db/models/user.modal.js";
import dotenv from 'dotenv';
dotenv.config(
    {
        path: './.env'
    }
)
const verifyJwtUser = asyncHandler(async (req, res, next) => {
    
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized");
        }
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findOne({ where: { id: decodeToken._id } });
        if (!user) {
            throw new ApiError(401, "Invalid token");
        }
        req.user = user;
        next()
    } catch (error) {
        console.log(error)
        throw new ApiError(401, "Unauthorized" + error?.message);
    }
});


export { verifyJwtUser };