<script setup lang="ts">
import { reactive, ref } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { NForm, NFormItem, NInput, NButton, NDatePicker, NSelect, NSpin } from 'naive-ui'
import type { Equipo } from '../types/equipo'

const emit = defineEmits(['equipo-agregado'])
const cargando = ref(false)

const nuevoEquipo = reactive<Equipo>({
	fecha_ingreso: null,
	tipo_equipo: '',
	modelo: '',
	num_serie: '',
	num_inventario: '',
	departamento: '',
	estado: 'Activo',
})

const agregarEquipo = async () => {
	cargando.value = true
	const { data, error } = await supabase
		.from('Equipos')
		.insert([
			{
				...nuevoEquipo,
				fecha_ingreso: nuevoEquipo.fecha_ingreso
					? new Date(nuevoEquipo.fecha_ingreso).toISOString()
					: null,
			},
		])
		.select()

	cargando.value = false

	if (error) {
		console.error('Error al agregar equipo:', error.message)
	} else if (data && data.length > 0) {
		emit('equipo-agregado', data[0]) // 👈 avisamos al padre
		Object.assign(nuevoEquipo, {
			fecha_ingreso: null,
			tipo_equipo: '',
			modelo: '',
			num_serie: '',
			num_inventario: '',
			departamento: '',
			estado: 'Activo',
		})
	}
}
</script>

<template>
	<n-spin :show="cargando">
		<n-form @submit.prevent="agregarEquipo">
			<n-form-item label="Fecha de ingreso">
				<n-date-picker v-model:value="nuevoEquipo.fecha_ingreso" type="datetime" />
			</n-form-item>

			<n-form-item label="Tipo de equipo">
				<n-input v-model:value="nuevoEquipo.tipo_equipo" placeholder="Ej: Notebook" />
			</n-form-item>

			<n-form-item label="Modelo">
				<n-input v-model:value="nuevoEquipo.modelo" placeholder="Ej: HP ProBook 450 G6" />
			</n-form-item>

			<n-form-item label="Número de serie">
				<n-input v-model:value="nuevoEquipo.num_serie" placeholder="Ej: SN123456" />
			</n-form-item>

			<n-form-item label="Número de inventario">
				<n-input v-model:value="nuevoEquipo.num_inventario" placeholder="Ej: INV-001" />
			</n-form-item>

			<n-form-item label="Departamento">
				<n-input v-model:value="nuevoEquipo.departamento" placeholder="Ej: IT" />
			</n-form-item>

			<n-form-item label="Estado">
				<n-select
					v-model:value="nuevoEquipo.estado"
					:options="[
						{ label: 'Activo', value: 'Activo' },
						{ label: 'Inactivo', value: 'Inactivo' },
					]"
				/>
			</n-form-item>

			<n-form-item>
				<n-button type="primary" native-type="submit" :loading="cargando">
					Agregar Equipo
				</n-button>
			</n-form-item>
		</n-form>
	</n-spin>
</template>
