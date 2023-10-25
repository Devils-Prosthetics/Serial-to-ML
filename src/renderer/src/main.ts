import { createApp } from 'vue'
import App from './App.vue'
import './assets/css/tailwind.css'
import './assets/css/styles.less'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const app = createApp(App)

app.config.globalProperties.$serial_port = window.config.serial_port
app.provide('serial_port', window.config.serial_port)

const options = {
	position: 'top-right',
	timeout: 3000,
	toastDefaults: {
		// ToastOptions object for each type of toast
		error: {
			timeout: 10000,
			closeButton: false
		},
		success: {
			hideProgressBar: true
		}
	}
}

app.use(Toast, options)

app.mount('#app')
