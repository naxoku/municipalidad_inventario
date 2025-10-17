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
</script>
