<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte'
    const dispatch = createEventDispatcher()

    export let label: string
    export let fontSize = 16

    export let selectOptions: undefined | string[] = undefined
    export let type: string
    export let value: any = undefined
    export let defaultValue: any = undefined
    export let title: string | undefined = undefined

    onMount(()=> {
        if(!value && defaultValue)
        {
            value = defaultValue
        }
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

<div class="slider" style="font-size:{fontSize}px" title="{title ? title: ""}">
    {#if type === 'select'}
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
    {:else if type === 'toggle'}
        <span style="font-size: {fontSize * 1.3}px">{label}</span>
        <button role="switch" aria-checked={value} on:click={handleClick} />
    {:else if type === 'number'}
        <span style="font-size: {fontSize * 1.3}px">{label}</span>
        <input
            type="number"
            class="w-16 cursor-pointer rounded bg-gray-100 text-right dark:bg-slate-900"
            bind:value
            on:change={handleSelectChange}
        />
    {:else if type === 'string'}
        <span style="font-size: {fontSize * 1.3}px">{label}</span>
        <input type="text" class="w-16 cursor-pointer bg-gray-100 dark:bg-slate-900" bind:value on:change={handleSelectChange} />
    {/if}
</div>

<style lang="postcss">
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type='number'] {
        -moz-appearance: textfield;
    }

    .slider {
        @apply mr-3 flex items-center justify-between;
    }

    .slider button {
        position: relative;
        border: none;
        border-radius: 1.5em;
        @apply m-0 h-5 min-h-[1.25rem] w-9 min-w-[2.25rem] shadow duration-500 dark:bg-gray-800;
    }

    .slider button::before {
        content: '';
        position: absolute;
        right: 1.5em;
        transition: transform 0.3s;
        @apply top-[0.125rem] h-4 w-4 bg-gray-300 dark:bg-slate-900;
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
