<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSocketIO } from '../socket.io'

const { socket } = useSocketIO()

const i = ref(0)
const lol = ref('ping')

const clickButton = (val: number): void => {
  socket.emit('emit_method', val)
  socket.emit('ping')
}

onMounted(() => {
  socket.emit('setupUART', '/dev/cu.usbmodem1201')

  socket.on('pong', () => {
    lol.value = 'pong'
  })

  socket.on('uart', (data) => {
    console.log('data:', data)
  })
})

onUnmounted(() => {
  socket.off('uart')
  socket.off('pong')
})
</script>

<template>
  <div>
    <h1>Text!</h1>
    <button @click="clickButton(i++)">Emit!</button>
    <p>{{ lol }} {{ i }}</p>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Graph'
}
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
