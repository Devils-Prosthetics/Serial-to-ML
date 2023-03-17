import { createSocketIO } from './socket'
import { setupUART, shouldSaveUART, stopUART, updateTagUART, shouldLogUART } from './uart'
import * as http from 'http'
import cookieParser from 'cookie-parser'
import express, { Request, Response } from 'express'
import config from '../../config.json'
import * as fs from 'fs'

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

  socket.on('setupUART', (serial_port) => {
    console.log('serial_port:', serial_port)
    setupUART(io, serial_port)
  })

  socket.on('stopUART', () => {
    stopUART(io)
  })

  socket.on('startSave', () => {
    shouldSaveUART(true)
    socket.broadcast.emit('success', `Started to save data to ${config.file_location}`)
  })

  socket.on('endSave', () => {
    shouldSaveUART(false)
    socket.broadcast.emit('success', `Ended saving of data`)
  })

  socket.on('clearSave', () => {
    fs.unlink(config.file_location, (err) => {
      if (err) {
        socket.broadcast.emit('Error', `Failed to delete ${config.file_location}`)
      }
      socket.broadcast.emit('success', `Deleted ${config.file_location}`)
    })
  })

  socket.on('updateTag', (tag) => {
    updateTagUART(tag)
    socket.broadcast.emit('success', `Updated Tag`)
  })

  socket.on('shouldLogUART', state => {
    if (state == true) shouldLogUART(true)
    else shouldLogUART(false)
  })
})

server.listen(PORT, () => {
  console.log('server started at http://localhost:' + PORT)
})
