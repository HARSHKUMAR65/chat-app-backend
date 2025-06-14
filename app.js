
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './src/route/user.route.js';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config({ path: './.env' });

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST' , 'DELETE']
    }
})
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // 1️⃣ Join room (user ID)
  socket.on('join', (userId) => {
    socket.join(String(userId));
    console.log(`User ${userId} joined room`);
  });

  // 2️⃣ Receive send_message event from client
  socket.on('send_message', (message) => {
    const { receiver_id } = message;

    // Send to receiver’s room
    io.to(String(receiver_id)).emit('receive_message', message);
    console.log(`Forwarded message to user ${receiver_id}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
app.use(cors({
    origin: '*', 
    allowedHeaders: 'X-Requested-With, Content-Type, Authorization, Origin, Accept',
    credentials: true,
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
app.use(express.static('public'));
app.use('/images', express.static('public/images'));
app.use('/api', router);

export { app, server, io };


