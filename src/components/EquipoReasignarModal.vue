<template>
	<n-modal
		:show="show"
		preset="card"
		style="width: 600px"
		title="Reasignar Equipo"
		@update:show="$emit('update:show', $event)"
	>
		<n-spin :show="cargando">
			<n-form @submit.prevent="guardarCambios">
				<n-space vertical>
					<n-form-item label="Dirección / Entidad" required>
						<n-select
							v-model:value="formValue.direccion"
							:options="opcionesDirecciones"
							filterable
						/>
					</n-form-item>
					<n-form-item label="Departamento / Oficina" required>
						<n-select
							v-model:value="formValue.departamento"
							:options="opcionesDepartamentos"
							:disabled="!formValue.direccion || opcionesDepartamentos.length === 0"
							filterable
						/>
					</n-form-item>
					<n-form-item label="Unidad Específica">
						<n-select
							v-model:value="formValue.unidad"
							:options="opcionesUnidades"
							:disabled="!formValue.departamento || opcionesUnidades.length === 0"
							filterable
						/>
					</n-form-item>
					<n-form-item label="Responsable">
						<n-input v-model:value="formValue.responsable" placeholder="Ej: Juan Pérez" />
					</n-form-item>
				</n-space>
				<n-space justify="end" style="margin-top: 24px">
					<n-button @click="$emit('update:show', false)">Cancelar</n-button>
					<n-button type="primary" attr-type="submit" :loading="cargando">Reasignar</n-button>
				</n-space>
			</n-form>
		</n-spin>
	</n-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue' // <-- Importamos nextTick
import {
	NModal,
	NSpin,
	NForm,
	NFormItem,
	NInput,
	NSelect,
	NSpace,
	NButton,
	useMessage,
} from 'naive-ui'
import { supabase } from '../lib/supabaseClient'
import type { Equipo } from '../types/equipo'
import { organigrama, opcionesDirecciones } from '@/data/listas'

const props = defineProps<{
	show: boolean
	equipo: Equipo | null
}>()

const emit = defineEmits(['update:show', 'equipoActualizado'])
const message = useMessage()
const cargando = ref(false)
const formValue = ref<Partial<Equipo>>({})

// Para controlar la carga de datos
const isLoading = ref(false)

watch(
	() => props.equipo,
	async (newEquipo) => {
		if (newEquipo) {
			isLoading.value = true
			formValue.value = JSON.parse(JSON.stringify(newEquipo))
			await nextTick()
			isLoading.value = false
		}
	},
	{ immediate: true, deep: true },
)

const opcionesDepartamentos = computed(() => {
	if (formValue.value.direccion && organigrama[formValue.value.direccion]) {
		return Object.keys(organigrama[formValue.value.direccion] ?? {}).map((depto) => ({
			label: depto,
			value: depto,
		}))
	}
	return []
})

const opcionesUnidades = computed(() => {
	if (
		formValue.value.direccion &&
		formValue.value.departamento &&
		organigrama[formValue.value.direccion]?.[formValue.value.departamento]
	) {
		return organigrama[formValue.value.direccion]![formValue.value.departamento]!.map(
			(unidad: string) => ({
				label: unidad,
				value: unidad,
			}),
		)
	}
	return []
})

watch(
	() => formValue.value.direccion,
	() => {
		if (isLoading.value) return
		formValue.value.departamento = undefined
		formValue.value.unidad = undefined
	},
)

watch(
	() => formValue.value.departamento,
	() => {
		if (isLoading.value) return
		formValue.value.unidad = undefined
	},
)

const guardarCambios = async () => {
	if (!formValue.value.direccion || !formValue.value.departamento) {
		message.error('Dirección y Departamento son obligatorios.')
		return
	}
	if (opcionesUnidades.value.length > 0 && !formValue.value.unidad) {
		message.error('Debes seleccionar una Unidad para este Departamento.')
		return
	}
	if (opcionesUnidades.value.length === 0) {
		formValue.value.unidad = undefined
	}

	cargando.value = true
	const { error } = await supabase
		.from('equipos')
		.update({
			direccion: formValue.value.direccion,
			departamento: formValue.value.departamento,
			unidad: formValue.value.unidad,
			responsable: formValue.value.responsable,
		})
		.eq('id', props.equipo!.id)
	cargando.value = false

	if (error) {
		message.error('No se pudo reasignar el equipo.')
	} else {
		message.success('Equipo reasignado con éxito.')
		emit('equipoActualizado')
		emit('update:show', false)
	}
}
</script>
