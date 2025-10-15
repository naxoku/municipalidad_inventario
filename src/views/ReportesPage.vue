<template>
	<div class="reportes-page">
		<n-space vertical :size="24" class="page-container">
			<div class="page-header">
				<div>
					<n-h2 style="margin: 0; margin-bottom: 4px">Reportes y Alertas</n-h2>
					<n-text depth="3">Análisis del inventario y actividad reciente</n-text>
				</div>
			</div>

			<n-card :bordered="false" embedded>
				<template #header>
					<n-space justify="space-between" align="center">
						<n-space align="center" :size="8">
							<n-icon :component="WarningIcon" :size="20" />
							<span>Equipos que Requieren Atención</span>
						</n-space>
						<n-tag
							:type="equiposCriticos.length > 0 ? 'error' : 'success'"
							:bordered="false"
							size="medium"
							round
						>
							{{ equiposCriticos.length }} alerta{{ equiposCriticos.length !== 1 ? 's' : '' }}
						</n-tag>
					</n-space>
				</template>
				<n-space vertical :size="12">
					<n-data-table
						:columns="columnsAlertas"
						:data="equiposCriticos"
						:pagination="{ pageSize: 10 }"
					>
						<template #empty>
							<n-empty description="No hay equipos que requieran atención" size="large">
								<template #icon>
									<n-icon :component="CheckmarkCircleIcon" :size="64" :depth="3" />
								</template>
							</n-empty>
						</template>
					</n-data-table>
				</n-space>
			</n-card>

			<n-card :bordered="false" embedded>
				<template #header>
					<n-space justify="space-between" align="center">
						<n-space align="center" :size="8">
							<n-icon :component="TimeIcon" :size="20" />
							<span>Actividad Reciente</span>
						</n-space>
						<n-tag :bordered="false" size="medium" round>
							{{ eventosFiltrados.length }} evento{{ eventosFiltrados.length !== 1 ? 's' : '' }}
						</n-tag>
					</n-space>
				</template>
				<n-space vertical :size="12">
					<n-space :size="12" :wrap="true">
						<n-input
							v-model:value="searchEvento"
							placeholder="Buscar por equipo o responsable..."
							clearable
							style="min-width: 250px"
						>
							<template #prefix>
								<n-icon :component="SearchIcon" />
							</template>
						</n-input>
						<n-checkbox-group v-model:value="tiposEventoSeleccionados" style="margin-top: 5px">
							<n-space :size="8">
								<n-checkbox value="ingreso" label="Ingresos" />
								<n-checkbox value="reasignacion" label="Reasignaciones" />
								<n-checkbox value="mantenimiento" label="Mantenimientos" />
								<n-checkbox value="baja" label="Bajas" />
							</n-space>
						</n-checkbox-group>
						<n-date-picker
							v-model:value="rangoFechas"
							type="daterange"
							clearable
							format="dd/MM/yyyy"
						/>
					</n-space>

					<n-scrollbar style="max-height: 600px">
						<n-timeline v-if="eventosPaginados.length > 0">
							<n-timeline-item
								v-for="evento in eventosPaginados"
								:key="evento.id"
								:type="evento.type"
								:title="evento.titulo"
								:time="formatearFecha(evento.fecha)"
							>
								<template #icon>
									<n-icon :component="evento.icono" />
								</template>
								<n-space vertical :size="4">
									<n-text>{{ evento.descripcion }}</n-text>
									<n-text depth="3" style="font-size: 0.875rem">
										{{ evento.detalle }}
									</n-text>
								</n-space>
							</n-timeline-item>
						</n-timeline>
						<n-empty
							v-else
							description="No hay eventos para mostrar con los filtros seleccionados."
						/>
					</n-scrollbar>

					<n-pagination
						v-if="eventosFiltrados.length > pageSize"
						v-model:page="currentPage"
						:page-count="Math.ceil(eventosFiltrados.length / pageSize)"
						:page-size="pageSize"
						show-size-picker
						:page-sizes="[10, 20, 50]"
						@update:page-size="handlePageSizeChange"
					/>
				</n-space>
			</n-card>

			<n-card :bordered="false" embedded>
				<template #header>
					<n-space align="center" :size="8">
						<n-icon :component="DocumentIcon" :size="20" />
						<span>Generar Reportes</span>
					</n-space>
				</template>
				<n-grid :x-gap="12" :y-gap="12" :cols="responsiveCols">
					<n-gi>
						<n-card
							title="Equipos Antiguos"
							:bordered="false"
							:segmented="{ content: 'soft' }"
							size="small"
						>
							<n-space vertical :size="8">
								<n-text depth="3">Exportar listado de equipos que requieren atención</n-text>
								<n-space>
									<n-button
										type="primary"
										secondary
										@click="exportarAntiguosPDF"
										:loading="exportandoPDF"
									>
										<template #icon>
											<n-icon :component="DocumentTextIcon" />
										</template>
										PDF
									</n-button>
									<n-button
										type="success"
										secondary
										@click="exportarAntiguosExcel"
										:loading="exportandoExcel"
									>
										<template #icon>
											<n-icon :component="StatsChartIcon" />
										</template>
										Excel
									</n-button>
								</n-space>
							</n-space>
						</n-card>
					</n-gi>

					<n-gi>
						<n-card
							title="Historial de Movimientos"
							:bordered="false"
							:segmented="{ content: 'soft' }"
							size="small"
						>
							<n-space vertical :size="8">
								<n-text depth="3">Exportar actividad y movimientos recientes</n-text>
								<n-space>
									<n-button
										type="primary"
										secondary
										@click="exportarHistorialPDF"
										:loading="exportandoPDF"
									>
										<template #icon>
											<n-icon :component="DocumentTextIcon" />
										</template>
										PDF
									</n-button>
									<n-button
										type="success"
										secondary
										@click="exportarHistorialExcel"
										:loading="exportandoExcel"
									>
										<template #icon>
											<n-icon :component="StatsChartIcon" />
										</template>
										Excel
									</n-button>
								</n-space>
							</n-space>
						</n-card>
					</n-gi>

					<n-gi :span="2">
						<n-card
							title="Reporte Completo"
							:bordered="false"
							:segmented="{ content: 'soft' }"
							size="small"
						>
							<n-space vertical :size="8">
								<n-text depth="3"> Incluye equipos antiguos, historial y resumen ejecutivo </n-text>
								<n-button
									type="info"
									block
									@click="exportarReporteCompleto"
									:loading="exportandoPDF"
								>
									<template #icon>
										<n-icon :component="PrintIcon" />
									</template>
									Generar Reporte Completo (PDF)
								</n-button>
							</n-space>
						</n-card>
					</n-gi>
				</n-grid>
			</n-card>
		</n-space>
	</div>
