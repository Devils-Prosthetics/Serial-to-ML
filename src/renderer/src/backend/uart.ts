import { SerialPort, ReadlineParser } from 'serialport'
import { createSocketIO } from './socket'
// import * as fs from 'fs';

import config from '../config.json'

const io = createSocketIO()

if (process.env.SERIAL_PORT === undefined) throw new Error('No serial port defined!')
if (process.env.BAUD_RATE === undefined) throw new Error('No baud rate defined!')

const serialport = new SerialPort({ path: config.serial_port, baudRate: config.baud_rate })
const parser = new ReadlineParser()

serialport.pipe(parser)
parser.on('data', (data) => {
  io.emit('uart', data)
})

serialport.on('error', (error) => {
  throw new Error(`Can't find serialport, try different port!`)
  console.error(error)
})
