<template>
	<div class="theme-switcher">
		<n-switch
			:value="themeStore.isDark"
			@update:value="themeStore.toggleTheme"
			size="large"
			class="theme-switch"
		>
			<template #checked-icon>
				<n-icon :component="MoonIcon" />
			</template>
			<template #unchecked-icon>
				<n-icon :component="SunIcon" />
			</template>
		</n-switch>
	</div>
</template>

<script setup lang="ts">
import { NSwitch, NIcon } from 'naive-ui'
import { Moon as MoonIcon, Sunny as SunIcon } from '@vicons/ionicons5'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
</script>

<style scoped>
.theme-switcher {
	display: flex;
	align-items: center;
	justify-content: center;
}

.theme-switch {
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
