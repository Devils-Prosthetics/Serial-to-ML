import io, { Socket } from 'socket.io-client'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import config from '../config.json'

export const useSocketIO = (): { socket: Socket<DefaultEventsMap, DefaultEventsMap> } => {
  const socket = io(`localhost:${config.socket_port}`)
  return {
    socket
  }
}
