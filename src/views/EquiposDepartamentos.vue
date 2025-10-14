<template>
	<div class="departamentos-page">
		<n-space vertical :size="24" class="page-container">
			<!-- Header -->
			<div class="page-header">
				<div>
					<n-h2 style="margin: 0; margin-bottom: 4px">Búsqueda avanzada de equipos</n-h2>
					<n-text depth="3">{{ subtitleText }}</n-text>
				</div>
				<n-button type="primary" size="large" @click="drawerActive = true">
					<template #icon>
						<n-icon :component="BusinessIcon" />
					</template>
					{{
						checkedKeys.length > 0 ? `Filtrar (${checkedKeys.length})` : 'Seleccionar Departamentos'
					}}
				</n-button>
			</div>

			<!-- Búsqueda y filtros -->
			<n-card :bordered="false" embedded>
				<n-space vertical :size="12">
					<n-input
						v-model:value="searchQuery"
						placeholder="Buscar por modelo, serie, inventario o responsable..."
						clearable
						size="large"
						:allow-input="noSideSpace"
						:disabled="equipos.length === 0"
					>
						<template #prefix>
							<n-icon :component="SearchIcon" />
						</template>
					</n-input>

					<!-- Filtros rápidos -->
					<n-space :size="12" :wrap="true">
						<n-select
							v-model:value="filterTipoEquipo"
							:options="tipoEquipoOptions"
							placeholder="Tipo de equipo"
							clearable
							filterable
							style="min-width: 200px"
							:disabled="equipos.length === 0"
						/>
						<n-select
							v-model:value="filterDireccion"
							:options="direccionOptions"
							placeholder="Dirección"
							clearable
							filterable
							style="min-width: 200px"
							:disabled="equipos.length === 0"
						/>
						<n-select
							v-model:value="filterDepartamento"
							:options="departamentoOptions"
							placeholder="Departamento"
							clearable
							filterable
							style="min-width: 200px"
							:disabled="equipos.length === 0"
						/>
					</n-space>

					<!-- Tags de filtros activos -->
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
					</n-space>
				</n-space>
			</n-card>

			<!-- Tabla -->
			<n-spin :show="loading">
				<n-data-table
					:columns="columns"
					:data="filteredEquipos"
					:pagination="paginationConfig"
					:bordered="false"
					:single-line="false"
					size="large"
					:scroll-x="1100"
				>
					<template #empty>
						<n-empty :description="emptyDescription" size="large">
							<template #icon>
								<n-icon :component="emptyIcon" :size="64" :depth="3" style="bottom: 20px" />
							</template>
						</n-empty>
					</template>
				</n-data-table>
			</n-spin>
		</n-space>

		<!-- Drawer del organigrama -->
		<n-drawer v-model:show="drawerActive" :width="isMobile ? '85%' : 400" placement="right">
			<n-drawer-content title="Organigrama" closable>
				<n-space vertical :size="16">
					<!-- Info de selección -->
					<n-alert v-if="checkedKeys.length > 0" type="info" :bordered="false">
						{{ checkedKeys.length }} elemento{{
							checkedKeys.length !== 1 ? 's' : ''
						}}
						seleccionado{{ checkedKeys.length !== 1 ? 's' : '' }}
					</n-alert>

					<!-- Buscador -->
					<n-input
						v-model:value="searchPattern"
						placeholder="Buscar en organigrama..."
						clearable
						size="large"
						:allow-input="noSideSpace"
					>
						<template #prefix>
							<n-icon :component="SearchIcon" />
						</template>
					</n-input>

					<!-- Árbol -->
					<n-scrollbar style="max-height: calc(100vh - 280px)">
						<n-tree
							block-line
							cascade
							checkable
							:data="treeData"
							:pattern="searchPattern"
							v-model:checked-keys="checkedKeys"
							@update:checked-keys="handleCheckedKeysUpdate"
						/>
					</n-scrollbar>
				</n-space>

				<template #footer>
					<n-space justify="space-between">
						<n-button v-if="checkedKeys.length > 0" @click="clearSelection" type="error" ghost>
							Limpiar
						</n-button>
						<n-button type="primary" @click="drawerActive = false"> Aplicar Filtros </n-button>
					</n-space>
				</template>
			</n-drawer-content>
		</n-drawer>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, watch, computed, onUnmounted } from 'vue'
import {
	NSpace,
	NDataTable,
	NSpin,
	NTag,
	NTree,
	NInput,
	NButton,
	NEmpty,
	NIcon,
	NText,
	NH2,
	NSelect,
	NScrollbar,
	NDrawer,
	NDrawerContent,
	NCard,
	NAlert,
	type TreeOption,
	type SelectOption,
} from 'naive-ui'
import {
	Search as SearchIcon,
	// CloseCircle as CloseCircleIcon,
	FolderOpen as FolderOpenIcon,
	Business as BusinessIcon,
	Funnel as FilterIcon,
} from '@vicons/ionicons5'
import { supabase } from '../lib/supabaseClient'
import type { Equipo } from '../types/equipo'
import { organigrama } from '../data/listas'

const equipos = ref<Equipo[]>([])
const loading = ref(false)
const treeData = ref<TreeOption[]>([])
const searchPattern = ref('')
const checkedKeys = ref<string[]>([])
const drawerActive = ref(false)
const selectedFilters = ref<{ dir: string[]; deptos: string[]; unidades: string[] }>({
	dir: [],
	deptos: [],
	unidades: [],
})

// Filtros
const searchQuery = ref('')
const filterTipoEquipo = ref<string | null>(null)
const filterDireccion = ref<string | null>(null)
const filterDepartamento = ref<string | null>(null)

