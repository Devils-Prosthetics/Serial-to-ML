import { SerialPort, ReadlineParser } from 'serialport'
import * as fs from 'fs'
import config from '../../config.json'
import { Server } from 'socket.io'
import { AutoDetectTypes } from '@serialport/bindings-cpp'

let using_serial_port = ''
let save_serial_data = false
let save_output_data = ''
let serialport: SerialPort<AutoDetectTypes>
let use_tag = 'first'
let wait_for_end = true

export const setupUART = (io: Server, serial_port: string): boolean | void => {
  if (fs.existsSync(serial_port) && using_serial_port != serial_port) {
    serialport = new SerialPort({ path: serial_port, baudRate: config.baud_rate })
    const parser = new ReadlineParser()
    using_serial_port = serial_port

    serialport.pipe(parser)
    parser.on('data', (data) => {
      io.emit('uart', data)
      saveUART(data)
    })

    serialport.on('open', () => {
      io.emit('success', `Successfully connected to serialport!`)
    })

    serialport.on('error', (error) => {
      io.emit('error', `Error with serialport, try different port!`)
      throw new Error(`Can't find serialport, try different port!`)
      console.error(error)
    })
  } else if (using_serial_port == serial_port) {
    io.emit('error', `Already using this port!`)
    return false
  } else {
    io.emit('error', `Can't find serialport, try different port!`)
    return false
  }
}

const saveUART = (data: string): void => {
  if (save_serial_data === false) save_output_data = ''
  else {
    if (wait_for_end != true) {
      if (data.toString().toLowerCase().includes('end')) {
        fs.appendFile(config.file_location, `${save_output_data}${use_tag}`, function (err) {
          if (err) throw err
          console.log('Saved!')
        })
        save_output_data = ''
      }
      save_output_data += `${data},`.replace(/(\r\n|\n|\r)/gm, '')

      if (data.toString().toLowerCase().includes('new')) save_output_data = '\n'
    } else {
      save_output_data = '\n'
      if (data.toString().toLowerCase().includes('new')) wait_for_end = false
    }
  }
}

export const shouldSaveUART = (toSave: boolean): void => {
  if (toSave === false) save_serial_data = false
  else save_serial_data = true
}

export const stopUART = (io: Server): void => {
  serialport.close((error) => {
    if (error) io.emit('error', 'Unable to close UART connection')
    else {
      io.emit('success', 'Closed UART connection')
      using_serial_port = ''
    }
  })
}

export const updateTagUART = (tag: string): void => {
  wait_for_end = true
  use_tag = tag
}
