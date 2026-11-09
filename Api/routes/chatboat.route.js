import express from "express";
import { askChatbot } from "../controllers/chatbotController.js";

import verifyUser from '../controllers/auth.middleware.js';

const router = express.Router();

router.post("/ask", verifyUser, askChatbot);

export default router;