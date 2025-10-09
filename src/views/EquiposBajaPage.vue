<template>
	<n-space vertical :size="24">
		<!-- 1. Encabezado de Página para Consistencia -->
		<n-page-header>
			<template #title>
				<h1 class="page-title">Equipos Dados de Baja</h1>
			</template>
		</n-page-header>

		<!-- 2. Encapsulamiento en Tarjeta -->
		<n-card title="Registro Histórico" :bordered="false" class="data-card">
			<n-data-table :columns="columns" :data="equiposBaja" :row-key="rowKey" :loading="cargando"
				:pagination="pagination" responsive />
		</n-card>
	</n-space>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NDataTable, NCard, NPageHeader, NSpace } from 'naive-ui'
import { supabase } from '../lib/supabaseClient'
import type { Equipo } from '../types/equipo'

const equiposBaja = ref<Equipo[]>([])
const cargando = ref(false)
const pagination = { pageSize: 10 }
const rowKey = (row: Equipo) => row.id!

const columns = [
	{ title: 'Fecha de Baja', key: 'fecha_baja', width: 150, resizable: true },
	{ title: 'Tipo de Equipo', key: 'tipo_equipo', resizable: true },
	{ title: 'Modelo', key: 'modelo', resizable: true },
	{ title: 'N° Serie', key: 'num_serie', resizable: true },
	{ title: 'N° Inventario', key: 'num_inventario', resizable: true },
	{ title: 'Último Depto.', key: 'departamento', resizable: true },
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
/* 3. Estilos Consistentes */
.page-title {
	font-size: 2rem;
	font-weight: 600;
	margin: 0;
}

.data-card {
	border-radius: 12px;
}
</style>
