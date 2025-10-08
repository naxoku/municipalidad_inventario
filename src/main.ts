import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import {
	create,
	NConfigProvider,
	NLayout,
	NLayoutSider,
	NLayoutHeader,
	NLayoutContent,
	NLayoutFooter,
	NMenu,
	NBreadcrumb,
	NBreadcrumbItem,
	NIcon,
	NButton,
	NDivider,
} from 'naive-ui'

const naive = create({
	components: [
		NConfigProvider,
		NLayout,
		NLayoutSider,
		NLayoutHeader,
		NLayoutContent,
		NLayoutFooter,
		NMenu,
		NBreadcrumb,
		NBreadcrumbItem,
		NIcon,
		NButton,
		NDivider,
	],
})

const app = createApp(App)
app.use(router)
app.use(naive)
app.mount('#app')
