import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../db/models/user.modal.js";
import dotenv from 'dotenv';
import { z } from "zod";

dotenv.config({ path: './.env' });
const userSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

const generateAccessAndRefreshTokens = async (email) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const accessToken = await user.generateAccessToken();
    if (typeof accessToken !== "string") {
        throw new ApiError(500, "Invalid access token format");
    }

    user.refreshToken = accessToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken };
};
const RegisterUser = asyncHandler(async (req, res) => {
    const image = req.file;

    if (!image) {
        throw new ApiError(400, "Image is required");
    }

    const parsedData = userSchema.safeParse(req.body);
    if (!parsedData.success) {
        const errorMessages = parsedData.error.issues.map(issue => issue.message).join(", ");
        throw new ApiError(400, errorMessages);
    }

    const { email, password } = parsedData.data;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
        throw new ApiError(401, "User already exists");
    }

    const savedImagePath = `/images/${image.filename}`;

    const user = await User.create({
        email,
        password,
        profile_image: savedImagePath,
    });

    if (!user) {
        throw new ApiError(400, "User not created");
    }

    const accessToken = await user.generateAccessToken();

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, { user, accessToken }, "User registered successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken } = await generateAccessAndRefreshTokens(user.email);

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, { user, accessToken }, "User logged in successfully"));
});
const testing = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, 'testing is working', "API working successfully"));
});
const GetCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});
export {
    RegisterUser,
    loginUser,
    testing,
    GetCurrentUser
};
