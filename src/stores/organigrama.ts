import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'

export interface OrganigramaNode {
	id: string
	nombre: string
	tipo: 'Direccion' | 'Departamento' | 'Unidad'
	parent_id: string | null
	children?: OrganigramaNode[]
}

export const useOrganigramaStore = defineStore('organigrama', () => {
	const organigramaData = ref<OrganigramaNode[]>([])
	const loading = ref(false)
	const error = ref<string | null>(null)

	const fetchOrganigrama = async () => {
		loading.value = true
		error.value = null
		try {
			const { data, error: fetchError } = await supabase
				.from('jerarquia_organigrama')
				.select('*')
				.order('nombre', { ascending: true })

			if (fetchError) throw fetchError

			organigramaData.value = data || []
		} catch (err: any) {
			error.value = err.message || 'Error al cargar el organigrama.'
			console.error('Error al cargar el organigrama:', err.message)
		} finally {
			loading.value = false
		}
	}

	const direcciones = computed(() => {
		return organigramaData.value.filter((node) => node.tipo === 'Direccion')
	})

	const getDepartamentosByDireccion = (direccionId: string) => {
		return organigramaData.value.filter(
			(node) => node.tipo === 'Departamento' && node.parent_id === direccionId,
		)
	}

	const getUnidadesByDepartamento = (departamentoId: string) => {
		return organigramaData.value.filter(
			(node) => node.tipo === 'Unidad' && node.parent_id === departamentoId,
		)
	}

	// Construye el organigrama anidado para visualización o uso complejo
	const organigramaAnidado = computed(() => {
		const direccionesMap = new Map<string, OrganigramaNode>()
		const departamentosMap = new Map<string, OrganigramaNode>()

		// Inicializar direcciones
		direcciones.value.forEach((dir) => {
			direccionesMap.set(dir.id, { ...dir, children: [] })
		})

		// Asignar departamentos a direcciones
		organigramaData.value
			.filter((node) => node.tipo === 'Departamento')
			.forEach((dep) => {
				if (dep.parent_id && direccionesMap.has(dep.parent_id)) {
					const parentDir = direccionesMap.get(dep.parent_id)!
					const newDep = { ...dep, children: [] }
					parentDir.children!.push(newDep)
					departamentosMap.set(dep.id, newDep)
				}
			})

		// Asignar unidades a departamentos
		organigramaData.value
			.filter((node) => node.tipo === 'Unidad')
			.forEach((uni) => {
				if (uni.parent_id && departamentosMap.has(uni.parent_id)) {
					const parentDep = departamentosMap.get(uni.parent_id)!
					parentDep.children!.push(uni)
				}
			})

		return Array.from(direccionesMap.values())
	})

	return {
		organigramaData,
		loading,
		error,
		fetchOrganigrama,
		direcciones,
		getDepartamentosByDireccion,
		getUnidadesByDepartamento,
		organigramaAnidado,
	}
})
