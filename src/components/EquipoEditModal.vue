<template>
	<n-modal
		:show="show"
		preset="card"
		style="width: 900px"
		title="Editar Datos del Equipo"
		:bordered="false"
		size="huge"
		role="dialog"
		aria-modal="true"
		@update:show="$emit('update:show', $event)"
	>
		<n-spin :show="cargando">
			<n-form @submit.prevent="guardarCambios">
				<n-grid :x-gap="24" :cols="24">
					<n-gi :span="11">
						<n-space vertical>
							<n-form-item label="Tipo de equipo" required>
								<n-select
									v-model:value="formValue.tipo_equipo"
									placeholder="Selecciona un equipo"
									:options="opcionesTiposDeEquipo"
									filterable
								/>
							</n-form-item>
							<n-form-item label="Modelo" required>
								<n-input v-model:value="formValue.modelo" placeholder="Ej: HP ProBook 450 G6" />
							</n-form-item>
							<n-form-item label="Número de serie">
								<n-input v-model:value="formValue.num_serie" placeholder="Ej: SN123456" />
							</n-form-item>
							<n-form-item label="Número de inventario">
								<n-input v-model:value="formValue.num_inventario" placeholder="Ej: INV-001" />
							</n-form-item>
						</n-space>
					</n-gi>

					<n-gi :span="2"><n-divider vertical style="height: 100%" /></n-gi>

					<n-gi :span="11">
						<n-space v-if="camposEspecificos!.length > 0" vertical>
							<n-form-item v-for="campo in camposEspecificos" :key="campo.key" :label="campo.label">
								<n-input
									v-model:value="formValue.detalles![campo.key]"
									:placeholder="campo.placeholder"
								/>
							</n-form-item>
						</n-space>
						<n-empty v-else description="Selecciona un tipo de equipo para ver sus detalles." />
					</n-gi>
				</n-grid>

				<n-space justify="end" style="margin-top: 24px">
					<n-button @click="$emit('update:show', false)">Cancelar</n-button>
					<n-button type="primary" attr-type="submit" :loading="cargando">Guardar</n-button>
				</n-space>
			</n-form>
		</n-spin>
	</n-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import {
	NModal,
	NGrid,
	NGi,
	NSpin,
	NForm,
	NFormItem,
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
import { opcionesTiposDeEquipo, especificacionesPorEquipo } from '@/data/listas'

const props = defineProps<{
	show: boolean
	equipo: Equipo | null
}>()

const emit = defineEmits(['update:show', 'equipoActualizado'])
const message = useMessage()
const cargando = ref(false)
const formValue = ref<Partial<Equipo> & { detalles: { [key: string]: string } }>({
	detalles: {},
})
const tipoEquipoAnterior = ref<string | null | undefined>()

watchEffect(() => {
	if (props.equipo) {
		formValue.value = JSON.parse(JSON.stringify(props.equipo))

		if (!formValue.value.detalles) {
			formValue.value.detalles = {}
		}
		tipoEquipoAnterior.value = formValue.value.tipo_equipo
	} else {
		formValue.value = { detalles: {} }
		tipoEquipoAnterior.value = undefined
	}
})

watch(
	() => formValue.value.tipo_equipo,
	(nuevoTipo) => {
		if (nuevoTipo !== tipoEquipoAnterior.value && tipoEquipoAnterior.value !== undefined) {
			formValue.value.detalles = {}
			tipoEquipoAnterior.value = nuevoTipo
		}
	},
)
const camposEspecificos = computed(() => {
	if (formValue.value.tipo_equipo && especificacionesPorEquipo[formValue.value.tipo_equipo]) {
		return especificacionesPorEquipo[formValue.value.tipo_equipo]
	}
	return []
})

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
			detalles: formValue.value.detalles,
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
