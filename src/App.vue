<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider, NLayout } from 'naive-ui'
import AppSidebar from './components/AppSidebar.vue'

const collapsed = ref(false)
</script>

<template>
	<n-config-provider>
		<n-message-provider>
			<n-layout has-sider style="height: 100vh">
				<AppSidebar v-model:collapsed="collapsed" />
				<n-layout>
					<main class="main-content">
						<RouterView />
					</main>
				</n-layout>
			</n-layout>
		</n-message-provider>
	</n-config-provider>
</template>

<style scoped>
.main-content {
	padding: 1.5rem;
	background-color: #f8f9fa;
	height: 100%;
	overflow-y: auto;
}
</style>
