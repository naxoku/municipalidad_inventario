<template>
	<PageHeader title="Jerarquía de Equipos" />
	<n-card>
		<n-spin :show="loadingTree">
			<n-tree
				block-line
				:data="treeData"
				key-field="key"
				label-field="label"
				children-field="children"
				:render-suffix="
					({ option }) =>
						h(
							NButton,
							{
								size: 'small',
								onClick: () => handleUpdateNode(option),
							},
							{ default: () => 'Editar' },
						)
				"
			/>
		</n-spin>

		<n-modal v-model:show="showEditModal" preset="dialog" title="Editar Nodo de Organigrama">
			<n-form :model="formValue">
				<n-form-item label="Nombre">
					<n-input v-model:value="formValue.nombre" />
				</n-form-item>
				<n-form-item label="Tipo">
					<n-input v-model:value="formValue.tipo" disabled />
				</n-form-item>
				<n-form-item v-if="formValue.tipo !== 'Direccion'" label="Padre">
					<n-select v-model:value="formValue.parent_id" :options="parentOptions" clearable />
				</n-form-item>
			</n-form>
			<template #action>
				<n-button @click="showEditModal = false">Cancelar</n-button>
				<n-button type="primary" @click="submitEdit">Guardar</n-button>
			</template>
		</n-modal>
	</n-card>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, h } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import {
	NCard,
	NTree,
	NButton,
	NModal,
	NForm,
	NFormItem,
	NInput,
	NSelect,
	NSpin,
	useMessage,
} from 'naive-ui'
import type { TreeOption } from 'naive-ui'
import { useOrganigramaStore } from '../stores/organigrama'
import { supabase } from '../lib/supabaseClient'

const organigramaStore = useOrganigramaStore()
const message = useMessage()

const treeData = ref<TreeOption[]>([])
const loadingTree = ref(false)

const showEditModal = ref(false)
const editingNode = ref<any>(null)
const formValue = ref({
	id: '',
	nombre: '',
	tipo: '',
	parent_id: null as string | null,
})
const parentOptions = ref<Array<{ label: string; value: string }>>([])

const mapOrganigramaToTreeOptions = (nodes: any[]): TreeOption[] => {
	return nodes.map((node) => ({
		key: node.id,
		label: node.nombre,
		children: node.children ? mapOrganigramaToTreeOptions(node.children) : [],
		isLeaf: !node.children || node.children.length === 0,
		type: node.tipo,
		parentId: node.parent_id,
	}))
}

const fetchAndBuildTree = async () => {
	loadingTree.value = true
	await organigramaStore.fetchOrganigrama()
	if (organigramaStore.organigramaAnidado) {
		treeData.value = mapOrganigramaToTreeOptions(organigramaStore.organigramaAnidado)
	}
	loadingTree.value = false
}

onMounted(() => {
	fetchAndBuildTree()
})

const handleUpdateNode = (node: TreeOption) => {
	editingNode.value = node
	formValue.value = {
		id: node.key as string,
		nombre: node.label as string,
		tipo: node.type as string,
		parent_id: node.parentId as string | null,
	}
	updateParentOptions(node.type as string, node.key as string)
	showEditModal.value = true
}

const updateParentOptions = (nodeType: string, nodeId: string) => {
	let options: Array<{ label: string; value: string }> = []
	if (nodeType === 'Departamento') {
		options = organigramaStore.direcciones.map((dir) => ({
			label: dir.nombre,
			value: dir.id,
		}))
	} else if (nodeType === 'Unidad') {
		options = organigramaStore.organigramaData
			.filter((node) => node.tipo === 'Departamento')
			.map((dep) => ({
				label: dep.nombre,
				value: dep.id,
			}))
	}
	parentOptions.value = options.filter((opt) => opt.value !== nodeId) // No puede ser padre de sí mismo
}

watch(
	() => formValue.value.tipo,
	(newType) => {
		if (editingNode.value) {
			updateParentOptions(newType, editingNode.value.key as string)
		}
	},
)

const submitEdit = async () => {
	try {
		const oldNode = organigramaStore.organigramaData.find((n) => n.id === formValue.value.id)
		if (!oldNode) {
			message.error('Nodo original no encontrado.')
			return
		}

		const { error: updateError } = await supabase
			.from('jerarquia_organigrama')
			.update({
				nombre: formValue.value.nombre,
				parent_id: formValue.value.parent_id,
			})
			.eq('id', formValue.value.id)

		if (updateError) throw updateError

		// Lógica para actualizar equipos afectados
		if (oldNode.tipo === 'Direccion' && oldNode.nombre !== formValue.value.nombre) {
			// Si cambia el nombre de una dirección
			await supabase
				.from('equipos')
				.update({ direccion: formValue.value.nombre })
				.eq('direccion', oldNode.nombre)
		} else if (oldNode.tipo === 'Departamento' && oldNode.nombre !== formValue.value.nombre) {
			// Si cambia el nombre de un departamento
			await supabase
				.from('equipos')
				.update({ departamento: formValue.value.nombre })
				.eq('departamento', oldNode.nombre)
		} else if (oldNode.tipo === 'Unidad' && oldNode.nombre !== formValue.value.nombre) {
			// Si cambia el nombre de una unidad
			await supabase
				.from('equipos')
				.update({ unidad: formValue.value.nombre })
				.eq('unidad', oldNode.nombre)
		}

		// Si cambia el parent_id de un departamento o unidad
		if (oldNode.parent_id !== formValue.value.parent_id) {
			if (oldNode.tipo === 'Departamento') {
				const newParentDir = organigramaStore.organigramaData.find(
					(n) => n.id === formValue.value.parent_id,
				)
				if (newParentDir) {
					await supabase
						.from('equipos')
						.update({ direccion: newParentDir.nombre })
						.eq('departamento', oldNode.nombre)
				}
			} else if (oldNode.tipo === 'Unidad') {
				const newParentDep = organigramaStore.organigramaData.find(
					(n) => n.id === formValue.value.parent_id,
				)
				if (newParentDep) {
					const newParentDir = organigramaStore.organigramaData.find(
						(n) => n.id === newParentDep.parent_id,
					)
					await supabase
						.from('equipos')
						.update({
							departamento: newParentDep.nombre,
							direccion: newParentDir?.nombre || null,
						})
						.eq('unidad', oldNode.nombre)
				}
			}
		}

		message.success('Jerarquía y equipos actualizados correctamente.')
		showEditModal.value = false
		fetchAndBuildTree() // Recargar el árbol
	} catch (err: any) {
		message.error('Error al actualizar: ' + err.message)
		console.error('Error al actualizar jerarquía:', err.message)
	}
}
</script>
