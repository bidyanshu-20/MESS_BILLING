
import express from "express";
import { getAdmin, getChatUser, getMessages } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/admin", getAdmin);
router.get("/user/:userId", getChatUser);
router.get("/:senderId/:receiverId",getMessages);

export default router;
