import type { Equipo } from './equipo'
import type { Component, VNode } from 'vue'

export interface EquipoConAlerta extends Equipo {
	años: number
	alerta: { nivel: string; texto: string; tipo: 'error' | 'warning' | 'info' | 'success' }
}

export interface Evento {
	id: string
	tipo: 'ingreso' | 'reasignacion' | 'mantenimiento' | 'baja'
	fecha: string | number
	icono: Component
	type: 'success' | 'info' | 'warning' | 'error'
	titulo: string
	descripcion: string
	detalle: string | VNode
	equipo_modelo?: string | null
	equipo_responsable?: string | null
}