</template>

<script setup lang="ts">
// CORREGIDO: Importamos 'Component' para tipar los íconos
import { ref, computed, onMounted, h, watch, type Component } from 'vue'
import {
	NSpace,
	NH2,
	NText,
	NCard,
	NDataTable,
	NTag,
	NIcon,
	NEmpty,
	NDatePicker,
	NInput,
	NCheckboxGroup,
	NCheckbox,
	NTimeline,
	NTimelineItem,
	NScrollbar,
	NPagination,
	NGrid,
	NGi,
	NButton,
	useMessage,
	type DataTableColumns,
	NTime,
} from 'naive-ui'
import {
	WarningOutline as WarningIcon,
	CheckmarkCircleOutline as CheckmarkCircleIcon,
	TimeOutline as TimeIcon,
	SearchOutline as SearchIcon,
	DocumentOutline as DocumentIcon,
	DocumentTextOutline as DocumentTextIcon,
	StatsChartOutline as StatsChartIcon,
	PrintOutline as PrintIcon,
	AddCircleOutline as AddCircleIcon,
	SwapHorizontalOutline as SwapHorizontalIcon,
	ConstructOutline as ConstructIcon,
	ArchiveOutline as ArchiveIcon,
} from '@vicons/ionicons5'
import { supabase } from '../lib/supabaseClient'
import type { Equipo } from '../types/equipo'
import { jsPDF } from 'jspdf'
import type { UserOptions } from 'jspdf-autotable'

