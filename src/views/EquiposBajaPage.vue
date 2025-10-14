<template>
	<div class="equipos-baja-page">
		<n-space vertical :size="24" class="page-container">
			<div class="page-header">
				<div>
					<n-h2 style="margin: 0; margin-bottom: 4px"> Equipos dados de baja </n-h2>
					<n-text depth="3">
						{{ equiposBaja.length }} equipo{{ equiposBaja.length !== 1 ? 's' : '' }} inactivo{{
							equiposBaja.length !== 1 ? 's' : ''
						}}
					</n-text>
				</div>
			</div>

			<n-card :bordered="false" embedded>
				<n-space vertical :size="12">
					<n-input
						v-model:value="searchQuery"
						placeholder="Buscar por modelo, tipo, serie, inventario, responsable..."
						clearable
						size="large"
						:allow-input="noSideSpace"
					>
						<template #prefix>
							<n-icon :component="SearchIcon" />
						</template>
					</n-input>

					<n-space :size="12" :wrap="true">
						<n-select
							v-model:value="filterTipoEquipo"
							:options="tipoEquipoOptions"
							placeholder="Tipo de equipo"
							clearable
							filterable
							style="min-width: 200px"
						/>
						<n-select
							v-model:value="filterDireccion"
							:options="direccionOptions"
							placeholder="Última dirección"
							clearable
							filterable
							style="min-width: 200px"
						/>
						<n-select
							v-model:value="filterDepartamento"
							:options="departamentoOptions"
							placeholder="Último departamento"
							clearable
							filterable
							style="min-width: 200px"
						/>
						<n-select
							v-model:value="filterUnidad"
							:options="unidadOptions"
							placeholder="Última unidad"
							clearable
							filterable
							style="min-width: 200px"
						/>
					</n-space>

					<n-space v-if="hasActiveFilters" :size="8">
						<n-tag v-if="filterTipoEquipo" closable @close="filterTipoEquipo = null" size="small">
							{{ filterTipoEquipo }}
						</n-tag>
						<n-tag v-if="filterDireccion" closable @close="filterDireccion = null" size="small">
							{{ filterDireccion }}
						</n-tag>
						<n-tag
							v-if="filterDepartamento"
							closable
							@close="filterDepartamento = null"
							size="small"
						>
							{{ filterDepartamento }}
						</n-tag>
						<n-tag v-if="filterUnidad" closable @close="filterUnidad = null" size="small">
							{{ filterUnidad }}
						</n-tag>
						<n-button text type="primary" size="small" @click="clearAllFilters">
							Limpiar todos
						</n-button>
					</n-space>
				</n-space>
			</n-card>

			<n-spin :show="cargando">
				<n-data-table
					:columns="columns"
					:data="filteredEquipos"
					:pagination="paginationConfig"
					:bordered="false"
					:single-line="false"
					size="large"
					:scroll-x="1400"
				>
					<template #empty>
						<n-empty description="No hay equipos dados de baja" size="large">
							<template #icon>
								<n-icon :component="CheckmarkCircleIcon" :size="64" :depth="3" />
							</template>
						</n-empty>
					</template>
				</n-data-table>
			</n-spin>
		</n-space>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue'
import {
	NDataTable,
	NCard,
	NSpace,
	NTag,
	NIcon,
	NText,
	NEmpty,
	NH2,
	NInput,
	NSelect,
	NSpin,
	NButton,
	type SelectOption,
	NTime, // Importamos NTime
} from 'naive-ui'
import { CheckmarkCircle as CheckmarkCircleIcon, Search as SearchIcon } from '@vicons/ionicons5'
import { supabase } from '../lib/supabaseClient'
import type { Equipo } from '../types/equipo'

const equiposBaja = ref<Equipo[]>([])
const cargando = ref(false)

// Filtros
const searchQuery = ref('')
const filterTipoEquipo = ref<string | null>(null)
const filterDireccion = ref<string | null>(null)
const filterDepartamento = ref<string | null>(null)
const filterUnidad = ref<string | null>(null)

const noSideSpace = (value: string) => !value.startsWith(' ') && !value.endsWith(' ')

const paginationConfig = computed(() => ({
	pageSize: 15,
	showSizePicker: true,
	pageSizes: [15, 30, 50, 100],
	showQuickJumper: true,
}))

const hasActiveFilters = computed(() => {
	return !!(
		filterTipoEquipo.value ||
		filterDireccion.value ||
		filterDepartamento.value ||
		filterUnidad.value
	)
})

// Opciones dinámicas (solo el console.log se elimina para limpiar la consola)
const tipoEquipoOptions = computed<SelectOption[]>(() => {
	const tipos = new Set(
		equiposBaja.value
			.map((e) => e.tipo_equipo)
			.filter((tipo): tipo is string => typeof tipo === 'string'),
	)
	return Array.from(tipos).map((tipo) => ({ label: tipo, value: tipo }))
})

const direccionOptions = computed<SelectOption[]>(() => {
	const direcciones = new Set(
		equiposBaja.value
			.map((e) => e.direccion)
			.filter((dir): dir is string => typeof dir === 'string'),
	)
	return Array.from(direcciones).map((dir) => ({ label: dir, value: dir }))
})

