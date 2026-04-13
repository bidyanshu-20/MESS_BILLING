import express from 'express';  // Import the Express module
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import billingRouter from "./routes/messbill.route.js";
import messdataRouter from './routes/messdata.route.js';
import getBillforAdminRouter from './routes/getbillForAdmin.route.js'
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
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"]
  }
});

// ✅ SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log("Joined room:", userId);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});


// const app = express();
app.use(cors());
app.use(express.json());



// Define a route for the root URL ("/")
app.get("/", (req, res) => {
  res.send("I am SERVER...");  // Send a response to the client
});
// Start the server on port 3000
app.use('/api', userRouter);
app.use('/api/auth', authRouter);
app.use('/api', billingRouter);
app.use('/api', messdataRouter);
app.use('/api/admin', getBillforAdminRouter);


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