// Tipos
interface EquipoConAlerta extends Equipo {
	años: number
	alerta: { nivel: string; texto: string; tipo: 'error' | 'warning' | 'info' | 'success' }
}

interface Evento {
	id: string
	tipo: 'ingreso' | 'reasignacion' | 'mantenimiento' | 'baja'
	fecha: string | number
	icono: Component
	type: 'success' | 'info' | 'warning' | 'error'
	titulo: string
	descripcion: string
	detalle: string
	equipo_modelo?: string | null
	equipo_responsable?: string | null
}
const message = useMessage()

// Estados
const equipos = ref<Equipo[]>([])
const cargando = ref(false)
const rangoFechas = ref<[number, number] | null>(null)

watch(rangoFechas, (newVal) => {
	console.log('Rango de fechas cambiado:', newVal)
	currentPage.value = 1 // Resetear la página a 1 cuando el filtro de fecha cambia
})

// Filtros de eventos
const searchEvento = ref('')
const tiposEventoSeleccionados = ref<string[]>(['ingreso', 'reasignacion', 'mantenimiento', 'baja'])

// Paginación del timeline
const currentPage = ref(1)
const pageSize = ref(20)

// Estados de exportación
const exportandoPDF = ref(false)
const exportandoExcel = ref(false)

// Responsive
const responsiveCols = computed(() =>
	typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2,
)

const MS_POR_AÑO = 365.25 * 24 * 60 * 60 * 1000

const calcularAños = (fecha: string | number): number => {
	const años = (Date.now() - new Date(fecha).getTime()) / MS_POR_AÑO
	return Math.floor(años * 10) / 10
}

const calcularAlerta = (fecha: string | number) => {
	const años = calcularAños(fecha)
	if (años >= 6) return { nivel: 'critico', texto: 'Urgente', tipo: 'error' as const }
	return { nivel: 'alto', texto: 'Alerta', tipo: 'warning' as const }
}

const equiposCriticos = computed<EquipoConAlerta[]>(() => {
	return (
		equipos.value
			.filter((e) => e.estado === 'Activo' && e.fecha_ingreso)
			.map((e) => ({
				...e,
				años: calcularAños(e.fecha_ingreso!),
				alerta: calcularAlerta(e.fecha_ingreso!),
			}))
			// Filtro de 5 años.
			.filter((e) => e.años >= 5)
			.sort((a, b) => b.años - a.años)
	)
})

const columnsAlertas: DataTableColumns<EquipoConAlerta> = [
	{
		title: 'Alerta',
		key: 'alerta',
		width: 120,
		render: (row) =>
			h(
				NTag,
				{ type: row.alerta.tipo, size: 'small', bordered: false },
				{ default: () => row.alerta.texto },
			),
	},
	{ title: 'Antigüedad', key: 'años', width: 100, render: (row) => `${row.años} años` },
	{ title: 'Inventario', key: 'num_inventario', width: 130, ellipsis: { tooltip: true } },
	{
		title: 'Fecha Ingreso',
		key: 'fecha_ingreso',
		width: 140,
		render(row: EquipoConAlerta) {
			if (row.fecha_ingreso) {
				return h(NTime, {
					time: new Date(row.fecha_ingreso).getTime(),
					type: 'date',
					format: 'dd-MM-yyyy',
				})
			}
			return 'N/A'
		},
	},
	{ title: 'Tipo', key: 'tipo_equipo', width: 140, ellipsis: { tooltip: true } },
	{ title: 'Modelo', key: 'modelo', minWidth: 180, ellipsis: { tooltip: true } },
	{ title: 'Departamento', key: 'departamento', width: 180, ellipsis: { tooltip: true } },
	{ title: 'Responsable', key: 'responsable', width: 150, ellipsis: { tooltip: true } },
]

