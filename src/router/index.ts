import { createRouter, createWebHistory } from 'vue-router'
import EquiposPage from '../views/EquiposPage.vue'
import EquiposBajaPage from '../views/EquiposBajaPage.vue'
import EquiposDepartamentos from '../views/EquiposDepartamentos.vue'
import EquiposDetalles from '../views/EquiposDetalles.vue'

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
			component: EquiposPage, // La página principal
		},
		{
			path: '/equipos/baja',
			name: 'equipos-baja',
			component: EquiposBajaPage, // La página para los dados de baja
		},
		{
			path: '/departamentos/',
			name: 'equipos-departamentos',
			component: EquiposDepartamentos, // La página para ver los equipos de cada departamento
		},
		{
			path: '/equipos/detalles/',
			name: 'equipos-detalles',
			component: EquiposDetalles, // La página para ver los equipos de cada departamento
		},
	],
})

export default router
