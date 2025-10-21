<template>
	<div class="jerarquia-page">
		<n-space vertical :size="24" class="page-container">
			<!-- Header -->
			<PageHeader title="Jerarquía de Equipos">
				<template #subtitle>
					{{ getTotalNodes() }} nodo{{ getTotalNodes() !== 1 ? 's' : '' }} en la estructura
				</template>

				<template #actions>
					<n-button type="primary" size="large" @click="openCreateDrawer">
						<template #icon>
							<n-icon>
								<Plus />
							</n-icon>
						</template>
						Nueva Dirección
					</n-button>
				</template>
			</PageHeader>

			<!-- Toolbar de Acciones -->
			<n-card :bordered="false" embedded>
				<n-space :size="12">
					<n-button @click="expandAll" quaternary>
						<template #icon>
							<n-icon>
								<ChevronDown />
							</n-icon>
						</template>
						Expandir Todo
					</n-button>
					<n-button @click="collapseAll" quaternary>
						<template #icon>
							<n-icon>
								<ChevronUp />
							</n-icon>
						</template>
						Contraer Todo
					</n-button>
				</n-space>
			</n-card>

			<!-- Árbol de Jerarquía -->
			<n-card :bordered="false">
				<n-spin :show="loadingTree">
					<n-empty
						v-if="treeData.length === 0 && !loadingTree"
						description="No hay elementos en la jerarquía"
						size="large"
					>
						<template #icon>
							<n-icon :component="Building" :size="64" :depth="3" />
						</template>
						<template #extra>
							<n-button type="primary" @click="openCreateDrawer">
								Crear Primera Dirección
							</n-button>
						</template>
					</n-empty>

					<n-tree
						v-else
						block-line
						:data="treeData"
						:expanded-keys="expandedKeys"
						@update:expanded-keys="expandedKeys = $event"
						key-field="key"
						label-field="label"
						children-field="children"
						:render-prefix="renderNodePrefix"
						:render-suffix="renderNodeActions"
					/>
				</n-spin>
			</n-card>
		</n-space>

		<!-- Drawer para Crear Jerarquía Completa -->
		<n-drawer
			v-model:show="showCreateDrawer"
			:width="600"
			placement="right"
			:trap-focus="false"
			:block-scroll="false"
		>
			<n-drawer-content title="Crear Nueva Jerarquía" closable>
				<n-alert type="info" style="margin-bottom: 20px">
					Crea una dirección completa con sus departamentos y unidades. Puedes agregar los
					departamentos y unidades opcionalmente.
				</n-alert>

				<n-steps :current="currentStep" style="margin-bottom: 30px">
					<n-step title="Dirección" description="Información básica" />
					<n-step title="Departamentos" description="Opcional" />
					<n-step title="Revisar" description="Confirmar" />
				</n-steps>

				<!-- Paso 1: Dirección -->
				<div v-show="currentStep === 1">
					<n-form ref="direccionFormRef" :model="formCreateValue">
						<n-card
							v-for="(direccion, index) in formCreateValue"
							:key="index"
							style="margin-bottom: 20px"
							:title="`Dirección ${index + 1}`"
						>
							<template #header-extra>
								<n-button
									v-if="formCreateValue.length > 1"
									@click="removeDirection(index)"
									tertiary
									type="error"
									size="small"
								>
									<template #icon>
										<n-icon>
											<Trash />
										</n-icon>
									</template>
									Eliminar
								</n-button>
							</template>
							<n-form-item
								label="Nombre de la Dirección"
								:path="`[${index}].nombre`"
								:rule="{ required: true, message: 'El nombre es requerido' }"
							>
								<n-input
									v-model:value="direccion.nombre"
									placeholder="Ej: Dirección de Operaciones"
									size="large"
								/>
							</n-form-item>
						</n-card>
						<n-button @click="addDirection" dashed block>
							<template #icon>
								<n-icon>
									<Plus />
								</n-icon>
							</template>
							Agregar otra Dirección
						</n-button>
					</n-form>

					<n-space justify="end" style="margin-top: 20px">
						<n-button @click="showCreateDrawer = false">Cancelar</n-button>
						<n-button type="primary" @click="nextStep">
							Siguiente
							<template #icon>
								<n-icon>
									<ArrowForwardOutline />
								</n-icon>
							</template>
						</n-button>
					</n-space>
				</div>

				<!-- Paso 2: Departamentos -->
				<div v-show="currentStep === 2">
					<n-space vertical size="large" style="width: 100%">
						<n-card
							v-for="(direccion, dirIndex) in formCreateValue"
							:key="dirIndex"
							style="margin-bottom: 20px"
							:title="`Dirección ${dirIndex + 1}: ${direccion.nombre || 'Sin nombre'}`"
						>
							<n-space vertical size="large" style="width: 100%">
								<n-card
									v-for="(department, depIndex) in direccion.children"
									:key="depIndex"
									style="margin-bottom: 10px; background-color: var(--n-color-info-light)"
								>
									<template #header>
										<n-space align="center">
											<n-icon :component="getNodeIcon('Departamento')" />
											<span>{{
												`Departamento ${depIndex + 1}: ${department.nombre || 'Sin nombre'}`
											}}</span>
										</n-space>
									</template>
									<template #header-extra>
										<n-popconfirm @positive-click="removeDepartment(dirIndex, depIndex)">
											<template #trigger>
												<n-button size="small" tertiary type="error" @click.stop>
													<template #icon>
														<n-icon>
															<Trash />
														</n-icon>
													</template>
												</n-button>
											</template>
											¿Eliminar este departamento?
										</n-popconfirm>
									</template>

									<n-form-item label="Nombre del Departamento">
										<n-input
											v-model:value="department.nombre"
											placeholder="Ej: Departamento de Logística"
										/>
									</n-form-item>

									<n-divider style="margin: 15px 0">Unidades</n-divider>

									<n-space vertical size="small" style="width: 100%">
										<n-card
											v-for="(unit, unitIndex) in department.children"
											:key="unitIndex"
											size="small"
											:bordered="true"
											style="background-color: var(--n-color-warning-light); padding: 10px"
										>
											<template #header>
												<n-space align="center">
													<n-icon :component="getNodeIcon('Unidad')" />
													<span>{{ unit.nombre || 'Nombre de la Unidad' }}</span>
												</n-space>
											</template>
											<n-space justify="space-between" align="center">
												<n-input
													v-model:value="unit.nombre"
													placeholder="Nombre de la Unidad"
													style="flex: 1"
												/>
												<n-popconfirm @positive-click="removeUnit(dirIndex, depIndex, unitIndex)">
													<template #trigger>
														<n-button size="small" tertiary type="error">
															<template #icon>
																<n-icon>
																	<Trash />
																</n-icon>
															</template>
														</n-button>
													</template>
													¿Eliminar esta unidad?
												</n-popconfirm>
											</n-space>
										</n-card>

										<n-button dashed block @click="addUnit(dirIndex, depIndex)">
											<template #icon>
												<n-icon>
													<Plus />
												</n-icon>
											</template>
											Agregar Unidad
										</n-button>
									</n-space>
								</n-card>

								<n-button
									dashed
									block
									type="info"
									@click="addDepartment(dirIndex)"
									style="margin-top: 10px"
								>
									<template #icon>
										<n-icon>
											<Plus />
										</n-icon>
									</template>
									Agregar Departamento a {{ direccion.nombre || `Dirección ${dirIndex + 1}` }}
								</n-button>
							</n-space>
						</n-card>
					</n-space>

					<n-space justify="space-between" style="margin-top: 20px">
						<n-button @click="prevStep">
							<template #icon>
								<n-icon>
									<ChevronLeft />
								</n-icon>
							</template>
							Anterior
						</n-button>
						<n-button type="primary" @click="nextStep">
							Siguiente
							<template #icon>
								<n-icon>
									<ArrowForwardOutline />
								</n-icon>
							</template>
						</n-button>
					</n-space>
				</div>

				<!-- Paso 3: Revisar -->
				<div v-show="currentStep === 3">
					<n-alert type="success" style="margin-bottom: 20px">
						Revisa la información antes de crear la jerarquía
					</n-alert>

					<div v-for="(direccion, index) in formCreateValue" :key="index">
						<n-descriptions bordered :column="1" style="margin-bottom: 20px">
							<n-descriptions-item label="Dirección">
								<n-tag type="primary" size="large">
									<template #icon>
										<n-icon>
											<Building />
										</n-icon>
									</template>
									{{ direccion.nombre }}
								</n-tag>
							</n-descriptions-item>
							<n-descriptions-item label="Departamentos">
								{{ direccion.children?.length || 0 }}
							</n-descriptions-item>
							<n-descriptions-item label="Unidades">
								{{
									direccion.children?.reduce((acc, dep) => acc + (dep.children?.length || 0), 0) ||
									0
								}}
							</n-descriptions-item>
						</n-descriptions>
					</div>

					<n-divider />

					<n-tree
						:data="previewTreeData"
						block-line
						default-expand-all
						key-field="key"
						label-field="label"
						children-field="children"
						:render-prefix="renderPreviewPrefix"
					/>

					<n-space justify="space-between" style="margin-top: 20px">
						<n-button @click="prevStep">
							<template #icon>
								<n-icon>
									<ChevronLeft />
								</n-icon>
							</template>
							Anterior
						</n-button>
						<n-button type="primary" @click="submitCreate" :loading="creatingHierarchy">
							<template #icon>
								<n-icon>
									<Check />
								</n-icon>
							</template>
							Crear Jerarquía
						</n-button>
					</n-space>
				</div>
			</n-drawer-content>
		</n-drawer>

		<!-- Drawer para Editar Nodo -->
		<n-drawer v-model:show="showEditDrawer" :width="500" placement="right">
			<n-drawer-content title="Editar Nodo" closable>
				<n-alert type="info" style="margin-bottom: 20px">
					Los cambios afectarán también a todos los equipos asociados a este nodo.
				</n-alert>

				<n-form :model="formValue" label-placement="top">
					<n-form-item label="Tipo de Nodo">
						<n-tag :type="getNodeTagType(formValue.tipo)" size="large">
							{{ formValue.tipo }}
						</n-tag>
					</n-form-item>

					<n-form-item label="Nombre">
						<n-input v-model:value="formValue.nombre" size="large" />
					</n-form-item>

					<n-form-item v-if="formValue.tipo !== 'Direccion'" label="Nodo Padre">
						<n-select
							v-model:value="formValue.parent_id"
							:options="parentOptions"
							clearable
							placeholder="Selecciona el nodo padre"
						/>
					</n-form-item>
				</n-form>

				<template #footer>
					<n-space justify="end">
						<n-button @click="showEditDrawer = false">Cancelar</n-button>
						<n-button type="primary" @click="submitEdit" :loading="updatingNode">
							<template #icon>
								<n-icon>
									<Check />
								</n-icon>
							</template>
							Guardar Cambios
						</n-button>
					</n-space>
				</template>
			</n-drawer-content>
		</n-drawer>

		<!-- Drawer para Agregar Hijo Rápido -->
		<n-drawer v-model:show="showAddChildDrawer" :width="450" placement="right">
			<n-drawer-content :title="`Agregar ${addChildType} a ${selectedParentName}`" closable>
				<n-form :model="quickAddForm" label-placement="top">
					<n-form-item :label="`Nombre del ${addChildType}`">
						<n-input
							v-model:value="quickAddForm.nombre"
							:placeholder="`Ej: ${addChildType} de...`"
							size="large"
							@keyup.enter="submitQuickAdd"
						/>
					</n-form-item>
				</n-form>

				<template #footer>
					<n-space justify="end">
						<n-button @click="showAddChildDrawer = false">Cancelar</n-button>
						<n-button type="primary" @click="submitQuickAdd" :loading="addingChild">
							<template #icon>
								<n-icon>
									<Plus />
								</n-icon>
							</template>
							Agregar
						</n-button>
					</n-space>
				</template>
			</n-drawer-content>
		</n-drawer>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, h } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import {
	NCard,
	NTree,
	NButton,
	NDrawer,
	NDrawerContent,
	NForm,
	NFormItem,
	NInput,
	NSelect,
	NSpin,
	NSpace,
	NSteps,
	NStep,
	NAlert,
	NDivider,
	NTag,
	NIcon,
	NEmpty,
	NDescriptions,
	NDescriptionsItem,
	NPopconfirm,
	NDropdown,
	useMessage,
	useDialog,
	type TreeOption,
	type DropdownOption,
} from 'naive-ui'
import {
	Plus,
	Edit,
	Trash,
	ChevronDown,
	ChevronUp,
	ChevronLeft,
	Check,
	Building,
	Briefcase,
	Users,
	MoreVertical,
} from 'lucide-vue-next'
import { ArrowForwardOutline } from '@vicons/ionicons5'
import { useOrganigramaStore } from '../stores/organigrama'
import { supabase } from '../lib/supabaseClient'

