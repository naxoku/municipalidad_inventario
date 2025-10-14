<template>
	<div class="page-header">
		<div class="header-main">
			<n-h2 style="margin: 0; margin-bottom: 4px">{{ title }}</n-h2>
			<slot name="subtitle">
				<n-text v-if="subtitle" depth="3">{{ subtitle }}</n-text>
			</slot>
		</div>

		<div class="header-actions">
			<slot name="actions"></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { NH2, NText } from 'naive-ui'

defineProps({
	title: {
		type: String,
		required: true,
	},
	subtitle: {
		type: String,
		default: '',
	},
})
</script>

<style scoped>
.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 16px;
	flex-wrap: wrap;
}

.header-main {
	min-width: 0;
}

.header-actions {
	flex-shrink: 0;
}

@media (max-width: 768px) {
	.page-header {
		flex-direction: column;
		align-items: stretch;
	}
}
</style>