const eventos = computed<Evento[]>(() => {
	const listaEventos: Evento[] = []
	// Se incluye el equipo con estado 'Inactivo' y 'En Reparación' para los eventos
	equipos.value.forEach((equipo) => {
		// Definimos las propiedades comunes acá para no repetirlas
		const commonEventProps = {
			equipo_modelo: equipo.modelo,
			equipo_responsable: equipo.responsable,
		}

		if (equipo.fecha_ingreso) {
			listaEventos.push({
				...commonEventProps,
				id: `ingreso-${equipo.id}`,
				tipo: 'ingreso',
				fecha: equipo.fecha_ingreso,
				icono: AddCircleIcon,
				type: 'success',
				titulo: `Ingreso de ${equipo.modelo}`,
				descripcion: `${equipo.tipo_equipo || 'Equipo'} agregado al inventario`,
				detalle: `Departamento: ${equipo.departamento || 'N/A'} | Responsable: ${equipo.responsable || 'N/A'}`,
			})
		}

		// Historial de reasignaciones
		const historialReasig = Array.isArray(equipo.historial_reasignaciones)
			? equipo.historial_reasignaciones
			: []

		historialReasig.forEach((r, idx) => {
			listaEventos.push({
				...commonEventProps,
				equipo_responsable: r.responsable_nuevo,
				id: `reasignacion-${equipo.id}-${idx}`,
				tipo: 'reasignacion',
				fecha: r.fecha,
				icono: SwapHorizontalIcon,
				type: 'info',
				titulo: `Reasignación de ${equipo.modelo}`,
				descripcion: `De ${r.departamento_anterior || 'N/A'} → ${r.departamento_nuevo || 'N/A'}`,
				detalle: `${r.responsable_anterior || 'N/A'} → ${r.responsable_nuevo || 'N/A'} | Motivo: ${r.motivo || 'Sin especificar'}`,
			})
		})

		// Historial de mantenimiento
		const historialMant = Array.isArray(equipo.historial_mantenimiento)
			? equipo.historial_mantenimiento
			: []

		historialMant.forEach((m, idx) => {
			listaEventos.push({
				...commonEventProps,
				id: `mantenimiento-${equipo.id}-${idx}`,
				tipo: 'mantenimiento',
				fecha: m.fecha,
				icono: ConstructIcon,
				type: 'warning',
				titulo: `Mantenimiento de ${equipo.modelo}`,
				descripcion: m.descripcion || 'Mantenimiento realizado',
				detalle: `Técnico: ${m.encargado_mantenimiento || 'N/A'}${m.notas ? ` | ${m.notas}` : ''}`,
			})
		})

		// Evento de baja
		if (equipo.estado === 'Inactivo' && equipo.fecha_baja) {
			listaEventos.push({
				...commonEventProps,
				id: `baja-${equipo.id}`,
				tipo: 'baja',
				fecha: equipo.fecha_baja,
				icono: ArchiveIcon,
				type: 'error',
				titulo: `Baja de ${equipo.modelo}`,
				descripcion: equipo.motivo_baja || 'Equipo dado de baja',
				detalle: `Encargado: ${equipo.encargado_baja || 'N/A'}`,
			})
		}
	})
	return listaEventos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
})

const eventosFiltrados = computed(() => {
	let result = eventos.value
	result = result.filter((e) => tiposEventoSeleccionados.value.includes(e.tipo))

	if (searchEvento.value) {
		const query = searchEvento.value.toLowerCase()
		result = result.filter(
			(e) =>
				e.equipo_modelo?.toLowerCase().includes(query) ||
				e.equipo_responsable?.toLowerCase().includes(query) ||
				e.descripcion?.toLowerCase().includes(query),
		)
	}

	if (rangoFechas.value) {
		const [inicio, fin] = rangoFechas.value
		result = result.filter((e) => {
			const fecha = new Date(e.fecha).getTime()
			// Ajustamos para incluir todo el día de 'fin'
			return fecha >= inicio && fecha <= fin + (24 * 60 * 60 * 1000 - 1)
		})
	}

	return result
})

