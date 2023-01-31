<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte'
    const dispatch = createEventDispatcher()

    export let label: string
    export let fontSize = 16
    export let defaultState: boolean
    let state = true

    onMount(() => {
        state = defaultState
    })

    function handleClick(event) {
        const target = event.target

        state = target.getAttribute('aria-checked') === 'true'

        if (state) {
            state = false
        } else {
            state = true
        }
        dispatch('change', state)
    }
</script>

<div class="slider" style="font-size:{fontSize}px">
    <span style="font-size: {fontSize * 1.3}px">{label}</span>
    <button role="switch" aria-checked={state} on:click={handleClick} />
</div>

<style>
    .slider {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .slider button {
        width: 3em;
        min-width: 3em;
        max-width: 3em;
        height: 1.6em;
        position: relative;
        margin: 0 0 0 0.5em;
        border: none;
        transition: 0.5s;
        border-radius: 1.5em;
        @apply bg-slate-400;
    }

    .slider button::before {
        content: '';
        position: absolute;
        width: 1.3em;
        height: 1.3em;
        top: 0.15em;
        right: 1.5em;
        transition: transform 0.3s;
        @apply bg-gray-100 dark:bg-slate-900;
    }

    .slider button[aria-checked='true'] {
        @apply bg-gray-200 dark:bg-slate-600;
    }

    .slider button[aria-checked='true']::before {
        transform: translateX(1.3em);
        transition: transform 0.3s;
    }

    .slider button::before {
        border-radius: 100%;
    }

    .slider button:hover {
        @apply shadow-lg;
        border-radius: 1.5em;
        transition: 0.5s;
    }
</style>
