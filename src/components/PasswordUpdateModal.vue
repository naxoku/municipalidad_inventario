<template>
	<n-modal
		v-model:show="showModal"
		preset="card"
		title="Actualizar Contraseña"
		style="width: 400px"
	>
		<n-space vertical :size="16">
			<n-alert type="info" :bordered="false">
				Es necesario que actualices tu contraseña para continuar.
			</n-alert>
			<n-form>
				<n-form-item-row label="Nueva Contraseña">
					<n-input
						v-model:value="newPassword"
						type="password"
						placeholder="Ingresa tu nueva contraseña"
						size="large"
						show-password-on="click"
					>
						<template #prefix>
							<n-icon :component="LockClosedIcon" />
						</template>
					</n-input>
				</n-form-item-row>
				<n-form-item-row label="Confirmar Nueva Contraseña">
					<n-input
						v-model:value="confirmNewPassword"
						type="password"
						placeholder="Confirma tu nueva contraseña"
						size="large"
						show-password-on="click"
					>
						<template #prefix>
							<n-icon :component="LockClosedIcon" />
						</template>
					</n-input>
				</n-form-item-row>
			</n-form>
			<n-button
				type="primary"
				block
				size="large"
				strong
				@click="handlePasswordUpdate"
				:loading="isLoading"
			>
				Actualizar Contraseña
			</n-button>
		</n-space>
	</n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { supabase } from '../lib/supabaseClient'
import {
	NModal,
	NSpace,
	NAlert,
	NForm,
	NFormItemRow,
	NInput,
	NButton,
	NIcon,
	useMessage,
} from 'naive-ui'
import { LockClosed as LockClosedIcon } from '@vicons/ionicons5'

const message = useMessage()

const props = defineProps<{
	show: boolean
}>()

const emit = defineEmits(['update:show', 'passwordUpdated'])

const showModal = ref(props.show)
const newPassword = ref('')
const confirmNewPassword = ref('')
const isLoading = ref(false)

watch(
	() => props.show,
	(newVal) => {
		showModal.value = newVal
	},
)

watch(showModal, (newVal) => {
	emit('update:show', newVal)
})

const handlePasswordUpdate = async () => {
	if (!newPassword.value || newPassword.value.length < 6) {
		message.error('La nueva contraseña debe tener al menos 6 caracteres.')
		return
	}
	if (newPassword.value !== confirmNewPassword.value) {
		message.error('Las contraseñas no coinciden.')
		return
	}

	isLoading.value = true
	try {
		const { data, error } = await supabase.auth.updateUser({
			password: newPassword.value,
		})

		if (error) {
			console.error('Error al actualizar contraseña en Auth:', error)
			message.error('Error al actualizar la contraseña: ' + error.message)
			return
		}

		if (data.user) {
			// Actualizar el campo needs_password_reset en la tabla 'usuarios'
			const { error: updateError } = await supabase
				.from('usuarios')
				.update({ needs_password_reset: false })
				.eq('id', data.user.id)

			if (updateError) {
				console.error('Error al actualizar needs_password_reset:', updateError)
				message.error(
					'Contraseña actualizada, pero hubo un error al marcar el estado de restablecimiento.',
				)
				return
			}

			message.success('Contraseña actualizada correctamente.')
			showModal.value = false
			emit('passwordUpdated')
		}
	} catch (err: any) {
		console.error('Error inesperado al actualizar contraseña:', err)
		message.error('Ocurrió un error inesperado al actualizar la contraseña.')
	} finally {
		isLoading.value = false
	}
}
</script>

<style scoped>
/* Estilos específicos para este modal */
</style>
