export interface Equipo {
	id?: number // Es opcional porque al crear uno nuevo no tiene id
	fecha_ingreso: number | null
	tipo_equipo: string
	modelo: string
	num_serie: string
	num_inventario: string
	departamento: string
	estado: string
	fecha_baja?: string | null // La fecha cuando se da de baja
}
