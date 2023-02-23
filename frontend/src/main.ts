import { createApp } from 'vue'
import VueSocketIOExt from 'vue-socket.io-extended';
// import $socket from './socket-instance';
import './style.css'
import App from './App.vue'

createApp(App)
	// .use(VueSocketIOExt, $socket)
	.mount('#app')


