export const MS_POR_AÑO = 365.25 * 24 * 60 * 60 * 1000

export const calcularAños = (fecha: string | number): number => {
	const años = (Date.now() - new Date(fecha).getTime()) / MS_POR_AÑO
	return Math.floor(años * 10) / 10
}

export const getCardTypeForEvent = (
	eventType: Evento['type'],
): 'default' | 'success' | 'info' | 'warning' | 'error' => {
	switch (eventType) {
		case 'success':
			return 'success'
		case 'info':
			return 'info'
		case 'warning':
			return 'warning'
		case 'error':
			return 'error'
		default:
			return 'default'
	}
}

export const formatearAntiguedad = (añosDecimal: number): string => {
	const añosEnteros = Math.floor(añosDecimal)
	const mesesDecimal = (añosDecimal - añosEnteros) * 12
	const mesesEnteros = Math.round(mesesDecimal)

	let resultado = ''
	if (añosEnteros > 0) {
		resultado += `${añosEnteros} año${añosEnteros !== 1 ? 's' : ''}`
	}
	if (mesesEnteros > 0) {
		if (resultado !== '') {
			resultado += ', '
		}
		resultado += `${mesesEnteros} mes${mesesEnteros !== 1 ? 'es' : ''}`
	}

	return resultado === '' ? 'Menos de 1 mes' : resultado
}

export const calcularAlerta = (fecha: string | number) => {
	const años = calcularAños(fecha)
	if (años >= 6) return { nivel: 'critico', texto: 'Urgente', tipo: 'error' as const }
	return { nivel: 'alto', texto: 'Alerta', tipo: 'warning' as const }
}

export const formatearFecha = (fecha: string | number): string => {
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

// Función auxiliar para exportar a CSV
export const exportToCSV = <T extends Record<string, unknown>>(data: T[], filename: string) => {
	if (!data.length) {
		// message.warning('No hay datos para exportar.') // No se puede usar useMessage aquí
		console.warn('No hay datos para exportar.')
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
