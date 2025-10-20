<template>
	<PageHeader title="Jerarquía de Equipos" />
	<n-card>
		<n-button type="primary" @click="showCreateModal = true" style="margin-bottom: 15px">
			Crear Nuevo Elemento
		</n-button>
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

		<!-- Modal para Editar Nodo -->
		<n-modal v-model:show="showEditModal" preset="dialog" title="Editar Nodo de Organigrama">
			<n-form :model="formValue">
				<n-form-item label="Nombre">
					<n-input v-model:value="formValue.nombre" />
				</n-form-item>
				<n-form-item label="Tipo">
					<n-select v-model:value="formValue.tipo" :options="nodeTypeOptions" />
				</n-form-item>
				<n-form-item v-if="formValue.tipo !== 'Direccion'" label="Padre">
					<n-select v-model:value="formValue.parent_id" :options="parentOptions" clearable />
				</n-form-item>
				<n-form-item v-if="formValue.tipo === 'Direccion'" label="Padre">
					<n-input value="N/A" disabled />
				</n-form-item>
			</n-form>
			<template #action>
				<n-button @click="showEditModal = false">Cancelar</n-button>
				<n-button type="primary" @click="submitEdit">Guardar</n-button>
			</template>
		</n-modal>

		<!-- Modal para Crear Nuevo Nodo -->
		<n-modal
			v-model:show="showCreateModal"
			preset="dialog"
			title="Crear Nuevo Elemento de Organigrama"
		>
			<n-form :model="formCreateValue" label-placement="left" label-width="auto">
				<n-form-item label="Nombre de la Dirección">
					<n-input v-model:value="formCreateValue.nombre" placeholder="Nombre de la Dirección" />
				</n-form-item>

				<n-divider title-placement="left">Departamentos</n-divider>
				<n-button @click="addDepartment" type="info" dashed style="margin-bottom: 15px">
					Añadir Departamento
				</n-button>

				<div
					v-for="(department, depIndex) in formCreateValue.children"
					:key="depIndex"
					style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 5px"
				>
					<n-form-item :label="`Nombre Departamento ${depIndex + 1}`">
						<n-input v-model:value="department.nombre" placeholder="Nombre del Departamento" />
						<n-button
							@click="removeDepartment(depIndex)"
							type="error"
							size="small"
							style="margin-left: 10px"
						>
							Eliminar
						</n-button>
					</n-form-item>

					<n-divider title-placement="left" style="margin-top: 10px; margin-bottom: 10px"
						>Unidades del Departamento {{ depIndex + 1 }}</n-divider
					>
					<n-button
						@click="addUnit(depIndex)"
						type="info"
						dashed
						size="small"
						style="margin-bottom: 10px"
					>
						Añadir Unidad
					</n-button>

					<div
						v-for="(unit, unitIndex) in department.children"
						:key="unitIndex"
						style="margin-bottom: 10px; padding: 10px; border: 1px dashed #ccc; border-radius: 3px"
					>
						<n-form-item :label="`Nombre Unidad ${depIndex + 1}.${unitIndex + 1}`">
							<n-input v-model:value="unit.nombre" placeholder="Nombre de la Unidad" />
							<n-button
								@click="removeUnit(depIndex, unitIndex)"
								type="error"
								size="small"
								style="margin-left: 10px"
							>
								Eliminar
							</n-button>
						</n-form-item>
					</div>
				</div>
			</n-form>
			<template #action>
				<n-button @click="showCreateModal = false">Cancelar</n-button>
				<n-button type="primary" @click="submitCreate">Crear</n-button>
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
	NDivider,
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
const nodeTypeOptions = ref([
	{ label: 'Direccion', value: 'Direccion' },
	{ label: 'Departamento', value: 'Departamento' },
	{ label: 'Unidad', value: 'Unidad' },
])

const showCreateModal = ref(false)

// Definir la interfaz para los nodos de jerarquía en el formulario de creación
interface HierarchyNodeForm {
	nombre: string
	tipo: 'Direccion' | 'Departamento' | 'Unidad'
	parent_id: string | null
	children?: HierarchyNodeForm[] // Para departamentos y unidades anidadas
}

const formCreateValue = ref<HierarchyNodeForm>({
	nombre: '',
	tipo: 'Direccion', // Default a Direccion para la creación anidada
	parent_id: null,
	children: [],
})

const addDepartment = () => {
	formCreateValue.value.children?.push({
		nombre: '',
		tipo: 'Departamento',
		parent_id: null, // Se asignará al guardar
		children: [],
	})
}

