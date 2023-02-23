import { SerialPort, ReadlineParser } from 'serialport';
import * as fs from 'fs';

const serialport = new SerialPort({ path: '/dev/cu.usbmodem11101', baudRate: 115200 })
const parser = new ReadlineParser()
serialport.pipe(parser)

let output = ""
let loop = 0;
parser.on('data', (data) => {
	// console.log(typeof data);
	if (data.toString().toLowerCase().includes("end")) {
		fs.appendFile('openpalm.csv', `${output}`, function (err) {
			if (err) throw err;
			console.log('Saved!');
		});
		output = ""
	}
	output += `${data},`.replace(/(\r\n|\n|\r)/gm, "")
	if (data.toString().toLowerCase().includes("new")) output = "\n"
})

serialport.on('error', (error) => {
	console.error(error);
})
