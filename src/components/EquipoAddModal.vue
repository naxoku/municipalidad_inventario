<template>
	<n-modal
		v-model:show="mostrarModal"
		preset="card"
		style="width: 1000px"
		title="Agregar Nuevo Equipo"
		:bordered="false"
		size="huge"
		role="dialog"
		aria-modal="true"
	>
		<n-spin :show="cargandoForm">
			<n-form @submit.prevent="agregarEquipo">
				<n-grid :x-gap="24" :cols="24">
					<n-gi :span="11">
						<n-space vertical>
							<n-form-item label="Tipo de equipo" required>
								<n-select
									v-model:value="nuevoEquipo.tipo_equipo"
									placeholder="Selecciona un equipo"
									:options="opcionesTiposDeEquipo"
									filterable
								/>
							</n-form-item>
							<n-form-item label="Modelo" required>
								<n-input v-model:value="nuevoEquipo.modelo" placeholder="Ej: HP ProBook 450 G6" />
							</n-form-item>
							<n-form-item label="Número de serie">
								<n-input v-model:value="nuevoEquipo.num_serie" placeholder="Ej: SN123456" />
							</n-form-item>
							<n-form-item label="Número de inventario">
								<n-input v-model:value="nuevoEquipo.num_inventario" placeholder="Ej: INV-001" />
							</n-form-item>
							<n-form-item label="Dirección / Entidad" required>
								<n-select
									v-model:value="nuevoEquipo.direccion"
									placeholder="Selecciona una dirección"
									:options="opcionesDirecciones"
									filterable
								/>
							</n-form-item>
							<n-form-item
								label="Departamento / Oficina"
								:required="!!nuevoEquipo.direccion && opcionesDepartamentos.length > 0"
							>
								<n-select
									v-model:value="nuevoEquipo.departamento"
									placeholder="Selecciona un departamento"
									:options="opcionesDepartamentos"
									:disabled="!nuevoEquipo.direccion || opcionesDepartamentos.length === 0"
									filterable
								/>
							</n-form-item>
							<n-form-item
								label="Unidad Específica"
								:required="!!nuevoEquipo.departamento && opcionesUnidades.length > 0"
							>
								<n-select
									v-model:value="nuevoEquipo.unidad"
									placeholder="Selecciona una unidad"
									:options="opcionesUnidades"
									:disabled="!nuevoEquipo.departamento || opcionesUnidades.length === 0"
									filterable
								/>
							</n-form-item>
							<n-form-item label="Responsable del equipo">
								<n-input v-model:value="nuevoEquipo.responsable" placeholder="Ej: Juan Pérez" />
							</n-form-item>
							<n-form-item label="Encargado de registro">
								<n-input
									v-model:value="nuevoEquipo.encargado_registro"
									placeholder="Nombre del encargado"
									disabled
								/>
							</n-form-item>
						</n-space>
					</n-gi>

					<n-gi :span="2"><n-divider vertical style="height: 100%" /></n-gi>

					<n-gi :span="11">
						<n-space v-if="camposEspecificos!.length > 0" vertical>
							<n-form-item v-for="campo in camposEspecificos" :key="campo.key" :label="campo.label">
								<n-input
									v-if="campo.type === 'input'"
									v-model:value="nuevoEquipo.detalles[campo.key]"
									:placeholder="campo.placeholder"
								/>
								<n-select
									v-else-if="campo.type === 'select'"
									v-model:value="nuevoEquipo.detalles[campo.key]"
									:placeholder="campo.placeholder"
									:options="campo.options?.map((opt) => ({ label: opt, value: opt }))"
									filterable
								/>
							</n-form-item>
						</n-space>
						<n-empty v-else description="Selecciona un tipo de equipo para ver sus detalles." />
					</n-gi>
				</n-grid>

				<n-space justify="end" style="margin-top: 24px">
					<n-button @click="mostrarModal = false">Cancelar</n-button>
					<n-button type="primary" attr-type="submit" :loading="cargandoForm">
						Agregar equipo
					</n-button>
				</n-space>
			</n-form>
		</n-spin>
	</n-modal>
</template>

