import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
	state: () => ({
		isLoggedIn: false,
		userEmail: '', // correo del usuario logueado
		userNombre: '', // nombre del usuario logueado
	}),
	actions: {
		login(nombre: string, email: string) {
			this.isLoggedIn = true
			this.userNombre = nombre
			this.userEmail = email
		},
		logout() {
			this.isLoggedIn = false
			this.userEmail = ''
			this.userNombre = ''
		},
	},
	persist: true, // ✅ mantiene sesión incluso tras F5
})
