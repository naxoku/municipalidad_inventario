<template>
	<div class="page-container">
		<n-space vertical :size="24">
			<PageHeader title="Gestión de Usuarios">
				<template #subtitle>
					{{ users.length }} usuario{{ users.length !== 1 ? 's' : '' }} registrado{{
						users.length !== 1 ? 's' : ''
					}}
				</template>
				<template #actions>
					<n-button type="primary" size="large" @click="showRegisterModal = true">
						<template #icon>
							<n-icon :component="PersonAddIcon" />
						</template>
						Registrar Nuevo Usuario
					</n-button>
				</template>
			</PageHeader>

			<!-- Contenido Principal -->
			<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px">
				<!-- Columna Izquierda: Lista de Usuarios -->
				<n-card
					title="Usuarios Registrados"
					:bordered="false"
					size="large"
					style="width: 100%"
					:content-style="{ padding: 0 }"
				>
					<n-data-table
						:columns="columns"
						:data="users"
						:pagination="pagination"
						:loading="loadingUsers"
						:single-line="false"
						size="large"
					/>
				</n-card>

				<!-- Columna Derecha: Acciones del Usuario -->
				<n-card
					:title="selectedUser ? `Acciones de ${selectedUser.nombre}` : 'Seleccione un usuario'"
					:bordered="false"
					size="large"
					style="width: 100%"
				>
					<n-spin :show="loadingActions">
						<n-scrollbar style="max-height: 65vh">
							<n-empty
								v-if="!selectedUser"
								description="Haz clic en el botón 'Ver Acciones' de un usuario para ver su historial."
								style="padding-top: 40px"
							>
							</n-empty>
							<n-timeline v-else-if="userActions.length > 0" style="padding-left: 10px">
								<n-timeline-item
									v-for="(action, index) in userActions"
									:key="index"
									:type="action.type === 'Registro' ? 'success' : 'info'"
									:title="`${action.type} - ${new Date(action.fecha).toLocaleDateString()}`"
									:content="action.descripcion"
								/>
							</n-timeline>
							<n-empty
								v-else
								description="No se encontraron acciones para este usuario."
								style="padding-top: 40px"
							/>
						</n-scrollbar>
					</n-spin>
				</n-card>
			</div>
		</n-space>

		<!-- Modal de Registro -->
		<n-modal
			v-model:show="showRegisterModal"
			preset="card"
			style="width: 600px"
			title="Registrar Nuevo Usuario"
			:bordered="false"
			size="huge"
			:segmented="{ content: 'soft', footer: 'soft' }"
		>
			<n-form>
				<n-form-item-row label="Nombre">
					<n-input v-model:value="registerNombre" placeholder="Ingresa el nombre" size="large">
						<template #prefix>
							<n-icon :component="PersonIcon" />
						</template>
					</n-input>
				</n-form-item-row>
				<n-form-item-row label="Correo">
					<n-input v-model:value="registerEmail" placeholder="Ingresa el correo" size="large">
						<template #prefix>
							<n-icon :component="MailIcon" />
						</template>
					</n-input>
				</n-form-item-row>
				<n-form-item-row label="Es Administrador">
					<n-switch v-model:value="isAdmin" />
				</n-form-item-row>
			</n-form>
			<template #footer>
				<n-button
					type="primary"
					block
					size="large"
					strong
					@click="handleRegister"
					:loading="isLoading"
				>
					<template #icon>
						<n-icon :component="PersonAddIcon" />
					</template>
					Registrar Usuario
				</n-button>
			</template>
		</n-modal>

		<!-- Modal de Edición -->
		<n-modal
			v-model:show="showEditModal"
			preset="card"
			style="width: 600px"
			title="Editar Usuario"
			:bordered="false"
			size="huge"
			:segmented="{ content: 'soft', footer: 'soft' }"
		>
			<n-form v-if="editingUser">
				<n-form-item-row label="Nombre">
					<n-input v-model:value="editingUser.nombre" placeholder="Ingresa el nombre" size="large">
						<template #prefix>
							<n-icon :component="PersonIcon" />
						</template>
					</n-input>
				</n-form-item-row>
				<n-form-item-row label="Correo">
					<n-input v-model:value="editingUser.correo" placeholder="Ingresa el correo" size="large">
						<template #prefix>
							<n-icon :component="MailIcon" />
						</template>
					</n-input>
				</n-form-item-row>
				<n-form-item-row label="Es Administrador">
					<n-switch v-model:value="editingUser.admin" />
				</n-form-item-row>
			</n-form>
			<template #footer>
				<n-button
					type="primary"
					block
					size="large"
					strong
					@click="handleUpdateUser"
					:loading="isLoading"
				>
					<template #icon>
						<n-icon :component="EditIcon" />
					</template>
					Guardar Cambios
				</n-button>
			</template>
		</n-modal>
	</div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { deleteUser as deleteUserService } from '@/services/userService' // Importar el servicio
