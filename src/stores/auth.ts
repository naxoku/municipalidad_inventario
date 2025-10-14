import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'

export const useAuthStore = defineStore('auth', () => {
	const isLoggedIn = ref(false)

	// Inicializar el estado de login basado en la sesión actual de Supabase
	supabase.auth.getSession().then(({ data }) => {
		isLoggedIn.value = !!data.session
	})

	// Escuchar cambios en el estado de autenticación
	supabase.auth.onAuthStateChange((_, session) => {
		isLoggedIn.value = !!session
	})

	function setLoggedIn(value: boolean) {
		isLoggedIn.value = value
	}

	async function logout() {
		const { error } = await supabase.auth.signOut()
		if (error) {
			console.error('Error al cerrar sesión:', error.message)
		} else {
			isLoggedIn.value = false
		}
	}

	return { isLoggedIn, setLoggedIn, logout }
})