const organigramaStore = useOrganigramaStore()
const message = useMessage()
const dialog = useDialog()

const treeData = ref<TreeOption[]>([])
const expandedKeys = ref<string[]>([])
const loadingTree = ref(false)

// Estados para edición
const showEditDrawer = ref(false)
const updatingNode = ref(false)
const formValue = ref({
	id: '',
	nombre: '',
	tipo: '',
	parent_id: null as string | null,
})
const parentOptions = ref<Array<{ label: string; value: string }>>([])

// Estados para creación
const showCreateDrawer = ref(false)
const currentStep = ref(1)
const creatingHierarchy = ref(false)
const direccionFormRef = ref()

interface HierarchyNodeForm {
	nombre: string
	tipo: 'Direccion' | 'Departamento' | 'Unidad'
	parent_id: string | null
	children?: HierarchyNodeForm[]
}

const formCreateValue = ref<HierarchyNodeForm[]>([
	{
		nombre: '',
		tipo: 'Direccion',
		parent_id: null,
		children: [],
	},
])

// Estados para agregar hijo rápido
const showAddChildDrawer = ref(false)
const addingChild = ref(false)
const addChildType = ref<'Departamento' | 'Unidad'>('Departamento')
const selectedParentId = ref<string | null>(null)
const selectedParentName = ref('')
const quickAddForm = ref({
	nombre: '',
})

