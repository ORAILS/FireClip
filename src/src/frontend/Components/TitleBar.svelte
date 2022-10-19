<script lang="ts">
    import { createEventDispatcher } from 'svelte'

    import IconMinimize from './icons/_IconMinimize.svelte'

    export let title: string = 'Title'
    export const isMaximized: boolean = false

    let className = ''
    export { className as class }

    $: className = className || ''
    $: title = title || ''

    import { page } from '../Components/stores'
    import { IPages } from '../types'

    const handleSettings = () => {
        console.log($page)
        if($page === IPages.items)
        {
            page.set(IPages.settings)
        }else {
            page.set(IPages.items)
        }
    }
    const dispatch = createEventDispatcher()
</script>

<header class={className}>
    <div class="drag-region" data-testid="drag-region">
        <div class="title" data-testid="title">
            <p on:click={handleSettings}>{title}</p>
        </div>
        <div class="window-controls">
            <div class="button" data-testid="IconMinimize" on:click={(e) => dispatch('clickMinimize', true)}>
                <IconMinimize />
            </div>
        </div>
    </div>
</header>

<style lang="postcss">
    header {
        @apply h-8 w-full p-1 font-bold;
        border-bottom: 1px solid lightgray;
        background-color: var(--background-color, theme('colors.gray.800'));
        color: var(--text-color, theme('colors.gray.200'));
    }

    .drag-region {
        @apply flex w-full h-full justify-between;
        -webkit-app-region: drag;
    }
    .title {
        @apply flex items-center ml-2 overflow-hidden font-sans text-base font-semibold;
    }

    p {
        font-family: JetBrainsMono-Medium;
    }

    .window-controls {
        @apply flex;
        -webkit-app-region: no-drag;
    }
    .button {
        @apply flex ml-1;
    }
</style>
