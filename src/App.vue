<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RouterView } from 'vue-router'
import {
	NConfigProvider,
	NMessageProvider,
	NNotificationProvider,
	NDialogProvider,
	NLayout,
	NGlobalStyle,
} from 'naive-ui'
import AppSidebar from './components/AppSidebar.vue'
import PasswordUpdateModal from './components/PasswordUpdateModal.vue' // Importar el nuevo modal
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth' // Importar el store de autenticación

const themeStore = useThemeStore()
const authStore = useAuthStore() // Instanciar el store de autenticación
const collapsed = ref(false)
const showPasswordUpdateModal = ref(false) // Estado para controlar la visibilidad del modal

// Observar cambios en needsPasswordReset del authStore
watch(
	() => authStore.needsPasswordReset,
	(newVal) => {
		if (newVal && authStore.isLoggedIn) {
			showPasswordUpdateModal.value = true
		} else {
			showPasswordUpdateModal.value = false
		}
	},
	{ immediate: true }, // Ejecutar inmediatamente al montar el componente
)

const handlePasswordUpdated = () => {
	showPasswordUpdateModal.value = false
	// No usar message.success aquí, ya que useMessage no está disponible globalmente en App.vue
	// La notificación de éxito se manejará dentro del PasswordUpdateModal
	// Opcional: redirigir al usuario a la página principal o de inicio
	// router.push({ name: 'home' })
}

const currentTheme = computed(() => themeStore.theme)
</script>

<template>
	<n-config-provider :theme="currentTheme" :inline-theme-disabled="true">
		<n-global-style />
		<n-message-provider>
			<n-notification-provider>
				<n-dialog-provider>
					<n-layout has-sider style="height: 100vh">
						<AppSidebar v-if="authStore.isLoggedIn" v-model:collapsed="collapsed" />

						<n-layout>
							<main class="main-content">
								<RouterView />
							</main>
						</n-layout>
					</n-layout>
					<!-- Modal de Actualización de Contraseña -->
					<PasswordUpdateModal
						v-model:show="showPasswordUpdateModal"
						@passwordUpdated="handlePasswordUpdated"
					/>
				</n-dialog-provider>
			</n-notification-provider>
		</n-message-provider>
	</n-config-provider>
</template>

<style scoped>
.main-content {
	padding-left: 1.5rem;
	padding-right: 1.5rem;
	/* background-color: #f8f9fa; */
	height: 100%;
	overflow-y: auto;
}
.header-content {
	justify-content: end; /* Para mandar el botón a la derecha */
}
</style>
