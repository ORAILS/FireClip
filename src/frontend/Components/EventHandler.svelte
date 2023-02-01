<script lang="ts">
    import { ipcRenderer, isFocused, state } from './stores'

    ipcRenderer.on('to.renderer.set.settings', (e, value) => {
        $state.defaultUserSettings = JSON.parse(value)
        console.log($state.defaultUserSettings)
        console.log('Received set.settings')
    })
</script>