const eventosPaginados = computed(() => {
	const start = (currentPage.value - 1) * pageSize.value
	return eventosFiltrados.value.slice(start, start + pageSize.value)
})

const handlePageSizeChange = (newSize: number) => {
	pageSize.value = newSize
	currentPage.value = 1
}

const formatearFecha = (fecha: string | number): string => {
	const date = new Date(fecha)
	const ahora = new Date()
	const diffDias =
		(ahora.setHours(0, 0, 0, 0) - new Date(fecha).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)

	if (diffDias < 1) return 'Hoy'
	if (diffDias < 2) return 'Ayer'
	if (diffDias < 7) return `Hace ${Math.round(diffDias)} días`

	return date.toLocaleDateString('es-CL', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	})
}

// Funciones de exportación
const exportarAntiguosPDF = async () => {
	exportandoPDF.value = true
	try {
		if (equiposCriticos.value.length === 0) {
			message.warning('No hay equipos antiguos para exportar a PDF.')
			return
		}

		const doc = new jsPDF()
		doc.setFontSize(16)
		doc.text('Reporte de Equipos Antiguos', 14, 22)
		doc.setFontSize(10)
		doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-CL')}`, 14, 28)

		const headers = [
			'Alerta',
			'Antigüedad (años)',
			'Inventario',
			'Fecha Ingreso',
			'Tipo',
			'Modelo',
			'Departamento',
			'Responsable',
		]
		const data = equiposCriticos.value.map((e) => [
			e.alerta.texto,
			`${e.años}`,
			e.num_inventario,
			new Date(e.fecha_ingreso!).toLocaleDateString('es-CL'),
			e.tipo_equipo,
			e.modelo,
			e.departamento,
			e.responsable,
		])

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		doc.autoTable({
			startY: 35,
			head: [headers],
			body: data,
			theme: 'grid',
			styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
			headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
			columnStyles: {
				0: { cellWidth: 20 },
				1: { cellWidth: 25 },
				2: { cellWidth: 25 },
				3: { cellWidth: 25 },
				4: { cellWidth: 25 },
				5: { cellWidth: 30 },
				6: { cellWidth: 30 },
				7: { cellWidth: 30 },
			},
		})

		doc.save(`reporte_equipos_antiguos_${new Date().getTime()}.pdf`)
		message.success('Reporte de equipos antiguos generado (PDF).')
	} catch (error: unknown) {
		message.error(
			'Error al generar reporte PDF: ' + (error instanceof Error ? error.message : String(error)),
		)
		console.error(error)
	} finally {
		exportandoPDF.value = false
	}
}

const exportarAntiguosExcel = () => {
	exportandoExcel.value = true
	try {
		if (equiposCriticos.value.length === 0) {
			message.warning('No hay equipos antiguos para exportar a Excel.')
			return
		}

		const dataToExport = equiposCriticos.value.map((e) => ({
			Alerta: e.alerta.texto,
			Antigüedad: `${e.años} años`,
			Inventario: e.num_inventario,
			'Fecha Ingreso': new Date(e.fecha_ingreso!).toLocaleDateString('es-CL'),
			Tipo: e.tipo_equipo,
			Modelo: e.modelo,
			Departamento: e.departamento,
			Responsable: e.responsable,
		}))

		exportToCSV(dataToExport, `reporte_equipos_antiguos_${new Date().getTime()}.csv`)
		message.success('Reporte de equipos antiguos generado (Excel).')
	} catch (error: unknown) {
		message.error(
			'Error al generar reporte Excel: ' + (error instanceof Error ? error.message : String(error)),
		)
		console.error(error)
	} finally {
		exportandoExcel.value = false
	}
}

