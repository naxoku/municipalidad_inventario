<template>
	<n-space vertical align="center" justify="center" :gap="24" style="min-height: 100vh">
		<n-space vertical align="center" :size="24" style="max-width: 400px; width: 100%">
			<!-- Logo y Header -->
			<n-space vertical align="center" :size="16">
				<n-image width="250" :src="logoSrc" preview-disabled />
				<n-h2 style="margin: 0 0 8px 0">Sistema de Inventario</n-h2>
			</n-space>

			<!-- Card Principal -->
			<n-card :bordered="false" size="large" style="width: 100%">
				<n-tabs type="segment" size="large" animated>
					<!-- LOGIN -->
					<n-tab-pane name="signin" tab="Iniciar Sesión">
						<n-space vertical :size="16">
							<n-form>
								<n-form-item-row label="Correo">
									<n-input v-model:value="loginEmail" placeholder="Ingresa tu correo" size="large">
										<template #prefix>
											<n-icon :component="MailIcon" />
										</template>
									</n-input>
								</n-form-item-row>
								<n-form-item-row label="Contraseña">
									<n-input
										v-model:value="loginPassword"
										type="password"
										placeholder="Ingresa tu contraseña"
										size="large"
										show-password-on="click"
									>
										<template #prefix>
											<n-icon :component="LockClosedIcon" />
										</template>
									</n-input>
								</n-form-item-row>
							</n-form>

							<n-button type="primary" block size="large" strong @click="handleLogin">
								<template #icon>
									<n-icon :component="LogInIcon" />
								</template>
								Entrar
							</n-button>

							<n-divider>
								<n-text depth="3">o continuar con</n-text>
							</n-divider>

							<n-button block size="large" secondary @click="authStore.loginWithGoogle">
								<template #icon>
									<n-icon :component="LogoGoogleIcon" />
								</template>
								Google
							</n-button>
						</n-space>
					</n-tab-pane>

					<!-- REGISTRO -->
					<n-tab-pane name="signup" tab="Crear Cuenta">
						<n-space vertical :size="16">
							<n-form>
								<n-form-item-row label="Nombre">
									<n-input
										v-model:value="registerNombre"
										placeholder="Ingresa tu nombre"
										size="large"
									>
										<template #prefix>
											<n-icon :component="PersonIcon" />
										</template>
									</n-input>
								</n-form-item-row>
								<n-form-item-row label="Correo">
									<n-input
										v-model:value="registerEmail"
										placeholder="Ingresa tu correo"
										size="large"
									>
										<template #prefix>
											<n-icon :component="MailIcon" />
										</template>
									</n-input>
								</n-form-item-row>
								<n-form-item-row label="Contraseña">
									<n-input
										v-model:value="registerPassword"
										type="password"
										placeholder="Ingresa tu contraseña"
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
										placeholder="Repite tu contraseña"
										size="large"
										show-password-on="click"
									>
										<template #prefix>
											<n-icon :component="LockClosedIcon" />
										</template>
									</n-input>
								</n-form-item-row>
							</n-form>

							<n-button type="primary" block size="large" strong @click="handleRegister">
								<template #icon>
									<n-icon :component="PersonAddIcon" />
								</template>
								Registrarse
							</n-button>
						</n-space>
					</n-tab-pane>
				</n-tabs>
			</n-card>

			<!-- Footer -->
			<n-text depth="3" style="text-align: center">
				© {{ new Date().getFullYear() }} Municipalidad de Angol
			</n-text>
		</n-space>
	</n-space>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { supabase } from '../lib/supabaseClient'
import {
	NSpace,
	NCard,
	NTabs,
	NTabPane,
	NForm,
	NFormItemRow,
	NInput,
	NButton,
	NH2,
	NText,
	NDivider,
	NIcon,
	NImage,
	useMessage,
} from 'naive-ui'
import {
	Mail as MailIcon,
	LockClosed as LockClosedIcon,
	LogIn as LogInIcon,
	LogoGoogle as LogoGoogleIcon,
	Person as PersonIcon,
	PersonAdd as PersonAddIcon,
} from '@vicons/ionicons5'
// Imágenes
import logoNegro from '../assets/municipalidad-de-Angol-negro.png'
import logoBlanco from '../assets/municipalidad-de-Angol-blanco.png'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const logoSrc = computed(() => {
	return themeStore.isDark ? logoBlanco : logoNegro
})

// LOGIN
const loginEmail = ref('')
const loginPassword = ref('')

// REGISTER
const registerNombre = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerConfirmPassword = ref('')

// MANEJAR LOGIN
const handleLogin = async () => {
	try {
		const { error } = await supabase.auth.signInWithPassword({
			email: loginEmail.value.trim(),
			password: loginPassword.value.trim(),
		})

		if (error) {
			message.error('Usuario o contraseña incorrectos.')
			console.error('Error al iniciar sesión:', error.message)
			return
		}

		message.success('Sesión iniciada 🚀')
		router.push({ name: 'equipos' })
	} catch (err: any) {
		message.error('Ocurrió un error inesperado.')
		console.error('Error inesperado en login:', err.message)
	}
}

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
				},
			},
		})

		if (error) {
			message.error('Error al crear la cuenta: ' + error.message)
			console.error('Error al registrar usuario:', error.message)
			return
		}

		if (data.user) {
			message.success('Usuario creado correctamente. Por favor, verifica tu correo electrónico.')
			// Opcional: Limpiar el formulario o redirigir
			registerNombre.value = ''
			registerEmail.value = ''
			registerPassword.value = ''
			registerConfirmPassword.value = ''
			router.push({ name: 'equipos' }) // Redirigir a /equipos
		}
	} catch (err: any) {
		message.error('Ocurrió un error inesperado durante el registro.')
		console.error('Error inesperado en registro:', err.message)
	}
}
</script>