import {
	NSpace,
	NCard,
	NForm,
	NFormItemRow,
	NInput,
	NButton,
	NIcon,
	NSwitch,
	useMessage,
	useNotification,
	useDialog,
	NModal,
	NDataTable,
	NEmpty,
	NSpin,
	NTimeline,
	NTimelineItem,
	NScrollbar,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
	Mail as MailIcon,
	Person as PersonIcon,
	PersonAdd as PersonAddIcon,
	CreateOutline as EditIcon,
	EyeOutline as ViewIcon,
	TrashOutline as DeleteIcon,
} from '@vicons/ionicons5'
import PageHeader from '@/components/PageHeader.vue'

// Tipos
interface User {
	id: string
	nombre: string
	correo: string
	admin: boolean
}

interface UserAction {
	fecha: string
	type: 'Registro' | 'Mantenimiento' | 'Baja' | 'Reasignación'
	descripcion: string
}

const message = useMessage()
const notification = useNotification()
const dialog = useDialog()

// --- ESTADO PARA LA LISTA DE USUARIOS ---
const users = ref<User[]>([])
const loadingUsers = ref(false)
const selectedUser = ref<User | null>(null)
const pagination = { pageSize: 10 }
const userActions = ref<UserAction[]>([])
const loadingActions = ref(false)

// --- ESTADO PARA EL MODAL DE REGISTRO ---
const showRegisterModal = ref(false)
const registerNombre = ref('')
const registerEmail = ref('')
const isAdmin = ref(false)
const isLoading = ref(false)
const temporaryPassword = ref('')

// --- ESTADO PARA EL MODAL DE EDICIÓN ---
const showEditModal = ref(false)
const editingUser = ref<User | null>(null)

// --- COLUMNAS DE LA TABLA ---
const createColumns = ({
	edit,
	viewActions,
	deleteUser,
}: {
	edit: (user: User) => void
	viewActions: (user: User) => void
	deleteUser: (user: User) => void
}): DataTableColumns<User> => {
	return [
		{
			title: 'Nombre',
			key: 'nombre',
		},
		{
			title: 'Correo',
			key: 'correo',
		},
		{
			title: 'Admin',
			key: 'admin',
			render(row) {
				return h(NSwitch, { value: row.admin, disabled: true })
			},
		},
		{
			title: 'Acciones',
			key: 'actions',
			render(row) {
				return h(NSpace, null, {
					default: () => [
						h(
							NButton,
							{
								strong: true,
								tertiary: true,
								size: 'small',
								onClick: () => viewActions(row),
							},
							{
								default: () => 'Acciones',
								icon: () => h(NIcon, null, { default: () => h(ViewIcon) }),
							},
						),
						h(
							NButton,
							{
								strong: true,
								tertiary: true,
								size: 'small',
								onClick: () => edit(row),
							},
							{
								default: () => 'Editar',
								icon: () => h(NIcon, null, { default: () => h(EditIcon) }),
							},
						),
						h(
							NButton,
							{
								strong: true,
								tertiary: true,
								size: 'small',
								type: 'error',
								onClick: () => deleteUser(row),
							},
							{
								default: () => 'Eliminar',
								icon: () => h(NIcon, null, { default: () => h(DeleteIcon) }),
							},
						),
					],
				})
			},
		},
	]
}

