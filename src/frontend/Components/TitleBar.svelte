<script lang="ts">
    import { createEventDispatcher } from 'svelte'

    import IconMinimize from './icons/_IconMinimize.svelte'

    export let title: string = 'Title'

    import { currentPage } from '../stores'
    import { IPages } from '../types'
    import Icons from './icons/Icons.svelte'

    const handleTitleClick = () => {
        if ($currentPage === IPages.items) {
            currentPage.set(IPages.settings)
        } else {
            currentPage.set(IPages.items)
        }
    }
    const dispatch = createEventDispatcher()
</script>

<header
    class="opacity h-8 w-full border-b border-gray-300 bg-white p-1 font-bold text-gray-700 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-300 "
>
    <div class="drag-region" data-testid="drag-region">
        <div class="title flex flex-row items-center" on:click={handleTitleClick} data-testid="title">
            <Icons icon="logo" centered={false} size="6" />
            <p class="ml-1 cursor-pointer pt-[1px]">{title}</p>
        </div>
        <div class="window-controls">
            <div class="ml-1 flex" data-testid="IconMinimize" on:click={(e) => dispatch('clickMinimize', true)}>
                <IconMinimize />
            </div>
        </div>
    </div>
</header>

<style lang="postcss">
    .drag-region {
        @apply flex h-full w-full justify-between;
        -webkit-app-region: drag;
    }
    .title {
        @apply ml-2 flex items-center overflow-hidden font-sans text-base font-semibold;
    }

    p {
        font-family: JetBrainsMono-Medium;
    }

    .window-controls {
        @apply flex;
        -webkit-app-region: no-drag;
    }
</style>
