import express from 'express';  // Import the Express module
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import billingRouter from "./routes/messbill.route.js";
import messdataRouter from './routes/messdata.route.js';
import chatRoutes from "./routes/chat.route.js";
import getBillforAdminRouter from './routes/getbillForAdmin.route.js'
import Message from './models/messageSchema.js';
import User from './models/user.model.js';
import cors from 'cors'
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "node:http";
dotenv.config();



// console.log(process.env.MONGOURI);
mongoose.connect(process.env.MONGOURI).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();

const server = createServer(app);
export let io;

io = new Server(server, {
  maxHttpBufferSize: 6 * 1024 * 1024,
  cors: {
    origin: "https://mess-billing.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }  
});
// https://mess-billing.vercel.app/



//  SOCKET CONNECTION
io.on("connection", (socket) => {
  // console.log("User Connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    if (!mongoose.isValidObjectId(userId)) {
      socket.emit("messageError", { message: "Invalid chat room" });
      return;
    }

    socket.join(userId);
    // console.log("Joined room:", userId);
  });

  // new addition for chat event

  socket.on("sendMessage", async (data, callback) => {
    try {
      const senderId = data.senderId || data.sender;
      let receiverId = data.receiverId;
      const hasText = Boolean(data.text?.trim());
      const hasAttachment = Boolean(data.attachment?.dataUrl && data.attachment?.name);

      if (!receiverId && data.sender === "user") {
        const admin = await User.findOne({ role: /^admin$/i }).select("_id");
        receiverId = admin?._id;
      }

      if (
        !mongoose.isValidObjectId(data.roomId) ||
        !mongoose.isValidObjectId(senderId) ||
        !mongoose.isValidObjectId(receiverId) ||
        (!hasText && !hasAttachment)
      ) {
        const errorPayload = { success: false, message: "Invalid message data" };
        socket.emit("messageError", errorPayload);
        callback?.(errorPayload);
        return;
      }

      const message = await Message.create({
        senderId,
        receiverId,
        text: hasText ? data.text.trim() : "",
        attachment: hasAttachment
          ? {
              name: data.attachment.name,
              type: data.attachment.type || "application/octet-stream",
              size: data.attachment.size || 0,
              dataUrl: data.attachment.dataUrl,
            }
          : undefined,
      });

      io.to(data.roomId).emit("receiveMessage", message);
      callback?.({ success: true, message });
    } catch (error) {
      console.log("Message send failed:", error);
      const errorPayload = { success: false, message: "Failed to send message" };
      socket.emit("messageError", errorPayload);
      callback?.(errorPayload);
    }
  });

  socket.on("deleteMessage", async (data, callback) => {
    try {
      const { messageId, currentUserId, roomId, deleteType } = data;

      if (
        !mongoose.isValidObjectId(messageId) ||
        !mongoose.isValidObjectId(currentUserId) ||
        !mongoose.isValidObjectId(roomId)
      ) {
        const errorPayload = { success: false, message: "Invalid delete request" };
        socket.emit("messageError", errorPayload);
        callback?.(errorPayload);
        return;
      }

      const message = await Message.findById(messageId);

      if (!message) {
        const errorPayload = { success: false, message: "Message not found" };
        callback?.(errorPayload);
        return;
      }

      if (deleteType === "everyone") {
        if (message.senderId.toString() !== currentUserId) {
          const errorPayload = { success: false, message: "You can delete only your message for everyone" };
          callback?.(errorPayload);
          return;
        }

        message.deletedForEveryone = true;
        message.text = "This message was deleted";
        message.attachment = undefined;
        await message.save();

        io.to(roomId).emit("messageDeleted", {
          messageId,
          deleteType: "everyone",
          message,
        });

        callback?.({ success: true });
        return;
      }

      if (!message.deletedFor.some((userId) => userId.toString() === currentUserId)) {
        message.deletedFor.push(currentUserId);
        await message.save();
      }

      callback?.({ success: true, messageId, deleteType: "me" });
    } catch (error) {
      console.log("Message delete failed:", error);
      const errorPayload = { success: false, message: "Failed to delete message" };
      socket.emit("messageError", errorPayload);
      callback?.(errorPayload);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});


// const app = express();
// app.use(cors());

app.use(cors({
    origin: "https://mess-billing.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));




app.use(express.json());



app.get("/", (req, res) => {
  res.send("I am SERVER...");  // Send a response to the client
});
// Start the server on port 3000
app.use('/api', userRouter);
app.use('/api/auth', authRouter);
app.use('/api', billingRouter);
app.use('/api', messdataRouter);
app.use('/api/admin', getBillforAdminRouter);
app.use("/api/chat",chatRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server Error.';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  })
})



server.listen(3400, () => {
  console.log('server + socket running on port 3400!!!');
});
