<template>
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
				<n-input v-model:value="searchEvento" placeholder="Buscar por equipo o responsable..." clearable
					style="min-width: 250px">
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
				<n-date-picker v-model:value="rangoFechas" type="daterange" clearable format="dd/MM/yyyy" />
			</n-space>

			<n-scrollbar style="max-height: 600px">
				<n-timeline v-if="eventosPaginados.length > 0">
					<n-timeline-item v-for="evento in eventosPaginados" :key="evento.id" :type="evento.type"
						:title="evento.titulo" :time="formatearFecha(evento.fecha)">
						<template #icon>
							<n-icon :component="evento.icono" />
						</template>
						<n-card :bordered="false" size="small" :type="getCardTypeForEvent(evento.type)">
							<n-space vertical :size="4">
								<n-text>{{ evento.descripcion }}</n-text>
								<div style="font-size: 0.875rem; color: var(--n-text-color-3)">
									<RenderVNode :vnode="evento.detalle" v-if="typeof evento.detalle !== 'string'" />
									<n-text depth="3" v-else>{{ evento.detalle }}</n-text>
								</div>
							</n-space>
						</n-card>
					</n-timeline-item>
				</n-timeline>
				<n-empty v-else description="No hay eventos para mostrar con los filtros seleccionados." />
			</n-scrollbar>

			<n-pagination v-if="eventosFiltrados.length > pageSize" v-model:page="currentPage"
				:page-count="Math.ceil(eventosFiltrados.length / pageSize)" :page-size="pageSize" show-size-picker
				:page-sizes="[10, 20, 50]" @update:page-size="handlePageSizeChange" />
		</n-space>
	</n-card>
</template>

<script setup lang="ts">
import {
	NCard,
	NSpace,
	NIcon,
	NTag,
	NInput,
	NCheckboxGroup,
	NCheckbox,
	NDatePicker,
	NScrollbar,
	NTimeline,
	NTimelineItem,
	NEmpty,
	NPagination,
	NText,
} from 'naive-ui'
import { TimeOutline as TimeIcon, SearchOutline as SearchIcon } from '@vicons/ionicons5'
import { useReportesData } from '../../composables/useReportesData'
import { formatearFecha, getCardTypeForEvent } from '../../utils/reportesUtils'
import RenderVNode from '../utils/RenderVNode.vue'

const {
	searchEvento,
	tiposEventoSeleccionados,
	rangoFechas,
	eventosFiltrados,
	eventosPaginados,
	currentPage,
	pageSize,
	handlePageSizeChange,
} = useReportesData()
</script>
