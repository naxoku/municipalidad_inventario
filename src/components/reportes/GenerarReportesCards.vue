<template>
	<n-card :bordered="false" embedded>
		<template #header>
			<n-space align="center" :size="8">
				<n-icon :component="DocumentIcon" :size="20" />
				<span>Generar Reportes</span>
			</n-space>
		</template>
		<n-grid :x-gap="12" :y-gap="12" :cols="3">
			<n-gi>
				<n-card title="Equipos Antiguos" :bordered="false" :segmented="{ content: 'soft' }" size="small">
					<n-space vertical :size="8">
						<n-text depth="3">Exportar listado de equipos que requieren atención</n-text>
						<n-space>
							<n-button type="error" secondary @click="exportarAntiguosPDF()" :loading="exportandoPDF">
								<template #icon>
									<n-icon :component="DocumentTextIcon" />
								</template>
								PDF
							</n-button>
							<n-button type="info" secondary @click="exportarAntiguosExcel()" :loading="exportandoExcel">
								<template #icon>
									<n-icon :component="StatsChartIcon" />
								</template>
								CSV
							</n-button>
						</n-space>
					</n-space>
				</n-card>
			</n-gi>

			<n-gi>
				<n-card title="Historial de Movimientos" :bordered="false" :segmented="{ content: 'soft' }" size="small">
					<n-space vertical :size="8">
						<n-text depth="3">Exportar actividad y movimientos recientes</n-text>
						<n-space>
							<n-button type="error" secondary @click="exportarHistorialPDF()" :loading="exportandoPDF">
								<template #icon>
									<n-icon :component="DocumentTextIcon" />
								</template>
								PDF
							</n-button>
							<n-button type="info" secondary @click="exportarHistorialExcel()" :loading="exportandoExcel">
								<template #icon>
									<n-icon :component="StatsChartIcon" />
								</template>
								CSV
							</n-button>
						</n-space>
					</n-space>
				</n-card>
			</n-gi>

			<n-gi>
				<n-card title="Reporte Completo" :bordered="false" :segmented="{ content: 'soft' }" size="small">
					<n-space vertical :size="8">
						<n-text depth="3"> Incluye equipos antiguos, historial y resumen ejecutivo </n-text>
						<n-button type="success" block @click="exportarReporteCompleto()" :loading="exportandoPDF">
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
</template>

<script setup lang="ts">
import { NCard, NSpace, NIcon, NGrid, NGi, NText, NButton } from 'naive-ui'
import {
	DocumentOutline as DocumentIcon,
	DocumentTextOutline as DocumentTextIcon,
	StatsChartOutline as StatsChartIcon,
	PrintOutline as PrintIcon,
} from '@vicons/ionicons5'
import { useReportesData } from '../../composables/useReportesData'

const {
	exportandoPDF,
	exportandoExcel,
	exportarAntiguosPDF,
	exportarAntiguosExcel,
	exportarHistorialPDF,
	exportarHistorialExcel,
	exportarReporteCompleto,
} = useReportesData()
</script>
