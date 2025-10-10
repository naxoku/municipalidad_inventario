<template>
	<n-layout has-sider>
		<n-layout-sider
			bordered
			collapse-mode="width"
			:collapsed-width="60"
			:width="280"
			:native-scrollbar="false"
		>
			<n-card title="Organigrama" :bordered="false" size="small">
				<n-space vertical>
					<n-input v-model:value="searchPattern" placeholder="Buscar..." clearable />
					<n-tree
						block-line
						cascade
						checkable
						virtual-scroll
						style="height: calc(100vh - 220px)"
						:data="treeData"
						:pattern="searchPattern"
						v-model:checked-keys="checkedKeys"
						@update:checked-keys="handleCheckedKeysUpdate"
					/>
					<n-button v-if="checkedKeys.length > 0" @click="clearSelection" type="error" block>
						Limpiar Selección
					</n-button>
				</n-space>
			</n-card>
		</n-layout-sider>

		<n-layout-content content-style="padding: 24px;">
			<n-card title="Equipos Filtrados" :bordered="false">
				<n-spin :show="loading">
					<div v-if="!loading && equipos.length === 0">
						<n-empty
							description="Selecciona uno o más departamentos en la lista para ver los equipos."
							style="padding: 48px 0"
						/>
					</div>
					<n-data-table
						v-else
						:columns="columns"
						:data="equipos"
						:pagination="pagination"
						:bordered="false"
					/>
				</n-spin>
			</n-card>
		</n-layout-content>
	</n-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, h, watch } from 'vue'
import {
	NLayout,
	NLayoutSider,
	NLayoutContent,
	NSpace,
	NDataTable,
	NSpin,
	NTag,
	NTree,
	NCard,
	NInput,
	NButton,
	NEmpty,
	type TreeOption,
} from 'naive-ui'
import { supabase } from '../lib/supabaseClient'
import type { Equipo } from '../types/equipo'
import { organigrama } from '../data/listas'

interface Departamento {
	id: string
	nombre: string
}

const departamentos = ref<Departamento[]>([])
const equipos = ref<Equipo[]>([])
const loading = ref(false)
const treeData = ref<TreeOption[]>([])
const defaultExpandedKeys = ref<string[]>([])
const searchPattern = ref('')
const checkedKeys = ref<string[]>([])
const selectedFilters = ref<{ deptos: string[]; unidades: string[] }>({ deptos: [], unidades: [] })

const pagination = { pageSize: 10 }

const columns = [
	{
		title: 'ID',
		key: 'id',
	},
	{
		title: 'Modelo',
		key: 'modelo',
	},
	{
		title: 'Número de Serie',
		key: 'num_serie',
	},
	{
		title: 'Departamento',
		key: 'departamento',
		render(row: Equipo) {
			const deptoEncontrado = departamentos.value.find(
				(d: Departamento) => d.id === row.departamento,
			)
			return h(
				NTag,
				{ type: 'info', bordered: false },
				{ default: () => deptoEncontrado?.nombre || row.departamento || 'N/A' },
			)
		},
	},
	{
		title: 'Unidad',
		key: 'unidad',
		render(row: Equipo) {
			return row.unidad
				? h(NTag, { type: 'success', bordered: false }, { default: () => row.unidad })
				: 'Sin unidad'
		},
	},
]

function createTreeData(): TreeOption[] {
	const data: TreeOption[] = []
	for (const direccion in organigrama) {
		const direccionNode: TreeOption = {
			label: direccion,
			key: direccion,
			children: [],
			checkboxDisabled: false,
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

function extractFilters(keys: Array<string | number>): { deptos: string[]; unidades: string[] } {
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
			for (const dir in organigrama) {
				if (organigrama[dir]!.hasOwnProperty(key)) {
					deptos.push(key)
					break
				}
			}
		}
	})
	return { deptos, unidades }
}

function handleCheckedKeysUpdate(keys: Array<string | number>) {
	selectedFilters.value = extractFilters(keys)
}

function clearSelection() {
	checkedKeys.value = []
	selectedFilters.value = { deptos: [], unidades: [] }
}

async function fetchEquipos() {
	const { deptos, unidades } = selectedFilters.value
	loading.value = true
	if (deptos.length === 0 && unidades.length === 0) {
		equipos.value = []
		loading.value = false
		return
	}
	const filters: string[] = []
	if (deptos.length > 0) {
		filters.push(`departamento.in.("${deptos.join('","')}")`)
	}
	if (unidades.length > 0) {
		filters.push(`unidad.in.("${unidades.join('","')}")`)
	}
	const { data, error } = await supabase.from('equipos').select('*').or(filters.join(','))
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
	defaultExpandedKeys.value = Object.keys(organigrama)

	const allDepartamentos: Departamento[] = []
	for (const direccion in organigrama) {
		for (const departamento in organigrama[direccion]) {
			allDepartamentos.push({ id: departamento, nombre: departamento })
		}
	}
	departamentos.value = allDepartamentos
})

watch(selectedFilters, fetchEquipos, { deep: true })
</script>
