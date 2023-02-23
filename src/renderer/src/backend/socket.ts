import { Server } from 'socket.io'
import * as http from 'http'

let io: Server

export function createSocketIO(server?: http.Server): Server {
  if (io !== null) {
    io = new Server(server)
  }

  return io
}
