import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import EquiposPage from '../views/EquiposPage.vue'
import EquiposBajaPage from '../views/EquiposBajaPage.vue'
import EquiposDepartamentos from '../views/EquiposDepartamentos.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView, // Login y register
		},
		{
			path: '/equipos',
			name: 'equipos',
			component: EquiposPage, // La página principal
		},
		{
			path: '/equipos-baja',
			name: 'equipos-baja',
			component: EquiposBajaPage, // La página para los dados de baja
		},
		{
			path: '/equipos-departamentos/',
			name: 'equipos-departamentos',
			component: EquiposDepartamentos, // La página para ver los equipos de cada departamento
		},
	],
})

export default router
