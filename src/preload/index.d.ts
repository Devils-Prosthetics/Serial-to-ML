import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
	interface Window {
		electron: ElectronAPI
		api: unknown
		config: {
			socket_port: number
			serial_port: string
			baud_rate: number
		}
	}
}
