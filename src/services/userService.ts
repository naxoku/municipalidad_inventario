import { supabase } from '@/lib/supabaseClient'

const API_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_SMART_API_URL

/**
 * Elimina un usuario llamando a una función de Supabase Edge.
 * @param userId - El ID del usuario a eliminar.
 * @returns Una promesa que se resuelve si el usuario es eliminado exitosamente.
 * @throws Si no hay una sesión de usuario activa o si la API devuelve un error.
 */
export async function deleteUser(userId: string): Promise<void> {
	const {
		data: { session },
		error: sessionError,
	} = await supabase.auth.getSession()

	if (sessionError || !session?.access_token) {
		throw new Error('No autenticado. Por favor inicia sesión.')
	}

	const userJwt = session.access_token

	const response = await fetch(API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${userJwt}`,
		},
		body: JSON.stringify({ user_id: userId }),
	})

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({})) // Intenta parsear el error, si falla, devuelve objeto vacío
		throw new Error(errorData?.error || `Error del servidor: ${response.statusText}`)
	}

	// No es necesario devolver datos si la operación fue exitosa
}
