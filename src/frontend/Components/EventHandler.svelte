<script lang="ts">
    import { ipcRenderer, page, state } from '../stores'
    import { IPages } from '../types'

    ipcRenderer.on('to.renderer.set.settings', (e, value) => {
        $state.defaultUserSettings = JSON.parse(value)
    })
    ipcRenderer.on('to.renderer.open.window', (e, value) => {
        const colors = Object.values(IPages).filter((item) => {
            return isNaN(Number(item))
        })
        if (colors.includes(value)) {
            // values shows the values first, then the indices, keys does the opposite
            page.set(Object.values(IPages).indexOf(value))
        }
    })
</script>