const removeDepartment = (index: number) => {
	formCreateValue.value.children?.splice(index, 1)
}

const addUnit = (departmentIndex: number) => {
	if (formCreateValue.value.children && formCreateValue.value.children[departmentIndex]) {
		formCreateValue.value.children[departmentIndex].children?.push({
			nombre: '',
			tipo: 'Unidad',
			parent_id: null, // Se asignará al guardar
		})
	}
}

const removeUnit = (departmentIndex: number, unitIndex: number) => {
	if (formCreateValue.value.children && formCreateValue.value.children[departmentIndex].children) {
		formCreateValue.value.children[departmentIndex].children?.splice(unitIndex, 1)
	}
}

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

const updateParentOptions = (nodeType: string, nodeId: string | null) => {
	let options: Array<{ label: string; value: string }> = []
	if (nodeType === 'Departamento') {
		options = organigramaStore.organigramaData
			.filter((node) => node.tipo === 'Direccion')
			.map((dir) => ({
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
	if (nodeType === 'Direccion') {
		formValue.value.parent_id = null
	}
}

watch(
	() => formValue.value.tipo,
	(newType) => {
		if (editingNode.value) {
			updateParentOptions(newType, editingNode.value.key as string)
		}
	},
)

// El watch para formCreateValue.value.tipo ya no es necesario para actualizar createParentOptions
// porque la creación anidada maneja las relaciones padre-hijo internamente.
// const updateCreateParentOptions = (nodeType: string) => {
// 	let options: Array<{ label: string; value: string }> = []
// 	if (nodeType === 'Departamento') {
// 		options = organigramaStore.organigramaData
// 			.filter((node) => node.tipo === 'Direccion')
// 			.map((dir) => ({
// 				label: dir.nombre,
// 				value: dir.id,
// 			}))
// 	} else if (nodeType === 'Unidad') {
// 		options = organigramaStore.organigramaData
// 			.filter((node) => node.tipo === 'Departamento')
// 			.map((dep) => ({
// 				label: dep.nombre,
// 				value: dep.id,
// 			}))
// 	}
// 	createParentOptions.value = options
// 	if (nodeType === 'Direccion') {
// 		formCreateValue.value.parent_id = null
// 	}
// }

// watch(
// 	() => formCreateValue.value.tipo,
// 	(newType) => {
// 		updateCreateParentOptions(newType)
// 	},
// )

const getHierarchyNamesForNode = (nodeId: string | null, allNodes: any[]) => {
	let direccionName: string | null = null
	let departamentoName: string | null = null
	let unidadName: string | null = null

	if (!nodeId) return { direccionName, departamentoName, unidadName }

	const currentNode = allNodes.find((n) => n.id === nodeId)
	if (!currentNode) return { direccionName, departamentoName, unidadName }

	if (currentNode.tipo === 'Unidad') {
		unidadName = currentNode.nombre
		const parentDep = allNodes.find((n) => n.id === currentNode.parent_id)
		if (parentDep && parentDep.tipo === 'Departamento') {
			departamentoName = parentDep.nombre
			const parentDir = allNodes.find((n) => n.id === parentDep.parent_id)
			if (parentDir && parentDir.tipo === 'Direccion') {
				direccionName = parentDir.nombre
			}
		}
	} else if (currentNode.tipo === 'Departamento') {
		departamentoName = currentNode.nombre
		const parentDir = allNodes.find((n) => n.id === currentNode.parent_id)
		if (parentDir && parentDir.tipo === 'Direccion') {
			direccionName = parentDir.nombre
		}
	} else if (currentNode.tipo === 'Direccion') {
		direccionName = currentNode.nombre
	}

	return { direccionName, departamentoName, unidadName }
}

const submitEdit = async () => {
	try {
		const oldNode = organigramaStore.organigramaData.find((n) => n.id === formValue.value.id)
		if (!oldNode) {
			message.error('Nodo original no encontrado.')
			return
		}

		// 1. Actualizar el nodo en la tabla jerarquia_organigrama
		const { error: updateNodeError } = await supabase
			.from('jerarquia_organigrama')
			.update({
				nombre: formValue.value.nombre,
				tipo: formValue.value.tipo,
				parent_id: formValue.value.parent_id,
			})
			.eq('id', formValue.value.id)

		if (updateNodeError) throw updateNodeError

		// 2. Recargar la jerarquía para tener los datos más recientes en la store
		await fetchAndBuildTree()

		// 3. Actualizar todos los equipos para reflejar la nueva jerarquía
		// Obtener todos los equipos
		const { data: allEquipos, error: fetchAllEquiposError } = await supabase
			.from('equipos')
			.select('id, unidad, departamento, direccion')

		if (fetchAllEquiposError) throw fetchAllEquiposError

		for (const equipo of allEquipos) {
			let newDireccionName: string | null = null
			let newDepartamentoName: string | null = null
			let newUnidadName: string | null = null

			// Intentar encontrar el nodo de jerarquía más bajo al que pertenece el equipo
			let lowestNodeId: string | null = null
			if (equipo.unidad) {
				const unidadNode = organigramaStore.organigramaData.find(
					(n) => n.nombre === equipo.unidad && n.tipo === 'Unidad',
				)
				if (unidadNode) lowestNodeId = unidadNode.id
			} else if (equipo.departamento) {
				const departamentoNode = organigramaStore.organigramaData.find(
					(n) => n.nombre === equipo.departamento && n.tipo === 'Departamento',
				)
				if (departamentoNode) lowestNodeId = departamentoNode.id
			} else if (equipo.direccion) {
				const direccionNode = organigramaStore.organigramaData.find(
					(n) => n.nombre === equipo.direccion && n.tipo === 'Direccion',
				)
				if (direccionNode) lowestNodeId = direccionNode.id
			}

			// Si encontramos un nodo de jerarquía, obtenemos sus nombres de jerarquía
			if (lowestNodeId) {
				const hierarchyNames = getHierarchyNamesForNode(
					lowestNodeId,
					organigramaStore.organigramaData,
				)
				newDireccionName = hierarchyNames.direccionName
				newDepartamentoName = hierarchyNames.departamentoName
				newUnidadName = hierarchyNames.unidadName
			}

			const updates: { [key: string]: string | null } = {}
			let needsUpdate = false

			if (equipo.direccion !== newDireccionName) {
				updates.direccion = newDireccionName
				needsUpdate = true
			}
			if (equipo.departamento !== newDepartamentoName) {
				updates.departamento = newDepartamentoName
				needsUpdate = true
			}
			if (equipo.unidad !== newUnidadName) {
				updates.unidad = newUnidadName
				needsUpdate = true
			}

			if (needsUpdate) {
				const { error: updateEquipoError } = await supabase
					.from('equipos')
					.update(updates)
					.eq('id', equipo.id)
				if (updateEquipoError) throw updateEquipoError
			}
		}

		message.success('Jerarquía y equipos actualizados correctamente.')
		showEditModal.value = false
	} catch (err: any) {
		message.error('Error al actualizar: ' + err.message)
		console.error('Error al actualizar jerarquía:', err.message)
	}
}

const submitCreate = async () => {
	try {
		// Insertar la Dirección
		const { data: direccionData, error: direccionError } = await supabase
			.from('jerarquia_organigrama')
			.insert({
				nombre: formCreateValue.value.nombre,
				tipo: 'Direccion',
				parent_id: null,
			})
			.select()
			.single()

		if (direccionError) throw direccionError
		if (!direccionData) throw new Error('No se pudo crear la dirección.')

		const direccionId = direccionData.id

		// Insertar Departamentos y sus Unidades
		for (const department of formCreateValue.value.children || []) {
			const { data: departamentoData, error: departamentoError } = await supabase
				.from('jerarquia_organigrama')
				.insert({
					nombre: department.nombre,
					tipo: 'Departamento',
					parent_id: direccionId,
				})
				.select()
				.single()

			if (departamentoError) throw departamentoError
			if (!departamentoData) throw new Error('No se pudo crear el departamento.')

			const departamentoId = departamentoData.id

			for (const unit of department.children || []) {
				const { error: unidadError } = await supabase
					.from('jerarquia_organigrama')
					.insert({
						nombre: unit.nombre,
						tipo: 'Unidad',
						parent_id: departamentoId,
					})
					.select()

				if (unidadError) throw unidadError
			}
		}

		message.success('Jerarquía creada correctamente.')
		showCreateModal.value = false
		// Resetear el formulario
		formCreateValue.value = {
			nombre: '',
			tipo: 'Direccion',
			parent_id: null,
			children: [],
		}
		fetchAndBuildTree() // Recargar el árbol
	} catch (err: any) {
		message.error('Error al crear jerarquía: ' + err.message)
		console.error('Error al crear jerarquía:', err.message)
	}
}
</script>
