import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import EquiposPage from '../views/EquiposPage.vue'
import EquiposBajaPage from '../views/EquiposBajaPage.vue'
import EquiposDepartamentos from '../views/EquiposDepartamentos.vue'
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
		component: EquiposPage, // La página principal
		meta: { requiresAuth: true },
	},
	{
		path: '/equipos-baja',
		name: 'equipos-baja',
		component: EquiposBajaPage, // Equipos dados de baja
		meta: { requiresAuth: true },
	},
	{
		path: '/equipos-departamentos/',
		name: 'equipos-departamentos',
		component: EquiposDepartamentos, // Equipos por departamento
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
	if (to.meta.requiresAuth && !authStore.isLoggedIn) {
		next({ name: 'home' }) // redirigir al login
	} else {
		next()
	}
})

export default router
