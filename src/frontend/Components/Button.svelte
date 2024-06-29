<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    const dispatch = createEventDispatcher()

    export let label: string
    export let fontSize = 12
    export let extraClasses = ''
    export let visible = true

    function handleClick() {
        dispatch('click')
    }
</script>

{#if visible}
    <div
        on:click={handleClick}
        class="m-1 flex min-w-20 cursor-pointer flex-row justify-center rounded bg-gray-300 p-1 align-middle dark:bg-slate-700 {extraClasses} font-semibold"
    >
        <p style="font-size: {fontSize * 1.3} px">
            {label}
        </p>
    </div>
{/if}
