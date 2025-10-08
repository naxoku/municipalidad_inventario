<template>
	<section>
		<n-space vertical>
			<n-button type="primary" @click="mostrarModal = true"> Agregar Nuevo Equipo </n-button>

			<n-alert v-if="mensaje" type="success" closable @close="mensaje = ''">
				{{ mensaje }}
			</n-alert>

			<EquiposList ref="listaEquiposRef" />
		</n-space>

		<n-modal v-model:show="mostrarModal">
			<n-card
				style="width: 600px"
				title="Agregar Equipo Nuevo"
				:bordered="false"
				size="huge"
				role="dialog"
				aria-modal="true"
			>
				<EquiposAgregar @equipo-agregado="onEquipoAgregado" />
			</n-card>
		</n-modal>
	</section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NAlert, NSpace, NButton, NModal, NCard } from 'naive-ui'
import EquiposList from '../components/EquiposList.vue'
import EquiposAgregar from '../components/EquiposAgregar.vue'

const mensaje = ref('')
const listaEquiposRef = ref()
const mostrarModal = ref(false)

// Esta función se ejecuta cuando el formulario avisa que se agregó un equipo
const onEquipoAgregado = () => {
	mostrarModal.value = false // Cerramos el modal
	mensaje.value = '¡Equipo agregado con éxito, perrito!' // Ponemos el mensaje de éxito
	listaEquiposRef.value.fetchData() // Le decimos a la lista que se actualice
}
</script>

<style scoped>
section {
	padding: 1rem;
}
</style>
