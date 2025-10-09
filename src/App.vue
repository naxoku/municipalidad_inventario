<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider, NLayout, NGlobalStyle, NLayoutHeader } from 'naive-ui'
import AppSidebar from './components/AppSidebar.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()
const collapsed = ref(false)

const currentTheme = computed(() => themeStore.theme)
</script>

<template>
	<n-config-provider :theme="currentTheme" :key="themeStore.isDark ? 'dark' : 'light'">
		<n-global-style />
		<n-message-provider>
			<n-layout has-sider style="height: 100vh">
				<AppSidebar v-model:collapsed="collapsed" />

				<n-layout>
					<n-layout-header bordered class="main-header">
						<div class="header-content">Modo oscuro: <ThemeSwitcher /></div>
					</n-layout-header>

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
