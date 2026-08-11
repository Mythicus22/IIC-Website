import { useContext } from 'react';
import { SocketContext } from './socket';

export const useSocket = () => useContext(SocketContext);
