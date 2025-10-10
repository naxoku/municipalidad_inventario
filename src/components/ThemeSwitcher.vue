<template>
	<n-switch
		:value="themeStore.isDark"
		@update:value="themeStore.toggleTheme"
		size="large"
	></n-switch>
</template>

<script setup lang="ts">
import { NSwitch } from 'naive-ui'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
</script>
