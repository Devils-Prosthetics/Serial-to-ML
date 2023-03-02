import { SerialPort, ReadlineParser } from 'serialport'
import * as fs from 'fs'
import config from '../../config.json'
import { Server } from 'socket.io'

let using_serial_port = ''

export const setupUART = (io: Server, serial_port: string): boolean | void => {
  if (fs.existsSync(serial_port) && using_serial_port != serial_port) {
    const serialport = new SerialPort({ path: serial_port, baudRate: config.baud_rate })
    const parser = new ReadlineParser()
    using_serial_port = serial_port

    serialport.pipe(parser)
    parser.on('data', (data) => {
      io.emit('uart', data)
    })

    serialport.on('error', (error) => {
      throw new Error(`Can't find serialport, try different port!`)
      console.error(error)
    })
  } else {
    return false
  }
}
