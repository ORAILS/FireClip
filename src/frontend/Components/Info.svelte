<script>
    import { name, version } from '../../../package.json'
    import { currentPage } from '../stores'
    import { IPages } from '../types'
</script>

<div class="px-2 py-2 pl-3">
    <p
        class="my-4 text-xl text-white"
        on:click={() => {
            currentPage.set(IPages.settings)
        }}
    >
        back to settings
    </p>
    <p class="text-white">{name}-{version}</p>
</div>
