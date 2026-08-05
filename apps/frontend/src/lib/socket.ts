import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocketClient = (): Socket => {
  if (!socket) {
    // The Next.js API proxy handles /api, but socket.io is often better connected directly to the backend
    // Assuming backend runs on 4000 locally
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    socket = io(backendUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Connected to real-time server', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from real-time server');
    });
  }
  return socket;
};

export const getSocket = (): Socket | null => socket;

export const joinHostelRoom = (hostelId: string) => {
  if (socket) {
    socket.emit('join_hostel_room', hostelId);
  }
};

export const joinUserRoom = (userId: string) => {
  if (socket) {
    socket.emit('join_user_room', userId);
  }
};
