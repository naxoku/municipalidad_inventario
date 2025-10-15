<template>
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
</template>

<script setup lang="ts">
import { NCard, NSpace, NIcon, NTag, NDataTable, NEmpty } from 'naive-ui'
import {
	WarningOutline as WarningIcon,
	CheckmarkCircleOutline as CheckmarkCircleIcon,
} from '@vicons/ionicons5'
import { useReportesData } from '../../composables/useReportesData'

const { equiposCriticos, columnsAlertas } = useReportesData()
</script>
