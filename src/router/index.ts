import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import EquiposPage from '../views/EquiposPage.vue'
import EquiposBajaPage from '../views/EquiposBajaPage.vue'
import ReportesPage from '../views/ReportesPage.vue'
import JerarquiaEquiposPage from '../views/JerarquiaEquiposPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabaseClient'

const routes = [
	{
		path: '/',
		name: 'home',
		component: HomeView, // Login y register
	},
	{
		path: '/equipos',
		name: 'equipos',
		component: EquiposPage,
		meta: { requiresAuth: true },
	},
	{
		path: '/equipos-baja',
		name: 'equipos-baja',
		component: EquiposBajaPage,
		meta: { requiresAuth: true },
	},
	{
		path: '/reportes',
		name: 'reportes',
		component: ReportesPage,
		meta: { requiresAuth: true },
	},
	{
		path: '/jerarquia-equipos',
		name: 'jerarquia-equipos',
		component: JerarquiaEquiposPage,
		meta: { requiresAuth: true, requiresAdmin: true }, // Requiere admin
	},
	{
		path: '/register',
		name: 'register',
		component: RegisterPage,
		meta: { requiresAuth: true, requiresAdmin: true }, // Requiere admin
	},
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
})

// Protección de rutas
router.beforeEach(async (to, from, next) => {
	const authStore = useAuthStore()

	// Asegurarse de que la sesión de Supabase se ha cargado
	await supabase.auth.getSession()

	if (authStore.isLoggedIn && to.name === 'home') {
		// Usuario logueado no puede ir al login
		return next({ name: 'equipos' })
	}

	if (to.meta.requiresAuth && !authStore.isLoggedIn) {
		// Ruta protegida, usuario no logueado
		return next({ name: 'home' })
	}

	// Protección de rutas de administrador
	if (to.meta.requiresAdmin && !authStore.isAdmin) {
		// Si la ruta requiere admin y el usuario no lo es
		return next({ name: 'equipos' }) // Redirigir a una página segura
	}

	next() // permitir acceso
})

export default router
