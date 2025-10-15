import { ref, computed, onMounted, h, watch } from 'vue'
import { type DataTableColumns, NTag, NTime, NSpace } from 'naive-ui'
import {
	AddCircleOutline as AddCircleIcon,
	SwapHorizontalOutline as SwapHorizontalIcon,
	ConstructOutline as ConstructIcon,
	ArchiveOutline as ArchiveIcon,
} from '@vicons/ionicons5'
import { supabase } from '../lib/supabaseClient'
import type { Equipo } from '../types/equipo'
import type { EquipoConAlerta, Evento } from '../types/reportes'
import {
	calcularAños,
	calcularAlerta,
	formatearAntiguedad,
	formatearFecha,
	exportToCSV,
} from '../utils/reportesUtils'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export function useReportesData() {
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
	const tiposEventoSeleccionados = ref<string[]>([
		'ingreso',
		'reasignacion',
		'mantenimiento',
		'baja',
	])

	// Paginación del timeline
	const currentPage = ref(1)
	const pageSize = ref(20)

	// Estados de exportación
	const exportandoPDF = ref(false)
	const exportandoExcel = ref(false)

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
		{
			title: 'Antigüedad',
			key: 'años',
			width: 100,
			render: (row) => formatearAntiguedad(row.años),
		},
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
					descripcion: `Nuevo equipo ${equipo.tipo_equipo || 'Equipo'} registrado.`,
					detalle: h(NSpace, { size: 'small', wrap: true }, () => [
						h(
							NTag,
							{ size: 'small', bordered: false },
							() => `Departamento: ${equipo.departamento || 'N/A'}`,
						),
						h(
							NTag,
							{ size: 'small', bordered: false },
							() => `Responsable: ${equipo.responsable || 'N/A'}`,
						),
					]),
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
					descripcion: `Cambio de ubicación o responsable.`,
					detalle: h(NSpace, { size: 'small', vertical: true }, () => [
						h(NSpace, { size: 'small', wrap: true }, () => [
							h(
								NTag,
								{ type: 'info', size: 'small', bordered: false },
								() =>
									`Depto: ${r.departamento_anterior || 'N/A'} → ${r.departamento_nuevo || 'N/A'}`,
							),
							h(
								NTag,
								{ type: 'info', size: 'small', bordered: false },
								() => `Resp: ${r.responsable_anterior || 'N/A'} → ${r.responsable_nuevo || 'N/A'}`,
							),
						]),
						h(
							NTag,
							{ size: 'small', bordered: false },
							() => `Motivo: ${r.motivo || 'Sin especificar'}`,
						),
					]),
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
					descripcion: `Mantenimiento realizado: ${m.descripcion || 'Sin descripción'}`,
					detalle: h(NSpace, { size: 'small', wrap: true }, () => [
						h(
							NTag,
							{ type: 'warning', size: 'small', bordered: false },
							() => `Técnico: ${m.encargado_mantenimiento || 'N/A'}`,
						),
						m.notas ? h(NTag, { size: 'small', bordered: false }, () => `Notas: ${m.notas}`) : null,
					]),
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
					descripcion: `Equipo dado de baja: ${equipo.motivo_baja || 'Sin motivo especificado'}`,
					detalle: h(
						NTag,
						{ type: 'error', size: 'small', bordered: false },
						() => `Encargado: ${equipo.encargado_baja || 'N/A'}`,
					),
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

	// Funciones de exportación
	const exportarAntiguosPDF = async (message: ReturnType<typeof useMessage>) => {
		exportandoPDF.value = true
		try {
			if (equiposCriticos.value.length === 0) {
				message.warning('No hay equipos antiguos para exportar a PDF.')
				return
			}

			// Orientación horizontal ('landscape')
			const doc = new jsPDF('landscape', 'mm', 'a4')

			doc.setFontSize(18)
			doc.text('Reporte de Equipos Antiguos', 14, 15)
			doc.setFontSize(10)
			doc.setTextColor(100)
			doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-CL')}`, 14, 22)
			doc.setTextColor(0)

			const headers = [
				'Alerta',
				'Antigüedad',
				'N° Inventario',
				'Fecha Ingreso',
				'Tipo',
				'Modelo',
				'Departamento',
				'Responsable',
			]
			const data = equiposCriticos.value.map((e) => [
				e.alerta.texto,
				formatearAntiguedad(e.años),
				e.num_inventario || 'N/A',
				new Date(e.fecha_ingreso!).toLocaleDateString('es-CL'),
				e.tipo_equipo || 'N/A',
				e.modelo || 'N/A',
				e.departamento || 'N/A',
				e.responsable || 'N/A',
			])

			autoTable(doc, {
				startY: 28,
				head: [headers],
				body: data,
				theme: 'striped',
				styles: {
					fontSize: 9,
					cellPadding: 3,
					overflow: 'linebreak',
					halign: 'left',
				},
				headStyles: {
					fillColor: [192, 57, 43], // Rojo para PDF de equipos antiguos
					textColor: [255, 255, 255],
					fontStyle: 'bold',
					halign: 'center',
				},
				alternateRowStyles: {
					fillColor: [252, 243, 242],
				},
				columnStyles: {
					0: { cellWidth: 22, halign: 'center' },
					1: { cellWidth: 25, halign: 'center' },
					2: { cellWidth: 28 },
					3: { cellWidth: 28, halign: 'center' },
					4: { cellWidth: 30 },
					5: { cellWidth: 40 },
					6: { cellWidth: 35 },
					7: { cellWidth: 35 },
				},
				margin: { left: 14, right: 14 },
			})

			const pdfBlob = doc.output('blob')
			const pdfUrl = URL.createObjectURL(pdfBlob)
			window.open(pdfUrl, '_blank')
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

	const exportarAntiguosExcel = (message: ReturnType<typeof useMessage>) => {
		exportandoExcel.value = true
		try {
			if (equiposCriticos.value.length === 0) {
				message.warning('No hay equipos antiguos para exportar a CSV.')
				return
			}

			const dataToExport = equiposCriticos.value.map((e) => ({
				Alerta: e.alerta.texto,
				Antigüedad: formatearAntiguedad(e.años),
				Inventario: e.num_inventario,
				'Fecha Ingreso': new Date(e.fecha_ingreso!).toLocaleDateString('es-CL'),
				Tipo: e.tipo_equipo,
				Modelo: e.modelo,
				Departamento: e.departamento,
				Responsable: e.responsable,
			}))

			exportToCSV(dataToExport, `reporte_equipos_antiguos_${new Date().getTime()}.csv`)
			message.success('Reporte de equipos antiguos generado (CSV).')
		} catch (error: unknown) {
			message.error(
				'Error al generar reporte CSV: ' + (error instanceof Error ? error.message : String(error)),
			)
			console.error(error)
		} finally {
			exportandoExcel.value = false
		}
	}

	const exportarHistorialPDF = async (message: ReturnType<typeof useMessage>) => {
		exportandoPDF.value = true
		try {
			if (eventosFiltrados.value.length === 0) {
				message.warning('No hay eventos en el historial para exportar a PDF.')
				return
			}

			// Orientación horizontal ('landscape')
			const doc = new jsPDF('landscape', 'mm', 'a4')

			doc.setFontSize(18)
			doc.text('Reporte de Historial de Movimientos', 14, 15)
			doc.setFontSize(10)
			doc.setTextColor(100)
			doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-CL')}`, 14, 22)
			doc.setTextColor(0)

			const headers = ['Fecha', 'Tipo', 'Título', 'Descripción', 'Detalle', 'Modelo', 'Responsable']
			const data = eventosFiltrados.value.map((e) => [
				formatearFecha(e.fecha),
				e.tipo.charAt(0).toUpperCase() + e.tipo.slice(1),
				e.titulo,
				e.descripcion,
				typeof e.detalle === 'string' ? e.detalle : 'N/A', // Para PDF, solo se puede exportar string
				e.equipo_modelo ?? 'N/A',
				e.equipo_responsable ?? 'N/A',
			])

			autoTable(doc, {
				startY: 28,
				head: [headers],
				body: data,
				theme: 'striped',
				styles: {
					fontSize: 8,
					cellPadding: 3,
					overflow: 'linebreak',
					halign: 'left',
				},
				headStyles: {
					fillColor: [192, 57, 43], // Rojo para PDF de historial
					textColor: [255, 255, 255],
					fontStyle: 'bold',
					halign: 'center',
				},
				alternateRowStyles: {
					fillColor: [252, 243, 242],
				},
				columnStyles: {
					0: { cellWidth: 25, halign: 'center' },
					1: { cellWidth: 25, halign: 'center' },
					2: { cellWidth: 45 },
					3: { cellWidth: 50 },
					4: { cellWidth: 55 },
					5: { cellWidth: 35 },
					6: { cellWidth: 35 },
				},
				margin: { left: 14, right: 14 },
			})

			const pdfBlob = doc.output('blob')
			const pdfUrl = URL.createObjectURL(pdfBlob)
			window.open(pdfUrl, '_blank')
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

	const exportarHistorialExcel = (message: ReturnType<typeof useMessage>) => {
		exportandoExcel.value = true
		try {
			if (eventosFiltrados.value.length === 0) {
				message.warning('No hay eventos en el historial para exportar a CSV.')
				return
			}

			const dataToExport = eventosFiltrados.value.map((e) => ({
				Fecha: formatearFecha(e.fecha),
				Tipo: e.tipo,
				Título: e.titulo,
				Descripción: e.descripcion,
				Detalle: typeof e.detalle === 'string' ? e.detalle : 'N/A', // Para CSV, solo se puede exportar string
				'Modelo Equipo': e.equipo_modelo,
				'Responsable Equipo': e.equipo_responsable,
			}))

			exportToCSV(dataToExport, `reporte_historial_movimientos_${new Date().getTime()}.csv`)
			message.success('Reporte de historial de movimientos generado (CSV).')
		} catch (error: unknown) {
			message.error(
				'Error al generar reporte CSV: ' + (error instanceof Error ? error.message : String(error)),
			)
			console.error(error)
		} finally {
			exportandoExcel.value = false
		}
	}

	const exportarReporteCompleto = async (message: ReturnType<typeof useMessage>) => {
		exportandoPDF.value = true
		try {
			const doc = new jsPDF('landscape', 'mm', 'a4')
			let yOffset = 15

			// Título principal
			doc.setFontSize(20)
			doc.setFont('helvetica', 'bold')
			doc.text('Reporte Completo de Inventario', 14, yOffset)
			yOffset += 7
			doc.setFontSize(10)
			doc.setFont('helvetica', 'normal')
			doc.setTextColor(100)
			doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-CL')}`, 14, yOffset)
			doc.setTextColor(0)
			yOffset += 12

			// Sección de Equipos Antiguos
			doc.setFontSize(14)
			doc.setFont('helvetica', 'bold')
			doc.text('1. Equipos que Requieren Atención', 14, yOffset)
			doc.setFont('helvetica', 'normal')
			yOffset += 7

			if (equiposCriticos.value.length > 0) {
				const headersAntiguos = [
					'Alerta',
					'Antigüedad',
					'N° Inventario',
					'Fecha Ingreso',
					'Tipo',
					'Modelo',
					'Departamento',
					'Responsable',
				]
				const dataAntiguos = equiposCriticos.value.map((e) => [
					e.alerta.texto,
					formatearAntiguedad(e.años),
					e.num_inventario ?? 'N/A',
					new Date(e.fecha_ingreso!).toLocaleDateString('es-CL'),
					e.tipo_equipo ?? 'N/A',
					e.modelo ?? 'N/A',
					e.departamento ?? 'N/A',
					e.responsable ?? 'N/A',
				])

				autoTable(doc, {
					startY: yOffset,
					head: [headersAntiguos],
					body: dataAntiguos,
					theme: 'striped',
					styles: {
						fontSize: 8,
						cellPadding: 2.5,
						overflow: 'linebreak',
						halign: 'left',
					},
					headStyles: {
						fillColor: [192, 57, 43],
						textColor: [255, 255, 255],
						fontStyle: 'bold',
						halign: 'center',
					},
					alternateRowStyles: {
						fillColor: [252, 243, 242],
					},
					columnStyles: {
						0: { cellWidth: 20, halign: 'center' },
						1: { cellWidth: 22, halign: 'center' },
						2: { cellWidth: 25 },
						3: { cellWidth: 25, halign: 'center' },
						4: { cellWidth: 28 },
						5: { cellWidth: 38 },
						6: { cellWidth: 32 },
						7: { cellWidth: 32 },
					},
					margin: { left: 14, right: 14 },
				})

				yOffset = (doc as any).lastAutoTable.finalY + 15
			} else {
				doc.setFontSize(10)
				doc.setTextColor(100)
				doc.text('No hay equipos que requieran atención.', 14, yOffset)
				doc.setTextColor(0)
				yOffset += 15
			}

			// Verificar si necesitamos una nueva página
			if (yOffset > 160) {
				doc.addPage()
				yOffset = 15
			}

			// Sección de Historial de Movimientos
			doc.setFontSize(14)
			doc.setFont('helvetica', 'bold')
			doc.text('2. Historial de Movimientos', 14, yOffset)
			doc.setFont('helvetica', 'normal')
			yOffset += 7

			if (eventosFiltrados.value.length > 0) {
				const headersHistorial = [
					'Fecha',
					'Tipo',
					'Título',
					'Descripción',
					'Detalle',
					'Modelo',
					'Responsable',
				]
				const dataHistorial = eventosFiltrados.value.map((e) => [
					formatearFecha(e.fecha),
					e.tipo.charAt(0).toUpperCase() + e.tipo.slice(1),
					e.titulo,
					e.descripcion,
					typeof e.detalle === 'string' ? e.detalle : 'N/A', // Para PDF, solo se puede exportar string
					e.equipo_modelo ?? 'N/A',
					e.equipo_responsable ?? 'N/A',
				])

				autoTable(doc, {
					startY: yOffset,
					head: [headersHistorial],
					body: dataHistorial,
					theme: 'striped',
					styles: {
						fontSize: 7.5,
						cellPadding: 2.5,
						overflow: 'linebreak',
						halign: 'left',
					},
					headStyles: {
						fillColor: [41, 128, 185],
						textColor: [255, 255, 255],
						fontStyle: 'bold',
						halign: 'center',
					},
					alternateRowStyles: {
						fillColor: [235, 245, 251],
					},
					columnStyles: {
						0: { cellWidth: 22, halign: 'center' },
						1: { cellWidth: 22, halign: 'center' },
						2: { cellWidth: 42 },
						3: { cellWidth: 48 },
						4: { cellWidth: 52 },
						5: { cellWidth: 32 },
						6: { cellWidth: 32 },
					},
					margin: { left: 14, right: 14 },
				})
			} else {
				doc.setFontSize(10)
				doc.setTextColor(100)
				doc.text('No hay eventos en el historial para mostrar.', 14, yOffset)
				doc.setTextColor(0)
			}

			const pdfBlob = doc.output('blob')
			const pdfUrl = URL.createObjectURL(pdfBlob)
			window.open(pdfUrl, '_blank')
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

	return {
		equipos,
		cargando,
		rangoFechas,
		searchEvento,
		tiposEventoSeleccionados,
		currentPage,
		pageSize,
		exportandoPDF,
		exportandoExcel,
		equiposCriticos,
		columnsAlertas,
		eventos,
		eventosFiltrados,
		eventosPaginados,
		handlePageSizeChange,
		exportarAntiguosPDF,
		exportarAntiguosExcel,
		exportarHistorialPDF,
		exportarHistorialExcel,
		exportarReporteCompleto,
		formatearFecha,
	}
}