<script setup lang="ts">
import { reactive, computed, ref, watch } from 'vue'
import {
	NModal,
	NSpin,
	NForm,
	NFormItem,
	NGrid,
	NGi,
	NInput,
	NSelect,
	NSpace,
	NButton,
	useMessage,
	NDivider,
	NEmpty,
} from 'naive-ui'
import { supabase } from '../lib/supabaseClient'
import type { Equipo } from '../types/equipo'
import {
	organigrama,
	opcionesDirecciones,
	opcionesTiposDeEquipo,
	especificacionesPorEquipo,
} from '@/data/listas'
import { useAuthStore } from '@/stores/auth' // Importar el store de autenticación

const message = useMessage()
const authStore = useAuthStore() // Usar el store de autenticación
const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['update:show', 'equipoAgregado'])
const mostrarModal = computed({
	get: () => props.show,
	set: (value) => {
		emit('update:show', value)
		if (!value) {
			resetForm()
		} else {
			// Autocompletar el encargado de registro al abrir el modal
			nuevoEquipo.encargado_registro = authStore.userNombre
		}
	},
})
const cargandoForm = ref(false)

const nuevoEquipo = reactive<
	Partial<Equipo> & {
		detalles: { [key: string]: string }
		encargado_registro: string
		fecha_ingreso: string
	}
>({
	tipo_equipo: null,
	modelo: '',
	num_serie: '',
	num_inventario: '',
	direccion: '',
	departamento: '',
	unidad: '',
	responsable: '',
	estado: 'Activo',
	detalles: {},
	encargado_registro: authStore.userNombre,
	fecha_ingreso: new Date().toISOString(),
})

const opcionesDepartamentos = computed(() => {
	const departamentos = nuevoEquipo.direccion ? organigrama[nuevoEquipo.direccion] : undefined
	if (departamentos) {
		return Object.keys(departamentos).map((depto) => ({
			label: depto,
			value: depto,
		}))
	}
	return []
})

const opcionesUnidades = computed(() => {
	const departamentos = nuevoEquipo.direccion ? organigrama[nuevoEquipo.direccion] : undefined
	if (departamentos && nuevoEquipo.departamento) {
		const unidades = departamentos[nuevoEquipo.departamento]
		if (unidades) {
			return unidades.map((unidad: string) => ({
				label: unidad,
				value: unidad,
			}))
		}
	}
	return []
})

const camposEspecificos = computed(() => {
	if (nuevoEquipo.tipo_equipo && especificacionesPorEquipo[nuevoEquipo.tipo_equipo]) {
		return especificacionesPorEquipo[nuevoEquipo.tipo_equipo]
	}
	return []
})

watch(
	() => nuevoEquipo.direccion,
	() => {
		nuevoEquipo.departamento = ''
		nuevoEquipo.unidad = ''
	},
)

watch(
	() => nuevoEquipo.departamento,
	() => {
		nuevoEquipo.unidad = ''
	},
)

watch(
	() => nuevoEquipo.tipo_equipo,
	() => {
		nuevoEquipo.detalles = {}
	},
)

const resetForm = () => {
	Object.assign(nuevoEquipo, {
		tipo_equipo: null,
		modelo: '',
		num_serie: '',
		num_inventario: '',
		direccion: '',
		departamento: '',
		unidad: '',
		responsable: '',
		estado: 'Activo',
		detalles: {},
		encargado_registro: authStore.userNombre, // Resetear también el encargado de registro
		fecha_ingreso: new Date().toISOString(), // Resetear también la fecha de registro
	})
}

const agregarEquipo = async () => {
	if (
		!nuevoEquipo.tipo_equipo ||
		!nuevoEquipo.modelo ||
		!nuevoEquipo.direccion ||
		!nuevoEquipo.departamento ||
		!nuevoEquipo.encargado_registro // Validar el nuevo campo
	) {
		message.error('Por favor, completa los campos obligatorios.')
		return
	}
	if (opcionesUnidades.value.length > 0 && !nuevoEquipo.unidad) {
		message.error('Debes seleccionar una Unidad específica.')
		return
	}
	cargandoForm.value = true
	const { data, error } = await supabase
		.from('equipos')
		.insert([{ ...nuevoEquipo }])
		.select()
	cargandoForm.value = false
	if (error) {
		console.error('Error al agregar equipo:', error.message)
		message.error('Error al agregar el equipo')
	} else if (data && data.length > 0) {
		emit('update:show', false)
		message.success('Equipo agregado con éxito.')
		resetForm()
	}
}
</script>
