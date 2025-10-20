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
						<n-form-item-row label="Es Administrador">
							<n-switch v-model:value="isAdmin" />
						</n-form-item-row>
					</n-form>

					<n-button
						type="primary"
						block
						size="large"
						strong
						@click="handleRegister"
						:loading="isLoading"
					>
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
import { ref, h } from 'vue' // Importar 'h' para renderizar VNodes
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
	useNotification, // Importar useNotification
} from 'naive-ui'
import {
	Mail as MailIcon,
	// LockClosed as LockClosedIcon,
	Person as PersonIcon,
	PersonAdd as PersonAddIcon,
} from '@vicons/ionicons5'

const message = useMessage()
const notification = useNotification() // Instanciar useNotification

// REGISTER
const registerNombre = ref('')
const registerEmail = ref('')
const isAdmin = ref(false)
const isLoading = ref(false)
const temporaryPassword = ref('') // Para mostrar la contraseña temporal al admin

// Función para generar una contraseña aleatoria
const generateRandomPassword = (length = 12) => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
	let password = ''
	for (let i = 0; i < length; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return password
}

// Validación de email
const isValidEmail = (email: string) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

// MANEJAR REGISTRO
const handleRegister = async () => {
	// Validaciones
	if (!registerNombre.value.trim()) {
		message.error('Debes ingresar un nombre.')
		return
	}

	if (!registerEmail.value.trim() || !isValidEmail(registerEmail.value.trim())) {
		message.error('Debes ingresar un correo electrónico válido.')
		return
	}

	isLoading.value = true

	try {
		console.log('Iniciando registro de usuario...')

		const newTemporaryPassword = generateRandomPassword()
		temporaryPassword.value = newTemporaryPassword // Guardar para mostrar al admin

		const { data, error } = await supabase.auth.signUp({
			email: registerEmail.value.trim(),
			password: newTemporaryPassword, // Usar la contraseña temporal
			options: {
				data: {
					full_name: registerNombre.value.trim(),
				},
			},
		})

		if (error) {
			console.error('Error de Supabase Auth:', error)

			// Mensajes de error más específicos
			if (error.message.includes('Failed to fetch')) {
				message.error('Error de conexión. Verifica la configuración de CORS en Supabase.')
			} else if (error.message.includes('Email rate limit exceeded')) {
				message.error('Demasiados intentos. Espera un momento antes de intentar nuevamente.')
			} else if (error.message.includes('User already registered')) {
				message.error('Este correo electrónico ya está registrado.')
			} else if (error.message.includes('Signups not allowed')) {
				message.error('El registro de nuevos usuarios está deshabilitado.')
			} else {
				message.error('Error al crear la cuenta: ' + error.message)
			}
			return
		}

		if (data.user) {
			console.log('Usuario creado en Auth:', data.user.id)

			// Insertar en la tabla 'usuarios' de Supabase
			const { error: insertError } = await supabase.from('usuarios').insert([
				{
					id: data.user.id,
					nombre: registerNombre.value.trim(),
					correo: registerEmail.value.trim(),
					admin: isAdmin.value,
					needs_password_reset: true, // Nuevo campo para forzar cambio de contraseña
				},
			])

			if (insertError) {
				console.error('Error al insertar en tabla usuarios:', insertError)
				message.error('Usuario creado pero hubo un error al guardar los datos adicionales.')
				// Nota: El usuario ya está creado en Auth, solo falló la inserción en la tabla
				return
			}

			message.success(
				data.user.identities && data.user.identities.length > 0
					? 'Usuario creado correctamente. Por favor, verifica tu correo electrónico.'
					: 'Usuario creado correctamente.',
			)

			// Limpiar el formulario
			registerNombre.value = ''
			registerEmail.value = ''
			isAdmin.value = false
			// Mostrar la contraseña temporal al admin usando useNotification
			notification.create({
				title: 'Usuario Creado',
				description: 'Contraseña temporal generada',
				content: `La contraseña temporal para ${registerEmail.value} es: ${temporaryPassword.value}. Por favor, anótala y compártela con el usuario.`,
				duration: 0, // La notificación no se cierra automáticamente
				closable: true,
				action: () =>
					h(
						NButton,
						{
							text: true,
							type: 'primary',
							onClick: () => {
								navigator.clipboard.writeText(temporaryPassword.value)
								message.success('Contraseña copiada al portapapeles.')
							},
						},
						{
							default: () => 'Copiar Contraseña',
						},
					),
			})
		}
	} catch (err: any) {
		console.error('Error inesperado en registro:', err)
		message.error('Ocurrió un error inesperado. Revisa la consola para más detalles.')
	} finally {
		isLoading.value = false
	}
}
</script>

<style scoped>
/* Estilos específicos para esta vista */
</style>