const exportarHistorialPDF = async () => {
	exportandoPDF.value = true
	try {
		if (eventosFiltrados.value.length === 0) {
			message.warning('No hay eventos en el historial para exportar a PDF.')
			return
		}

		const doc = new jsPDF()
		doc.setFontSize(16)
		doc.text('Reporte de Historial de Movimientos', 14, 22)
		doc.setFontSize(10)
		doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-CL')}`, 14, 28)

		const headers = [
			'Fecha',
			'Tipo',
			'Título',
			'Descripción',
			'Detalle',
			'Modelo Equipo',
			'Responsable Equipo',
		]
		const data = eventosFiltrados.value.map((e) => [
			formatearFecha(e.fecha),
			e.tipo,
			e.titulo,
			e.descripcion,
			e.detalle,
			e.equipo_modelo,
			e.equipo_responsable,
		])

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		doc.autoTable({
			startY: 35,
			head: [headers],
			body: data,
			theme: 'grid',
			styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
			headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
			columnStyles: {
				0: { cellWidth: 20 },
				1: { cellWidth: 20 },
				2: { cellWidth: 30 },
				3: { cellWidth: 40 },
				4: { cellWidth: 40 },
				5: { cellWidth: 25 },
				6: { cellWidth: 25 },
			},
		})

		doc.save(`reporte_historial_movimientos_${new Date().getTime()}.pdf`)
		message.success('Reporte de historial de movimientos generado (PDF).')
	} catch (error: unknown) {
		message.error(
			'Error al generar reporte PDF: ' + (error instanceof Error ? error.message : String(error)),
		)
		console.error(error)
	} finally {
		exportandoPDF.value = false
	}
}

const exportarHistorialExcel = () => {
	exportandoExcel.value = true
	try {
		if (eventosFiltrados.value.length === 0) {
			message.warning('No hay eventos en el historial para exportar a Excel.')
			return
		}

		const dataToExport = eventosFiltrados.value.map((e) => ({
			Fecha: formatearFecha(e.fecha),
			Tipo: e.tipo,
			Título: e.titulo,
			Descripción: e.descripcion,
			Detalle: e.detalle,
			'Modelo Equipo': e.equipo_modelo,
			'Responsable Equipo': e.equipo_responsable,
		}))

		exportToCSV(dataToExport, `reporte_historial_movimientos_${new Date().getTime()}.csv`)
		message.success('Reporte de historial de movimientos generado (Excel).')
	} catch (error: unknown) {
		message.error(
			'Error al generar reporte Excel: ' + (error instanceof Error ? error.message : String(error)),
		)
		console.error(error)
	} finally {
		exportandoExcel.value = false
	}
}

