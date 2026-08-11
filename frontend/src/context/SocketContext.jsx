import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';
import { SocketContext } from './socket';

export const SocketProvider = ({ children }) => {
  const [socket] = useState(() => {
    return io(SOCKET_URL);
  });

  useEffect(() => {
    return () => socket.close();
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
