// Si un departamento no tiene unidades, su valor es un arreglo vacío [].
type Organigrama = {
	[direccion: string]: {
		[departamento: string]: string[]
	}
}

export const organigrama: Organigrama = {
	'Administración Municipal': {
		'Biblioteca Municipal': [],
		'Complejo Deportivo': [],
		'Departamento de Operaciones Municipales': ['Unidad de Aseo, Ornato y Medio Ambiente'],
		'Oficina de Comunicaciones': [],
		'Oficina de Informática': [],
		'Oficina de Inspección Municipal': [],
		'Sala Cuna y Jardín Municipal': [],
		'Seguridad Pública': [],
		'Unidad de Fomento Productivo': ['Veterinaria Municipal'],
	},
	'Dirección de Administración y Finanzas': {
		'Asesor Gestión y Control Financiero': [],
		'Convenios Externos, SII, Tesorería': [],
		'Jefe de Adquisiciones': [],
		'Jefe de Contabilidad': [],
		'Jefe de Rentas y Patentes': ['Oficina de Aseo Domiciliario'],
		'Jefe de Tesorería Municipal': ['Cementerio Municipal'],
		'Oficina de Bienes e Inventario': [],
		'Oficina de Remuneraciones': [],
	},
	'Dirección de Asesoría Jurídica': {},
	'Dirección de Control': {
		'Control de Presupuesto y Financiero': [],
		'Fiscalización y Auditoría': [],
	},
	'Dirección de Obras Municipales': {},
	'Dirección de Recursos Humanos': {
		Bienestar: [],
		'Capacitación y Gestión de Personal': [],
		'Departamento de Personal': [],
		'Prevención de Riesgos': [],
	},
	'Dirección de Tránsito y Transporte Público': {
		'Gestión de Tránsito': [],
		'Inspección de Tránsito': [],
		'Licencia de Conducir': [],
		'Permiso de Circulación': [],
	},
	DIDECO: {
		'Departamento de Acción Social y Estudio': [
			'Asistencial',
			'Déficit Hídrico',
			'Registro Social de Hogar',
			'Residencia / Casa de Acogida / Casa de la Mujer',
			'Subsidio Familiar (SAF)',
			'Subsidio Único Familiar (SUF)',
			'Vivienda',
		],
		'Departamento de Desarrollo Comunal y Vecinal': [
			'Oficina de la Juventud',
			'Oficina Local de la Niñez (OLN)',
			'Oficina Organizaciones Comunitarias y Proyecto',
		],
		'Departamento de Planificación y Programas': ['Convenio'],
		'Departamento de Turismo': ['Cultura', 'Oficina Municipal de Deporte', 'Turismo'],
	},
	'Secretaría Municipal': {
		'Central Telefónica': [],
		'Oficina de Informaciones, Reclamos y Sugerencias (OIRS)': [],
		'Oficina de Partes': [],
		'Oficina de Secretaría de Concejo': [],
		'Oficina Transparencia': [],
	},
	SECPLAN: {
		'Asesor Urbanista': [],
		'Departamento de Licitaciones': [],
		'Entidad Patrocinante Municipal': [],
		Proyectos: [],
	},
}

export const opcionesDirecciones = Object.keys(organigrama).map((dir) => ({
	label: dir,
	value: dir,
}))

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
