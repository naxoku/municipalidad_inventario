<template>
	<section>
		<h1>Equipos Dados de Baja</h1>
		<n-data-table
			:columns="columns"
			:data="equiposBaja"
			:row-key="rowKey"
			:loading="cargando"
			:pagination="pagination"
		/>
		<n-empty
			v-if="!cargando && equiposBaja.length === 0"
			description="Todavía no hay equipos dados de baja"
		/>
	</section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NDataTable, NEmpty } from 'naive-ui'
import { supabase } from '../lib/supabaseClient'
import type { Equipo } from '../types/equipo'

const equiposBaja = ref<Equipo[]>([])
const cargando = ref(false)
const pagination = { pageSize: 10 }
const rowKey = (row: Equipo) => row.id!

const columns = [
	{ title: 'Fecha de Baja', key: 'fecha_baja', width: 150 },
	{ title: 'Tipo de Equipo', key: 'tipo_equipo' },
	{ title: 'Modelo', key: 'modelo' },
	{ title: 'N° Serie', key: 'num_serie' },
	{ title: 'N° Inventario', key: 'num_inventario' },
	{ title: 'Último Depto.', key: 'departamento' },
]

const fetchEquiposBaja = async () => {
	cargando.value = true
	const { data, error } = await supabase.from('Equipos').select('*').eq('estado', 'Inactivo')

	if (error) {
		console.error('Error fetching equipos dados de baja:', error)
	} else {
		equiposBaja.value = data
	}
	cargando.value = false
}

onMounted(fetchEquiposBaja)
</script>

<style scoped>
section {
	padding: 1rem;
}
h1 {
	margin-bottom: 1.5rem;
}
</style>
