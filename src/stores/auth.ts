import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'

export const useAuthStore = defineStore('auth', {
	state: () => ({
		isLoggedIn: false,
		userEmail: '', // correo del usuario logueado
		userNombre: '', // nombre del usuario logueado
		needsPasswordReset: false, //para establecer contraseña
	}),
	actions: {
		async fetchUserProfile(userId: string) {
			const { data, error } = await supabase
				.from('usuarios')
				.select('needs_password_reset')
				.eq('id', userId)
				.single()

			if (error) {
				console.error('Error al cargar el perfil del usuario:', error.message)
				this.needsPasswordReset = false
			} else if (data) {
				this.needsPasswordReset = data.needs_password_reset
			}
		},
		async loginWithGoogle() {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
			})
			if (error) {
				console.error('Error al iniciar sesión:', error.message)
			}
		},
		async logout() {
			const { error } = await supabase.auth.signOut()
			if (error) {
				console.error('Error al cerrar sesión:', error.message)
			}
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

		if (session.user?.id) {
			authStore.fetchUserProfile(session.user.id)
		}
	} else if (event === 'SIGNED_OUT') {
		authStore.isLoggedIn = false
		authStore.userEmail = ''
		authStore.userNombre = ''
		authStore.needsPasswordReset = false
	}
})