// Función para contar total de nodos
const getTotalNodes = () => {
	const countNodes = (nodes: TreeOption[]): number => {
		let count = nodes.length
		nodes.forEach((node) => {
			if (node.children) {
				count += countNodes(node.children)
			}
		})
		return count
	}
	return countNodes(treeData.value)
}

// Funciones auxiliares
const getNodeTagType = (tipo: string) => {
	switch (tipo) {
		case 'Direccion':
			return 'primary'
		case 'Departamento':
			return 'info'
		case 'Unidad':
			return 'warning'
		default:
			return 'default'
	}
}

const getNodeIcon = (tipo: string) => {
	switch (tipo) {
		case 'Direccion':
			return Building
		case 'Departamento':
			return Briefcase
		case 'Unidad':
			return Users
		default:
			return Building
	}
}

const renderNodePrefix = ({ option }: { option: any }) => {
	return h(
		NTag,
		{
			type: getNodeTagType(option.type),
			size: 'small',
			round: true,
		},
		{
			icon: () => h(NIcon, { component: getNodeIcon(option.type) }),
			default: () => option.type,
		},
	)
}

const renderPreviewPrefix = ({ option }: { option: any }) => {
	return h(NIcon, { component: getNodeIcon(option.type), size: 18 })
}

const renderNodeActions = ({ option }: { option: any }) => {
	const dropdownOptions: DropdownOption[] = [
		{
			label: 'Editar',
			key: 'edit',
			icon: () => h(NIcon, { component: Edit }),
		},
	]

	if (option.type === 'Direccion') {
		dropdownOptions.push(
			{
				label: 'Agregar Departamento',
				key: 'add-department',
				icon: () => h(NIcon, { component: Plus }),
			},
			{
				label: 'Eliminar Dirección',
				key: 'delete',
				icon: () => h(NIcon, { component: Trash }),
			},
		)
	} else if (option.type === 'Departamento') {
		dropdownOptions.push(
			{
				label: 'Agregar Unidad',
				key: 'add-unit',
				icon: () => h(NIcon, { component: Plus }),
			},
			{
				label: 'Eliminar Departamento',
				key: 'delete',
				icon: () => h(NIcon, { component: Trash }),
			},
		)
	} else if (option.type === 'Unidad') {
		dropdownOptions.push({
			label: 'Eliminar Unidad',
			key: 'delete',
			icon: () => h(NIcon, { component: Trash }),
		})
	}

	const handleSelect = (key: string) => {
		if (key === 'edit') {
			handleUpdateNode(option)
		} else if (key === 'add-department') {
			openAddChildDrawer(option, 'Departamento')
		} else if (key === 'add-unit') {
			openAddChildDrawer(option, 'Unidad')
		} else if (key === 'delete') {
			handleDeleteNode(option)
		}
	}

	return h(
		NDropdown,
		{
			options: dropdownOptions,
			onSelect: handleSelect,
		},
		{
			default: () =>
				h(
					NButton,
					{
						size: 'small',
						quaternary: true,
						circle: true,
					},
					{
						icon: () => h(NIcon, { component: MoreVertical }),
					},
				),
		},
	)
}

