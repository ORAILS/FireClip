<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte'
    const dispatch = createEventDispatcher()

    export let label: string
    export let fontSize = 16
    export let defaultValue: any

    export let selectOptions: undefined | string[] = undefined
    let value: any

    onMount(() => {
        value = defaultValue
    })

    function handleClick(event) {
        if (selectOptions) return
        const target = event.target

        value = target.getAttribute('aria-checked') === 'true'

        if (value) {
            value = false
        } else {
            value = true
        }
        dispatch('change', value)
    }

    function handleSelectChange(event) {
        dispatch('change', value)
    }
</script>

{#if selectOptions}
    <div class="slider" style="font-size:{fontSize}px">
        <span style="font-size: {fontSize * 1.3}px">{label}</span>
        <select class="cursor-pointer bg-gray-100 dark:bg-slate-900" bind:value on:change={handleSelectChange}>
            {#each selectOptions as option}
                {#if option === value}
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
        <button role="switch" aria-checked={value} on:click={handleClick} />
    </div>
{/if}

<style lang="postcss">
    .slider {
        @apply flex items-center justify-between mr-3;
    }

    .slider button {
        position: relative;
        border: none;
        border-radius: 1.5em;
        @apply shadow h-5 w-9 m-0 duration-500 dark:bg-gray-800;
    }

    .slider button::before {
        content: '';
        position: absolute;
        right: 1.5em;
        transition: transform 0.3s;
        @apply h-4 w-4 top-[0.125rem] bg-gray-300 dark:bg-slate-900;
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
