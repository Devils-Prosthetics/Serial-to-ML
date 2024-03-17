import { SerialPort, ReadlineParser } from 'serialport'
import * as fs from 'fs'
import config from '../../config.json'
import { Server } from 'socket.io'
import { AutoDetectTypes } from '@serialport/bindings-cpp'
import path from 'path'

// These is the state of the serial port
let using_serial_port = ''									// The current serial port in use
let save_serial_data = false								// If the serial data should be saved
let save_output_data = ''									// The data to save
let serialport: SerialPort<AutoDetectTypes> | undefined		// The serial port to use
let use_tag = 'first'										// The tag to use for saving
let wait_for_end = true										// If the program should wait for the end of the data
let can_log_data = false									// If the data can be logged
let should_log_data = false									// If the data should be logged

/**
 * Setup the serial port for communication
 * @param io - The socket.io server
 * @param serial_port - The serial port to use
 * @returns boolean | void - If the serial port was setup or not
 * @example
 * setupSerial(io, 'COM3')
 * // Output: Successfully connected to serialport!
 */
export const setupSerial = (io: Server, serial_port: string): boolean | void => {
	console.log(`Initalizing setupSerial`)
	if (fs.existsSync(serial_port) && using_serial_port != serial_port) { // If the serial port exists and is not the same as the current one
		console.log(`Setting up serial with serial port ${serial_port}`)
		
		// Setup the serial port
		serialport = new SerialPort({ path: serial_port, baudRate: config.baud_rate })
		const parser = new ReadlineParser()
		using_serial_port = serial_port

		serialport.pipe(parser)
		parser.on('data', (data) => {
			// Save the serial data as needed
			saveSerial(io, data)
		})

		// Setup the serial port events
		serialport.on('open', () => {
			// Save the new serial port to the config file
			const configPath = path.resolve(__dirname, '../config.json')

			fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
				if (err) io.emit('error', 'Failed to save new port to config')
			})

			io.emit('success', `Successfully connected to serialport!`)
		})

		// Setup the error event
		serialport.on('error', (error) => {
			// Log the error and emit it to the client
			io.emit('error', `Error with serialport, try different port!`)
			throw new Error(`Can't find serialport, try different port!`)
			console.error(error)
		})
	} else if (using_serial_port == serial_port) { // If the serial port is the same as the current one
		io.emit('error', `Already using this port!`)
		return false
	} else {
		io.emit('error', `Can't find serialport, try different port!`)
		return false
	}
}

/**
 * Save the serial data1 and emit it to the client
 * @param io - The socket.io server
 * @param data - The data to save
 * @example
 * saveSerial(io, 'newdata')
 * saveSerial(io, '100')
 * saveSerial(io, 'enddata')
 * // Output: Saved!
 */
const saveSerial = (io: Server, data: string): void => {
	const includesNew = data.toString().toLowerCase().includes('newdata') // If the data includes newdata
	const includesEnd = data.toString().toLowerCase().includes('enddata') // If the data includes enddata
	if (includesEnd) can_log_data = true 	// If the data includes enddata, the data can be logged
	if (includesNew) can_log_data = false 	// If the data includes newdata, the data can't be logged
	if (should_log_data && can_log_data && !includesNew && !includesEnd) io.emit('logdata', data) // If the data should be logged, the data can be logged, and the data is not newdata or enddata, emit the data to the client

	// Save the data if needed
	if (save_serial_data === false) save_output_data = ''
	else {
		if (wait_for_end != true) {
			if (includesEnd) {
				// Save the data to the file by appending it to a csv
				fs.appendFile(
					config.file_location,
					`${save_output_data}${use_tag}`,
					function (err) {
						if (err) throw err
						console.log('Saved!')
					}
				)
				save_output_data = ''
			}

			// Add the data to the save_output_data variable and remove newlines
			if (includesNew) save_output_data = '\n'
			else save_output_data += `${data},`.replace(/(\r\n|\n|\r)/gm, '')
		} else {
			save_output_data = '\n'
			if (includesNew) wait_for_end = false
		}
	}
}

/**
 * Save the serial data to a file
 * @param io - The socket.io server
 * @param toSave - If the data should be saved
 */
export const shouldSaveSerial = (toSave: boolean): void => {
	if (toSave === false) {
		save_serial_data = false
		wait_for_end = true
	} else {
		save_serial_data = true
		wait_for_end = true
	}
}

/**
 * Close the serial port
 * @param io - The socket.io server
 * @example
 * stopSerial(io)
 * // Output: Closed serial connection
 */
export const stopSerial = (io: Server): void => {
	if (!serialport) {
		io.emit('error', 'No serial connection to close')
		return
	}

	serialport.close((error) => {
		if (error) {
			io.emit('error', 'Unable to softly close serial connection, forcing closure!')
			serialport = undefined
			using_serial_port = ''
		} else {
			io.emit('success', 'Closed serial connection')
			using_serial_port = ''
			serialport = undefined
		}
	})
}

/**
 * Update the tag to use for saving the serial data
 * @param tag - The tag to use for saving
 * @example
 * updateTagSerial('first')
 */
export const updateTagSerial = (tag: string): void => {
	wait_for_end = true
	use_tag = tag
}

/**
 * Change the logging status
 * @param state - The new logging status
 */
export const shouldLogSerial = (state: boolean): void => {
	console.log('changed logging status')
	should_log_data = state
}
