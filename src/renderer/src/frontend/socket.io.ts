import io, { Socket } from 'socket.io-client'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

export const useSocketIO = (): { socket: Socket<DefaultEventsMap, DefaultEventsMap> } => {
  const socket = io('localhost:3000')
  return {
    socket
  }
}
