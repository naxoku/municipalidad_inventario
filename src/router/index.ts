import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import EquiposPage from '../views/EquiposPage.vue'
import EquiposBajaPage from '../views/EquiposBajaPage.vue'
// import EquiposDepartamentos from '../views/EquiposDepartamentos.vue'
import ReportesPage from '../views/ReportesPage.vue'
import { useAuthStore } from '../stores/auth'

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
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
})

// Protección de rutas
router.beforeEach((to, from, next) => {
	const authStore = useAuthStore()

	if (authStore.isLoggedIn && to.name === 'home') {
		// Usuario logueado no puede ir al login/registro
		return next({ name: 'equipos' })
	}

	if (to.meta.requiresAuth && !authStore.isLoggedIn) {
		// Ruta protegida, usuario no logueado
		return next({ name: 'home' })
	}

	next() // permitir acceso
})

export default router
