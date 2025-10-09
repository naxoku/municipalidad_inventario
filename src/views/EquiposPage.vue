<template>
	<n-space vertical :size="24">
		<!-- 1. Encabezado de Página para Jerarquía -->
		<n-page-header>
			<template #title>
				<h1 class="page-title">Equipos Activos</h1>
			</template>
			<template #extra>
				<!-- 3. Botón de Acción Mejorado -->
				<n-button type="primary" @click="mostrarModal = true" :render-icon="renderIconAdd">
					Agregar Equipo
				</n-button>
			</template>
		</n-page-header>

		<!-- Mensaje de Alerta -->
		<n-alert v-if="mensaje" type="success" closable @close="mensaje = ''">
			{{ mensaje }}
		</n-alert>

		<!-- 2. Encapsulamiento de la Tabla en una Tarjeta -->
		<n-card title="Inventario de Equipos" :bordered="false" class="data-card">
			<n-data-table :columns="columns" :data="equipos" :row-key="rowKey" :loading="cargando"
				:pagination="{ pageSize: 10 }" responsive />
		</n-card>

		<!-- Modal para Agregar Equipo (Mejorado) -->
		<n-modal v-model:show="mostrarModal" preset="card" style="width: 600px" title="Agregar Nuevo Equipo"
			:bordered="false" size="huge" role="dialog" aria-modal="true">
			<n-spin :show="cargandoForm">
				<n-form @submit.prevent="agregarEquipo">
					<n-grid :x-gap="24" :y-gap="24" :cols="1">
						<n-gi>
							<n-form-item label="Tipo de equipo" required>
								<n-input v-model:value="nuevoEquipo.tipo_equipo" placeholder="Ej: Notebook" />
							</n-form-item>
						</n-gi>
						<n-gi>
							<n-form-item label="Modelo" required>
								<n-input v-model:value="nuevoEquipo.modelo" placeholder="Ej: HP ProBook 450 G6" />
							</n-form-item>
						</n-gi>
						<n-gi>
							<n-form-item label="Número de serie">
								<n-input v-model:value="nuevoEquipo.num_serie" placeholder="Ej: SN123456" />
							</n-form-item>
						</n-gi>
						<n-gi>
							<n-form-item label="Número de inventario">
								<n-input v-model:value="nuevoEquipo.num_inventario" placeholder="Ej: INV-001" />
							</n-form-item>
						</n-gi>
						<n-gi>
							<n-form-item label="Departamento">
								<n-input v-model:value="nuevoEquipo.departamento" placeholder="Ej: IT" />
							</n-form-item>
						</n-gi>
					</n-grid>
					<!-- 5. Acciones del Modal Agrupadas -->
					<n-space justify="end" style="margin-top: 24px">
						<n-button @click="mostrarModal = false">Cancelar</n-button>
						<n-button type="primary" attr-type="submit" :loading="cargandoForm">
							Guardar Equipo
						</n-button>
					</n-space>
				</n-form>
			</n-spin>
		</n-modal>
	</n-space>
</template>

<script setup lang="ts">
import { ref, h, onMounted, reactive } from 'vue'
import {
	NAlert,
	NSpace,
	NButton,
	NModal,
	NCard,
	NDataTable,
	useMessage,
	NForm,
	NFormItem,
	NInput,
	NSpin,
	NPageHeader,
	NGrid,
	NGi,
	NIcon,
} from 'naive-ui'
import { Add as AddIcon } from '@vicons/ionicons5'
import { supabase } from '../lib/supabaseClient'
import type { Equipo } from '../types/equipo'

// --- Iconos ---
const renderIconAdd = () => h(NIcon, null, { default: () => h(AddIcon) })

// --- Estado y Lógica General ---
const mensaje = ref('')
const mostrarModal = ref(false)
const message = useMessage()

// --- Lógica de Lista de Equipos ---
const equipos = ref<Equipo[]>([])
const cargando = ref(false)
const rowKey = (row: Equipo) => row.id!

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
		fetchData()
	}
}

const columns = [
	{ title: 'Tipo de Equipo', key: 'tipo_equipo', resizable: true },
	{ title: 'Modelo', key: 'modelo', resizable: true },
	{ title: 'N° Serie', key: 'num_serie', resizable: true },
	{ title: 'N° Inventario', key: 'num_inventario', resizable: true },
	{ title: 'Departamento', key: 'departamento', resizable: true },
	{
		title: 'Acciones',
		key: 'acciones',
		render: (row: Equipo) =>
			h(
				NButton,
				{ strong: true, tertiary: true, size: 'small', type: 'error', onClick: () => darDeBaja(row.id!) },
				{ default: () => 'Dar de baja' },
			),
	},
]

onMounted(fetchData)

// --- Lógica de Agregar Equipo ---
const cargandoForm = ref(false)
const nuevoEquipo = reactive<Partial<Equipo>>({
	tipo_equipo: '',
	modelo: '',
	num_serie: '',
	num_inventario: '',
	departamento: '',
	estado: 'Activo',
})

const resetForm = () => {
	Object.assign(nuevoEquipo, {
		tipo_equipo: '',
		modelo: '',
		num_serie: '',
		num_inventario: '',
		departamento: '',
		estado: 'Activo',
	})
}

const agregarEquipo = async () => {
	cargandoForm.value = true
	const { data, error } = await supabase.from('Equipos').insert([nuevoEquipo]).select()
	cargandoForm.value = false

	if (error) {
		console.error('Error al agregar equipo:', error.message)
		message.error('Error al agregar el equipo')
	} else if (data && data.length > 0) {
		mostrarModal.value = false
		mensaje.value = '¡Equipo agregado con éxito!'
		fetchData()
		resetForm()
	}
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
