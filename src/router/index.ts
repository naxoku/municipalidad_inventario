import { createRouter, createWebHistory } from 'vue-router'
import EquiposPage from '../views/EquiposPage.vue'
import EquiposBajaPage from '../views/EquiposBajaPage.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			redirect: '/equipos', // Redirige al tiro a la lista de equipos
		},
		{
			path: '/equipos',
			name: 'equipos',
			component: EquiposPage, // La página principal ahora es esta
		},
		{
			path: '/equipos/baja',
			name: 'equipos-baja',
			component: EquiposBajaPage, // La nueva página para los dados de baja
		},
	],
})

export default router
