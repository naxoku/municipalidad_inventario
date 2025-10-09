<template>
	<n-layout-sider bordered show-trigger collapse-mode="width" :collapsed-width="64" :width="240" :collapsed="collapsed"
		@collapse="$emit('update:collapsed', true)" @expand="$emit('update:collapsed', false)">
		<div class="logo-container">
			<img src="../assets/Escudo-Municipalidad-de-Angol.png" alt="Logo Municipalidad" />
		</div>
		<n-menu v-model:value="activeKey" :options="menuOptions" :collapsed="collapsed" :collapsed-width="64"
			:collapsed-icon-size="22" />
	</n-layout-sider>
</template>

<script setup lang="ts">
import { h, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { NLayoutSider, NMenu, NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { DesktopOutline, ArchiveOutline } from '@vicons/ionicons5'

// Props y Emits para el control v-model
defineProps<{
	collapsed: boolean
}>()

defineEmits(['update:collapsed'])

// Opciones del menú
const menuOptions: MenuOption[] = [
	{
		label: () =>
			h(
				RouterLink,
				{
					to: {
						name: 'equipos',
					},
				},
				{ default: () => 'Equipos Activos' },
			),
		key: 'equipos',
		icon: () => h(NIcon, null, { default: () => h(DesktopOutline) }),
	},
	{
		label: () =>
			h(
				RouterLink,
				{
					to: {
						name: 'equipos-baja',
					},
				},
				{ default: () => 'Equipos de Baja' },
			),
		key: 'equipos-baja',
		icon: () => h(NIcon, null, { default: () => h(ArchiveOutline) }),
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
</style>
