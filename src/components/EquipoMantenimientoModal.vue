<template>
	<n-modal
		:show="show"
		preset="card"
		style="width: 1200px"
		title="Historial y Registro de Mantenimiento"
		:bordered="false"
		size="huge"
		role="dialog"
		aria-modal="true"
		@update:show="handleUpdateShow"
	>
		<n-spin :show="cargando">
			<n-space vertical :size="24">
				<n-card :bordered="false" size="small" :content-style="{ padding: '0' }">
					<n-h3 style="margin: 0">
						Equipo: <n-text type="primary">{{ equipo?.modelo }}</n-text>
						<n-text depth="3" style="margin-left: 12px">
							(Nº Serie: {{ equipo?.num_serie || 'N/A' }} | Inventario:
							{{ equipo?.num_inventario || 'N/A' }})
						</n-text>
					</n-h3>
				</n-card>

				<n-tabs type="line" animated default-value="registrar">
					<n-tab-pane name="detalles" tab="Detalles del Equipo">
						<n-grid x-gap="24" :cols="1">
							<n-gi>
								<n-card
									title="Información General"
									:bordered="false"
									:segmented="{ content: 'soft' }"
								>
									<n-descriptions :column="3" size="medium" label-placement="left">
										<n-descriptions-item label="Fecha de Ingreso">
											<n-time
												:time="new Date((equipo?.fecha_ingreso as string) || Date.now()).getTime()"
												format="dd-MM-yyyy HH:mm"
											/>
										</n-descriptions-item>
										<n-descriptions-item label="Registrado por">
											{{ equipo?.encargado_registro || 'Sistema/N/A' }}
										</n-descriptions-item>
										<n-descriptions-item label="Estado Actual">
											<n-tag
												:type="estadoTagType(equipo?.estado || 'N/A')"
												size="small"
												:bordered="false"
											>
												{{ equipo?.estado || 'N/A' }}
											</n-tag>
										</n-descriptions-item>

										<n-descriptions-item label="Dirección">
											{{ equipo?.direccion || 'N/A' }}
										</n-descriptions-item>
										<n-descriptions-item label="Departamento">
											{{ equipo?.departamento || 'N/A' }}
										</n-descriptions-item>
										<n-descriptions-item label="Unidad">
											{{ equipo?.unidad || 'N/A' }}
										</n-descriptions-item>

										<n-descriptions-item label="Responsable">
											<n-text type="info">{{ equipo?.responsable || 'Por asignar' }}</n-text>
										</n-descriptions-item>
										<n-descriptions-item label="Tipo de Equipo">
											{{ equipo?.tipo_equipo || 'N/A' }}
										</n-descriptions-item>
										<n-descriptions-item label="Nº de Serie">
											{{ equipo?.num_serie || 'N/A' }}
										</n-descriptions-item>
									</n-descriptions>
								</n-card>
							</n-gi>

							<n-gi>
								<n-card
									title="Especificaciones Técnicas"
									:bordered="false"
									:segmented="{ content: 'soft' }"
									style="margin-top: 16px"
								>
									<n-descriptions :column="3" size="medium" label-placement="left">
										<n-descriptions-item
											v-for="(value, key) in equipo?.detalles"
											:key="key"
											:label="String(formatKey(key))"
										>
											{{ value || 'N/A' }}
										</n-descriptions-item>
									</n-descriptions>
									<n-empty
										v-if="!equipo?.detalles || Object.keys(equipo.detalles).length === 0"
										description="No hay especificaciones técnicas registradas."
										size="small"
										style="padding: 10px 0"
									/>
								</n-card>
							</n-gi>
						</n-grid>
					</n-tab-pane>

					<n-tab-pane name="registrar" tab="Registrar Mantenimiento">
						<n-grid x-gap="24" :cols="24">
							<n-gi :span="12">
								<n-card :bordered="false" :segmented="{ content: 'soft' }">
									<template #header>
										<n-h4 style="margin: 0">Registrar Nuevo Mantenimiento</n-h4>
									</template>
									<n-form ref="formRef" :model="mantenimientoForm" :rules="rules">
										<n-form-item label="Fecha del Mantenimiento" path="fecha">
											<n-date-picker
												v-model:value="mantenimientoForm.fecha"
												type="date"
												clearable
												disabled
												format="dd/MM/yyyy"
												style="width: 100%"
											/>
										</n-form-item>

										<n-form-item label="Encargado de Mantenimiento" path="encargado_mantenimiento">
											<n-input
												v-model:value="mantenimientoForm.encargado_mantenimiento"
												placeholder="Nombre del encargado"
											/>
										</n-form-item>

										<n-form-item
											label="Descripción de Tareas Realizadas"
											path="descripcion"
											required
										>
											<n-input
												v-model:value="mantenimientoForm.descripcion"
												type="textarea"
												:autosize="{ minRows: 3, maxRows: 6 }"
												placeholder="Describe detalladamente el mantenimiento (ej: Limpieza interna, cambio de pasta térmica, actualización de OS)."
											/>
										</n-form-item>

										<n-form-item label="Notas Adicionales" path="notas">
											<n-input
												v-model:value="mantenimientoForm.notas"
												type="textarea"
												:autosize="{ minRows: 2, maxRows: 4 }"
												placeholder="Cualquier otra observación o recomendación futura."
											/>
										</n-form-item>

										<n-space justify="end" style="margin-top: 24px">
											<n-button @click="handleUpdateShow(false)">Cancelar</n-button>
											<n-button type="primary" @click="saveMantenimiento" :loading="cargando">
												Guardar Registro
											</n-button>
										</n-space>
									</n-form>
								</n-card>
							</n-gi>

							<n-gi :span="12">
								<n-card :bordered="false" :segmented="{ content: 'soft' }">
									<template #header>
										<n-h4 style="margin: 0">Actualizar Detalles y Componentes</n-h4>
									</template>
									<n-space v-if="camposEspecificos.length > 0" vertical :size="16">
										<n-form-item
											v-for="campo in camposEspecificos"
											:key="campo.key"
											:label="campo.label"
											:show-feedback="false"
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
												clearable
											/>
										</n-form-item>
									</n-space>
									<n-empty
										v-else
										description="No hay detalles configurables para este tipo de equipo."
									/>
								</n-card>
							</n-gi>
						</n-grid>
					</n-tab-pane>

					<n-tab-pane name="historial" tab="Historial de Mantenimiento">
						<n-card :bordered="false" :segmented="{ content: 'soft' }">
							<n-scrollbar style="max-height: 500px; padding: 0 16px 0 0">
								<n-timeline
									v-if="
										equipo?.historial_mantenimiento && equipo.historial_mantenimiento.length > 0
									"
									:icon-size="20"
									style="padding-left: 10px"
								>
									<n-timeline-item
										v-for="(mantenimiento, index) in equipo.historial_mantenimiento
											.slice()
											.reverse()"
										:key="index"
										:type="index === 0 ? 'success' : 'info'"
										:title="`Mantenimiento - ${mantenimiento.fecha}`"
									>
										<n-space vertical :size="4">
											<n-text strong>{{ mantenimiento.descripcion }}</n-text>

											<n-text depth="3" style="font-size: 0.875rem">
												Encargado: {{ mantenimiento.encargado_mantenimiento || 'Sin especificar' }}
											</n-text>

											<n-text v-if="mantenimiento.notas" depth="2" style="font-style: italic">
												Notas: {{ mantenimiento.notas }}
											</n-text>
										</n-space>
									</n-timeline-item>
								</n-timeline>
								<n-empty
									v-else
									description="No hay registros de mantenimiento para este equipo."
									size="large"
									style="padding: 40px 0"
								/>
							</n-scrollbar>
						</n-card>
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
	NH4,
	NTimeline,
	NTimelineItem,
	NEmpty,
	NCard,
	NGi,
	NSelect,
	NGrid,
	NText,
	NScrollbar,
	NTime,
	NTag,
	NDescriptions,
	NDescriptionsItem,
	useMessage,
	type FormRules,
	type FormInst,
} from 'naive-ui'
import { supabase } from '../lib/supabaseClient'
import type { Equipo, Mantenimiento, CambioComponente } from '../types/equipo'
import { especificacionesPorEquipo } from '../data/listas'
import { useAuthStore } from '@/stores/auth'

