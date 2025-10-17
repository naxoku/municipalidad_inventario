<template>
	<n-space vertical align="center" justify="center" :gap="24" style="min-height: 100vh">
		<n-space vertical align="center" :size="24" style="max-width: 400px; width: 100%">
			<!-- Header -->
			<n-h2 style="margin: 0 0 8px 0">Registro de Usuarios</n-h2>

			<!-- Card Principal -->
			<n-card :bordered="false" size="large" style="width: 100%">
				<n-space vertical :size="16">
					<n-form>
						<n-form-item-row label="Nombre">
							<n-input v-model:value="registerNombre" placeholder="Ingresa el nombre" size="large">
								<template #prefix>
									<n-icon :component="PersonIcon" />
								</template>
							</n-input>
						</n-form-item-row>
						<n-form-item-row label="Correo">
							<n-input v-model:value="registerEmail" placeholder="Ingresa el correo" size="large">
								<template #prefix>
									<n-icon :component="MailIcon" />
								</template>
							</n-input>
						</n-form-item-row>
						<n-form-item-row label="Contraseña">
							<n-input
								v-model:value="registerPassword"
								type="password"
								placeholder="Ingresa la contraseña"
								size="large"
								show-password-on="click"
							>
								<template #prefix>
									<n-icon :component="LockClosedIcon" />
								</template>
							</n-input>
						</n-form-item-row>
						<n-form-item-row label="Repetir Contraseña">
							<n-input
								v-model:value="registerConfirmPassword"
								type="password"
								placeholder="Repite la contraseña"
								size="large"
								show-password-on="click"
							>
								<template #prefix>
									<n-icon :component="LockClosedIcon" />
								</template>
							</n-input>
						</n-form-item-row>
						<n-form-item-row label="Es Administrador">
							<n-switch v-model:value="isAdmin" />
						</n-form-item-row>
					</n-form>

					<n-button type="primary" block size="large" strong @click="handleRegister">
						<template #icon>
							<n-icon :component="PersonAddIcon" />
						</template>
						Registrar Usuario
					</n-button>
				</n-space>
			</n-card>

			<!-- Footer -->
			<n-text depth="3" style="text-align: center">
				© {{ new Date().getFullYear() }} Municipalidad de Angol
			</n-text>
		</n-space>
	</n-space>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import {
	NSpace,
	NCard,
	NForm,
	NFormItemRow,
	NInput,
	NButton,
	NH2,
	NText,
	NIcon,
	NSwitch,
	useMessage,
} from 'naive-ui'
import {
	Mail as MailIcon,
	LockClosed as LockClosedIcon,
	Person as PersonIcon,
	PersonAdd as PersonAddIcon,
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()

// REGISTER
const registerNombre = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerConfirmPassword = ref('')
const isAdmin = ref(false) // Nuevo campo para administrador

// MANEJAR REGISTRO
const handleRegister = async () => {
	if (!registerNombre.value.trim()) {
		message.error('Debes ingresar un nombre.')
		return
	}
	if (registerPassword.value !== registerConfirmPassword.value) {
		message.error('Las contraseñas no coinciden.')
		return
	}

	try {
		const { data, error } = await supabase.auth.signUp({
			email: registerEmail.value.trim(),
			password: registerPassword.value.trim(),
			options: {
				data: {
					full_name: registerNombre.value.trim(),
					is_admin: isAdmin.value, // Guardar el estado de administrador
				},
			},
		})

		if (error) {
			message.error('Error al crear la cuenta: ' + error.message)
			console.error('Error al registrar usuario:', error.message)
			return
		}

		if (data.user) {
			// Insertar en la tabla 'usuarios' de Supabase
			const { error: insertError } = await supabase.from('usuarios').insert([
				{
					id: data.user.id,
					nombre: registerNombre.value.trim(),
					correo: registerEmail.value.trim(),
					admin: isAdmin.value,
				},
			])

			if (insertError) {
				message.error('Error al guardar los datos del usuario: ' + insertError.message)
				console.error('Error al insertar en tabla usuarios:', insertError.message)
				// Considerar revertir el registro de auth si la inserción falla
				return
			}

			message.success('Usuario creado correctamente. Por favor, verifica tu correo electrónico.')
			// Limpiar el formulario o redirigir
			registerNombre.value = ''
			registerEmail.value = ''
			registerPassword.value = ''
			registerConfirmPassword.value = ''
			isAdmin.value = false
			// No redirigir, simplemente limpiar el formulario y mostrar mensaje de éxito
			// router.push({ name: 'equipos' })
		}
	} catch (err: any) {
		message.error('Ocurrió un error inesperado durante el registro.')
		console.error('Error inesperado en registro:', err.message)
	}
}
</script>

<style scoped>
/* Estilos específicos para esta vista */
</style>
