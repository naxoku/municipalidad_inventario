<template>
	<div class="reportes-page">
		<n-space vertical :size="24" class="page-container">
			<div class="page-header">
				<div>
					<n-h2 style="margin: 0; margin-bottom: 4px">Reportes y Alertas</n-h2>
					<n-text depth="3">Análisis del inventario y actividad reciente</n-text>
				</div>
			</div>

			<EquiposCriticosTable />

			<ActividadRecienteTimeline />

			<GenerarReportesCards />
		</n-space>
	</div>
</template>

<script setup lang="ts">
import { NSpace, NH2, NText } from 'naive-ui'
import EquiposCriticosTable from '../components/reportes/EquiposCriticosTable.vue'
import ActividadRecienteTimeline from '../components/reportes/ActividadRecienteTimeline.vue'
import GenerarReportesCards from '../components/reportes/GenerarReportesCards.vue'
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
