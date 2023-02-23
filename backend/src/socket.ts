import { Server, Socket } from 'socket.io';
import * as http from 'http';

// let io: http.Server;
let io: Server;

export function createSocketIO(server: http.Server = null) {
	if (!io) {
		io = new Server(server, {
			path: "/socket.io"
		});
	}

	return io;
}
