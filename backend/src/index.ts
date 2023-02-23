import { SerialPort, ReadlineParser } from 'serialport';
import { Server, Socket } from 'socket.io';
import * as http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction } from 'express';

const app = express();

const {
  PORT = 80,
} = process.env;

const server = http.createServer(app);

server.on('connection', (dets) => {
  console.log('connection found!', dets);
})

let io = new Server(server, {
  path: "/socket.io"
  // cors: {
  //   origin: process.env.URL,
  //   methods: ["GET", "POST"]
  // }
});

app.get('/', (req, res) => {
  res.sendStatus(200);
});

// app.get('/api', (req, res) => {
//   res.sendStatus(200);
// });

const serialport = new SerialPort({ path: process.env.SERIAL_PORT, baudRate: parseInt(process.env.BAUD_RATE) })
const parser = new ReadlineParser()
serialport.pipe(parser)
parser.on('data', (data) => {
  io.emit('uart', data);
})

serialport.on('error', (error) => {
  console.error(error);
})


io.on('connection', (socket) => {
  socket.on('ping', () => {
    io.emit('pong');
  });

  socket.broadcast.emit('hi');
});


server.listen(PORT, () => {
  console.log('server started at http://localhost:' + PORT);
});

declare module "express" { 
  export interface Request {
    user: any
  }
}
