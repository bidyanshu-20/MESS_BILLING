import Message from "../models/messageSchema.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const getAdmin = async (req, res) => {
    try {
        const admin = await User.findOne({ role: /^admin$/i }).select("_id name email profilePic");

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        res.status(200).json({
            success: true,
            admin,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch admin",
        });
    }
};

export const getChatUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }

        const user = await User.findById(userId).select("_id name email role rollno profilePic");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
};

export const getMessages = async (req, res) => {

    try {
        const { senderId, receiverId } = req.params;

        if (!mongoose.isValidObjectId(senderId) || !mongoose.isValidObjectId(receiverId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat user id",
            });
        }

        const messages = await Message.find({
            deletedFor: { $ne: senderId },
            $or: [
                {
                    senderId,
                    receiverId,
                },
                {
                    senderId: receiverId,
                    receiverId: senderId,
                },
            ],

        }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            messages,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch messages",
        });
    }
};
