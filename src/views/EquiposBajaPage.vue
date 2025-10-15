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
import { ref, onMounted, h, computed, watch } from 'vue'
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

// Paginación
const currentPage = ref(1)
const pageSize = ref(15)
const itemCount = ref(0) // Total de elementos para la paginación del lado del servidor

// Filtros
const searchQuery = ref('')
const filterTipoEquipo = ref<string | null>(null)
const filterDireccion = ref<string | null>(null)
const filterDepartamento = ref<string | null>(null)
const filterUnidad = ref<string | null>(null)

const noSideSpace = (value: string) => !value.startsWith(' ') && !value.endsWith(' ')

const paginationConfig = computed(() => ({
	page: currentPage.value,
	pageSize: pageSize.value,
	itemCount: itemCount.value,
	showSizePicker: true,
	pageSizes: [15, 30, 50, 100],
	showQuickJumper: true,
	onUpdatePage: (page: number) => {
		currentPage.value = page
		fetchEquiposBaja()
	},
	onUpdatePageSize: (size: number) => {
		pageSize.value = size
		currentPage.value = 1 // Resetear a la primera página al cambiar el tamaño
		fetchEquiposBaja()
	},
}))

const hasActiveFilters = computed(() => {
	return !!(
		searchQuery.value ||
		filterTipoEquipo.value ||
		filterDireccion.value ||
		filterDepartamento.value ||
		filterUnidad.value
	)
})

// Opciones dinámicas para filtros
const tipoEquipoOptions = ref<SelectOption[]>([])
const direccionOptions = ref<SelectOption[]>([])
const departamentoOptions = ref<SelectOption[]>([])
const unidadOptions = ref<SelectOption[]>([])

// Equipos filtrados (ahora se maneja en fetchEquiposBaja)
const filteredEquipos = computed(() => equiposBaja.value)

function clearAllFilters() {
	searchQuery.value = ''
	filterTipoEquipo.value = null
	filterDireccion.value = null
	filterDepartamento.value = null
	filterUnidad.value = null
	currentPage.value = 1 // Resetear la paginación
	fetchEquiposBaja() // Volver a cargar datos con filtros limpios
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
	let query = supabase
		.from('equipos')
		.select(
			'id, tipo_equipo, modelo, num_inventario, fecha_baja, motivo_baja, direccion, departamento, unidad, responsable, encargado_baja',
			{ count: 'exact' },
		) // Solicitar el conteo total y solo los campos necesarios
		.eq('estado', 'Inactivo')
		.order('fecha_baja', { ascending: false }) // Ordenar por fecha de baja más reciente

	// Aplicar filtros de búsqueda
	if (searchQuery.value) {
		const search = `%${searchQuery.value.toLowerCase().trim()}%`
		query = query.or(
			`modelo.ilike.${search},tipo_equipo.ilike.${search},num_serie.ilike.${search},num_inventario.ilike.${search},responsable.ilike.${search}`,
		)
	}
	if (filterTipoEquipo.value) {
		query = query.eq('tipo_equipo', filterTipoEquipo.value)
	}
	if (filterDireccion.value) {
		query = query.eq('direccion', filterDireccion.value)
	}
	if (filterDepartamento.value) {
		query = query.eq('departamento', filterDepartamento.value)
	}
	if (filterUnidad.value) {
		query = query.eq('unidad', filterUnidad.value)
	}

	// Aplicar paginación
	const from = (currentPage.value - 1) * pageSize.value
	const to = from + pageSize.value - 1
	query = query.range(from, to)

	const { data, error, count } = await query

	if (error) {
		console.error('Error fetching equipos dados de baja:', error)
	} else {
		equiposBaja.value = data.filter((e: Equipo) => e.id !== 21)
		itemCount.value = count || 0 // Actualizar el conteo total
		updateFilterOptions(data) // Actualizar opciones de filtro con los datos actuales
	}
	cargando.value = false
}

// Función para actualizar las opciones de los selectores de filtro
const updateFilterOptions = (currentEquipos: Equipo[]) => {
	const tipos = new Set(currentEquipos.map((e) => e.tipo_equipo).filter(Boolean))
	tipoEquipoOptions.value = Array.from(tipos).map((tipo) => ({
		label: tipo as string,
		value: tipo as string,
	}))

	const direcciones = new Set(currentEquipos.map((e) => e.direccion).filter(Boolean))
	direccionOptions.value = Array.from(direcciones).map((dir) => ({
		label: dir as string,
		value: dir as string,
	}))

	const deptos = new Set(currentEquipos.map((e) => e.departamento).filter(Boolean))
	departamentoOptions.value = Array.from(deptos).map((depto) => ({
		label: depto as string,
		value: depto as string,
	}))

	const unidades = new Set(currentEquipos.map((e) => e.unidad).filter(Boolean))
	unidadOptions.value = Array.from(unidades).map((unidad) => ({
		label: unidad as string,
		value: unidad as string,
	}))
}

// Observar cambios en los filtros para recargar datos
watch([searchQuery, filterTipoEquipo, filterDireccion, filterDepartamento, filterUnidad], () => {
	currentPage.value = 1 // Resetear a la primera página al cambiar cualquier filtro
	fetchEquiposBaja()
})

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
