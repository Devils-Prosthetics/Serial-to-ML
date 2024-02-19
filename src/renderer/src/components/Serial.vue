<script setup lang="ts">
import { onUpdated, ref, onMounted, onUnmounted, Ref } from 'vue'
import Toggle from './Toggle.vue'
import { useSocketIO } from '../socket.io'

const { socket } = useSocketIO()
// const toast = useToast()

const dataRef: Ref<string[]> = ref([])
const bottom: Ref<null | HTMLElement> = ref(null)

onMounted(() => {
	socket.on('logdata', (data) => {
		dataRef.value.push(data)
		if (dataRef.value.length > 200) dataRef.value.shift()
	})
})

onUpdated(() => {
	if (bottom.value) bottom.value.scrollIntoView()
})

onUnmounted(() => {
	socket.off('logdata')
})
</script>

<template>
	<div class="w-[600px] h-[300px] bg-slate-100 rounded-lg relative dark:bg-zinc-800">
		<div class="relative flex items-center justify-between my-2 mx-4">
			<h2 class="text-2xl font-bold">Serial Output</h2>
			<div class="flex space-x-2 items-center">
				<button @click="dataRef = []">Clear</button>
				<Toggle />
			</div>
		</div>
		<div class="text-clip h-5/6 w-full overflow-scroll absolute text-left">
			<p
				v-for="(item, index) in dataRef"
				:key="index"
				class="mx-3 font-[Monego] whitespace-pre-wrap"
			>
				{{ item }}
			</p>
			<href id="bottom" ref="bottom" />
		</div>
	</div>
</template>

<script lang="ts">
export default {
	name: 'Serial'
}
</script>
