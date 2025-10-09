/**
 * Estructura jerárquica del organigrama en 3 niveles.
 * Nivel 1: Dirección (llave principal)
 * Nivel 2: Departamento (llave del objeto anidado)
 * Nivel 3: Unidad (arreglo de strings)
 * Si un departamento no tiene unidades, su valor es un arreglo vacío [].
 */
// Le decimos a TypeScript cómo es la estructura del organigrama
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

// --- De aquí para abajo, las listas se generan solas ---

export const opcionesDirecciones = Object.keys(organigrama).map((dir) => ({
	label: dir,
	value: dir,
}))

// Lista de equipos
export const especificacionesPorEquipo: {
	[key: string]: { key: string; label: string; placeholder: string }[]
} = {
	Notebook: [
		{ key: 'procesador', label: 'Procesador', placeholder: 'Ej: Intel Core i7-1165G7' },
		{ key: 'ram', label: 'Memoria RAM', placeholder: 'Ej: 16 GB DDR4' },
		{ key: 'almacenamiento', label: 'Almacenamiento', placeholder: 'Ej: 512 GB SSD' },
		{ key: 'tamano_pantalla', label: 'Tamaño Pantalla', placeholder: 'Ej: 14 pulgadas' },
	],
	'Computador de escritorio (PC)': [
		{ key: 'procesador', label: 'Procesador', placeholder: 'Ej: AMD Ryzen 5 5600G' },
		{ key: 'ram', label: 'Memoria RAM', placeholder: 'Ej: 32 GB DDR4' },
		{ key: 'almacenamiento', label: 'Almacenamiento', placeholder: 'Ej: 1 TB SSD + 2 TB HDD' },
		{ key: 'tarjeta_video', label: 'Tarjeta de Video', placeholder: 'Ej: NVIDIA GeForce RTX 3060' },
	],
	'All-in-One (Todo en Uno)': [
		{ key: 'procesador', label: 'Procesador', placeholder: 'Ej: Intel Core i5-12400' },
		{ key: 'ram', label: 'Memoria RAM', placeholder: 'Ej: 8 GB DDR4' },
		{ key: 'almacenamiento', label: 'Almacenamiento', placeholder: 'Ej: 256 GB SSD' },
		{ key: 'tamano_pantalla', label: 'Tamaño Pantalla', placeholder: 'Ej: 23.8 pulgadas' },
	],
	Impresora: [
		{ key: 'tipo_impresora', label: 'Tipo', placeholder: 'Ej: Láser, Tinta, Multifuncional' },
		{ key: 'modelo_cartucho', label: 'Modelo de Tinta/Tóner', placeholder: 'Ej: HP 85A' },
		{ key: 'conectividad', label: 'Conectividad', placeholder: 'Ej: USB, Wi-Fi, Red' },
	],
	Switch: [
		{ key: 'cantidad_puertos', label: 'Cantidad de Puertos', placeholder: 'Ej: 24 puertos' },
		{ key: 'velocidad', label: 'Velocidad', placeholder: 'Ej: 10/100/1000 Mbps' },
		{ key: 'es_poe', label: '¿Es PoE?', placeholder: 'Sí / No' },
	],
}

// Lista de tipos de equipo a partir del diccionario
export const opcionesTiposDeEquipo = Object.keys(especificacionesPorEquipo).map((tipo) => ({
	label: tipo,
	value: tipo,
}))
