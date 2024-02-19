<script setup lang="ts">
import { ref } from 'vue'
import Toggle from '@vueform/toggle'
import { useSocketIO } from '../socket.io'

const value = ref(false)

const { socket } = useSocketIO()

const updateLogging = (): void => {
	socket.emit('shouldLogSerial', !value.value)
}
</script>

<template>
	<div>
		<Toggle v-model="value" @input="updateLogging" />
	</div>
</template>

<style src="@vueform/toggle/themes/default.css"></style>
