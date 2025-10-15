import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'

export const useAuthStore = defineStore('auth', {
	state: () => ({
		isLoggedIn: false,
		userEmail: '', // correo del usuario logueado
		userNombre: '', // nombre del usuario logueado
	}),
	actions: {
		async loginWithGoogle() {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
			})
			if (error) {
				console.error('Error al iniciar sesión con Google:', error.message)
			}
		},
		login(nombre: string, email: string) {
			this.isLoggedIn = true
			this.userNombre = nombre
			this.userEmail = email
		},
		async logout() {
			const { error } = await supabase.auth.signOut()
			if (error) {
				console.error('Error al cerrar sesión:', error.message)
			}
			this.isLoggedIn = false
			this.userEmail = ''
			this.userNombre = ''
		},
	},
	persist: true, // ✅ mantiene sesión incluso tras F5
})

supabase.auth.onAuthStateChange((event, session) => {
	const authStore = useAuthStore()
	if (event === 'SIGNED_IN' && session) {
		authStore.isLoggedIn = true
		authStore.userEmail = session.user?.email || ''
		authStore.userNombre = session.user?.user_metadata?.full_name || session.user?.email || ''
	} else if (event === 'SIGNED_OUT') {
		authStore.isLoggedIn = false
		authStore.userEmail = ''
		authStore.userNombre = ''
	}
})