// Árbol de vista previa
const previewTreeData = computed(() => {
	return formCreateValue.value.map((direccion, dirIndex) => ({
		key: `preview-dir-${dirIndex}`,
		label: direccion.nombre || 'Sin nombre',
		type: 'Direccion',
		children:
			direccion.children?.map((dep, depIndex) => ({
				key: `preview-dep-${dirIndex}-${depIndex}`,
				label: dep.nombre || 'Sin nombre',
				type: 'Departamento',
				children: dep.children?.map((unit, unitIndex) => ({
					key: `preview-unit-${dirIndex}-${depIndex}-${unitIndex}`,
					label: unit.nombre || 'Sin nombre',
					type: 'Unidad',
				})),
			})) || [],
	}))
})

// Funciones de navegación de pasos
const nextStep = () => {
	if (currentStep.value === 1) {
		for (const direccion of formCreateValue.value) {
			if (!direccion.nombre.trim()) {
				message.error('El nombre de todas las direcciones es requerido')
				return
			}
		}
	}
	if (currentStep.value < 3) {
		currentStep.value++
	}
}

const prevStep = () => {
	if (currentStep.value > 1) {
		currentStep.value--
	}
}

// Funciones para manejar departamentos y unidades
const addDirection = () => {
	formCreateValue.value.push({
		nombre: '',
		tipo: 'Direccion',
		parent_id: null,
		children: [],
	})
}

