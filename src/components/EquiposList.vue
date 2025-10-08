<template>
	<section>
		<h1>Lista de Equipos Activos</h1>
		<n-data-table :columns="columns" :data="equipos" :row-key="rowKey" :loading="cargando" />
	</section>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { NButton, NDataTable, useMessage } from 'naive-ui'
import { supabase } from '../lib/supabaseClient'
import type { Equipo } from '../types/equipo'

const equipos = ref<Equipo[]>([])
const cargando = ref(false)
const message = useMessage()

const rowKey = (row: Equipo) => row.id!

// Función para traer los equipos activos
const fetchData = async () => {
	cargando.value = true
	const { data, error } = await supabase.from('Equipos').select('*').eq('estado', 'Activo')

	if (error) {
		console.error('Error fetching equipos:', error)
		message.error('No se pudieron cargar los equipos')
	} else {
		equipos.value = data
	}
	cargando.value = false
}

// ARREGLO CLAVE: Ahora actualiza el estado a 'Inactivo'
const darDeBaja = async (id: number) => {
	const { error } = await supabase
		.from('Equipos')
		.update({ estado: 'Inactivo', fecha_baja: new Date().toISOString() })
		.eq('id', id)

	if (error) {
		console.error('Error al dar de baja el equipo:', error)
		message.error('Falló la baja del equipo')
	} else {
		message.success('Equipo dado de baja correctamente')
		fetchData() // Actualizamos la lista pa que no se vea el que dimos de baja
	}
}

const columns = [
	{ title: 'Fecha de Ingreso', key: 'fecha_ingreso' },
	{ title: 'Tipo de Equipo', key: 'tipo_equipo' },
	{ title: 'Modelo', key: 'modelo' },
	{ title: 'N° Serie', key: 'num_serie' },
	{ title: 'N° Inventario', key: 'num_inventario' },
	{ title: 'Departamento', key: 'departamento' },
	{ title: 'Estado', key: 'estado' },
	{
		title: 'Acciones',
		key: 'acciones',
		render: (row: Equipo) =>
			h(
				NButton,
				{ type: 'error', onClick: () => darDeBaja(row.id!) },
				{ default: () => 'Dar de baja' },
			),
	},
]

onMounted(fetchData)

// Esto es para que el componente padre (EquiposPage) pueda llamar a fetchData()
defineExpose({ fetchData })
</script>

<style scoped>
section {
	padding: 1rem;
}
</style>
