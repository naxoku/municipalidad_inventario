<template>
	<div class="app-sidebar-wrapper">
		<n-layout-sider
			bordered
			show-trigger
			collapse-mode="width"
			:collapsed-width="64"
			:width="240"
			:collapsed="collapsed"
			@collapse="$emit('update:collapsed', true)"
			@expand="$emit('update:collapsed', false)"
			class="app-sidebar-layout"
		>
			<div class="logo-container">
				<img :src="logoSrc" alt="Logo Municipalidad" />
			</div>
			<n-menu
				v-model:value="activeKey"
				:options="menuOptions"
				:collapsed="collapsed"
				:collapsed-width="64"
				:collapsed-icon-size="22"
			/>
		</n-layout-sider>
		<div class="header-content">
			<ThemeSwitcher />
		</div>
	</div>
</template>

<script setup lang="ts">
import { h, ref, watch, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { NLayoutSider, NMenu, NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { ArchiveOutline, BusinessOutline, CreateOutline, LogOutOutline } from '@vicons/ionicons5'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth' // Importar el store de autenticación
import ThemeSwitcher from './ThemeSwitcher.vue'

// --- IMÁGENES ---
import logoNegro from '../assets/municipalidad-de-Angol-negro.png'
import logoBlanco from '../assets/municipalidad-de-Angol-blanco.png'

// Props y Emits para el control v-model
defineProps<{
	collapsed: boolean
}>()

defineEmits(['update:collapsed'])

// --- LÓGICA DEL TEMA ---
const themeStore = useThemeStore()
const authStore = useAuthStore() // Instanciar el store de autenticación
const router = useRouter() // Instanciar el router

const logoSrc = computed(() => {
	return themeStore.isDark ? logoBlanco : logoNegro
})

// Función para cerrar sesión
const handleLogout = async () => {
	await authStore.logout()
	router.push({ name: 'home' }) // Redirigir a la página de inicio
}

// Opciones del menú
const menuOptions: MenuOption[] = [
	{
		label: 'Gestión',
		key: 'gestion-group',
		type: 'group',
		children: [
			{
				label: () => h(RouterLink, { to: { name: 'equipos' } }, { default: () => 'Inventario' }),
				key: 'equipos',
				icon: () => h(NIcon, null, { default: () => h(CreateOutline) }),
			},
		],
	},
	{
		label: 'Consultas',
		key: 'consultas-group',
		type: 'group',
		children: [
			{
				label: () =>
					h(RouterLink, { to: '/equipos-departamentos' }, { default: () => 'Por Departamento' }),
				key: 'equipos-departamentos',
				icon: () => h(NIcon, null, { default: () => h(BusinessOutline) }),
			},
			{
				label: () =>
					h(RouterLink, { to: { name: 'equipos-baja' } }, { default: () => 'Equipos Inactivos' }),
				key: 'equipos-baja',
				icon: () => h(NIcon, null, { default: () => h(ArchiveOutline) }),
			},
		],
	},
	{
		label: () => h('a', { onClick: handleLogout }, 'Cerrar Sesión'),
		key: 'logout',
		icon: () => h(NIcon, null, { default: () => h(LogOutOutline) }),
	},
]

// Lógica para mantener el menú sincronizado con la ruta
const route = useRoute()
const activeKey = ref<string | null>(null)

watch(
	() => route.name,
	(newRouteName) => {
		activeKey.value = newRouteName as string
	},
	{ immediate: true },
)
</script>

<style scoped>
.app-sidebar-wrapper {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.app-sidebar-layout {
	flex-grow: 1;
}

.logo-container {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 80px;
	padding: 1rem;
}

.logo-container img {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}

.header-content {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1rem;
	border-top: 1px solid var(--n-border-color);
	margin-top: auto;
}
</style>
