<script setup lang="ts">
import { ref, inject } from 'vue'
import { useSocketIO } from '../socket.io'

const { socket } = useSocketIO()

const serial = inject('serial_port')
const serial_port = ref(serial)
const tag = ref('first')

const connect = (): void => {
  socket.emit('setupUART', serial_port.value)
}

const disconnect = (): void => {
  socket.emit('stopUART')
}

const enable = (): void => {
  socket.emit('startSave')
}

const disable = (): void => {
  socket.emit('endSave')
}

const deleteData = (): void => {
  socket.emit('clearSave')
}

const updateTag = (): void => {
  socket.emit('updateTag', tag.value)
}
</script>

<template>
  <div class="flex">
    <div class="flex justify-center item-center flex-col">
      <h2 class="text-2xl mb-3">Serial Port</h2>

      <div class="mb-3">
        <label class="pr-3" for="port">Port</label>

        <input
          id="port"
          v-model="serial_port"
          class="border-slate-200 border-2 px-2"
          type="text"
          name="port"
          required
        />
      </div>

      <div>
        <button @click="connect">Connect!</button>
        <button class="ml-5" @click="disconnect">Disconnect</button>
      </div>
    </div>
    <div class="flex justify-center item-center flex-col ml-12">
      <h2 class="text-2xl mb-3">Saving Data</h2>

      <div class="mb-2">
        <button class="mr-2" @click="enable">Enable</button>
        <button @click="disable">Disable</button>
      </div>

      <button class="block mb-2" @click="deleteData">Delete</button>
    </div>
    <form class="flex justify-center item-center flex-col ml-12" @submit.prevent="updateTag">
      <h2 class="text-2xl mb-3">Classifier</h2>

      <div class="mb-3">
        <label class="pr-3" for="tag">Tag</label>

        <input
          id="tag"
          v-model="tag"
          class="border-slate-200 border-2 px-2"
          type="text"
          name="tag"
          required
        />
      </div>

      <button>Save</button>
    </form>
  </div>
</template>

<style scoped></style>
