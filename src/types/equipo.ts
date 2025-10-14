export interface Equipo {
	id?: number
	fecha_ingreso: string | null
	tipo_equipo: string | null
	modelo: string
	num_serie: string
	num_inventario: string
	direccion: string | null
	departamento: string | null
	unidad: string | null
	responsable: string
	estado: string
	encargado_registro?: string | null
	fecha_baja?: string | null
	motivo_baja?: string | null
	encargado_baja?: string | null
	detalles?: { [key: string]: string | number | boolean | null }
	historial_mantenimiento?: Mantenimiento[]
	historial_componentes_modificados?: CambioComponente[]
	historial_reasignaciones?: HistorialReasignacion[]
}

export interface Mantenimiento {
	fecha: string //
	descripcion: string
	encargado_mantenimiento?: string | null
	notas?: string | null
}

export interface CambioComponente {
	fecha: string //
	componente: string
	valor_anterior: string | number | boolean | null
	valor_nuevo: string | number | boolean | null
	notas?: string
}

export interface HistorialReasignacion {
	fecha: string //
	direccion_anterior?: string
	direccion_nueva?: string
	departamento_anterior?: string
	departamento_nuevo?: string
	unidad_anterior?: string | null
	unidad_nueva?: string | null
	responsable_anterior?: string
	responsable_nuevo?: string
	motivo?: string
	encargado_reasignacion?: string
}
