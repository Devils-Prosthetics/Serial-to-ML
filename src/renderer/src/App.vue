<script setup lang="ts">
import Controls from './components/Controls.vue'
import { onMounted, onUnmounted } from 'vue'
import { useSocketIO } from './socket.io'
import { useToast } from 'vue-toastification'
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
</script>

<template>
  <Controls />
  <!-- <Graph /> -->
  <!-- <RealtimeLineGraph /> -->
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