const columns = createColumns({
	edit: (user: User) => {
		editingUser.value = { ...user } // Clonar el objeto para evitar mutaciones directas
		showEditModal.value = true
	},
	viewActions: (user: User) => {
		selectedUser.value = user
		fetchUserActions(user.nombre)
	},
	deleteUser: (user: User) => {
		dialog.warning({
			title: 'Confirmar Eliminación',
			content: `¿Estás seguro de que quieres eliminar al usuario "${user.nombre}"? Esta acción no se puede deshacer.`,
			positiveText: 'Sí, eliminar',
			negativeText: 'Cancelar',
			onPositiveClick: () => {
				handleDeleteUser(user.id)
			},
		})
	},
})

// --- OBTENER ACCIONES DEL USUARIO ---
const fetchUserActions = async (nombreUsuario: string) => {
	loadingActions.value = true
	userActions.value = []
	try {
		const { data: equipos, error } = await supabase
			.from('equipos')
			.select('encargado_registro, fecha_ingreso, modelo, historial_mantenimiento')

		if (error) throw error

		const actions: UserAction[] = []

		equipos.forEach((equipo) => {
			// Acción: Registro de equipo
			if (equipo.encargado_registro === nombreUsuario) {
				actions.push({
					fecha: equipo.fecha_ingreso,
					type: 'Registro',
					descripcion: `Registró el equipo: ${equipo.modelo}`,
				})
			}

			// Acción: Mantenimiento
			if (equipo.historial_mantenimiento) {
				equipo.historial_mantenimiento.forEach((mantenimiento: any) => {
					if (mantenimiento.encargado_mantenimiento === nombreUsuario) {
						actions.push({
							fecha: mantenimiento.fecha,
							type: 'Mantenimiento',
							descripcion: `Realizó mantenimiento en ${equipo.modelo}: "${mantenimiento.descripcion}"`,
						})
					}
				})
			}
		})

		// Ordenar acciones por fecha descendente
		userActions.value = actions.sort(
			(a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
		)
	} catch (error: any) {
		message.error('Error al cargar las acciones del usuario: ' + error.message)
	} finally {
		loadingActions.value = false
	}
}

// --- OBTENER USUARIOS ---
const fetchUsers = async () => {
	loadingUsers.value = true
	try {
		const { data, error } = await supabase.from('usuarios').select('*')
		if (error) throw error
		users.value = data
	} catch (error: any) {
		message.error('Error al cargar los usuarios: ' + error.message)
	} finally {
		loadingUsers.value = false
	}
}

onMounted(() => {
	fetchUsers()
})

// --- LÓGICA DE REGISTRO (EXISTENTE) ---
const generateRandomPassword = (length = 12) => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
	let password = ''
	for (let i = 0; i < length; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return password
}

const isValidEmail = (email: string) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

const handleRegister = async () => {
	if (!registerNombre.value.trim()) {
		message.error('Debes ingresar un nombre.')
		return
	}
	if (!registerEmail.value.trim() || !isValidEmail(registerEmail.value.trim())) {
		message.error('Debes ingresar un correo electrónico válido.')
		return
	}

	isLoading.value = true
	// 1. Guardar la sesión actual del administrador
	const { data: adminSessionData, error: sessionError } = await supabase.auth.getSession()
	if (sessionError || !adminSessionData.session) {
		message.error('No se pudo obtener la sesión actual. Por favor, inicia sesión de nuevo.')
		isLoading.value = false
		return
	}
	const adminSession = adminSessionData.session

	try {
		const newTemporaryPassword = generateRandomPassword()
		temporaryPassword.value = newTemporaryPassword

		// 2. Crear el nuevo usuario. Esto cambiará la sesión activa.
		const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
			email: registerEmail.value.trim(),
			password: newTemporaryPassword,
			options: {
				data: {
					full_name: registerNombre.value.trim(),
				},
			},
		})

		if (signUpError) {
			if (signUpError.message.includes('User already registered')) {
				message.error('Este correo electrónico ya está registrado.')
			} else {
				message.error('Error al crear la cuenta: ' + signUpError.message)
			}
			// Si falla el signUp, la sesión del admin no se ve afectada.
			return
		}

		if (signUpData.user) {
			// Insertar datos adicionales en la tabla 'usuarios'
			const { error: insertError } = await supabase.from('usuarios').insert([
				{
					id: signUpData.user.id,
					nombre: registerNombre.value.trim(),
					correo: registerEmail.value.trim(),
					admin: isAdmin.value,
					needs_password_reset: true,
				},
			])

			if (insertError) {
				// Si esto falla, es un problema, pero el usuario de auth ya fue creado.
				// Se podría intentar eliminar el usuario de auth aquí para consistencia.
				message.error(
					'Usuario creado en Auth, pero hubo un error al guardar los datos adicionales.',
				)
				return
			}

			message.success('Usuario creado correctamente.')
			notification.create({
				title: 'Usuario Creado',
				description: 'Contraseña temporal generada',
				content: `La contraseña temporal es: ${temporaryPassword.value}.`,
				duration: 0,
				closable: true,
				action: () =>
					h(
						NButton,
						{
							text: true,
							type: 'primary',
							onClick: () => {
								navigator.clipboard.writeText(temporaryPassword.value)
								message.success('Contraseña copiada al portapapeles.')
							},
						},
						{ default: () => 'Copiar Contraseña' },
					),
			})

			// Limpiar y cerrar modal
			registerNombre.value = ''
			registerEmail.value = ''
			isAdmin.value = false
			showRegisterModal.value = false
			fetchUsers() // Recargar la lista de usuarios
		}
	} catch (error: any) {
		console.error('Error inesperado en el proceso de registro:', error)
		message.error('Ocurrió un error inesperado. Revisa la consola para más detalles.')
	} finally {
		// 3. Restaurar la sesión del administrador
		const { error: restoreError } = await supabase.auth.setSession({
			access_token: adminSession.access_token,
			refresh_token: adminSession.refresh_token,
		})
		if (restoreError) {
			message.error(
				'No se pudo restaurar la sesión del administrador. Por favor, actualiza la página.',
			)
		}
		isLoading.value = false
	}
}

