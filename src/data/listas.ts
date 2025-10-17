import { useOrganigramaStore } from '../stores/organigrama'
import { storeToRefs } from 'pinia'

// Organigrama
export const getOpcionesDirecciones = () => {
	const organigramaStore = useOrganigramaStore()
	const { direcciones } = storeToRefs(organigramaStore)
	return direcciones.value.map((dir) => ({ label: dir.nombre, value: dir.id }))
}

export const getOpcionesDepartamentosByDireccion = (direccionId: string) => {
	const organigramaStore = useOrganigramaStore()
	const departamentos = organigramaStore.getDepartamentosByDireccion(direccionId)
	return departamentos.map((dep) => ({ label: dep.nombre, value: dep.id }))
}

export const getOpcionesUnidadesByDepartamento = (departamentoId: string) => {
	const organigramaStore = useOrganigramaStore()
	const unidades = organigramaStore.getUnidadesByDepartamento(departamentoId)
	return unidades.map((uni) => ({ label: uni.nombre, value: uni.id }))
}

export const especificacionesPorEquipo: {
	[key: string]: {
		key: string
		label: string
		placeholder: string
		type: 'input' | 'select'
		options?: string[]
	}[]
} = {
	Notebook: [
		{ key: 'procesador', label: 'Procesador', placeholder: 'Ej: Intel Core i7', type: 'input' },
		{
			key: 'ram',
			label: 'Memoria RAM',
			placeholder: 'Selecciona la RAM',
			type: 'select',
			options: ['4 GB', '8 GB', '12 GB', '16 GB', '32 GB'],
		},
		{
			key: 'almacenamiento',
			label: 'Almacenamiento',
			placeholder: 'Selecciona el disco',
			type: 'select',
			options: ['128 GB SSD', '256 GB SSD', '512 GB SSD', '1 TB SSD', '1 TB HDD'],
		},
		{
			key: 'tamano_pantalla',
			label: 'Tamaño Pantalla',
			placeholder: 'Ej: 14 pulgadas',
			type: 'input',
		},
		{
			key: 'direccion_mac',
			label: 'Dirección MAC',
			placeholder: 'Ej: 00:1A:2B:3C:4D:5E',
			type: 'input',
		},
		{
			key: 'direccion_ip',
			label: 'Dirección IP',
			placeholder: 'Ej: 192.168.1.1',
			type: 'input',
		},
	],
	'Computador de escritorio (PC)': [
		{ key: 'procesador', label: 'Procesador', placeholder: 'Ej: AMD Ryzen 5', type: 'input' },
		{
			key: 'ram',
			label: 'Memoria RAM',
			placeholder: 'Selecciona la RAM',
			type: 'select',
			options: ['8 GB', '16 GB', '32 GB', '64 GB'],
		},
		{
			key: 'almacenamiento',
			label: 'Almacenamiento',
			placeholder: 'Selecciona el disco',
			type: 'select',
			options: ['256 GB SSD', '512 GB SSD', '1 TB SSD', '2 TB HDD', '4 TB HDD'],
		},
		{
			key: 'tarjeta_video',
			label: 'Tarjeta de Video',
			placeholder: 'Ej: NVIDIA RTX 3060',
			type: 'input',
		},
		{
			key: 'direccion_mac',
			label: 'Dirección MAC',
			placeholder: 'Ej: 00:1A:2B:3C:4D:5E',
			type: 'input',
		},
		{
			key: 'direccion_ip',
			label: 'Dirección IP',
			placeholder: 'Ej: 192.168.1.1',
			type: 'input',
		},
	],
	'All-in-One (Todo en Uno)': [
		{ key: 'procesador', label: 'Procesador', placeholder: 'Ej: Intel Core i7', type: 'input' },
		{
			key: 'ram',
			label: 'Memoria RAM',
			placeholder: 'Selecciona la RAM',
			type: 'select',
			options: ['4 GB', '8 GB', '12 GB', '16 GB', '32 GB'],
		},
		{
			key: 'almacenamiento',
			label: 'Almacenamiento',
			placeholder: 'Selecciona el disco',
			type: 'select',
			options: ['128 GB SSD', '256 GB SSD', '512 GB SSD', '1 TB SSD', '1 TB HDD'],
		},
		{
			key: 'tamano_pantalla',
			label: 'Tamaño Pantalla',
			placeholder: 'Ej: 14 pulgadas',
			type: 'input',
		},
		{
			key: 'direccion_mac',
			label: 'Dirección MAC',
			placeholder: 'Ej: 00:1A:2B:3C:4D:5E',
			type: 'input',
		},
		{
			key: 'direccion_ip',
			label: 'Dirección IP',
			placeholder: 'Ej: 192.168.1.1',
			type: 'input',
		},
	],
	Impresora: [
		{
			key: 'tipo_impresora',
			label: 'Tipo',
			placeholder: 'Selecciona el tipo',
			type: 'select',
			options: ['Láser', 'Tinta', 'Multifuncional', 'Matricial'],
		},
		{
			key: 'modelo_cartucho',
			label: 'Modelo de Tinta/Tóner',
			placeholder: 'Ej: HP 85A',
			type: 'input',
		},
		{
			key: 'conectividad',
			label: 'Conectividad',
			placeholder: 'Selecciona conexión',
			type: 'select',
			options: ['USB', 'Red (Ethernet)', 'Wi-Fi', 'USB + Red'],
		},
		{
			key: 'direccion_mac',
			label: 'Dirección MAC',
			placeholder: 'Ej: 00:1A:2B:3C:4D:5E',
			type: 'input',
		},
		{
			key: 'direccion_ip',
			label: 'Dirección IP',
			placeholder: 'Ej: 192.168.1.1',
			type: 'input',
		},
	],
	Switch: [
		{
			key: 'cantidad_puertos',
			label: 'Cantidad de Puertos',
			placeholder: 'Selecciona N° puertos',
			type: 'select',
			options: ['4', '8', '16', '24', '48'],
		},
		{
			key: 'velocidad',
			label: 'Velocidad',
			placeholder: 'Selecciona velocidad',
			type: 'select',
			options: ['10/100 Mbps', '1 Gbps', '10 Gbps'],
		},
		{
			key: 'es_poe',
			label: '¿Es PoE?',
			placeholder: '¿Soporta PoE?',
			type: 'select',
			options: ['Sí', 'No'],
		},
		{
			key: 'direccion_ip',
			label: 'Dirección IP',
			placeholder: 'Ej: 192.168.1.1',
			type: 'input',
		},
	],
}

// Lista de tipos de equipo a partir del diccionario
export const opcionesTiposDeEquipo = Object.keys(especificacionesPorEquipo).map((tipo) => ({
	label: tipo,
	value: tipo,
}))
