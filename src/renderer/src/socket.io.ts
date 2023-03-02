import io, { Socket } from 'socket.io-client'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

export const useSocketIO = (): { socket: Socket<DefaultEventsMap, DefaultEventsMap> } => {
  const socket = io(`localhost:${window.config.socket_port}`, {
    withCredentials: false
  })
  return {
    socket
  }
}
