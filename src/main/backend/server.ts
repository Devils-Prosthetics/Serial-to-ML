import { Server } from "socket.io";
import { setupSerial, shouldSaveSerial, stopSerial, updateTagSerial, shouldLogSerial } from './serial'
import { resetTraining, test, train } from './learning'
import config from '../../config.json'
import * as fs from 'fs'

const PORT = config.socket_port

// Create a new socket.io server
const io = new Server(PORT, {
	cors: {
		origin: `http://localhost:${config.vite_port}`
	}
});

// Handle the connection event
io.on('connection', (socket) => {
	socket.on('ping', () => {
		io.emit('pong')
	})

	socket.on('setupSerial', (serial_port) => {
		setupSerial(io, serial_port)
	})

	socket.on('stopSerial', () => {
		stopSerial(io)
	})

	socket.on('startSave', () => {
		shouldSaveSerial(true)
		socket.broadcast.emit('success', `Started to save data to ${config.file_location}`)
	})

	socket.on('endSave', () => {
		shouldSaveSerial(false)
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
		updateTagSerial(tag)
		socket.broadcast.emit('success', `Updated Tag`)
	})

	socket.on('test', async (value) => {
		const res = await test(value)
		socket.broadcast.emit(
			'logdata', // Send the data to the client
			`prediction: ${res.prediction}\nprobabilities: ${res.probabilities
				.map((prob) => Math.trunc(prob * 10000) / 10000) // Round to 4 decimal places
				.join(', ')}` // Join the probabilities together to one string
		)
	})

	socket.on('shouldLogSerial', (state) => {
		if (state == true) shouldLogSerial(true)
		else shouldLogSerial(false)
	})

	socket.on('train', () => {
		train() // Start the training
			.then(([loss, accuracy, info, labels, columns]) => {
				socket.emit('success', 'Training succeeded!') // Send the success message
				
				// Send the training data to the client
				socket.broadcast.emit(
					'logdata',
					`loss: ${loss}   accuracy: ${accuracy}   iqr: ${info.iqr}   median: ${
						info.median
					}   labels: ${labels.join(', ')}   columns: ${columns}`
				)
			})
			.catch((error) => { // Handle the error
				socket.emit('error', 'Training failed!')
				console.error(error)
			})
	})
})
