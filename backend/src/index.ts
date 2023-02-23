import { createSocketIO } from './socket'
import * as http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction } from 'express';

const {
	PORT = 80,
} = process.env;

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = http.createServer(app);
const io = createSocketIO(server);

app.get('/', (req, res) => {
	res.sendStatus(200);
});

io.on('connection', (socket) => {
	socket.on('ping', () => {
		io.emit('pong');
	});
});


server.listen(PORT, () => {
	console.log('server started at http://localhost:' + PORT);
});
