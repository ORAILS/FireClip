<script>
    import { name, version } from '../../../package.json'
    import { currentPage } from '../stores'
    import { IPages } from '../types'
    import MenuItem from './MenuItem.svelte'
</script>

<div class="">
    <MenuItem>
        <p
            class="my-auto text-xl"
            on:click={() => {
                currentPage.set(IPages.settings)
            }}
        >
            &lt; Back to settings
        </p>
    </MenuItem>
    <MenuItem>
        <p class="">name : {name}</p>
        <p class="">version : {version}</p>
    </MenuItem>
</div>
