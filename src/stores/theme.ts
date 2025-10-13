import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { darkTheme } from 'naive-ui'
import type { GlobalTheme } from 'naive-ui'

export const useThemeStore = defineStore('theme', () => {
	// Guardamos el estado actual. Leemos de localStorage si ya había algo guardado
	const isDark = ref(localStorage.getItem('isDark') === 'true')

	// Esta computed property le pasa el tema correcto a Naive UI
	const theme = computed<GlobalTheme | null>(() => (isDark.value ? darkTheme : null))

	function toggleTheme() {
		isDark.value = !isDark.value
		localStorage.setItem('isDark', isDark.value.toString())
	}

	return { isDark, theme, toggleTheme }
})
