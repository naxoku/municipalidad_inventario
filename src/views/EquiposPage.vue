<template>
	<n-space vertical :size="24">
		<n-page-header>
			<template #title>
				<h1 class="page-title">Equipos Activos</h1>
			</template>
			<template #extra>
				<n-button type="primary" @click="mostrarModalAgregar = true" :render-icon="renderIconAdd">
					Agregar Equipo
				</n-button>
			</template>
		</n-page-header>

		<n-alert v-if="mensaje" type="success" closable @close="mensaje = ''">
			{{ mensaje }}
		</n-alert>

		<n-card title="Inventario de Equipos" :bordered="true" class="data-card">
			<n-data-table
				:columns="columns"
				:data="equipos"
				:row-key="rowKey"
				:loading="cargando"
				:pagination="{ pageSize: 10 }"
				responsive
			/>
		</n-card>

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
	</n-space>
</template>

<script setup lang="ts">
import { ref, h, onMounted, type Component } from 'vue'
import {
	NAlert,
	NSpace,
	NButton,
	NCard,
	NDataTable,
	useMessage,
	NPageHeader,
	NIcon,
	NTooltip,
	type DataTableColumns,
	NTime,
} from 'naive-ui'
import { Add as AddIcon, Archive, Pencil, SwapHorizontal } from '@vicons/ionicons5'
import { supabase } from '../lib/supabaseClient'
import type { Equipo } from '../types/equipo'
import EquipoAddModal from '../components/EquipoAddModal.vue'
import EquipoEditModal from '../components/EquipoEditModal.vue'
import EquipoReasignarModal from '../components/EquipoReasignarModal.vue'

// --- Iconos ---
const renderIconAdd = () => h(NIcon, null, { default: () => h(AddIcon) })

// --- Estado y Lógica General ---
const mensaje = ref('')
const message = useMessage()

// --- Estado de los Modales ---
const mostrarModalAgregar = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalReasignar = ref(false)
const equipoSeleccionado = ref<Equipo | null>(null)

// --- Lógica de Lista de Equipos ---
const equipos = ref<Equipo[]>([])
const cargando = ref(false)
const rowKey = (row: Equipo) => row.id!

const fetchData = async () => {
	cargando.value = true
	const { data, error } = await supabase.from('equipos').select('*').eq('estado', 'Activo')
	if (error) {
		console.error('Error fetching equipos:', error)
		message.error('No se pudieron cargar los equipos')
	} else {
		equipos.value = data
	}
	cargando.value = false
}

const darDeBaja = async (id: number) => {
	const { error } = await supabase.from('equipos').update({ estado: 'Inactivo' }).eq('id', id)
	if (error) {
		console.error('Error al dar de baja el equipo:', error)
		message.error('Falló la baja del equipo')
	} else {
		message.success('Equipo dado de baja correctamente')
		fetchData()
	}
}

// --- Funciones para abrir los modales ---
const abrirModalEditar = (equipo: Equipo) => {
	equipoSeleccionado.value = equipo
	mostrarModalEditar.value = true
}

const abrirModalReasignar = (equipo: Equipo) => {
	equipoSeleccionado.value = equipo
	mostrarModalReasignar.value = true
}

const columns: DataTableColumns<Equipo> = [
	{
		title: 'Fecha de Ingreso',
		key: 'fecha_ingreso',
		resizable: true,
		render(row: Equipo) {
			if (row.fecha_ingreso) {
				return h(NTime, {
					time: new Date(row.fecha_ingreso),
					type: 'relative',
				})
			}
			return 'N/A'
		},
	},
	{ title: 'Tipo de Equipo', key: 'tipo_equipo', resizable: true },
	{ title: 'Modelo', key: 'modelo', resizable: true },
	{ title: 'Dirección', key: 'direccion', resizable: true },
	{ title: 'Departamento', key: 'departamento', resizable: true },
	{ title: 'Unidad', key: 'unidad', resizable: true },
	{ title: 'Responsable', key: 'responsable', resizable: true },
	{
		title: 'Acciones',
		key: 'acciones',
		align: 'center',
		render(row: Equipo) {
			const renderTooltipButton = (
				tooltipText: string,
				icon: Component,
				onClick: () => void,
				type: 'default' | 'error' | 'primary' | 'info' | 'success' | 'warning' = 'default',
			) => {
				return h(
					NTooltip,
					{ trigger: 'hover' },
					{
						trigger: () =>
							h(
								NButton,
								{
									strong: true,
									tertiary: true,
									circle: true, // Lo ponemos circular pa' que se vea más pro
									type: type,
									onClick: onClick,
								},
								{ default: () => h(NIcon, null, { default: () => h(icon) }) },
							),
						default: () => tooltipText,
					},
				)
			}

			return h(
				NSpace,
				{ justify: 'center' },
				{
					default: () => [
						renderTooltipButton('Editar campos', Pencil, () => abrirModalEditar(row), 'info'),
						renderTooltipButton(
							'Reasignar',
							SwapHorizontal,
							() => abrirModalReasignar(row),
							'primary',
						),
						renderTooltipButton('Dar de Baja', Archive, () => darDeBaja(row.id!), 'error'),
					],
				},
			)
		},
	},
]

onMounted(fetchData)

// --- Lógica de los Modales ---
const handleEquipoAgregado = (msg: string) => {
	mensaje.value = msg
	fetchData()
}

const handleEquipoActualizado = () => {
	fetchData()
	equipoSeleccionado.value = null // Limpiamos la selección
}
</script>

<style scoped>
.page-title {
	font-size: 2rem;
	font-weight: 600;
	margin: 0;
}

.data-card {
	border-radius: 12px;
}
</style>
