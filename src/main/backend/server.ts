import { createSocketIO } from './socket'
import { setupUART, shouldSaveUART, stopUART, updateTagUART, shouldLogUART } from './uart'
import { resetTraining, test, train } from './learning'
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
				socket.broadcast.emit('error', `Failed to delete ${config.file_location}`)
			}
			socket.broadcast.emit('success', `Deleted ${config.file_location}`)
		})

		resetTraining()
	})

	socket.on('updateTag', (tag) => {
		updateTagUART(tag)
		socket.broadcast.emit('success', `Updated Tag`)
	})

	socket.on('test', async (value) => {
		const res = await test(value)
		socket.broadcast.emit(
			'logdata',
			`prediction: ${res.prediction}\nprobabilities: ${res.probabilities
				.map((prob) => Math.trunc(prob * 10000) / 10000)
				.join(', ')}`
		)
	})

	socket.on('shouldLogUART', (state) => {
		if (state == true) shouldLogUART(true)
		else shouldLogUART(false)
	})

	socket.on('train', () => {
		train()
			.then(([loss, accuracy, info, labels, columns]) => {
				socket.emit('success', 'Training succeeded!')
				socket.broadcast.emit(
					'logdata',
					`loss: ${loss}   accuracy: ${accuracy}   iqr: ${info.iqr}   median: ${
						info.median
					}   labels: ${labels.join(', ')}   columns: ${columns}`
				)
			})
			.catch((error) => {
				socket.emit('error', 'Training failed!')
				console.error(error)
			})
	})
})

server.listen(PORT, () => {
	console.log('server started at http://localhost:' + PORT)
})
