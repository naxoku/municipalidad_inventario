/// <reference types="vite/client" />

declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<object, object, unknown>
	export default component
}

interface ImportMetaEnv {
	readonly VITE_SUPABASE_FUNCTIONS_SMART_API_URL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
