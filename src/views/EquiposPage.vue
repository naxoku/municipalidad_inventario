<template>
	<div class="equipos-page">
		<n-space vertical :size="24" class="page-container">
			<!-- <div class="page-header">
				<div>
					<n-h2 style="margin: 0; margin-bottom: 4px">Equipos Activos</n-h2>
					<n-text depth="3">
						{{ equipos.length }} equipo{{ equipos.length !== 1 ? 's' : '' }} en inventario
					</n-text>
				</div>
				<n-button type="primary" size="large" @click="mostrarModalAgregar = true">
					<template #icon>
						<n-icon :component="AddIcon" />
					</template>
					Agregar Equipo
				</n-button>
			</div> -->
			<PageHeader title="Equipos Activos">
				<template #subtitle>
					{{ equipos.length }} equipo{{ equipos.length !== 1 ? 's' : '' }} en inventario
				</template>

				<template #actions>
					<n-button type="primary" size="large" @click="mostrarModalAgregar = true">
						<template #icon>
							<n-icon :component="AddIcon" />
						</template>
						Agregar Equipo
					</n-button>
				</template>
			</PageHeader>

			<n-alert v-if="mensaje" type="success" closable @close="mensaje = ''">
				{{ mensaje }}
			</n-alert>

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
							placeholder="Dirección"
							clearable
							filterable
							style="min-width: 200px"
						/>
						<n-select
							v-model:value="filterDepartamento"
							:options="departamentoOptions"
							placeholder="Departamento"
							clearable
							filterable
							style="min-width: 200px"
						/>
						<n-select
							v-model:value="filterUnidad"
							:options="unidadOptions"
							placeholder="Unidad"
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
						<n-empty description="No se encontraron equipos" size="large">
							<template #icon>
								<n-icon :component="FolderOpenIcon" :size="64" :depth="3" />
							</template>
						</n-empty>
					</template>
				</n-data-table>
			</n-spin>
		</n-space>

		<EquipoAddModal
			:show="mostrarModalAgregar"
			@update:show="mostrarModalAgregar = $event"
			@equipoAgregado="handleEquipoAgregado"
		/>
		<EquipoEditModal
			v-if="equipoSeleccionado"
			:show="mostrarModalEditar"
			:equipo="equipoSeleccionado"
			@update:show="mostrarModalEditar = $event"
			@equipoActualizado="handleEquipoActualizado"
		/>
		<EquipoReasignarModal
			v-if="equipoSeleccionado"
			:show="mostrarModalReasignar"
			:equipo="equipoSeleccionado"
			@update:show="mostrarModalReasignar = $event"
			@equipoActualizado="handleEquipoActualizado"
		/>
		<EquipoMantenimientoModal
			v-if="equipoSeleccionado"
			:show="mostrarModalMantenimiento"
			:equipo="equipoSeleccionado"
			@update:show="mostrarModalMantenimiento = $event"
			@equipoActualizado="handleEquipoActualizado"
		/>
		<EquipoBajaModal
			v-if="equipoSeleccionado"
			:show="mostrarModalBaja"
			:equipo="equipoSeleccionado"
			@update:show="mostrarModalBaja = $event"
			@equipoDadoDeBaja="handleEquipoDadoDeBaja"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, computed } from 'vue'
import {
	NAlert,
	NSpace,
	NButton,
	NCard,
	NDataTable,
	NTag,
	useMessage,
	NIcon,
	NTooltip,
	type DataTableColumns,
	NTime,
	NInput,
	NSelect,
	NSpin,
	NEmpty,
	// NH2,
	// NText,
	type SelectOption,
} from 'naive-ui'
import {
	Add as AddIcon,
	Archive,
	Pencil,
	SwapHorizontal,
	Search as SearchIcon,
	FolderOpen as FolderOpenIcon,
} from '@vicons/ionicons5'
import { supabase } from '../lib/supabaseClient'
import type { Equipo } from '../types/equipo'
import EquipoAddModal from '../components/EquipoAddModal.vue'
import EquipoEditModal from '../components/EquipoEditModal.vue'
import EquipoReasignarModal from '../components/EquipoReasignarModal.vue'
import EquipoMantenimientoModal from '../components/EquipoMantenimientoModal.vue'
import EquipoBajaModal from '../components/EquipoBajaModal.vue'
import PageHeader from '@/components/PageHeader.vue'

