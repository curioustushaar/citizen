import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

let socket: Socket | undefined;

export const getSocket = (token?: string | null) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
    });
  }

  if (token) {
    socket.auth = { token };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const onEvent = (event: string, callback: (data: any) => void, token?: string | null) => {
  const s = getSocket(token);
  s.on(event, callback);
  return () => {
    s.off(event, callback);
  };
};
