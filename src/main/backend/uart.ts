import { SerialPort, ReadlineParser } from 'serialport'
import * as fs from 'fs'
import config from '../../config.json'
import { Server } from 'socket.io'
import { AutoDetectTypes } from '@serialport/bindings-cpp'
import path from 'path'

let using_serial_port = ''
let save_serial_data = false
let save_output_data = ''
let serialport: SerialPort<AutoDetectTypes> | undefined
let use_tag = 'first'
let wait_for_end = true
let can_log_data = false
let should_log_data = false

export const setupUART = (io: Server, serial_port: string): boolean | void => {
  console.log(`Initalizing setupUART`)
  if (fs.existsSync(serial_port) && using_serial_port != serial_port) {
    console.log(`Setting up uart with serial port ${serial_port}`)
    serialport = new SerialPort({ path: serial_port, baudRate: config.baud_rate })
    const parser = new ReadlineParser()
    using_serial_port = serial_port

    serialport.pipe(parser)
    parser.on('data', (data) => {
      saveUART(io, data)
    })

    serialport.on('open', () => {
      const configPath = path.resolve(__dirname, '../config.json')

      fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
        if (err) io.emit('error', 'Failed to save new port to config')
      })

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

const saveUART = (io: Server, data: string): void => {
  const includesNew = data.toString().toLowerCase().includes('newdata')
  const includesEnd = data.toString().toLowerCase().includes('enddata')
  if (includesEnd) can_log_data = true
  if (includesNew) can_log_data = false
  if (should_log_data && can_log_data && !includesNew && !includesEnd) io.emit('logdata', data)

  if (save_serial_data === false) save_output_data = ''
  else {
    if (wait_for_end != true) {
      if (includesEnd) {
        fs.appendFile(config.file_location, `${save_output_data}${use_tag}`, function (err) {
          if (err) throw err
          console.log('Saved!')
        })
        save_output_data = ''
      }

      if (includesNew) save_output_data = '\n'
      else save_output_data += `${data},`.replace(/(\r\n|\n|\r)/gm, '')
    } else {
      save_output_data = '\n'
      if (includesNew) wait_for_end = false
    }
  }
}

export const shouldSaveUART = (toSave: boolean): void => {
  if (toSave === false) save_serial_data = false
  else save_serial_data = true
}

export const stopUART = (io: Server): void => {
  if (!serialport) {
    io.emit('error', 'No UART connection to close')
    return
  }

  serialport.close((error) => {
    if (error) {
      io.emit('error', 'Unable to softly close UART connection, forcing closure!')
      serialport = undefined
      using_serial_port = ''
    } else {
      io.emit('success', 'Closed UART connection')
      using_serial_port = ''
      serialport = undefined
    }
  })
}

export const updateTagUART = (tag: string): void => {
  wait_for_end = true
  use_tag = tag
}

export const shouldLogUART = (state: boolean): void => {
  console.log('changed logging status')
  should_log_data = state
}