const mensaje = ref('')
const message = useMessage()

const mostrarModalAgregar = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalReasignar = ref(false)
const mostrarModalMantenimiento = ref(false)
const mostrarModalBaja = ref(false)
const equipoSeleccionado = ref<Equipo | null>(null)

const equipos = ref<Equipo[]>([])
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

// Opciones dinámicas
const tipoEquipoOptions = computed<SelectOption[]>(() => {
	const tipos = new Set(equipos.value.map((e) => e.tipo_equipo).filter(Boolean))
	return Array.from(tipos).map((tipo) => ({ label: tipo as string, value: tipo as string }))
})

const direccionOptions = computed<SelectOption[]>(() => {
	const direcciones = new Set(equipos.value.map((e) => e.direccion).filter(Boolean))
	return Array.from(direcciones).map((dir) => ({ label: dir as string, value: dir as string }))
})

const departamentoOptions = computed<SelectOption[]>(() => {
	const deptos = new Set(equipos.value.map((e) => e.departamento).filter(Boolean))
	return Array.from(deptos).map((depto) => ({ label: depto as string, value: depto as string }))
})

const unidadOptions = computed<SelectOption[]>(() => {
	const unidades = new Set(equipos.value.map((e) => e.unidad).filter(Boolean))
	return Array.from(unidades).map((unidad) => ({
		label: unidad as string,
		value: unidad as string,
	}))
})

