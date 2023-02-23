<script setup lang="ts">
import { ref } from 'vue'
import { useSocketIO } from '../socket.io'

const { socket } = useSocketIO()

const i = ref(0)
const lol = ref('ping')

const clickButton = (val: number): void => {
  // this.$socket.client is `socket.io-client` instance
  socket.emit('emit_method', val)
  socket.emit('ping')
}

socket.on('pong', () => {
  lol.value = 'pong'
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