// Responsive
const isMobile = ref(false)

const checkMobile = () => {
	isMobile.value = window.innerWidth < 768
}

const noSideSpace = (value: string) => !value.startsWith(' ') && !value.endsWith(' ')

const paginationConfig = computed(() => ({
	pageSize: 15,
	showSizePicker: true,
	pageSizes: [15, 30, 50, 100],
	showQuickJumper: true,
}))

const subtitleText = computed(() => {
	if (checkedKeys.value.length === 0) {
		return 'Selecciona departamentos para ver sus equipos'
	}
	const filtered = filteredEquipos.value.length
	return `${filtered} equipo${filtered !== 1 ? 's' : ''} encontrado${filtered !== 1 ? 's' : ''}`
})

const hasActiveFilters = computed(() => {
	return !!(filterTipoEquipo.value || filterDireccion.value || filterDepartamento.value)
})

const emptyDescription = computed(() => {
	if (checkedKeys.value.length === 0) {
		return 'Selecciona departamentos del organigrama para comenzar'
	}
	if (hasActiveFilters.value || searchQuery.value) {
		return 'No se encontraron equipos con los filtros aplicados'
	}
	return 'Sin equipos registrados en estos departamentos'
})

const emptyIcon = computed(() => {
	if (checkedKeys.value.length === 0) return BusinessIcon
	if (hasActiveFilters.value || searchQuery.value) return FilterIcon
	return FolderOpenIcon
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

// Equipos filtrados
const filteredEquipos = computed(() => {
	let result = equipos.value

	if (searchQuery.value) {
		const query = searchQuery.value.toLowerCase().trim()
		result = result.filter((equipo) => {
			return (
				equipo.modelo?.toLowerCase().includes(query) ||
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

	return result
})

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
		title: 'Nº Serie',
		key: 'num_serie',
		width: 130,
		ellipsis: { tooltip: true },
	},
	{
		title: 'Nº Inventario',
		key: 'num_inventario',
		width: 130,
		ellipsis: { tooltip: true },
	},
	{
		title: 'Dirección',
		key: 'direccion',
		width: 200,
		ellipsis: { tooltip: true },
		render(row: Equipo) {
			return h(NTag, { size: 'small', bordered: false }, { default: () => row.direccion || 'N/A' })
		},
	},
	{
		title: 'Departamento',
		key: 'departamento',
		width: 200,
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
		width: 180,
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
])

function createTreeData(): TreeOption[] {
	const data: TreeOption[] = []
	for (const direccion in organigrama) {
		const direccionNode: TreeOption = {
			label: direccion,
			key: direccion,
			children: [],
		}
		const deptosChildren: TreeOption[] = []
		for (const departamento in organigrama[direccion]) {
			const unidades = organigrama[direccion][departamento]
			const departamentoNode: TreeOption = {
				label: departamento,
				key: departamento,
				children: [],
			}
			if (unidades && unidades.length > 0) {
				departamentoNode.children = unidades.map((unidad) => ({
					label: unidad,
					key: `${departamento}|${unidad}`,
				}))
			}
			deptosChildren.push(departamentoNode)
		}
		direccionNode.children = deptosChildren
		data.push(direccionNode)
	}
	return data
}

function extractFilters(keys: Array<string | number>): {
	dir: string[]
	deptos: string[]
	unidades: string[]
} {
	const dir: string[] = []
	const deptos: string[] = []
	const unidades: string[] = []
	keys.forEach((key) => {
		if (typeof key !== 'string') return
		if (key.includes('|')) {
			const [, unidad] = key.split('|')
			if (unidad) {
				unidades.push(unidad)
			}
		} else {
			if (organigrama.hasOwnProperty(key)) {
				dir.push(key)
			} else {
				for (const d in organigrama) {
					if (organigrama[d]!.hasOwnProperty(key)) {
						deptos.push(key)
						break
					}
				}
			}
		}
	})
	return { dir, deptos, unidades }
}

function handleCheckedKeysUpdate(keys: Array<string | number>) {
	selectedFilters.value = extractFilters(keys)
}

function clearSelection() {
	checkedKeys.value = []
	selectedFilters.value = { dir: [], deptos: [], unidades: [] }
}

async function fetchEquipos() {
	const { dir, deptos, unidades } = selectedFilters.value
	loading.value = true

	if (dir.length === 0 && deptos.length === 0 && unidades.length === 0) {
		equipos.value = []
		loading.value = false
		return
	}

	const filters: string[] = []
	if (dir.length > 0) {
		filters.push(`direccion.in.("${dir.join('","')}")`)
	}
	if (deptos.length > 0) {
		filters.push(`departamento.in.("${deptos.join('","')}")`)
	}
	if (unidades.length > 0) {
		filters.push(`unidad.in.("${unidades.join('","')}")`)
	}

	const { data, error } = await supabase
		.from('equipos')
		.select('*')
		.eq('estado', 'Activo')
		.or(filters.join(','))
		.order('id', { ascending: true })

	loading.value = false

	if (error) {
		console.error('Error fetching equipos:', error)
		equipos.value = []
	} else {
		equipos.value = data as Equipo[]
	}
}

onMounted(() => {
	treeData.value = createTreeData()
	checkMobile()
	window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
	window.removeEventListener('resize', checkMobile)
})

watch(selectedFilters, fetchEquipos, { deep: true })
</script>

<style scoped>
.departamentos-page {
	min-height: 100vh;
	padding: 24px;
}

.page-container {
	max-width: 1400px;
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
	.departamentos-page {
		padding: 16px;
	}

	.page-header {
		flex-direction: column;
		align-items: stretch;
	}
}
</style>