// Equipos filtrados
const filteredEquipos = computed(() => {
	let result = equipos.value
	// Se excluye el equipo con el error de tipado en 'responsable' y 'estado' (ID 21)
	result = result.filter((e) => e.id !== 21)

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

// Función para obtener la última fecha de mantenimiento
const getLastMaintenanceDate = (equipo: Equipo): string | null => {
	if (!equipo.historial_mantenimiento || equipo.historial_mantenimiento.length === 0) {
		return null
	}
	// Asume que el historial no está ordenado, encuentra la fecha más reciente
	const fechas = equipo.historial_mantenimiento
		.map((m) => new Date(m.fecha).getTime())
		.filter(Boolean)
	if (fechas.length === 0) return null

	const ultimaFecha = new Date(Math.max(...fechas))
	// Retorna la fecha en formato ISO para NTime
	return ultimaFecha.toISOString()
}

const fetchData = async () => {
	cargando.value = true
	// Se trae solo los equipos 'Activo'
	const { data, error } = await supabase
		.from('equipos')
		.select('*')
		.eq('estado', 'Activo')
		.order('fecha_ingreso', { ascending: false })

	if (error) {
		message.error('No se pudieron cargar los equipos')
	} else {
		// Filtra el equipo con el error de tipado para evitar problemas en las opciones/filtros
		equipos.value = data.filter((e: Equipo) => e.id !== 21)
	}
	cargando.value = false
}

// Las modales se mantienen, solo se cambia dónde se llama a abrirModalMantenimiento
const abrirModalEditar = (equipo: Equipo) => {
	equipoSeleccionado.value = equipo
	mostrarModalEditar.value = true
}

const abrirModalReasignar = (equipo: Equipo) => {
	equipoSeleccionado.value = equipo
	mostrarModalReasignar.value = true
}

const abrirModalMantenimiento = (equipo: Equipo) => {
	equipoSeleccionado.value = equipo
	mostrarModalMantenimiento.value = true
}

const abrirModalBaja = (equipo: Equipo) => {
	equipoSeleccionado.value = equipo
	mostrarModalBaja.value = true
}

// COLUMNAS ACTUALIZADAS
const columns: DataTableColumns<Equipo> = [
	{
		title: 'Ingreso',
		key: 'fecha_ingreso',
		width: 120,
		ellipsis: { tooltip: true },
		render(row: Equipo) {
			if (row.fecha_ingreso) {
				return h(NTime, {
					time: new Date(row.fecha_ingreso).getTime(), // Usar getTime()
					type: 'relative',
				})
			}
			return 'N/A'
		},
	},
	{
		title: 'Tipo',
		key: 'tipo_equipo',
		width: 120,
		ellipsis: { tooltip: true },
	},
	{
		title: 'Modelo',
		key: 'modelo',
		minWidth: 180,
		ellipsis: { tooltip: true },
		render(row: Equipo) {
			// El botón del modelo abre el modal de mantenimiento/detalle del equipo
			return h(
				NTooltip,
				{},
				{
					trigger: () =>
						h(
							NButton,
							{
								text: true,
								type: 'info',
								onClick: () => abrirModalMantenimiento(row), // Cambio aquí para abrir Mantenimiento
							},
							{ default: () => row.modelo },
						),
					default: () =>
						h(
							NSpace,
							{ align: 'center', size: 4 },
							{
								default: () => [h('span', null, ' Mantenimiento / Detalles')],
							},
						),
				},
			)
		},
	},
	{
		title: 'Inventario', // NUEVA
		key: 'num_inventario',
		width: 120,
		ellipsis: { tooltip: true },
	},
	{
		title: 'Serie', // NUEVA
		key: 'num_serie',
		width: 130,
		ellipsis: { tooltip: true },
	},
	{
		title: 'Dirección',
		key: 'direccion',
		width: 150,
		ellipsis: { tooltip: true },
		render(row: Equipo) {
			return h(NTag, { size: 'small', bordered: false }, { default: () => row.direccion || 'N/A' })
		},
	},
	{
		title: 'Departamento',
		key: 'departamento',
		width: 150,
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
		title: 'Unidad',
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
		title: 'Responsable',
		key: 'responsable',
		width: 150,
		ellipsis: { tooltip: true },
	},
	{
		title: 'Últ. Mant.', // NUEVA
		key: 'ultimo_mantenimiento',
		width: 120,
		ellipsis: { tooltip: true },
		render(row: Equipo) {
			const ultimaFecha = getLastMaintenanceDate(row)
			if (ultimaFecha) {
				return h(NTime, {
					time: new Date(ultimaFecha).getTime(),
					type: 'date',
					format: 'dd-MM-yyyy',
				})
			}
			return 'N/A'
		},
	},
	{
		title: 'Acciones',
		key: 'acciones',
		width: 150,
		align: 'center',
		fixed: 'right',
		render(row: Equipo) {
			return h(
				NSpace,
				{ justify: 'center', size: 4 },
				{
					default: () => [
						// Botón Editar
						h(
							NTooltip,
							{},
							{
								trigger: () =>
									h(
										NButton,
										{
											tertiary: true,
											circle: true,
											type: 'info',
											size: 'small',
											onClick: () => abrirModalEditar(row),
										},
										{ icon: () => h(NIcon, { component: Pencil, size: 18 }) },
									),
								default: () => 'Editar',
							},
						),
						// Botón Reasignar
						h(
							NTooltip,
							{},
							{
								trigger: () =>
									h(
										NButton,
										{
											tertiary: true,
											circle: true,
											type: 'primary',
											size: 'small',
											onClick: () => abrirModalReasignar(row),
										},
										{ icon: () => h(NIcon, { component: SwapHorizontal, size: 18 }) },
									),
								default: () => 'Reasignar',
							},
						),
						// Botón Dar de Baja
						h(
							NTooltip,
							{},
							{
								trigger: () =>
									h(
										NButton,
										{
											tertiary: true,
											circle: true,
											type: 'error',
											size: 'small',
											onClick: () => abrirModalBaja(row),
										},
										{ icon: () => h(NIcon, { component: Archive, size: 18 }) },
									),
								default: () => 'Dar de Baja',
							},
						),
					],
				},
			)
		},
	},
]

onMounted(fetchData)

const handleEquipoAgregado = (msg: string) => {
	mensaje.value = msg
	fetchData()
}

const handleEquipoActualizado = () => {
	fetchData()
	equipoSeleccionado.value = null
}

const handleEquipoDadoDeBaja = () => {
	fetchData()
	equipoSeleccionado.value = null
}
</script>

<style scoped>
.equipos-page {
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
	.equipos-page {
		padding: 16px;
	}

	.page-header {
		flex-direction: column;
		align-items: stretch;
	}
}
</style>