const departamentoOptions = computed<SelectOption[]>(() => {
	const deptos = new Set(
		equiposBaja.value
			.map((e) => e.departamento)
			.filter((depto): depto is string => typeof depto === 'string'),
	)
	return Array.from(deptos).map((depto) => ({ label: depto, value: depto }))
})

const unidadOptions = computed<SelectOption[]>(() => {
	const unidades = new Set(
		equiposBaja.value
			.map((e) => e.unidad)
			.filter((unidad): unidad is string => typeof unidad === 'string'),
	)
	return Array.from(unidades).map((unidad) => ({ label: unidad, value: unidad }))
})

// Equipos filtrados
const filteredEquipos = computed(() => {
	let result = equiposBaja.value

	if (searchQuery.value) {
		const query = searchQuery.value.toLowerCase().trim()
		result = result.filter((equipo) => {
			return (
				equipo.modelo?.toLowerCase().includes(query) ||
				equipo.tipo_equipo?.toLowerCase().includes(query) ||
				equipo.num_serie?.toLowerCase().includes(query) ||
				equipo.num_inventario?.toLowerCase().includes(query) ||
				equipo.responsable?.toLowerCase().includes(query)
			)
		})
	}

	if (filterTipoEquipo.value) {
		result = result.filter((equipo) => equipo.tipo_equipo === filterTipoEquipo.value)
	}

	if (filterDireccion.value) {
		result = result.filter((equipo) => equipo.direccion === filterDireccion.value)
	}

	if (filterDepartamento.value) {
		result = result.filter((equipo) => equipo.departamento === filterDepartamento.value)
	}

	if (filterUnidad.value) {
		result = result.filter((equipo) => equipo.unidad === filterUnidad.value)
	}

	return result
})

function clearAllFilters() {
	searchQuery.value = ''
	filterTipoEquipo.value = null
	filterDireccion.value = null
	filterDepartamento.value = null
	filterUnidad.value = null
}

// COLUMNAS ACTUALIZADAS
const columns = computed(() => [
	{
		title: 'Tipo',
		key: 'tipo_equipo',
		width: 140,
		ellipsis: { tooltip: true },
	},
	{
		title: 'Modelo',
		key: 'modelo',
		minWidth: 180,
		ellipsis: { tooltip: true },
	},
	{
		title: 'Inventario',
		key: 'num_inventario',
		width: 130,
		ellipsis: { tooltip: true },
	},
	{
		title: 'Fecha Baja', // NUEVA
		key: 'fecha_baja',
		width: 140,
		ellipsis: { tooltip: true },
		render(row: Equipo) {
			if (row.fecha_baja) {
				return h(NTime, {
					time: new Date(row.fecha_baja).getTime(),
					type: 'date',
					format: 'dd-MM-yyyy',
				})
			}
			return 'N/A'
		},
	},
	{
		title: 'Motivo Baja', // NUEVA
		key: 'motivo_baja',
		minWidth: 150,
		ellipsis: { tooltip: true },
		render(row: Equipo) {
			return h('span', null, row.motivo_baja || 'Sin motivo especificado')
		},
	},
	{
		title: 'Últ. Dirección', // TÍTULO MODIFICADO
		key: 'direccion',
		width: 180,
		ellipsis: { tooltip: true },
		render(row: Equipo) {
			return h(NTag, { size: 'small', bordered: false }, { default: () => row.direccion || 'N/A' })
		},
	},
	{
		title: 'Últ. Departamento', // TÍTULO MODIFICADO
		key: 'departamento',
		width: 180,
		ellipsis: { tooltip: true },
		render(row: Equipo) {
			return h(
				NTag,
				{ size: 'small', bordered: false, type: 'info' },
				{ default: () => row.departamento || 'N/A' },
			)
		},
	},
	{
		title: 'Últ. Unidad', // TÍTULO MODIFICADO
		key: 'unidad',
		width: 150,
		ellipsis: { tooltip: true },
		render(row: Equipo) {
			return h(
				NTag,
				{ size: 'small', bordered: false, type: 'success' },
				{ default: () => row.unidad || 'N/A' },
			)
		},
	},
	{
		title: 'Últ. Responsable', // TÍTULO MODIFICADO
		key: 'responsable',
		width: 150,
		ellipsis: { tooltip: true },
	},
	{
		title: 'Encargado Baja',
		key: 'encargado_baja',
		width: 150,
		ellipsis: { tooltip: true },
	},
])

const fetchEquiposBaja = async () => {
	cargando.value = true
	const { data, error } = await supabase
		.from('equipos')
		.select('*')
		.eq('estado', 'Inactivo')
		.order('fecha_baja', { ascending: false }) // Ordenar por fecha de baja más reciente

	if (error) {
		console.error('Error fetching equipos dados de baja:', error)
	} else {
		// Filtra el equipo con el error de tipado (aunque debería ser Inactivo, es bueno chequear)
		equiposBaja.value = data.filter((e: Equipo) => e.id !== 21)
	}
	cargando.value = false
}

onMounted(fetchEquiposBaja)
</script>

<style scoped>
.equipos-baja-page {
	min-height: 100vh;
	padding-top: 24px;
	padding-bottom: 24px;
}

.page-container {
	max-width: 1550px;
	margin: 0 auto;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 16px;
	flex-wrap: wrap;
}

@media (max-width: 768px) {
	.equipos-baja-page {
		padding: 16px;
	}
}
</style>
