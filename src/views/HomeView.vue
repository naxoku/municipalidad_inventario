<template>
	<n-card title="Acceso">
		<n-tabs default-value="signin" size="large" justify-content="space-evenly">
			<!-- LOGIN -->
			<n-tab-pane name="signin" tab="Iniciar sesión">
				<n-form>
					<n-form-item-row label="Correo">
						<n-input v-model:value="loginEmail" placeholder="Ingresa tu correo" />
					</n-form-item-row>
					<n-form-item-row label="Contraseña">
						<n-input
							v-model:value="loginPassword"
							type="password"
							placeholder="Ingresa tu contraseña"
						/>
					</n-form-item-row>
				</n-form>
				<n-button type="primary" block strong @click="handleLogin"> Entrar </n-button>
			</n-tab-pane>

			<!-- REGISTRO -->
			<n-tab-pane name="signup" tab="Crear cuenta">
				<n-form>
					<n-form-item-row label="Nombre">
						<n-input v-model:value="registerNombre" placeholder="Ingresa tu nombre" />
					</n-form-item-row>
					<n-form-item-row label="Correo">
						<n-input v-model:value="registerEmail" placeholder="Ingresa tu correo" />
					</n-form-item-row>
					<n-form-item-row label="Contraseña">
						<n-input
							v-model:value="registerPassword"
							type="password"
							placeholder="Ingresa tu contraseña"
						/>
					</n-form-item-row>
					<n-form-item-row label="Repetir Contraseña">
						<n-input
							v-model:value="registerConfirmPassword"
							type="password"
							placeholder="Repite tu contraseña"
						/>
					</n-form-item-row>
				</n-form>
				<n-button type="primary" block strong @click="handleRegister"> Registrarse </n-button>
			</n-tab-pane>
		</n-tabs>
	</n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabaseClient'
import { NCard, NTabs, NTabPane, NForm, NFormItemRow, NInput, NButton, useMessage } from 'naive-ui'
import bcrypt from 'bcryptjs'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

// Login
const loginEmail = ref('')
const loginPassword = ref('')

// Register
const registerNombre = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerConfirmPassword = ref('')

/* ---------------------------
   LOGIN
----------------------------*/
const handleLogin = async () => {
	try {
		const { data: user, error } = await supabase
			.from('usuarios')
			.select('*')
			.eq('correo', loginEmail.value.trim())
			.single()

		if (error || !user) {
			message.error('Usuario o contraseña incorrectos.')
			return
		}

		// Comparar hash de contraseña
		const validPassword = await bcrypt.compare(loginPassword.value.trim(), user.contraseña)
		if (!validPassword) {
			message.error('Usuario o contraseña incorrectos.')
			return
		}

		authStore.setLoggedIn(true)
		message.success('Sesión iniciada.')
		router.push({ name: 'equipos' })
	} catch (err) {
		message.error('Ocurrió un error inesperado.')
		console.error(err)
	}
}

/* ---------------------------
   REGISTRO
----------------------------*/
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
		// Verificar si el correo ya existe
		const { data: existingUser } = await supabase
			.from('usuarios')
			.select('*')
			.eq('correo', registerEmail.value.trim())
			.single()

		if (existingUser) {
			message.error('El correo ya está registrado.')
			return
		}

		// Hashear la contraseña
		const hashedPassword = await bcrypt.hash(registerPassword.value.trim(), 10)

		// Insertar nuevo usuario
		const { error } = await supabase.from('usuarios').insert([
			{
				nombre: registerNombre.value.trim(),
				correo: registerEmail.value.trim(),
				contraseña: hashedPassword,
			},
		])

		if (error) throw error

		message.success('Usuario creado correctamente.')
	} catch (err) {
		message.error('Ocurrió un error inesperado')
		console.error(err)
	}
}
</script>