const removeDirection = (index: number) => {
	formCreateValue.value.splice(index, 1)
}

const addDepartment = (directionIndex: number) => {
	formCreateValue.value[directionIndex].children?.push({
		nombre: '',
		tipo: 'Departamento',
		parent_id: null,
		children: [],
	})
}

const removeDepartment = (directionIndex: number, depIndex: number) => {
	formCreateValue.value[directionIndex].children?.splice(depIndex, 1)
}

const addUnit = (directionIndex: number, departmentIndex: number) => {
	if (formCreateValue.value[directionIndex].children?.[departmentIndex]) {
		formCreateValue.value[directionIndex].children![departmentIndex].children?.push({
			nombre: '',
			tipo: 'Unidad',
			parent_id: null,
		})
	}
}

const removeUnit = (directionIndex: number, departmentIndex: number, unitIndex: number) => {
	if (formCreateValue.value[directionIndex].children?.[departmentIndex]?.children) {
		formCreateValue.value[directionIndex].children![departmentIndex].children!.splice(unitIndex, 1)
	}
}

// Abrir drawer de creación
const openCreateDrawer = () => {
	formCreateValue.value = [
		{
			nombre: '',
			tipo: 'Direccion',
			parent_id: null,
			children: [],
		},
	]
	currentStep.value = 1
	showCreateDrawer.value = true
}

// Abrir drawer de agregar hijo
const openAddChildDrawer = (parentNode: any, childType: 'Departamento' | 'Unidad') => {
	selectedParentId.value = parentNode.key
	selectedParentName.value = parentNode.label
	addChildType.value = childType
	quickAddForm.value.nombre = ''
	showAddChildDrawer.value = true
}

// Enviar creación rápida
const submitQuickAdd = async () => {
	if (!quickAddForm.value.nombre.trim()) {
		message.error('El nombre es requerido')
		return
	}

	addingChild.value = true
	try {
		const { error } = await supabase.from('jerarquia_organigrama').insert({
			nombre: quickAddForm.value.nombre,
			tipo: addChildType.value,
			parent_id: selectedParentId.value,
		})

		if (error) throw error

		message.success(`${addChildType.value} creado correctamente`)
		showAddChildDrawer.value = false
		await fetchAndBuildTree()
	} catch (err: any) {
		message.error('Error al crear: ' + err.message)
	} finally {
		addingChild.value = false
	}
}

// Expandir/Contraer todo
const expandAll = () => {
	const getAllKeys = (nodes: TreeOption[]): string[] => {
		let keys: string[] = []
		nodes.forEach((node) => {
			keys.push(node.key as string)
			if (node.children) {
				keys = keys.concat(getAllKeys(node.children))
			}
		})
		return keys
	}
	expandedKeys.value = getAllKeys(treeData.value)
}

const collapseAll = () => {
	expandedKeys.value = []
}

// Mapear datos del organigrama
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

