import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL;

let socket: Socket | null = null;

export function initSocket(token: string): Socket {
  if (socket) {
    if (socket.connected) return socket;
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket.io] Connected successfully:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket.io] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.io] Disconnected:', reason);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
