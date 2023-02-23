
<script setup lang="ts">
import { ref } from 'vue'
import { useSocketIO } from '../socket.io'

const { socket } = useSocketIO();

const i = ref(0);
const lol = ref('ping')

const clickButton = (val: Number) => {
  // this.$socket.client is `socket.io-client` instance
  socket.emit('emit_method', val);
  socket.emit('ping');
}

socket.on('pong', () => {
  lol.value = 'pong';
})
</script>

<template>
  <h1>
    Text!
  </h1>
  <button @click="clickButton(i++)">
    Emit!
  </button>
  <p>{{ lol }}</p>
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