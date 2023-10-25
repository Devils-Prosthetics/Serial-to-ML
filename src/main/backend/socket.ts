import { Server } from 'socket.io'
import * as http from 'http'
import config from '../../config.json'

let io: Server

export function createSocketIO(server?: http.Server): Server {
	if (io !== null) {
		io = new Server(server, {
			cors: {
				origin: `http://localhost:${config.vite_port}`
			}
		})
	}

	return io
}
