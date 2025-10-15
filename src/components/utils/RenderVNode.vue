<script lang="ts">
import { defineComponent, type VNode } from 'vue'

export default defineComponent({
	props: {
		vnode: {
			type: [Object, String],
			required: true,
		},
	},
	render() {
		return this.vnode as VNode
	},
})
</script>