// --- LÓGICA DE EDICIÓN ---
const handleUpdateUser = async () => {
	if (!editingUser.value) return

	// Validaciones básicas
	if (!editingUser.value.nombre.trim() || !editingUser.value.correo.trim()) {
		message.error('El nombre y el correo no pueden estar vacíos.')
		return
	}
	if (!isValidEmail(editingUser.value.correo.trim())) {
		message.error('Debes ingresar un correo electrónico válido.')
		return
	}

	isLoading.value = true
	try {
		const { error } = await supabase
			.from('usuarios')
			.update({
				nombre: editingUser.value.nombre.trim(),
				correo: editingUser.value.correo.trim(),
				admin: editingUser.value.admin,
			})
			.eq('id', editingUser.value.id)

		if (error) throw error

		message.success('Usuario actualizado correctamente.')
		showEditModal.value = false
		fetchUsers()
	} catch (error: any) {
		message.error('Error al actualizar el usuario: ' + error.message)
	} finally {
		isLoading.value = false
	}
}

// Importa y reutiliza tu cliente supabase existente
// Ejemplo asumiendo que tienes `supabase` ya inicializado
async function handleDeleteUser(userId: string) {
	try {
		await deleteUserService(userId)
		message.success('Usuario eliminado correctamente.')
		fetchUsers() // Recargar la lista de usuarios
	} catch (err: any) {
		message.error('Error al eliminar el usuario: ' + (err.message || err))
	}
}
</script>

<style scoped>
.page-container {
	max-width: 1550px;
	margin: 0 auto;
	padding-top: 24px;
	padding-bottom: 24px;
}
</style>