const exportarReporteCompleto = async () => {
	exportandoPDF.value = true
	try {
		const doc = new jsPDF()
		let yOffset = 22

		// Título principal
		doc.setFontSize(18)
		doc.text('Reporte Completo de Inventario', 14, yOffset)
		yOffset += 8
		doc.setFontSize(10)
		doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-CL')}`, 14, yOffset)
		yOffset += 15

		// Sección de Equipos Antiguos
		doc.setFontSize(14)
		doc.text('Equipos que Requieren Atención', 14, yOffset)
		yOffset += 7

		if (equiposCriticos.value.length > 0) {
			const headersAntiguos = [
				'Alerta',
				'Antigüedad (años)',
				'Inventario',
				'Fecha Ingreso',
				'Tipo',
				'Modelo',
				'Departamento',
				'Responsable',
			]
			const dataAntiguos = equiposCriticos.value.map((e) => [
				e.alerta.texto,
				`${e.años}`,
				e.num_inventario ?? 'N/A',
				new Date(e.fecha_ingreso!).toLocaleDateString('es-CL'),
				e.tipo_equipo ?? 'N/A',
				e.modelo ?? 'N/A',
				e.departamento ?? 'N/A',
				e.responsable ?? 'N/A',
			])

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			doc.autoTable({
				startY: yOffset,
				head: [headersAntiguos],
				body: dataAntiguos,
				theme: 'grid',
				styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
				headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
				columnStyles: {
					0: { cellWidth: 20 },
					1: { cellWidth: 25 },
					2: { cellWidth: 25 },
					3: { cellWidth: 25 },
					4: { cellWidth: 25 },
					5: { cellWidth: 30 },
					6: { cellWidth: 30 },
					7: { cellWidth: 30 },
				},
				didDrawPage: (data: { cursor: { y: number } } & UserOptions) => {
					yOffset = data.cursor.y + 10
				},
			})
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			yOffset = doc.autoTable.previous.finalY + 15
		} else {
			doc.setFontSize(10)
			doc.text('No hay equipos que requieran atención.', 14, yOffset)
			yOffset += 15
		}

		// Sección de Historial de Movimientos
		doc.setFontSize(14)
		doc.text('Historial de Movimientos', 14, yOffset)
		yOffset += 7

		if (eventosFiltrados.value.length > 0) {
			const headersHistorial = [
				'Fecha',
				'Tipo',
				'Título',
				'Descripción',
				'Detalle',
				'Modelo Equipo',
				'Responsable Equipo',
			]
			const dataHistorial = eventosFiltrados.value.map((e) => [
				formatearFecha(e.fecha),
				e.tipo,
				e.titulo,
				e.descripcion,
				e.detalle,
				e.equipo_modelo ?? 'N/A',
				e.equipo_responsable ?? 'N/A',
			])

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			doc.autoTable({
				startY: yOffset,
				head: [headersHistorial],
				body: dataHistorial,
				theme: 'grid',
				styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
				headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
				columnStyles: {
					0: { cellWidth: 20 },
					1: { cellWidth: 20 },
					2: { cellWidth: 30 },
					3: { cellWidth: 40 },
					4: { cellWidth: 40 },
					5: { cellWidth: 25 },
					6: { cellWidth: 25 },
				},
				didDrawPage: (data: { cursor: { y: number } } & UserOptions) => {
					yOffset = data.cursor.y + 10
				},
			})
		} else {
			doc.setFontSize(10)
			doc.text('No hay eventos en el historial para mostrar.', 14, yOffset)
		}

		doc.save(`reporte_completo_${new Date().getTime()}.pdf`)
		message.success('Reporte completo generado (PDF).')
	} catch (error: unknown) {
		message.error(
			'Error al generar reporte completo: ' +
				(error instanceof Error ? error.message : String(error)),
		)
		console.error(error)
	} finally {
		exportandoPDF.value = false
	}
}

const fetchEquipos = async () => {
	cargando.value = true
	try {
		// Trae todos los equipos, Activos e Inactivos, para generar todos los eventos.
		const { data, error } = await supabase.from('equipos').select('*')
		if (error) throw error
		equipos.value = data || []
	} catch (error: unknown) {
		message.error(
			'Error al cargar equipos: ' + (error instanceof Error ? error.message : String(error)),
		)
	} finally {
		cargando.value = false
	}
}

onMounted(fetchEquipos)

// Función auxiliar para exportar a CSV
const exportToCSV = <T extends Record<string, unknown>>(data: T[], filename: string) => {
	if (!data.length) {
		message.warning('No hay datos para exportar.')
		return
	}

	const headers = Object.keys(data[0]!)
	const csv = [
		headers.join(','),
		...data.map((row) =>
			headers.map((fieldName) => JSON.stringify(row[fieldName] ?? '')).join(','),
		),
	].join('\n')

	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
	const link = document.createElement('a')
	if (link.download !== undefined) {
		const url = URL.createObjectURL(blob)
		link.setAttribute('href', url)
		link.setAttribute('download', filename)
		link.style.visibility = 'hidden'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}
}
</script>

<style scoped>
.reportes-page {
	min-height: 100vh;
	padding-top: 24px;
	padding-bottom: 24px;
}

.page-container {
	max-width: 1550px;
	margin: 0 auto;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 16px;
	flex-wrap: wrap;
}

@media (max-width: 768px) {
	.reportes-page {
		padding: 16px;
	}

	.page-header {
		flex-direction: column;
		align-items: stretch;
	}
}
</style>
