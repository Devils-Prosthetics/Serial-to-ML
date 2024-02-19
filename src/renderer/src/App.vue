<script setup lang="ts">
import Controls from './components/Controls.vue'
import Serial from './components/Serial.vue'
import { onMounted, onUnmounted } from 'vue'
import { useSocketIO } from './socket.io'
import { useToast } from 'vue-toastification'
import { ref } from 'vue'
// import Graph from './components/Graph.vue'
// import RealtimeLineGraph from './components/RealtimeLineGraph.vue'

const { socket } = useSocketIO()
const toast = useToast()

onMounted(() => {
	socket.on('error', (message) => {
		toast.error(message, {
			timeout: 2000
		})
	})

	socket.on('success', (message) => {
		toast.success(message, {
			timeout: 2000
		})
	})
})

onUnmounted(() => {
	socket.off('error')
	socket.off('success')
})

const train = (): void => {
	socket.emit('train')
}

const testValue = ref('')

const test = (): void => {
	socket.emit('test', testValue.value)
}
</script>

<template>
	<div class="flex flex-col items-center space-y-3 font-semibold relative">
		<button class="absolute top-5 right-0" @click="train">Train!</button>
		<h1>Serial-to-ML</h1>
		<p>Read and collect serial output, and train a machine learning algorithm on it!</p>
		<Controls />
		<Serial />
		<form class="flex justify-center item-center flex-col ml-12" @submit.prevent="test">
			<h2 class="text-2xl mb-3">Classifier</h2>

			<div class="mb-3">
				<input
					id="tag"
					v-model="testValue"
					class="border-slate-200 border-2 px-2 mr-3"
					type="text"
					name="tag"
					required
				/>

				<button>Test</button>
			</div>
		</form>
	</div>
</template>

<style scoped>
.logo {
	height: 6em;
	padding: 1.5em;
	will-change: filter;
	transition: filter 300ms;
}
.logo:hover {
	filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
	filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
