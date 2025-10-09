export interface Equipo {
	id?: number
	fecha_ingreso: number | null
	tipo_equipo: string | null
	modelo: string
	num_serie: string
	num_inventario: string
	direccion: string
	departamento: string
	unidad: string
	responsable: string
	estado: string
	fecha_baja?: string | null
	detalles?: { [key: string]: string }
}
