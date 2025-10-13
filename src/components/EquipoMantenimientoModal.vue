<template>
	<n-modal
		:show="show"
		preset="card"
		style="width: 1000px"
		title="Historial y Registro de Mantenimiento"
		:bordered="false"
		size="huge"
		role="dialog"
		aria-modal="true"
		@update:show="handleUpdateShow"
	>
		<n-spin :show="cargando">
			<n-space vertical>
				<n-h3
					>Equipo: {{ equipo?.modelo }} ({{ equipo?.num_serie || equipo?.num_inventario }})</n-h3
				>

				<n-tabs type="line" animated>
					<n-tab-pane name="historial" tab="Historial de Mantenimiento">
						<n-timeline
							v-if="equipo?.historial_mantenimiento && equipo.historial_mantenimiento.length > 0"
						>
							<n-timeline-item
								v-for="(mantenimiento, index) in equipo.historial_mantenimiento"
								:key="index"
								:type="index === equipo.historial_mantenimiento.length - 1 ? 'success' : 'default'"
								:title="`Mantenimiento del ${mantenimiento.fecha}`"
								:content="mantenimiento.descripcion"
								:time="mantenimiento.tecnico ? `Técnico: ${mantenimiento.tecnico}` : ''"
							>
								<template #footer v-if="mantenimiento.notas">
									Notas: {{ mantenimiento.notas }}
								</template>
							</n-timeline-item>
						</n-timeline>
						<n-empty v-else description="No hay registros de mantenimiento para este equipo." />
					</n-tab-pane>

					<n-tab-pane name="registrar" tab="Registrar Mantenimiento">
						<n-grid x-gap="16" y-gap="16" :cols="24">
							<!-- Panel Izquierdo -->
							<n-gi :span="12">
								<n-card title="Registrar Nuevo Mantenimiento" size="large" bordered>
									<n-form ref="formRef" :model="mantenimientoForm" :rules="rules">
										<n-form-item label="Fecha" path="fecha">
											<n-date-picker
												v-model:value="mantenimientoForm.fecha"
												type="date"
												clearable
												readonly
												disabled
												format="dd/MM/yyyy"
											/>
										</n-form-item>
										<n-form-item label="Descripción" path="descripcion" required>
											<n-input
												v-model:value="mantenimientoForm.descripcion"
												type="textarea"
												placeholder="Describe el mantenimiento realizado"
											/>
										</n-form-item>
										<n-form-item label="Técnico Responsable" path="tecnico">
											<n-input
												v-model:value="mantenimientoForm.tecnico"
												placeholder="Nombre del técnico"
											/>
										</n-form-item>
										<n-form-item label="Notas Adicionales" path="notas">
											<n-input
												v-model:value="mantenimientoForm.notas"
												type="textarea"
												placeholder="Cualquier otra observación"
											/>
										</n-form-item>

										<n-space justify="end">
											<n-button @click="handleUpdateShow(false)">Cancelar</n-button>
											<n-button type="primary" @click="saveMantenimiento" :loading="cargando">
												Guardar
											</n-button>
										</n-space>
									</n-form>
								</n-card>
							</n-gi>

							<!-- Panel Derecho -->
							<n-gi :span="12">
								<n-card title="Actualizar Componentes" size="large" bordered>
									<n-space v-if="camposEspecificos.length > 0" vertical>
										<n-form-item
											v-for="campo in camposEspecificos"
											:key="campo.key"
											:label="campo.label"
										>
											<n-input
												v-if="campo.type === 'input'"
												v-model:value="detallesEditables[campo.key]"
												:placeholder="campo.placeholder"
											/>
											<n-select
												v-else-if="campo.type === 'select'"
												v-model:value="detallesEditables[campo.key]"
												:options="campo.options?.map((opt) => ({ label: opt, value: opt })) || []"
												:placeholder="campo.placeholder"
											/>
										</n-form-item>
									</n-space>
								</n-card>
							</n-gi>
						</n-grid>
					</n-tab-pane>
				</n-tabs>
			</n-space>
		</n-spin>
	</n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import {
	NModal,
	NSpin,
	NSpace,
	NButton,
	NForm,
	NFormItem,
	NInput,
	NDatePicker,
	NTabs,
	NTabPane,
	NH3,
	NTimeline,
	NTimelineItem,
	NEmpty,
	NCard,
	NGi,
	NSelect,
	NGrid,
	useMessage,
	type FormRules,
	type FormInst,
} from 'naive-ui'
import { supabase } from '../lib/supabaseClient'
import type { Equipo, Mantenimiento, CambioComponente } from '../types/equipo'
import { especificacionesPorEquipo } from '../data/listas'

