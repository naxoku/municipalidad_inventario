export interface Equipo {
	id?: number
	fecha_ingreso: number | null
	tipo_equipo: string | null
	modelo: string
	num_serie: string
	num_inventario: string
	direccion: string | null
	departamento: string | null
	unidad: string | null
	responsable: string
	estado: string
	motivo_baja?: string | null
	fecha_baja?: string | null
	detalles?: { [key: string]: string | number | boolean | null }
	historial_mantenimiento?: Mantenimiento[]
	historial_componentes_modificados?: CambioComponente[]
}

export interface Mantenimiento {
	fecha: string | undefined
	descripcion: string
	tecnico?: string
	notas?: string
}

export interface CambioComponente {
	fecha: string | undefined
	componente: string
	valor_anterior: string | number | boolean | null
	valor_nuevo: string | number | boolean | null
	notas?: string
}
