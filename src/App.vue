<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider, NLayout, NGlobalStyle } from 'naive-ui'
import AppSidebar from './components/AppSidebar.vue'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth' // Importar el store de autenticación

const themeStore = useThemeStore()
const authStore = useAuthStore() // Instanciar el store de autenticación
const collapsed = ref(false)

const currentTheme = computed(() => themeStore.theme)
</script>

<template>
	<n-config-provider :theme="currentTheme" :inline-theme-disabled="true">
		<n-global-style />
		<n-message-provider>
			<n-layout has-sider style="height: 100vh">
				<AppSidebar v-if="authStore.isLoggedIn" v-model:collapsed="collapsed" />

				<n-layout>
					<main class="main-content">
						<RouterView />
					</main>
				</n-layout>
			</n-layout>
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