const message = useMessage()
const props = defineProps<{
	show: boolean
	equipo: Equipo | null
}>()
const emit = defineEmits(['update:show', 'equipoActualizado'])

const cargando = ref(false)
const formRef = ref<FormInst | null>(null)

const mantenimientoForm = reactive({
	fecha: Date.now(),
	descripcion: '',
	tecnico: '',
	notas: '',
})

const detallesEditables = ref<{ [key: string]: string | null }>({})

const camposEspecificos = computed(() => {
	if (props.equipo?.tipo_equipo) {
		return especificacionesPorEquipo[props.equipo.tipo_equipo] || []
	}
	return []
})

const rules: FormRules = {
	descripcion: {
		required: true,
		message: 'Por favor, ingresa una descripción del mantenimiento.',
		trigger: ['blur', 'input'],
	},
}

const handleUpdateShow = (value: boolean) => {
	emit('update:show', value)
	if (!value) {
		resetForm()
	}
}

const resetForm = () => {
	mantenimientoForm.fecha = Date.now()
	mantenimientoForm.descripcion = ''
	mantenimientoForm.tecnico = ''
	mantenimientoForm.notas = ''
	detallesEditables.value = {}
	formRef.value?.restoreValidation()
}

function crearRegistroMantenimiento(form: typeof mantenimientoForm): Mantenimiento {
	return {
		fecha: new Date(form.fecha).toISOString().split('T')[0],
		descripcion: form.descripcion,
		tecnico: form.tecnico || undefined, // undefined si es string vacío
		notas: form.notas || undefined, // undefined si es string vacío
	}
}

function generarHistorialDeCambios(
	detallesOriginales: Equipo['detalles'],
	detallesNuevos: typeof detallesEditables.value,
): CambioComponente[] {
	const cambios: CambioComponente[] = []
	const fechaCambio = new Date().toISOString().split('T')[0]

	for (const key in detallesNuevos) {
		const valorOriginal = detallesOriginales?.[key] ?? null
		const valorNuevo = detallesNuevos[key]

		// Comparamos los valores convertidos a string para evitar problemas de tipos
		if (String(valorOriginal) !== String(valorNuevo)) {
			cambios.push({
				fecha: fechaCambio,
				componente: key,
				valor_anterior: valorOriginal,
				valor_nuevo: valorNuevo ?? null, // Aseguramos que sea null si es undefined
				notas: `Modificado durante mantenimiento el ${new Date(
					mantenimientoForm.fecha,
				).toLocaleDateString()}`,
			})
		}
	}
	return cambios
}

const saveMantenimiento = async () => {
	try {
		await formRef.value?.validate()
	} catch {
		return message.error('Por favor, completa los campos obligatorios.')
	}

	if (!props.equipo) return

	cargando.value = true

	const nuevoMantenimiento = crearRegistroMantenimiento(mantenimientoForm)
	const cambiosComponentes = generarHistorialDeCambios(
		props.equipo.detalles,
		detallesEditables.value,
	)

	const historialMantenimientoFinal = [
		...(props.equipo.historial_mantenimiento || []),
		nuevoMantenimiento,
	]
	const historialComponentesFinal = [
		...(props.equipo.historial_componentes_modificados || []),
		...cambiosComponentes,
	]

	// Unimos los detalles originales con los nuevos pa' no perder nada
	const detallesFinales = { ...props.equipo.detalles, ...detallesEditables.value }

	const { error } = await supabase
		.from('equipos')
		.update({
			historial_mantenimiento: historialMantenimientoFinal,
			historial_componentes_modificados: historialComponentesFinal,
			detalles: detallesFinales,
		})
		.eq('id', props.equipo.id)

	cargando.value = false

	if (error) {
		message.error('Error al guardar el registro.')
		console.error(error.message)
	} else {
		message.success('Registro guardado con éxito.')
		emit('equipoActualizado')
		handleUpdateShow(false)
	}
}

watch(
	() => props.show,
	(newVal) => {
		if (newVal && props.equipo) {
			const newDetalles: { [key: string]: string | null } = {}
			const details = props.equipo.detalles || {}

			for (const key in details) {
				if (Object.prototype.hasOwnProperty.call(details, key)) {
					const value = details[key]
					if (key === 'es_poe') {
						newDetalles[key] = value === true || value === 'Sí' ? 'Sí' : 'No'
					} else {
						newDetalles[key] = value !== null && value !== undefined ? String(value) : null
					}
				}
			}
			detallesEditables.value = newDetalles
		} else if (!newVal) {
			resetForm()
		}
	},
	{ immediate: true },
)
</script>