const message = useMessage()
const authStore = useAuthStore()
const props = defineProps<{
	show: boolean
	equipo: Equipo | null
}>()
const emit = defineEmits(['update:show', 'equipoActualizado'])

const cargando = ref(false)
const formRef = ref<FormInst | null>(null)

// Tipado del formulario: Usamos Mantenimiento, pero forzamos 'fecha' a number
const mantenimientoForm: Mantenimiento & { fecha: number } = reactive({
	fecha: Date.now(), // number
	descripcion: '',
	encargado_mantenimiento: authStore.userNombre || null,
	notas: null,
}) as Mantenimiento & { fecha: number }

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

// Función auxiliar para determinar el color del tag de estado
const estadoTagType = (estado: string) => {
	switch (estado.toLowerCase()) {
		case 'activo':
			return 'success'
		case 'inactivo':
			return 'error'
		case 'en reparación':
			return 'warning'
		default:
			return 'default'
	}
}

// Función auxiliar para formatear las keys de 'detalles'
const formatKey = (key: string): string => {
	const formatted = key.replace(/_/g, ' ')
	return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

const handleUpdateShow = (value: boolean) => {
	emit('update:show', value)
	if (!value) {
		resetForm()
	} else {
		mantenimientoForm.encargado_mantenimiento = authStore.userNombre || null
	}
}

const resetForm = () => {
	mantenimientoForm.fecha = Date.now()
	mantenimientoForm.descripcion = ''
	mantenimientoForm.encargado_mantenimiento = authStore.userNombre || null
	mantenimientoForm.notas = null
	detallesEditables.value = {}
	formRef.value?.restoreValidation()
}

// Función para crear el registro final que se envía a la DB
function crearRegistroMantenimiento(form: typeof mantenimientoForm): Mantenimiento {
	// Se asegura que se convierte el number a string
	const fechaISO = new Date(form.fecha as number).toISOString().split('T')[0]
	return {
		fecha: fechaISO,
		descripcion: form.descripcion,
		encargado_mantenimiento: form.encargado_mantenimiento || null,
		notas: form.notas || null,
	}
}

function generarHistorialDeCambios(
	detallesOriginales: Equipo['detalles'],
	detallesNuevos: typeof detallesEditables.value,
): CambioComponente[] {
	const cambios: CambioComponente[] = []
	// Se asegura que se convierte el number a string
	const fechaCambio = new Date(mantenimientoForm.fecha as number).toISOString().split('T')[0]

	for (const key in detallesNuevos) {
		const valorOriginal = detallesOriginales?.[key] ?? null
		const valorNuevo = detallesNuevos[key]

		const valorNuevoLimpio = valorNuevo === '' ? null : valorNuevo
		const valorOriginalLimpio = valorOriginal === '' ? null : valorOriginal

		if (String(valorOriginalLimpio) !== String(valorNuevoLimpio)) {
			cambios.push({
				fecha: fechaCambio, // string
				componente: key,
				valor_anterior: valorOriginalLimpio,
				valor_nuevo: valorNuevoLimpio === undefined ? null : valorNuevoLimpio,
				notas: `Modificado durante mantenimiento el ${new Date(
					mantenimientoForm.fecha as number,
				).toLocaleDateString('es-CL')}`,
			})
		}
	}
	return cambios
}

const saveMantenimiento = async () => {
	try {
		await formRef.value?.validate()
	} catch {
		return message.error('Ojo, rellená la descripción del mantenimiento, mi rey.')
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

	const detallesFinales = { ...props.equipo.detalles }
	for (const key in detallesEditables.value) {
		detallesFinales[key] =
			detallesEditables.value[key] === undefined ? null : detallesEditables.value[key]
	}

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
		message.error('¡Puta, hubo un error al guardar el registro! Revisa la consola, *manito*.')
		console.error(error.message)
	} else {
		message.success('¡Registro guardado con éxito! Tamo listos.')
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
					// Manejo especial para booleanos/selects 'Sí'/'No' (ej: es_poe)
					if (key === 'es_poe' && (value === true || value === 'Sí')) {
						newDetalles[key] = 'Sí'
					} else if (key === 'es_poe' && (value === false || value === 'No')) {
						newDetalles[key] = 'No'
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