// Manejar actualización de nodo
const handleUpdateNode = (node: TreeOption) => {
	formValue.value = {
		id: node.key as string,
		nombre: node.label as string,
		tipo: node.type as string,
		parent_id: node.parentId as string | null,
	}
	updateParentOptions(node.type as string, node.key as string)
	showEditDrawer.value = true
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
	parentOptions.value = options.filter((opt) => opt.value !== nodeId)
	if (nodeType === 'Direccion') {
		formValue.value.parent_id = null
	}
}

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
	updatingNode.value = true
	try {
		const { error: updateNodeError } = await supabase
			.from('jerarquia_organigrama')
			.update({
				nombre: formValue.value.nombre,
				tipo: formValue.value.tipo,
				parent_id: formValue.value.parent_id,
			})
			.eq('id', formValue.value.id)

		if (updateNodeError) throw updateNodeError

		await fetchAndBuildTree()

		const { data: allEquipos, error: fetchAllEquiposError } = await supabase
			.from('equipos')
			.select('id, unidad, departamento, direccion')

		if (fetchAllEquiposError) throw fetchAllEquiposError

		for (const equipo of allEquipos) {
			let newDireccionName: string | null = null
			let newDepartamentoName: string | null = null
			let newUnidadName: string | null = null

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

		message.success('Jerarquía y equipos actualizados correctamente')
		showEditDrawer.value = false
	} catch (err: any) {
		message.error('Error al actualizar: ' + err.message)
	} finally {
		updatingNode.value = false
	}
}

const submitCreate = async () => {
	creatingHierarchy.value = true
	try {
		for (const direccion of formCreateValue.value) {
			if (!direccion.nombre.trim()) continue

			const { data: direccionData, error: direccionError } = await supabase
				.from('jerarquia_organigrama')
				.insert({
					nombre: direccion.nombre,
					tipo: 'Direccion',
					parent_id: null,
				})
				.select()
				.single()

			if (direccionError) throw direccionError
			if (!direccionData) throw new Error('No se pudo crear la dirección.')

			const direccionId = direccionData.id

			for (const department of direccion.children || []) {
				if (!department.nombre.trim()) continue

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
					if (!unit.nombre.trim()) continue

					const { error: unidadError } = await supabase.from('jerarquia_organigrama').insert({
						nombre: unit.nombre,
						tipo: 'Unidad',
						parent_id: departamentoId,
					})

					if (unidadError) throw unidadError
				}
			}
		}

		message.success('Jerarquías creadas correctamente')
		showCreateDrawer.value = false
		openCreateDrawer() // Reset form
		await fetchAndBuildTree()
	} catch (err: any) {
		message.error('Error al crear jerarquía: ' + err.message)
	} finally {
		creatingHierarchy.value = false
	}
}

const handleDeleteNode = (node: TreeOption) => {
	dialog.warning({
		title: 'Confirmar Eliminación',
		content: `¿Estás seguro de que quieres eliminar "${node.label}"? Esta acción no se puede deshacer y eliminará todos los departamentos y unidades asociados.`,
		positiveText: 'Sí, eliminar',
		negativeText: 'Cancelar',
		onPositiveClick: async () => {
			try {
				// Primero, obtén todos los descendientes del nodo a eliminar
				const allNodes = organigramaStore.organigramaData
				const nodesToDelete = getAllDescendants(node.key as string, allNodes)
				nodesToDelete.push(node.key as string)

				const { error } = await supabase
					.from('jerarquia_organigrama')
					.delete()
					.in('id', nodesToDelete)

				if (error) throw error

				message.success(`"${node.label}" y toda su jerarquía han sido eliminados.`)
				await fetchAndBuildTree()
			} catch (err: any) {
				message.error('Error al eliminar: ' + err.message)
			}
		},
	})
}

const getAllDescendants = (parentId: string, allNodes: any[]): string[] => {
	const children = allNodes.filter((node) => node.parent_id === parentId)
	let descendants: string[] = children.map((c) => c.id)
	for (const child of children) {
		descendants = descendants.concat(getAllDescendants(child.id, allNodes))
	}
	return descendants
}
</script>

<style scoped>
.jerarquia-page {
	min-height: 100vh;
	padding-top: 24px;
	padding-bottom: 24px;
}

.page-container {
	max-width: 1550px;
	margin: 0 auto;
}

.unit-item {
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
}

.unit-item :deep(.n-input) {
	flex: 1;
}

@media (max-width: 768px) {
	.jerarquia-page {
		padding: 16px;
	}
}
</style>
