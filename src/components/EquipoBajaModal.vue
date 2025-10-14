<template>
	<n-modal
		:show="show"
		preset="card"
		style="width: 1000px"
		title="Dar de Baja Equipo"
		:bordered="false"
		size="huge"
		role="dialog"
		aria-modal="true"
		@update:show="$emit('update:show', $event)"
	>
		<n-spin :show="cargando">
			<n-form ref="formRef" :model="formValue" :rules="rules" @submit.prevent="handleDarDeBaja">
				<n-space vertical>
					<n-form-item label="Fecha de Baja" path="fecha_baja">
						<n-date-picker
							v-model:value="formValue.fecha_baja"
							type="date"
							style="width: 100%"
							disabled
							format="dd/MM/yyyy"
						/>
					</n-form-item>
					<n-form-item label="Encargado de la baja" path="encargado_baja">
						<n-input
							v-model:value="formValue.encargado_baja"
							placeholder="Nombre del funcionario que gestiona la baja"
							disabled
						/>
					</n-form-item>
					<n-form-item label="Motivo de la baja" path="motivo_baja">
						<n-input
							v-model:value="formValue.motivo_baja"
							type="textarea"
							placeholder="Ej: Equipo obsoleto, daño irreparable, robo, etc."
						/>
					</n-form-item>
				</n-space>
				<n-space justify="end" style="margin-top: 24px">
					<n-button @click="$emit('update:show', false)">Cancelar</n-button>
					<n-button type="error" attr-type="submit" :loading="cargando">Dar de Baja</n-button>
				</n-space>
			</n-form>
		</n-spin>
	</n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import {
	NModal,
	NSpin,
	NForm,
	NFormItem,
	NDatePicker,
	NInput,
	NSpace,
	NButton,
	useMessage,
	type FormInst,
	type FormRules,
} from 'naive-ui'
import { supabase } from '../lib/supabaseClient'
import type { Equipo } from '../types/equipo'
import { useAuthStore } from '@/stores/auth' // Importar el store de autenticación

const props = defineProps<{
	show: boolean
	equipo: Equipo | null
}>()

const emit = defineEmits(['update:show', 'equipoDadoDeBaja'])
const message = useMessage()
const authStore = useAuthStore() // Usar el store de autenticación
const cargando = ref(false)
const formRef = ref<FormInst | null>(null)

const formValue = reactive({
	fecha_baja: Date.now(),
	motivo_baja: '',
	encargado_baja: authStore.userNombre, // Inicializar con el nombre del usuario logueado
})

const rules: FormRules = {
	motivo_baja: {
		required: true,
		message: 'El motivo de la baja es obligatorio.',
		trigger: ['input', 'blur'],
	},
	encargado_baja: {
		required: false,
		message: 'El encargado es obligatorio.',
		trigger: ['input', 'blur'],
	},
}

watch(
	() => props.show,
	(isVisible) => {
		if (!isVisible) {
			resetForm()
		} else {
			formValue.fecha_baja = Date.now()
			formValue.encargado_baja = authStore.userNombre // Autocompletar al abrir el modal
		}
	},
)

function resetForm() {
	formValue.motivo_baja = ''
	formValue.encargado_baja = authStore.userNombre // Resetear también el encargado de baja
	formRef.value?.restoreValidation()
}

const handleDarDeBaja = async () => {
	try {
		await formRef.value?.validate()
	} catch {
		message.error('Por favor, completa todos los campos.')
		return
	}

	if (!props.equipo) return

	cargando.value = true
	const { error } = await supabase
		.from('equipos')
		.update({
			estado: 'Inactivo',
			fecha_baja: new Date(formValue.fecha_baja).toISOString(),
			motivo_baja: formValue.motivo_baja,
			encargado_baja: formValue.encargado_baja,
		})
		.eq('id', props.equipo.id)

	cargando.value = false

	if (error) {
		message.error('Falló la baja del equipo.')
		console.error('Error al dar de baja:', error.message)
	} else {
		message.success('Equipo dado de baja correctamente.')
		emit('equipoDadoDeBaja')
		emit('update:show', false)
	}
}
</script>
