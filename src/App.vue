<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
// Aquí importamos el que falta
import { NConfigProvider, NMessageProvider } from 'naive-ui'
</script>

<template>
	<n-config-provider>
		<n-message-provider>
			<header>
				<img
					alt="Logo Inventario"
					class="logo"
					src="./assets/municipalidad-letra-negra.jpg"
					width="auto"
					height="80"
				/>

				<nav>
					<RouterLink to="/equipos">Equipos Activos</RouterLink>
					<RouterLink to="/equipos/baja">Equipos de Baja</RouterLink>
				</nav>
			</header>

			<main>
				<RouterView />
			</main>
		</n-message-provider>
	</n-config-provider>
</template>

<style scoped>
/* Estilos no se tocan, como pediste ;) */
header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0rem 2rem 0rem 2rem;
	background-color: #f5f5f5;
	border-bottom: 1px solid #ddd;
}

nav a {
	margin: 0 0.75rem;
	text-decoration: none;
	color: #2c3e50;
	font-weight: 600;
}

nav a.router-link-exact-active {
	color: #42b983;
	text-decoration: underline;
}
</style>
