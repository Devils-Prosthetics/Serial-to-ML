import { createSocketIO } from './socket'
import * as http from 'http'
import cookieParser from 'cookie-parser'
import express, { Request, Response } from 'express'
import config from '../config.json'

const PORT = config.socket_port

const app = express()
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const server = http.createServer(app)
const io = createSocketIO(server)

app.get('/', (_req: Request, res: Response) => {
  res.sendStatus(200)
})

io.on('connection', (socket) => {
  socket.on('ping', () => {
    io.emit('pong')
  })
})

server.listen(PORT, () => {
  console.log('server started at http://localhost:' + PORT)
})
