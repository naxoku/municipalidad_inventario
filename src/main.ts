import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { supabase } from './lib/supabaseClient' // Importar supabase

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// Inicializar el store de autenticación para que el listener de Supabase se active
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()

// Esperar a que Supabase obtenga la sesión actual antes de montar la app
supabase.auth.getSession().then(({ data: { session } }) => {
	if (session) {
		authStore.isLoggedIn = true
		authStore.userEmail = session.user?.email || ''
		authStore.userNombre = session.user?.user_metadata?.full_name || session.user?.email || ''
	} else {
		authStore.isLoggedIn = false
		authStore.userEmail = ''
		authStore.userNombre = ''
	}
	app.use(router)
	app.mount('#app')
})
