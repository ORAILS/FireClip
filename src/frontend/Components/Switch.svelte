<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte'
    const dispatch = createEventDispatcher()

    export let label: string
    export let fontSize = 16
    export let defaultState: any

    export let selectOptions: undefined | string[] = undefined
    let state: any

    onMount(() => {
        state = defaultState
        console.log(defaultState)
        console.log(selectOptions)
    })

    function handleClick(event) {
        if (selectOptions) return
        const target = event.target

        state = target.getAttribute('aria-checked') === 'true'

        if (state) {
            state = false
        } else {
            state = true
        }
        dispatch('change', state)
    }

    function handleSelectChange(event) {
        dispatch('change', state)
    }
</script>

{#if selectOptions}
    <div class="slider" style="font-size:{fontSize}px">
        <span style="font-size: {fontSize * 1.3}px">{label}</span>
        <select class="cursor-pointer bg-gray-100 dark:bg-slate-900" bind:value={state} on:change={handleSelectChange}>
            {#each selectOptions as option}
                {#if option === state}
                    <option selected value={option}>{option}</option>
                {:else}
                    <option value={option}>{option}</option>
                {/if}
            {/each}
        </select>
    </div>
{:else}
    <div class="slider" style="font-size:{fontSize}px">
        <span style="font-size: {fontSize * 1.3}px">{label}</span>
        <button role="switch" aria-checked={state} on:click={handleClick} />
    </div>
{/if}

<style lang="postcss">
    .slider {
        @apply flex items-center justify-between;
    }

    .slider button {
        width: 3em;
        min-width: 3em;
        max-width: 3em;
        height: 1.6em;
        position: relative;
        margin: 0 0 0 0.5em;
        border: none;
        border-radius: 1.5em;
        @apply shadow duration-500 dark:bg-gray-800;
    }

    .slider button::before {
        content: '';
        position: absolute;
        top: 0.15em;
        right: 1.5em;
        transition: transform 0.3s;
        @apply h-4 w-4 bg-gray-300 dark:bg-slate-900;
    }

    .slider button[aria-checked='true'] {
        @apply bg-gray-300 dark:bg-slate-500;
    }

    .slider button[aria-checked='true']::before {
        @apply translate-x-4 bg-gray-50 transition-transform duration-300 dark:bg-gray-800;
    }

    .slider button::before {
        border-radius: 100%;
    }
</style>