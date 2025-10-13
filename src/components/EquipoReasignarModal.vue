<template>
	<n-modal
		:show="show"
		preset="card"
		style="width: 1000px"
		title="Reasignar equipo"
		:bordered="false"
		size="huge"
		role="dialog"
		aria-modal="true"
		@update:show="handleUpdateShow"
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
					<n-form-item label="Departamento / Oficina">
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
import { ref, watch, computed, nextTick } from 'vue'
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

const handleUpdateShow = (value: boolean) => {
	emit('update:show', value)
	if (!value) {
		resetForm()
	}
}

const resetForm = () => {
	formValue.value = {}
}

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
		formValue.value.departamento = null
		formValue.value.unidad = null
	},
)

watch(
	() => formValue.value.departamento,
	() => {
		if (isLoading.value) return
		formValue.value.unidad = null
	},
)

const guardarCambios = async () => {
	if (!formValue.value.direccion) {
		message.error('Dirección es obligatoria.')
		return
	}
	if (!formValue.value.direccion && !formValue.value.departamento) {
		message.error('Dirección y Departamento son obligatorios.')
		return
	}
	if (opcionesUnidades.value.length > 0 && !formValue.value.unidad) {
		message.error('Debes seleccionar una Unidad para este Departamento.')
		return
	}
	if (opcionesDepartamentos.value.length === 0 && opcionesUnidades.value.length === 0) {
		formValue.value.departamento = null
		formValue.value.unidad = null
	}
	if (opcionesUnidades.value.length === 0) {
		formValue.value.unidad = null
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
		message.error('No se pudo reasignar el equipo: Revisar la DB.')
	} else {
		message.success('Equipo reasignado con éxito.')
		emit('equipoActualizado')
		emit('update:show', false)
	}
}
</script>
