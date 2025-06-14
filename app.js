
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
    methods: ['GET', 'POST', 'DELETE']
  }
})
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('join_chat', ({ userId, partnerId }) => {
    socket.join(String(userId));
    socket.join(`${userId}-${partnerId}`);
    socket.join(`${partnerId}-${userId}`);
    console.log(`🧑 User ${userId} joined rooms: ${userId}, ${userId}-${partnerId}`);
  });

  socket.on('send_message', (message) => {
    const { sender_id, receiver_id } = message;

    // Emit real-time to both users
    io.to(String(sender_id)).emit('receive_message', message);
    io.to(String(receiver_id)).emit('receive_message', message);
    io.to(`${sender_id}-${receiver_id}`).emit('receive_message', message);
    io.to(`${receiver_id}-${sender_id}`).emit('receive_message', message);
  });

  socket.on('leave_chat', ({ userId, partnerId }) => {
    socket.leave(String(userId));
    socket.leave(`${userId}-${partnerId}`);
    socket.leave(`${partnerId}-${userId}`);
    console.log(`🚪 User ${userId} left rooms`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
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


