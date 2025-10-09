<template>
	<n-modal
		:show="show"
		preset="card"
		style="width: 600px"
		title="Editar Datos del Equipo"
		@update:show="$emit('update:show', $event)"
	>
		<n-spin :show="cargando">
			<n-form @submit.prevent="guardarCambios">
				<n-space vertical>
					<n-form-item label="Tipo de equipo" required>
						<n-select
							v-model:value="formValue.tipo_equipo"
							:options="opcionesTiposDeEquipo"
							filterable
						/>
					</n-form-item>
					<n-form-item label="Modelo" required>
						<n-input v-model:value="formValue.modelo" />
					</n-form-item>
					<n-form-item label="Número de serie">
						<n-input v-model:value="formValue.num_serie" />
					</n-form-item>
					<n-form-item label="Número de inventario">
						<n-input v-model:value="formValue.num_inventario" />
					</n-form-item>
				</n-space>
				<n-space justify="end" style="margin-top: 24px">
					<n-button @click="$emit('update:show', false)">Cancelar</n-button>
					<n-button type="primary" attr-type="submit" :loading="cargando">Guardar</n-button>
				</n-space>
			</n-form>
		</n-spin>
	</n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
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
import { opcionesTiposDeEquipo } from '@/data/listas'

const props = defineProps<{
	show: boolean
	equipo: Equipo | null
}>()

const emit = defineEmits(['update:show', 'equipoActualizado'])
const message = useMessage()
const cargando = ref(false)
const formValue = ref<Partial<Equipo>>({})

watch(
	() => props.equipo,
	(newEquipo) => {
		if (newEquipo) {
			formValue.value = { ...newEquipo }
		}
	},
	{ immediate: true },
)

const guardarCambios = async () => {
	if (!formValue.value.tipo_equipo || !formValue.value.modelo) {
		message.error('Tipo y modelo son obligatorios.')
		return
	}
	cargando.value = true
	const { error } = await supabase
		.from('equipos')
		.update({
			tipo_equipo: formValue.value.tipo_equipo,
			modelo: formValue.value.modelo,
			num_serie: formValue.value.num_serie,
			num_inventario: formValue.value.num_inventario,
		})
		.eq('id', props.equipo!.id)
	cargando.value = false

	if (error) {
		message.error('No se pudieron guardar los cambios.')
	} else {
		message.success('Equipo actualizado con éxito.')
		emit('equipoActualizado')
		emit('update:show', false)
	}
}
</script>
