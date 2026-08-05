import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Allow clients to join a room specific to a hostel to receive key updates
    socket.on('join_hostel_room', (hostelId: string) => {
      socket.join(`hostel_${hostelId}`);
      console.log(`Socket ${socket.id} joined room hostel_${hostelId}`);
    });

    // Allow clients to join a room specific to their user ID for push notifications
    socket.on('join_user_room', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined room user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
